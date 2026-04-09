/**
 * MarkerClusterer for Baidu Map GL
 */

var BMapGLLib = window.BMapGLLib = BMapGLLib || {};

(function() {

    // ==================== 工具函数 ====================
    
    function isArray(obj) {
        return Object.prototype.toString.call(obj) === '[object Array]';
    }
    
    function indexOf(item, arr) {
        if (!isArray(arr)) return -1;
        if (arr.indexOf) return arr.indexOf(item);
        for (var i = 0; i < arr.length; i++) {
            if (arr[i] === item) return i;
        }
        return -1;
    }
    
    function getRange(val, min, max) {
        if (min !== undefined && min !== null) val = Math.max(val, min);
        if (max !== undefined && max !== null) val = Math.min(val, max);
        return val;
    }
    /**
     * 处理bounds到百度地图支持的范围
     */
    function cutBoundsInRange(bounds) {
        var ne = bounds.getNorthEast();
        var sw = bounds.getSouthWest();
        return new BMapGL.Bounds(
            new BMapGL.Point(
                getRange(sw.lng, -180, 180),
                getRange(sw.lat, -74, 74)
            ),
            new BMapGL.Point(
                getRange(ne.lng, -180, 180),
                getRange(ne.lat, -74, 74)
            )
        );
    }
    /**
     * 获取扩展后的bounds（向外扩展 gridSize 像素）
     */
    function getExtendedBounds(map, bounds, gridSize) {
        bounds = cutBoundsInRange(bounds);
        var pixelNE = map.pointToPixel(bounds.getNorthEast());
        var pixelSW = map.pointToPixel(bounds.getSouthWest());
        pixelNE.x += gridSize;
        pixelNE.y -= gridSize;
        pixelSW.x -= gridSize;
        pixelSW.y += gridSize;
        var newNE = map.pixelToPoint(pixelNE);
        var newSW = map.pixelToPoint(pixelSW);
        return new BMapGL.Bounds(newSW, newNE);
    }
    
    // ==================== 样式相关 ====================
    
    var DEFAULT_SIZES = [53, 56, 66, 78, 90];
    var DEFAULT_COLORS = [
        'rgba(110,204,57,0.9)',
        'rgba(240,194,12,0.9)',
        'rgba(240,130,12,0.9)',
        'rgba(226,90,50,0.9)',
        'rgba(205,43,43,0.9)'
    ];
    
    function getStyleIndex(count, styles) {
        if (!styles || styles.length === 0) return 0;
        var idx = Math.floor(count / 10);
        idx = Math.max(0, Math.min(idx, styles.length - 1));
        return idx;
    }
    
    /**
     * 绘制聚合图标（纯Canvas，不依赖外部类）
     */
    function drawClusterIcon(count, styleIndex, styles, imageCache) {
        var style = (styles && styles[styleIndex]) || null;
        var width, height, bgColor, textColor, fontSize, iconUrl;
        if (style) {
            var size = style.size || style.sizes;
            if (isArray(size)) {
                width = size[0];
                height = size[1];
            } else if (size && typeof size.width === 'number') {
                width = size.width;
                height = size.height;
            } else {
                width = height = 53;
            }
            textColor = style.textColor || '#ffffff';
            fontSize = style.textSize || style.opt_textSize || 12;
            bgColor = style.color || null;
            iconUrl = style.icon || style.url || '';
        }
        else {
            var idx = Math.min(styleIndex, DEFAULT_SIZES.length - 1);
            width = height = DEFAULT_SIZES[idx];
            textColor = '#ffffff';
            fontSize = 11 + idx;
            bgColor = DEFAULT_COLORS[idx];
            iconUrl = '';
        }
        var canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        var ctx = canvas.getContext('2d');
        // 绘制背景（图片或圆形）
        var img = iconUrl && imageCache && imageCache[iconUrl];
        if (img && img.complete && img.naturalWidth > 0) {
            ctx.drawImage(img, 0, 0, width, height);
        }
        else {
            ctx.fillStyle = bgColor || DEFAULT_COLORS[Math.min(styleIndex, DEFAULT_COLORS.length - 1)];
            ctx.beginPath();
            ctx.arc(width / 2, height / 2, Math.min(width, height) / 2 - 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = 'rgba(255,255,255,0.8)';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
        // 绘制文字
        ctx.fillStyle = textColor;
        ctx.font = 'bold ' + fontSize + 'px "Microsoft YaHei", Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(count), width / 2, height / 2);
        return {
            dataUrl: canvas.toDataURL('image/png'),
            width: width,
            height: height
        };
    }
    
    function getAnchor(style, width, height) {
        if (!style) return new BMapGL.Size(Math.floor(width / 2), Math.floor(height / 2));
        var anchor = style.anchor || style.opt_anchor;
        if (isArray(anchor) && anchor.length >= 2) {
            return new BMapGL.Size(anchor[0], anchor[1]);
        }
        if (anchor && typeof anchor.width === 'number') {
            return new BMapGL.Size(anchor.width, anchor.height);
        }
        return new BMapGL.Size(Math.floor(width / 2), Math.floor(height / 2));
    }
    
    // ==================== Cluster 类 ====================
    
    /**
     * 聚合簇类
     */
    function Cluster(clusterer) {
        this._clusterer = clusterer;
        this._map = clusterer.getMap();
        this._markers = [];
        this._center = null;
        this._gridBounds = null;      // 网格边界（用于判断新点是否属于此簇）
        this._clusterMarker = null;
        this._clickHandler = null;
        this._isReal = false;          // 是否为有效聚合（数量 >= minClusterSize）
    }
    
    /**
     * 添加标记到簇
     */
    Cluster.prototype.addMarker = function(marker) {
        if (this._markers.indexOf(marker) !== -1) return false;
        if (!this._center) {
            this._center = marker.getPosition();
            this._updateGridBounds();
        }
        else if (this._clusterer.isAverageCenter()) {
            var len = this._markers.length + 1;
            var lat = (this._center.lat * (len - 1) + marker.getPosition().lat) / len;
            var lng = (this._center.lng * (len - 1) + marker.getPosition().lng) / len;
            this._center = new BMapGL.Point(lng, lat);
            this._updateGridBounds();
        }
        marker.isInCluster = true;
        this._markers.push(marker);
        return true;
    };
    
    /**
     * 更新网格边界（以当前中心点为中心，扩展 gridSize 像素）
     */
    Cluster.prototype._updateGridBounds = function() {
        if (!this._center) return;
        var bounds = new BMapGL.Bounds(this._center, this._center);
        this._gridBounds = getExtendedBounds(this._map, bounds, this._clusterer.getGridSize());
    };
    
    /**
     * 判断标记是否在此簇的网格范围内
     */
    Cluster.prototype.isMarkerInClusterBounds = function(marker) {
        if (!this._gridBounds) return false;
        return this._gridBounds.containsPoint(marker.getPosition());
    };
    
    /**
     * 渲染簇（根据当前状态显示聚合点或散点）
     */
    Cluster.prototype.render = function() {
        var zoom = this._map.getZoom();
        var maxZoom = this._clusterer.getMaxZoom();
        var minSize = this._clusterer.getMinClusterSize();
        var markerCount = this._markers.length;
        // 判断是否需要展开为散点
        var shouldExpand = (markerCount < minSize) || (zoom > maxZoom);
        if (shouldExpand) {
            this._expandMarkers();
        } else {
            this._showClusterMarker();
        }
    };
    
    /**
     * 展开显示所有散点
     */
    Cluster.prototype._expandMarkers = function() {
        if (this._clusterMarker) {
            try {
                if (this._clusterMarker.getMap && this._clusterMarker.getMap()) {
                    this._map.removeOverlay(this._clusterMarker);
                }
            } catch (e) { /* ignore */ }
        }
        for (var i = 0; i < this._markers.length; i++) {
            var m = this._markers[i];
            try {
                if (m.getMap && m.getMap()) {
                    this._map.removeOverlay(m);
                }
            } catch (e2) { /* ignore */ }
            this._map.addOverlay(m);
        }
        this._isReal = false;
    };
    
    /**
     * 显示聚合图标
     */
    Cluster.prototype._showClusterMarker = function() {
        // 移除所有散点
        for (var i = 0; i < this._markers.length; i++) {
            var m = this._markers[i];
            if (m.getMap()) {
                this._map.removeOverlay(m);
            }
        }
        // 创建或更新聚合图标
        if (!this._clusterMarker) {
            this._clusterMarker = this._createClusterMarker();
            // 绑定点击事件（只绑定一次）
            this._bindClickEvent();
        }
        else {
            this._updateClusterMarker();
        }
        if (!this._clusterMarker.getMap()) {
            this._map.addOverlay(this._clusterMarker);
        }
        this._isReal = true;
    };
    
    /**
     * 创建聚合图标 Marker
     */
    Cluster.prototype._createClusterMarker = function() {
        var count = this._markers.length;
        var styles = this._clusterer.getStyles();
        var styleIdx = getStyleIndex(count, styles);
        var drawn = drawClusterIcon(count, styleIdx, styles, this._clusterer.getImageCache());
        var anchor = getAnchor(styles[styleIdx], drawn.width, drawn.height);
        var icon = new BMapGL.Icon(drawn.dataUrl, new BMapGL.Size(drawn.width, drawn.height), {
            anchor: anchor
        });
        return new BMapGL.Marker(this._center, { icon: icon });
    };
    
    /**
     * 更新聚合图标（数量和位置变化时）
     */
    Cluster.prototype._updateClusterMarker = function() {
        var count = this._markers.length;
        var styles = this._clusterer.getStyles();
        var styleIdx = getStyleIndex(count, styles);
        var drawn = drawClusterIcon(count, styleIdx, styles, this._clusterer.getImageCache());
        var anchor = getAnchor(styles[styleIdx], drawn.width, drawn.height);
        var icon = new BMapGL.Icon(drawn.dataUrl, new BMapGL.Size(drawn.width, drawn.height), {
            anchor: anchor
        });
        this._clusterMarker.setIcon(icon);
        this._clusterMarker.setPosition(this._center);
    };
    
    /**
     * 绑定点击事件（自动缩放至簇范围）
     */
    Cluster.prototype._bindClickEvent = function() {
        var self = this;
        var handler = function() {
            var bounds = self.getBounds();
            self._map.setViewport(bounds);
        };
        this._clusterMarker.addEventListener('click', handler);
        this._clickHandler = handler;
    };
    
    /**
     * 获取簇的范围（所有标记的最小包围盒）
     */
    Cluster.prototype.getBounds = function() {
        if (this._markers.length === 0) {
            return new BMapGL.Bounds(this._center, this._center);
        }
        var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        for (var i = 0; i < this._markers.length; i++) {
            var pos = this._markers[i].getPosition();
            if (pos.lng < minX) minX = pos.lng;
            if (pos.lat < minY) minY = pos.lat;
            if (pos.lng > maxX) maxX = pos.lng;
            if (pos.lat > maxY) maxY = pos.lat;
        }
        return new BMapGL.Bounds(
            new BMapGL.Point(minX, minY),
            new BMapGL.Point(maxX, maxY)
        );
    };
    
    /**
     * 获取簇中心点
     */
    Cluster.prototype.getCenter = function() {
        return this._center;
    };
    
    /**
     * 获取簇内所有标记
     */
    Cluster.prototype.getMarkers = function() {
        return this._markers.slice();
    };
    
    /**
     * 获取标记数量
     */
    Cluster.prototype.getSize = function() {
        return this._markers.length;
    };
    
    /**
     * 是否为有效聚合
     */
    Cluster.prototype.isReal = function() {
        return this._isReal;
    };
    
    /**
     * 移除簇（清理地图上的覆盖物）
     */
    Cluster.prototype.remove = function() {
        // 移除聚合图标
        if (this._clusterMarker && this._clusterMarker.getMap()) {
            this._map.removeOverlay(this._clusterMarker);
        }
        // 移除散点（但保留 marker 对象，只是从地图移除）
        for (var i = 0; i < this._markers.length; i++) {
            if (this._markers[i].getMap()) {
                this._map.removeOverlay(this._markers[i]);
            }
        }
        this._markers = [];
        this._isReal = false;
    };
    
    // ==================== MarkerClusterer 主类 ====================
    
    /**
     * 标记聚合器
     * @param {BMapGL.Map} map 地图实例
     * @param {Object} options 配置项
     * @param {Array} options.markers 初始标记数组
     * @param {Number} options.gridSize 网格大小（像素），默认 60
     * @param {Number} options.maxZoom 最大聚合级别，默认 18
     * @param {Number} options.minClusterSize 最小聚合数量，默认 2
     * @param {Boolean} options.isAverageCenter 是否使用平均中心，默认 false
     * @param {Array} options.styles 自定义样式数组
     */
    var MarkerClusterer = BMapGLLib.MarkerClusterer = function(map, options) {
        if (!map) {
            return;
        }
        this._map = map;
        this._markers = [];
        this._clusters = [];
        this._imageCache = {};
        
        var opts = options || {};
        this._gridSize = opts['gridSize'] || 60;
        this._maxZoom = opts['maxZoom'] || 18;
        this._minClusterSize = opts['minClusterSize'] || 2;
        this._isAverageCenter = false;
        if (opts['isAverageCenter'] !== undefined) {
            this._isAverageCenter = opts['isAverageCenter'];
        }
        this._styles = opts['styles'] || [];
        this._preloadImages();
        this._bindEvents();
        var mkrs = opts['markers'];
        if (isArray(mkrs)) {
            this.addMarkers(mkrs);
        }
    };
    
    /**
     * 绑定地图事件
     */
    MarkerClusterer.prototype._bindEvents = function() {
        var self = this;
        this._map.addEventListener('zoomend', function() {
            self._redraw();
        });
        this._map.addEventListener('moveend', function() {
            self._redraw();
        });
    };
    
    /**
     * 预加载样式中的图片
     */
    MarkerClusterer.prototype._preloadImages = function() {
        var self = this;
        for (var i = 0; i < this._styles.length; i++) {
            var url = this._styles[i].icon || this._styles[i].url;
            if (!url || this._imageCache[url]) continue;
            this._imageCache[url] = null;
            var img = new Image();
            img.onload = (function(u) {
                return function() {
                    self._imageCache[u] = img;
                    self._redraw();
                };
            })(url);
            img.onerror = (function(u) {
                return function() {
                    self._imageCache[u] = false;
                };
            })(url);
            img.src = url;
        }
    };
    
    /**
     * 获取图片缓存
     */
    MarkerClusterer.prototype.getImageCache = function() {
        return this._imageCache;
    };
    
    /**
     * 添加单个标记
     */
    MarkerClusterer.prototype.addMarker = function(marker) {
        this._pushMarkerTo(marker);
        this._createClusters();
    };
    
    /**
     * 添加多个标记
     */
    MarkerClusterer.prototype.addMarkers = function(markers) {
        for (var i = 0, len = markers.length; i < len; i++) {
            this._pushMarkerTo(markers[i]);
        }
        this._createClusters();
    };
    
    /**
     * 将标记推入待聚合列表
     */
    MarkerClusterer.prototype._pushMarkerTo = function(marker) {
        if (indexOf(marker, this._markers) === -1) {
            marker.isInCluster = false;
            this._markers.push(marker);
        }
    };
    
    MarkerClusterer.prototype._removeMarker = function(marker) {
        var idx = indexOf(marker, this._markers);
        if (idx === -1) return false;
        var label = marker.getLabel && marker.getLabel();
        this._map.removeOverlay(marker);
        if (label && marker.setLabel) marker.setLabel(label);
        this._markers.splice(idx, 1);
        return true;
    };
    
    /**
     * 删除单个标记
     */
    MarkerClusterer.prototype.removeMarker = function(marker) {
        var ok = this._removeMarker(marker);
        if (ok) {
            this._clearClusters();
            this._createClusters();
        }
        return ok;
    };
    
    /**
     * 删除多个标记
     */
    MarkerClusterer.prototype.removeMarkers = function(markers) {
        var ok = false;
        for (var i = 0; i < markers.length; i++) {
            ok = this._removeMarker(markers[i]) || ok;
        }
        if (ok) {
            this._clearClusters();
            this._createClusters();
        }
        return ok;
    };
    
    /**
     * 清除所有标记
     */
    MarkerClusterer.prototype.clearMarkers = function() {
        this._clearClusters();
        for (var i = 0, m; (m = this._markers[i]); i++) {
            m.isInCluster = false;
            var label = m.getLabel && m.getLabel();
            this._map.removeOverlay(m);
            if (label && m.setLabel) m.setLabel(label);
        }
        this._markers = [];
    };
    
    /**
     * 重新生成聚合
     */
    MarkerClusterer.prototype._redraw = function() {
        this._clearLastClusters();
        this._createClusters();
    };
    
    /**
     * 清除上一次聚合结果
     */
    MarkerClusterer.prototype._clearLastClusters = function() {
        for (var i = 0, c; (c = this._clusters[i]); i++) {
            c.remove();
        }
        this._clusters = [];
        for (var j = 0, m; (m = this._markers[j]); j++) {
            m.isInCluster = false;
        }
    };
    
    MarkerClusterer.prototype._clearClusters = MarkerClusterer.prototype._clearLastClusters;
    
    /**
     * 创建簇
     */
    MarkerClusterer.prototype._createClusters = function() {
        var mapBounds = this._map.getBounds();
        if (!mapBounds) return;
        var extendedBounds = getExtendedBounds(this._map, mapBounds, this._gridSize);
        for (var i = 0; i < this._markers.length; i++) {
            var marker = this._markers[i];
            if (!marker.isInCluster && extendedBounds.containsPoint(marker.getPosition())) {
                this._addToClosestCluster(marker);
            }
        }
        for (var j = 0; j < this._clusters.length; j++) {
            this._clusters[j].render();
        }
    };
    
    /**
     * 将标记添加到最近的簇
     */
    MarkerClusterer.prototype._addToClosestCluster = function(marker) {
        var distance = 4000000;
        var clusterToAddTo = null;
        for (var i = 0; i < this._clusters.length; i++) {
            var cluster = this._clusters[i];
            var center = cluster.getCenter();
            if (center) {
                var d = this._map.getDistance(center, marker.getPosition());
                if (d < distance) {
                    distance = d;
                    clusterToAddTo = cluster;
                }
            }
        }
        if (clusterToAddTo && clusterToAddTo.isMarkerInClusterBounds(marker)) {
            clusterToAddTo.addMarker(marker);
        } else {
            var newCluster = new Cluster(this);
            newCluster.addMarker(marker);
            this._clusters.push(newCluster);
        }
    };
    
    // ==================== Getter / Setter ====================
    
    MarkerClusterer.prototype.getMap = function() {
        return this._map;
    };
    
    MarkerClusterer.prototype.getGridSize = function() {
        return this._gridSize;
    };
    
    MarkerClusterer.prototype.setGridSize = function(size) {
        this._gridSize = size;
        this._redraw();
    };
    
    MarkerClusterer.prototype.getMaxZoom = function() {
        return this._maxZoom;
    };
    
    MarkerClusterer.prototype.setMaxZoom = function(zoom) {
        this._maxZoom = zoom;
        this._redraw();
    };
    
    MarkerClusterer.prototype.getMinClusterSize = function() {
        return this._minClusterSize;
    };
    
    MarkerClusterer.prototype.setMinClusterSize = function(size) {
        this._minClusterSize = size;
        this._redraw();
    };
    
    MarkerClusterer.prototype.isAverageCenter = function() {
        return this._isAverageCenter;
    };
    
    MarkerClusterer.prototype.setAverageCenter = function(average) {
        this._isAverageCenter = average;
        this._redraw();
    };
    
    MarkerClusterer.prototype.getStyles = function() {
        return this._styles;
    };
    
    MarkerClusterer.prototype.setStyles = function(styles) {
        this._styles = styles;
        this._preloadImages();
        this._redraw();
    };

    MarkerClusterer.prototype.getMarkers = function() {
        return this._markers;
    };
    
    MarkerClusterer.prototype.getClusters = function() {
        return this._clusters.slice();
    };
    
    MarkerClusterer.prototype.getClustersCount = function() {
        var count = 0;
        for (var i = 0; i < this._clusters.length; i++) {
            if (this._clusters[i].isReal()) count++;
        }
        return count;
    };
    
})();
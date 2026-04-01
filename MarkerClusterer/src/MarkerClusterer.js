/**
 * @fileoverview MarkerClusterer标记聚合器（GL版）
 * 以BMapGL.Marker + canvas自绘图标替代BMapLib.TextIconOverlay，
 * 每个Cluster持有独立的_clusterMarker，addOverlay/removeOverlay管理生命周期。
 */
var BMapGLLib = window.BMapGLLib = BMapGLLib || {};

(function () {

  /* 工具函数 */

  var isArray = function (source) {
    return '[object Array]' === Object.prototype.toString.call(source);
  };

  var indexOf = function (item, source) {
    if (!isArray(source)) return -1;
    if (source.indexOf) return source.indexOf(item);
    for (var i = 0; i < source.length; i++) {
      if (source[i] === item) return i;
    }
    return -1;
  };

  /**
   * 判断point是否在map当前视野内（扩展extendPx像素）。
   * 用像素坐标直接比较，避免BMapGL.Bounds在GL 3D投影下判断出错。
   */
  var isPointInMapView = function (map, point, extendPx) {
    var size = map.getSize();
    var px = map.pointToPixel(point);
    return px.x >= -extendPx && px.x <= size.width + extendPx &&
           px.y >= -extendPx && px.y <= size.height + extendPx;
  };

  /**
   * 判断两点像素距离是否在gridSize内。
   * 替代BMapGL.Bounds.containsPoint()，彻底绕开GL投影问题。
   */
  var isWithinPixelGrid = function (map, pointA, pointB, gridSize) {
    var pxA = map.pointToPixel(pointA);
    var pxB = map.pointToPixel(pointB);
    return Math.abs(pxA.x - pxB.x) <= gridSize &&
           Math.abs(pxA.y - pxB.y) <= gridSize;
  };

  /* 聚合图标绘制 */

  var DEFAULT_SIZES = [53, 56, 66, 78, 90];
  var DEFAULT_COLORS = ['rgba(110,204,57,0.9)', 'rgba(240,194,12,0.9)', 'rgba(240,130,12,0.9)', 'rgba(226,90,50,0.9)', 'rgba(205,43,43,0.9)'];

  /**
   * 根据markers数量选择样式下标
   */
  function getStyleIndex(count, styles) {
    if (!styles || !styles.length) return 0;
    var idx = 0;
    var value = count;
    while (value !== 0) { idx++; value = Math.floor(value / 10); }
    return Math.max(0, Math.min(styles.length - 1, idx - 1));
  }

  /**
   * 绘制聚合图标canvas，返回data URL。
   * 无自定义样式时：绿→黄→橙→红 默认色系（模仿TextIconOverlay默认外观）。
   * 有自定义样式时：使用style.url/icon作为背景图，叠加数字。
   */
  function drawClusterIcon(count, styleIndex, styles, imageCache) {
    var style = (styles && styles[styleIndex]) || null;

    var W, H, bg, textColor, textSize, iconUrl;
    if (style) {
      var sz = style.size || style.sizes;
      if (isArray(sz))             { W = sz[0];        H = sz[1]; }
      else if (sz && sz.width)     { W = sz.width;     H = sz.height; }
      else                         { W = 53;           H = 53; }
      textColor = style.textColor || '#fff';
      textSize  = style.opt_textSize || style.textSize || 12;
      bg        = style.color || null;
      iconUrl   = style.icon || style.url || '';
    } else {
      var idx = Math.min(styleIndex, DEFAULT_SIZES.length - 1);
      W = DEFAULT_SIZES[idx];
      H = DEFAULT_SIZES[idx];
      textColor = '#fff';
      textSize  = 11 + idx;
      bg        = DEFAULT_COLORS[idx];
      iconUrl   = '';
    }

    var canvas = document.createElement('canvas');
    canvas.width  = W;
    canvas.height = H;
    var ctx = canvas.getContext('2d');

    var img = iconUrl && imageCache && imageCache[iconUrl];
    if (img) {
      ctx.drawImage(img, 0, 0, W, H);
    } else {
      // 默认：圆形 + 描边
      ctx.fillStyle = bg || DEFAULT_COLORS[Math.min(styleIndex, DEFAULT_COLORS.length - 1)];
      ctx.beginPath();
      ctx.arc(W / 2, H / 2, Math.min(W, H) / 2 - 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.6)';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    ctx.fillStyle = textColor;
    ctx.font = 'bold ' + textSize + 'px Arial,sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(count), W / 2, H / 2);

    return { dataUrl: canvas.toDataURL('image/png'), w: W, h: H };
  }

  /* MarkerClusterer主类 */

  var MarkerClusterer = BMapGLLib.MarkerClusterer = function (map, options) {
    if (!map) return;
    this._map      = map;
    this._markers  = [];
    this._clusters = [];

    var opts = options || {};
    this._gridSize       = opts['gridSize']        || 60;
    this._maxZoom        = typeof opts['maxZoom']        === 'number' ? opts['maxZoom']        : 18;
    this._minClusterSize = typeof opts['minClusterSize'] === 'number' ? opts['minClusterSize'] : 2;
    this._isAverageCenter = !!opts['isAverageCenter'];
    this._styles     = opts['styles'] || [];
    this._imageCache = {};

    this._preloadImages();

    var self = this;
    this._map.addEventListener('zoomend', function () { self._redraw(); });
    this._map.addEventListener('moveend', function () { self._redraw(); });

    var mkrs = opts['markers'];
    if (isArray(mkrs) && mkrs.length) {
      // 推到下一帧，确保地图完全初始化后再计算聚合
      requestAnimationFrame(function () { self.addMarkers(mkrs); });
    }
  };

  MarkerClusterer.prototype.addMarkers = function (markers) {
    for (var i = 0, len = markers.length; i < len; i++) {
      this._pushMarkerTo(markers[i]);
    }
    this._createClusters();
  };

  MarkerClusterer.prototype._pushMarkerTo = function (marker) {
    if (indexOf(marker, this._markers) === -1) {
      marker.isInCluster = false;
      this._markers.push(marker);
    }
  };

  MarkerClusterer.prototype.addMarker = function (marker) {
    this._pushMarkerTo(marker);
    this._createClusters();
  };

  MarkerClusterer.prototype._createClusters = function () {
    var map      = this._map;
    var gridSize = this._gridSize;

    for (var i = 0, marker; (marker = this._markers[i]); i++) {
      if (!marker.isInCluster && isPointInMapView(map, marker.getPosition(), gridSize)) {
        this._addToClosestCluster(marker);
      }
    }

    for (var j = 0, cluster; (cluster = this._clusters[j]); j++) {
      cluster.render();
    }
  };

  MarkerClusterer.prototype._addToClosestCluster = function (marker) {
    var distance = 4000000;
    var clusterToAddTo = null;

    for (var i = 0, cluster; (cluster = this._clusters[i]); i++) {
      var center = cluster.getCenter();
      if (center) {
        var d = this._map.getDistance(center, marker.getPosition());
        if (d < distance) { distance = d; clusterToAddTo = cluster; }
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

  MarkerClusterer.prototype._clearLastClusters = function () {
    for (var i = 0, cluster; (cluster = this._clusters[i]); i++) {
      cluster.remove();
    }
    this._clusters = [];
    for (var j = 0, m; (m = this._markers[j]); j++) {
      m.isInCluster = false;
    }
  };

  MarkerClusterer.prototype._redraw = function () {
    this._clearLastClusters();
    this._createClusters();
  };

  MarkerClusterer.prototype._removeMarker = function (marker) {
    var index = indexOf(marker, this._markers);
    if (index === -1) return false;
    var label = marker.getLabel ? marker.getLabel() : null;
    this._map.removeOverlay(marker);
    if (label && marker.setLabel) marker.setLabel(label);
    this._markers.splice(index, 1);
    return true;
  };

  MarkerClusterer.prototype.removeMarker = function (marker) {
    var ok = this._removeMarker(marker);
    if (ok) { this._clearLastClusters(); this._createClusters(); }
    return ok;
  };

  MarkerClusterer.prototype.removeMarkers = function (markers) {
    var ok = false;
    for (var i = 0; i < markers.length; i++) { ok = this._removeMarker(markers[i]) || ok; }
    if (ok) { this._clearLastClusters(); this._createClusters(); }
    return ok;
  };

  MarkerClusterer.prototype.clearMarkers = function () {
    this._clearLastClusters();
    // _clearLastClusters已重置isInCluster，此处只需从地图移除并保留label
    for (var i = 0, m; (m = this._markers[i]); i++) {
      var label = m.getLabel ? m.getLabel() : null;
      this._map.removeOverlay(m);
      if (label && m.setLabel) m.setLabel(label);
    }
    this._markers = [];
  };

  /* Getter / Setter */

  MarkerClusterer.prototype.getGridSize       = function () { return this._gridSize; };
  MarkerClusterer.prototype.setGridSize       = function (s) { this._gridSize = s; this._redraw(); };
  MarkerClusterer.prototype.getMaxZoom        = function () { return this._maxZoom; };
  MarkerClusterer.prototype.setMaxZoom        = function (z) { this._maxZoom = z; this._redraw(); };
  MarkerClusterer.prototype.getMinClusterSize = function () { return this._minClusterSize; };
  MarkerClusterer.prototype.setMinClusterSize = function (s) { this._minClusterSize = s; this._redraw(); };
  MarkerClusterer.prototype.isAverageCenter   = function () { return this._isAverageCenter; };
  MarkerClusterer.prototype.getMap            = function () { return this._map; };
  MarkerClusterer.prototype.getMarkers        = function () { return this._markers; };
  MarkerClusterer.prototype.getStyles         = function () { return this._styles; };

  MarkerClusterer.prototype.setStyles = function (styles) {
    this._styles = styles || [];
    this._preloadImages();
    this._redraw();
  };

  MarkerClusterer.prototype.getClustersCount = function () {
    var n = 0;
    for (var i = 0, c; (c = this._clusters[i]); i++) { if (c.isReal()) n++; }
    return n;
  };

  /* 图片预加载 */

  MarkerClusterer.prototype._preloadImages = function () {
    var self = this;
    for (var i = 0; i < this._styles.length; i++) {
      var s   = this._styles[i];
      var url = s.icon || s.url || '';
      if (!url || this._imageCache[url] === null || this._imageCache[url] instanceof Image) continue;
      (function (u) {
        self._imageCache[u] = null;
        var img = new Image();
        img.onload = function () {
          self._imageCache[u] = img;
          self._redraw();          // 图片加载完成后刷新显示
        };
        img.onerror = function () { self._imageCache[u] = false; }; // false区分null（加载中）
        img.src = u;
      })(url);
    }
  };
  function Cluster(markerClusterer) {
    this._markerClusterer = markerClusterer;
    this._map             = markerClusterer.getMap();
    this._minClusterSize  = markerClusterer.getMinClusterSize();
    this._isAverageCenter = markerClusterer.isAverageCenter();
    this._center          = null;
    this._markers         = [];
    this._isReal          = false;
    this._clusterMarker   = null;
  }

  Cluster.prototype.addMarker = function (marker) {
    if (this.isMarkerInCluster(marker)) return false;
    if (!this._center) {
      this._center = marker.getPosition();
    } else if (this._isAverageCenter) {
      var l = this._markers.length + 1;
      this._center = new BMapGL.Point(
        (this._center.lng * (l - 1) + marker.getPosition().lng) / l,
        (this._center.lat * (l - 1) + marker.getPosition().lat) / l
      );
    }
    marker.isInCluster = true;
    this._markers.push(marker);
    return true;
  };

  Cluster.prototype.render = function () {
    var len     = this._markers.length;
    var zoom    = this._map.getZoom();
    var maxZoom = this._markerClusterer.getMaxZoom();

    // 不满足聚合最小数量，或已超过最大聚合级别 → 展开为散点，避免先add再remove
    if (len < this._minClusterSize || zoom > maxZoom) {
      for (var i = 0; i < len; i++) {
        this._map.addOverlay(this._markers[i]);
      }
      return;
    }

    // 每次重建图标，确保计数始终正确
    if (this._clusterMarker && this._clusterMarker.getMap && this._clusterMarker.getMap()) {
      this._map.removeOverlay(this._clusterMarker);
    }
    this._clusterMarker = this._buildClusterMarker();
    this._map.addOverlay(this._clusterMarker);
    this._isReal = true;

    // 绑定点击缩放到聚合范围
    var thatMap    = this._map;
    var thatBounds = this.getBounds();
    if (this._clickHandler) {
      this._clusterMarker.removeEventListener('click', this._clickHandler);
    }
    this._clickHandler = function () { thatMap.setViewport(thatBounds); };
    this._clusterMarker.addEventListener('click', this._clickHandler);
  };

  /**
   * 构建代表聚合的BMapGL.Marker
   */
  Cluster.prototype._buildClusterMarker = function () {
    var mc     = this._markerClusterer;
    var styles = mc.getStyles();
    var sid    = getStyleIndex(this._markers.length, styles);
    var drawn  = drawClusterIcon(this._markers.length, sid, styles, mc._imageCache);

    var icon = new BMapGL.Icon(drawn.dataUrl, new BMapGL.Size(drawn.w, drawn.h), {
      anchor: new BMapGL.Size(Math.floor(drawn.w / 2), Math.floor(drawn.h / 2))
    });
    return new BMapGL.Marker(this._center || new BMapGL.Point(0, 0), { icon: icon });
  };

  Cluster.prototype.isMarkerInCluster = function (marker) {
    return this._markers.indexOf(marker) !== -1;
  };

  Cluster.prototype.isMarkerInClusterBounds = function (marker) {
    if (!this._center) return false;
    return isWithinPixelGrid(
      this._map, this._center, marker.getPosition(),
      this._markerClusterer.getGridSize()
    );
  };

  Cluster.prototype.isReal = function () { return this._isReal; };

  Cluster.prototype.remove = function () {
    for (var i = 0, m; (m = this._markers[i]); i++) {
      if (m.getMap && m.getMap()) this._map.removeOverlay(m);
    }
    if (this._clusterMarker && this._clusterMarker.getMap && this._clusterMarker.getMap()) {
      this._map.removeOverlay(this._clusterMarker);
    }
    this._markers.length = 0;
    this._isReal = false;
  };

  Cluster.prototype.getBounds = function () {
    var sw = new BMapGL.Point(this._center.lng, this._center.lat);
    var ne = new BMapGL.Point(this._center.lng, this._center.lat);
    for (var i = 0, m; (m = this._markers[i]); i++) {
      var pos = m.getPosition();
      if (pos.lng < sw.lng) sw.lng = pos.lng;
      if (pos.lat < sw.lat) sw.lat = pos.lat;
      if (pos.lng > ne.lng) ne.lng = pos.lng;
      if (pos.lat > ne.lat) ne.lat = pos.lat;
    }
    return new BMapGL.Bounds(sw, ne);
  };

  Cluster.prototype.getCenter = function () { return this._center; };

})();

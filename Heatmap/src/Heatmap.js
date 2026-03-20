/**
 * @fileoverview 百度地图GL版本的热力图功能，对外开放。
 * 主要基于http://www.patrick-wied.at/static/heatmapjs/index.html 修改而得
 * 允许用户在地图上添加热力图覆盖物。
 * 基于Baidu Map API GL 1.0。
 *
 * @author Baidu Map Api Group 
 * @version 1.0
 */

/*==============================以下部分为 heatmap.js 的核心代码，只负责热力图的展现，代码来自第三方====================================*/

/*
 * heatmap.js 1.0 - JavaScript Heatmap Library
 * Copyright (c) 2011, Patrick Wied (http://www.patrick-wied.at)
 * Dual-licensed under the MIT and the Beerware license.
 */

(function (w) {
    var heatmapFactory = (function () {
        var store = function store(hmap) {
            var _ = { data: [], heatmap: hmap };
            this.max = 1;
            this.get = function (key) { return _[key]; };
            this.set = function (key, value) { _[key] = value; };
        };
        store.prototype = {
            addDataPoint: function (x, y) {
                if (x < 0 || y < 0) return;
                var me = this, heatmap = me.get("heatmap"), data = me.get("data");
                if (!data[x]) data[x] = [];
                if (!data[x][y]) data[x][y] = 0;
                data[x][y] += (arguments.length < 3) ? 1 : arguments[2];
                me.set("data", data);
                if (me.max < data[x][y]) {
                    heatmap.get("actx").clearRect(0, 0, heatmap.get("width"), heatmap.get("height"));
                    me.setDataSet({ max: data[x][y], data: data }, true);
                    return;
                }
                heatmap.drawAlpha(x, y, data[x][y], true);
            },
            setDataSet: function (obj, internal) {
                var me = this, heatmap = me.get("heatmap"), data = [], d = obj.data, dlen = d.length;
                heatmap.clear();
                this.max = obj.max;
                heatmap.get("legend") && heatmap.get("legend").update(obj.max);
                if (internal != null && internal) {
                    for (var one in d) {
                        if (one === undefined) continue;
                        for (var two in d[one]) {
                            if (two === undefined) continue;
                            heatmap.drawAlpha(one, two, d[one][two], false);
                        }
                    }
                } else {
                    while (dlen--) {
                        var point = d[dlen];
                        heatmap.drawAlpha(point.x, point.y, point.count, false);
                        if (!data[point.x]) data[point.x] = [];
                        if (!data[point.x][point.y]) data[point.x][point.y] = 0;
                        data[point.x][point.y] = point.count;
                    }
                }
                heatmap.colorize();
                this.set("data", d);
            },
            exportDataSet: function () {
                var me = this, data = me.get("data"), exportData = [];
                for (var one in data) {
                    if (one === undefined) continue;
                    for (var two in data[one]) {
                        if (two === undefined) continue;
                        exportData.push({ x: parseInt(one, 10), y: parseInt(two, 10), count: data[one][two] });
                    }
                }
                return { max: me.max, data: exportData };
            },
            generateRandomDataSet: function (points) {
                var heatmap = this.get("heatmap"), w = heatmap.get("width"), h = heatmap.get("height");
                var randomset = {}, max = Math.floor(Math.random() * 1000 + 1);
                randomset.max = max;
                var data = [];
                while (points--) {
                    data.push({ x: Math.floor(Math.random() * w + 1), y: Math.floor(Math.random() * h + 1), count: Math.floor(Math.random() * max + 1) });
                }
                randomset.data = data;
                this.setDataSet(randomset);
            }
        };

        var legend = function legend(config) {
            this.config = config;
            var _ = { element: null, labelsEl: null, gradientCfg: null, ctx: null };
            this.get = function (key) { return _[key]; };
            this.set = function (key, value) { _[key] = value; };
            this.init();
        };
        legend.prototype = {
            init: function () {
                var me = this, config = me.config, title = config.title || "Legend", position = config.position,
                    offset = config.offset || 10, labelsEl = document.createElement("ul"), labelsHtml = "",
                    grad, element, gradient, positionCss = "";
                me.processGradientObject();
                if (position.indexOf('t') > -1) positionCss += 'top:' + offset + 'px;';
                else positionCss += 'bottom:' + offset + 'px;';
                if (position.indexOf('l') > -1) positionCss += 'left:' + offset + 'px;';
                else positionCss += 'right:' + offset + 'px;';
                element = document.createElement("div");
                element.style.cssText = "border-radius:5px;position:absolute;" + positionCss + "font-family:Helvetica; width:256px;z-index:10000000000; background:rgba(255,255,255,1);padding:10px;border:1px solid black;margin:0;";
                element.innerHTML = "<h3 style='padding:0;margin:0;text-align:center;font-size:16px;'>" + title + "</h3>";
                labelsEl.style.cssText = "position:relative;font-size:12px;display:block;list-style:none;list-style-type:none;margin:0;height:15px;";
                gradient = document.createElement("div");
                gradient.style.cssText = ["position:relative;display:block;width:256px;height:15px;border-bottom:1px solid black; background-image:url(", me.createGradientImage(), ");"].join("");
                element.appendChild(labelsEl);
                element.appendChild(gradient);
                me.set("element", element);
                me.set("labelsEl", labelsEl);
                me.update(1);
            },
            processGradientObject: function () {
                var me = this, gradientConfig = this.config.gradient, gradientArr = [];
                for (var key in gradientConfig) {
                    if (gradientConfig.hasOwnProperty(key)) gradientArr.push({ stop: key, value: gradientConfig[key] });
                }
                gradientArr.sort(function (a, b) { return (a.stop - b.stop); });
                gradientArr.unshift({ stop: 0, value: 'rgba(0,0,0,0)' });
                me.set("gradientArr", gradientArr);
            },
            createGradientImage: function () {
                var me = this, gradArr = me.get("gradientArr"), length = gradArr.length,
                    canvas = document.createElement("canvas"), ctx = canvas.getContext("2d"), grad;
                canvas.width = "256";
                canvas.height = "15";
                grad = ctx.createLinearGradient(0, 5, 256, 10);
                for (var i = 0; i < length; i++) grad.addColorStop(1 / (length - 1) * i, gradArr[i].value);
                ctx.fillStyle = grad;
                ctx.fillRect(0, 5, 256, 10);
                ctx.strokeStyle = "black";
                ctx.beginPath();
                for (var i = 0; i < length; i++) {
                    ctx.moveTo(((1 / (length - 1) * i * 256) >> 0) + .5, 0);
                    ctx.lineTo(((1 / (length - 1) * i * 256) >> 0) + .5, (i == 0) ? 15 : 5);
                }
                ctx.moveTo(255.5, 0);
                ctx.lineTo(255.5, 15);
                ctx.moveTo(255.5, 4.5);
                ctx.lineTo(0, 4.5);
                ctx.stroke();
                me.set("ctx", ctx);
                return canvas.toDataURL();
            },
            getElement: function () { return this.get("element"); },
            update: function (max) {
                var me = this, gradient = me.get("gradientArr"), ctx = me.get("ctx"), labels = me.get("labelsEl"), labelText, labelsHtml = "", offset;
                for (var i = 0; i < gradient.length; i++) {
                    labelText = max * gradient[i].stop >> 0;
                    offset = (ctx.measureText(labelText).width / 2) >> 0;
                    if (i == 0) offset = 0;
                    if (i == gradient.length - 1) offset *= 2;
                    labelsHtml += '<li style="position:absolute;left:' + ((((1 / (gradient.length - 1) * i * 256) || 0) >> 0) - offset + .5) + 'px">' + labelText + '</li>';
                }
                labels.innerHTML = labelsHtml;
            }
        };

        var heatmap = function heatmap(config) {
            var _ = {
                radius: 40, element: {}, canvas: {}, acanvas: {}, ctx: {}, actx: {}, legend: null, visible: true,
                width: 0, height: 0, max: false, gradient: false, opacity: 180, premultiplyAlpha: false,
                bounds: { l: 1000, r: 0, t: 1000, b: 0 }, debug: false
            };
            this.store = new store(this);
            this.get = function (key) { return _[key]; };
            this.set = function (key, value) { _[key] = value; };
            this.configure(config);
            this.init();
        };
        heatmap.prototype = {
            configure: function (config) {
                var me = this;
                me.set("radius", config["radius"] || 40);
                me.set("element", (config.element instanceof Object) ? config.element : document.getElementById(config.element));
                me.set("visible", (config.visible != null) ? config.visible : true);
                me.set("max", config.max || false);
                me.set("gradient", config.gradient || { 0.45: "rgb(0,0,255)", 0.55: "rgb(0,255,255)", 0.65: "rgb(0,255,0)", 0.95: "yellow", 1.0: "rgb(255,0,0)" });
                me.set("opacity", parseInt(255 / (100 / config.opacity), 10) || 180);
                me.set("width", config.width || 0);
                me.set("height", config.height || 0);
                me.set("debug", config.debug);
                if (config.legend) {
                    var legendCfg = config.legend;
                    legendCfg.gradient = me.get("gradient");
                    me.set("legend", new legend(legendCfg));
                }
            },
            resize: function () {
                var me = this, element = me.get("element"), canvas = me.get("canvas"), acanvas = me.get("acanvas");
                canvas.width = acanvas.width = me.get("width") || element.style.width.replace(/px/, "") || me.getWidth(element);
                this.set("width", canvas.width);
                canvas.height = acanvas.height = me.get("height") || element.style.height.replace(/px/, "") || me.getHeight(element);
                this.set("height", canvas.height);
            },
            init: function () {
                var me = this, canvas = document.createElement("canvas"), acanvas = document.createElement("canvas"),
                    ctx = canvas.getContext("2d"), actx = acanvas.getContext("2d"), element = me.get("element");
                me.initColorPalette();
                me.set("canvas", canvas);
                me.set("ctx", ctx);
                me.set("acanvas", acanvas);
                me.set("actx", actx);
                me.resize();
                canvas.style.cssText = acanvas.style.cssText = "position:absolute;top:0;left:0;z-index:10000000;";
                if (!me.get("visible")) canvas.style.display = "none";
                element.appendChild(canvas);
                if (me.get("legend")) element.appendChild(me.get("legend").getElement());
                if (me.get("debug")) document.body.appendChild(acanvas);
                actx.shadowOffsetX = 15000;
                actx.shadowOffsetY = 15000;
                actx.shadowBlur = 15;
            },
            initColorPalette: function () {
                var me = this, canvas = document.createElement("canvas"), gradient = me.get("gradient"), ctx, grad, testData;
                canvas.width = "1";
                canvas.height = "256";
                ctx = canvas.getContext("2d");
                grad = ctx.createLinearGradient(0, 0, 1, 256);
                testData = ctx.getImageData(0, 0, 1, 1);
                testData.data[0] = testData.data[3] = 64;
                testData.data[1] = testData.data[2] = 0;
                ctx.putImageData(testData, 0, 0);
                testData = ctx.getImageData(0, 0, 1, 1);
                me.set("premultiplyAlpha", (testData.data[0] < 60 || testData.data[0] > 70));
                for (var x in gradient) grad.addColorStop(x, gradient[x]);
                ctx.fillStyle = grad;
                ctx.fillRect(0, 0, 1, 256);
                me.set("gradient", ctx.getImageData(0, 0, 1, 256).data);
            },
            getWidth: function (element) {
                var width = element.offsetWidth;
                if (element.style.paddingLeft) width += element.style.paddingLeft;
                if (element.style.paddingRight) width += element.style.paddingRight;
                return width;
            },
            getHeight: function (element) {
                var height = element.offsetHeight;
                if (element.style.paddingTop) height += element.style.paddingTop;
                if (element.style.paddingBottom) height += element.style.paddingBottom;
                return height;
            },
            colorize: function (x, y) {
                var me = this, width = me.get("width"), radius = me.get("radius"), height = me.get("height"),
                    actx = me.get("actx"), ctx = me.get("ctx"), x2 = radius * 3, premultiplyAlpha = me.get("premultiplyAlpha"),
                    palette = me.get("gradient"), opacity = me.get("opacity"), bounds = me.get("bounds"),
                    left, top, bottom, right, image, imageData, length, alpha, offset, finalAlpha;
                if (x != null && y != null) {
                    if (x + x2 > width) x = width - x2;
                    if (x < 0) x = 0;
                    if (y < 0) y = 0;
                    if (y + x2 > height) y = height - x2;
                    left = x;
                    top = y;
                    right = x + x2;
                    bottom = y + x2;
                } else {
                    left = bounds['l'] < 0 ? 0 : bounds['l'];
                    right = bounds['r'] > width ? width : bounds['r'];
                    top = bounds['t'] < 0 ? 0 : bounds['t'];
                    bottom = bounds['b'] > height ? height : bounds['b'];
                }
                image = actx.getImageData(left, top, right - left, bottom - top);
                imageData = image.data;
                length = imageData.length;
                for (var i = 3; i < length; i += 4) {
                    alpha = imageData[i];
                    offset = alpha * 4;
                    if (!offset) continue;
                    finalAlpha = (alpha < opacity) ? alpha : opacity;
                    imageData[i - 3] = palette[offset];
                    imageData[i - 2] = palette[offset + 1];
                    imageData[i - 1] = palette[offset + 2];
                    if (premultiplyAlpha) {
                        imageData[i - 3] /= 255 / finalAlpha;
                        imageData[i - 2] /= 255 / finalAlpha;
                        imageData[i - 1] /= 255 / finalAlpha;
                    }
                    imageData[i] = finalAlpha;
                }
                image.data = imageData;
                ctx.putImageData(image, left, top);
            },
            drawAlpha: function (x, y, count, colorize) {
                var me = this, radius = me.get("radius"), ctx = me.get("actx"), bounds = me.get("bounds"),
                    xb = (x - (1.5 * radius)) >> 0, yb = (y - (1.5 * radius)) >> 0,
                    xc = (x + (1.5 * radius)) >> 0, yc = (y + (1.5 * radius)) >> 0;
                ctx.shadowColor = ('rgba(0,0,0,' + ((count) ? (count / me.store.max) : '0.1') + ')');
                ctx.shadowOffsetX = 15000;
                ctx.shadowOffsetY = 15000;
                ctx.shadowBlur = 15;
                ctx.beginPath();
                ctx.arc(x - 15000, y - 15000, radius, 0, Math.PI * 2, true);
                ctx.closePath();
                ctx.fill();
                if (colorize) {
                    me.colorize(xb, yb);
                } else {
                    if (xb < bounds["l"]) bounds["l"] = xb;
                    if (yb < bounds["t"]) bounds["t"] = yb;
                    if (xc > bounds['r']) bounds['r'] = xc;
                    if (yc > bounds['b']) bounds['b'] = yc;
                }
            },
            toggleDisplay: function () {
                var me = this, visible = me.get("visible"), canvas = me.get("canvas");
                if (!visible) canvas.style.display = "block";
                else canvas.style.display = "none";
                me.set("visible", !visible);
            },
            getImageData: function () { return this.get("canvas").toDataURL(); },
            clear: function () {
                var me = this, w = me.get("width"), h = me.get("height");
                me.store.set("data", []);
                me.get("ctx").clearRect(0, 0, w, h);
                me.get("actx").clearRect(0, 0, w, h);
            },
            cleanup: function () { this.get("element").removeChild(this.get("canvas")); }
        };
        return {
            create: function (config) { return new heatmap(config); },
            util: {
                mousePosition: function (ev) {
                    var x, y;
                    if (ev.layerX) { x = ev.layerX; y = ev.layerY; } else if (ev.offsetX) { x = ev.offsetX; y = ev.offsetY; }
                    if (typeof (x) == 'undefined') return;
                    return [x, y];
                }
            }
        };
    })();
    w.h337 = w.heatmapFactory = heatmapFactory;
})(window);

/*==============================以上部分为 heatmap.js 核心代码====================================*/

/*==============================以下部分为 BMapGL 热力图覆盖物===================================================*/

var BMapGLLib = window.BMapGLLib = BMapGLLib || {};

(function () {
    /**
     * 热力图覆盖物，适配百度地图 GL 版本
     * @class BMapGLLib.HeatmapOverlay
     * @param {Object} opts 可选参数：radius, visible, gradient, opacity 等（同 heatmap.js）
     */
    var HeatmapOverlay = BMapGLLib.HeatmapOverlay = function (opts) {
        this.conf = opts || {};
        this.heatmap = null;
        this.latlngs = [];
        this.bounds = null;
    };

    HeatmapOverlay.prototype = new BMapGL.Overlay();

    HeatmapOverlay.prototype.initialize = function (map) {
        this._map = map;
        var size = map.getSize();
        var el = document.createElement("div");
        el.style.cssText = "position:absolute;top:0;left:0;border:0;width:" + (size.width || 0) + "px;height:" + (size.height || 0) + "px;";
        this.conf.element = el;
        var panes = map.getPanes();
        var pane = panes.overlayPane || panes.mapPane || panes.floatPane;
        if (pane) pane.appendChild(el);
        else if (panes.markerPane && panes.markerPane.parentNode) panes.markerPane.parentNode.insertBefore(el, panes.markerPane);
        this.heatmap = h337.create(this.conf);
        this._div = el;
        return el;
    };

    function boundsEqual(a, b) {
        if (!a || !b) return false;
        if (typeof a.equals === 'function' && a.equals(b)) return true;
        var sw1 = a.getSouthWest(), sw2 = b.getSouthWest(), ne1 = a.getNorthEast(), ne2 = b.getNorthEast();
        return sw1.lng === sw2.lng && sw1.lat === sw2.lat && ne1.lng === ne2.lng && ne1.lat === ne2.lat;
    }

    HeatmapOverlay.prototype.draw = function () {
        var currentBounds = this._map.getBounds();
        if (boundsEqual(currentBounds, this.bounds)) return;
        this.bounds = currentBounds;

        var ne = this._map.pointToOverlayPixel(currentBounds.getNorthEast());
        var sw = this._map.pointToOverlayPixel(currentBounds.getSouthWest());
        var topY = ne.y;
        var leftX = sw.x;
        var h = sw.y - ne.y;
        var w = ne.x - sw.x;

        this.conf.element.style.left = leftX + 'px';
        this.conf.element.style.top = topY + 'px';
        this.conf.element.style.width = w + 'px';
        this.conf.element.style.height = h + 'px';
        this.heatmap.store.get("heatmap").resize();

        if (this.latlngs.length > 0) {
            this.heatmap.clear();
            var len = this.latlngs.length;
            var d = { max: this.heatmap.store.max, data: [] };
            while (len--) {
                var latlng = this.latlngs[len].latlng;
                if (!currentBounds.containsPoint(latlng)) continue;
                var divPixel = this._map.pointToOverlayPixel(latlng);
                var screenPixel = { x: divPixel.x - leftX, y: divPixel.y - topY };
                var roundedPoint = this.pixelTransform(screenPixel);
                d.data.push({ x: roundedPoint.x, y: roundedPoint.y, count: this.latlngs[len].c });
            }
            this.heatmap.store.setDataSet(d);
        }
    };

    HeatmapOverlay.prototype.pixelTransform = function (p) {
        var w = this.heatmap.get("width"), h = this.heatmap.get("height");
        while (p.x < 0) p.x += w;
        while (p.x > w) p.x -= w;
        while (p.y < 0) p.y += h;
        while (p.y > h) p.y -= h;
        p.x = (p.x >> 0);
        p.y = (p.y >> 0);
        return p;
    };

    /**
     * 设置热力图数据
     * @param {Object} data 格式：{ max: Number, data: Array<{lng, lat, count}> }
     */
    HeatmapOverlay.prototype.setDataSet = function (data) {
        var currentBounds = this._map.getBounds();
        var mapdata = { max: data.max, data: [] };
        var d = data.data, dlen = d.length;
        this.latlngs = [];

        while (dlen--) {
            var latlng = new BMapGL.Point(d[dlen].lng, d[dlen].lat);
            if (!currentBounds.containsPoint(latlng)) continue;
            this.latlngs.push({ latlng: latlng, c: d[dlen].count });

            var divPixel = this._map.pointToOverlayPixel(latlng);
            var leftX = this._map.pointToOverlayPixel(currentBounds.getSouthWest()).x;
            var topY = this._map.pointToOverlayPixel(currentBounds.getNorthEast()).y;
            var screenPixel = { x: divPixel.x - leftX, y: divPixel.y - topY };
            var point = this.pixelTransform(screenPixel);
            mapdata.data.push({ x: point.x, y: point.y, count: d[dlen].count });
        }
        this.heatmap.clear();
        this.heatmap.store.setDataSet(mapdata);
    };

    /**
     * 添加单点
     * @param {Number} lng 经度
     * @param {Number} lat 纬度
     * @param {Number} count 权重
     */
    HeatmapOverlay.prototype.addDataPoint = function (lng, lat, count) {
        var latlng = new BMapGL.Point(lng, lat);
        var pixel = this._map.pointToOverlayPixel(latlng);
        var leftX = this._map.pointToOverlayPixel(this._map.getBounds().getSouthWest()).x;
        var topY = this._map.pointToOverlayPixel(this._map.getBounds().getNorthEast()).y;
        var screenPixel = { x: pixel.x - leftX, y: pixel.y - topY };
        var point = this.pixelTransform(screenPixel);
        this.heatmap.store.addDataPoint(point.x, point.y, count);
        this.latlngs.push({ latlng: latlng, c: count });
    };

    /** 切换显示/隐藏 */
    HeatmapOverlay.prototype.toggle = function () {
        this.heatmap.toggleDisplay();
    };

    /** 显示热力图 */
    HeatmapOverlay.prototype.show = function () {
        if (this.heatmap && !this.heatmap.get("visible")) this.heatmap.toggleDisplay();
    };

    /** 隐藏热力图 */
    HeatmapOverlay.prototype.hide = function () {
        if (this.heatmap && this.heatmap.get("visible")) this.heatmap.toggleDisplay();
    };

    /**
     * 设置配置项（如 radius、gradient、opacity）
     * @param {Object} opts 同构造函数参数
     */
    HeatmapOverlay.prototype.setOptions = function (opts) {
        if (!opts) return;
        for (var k in opts) if (opts.hasOwnProperty(k)) this.conf[k] = opts[k];
        if (this.heatmap) this.heatmap.configure(this.conf);
    };

    BMapGLLib.HeatmapOverlay = HeatmapOverlay;
})();

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
var heatmapEngine = (function () {
    var defaults = {
        defaultRadius: 40,
        defaultRenderer: "canvas2d",
        defaultGradient: {
            0.45: "rgb(0,0,255)",
            0.55: "rgb(0,255,255)",
            0.65: "rgb(0,255,0)",
            0.95: "yellow",
            1: "rgb(255,0,0)"
        },
        defaultMaxOpacity: 1,
        defaultMinOpacity: 0,
        defaultBlur: 0.85,
        defaultXField: "x",
        defaultYField: "y",
        defaultValueField: "value",
        plugins: {}
    };

    var Store = (function () {
        var StoreCtor = function (config) {
            this._coordinator = {};
            this._data = [];
            this._radi = [];
            this._min = 0;
            this._max = 1;
            this.max = 1;
            this._xField = config.xField || config.defaultXField;
            this._yField = config.yField || config.defaultYField;
            this._valueField = config.valueField || config.defaultValueField;
            if (config.radius) {
                this._cfgRadius = config.radius;
            }
        };

        var defaultRadius = defaults.defaultRadius;

        StoreCtor.prototype = {
            _organiseData: function (dataPoint, forceRender) {
                var x = dataPoint[this._xField];
                var y = dataPoint[this._yField];
                var radi = this._radi;
                var data = this._data;
                var max = this._max;
                var min = this._min;
                var value = dataPoint[this._valueField] || 1;
                var radius = dataPoint.radius || this._cfgRadius || defaultRadius;

                if (!data[x]) {
                    data[x] = [];
                    radi[x] = [];
                }
                if (!data[x][y]) {
                    data[x][y] = value;
                    radi[x][y] = radius;
                } else {
                    data[x][y] += value;
                }

                if (data[x][y] > max) {
                    if (!forceRender) {
                        this._max = data[x][y];
                    } else {
                        this.setDataMax(data[x][y]);
                    }
                    return false;
                }

                return {
                    x: x,
                    y: y,
                    value: value,
                    radius: radius,
                    min: min,
                    max: max
                };
            },

            _unOrganizeData: function () {
                var unorganized = [];
                var data = this._data;
                var radi = this._radi;
                for (var x in data) {
                    for (var y in data[x]) {
                        unorganized.push({
                            x: x,
                            y: y,
                            radius: radi[x][y],
                            value: data[x][y]
                        });
                    }
                }
                return {
                    min: this._min,
                    max: this._max,
                    data: unorganized
                };
            },

            _onExtremaChange: function () {
                this._coordinator.emit("extremachange", {
                    min: this._min,
                    max: this._max
                });
            },

            addData: function () {
                if (arguments[0].length > 0) {
                    var dataArr = arguments[0];
                    var len = dataArr.length;
                    while (len--) {
                        this.addData.call(this, dataArr[len]);
                    }
                } else {
                    var organised = this._organiseData(arguments[0], true);
                    if (organised) {
                        this._coordinator.emit("renderpartial", {
                            min: this._min,
                            max: this._max,
                            data: [organised]
                        });
                    }
                }
                return this;
            },

            addDataPoint: function (x, y, count) {
                var point = {};
                point[this._xField] = x;
                point[this._yField] = y;
                point[this._valueField] = count === undefined ? 1 : count;
                return this.addData(point);
            },

            setData: function (dataset) {
                var points = dataset.data;
                var len = points.length;
                this._data = [];
                this._radi = [];
                for (var i = 0; i < len; i++) {
                    this._organiseData(points[i], false);
                }
                this._max = dataset.max;
                this._min = dataset.min || 0;
                this.max = this._max;
                this._onExtremaChange();
                this._coordinator.emit("renderall", this._getInternalData());
                return this;
            },

            setDataSet: function (dataset) {
                var points = dataset.data || [];
                var converted = [];
                var len = points.length;
                for (var i = 0; i < len; i++) {
                    var point = points[i];
                    var target = {};
                    target[this._xField] = point[this._xField];
                    target[this._yField] = point[this._yField];
                    target[this._valueField] = point[this._valueField] !== undefined ? point[this._valueField] : point.count;
                    if (point.radius !== undefined) {
                        target.radius = point.radius;
                    }
                    converted.push(target);
                }
                return this.setData({
                    min: dataset.min || 0,
                    max: dataset.max,
                    data: converted
                });
            },

            removeData: function () {},

            setDataMax: function (max) {
                this._max = max;
                this.max = max;
                this._onExtremaChange();
                this._coordinator.emit("renderall", this._getInternalData());
                return this;
            },

            setDataMin: function (min) {
                this._min = min;
                this.max = this._max;
                this._onExtremaChange();
                this._coordinator.emit("renderall", this._getInternalData());
                return this;
            },

            setCoordinator: function (coordinator) {
                this._coordinator = coordinator;
            },

            _getInternalData: function () {
                return {
                    max: this._max,
                    min: this._min,
                    data: this._data,
                    radi: this._radi
                };
            },

            getData: function () {
                return this._unOrganizeData();
            },

            exportDataSet: function () {
                var data = this.getData();
                var exportData = [];
                var points = data.data || [];
                var len = points.length;
                while (len--) {
                    exportData.push({
                        x: points[len].x >> 0,
                        y: points[len].y >> 0,
                        count: points[len].value
                    });
                }
                return {
                    max: data.max,
                    data: exportData
                };
            }
        };

        return StoreCtor;
    })();

    var Canvas2dRenderer = (function () {
        var _getColorPalette = function (config) {
            var gradientConfig = config.gradient || config.defaultGradient;
            var paletteCanvas = document.createElement("canvas");
            var paletteCtx = paletteCanvas.getContext("2d");
            paletteCanvas.width = 256;
            paletteCanvas.height = 1;
            var gradient = paletteCtx.createLinearGradient(0, 0, 256, 1);
            for (var key in gradientConfig) {
                gradient.addColorStop(key, gradientConfig[key]);
            }
            paletteCtx.fillStyle = gradient;
            paletteCtx.fillRect(0, 0, 256, 1);
            return paletteCtx.getImageData(0, 0, 256, 1).data;
        };

        var _getPointTemplate = function (radius, blurFactor) {
            var tplCanvas = document.createElement("canvas");
            var tplCtx = tplCanvas.getContext("2d");
            var x = radius;
            var y = radius;
            tplCanvas.width = tplCanvas.height = radius * 2;
            if (blurFactor === 1) {
                tplCtx.beginPath();
                tplCtx.arc(x, y, radius, 0, 2 * Math.PI, false);
                tplCtx.fillStyle = "rgba(0,0,0,1)";
                tplCtx.fill();
            } else {
                var gradient = tplCtx.createRadialGradient(x, y, radius * blurFactor, x, y, radius);
                gradient.addColorStop(0, "rgba(0,0,0,1)");
                gradient.addColorStop(1, "rgba(0,0,0,0)");
                tplCtx.fillStyle = gradient;
                tplCtx.fillRect(0, 0, 2 * radius, 2 * radius);
            }
            return tplCanvas;
        };

        var _prepareData = function (internal) {
            var renderData = [];
            var min = internal.min;
            var max = internal.max;
            var radi = internal.radi;
            var data = internal.data;
            var xKeys = Object.keys(data);
            var xLen = xKeys.length;
            while (xLen--) {
                var x = xKeys[xLen];
                var yKeys = Object.keys(data[x]);
                var yLen = yKeys.length;
                while (yLen--) {
                    var y = yKeys[yLen];
                    renderData.push({
                        x: x,
                        y: y,
                        value: data[x][y],
                        radius: radi[x][y]
                    });
                }
            }
            return {
                min: min,
                max: max,
                data: renderData
            };
        };

        function Renderer(config) {
            var container = config.element;
            var shadowCanvas = this.shadowCanvas = document.createElement("canvas");
            var canvas = this.canvas = config.canvas || document.createElement("canvas");
            this._renderBoundaries = [10000, 10000, 0, 0];
            var computed = getComputedStyle(config.element) || {};
            canvas.className = "heatmap-canvas";
            this._width = canvas.width = shadowCanvas.width = +(computed.width.replace(/px/, ""));
            this._height = canvas.height = shadowCanvas.height = +(computed.height.replace(/px/, ""));
            this.shadowCtx = shadowCanvas.getContext("2d");
            this.ctx = canvas.getContext("2d");
            canvas.style.cssText = shadowCanvas.style.cssText = "position:absolute;left:0;top:0;";
            container.style.position = "relative";
            container.appendChild(canvas);
            this._palette = _getColorPalette(config);
            this._templates = {};
            this._setStyles(config);
        }

        Renderer.prototype = {
            renderPartial: function (data) {
                this._drawAlpha(data);
                this._colorize();
            },

            renderAll: function (data) {
                this._clear();
                this._drawAlpha(_prepareData(data));
                this._colorize();
            },

            _updateGradient: function (config) {
                this._palette = _getColorPalette(config);
            },

            updateConfig: function (config) {
                if (config.gradient) {
                    this._updateGradient(config);
                }
                this._setStyles(config);
            },

            setDimensions: function (width, height) {
                this._width = width;
                this._height = height;
                this.canvas.width = this.shadowCanvas.width = width;
                this.canvas.height = this.shadowCanvas.height = height;
            },

            _clear: function () {
                this.shadowCtx.clearRect(0, 0, this._width, this._height);
                this.ctx.clearRect(0, 0, this._width, this._height);
            },

            _setStyles: function (config) {
                this._blur = (config.blur == 0) ? 0 : (config.blur || config.defaultBlur);
                if (config.backgroundColor) {
                    this.canvas.style.backgroundColor = config.backgroundColor;
                }
                this._opacity = (config.opacity || 0) * 255;
                this._maxOpacity = (config.maxOpacity || config.defaultMaxOpacity) * 255;
                this._minOpacity = (config.minOpacity || config.defaultMinOpacity) * 255;
                this._useGradientOpacity = !!config.useGradientOpacity;
            },

            _drawAlpha: function (data) {
                var min = this._min = data.min;
                var max = this._max = data.max;
                var points = data.data || [];
                var len = points.length;
                var blurFactor = 1 - this._blur;
                while (len--) {
                    var point = points[len];
                    var x = point.x;
                    var y = point.y;
                    var radius = point.radius;
                    var value = Math.min(point.value, max);
                    var rectX = x - radius;
                    var rectY = y - radius;
                    var shadowCtx = this.shadowCtx;
                    var tpl;
                    if (!this._templates[radius]) {
                        this._templates[radius] = tpl = _getPointTemplate(radius, blurFactor);
                    } else {
                        tpl = this._templates[radius];
                    }
                    shadowCtx.globalAlpha = (value - min) / (max - min);
                    shadowCtx.drawImage(tpl, rectX, rectY);
                    if (rectX < this._renderBoundaries[0]) {
                        this._renderBoundaries[0] = rectX;
                    }
                    if (rectY < this._renderBoundaries[1]) {
                        this._renderBoundaries[1] = rectY;
                    }
                    if (rectX + 2 * radius > this._renderBoundaries[2]) {
                        this._renderBoundaries[2] = rectX + 2 * radius;
                    }
                    if (rectY + 2 * radius > this._renderBoundaries[3]) {
                        this._renderBoundaries[3] = rectY + 2 * radius;
                    }
                }
            },

            _colorize: function () {
                var left = this._renderBoundaries[0];
                var top = this._renderBoundaries[1];
                var width = this._renderBoundaries[2] - left;
                var height = this._renderBoundaries[3] - top;
                var maxWidth = this._width;
                var maxHeight = this._height;
                var opacity = this._opacity;
                var maxOpacity = this._maxOpacity;
                var minOpacity = this._minOpacity;
                var useGradientOpacity = this._useGradientOpacity;

                if (left < 0) { left = 0; }
                if (top < 0) { top = 0; }
                if (left + width > maxWidth) { width = maxWidth - left; }
                if (top + height > maxHeight) { height = maxHeight - top; }

                var img = this.shadowCtx.getImageData(left, top, width, height);
                var imgData = img.data;
                var len = imgData.length;
                var palette = this._palette;

                for (var i = 3; i < len; i += 4) {
                    var alpha = imgData[i];
                    var offset = alpha * 4;
                    if (!offset) {
                        continue;
                    }
                    var finalAlpha;
                    if (opacity > 0) {
                        finalAlpha = opacity;
                    } else if (alpha < maxOpacity) {
                        finalAlpha = (alpha < minOpacity) ? minOpacity : alpha;
                    } else {
                        finalAlpha = maxOpacity;
                    }
                    imgData[i - 3] = palette[offset];
                    imgData[i - 2] = palette[offset + 1];
                    imgData[i - 1] = palette[offset + 2];
                    imgData[i] = useGradientOpacity ? palette[offset + 3] : finalAlpha;
                }
                img.data = imgData;
                this.ctx.putImageData(img, left, top);
                this._renderBoundaries = [10000, 10000, 0, 0];
            },

            getValueAt: function (point) {
                var img = this.shadowCtx.getImageData(point.x, point.y, 1, 1);
                var alpha = img.data[3];
                return (Math.abs(this._max - this._min) * (alpha / 255)) >> 0;
            },

            getDataURL: function () {
                return this.canvas.toDataURL();
            }
        };

        return Renderer;
    })();

    var Renderer = (function () {
        var renderer = false;
        if (defaults.defaultRenderer === "canvas2d") {
            renderer = Canvas2dRenderer;
        }
        return renderer;
    })();

    var Util = {
        merge: function () {
            var merged = {};
            var argsLen = arguments.length;
            for (var i = 0; i < argsLen; i++) {
                var obj = arguments[i];
                for (var key in obj) {
                    merged[key] = obj[key];
                }
            }
            return merged;
        }
    };

    var Heatmap = (function () {
        var Coordinator = (function () {
            function CoordinatorCtor() {
                this.cStore = {};
            }
            CoordinatorCtor.prototype = {
                on: function (evtName, callback, scope) {
                    var store = this.cStore;
                    if (!store[evtName]) {
                        store[evtName] = [];
                    }
                    store[evtName].push(function (data) {
                        return callback.call(scope, data);
                    });
                },
                emit: function (evtName, data) {
                    var store = this.cStore;
                    if (store[evtName]) {
                        var len = store[evtName].length;
                        for (var i = 0; i < len; i++) {
                            store[evtName][i](data);
                        }
                    }
                }
            };
            return CoordinatorCtor;
        })();

        var _connect = function (instance) {
            var renderer = instance._renderer;
            var coordinator = instance._coordinator;
            var store = instance._store;
            coordinator.on("renderpartial", renderer.renderPartial, renderer);
            coordinator.on("renderall", renderer.renderAll, renderer);
            coordinator.on("extremachange", function (data) {
                instance._config.onExtremaChange && instance._config.onExtremaChange({
                    min: data.min,
                    max: data.max,
                    gradient: instance._config.gradient || instance._config.defaultGradient
                });
            });
            store.setCoordinator(coordinator);
        };

        function HeatmapCtor() {
            var config = this._config = Util.merge(defaults, arguments[0] || {});
            this._coordinator = new Coordinator();
            if (config.plugin) {
                var pluginKey = config.plugin;
                if (!defaults.plugins[pluginKey]) {
                    throw new Error("Plugin '" + pluginKey + "' not found. Maybe it was not registered.");
                }
                var plugin = defaults.plugins[pluginKey];
                this._renderer = new plugin.renderer(config);
                this._store = new plugin.store(config);
            } else {
                this._renderer = new Renderer(config);
                this._store = new Store(config);
            }
            this.store = this._store;
            _connect(this);
        }

        HeatmapCtor.prototype = {
            addData: function () {
                this._store.addData.apply(this._store, arguments);
                return this;
            },
            addDataPoint: function (x, y, count) {
                this._store.addDataPoint(x, y, count);
                return this;
            },
            removeData: function () {
                this._store.removeData && this._store.removeData.apply(this._store, arguments);
                return this;
            },
            setData: function () {
                this._store.setData.apply(this._store, arguments);
                return this;
            },
            setDataSet: function (dataset) {
                this._store.setDataSet(dataset);
                return this;
            },
            setDataMax: function () {
                this._store.setDataMax.apply(this._store, arguments);
                return this;
            },
            setDataMin: function () {
                this._store.setDataMin.apply(this._store, arguments);
                return this;
            },
            exportDataSet: function () {
                return this._store.exportDataSet();
            },
            configure: function (cfg) {
                this._config = Util.merge(this._config, cfg);
                this._renderer.updateConfig(this._config);
                this._coordinator.emit("renderall", this._store._getInternalData());
                return this;
            },
            repaint: function () {
                this._coordinator.emit("renderall", this._store._getInternalData());
                return this;
            },
            getData: function () {
                return this._store.getData();
            },
            getDataURL: function () {
                return this._renderer.getDataURL();
            },
            getImageData: function () {
                return this.getDataURL();
            },
            clear: function () {
                this._store._data = [];
                this._store._radi = [];
                this._coordinator.emit("renderall", this._store._getInternalData());
                return this;
            },
            toggleDisplay: function () {
                this._config.visible = !this._config.visible;
                this._renderer.canvas.style.display = this._config.visible ? "block" : "none";
                return this;
            },
            getValueAt: function (point) {
                if (this._store.getValueAt) {
                    return this._store.getValueAt(point);
                } else if (this._renderer.getValueAt) {
                    return this._renderer.getValueAt(point);
                }
                return null;
            }
        };

        return HeatmapCtor;
    })();

    var api = {
        create: function (config) {
            return new Heatmap(config);
        },
        register: function (pluginKey, plugin) {
            defaults.plugins[pluginKey] = plugin;
        }
    };

    return api;
})();

var BMapGLLib = window.BMapGLLib = BMapGLLib || {};

(function () {
    var HeatmapOverlay = BMapGLLib.HeatmapOverlay = function (opts) {
        this.conf = opts || {};
        this.conf.visible = this.conf.visible === undefined ? true : this.conf.visible;
        this.heatmap = null;
        this.latlngs = [];
        this._viewSignature = null;
    };

    HeatmapOverlay.prototype = new BMapGL.Overlay();

    HeatmapOverlay.prototype.initialize = function (map) {
        this._map = map;
        var el = document.createElement("div");
        el.style.position = "absolute";
        el.style.top = 0;
        el.style.left = 0;
        el.style.border = 0;
        el.style.width = this._map.getSize().width + "px";
        el.style.height = this._map.getSize().height + "px";
        this.conf.element = el;

        if (!isSupportCanvas()) {
            return el;
        }

        var panes = map.getPanes();
        var pane = panes.overlayPane || panes.mapPane || panes.floatPane;
        if (pane) {
            pane.appendChild(el);
        } else if (panes.markerPane && panes.markerPane.parentNode) {
            panes.markerPane.parentNode.insertBefore(el, panes.markerPane);
        }
        this.conf.valueField = this.conf.valueField || "count";
        this.heatmap = heatmapEngine.create(this.conf);

        var me = this;
        map.addEventListener("resize", function (evt) {
            var size = evt.size;
            el.style.width = size.width + "px";
            el.style.height = size.height + "px";
            me.heatmap._renderer.setDimensions(size.width, size.height);
            me._viewSignature = null;
            me.draw();
        });

        function invalidateAndDraw() {
            me._viewSignature = null;
            me.draw();
        }
        ["headingchanged", "tiltchanged"].forEach(function (evtName) {
            try {
                map.addEventListener(evtName, invalidateAndDraw);
            } catch (err) {
            }
        });

        this._div = el;
        return el;
    };

    /**
     * 当前地理范围四角在overlay像素下的包围盒（旋转/倾斜时仍覆盖可见区域）
     */
    function computeOverlayPixelBox(map, bounds) {
        var sw = bounds.getSouthWest();
        var ne = bounds.getNorthEast();
        var nw = new BMapGL.Point(sw.lng, ne.lat);
        var se = new BMapGL.Point(ne.lng, sw.lat);
        var psw = map.pointToOverlayPixel(sw);
        var pne = map.pointToOverlayPixel(ne);
        var pnw = map.pointToOverlayPixel(nw);
        var pse = map.pointToOverlayPixel(se);
        var xs = [psw.x, pne.x, pnw.x, pse.x];
        var ys = [psw.y, pne.y, pnw.y, pse.y];
        var minX = Math.min(xs[0], xs[1], xs[2], xs[3]);
        var maxX = Math.max(xs[0], xs[1], xs[2], xs[3]);
        var minY = Math.min(ys[0], ys[1], ys[2], ys[3]);
        var maxY = Math.max(ys[0], ys[1], ys[2], ys[3]);
        return {
            left: minX,
            top: minY,
            width: Math.max(1, maxX - minX),
            height: Math.max(1, maxY - minY),
            originX: minX,
            originY: minY
        };
    }

    /**
     * 视图签名：地理范围 + 缩放 + 中心 + 朝向/倾角。旋转/倾斜后重绘。
     */
    HeatmapOverlay.prototype._getViewSignature = function (bounds) {
        var map = this._map;
        var sw = bounds.getSouthWest();
        var ne = bounds.getNorthEast();
        var c = map.getCenter && map.getCenter();
        var heading = typeof map.getHeading === "function" ? map.getHeading() : 0;
        var tilt = typeof map.getTilt === "function" ? map.getTilt() : 0;
        return [
            sw.lng, sw.lat, ne.lng, ne.lat,
            map.getZoom(),
            c ? c.lng : 0, c ? c.lat : 0,
            heading, tilt
        ].join(",");
    };

    HeatmapOverlay.prototype._applyLayoutToElement = function (layout) {
        var el = this.conf.element;
        el.style.left = layout.left + "px";
        el.style.top = layout.top + "px";
        el.style.width = layout.width + "px";
        el.style.height = layout.height + "px";
        if (this.heatmap && this.heatmap._renderer && typeof this.heatmap._renderer.setDimensions === "function") {
            this.heatmap._renderer.setDimensions(layout.width, layout.height);
        }
    };

    HeatmapOverlay.prototype.draw = function () {
        if (!isSupportCanvas()) {
            return;
        }

        var currentBounds = this._map.getBounds();
        var sig = this._getViewSignature(currentBounds);
        if (sig === this._viewSignature) {
            return;
        }
        this._viewSignature = sig;

        var layout = computeOverlayPixelBox(this._map, currentBounds);
        this._applyLayoutToElement(layout);

        if (this.latlngs.length > 0) {
            this.heatmap.removeData();
            var len = this.latlngs.length;
            var d = {
                max: this.heatmap._store.getData().max,
                data: []
            };

            while (len--) {
                var latlng = this.latlngs[len].latlng;
                if (!currentBounds.containsPoint(latlng)) {
                    continue;
                }
                var divPixel = this._map.pointToOverlayPixel(latlng);
                var screenPixel = new BMapGL.Pixel(
                    divPixel.x - layout.originX,
                    divPixel.y - layout.originY
                );
                var point = this.pixelTransform(screenPixel);
                d.data.push({
                    x: point.x,
                    y: point.y,
                    count: this.latlngs[len].c
                });
            }

            if (this.conf.radiusChangeByZoom) {
                this.heatmap._store._cfgRadius = this.conf.radiusChangeByZoom(this._map.getZoom());
            }
            this.heatmap.setData(d);
        }
    };

    HeatmapOverlay.prototype.pixelTransform = function (pixel) {
        var renderer = this.heatmap && this.heatmap._renderer;
        var w = (renderer && renderer._width) || this.heatmap.width;
        var h = (renderer && renderer._height) || this.heatmap.height;
        if (w < 1) {
            w = 1;
        }
        if (h < 1) {
            h = 1;
        }
        pixel.x = Math.max(0, Math.min(w - 1, pixel.x));
        pixel.y = Math.max(0, Math.min(h - 1, pixel.y));
        pixel.x = pixel.x >> 0;
        pixel.y = pixel.y >> 0;
        return pixel;
    };

    HeatmapOverlay.prototype.setDataSet = function (data) {
        if (!data) {
            data = { max: 0, data: [] };
        }
        // 与入参数组脱钩，避免 addDataPoint 里 push 改到调用方传入的同一引用（如 demo 里 HEATMAP_DATA）
        this.data = {
            max: data.max,
            data: (data.data || []).slice()
        };
        if (!isSupportCanvas()) {
            return;
        }

        var currentBounds = this._map.getBounds();
        var mapData = {
            max: this.data.max,
            data: []
        };
        var points = this.data.data;
        var len = points.length;

        this.latlngs = [];
        this.heatmap.removeData();

        if (this.conf.radiusChangeByZoom) {
            this.heatmap._store._cfgRadius = this.conf.radiusChangeByZoom(this._map.getZoom());
        }

        var layout = computeOverlayPixelBox(this._map, currentBounds);
        this._applyLayoutToElement(layout);

        while (len--) {
            var latlng = new BMapGL.Point(points[len].lng, points[len].lat);
            this.latlngs.push({
                latlng: latlng,
                c: points[len].count
            });
            if (!currentBounds.containsPoint(latlng)) {
                continue;
            }
            var divPixel = this._map.pointToOverlayPixel(latlng);
            var screenPixel = new BMapGL.Pixel(
                divPixel.x - layout.originX,
                divPixel.y - layout.originY
            );
            var point = this.pixelTransform(screenPixel);
            mapData.data.push({
                x: point.x,
                y: point.y,
                count: points[len].count
            });
        }

        this.heatmap.setData(mapData);
        this._viewSignature = this._getViewSignature(currentBounds);
    };

    HeatmapOverlay.prototype.addDataPoint = function (lng, lat, count) {
        if (!isSupportCanvas()) {
            return;
        }

        if (this.data && this.data.data) {
            this.data.data.push({
                lng: lng,
                lat: lat,
                count: count
            });
        }

        var latlng = new BMapGL.Point(lng, lat);
        this.latlngs.push({
            latlng: latlng,
            c: count
        });
        // 与 draw 同路径全量 setData；勿在此先 setDimensions 再 addData，否则画布被清空只剩新点
        this._viewSignature = null;
        this.draw();
    };

    HeatmapOverlay.prototype.toggle = function () {
        if (!isSupportCanvas()) {
            return;
        }
        this.conf.visible = !this.conf.visible;
        this.conf.element.style.display = this.conf.visible ? "block" : "none";
    };

    HeatmapOverlay.prototype.show = function () {
        if (!isSupportCanvas()) {
            return;
        }
        this.conf.visible = true;
        this.conf.element.style.display = "block";
    };

    HeatmapOverlay.prototype.hide = function () {
        if (!isSupportCanvas()) {
            return;
        }
        this.conf.visible = false;
        this.conf.element.style.display = "none";
    };

    HeatmapOverlay.prototype.setOptions = function (opts) {
        if (!isSupportCanvas()) {
            return;
        }
        for (var key in opts) {
            if (key === "radius") {
                this.heatmap._store._cfgRadius = opts[key];
            }
            if (key === "opacity") {
                opts[key] = opts[key] / 100;
            }
        }
        this.heatmap.configure(opts);
        if (this.data) {
            this.setDataSet(this.data);
        }
    };

    function isSupportCanvas() {
        var canvas = document.createElement("canvas");
        return !!(canvas.getContext && canvas.getContext("2d"));
    }
})();
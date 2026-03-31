/**
 * @fileoverview 百度地图GL的拉框放大类，对外开放。
 * 允许用户在地图上执行拉框放大操作，
 * 使用者可以自定义缩放时的遮盖层样式、鼠标样式等效果。
 * 基于Baidu Map API GL 1.0。
 *
 * @author Baidu Map Api Group
 * @version 1.0
 */

/**
 * @namespace BMapGL的所有library类均放在BMapGLLib命名空间下
 */
var BMapGLLib = window.BMapGLLib = BMapGLLib || {};

if (typeof BMapGLLib._toolInUse === "undefined") {
    BMapGLLib._toolInUse = false;
}

(function() {
    var baidu = baidu || {guid: "$BAIDU$"};
    (function() {
        window[baidu.guid] = window[baidu.guid] || {};

        baidu.extend = baidu.extend || function(target, source) {
            for (var p in source) {
                if (source.hasOwnProperty(p)) {
                    target[p] = source[p];
                }
            }
            return target;
        };

        baidu.lang = baidu.lang || {};

        baidu.lang.Class = baidu.lang.Class || function() {};
    })();

    /**
     * @exports RectangleZoom as BMapGLLib.RectangleZoom
     */
    BMapGLLib.RectangleZoom = function(map, opts) {
        if (!map) {
            return;
        }
        baidu.lang.Class.call(this);
        this._map = map;
        this._opts = {
            followText: "",
            strokeWeight: 2,
            strokeColor: "#111",
            style: "solid",
            fillColor: "#ccc",
            opacity: 0.4,
            cursor: "crosshair",
            autoClose: false
        };
        baidu.extend(this._opts, opts || {});

        this._opts.strokeWeight = this._opts.strokeWeight <= 0 ? 1 : this._opts.strokeWeight;
        this._opts.opacity = this._opts.opacity < 0 ? 0 : (this._opts.opacity > 1 ? 1 : this._opts.opacity);

        this._isOpen = false;
        this._binded = false;

        this._mask = null;
        this._rectDiv = null;
        this._followDiv = null;

        this._start = null; // {x,y} container coords
        this._startClient = null; // {x,y} client coords
        this._isZooming = false;
    };

    /**
     * 设置线颜色
     */
    BMapGLLib.RectangleZoom.prototype.setStrokeColor = function(color) {
        if (typeof color === "string") {
            this._opts.strokeColor = color;
            this._updateRectStyle();
        }
    };

    /**
     * 设置线粗细
     */
    BMapGLLib.RectangleZoom.prototype.setLineStroke = function(width) {
        if (typeof width === "number" && Math.round(width) > 0) {
            this._opts.strokeWeight = Math.round(width);
            this._updateRectStyle();
        }
    };

    /**
     * 设置线样式
     */
    BMapGLLib.RectangleZoom.prototype.setLineStyle = function(style) {
        if (style === "solid" || style === "dashed") {
            this._opts.style = style;
            this._updateRectStyle();
        }
    };

    /**
     * 设置透明度
     */
    BMapGLLib.RectangleZoom.prototype.setOpacity = function(opacity) {
        if (typeof opacity === "number" && opacity >= 0 && opacity <= 1) {
            this._opts.opacity = opacity;
            this._updateRectStyle();
        }
    };

    /**
     * 设置填充色
     */
    BMapGLLib.RectangleZoom.prototype.setFillColor = function(color) {
        if (typeof color === "string") {
            this._opts.fillColor = color;
            this._updateRectStyle();
        }
    };

    /**
     * 设置鼠标样式
     */
    BMapGLLib.RectangleZoom.prototype.setCursor = function(cursor) {
        this._opts.cursor = cursor || "default";
        if (this._mask) {
            this._mask.style.cursor = this._opts.cursor;
        } else {
            this._map.setDefaultCursor(this._opts.cursor);
        }
    };

    /**
     * 获取鼠标样式
     */
    BMapGLLib.RectangleZoom.prototype.getCursor = function() {
        return this._opts.cursor;
    };

    BMapGLLib.RectangleZoom.prototype._ensureMask = function() {
        if (this._mask) {
            return;
        }
        var container = this._map.getContainer();
        // 确保绝对定位遮罩层按容器定位
        if (container && window.getComputedStyle) {
            var pos = window.getComputedStyle(container).position;
            if (!pos || pos === "static") {
                container.style.position = "relative";
            }
        }
        var mask = document.createElement("div");
        mask.style.position = "absolute";
        mask.style.left = "0";
        mask.style.top = "0";
        mask.style.width = "100%";
        mask.style.height = "100%";
        mask.style.zIndex = "1000";
        mask.style.background = "transparent";
        mask.style.cursor = this._opts.cursor;
        mask.style.display = "none";
        mask.setAttribute("unselectable", "on");
        container.appendChild(mask);
        this._mask = mask;

        if (this._opts.followText) {
            var tip = document.createElement("div");
            tip.style.position = "absolute";
            tip.style.zIndex = "1001";
            tip.style.padding = "2px 6px";
            tip.style.fontSize = "12px";
            tip.style.background = "rgba(255,255,255,0.95)";
            tip.style.border = "1px solid #ff0103";
            tip.style.color = "#333";
            tip.style.borderRadius = "2px";
            tip.style.pointerEvents = "none";
            tip.style.whiteSpace = "nowrap";
            tip.style.display = "none";
            tip.textContent = this._opts.followText;
            mask.appendChild(tip);
            this._followDiv = tip;
        }
    };

    BMapGLLib.RectangleZoom.prototype._updateRectStyle = function() {
        if (!this._rectDiv) {
            return;
        }
        var st = this._rectDiv.style;
        st.border = this._opts.strokeWeight + "px " + this._opts.style + " " + this._opts.strokeColor;
        st.background = this._opts.fillColor;
        st.opacity = String(this._opts.opacity);
    };

    BMapGLLib.RectangleZoom.prototype._show = function() {
        this._ensureMask();
        this._mask.style.display = "block";
        this.setCursor(this._opts.cursor);
    };

    BMapGLLib.RectangleZoom.prototype._hide = function() {
        if (this._mask) {
            this._mask.style.display = "none";
        }
        if (this._followDiv) {
            this._followDiv.style.display = "none";
        }
    };

    BMapGLLib.RectangleZoom.prototype._bind = function() {
        this._ensureMask();
        var me = this;
        var mask = this._mask;

        var stopAndPrevent = function(e) {
            e = e || window.event;
            if (e.preventDefault) {
                e.preventDefault();
            }
            if (e.stopPropagation) {
                e.stopPropagation();
            } else {
                e.cancelBubble = true;
            }
            return false;
        };

        var getContainerPoint = function(evt) {
            var rect = me._map.getContainer().getBoundingClientRect();
            return {
                x: (evt.clientX - rect.left),
                y: (evt.clientY - rect.top)
            };
        };

        var onMouseMove = function(e) {
            if (!me._isOpen || !me._followDiv) {
                return;
            }
            if (me._isZooming) {
                me._followDiv.style.display = "none";
                return;
            }
            var pt = getContainerPoint(e);
            me._followDiv.style.left = (pt.x + 14) + "px";
            me._followDiv.style.top = (pt.y + 16) + "px";
            me._followDiv.style.display = "block";
        };

        var onMouseDown = function(e) {
            if (!me._isOpen) {
                return;
            }
            e = e || window.event;
            if (e.button !== 0) {
                return;
            }

            me._isZooming = true;
            me._startClient = {x: e.clientX, y: e.clientY};
            me._start = getContainerPoint(e);

            if (!me._rectDiv) {
                var div = document.createElement("div");
                div.style.position = "absolute";
                div.style.zIndex = "1002";
                div.style.left = me._start.x + "px";
                div.style.top = me._start.y + "px";
                div.style.width = "0";
                div.style.height = "0";
                div.style.fontSize = "0";
                mask.appendChild(div);
                me._rectDiv = div;
                me._updateRectStyle();
            } else {
                me._rectDiv.style.left = me._start.x + "px";
                me._rectDiv.style.top = me._start.y + "px";
                me._rectDiv.style.right = "auto";
                me._rectDiv.style.bottom = "auto";
                me._rectDiv.style.width = "0";
                me._rectDiv.style.height = "0";
                me._rectDiv.style.display = "block";
            }

            document.addEventListener("mousemove", onDrawing, true);
            document.addEventListener("mouseup", onMouseUp, true);
            return stopAndPrevent(e);
        };

        var onDrawing = function(e) {
            if (!me._isOpen || !me._isZooming || !me._rectDiv) {
                return;
            }
            e = e || window.event;
            var cur = {x: e.clientX, y: e.clientY};
            var dx = cur.x - me._startClient.x;
            var dy = cur.y - me._startClient.y;

            var containerSize = me._map.getSize();
            var w = Math.abs(dx) - me._opts.strokeWeight;
            var h = Math.abs(dy) - me._opts.strokeWeight;
            w = w < 0 ? 0 : w;
            h = h < 0 ? 0 : h;

            // 约束到地图容器范围内
            if (dx >= 0) {
                me._rectDiv.style.right = "auto";
                me._rectDiv.style.left = me._start.x + "px";
                if (me._start.x + dx >= containerSize.width - 2 * me._opts.strokeWeight) {
                    w = containerSize.width - me._start.x - 2 * me._opts.strokeWeight;
                }
            } else {
                me._rectDiv.style.left = "auto";
                me._rectDiv.style.right = (containerSize.width - me._start.x) + "px";
                if (me._start.x + dx <= 2 * me._opts.strokeWeight) {
                    w = me._start.x - 2 * me._opts.strokeWeight;
                }
            }

            if (dy >= 0) {
                me._rectDiv.style.bottom = "auto";
                me._rectDiv.style.top = me._start.y + "px";
                if (me._start.y + dy >= containerSize.height - 2 * me._opts.strokeWeight) {
                    h = containerSize.height - me._start.y - 2 * me._opts.strokeWeight;
                }
            } else {
                me._rectDiv.style.top = "auto";
                me._rectDiv.style.bottom = (containerSize.height - me._start.y) + "px";
                if (me._start.y + dy <= 2 * me._opts.strokeWeight) {
                    h = me._start.y - 2 * me._opts.strokeWeight;
                }
            }

            me._rectDiv.style.width = (w < 0 ? 0 : w) + "px";
            me._rectDiv.style.height = (h < 0 ? 0 : h) + "px";
            return stopAndPrevent(e);
        };

        var clampZoom = function(z) {
            var min = (typeof me._map.getMinZoom === "function") ? me._map.getMinZoom() : 3;
            var max = (typeof me._map.getMaxZoom === "function") ? me._map.getMaxZoom() : 21;
            if (z < min) return min;
            if (z > max) return max;
            return z;
        };

        var onMouseUp = function(e) {
            if (!me._isOpen) {
                return;
            }
            document.removeEventListener("mousemove", onDrawing, true);
            document.removeEventListener("mouseup", onMouseUp, true);

            e = e || window.event;
            if (!me._rectDiv) {
                me._isZooming = false;
                return;
            }

            var left = parseFloat(me._rectDiv.style.left);
            var top = parseFloat(me._rectDiv.style.top);
            var width = parseFloat(me._rectDiv.style.width);
            var height = parseFloat(me._rectDiv.style.height);

            var containerSize = me._map.getSize();
            if (isNaN(left)) {
                var right = parseFloat(me._rectDiv.style.right);
                left = containerSize.width - right - width;
            }
            if (isNaN(top)) {
                var bottom = parseFloat(me._rectDiv.style.bottom);
                top = containerSize.height - bottom - height;
            }

            me._rectDiv.style.display = "none";
            me._isZooming = false;

            // 过小的框不触发缩放
            if (!width || !height || width < 3 || height < 3) {
                return stopAndPrevent(e);
            }

            var centerX = left + width / 2;
            var centerY = top + height / 2;

            var ratio = Math.min(containerSize.width / (width + me._opts.strokeWeight), containerSize.height / (height + me._opts.strokeWeight));
            ratio = Math.floor(ratio);

            var targetZoomLv;
            if (!isNaN(ratio) && ratio > 0) {
                var delta = Math.log(ratio) / Math.log(2);
                targetZoomLv = Math.round(me._map.getZoom() + delta);
                if (targetZoomLv < me._map.getZoom()) {
                    targetZoomLv = me._map.getZoom();
                }
            } else {
                targetZoomLv = me._map.getZoom() + 1;
            }
            targetZoomLv = clampZoom(targetZoomLv);

            var px1 = new BMapGL.Pixel(left, top);
            var px2 = new BMapGL.Pixel(left + width, top + height);
            var pt1 = me._map.pixelToPoint(px1);
            var pt2 = me._map.pixelToPoint(px2);
            var bounds = new BMapGL.Bounds(pt1, pt2);

            var targetCenterPt = me._map.pixelToPoint(new BMapGL.Pixel(centerX, centerY));
            me._map.centerAndZoom(targetCenterPt, targetZoomLv);

            // 结束后的轮廓渐隐动画（可选）
            me._flashBounds(bounds);

            if (me._opts.autoClose) {
                setTimeout(function() {
                    if (me._isOpen) {
                        me.close();
                    }
                }, 70);
            }
            return stopAndPrevent(e);
        };

        var onContextMenu = function(e) {
            return stopAndPrevent(e);
        };

        mask.addEventListener("mousemove", onMouseMove, false);
        mask.addEventListener("mousedown", onMouseDown, false);
        mask.addEventListener("contextmenu", onContextMenu, false);
    };

    BMapGLLib.RectangleZoom.prototype._flashBounds = function(bounds) {
        if (!bounds) return;
        if (typeof BMapGL.Polygon !== "function") return;

        var sw = bounds.getSouthWest();
        var ne = bounds.getNorthEast();
        var se = new BMapGL.Point(ne.lng, sw.lat);
        var nw = new BMapGL.Point(sw.lng, ne.lat);

        var poly = new BMapGL.Polygon([sw, nw, ne, se], {
            strokeColor: this._opts.strokeColor,
            strokeWeight: 2,
            strokeOpacity: 0.3,
            fillColor: "",
            fillOpacity: 0
        });
        this._map.addOverlay(poly);

        var me = this;
        setTimeout(function() {
            var start = Date.now();
            var duration = 240;
            var timer = setInterval(function() {
                var t = (Date.now() - start) / duration;
                if (t >= 1) {
                    clearInterval(timer);
                    me._map.removeOverlay(poly);
                    poly = null;
                    return;
                }
                var opacity = 0.3 * (1 - t);
                poly && poly.setStrokeOpacity && poly.setStrokeOpacity(opacity);
            }, 1000 / 20);
        }, 500);
    };

    /**
     * 开启拉框缩放状态
     * @return {Boolean} true 表示开启成功，false 表示失败（已有其他工具占用）
     */
    BMapGLLib.RectangleZoom.prototype.open = function() {
        if (this._isOpen === true) {
            return true;
        }
        if (BMapGLLib._toolInUse) {
            return false;
        }
        BMapGLLib._toolInUse = true;
        this._isOpen = true;

        if (!this._binded) {
            this._bind();
            this._binded = true;
        }

        this._preCursor = this._map.getDefaultCursor && this._map.getDefaultCursor();
        this._show();
        return true;
    };

    /**
     * 关闭拉框缩放状态
     */
    BMapGLLib.RectangleZoom.prototype.close = function() {
        if (!this._isOpen) {
            return;
        }
        this._isOpen = false;
        BMapGLLib._toolInUse = false;
        this._hide();
        if (this._rectDiv) {
            this._rectDiv.style.display = "none";
        }
        if (this._map && this._map.setDefaultCursor) {
            this._map.setDefaultCursor(this._preCursor || "default");
        }
    };
})();


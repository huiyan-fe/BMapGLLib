/**
 * @fileoverview 百度地图GL的添加标注工具类，对外开放。
 * 允许用户在地图上点击后添加一个点标注，允许用户设定标注的图标样式，
 * 允许用户自定义信息窗内容。
 * 主入口类是<a href="symbols/BMapGLLib.MarkerTool.html">MarkerTool</a>，
 * 基于Baidu Map API GL 1.0。
 *
 * @author Baidu Map Api Group
 * @version 1.0
 */

/**
 * @namespace BMapGL的所有library类均放在BMapGLLib命名空间下
 */
var BMapGLLib = window.BMapGLLib = BMapGLLib || {};

if (typeof BMapGLLib._toolInUse == "undefined") {
    BMapGLLib._toolInUse = false; // 该工具是否在使用，避免多个鼠标工具同时使用
}

(function() {
    /**
     * 声明baidu包
     */
    var baidu = baidu || {guid: "$BAIDU$"};
    (function() {
        window[baidu.guid] = {};

        baidu.extend = function (target, source) {
            for (var p in source) {
                if (source.hasOwnProperty(p)) {
                    target[p] = source[p];
                }
            }
            return target;
        };

        baidu.lang = baidu.lang || {};

        baidu.lang.guid = function() {
            return "TANGRAM__" + (window[baidu.guid]._counter ++).toString(36);
        };

        window[baidu.guid]._counter = window[baidu.guid]._counter || 1;
        window[baidu.guid]._instances = window[baidu.guid]._instances || {};

        baidu.lang.Class = function(guid) {
            this.guid = guid || baidu.lang.guid();
            window[baidu.guid]._instances[this.guid] = this;
        };

        baidu.lang.isString = function (source) {
            return '[object String]' == Object.prototype.toString.call(source);
        };

        baidu.lang.isFunction = function (source) {
            return '[object Function]' == Object.prototype.toString.call(source);
        };

        baidu.lang.Class.prototype.toString = function() {
            return "[object " + (this._className || "Object") + "]";
        };

        baidu.lang.Class.prototype.dispose = function() {
            delete window[baidu.guid]._instances[this.guid];
            for (var property in this) {
                if (!baidu.lang.isFunction(this[property])) {
                    delete this[property];
                }
            }
            this.disposed = true;
        };

        baidu.lang.Event = function (type, target) {
            this.type = type;
            this.returnValue = true;
            this.target = target || null;
            this.currentTarget = null;
        };

        baidu.lang.Class.prototype.addEventListener = function (type, handler, key) {
            if (!baidu.lang.isFunction(handler)) {
                return;
            }
            !this.__listeners && (this.__listeners = {});
            var t = this.__listeners, id;
            if (typeof key == "string" && key) {
                if (/[^\w\-]/.test(key)) {
                    throw("nonstandard key:" + key);
                } else {
                    handler.hashCode = key;
                    id = key;
                }
            }
            type.indexOf("on") != 0 && (type = "on" + type);
            typeof t[type] != "object" && (t[type] = {});
            id = id || baidu.lang.guid();
            handler.hashCode = id;
            t[type][id] = handler;
        };

        baidu.lang.Class.prototype.removeEventListener = function (type, handler) {
            if (baidu.lang.isFunction(handler)) {
                handler = handler.hashCode;
            } else if (!baidu.lang.isString(handler)) {
                return;
            }
            !this.__listeners && (this.__listeners = {});
            type.indexOf("on") != 0 && (type = "on" + type);
            var t = this.__listeners;
            if (!t[type]) {
                return;
            }
            t[type][handler] && delete t[type][handler];
        };

        baidu.lang.Class.prototype.dispatchEvent = function (event, options) {
            if (baidu.lang.isString(event)) {
                event = new baidu.lang.Event(event);
            }
            !this.__listeners && (this.__listeners = {});
            options = options || {};
            for (var i in options) {
                event[i] = options[i];
            }
            var i, t = this.__listeners, p = event.type;
            event.target = event.target || this;
            event.currentTarget = this;
            p.indexOf("on") != 0 && (p = "on" + p);
            baidu.lang.isFunction(this[p]) && this[p].apply(this, arguments);
            if (typeof t[p] == "object") {
                for (i in t[p]) {
                    t[p][i].apply(this, arguments);
                }
            }
            return event.returnValue;
        };

        baidu.lang.inherits = function (subClass, superClass, className) {
            var key, proto,
                selfProps = subClass.prototype,
                clazz = new Function();
            clazz.prototype = superClass.prototype;
            proto = subClass.prototype = new clazz();
            for (key in selfProps) {
                proto[key] = selfProps[key];
            }
            subClass.prototype.constructor = subClass;
            subClass.superClass = superClass.prototype;
            if ("string" == typeof className) {
                proto._className = className;
            }
        };
    })();

    /**
     * MarkerTool代码部分，此类继承基类baidu.lang.Class，便于派发自定义事件
     * @exports MarkerTool as BMapGLLib.MarkerTool
     */
    var MarkerTool =
    /**
     * MarkerTool类的构造函数
     * @class 地图上添加标注类，实现点击地图添加点标注<b>入口</b>。
     * 实例化该类后，即可调用该类提供的<a href="symbols/BMapGLLib.MarkerTool.html#open">open</a>
     * 方法开启添加点标注状态。
     *
     * @constructor
     * @param {Map} map BMapGL地图实例对象
     * @param {Object} opts 可选的输入参数，非必填项。可输入选项包括：
     * <br />"<b>icon</b>" : {BMapGL.Icon} 标注使用的图标，同时作为工具激活时的鼠标光标样式
     * <br />"<b>autoClose</b>" : {Boolean} 是否在每次添加完Marker后自动关闭工具，默认为true
     *
     * @example <b>参考示例：</b><br />
     * var map = new BMapGL.Map("container");<br />
     * map.centerAndZoom(new BMapGL.Point(116.404, 39.915), 15);<br />
     * var mkrTool = new BMapGLLib.MarkerTool(map, {autoClose: false});
     */
    BMapGLLib.MarkerTool = function(map, opts) {
        baidu.lang.Class.call(this);
        this._map = map;
        this._opts = {
            icon: null,              // 默认使用BMapGL默认marker样式，有值时也用作鼠标光标
            autoClose: true          // 添加完标注后是否自动关闭工具
        };

        baidu.extend(this._opts, opts || {});

        this._isOpen = false;
        this._binded = false;
        this._clickHandler = null;
    };

    baidu.lang.inherits(MarkerTool, baidu.lang.Class, "MarkerTool");

    /**
     * 开启工具
     * @return {Boolean} true表示开启成功，false表示开启失败
     */
    MarkerTool.prototype.open = function() {
        if (!this._map) {
            return false;
        }
        if (this._isOpen == true) {
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

        this._preCursor = this._map.getDefaultCursor();
        this._updateCursor();

        return true;
    };

    /**
     * 关闭工具
     */
    MarkerTool.prototype.close = function() {
        if (!this._isOpen) {
            return;
        }

        if (this._clickHandler) {
            this._map.removeEventListener("click", this._clickHandler);
        }

        this._map.setDefaultCursor(this._preCursor || "default");
        BMapGLLib._toolInUse = false;
        this._isOpen = false;
        this._binded = false;
    };

    /**
     * 设置标注的图标及鼠标跟随样式
     * @param {BMapGL.Icon} icon 标注图标
     */
    MarkerTool.prototype.setIcon = function(icon) {
        if (!icon || !(icon instanceof BMapGL.Icon)) {
            return;
        }
        this._opts.icon = icon;
        if (this._isOpen) {
            this._updateCursor();
        }
    };

    /**
     * 根据当前图标更新地图鼠标光标样式
     * 有图标时用图标图片作为光标，否则降级为 crosshair
     * @private
     */
    MarkerTool.prototype._updateCursor = function() {
        var icon = this._opts.icon;
        if (icon && icon.imageUrl) {
            var anchor = icon.anchor || {width: 0, height: 0};
            this._map.setDefaultCursor(
                'url("' + icon.imageUrl + '") ' + anchor.width + ' ' + anchor.height + ', auto'
            );
        } else {
            this._map.setDefaultCursor('crosshair');
        }
    };

    /**
     * 获取当前标注图标
     * @return {BMapGL.Icon} 当前标注图标
     */
    MarkerTool.prototype.getIcon = function() {
        return this._opts.icon;
    };

    /**
     * 绑定地图的 click 事件
     * @private
     */
    MarkerTool.prototype._bind = function() {
        var me = this;

        me._clickHandler = function(evt) {
            var pt = evt.latlng || evt.point;
            if (!pt) {
                return;
            }

            var markerOpts = {};
            if (me._opts.icon) {
                markerOpts.icon = me._opts.icon;
            }
            var mkr = new BMapGL.Marker(pt, markerOpts);
            me._map.addOverlay(mkr);

            /**
             * 每次点击地图添加完标注时，派发markend事件
             * @name MarkerTool#onmarkend
             * @event
             * @param {Object} e 回调函数返回的event参数，包含：
             * <br />"<b>type</b>" : {String} 事件类型
             * <br />"<b>target</b>" : {MarkerTool} 当前MarkerTool对象
             * <br />"<b>marker</b>" : {BMapGL.Marker} 当前添加的Marker标注
             * <br />"<b>point</b>" : {BMapGL.Point} 标注所在位置
             *
             * @example <b>参考示例：</b><br />
             * mkrTool.addEventListener("markend", function(e) { console.log(e.marker, e.point); });
             */
            var event = new baidu.lang.Event("onmarkend");
            event.marker = mkr;
            event.point = pt;
            me.dispatchEvent(event);

            if (me._opts.autoClose) {
                me.close();
            }
        };
        me._map.addEventListener("click", me._clickHandler);
    };

})();

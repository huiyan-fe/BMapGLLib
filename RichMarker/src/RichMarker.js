/**
 * @fileoverview 百度地图的富Marker类，对外开放。
 * 允许用户在自定义丰富的Marker展现，并添加点击、双击、拖拽等事件。
 * 基于Baidu Map API GL 1.0。
 *
 * @author Baidu Map Api Group 
 * @version 1.0
 */
/** 
 * @namespace BMapGL的所有library类均放在BMapGLLib命名空间下
 */
var BMapGLLib = window.BMapGLLib = BMapGLLib || {};

(function () {
    /**
     * 声明baidu包
     */
    var baidu = baidu || {
        guid: "$BAIDU$"
    };

    (function () {
        // 一些页面级别唯一的属性，需要挂载在window[baidu.guid]上
        window[baidu.guid] = {};

        /**
         * 将源对象的所有属性拷贝到目标对象中
         * @name baidu.extend
         * @function
         * @grammar baidu.extend(target, source)
         * @param {Object} target 目标对象
         * @param {Object} source 源对象
         * @returns {Object} 目标对象
         */
        baidu.extend = function (target, source) {
            for (var p in source) {
                if (source.hasOwnProperty(p)) {
                    target[p] = source[p];
                }
            }
            return target;
        };

        /**
         * @ignore
         * @namespace
         * @baidu.lang 对语言层面的封装，包括类型判断、模块扩展、继承基类以及对象自定义事件的支持。
         * @property guid 对象的唯一标识
         */
        baidu.lang = baidu.lang || {};

        /**
         * 返回一个当前页面的唯一标识字符串。
         * @function
         * @grammar baidu.lang.guid()
         * @returns {String} 当前页面的唯一标识字符串
         */
        baidu.lang.guid = function () {
            return "TANGRAM__" + (window[baidu.guid]._counter++).toString(36);
        };

        window[baidu.guid]._counter = window[baidu.guid]._counter || 1;

        /**
         * 所有类的实例的容器
         * key为每个实例的guid
         */
        window[baidu.guid]._instances = window[baidu.guid]._instances || {};

        /**
         * Tangram继承机制提供的一个基类，用户可以通过继承baidu.lang.Class来获取它的属性及方法。
         * @function
         * @name baidu.lang.Class
         * @grammar baidu.lang.Class(guid)
         * @param {string} guid	对象的唯一标识
         * @meta standard
         * @remark baidu.lang.Class和它的子类的实例均包含一个全局唯一的标识guid。
         * guid是在构造函数中生成的，因此，继承自baidu.lang.Class的类应该直接或者间接调用它的构造函数。<br>
         * baidu.lang.Class的构造函数中产生guid的方式可以保证guid的唯一性，及每个实例都有一个全局唯一的guid。
         */
        baidu.lang.Class = function (guid) {
            this.guid = guid || baidu.lang.guid();
            window[baidu.guid]._instances[this.guid] = this;
        };

        window[baidu.guid]._instances = window[baidu.guid]._instances || {};

        /**
         * 判断目标参数是否string类型或String对象
         * @name baidu.lang.isString
         * @function
         * @grammar baidu.lang.isString(source)
         * @param {Any} source 目标参数
         * @shortcut isString
         * @meta standard
         *             
         * @returns {boolean} 类型判断结果
         */
        baidu.lang.isString = function (source) {
            return '[object String]' == Object.prototype.toString.call(source);
        };
        baidu.isString = baidu.lang.isString;

        /**
         * 判断目标参数是否为function或Function实例
         * @name baidu.lang.isFunction
         * @function
         * @grammar baidu.lang.isFunction(source)
         * @param {Any} source 目标参数
         * @returns {boolean} 类型判断结果
         */
        baidu.lang.isFunction = function (source) {
            return '[object Function]' == Object.prototype.toString.call(source);
        };

        /**
         * 自定义的事件对象。
         * @function
         * @name baidu.lang.Event
         * @grammar baidu.lang.Event(type[, target])
         * @param {string} type	 事件类型名称。为了方便区分事件和一个普通的方法，事件类型名称必须以"on"(小写)开头。
         * @param {Object} [target]触发事件的对象
         * @meta standard
         * @remark 引入该模块，会自动为Class引入3个事件扩展方法：addEventListener、removeEventListener和dispatchEvent。
         * @see baidu.lang.Class
         */
        baidu.lang.Event = function (type, target) {
            this.type = type;
            this.returnValue = true;
            this.target = target || null;
            this.currentTarget = null;
        };

        /**
         * 注册对象的事件监听器。引入baidu.lang.Event后，Class的子类实例才会获得该方法。
         * @grammar obj.addEventListener(type, handler[, key])
         * @param 	{string}   type         自定义事件的名称
         * @param 	{Function} handler      自定义事件被触发时应该调用的回调函数
         * @param 	{string}   [key]		为事件监听函数指定的名称，可在移除时使用。如果不提供，方法会默认为它生成一个全局唯一的key。
         * @remark 	事件类型区分大小写。如果自定义事件名称不是以小写"on"开头，该方法会给它加上"on"再进行判断，即"click"和"onclick"会被认为是同一种事件。 
         */
        baidu.lang.Class.prototype.addEventListener = function (type, handler, key) {
            if (!baidu.lang.isFunction(handler)) {
                return;
            }!this.__listeners && (this.__listeners = {});
            var t = this.__listeners,
                id;
            if (typeof key == "string" && key) {
                if (/[^\w\-]/.test(key)) {
                    throw ("nonstandard key:" + key);
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

        /**
         * 移除对象的事件监听器。引入baidu.lang.Event后，Class的子类实例才会获得该方法。
         * @grammar obj.removeEventListener(type, handler)
         * @param {string}   type     事件类型
         * @param {Function|string} handler  要移除的事件监听函数或者监听函数的key
         * @remark 	如果第二个参数handler没有被绑定到对应的自定义事件中，什么也不做。
         */
        baidu.lang.Class.prototype.removeEventListener = function (type, handler) {
            if (baidu.lang.isFunction(handler)) {
                handler = handler.hashCode;
            } else if (!baidu.lang.isString(handler)) {
                return;
            }!this.__listeners && (this.__listeners = {});
            type.indexOf("on") != 0 && (type = "on" + type);
            var t = this.__listeners;
            if (!t[type]) {
                return;
            }
            t[type][handler] && delete t[type][handler];
        };

        /**
         * 派发自定义事件，使得绑定到自定义事件上面的函数都会被执行。引入baidu.lang.Event后，Class的子类实例才会获得该方法。
         * @grammar obj.dispatchEvent(event, options)
         * @param {baidu.lang.Event|String} event 	Event对象，或事件名称(1.1.1起支持)
         * @param {Object} options 扩展参数,所含属性键值会扩展到Event对象上(1.2起支持)
         * @remark 处理会调用通过addEventListenr绑定的自定义事件回调函数之外，还会调用直接绑定到对象上面的自定义事件。
         * 例如：<br>
         * myobj.onMyEvent = function(){}<br>
         * myobj.addEventListener("onMyEvent", function(){});
         */
        baidu.lang.Class.prototype.dispatchEvent = function (event, options) {
            if (baidu.lang.isString(event)) {
                event = new baidu.lang.Event(event);
            }!this.__listeners && (this.__listeners = {});
            options = options || {};
            for (var i in options) {
                event[i] = options[i];
            }
            var i, t = this.__listeners,
                p = event.type;
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

        /**
         * @ignore
         * @namespace baidu.dom 
         * 操作dom的方法
         */
        baidu.dom = baidu.dom || {};

        /**
         * 从文档中获取指定的DOM元素
         * **内部方法**
         * 
         * @param {string|HTMLElement} id 元素的id或DOM元素
         * @meta standard
         * @return {HTMLElement} DOM元素，如果不存在，返回null，如果参数不合法，直接返回参数
         */
        baidu.dom._g = function (id) {
            if (baidu.lang.isString(id)) {
                return document.getElementById(id);
            }
            return id;
        };
        baidu._g = baidu.dom._g;

        /**
         * @ignore
         * @namespace baidu.event 屏蔽浏览器差异性的事件封装。
         * @property target 	事件的触发元素
         * @property pageX 		鼠标事件的鼠标x坐标
         * @property pageY 		鼠标事件的鼠标y坐标
         * @property keyCode 	键盘事件的键值
         */
        baidu.event = baidu.event || {};

        /**
         * 事件监听器的存储表
         * @private
         * @meta standard
         */
        baidu.event._listeners = baidu.event._listeners || [];

        /**
         * 为目标元素添加事件监听器
         * @name baidu.event.on
         * @function
         * @grammar baidu.event.on(element, type, listener)
         * @param {HTMLElement|string|window} element 目标元素或目标元素id
         * @param {string} type 事件类型
         * @param {Function} listener 需要添加的监听器
         * @remark
         * 
        1. 不支持跨浏览器的鼠标滚轮事件监听器添加<br>
        2. 改方法不为监听器灌入事件对象，以防止跨iframe事件挂载的事件对象获取失败
            
         * @shortcut on
         * @meta standard
         * @see baidu.event.un
         * @returns {HTMLElement|window} 目标元素
         */
        baidu.event.on = function (element, type, listener) {
            type = type.replace(/^on/i, '');
            element = baidu.dom._g(element);

            var realListener = function (ev) {
                    listener.call(element, ev);
                },
                lis = baidu.event._listeners,
                filter = baidu.event._eventFilter,
                afterFilter, realType = type;
            type = type.toLowerCase();
            if (filter && filter[type]) {
                afterFilter = filter[type](element, type, realListener);
                realType = afterFilter.type;
                realListener = afterFilter.listener;
            }
            if (element.addEventListener) {
                element.addEventListener(realType, realListener, false);
            } else if (element.attachEvent) {
                element.attachEvent('on' + realType, realListener);
            }
            lis[lis.length] = [element, type, listener, realListener, realType];
            return element;
        };
        baidu.on = baidu.event.on;

        /**
         * 为目标元素移除事件监听器
         * @name baidu.event.un
         * @function
         * @grammar baidu.event.un(element, type, listener)
         * @param {HTMLElement|string|window} element 目标元素或目标元素id
         * @param {string} type 事件类型
         * @param {Function} listener 需要移除的监听器
         * @shortcut un
         * @meta standard
         * @see baidu.event.on
         *             
         * @returns {HTMLElement|window} 目标元素
         */
        baidu.event.un = function (element, type, listener) {
            element = baidu.dom._g(element);
            type = type.replace(/^on/i, '').toLowerCase();

            var lis = baidu.event._listeners,
                len = lis.length,
                isRemoveAll = !listener,
                item, realType, realListener;
            while (len--) {
                item = lis[len];
                if (item[1] === type && item[0] === element && (isRemoveAll || item[2] === listener)) {
                    realType = item[4];
                    realListener = item[3];
                    if (element.removeEventListener) {
                        element.removeEventListener(realType, realListener, false);
                    } else if (element.detachEvent) {
                        element.detachEvent('on' + realType, realListener);
                    }
                    lis.splice(len, 1);
                }
            }

            return element;
        };
        baidu.un = baidu.event.un;

        /**
         * 阻止事件的默认行为
         * @name baidu.event.preventDefault
         * @function
         * @grammar baidu.event.preventDefault(event)
         * @param {Event} event 事件对象
         * @meta standard
         */
        baidu.preventDefault = baidu.event.preventDefault = function (event) {
            if (event.preventDefault) {
                event.preventDefault();
            } else {
                event.returnValue = false;
            }
        };
    })();

    /** 
     * @exports RichMarker as BMapGLLib.RichMarker 
     */
    var RichMarker =
    /**
     * RichMarker类的构造函数
     * @class 富Marker定义类，实现丰富的Marker展现效果。
     * 
     * @constructor
     * @param {String | HTMLElement} content 用户自定义的Marker内容，可以是字符串，也可以是dom节点
     * @param {BMapGL.Point} position marker的位置
     * @param {Json} RichMarkerOptions 可选的输入参数，非必填项。可输入选项包括：<br />
     * {"<b>anchor</b>" : {BMapGL.Size} Marker的的位置偏移值,
     * <br />"<b>enableDragging</b>" : {Boolean} 是否启用拖拽，默认为false}
     *
     * @example <b>参考示例：</b>
     * var map = new BMapGL.Map("container");
     * map.centerAndZoom(new BMapGL.Point(116.309965, 40.058333), 17);
     * var htm = "&lt;div style='background:#E7F0F5;color:#0082CB;border:1px solid #333'&gt;"
     *              +     "欢迎使用百度地图！"
     *              +     "&lt;img src='http://map.baidu.com/img/logo-map.gif' border='0' /&gt;"
     *              + "&lt;/div&gt;";
     * var point = new BMapGL.Point(116.30816, 40.056863);
     * var myRichMarkerObject = new BMapGLLib.RichMarker(htm, point, {"anchor": new BMapGL.Size(-72, -84), "enableDragging": true});
     * map.addOverlay(myRichMarkerObject);
     */
    BMapGLLib.RichMarker = function (content, position, opts) {
            if (!content || !position || !(position instanceof BMapGL.Point)) {
                return;
            }

            /**
             * map对象
             * @private
             * @type {Map}
             */
            this._map = null;

            /**
             * Marker内容
             * @private
             * @type {String | HTMLElement}
             */
            this._content = content;

            /**
             * marker显示位置
             * @private
             * @type {BMapGL.Point}
             */
            this._position = position;

            /**
             * marker主容器
             * @private
             * @type {HTMLElement}
             */
            this._container = null;

            /**
             * marker主容器的尺寸
             * @private
             * @type {BMapGL.Size}
             */
            this._size = null;

            opts = opts || {};
            /**
             * _opts是默认参数赋值。
             * 下面通过用户输入的opts，对默认参数赋值
             * @private
             * @type {Json}
             */
            this._opts = baidu.extend(
            baidu.extend(this._opts || {}, {

                /**
                 * Marker是否可以拖拽
                 * @private
                 * @type {Boolean}
                 */
                enableDragging: false,

                /**
                 * Marker的偏移量
                 * @private
                 * @type {BMapGL.Size}
                 */
                anchor: new BMapGL.Size(0, 0)
            }), opts);
        }

        // 继承覆盖物类
        RichMarker.prototype = new BMapGL.Overlay();

    /**
     * 初始化，实现自定义覆盖物的initialize方法
     * 主要生成Marker的主容器，填充自定义的内容，并附加事件
     * 
     * @private
     * @param {BMapGL} map map实例对象
     * @return {Dom} 返回自定义生成的dom节点
     */
    RichMarker.prototype.initialize = function (map) {
        var me = this,
            div = me._container = document.createElement("div");
        me._map = map;
        baidu.extend(div.style, {
            position: "absolute",
            zIndex: BMapGL.Overlay.getZIndex(me._position.lat),
            background: "#FFF",
            cursor: "pointer"
        });
        map.getPanes().labelPane.appendChild(div);

        // 给主容器添加上用户自定义的内容
        me._appendContent();
        // 给主容器添加事件处理
        me._setEventDispath();
        // 获取主容器的高宽
        me._getContainerSize();

        return div;
    }

    /**
     * 为自定义的Marker设定显示位置，实现自定义覆盖物的draw方法
     * 
     * @private
     */
    RichMarker.prototype.draw = function () {
        var map = this._map,
            anchor = this._opts.anchor,
            pixel = map.pointToOverlayPixel(this._position);
        this._container.style.left = pixel.x + anchor.width + "px";
        this._container.style.top = pixel.y + anchor.height + "px";
    }

    /**
     * 设置Marker可以拖拽
     * @return 无返回值
     * 
     * @example <b>参考示例：</b>
     * myRichMarkerObject.enableDragging();
     */
    RichMarker.prototype.enableDragging = function () {
        this._opts.enableDragging = true;
    }

    /**
     * 设置Marker不能拖拽
     * @return 无返回值
     * 
     * @example <b>参考示例：</b>
     * myRichMarkerObject.disableDragging();
     */
    RichMarker.prototype.disableDragging = function () {
        this._opts.enableDragging = false;
    }

    /**
     * 获取Marker是否能被拖拽的状态
     * @return {Boolean} true为可以拖拽，false为不能被拖拽
     * 
     * @example <b>参考示例：</b>
     * myRichMarkerObject.isDraggable();
     */
    RichMarker.prototype.isDraggable = function () {
        return this._opts.enableDragging;
    }

    /**
     * 获取Marker的显示位置
     * @return {BMapGL.Point} 显示的位置
     * 
     * @example <b>参考示例：</b>
     * myRichMarkerObject.getPosition();
     */
    RichMarker.prototype.getPosition = function () {
        return this._position;
    }

    /**
     * 设置Marker的显示位置
     * @param {BMapGL.Point} position 需要设置的位置
     * @return 无返回值
     * 
     * @example <b>参考示例：</b>
     * myRichMarkerObject.setPosition(new BMapGL.Point(116.30816, 40.056863));
     */
    RichMarker.prototype.setPosition = function (position) {
        if (!position instanceof BMapGL.Point) {
            return;
        }
        this._position = position;
        this.draw();
    }

    /**
     * 获取Marker的偏移量
     * @return {BMapGL.Size} Marker的偏移量
     * 
     * @example <b>参考示例：</b>
     * myRichMarkerObject.getAnchor();
     */
    RichMarker.prototype.getAnchor = function () {
        return this._opts.anchor;
    }

    /**
     * 设置Marker的偏移量
     * @param {BMapGL.Size} anchor 需要设置的偏移量
     * @return 无返回值
     * 
     * @example <b>参考示例：</b>
     * myRichMarkerObject.setAnchor(new BMapGL.Size(-72, -84));
     */
    RichMarker.prototype.setAnchor = function (anchor) {
        if (!anchor instanceof BMapGL.Size) {
            return;
        }
        this._opts.anchor = anchor;
        this.draw();
    }

    /**
     * 添加用户的自定义的内容
     * 
     * @private
     * @return 无返回值
     */
    RichMarker.prototype._appendContent = function () {
        var content = this._content;
        // 用户输入的内容是字符串，需要转化成dom节点
        if (typeof content == "string") {
            var div = document.createElement('DIV');
            div.innerHTML = content;
            if (div.childNodes.length == 1) {
                content = (div.removeChild(div.firstChild));
            } else {
                var fragment = document.createDocumentFragment();
                while (div.firstChild) {
                    fragment.appendChild(div.firstChild);
                }
                content = fragment;
            }
        }
        this._container.innerHTML = "";
        this._container.appendChild(content);
    }

    /**
     * 获取Marker的内容
     * @return {String | HTMLElement} 当前内容
     * 
     * @example <b>参考示例：</b>
     * myRichMarkerObject.getContent();
     */
    RichMarker.prototype.getContent = function () {
        return this._content;
    }

    /**
     * 设置Marker的内容
     * @param {String | HTMLElement} content 需要设置的内容
     * @return 无返回值
     * 
     * @example <b>参考示例：</b>
     * var htm = "&lt;div style='background:#E7F0F5;color:#0082CB;border:1px solid #333'&gt;"
     *              +     "欢迎使用百度地图API！"
     *              +     "&lt;img src='http://map.baidu.com/img/logo-map.gif' border='0' /&gt;"
     *              + "&lt;/div&gt;";
     * myRichMarkerObject.setContent(htm);
     */
    RichMarker.prototype.setContent = function (content) {
        if (!content) {
            return;
        }
        // 存储用户输入的Marker显示内容
        this._content = content;
        // 添加进主容器
        this._appendContent();
    }

    /**
     * 获取Marker的高宽
     * 
     * @private
     * @return {BMapGL.Size} 当前高宽
     */
    RichMarker.prototype._getContainerSize = function () {
        if (!this._container) {
            return;
        }
        var h = this._container.offsetHeight;
        var w = this._container.offsetWidth;
        this._size = new BMapGL.Size(w, h);
    }

    /**
     * 获取Marker的宽度
     * @return {Number} 当前宽度
     * 
     * @example <b>参考示例：</b>
     * myRichMarkerObject.getWidth();
     */
    RichMarker.prototype.getWidth = function () {
        if (!this._size) {
            return;
        }
        return this._size.width;
    }

    /**
     * 设置Marker的宽度
     * @param {Number} width 需要设置的宽度
     * @return 无返回值
     * 
     * @example <b>参考示例：</b>
     * myRichMarkerObject.setWidth(300);
     */
    RichMarker.prototype.setWidth = function (width) {
        if (!this._container) {
            return;
        }
        this._container.style.width = width + "px";
        this._getContainerSize();
    }

    /**
     * 获取Marker的高度
     * @return {Number} 当前高度
     * 
     * @example <b>参考示例：</b>
     * myRichMarkerObject.getHeight();
     */
    RichMarker.prototype.getHeight = function () {
        if (!this._size) {
            return;
        }
        return this._size.height;
    }

    /**
     * 设置Marker的高度
     * @param {Number} height 需要设置的高度
     * @return 无返回值
     * 
     * @example <b>参考示例：</b>
     * myRichMarkerObject.setHeight(200);
     */
    RichMarker.prototype.setHeight = function (height) {
        if (!this._container) {
            return;
        }
        this._container.style.height = height + "px";
        this._getContainerSize();
    }

    /**
     * 设置Marker的各种事件
     * 
     * @private
     * @return 无返回值
     */
    RichMarker.prototype._setEventDispath = function () {
        var me = this,
            div = me._container,
            isMouseDown = false,
            // 鼠标是否按下，用以判断鼠标移动过程中的拖拽计算
            startPosition = null; // 拖拽时，鼠标按下的初始位置，拖拽的辅助计算参数   
            
        // 通过e参数获取当前鼠标所在位置
        function _getPositionByEvent(e) {
            var e = window.event || e,
                x = e.pageX || e.clientX || 0,
                y = e.pageY || e.clientY || 0,
                pixel = new BMapGL.Pixel(x, y),
                point = me._map.pixelToPoint(pixel);
            return {
                "pixel": pixel,
                "point": point
            };
        }

        // 单击事件
        baidu.on(div, "onclick", function (e) {
            /**
             * 点击Marker时，派发事件的接口
             * @name RichMarker#onclick
             * @event
             * @param {Event Object} e 回调函数会返回event参数，包括以下返回值：
             * <br />{"<b>target</b> : {BMapGL.Overlay} 触发事件的元素,
             * <br />"<b>type</b>：{String} 事件类型}
             *
             * @example <b>参考示例：</b>
             * myRichMarkerObject.addEventListener("onclick", function(e) { 
             *     alert(e.type);  
             * });
             */
            _dispatchEvent(me, "onclick");
            _stopAndPrevent(e);
        });

        // 单击事件
        baidu.on(div, "ontouchend", function (e) {
            /**
             * 点击Marker时，派发事件的接口
             * @name RichMarker#onclick
             * @event
             * @param {Event Object} e 回调函数会返回event参数，包括以下返回值：
             * <br />{"<b>target</b> : {BMapGL.Overlay} 触发事件的元素,
             * <br />"<b>type</b>：{String} 事件类型}
             *
             * @example <b>参考示例：</b>
             * myRichMarkerObject.addEventListener("onclick", function(e) { 
             *     alert(e.type);  
             * });
             */
             _dispatchEvent(me, "ontouchend");
             _dispatchEvent(me, "onclick");
             _stopAndPrevent(e);
        });
        // 双击事件
        baidu.on(div, "ondblclick", function (e) {
            var position = _getPositionByEvent(e);
            /**
             * 双击Marker时，派发事件的接口
             * @name RichMarker#ondblclick
             * @event
             * @param {Event Object} e 回调函数会返回event参数，包括以下返回值：
             * <br />{"<b>target</b> : {BMapGL.Overlay} 触发事件的元素,
             * <br />"<b>type</b>：{String} 事件类型,
             * <br />"<b>point</b>：{BMapGL.Point} 鼠标的物理坐标,
             * <br />"<b>pixel</b>：{BMapGL.Pixel} 鼠标的像素坐标}
             *
             * @example <b>参考示例：</b>
             * myRichMarkerObject.addEventListener("ondblclick", function(e) { 
             *     alert(e.type);  
             * });
             */
            _dispatchEvent(me, "ondblclick", {
                "point": position.point,
                "pixel": position.pixel
            });
            _stopAndPrevent(e);
        });

        // 鼠标移上事件
        div.onmouseover = function (e) {
            var position = _getPositionByEvent(e);
            /**
             * 鼠标移到Marker上时，派发事件的接口
             * @name RichMarker#onmouseover
             * @event
             * @param {Event Object} e 回调函数会返回event参数，包括以下返回值：
             * <br />{"<b>target</b> : {BMapGL.Overlay} 触发事件的元素,
             * <br />"<b>type</b>：{String} 事件类型,
             * <br />"<b>point</b>：{BMapGL.Point} 鼠标的物理坐标,
             * <br />"<b>pixel</b>：{BMapGL.Pixel} 鼠标的像素坐标}
             *
             * @example <b>参考示例：</b>
             * myRichMarkerObject.addEventListener("onmouseover", function(e) { 
             *     alert(e.type);  
             * });
             */
            _dispatchEvent(me, "onmouseover", {
                "point": position.point,
                "pixel": position.pixel
            });
            _stopAndPrevent(e);
        }

        // 鼠标移出事件
        div.onmouseout = function (e) {
            var position = _getPositionByEvent(e);
            /**
             * 鼠标移出Marker时，派发事件的接口
             * @name RichMarker#onmouseout
             * @event
             * @param {Event Object} e 回调函数会返回event参数，包括以下返回值：
             * <br />{"<b>target</b> : {BMapGL.Overlay} 触发事件的元素,
             * <br />"<b>type</b>：{String} 事件类型,
             * <br />"<b>point</b>：{BMapGL.Point} 鼠标的物理坐标,
             * <br />"<b>pixel</b>：{BMapGL.Pixel} 鼠标的像素坐标}
             *
             * @example <b>参考示例：</b>
             * myRichMarkerObject.addEventListener("onmouseout", function(e) { 
             *     alert(e.type);  
             * });
             */
            _dispatchEvent(me, "onmouseout", {
                "point": position.point,
                "pixel": position.pixel
            });
            _stopAndPrevent(e);
        }

        // 鼠标弹起事件
        var mouseUpEvent = function (e) {
                var position = _getPositionByEvent(e);
                /**
                 * 在Marker上弹起鼠标时，派发事件的接口
                 * @name RichMarker#onmouseup
                 * @event
                 * @param {Event Object} e 回调函数会返回event参数，包括以下返回值：
                 * <br />{"<b>target</b> : {BMapGL.Overlay} 触发事件的元素,
                 * <br />"<b>type</b>：{String} 事件类型,
                 * <br />"<b>point</b>：{BMapGL.Point} 鼠标的物理坐标,
                 * <br />"<b>pixel</b>：{BMapGL.Pixel} 鼠标的像素坐标}
                 *
                 * @example <b>参考示例：</b>
                 * myRichMarkerObject.addEventListener("onmouseup", function(e) { 
                 *     alert(e.type);  
                 * });
                 */
                _dispatchEvent(me, "onmouseup", {
                    "point": position.point,
                    "pixel": position.pixel
                });

                if (me._container.releaseCapture) {
                    baidu.un(div, "onmousemove", mouseMoveEvent);
                    baidu.un(div, "onmouseup", mouseUpEvent);
                } else {
                    baidu.un(window, "onmousemove", mouseMoveEvent);
                    baidu.un(window, "onmouseup", mouseUpEvent);
                }

                // 判断是否需要进行拖拽事件的处理
                if (!me._opts.enableDragging) {
                    _stopAndPrevent(e);
                    return;
                }
                // 拖拽结束时，释放鼠标捕获
                me._container.releaseCapture && me._container.releaseCapture();
                /**
                 * 拖拽Marker结束时，派发事件的接口
                 * @name RichMarker#ondragend
                 * @event
                 * @param {Event Object} e 回调函数会返回event参数，包括以下返回值：
                 * <br />{"<b>target</b> : {BMapGL.Overlay} 触发事件的元素,
                 * <br />"<b>type</b>：{String} 事件类型,
                 * <br />"<b>point</b>：{BMapGL.Point} 鼠标的物理坐标,
                 * <br />"<b>pixel</b>：{BMapGL.Pixel} 鼠标的像素坐标}
                 *
                 * @example <b>参考示例：</b>
                 * myRichMarkerObject.addEventListener("ondragend", function(e) { 
                 *     alert(e.type);  
                 * });
                 */
                _dispatchEvent(me, "ondragend", {
                    "point": position.point,
                    "pixel": position.pixel
                });
                isMouseDown = false;
                startPosition = null;
                // 设置拖拽结束后的鼠标手型
                me._setCursor("dragend");
                // 拖拽过程中防止文字被选中
                me._container.style['MozUserSelect'] = '';
                me._container.style['KhtmlUserSelect'] = '';
                me._container.style['WebkitUserSelect'] = '';
                me._container['unselectable'] = 'off';
                me._container['onselectstart'] = function () {};

                _stopAndPrevent(e);
            }

            // 鼠标移动事件
        var mouseMoveEvent = function (e) {
                // 判断是否需要进行拖拽事件的处理
                if (!me._opts.enableDragging || !isMouseDown) {
                    return;
                }
                var position = _getPositionByEvent(e);

                // 计算当前marker应该所在的位置
                var startPixel = me._map.pointToPixel(me._position);
                var x = position.pixel.x - startPosition.x + startPixel.x;
                var y = position.pixel.y - startPosition.y + startPixel.y;

                startPosition = position.pixel;
                me._position = me._map.pixelToPoint(new BMapGL.Pixel(x, y));
                me.draw();
                // 设置拖拽过程中的鼠标手型
                me._setCursor("dragging");
                /**
                 * 拖拽Marker的过程中，派发事件的接口
                 * @name RichMarker#ondragging
                 * @event
                 * @param {Event Object} e 回调函数会返回event参数，包括以下返回值：
                 * <br />{"<b>target</b> : {BMapGL.Overlay} 触发事件的元素,
                 * <br />"<b>type</b>：{String} 事件类型,
                 * <br />"<b>point</b>：{BMapGL.Point} 鼠标的物理坐标,
                 * <br />"<b>pixel</b>：{BMapGL.Pixel} 鼠标的像素坐标}
                 *
                 * @example <b>参考示例：</b>
                 * myRichMarkerObject.addEventListener("ondragging", function(e) { 
                 *     alert(e.type);  
                 * });
                 */
                _dispatchEvent(me, "ondragging", {
                    "point": position.point,
                    "pixel": position.pixel
                });
                _stopAndPrevent(e);
            }

            // 鼠标按下事件
            baidu.on(div, "onmousedown", function (e) {
                var position = _getPositionByEvent(e);
                /**
                 * 在Marker上按下鼠标时，派发事件的接口
                 * @name RichMarker#onmousedown
                 * @event
                 * @param {Event Object} e 回调函数会返回event参数，包括以下返回值：
                 * <br />{"<b>target</b> : {BMapGL.Overlay} 触发事件的元素,
                 * <br />"<b>type</b>：{String} 事件类型,
                 * <br />"<b>point</b>：{BMapGL.Point} 鼠标的物理坐标,
                 * <br />"<b>pixel</b>：{BMapGL.Pixel} 鼠标的像素坐标}
                 *
                 * @example <b>参考示例：</b>
                 * myRichMarkerObject.addEventListener("onmousedown", function(e) { 
                 *     alert(e.type);  
                 * });
                 */
                _dispatchEvent(me, "onmousedown", {
                    "point": position.point,
                    "pixel": position.pixel
                });

                if (me._container.setCapture) {
                    baidu.on(div, "onmousemove", mouseMoveEvent);
                    baidu.on(div, "onmouseup", mouseUpEvent);
                } else {
                    baidu.on(window, "onmousemove", mouseMoveEvent);
                    baidu.on(window, "onmouseup", mouseUpEvent);
                }

                // 判断是否需要进行拖拽事件的处理
                if (!me._opts.enableDragging) {
                    _stopAndPrevent(e);
                    return;
                }
                startPosition = position.pixel;
                /**
                 * 开始拖拽Marker时，派发事件的接口
                 * @name RichMarker#ondragstart
                 * @event
                 * @param {Event Object} e 回调函数会返回event参数，包括以下返回值：
                 * <br />{"<b>target</b> : {BMapGL.Overlay} 触发事件的元素,
                 * <br />"<b>type</b>：{String} 事件类型,
                 * <br />"<b>point</b>：{BMapGL.Point} 鼠标的物理坐标,
                 * <br />"<b>pixel</b>：{BMapGL.Pixel} 鼠标的像素坐标}
                 *
                 * @example <b>参考示例：</b>
                 * myRichMarkerObject.addEventListener("ondragstart", function(e) { 
                 *     alert(e.type);  
                 * });
                 */
                _dispatchEvent(me, "ondragstart", {
                    "point": position.point,
                    "pixel": position.pixel
                });
                isMouseDown = true;
                // 设置拖拽开始的鼠标手型
                me._setCursor("dragstart");
                // 拖拽开始时，设置鼠标捕获
                me._container.setCapture && me._container.setCapture();
                // 拖拽过程中防止文字被选中
                me._container.style['MozUserSelect'] = 'none';
                me._container.style['KhtmlUserSelect'] = 'none';
                me._container.style['WebkitUserSelect'] = 'none';
                me._container['unselectable'] = 'on';
                me._container['onselectstart'] = function () {
                    return false;
                };
                _stopAndPrevent(e);
            });
    }

    /**
     * 设置拖拽过程中的手型
     *
     * @private 
     * @param {string} cursorType 需要设置的手型类型
     */
    RichMarker.prototype._setCursor = function (cursorType) {
        var cursor = '';
        var cursorStylies = {
            "moz": {
                "dragstart": "-moz-grab",
                "dragging": "-moz-grabbing",
                "dragend": "pointer"
            },
            "other": {
                "dragstart": "move",
                "dragging": "move",
                "dragend": "pointer"
            }
        };

        if (navigator.userAgent.indexOf('Gecko/') !== -1) {
            cursor = cursorStylies.moz[cursorType];
        } else {
            cursor = cursorStylies.other[cursorType];
        }

        if (this._container.style.cursor != cursor) {
            this._container.style.cursor = cursor;
        }
    }

    /**
     * 删除Marker
     * 
     * @private
     * @return 无返回值
     */
    RichMarker.prototype.remove = function () {
        _dispatchEvent(this, "onremove");
        // 清除主容器上的事件绑定
        if (this._container) {
            _purge(this._container);
        }
        // 删除主容器
        if (this._container && this._container.parentNode) {
            this._container.parentNode.removeChild(this._container);
        }
    }

    /**
     * 集中派发事件函数
     *
     * @private
     * @param {Object} instance 派发事件的实例
     * @param {String} type 派发的事件名
     * @param {Json} opts 派发事件里添加的参数，可选
     */
    function _dispatchEvent(instance, type, opts) {
        type.indexOf("on") != 0 && (type = "on" + type);
        var event = new baidu.lang.Event(type);
        if ( !! opts) {
            for (var p in opts) {
                event[p] = opts[p];
            }
        }
        instance.dispatchEvent(event);
    }

    /**
     * 清理DOM事件，防止循环引用
     *
     * @type {DOM} dom 需要清理的dom对象
     */
    function _purge(dom) {
        if (!dom) {
            return;
        }
        var attrs = dom.attributes,
            name = "";
        if (attrs) {
            for (var i = 0, n = attrs.length; i < n; i++) {
                name = attrs[i].name;
                if (typeof dom[name] === "function") {
                    dom[name] = null;
                }
            }
        }
        var child = dom.childnodes;
        if (child) {
            for (var i = 0, n = child.length; i < n; i++) {
                _purge(dom.childnodes[i]);
            }
        }
    }

    /**
     * 停止事件冒泡传播
     *
     * @type {Event} e e对象
     */
    function _stopAndPrevent(e) {
        var e = window.event || e;
        e.stopPropagation ? e.stopPropagation() : e.cancelBubble = true;
        return baidu.preventDefault(e);
    }
})();
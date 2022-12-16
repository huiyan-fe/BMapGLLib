/**
 * @fileoverview 百度地图的自定义覆盖物，对外开放。
 * 允许用户在地图上通过DOM实现覆盖物。
 * 主入口类是<a href="symbols/BMapGLLib.CustomOverlay.html">CustomOverlay</a>，
 * 基于Baidu Map API GL 1.0。
 *
 * @author Baidu Map Api Group 
 * @version 1.0
 */

/** 
 * @namespace BMapGL的所有library类均放在BMapGLLib命名空间下
 */
var BMapGLLib = window.BMapGLLib = BMapGLLib || {};

(function() {

    /**
     * 声明baidu包
     */
    var baidu = baidu || {guid : "$BAIDU$"};
    (function() {
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
        baidu.lang.guid = function() {
            return "TANGRAM__" + (window[baidu.guid]._counter ++).toString(36);
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
        baidu.lang.Class = function(guid) {
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
         * 重载了默认的toString方法，使得返回信息更加准确一些。
         * @return {string} 对象的String表示形式
         */
        baidu.lang.Class.prototype.toString = function(){
            return "[object " + (this._className || "Object" ) + "]";
        };

        /**
         * 释放对象所持有的资源，主要是自定义事件。
         * @name dispose
         * @grammar obj.dispose()
         */
        baidu.lang.Class.prototype.dispose = function(){
            delete window[baidu.guid]._instances[this.guid];
            for(var property in this){
                if (!baidu.lang.isFunction(this[property])) {
                    delete this[property];
                }
            }
            this.disposed = true;
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
            }
            !this.__listeners && (this.__listeners = {});
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

        /**
         * 为类型构造器建立继承关系
         * @name baidu.lang.inherits
         * @function
         * @grammar baidu.lang.inherits(subClass, superClass[, className])
         * @param {Function} subClass 子类构造器
         * @param {Function} superClass 父类构造器
         * @param {string} className 类名标识
         * @remark 使subClass继承superClass的prototype，
         * 因此subClass的实例能够使用superClass的prototype中定义的所有属性和方法。<br>
         * 这个函数实际上是建立了subClass和superClass的原型链集成，并对subClass进行了constructor修正。<br>
         * <strong>注意：如果要继承构造函数，需要在subClass里面call一下，具体见下面的demo例子</strong>
         * @shortcut inherits
         * @meta standard
         * @see baidu.lang.Class
         */
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

        /**
         * @ignore
         * @namespace baidu.dom 操作dom的方法。
         */
        baidu.dom = baidu.dom || {};

        /**
         * 从文档中获取指定的DOM元素
         * 
         * @param {string|HTMLElement} id 元素的id或DOM元素
         * @meta standard
         * @return {HTMLElement} DOM元素，如果不存在，返回null，如果参数不合法，直接返回参数
         */
        baidu._g = baidu.dom._g = function (id) {
            if (baidu.lang.isString(id)) {
                return document.getElementById(id);
            }
            return id;
        };

        /**
         * 从文档中获取指定的DOM元素
         * @name baidu.dom.g
         * @function
         * @grammar baidu.dom.g(id)
         * @param {string|HTMLElement} id 元素的id或DOM元素
         * @meta standard
         *             
         * @returns {HTMLElement|null} 获取的元素，查找不到时返回null,如果参数不合法，直接返回参数
         */
        baidu.g = baidu.dom.g = function (id) {
            if ('string' == typeof id || id instanceof String) {
                return document.getElementById(id);
            } else if (id && id.nodeName && (id.nodeType == 1 || id.nodeType == 9)) {
                return id;
            }
            return null;
        };

        /**
         * 在目标元素的指定位置插入HTML代码
         * @name baidu.dom.insertHTML
         * @function
         * @grammar baidu.dom.insertHTML(element, position, html)
         * @param {HTMLElement|string} element 目标元素或目标元素的id
         * @param {string} position 插入html的位置信息，取值为beforeBegin,afterBegin,beforeEnd,afterEnd
         * @param {string} html 要插入的html
         * @remark
         * 
         * 对于position参数，大小写不敏感<br>
         * 参数的意思：beforeBegin&lt;span&gt;afterBegin   this is span! beforeEnd&lt;/span&gt; afterEnd <br />
         * 此外，如果使用本函数插入带有script标签的HTML字符串，script标签对应的脚本将不会被执行。
         * 
         * @shortcut insertHTML
         * @meta standard
         *             
         * @returns {HTMLElement} 目标元素
         */
        baidu.insertHTML = baidu.dom.insertHTML = function (element, position, html) {
            element = baidu.dom.g(element);
            var range,begin;

            if (element.insertAdjacentHTML) {
                element.insertAdjacentHTML(position, html);
            } else {
                // 这里不做"undefined" != typeof(HTMLElement) && !window.opera判断，其它浏览器将出错？！
                // 但是其实做了判断，其它浏览器下等于这个函数就不能执行了
                range = element.ownerDocument.createRange();
                // FF下range的位置设置错误可能导致创建出来的fragment在插入dom树之后html结构乱掉
                // 改用range.insertNode来插入html, by wenyuxiang @ 2010-12-14.
                position = position.toUpperCase();
                if (position == 'AFTERBEGIN' || position == 'BEFOREEND') {
                    range.selectNodeContents(element);
                    range.collapse(position == 'AFTERBEGIN');
                } else {
                    begin = position == 'BEFOREBEGIN';
                    range[begin ? 'setStartBefore' : 'setEndAfter'](element);
                    range.collapse(begin);
                }
                range.insertNode(range.createContextualFragment(html));
            }
            return element;
        };

        /**
         * 为目标元素添加className
         * @name baidu.dom.addClass
         * @function
         * @grammar baidu.dom.addClass(element, className)
         * @param {HTMLElement|string} element 目标元素或目标元素的id
         * @param {string} className 要添加的className，允许同时添加多个class，中间使用空白符分隔
         * @remark
         * 使用者应保证提供的className合法性，不应包含不合法字符，className合法字符参考：http://www.w3.org/TR/CSS2/syndata.html。
         * @shortcut addClass
         * @meta standard
         * 	            
         * @returns {HTMLElement} 目标元素
         */
        baidu.ac = baidu.dom.addClass = function (element, className) {
            element = baidu.dom.g(element);
            var classArray = className.split(/\s+/),
                result = element.className,
                classMatch = " " + result + " ",
                i = 0,
                l = classArray.length;

            for (; i < l; i++){
                if ( classMatch.indexOf( " " + classArray[i] + " " ) < 0 ) {
                    result += (result ? ' ' : '') + classArray[i];
                }
            }

            element.className = result;
            return element;
        };

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
         *  1. 不支持跨浏览器的鼠标滚轮事件监听器添加<br>
         *  2. 改方法不为监听器灌入事件对象，以防止跨iframe事件挂载的事件对象获取失败            
         * @shortcut on
         * @meta standard
         * @see baidu.event.un
         *             
         * @returns {HTMLElement|window} 目标元素
         */
        baidu.on = baidu.event.on = function (element, type, listener) {
            type = type.replace(/^on/i, '');
            element = baidu._g(element);
            var realListener = function (ev) {
                // 1. 这里不支持EventArgument,  原因是跨frame的事件挂载
                // 2. element是为了修正this
                listener.call(element, ev);
            },
            lis = baidu.event._listeners,
            filter = baidu.event._eventFilter,
            afterFilter,
            realType = type;
            type = type.toLowerCase();
            // filter过滤
            if(filter && filter[type]){
                afterFilter = filter[type](element, type, realListener);
                realType = afterFilter.type;
                realListener = afterFilter.listener;
            }
            // 事件监听器挂载
            if (element.addEventListener) {
                element.addEventListener(realType, realListener, false);
            } else if (element.attachEvent) {
                element.attachEvent('on' + realType, realListener);
            }
        
            // 将监听器存储到数组中
            lis[lis.length] = [element, type, listener, realListener, realType];
            return element;
        };

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
         *             
         * @returns {HTMLElement|window} 目标元素
         */
        baidu.un = baidu.event.un = function (element, type, listener) {
            element = baidu._g(element);
            type = type.replace(/^on/i, '').toLowerCase();
            
            var lis = baidu.event._listeners, 
                len = lis.length,
                isRemoveAll = !listener,
                item,
                realType, realListener;
            
            //如果将listener的结构改成json
            //可以节省掉这个循环，优化性能
            //但是由于un的使用频率并不高，同时在listener不多的时候
            //遍历数组的性能消耗不会对代码产生影响
            //暂不考虑此优化
            while (len--) {
                item = lis[len];
                
                // listener存在时，移除element的所有以listener监听的type类型事件
                // listener不存在时，移除element的所有type类型事件
                if (item[1] === type
                    && item[0] === element
                    && (isRemoveAll || item[2] === listener)) {
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
     * 自定义覆盖物的DOM生成类
     * @exports CustomOverlay as BMapGLLib.CustomOverlay 
     */
    var CustomOverlay = 

    /**
     * @param point 定位点坐标
     * @param html DOM内容
     * @param options 传入参数，如offset等
     */
    BMapGLLib.CustomOverlay = function(point, html, options){
        this._point = new BMapGL.Point(point.lng, point.lat);
        this._html = html || '';
        this._options = options || {};

        // 继承Overlay
        var extend = new BMapGL.Overlay();
        for (var key in extend) {
            if (key !== 'initialize' && key !== 'draw' && key !== 'setPosition' && key !== 'toString'
                && key !== 'addEventListener' && key !== 'removeEventListener' && key !== 'dispatchEvent') {
                this.__proto__[key] = extend[key];
            }
        }
    }

    // CustomOverlay.prototype = new BMapGL.Overlay();
    // 通过baidu.lang下的inherits方法，让CustomOverlay继承baidu.lang.Class
    baidu.lang.inherits(CustomOverlay, baidu.lang.Class, "CustomOverlay");

    CustomOverlay.prototype.initialize = function(map){
        this._map = map;
        this._div = document.createElement("div");
        this._div.style.position = "absolute";
        this._div.style.zIndex = this._options.zIndex || BMapGL.Overlay.getZIndex(this._point.lat);
        if (this._html instanceof HTMLElement) {
            this._div.appendChild(this._html);
        }
        else {
            this._div.innerHTML = this._html;
        }

        var self = this;
        this._div.onmousedown = function(event){
            event = event || window.event;
            var x = event.clientX || event.pageX;
            var y = event.clientY || event.pageY;
            var pixel = new BMapGL.Pixel(x, y);
            var latLng = map.pixelToPoint(pixel);

            self.dispatchEvent('onmousedown', {latLng: latLng});

            if (event.preventDefault){
                event.preventDefault();
            } else {
                event.returnValue = false;
            }
            return false;
        }

        this._div.onmousemove = function(event){
            event = event || window.event;
            var x = event.clientX || event.pageX;
            var y = event.clientY || event.pageY;
            var pixel = new BMapGL.Pixel(x, y);
            var latLng = map.pixelToPoint(pixel);

            self.dispatchEvent('onmousemove', {latLng: latLng});

            if (event.preventDefault){
                event.preventDefault();
            } else {
                event.returnValue = false;
            }
            return false;
        }

        this._div.onmouseup = function(event){
            map.enableDragging();
            event = event || window.event;
            if (event.preventDefault){
                event.preventDefault();
            } else {
                event.returnValue = false;
            }
            var x = event.clientX || event.pageX;
            var y = event.clientY || event.pageY;
            var pixel = new BMapGL.Pixel(x, y);
            var latLng = map.pixelToPoint(pixel);
            self.dispatchEvent('onmouseup', {latLng: latLng});
            return false;
        }

        map.getPanes().floatShadow.appendChild(this._div);
        return this._div;
    }

    CustomOverlay.prototype.draw = function(){
        var map = this._map;
        var pixel = map.pointToOverlayPixel(this._point);

        var offset = {width: 0, height: 0};
        if (this._options && this._options.offset) {
            offset = this._options.offset;
        }
        var offW = offset.width;
        var offH = offset.height;
        if (this._options && this._options.unit && this._options.unit === 'm') {
            offW /= map.getZoomUnits();
            offH /= map.getZoomUnits();
        }
        this._div.style.left = pixel.x + offW + 'px';
        this._div.style.top = pixel.y + offH + 'px';
        this._div.style.transform = 'translate(-50%, -100%)';
    }

    CustomOverlay.prototype.setPosition = function(point) {
        this._point = new BMapGL.Point(point.lng, point.lat);
    }


})();
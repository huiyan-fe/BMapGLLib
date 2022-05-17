/* eslint-disable */
/**
 * @fileoverview 百度地图的鼠标绘制工具，对外开放。
 * 允许用户在地图上点击完成鼠标绘制的功能。
 * 使用者可以自定义所绘制结果的相关样式，例如线宽、颜色、测线段距离、面积等等。
 * 主入口类是<a href="symbols/BMapGLLib.DrawingManager.html">DrawingManager</a>，
 * 基于Baidu Map API GL 1.0。
 *
 * @author Baidu Map Api Group
 * @version 1.0
 */

/**
 * @namespace BMapGL的所有library类均放在BMapGLLib命名空间下
 */
var BMapGLLib = window.BMapGLLib = BMapGLLib || {};

/**
 * 定义常量, 绘制的模式
 * @final {Number} DrawingType
 */
var BMAP_DRAWING_MARKER    = "marker",     // 鼠标画点模式
    BMAP_DRAWING_POLYLINE  = "polyline",   // 鼠标画线模式
    BMAP_DRAWING_CIRCLE    = "circle",     // 鼠标画圆模式
    BMAP_DRAWING_RECTANGLE = "rectangle",  // 鼠标画矩形模式
    BMAP_DRAWING_POLYGON   = "polygon";    // 鼠标画多边形模式

(function() {

    var circlePng = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAAAXNSR0IArs4c6QAAAs1JREFUWAnNmb9v01AQx989SzVI8dIBJNZ27Mb/QRpExMiOKAW1Mw3MRVCB2BlRECF/CBtjuwbBwGJL1JXs474vtuU4Tkho4tyTGr9ffvfxvV93VzL/mfYPLndSumqT4buG6Y4MI3+MpyQayc/IEI/Y0DfLW8Ov725cuKYlf2iZ/p3j8FZylT4hQx1m3lvmXSL6zoYH3pZ9PzgNfi367kKA3R634t/REXF6zMa0Fh28rp8IjJjsqb/det3vUVTXp1z3T8DOs/B+kvIHw3y7/OK180Q/PUuPB2+DL/PGsrMaZQrp3tPwJEn488rhIFQ+GGNDBmTN4qht6D7nm3ESfpRBurNeXGk9Ud/3gkf9N/SnOu6UBvE1jcKBSBQBmXWanAJsH0YvGtNcWV0C6WSX6yQ/McVuQ2DNycFW6ddQkdjz6EF54xQg46MkPMfibYimXozsbn872M2PoGKKcc5tHA7IoiDHkuE7DeKGSOP04rqHcL1Klq8VqMj6dgc3jtMgx+mBFjh8DlhwpSI/BiTaR0FTwn0PHnJWiYnPNcHlLNb4uxYmU16h7Qk26+w5bWQZD9hsZmzqRBRDGJsks4JVMgIwN9M1ArIAykRrRHNMwoY1+EMtoLBhDcID05pGMsWsF1DYLPxWrepzPjWcaq2AYLPw+OFUa4MEE9jG1ox4/NoAEYUAkwNEOAJGohZIsICpAITlinCEFkCw5PEbp0GAIVZixGHZOKRzmoQlSwUgvCjESsSG3eDVJ26nMOQeHRgLQBScP0r0EvmNJJFd9onBIOtxMiH80D4MPzUeXZD4zPAseCjHy8QMTmgQqOiAQI5k+pPoayxlwaMqnOOZJXasSRenOVlfKES0JdM6PGu9qoObC5iDqw1g5oBYtIiVGLK9VRzmbgwZC2NWN0Qus/yc2iTlxmoeIRIXhRBHX5bAXrV9XlmmcH1B9DrBTf0b4i99lUEMOuku/wAAAABJRU5ErkJggg==';
    var bulletPng = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IArs4c6QAAAd9JREFUOBGtVc8rRFEUPufOvELMguTHwkbKjxRlo9gqNpjyFyhTit3I8i1ldpQa5S9QmA1lS9koSn6UZmMxSCyGkPlx3O+9mTe8Zl4zw7eZ7rnn++aee893HlMRzEXFeLh6m2LJTpHwEJG022mcIJZTYbXX2lu/txnilJvO7sDkYnJaC0REqNO993PNTHEiDsfWAru/4vmFaYo6e35dEZIwYh1tPhobNmig20/NjcpKe3rJ0vlNmg5PUnR3n7FiTBwZbGpYNk3OIuCccHIhuQoxv49lNljD4yMG6VMUhT49HRynaGvnU9IZ0Wkcia0HlhxBlCkiOxAz5+u4v8tXVMgdvLjNkLnxbosyB1E+4wEeL5PXuLPQTC1NjBpunud6/yhF0e0PVBNv6Qv0KLwmxHBnKLNSgAMuNKClrNbQKniAUnfm9SfggAtAS9l9RtZrehG99tAJFnTP6n6wmzbfGl7EUnsFrrTbDVYqs4q4FtR20kDTVosClxMK3oQQHFAtHK7WUjA6hGAnOKBSgAMuAC2FqYGmhDdhp0oBDrjQgJayRxBbAwHehJ3KBXLBsfM5DC3H/v81HHIdSYQRpMcX6ekRhjcPjr/KGV+6Unt8xXJlOSfMl/lvAzYviN+/fAK+AW5jAVefzjWGAAAAAElFTkSuQmCC';
    var nbPng = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABQCAYAAACOEfKtAAAAAXNSR0IArs4c6QAABcdJREFUeAHtm0FoHFUYx7+ZbDfJJiZUqcEgBU3BqtGKRdGLHsSTSGxL8agUT230YtGTDQl6EKt4CD1JqPQkastSPImIvVSUQINRK1jrQVNSRRGz3WST3fH/f5k3THY3mmzejLub74Mv8/bNzJv3fnwz773v+yKiogSUgBJQAkpACSgBJaAElIASUAJKQAkoASWgBJSAElACSkAJKIH2J+A1OsQgCIZw7wh0P3Qwpr0oN7MsoHNzMZ1GOe953pVGOr0pgIB2Kx4yCj0AHW7kgU18zyz6dg46CZjXN9rPDQEEOFrVy9DjUGNhhaIEX8+WvEuXy/LbnxX5468AWpHF0kYf/f9c190psrPPl5v7Pdm105cH9nbIQ8PZoKdbLAta6Eno2wDJ8r+KvWndiwDvIE6egg7wooszy/LJhZJ8e6UslQprWl98X+TeoQ556rGsPLpvhx3QPApHAfGsrah3XBcgwPHcCegY1Pv+pxU5nV+Sy1fL9dppm7q9d3TI8yOdcvedGY4pgI5DJwCS5RqpCxDwunHl+9DDlUCCqbOL3vkvmvzdrBna1iqefjwrRw52Bb5nXu0P0dpzgFisbrUGYGh5H+DCw4ViELw5dcOb+aG9ra4aiv29764OefVIDt9Hj5wI8dlqS8TbXyN8bQ28V94pbFt4pELDIQMaEplAyWaNrAEYThhjfG1peb/Mt8kssWbIm/tBBmRBJrhzLGQUNRIBxAkuTzjbevzmbdfXNiITK5AFmZAN9FTIylwRAcQvrvMGONtutwnDkPiPP2RCNmQEJSsjBiCIcofBRbJZqpgzjv88cn8GC1azNHDW8qEns7L7trgNOGu6bkNcxoVyPGQm9ukv4kQvF8lJrfN6cx5mtG6nEG/p9+X10VxqEMmGjMgKOsqCBfgMf3CHkZQsw/p3ZNxCLOPL3n9TuhBjjOgPEB+mSK/KMPe23J4lJdPfLcvfhcApxM++XJZyOV2IZERWZEZ2tEC6pOSrb0peknvbhRsir00WnEL8ea4ib50upgqRjMiKzCAjBEh/nlxKYbdx9deKc4gXZ1ZShxhb4u0nQDpD5Xe4pNKQdoBI910ogxFA+vPSklaHGGMVBxhRTYVjK0Ok4zgUA9CYnvE32OqUjoSIfaZ5ml3i3D7Al6Jx4TfRLni5xJk4lpPObOPt1bszxipgb6/xIrq50xa40eG87Ioem/+8JFt1YAzu8uXAE6vEuE6cOrcoS46XtzFW10iNESoTI4hGkkKB8CaO9cie3R3maR99uiRnzkdbpYZ6QHhvvJTDWHwhvHfPFOXCtNm/NtTeejcxnhLKXASQAZa0pJXhkVGMlQHIuKjQ+5qGtDo8MmIkL5Rpml2ePx6+LxswOpWktAM8MmIYNOSU9+HjZ0R+FoPzGNpLSjJo2vU3r6/XS+WbF2dCRmRFZmRnbY4ReRMXjV/ssvzgPRmnEwb7xshZ0hNGNQPGjkMxzCzASVQuMKjMuGgS0tezOnO5mG1t/xAtS3S2tc+xR7IJA+/MWCCzVX8gTJG5IExnMEFlHl0L41ou4bF/SS5V6o2fAfdQTobMonwQgW+LXtYfoQPvfbzoPC6SgTd/xfGSLIssjJJxENtxJXfk5+KFQ2bRP4+n7AFAWmHkkZaw4ijqAkbkXS9rXMNj59OCRxZkQjZQ5ssYeOyD/QayTIhMpBlnOgMj8lvdl5pGW/wPGZBFmOIxHjKKRhXtSWwNXmXWaWoHIGwktaMGIEECInaqmlzUUHIRAVJCSzyB4hhU09s2k95GgFYAUhMsLYw6x7qvcPV1gMglTk2KL6NTDEYxntIqKb5d2Ehw92JTfPmdox8g3J5x6JxhuSZ2k+LLFq0AJFNAmMXAQPywrW+T4yzGkUySeT1AgDmEesaUGRZlZM8qrbWZhRZGJ7LVLf2bQzMPVPumBJSAElACSkAJKAEloASUgBJQAkpACSgBJaAElIASUAJKQAkoAVcE/gG4Wba8Vno8+QAAAABJRU5ErkJggg==';

    /**
     * 声明baidu包
     */
    var baidu = baidu || { guid: '$BAIDU$' };
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
            return 'TANGRAM__' + (window[baidu.guid]._counter++).toString(36);
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
         * @param {string} guid 对象的唯一标识
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
        baidu.lang.Class.prototype.toString = function () {
            return '[object ' + (this._className || 'Object') + ']';
        };

        /**
         * 释放对象所持有的资源，主要是自定义事件。
         * @name dispose
         * @grammar obj.dispose()
         */
        baidu.lang.Class.prototype.dispose = function () {
            delete window[baidu.guid]._instances[this.guid];
            for (var property in this) {
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
         * @param {string} type  事件类型名称。为了方便区分事件和一个普通的方法，事件类型名称必须以"on"(小写)开头。
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
         * @param   {string}   type         自定义事件的名称
         * @param   {Function} handler      自定义事件被触发时应该调用的回调函数
         * @param   {string}   [key]        为事件监听函数指定的名称，可在移除时使用。如果不提供，方法会默认为它生成一个全局唯一的key。
         * @remark  事件类型区分大小写。如果自定义事件名称不是以小写"on"开头，该方法会给它加上"on"再进行判断，即"click"和"onclick"会被认为是同一种事件。 
         */
        baidu.lang.Class.prototype.addEventListener = function (type, handler, key) {
            if (!baidu.lang.isFunction(handler)) {
                return;
            }
            !this.__listeners && (this.__listeners = {});
            var t = this.__listeners,
                id;
            if (typeof key == 'string' && key) {
                if (/[^\w\-]/.test(key)) {
                    throw ('nonstandard key:' + key);
                } else {
                    handler.hashCode = key;
                    id = key;
                }
            }

            type.indexOf('on') != 0 && (type = 'on' + type);
            typeof t[type] != 'object' && (t[type] = {});
            id = id || baidu.lang.guid();
            handler.hashCode = id;
            t[type][id] = handler;
        };

        /**
         * 移除对象的事件监听器。引入baidu.lang.Event后，Class的子类实例才会获得该方法。
         * @grammar obj.removeEventListener(type, handler)
         * @param {string}   type     事件类型
         * @param {Function|string} handler  要移除的事件监听函数或者监听函数的key
         * @remark  如果第二个参数handler没有被绑定到对应的自定义事件中，什么也不做。
         */
        baidu.lang.Class.prototype.removeEventListener = function (type, handler) {
            if (baidu.lang.isFunction(handler)) {
                handler = handler.hashCode;
            } else if (!baidu.lang.isString(handler)) {
                return;
            }
            !this.__listeners && (this.__listeners = {});
            type.indexOf('on') != 0 && (type = 'on' + type);
            var t = this.__listeners;
            if (!t[type]) {
                return;
            }
            t[type][handler] && delete t[type][handler];
        };

        /**
         * 派发自定义事件，使得绑定到自定义事件上面的函数都会被执行。引入baidu.lang.Event后，Class的子类实例才会获得该方法。
         * @grammar obj.dispatchEvent(event, options)
         * @param {baidu.lang.Event|String} event   Event对象，或事件名称(1.1.1起支持)
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
            var i,
                t = this.__listeners,
                p = event.type;
            event.target = event.target || this;
            event.currentTarget = this;
            p.indexOf('on') != 0 && (p = 'on' + p);
            baidu.lang.isFunction(this[p]) && this[p].apply(this, arguments);
            if (typeof t[p] == 'object') {
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
            var key,
                proto,
                selfProps = subClass.prototype,
                clazz = new Function();
            clazz.prototype = superClass.prototype;
            proto = subClass.prototype = new clazz();
            for (key in selfProps) {
                proto[key] = selfProps[key];
            }
            subClass.prototype.constructor = subClass;
            subClass.superClass = superClass.prototype;

            if ('string' == typeof className) {
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
            var range,
                begin;

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
                classMatch = ' ' + result + ' ',
                i = 0,
                l = classArray.length;

            for (; i < l; i++) {
                if (classMatch.indexOf(' ' + classArray[i] + ' ') < 0) {
                    result += (result ? ' ' : '') + classArray[i];
                }
            }

            element.className = result;
            return element;
        };

        /**
         * @ignore
         * @namespace baidu.event 屏蔽浏览器差异性的事件封装。
         * @property target     事件的触发元素
         * @property pageX      鼠标事件的鼠标x坐标
         * @property pageY      鼠标事件的鼠标y坐标
         * @property keyCode    键盘事件的键值
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
            if (filter && filter[type]) {
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
                realType,
                realListener;

            // 如果将listener的结构改成json
            // 可以节省掉这个循环，优化性能
            // 但是由于un的使用频率并不高，同时在listener不多的时候
            // 遍历数组的性能消耗不会对代码产生影响
            // 暂不考虑此优化
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
         * 获取event事件,解决不同浏览器兼容问题
         * @param {Event}
         * @return {Event}
         */
        baidu.getEvent = baidu.event.getEvent = function (event) {
            return window.event || event;
        };

        /**
         * 获取event.target,解决不同浏览器兼容问题
         * @param {Event}
         * @return {Target}
         */
        baidu.getTarget = baidu.event.getTarget = function (event) {
            var event = baidu.getEvent(event);
            return event.target || event.srcElement;
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
            var event = baidu.getEvent(event);
            if (event.preventDefault) {
                event.preventDefault();
            } else {
                event.returnValue = false;
            }
        };

        /**
         * 停止事件冒泡传播
         * @param {Event}
         */
        baidu.stopBubble = baidu.event.stopBubble = function (event) {
            event = baidu.getEvent(event);
            event.stopPropagation ? event.stopPropagation() : event.cancelBubble = true;
        };

        /**
         * 判断是否为ie浏览器
         * @property ie ie版本号
         * @grammar baidu.browser.ie
         * @meta standard
         * @shortcut ie
         * @see baidu.browser.firefox,baidu.browser.safari,baidu.browser.opera,baidu.browser.chrome,baidu.browser.maxthon 
         */
        baidu.browser = baidu.browser || {};
        if (/msie (\d+\.\d)/i.test(navigator.userAgent)) {
            //IE 8下，以documentMode为准
            //在百度模板中，可能会有$，防止冲突，将$1 写成 \x241
            baidu.browser.ie = baidu.ie = document.documentMode || + RegExp['\x241'];
        }

    })();

    /**
     * @exports DrawingManager as BMapGLLib.DrawingManager
     */
    var DrawingManager =

    /**
     * DrawingManager类的构造函数
     * @class 鼠标绘制管理类，实现鼠标绘制管理的<b>入口</b>。
     * 实例化该类后，即可调用该类提供的open
     * 方法开启绘制模式状态。
     * 也可加入工具栏进行选择操作。
     *
     * @constructor
     * @param {Map} map Baidu map的实例对象
     * @param {Json Object} opts 可选的输入参数，非必填项。可输入选项包括：<br />
     * {"<b>isOpen</b>" : {Boolean} 是否开启绘制模式
     * <br />"<b>enableDrawingTool</b>" : {Boolean} 是否添加绘制工具栏控件，默认不添加
     * <br />"<b>drawingToolOptions</b>" : {Json Object} 可选的输入参数，非必填项。可输入选项包括
     * <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"<b>anchor</b>" : {ControlAnchor} 停靠位置、默认左上角
     * <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"<b>offset</b>" : {Size} 偏移值。
     * <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"<b>scale</b>" : {Number} 工具栏的缩放比例,默认为1
     * <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"<b>drawingModes</b>" : {DrawingType<Array>} 工具栏上可以选择出现的绘制模式,将需要显示的DrawingType以数组型形式传入，如[BMAP_DRAWING_MARKER, BMAP_DRAWING_CIRCLE] 将只显示画点和画圆的选项
     * <br />"<b>enableSorption</b>" : {Boolean} 是否开启边界吸附功能
     * <br />"<b>sorptiondistance</b>" : {Number} 边界吸附距离
     * <br />"<b>enableCalculate</b>" : {Boolean} 绘制是否进行测距(画线时候)、测面(画圆、多边形、矩形)
     * <br />"<b>markerOptions</b>" : {MarkerOptions} 所画的点的可选参数，参考api中的<a href="http://developer.baidu.com/map/reference/index.php?title=Class:%E6%80%BB%E7%B1%BB/%E8%A6%86%E7%9B%96%E7%89%A9%E7%B1%BB">对应类</a>
     * <br />"<b>circleOptions</b>" : {CircleOptions} 所画的圆的可选参数，参考api中的<a href="http://developer.baidu.com/map/reference/index.php?title=Class:%E6%80%BB%E7%B1%BB/%E8%A6%86%E7%9B%96%E7%89%A9%E7%B1%BB">对应类</a>
     * <br />"<b>polylineOptions</b>" : {PolylineOptions} 所画的线的可选参数，参考api中的<a href="http://developer.baidu.com/map/reference/index.php?title=Class:%E6%80%BB%E7%B1%BB/%E8%A6%86%E7%9B%96%E7%89%A9%E7%B1%BB">对应类</a>
     * <br />"<b>polygonOptions</b>" : {PolygonOptions} 所画的多边形的可选参数，参考api中的<a href="http://developer.baidu.com/map/reference/index.php?title=Class:%E6%80%BB%E7%B1%BB/%E8%A6%86%E7%9B%96%E7%89%A9%E7%B1%BB">对应类</a>
     * <br />"<b>rectangleOptions</b>" : {PolygonOptions} 所画的矩形的可选参数，参考api中的<a href="http://developer.baidu.com/map/reference/index.php?title=Class:%E6%80%BB%E7%B1%BB/%E8%A6%86%E7%9B%96%E7%89%A9%E7%B1%BB">对应类</a>
     *
     * @example <b>参考示例：</b><br />
     * var map = new BMap.Map("container");<br />map.centerAndZoom(new BMap.Point(116.404, 39.915), 15);<br />
     * var myDrawingManagerObject = new BMapGLLib.DrawingManager(map, {isOpen: true,
     *     drawingType: BMAP_DRAWING_MARKER, enableDrawingTool: true,
     *     enableCalculate: false,
     *     drawingToolOptions: {
     *         anchor: BMAP_ANCHOR_TOP_LEFT,
     *         offset: new BMap.Size(5, 5),
     *         drawingModes : [
     *             BMAP_DRAWING_MARKER,
     *             BMAP_DRAWING_CIRCLE,
     *             BMAP_DRAWING_POLYLINE,
     *             BMAP_DRAWING_POLYGON,
     *             BMAP_DRAWING_RECTANGLE
     *          ]
     *     },
     *     polylineOptions: {
     *         strokeColor: "#333"
     *     });
     */
    BMapGLLib.DrawingManager = function (map, opts) {
        if (!map) {
            return;
        }

        instances.push(this);

        opts = opts || {};
        this.overlays = []; // 用来存储覆盖物

        this._initialize(map, opts);
    };

    // 通过baidu.lang下的inherits方法，让DrawingManager继承baidu.lang.Class
    baidu.lang.inherits(DrawingManager, baidu.lang.Class, 'DrawingManager');

    /**
     * 开启地图的绘制模式
     *
     * @example <b>参考示例：</b><br />
     * myDrawingManagerObject.open();
     */
    DrawingManager.prototype.open = function () {
        // 判断绘制状态是否已经开启
        if (this._isOpen == true) {
            return true;
        }

        closeInstanceExcept(this);

        this._open();
    };

    /**
     * 关闭地图的绘制状态
     *
     * @example <b>参考示例：</b><br />
     * myDrawingManagerObject.close();
     */
    DrawingManager.prototype.close = function () {

        // 判断绘制状态是否已经开启
        if (this._isOpen == false) {
            return true;
        }

        var me = this;
        this._close();
        me._map.removeOverlay(tip_label);
        setTimeout(function () {
            me._map.enableDoubleClickZoom();
        }, 2000);

    };

    /**
     * 设置当前的绘制模式，参数DrawingType，为5个可选常量:
     * <br/>BMAP_DRAWING_MARKER    画点
     * <br/>BMAP_DRAWING_CIRCLE    画圆
     * <br/>BMAP_DRAWING_POLYLINE  画线
     * <br/>BMAP_DRAWING_POLYGON   画多边形
     * <br/>BMAP_DRAWING_RECTANGLE 画矩形
     * @param {DrawingType} DrawingType
     * @return {Boolean}
     *
     * @example <b>参考示例：</b><br />
     * myDrawingManagerObject.setDrawingMode(BMAP_DRAWING_POLYLINE);
     */
    DrawingManager.prototype.setDrawingMode = function (drawingType) {
        // 与当前模式不一样时候才进行重新绑定事件
        if (this._drawingType != drawingType) {
            closeInstanceExcept(this);
            this._setDrawingMode(drawingType);
        }

    };

    /**
     * 获取当前的绘制模式
     * @return {DrawingType} 绘制的模式
     *
     * @example <b>参考示例：</b><br />
     * alert(myDrawingManagerObject.getDrawingMode());
     */
    DrawingManager.prototype.getDrawingMode = function () {
        return this._drawingType;
    };

    /**
     * 打开距离或面积计算
     *
     * @example <b>参考示例：</b><br />
     * myDrawingManagerObject.enableCalculate();
     */
    DrawingManager.prototype.enableCalculate = function () {
        this._enableCalculate = true;
        this._addGeoUtilsLibrary();  // 异步调用GeoUtils
    };

    /**
     * 关闭距离或面积计算
     *
     * @example <b>参考示例：</b><br />
     * myDrawingManagerObject.disableCalculate();
     */
    DrawingManager.prototype.disableCalculate = function () {
        this._enableCalculate = false;
    };

    /**
     * 打开吸附功能
     */
    DrawingManager.prototype.enableSorption = function() {
        this._enableSorption = true;
    };

    /**
     * 关闭吸附功能
     */
    DrawingManager.prototype.disableSorption = function() {
        this._enableSorption = false;
    };


    /**
     * 打开gpc功能
     */
    DrawingManager.prototype.enableGpc = function() {
        this._enableGpc = true;
        this._addGPCLibrary();  // 异步调用gpc
    };

    /**
     * 关闭gpc功能
     */
    DrawingManager.prototype.disableGpc = function() {
        this._enableGpc = false;
    };

    /** 
     * 获取所有绘制的覆盖物
     */
    DrawingManager.prototype.getOverlays = function() {
        return this.overlays;
    };

    DrawingManager.prototype.addOverlayData = function(overlay) {
        return this.overlays.push(overlay);
    };

    DrawingManager.prototype.setOverlaysData = function(overlays) {
        return this.overlays = overlays;
    };

    /**
     * 清除指定覆盖物数据
     */
    DrawingManager.prototype.clearOverlayData = function(overlay) {
        var map = this._map;
        for (var i = 0; i < this.overlays.length; i++) {
            if (this.overlays[i] === overlay) {
                this.overlays.splice(i, 1);
                return overlay;
            }
        }
    };

    /**
     * 清除指定覆盖物
     */
    DrawingManager.prototype.clearOverlay = function(overlay) {
        var map = this._map;
        var overlay = this.clearOverlayData(overlay);
        if (overlay) {
            map.removeOverlay(overlay);
        }
    };

    /** 
     * 清除所有绘制的覆盖物
     */
    DrawingManager.prototype.clearOverlays = function() {
        var map = this._map;
        this.overlays.forEach(function (overlay) {
            map.removeOverlay(overlay);
        });
        this.overlays.length = 0;
    };

    /**
     * 鼠标绘制完成后，派发总事件的接口
     * @name DrawingManager#overlaycomplete
     * @event
     * @param {Event Object} e 回调函数会返回event参数，包括以下返回值：
     * <br />{"<b>drawingMode</b> : {DrawingType} 当前的绘制模式
     * <br />"<b>overlay</b>：{Marker||Polyline||Polygon||Circle} 对应的绘制模式返回对应的覆盖物
     * <br />"<b>calculate</b>：{Number} 需要开启计算模式才会返回这个值，当绘制线的时候返回距离、绘制多边形、圆、矩形时候返回面积，单位为米，
     * <br />"<b>label</b>：{Label} 计算面积时候出现在Map上的Label对象
     *
     * @example <b>参考示例：</b>
     * myDrawingManagerObject.addEventListener("overlaycomplete", function(e) {
     *     alert(e.drawingMode);
     *     alert(e.overlay);
     *     alert(e.calculate);
     *     alert(e.label);
     * });
     */

    /**
     * 绘制点完成后，派发的事件接口
     * @name DrawingManager#markercomplete
     * @event
     * @param {Marker} overlay 回调函数会返回相应的覆盖物，
     * <br />{"<b>overlay</b> : {Marker}
     *
     * @example <b>参考示例：</b>
     * myDrawingManagerObject.addEventListener("circlecomplete", function(e, overlay) {
     *     alert(overlay);
     * });
     */

    /**
     * 绘制圆完成后，派发的事件接口
     * @name DrawingManager#circlecomplete
     * @event
     * @param {Circle} overlay 回调函数会返回相应的覆盖物，
     * <br />{"<b>overlay</b> : {Circle}
     */

    /**
     * 绘制线完成后，派发的事件接口
     * @name DrawingManager#polylinecomplete
     * @event
     * @param {Polyline} overlay 回调函数会返回相应的覆盖物，
     * <br />{"<b>overlay</b> : {Polyline}
     */

    /**
     * 绘制多边形完成后，派发的事件接口
     * @name DrawingManager#polygoncomplete
     * @event
     * @param {Polygon} overlay 回调函数会返回相应的覆盖物，
     * <br />{"<b>overlay</b> : {Polygon}
     */

    /**
     * 绘制矩形完成后，派发的事件接口
     * @name DrawingManager#rectanglecomplete
     * @event
     * @param {Polygon} overlay 回调函数会返回相应的覆盖物，
     * <br />{"<b>overlay</b> : {Polygon}
     */

    /**
     * 初始化状态
     * @param {Map} 地图实例
     * @param {Object} 参数
     */
    DrawingManager.prototype._initialize = function (map, opts) {

        /**
         * map对象
         * @private
         * @type {Map}
         */
        this._map = map;

        /**
         * 配置对象
         * @private
         * @type {Object}
         */
        this._opts = opts;

        /**
         * 当前的绘制模式, 默认是绘制点
         * @private
         * @type {DrawingType}
         */
        this._drawingType = opts.drawingMode || BMAP_DRAWING_MARKER;

        /**
         * 是否添加添加鼠标绘制工具栏面板
         */
        if (opts.enableDrawingTool) {
            this.enableDrawingTool();
        }

        if (opts.sorptionDistance !== undefined) {
            this.setSorptionDistance(opts.sorptionDistance);
        }

        // 是否计算绘制出的面积
        if (opts.enableCalculate === true) {
            this.enableCalculate();
        } else {
            this.disableCalculate();
        }

        // 是否开启超限提示
        if (opts.enableLimit === true) {
            var limit = opts.limitOptions;
            this.limit = limit;
        }

        // 是否开启吸附功能
        if (opts.enableSorption === true) {
            this.enableSorption();
        } else {
            this.disableSorption();
        }

        // 是否开启gpc功能
        if (opts.enableGpc === true) {
            this.enableGpc();
        } else {
            this.disableGpc();
        }

        /**
         * 是否已经开启了绘制状态
         * @private
         * @type {Boolean}
         */
        this._isOpen = !!(opts.isOpen === true);
        if (this._isOpen) {
            this._open();
        }

        this.setPolygonOptions(opts.polygonOptions);
        this.setMarkerOptions(opts.markerOptions);
        this.setCircleOptions(opts.circleOptions);
        this.setPolylineOptions(opts.polylineOptions);
        this.setRectangleOptions(opts.rectangleOptions);
        this.setLabelOptions(opts.labelOptions);
        this.controlButton = opts.controlButton == 'right' ? 'right' : 'left';

    };

    DrawingManager.prototype.enableDrawingTool = function() {
        var opts = this._opts;
        if (!this._drawingTool) {
            var drawingTool  = new DrawingTool(this, opts.drawingToolOptions);
            this._drawingTool = drawingTool;
        }
        this._map.addControl(this._drawingTool);
    };

    DrawingManager.prototype.disableDrawingTool = function() {
        if (this._drawingTool) {
            this._map.removeControl(this._drawingTool);
        }
    };

    DrawingManager.prototype.setSorptionDistance = function(distance) {
        this._sorptionDistance = distance || 0;
    };

    DrawingManager.prototype.setPolygonOptions = function(options) {
        this.polygonOptions = options || {};
    };

    DrawingManager.prototype.setMarkerOptions = function(options) {
        this.markerOptions = options || {};
    };

    DrawingManager.prototype.setCircleOptions = function(options) {
        this.circleOptions = options || {};
    };

    DrawingManager.prototype.setPolylineOptions = function(options) {
        this.polylineOptions = options || {};
    };

    DrawingManager.prototype.setRectangleOptions = function(options) {
        this.rectangleOptions = options || {};
    };

    DrawingManager.prototype.setLabelOptions = function(options) {
        this.labelOptions = options || {};
    };

    /**
     * 开启地图的绘制状态
     * @return {Boolean}，开启绘制状态成功，返回true；否则返回false。
     */
    DrawingManager.prototype._open = function () {

        this._isOpen = true;

        // 添加遮罩，所有鼠标操作都在这个遮罩上完成
        if (!this._mask) {
            this._mask = new Mask();
        }

        this._map.addOverlay(this._mask);
        this._setDrawingMode(this._drawingType);

    };

    /**
     * 设置当前的绘制模式
     * @param {DrawingType}
     */
    DrawingManager.prototype._setDrawingMode = function (drawingType) {

        this._drawingType = drawingType;

        /**
         * 开启编辑状态时候才重新进行事件绑定
         */
        if (this._isOpen) {

            // 清空之前的自定义事件
            this._mask.__listeners = {};

            switch (drawingType) {
                case BMAP_DRAWING_MARKER:
                    this._bindMarker();
                    break;
                case BMAP_DRAWING_CIRCLE:
                    this._bindCircle();
                    break;
                case BMAP_DRAWING_POLYLINE:
                case BMAP_DRAWING_POLYGON:
                    this._bindPolylineOrPolygon();
                    break;
                case BMAP_DRAWING_RECTANGLE:
                    this._bindRectangle();
                    break;
            }
        }

        /**
         * 如果添加了工具栏，则也需要改变工具栏的样式
         */
        if (this._drawingTool && this._isOpen) {
            this._drawingTool.setStyleByDrawingMode(drawingType);
        }

    };

    /**
     * 关闭地图的绘制状态
     * @return {Boolean}，关闭绘制状态成功，返回true；否则返回false。
     */
    DrawingManager.prototype._close = function () {

        this._isOpen = false;

        if (this._mask) {
            this._map.removeOverlay(this._mask);
        }

        /**
         * 如果添加了工具栏，则关闭时候将工具栏样式设置为拖拽地图
         */
        if (this._drawingTool) {
            this._drawingTool.setStyleByDrawingMode('hander');
        }

    };

    /**
     * 绑定鼠标画点的事件
     */
    DrawingManager.prototype._bindMarker = function () {

        var me = this,
            map = this._map,
            mask = this._mask;
        
        /**
         * 鼠标点击的事件
         */
        var clickAction = function (e) {
            // 往地图上添加marker
            var marker = new BMapGL.Marker(e.point, me.markerOptions);
            map.addOverlay(marker);
            me._dispatchOverlayComplete(marker);
        };

        mask.addEventListener('click', clickAction);
    };

    /**
     * 绑定鼠标画圆的事件
     */
    var tip_label = null;
    DrawingManager.prototype._bindCircle = function () {

        var me = this,
            map = this._map,
            mask = this._mask,
            circle = null,
            overlays = [],
            centerPoint = null; // 圆的中心点
        
        var radius = 1;
        var moveMarker = null;
        var polyline = null;
        var radiusWindow = null;
        var operateWindow = null;

        var lineStyel = {
            strokeColor: '#4E6DF1', // 边线颜色。
            strokeWeight: 2 // 边线的宽度，以像素为单位。
        };

        var centerIcon = new BMapGL.Icon(circlePng, new BMapGL.Size(20, 20));
        var moveIcon = new BMapGL.Icon(nbPng, new BMapGL.Size(40, 20), {
            imageOffset: new BMapGL.Size(0, 10)
        });

        /**
         * 开始绘制圆形
         */

        var startAction = function (e) {
            if (me.controlButton == 'right' && (e.button == 1 || e.button == 0)) {
                return;
            }

            centerPoint = e.point;

            var centerMarker = new BMapGL.Marker(centerPoint);
            centerIcon.setImageSize(new BMapGL.Size(20, 20));
            centerMarker.setIcon(centerIcon);
            centerMarker.enableDragging();
            centerMarker.addEventListener('dragstart', centerDragstart);
            centerMarker.addEventListener('dragging', centerDragging);
            centerMarker.addEventListener('dragend', centerDragend);
            map.addOverlay(centerMarker);

            overlays.push(centerMarker);

            circle = new BMapGL.Circle(centerPoint, radius, me.circleOptions);
            map.addOverlay(circle);
            mask.enableEdgeMove();
            mask.addEventListener('mousemove', moveAction);
            baidu.on(document, 'mouseup', endAction);
        };

        /**
         * 绘制圆形过程中，鼠标移动过程的事件
         */
        var moveAction = function (e) {
            radius = me._map.getDistance(centerPoint, e.point).toFixed(0);
            circle.setRadius(radius);

            map.removeOverlay(tip_label);

            tip_label = new BMapGL.Label('半径：' + radius + '米<br>松开完成绘制', {
                position: e.point, // 指定文本标注所在的地理位置
                offset: new BMapGL.Size(10, 10) // 设置文本偏移量
            });
            tip_label.setStyle(me.labelOptions);
            map.addOverlay(tip_label);
        };

        /**
         * 绘制圆形结束
         */
        var endAction = function (e) {
            var cz = map.getViewport(circle.getBounds());
            cz.zoom -= 1;
            map.setViewport(cz);
            map.removeOverlay(tip_label);

            var endPoint = new BMapGL.Point(circle.getBounds().getNorthEast().lng, centerPoint.lat);
            mask.hide();

            moveMarker = new BMapGL.Marker(endPoint);
            moveMarker.setIcon(moveIcon);
            moveMarker.enableDragging();
            polyline = new BMapGL.Polyline([centerPoint, endPoint], lineStyel);

            var midPoint = new BMapGL.Point((circle.getBounds().getNorthEast().lng + centerPoint.lng) / 2, centerPoint.lat);
            radiusWindow = new Screenshot('circle', midPoint, radius, circle, me);
            
            overlays = overlays.concat([moveMarker, polyline, radiusWindow]);
            var limit = null;
            if (me.limit) {
                limit = me.limit.area;
            }

            var targetOverlay = {
                limit: limit,
                type: 'circle',
                point: endPoint,
                overlay: circle,
                overlays: overlays
            };
            operateWindow = new Operate(targetOverlay, me);

            map.addOverlay(moveMarker);
            map.addOverlay(polyline);
            map.addOverlay(radiusWindow);
            map.addOverlay(operateWindow);

            radiusWindow.addEventListener('radiuschange', function (e) {
                var radius = e.radius;
                circle.setRadius(radius);
                var ePoint = getPointByDistance(centerPoint, radius, 'east');
                var dragLeftPoint = new BMapGL.Point(ePoint.lng, centerPoint.lat);
                var halflng = ePoint.lng > centerPoint.lng ? (circle.getBounds().getNorthEast().lng + centerPoint.lng) / 2 : (circle.getBounds().getSouthWest().lng + centerPoint.lng) / 2;
                var halfLeftPoint = new BMapGL.Point(halflng, centerPoint.lat);
                moveMarker.setPosition(dragLeftPoint);
                radiusWindow.setInfo(halfLeftPoint, radius);
                operateWindow.setPosition(dragLeftPoint, true);
                operateWindow.updateWindow();
                polyline.setPath([centerPoint, dragLeftPoint]);
            });

            moveMarker.addEventListener('dragging', function (e) {
                var dragLeftPoint = new BMapGL.Point(e.latLng.lng, centerPoint.lat);
                var halflng = e.latLng.lng > centerPoint.lng ? (circle.getBounds().getNorthEast().lng + centerPoint.lng) / 2 : (circle.getBounds().getSouthWest().lng + centerPoint.lng) / 2;
                var isright = e.latLng.lng > centerPoint.lng ? true : false;
                var halfLeftPoint = new BMapGL.Point(halflng, centerPoint.lat);

                e.target.setPosition(dragLeftPoint);
                radiusWindow.setInfo(halfLeftPoint, me._map.getDistance(centerPoint, e.latLng).toFixed(0));
                operateWindow.setPosition(dragLeftPoint, isright);
                polyline.setPath([centerPoint, dragLeftPoint]);
                radius = me._map.getDistance(centerPoint, e.latLng).toFixed(0);
                circle.setRadius(me._map.getDistance(centerPoint, e.latLng));
            });

            moveMarker.addEventListener('dragend', function (e) {
                operateWindow.updateWindow();
            });

            mask.disableEdgeMove();
            mask.removeEventListener('mousemove', moveAction);
            mask.removeEventListener('mousemove', mousedownAction);
            baidu.un(document, 'mouseup', endAction);
            // me.close();
            map.removeOverlay(mask);
        };

        /**
         * 鼠标点击起始点
         */
        var mousedownAction = function (e) {
            baidu.preventDefault(e);
            baidu.stopBubble(e);

            if (me.controlButton == 'right' && e.button == 1) {
                return;
            }

            if (centerPoint == null) {
                startAction(e);
            }

        };

        /**
         * 非绘制圆形过程中，鼠标移动过程的事件
         */
        var mousemoveAction = function (e) {
            baidu.preventDefault(e);
            baidu.stopBubble(e);

            map.removeOverlay(tip_label);

            tip_label = new BMapGL.Label('按下确认中心点，拖拽确认半径', {
                position: e.point, // 指定文本标注所在的地理位置
                offset: new BMapGL.Size(10, 10) // 设置文本偏移量
            });
            tip_label.setStyle(me.labelOptions);
            map.addOverlay(tip_label);

        };

        var centerDragstart = function (e) {
            map.removeOverlay(moveMarker);
            map.removeOverlay(polyline);
            map.removeOverlay(radiusWindow);
            map.removeOverlay(operateWindow);
        };
        var centerDragging = function (e) {
            centerPoint = e.latLng;
            circle.setCenter(e.latLng);
        };
        var centerDragend = function (e) {
            centerPoint = e.latLng;
            endAction(e);
        };


        mask.addEventListener('mousedown', mousedownAction);
        mask.addEventListener('mousemove', mousemoveAction);
    };

    /**
     * 画线和画多边形相似性比较大，公用一个方法
     */
    DrawingManager.prototype._bindPolylineOrPolygon = function () {
        
        var me = this,
            map = this._map,
            mask = this._mask,
            points = [], // 用户绘制的点
            drawPoint = null, // 实际需要画在地图上的点
            overlay = null,
            match = null,
            isBinded = false;
        function getNorthEast() {
            var bound = arguments[0];
            var maxlng = 0;
            var index = 0;
            for (var j = 0; j < bound.length; j++) {
                if (maxlng < bound[j].lng) {
                    maxlng = bound[j].lng;
                    index = j;
                }
            }
            return bound[index];
        }

        /**
         * 鼠标点击的事件
         */
        var startAction = function (e) {
            if (me.controlButton === 'right' && (e.button === 1 || e.button === 0)) {
                return;
            }

            var point = e.point;
            if (match) {
                point = match;
            }
            points.push(point);

            drawPoint = points.concat(points[points.length - 1]);

            if (points.length == 1) {
                if (me._drawingType == BMAP_DRAWING_POLYLINE) {
                    overlay = new BMapGL.Polyline(drawPoint, me.polylineOptions);
                } else if (me._drawingType == BMAP_DRAWING_POLYGON) {
                    overlay = new BMapGL.Polygon(drawPoint, me.polygonOptions);
                }

                map.addOverlay(overlay);
            } else {
                overlay.setPath(drawPoint);
            }
            if (!isBinded) {
                isBinded = true;
                mask.enableEdgeMove();
                mask.removeEventListener('mousemove', mousemoveAction);
                mask.addEventListener('mousemove', moveAction);
                mask.addEventListener('dblclick', dblclickAction);
            }

        };

        /**
         * 鼠标移动过程的事件
         */
        var moveAction = function (e) {
            var point = e.point;
            if (me._enableSorption) {
                var matchs = me.getSorptionMatch(point, me.overlays, me._sorptionDistance);
                if (matchs && matchs.length > 0) {
                    match = matchs[0].point;
                    overlay.setPositionAt(drawPoint.length - 1, matchs[0].point);
                    return;
                }
            }
            match = null;

            overlay.setPositionAt(drawPoint.length - 1, e.point);

            map.removeOverlay(tip_label);

            tip_label = new BMapGL.Label('单击绘制下一个点，双击完成绘制', {
                position: e.point, // 指定文本标注所在的地理位置
                offset: new BMapGL.Size(10, 10) // 设置文本偏移量
            });
            tip_label.setStyle(me.labelOptions);
            map.addOverlay(tip_label);
        };

        /**
         * 鼠标双击的事件
         */
        var dblclickAction = function (e) {
            baidu.stopBubble(e);
            isBinded = false;
            map.removeOverlay(tip_label);
            mask.disableEdgeMove();
            mask.removeEventListener('mousedown', startAction);
            mask.removeEventListener('mousemove', moveAction);
            mask.removeEventListener('mousemove', mousemoveAction);
            mask.removeEventListener('dblclick', dblclickAction);
    
            if (me.controlButton == 'right') {
                points.push(e.point);
            } else if (baidu.ie <= 8) {
                
            } else {
                points.pop();
            }

            // 裁剪
            try {
                if (me._enableGpc && window.gpcas && 'polygon' === me._drawingType) {
                    var res = new gpcas.geometry.PolyDefault();
                    for (var i = 0; i < points.length; i++) {
                        res.addPoint(new gpcas.Point(points[i].lng, points[i].lat));
                    }
                    for (var j = 0; j < me.overlays.length; j++) {
                        var path = me.overlays[j].getPath();
                        var target = new gpcas.geometry.PolyDefault();
                        for (var i = 0; i < path.length; i++) {
                            target.addPoint(new gpcas.Point(path[i].lng, path[i].lat));
                        }
                        var diff = res.difference(target);
                        var newPoints = diff.getPoints();
                        var outPoints = [];
                        for (var i = 0; i < newPoints.length; i++) {
                            outPoints.push(new BMapGL.Point(newPoints[i].x, newPoints[i].y));
                        }
                        res = new gpcas.geometry.PolyDefault();
                        for (var i = 0; i < newPoints.length; i++) {
                            res.addPoint(new gpcas.Point(newPoints[i].x, newPoints[i].y));
                        }
                        points = outPoints;
                    }
                }
            } catch(e) {
            }

            overlay.setPath(points);
            var cz = map.getViewport(points);
            cz.zoom -= 1;
            map.setViewport(cz);

            overlay.enableEditing();
            var limit = null;
            if (me.limit) {
                limit = 'polygon' === me._drawingType ? me.limit.area : me.limit.distance;
            }

            var targetOverlay = {
                limit: limit,
                type: me._drawingType,
                point: getNorthEast(points),
                overlay: overlay,
                overlays: []
            };

            var operateWindow = new Operate(targetOverlay, me);
            map.addOverlay(operateWindow);

            overlay.addEventListener('lineupdate', function (e) {
                var point = getNorthEast(e.currentTarget.getPath());
                operateWindow.setPosition(point, true);
                operateWindow.updateWindow();
            });

            points.length = 0;
            drawPoint.length = 0;
            // me.close();
            map.removeOverlay(mask);

        };

        /**
         * 非绘制多边形过程中，鼠标移动过程的事件
         */
        var mousemoveAction = function (e) {
            baidu.preventDefault(e);
            baidu.stopBubble(e);

            map.removeOverlay(tip_label);

            tip_label = new BMapGL.Label('单击确认起点', {
                position: e.point, // 指定文本标注所在的地理位置
                offset: new BMapGL.Size(10, 10) // 设置文本偏移量
            });
            tip_label.setStyle(me.labelOptions);
            map.addOverlay(tip_label);
        };

        mask.addEventListener('mousemove', mousemoveAction);

        // mask.addEventListener('mouseup', startAction);
        mask.addEventListener('mousedown', startAction);

        // 双击时候不放大地图级别
        mask.addEventListener('dblclick', function (e) {

            baidu.stopBubble(e);
        });
    };

    /**
     * 绑定鼠标画矩形的事件
     */

    DrawingManager.prototype._bindRectangle = function () {

        var me = this,
            map = this._map,
            mask = this._mask,
            polygon = null,
            startPoint = null;

        
        // 获取4个顶点和4条边中点的坐标
        function getRectAllPoints(pointA, pointB) {
            var pointLT = new BMapGL.Point(pointA.lng, pointA.lat); // 左上角
            var pointRT = new BMapGL.Point(pointB.lng, pointA.lat); // 右上角
            var pointRB = new BMapGL.Point(pointB.lng, pointB.lat); // 右下角
            var pointLB = new BMapGL.Point(pointA.lng, pointB.lat); // 左上角

            var pointTC = new BMapGL.Point((pointA.lng + pointB.lng) / 2, pointA.lat);
            var pointRC = new BMapGL.Point(pointB.lng, (pointA.lat + pointB.lat) / 2);
            var pointBC = new BMapGL.Point((pointA.lng + pointB.lng) / 2, pointB.lat);
            var pointLC = new BMapGL.Point(pointA.lng, (pointA.lat + pointB.lat) / 2);

            return [pointLT, pointTC, pointRT, pointRC, pointRB, pointBC, pointLB, pointLC];
        }

        var moveIcon = new BMapGL.Icon(bulletPng, new BMapGL.Size(10, 10));
        moveIcon.setImageSize(new BMapGL.Size(10, 10));

        /**
         * 开始绘制矩形
         */
        var startAction = function (e) {

            baidu.stopBubble(e);
            baidu.preventDefault(e);
            if (me.controlButton == 'right' && (e.button == 1 || e.button == 0)) {
                return;
            }

            startPoint = e.point;

            var endPoint = startPoint;
            polygon = new BMapGL.Polygon(me._getRectanglePoint(startPoint, endPoint), me.rectangleOptions);
            map.addOverlay(polygon);
            mask.enableEdgeMove();
            mask.addEventListener('mousemove', moveAction);
            baidu.on(document, 'mouseup', endAction);
        };

        /**
         * 绘制矩形过程中，鼠标移动过程的事件
         */
        var moveAction = function (e) {
            map.removeOverlay(tip_label);
            polygon.setPath(me._getRectanglePoint(startPoint, e.point));

            var points = getRectAllPoints(startPoint, e.point);
            var width = me._map.getDistance(startPoint, points[2]).toFixed(0);
            var height = me._map.getDistance(startPoint, points[6]).toFixed(0);
            tip_label = new BMapGL.Label('尺寸：' + width + '米 x ' + height + '米<br>松开结束绘制', {
                position: e.point, // 指定文本标注所在的地理位置
                offset: new BMapGL.Size(10, 10) // 设置文本偏移量
            });
            tip_label.setStyle(me.labelOptions);
            map.addOverlay(tip_label);
        };

        /**
         * 绘制矩形结束
         */
        var endAction = function (e) {
            mask.hide();
            var endPoint = null;
            var markers = [];
            var points = getRectAllPoints(startPoint, e.point);
            var pointsTmp = [];
            var cz = map.getViewport(points);
            cz.zoom -= 1;
            map.setViewport(cz);
            map.removeOverlay(tip_label);

            var width = me._map.getDistance(startPoint, points[2]).toFixed(0);
            var height = me._map.getDistance(startPoint, points[6]).toFixed(0);
            var rectInfo = new Screenshot('rectangle', points[0], {
                width: width,
                height: height
            }, polygon, me);

            for (var i = 0; i < points.length; i++) {
                var marker = new BMapGL.Marker(points[i]);
                marker.setIcon(moveIcon);
                marker.enableDragging();
                markers.push(marker);
                map.addOverlay(marker);
                pointsTmp[i] = me.mc2ll(marker.point);

                marker.addEventListener('mousedown', function (e) {
                    endPoint = me.mc2ll(e.target.point);
                });
                marker.addEventListener('dragging', function (e) {
                    var point = e.latLng;
                    for (var j = 0; j < pointsTmp.length; j++) {
                        if (endPoint.lng == pointsTmp[j].lng) {
                            points[j].lng = point.lng;
                        }

                        if (endPoint.lat == pointsTmp[j].lat) {
                            points[j].lat = point.lat;
                        }

                    }
                    points = getRectAllPoints(points[0], points[4]);
                    for (var j = 0; j < markers.length; j++) {
                        markers[j].setPosition(points[j]);
                    }
                    width = me._map.getDistance(points[0], points[2]).toFixed(0);
                    height = me._map.getDistance(points[0], points[6]).toFixed(0);
                    rectInfo.setInfo(points[0], {
                        width: width,
                        height: height
                    });
                    operateWindow.setPosition(points[3], true);
                    polygon.setPath(points);
                });
                marker.addEventListener('dragend', function (e) {
                    for (var i = 0; i < markers.length; i++) {
                        var marker = markers[i];
                        pointsTmp[i] = me.mc2ll(marker.point);
                    }
                    operateWindow.updateWindow();
                });
            }

            rectInfo.addEventListener('rectwhchange', function (e) {
                var width = e.width;
                var height = e.height;
                var pointx = getPointByDistance(points[0], width, 'east');
                var pointy = getPointByDistance(points[0], height, 'south');
                points[4].lng = pointx.lng;
                points[4].lat = pointy.lat;
                points = getRectAllPoints(points[0], points[4]);
                for (var j = 0; j < markers.length; j++) {
                    markers[j].setPosition(points[j]);
                }
                rectInfo.setInfo(points[0], {
                    width: width,
                    height: height
                });
                operateWindow.setPosition(points[3], true);
                polygon.setPath(points);
                for (var i = 0; i < markers.length; i++) {
                    var marker = markers[i];
                    pointsTmp[i] = me.mc2ll(marker.point);
                }
                operateWindow.updateWindow();
            });

            var overlays = [markers, rectInfo];
            var limit = null;
            if (me.limit) {
                limit = me.limit.area;
            }

            var overlay = {
                limit: limit,
                type: 'rectangle',
                point: points[3],
                overlay: polygon,
                overlays: overlays
            };

            var operateWindow = new Operate(overlay, me);
            map.addOverlay(operateWindow);
            map.addOverlay(rectInfo);

            mask.disableEdgeMove();
            mask.removeEventListener('mousemove', moveAction);
            mask.removeEventListener('mousemove', mousemoveAction);
            baidu.un(document, 'mouseup', endAction);
            // me.close();
            map.removeOverlay(mask);
        };

        /**
         * 非绘制矩形过程中，鼠标移动过程的事件
         */
        var mousemoveAction = function (e) {
            baidu.preventDefault(e);
            baidu.stopBubble(e);

            map.removeOverlay(tip_label);

            tip_label = new BMapGL.Label('按住确认起点，拖拽进行绘制', {
                position: e.point, // 指定文本标注所在的地理位置
                offset: new BMapGL.Size(10, 10) // 设置文本偏移量
            });
            tip_label.setStyle(me.labelOptions);
            map.addOverlay(tip_label);
        };

        mask.addEventListener('mousedown', startAction);
        mask.addEventListener('mousemove', mousemoveAction);
    };

    /**
     * 添加显示所绘制图形的面积或者长度
     * @param {overlay} 覆盖物
     * @param {point} 显示的位置
     */
    DrawingManager.prototype._calculate = function (overlay, point) {
        var result = {
            data: 0, // 计算出来的长度或面积
            label: null // 显示长度或面积的label对象
        };

        if (this._enableCalculate && BMapGLLib.GeoUtils) {
            var type = overlay.toString();
            // 不同覆盖物调用不同的计算方法
            switch (type) {
                case 'Polyline': //[object Polyline]==>在3D版本中已经转为了Polyline
                    result.data = BMapGLLib.GeoUtils.getPolylineDistance(overlay);
                    break;
                case 'Polygon':
                    result.data = BMapGLLib.GeoUtils.getPolygonArea(overlay);
                    break;
                case 'Circle':
                    var radius = overlay.getRadius();
                    result.data = Math.PI * radius * radius;
                    break;
            }
            // 异常情况处理
            if (!result.data || result.data < 0) {
                result.data = 0;
                // console.error('计算函数异常处理');
            } else {
                // 保留2位小数位
                result.data = result.data.toFixed(2);
            }

            /**
             * 这里我们只需要开启计算面积功能，但并不需要在地图上添加显示面积的label，所以注释掉
             */
            // result.label = this._addLabel(point, result.data);
        }
        return result;
    };

    /**
     * 开启测距和测面功能需要依赖于GeoUtils库
     * 所以这里判断用户是否已经加载,若未加载则用js动态加载
     */
    DrawingManager.prototype._addGeoUtilsLibrary = function () {
        if (!BMapGLLib.GeoUtils) {
            var script = document.createElement('script');
            script.setAttribute('type', 'text/javascript');
            script.setAttribute('src', '//mapopen.cdn.bcebos.com/github/BMapGLLib/GeoUtils/src/GeoUtils.min.js');
            // script.setAttribute('src', '../../GeoUtils/GeoUtils.js');
            document.body.appendChild(script);
        }

    };

    /**
     * 开启裁剪功能需要依赖于gpc库
     * 所以这里判断用户是否已经加载,若未加载则用js动态加载
     */
    DrawingManager.prototype._addGPCLibrary = function () {
        if (!window.gpcas) {
            var script = document.createElement('script');
            script.setAttribute('type', 'text/javascript');
            script.setAttribute('src', '//mapopen.cdn.bcebos.com/github/BMapGLLib/DrawingManager/src/gpc.js');
            // script.setAttribute('src', '../src/gpc.js');
            document.body.appendChild(script);
        }

    };

    /**
     * 向地图中添加文本标注
     * @param {Point}
     * @param {String} 所以显示的内容
     */
    DrawingManager.prototype._addLabel = function (point, content) {
        var label = new BMapGL.Label(content, {
            position: point
        });
        this._map.addOverlay(label);
        return label;
    };

    /**
     * 根据起终点获取矩形的四个顶点
     * @param {Point} 起点
     * @param {Point} 终点
     */
    DrawingManager.prototype._getRectanglePoint = function (startPoint, endPoint) {
        return [
            new BMapGL.Point(startPoint.lng, startPoint.lat),
            new BMapGL.Point(endPoint.lng, startPoint.lat),
            new BMapGL.Point(endPoint.lng, endPoint.lat),
            new BMapGL.Point(startPoint.lng, endPoint.lat)
        ];
    };

    /**
     * 派发成功事件
     */
    DrawingManager.prototype._dispatchOverlayComplete = function (overlay, calculate) {
        var options = {
            overlay: overlay,
            drawingMode: this._drawingType
        };
        if (calculate) {
            options.calculate = calculate.data || null;
            options.label = calculate.label || null;
        }

        this.dispatchEvent(this._drawingType + 'complete', overlay);
        this.dispatchEvent('overlaycomplete', options);
    };

    /**
     * 派发失败事件
     */
    DrawingManager.prototype._dispatchOverlayCancel = function (overlay) {
        var options = {
            overlay: overlay,
            drawingMode: this._drawingType
        };

        this.dispatchEvent(this._drawingType + 'cancel', overlay);
        this.dispatchEvent('overlaycancel', options);
    };

    // 判断吸附算法
    DrawingManager.prototype.getSorptionMatch = function (point, polygons, distance) {
        distance = distance || 20;
        var map = this._map;
        var P = map.pointToPixel(point); // point.pixel;
        var match = [];
        for (var j = 0; j < polygons.length; j++) {
            var pixels = polygons[j].getPath();
            var first = pixels[0];
            var last = pixels[pixels.length - 1];
            if (!first.equals(last)) {
                pixels.push(pixels[0]);
            }
            for (var i = 1; i < pixels.length; i++) {
                var A = map.pointToPixel(pixels[i - 1]);
                var B = map.pointToPixel(pixels[i]);
                var vAP = [P.x - A.x, P.y - A.y];
                var vAB = [B.x - A.x, B.y - A.y];
                var vPB = [B.x - P.x, B.y - P.y];
                var cAPAB = vAP[0] * vAB[0] + vAP[1] * vAB[1];
                var lAPAB = Math.sqrt(Math.pow(vAP[0], 2) + Math.pow(vAP[1], 2)) * Math.sqrt(Math.pow(vAB[0], 2) + Math.pow(vAB[1], 2));
                var rPAB = Math.acos(cAPAB / lAPAB);
                var cABPB = vAB[0] * vPB[0] + vAB[1] * vPB[1];
                var lABPB = Math.sqrt(Math.pow(vAB[0], 2) + Math.pow(vAB[1], 2)) * Math.sqrt(Math.pow(vPB[0], 2) + Math.pow(vPB[1], 2));
                var rPBA = Math.acos(cABPB / lABPB);
                if (rPAB < Math.PI / 2 && rPBA < Math.PI / 2) {
                    var lAP = Math.sqrt(Math.pow(vAP[0], 2) + Math.pow(vAP[1], 2));
                    var lAB = Math.sqrt(Math.pow(vAB[0], 2) + Math.pow(vAB[1], 2));
                    var lAO = Math.cos(rPAB) * lAP;
                    var pAOAB = lAO / lAB;
                    var lPO = Math.sin(rPAB) * lAP;
                    var O = [A.x + vAB[0] * pAOAB, A.y + vAB[1] * pAOAB];
                    if (lPO < distance) {
                        match.push({
                            point: map.pixelToPoint({
                                x: O[0],
                                y: O[1]
                            }),
                            length: lPO
                        });
                    }
                }
            }
        }
        match.sort(function (a, b) {
            return a.length - b.length;
        });
        var ret = match.length > 0 ? match : null;
        return ret;
    }

    // 墨卡托坐标转经纬度
    DrawingManager.prototype.mc2ll = function (point) {
        var map = this._map;
        var ll = map.mercatorToLnglat(point.lng, point.lat);
        return new BMapGL.Point(ll[0], ll[1]);
    };

    // 经纬度坐标转墨卡托
    DrawingManager.prototype.ll2mc = function (point) {
        var map = this._map;
        var mc = map.lnglatToMercator(point.lng, point.lat);
        return new BMapGL.Point(mc[0], mc[1]);
    };

    // 确认,取消操作覆盖物
    function Operate(data, DrawingManager) {
        this.limit = data.limit;
        this.type = data.type;
        this.point = data.point;
        this.overlay = data.overlay;
        this.overlays = data.overlays;
        this.DrawingManager = DrawingManager;
    }

    Operate.prototype = new BMapGL.Overlay();
    Operate.prototype.dispatchEvent = baidu.lang.Class.prototype.dispatchEvent;
    Operate.prototype.addEventListener = baidu.lang.Class.prototype.addEventListener;
    Operate.prototype.removeEventListener = baidu.lang.Class.prototype.removeEventListener;

    Operate.prototype.initialize = function (map) {
        var me = this;
        this._map = map;
        var overlyTypeText = (this.type === 'polyline' ? '长度' : '面积');
        var unit = (this.type === 'polyline' ? '万米' : '万平方米');
        var div = this.div = document.createElement('div');
        div.className = 'operateWindow';
        var html = '<div><span id="confirmOperate"></span><span id="cancelOperate"></span><span id="warnOperate">' + overlyTypeText + '不超过' + this.limit / 10000 + unit + '！</span></div>';
        div.innerHTML = html;
        this._map.getPanes().markerPane.appendChild(div);
        this.updateWindow();
        this._bind();
        return div;
    };

    Operate.prototype._bind = function () {
        var that = this;
        var map = this._map;
        var overlay = this.overlay;
        var overlays = this.overlays;
        document.getElementById('confirmOperate').addEventListener('click', function (e) {
            map.removeOverlay(that);

            if (that.type == 'rectangle') {
                var calculate = that.DrawingManager._calculate(overlay, overlay.getPath());
                that.DrawingManager.overlays.push(overlay);
            }
            else if (that.type == 'circle') {
                var calculate = that.DrawingManager._calculate(overlay, that.point);
                that.DrawingManager.overlays.push(overlay);
            }
            else if (that.type == 'polygon') {
                var calculate = that.DrawingManager._calculate(overlay, (overlay.getPath()));
                that.DrawingManager.overlays.push(overlay);
                overlay.disableEditing();
            }
            else if (that.type == 'polyline') {
                var calculate = that.DrawingManager._calculate(overlay, (overlay.getPath()));
                that.DrawingManager.overlays.push(overlay);
                overlay.disableEditing();
            }

            that.DrawingManager._dispatchOverlayComplete(overlay, calculate);

            for (var i = 0; i < overlays.length; i++) {
                if (Array.isArray(overlays[i])) {
                    for (var k in overlays[i]) {
                        map.removeOverlay(overlays[i][k]);
                    }
                } else {
                    map.removeOverlay(overlays[i]);
                }
            }
            that.DrawingManager.close();
        });
        document.getElementById('cancelOperate').addEventListener('click', function (e) {
            map.removeOverlay(that);
            for (var i = 0; i < overlays.length; i++) {
                if (Array.isArray(overlays[i])) {
                    for (var k in overlays[i]) {
                        map.removeOverlay(overlays[i][k]);
                    }
                } else {
                    map.removeOverlay(overlays[i]);
                }
            }
            map.removeOverlay(overlay);

            that.DrawingManager._dispatchOverlayCancel(overlay);
            // that.DrawingManager._mask.show();
            // that.DrawingManager._setDrawingMode(that.type);
            that.DrawingManager.close();
        });
    };

    Operate.prototype.updateWindow = function () {
        if (this.domElement === null) {
            return;
        }
        var overlay = this.overlay;
        var limit = this.limit;
        var calculate;
        if (this.type == 'rectangle') {
            calculate = this.DrawingManager._calculate(overlay, overlay.getPath());
        }
        else if (this.type == 'circle') {
            calculate = this.DrawingManager._calculate(overlay, this.point);
        }
        else if (this.type == 'polygon') {
            calculate = this.DrawingManager._calculate(overlay, overlay.getPath());
        }
        else if (this.type == 'polyline') {
            calculate = this.DrawingManager._calculate(overlay, overlay.getPath());
        }

        if (Object.prototype.toString.call(limit) === '[object Number]' && calculate.data > limit) {
            document.getElementById('confirmOperate').style.display = 'none';
            document.getElementById('warnOperate').style.display = 'block';
        }
        else {
            document.getElementById('confirmOperate').style.display = 'block';
            document.getElementById('warnOperate').style.display = 'none';
        }
    };

    Operate.prototype.setPosition = function (point, isright) {
        this.point = point;
        var map = this._map,
            pixel = map.pointToOverlayPixel(this.point);
        if (isright) {
            this.div.classList.remove('operateLeft');
            this.div.style.left = pixel.x + 15 + 'px';
        }
        else {
            this.div.classList.add('operateLeft');
            this.div.style.left = pixel.x - 105 + 'px';
        }
        this.div.style.top = pixel.y - 16 + 'px';
    };

    Operate.prototype.draw = function () {
        var map = this._map,
            pixel = map.pointToOverlayPixel(this.point);
        this.div.style.left = pixel.x + 15 + 'px';
        this.div.style.top = pixel.y - 16 + 'px';
    };

    // 显示,编辑半径覆盖物
    function Screenshot(type, point, number, overlay, DrawingManager) {
        this.type = type;
        this.point = point;
        this.number = number;
        this.overlay = overlay;
        this.DrawingManager = DrawingManager;
    }

    Screenshot.prototype = new BMapGL.Overlay();

    Screenshot.prototype.dispatchEvent = baidu.lang.Class.prototype.dispatchEvent;
    Screenshot.prototype.addEventListener = baidu.lang.Class.prototype.addEventListener;
    Screenshot.prototype.removeEventListener = baidu.lang.Class.prototype.removeEventListener;

    Screenshot.prototype.initialize = function (map) {
        var me = this;
        this._map = map;
        var div = this.div = document.createElement('div');
        div.className = 'screenshot';
        if (this.type == 'circle') {
            var html = '<div class="circlShot"><span id="screenshotNum">' + this.number + '</span><input id="circleInput" type="text" /><span class="unit">米</span></div>';
        }
        else if (this.type == 'rectangle') {
            var html = '<div class="rectWH"><div class="wh"><span id="rectWidth">' + this.number.width + '</span><input id="rectWidthInput" type="text" /></div><span class="multiple">x</span><div class="wh"><span id="rectHeight">' + this.number.height + '</span><input id="rectHeightInput" type="text" /></div><span class="unit">米</span></div>';
        }

        div.innerHTML = html;
        this._map.getPanes().markerPane.appendChild(div);
        this._bind();
        return div;
    };

    Screenshot.prototype._bind = function () {
        this.setNumber(this.number);

        if (this.type == 'circle') {
            this.bindCircleEvent();
        } else {
            this.bindRectEvent();
        }
    };

    Screenshot.prototype.bindCircleEvent = function () {
        var that = this;
        var circleSpn = document.getElementById('screenshotNum');
        var circleInput = document.getElementById('circleInput');
        circleSpn.addEventListener('click', function (e) {
            var val = circleSpn.innerText;
            circleSpn.style.display = 'none';
            circleInput.value = val;
            circleInput.style.display = 'inline-block';
            circleInput.focus();
        });
        circleInput.addEventListener('click', function (e) {
            circleInput.focus();
        });
        circleInput.addEventListener('keydown', function (e) {
            if (e.keyCode === 13) {
                var val = circleInput.value;
                circleInput.style.display = 'none';
                circleSpn.style.display = 'inline-block';
                circleSpn.innerText = val;
                var opt = {
                    radius: val,
                    overlay: that.overlay
                };
                that._dispatchRadiusChange(opt);
            }
        });
        circleInput.addEventListener('blur', function (e) {
            var val = circleInput.value;
            circleInput.style.display = 'none';
            circleSpn.style.display = 'inline-block';
            circleSpn.innerText = val;
            var opt = {
                radius: val,
                overlay: that.overlay
            };
            that._dispatchRadiusChange(opt);
        });
    };

    Screenshot.prototype.bindRectEvent = function () {
        var that = this;
        var rectWidthSpn = document.getElementById('rectWidth');
        var rectWidthInput = document.getElementById('rectWidthInput');
        var rectHeightSpn = document.getElementById('rectHeight');
        var rectHeightInput = document.getElementById('rectHeightInput');
        rectWidthInput.value = rectWidthSpn.innerText;
        rectHeightInput.value = rectHeightSpn.innerText;
        rectWidthSpn.addEventListener('click', function (e) {
            var val = rectWidthSpn.innerText;
            rectWidthSpn.style.display = 'none';
            rectWidthInput.value = val;
            rectWidthInput.style.display = 'inline-block';
            rectWidthInput.focus();
        });
        rectHeightSpn.addEventListener('click', function (e) {
            var val = rectHeightSpn.innerText;
            rectHeightSpn.style.display = 'none';
            rectHeightInput.value = val;
            rectHeightInput.style.display = 'inline-block';
            rectHeightInput.focus();
        });
        rectWidthInput.addEventListener('click', function (e) {
            rectWidthInput.focus();
        });
        rectHeightInput.addEventListener('click', function (e) {
            rectHeightInput.focus();
        });
        rectWidthInput.addEventListener('keydown', function (e) {
            if (e.keyCode === 13) {
                var widthVal = rectWidthInput.value;
                var heightVal = rectHeightInput.value;
                rectWidthInput.style.display = 'none';
                rectHeightInput.style.display = 'none';
                rectWidthSpn.style.display = 'inline-block';
                rectHeightSpn.style.display = 'inline-block';
                rectWidthSpn.innerText = widthVal;
                rectHeightSpn.innerText = heightVal;
                var opt = {
                    width: widthVal,
                    height: heightVal,
                    overlay: that.overlay
                };
                that._dispatchRectWHChange(opt);
            }
        });
        rectHeightInput.addEventListener('keydown', function (e) {
            if (e.keyCode === 13) {
                var widthVal = rectWidthInput.value;
                var heightVal = rectHeightInput.value;
                rectWidthInput.style.display = 'none';
                rectHeightInput.style.display = 'none';
                rectWidthSpn.style.display = 'inline-block';
                rectHeightSpn.style.display = 'inline-block';
                rectWidthSpn.innerText = widthVal;
                rectHeightSpn.innerText = heightVal;
                var opt = {
                    width: widthVal,
                    height: heightVal,
                    overlay: that.overlay
                };
                that._dispatchRectWHChange(opt);
            }
        });
    };

    Screenshot.prototype.setInfo = function (point, number) {
        this.setNumber(number);
        this.setPosition(point);
    };

    Screenshot.prototype.setNumber = function (number) {
        if (this.type == 'circle') {
            document.getElementById('screenshotNum').textContent = number;
        }
        else {
            document.getElementById('rectWidth').textContent = number.width;
            document.getElementById('rectHeight').textContent = number.height;
        }
    };

    Screenshot.prototype.setPosition = function (point) {
        this.point = point;
        var map = this._map,
            type = this.type,
            pixel = map.pointToOverlayPixel(this.point);
        if (type == 'circle') {
            this.div.style.left = pixel.x - 30 + 'px';
            this.div.style.top = pixel.y - 40 + 'px';
        }
        else if (type == 'rectangle') {
            this.div.style.left = pixel.x + 'px';
            this.div.style.top = pixel.y - 45 + 'px';
        }

    };

    Screenshot.prototype.draw = function () {
        var map = this._map,
            type = this.type,
            pixel = map.pointToOverlayPixel(this.point);
        if (type == 'circle') {
            this.div.style.left = pixel.x - 30 + 'px';
            this.div.style.top = pixel.y - 40 + 'px';
        }
        else if (type == 'rectangle') {
            this.div.style.left = pixel.x + 'px';
            this.div.style.top = pixel.y - 45 + 'px';
        }

    };

    /**
     * 派发事件
     */
    Screenshot.prototype._dispatchRadiusChange = function (opt) {        
        this.dispatchEvent('radiuschange', opt);
    };

    /**
     * 派发事件
     */
    Screenshot.prototype._dispatchRectWHChange = function (opt) {
        this.dispatchEvent('rectwhchange', opt);
    };

    /**
     * 创建遮罩对象
     */
    function Mask() {

        /**
         * 鼠标到地图边缘的时候是否自动平移地图
         */
        this._enableEdgeMove = false;
    }

    Mask.prototype = new BMapGL.Overlay();

    /**
     * 这里不使用api中的自定义事件，是为了更灵活使用
     */
    Mask.prototype.dispatchEvent = baidu.lang.Class.prototype.dispatchEvent;
    Mask.prototype.addEventListener = baidu.lang.Class.prototype.addEventListener;
    Mask.prototype.removeEventListener = baidu.lang.Class.prototype.removeEventListener;

    Mask.prototype.initialize = function (map) {
        var me = this;
        this._map = map;
        var div = this.container = document.createElement('div');
        var size = this._map.getSize();
        div.style.cssText = 'position:absolute;background:transparent;cursor:crosshair;width:' + size.width + 'px;height:' + size.height + 'px';
        this._map.addEventListener('resize', function (e) {
            me._adjustSize(e.size);
        });
        this._map.getPanes().floatPane.appendChild(div);
        this._bind();
        return div;
    };

    Mask.prototype.draw = function () {
        var map = this._map,
            point = map.pixelToPoint(new BMapGL.Pixel(0, 0)),
            pixel = map.pointToOverlayPixel(point);
        this.container.style.left = pixel.x + 'px';
        this.container.style.top = pixel.y + 'px';
    };

    /**
     * 开启鼠标到地图边缘，自动平移地图
     */
    Mask.prototype.enableEdgeMove = function () {
        this._enableEdgeMove = true;
    };

    /**
     * 关闭鼠标到地图边缘，自动平移地图
     */
    Mask.prototype.disableEdgeMove = function () {
        clearInterval(this._edgeMoveTimer);
        this._enableEdgeMove = false;
    };

    /**
     * 绑定事件,派发自定义事件
     */
    Mask.prototype._bind = function () {

        var me = this,
            map = this._map,
            container = this.container,
            lastMousedownXY = null,
            lastClickXY = null;

        /**
         * 根据event对象获取鼠标的xy坐标对象
         * @param {Event}
         * @return {Object} {x:e.x, y:e.y}
         */
        var getXYbyEvent = function (e) {
            return {
                x: e.clientX,
                y: e.clientY
            };
        };

        var domEvent = function (e) {
            var type = e.type;
            e = baidu.getEvent(e);
            point = me.getDrawPoint(e); // 当前鼠标所在点的地理坐标

            var dispatchEvent = function (type) {
                e.point = point;
                me.dispatchEvent(e);
            };

            if (type == 'mousedown') {
                lastMousedownXY = getXYbyEvent(e);
            }

            var nowXY = getXYbyEvent(e);
            // click经过一些特殊处理派发，其他同事件按正常的dom事件派发
            if (type == 'click') {
                // 鼠标点击过程不进行移动才派发click和dblclick
                if (Math.abs(nowXY.x - lastMousedownXY.x) < 5 && Math.abs(nowXY.y - lastMousedownXY.y) < 5) {
                    if (!lastClickXY || !(Math.abs(nowXY.x - lastClickXY.x) < 5 && Math.abs(nowXY.y - lastClickXY.y) < 5)) {
                        dispatchEvent('click');
                        lastClickXY = getXYbyEvent(e);
                    } else {
                        lastClickXY = null;
                    }
                }
            } else {
                dispatchEvent(type);
            }
        };

        /**
         * 将事件都遮罩层的事件都绑定到domEvent来处理
         */
        var events = ['click', 'mousedown', 'mousemove', 'mouseup', 'dblclick'],
            index = events.length;
        while (index--) {
            baidu.on(container, events[index], domEvent);
        }

        // 鼠标移动过程中，到地图边缘后自动平移地图
        baidu.on(container, 'mousemove', function (e) {
            if (me._enableEdgeMove) {
                me.mousemoveAction(e);
            }

        });
    };

    // 鼠标移动过程中，到地图边缘后自动平移地图
    Mask.prototype.mousemoveAction = function (e) {
        function getClientPosition(e) {
            var clientX = e.clientX,
                clientY = e.clientY;
            if (e.changedTouches) {
                clientX = e.changedTouches[0].clientX;
                clientY = e.changedTouches[0].clientY;
            }

            return new BMapGL.Pixel(clientX, clientY);
        }

        var map = this._map,
            me = this,
            pixel = map.pointToPixel(this.getDrawPoint(e)),
            clientPos = getClientPosition(e),
            offsetX = clientPos.x - pixel.x,
            offsetY = clientPos.y - pixel.y;
        pixel = new BMapGL.Pixel((clientPos.x - offsetX), (clientPos.y - offsetY));
        this._draggingMovePixel = pixel;
        var point = map.pixelToPoint(pixel),
            eventObj = {
                pixel: pixel,
                point: point
            };
        // 拖拽到地图边缘移动地图
        this._panByX = this._panByY = 0;
        if (pixel.x <= 20 || pixel.x >= map.width - 20 ||
            pixel.y <= 50 || pixel.y >= map.height - 10) {
            if (pixel.x <= 20) {
                this._panByX = 8;
            }
            else if (pixel.x >= map.width - 20) {
                this._panByX = -8;
            }

            if (pixel.y <= 50) {
                this._panByY = 8;
            }
            else if (pixel.y >= map.height - 10) {
                this._panByY = -8;
            }

            if (!this._edgeMoveTimer) {
                this._edgeMoveTimer = setInterval(function () {
                    map.panBy(me._panByX, me._panByY, {
                        noAnimation: true
                    });
                }, 30);
            }
        } else {
            if (this._edgeMoveTimer) {
                clearInterval(this._edgeMoveTimer);
                this._edgeMoveTimer = null;
            }
        }
    };

    /*
     * 调整大小
     * @param {Size}
     */
    Mask.prototype._adjustSize = function (size) {
        this.container.style.width = size.width + 'px';
        this.container.style.height = size.height + 'px';
    };

    /**
     * 获取当前绘制点的地理坐标
     *
     * @param {Event} e e对象
     * @return Point对象的位置信息
     */
    Mask.prototype.getDrawPoint = function (e) {

        var map = this._map,
            trigger = baidu.getTarget(e),
            x = e.offsetX || e.layerX || 0,
            y = e.offsetY || e.layerY || 0;
        if (trigger.nodeType != 1) {
            trigger = trigger.parentNode;
        }

        while (trigger && trigger != map.getContainer()) {
            if (!(trigger.clientWidth == 0 &&
                trigger.clientHeight == 0 &&
                trigger.offsetParent && trigger.offsetParent.nodeName == 'TD')) {
                x += trigger.offsetLeft || 0;
                y += trigger.offsetTop || 0;
            }

            trigger = trigger.offsetParent;
        }
        var pixel = new BMapGL.Pixel(x, y);
        var point = map.pixelToPoint(pixel);
        return point;

    };

    /**
     * 绘制工具面板，自定义控件
     */
    function DrawingTool(drawingManager, drawingToolOptions) {
        this.drawingManager = drawingManager;

        drawingToolOptions = this.drawingToolOptions = drawingToolOptions || {};
        this._opts = {};
        // 默认停靠位置和偏移量
        this.defaultAnchor = BMAP_ANCHOR_TOP_LEFT;
        this.defaultOffset = new BMapGL.Size(10, 10);

        // 默认所有工具栏都显示
        this.defaultDrawingModes = [
            BMAP_DRAWING_MARKER,
            BMAP_DRAWING_CIRCLE,
            BMAP_DRAWING_POLYLINE,
            BMAP_DRAWING_POLYGON,
            BMAP_DRAWING_RECTANGLE
        ];
        // 工具栏可显示的绘制模式
        if (drawingToolOptions.drawingModes) {
            this.drawingModes = drawingToolOptions.drawingModes;
        } else {
            this.drawingModes = this.defaultDrawingModes;
        }

        // 用户设置停靠位置和偏移量
        if (drawingToolOptions.hasCustomStyle) {
            if (drawingToolOptions.anchor) {
                this.setAnchor(drawingToolOptions.anchor);
            }

            if (drawingToolOptions.offset) {
                this.setOffset(drawingToolOptions.offset);
            }
        }
    }

    // 通过JavaScript的prototype属性继承于BMap.Control
    DrawingTool.prototype = new BMapGL.Control();

    // 自定义控件必须实现自己的initialize方法,并且将控件的DOM元素返回
    // 在本方法中创建个div元素作为控件的容器,并将其添加到地图容器中
    DrawingTool.prototype.initialize = function (map) {
        // 创建一个DOM元素
        var container = this.container = document.createElement('div');
        container.className = 'BMapGLLib_Drawing';
        // 用来设置外层边框阴影
        var panel = this.panel = document.createElement('div');
        panel.className = 'BMapGLLib_Drawing_panel';
        if (this.drawingToolOptions && this.drawingToolOptions.hasCustomStyle && this.drawingToolOptions.scale) {
            this._setScale(this.drawingToolOptions.scale);
        }

        container.appendChild(panel);
        // 添加内容
        var content = this._generalHtml();
        panel.appendChild(content);
        // 添加tip
        var tip = this.tip = document.createElement('div');
        tip.className = 'BMapGLLib_tip';
        tip.innerHTML = '<p class="BMapGLLib_tip_title"></p><p class="BMapGLLib_tip_text"></p>';
        if (this.drawingToolOptions.enableTips === true) {
            panel.appendChild(tip);
        }
        // 绑定事件
        this._bind(panel);
        // 添加DOM元素到地图中
        if (this.drawingToolOptions.customContainer) {
            baidu.g(this.drawingToolOptions.customContainer).appendChild(container);
        } else {
            map.getContainer().appendChild(container);
        }
        // 将DOM元素返回
        return container;
    };

    // 生成工具栏的html元素
    DrawingTool.prototype._generalHtml = function (map) {
        var that = this;
        // 鼠标经过工具栏上的提示信息
        var tips = {};
        tips.hander = '拖动地图';
        tips[BMAP_DRAWING_MARKER] = '画点';
        tips[BMAP_DRAWING_CIRCLE] = '圆形工具';
        tips[BMAP_DRAWING_POLYLINE] = '画折线';
        tips[BMAP_DRAWING_POLYGON] = '多边形工具';
        tips[BMAP_DRAWING_RECTANGLE] = '矩形工具';

        var getItem = function (className, drawingType) {
            var ele = document.createElement('a');
            ele.className = className;
            ele.href = 'javascript:void(0)';
            ele.setAttribute('drawingType', drawingType);
            ele.setAttribute('onfocus', 'this.blur()');
            ele.addEventListener('mouseenter', function (e) {
                var drawingType = e.target.getAttribute('drawingType');
                var title = tips[drawingType];
                if (drawingType === 'hander') {
                    that.tip.children[0].innerText = title;
                    that.tip.children[1].innerText = '使用鼠标拖动地图';
                } else {
                    that.tip.className += ' ' + drawingType;
                    that.tip.children[0].innerText = title;
                    that.tip.children[1].innerText = '使用' + title + '选出目标区域';
                }
                that.tip.style.display = 'block';
            });
            ele.addEventListener('mouseleave', function (e) {
                // remove class drawingType
                var drawingType = e.target.getAttribute('drawingType');
                var newClass = ' ' + that.tip.className.replace(/[\t\r\n]/g, '') + ' ';
                while (newClass.indexOf(' ' + drawingType + ' ') >= 0) {
                    newClass = newClass.replace(' ' + drawingType + ' ', ' ');
                }
                that.tip.className = newClass.replace(/^\s+|\s+$/g, '');

                that.tip.style.display = 'none';
            });
            return ele;
        };

        // 生成工具
        var fragment = document.createDocumentFragment();
        // 取消hander工具的展示，交互改为再次点击tool取消active功能
        // fragment.appendChild(getItem('BMapGLLib_box BMapGLLib_hander', 'hander'));
        for (var i = 0, len = this.drawingModes.length; i < len; i++) {
            var classStr = 'BMapGLLib_box BMapGLLib_' + this.drawingModes[i];
            if (i == len - 1) {
                classStr += ' BMapGLLib_last';
            }

            fragment.appendChild(getItem(classStr, this.drawingModes[i]));
        }

        return fragment;
    };

    /**
     * 设置工具栏的缩放比例
     */
    DrawingTool.prototype._setScale = function (scale) {
        var width = 390,
            height = 50,
            ml = -parseInt((width - width * scale) / 2, 10),
            mt = -parseInt((height - height * scale) / 2, 10);
        this.container.style.cssText = [
            '-moz-transform: scale(' + scale + ');',
            '-o-transform: scale(' + scale + ');',
            '-webkit-transform: scale(' + scale + ');',
            'transform: scale(' + scale + ');',
            'margin-left:' + ml + 'px;',
            'margin-top:' + mt + 'px;',
            '*margin-left:0px;', // ie6、7
            '*margin-top:0px;', // ie6、7
            'margin-left:0px\\0;', // ie8
            'margin-top:0px\\0;', // ie8
            // ie下使用滤镜
            'filter: progid:DXImageTransform.Microsoft.Matrix(',
            'M11=' + scale + ',',
            'M12=0,',
            'M21=0,',
            'M22=' + scale + ',',
            'SizingMethod=\'auto expand\');'
        ].join('');
    };

    // 绑定工具栏的事件
    DrawingTool.prototype._bind = function (panel) {
        var me = this;
        baidu.on(this.panel, 'click', function (e) {
            var target = baidu.getTarget(e);
            var drawingType = target.getAttribute('drawingType');
            me.setStyleByDrawingMode(drawingType);
            me._bindEventByDraingMode(drawingType);
        });
    };

    // 设置工具栏当前选中的项样式
    DrawingTool.prototype.setStyleByDrawingMode = function (drawingType) {
        if (!drawingType) {
            return;
        }

        var boxs = this.panel.getElementsByTagName('a');
        for (var i = 0, len = boxs.length; i < len; i++) {
            var box = boxs[i];
            if (box.getAttribute('drawingType') == drawingType) {
                var classStr = 'BMapGLLib_box BMapGLLib_' + drawingType + '_hover';
                if (i == len - 1) {
                    classStr += ' BMapGLLib_last';
                }

                box.className = classStr;
            } else {
                box.className = box.className.replace(/_hover/, '');
            }
        }
    };

    // 设置工具栏当前选中的项样式
    DrawingTool.prototype._bindEventByDraingMode = function (drawingType) {
        var me = this;
        var drawingManager = this.drawingManager;
        // 点在拖拽地图的按钮上
        // hander工具的逻辑
        // if (drawingType == 'hander') {
        //     drawingManager.close();
        //     drawingManager._map.enableDoubleClickZoom();
        // }
        // else {
        //     drawingManager.setDrawingMode(drawingType);
        //     drawingManager.open();
        //     drawingManager._map.disableDoubleClickZoom();
        // }

        // 关闭hander工具的逻辑
        if (drawingManager._isOpen && drawingManager.getDrawingMode() === drawingType) {
            drawingManager.close();
            drawingManager._map.enableDoubleClickZoom();
        } else {
            drawingManager.setDrawingMode(drawingType);
            drawingManager.open();
            drawingManager._map.disableDoubleClickZoom();
        }
    };

    // 用来存储用户实例化出来的drawingmanager对象
    var instances = [];

    /*
     * 关闭其他实例的绘制模式
     * @param {DrawingManager} 当前的实例
     */
    function closeInstanceExcept(instance) {
        var index = instances.length;
        while (index--) {
            if (instances[index] != instance) {
                instances[index].close();
            }

        }
    }

    function drawcircle(center, radius) {
        var points = [];
        var cx = center["lng"],
            cy = center["lat"];
        var d = radius / 6378800, // circle radius / meters of Earth radius = radians
            lat1 = (Math.PI / 180) * cy,
            lng1 = (Math.PI / 180) * cx;

        for (var i = 0; i < 271; i += 9) {
            var tc = (Math.PI / 180) * i,
                y = Math.asin(Math.sin(lat1) * Math.cos(d) + Math.cos(lat1) * Math.sin(d) * Math.cos(tc)),
                dlng = Math.atan2(Math.sin(tc) * Math.sin(d) * Math.cos(lat1), Math.cos(d) - Math.sin(lat1) * Math.sin(y)),
                x = ((lng1 - dlng + Math.PI) % (2 * Math.PI)) - Math.PI,
                point = new BMapGL.Point(x * (180 / Math.PI), y * (180 / Math.PI));
            points.push(point);
        }

        var fstPoint = points[0];
        points.push(new BMapGL.Point(fstPoint["lng"], fstPoint["lat"]));
        return points;
    }

    function getPointByDistance(srcPoint, distance, direction) {
        var cx = srcPoint["lng"],
            cy = srcPoint["lat"];
        var d = distance / 6378800, // circle radius / meters of Earth radius = radians
            lat1 = (Math.PI / 180) * cy,
            lng1 = (Math.PI / 180) * cx;
        var i,tmplng,tmplat;
        switch (direction) {
            case 'North':
            case 'north':
            case 'N':
            case 'n':
                i = 0;
                tmplng = srcPoint.lng;
                break;
            case 'West':
            case 'west':
            case 'W':
            case 'w':
                i = 90;
                tmplat = srcPoint.lat;
                break;
            case 'South':
            case 'south':
            case 'S':
            case 's':
                i = 180;
                tmplng = srcPoint.lng;
                break;
            case 'East':
            case 'east':
            case 'E':
            case 'e':
                i = 270;
                tmplat = srcPoint.lat;
                break;
            default:
                i = ~~direction;
                break;
        }
        var tc = (Math.PI / 180) * i,
            y = Math.asin(Math.sin(lat1) * Math.cos(d) + Math.cos(lat1) * Math.sin(d) * Math.cos(tc)),
            dlng = Math.atan2(Math.sin(tc) * Math.sin(d) * Math.cos(lat1), Math.cos(d) - Math.sin(lat1) * Math.sin(y)),
            x = ((lng1 - dlng + Math.PI) % (2 * Math.PI)) - Math.PI,
            point = new BMapGL.Point(tmplng || x * (180 / Math.PI), tmplat || y * (180 / Math.PI));
        point.lng = parseFloat(point.lng.toFixed(6));
        point.lat = parseFloat(point.lat.toFixed(6));
        return point;
    }

})();

/**
 * @fileoverview 百度地图的轨迹跟随类，对外开放。
 * 用户可以在地图上自定义轨迹运动
 * 可以自定义路过某个点的图片，文字介绍等。
 * 主入口类是<a href="examples/index.html">LuShu</a>，
 * 基于Baidu Map API GL 1.0
 *
 * @author Baidu Map Api Group
 * @version 1.0
 */

/**
 * @namespace BMapGL的所有library类均放在BMapGLLib命名空间下
 */
var BMapGLLib = window.BMapGLLib = BMapGLLib || {};

(function () {
    var T;
    var baidu = T = baidu || { version: 'gl 1.0' };
    baidu.guid = '$BAIDU$';
    (function () {
        window[baidu.guid] = window[baidu.guid] || {};
        baidu.dom = baidu.dom || {};
        baidu.dom.g = function (id) {
            if ('string' == typeof id || id instanceof String) {
                return document.getElementById(id);
            } else if (id && id.nodeName && (id.nodeType == 1 || id.nodeType == 9)) {
                return id;
            }
            return null;
        };
        baidu.g = baidu.G = baidu.dom.g;
        baidu.lang = baidu.lang || {};
        baidu.lang.isString = function (source) {
            return '[object String]' == Object.prototype.toString.call(source);
        };
        baidu.isString = baidu.lang.isString;
        baidu.dom._g = function (id) {
            if (baidu.lang.isString(id)) {
                return document.getElementById(id);
            }
            return id;
        };
        baidu._g = baidu.dom._g;
        baidu.dom.getDocument = function (element) {
            element = baidu.dom.g(element);
            return element.nodeType == 9 ? element : element.ownerDocument || element.document;
        };
        baidu.browser = baidu.browser || {};
        baidu.browser.ie = baidu.ie = /msie (\d+\.\d+)/i.test(navigator.userAgent) ? (document.documentMode || + RegExp['\x241']) : undefined;
        baidu.dom.getComputedStyle = function (element, key) {
            element = baidu.dom._g(element);
            var doc = baidu.dom.getDocument(element),
                styles;
            if (doc.defaultView && doc.defaultView.getComputedStyle) {
                styles = doc.defaultView.getComputedStyle(element, null);
                if (styles) {
                    return styles[key] || styles.getPropertyValue(key);
                }
            }
            return '';
        };
        baidu.dom._styleFixer = baidu.dom._styleFixer || {};
        baidu.dom._styleFilter = baidu.dom._styleFilter || [];
        baidu.dom._styleFilter.filter = function (key, value, method) {
            var filters = baidu.dom._styleFilter;
            var filter;
            for (var i = 0; filter = filters[i]; i++) {
                if (filter = filter[method]) {
                    value = filter(key, value);
                }
            }
            return value;
        };
        baidu.string = baidu.string || {};

        baidu.string.toCamelCase = function (source) {
            if (source.indexOf('-') < 0 && source.indexOf('_') < 0) {
                return source;
            }
            return source.replace(/[-_][^-_]/g, function (match) {
                return match.charAt(1).toUpperCase();
            });
        };
        baidu.dom.getStyle = function (element, key) {
            var dom = baidu.dom;
            element = dom.g(element);
            key = baidu.string.toCamelCase(key);

            var value = element.style[key] ||
                (element.currentStyle ? element.currentStyle[key] : '') ||
                dom.getComputedStyle(element, key);

            if (!value) {
                var fixer = dom._styleFixer[key];
                if (fixer) {
                    value = fixer.get ? fixer.get(element) : baidu.dom.getStyle(element, fixer);
                }
            }

            if (fixer = dom._styleFilter) {
                value = fixer.filter(key, value, 'get');
            }
            return value;
        };
        baidu.getStyle = baidu.dom.getStyle;
        baidu.dom._NAME_ATTRS = (function () {
            var result = {
                'cellpadding': 'cellPadding',
                'cellspacing': 'cellSpacing',
                'colspan': 'colSpan',
                'rowspan': 'rowSpan',
                'valign': 'vAlign',
                'usemap': 'useMap',
                'frameborder': 'frameBorder'
            };

            if (baidu.browser.ie < 8) {
                result['for'] = 'htmlFor';
                result['class'] = 'className';
            } else {
                result['htmlFor'] = 'for';
                result['className'] = 'class';
            }
            return result;
        })();

        baidu.dom.setAttr = function (element, key, value) {
            element = baidu.dom.g(element);
            if ('style' == key) {
                element.style.cssText = value;
            } else {
                key = baidu.dom._NAME_ATTRS[key] || key;
                element.setAttribute(key, value);
            }
            return element;
        };
        baidu.setAttr = baidu.dom.setAttr;
        baidu.dom.setAttrs = function (element, attributes) {
            element = baidu.dom.g(element);
            for (var key in attributes) {
                baidu.dom.setAttr(element, key, attributes[key]);
            }
            return element;
        };
        baidu.setAttrs = baidu.dom.setAttrs;
        baidu.dom.create = function (tagName, opt_attributes) {
            var el = document.createElement(tagName),
                attributes = opt_attributes || {};
            return baidu.dom.setAttrs(el, attributes);
        };
        baidu.object = baidu.object || {};
        baidu.extend =
            baidu.object.extend = function (target, source) {
                for (var p in source) {
                    if (source.hasOwnProperty(p)) {
                        target[p] = source[p];
                    }
                }
                return target;
            };
    })();

    WORLD_SIZE_MC_HALF = 20037726.372307256;
    WORLD_SIZE_MC = WORLD_SIZE_MC_HALF * 2;
    /**
     * @exports LuShu as BMapGLLib.LuShu
     */
    var LuShu =
        /**
         * LuShu类的构造函数
         * @class LuShu <b>入口</b>。
         * 实例化该类后，可调用,start,end,pause等方法控制覆盖物的运动。
    
         * @constructor
             * @param {Map} map Baidu map的实例对象.
             * @param {Array} path 构成路线的point的数组.
             * @param {Json Object} opts 可选的输入参数，非必填项。可输入选项包括：<br />
             * {<br />"<b>landmarkPois</b>" : {Array} 要在覆盖物移动过程中，显示的特殊点。格式如下:landmarkPois:[<br />
             *      {lng:116.314782,lat:39.913508,html:'加油站',pauseTime:2},<br />
             *      {lng:116.315391,lat:39.964429,html:'高速公路收费站,pauseTime:3}]<br />
             * <br />"<b>icon</b>" : {Icon} 覆盖物的icon,
             * <br />"<b>speed</b>" : {Number} 覆盖物移动速度，单位米/秒    <br />
             * <br />"<b>defaultContent</b>" : {String} 覆盖物中的内容    <br />
             * }<br />.
             * @example <b>参考示例：</b><br />
             * var lushu = new BMapGLLib.LuShu(map,arrPois,{defaultContent:"从北京到天津",landmarkPois:[]});
         */
        BMapGLLib.LuShu = function (map, path, opts) {
            if (!path || path.length < 1) {
                return;
            }
            this._map = map;
            //存储一条路线
            if (opts['geodesic']) {
                this.path = getGeodesicPath(path);
            }
            else {
                this.path = path;
            }
            //移动到当前点的索引
            this.i = 0;
            //控制暂停后开始移动的队列的数组
            this._setTimeoutQuene = [];
            //进行坐标转换的类
            // this._projection = this._map.getMapType().getProjection();
            this._opts = {
                icon: null,
                //默认速度 米/秒
                speed: 400,
                defaultContent: ''
            };
            if (!opts['landmarkPois']) {
                opts['landmarkPois'] = [];
            }
            this._setOptions(opts);
            this._rotation = 0;//小车转动的角度

            //如果不是默认实例，则使用默认的icon
            if (!(this._opts.icon instanceof BMapGL.Icon)) {
                this._opts.icon = defaultIcon;
            }
        }
    /**
    * 根据用户输入的opts，修改默认参数_opts
    * @param {Json Object} opts 用户输入的修改参数.
    * @return 无返回值.
    */
    LuShu.prototype._setOptions = function (opts) {
        if (!opts) {
            return;
        }
        for (var p in opts) {
            if (opts.hasOwnProperty(p)) {
                this._opts[p] = opts[p];
            }
        }
    }

    /**
     * @description 开始运动
     * @param none
     * @return 无返回值.
     *
     * @example <b>参考示例：</b><br />
     * lushu.start();
     */
    LuShu.prototype.start = function () {
        var me = this,
            len = me.path.length;
        //不是第一次点击开始,并且小车还没到达终点
        if (me.i && me.i < len - 1) {
            //没按pause再按start不做处理
            if (!me._fromPause) {
                return;
            } else if (!me._fromStop) {
                //按了pause按钮,并且再按start，直接移动到下一点
                //并且此过程中，没有按stop按钮
                //防止先stop，再pause，然后连续不停的start的异常
                me._moveNext(++me.i);
            }
        } else {
            //第一次点击开始，或者点了stop之后点开始
            me._addMarker();
            //等待marker动画完毕再加载infowindow
            me._timeoutFlag = setTimeout(function () {
                me._addInfoWin();
                if (me._opts.defaultContent == "") {
                    me.hideInfoWindow();
                }
                me._moveNext(me.i);
            }, 400);
        }
        //重置状态
        this._fromPause = false;
        this._fromStop = false;
    };

    /**
     * 结束运动
     * @return 无返回值.
     *
     * @example <b>参考示例：</b><br />
     * lushu.stop();
     */
    LuShu.prototype.stop = function () {
        this.i = 0;
        this._fromStop = true;
        clearInterval(this._intervalFlag);
        this._clearTimeout();
        //重置landmark里边的poi为未显示状态
        for (var i = 0, t = this._opts.landmarkPois, len = t.length; i < len; i++) {
            t[i].bShow = false;
        }
    };

    /**
     * 停止运动并清除overlay
     * @return 无返回值.
     *
     * @example <b>参考示例：</b><br />
     * lushu.clear();
     */
    LuShu.prototype.clear = function () {
        this._clear();
    };

    /**
     * 暂停运动
     * @return 无返回值.
     */
    LuShu.prototype.pause = function () {
        clearInterval(this._intervalFlag);

        //标识是否是按过pause按钮
        this._fromPause = true;
        this._clearTimeout();
    };

    /**
     * 隐藏上方overlay
     * @return 无返回值.
     *
     * @example <b>参考示例：</b><br />
     * lushu.hideInfoWindow();
     */
    LuShu.prototype.hideInfoWindow = function () {
        this._overlay._div.style.visibility = 'hidden';
    };

    /**
     * 显示上方overlay
     * @return 无返回值.
     *
     * @example <b>参考示例：</b><br />
     * lushu.showInfoWindow();
     */
    LuShu.prototype.showInfoWindow = function () {
        this._overlay._div.style.visibility = 'visible';
    };

    //Lushu私有方法
    baidu.object.extend(LuShu.prototype, {
        /**
         * 添加marker到地图上
         * @param {Function} 回调函数.
         * @return 无返回值.
         */
        _addMarker: function (callback) {
            if (this._marker) {
                this.stop();
                // 变更
                this._map.removeOverlay(this._marker);
                this._map.removeOverlay(this._markerL);
                this._map.removeOverlay(this._markerR);
                clearTimeout(this._timeoutFlag);
            }
            //移除之前的overlay
            this._overlay && this._map.removeOverlay(this._overlay);
            var marker = new BMapGL.Marker(this.path[0]);
            this._opts.icon && marker.setIcon(this._opts.icon);
            this._map.addOverlay(marker);
            marker.setAnimation(BMAP_ANIMATION_DROP);
            this._marker = marker;
            // 变更
            var markerL = new BMapGL.Marker(this.path[0], { left: true });
            this._opts.icon && markerL.setIcon(this._opts.icon);
            this._map.addOverlay(markerL);
            markerL.setAnimation(BMAP_ANIMATION_DROP);
            this._markerL = markerL;

            var markerR = new BMapGL.Marker(this.path[0], { right: true });
            this._opts.icon && markerR.setIcon(this._opts.icon);
            this._map.addOverlay(markerR);
            markerR.setAnimation(BMAP_ANIMATION_DROP);
            this._markerR = markerR;
        },

        /**
         * 添加上方overlay
         * @return 无返回值.
         */
        _addInfoWin: function () {
            var me = this;
            var overlay = new CustomOverlay(me._marker.getPosition(), me._opts.defaultContent);
            //将当前类的引用传给overlay。
            overlay.setRelatedClass(this);
            this._overlay = overlay;
            this._map.addOverlay(overlay);
        },

        /**
         * 获取墨卡托坐标
         * @param {Point} poi 经纬度坐标.
         * @return 无返回值.
         */
        _getMercator: function (poi) {
            return this._map.getMapType().getProjection().lngLatToPoint(poi);
        },

        /**
         * 计算两点间的距离
         * @param {Point} poi 经纬度坐标A点.
         * @param {Point} poi 经纬度坐标B点.
         * @return 无返回值.
         */
        _getDistance: function (pxA, pxB) {
            return Math.sqrt(Math.pow(pxA.x - pxB.x, 2) + Math.pow(pxA.y - pxB.y, 2));
        },

        //目标点的  当前的步长,position,总的步长,动画效果,回调
        /**
         * 移动小车
         * @param {Number} poi 当前的步长.
         * @param {Point} initPos 经纬度坐标初始点.
         * @param {Point} targetPos 经纬度坐标目标点.
         * @param {Function} effect 缓动效果.
         * @return 无返回值.
         */
        _move: function (initPos, targetPos, effect) {
            var me = this,
                //当前的帧数
                currentCount = 0,
                //步长，米/秒
                timer = 10,
                step = this._opts.speed / (1000 / timer),
                //初始坐标
                init_pos = BMapGL.Projection.convertLL2MC(initPos),
                //获取结束点的(x,y)坐标
                target_pos = BMapGL.Projection.convertLL2MC(targetPos);
            init_pos = new BMapGL.Pixel(init_pos.lng, init_pos.lat);
            target_pos = new BMapGL.Pixel(target_pos.lng, target_pos.lat);
            // 变更
            var mcDis = me._getDistance(init_pos, target_pos);
            var direction = null;
            if (mcDis > 30037726) {
                if (target_pos.x < init_pos.x) {
                    target_pos.x += WORLD_SIZE_MC;
                    direction = 'right';
                } else {
                    target_pos.x -= WORLD_SIZE_MC;
                    direction = 'left';
                }
            }
            //总的步长
            var count = Math.round(me._getDistance(init_pos, target_pos) / step);

            //如果小于1直接移动到下一点
            if (count < 1) {
                me._moveNext(++me.i);
                return;
            }
            //两点之间匀速移动
            me._intervalFlag = setInterval(function () {
                //两点之间当前帧数大于总帧数的时候，则说明已经完成移动
                if (currentCount >= count) {
                    clearInterval(me._intervalFlag);
                    //移动的点已经超过总的长度
                    if (me.i > me.path.length) {
                        return;
                    }
                    //运行下一个点
                    me._moveNext(++me.i);
                } else {
                    currentCount++;
                    var x = effect(init_pos.x, target_pos.x, currentCount, count),
                        y = effect(init_pos.y, target_pos.y, currentCount, count),
                        pos = BMapGL.Projection.convertMC2LL(new BMapGL.Point(x, y));
                    if (pos.lng > 180) {
                        pos.lng = pos.lng - 360;
                    }
                    if (pos.lng < -180) {
                        pos.lng = pos.lng + 360;
                    }
                    //设置marker
                    if (currentCount == 1) {
                        var proPos = null;
                        if (me.i - 1 >= 0) {
                            proPos = me.path[me.i - 1];
                        }
                        if (me._opts.enableRotation == true) {
                            me.setRotation(proPos, initPos, targetPos, direction);
                        }
                        if (me._opts.autoView) {
                            if (!me._map.getBounds().containsPoint(pos)) {
                                me._map.setCenter(pos);
                            }
                        }
                    }
                    // 变更
                    //正在移动
                    me._marker.setPosition(pos);
                    me._markerL.setPosition(pos);
                    me._markerR.setPosition(pos);
                    //设置自定义overlay的位置
                    me._setInfoWin(pos);
                }
            }, timer);
        },

        /**
        * 在每个点的真实步骤中设置小车转动的角度
        */
        setRotation: function (prePos, curPos, targetPos, direction) {
            var me = this;
            var deg = 0;
            //start!
            curPos = me._map.pointToPixel(curPos);
            targetPos = me._map.pointToPixel(targetPos);

            if (targetPos.x != curPos.x) {
                var tan = (targetPos.y - curPos.y) / (targetPos.x - curPos.x),
                    atan = Math.atan(tan);
                deg = atan * 360 / (2 * Math.PI);
                //degree  correction;
                if ((!direction && targetPos.x < curPos.x)
                    || (direction === 'left')) {
                    deg = -deg + 90 + 90;
                } else {
                    deg = -deg;
                }
                // 变更
                me._marker.setRotation(-deg);
                me._markerL.setRotation(-deg);
                me._markerR.setRotation(-deg);

            } else {
                var disy = targetPos.y - curPos.y;
                var bias = 0;
                if (disy > 0) {
                    bias = -1;
                }
                else {
                    bias = 1;
                }
                // 变更
                me._marker.setRotation(-bias * 90);
                me._markerL.setRotation(-bias * 90);
                me._markerR.setRotation(-bias * 90);
            }
            return;
        },

        linePixellength: function (from, to) {
            return Math.sqrt(Math.abs(from.x - to.x) * Math.abs(from.x - to.x) + Math.abs(from.y - to.y) * Math.abs(from.y - to.y));

        },
        pointToPoint: function (from, to) {
            return Math.abs(from.x - to.x) * Math.abs(from.x - to.x) + Math.abs(from.y - to.y) * Math.abs(from.y - to.y)

        },

        /**
         * 移动到下一个点
         * @param {Number} index 当前点的索引.
         * @return 无返回值.
         */
        _moveNext: function (index) {
            var me = this;
            // debugger;
            if (index < this.path.length - 1) {
                me._move(me.path[index], me.path[index + 1], me._tween.linear);
            }
        },

        /**
         * 设置小车上方infowindow的内容，位置等
         * @param {Point} pos 经纬度坐标点.
         * @return 无返回值.
         */
        _setInfoWin: function (pos) {
            //设置上方overlay的position
            var me = this;
            if (!me._overlay) {
                return;
            }
            me._overlay.setPosition(pos, me._marker.getIcon().size);
            var index = me._troughPointIndex(pos);
            if (index != -1) {
                clearInterval(me._intervalFlag);
                me._overlay.setHtml(me._opts.landmarkPois[index].html);
                me._overlay.setPosition(pos, me._marker.getIcon().size);
                me._pauseForView(index);
            } else {
                me._overlay.setHtml(me._opts.defaultContent);
            }
        },

        /**
         * 在某个点暂停的时间
         * @param {Number} index 点的索引.
         * @return 无返回值.
         */
        _pauseForView: function (index) {
            var me = this;
            var t = setTimeout(function () {
                //运行下一个点
                me._moveNext(++me.i);
            }, me._opts.landmarkPois[index].pauseTime * 1000);
            me._setTimeoutQuene.push(t);
        },
        //清除暂停后再开始运行的timeout
        _clearTimeout: function () {
            for (var i in this._setTimeoutQuene) {
                clearTimeout(this._setTimeoutQuene[i]);
            }
            this._setTimeoutQuene.length = 0;
        },
        /**
         * 停止运动并清除overlay
         * @return 无返回值.
         */
        _clear: function () {
            var me = this;
            if (me._marker) {
                me.stop();
                // 清除overlay
                me._map.removeOverlay(me._marker);
                me._map.removeOverlay(me._markerL);
                me._map.removeOverlay(me._markerR);
                clearTimeout(me._timeoutFlag);
                me._marker = null;
                me._markerL = null;
                me._markerR = null;
            }
            if (me._overlay) {
                // 清除overlay
                me._map.removeOverlay(me._overlay);
                me._overlay = null;
            }
        },
        //缓动效果
        _tween: {
            //初始坐标，目标坐标，当前的步长，总的步长
            linear: function (initPos, targetPos, currentCount, count) {
                var b = initPos;
                var c = targetPos - initPos;
                var t = currentCount;
                var d = count;
                return c * t / d + b;
            }
        },

        /**
         * 否经过某个点的index
         * @param {Point} markerPoi 当前小车的坐标点.
         * @return 无返回值.
         */
        _troughPointIndex: function (markerPoi) {
            var t = this._opts.landmarkPois;
            var distance;
            for (var i = 0, len = t.length; i < len; i++) {
                //landmarkPois中的点没有出现过的话
                if (!t[i].bShow) {
                    distance = this._map.getDistance(new BMapGL.Point(t[i].lng, t[i].lat), markerPoi);
                    //两点距离小于10米，认为是同一个点
                    if (distance < 10) {
                        t[i].bShow = true;
                        return i;
                    }
                }
            }
            return -1;
        }
    });

    /**
     * 获取大圆点
     * @return {Array} 大圆点
     */
    function getGeodesicPath(points) {
        var gPath = [];
        for (var i = 0; i < points.length - 1; i++) {
            var great = calcGreatCirclePath(points[i], points[i + 1]);
            gPath = gPath.concat(great);
        }
        gPath = gPath.concat(points[points.length - 1])
        return gPath;
    }

    /**
     * 计算大圆上的点
     * @param {Object} latLng1 点1
     * @param {Object} latLng2 点2
     * @return {Array} 扩充后的点
     */
    function calcGreatCirclePath(latLng1, latLng2) {
        // 计算需要多少个插值点，根据显示效果，每250公里需要一个。
        if (latLng1.equals(latLng2)) {
            // 两个相等的坐标通过下面距离计算会得到地球周长，因此提前判断
            return [latLng1];
        }
        var distance = BMapGL.Projection.getDistance(toRadian(latLng1.lng), toRadian(latLng1.lat),
            toRadian(latLng2.lng), toRadian(latLng2.lat));
        var distance = BMapGL.Projection.getDistanceByLL(latLng1, latLng2);
        if (distance < 250000) {
            return [latLng1];
        }
        // 清空现有数据
        // this.greatCirclePoints.length = 0;
        var result = [];
        // 间隔设置小于250公里是因为在靠近南北两极同样的公里数所代表的平面跨度增加
        var count = Math.round(distance / 150000);
        var angularDistance = calcAngularDistance(latLng1, latLng2);
        result.push(latLng1);

        for (var i = 0; i < count; i++) {
            var eachLatLng = calcMiddlePoint(latLng1, latLng2, i / count, angularDistance);
            result.push(eachLatLng);
        }

        result.push(latLng2);
        return result;
    }

    /**
     * 给两个点，计算地球大圆上的中间点
     * https://www.movable-type.co.uk/scripts/latlong.html
     *
     * @param {Point} latLng1 起点
     * @param {Point} latLng2 终点
     * @param {number} f fraction along great circle route
     * @param {number} delta angular distance d/R between the two points.
     * @return {Point} 大圆上的中间点
     */
    function calcMiddlePoint(latLng1, latLng2, f, delta) {
        var lat1 = latLng1.lat;
        var lat2 = latLng2.lat;
        var lon1 = latLng1.lng;
        var lon2 = latLng2.lng;
        var phi1 = toRadian(lat1);
        var phi2 = toRadian(lat2);
        var lambda1 = toRadian(lon1);
        var lambda2 = toRadian(lon2);
        var a = Math.sin((1 - f) * delta) / Math.sin(delta);
        var b = Math.sin(f * delta) / Math.sin(delta);
        var x = a * Math.cos(phi1) * Math.cos(lambda1) + b * Math.cos(phi2) * Math.cos(lambda2);
        var y = a * Math.cos(phi1) * Math.sin(lambda1) + b * Math.cos(phi2) * Math.sin(lambda2);
        var z = a * Math.sin(phi1) + b * Math.sin(phi2);
        var phi = Math.atan2(z, Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)));
        var lambda = Math.atan2(y, x);
        return new BMapGL.Point(toAngle(lambda), toAngle(phi));
    }

    function toRadian(angle) {
        return angle * Math.PI / 180;
    }

    function toAngle(radian) {
        return radian / Math.PI * 180;
    }

    /**
     * 计算角距离
     *
     * @param {Point} latLng1 起点
     * @param {Point} latLng2 终点
     * @return {number} 角距离
     */
    function calcAngularDistance(latLng1, latLng2) {
        // console.log(latLng1.lat, latLng1.lng, latLng2.lat, latLng2.lng);
        var lat1 = toRadian(latLng1.lat);
        var lat2 = toRadian(latLng2.lat);
        var lng1 = toRadian(latLng1.lng);
        var lng2 = toRadian(latLng2.lng);
        return Math.acos(Math.sin(lat1) * Math.sin(lat2)
            + Math.cos(lat1) * Math.cos(lat2) * Math.cos(Math.abs(lng2 - lng1)));
    }
    
    /**
     * 自定义的overlay，显示在小车的上方
     * @param {Point} Point 要定位的点.
     * @param {String} html overlay中要显示的东西.
     * @return 无返回值.
     */
    function CustomOverlay(point, html) {
        this._point = point;
        this._html = html;
    }
    CustomOverlay.prototype = new BMapGL.Overlay();
    CustomOverlay.prototype.initialize = function (map) {
        var div = this._div = baidu.dom.create('div', { style: 'border:solid 1px #ccc;width:auto;min-width:50px;text-align:center;position:absolute;background:#fff;color:#000;font-size:12px;border-radius: 10px;padding:5px;white-space: nowrap;' });
        div.innerHTML = this._html;
        map.getPanes().floatPane.appendChild(div);
        this._map = map;
        return div;
    }
    CustomOverlay.prototype.draw = function () {
        this.setPosition(this.lushuMain._marker.getPosition(), this.lushuMain._marker.getIcon().size);
    }
    baidu.object.extend(CustomOverlay.prototype, {
        //设置overlay的position
        setPosition: function (poi, markerSize) {
            // 此处的bug已修复，感谢 苗冬(diligentcat@gmail.com) 的细心查看和认真指出
            var px = this._map.pointToOverlayPixel(poi);
            var styleW = baidu.dom.getStyle(this._div, 'width');
            var styleH = baidu.dom.getStyle(this._div, 'height');
            var overlayW = parseInt(this._div.clientWidth || styleW, 10);
            var overlayH = parseInt(this._div.clientHeight || styleH, 10);
            this._div.style.left = px.x - overlayW / 2 + 'px';
            this._div.style.bottom = -(px.y - markerSize.height) + 'px';
        },
        //设置overlay的内容
        setHtml: function (html) {
            this._div.innerHTML = html;
        },
        //跟customoverlay相关的实例的引用
        setRelatedClass: function (lushuMain) {
            this.lushuMain = lushuMain;
        }
    });
})();


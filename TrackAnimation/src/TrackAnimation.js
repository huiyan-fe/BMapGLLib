/**
 * @fileoverview 视角轨迹动画
 * 主入口类是<a href="example/index.html">TrackAnimation</a>，
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
    var DELTA_ZOOM = 1;
    var DEFAULT_TILT = 55;
    var DEFAULT_HEADING = 0;
    var DEFAULT_DURATION = 10000;
    var DEFAULT_DELAY = 0;
    var DEFAULT_OVERALLVIEW = true;
    var PLAY = 1;
    var CANCEL = 2;
    var PAUSE = 3;
    var start = 0;
    var TrackAnimation =
    /**
     * 构造函数
     * 
     * @param {BMapGL.Map} map 地图实例
     * @param {Polyline} polyline 折线实例
     * @param {TrackAnimationOptions} opts 配置
     * {
     *     zoom
     *     tilt
     *     duration
     *     delay
     *     overallView
     * }
     */
    BMapGLLib.TrackAnimation = function (map, polyline, opts) {
        this._map = map;
        this._polyline = polyline;
        this._totalPath = polyline.getPath();
        this._overallView = map.getViewport(polyline.getPath());
        this._status = CANCEL;
        this._opts = {
            zoom: this._getZoom(),
            tilt: DEFAULT_TILT,
            heading: DEFAULT_HEADING,
            duration: DEFAULT_DURATION,
            delay: DEFAULT_DELAY,
            overallView: DEFAULT_OVERALLVIEW
        };
        this._initOpts(opts);
        this._expandPath = this._addPath(polyline.getPath());
        // window.requestAnimationFrame(this._step);
        // 暂停时累计经历的时间
        this._pauseTime = 0;
        this._last2Points = [];
    };

    /**
     * 获取轨迹播放合适的缩放级别
     * @return {number} zoom
     */
    TrackAnimation.prototype._getZoom = function () {
        return Math.min(this._overallView.zoom + DELTA_ZOOM, this._map.getMaxZoom());
    };

    /**
     * 根据当前配置更新动画参数
     */
    TrackAnimation.prototype._updateAniParams = function () {
        this._updatePathAni();
        this._updateViewAni();
        this._polyline.setPath(this._expandPath.slice(0, 1));
    };

    /**
     * 轨迹动画
     */
    TrackAnimation.prototype._updatePathAni = function () {
        this._expandPath = this._addPath(this._totalPath);
        
    };

    /**
     * 视角动画
     */
    TrackAnimation.prototype._updateViewAni = function () {
        this._overallView = this._map.getViewport(this._totalPath);
        var length = this._totalPath.length;
        var keyFrames = [];
        var duration = this._opts.overallView ? this._opts.duration + 2000 : this._opts.duration;
        for (var i = 0; i < length; i++) {
            var item = this._totalPath[i];
            var percent = this._pathPercents[i] * (this._opts.duration / duration)
            keyFrames.push({
                center: new BMapGL.Point(item.lng, item.lat),
                zoom: this._opts.zoom,
                tilt: i === 0 ? 0 : this._opts.tilt,
                heading: i === 0 ? 0 : this._opts.heading,
                percentage: percent
            });
        }
        if (this._opts.overallView) {
            keyFrames.push({
                center: new BMapGL.Point(this._overallView.center.lng, this._overallView.center.lat),
                zoom: this._overallView.zoom - DELTA_ZOOM,
                tilt: 0,
                heading: 0,
                percentage: 1
            });
        }

        var opts = {
            duration: duration,
            delay: 0,
            interation: 1
        };
        this._viewAni = new BMapGL.ViewAnimation(keyFrames, opts);
    };

    /**
     * 扩充Path
     * @param {Array} path 原始路径
     */
    TrackAnimation.prototype._addPath = function (path) {
        var TOTAL_NUM = this._opts.duration / 10;
        var length = path.length;
        var totalDistance = 0;
        var distances = [];
        var expandPath = [];
        for (var i = 1; i < length; i++) {
            var distance = this._map.getDistance(path[i - 1], path[i]);
            distances.push(distance);
            totalDistance += distance;
        }
        var percents = [0];
        for (var i = 1; i < length; i++) {
            var percent = (distances[i - 1] / totalDistance).toFixed(2);
            // percents.push(percent);
            percents[i] = percents[i - 1] + parseFloat(percent, 10);
            expandPath = expandPath.concat(this._getPath(path[i - 1], path[i], percent * TOTAL_NUM));
        }
        this._pathPercents = percents;
        return expandPath;
    };

    /**
     * 获取差值Path
     * @param {Object} start 起始点
     * @param {Object} end 终止点
     * @param {number} num 差值点数量
     */
    TrackAnimation.prototype._getPath = function (start, end, num) {
        var result = [];
        if (num === 0) {
            return result;
        }
        for (var i = 0; i <= num; i++) {
            var point = new BMapGL.Point(
                (end.lng - start.lng) / num * i + start.lng,
                (end.lat - start.lat) / num * i + start.lat
            );
            result.push(point);
        }
        return result;
    }

    /**
     * 初始化配置参数
     * @param {Object} opts 配置
     */
    TrackAnimation.prototype._initOpts = function (opts) {
        for (var p in opts) {
            if (opts.hasOwnProperty(p)) {
                this._opts[p] = opts[p];
            }
        }
    };

    /**
     * 启动动画
     */
    TrackAnimation.prototype.start = function () {
        var me = this;
        setTimeout(function () {
            me._updateAniParams();
            me._map.removeOverlay(me._polyline);
            me._map.addOverlay(me._polyline);
            me._status = PLAY;
            me._step(performance.now());
            me._map.startViewAnimation(me._viewAni);
        }, this._opts.delay);
    };

    /**
     * 终止动画
     */
    TrackAnimation.prototype.cancel = function () {
        this._clearRAF();
        this._status = CANCEL;
        start = 0;
        this._pauseTime = 0;
        this._map.cancelViewAnimation(this._viewAni);
        this._map.removeOverlay(this._polyline);
    };

    /**
     * 暂停动画
     */
    TrackAnimation.prototype.pause = function () {
        if (this._status === PLAY) {
            this._clearRAF();
            this._map.pauseViewAnimation(this._viewAni);
            this._status = PAUSE;
            this._isPausing = performance.now();
        }
    };

    /**
     * 继续动画
     */
    TrackAnimation.prototype.continue = function () {
        if (this._status === PAUSE) {
            this._pauseTime += performance.now() - this._isPausing;
            this._isPausing = undefined;
            this._status = PLAY;
            this._step(performance.now());
            this._map.continueViewAnimation(this._viewAni);
        }
    };

    /**
     * rAF动画函数
     * @param {number} timestamp 时间戳
     */
    TrackAnimation.prototype._step = function (timestamp) {
        if (this._status === CANCEL) {
            start = 0;
            return;
        }
        if (!start) {
            start = timestamp;
        }
        timestamp = timestamp - this._pauseTime;
        
        var percent = (timestamp - start) / this._opts.duration;
        var end = Math.round(this._expandPath.length * percent);
        var currentPath = this._expandPath.slice(0, end);
        this._last2Points = currentPath.slice(-4);
        this._polyline.setPath(currentPath);
        if (timestamp < start + this._opts.duration) {
            this._timer = window.requestAnimationFrame(this._step.bind(this));
        } else {
            start = 0;
            this._status = CANCEL;
            this._pauseTime = 0;
        }
    };

    /**
     * 清除rAF动画函数
     */
    TrackAnimation.prototype._clearRAF = function () {
        if (this._timer) {
            window.cancelAnimationFrame(this._timer);
        }
    };

    /**
     * 设置缩放级别
     * @param {number} zoom 缩放级别
     */
    TrackAnimation.prototype.setZoom = function (zoom) {
        this._opts.zoom = zoom;
    };

    /**
     * 获取缩放级别
     * @return {number} zoom
     */
    TrackAnimation.prototype.getZoom = function (zoom) {
        return this._opts.zoom;
    };

    /**
     * 设置角度
     * @param {number} tilt 角度
     */
    TrackAnimation.prototype.setTilt = function (tilt) {
        this._opts.tilt = tilt;
    };

    /**
     * 获取角度
     * @return {number} tilt
     */
    TrackAnimation.prototype.getTilt = function (tilt) {
        return this._opts.tilt;
    };

    /**
     * 设置延迟
     * @param {number} delay 延迟
     */
    TrackAnimation.prototype.setDelay = function (delay) {
        this._opts.delay = delay;
    };

    /**
     * 获取延迟
     * @return {number} delay
     */
    TrackAnimation.prototype.getDelay = function (delay) {
        return this._opts.delay;
    };

    /**
     * 设置持续事件
     * @param {number} duration 持续事件
     */
    TrackAnimation.prototype.setDuration = function (duration) {
        this._opts.duration = duration;
    };

    /**
     * 获取持续事件
     * @return {number} duration
     */
    TrackAnimation.prototype.getDuration = function (duration) {
        return this._opts.duration;
    };

    /**
     * 开启总览
     */
    TrackAnimation.prototype.enableOverallView = function () {
        this._opts.overallView = true;
    };

    /**
     * 关闭总览
     */
    TrackAnimation.prototype.disableOverallView = function () {
        this._opts.overallView = false;
    };

    /**
     * 更新折线
     * @param {Object} polyline 更新
     */
    TrackAnimation.prototype.setPolyline = function (polyline) {
        this._polyline = polyline;
        this._totalPath = polyline.getPath();
    };

    /**
     * 获取折线
     * @return {Object} polyline
     */
    TrackAnimation.prototype.getPolyline = function () {
        return this._polyline;
    };

    /**
     * 获取视野点
     * @return {Object} polyline
     */
    TrackAnimation.prototype.getLastPoint = function () {
        return [this._last2Points[0], this._last2Points[3]];
    };
})();

/**
 * @fileoverview Marker Manager 标注管理器（GL 版）
 * 主入口类BMapGLLib.MarkerManager，基于Baidu Map API GL 1.0。
 * 适用于大量marker分布在不同zoom级别时的管理与按视口/缩放显示。
 *
 * @author Baidu Map Api Group
 * @version 1.0
 */

var BMapGLLib = window.BMapGLLib = BMapGLLib || {};

(function () {
  /**
   * @class MarkerManager
   * @description 标注管理器。实例化后可调用addMarkers、show、hide等方法控制marker。
   * 适用于：大量marker分布到不同zoom级别，如 18级显示100 个、15级显示另外100个。
   * @param {BMapGL.Map} map 百度地图GL实例
   * @param {Object} [opts] 可选配置
   * @param {number} [opts.borderPadding=0] 视口外扩像素，落在该范围内的marker也会被加载
   * @param {number} [opts.maxZoom=19] 管理器监视的最大缩放级别
   */
  function MarkerManager(map, opts) {
    this._opts = opts || {};
    this._map = map;
    this._numMarkers = [];

    this._opts.maxZoom = typeof this._opts.maxZoom === 'number' ? this._opts.maxZoom : 19;
    this._opts.borderPadding = typeof this._opts.borderPadding === 'number' ? this._opts.borderPadding : 0;

    var me = this;
    this._map.addEventListener('zoomend', function () { me._showMarkers(); });
    this._map.addEventListener('dragend', function () { me._showMarkers(); });
    this._map.addEventListener('zooming', function () { me._showMarkers(); });
    this._map.addEventListener('moving', function () { me._showMarkers(); });
  }

  /**
   * 添加单个marker
   * @param {BMapGL.Marker} marker 标注实例
   * @param {number} [minZoom=1] 小于此级别时不显示
   * @param {number} [maxZoom=opts.maxZoom] 大于此级别时不显示
   */
  MarkerManager.prototype.addMarker = function (marker, minZoom, maxZoom) {
    minZoom = (minZoom != null && minZoom > 0) ? minZoom : 1;
    maxZoom = (maxZoom != null && maxZoom <= 19) ? maxZoom : this._opts.maxZoom;
    marker.minZoom = minZoom;
    marker.maxZoom = maxZoom;
    marker.bAdded = false;
    this._numMarkers.push(marker);
    if (typeof marker.enableDragging === 'function') {
      marker.enableDragging();
    }
  };

  /**
   * 批量添加marker
   * @param {BMapGL.Marker[]} markers 标注数组
   * @param {number} [minZoom=1] 最小显示级别
   * @param {number} [maxZoom=opts.maxZoom] 最大显示级别
   */
  MarkerManager.prototype.addMarkers = function (markers, minZoom, maxZoom) {
    for (var i = 0; i < markers.length; i++) {
      this.addMarker(markers[i], minZoom, maxZoom);
    }
  };

  /**
   * 从管理器和地图中移除指定marker
   * @param {BMapGL.Marker} marker 要移除的标注
   */
  MarkerManager.prototype.removeMarker = function (marker) {
    if (marker && typeof BMapGL !== 'undefined' && marker instanceof BMapGL.Marker) {
      this._map.removeOverlay(marker);
      this._removeMarkerFromArray(marker);
    }
  };

  /**
   * 返回指定zoom下当前“可见”的marker数量（受show/hide影响）
   * @param {number} [zoom] 缩放级别，不传则用当前地图zoom
   * @returns {number}
   */
  MarkerManager.prototype.getMarkerCount = function (zoom) {
    var z = zoom != null ? zoom : this._map.getZoom();
    var t = this._numMarkers;
    var count = 0;
    for (var i = 0; i < t.length; i++) {
      if (t[i].bInBounds && t[i].minZoom <= z && t[i].maxZoom >= z) count++;
    }
    return this._visible ? count : 0;
  };

  /**
   * 显示当前应在视野内的marker（仅改display）
   */
  MarkerManager.prototype.show = function () {
    for (var i = 0; i < this._numMarkers.length; i++) {
      if (this._numMarkers[i].bInBounds && typeof this._numMarkers[i].show === 'function') {
        this._numMarkers[i].show();
      }
    }
    this._visible = true;
  };

  /**
   * 隐藏当前应在视野内的marker（仅改display）
   */
  MarkerManager.prototype.hide = function () {
    for (var i = 0; i < this._numMarkers.length; i++) {
      if (this._numMarkers[i].bInBounds && typeof this._numMarkers[i].hide === 'function') {
        this._numMarkers[i].hide();
      }
    }
    this._visible = false;
  };

  /**
   * 在“全部显示”与“全部隐藏”之间切换
   */
  MarkerManager.prototype.toggle = function () {
    this._visible ? this.hide() : this.show();
  };

  /**
   * 根据当前视野与zoom刷新并显示应显示的marker
   */
  MarkerManager.prototype.showMarkers = function () {
    this._visible = true;
    this._showMarkers();
  };

  /**
   * 移除并清空所有由本管理器管理的marker
   */
  MarkerManager.prototype.clearMarkers = function () {
    for (var i = 0; i < this._numMarkers.length; i++) {
      if (this._numMarkers[i].bInBounds) {
        this._map.removeOverlay(this._numMarkers[i]);
      }
    }
    this._numMarkers.length = 0;
  };

  /**
   * 根据当前视野与zoom决定每个marker是否加入地图或显示/隐藏
   * @private
   */
  MarkerManager.prototype._showMarkers = function () {
    var list = this._numMarkers;
    var curZoom = this._map.getZoom();
    var curBounds = this._getRealBounds();
    var map = this._map;

    for (var i = 0; i < list.length; i++) {
      var m = list[i];
      var pos = m.getPosition && m.getPosition();
      if (!pos) continue;

      var inBounds = curBounds.containsPoint(pos);
      var inZoom = curZoom >= m.minZoom && curZoom <= m.maxZoom;

      if (inBounds && inZoom) {
        m.bInBounds = true;
        if (!m.bAdded) {
          map.addOverlay(m);
          if (!this._visible) {
            if (typeof m.hide === 'function') m.hide();
          }
          m.bAdded = true;
        } else {
          if (this._visible && typeof m.show === 'function') m.show();
        }
      } else if (m.bAdded) {
        m.bInBounds = false;
        if (typeof m.hide === 'function') m.hide();
      }
    }
  };

  /**
   * 获取带borderPadding的视口范围（Bounds）
   * @private
   * @returns {BMapGL.Bounds}
   */
  MarkerManager.prototype._getRealBounds = function () {
    var curBounds = this._map.getBounds();
    var sw = curBounds.getSouthWest();
    var ne = curBounds.getNorthEast();
    var padding = this._opts.borderPadding || 0;

    var southWestPixel = this._map.pointToPixel(sw);
    var northEastPixel = this._map.pointToPixel(ne);

    var extendSW = { x: southWestPixel.x - padding, y: southWestPixel.y + padding };
    var extendNE = { x: northEastPixel.x + padding, y: northEastPixel.y - padding };

    var Pixel = typeof BMapGL !== 'undefined' && BMapGL.Pixel;
    var extendSWPixel = Pixel ? new BMapGL.Pixel(extendSW.x, extendSW.y) : extendSW;
    var extendNEPixel = Pixel ? new BMapGL.Pixel(extendNE.x, extendNE.y) : extendNE;

    var extendSwPoint = this._map.pixelToPoint(extendSWPixel);
    var extendNePoint = this._map.pixelToPoint(extendNEPixel);

    return new BMapGL.Bounds(extendSwPoint, extendNePoint);
  };

  /**
   * 从内部数组中移除指定marker
   * @private
   * @param {BMapGL.Marker} marker
   * @returns {number} 移除的个数
   */
  MarkerManager.prototype._removeMarkerFromArray = function (marker) {
    var arr = this._numMarkers;
    var idx = arr.indexOf(marker);
    if (idx !== -1) {
      arr.splice(idx, 1);
      return 1;
    }
    return 0;
  };

  BMapGLLib.MarkerManager = MarkerManager;
})();

/**
 * @fileoverview 百度地图GL版本的画弧线类，对外开放。
 * 允许用户在地图上完成画弧线的功能，使用者可自定义弧线样式（线宽、颜色等）。
 * 主入口类BMapGLLib.CurveLine，基于Baidu Map API GL 1.0。
 *
 * @author Baidu Map Api Group
 * @version 1.0
 */

var BMapGLLib = window.BMapGLLib = BMapGLLib || {};

(function () {
  var circlePng = 'data:image/png;base64,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';
  /**
    * 判断是否为BMapGL.Point（或具有lng/lat的对象）
   */
  function isPoint(obj) {
    if (!obj) return false;
    if (typeof BMapGL !== 'undefined' && obj instanceof BMapGL.Point) return true;
    return typeof obj.lng === 'number' && typeof obj.lat === 'number';
  }

  /**
   * 根据两点计算二次贝塞尔曲线坐标点数组
   * @param {Object} obj1 起点Point
   * @param {Object} obj2 终点Point
   * @returns {Array} BMapGL.Point 数组
   */
  function getCurveByTwoPoints(obj1, obj2) {
    if (!obj1 || !obj2 || !isPoint(obj1) || !isPoint(obj2)) {
      return [];
    }

    var B1 = function (x) { return 1 - 2 * x + x * x; };
    var B2 = function (x) { return 2 * x - 2 * x * x; };
    var B3 = function (x) { return x * x; };

    var count = 30;
    var inc = 0;
    var curveCoordinates = [];
    var lat1 = parseFloat(obj1.lat);
    var lat2 = parseFloat(obj2.lat);
    var lng1 = parseFloat(obj1.lng);
    var lng2 = parseFloat(obj2.lng);

    if (lng2 > lng1 && parseFloat(lng2 - lng1) > 180 && lng1 < 0) {
      lng1 = parseFloat(180 + 180 + lng1);
    }
    if (lng1 > lng2 && parseFloat(lng1 - lng2) > 180 && lng2 < 0) {
      lng2 = parseFloat(180 + 180 + lng2);
    }

    var t, h, h2, lat3, lng3, t2;
    t2 = 0;
    if (lat2 === lat1) {
      t = 0;
      h = lng1 - lng2;
    } else if (lng2 === lng1) {
      t = Math.PI / 2;
      h = lat1 - lat2;
    } else {
      t = Math.atan((lat2 - lat1) / (lng2 - lng1));
      h = (lat2 - lat1) / Math.sin(t);
    }
    if (t2 === 0) {
      t2 = t + (Math.PI / 5);
    }
    h2 = h / 2;
    lng3 = h2 * Math.cos(t2) + lng1;
    lat3 = h2 * Math.sin(t2) + lat1;

    for (var i = 0; i < count + 1; i++) {
      curveCoordinates.push(new BMapGL.Point(
        (lng1 * B1(inc) + lng3 * B2(inc)) + lng2 * B3(inc),
        (lat1 * B1(inc) + lat3 * B2(inc)) + lat2 * B3(inc)
      ));
      inc = inc + (1 / count);
    }
    return curveCoordinates;
  }

  /**
   * 根据弧线的坐标节点数组，生成整条弧线的折线点数组
   */
  function getCurvePoints(points) {
    var curvePoints = [];
    for (var i = 0; i < points.length - 1; i++) {
      var p = getCurveByTwoPoints(points[i], points[i + 1]);
      if (p && p.length > 0) {
        curvePoints = curvePoints.concat(p);
      }
    }
    return curvePoints;
  }

  /**
   * 弧线类，用法与Polyline一致，可通过map.addOverlay添加到地图
   * @class BMapGLLib.CurveLine
   * @param {Array<BMapGL.Point>} points 弧线控制点（起点、途经点、终点）
   * @param {Object} [opts] 可选，样式同PolylineOptions（strokeColor、strokeWeight、strokeOpacity等）
   * @returns {BMapGL.Polyline} 弧线覆盖物实例，支持enableEditing / disableEditing
   */
  function CurveLine(points, opts) {
    if (!points || points.length < 2) {
      throw new Error('CurveLine requires at least 2 points');
    }
    var curvePoints = getCurvePoints(points);
    var polyline = new BMapGL.Polyline(curvePoints, opts || {});

    polyline.addEventListener('lineupdate', function () {
      if (this.isEditing) {
        this.enableEditing();
      }
    });

    polyline.cornerPoints = points.slice ? points.slice() : points.map(function (p) {
      return new BMapGL.Point(p.lng, p.lat);
    });
    polyline.editMarkers = [];

    polyline.enableEditing = function () {
      var self = this;
      if (self.map) {
        self.disableEditing();
        for (var i = 0; i < self.cornerPoints.length; i++) {
          var pt = self.cornerPoints[i];
          var pos = pt instanceof BMapGL.Point ? pt : new BMapGL.Point(pt.lng, pt.lat);
          var icon = new BMapGL.Icon(circlePng,
            new BMapGL.Size(16, 16)
          );
          var marker = new BMapGL.Marker(pos, {
            icon: icon,
            enableDragging: true,
            raiseOnDrag: true
          });
          marker.addEventListener('dragend', function () {
            self.cornerPoints.length = 0;
            for (var k = 0; k < self.editMarkers.length; k++) {
              self.cornerPoints.push(self.editMarkers[k].getPosition());
            }
            curvePoints = getCurvePoints(self.cornerPoints);
            self.setPath(curvePoints);
          });
          marker.index = i;
          self.editMarkers.push(marker);
          self.map.addOverlay(marker);
        }
      }
      self.isEditing = true;
    };

    polyline.disableEditing = function () {
      this.isEditing = false;
      for (var i = 0; i < this.editMarkers.length; i++) {
        if (this.map) this.map.removeOverlay(this.editMarkers[i]);
        this.editMarkers[i] = null;
      }
      this.editMarkers.length = 0;
    };

    polyline.getPath = function () {
      return curvePoints;
    };

    return polyline;
  }

  BMapGLLib.CurveLine = CurveLine;
})();

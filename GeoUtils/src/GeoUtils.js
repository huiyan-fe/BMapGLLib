/**
 * @fileoverview GeoUtils类提供若干几何算法，用来帮助用户判断点与矩形、
 * 圆形、多边形线、多边形面的关系,并提供计算折线长度和多边形的面积的公式。
 * 主入口类是<a href="symbols/BMapGLLib.GeoUtils.html">GeoUtils</a>，
 * 基于Baidu Map API GL 1.0。
 *
 * @author Baidu Map Api Group
 * @version 1.0
 */

/**
 * @namespace BMapGL的所有library类均放在BMapGLLib命名空间下
 */
var BMapGLLib = (window.BMapGLLib = BMapGLLib || {});
(function () {
    /**
     * 地球半径
     */
    var EARTHRADIUS = 6370996.81;

    /**
     * @exports GeoUtils as BMapGLLib.GeoUtils
     */
    var GeoUtils =
        /**
         * GeoUtils类，静态类，勿需实例化即可使用
         * @class GeoUtils类的<b>入口</b>。
         * 该类提供的都是静态方法，勿需实例化即可使用。
         */
        (BMapGLLib.GeoUtils = function () {});

    /**
     * 判断点是否在矩形内
     * @param {Point} point 点对象
     * @param {Bounds} bounds 矩形边界对象
     * @returns {Boolean} 点在矩形内返回true,否则返回false
     */
    GeoUtils.isPointInRect = function (point, bounds) {
        //检查类型是否正确
        if (
            !(point.toString() === "Point" || point.toString() === "LatLng") ||
            !(bounds instanceof BMapGL.Bounds)
        ) {
            return false;
        }
        var sw = bounds.getSouthWest(); //西南脚点
        var ne = bounds.getNorthEast(); //东北脚点
        return (
            point.lng >= sw.lng &&
            point.lng <= ne.lng &&
            point.lat >= sw.lat &&
            point.lat <= ne.lat
        );
    };

    /**
     * 判断点是否在圆形内
     * @param {Point} point 点对象
     * @param {Circle} circle 圆形对象
     * @returns {Boolean} 点在圆形内返回true,否则返回false
     */
    GeoUtils.isPointInCircle = function (point, circle) {
        //检查类型是否正确
        if (
            !(point.toString() === "Point" || point.toString() === "LatLng") ||
            !(circle instanceof BMapGL.Circle)
        ) {
            return false;
        }

        //point与圆心距离小于圆形半径，则点在圆内，否则在圆外
        var c = circle.getCenter();
        var r = circle.getRadius();

        var dis = GeoUtils.getDistance(point, c);
        if (dis <= r) {
            return true;
        } else {
            return false;
        }
    };

    /**
     * 判断点是否在折线上
     * @param {Point} point 点对象
     * @param {Polyline} polyline 折线对象
     * @returns {Boolean} 点在折线上返回true,否则返回false
     */
    GeoUtils.isPointOnPolyline = function (point, polyline) {
        //检查类型
        if (
            !(point.toString() === "Point" || point.toString() === "LatLng") ||
            !(polyline instanceof BMapGL.Polyline)
        ) {
            return false;
        }

        //首先判断点是否在线的外包矩形内，如果在，则进一步判断，否则返回false
        var lineBounds = polyline.getBounds();
        if (!this.isPointInRect(point, lineBounds)) {
            return false;
        }

        //判断点是否在线段上，设点为Q，线段为P1P2 ，
        //判断点Q在该线段上的依据是：( Q - P1 ) × ( P2 - P1 ) = 0，且 Q 在以 P1，P2为对角顶点的矩形内
        var pts = polyline.getPath();
        for (var i = 0; i < pts.length - 1; i++) {
            var curPt = pts[i];
            var nextPt = pts[i + 1];
            //首先判断point是否在curPt和nextPt之间，即：此判断该点是否在该线段的外包矩形内
            if (
                point.lng >= Math.min(curPt.lng, nextPt.lng) &&
                point.lng <= Math.max(curPt.lng, nextPt.lng) &&
                point.lat >= Math.min(curPt.lat, nextPt.lat) &&
                point.lat <= Math.max(curPt.lat, nextPt.lat)
            ) {
                //判断点是否在直线上公式
                var precision =
                    (curPt.lng - point.lng) * (nextPt.lat - point.lat) -
                    (nextPt.lng - point.lng) * (curPt.lat - point.lat);
                if (precision < 2e-9 && precision > -2e-9) {
                    //实质判断是否接近0
                    return true;
                }
            }
        }

        return false;
    };

    /**
     * 判断点是否多边形内
     * @param {Point} point 点对象
     * @param {Polyline} polygon 多边形对象
     * @returns {Boolean} 点在多边形内返回true,否则返回false
     */
    GeoUtils.isPointInPolygon = function (point, polygon) {
        //检查类型
        if (
            !(point.toString() === "Point" || point.toString() === "LatLng") ||
            !(polygon instanceof BMapGL.Polygon)
        ) {
            return false;
        }

        //首先判断点是否在多边形的外包矩形内，如果在，则进一步判断，否则返回false
        var polygonBounds = polygon.getBounds();
        if (!this.isPointInRect(point, polygonBounds)) {
            return false;
        }

        var pts = polygon.getPath(); //获取多边形点

        //下述代码来源：http://paulbourke.net/geometry/insidepoly/，进行了部分修改
        //基本思想是利用射线法，计算射线与多边形各边的交点，如果是偶数，则点在多边形外，否则
        //在多边形内。还会考虑一些特殊情况，如点在多边形顶点上，点在多边形边上等特殊情况。

        var N = pts.length;
        var boundOrVertex = true; //如果点位于多边形的顶点或边上，也算做点在多边形内，直接返回true
        var intersectCount = 0; //cross points count of x
        var precision = 2e-10; //浮点类型计算时候与0比较时候的容差
        var p1, p2; //neighbour bound vertices
        var p = point; //测试点

        p1 = pts[0]; //left vertex
        for (var i = 1; i <= N; ++i) {
            //check all rays
            if (p.equals(p1)) {
                return boundOrVertex; //p is an vertex
            }

            p2 = pts[i % N]; //right vertex
            if (
                p.lat < Math.min(p1.lat, p2.lat) ||
                p.lat > Math.max(p1.lat, p2.lat)
            ) {
                //ray is outside of our interests
                p1 = p2;
                continue; //next ray left point
            }

            if (
                p.lat > Math.min(p1.lat, p2.lat) &&
                p.lat < Math.max(p1.lat, p2.lat)
            ) {
                //ray is crossing over by the algorithm (common part of)
                if (p.lng <= Math.max(p1.lng, p2.lng)) {
                    //x is before of ray
                    if (p1.lat == p2.lat && p.lng >= Math.min(p1.lng, p2.lng)) {
                        //overlies on a horizontal ray
                        return boundOrVertex;
                    }

                    if (p1.lng == p2.lng) {
                        //ray is vertical
                        if (p1.lng == p.lng) {
                            //overlies on a vertical ray
                            return boundOrVertex;
                        } else {
                            //before ray
                            ++intersectCount;
                        }
                    } else {
                        //cross point on the left side
                        var xinters =
                            ((p.lat - p1.lat) * (p2.lng - p1.lng)) /
                            (p2.lat - p1.lat) +
                            p1.lng; //cross point of lng
                        if (Math.abs(p.lng - xinters) < precision) {
                            //overlies on a ray
                            return boundOrVertex;
                        }

                        if (p.lng < xinters) {
                            //before ray
                            ++intersectCount;
                        }
                    }
                }
            } else {
                //special case when ray is crossing through the vertex
                if (p.lat == p2.lat && p.lng <= p2.lng) {
                    //p crossing over p2
                    var p3 = pts[(i + 1) % N]; //next vertex
                    if (
                        p.lat >= Math.min(p1.lat, p3.lat) &&
                        p.lat <= Math.max(p1.lat, p3.lat)
                    ) {
                        //p.lat lies between p1.lat & p3.lat
                        ++intersectCount;
                    } else {
                        intersectCount += 2;
                    }
                }
            }
            p1 = p2; //next ray left point
        }

        if (intersectCount % 2 == 0) {
            //偶数在多边形外
            return false;
        } else {
            //奇数在多边形内
            return true;
        }
    };

    /**
     * 将度转化为弧度
     * @param {degree} Number 度
     * @returns {Number} 弧度
     */
    GeoUtils.degreeToRad = function (degree) {
        return (Math.PI * degree) / 180;
    };

    /**
     * 将弧度转化为度
     * @param {radian} Number 弧度
     * @returns {Number} 度
     */
    GeoUtils.radToDegree = function (rad) {
        return (180 * rad) / Math.PI;
    };

    /**
     * 将v值限定在a,b之间，纬度使用
     */
    function _getRange(v, a, b) {
        if (a != null) {
            v = Math.max(v, a);
        }
        if (b != null) {
            v = Math.min(v, b);
        }
        return v;
    }

    /**
     * 将v值限定在a,b之间，经度使用
     */
    function _getLoop(v, a, b) {
        while (v > b) {
            v -= b - a;
        }
        while (v < a) {
            v += b - a;
        }
        return v;
    }

    /**
     * 计算两点之间的距离,两点坐标必须为经纬度
     * @param {point1} Point 点对象
     * @param {point2} Point 点对象
     * @returns {Number} 两点之间距离，单位为米
     */
    GeoUtils.getDistance = function (point1, point2) {
        //判断类型
        if (
            !(
                point1.toString() === "Point" ||
                point1.toString() === "LatLng" ||
                point2.toString() === "Point" ||
                point2.toString() === "LatLng"
            )
        ) {
            return 0;
        }

        point1.lng = _getLoop(point1.lng, -180, 180);
        point1.lat = _getRange(point1.lat, -74, 74);
        point2.lng = _getLoop(point2.lng, -180, 180);
        point2.lat = _getRange(point2.lat, -74, 74);

        var x1, x2, y1, y2;
        x1 = GeoUtils.degreeToRad(point1.lng);
        y1 = GeoUtils.degreeToRad(point1.lat);
        x2 = GeoUtils.degreeToRad(point2.lng);
        y2 = GeoUtils.degreeToRad(point2.lat);
        return (
            EARTHRADIUS *
            Math.acos(
                Math.sin(y1) * Math.sin(y2) +
                Math.cos(y1) * Math.cos(y2) * Math.cos(x2 - x1)
            )
        );
    };

    /**
     * 计算折线或者点数组的长度
     * @param {Polyline|Array<Point>} polyline 折线对象或者点数组
     * @returns {Number} 折线或点数组对应的长度
     */
    GeoUtils.getPolylineDistance = function (polyline) {
        //检查类型
        if (polyline instanceof BMapGL.Polyline || polyline instanceof Array) {
            //将polyline统一为数组
            var pts;
            if (polyline instanceof BMapGL.Polyline) {
                pts = polyline.getPath();
            } else {
                pts = polyline;
            }
            if (pts.length < 2) {
                //小于2个点，返回0
                return 0;
            }
            //遍历所有线段将其相加，计算整条线段的长度
            var totalDis = 0;
            for (var i = 0; i < pts.length - 1; i++) {
                var curPt = pts[i];
                var nextPt = pts[i + 1];
                var dis = GeoUtils.getDistance(curPt, nextPt);
                totalDis += dis;
            }
            return totalDis;
        } else {
            return 0;
        }
    };

    /**
     * 计算多边形面或点数组构建图形的面积,注意：坐标类型只能是经纬度，且不适合计算自相交多边形的面积
     * @param {Polygon|Array<Point>} polygon 多边形面对象或者点数组
     * @returns {Number} 多边形面或点数组构成图形的面积
     */
    GeoUtils.getPolygonArea = function (polygon) {
        //检查类型
        if (
            !(polygon instanceof BMapGL.Polygon) &&
            !(polygon instanceof Array)
        ) {
            return 0;
        }
        var pts;
        if (polygon instanceof BMapGL.Polygon) {
            pts = polygon.getPath();
        } else {
            pts = polygon;
        }

        if (pts[0].equals(pts[pts.length - 1])) {
            pts.pop();
        }
        if (pts.length < 3) {
            //小于3个顶点，不能构建面
            return 0;
        }

        var totalArea = 0; //初始化总面积
        var LowX = 0.0;
        var LowY = 0.0;
        var MiddleX = 0.0;
        var MiddleY = 0.0;
        var HighX = 0.0;
        var HighY = 0.0;
        var AM = 0.0;
        var BM = 0.0;
        var CM = 0.0;
        var AL = 0.0;
        var BL = 0.0;
        var CL = 0.0;
        var AH = 0.0;
        var BH = 0.0;
        var CH = 0.0;
        var CoefficientL = 0.0;
        var CoefficientH = 0.0;
        var ALtangent = 0.0;
        var BLtangent = 0.0;
        var CLtangent = 0.0;
        var AHtangent = 0.0;
        var BHtangent = 0.0;
        var CHtangent = 0.0;
        var ANormalLine = 0.0;
        var BNormalLine = 0.0;
        var CNormalLine = 0.0;
        var OrientationValue = 0.0;
        var AngleCos = 0.0;
        var Sum1 = 0.0;
        var Sum2 = 0.0;
        var Count2 = 0;
        var Count1 = 0;
        var Sum = 0.0;
        var Radius = EARTHRADIUS; //6378137.0,WGS84椭球半径
        var Count = pts.length;
        for (var i = 0; i < Count; i++) {
            if (i == 0) {
                LowX = (pts[Count - 1].lng * Math.PI) / 180;
                LowY = (pts[Count - 1].lat * Math.PI) / 180;
                MiddleX = (pts[0].lng * Math.PI) / 180;
                MiddleY = (pts[0].lat * Math.PI) / 180;
                HighX = (pts[1].lng * Math.PI) / 180;
                HighY = (pts[1].lat * Math.PI) / 180;
            } else if (i == Count - 1) {
                LowX = (pts[Count - 2].lng * Math.PI) / 180;
                LowY = (pts[Count - 2].lat * Math.PI) / 180;
                MiddleX = (pts[Count - 1].lng * Math.PI) / 180;
                MiddleY = (pts[Count - 1].lat * Math.PI) / 180;
                HighX = (pts[0].lng * Math.PI) / 180;
                HighY = (pts[0].lat * Math.PI) / 180;
            } else {
                LowX = (pts[i - 1].lng * Math.PI) / 180;
                LowY = (pts[i - 1].lat * Math.PI) / 180;
                MiddleX = (pts[i].lng * Math.PI) / 180;
                MiddleY = (pts[i].lat * Math.PI) / 180;
                HighX = (pts[i + 1].lng * Math.PI) / 180;
                HighY = (pts[i + 1].lat * Math.PI) / 180;
            }
            AM = Math.cos(MiddleY) * Math.cos(MiddleX);
            BM = Math.cos(MiddleY) * Math.sin(MiddleX);
            CM = Math.sin(MiddleY);
            AL = Math.cos(LowY) * Math.cos(LowX);
            BL = Math.cos(LowY) * Math.sin(LowX);
            CL = Math.sin(LowY);
            AH = Math.cos(HighY) * Math.cos(HighX);
            BH = Math.cos(HighY) * Math.sin(HighX);
            CH = Math.sin(HighY);
            CoefficientL =
                (AM * AM + BM * BM + CM * CM) / (AM * AL + BM * BL + CM * CL);
            CoefficientH =
                (AM * AM + BM * BM + CM * CM) / (AM * AH + BM * BH + CM * CH);
            ALtangent = CoefficientL * AL - AM;
            BLtangent = CoefficientL * BL - BM;
            CLtangent = CoefficientL * CL - CM;
            AHtangent = CoefficientH * AH - AM;
            BHtangent = CoefficientH * BH - BM;
            CHtangent = CoefficientH * CH - CM;
            AngleCos =
                (AHtangent * ALtangent +
                    BHtangent * BLtangent +
                    CHtangent * CLtangent) /
                (Math.sqrt(
                    AHtangent * AHtangent +
                    BHtangent * BHtangent +
                    CHtangent * CHtangent
                ) *
                    Math.sqrt(
                        ALtangent * ALtangent +
                        BLtangent * BLtangent +
                        CLtangent * CLtangent
                    ));
            if (AngleCos < -1.0) AngleCos = -1.0;
            if (AngleCos > 1.0) AngleCos = 1.0;
            AngleCos = Math.acos(AngleCos);
            ANormalLine = BHtangent * CLtangent - CHtangent * BLtangent;
            BNormalLine = 0 - (AHtangent * CLtangent - CHtangent * ALtangent);
            CNormalLine = AHtangent * BLtangent - BHtangent * ALtangent;
            if (AM != 0) OrientationValue = ANormalLine / AM;
            else if (BM != 0) OrientationValue = BNormalLine / BM;
            else OrientationValue = CNormalLine / CM;
            if (OrientationValue > 0) {
                Sum1 += AngleCos;
                Count1++;
            } else {
                Sum2 += AngleCos;
                Count2++;
            }
        }
        var tempSum1, tempSum2;
        tempSum1 = Sum1 + (2 * Math.PI * Count2 - Sum2);
        tempSum2 = 2 * Math.PI * Count1 - Sum1 + Sum2;
        if (Sum1 > Sum2) {
            if (tempSum1 - (Count - 2) * Math.PI < 1) Sum = tempSum1;
            else Sum = tempSum2;
        } else {
            if (tempSum2 - (Count - 2) * Math.PI < 1) Sum = tempSum2;
            else Sum = tempSum1;
        }
        totalArea = (Sum - (Count - 2) * Math.PI) * Radius * Radius;
        return totalArea; //返回总面积
    };

    /**
     * 判断折线与多边形是否相交
     *  参考：https://www.cnblogs.com/tuyang1129/p/9390376.html
     * @param {Polyline|Array<Point>} lines 折线
     * @param {Polygon|Array<Point>} polygon 多边形
     * @returns {Boolean} 折线和多边形是否相交
     */

    GeoUtils.isPolylineIntersectArea = function (lines, polygon) {
        var segmentIntersect = function (a, b, c, d) {
            var x1 = a.lng, y1 = a.lat;
            var x2 = b.lng, y2 = b.lat;
            var x3 = c.lng, y3 = c.lat;
            var x4 = d.lng, y4 = d.lat;

            if (!(Math.min(x1, x2) <= Math.max(x3, x4) && Math.min(y3, y4) <= Math.max(y1, y2) && Math.min(x3, x4) <= Math.max(x1, x2) && Math.min(y1, y2) <= Math.max(y3, y4)))
                return false;
            var u, v, w, z
            u = (x3 - x1) * (y2 - y1) - (x2 - x1) * (y3 - y1);
            v = (x4 - x1) * (y2 - y1) - (x2 - x1) * (y4 - y1);
            w = (x1 - x3) * (y4 - y3) - (x4 - x3) * (y1 - y3);
            z = (x2 - x3) * (y4 - y3) - (x4 - x3) * (y2 - y3);
            return (u * v <= 2e-10 && w * z <= 2e-10);
        }

        if (!(lines instanceof BMapGL.Polyline && polygon instanceof BMapGL.Polygon)) {
            console.error('参数出错,传入值非折线和多边形')
            return false;
        }

        lines = lines.getPath().map(function (point) { return { 'lng': point.lng, 'lat': point.lat } });
        polygon = polygon.getPath().map(function (point) { return { 'lng': point.lng, lat: point.lat } });

        // 包含点的判断
        if (lines.length < 1 || polygon.length <= 2) {
            console.error('参数出错,传入值非折线和多边形')
            return false;
        }
        var maybeLine = [], ploygonLine = [];
        // 遍历所有点 在内部直接返回true
        for (var j = 0; j < lines.length; j++) {
            if (GeoUtils.isPointInPolygon(lines[j], polygon)) {
                return true;
            }
        }

        for (var n = 1; n < lines.length; n++) {
            maybeLine.push([lines[n - 1], lines[n]]);
        }

        for (var k = 1; k < polygon.length; k++) {
            ploygonLine.push([polygon[k - 1], polygon[k]]);
        }
        ploygonLine.push([polygon[polygon.length - 1], polygon[0]]);

        // 折线与多边形边若相交则返回true
        for (var l = 0; l < maybeLine.length; l++) {
            for (var m = 0; m < ploygonLine.length; m++) {
                if (segmentIntersect(maybeLine[l][0], maybeLine[l][1], ploygonLine[m][0], ploygonLine[m][1])) return true;
            }
        }
        return false;
    }


})(); //闭包结束

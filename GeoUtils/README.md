# Example
```javascript

// 1. 初始化地图和基础几何对象
var map = new BMapGL.Map("container");
map.centerAndZoom(new BMapGL.Point(116.404, 39.915), 15);

// 构建测试用的几何对象
var testPoint = new BMapGL.Point(116.404, 39.915); // 测试点
var rectBounds = new BMapGL.Bounds(new BMapGL.Point(116.3, 39.8), new BMapGL.Point(116.5, 40.0)); // 矩形
var circle = new BMapGL.Circle(testPoint, 1000); // 圆形（圆心+半径1000米）
var polyline = new BMapGL.Polyline([ // 折线
    new BMapGL.Point(116.39, 39.9),
    new BMapGL.Point(116.4, 39.91),
    new BMapGL.Point(116.41, 39.92)
]);
var polygon = new BMapGL.Polygon([ // 多边形
    new BMapGL.Point(116.38, 39.89),
    new BMapGL.Point(116.4, 39.91),
    new BMapGL.Point(116.42, 39.89)
]);

// 2. 调用GeoUtils静态方法
// 判断点是否在矩形内
var isInRect = BMapGLLib.GeoUtils.isPointInRect(testPoint, rectBounds);

// 判断点是否在圆形内
var isInCircle = BMapGLLib.GeoUtils.isPointInCircle(testPoint, circle);


// 判断点是否在折线上
var isOnPolyline = BMapGLLib.GeoUtils.isPointOnPolyline(testPoint, polyline);
 
```

# API
| Name 	| Parameters | Description | returnValue |
|------|------------|-------------| -----|
| isPointInRect | point<BMapGL.Point>, bounds<BMapGL.Bounds>| 判断点是否在矩形范围内 |  Boolean |
| isPointInCircle | point<BMapGL.Point>, circle<BMapGL.Circle>| 判断点是否在圆形范围内 |  Boolean |
| isPointOnPolyline | point<BMapGL.Point>, polyline<BMapGL.Polyline>|判断点是否在折线上|Boolean |
| isPointInPolygon | point<BMapGL.Point>, polygon<BMapGL.Polygon>| 判断点是否在多边形范围内| Boolean |
| degreeToRad | degree<Number>|将角度（度）转换为弧度| Number |
| radToDegree | rad<Number>| 将弧度转换为角度（度）| Number|
| getDistance | point1<BMapGL.Point>, point2<BMapGL.Point>|计算两个经纬度点之间的直线距离|Number - 距离（单位：米）|
| getPolylineDistance |polyline<BMapGL.Polyline/Array<Point>>|计算折线 / 点数组的总长度|Number - 长度（单位：米） |
 getPolygonArea| polygon<BMapGL.Polygon/Array<Point>>|计算多边形 / 点数组构成图形的面积（非自相交）|Number - 面积（单位：平方米 |
| isPolylineIntersectArea |<BMapGL.Polyline>,<BMapGL.Polygon>| 判断折线与多边形是否相交（含折线顶点在多边形内的情况）|Boolean |

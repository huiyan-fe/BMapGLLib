# Example
```javascript
var map = new BMapGL.Map("container");
map.centerAndZoom(new BMapGL.Point(118.454, 32.955), 6);
map.enableScrollWheelZoom(true);

var points = [
  new BMapGL.Point(116.432045, 39.910683),
  new BMapGL.Point(120.129721, 30.314429),
  new BMapGL.Point(121.491121, 25.127053)
];

var curve = new BMapGLLib.CurveLine(points, {
  strokeColor: "blue",
  strokeWeight: 3,
  strokeOpacity: 0.5
});
map.addOverlay(curve);
curve.enableEditing();
```

# Options
| Name | Type | Description |
|------|------|-------------|
| strokeColor | `String` | 弧线颜色，同 PolylineOptions |
| strokeWeight | `Number` | 弧线宽度，单位像素 |
| strokeOpacity | `Number` | 弧线透明度，取值范围 0-1 |
| 其他 | `Object` | 其余参数同 [JSAPI PolylineOptions](http://lbsyun.baidu.com/index.php?title=jspopularGL/class/Polyline) |

# API
| Name | Parameters | Description | returnValue |
|------|------------|-------------|-------------|
| enableEditing | none | 开启弧线编辑，显示可拖拽控制点 | none |
| disableEditing | none | 关闭弧线编辑，移除控制点 | none |
| getPath | none | 获取弧线当前路径（插值后的折线点数组） | `Array<Point>` |

弧线实例为 `BMapGL.Polyline` 子类，支持 `setPath`、`setStrokeColor` 等 Polyline 方法；`cornerPoints` 为控制点数组（起点、途经点、终点）。

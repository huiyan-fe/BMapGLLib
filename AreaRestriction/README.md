# Example
```javascript
// 1. 定义限定的地图区域范围（西南角和东北角坐标）
var southWest = new BMapGL.Point(116.20, 39.80); // 西南角坐标
var northEast = new BMapGL.Point(116.50, 40.10); // 东北角坐标
var bounds = new BMapGL.Bounds(southWest, northEast);

// 2. 为地图设置浏览区域限制
BMapGLLib.AreaRestriction.setBounds(map, bounds);

// 3. （可选）清除区域限制
// BMapGLLib.AreaRestriction.clearBounds();
```

# Options
| Name | Type | Description |
|------|--------|-------------|
| bounds | `BMapGL.Bounds` | 限定的地图浏览区域范围（由西南角、东北角坐标组成）|

# API
| Name 	| Parameters | Description | returnValue |
|------|------------|-------------| -----|
| setBounds |map<BMapGL.Map>, bounds<BMapGL.Bounds>| 为地图设置浏览区域限制| none|
| clearBounds | none | 清除已设置的地图浏览区域限制| none |



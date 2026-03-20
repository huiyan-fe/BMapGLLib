## Example

```javascript
var map = new BMapGL.Map("container");
map.centerAndZoom(new BMapGL.Point(116.404, 39.915), 15);
map.enableScrollWheelZoom(true);

var mgr = new BMapGLLib.MarkerManager(map, {
  borderPadding: 200,  // 视口外扩像素，可选
  maxZoom: 18         // 监视的最大缩放级别，可选
});

// 按 zoom 范围添加 marker
var markers = [ /* BMapGL.Marker 数组 */ ];
mgr.addMarkers(markers, 10, 15);  // 仅在 10～15 级显示

mgr.showMarkers();  // 根据当前视野与 zoom 刷新显示
```

## 构造函数选项

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| borderPadding | `Number` | 0 | 视口外扩像素，落在该范围内的 marker 也会被加载 |
| maxZoom | `Number` | 19 | 管理器监视的最大缩放级别 |

## API

| 方法 | 参数 | 说明 |
|------|------|------|
| addMarker | (marker, minZoom?, maxZoom?) | 添加单个 marker，可指定显示的 zoom 范围 |
| addMarkers | (markers, minZoom?, maxZoom?) | 批量添加 marker |
| removeMarker | (marker) | 从地图和管理器中移除指定 marker |
| getMarkerCount | (zoom?) | 返回指定 zoom（不传则当前 zoom）下“可见”的 marker 数量 |
| show | — | 显示当前应在视野内的 marker |
| hide | — | 隐藏当前应在视野内的 marker |
| toggle | — | 在显示/隐藏之间切换 |
| showMarkers | — | 根据当前视野与 zoom 刷新并显示应显示的 marker |
| clearMarkers | — | 移除并清空所有由本管理器管理的 marker |

## 示例

[examples/MarkerManager.html](./examples/MarkerManager.html)：按多组 zoom 配置批量添加 marker，并演示 clearMarkers、show、hide、toggle 及双击移除。

## 与 2D 版差异

- 依赖 `BMapGL.Map`、`BMapGL.Marker`、`BMapGL.Point`、`BMapGL.Bounds`、`BMapGL.Pixel`。
- 除 `zoomend`、`dragend` 外，会监听 `zooming`、`moving` 以在 GL 版地图下及时刷新。
- 接口与 2D 版 MarkerManager 保持一致，便于从 2D 迁移到 GL。

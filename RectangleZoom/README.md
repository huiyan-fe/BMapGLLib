# Example

```javascript
var map = new BMapGL.Map("container");
map.centerAndZoom(new BMapGL.Point(116.404, 39.915), 12);
map.enableScrollWheelZoom();

// 创建拉框放大工具
var rectangleZoom = new BMapGLLib.RectangleZoom(map, {
    followText: "拖拽鼠标进行放大",
    strokeWeight: 2,
    strokeColor: "#111",
    style: "solid",      // solid | dashed
    fillColor: "#ccc",
    opacity: 0.35,
    cursor: "crosshair",
    autoClose: false
});

// 开启/关闭
rectangleZoom.open();
// rectangleZoom.close();
```

# Options

| Name | Type | Description |
|------|------|-------------|
| zoomType | `Number` | 拉框后放大还是缩小：`0`(放大) / `1`(缩小) |
| followText | `String` | 开启后鼠标跟随提示文字（可选） |
| strokeWeight | `Number` | 矩形框线宽 |
| strokeColor | `String` | 矩形框线色 |
| style | `String` | 矩形框线样式：`solid` / `dashed` |
| fillColor | `String` | 矩形框填充色 |
| opacity | `Number` | 矩形框透明度（0~1） |
| cursor | `String` | 鼠标样式（工具开启时生效） |
| autoClose | `Boolean` | 每次拉框放大结束后是否自动关闭 |

# API

| Name | Parameters | Description | returnValue |
|------|------------|-------------|------------|
| 构造函数 | map\<BMapGL.Map\>, options\<Object\> | 创建拉框放大工具实例 | RectangleZoom 实例 |
| open | none | 开启拉框放大状态（若已有其他工具占用则返回 false） | `Boolean` |
| close | none | 关闭拉框放大状态，恢复默认光标 | none |
| setStrokeColor | color\<String\> | 设置矩形框线色 | none |
| setLineStroke | width\<Number\> | 设置矩形框线宽 | none |
| setLineStyle | style\<String\> | 设置矩形框线样式（`solid`/`dashed`） | none |
| setOpacity | opacity\<Number\> | 设置矩形框透明度（0~1） | none |
| setFillColor | color\<String\> | 设置矩形框填充色 | none |
| setCursor | cursor\<String\> | 设置鼠标样式（开启后立即生效） | none |

# Demo

- `examples/RectangleZoom.html`


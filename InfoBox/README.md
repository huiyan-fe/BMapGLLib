# Example
```javascript
// 1. 初始化地图
var map = new BMapGL.Map("container");
map.centerAndZoom(new BMapGL.Point(116.404, 39.915), 11);
map.enableScrollWheelZoom(true);

// 2. 创建自定义信息窗口
var infoBox = new BMapGLLib.InfoBox(map, "窗口内容", {
    boxStyle: { background: "#fff", padding: "10px", width: "200px" },
    enableAutoPan: true, // 自动平移让窗口完整显示
    align: INFOBOX_AT_BOTTOM // 窗口显示在锚点下方
});

// 3. 打开窗口（支持Point/Marker两种锚点）
infoBox.open(new BMapGL.Point(116.404, 39.915)); // 基于坐标点打开
// infoBox.open(marker); // 基于Marker打开
```

# Options
| Name | Type | Description |
|------|--------|-------------|
| offset | `BMapGL.Size` | infoBox偏移量 |
| boxClass | `String` | 定义infoBox的class|
| boxStyle | `Object` | 定义infoBox的style,此项会覆盖boxClass |
| showCloseIcon | `Boolean` | 是否显示关闭按钮 |
| closeIconWidth | `String` | 关闭按钮的宽度 |
| closeIconClickType | `Number` | 关闭按钮点击行为：0 - 关闭 (销毁 DOM) 1 - 隐藏 (display:none) |
| closeIconMargin | `String` | 关闭按钮的外边距 |
| closeIconUrl | `String` | 关闭按钮的图片 URL |
| align | `Number` | 基于哪个位置进行定位，取值为[INFOBOX_AT_TOP,INFOBOX_AT_BOTTOM]|
| disableClose | `Boolean` | 是否禁用关闭功能 |

# API
| Name 	| Parameters | Description | returnValue |
|------|------------|-------------| -----|
| open | anchor: BMapGL.Point/BMapGL.Marker| 打开信息窗口（支持坐标点 / Marker 两种锚点） | none |
| close | none | 关闭信息窗口 | none |
| enableAutoPan | none | 启用自动平移功能 | none |
| disableAutoPan | none | 禁用自动平移功能| none |
| setContent | String/HTMLElement| 设置信息窗口内容|none |
| setPosition | BMapGL.Point | 设置信息窗口的地理位置 |none |
| getPosition | none | 获取信息窗口的地理位置 |BMapGL.Point |
| getOffset |none| 获取信息窗口的像素偏移量 |BMapGL.Size |
| addEventListener | event, handler | 添加事件监听函数 | none |
| removeEventListener | event, handler | 删除事件监听函数 | none |






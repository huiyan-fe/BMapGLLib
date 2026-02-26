# Example
```javascript
// 1. 初始化地图
var map = new BMapGL.Map("container");
map.centerAndZoom(new BMapGL.Point(116.404, 39.915), 15);
map.enableScrollWheelZoom(true);

// 2. 初始化测距工具（可配置自定义样式）
var distanceTool = new BMapGLLib.DistanceTool(map, {
    lineColor: "#ff0000", // 折线颜色
    lineStroke: 3, // 折线宽度
    unit: "metric", // 单位制：metric(米/公里)、us(英尺/英里)
    followText: "单击确定测点，双击结束测距" // 跟随提示文字
});

// 3. 绑定事件（可选）
// 绑定添加测点事件
distanceTool.addEventListener("addpoint", function(e) {
    console.log("新增测点坐标：", e.point);
    console.log("累计测距：", e.distance + "米");
});

// 绑定测距结束事件
distanceTool.addEventListener("drawend", function(e) {
    console.log("测距完成，总距离：", e.distance + "米");
    console.log("所有测点：", e.points);
});

// 绑定清除测距结果事件
distanceTool.addEventListener("removepolyline", function(e) {
    console.log("已清除本次测距结果");
});

// 4. 开启测距
distanceTool.open();

// 5. （可选）手动关闭测距（双击地图会自动关闭）
// distanceTool.close();
```

# Options
| Name | Type | Description |
|------|--------|-------------|
| followText | `String` | 测距过程中提示框文字 |
| unit| `String` | 测距结果所用的单位制，可接受的属性为"metric"表示米制和"us"表示美国传统单位 |
| lineColor| `String` | 折线颜色 |
| lineStroke| `Number` |折线宽度 |
| opacity | `Number` | 透明度|
| lineStyle| `String` |折线样式，可选solid（实线）、dashed（虚线|
| secIcon| `BMapGL.Icon` | 转折点的Icon |
| closeIcon| `BMapGL.Icon` |关闭按钮的Icon|
| cursor | `String` | 跟随的鼠标样式|
# API
| Name 	| Parameters | Description | returnValue |
|------|------------|-------------| -----|
| open | none | 开启测距状态 | none |
| close | none | 关闭测距状态｜none |
| addEventListener | type<String>, handler<Function>| 绑定测距相关事件；type：事件类型（addpoint/drawend/removepolyline）；handler：事件回调函数|none |
| removeEventListener | type<String>, handler<Function>| 移除已绑定的测距事件；type：事件类型；handler：绑定的回调函数|none |



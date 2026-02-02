# Example
```javascript
var lushu = new BMapGLLib.LuShu(map, [
    new BMapGL.Point(116.314782, 39.913508),
    new BMapGL.Point(116.315391, 39.964429),
    new BMapGL.Point(116.324782, 39.973508)
], {
    landmarkPois: [
        {lng:116.314782,lat:39.913508,html:'加油站',pauseTime:2},
        {lng:116.315391,lat:39.964429,html:'高速公路收费站',pauseTime:3}
    ],
    icon: new BMapGL.Icon('car.png', new BMapGL.Size(32, 32)),
    speed: 400,
    defaultContent: '车辆轨迹演示',
    enableRotation: true,
    autoView: false
});

// 控制轨迹运动
lushu.start();
//lushu.stop();
//lushu.clear();
//lushu.pause();
//lushu.hideInfoWindow();
//lushu.showInfoWindow();
```

# Options
| Name | Type | Description |
|------|--------|-------------|
| landmarkPois | `Array<Object>` | 轨迹中的特殊标记点，到达后暂停并显示自定义内容 |
| landmarkPois[].lng | `Number` | 特殊标记点的经度 |
| landmarkPois[].lat | `Number` | 特殊标记点的纬度 |
| landmarkPois[].html | `Number` | 特殊标记点展示的 HTML 内容 |
| landmarkPois[].pauseTime | `Object` | 到达特殊点后的暂停时间，单位为秒|
| icon | `BMapGL.Icon` | 覆盖物的icon|
| speed | `Number` | 覆盖物移动速度，单位米/秒，默认值为 400|
| defaultContent | `String` | 覆盖物中的内容|
| enableRotation | `Boolean` | 是否开启覆盖物随轨迹方向自动旋转，默认值为 false|
| autoView | `Boolean` | 是否自动调整地图视野，使 Marker 始终在视野内，默认值为 false |
| geodesic | `Boolean` | 是否启用大圆轨迹计算（适用于跨半球 / 长距离轨迹），默认值为 false |


# API
| Name 	| Parameters | Description | returnValue |
|------|------------|-------------| -----|
| start | none | 启动轨迹运动 | none |
| stop | none | 停止轨迹运动 | none |
| pause | none | 暂停轨迹运动｜none |
| clear | none | 停止运动并清除地图上所有相关覆盖物（Marker / 信息框），重置所有状态|none |
| hideInfoWindow | none | 隐藏自定义信息窗口|none |
| showInfoWindow | none | 显示自定义信息窗口 |none |
| setRotation | prePos<BMapGL.Point>, curPos<BMapGL.Point>, targetPos<BMapGL.Point>, direction<String>| 设置 Marker 旋转角度（适配轨迹方向），内部核心方法，一般无需手动调用|none |


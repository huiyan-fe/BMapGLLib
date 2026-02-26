# Example
```javascript
// 1. 初始化地图
var map = new BMapGL.Map("container");
map.centerAndZoom(new BMapGL.Point(116.404, 39.915), 12);
map.enableScrollWheelZoom(true);

// 2. 创建轨迹折线
var path = [
    new BMapGL.Point(116.30816, 40.056863),
    new BMapGL.Point(116.35816, 40.056863),
    new BMapGL.Point(116.40816, 40.006863),
    new BMapGL.Point(116.45816, 39.956863)
];
var polyline = new BMapGL.Polyline(path, {
    strokeColor: "#3388ff",
    strokeWeight: 5,
    strokeOpacity: 0.8
});
map.addOverlay(polyline);

// 3. 创建视角轨迹动画实例
var trackAni = new BMapGLLib.TrackAnimation(map, polyline, {
    zoom: 14,          // 动画过程中的缩放级别
    tilt: 60,          // 地图倾斜角度
    duration: 15000,   // 动画总时长(ms)
    delay: 1000,       // 延迟播放时间(ms)
    overallView: true, // 动画结束后是否显示轨迹总览
    heading: 0,        // 地图朝向角度
    onAnimateEnd: function(e) { // 动画结束回调
        console.log("轨迹动画播放完成");
    }
});

// 4. 控制动画
trackAni.start();    // 启动动画
// trackAni.pause();   // 暂停动画
// trackAni.continue();// 继续动画
// trackAni.cancel();  // 终止动画

// 5. 动态调整参数（需在启动前/暂停时调整）
trackAni.setSpeed(2); // 2倍速播放
trackAni.setTilt(70); // 修改倾斜角度
```

# Options
| Name | Type | Description |
|------|--------|-------------|
| zoom | `Number` | 动画过程中地图的缩放级别 |
| tilt | `Number` | 地图倾斜角度（0-90）|
| heading | `Number` |地图朝向角度 |
| duration | `Number` | 动画总时长（毫秒） |
| delay | `Number` | 动画延迟播放时间（毫秒） |
| overallView | `Boolean` | 动画结束后是否显示轨迹总览 |
| onAnimateEnd | `Function` | 动画结束回调 |

# API
| Name 	| Parameters | Description | returnValue |
|------|------------|-------------| -----|
| start | none| 启动轨迹动画 | none |
| cancel | none | 终止动画 | none |
| pause | none | 暂停动画 | none |
| continue | none | 继续播放暂停的动画| none |
| setZoom | Number| 设置动画缩放级别|none |
| getZoom | none| 获取缩放级别|Number |
| setTilt | Number | 设置倾斜角度 |none |
| getTilt | none | 获取倾斜角度 |Number|
| setDelay |Number| 设置延迟时间 | none|
| getDelay |none| 获取延迟时间 | Number |
| setDuration | Number | 设置动画时长 | none |
| getDuration | none| 获取动画时长 | Number |
| setSpeed | Number | 设置播放速度（>0） | none |
| getSpeed | none | 获取播放速度因子 | Number|
| enableOverallView | none | 开启动画结束总览| none |
| disableOverallView | 关闭动画结束总览|none |
| setPolyline | BMapGL.Polyline | 更新轨迹折线 |none |
| getPolyline | none | 获取轨迹折线 |BMapGL.Polyline |
| getLastPoint |none| 获取动画最后 4 个轨迹点 |Array<BMapGL.Point> |






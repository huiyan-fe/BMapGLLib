## Example
```javascript
    const marker = new BMapGL.Marker(new BMapGL.Point(116.404844, 39.921354));
    map.addOverlay(marker);

    const times = [
        '2024-01-01',
        '2024-01-02',
        '2024-01-03',
        '2024-01-04',
    ];
    const timeline = new BMapGLLib.Timeline({
        map,
        times,
    });

    const points = [
        new BMapGL.Point(116.341028,39.94083),
        new BMapGL.Point(116.308833,39.92224),
        new BMapGL.Point(116.459461,39.854476),
        new BMapGL.Point(116.430715,39.932863),
    ];

    timeline.on('change', e => {
        console.log(e);
        const point = points[times.indexOf(e.time)];
        console.log(point);
        marker.setPosition(point);
    });
```

## Options
| Name | Type  | Description |
| :------------ |:---------------:| :-----------|
| times | `string[]` | 时间数组 |
| map | `BMap.Map` | 地图实例 |
| customContainer | `HTMLElement` | 自定义容器 |
| interval | `number` | 间隔时间，单位毫秒 |
| playButton | `HTMLElement` | 播放按钮 |
| pauseButton | `HTMLElement` | 暂停按钮 |
| className | `string` | 自定义类名 |
| progressButtonStyle | `object` | 进度按钮样式 |
| scrollStyle | `object` | 滚动条样式 |
| timeStyle | `object` | 时间样式 |
| dividerStyle | `object` | 分割线样式 |

## API
| Name | Type  | Description |
| :------------ |:---------------:| :-----------|
| play | `Function` | 播放 |
| pause | `Function` | 暂停 |
| on | `Function` | 监听事件 |
| un | `Function` | 取消监听事件 |
| destroy | `Function` | 销毁实例 |

## Events
| Name | Description |
| :------------ | :-----------|
| change | 时间改变 |
| playstart | 播放开始事件 |
| playend | 播放结束事件 |

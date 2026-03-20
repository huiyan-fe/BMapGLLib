# Example
```javascript
var map = new BMapGL.Map("container", { enableMapClick: false });
map.centerAndZoom(new BMapGL.Point(116.418261, 39.921984), 15);
map.enableScrollWheelZoom(true);

var heatmapOverlay = new BMapGLLib.HeatmapOverlay({
    radius: 20,
    visible: true,
    opacity: 70
});
map.addOverlay(heatmapOverlay);

heatmapOverlay.setDataSet({
    max: 100,
    data: [
        { lng: 116.418261, lat: 39.921984, count: 50 },
        { lng: 116.423332, lat: 39.916532, count: 51 }
    ]
});

heatmapOverlay.show();
```

# Options
| Name | Type | Description |
|------|------|-------------|
| radius | `Number` | 热力图每个点的半径大小，默认值为40 |
| visible | `Boolean` | 热力图是否显示，默认值为true |
| opacity | `Number` | 热力图透明度，取值范围1-100 |
| gradient | `Object` | 热力图渐变区间，key 为 0~1 的插值点，value 为颜色值 |
| max | `Number` | 热力值最大值，可在 `setDataSet` 中设置 |

# API
| Name | Parameters | Description | returnValue |
|------|------------|-------------|-------------|
| setDataSet | data | 设置热力图数据，格式：`{ max, data: [{ lng, lat, count }] }` | none |
| addDataPoint | lng, lat, count | 添加一个热力点 | none |
| show | none | 显示热力图 | none |
| hide | none | 隐藏热力图 | none |
| toggle | none | 切换显示/隐藏状态 | none |
| setOptions | opts | 更新热力图配置项（如 radius/gradient/opacity） | none |

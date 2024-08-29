## 注意Swipe不支持同步倾斜角和旋转角度，在线地图同步zoom有延迟，离线地图无延迟

## Example
```html
    <div id="wrapper">
        <div id="map"></div>
        <div id="map2"></div>
    </div>
```

```javascript
    // 百度地图API功能
    var map = new BMapGL.Map('map', {
        enableIconClick: true,
        preserveDrawingBuffer: true,
        maxZoom: 20,
    }); // 创建Map实例
    map.enableScrollWheelZoom();

    map.centerAndZoom(new BMapGL.Point(116.404844, 39.921354), 11);

    const map2 = new BMapGL.Map('map2');
    map2.enableScrollWheelZoom();
    map2.centerAndZoom(new BMapGL.Point(116.404844, 39.921354), 11);

    map2.setMapStyleV2({
        styleJson: darkStyle
    });

    new BMapGLLib.Swipe(map, map2, document.getElementById('wrapper'));
```

## Options
| Name | Type  | Description |
| :------------ |:---------------:| :-----------|
| map | BMapGL.Map | 百度地图实例 |
| map2 | BMapGL.Map | 百度地图实例 |
| wrapper | HTMLElement | 地图容器 |

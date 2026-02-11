# Example
```javascript
// 1. 创建坐标点
var point = new BMapGL.Point(116.404, 39.915);

// 2. 自定义覆盖物HTML内容
var htmlContent = '<div style="width:50px;height:50px;background:red;border-radius:50%;"></div>';

// 3. 配置参数
var options = {
    zIndex: 100, // 覆盖物层级
    offset: {width: -25, height: -25}, // 偏移量
    unit: 'px' // 偏移量单位，可选 'px' 或 'm'
};

// 4. 创建自定义覆盖物实例
var customOverlay = new BMapGLLib.CustomOverlay(point, htmlContent, options);

// 5. 添加到地图
map.addOverlay(customOverlay);

// 6. 绑定事件
customOverlay.addEventListener('onmousedown', function(e) {
    console.log('鼠标按下', e.latlng);
    // 可在此处禁用地图拖拽，实现覆盖物拖拽效果
    map.disableDragging();
});

customOverlay.addEventListener('onmousemove', function(e) {
    console.log('鼠标移动', e.latlng);
    // 更新覆盖物位置
    customOverlay.setPosition(e.latlng);
    customOverlay.draw();
});

customOverlay.addEventListener('onmouseup', function(e) {
    console.log('鼠标抬起', e.latlng);
});

// 7. 更新覆盖物位置
var newPoint = new BMapGL.Point(116.414, 39.925);
customOverlay.setPosition(newPoint);
customOverlay.draw(); // 重新绘制以生效
```

# Options
| Name | Type | Description |
|------|--------|-------------|
| zIndex | `Number` | 覆盖物的 z-index 层级 |
| offset| `Object` | 覆盖物相对于定位点的偏移量，默认值{width: 0, height: 0} |
| offset.width| `Number` | 水平偏移量 |
| offset.height| `Number` | 垂直偏移量 |
| unit | `String` | 偏移量单位，可选px（像素）、m（米）|

# API
| Name 	| Parameters | Description | returnValue |
|------|------------|-------------| -----|
| 构造函数 | point<BMapGL.Point>, html<String/HTMLElement>, options<Object> | 创建自定义覆盖物实例；point：覆盖物定位坐标点；html：覆盖物 DOM 内容（字符串 / 原生 DOM 元素）options：配置参数（可选） | CustomOverlay 实例 |
| draw | none | 绘制 / 更新覆盖物位置（根据定位点 + 偏移量计算 DOM 像素位置），坐标更新后需手动调用生效 | none |
| setPosition | point<BMapGL.Point> | 设置覆盖物的定位坐标点（仅更新坐标，需调用 draw () 生效）｜none |
| addEventListener | type<String>, handler<Function>, [key<String>]| 绑定覆盖物事件；type：事件类型（onmousedown/onmousemove/onmouseup）；handler：事件回调（参数含 latlng 坐标）；key：事件标识（可选，用于移除事件）|none |
| removeEventListener | type<String>, handler<Function/String> | 移除覆盖物事件；type：事件类型；handler：事件回调函数或事件标识 key|none |
| dispose | none | 释放实例资源（清空非方法属性、删除全局实例引用），需手动调用 map.removeOverlay 移除地图上的 DOM|none |


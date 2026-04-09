# MarkerClusterer（GL 版）

`BMapGLLib.MarkerClusterer` 用于对大量 `BMapGL.Marker` 做网格聚合，减轻覆盖与性能压力。

---

## 快速使用

```html
<!-- 引入BMapGL -->
<script src="//api.map.baidu.com/api?type=webgl&v=1.0&ak=你的AK"></script>
<!-- 引入MarkerClusterer -->
<script src="path/to/MarkerClusterer.min.js"></script>
```

```javascript
var map = new BMapGL.Map('container');
map.centerAndZoom(new BMapGL.Point(116.404, 39.915), 4);
map.enableScrollWheelZoom(true);

var markers = [];
for (var i = 0; i < 100; i++) {
  var pt = new BMapGL.Point(Math.random() * 40 + 85, Math.random() * 30 + 21);
  markers.push(new BMapGL.Marker(pt));
}

var mc = new BMapGLLib.MarkerClusterer(map, { markers: markers });
```

---

## 构造参数

```javascript
new BMapGLLib.MarkerClusterer(map, options)
```


| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `markers` | `BMapGL.Marker[]` | 无 | 初始标注数组；传数组即会 `addMarkers`（可为空数组） |
| `gridSize` | `Number` | `60` | 聚合网格像素大小，越大越容易并成簇 |
| `maxZoom` | `Number` | `18` | 最大聚合级别；**当前级别 `> maxZoom` 时簇展开为散点** |
| `minClusterSize` | `Number` | `2` | 最小成簇数量；簇内点数 **小于** 该值时只显示散点、不显示聚合图标 |
| `isAverageCenter` | `Boolean` | `false` | 仅当在 `options` 里**显式传入**时覆盖默认；`true` 时簇中心为点集平均坐标，否则为第一个点 |
| `styles` | `Array` | `[]` | 自定义聚合图标样式，见下文「样式配置」 |

---

## 样式配置

`styles` 为数组，定义不同聚合数量时的样式。

| 聚合数量 count | 使用样式 |
|----------------|----------|
| 0–9 | `styles[0]` |
| 10–19 | `styles[1]` |
| 20–29 | `styles[2]` |
| … | … |

未传 `styles` 时，使用内置五档尺寸与颜色的圆形图标。

每项样式对象可含字段：

| 字段 | 类型 | 说明 |
|------|------|------|
| `url` / `icon` | `String` | 背景图地址 |
| `size` / `sizes` | `[w,h]` 或 `BMapGL.Size` | 图标像素尺寸，默认约 `53×53` |
| `textColor` | `String` | 数字颜色，默认 `#ffffff` |
| `textSize` / `opt_textSize` | `Number` | 数字字号（px），默认 `12` |
| `color` | `String` | 无有效背景图时的圆填充色 |
| `anchor` / `opt_anchor` | `BMapGL.Size` 或 `[x,y]` | 图标锚点；不传则图标中心对齐坐标 |

**示例：**

```javascript
var myStyles = [
  {
    url: './images/cluster_small.png',
    size: [40, 40],
    textColor: '#fff',
    opt_textSize: 12
  },
  {
    url: './images/cluster_large.png',
    size: [50, 50],
    textColor: '#fff',
    textSize: 14
  }
];

mc.setStyles(myStyles);
```

---

## API

### 标注管理

| 方法 | 返回值 | 说明 |
|------|--------|------|
| `addMarker(marker)` | — | 推入内部列表并 `_createClusters` |
| `addMarkers(markers)` | — | 批量推入并 `_createClusters` |
| `removeMarker(marker)` | `Boolean` | 从地图与列表移除，保留 `Label`；成功则清簇后 `_createClusters` |
| `removeMarkers(markers)` | `Boolean` | 同上批量 |
| `clearMarkers()` | — | 清簇、移除所有托管 marker（恢复 label）、清空内部数组 |

### 参数读写

| 方法 | 说明 |
|------|------|
| `setGridSize` / `getGridSize` | 网格像素 |
| `setMaxZoom` / `getMaxZoom` | 最大聚合级别 |
| `setMinClusterSize` / `getMinClusterSize` | 最小成簇数量 |
| `setStyles(styles)` / `getStyles()` | 样式数组；`setStyles` 会预加载图片并 `_redraw` |
| `setAverageCenter` / `isAverageCenter` | GL 扩展：动态开关平均中心 |


---

## 示例

打开`examples/index.html`，将`ak=`替换为你的百度地图AK后直接在浏览器运行。

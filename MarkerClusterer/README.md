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
| `styles` | `Array` | 内嵌默认五档 | 自定义聚合图标样式，见下文「样式配置」 |

---

## 样式配置

`styles` 为数组，定义不同聚合数量时的样式。

| 聚合数量 count | 使用样式 |
|----------------|----------|
| 0–9 | `styles[0]` |
| 10–19 | `styles[1]` |
| 20–29 | `styles[2]` |
| … | … |

未传 `styles` 时，使用内嵌的五档base64图标，默认文字为黑色。

每项样式对象可含字段：

| 字段 | 类型 | 说明 |
|------|------|------|
| `url` / `icon` | `String` | 背景图地址（data URL、同源路径、绝对URL均可，参见下文「自定义远程图」） |
| `size` / `sizes` | `[w,h]` 或 `BMapGL.Size` | 图标像素尺寸，默认使用对应档次的 `DEFAULT_SIZES[i]` |
| `textColor` | `String` | 数字颜色，默认 `#000` |
| `textSize` / `opt_textSize` | `Number` | 数字字号（px），默认 `12 + 档次索引` |
| `color` | `String` | 图未加载/未提供时Canvas画圆的填充色 |
| `haloColor` | `String` | 图未加载/未提供时Canvas画圆的外圈光晕色 |
| `anchor` / `opt_anchor` | `BMapGL.Size` 或 `[x,y]` | 图标锚点；不传则图标中心对齐坐标 |

**示例：**

```javascript
var myStyles = [
  {
    url: './images/cluster_small.png',
    size: [40, 40],
    textColor: '#fff',
    textSize: 12
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

### 自定义远程图（CORS 注意事项）

要求返回 `Access-Control-Allow-Origin` 响应头。

**推荐按以下顺序选择图片来源：**

1. **内嵌 `data:image/...;base64,...`**：最稳，不涉及任何网络与跨域
2. **同源路径**（如 `./icons/m0.png`、`/static/m0.png`）
3. **带CORS响应头的CDN**

此外，可在样式里通过`color` / `haloColor`定制圆点样式作为替代：

```javascript
{
  // 不传 url / icon
  size: [50, 50],
  color: '#ff5252',
  haloColor: 'rgba(255,82,82,0.5)',
  textColor: '#fff',
  textSize: 13
}
```

---

## API

### 标注管理

| 方法 | 返回值 | 说明 |
|------|--------|------|
| `addMarker(marker)` | — | 推入内部列表并重新聚合 |
| `addMarkers(markers)` | — | 批量推入并重新聚合 |
| `removeMarker(marker)` | `Boolean` | 从地图与列表移除，保留 `Label`；成功则重建簇 |
| `removeMarkers(markers)` | `Boolean` | 同上批量 |
| `clearMarkers()` | — | 清簇、移除所有托管 marker（恢复 label）、清空内部数组 |
| `getMarkers()` | `BMapGL.Marker[]` | 返回内部托管的全部 marker（直接引用，勿直接修改） |

### 参数读写

| 方法 | 说明 |
|------|------|
| `setGridSize(size)` / `getGridSize()` | 网格像素 |
| `setMaxZoom(zoom)` / `getMaxZoom()` | 最大聚合级别 |
| `setMinClusterSize(size)` / `getMinClusterSize()` | 最小成簇数量 |
| `setStyles(styles)` / `getStyles()` | 样式数组；`setStyles` 会清空 Icon 缓存、预加载图片并重绘 |
| `setAverageCenter(bool)` / `isAverageCenter()` | GL 扩展：动态开关平均中心 |
| `getMap()` | 关联的 `BMapGL.Map` 实例 |
| `getImageCache()` | 内部图片缓存对象（调试用） |


## 示例

打开`examples/index.html`，将`ak=`替换为你的百度地图AK后直接在浏览器运行。

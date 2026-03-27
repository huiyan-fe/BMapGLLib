# MarkerClusterer（GL版）

`BMapGLLib.MarkerClusterer` 用于对大量`BMapGL.Marker`做网格聚合，解决地图上点位过密时覆盖和性能问题。

与2D版`BMapLib.MarkerClusterer`逻辑完全一致，API基本兼容，可低成本迁移。

> **渲染方式**：每个聚合簇用`BMapGL.Marker` + canvas自绘图标呈现（等价于2D版的`TextIconOverlay`），通过`addOverlay` / `removeOverlay`管理生命周期。

---

## 快速使用

```html
<!-- 引入BMapGL -->
<script src="//api.map.baidu.com/api?type=webgl&v=1.0&ak=你的AK"></script>
<!-- 引入MarkerClusterer -->
<script src="path/to/MarkerClusterer.js"></script>
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
|---|---|---|---|
| `markers` | `BMapGL.Marker[]` | `[]` | 初始要聚合的标注数组 |
| `gridSize` | `Number` | `60` | 聚合网格像素大小。值越大，聚合范围越广 |
| `maxZoom` | `Number` | `18` | 最大聚合级别。`zoom > maxZoom`时，所有簇展开为散点 |
| `minClusterSize` | `Number` | `2` | 最小聚合数量。同一网格内marker数量小于此值时，直接显示散点 |
| `isAverageCenter` | `Boolean` | `false` | 聚合落脚点是否取所有点的平均坐标。`false`时落在第一个点上 |
| `styles` | `Array` | `[]` | 自定义聚合图标样式数组，见下方"样式配置"说明 |

---

## 样式配置

`styles`是一个数组，每项对应一个数量区间的聚合图标外观。**样式下标按聚合数量的位数自动选择**：

| 聚合数量 | 使用的样式 |
|---|---|
| 1–9 | `styles[0]` |
| 10–99 | `styles[1]` |
| 100–999 | `styles[2]` |
| 以此类推… | … |
| 超出数组长度 | 使用最后一项 |

> 不传`styles`时，使用内置的绿→黄→橙→橙红→红五档渐变圆形图标。

每项样式对象支持以下字段：

| 字段 | 类型 | 说明 |
|---|---|---|
| `url` 或 `icon` | `String` | 背景图片URL（支持http链接或data URL）。图片会异步预加载，加载完成前先显示纯色圆形 |
| `size` 或 `sizes` | `[width, height]` 或 `{width, height}` | 图标像素尺寸。未设置时默认`53×53` |
| `textColor` | `String` | 数字颜色，默认`'#fff'` |
| `opt_textSize` 或 `textSize` | `Number` | 数字字号（px），默认`12` |
| `color` | `String` | 无背景图时的纯色圆形填充色 |

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
    url: './images/cluster_medium.png',
    size: [50, 50],
    textColor: '#fff',
    opt_textSize: 14
  },
  {
    url: './images/cluster_large.png',
    size: [60, 60],
    textColor: '#fff',
    opt_textSize: 16
  }
];

mc.setStyles(myStyles);
```

---

## API

### 标注管理

| 方法 | 返回值 | 说明 |
|---|---|---|
| `addMarker(marker)` | — | 添加单个marker并重新聚合 |
| `addMarkers(markers)` | — | 批量添加marker并重新聚合 |
| `removeMarker(marker)` | `Boolean` | 删除单个marker，成功返回`true` |
| `removeMarkers(markers)` | `Boolean` | 批量删除marker，有删除成功返回`true` |
| `clearMarkers()` | — | 清空所有marker和聚合簇 |

### 参数读写

| 方法 | 说明 |
|---|---|
| `setGridSize(size)` / `getGridSize()` | 聚合网格像素大小 |
| `setMaxZoom(zoom)` / `getMaxZoom()` | 最大聚合级别 |
| `setMinClusterSize(size)` / `getMinClusterSize()` | 最小聚合数量 |
| `setStyles(styles)` / `getStyles()` | 聚合图标样式数组 |

### 只读信息

| 方法 | 返回值 | 说明 |
|---|---|---|
| `getMap()` | `BMapGL.Map` | 当前地图实例 |
| `getMarkers()` | `BMapGL.Marker[]` | 全部已托管的marker数组 |
| `getClustersCount()` | `Number` | 当前视野内实际聚合簇的数量 |
| `isAverageCenter()` | `Boolean` | 是否使用平均中心 |

---

## 行为说明

- **视野联动**：地图`zoomend` / `moveend`时自动重新计算聚合，视野外的marker不参与计算
- **点击聚合簇**：自动调用`map.setViewport()`缩放到该簇包含的所有点的范围
- **setStyles触发刷新**：调用`setStyles`后立即重绘；图片异步加载完成后再次刷新
- **缩放超过maxZoom**：所有聚合簇自动展开为独立散点marker

---

## 示例

打开`examples/index.html`，将`ak=`替换为你的百度地图AK后直接在浏览器运行。

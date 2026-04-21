# BMapGLLib.MarkerTool

百度地图 GL 版点击添加点标注工具，基于 BMapGL API 1.0。

## 使用方法

```html
<script src="https://api.map.baidu.com/api?v=1.0&type=webgl&ak=您的密钥"></script>
<script src="MarkerTool/src/MarkerTool.js"></script>
```

```javascript
var map = new BMapGL.Map("container");
map.centerAndZoom(new BMapGL.Point(116.404, 39.915), 15);

var mkrTool = new BMapGLLib.MarkerTool(map, { autoClose: true });
mkrTool.open();
```

## 构造函数参数

| 参数 | 类型 | 说明 |
|---|---|---|
| map | BMapGL.Map | 地图实例 |
| opts | Object | 可选配置项（见下表） |

### opts 配置项

| 属性 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| icon | BMapGL.Icon | null | 标注图标；开启工具时兼作鼠标光标，未设置时为 `crosshair` |
| autoClose | Boolean | true | 每次添加标注后是否自动关闭工具 |

## 方法

| 方法 | 返回值 | 说明 |
|---|---|---|
| open() | Boolean | 开启工具；失败（已有其他工具占用）时为 false |
| close() | - | 关闭工具，恢复默认光标 |
| setIcon(icon) | - | 设置标注图标，开启时同步更新跟随预览样式 |
| getIcon() | BMapGL.Icon | 获取当前图标 |

## 事件

| 事件 | 说明 | 回调参数 |
|---|---|---|
| markend | 每次点击地图添加完标注后触发 | `e.marker`、`e.point` |

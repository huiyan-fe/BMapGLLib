# Example
```javascript
     var myDrawingManagerObject = new BMapGLLib.DrawingManager(map, {
        isOpen: true,
        drawingType: BMAP_DRAWING_MARKER,
        enableDrawingTool: true,
        enableCalculate: false,
        drawingToolOptions: {
            anchor: BMAP_ANCHOR_TOP_LEFT,
            offset: new BMap.Size(5, 5),
            drawingModes : [
                BMAP_DRAWING_MARKER,
                BMAP_DRAWING_CIRCLE,
                BMAP_DRAWING_POLYLINE,
                BMAP_DRAWING_POLYGON,
                BMAP_DRAWING_RECTANGLE
            ]
        },
        polylineOptions: {
            strokeColor: "#333"
        }
    });
```

# Options
| Name | Type | Description |
|------|--------|-------------|
| isOpen | `Boolean` | 是否开启绘制模式 |
| confirmVisible | `Boolean` | 绘制完成后是否显示确认框，默认值为true，若设置为false则limit相关限制将失效。可以通过监听`overlaycomplete`事件，通过`e.calculate`判断是否超出限制 |
| autoViewport | `Boolean` | 是否自动调整地图视野，默认值为true |
| enableSorption | `Boolean` | 是否开启吸附功能，默认值为false |
| sorptiondistance | `Number` | 吸附的像素距离，默认值为20 |
| enableCalculate | `Boolean` | 是否开启面积计算功能，默认值为false，依赖BMapGLLib.GeoUtils |
| enableLimit | `Boolean` | 是否开启限制绘制区域功能，默认值为false |
| limitOptions | `Object` | 限制绘制区域的参数 |
| limitOptions.area | `Number` | 限制绘制区域的面积，单位为平方米 |
| limitOptions.distance | `Number` | 限制绘制区域的最大距离，单位为米 |
| markerOptions | `Object` | 绘制点的参数，参考JSAPI MarkerOptions |
| circleOptions | `Object` | 绘制圆的参数，参考JSAPI CircleOptions |
| polylineOptions | `Object` | 绘制折线的参数，参考JSAPI PolylineOptions |
| polygonOptions | `Object` | 绘制多边形的参数，参考JSAPI PolygonOptions |
| rectangleOptions | `Object` | 绘制矩形的参数，参考JSAPI PolygonOptions |
| labelOptions | `Object` | 提示标签参数，参考JSAPI LabelOptions |
| enableDrawingTool | `Boolean` | 是否添加绘制工具栏控件，默认不添加 |
| drawingToolOptions | `Object` | 可选的输入参数 |
| drawingToolOptions.drawingModes | `Array` | BMAP_DRAWING_MARKER,BMAP_DRAWING_CIRCLE,BMAP_DRAWING_POLYLINE,BMAP_DRAWING_POLYGON,BMAP_DRAWING_RECTANGLE |
| drawingToolOptions.anchor | `ControlAnchor` | 工具栏控件的定位，参考JSAPI ControlAnchor |
| drawingToolOptions.offset | `Size` | 工具栏控件的偏移值，参考JSAPI Size |
| drawingToolOptions.scale | `Number` | 绘制工具的缩放比例，默认值为1 |
| drawingToolOptions.enableTips | `Boolean` | 是否在绘制过程中显示提示信息，默认值为false |
| drawingToolOptions.customContainer | `HTMLElement` | 自定义绘制工具栏控件的容器，默认值为null |
| drawingToolOptions.hasCustomStyle | `Boolean` | 是否使用自定义样式绘制，默认值为false，开启后scale和offset才能生效 |

# API
| Name 	| Parameters | Description | returnValue |
|------|------------|-------------| -----|
| open | none | 开启绘制模式 | none |
| close | none | 关闭绘制模式 | none |
| setDrawingMode | drawingType | 设置绘制类型，参考drawingToolOptions.drawingModes | none |
| getDrawingMode | none | 获取当前绘制类型 | `string` |
| setMarkerOptions | markerOptions | 绘制点的参数，参考JSAPI MarkerOptions |
| setCircleOptions | circleOptions | 绘制圆的参数，参考JSAPI CircleOptions |
| setPolylineOptions | polylineOptions | 绘制折线的参数，参考JSAPI PolylineOptions |
| setPolygonOptions | polygonOptions | 绘制多边形的参数，参考JSAPI PolygonOptions |
| setRectangleOptions | rectangleOptions | 绘制矩形的参数，参考JSAPI PolygonOptions |
| setLabelOptions | labelOptions | 提示标签参数，参考JSAPI LabelOptions |
| enableCalculate | none | 开启面积计算功能 | none |
| disableCalculate | none | 关闭面积计算功能 | none |
| enableSorption | none | 开启吸附功能 | none |
| disableSorption | none | 关闭吸附功能 | none |
| getOverlays | none | 获取绘制的所有覆盖物 | `Overlay[]` |
| clearOverlays | none | 清除所有绘制的覆盖物 | none |
| clearOverlay | overlay | 清除指定的覆盖物 | none |
| addEventListener | event, handler | 添加事件监听函数 | none |
| removeEventListener | event, handler | 删除事件监听函数 | none |

# Events
| Name | Description |
|------|-------------|
| overlaycomplete | 覆盖物绘制完成事件 |
| overlaycancel | 覆盖物绘制取消事件 |
| radiuschange | 圆的半径变化事件 |
| rectwhchange | 矩形的宽高变化事件 |

# EventObject
| Name | Type | Description |
|------|--------|-------------|
| calculate | `string` | 开启`enableCalculate`后生效，值为绘制后的overlay面积或长度 |
| overlay | `Overlay` | 绘制完成的覆盖物 |
| drawingMode | `string` | 绘制类型，参考drawingToolOptions.drawingModes |

# DrawingMode
| Name | Description | value |
|------|-------------|-----|
| BMAP_DRAWING_MARKER | 绘制点 | `marker` |
| BMAP_DRAWING_CIRCLE | 绘制圆 | `circle` |
| BMAP_DRAWING_POLYLINE | 绘制折线 | `polyline` |
| BMAP_DRAWING_POLYGON | 绘制多边形 | `polygon` |
| BMAP_DRAWING_RECTANGLE | 绘制矩形 | `rectangle` |

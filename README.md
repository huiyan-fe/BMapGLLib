# BMapGLLib

本代码库是基于百度地图JSAPI GL版的JavaScript开源工具库，如果使用的是2D地图的话，参考旧的[2D开源库](https://github.com/huiyan-fe/BMap-JavaScript-library)。

## 如何使用
我们在将GL版的开源工具库放到了百度云的BOS存储上，根据github文件目录可以推理出BOS的路径，比如：

`<link href="//mapopen.bj.bcebos.com/github/BMapGLLib/DrawingManager/src/DrawingManager.min.css" rel="stylesheet">`

`<script src="//mapopen.bj.bcebos.com/github/BMapGLLib/DrawingManager/src/DrawingManager.min.js"></script>`

## 功能示例

鼠标绘制工具条库
---------
<table>
<tr>
<td width='250'>
<img src='https://raw.githubusercontent.com/huiyan-fe/BMapGLLib/master/images/DrawingManager.png' width='250' />
</td>
<td width='600'>
提供鼠标绘制点、线、面、多边形（矩形、圆）的编辑工具条的开源代码库。且用户可使用JavaScript API对应覆盖物（点、线、面等）类接口对其进行属性（如颜色、线宽等）设置、编辑（如开启线顶点编辑等）等功能。<br/><br/>
<a target='_blank' href='http://mapopen.bj.bcebos.com/github/BMapGLLib/DrawingManager/examples/index.html'>示例</a>　　
<a target='_blank' href='http://mapopen.bj.bcebos.com/github/BMapGLLib/DrawingManager/src/DrawingManager.js'>源码</a>　　
<a target='_blank' href='http://mapopen.bj.bcebos.com/github/BMapGLLib/DrawingManager/src/DrawingManager.min.js'>压缩源码</a>
</td>
</table>

测距工具
---------
<table>
<tr>
<td width='250'>
<img src='https://raw.githubusercontent.com/huiyan-fe/BMapGLLib/master/images/DistanceTool.png' width='250' />
</td>
<td width='600'>
百度地图的测距工具类，对外开放。 允许用户在地图上点击完成距离的测量。 使用者可以自定义测距线段的相关样式，例如线宽、颜色、测距结果所用的单位制等等。 <br/><br/>
<a target='_blank' href='http://mapopen.bj.bcebos.com/github/BMapGLLib/DistanceTool/examples/index.html'>示例</a>　　
<a target='_blank' href='http://mapopen.bj.bcebos.com/github/BMapGLLib/DistanceTool/src/DistanceTool.js'>源码</a>　　
<a target='_blank' href='http://mapopen.bj.bcebos.com/github/BMapGLLib/DistanceTool/src/DistanceTool.min.js'>压缩源码</a>
</td>
</table>

几何运算
---------
<table>
<tr>
<td width='250'>
<img src='https://raw.githubusercontent.com/huiyan-fe/BMapGLLib/master/images/GeoUtils.png' width='250' />
</td>
<td width='600'>
GeoUtils类提供若干几何算法，用来帮助用户判断点与矩形、 圆形、多边形线、多边形面的关系,并提供计算折线长度和多边形的面积的公式。 <br/><br/>
<a target='_blank' href='http://mapopen.bj.bcebos.com/github/BMapGLLib/GeoUtils/examples/index.html'>示例</a>　　
<a target='_blank' href='http://mapopen.bj.bcebos.com/github/BMapGLLib/GeoUtils/src/GeoUtils.js'>源码</a>　　
<a target='_blank' href='http://mapopen.bj.bcebos.com/github/BMapGLLib/GeoUtils/src/GeoUtils.min.js'>压缩源码</a>
</td>
</table>

视角轨迹动画
---------
<table>
<tr>
<td width='250'>
<img src='https://raw.githubusercontent.com/huiyan-fe/BMapGLLib/master/images/TrackAnimation.png' width='250' />
</td>
<td width='600'>
TrackAnimation类提供视角轨迹动画展示效果。 <br/><br/>
<a target='_blank' href='https://mapopen.bj.bcebos.com/github/BMapGLLib/TrackAnimation/examples/index.html'>示例</a>　　
<a target='_blank' href='https://mapopen.bj.bcebos.com/github/BMapGLLib/TrackAnimation/src/TrackAnimation.js'>源码</a>　　
<a target='_blank' href='https://mapopen.bj.bcebos.com/github/BMapGLLib/TrackAnimation/src/TrackAnimation.min.js'>压缩源码</a>
</td>
</table>

区域限制
---------
<table>
<tr>
<td width='250'>
<img src='https://raw.githubusercontent.com/huiyan-fe/BMapGLLib/master/images/AreaRestriction.png' width='250' />
</td>
<td width='600'>
百度地图浏览区域限制类，对外开放。 允许开发者输入限定浏览的地图区域的Bounds值， 则地图浏览者只能在限定区域内浏览地图。 <br/><br/>
<a target='_blank' href='https://mapopen.bj.bcebos.com/github/BMapGLLib/AreaRestriction/examples/index.html'>示例</a>　　
<a target='_blank' href='https://mapopen.bj.bcebos.com/github/BMapGLLib/AreaRestriction/src/AreaRestriction.js'>源码</a>　　
<a target='_blank' href='https://mapopen.bj.bcebos.com/github/BMapGLLib/AreaRestriction/src/AreaRestriction.min.js'>压缩源码</a>
</td>
</table>

自定义信息窗口
---------
<table>
<tr>
<td width='250'>
<img src='https://raw.githubusercontent.com/huiyan-fe/BMapGLLib/master/images/InfoBox.png' width='250' />
</td>
<td width='600'>
百度地图的infoBox。类似于infoWindow，比infoWindow更有灵活性，比如可以定制border，关闭按钮样式等。<br/><br/>
<a target='_blank' href='https://mapopen.bj.bcebos.com/github/BMapGLLib/InfoBox/examples/top.html'>示例1(顶部展示)</a>　　
<a target='_blank' href='https://mapopen.bj.bcebos.com/github/BMapGLLib/InfoBox/examples/bottom.html'>示例2(底部展示)</a>　　
<a target='_blank' href='https://mapopen.bj.bcebos.com/github/BMapGLLib/InfoBox/src/InfoBox.js'>源码</a>　　
<a target='_blank' href='https://mapopen.bj.bcebos.com/github/BMapGLLib/InfoBox/src/InfoBox.min.js'>压缩源码</a>
</td>
</table>

富标注
---------
<table>
<tr>
<td width='250'>
<img src='https://raw.githubusercontent.com/huiyan-fe/BMap-JavaScript-library/master/images/RichMarker.png' width='250' />
</td>
<td width='600'>
百度地图的富Marker类，对外开放。 允许用户在自定义丰富的Marker展现样式，并添加点击、双击、拖拽等事件。<br/><br/>
<a target='_blank' href='https://bj.bcebos.com/v1/mapopen/github/BMapGLLib/RichMarker/examples/RichMarker.html'>示例1</a>　　
<a target='_blank' href='https://bj.bcebos.com/v1/mapopen/github/BMapGLLib/RichMarker/examples/RichMarker_Advanced.html'>示例2</a>　　
<a target='_blank' href='https://bj.bcebos.com/v1/mapopen/github/BMapGLLib/RichMarker/src/RichMarker.js'>源码</a>　　
<a target='_blank' href='https://bj.bcebos.com/v1/mapopen/github/BMapGLLib/RichMarker/src/RichMarker.min.js'>压缩源码</a>
</td>
</table>

路书
---------
<table>
<tr>
<td width='250'>
<img src='https://raw.githubusercontent.com/huiyan-fe/BMap-JavaScript-library/master/images/LuShu.png' width='250' />
</td>
<td width='600'>
百度地图路书类，实现Marker沿路线运动，对外开放。 用户可以在地图上自定义轨迹运动，支持暂停/停止功能，并可以自定义路过某个点的图片，文字介绍等。 <br/><br/>
<a target='_blank' href='https://bj.bcebos.com/v1/mapopen/github/BMapGLLib/Lushu/examples/index.html'>示例</a>　　
<a target='_blank' href='https://bj.bcebos.com/v1/mapopen/github/BMapGLLib/Lushu/src/Lushu.js'>源码</a>　　
<a target='_blank' href='https://bj.bcebos.com/v1/mapopen/github/BMapGLLib/Lushu/src/Lushu.min.js'>压缩源码</a>
</td>
</table>

## 如何开发贡献代码
1. clone本代码库
2. 修改src目录下源文件
3. [压缩](https://tool.oschina.net/jscompress/)生成.min文件
4. 上传代码，告知维护同学codereview


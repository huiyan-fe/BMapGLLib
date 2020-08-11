# BMapGLLib

本代码库是基于百度地图JSAPI GL版的JavaScript开源工具库，如果使用的是2D地图的话，参考旧的[2D开源库](https://github.com/huiyan-fe/BMap-JavaScript-library)。

## 如何使用
我们在将GL版的开源工具库放到了百度云的BOS存储上，根据github文件目录可以推理出BOS的路径，比如：

`<link href="//mapopen.cdn.bcebos.com/github/BMapGLLib/DrawingManager/src/DrawingManager.min.css" rel="stylesheet">`

`<script src="//mapopen.cdn.bcebos.com/github/BMapGLLib/DrawingManager/src/DrawingManager.min.js"></script>`

## 功能示例

鼠标绘制工具条库
---------
<table>
<tr>
<td width='250'>
<img src='https://raw.githubusercontent.com/huiyan-fe/BMap-JavaScript-library/master/images/DrawingManager.png' width='250' />
</td>
<td width='600'>
提供鼠标绘制点、线、面、多边形（矩形、圆）的编辑工具条的开源代码库。且用户可使用JavaScript API对应覆盖物（点、线、面等）类接口对其进行属性（如颜色、线宽等）设置、编辑（如开启线顶点编辑等）等功能。<br/><br/>
<a target='_blank' href='http://mapopen.bj.bcebos.com/github/BMapGLLib/DrawingManager/examples/index.html'>示例</a>　　
<a target='_blank' href='http://mapopen.cdn.bcebos.com/github/BMapGLLib/DrawingManager/src/DrawingManager.js'>源码</a>　　
<a target='_blank' href='http://mapopen.cdn.bcebos.com/github/BMapGLLib/DrawingManager/src/DrawingManager.min.js'>压缩源码</a>
</td>
</table>

测距工具
---------
<table>
<tr>
<td width='250'>
<img src='https://raw.githubusercontent.com/huiyan-fe/BMap-JavaScript-library/master/images/DistanceTool.png' width='250' />
</td>
<td width='600'>
百度地图的测距工具类，对外开放。 允许用户在地图上点击完成距离的测量。 使用者可以自定义测距线段的相关样式，例如线宽、颜色、测距结果所用的单位制等等。 <br/><br/>
<a target='_blank' href='http://mapopen.bj.bcebos.com/github/BMapGLLib/DistanceTool/examples/index.html'>示例</a>　　
<a target='_blank' href='http://mapopen.cdn.bcebos.com/github/BMapGLLib/DistanceTool/src/DistanceTool.js'>源码</a>　　
<a target='_blank' href='http://mapopen.cdn.bcebos.com/github/BMapGLLib/DistanceTool/src/DistanceTool.min.js'>压缩源码</a>
</td>
</table>

几何运算
---------
<table>
<tr>
<td width='250'>
<img src='https://raw.githubusercontent.com/huiyan-fe/BMap-JavaScript-library/master/images/GeoUtils.png' width='250' />
</td>
<td width='600'>
GeoUtils类提供若干几何算法，用来帮助用户判断点与矩形、 圆形、多边形线、多边形面的关系,并提供计算折线长度和多边形的面积的公式。 <br/><br/>
<a target='_blank' href='http://mapopen.bj.bcebos.com/github/BMapGLLib/GeoUtils/examples/index.html'>示例</a>　　
<a target='_blank' href='http://mapopen.cdn.bcebos.com/github/BMapGLLib/GeoUtils/src/GeoUtils.js'>源码</a>　　
<a target='_blank' href='http://mapopen.cdn.bcebos.com/github/BMapGLLib/GeoUtils/src/GeoUtils.min.js'>压缩源码</a>
</td>
</table>

视角轨迹动画
---------
<table>
<tr>
<td width='250'>
<img src='https://bj.bcebos.com/v1/mapopen/github/BMap-JavaScript-library/images/trackAnimation.png' width='250' />
</td>
<td width='600'>
TrackAnimation类提供视角轨迹动画展示效果。 <br/><br/>
<a target='_blank' href='https://bj.bcebos.com/v1/mapopen/github/BMapGLLib/TrackAnimation/example/index.html'>示例</a>　　
<a target='_blank' href='https://bj.bcebos.com/v1/mapopen/github/BMapGLLib/TrackAnimation/src/TrackAnimation.js'>源码</a>　　
<a target='_blank' href='https://bj.bcebos.com/v1/mapopen/github/BMapGLLib/TrackAnimation/src/TrackAnimation.min.js'>压缩源码</a>
</td>
</table>

## 如何开发贡献代码
1. clone本代码库
2. 修改src目录下源文件
3. 压缩生成.min文件
4. 上传代码，告知维护同学codereview


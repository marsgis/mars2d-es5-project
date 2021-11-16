<p align="center">
<img src="http://mars2d.cn/logo.png" width="300px" />
</p>

<p align="center">基于 原生JS下widget模块 的 Mars2D🌎基础项目模板（Vue2融合版）</p>
<p align="center">
<a target="_black" href="https://github.com/marsgis/mars2d">
<img alt="GitHub stars" src="https://img.shields.io/github/stars/marsgis/mars2d?style=flat&logo=github">
</a>
<a target="_black" href="https://www.npmjs.com/package/mars2d">
<img alt="Npm downloads" src="https://img.shields.io/npm/dt/mars2d?style=flat&logo=npm">
</a>
<a target="_black" href="https://www.npmjs.com/package/mars2d">
<img alt="Npm version" src="https://img.shields.io/npm/v/mars2d.svg?style=flat&logo=npm&label=version"/>
</a>
</p>

  Mars2D平台在`Vue2.x + VueCli4.x 技术栈下`的外部资源融合方式使用widget模块的项目模版。
     
 
  

  
## 项目说明
1. 部分第三方库不是npm方式引入，是主页head中静态资源方式引入的。资源放在public目录下。 

2. public目录下文件与 Mars2D基础项目 的目录和文件完全相同，可以直接复制到该目录下进行更新。

3. public下面的widgets目录为之前传统js方式编写的一些widget模块，目前未重写为vue，当前为了兼容使用是静态引入的方式。  
  新开发业务功能请在src目录下按vue方式去编写，不要使用原有的widget方式。
 
 
### 下载最新lib
从[http://mars2d.cn/download](http://mars2d.cn/download)下载最新mars2d类库后覆盖至`public/lib/`目录下即可。


### 更新项目
 此脚手架中类库和widgets不保证是最新版本
 请您自行拷贝"基础项目"的 config、img、lib和widgets目录覆盖至当前项目的public目录下
 


## 运行命令
 
### 首次运行前安装依赖
 `npm install` 或 `cnpm install`
 
### http运行项目
 `npm run serve`  运行后访问：`http://localhost:2002/` 

### 打包编译项目
 运行`npm run build`来构建项目。 





### 运行效果 
 [在线Demo](http://mars2d.cn/project/jcxm/)  

 ![image](http://mars2d.cn/img/jcxm.jpg)
 



## Mars2D 是什么 
  `Mars2D平台` 是[火星科技](http://marsgis.cn/)研发的一款免费的二维地图客户端开发平台，基于[Leaflet](http://leafletjs.com/)优化提升与B/S架构设计，支持多行业扩展的轻量级高效能GIS开发平台，提供了全新的大数据可视化、实时流数据可视化功能，通过本平台可快速实现浏览器和移动端上美观、流畅的地图呈现与空间分析，完成平台在不同行业的灵活应用。


### 相关网站 
- Mars2D官网：[http://mars2d.cn](http://mars2d.cn)  

- Mars2D开源项目列表：[https://github.com/marsgis/mars2d](https://github.com/marsgis/mars2d)


## 版权说明
1. Mars2D平台由[火星科技](http://marsgis.cn/)自主研发，拥有所有权利。
2. 任何个人或组织可以在遵守相关要求下可以免费无限制使用。
n)购买。
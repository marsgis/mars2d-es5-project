;(function (window, mars2d) {
  //创建widget类，需要继承BaseWidget
  class MyWidget extends es5widget.BaseWidget {
    //弹窗配置
    get view() {
      let index = this.getBasemaps().length

      let width, height
      if (index <= 4) {
        width = 190
        height = Math.ceil(index / 2) * 100 + 70
      } else if (index > 4 && index <= 6) {
        width = 270
        height = Math.ceil(index / 3) * 100 + 70
      } else {
        width = 360
        height = Math.ceil(index / 4) * 105 + 70
      }

      return {
        type: "window",
        url: "view.html",
        windowOptions: {
          width: width,
          height: height
        }
      }
    }
    //初始化[仅执行1次]
    create() {}
    //每个窗口创建完成后调用
    winCreateOK(opt, result) {
      this.viewWindow = result
    }
    //打开激活
    activate() {}
    //关闭释放
    disable() {
      this.viewWindow = null
    }
    getBasemaps() {
      return this.map.getBasemaps(true)
    }

    getLayerVisible(layer) {
      return this.map.hasLayer(layer)
    }

    //树节点变化后调用
    updateBasemap(layerId) {
      // this._workCRS(layerId) //需要时再启用

      this.map.basemap = layerId
      this.disableBase()
    }

    //处理CRS坐标系不同的底图之间切换
    _workCRS(layerId) {
      let layer = this.map.getLayer(layerId, "id")
      let mapCrs = this.map.crs
      let layerCrs = layer.options.crs || "EPSG:3857"
      if (!layer || mapCrs == layerCrs) {
        return
      }

      let center = this.map.getCenter() //传出是wgs84无偏的
      let zoom = this.map.getZoom()

      //坐标转换
      if (mapCrs == "baidu") {
        let newpt = mars2d.PointTrans.bd2wgs([center.lng, center.lat])
        center = { lng: newpt[0], lat: newpt[1] }
      } else if (layerCrs == "baidu") {
        let newpt = mars2d.PointTrans.wgs2bd([center.lng, center.lat])
        center = { lng: newpt[0], lat: newpt[1] }
      }

      //=================刷新页面方式切换不同坐标系的底图======================
      let lasturl = window.location.href
      if (lasturl.lastIndexOf("#") != -1) {
        lasturl = lasturl.replace(window.location.hash, "").replace("#", "")
      }
      let idx = lasturl.lastIndexOf("?")
      if (idx != -1) {
        lasturl = lasturl.substring(0, idx)
      }

      let url = lasturl + "?x=" + center.lng + "&y=" + center.lat + "&z=" + zoom + "&baselayer=" + layer.name
      let req = haoutil.system.getRequest()
      for (let key in req) {
        if (key == "x" || key == "y" || key == "z" || key == "baselayer") {
          continue
        }
        url += "&" + key + "=" + req[key]
      }
      this.map.remove()
      window.location.href = url

      //=================不刷新页面方式切换不同坐标系的底图【仅3857与4326间部分图层时】======================
      // if (layer.options.crs == "EPSG4326") {
      //   this.map.crs = L.CRS.EPSG4326 //更改底图坐标系
      //   this.map.setView(center, zoom - 1) //影像底图和海图由于切图标准不同，级别相差一级
      // } else {
      //   this.map.crs = L.CRS.EPSG3857
      //   this.map.setView(center, zoom + 1)
      // }
      // this.map.options.crs = layer.options.crs
      // this.map.fire("zoomend", layer) //重新渲染,如果不重新渲染，由于坐标系发生变化，矢量数据错位
    }
  }

  //注册到widget管理器中。
  es5widget.bindClass(MyWidget)

  //每个widet之间都是直接引入到index.html中，会存在彼此命名冲突，所以闭包处理下。
})(window, mars2d)

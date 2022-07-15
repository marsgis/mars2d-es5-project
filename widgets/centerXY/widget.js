;(function (window, mars2d) {
  //创建widget类，需要继承BaseWidget
  class MyWidget extends mars2d.widget.BaseWidget {
    //弹窗配置
    get view() {
      return {
        type: "window",
        url: "view.html",
        windowOptions: {
          width: 210,
          height: 170
        }
      }
    }
    //每个窗口创建完成后调用
    winCreateOK(opt, result) {
      this.viewWindow = result
    }
    //激活插件
    activate() {
      this.map.on("click", this.mouseClickHandler, this)
    }
    //释放插件
    disable() {
      this.map.off("click", this.mouseClickHandler, this)

      if (this.markerXY) {
        this.markerXY.remove()
        this.markerXY = null
      }
      this.viewWindow = null
    }
    mouseClickHandler(e) {
      let latlng = e.latlng
      latlng.format()

      this.viewWindow.showLatlng(latlng)
      this.flyToPoint(e.latlng, false)
    }
    getMapCenter() {
      return this.map.getCenter()
    }

    flyToPoint(latlng, flyTo) {
      if (this.markerXY == null) {
        this.markerXY = L.marker(latlng)
        this.map.addLayer(this.markerXY)
      } else {
        this.markerXY.setLatLng(latlng)
      }

      if (flyTo) {
        this.map.flyToPoint(latlng)
      }
    }
  }

  //注册到widget管理器中。
  mars2d.widget.bindClass(MyWidget)

  //每个widet之间都是直接引入到index.html中，会存在彼此命名冲突，所以闭包处理下。
})(window, mars2d)

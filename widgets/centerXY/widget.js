;(function (window, mars2d) {
  //创建widget类，需要继承BaseWidget
  class MyWidget extends es5widget.BaseWidget {
    pointEntity
    //弹窗配置
    get view() {
      return {
        type: "window",
        url: "view.html",
        windowOptions: {
          width: 345,
          height: 200
        }
      }
    }
    //每个窗口创建完成后调用
    winCreateOK(opt, result) {
      this.viewWindow = result
    }
    //激活插件
    activate() {}
    //释放插件
    disable() {
      //移除可能残留的图上拾取监听，避免关闭面板后点击地图仍触发回调
      if (this._mapClickHandler) {
        this.map.off(mars2d.EventType.click, this._mapClickHandler)
        this._mapClickHandler = null
      }
      if (this.pointEntity) {
        this.map.graphicLayer.removeGraphic(this.pointEntity)
      }
      this.pointEntity = null
      this.viewWindow = null
    }

    getFormatNum(num, digits) {
      return mars2d.Util.formatNum(num, digits)
    }

    getDms2degree(jd_du, jd_fen, jd_miao) {
      return mars2d.PointTrans.dms2degree(jd_du, jd_fen, jd_miao)
    }

    getProj4Trans(arrdata, fromProjParams, toProjParams) {
      return mars2d.PointTrans.proj4Trans(arrdata, fromProjParams, toProjParams)
    }

    getDegree2dms(currJD) {
      return mars2d.PointTrans.degree2dms(currJD)
    }

    bindMourseClick(callback) {
      //重复点击"图上拾取"时，先移除上一次未触发的监听，避免once回调累积
      if (this._mapClickHandler) {
        this.map.off(mars2d.EventType.click, this._mapClickHandler)
      }
      this._mapClickHandler = (event) => {
        let coordinate = event.latlng //经纬度坐标

        callback(coordinate.lng, coordinate.lat)

        //更新面板
        let selectType = $('input:radio[name="rdoType"]:checked').val()
        switch (selectType) {
          default:
            //十进制
            this.viewWindow.updateTen()
            break
          case "2": //度分秒
            this.viewWindow.updataDfm()
            break
          case "3": //CGCS2000
            {
              let selectType2 = $('input:radio[name="rdoGkType"]:checked').val()
              if (selectType2 == "2") {
                this.viewWindow.updata6GKZone()
              } else {
                this.viewWindow.updata3GKZone()
              }
            }
            break
        }
        //end
        this.viewWindow.updateMarker()
      }
      //注册一次性地图单击监听
      this.map.once(mars2d.EventType.click, this._mapClickHandler)
    }

    flyToGraphic(pointEntity) {
      this.map.flyToGraphic(pointEntity)
    }

    updateMarker(currWD, currJD) {
      let latlng = [currWD, currJD]
      if (this.pointEntity == null) {
        this.pointEntity = new mars2d.graphic.Marker({
          latlng: latlng,
          style: {
            image: "img/marker/mark1.png",
            width: 32,
            height: 44
          }
        })
        this.map.graphicLayer.addGraphic(this.pointEntity)
      } else {
        this.pointEntity.latlng = latlng
      }
    }
  }

  //注册到widget管理器中。
  es5widget.bindClass(MyWidget)

  //每个widet之间都是直接引入到index.html中，会存在彼此命名冲突，所以闭包处理下。
})(window, mars2d)

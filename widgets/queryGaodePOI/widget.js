"use script" //开发环境建议开启严格模式
;(function (window, mars2d) {
  //创建widget类，需要继承BaseWidget
  class MyWidget extends es5widget.BaseWidget {
    //外部资源配置
    get resources() {
      return ["view.css"]
    }

    //弹窗配置
    get view() {
      return {
        type: "append",
        url: "view.html",
        parent: "body"
      }
    }

    //初始化[仅执行1次]
    create() {
      this.storageName = "mars2d_queryGaodePOI"
      this.pageSize = 6
      this.allpage = 0
      this.thispage = 0

      //创建矢量数据图层
      this.graphicLayer = new mars2d.layer.GraphicLayer({
        name: this.config.name,
        pid: 99 //图层管理 中使用，父节点id
      })
      //鼠标单击后的信息面板弹窗
      this.graphicLayer.bindPopup(function (event) {
        let item = event.attr
        if (!item) {
          return false
        }

        let inHtml = `<div class="mars2d-template-titile"><a href="https://www.amap.com/detail/${item.id}"  target="_black" style="color: #ffffff; ">${item.name}</a></div><div class="mars2d-template-content" >`

        let phone = $.trim(item.tel)
        if (phone != "") {
          inHtml += "<div><label>电话</label>" + phone + "</div>"
        }

        let dz = $.trim(item.address)
        if (dz != "") {
          inHtml += "<div><label>地址</label>" + dz + "</div>"
        }

        if (item.type) {
          let fl = $.trim(item.type)
          if (fl != "") {
            inHtml += "<div><label>类别</label>" + fl + "</div>"
          }
        }
        inHtml += "</div>"

        return inHtml
      })

      //查询控制器
      this._queryPoi = new mars2d.query.QueryPOI({
        // service: mars2d.QueryServiceType.GAODE
      })
    }
    //每个窗口创建完成后调用
    winCreateOK(opt, result) {
      if (opt.type != "append") {
        return
      }
      let that = this
      let img = $("#mars2dContainer-querybar img")
      img.each((index, item) => {
        $(item).attr("src", this.path + $(item).attr("src"))
      })

      if (this.config.position) {
        $("#mars2dContainer-querybar").css(this.config.position)
      }
      if (this.config.style) {
        $("#mars2dContainer-querybar").css(this.config.style)
      }

      // 搜索框
      $("#txt_querypoi").click(function () {
        // 文本框内容为空
        if ($.trim($(this).val()).length === 0) {
          that.hideAllQueryBarView()
          that.showHistoryList() // 显示历史记录
        }
      })

      let timetik = 0

      // 搜索框绑定文本框值发生变化,隐藏默认搜索信息栏,显示匹配结果列表
      $("#txt_querypoi").bind("input propertychange", () => {
        clearTimeout(timetik)
        timetik = setTimeout(() => {
          this.hideAllQueryBarView()
          this.clearLayers()

          let queryVal = $.trim($("#txt_querypoi").val())
          if (queryVal.length == 0) {
            // 文本框内容为空,显示历史记录
            this.showHistoryList()
          } else {
            this.autoTipList(queryVal, true)
          }
        }, 500)
      })

      // 点击搜索查询按钮
      $("#btn_querypoi").click(() => {
        clearTimeout(timetik)
        this.hideAllQueryBarView()

        let queryVal = $.trim($("#txt_querypoi").val())
        this.strartQueryPOI(queryVal, true)
      })
      //绑定回车键
      $("#txt_querypoi").bind("keydown", (event) => {
        if (event.keyCode == "13") {
          $("#btn_querypoi").click()
        }
      })

      // 返回查询结果面板界面
      $("#querybar_detail_back").click(() => {
        this.hideAllQueryBarView()
        $("#querybar_resultlist_view").show()
      })
    }
    //打开激活
    activate() {
      this.map.addLayer(this.graphicLayer)

      if (this.map.controls?.locationBar?._container) {
        let addressContainer = L.DomUtil.create("div", "mars2d-locationbar-content", this.map.controls.locationBar._container)
        addressContainer.style["margin-left"] = "50px"
        this.addressContainer = addressContainer
      }

      //单击地图事件
      this.map.on(mars2d.EventType.click, this.onMapClick, this)
      this.map.on(mars2d.EventType.zoomend, this.onMapzoomend, this)
      this.map.on(mars2d.EventType.moveend, this.onMapzoomend, this)
      this.onMapzoomend()
    }
    //关闭释放
    disable() {
      this.map.removeLayer(this.graphicLayer)

      //释放单击地图事件
      this.map.off(mars2d.EventType.click, this.onMapClick, this)
      this.map.off(mars2d.EventType.zoomend, this.onMapzoomend, this)
      this.map.off(mars2d.EventType.moveend, this.onMapzoomend, this)

      if (this.addressContainer) {
        L.DomUtil.remove(this.addressContainer)
      }

      this.hideAllQueryBarView()
      this.clearLayers()
    }
    onMapClick(event) {
      // 点击地图区域,隐藏所有弹出框
      if ($.trim($("#txt_querypoi").val()).length == 0) {
        this.hideAllQueryBarView()
        $("#txt_querypoi").blur()
      }
    }
    onMapzoomend(event) {
      let level = this.map.getZoom() //单位：米
      if (level < 9) {
        this.address = null
        if (this.addressContainer) {
          this.addressContainer.innerText = ""
        }
        return
      }

      this._queryPoi.getAddress({
        location: this.map.getCenter(),
        success: (result) => {
          // console.log("地址", result);
          this.address = result

          if (this.addressContainer) {
            this.addressContainer.innerText = "地址：" + result.address
          }
        }
      })
    }
    hideAllQueryBarView() {
      $("#querybar_histroy_view").hide()
      $("#querybar_autotip_view").hide()
      $("#querybar_resultlist_view").hide()
    }

    // 点击面板条目,自动填充搜索框,并展示搜索结果面板
    autoSearch(name) {
      $("#txt_querypoi").val(name)
      $("#btn_querypoi").trigger("click")
    }

    //===================与后台交互========================

    //显示智能提示搜索结果
    autoTipList(text, queryEx) {
      //输入经纬度数字时
      if (this.isLonLat(text)) {
        return
      }

      //查询外部widget
      if (this.hasExWidget() && queryEx) {
        this.autoExTipList(text)
        return
      }
      //查询外部widget

      //搜索提示
      this._queryPoi.autoTip({
        text: text,
        city: this.address?.city,
        location: this.map.getCenter(),
        success: (result) => {
          let inhtml = ""
          let pois = result.list
          for (let index = 0; index < pois.length; index++) {
            let name = pois[index].name
            // var num = pois[index].num;
            // if (num > 0) continue;

            inhtml += "<li><i class='fa fa-search'></i><a href=\"javascript:queryGaodePOIWidget.autoSearch('" + name + "');\">" + name + "</a></li>"
          }
          if (inhtml.length > 0) {
            $("#querybar_ul_autotip").html(inhtml)
            $("#querybar_autotip_view").show()
          }
        }
      })
    }

    // 根据输入框内容，查询显示列表
    strartQueryPOI(text, queryEx) {
      if (text.length == 0) {
        toastr.warning("请输入搜索关键字！")
        return
      }

      // TODO:根据文本框输入内容,从数据库模糊查询到所有匹配结果（分页显示）
      this.addHistory(text)

      this.hideAllQueryBarView()

      //输入经纬度数字时
      if (this.isLonLat(text)) {
        this.centerAtLonLat(text)
        return
      }

      //查询外部widget
      if (this.hasExWidget() && queryEx) {
        let qylist = this.queryExPOI(text)
        return
      }
      //查询外部widget

      this.thispage = 1
      this.queryText = text

      this.query_city = this.address?.city
      // this.query_location = this.map.getCenter()
      // this.query_radius = this.map.camera.positionCartographic.height //单位：米

      this.queryTextByServer()
    }
    queryTextByServer() {
      //查询获取数据
      this._queryPoi.queryText({
        text: this.queryText,
        count: this.pageSize,
        page: this.thispage - 1,
        city: this.query_city,
        // location: this.query_location,
        // radius: this.query_radius,
        success: (result) => {
          if (!this.isActivate) {
            return
          }
          this.showPOIPage(result.list, result.allcount)
        }
      })
    }

    //===================显示查询结果处理========================
    showPOIPage(data, counts) {
      // count -- 显示搜索结果的数量；data -- 结果的属性，如地址电话等

      if (counts < data.length) {
        counts = data.length
      }
      this.allpage = Math.ceil(counts / this.pageSize)

      let inhtml = ""
      if (counts == 0) {
        inhtml += '<div class="querybar-page"><div class="querybar-fl">没有找到"<strong>' + this.queryText + '</strong>"相关结果</div></div>'
      } else {
        this.objResultData = this.objResultData || {}
        for (let index = 0; index < data.length; index++) {
          let item = data[index]
          let startIdx = (this.thispage - 1) * this.pageSize
          item.index = startIdx + (index + 1)

          let _id = index

          inhtml += `<div class="querybar-site" onclick="queryGaodePOIWidget.showDetail('${_id}')">
            <div class="querybar-sitejj">
              <h3>${item.index}、${item.name}
              <a id="btnShowDetail" href="https://www.amap.com/detail/${item.id}" target="_blank" class="querybar-more">更多&gt;</a> </h3>
              <p> ${item.address || ""}</p>
            </div>
          </div> `

          this.objResultData[_id] = item
        }

        //分页信息
        let _fyhtml
        if (this.allpage > 1) {
          _fyhtml =
            '<div class="querybar-ye querybar-fr">' +
            this.thispage +
            "/" +
            this.allpage +
            '页  <a href="javascript:queryGaodePOIWidget.showFirstPage()">首页</a> <a href="javascript:queryGaodePOIWidget.showPretPage()">&lt;</a>  <a href="javascript:queryGaodePOIWidget.showNextPage()">&gt;</a> </div>'
        } else {
          _fyhtml = ""
        }

        //底部信息
        inhtml += '<div class="querybar-page"><div class="querybar-fl">找到<strong>' + counts + "</strong>条结果</div>" + _fyhtml + "</div>"
      }
      $("#querybar_resultlist_view").html(inhtml)
      $("#querybar_resultlist_view").show()

      this.showPOIArr(data)
      if (counts == 1) {
        this.showDetail("0")
      }
    }
    showFirstPage() {
      this.thispage = 1
      this.queryTextByServer()
    }
    showNextPage() {
      this.thispage = this.thispage + 1
      if (this.thispage > this.allpage) {
        this.thispage = this.allpage
        toastr.warning("当前已是最后一页了")
        return
      }
      this.queryTextByServer()
    }

    showPretPage() {
      this.thispage = this.thispage - 1
      if (this.thispage < 1) {
        this.thispage = 1
        toastr.warning("当前已是第一页了")
        return
      }
      this.queryTextByServer()
    }
    //点击单个结果,显示详细
    showDetail(id) {
      let item = this.objResultData[id]
      this.flyTo(item)
    }
    clearLayers() {
      this.graphicLayer.closePopup()
      this.graphicLayer.clear()
    }
    showPOIArr(arr) {
      this.clearLayers()

      arr.forEach((item) => {
        let jd = Number(item.lng)
        let wd = Number(item.lat)
        if (isNaN(jd) || isNaN(wd)) {
          return
        }

        item.lng = jd
        item.lat = wd

        //按需加偏或纠偏
        if (this.options.pointTransFun) {
          let newPt = this.options.pointTransFun([jd, wd])
          jd = newPt[0]
          wd = newPt[1]
        }

        //添加实体
        let graphic = new mars2d.graphic.Marker({
          latlng: [wd, jd],
          style: {
            image: "img/marker/mark1.png",
            width: 32,
            height: 44
            // label: {
            //   text: item.name,
            //   font_size: 20,
            //   color: "rgb(240,255,255)",
            //   outline: true,
            //   outlineWidth: 2,
            //   pixelOffsetY: -10, //偏移量
            // },
          },
          attr: item
        })
        this.graphicLayer.addGraphic(graphic)

        item._graphic = graphic
      })

      if (arr.length > 1) {
        this.graphicLayer.flyTo({ duration: 2 })
      }
    }
    flyTo(item) {
      let graphic = item._graphic
      if (graphic == null) {
        window.toastr.warning(item.name + " 无经纬度坐标信息！")
        return
      }
      this.graphicLayer.openPopup(graphic)

      this.map.flyToGraphic(graphic)
    }

    //===================坐标定位处理========================
    isLonLat(text) {
      let reg = /^-?((0|1?[0-7]?[0-9]?)(([.][0-9]*)?)|180(([.][0]*)?)),-?((0|[1-8]?[0-9]?)(([.][0-9]*)?)|90(([.][0]*)?))$/ /*定义验证表达式*/
      return reg.test(text) /*进行验证*/
    }
    centerAtLonLat(text) {
      let arr = text.split(",")
      if (arr.length != 2) {
        return
      }

      let jd = Number(arr[0])
      let wd = Number(arr[1])
      if (isNaN(jd) || isNaN(wd)) {
        return
      }

      //按需加偏或纠偏
      if (this.options.pointTransFun) {
        let newPt = this.options.pointTransFun([jd, wd])
        jd = newPt[0]
        wd = newPt[1]
      }

      //添加实体
      let graphic = new mars2d.graphic.Marker({
        latlng: [wd, jd],
        style: {
          image: "img/marker/mark1.png",
          width: 32,
          height: 44
        }
      })
      this.graphicLayer.addGraphic(graphic)

      graphic.bindPopup(`<div class="mars2d-template-titile">坐标定位</div>
              <div class="mars2d-template-content" >
                <div><label>经度</label> ${jd}</div>
                <div><label>纬度</label>${wd}</div>
              </div>`)

      graphic.openHighlight()

      graphic.flyTo({
        radius: 1000, //点数据：radius控制视距距离
        scale: 1.5, //线面数据：scale控制边界的放大比例
        complete: () => {
          graphic.openPopup()
        }
      })
    }

    //===================历史记录相关========================
    showHistoryList() {
      $("#querybar_histroy_view").hide()

      localforage.getItem(this.storageName).then((laststorage) => {
        if (laststorage == null) {
          return
        }

        this.arrHistory = eval(laststorage)
        if (this.arrHistory == null || this.arrHistory.length == 0) {
          return
        }

        let inhtml = ""
        for (let index = this.arrHistory.length - 1; index >= 0; index--) {
          let item = this.arrHistory[index]
          inhtml += "<li><i class='fa fa-history'/><a href=\"javascript:queryGaodePOIWidget.autoSearch('" + item + "');\">" + item + "</a></li>"
        }
        $("#querybar_ul_history").html(inhtml)
        $("#querybar_histroy_view").show()
      })
    }

    clearHistory() {
      this.arrHistory = []
      localforage.removeItem(this.storageName)

      $("#querybar_ul_history").html("")
      $("#querybar_histroy_view").hide()
    }

    //记录历史值
    addHistory(data) {
      this.arrHistory = []
      localforage.getItem(this.storageName).then((laststorage) => {
        if (laststorage != null) {
          this.arrHistory = eval(laststorage)
        }
        //先删除之前相同记录
        haoutil.array.remove(this.arrHistory, data)

        this.arrHistory.push(data)

        if (this.arrHistory.length > 10) {
          this.arrHistory.splice(0, 1)
        }
        localforage.setItem(this.storageName, this.arrHistory)
      })
    }

    //======================查询非百度poi，联合查询处理=================
    //外部widget是否存在或启用
    hasExWidget() {
      if (window["queryBarWidget"] == null) {
        return false
      } else {
        this.exWidget = window.queryBarWidget
        return true
      }
    }
    autoExTipList(text) {
      this.exWidget.autoTipList(text, () => {
        this.autoTipList(text, false)
      })
    }
    //调用外部widget进行查询
    queryExPOI(text) {
      let layer = this.graphicLayer

      this.exWidget.strartQueryPOI(text, layer, () => {
        this.strartQueryPOI(text, false)
      })
    }
  }

  //注册到widget管理器中。
  window.queryGaodePOIWidget = es5widget.bindClass(MyWidget)

  //每个widet之间都是直接引入到index.html中，会存在彼此命名冲突，所以闭包处理下。
})(window, mars2d)

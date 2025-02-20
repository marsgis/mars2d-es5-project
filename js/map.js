//系统 主入口

let map //地图对象
let request //url传入的参数

$(document).ready(function () {
  try {
    if (window.parent && window.parent.setStyleByTheme) {
      haoutil.storage.add("theme", "blue")
      window.parent.setStyleByTheme()
    }
  } catch (e) {
    //
  }

  //记录url传入参数
  request = haoutil.system.getRequest()
  if (window.top) {
    //有父级
    request = haoutil.system.getRequest(window.top)
  }

  let configfile = "config/config.json" //默认地址
  if (request.config) {
    configfile = request.config //url传入地址
  }

  haoutil.loading.show()

  mars2d.Util.fetchJson({ url: configfile })
    .then(function (data) {
      haoutil.loading.hide()

      initMap(data) //构建地图
    })
    .catch(function (error) {
      haoutil.loading.hide()
      console.log(error)
      haoutil.alert(error && error.message, "出错了")
    })
})

function initMap(options) {
  //合并属性参数，可覆盖config.json中的对应配置
  let mapOptions = mars2d.Util.merge(options, {})

  //存在url传入指定的底图,对应在widgets\manageBasemaps\widget.js中传入
  if (request.baselayer) {
    for (let i = 0; i < mapOptions.basemaps.length; i++) {
      let item = mapOptions.basemaps[i]
      if (item.name == request.baselayer) {
        item.show = true
        if (item.crs) {
          mapOptions.crs = item.crs
        }
        break
      } else {
        item.show = false
      }
    }
  }

  //创建地图
  map = new mars2d.Map("mars2dContainer", mapOptions)

  //构造widget
  initWidget(map)

  //如果有xyz传参，进行定位
  if (haoutil.isutil.isNotNull(request.x) && haoutil.isutil.isNotNull(request.y) && haoutil.isutil.isNotNull(request.z)) {
    let x = Number(request.x)
    let y = Number(request.y)
    let z = Number(request.z)
    map.setView([y, x], z)
  }

  //下面可以继续加项目相关的其他代码
}

//初始化widget相关
function initWidget(map) {
  haoutil.loading.show()

  mars2d.Util.fetchJson({ url: "config/widget.json" })
    .then(function (widgetCfg) {
      haoutil.loading.hide()

      //url如果有传参时的处理
      if (haoutil.isutil.isNotNull(request.widget)) {
        if (request.onlyStart) {
          widgetCfg.openAtStart = []
        }
        widgetCfg.openAtStart.push({
          uri: request.widget,
          name: request.name || "",
          windowOptions: {
            closeBtn: !request.onlyStart
          },
          request: request
        })
      }

      //初始化widget管理器
      es5widget.init(map, widgetCfg, "./") //tip: 第3个参数支持定义widget目录的相对路径。

      if (lastWidgetItem) {
        activateWidget(lastWidgetItem)
        lastWidgetItem = null
      }
    })
    .catch(function (error) {
      haoutil.loading.hide()
      console.log(error)
      haoutil.alert(error && error.message, "出错了")
    })
}

//外部页面调用
let lastWidgetItem
function activateWidget(item) {
  if (!map) {
    lastWidgetItem = item
    return
  }
  es5widget.activate(item)
}
function disableWidget(item) {
  es5widget.disable(item)
}
function activateFunByMenu(fun) {
  eval(fun)
}

function goHome() {
  es5widget.disableAll()
  map.flyHome()
}

﻿let thisWidget

//转义HTML，避免配置名称被当作标签执行
function escapeHtml(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

//当前页面业务
function initWidgetView(_thisWidget) {
  thisWidget = _thisWidget

  let arrBasemaps = thisWidget.getBasemaps()

  let inhtml = ""
  for (let i = 0; i < arrBasemaps.length; i++) {
    let layer = arrBasemaps[i]

    let vhtml = ""
    if (thisWidget.getLayerVisible(layer)) {
      vhtml = 'class="hover"'
    }

    let imgsrc = layer.options.icon || "img/basemaps/bingAerial.png"

    inhtml += `<li ${vhtml} onclick="changeBaseMaps(this,'${layer.id}')">
      <div><img src="../../${imgsrc}" /></div><div>${escapeHtml(layer.name)}</div>
    </li>`
  }
  $("#basemaps").html(inhtml)
}

function changeBaseMaps(ele, id) {
  $("#basemaps")
    .children()
    .each(function () {
      $(this).removeClass("hover")
    })

  $(ele).addClass("hover")

  thisWidget.updateBasemap(Number(id))
}

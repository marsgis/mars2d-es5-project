var thisWidget;

//当前页面业务
function initWidgetView(_thisWidget) {
  thisWidget = _thisWidget;

  var arrBasemaps = thisWidget.getBasemaps();

  var inhtml = "";
  for (var i = 0; i < arrBasemaps.length; i++) {
    var layer = arrBasemaps[i];

    var vhtml = "";
    if (thisWidget.getLayerVisible(layer)) {
      vhtml = 'class="hover"';
    }

    var imgsrc = layer.options.icon || "img/basemaps/bingAerial.png";

    inhtml += `<li ${vhtml} onclick="changeBaseMaps(this,'${layer.uuid}')">
      <div><img src="../../${imgsrc}" /></div><div>${layer.name}</div>
    </li>`;
  }
  $("#basemaps").html(inhtml);
}

function changeBaseMaps(ele, id) {
  $("#basemaps")
    .children()
    .each(function () {
      $(this).removeClass("hover");
    });

  $(ele).addClass("hover");

  thisWidget.updateBasemap(id);
}

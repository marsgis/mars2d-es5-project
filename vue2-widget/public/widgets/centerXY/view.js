var thisWidget;

//当前页面业务
function initWidgetView(_thisWidget) {
  thisWidget = _thisWidget;
  showLatlng(thisWidget.getMapCenter());
}

function showLatlng(xy) {
  $("#point_jd").val(xy.lng);
  $("#point_wd").val(xy.lat);
}

function submitXY() {
  //测量坐标转换
  var jd = Number($.trim($("#point_jd").val()));
  var wd = Number($.trim($("#point_wd").val()));

  thisWidget.flyToPoint([wd, jd], true);
}

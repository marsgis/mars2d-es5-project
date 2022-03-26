let thisWidget;

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
  let jd = Number($.trim($("#point_jd").val()));
  let wd = Number($.trim($("#point_wd").val()));

  thisWidget.flyToPoint([wd, jd], true);
}

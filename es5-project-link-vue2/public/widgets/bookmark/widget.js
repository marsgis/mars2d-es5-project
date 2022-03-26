(function (window, mars2d) {
  //创建widget类，需要继承BaseWidget
  class MyWidget extends mars2d.widget.BaseWidget {
    //弹窗配置
    get view() {
      return {
        type: "window",
        url: "view.html",
        windowOptions: {
          width: 300,
          height: 450,
        },
      };
    }

    //每个窗口创建完成后调用
    winCreateOK(opt, result) {
      this.viewWindow = result;
    }
    //激活插件
    activate() {}
    //释放插件
    disable() {
      this.viewWindow = null;
    }
    showExtent(location) {
      let arr = location.split(",");
      this.map.setView(L.latLng(arr[0], arr[1]), arr[2]);
    }
    getDefaultExtent() {
      let center = this.map.options.center;
      let zoom = this.map.options.zoom;
      let bounds = center[0] + "," + center[1] + "," + zoom;
      return bounds;
    }
    getThisExtent() {
      let center = this.map.getCenter();
      let zoom = this.map.getZoom();
      let bounds = center.lat + "," + center.lng + "," + zoom;
      return bounds;
    }
  }

  //注册到widget管理器中。
  mars2d.widget.bindClass(MyWidget);

  //每个widet之间都是直接引入到index.html中，会存在彼此命名冲突，所以闭包处理下。
})(window, mars2d);

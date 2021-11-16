(function (window, mars2d) {
  //创建widget类，需要继承BaseWidget
  class MyWidget extends mars2d.widget.BaseWidget {
    //弹窗配置
    get view() {
      return {
        type: "divwindow",
        url: "view.html",
        windowOptions: {
          width: 255,
          height: 150,
        },
      };
    }
    //初始化[仅执行1次]
    create() {
      this.measure = new mars2d.thing.Measure({ hasEdit: true });
      this.measure.on(mars2d.EventType.change, (event) => {
        this.showResult(event.label);
      });
    }
    //激活插件
    activate() {
      this.map.addThing(this.measure);
    }
    //释放插件
    disable() {
      this.map.removeThing(this.measure);
    }
    //每个窗口创建完成后调用
    winCreateOK(opt, result) {
      var that = this;

      $("#measure_length_danwei").selectpicker({
        container: "body",
        showTick: true,
        width: "120px",
      });
      $("#measure_area_danwei")
        .selectpicker({
          container: "body",
          showTick: true,
          width: "120px",
        })
        .selectpicker("hide");

      $("#btn_measure_length").bind("click", function () {
        $("#measure_length_danwei").selectpicker("show");
        $("#measure_area_danwei").selectpicker("hide");

        that.showResult("");
        that.drawPolyline();
      });

      $("#btn_measure_area").bind("click", function () {
        $("#measure_length_danwei").selectpicker("hide");
        $("#measure_area_danwei").selectpicker("show");

        that.showResult("");
        that.drawPolygon();
      });

      $("#btn_measure_clear").bind("click", function () {
        $("#measure_length_danwei").selectpicker("show");
        $("#measure_area_danwei").selectpicker("hide");

        that.showResult("");
        that.clearDraw();
      });

      $("#measure_length_danwei").change(function (e) {
        that.updateResultLengthByDw(true);
      });
      $("#measure_area_danwei").change(function (e) {
        that.updateResultAreaByDw(true);
      });
    }
    getLengtchDanWei() {
      return $("#measure_length_danwei").val();
    }
    getAreaDanWei() {
      return $("#measure_area_danwei").val();
    }
    showResult(val) {
      $("#lbl_measure_result").html(val);
    }

    clearDraw() {
      this.showResult("");
      this.measure.clear();
    }
    drawPolyline() {
      this.measure.distance({
        unit: this.getLengtchDanWei(),
      });
    }
    drawPolygon() {
      this.measure.area({
        unit: this.getAreaDanWei(),
      });
    }
    updateResultLengthByDw() {
      var danwei = this.getLengtchDanWei();
      this.measure.updateUnit(danwei);
    }
    updateResultAreaByDw() {
      var danwei = this.getAreaDanWei();
      this.measure.updateUnit(danwei);
    }
  }

  //注册到widget管理器中。
  mars2d.widget.bindClass(MyWidget);

  //每个widet之间都是直接引入到index.html中，会存在彼此命名冲突，所以闭包处理下。
})(window, mars2d);

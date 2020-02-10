//系统 主入口

var map;    //地图对象 
var request; //url传入的参数

$(document).ready(function () { 
    //记录url传入参数
    request = haoutil.system.getRequest();
    if (window.top) {//有父级
        request = haoutil.system.getRequest(window.top);
    }

    initMap();
});

function initMap() {
    var configfile = "config/config.json"; //默认地址
    if (request.config)//url传入地址
        configfile = request.config;

    haoutil.loading.show();
    $.ajax({
        type: "get",
        dataType: "json",
        url: configfile,
        timeout: 0,
        success: function (data) {
            haoutil.loading.hide(); 
 
            //构造地图
            map = L.mars.createMap({
                id: "map",
                data: data.map,
                serverURL: data.serverURL, 
                layerToMap:layerToMap
            });
 
            //如果有xyz传参，进行定位 
            if (haoutil.isutil.isNotNull(request.x)
                && haoutil.isutil.isNotNull(request.y)
                && haoutil.isutil.isNotNull(request.z)) {
                var x = Number(request.x);
                var y = Number(request.y);
                var z = Number(request.z);
                map.setView([y, x], z);
            }

            initWidget(map); //构造widget
            initWork(map);  //项目的其他事项 
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            haoutil.loading.hide();
            haoutil.alert(configfile + "文件加载失败！");
        }
    });
  
}


//初始化widget相关
function initWidget(map) {
    haoutil.loading.show();

    $.ajax({
        type: "get",
        dataType: "json",
        url: "config/widget.json",
        timeout: 0,
        success: function (widgetCfg) {
            haoutil.loading.hide();

            //url如果有传参时的处理
            if (haoutil.isutil.isNotNull(request.widget)) {
                if (request.onlyStart) widgetCfg.widgetsAtStart = [];
                widgetCfg.widgetsAtStart.push({
                    uri: request.widget,
                    name: request.name || "",
                    windowOptions: {
                        closeBtn: !request.onlyStart,
                    },
                    request: request
                });
            }
 
            //初始化widget管理器
            L.widget.init(map, widgetCfg);  //tip: 此方法有第3个参数支持定义父目录。 
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            haoutil.loading.hide();
            haoutil.alert("config/widget.json文件加载失败！");
        }
    });
}





//当前页面业务相关
function initWork() {


}


//自定义图层添加方法
function layerToMap(config, layer) {
    if (config.type == "wfs") {
        layer = L.wfsLayer(config);//wfs插件
        return layer;
    }
};

//绑定图层管理
function bindToLayerControl(name, layer) {
    if (map.gisdata.controls && map.gisdata.controls.layers) {
        map.gisdata.controls.layers.addOverlay(layer, name);
    }

    var childitem = {
        name: name,
        _layer: layer
    };
    layer.config = childitem;

    var manageLayersWidget = L.widget.getClass('widgets/manageLayers/widget.js');
    if (manageLayersWidget) {
        manageLayersWidget.addOverlay(childitem);
    }
    else {
        map.gisdata.config.operationallayers.push(childitem);
    }
}
function unbindLayerControl(name) {
    if (map.gisdata.controls && map.gisdata.controls.layers) {


        var operationallayersCfg = map.gisdata.config.operationallayers;
        for (var i = 0; i < operationallayersCfg.length; i++) {
            var item = operationallayersCfg[i];
            if (item.name == name) {
                map.gisdata.controls.layers.removeLayer(item._layer);
                break;
            }
        }
    }

    var manageLayersWidget = L.widget.getClass('widgets/manageLayers/widget.js');
    if (manageLayersWidget) {
        manageLayersWidget.removeLayer(name);
    } else {
        var operationallayersCfg = map.gisdata.config.operationallayers;
        for (var i = 0; i < operationallayersCfg.length; i++) {
            var item = operationallayersCfg[i];
            if (item.name == name) {
                operationallayersCfg.splice(i, 1);
                break;
            }
        }
    }
} 
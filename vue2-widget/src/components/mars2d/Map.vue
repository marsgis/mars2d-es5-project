<template>
  <div :id="`mars2d-container${mapKey}`" class="mars2d-container"></div>
</template>

<script>
import Vue from 'vue'

// // 使用免费开源版本
// import * as mars2d from 'mars2d'
// import 'mars2d/dist/mars2d.css'


// 为了方便使用,绑定到原型链，在其他vue文件，直接 this.mars2d 来使用
Vue.prototype.mars2d = window.mars2d
Vue.prototype.L = window.L

export default {
  name: 'mars2dViewer',

  props: {
    // 地图唯一性标识
    mapKey: {
      type: String,
      default: ''
    },
    // 初始化配置config.json的地址
    url: String,
    // widget.json的地址
    widgetUrl: String,
    // 自定义参数
    options: Object
  },

  mounted () {
    mars2d.axios
      .get(this.url)
      .then((response) => {
        let options = response.data.map
        // 构建地图
        this.initMars2D({
          ...options,
          ...this.options
        })
      })
      .catch(function (error) {
        console.log(error)
      })
  },

  beforeDestroy () {
    this[`map${this.mapKey}`].destroy()
    delete this[`map${this.mapKey}`]
  },

  methods: {
    initMars2D (mapOptions) {
      if (this[`map${this.mapKey}`]) {
        this[`map${this.mapKey}`].destroy()
      }

      // 创建三维地球场景
      var map = new mars2d.Map(`mars2d-container${this.mapKey}`, mapOptions)

      this[`map${this.mapKey}`] = map

      console.log('>>>>> 2D地图创建成功 >>>>', map)

      // widget处理
      mars2d.axios
        .get(this.widgetUrl)
        .then((response) => {
          let options = response.data
          this.initStaticWidget(map, options)
        })
        .catch(function (error) {
          console.log(error)
        })

      // 抛出事件
      this.$emit('onload', map)
    },

    // 初始化外部静态widget功能（兼容使用传统模式开发的一些widget）
    initStaticWidget (map, widget) {
      mars2d.widget.init(map, widget, window.basePathUrl || '/')
    }
  }
}
</script>

<style >
.mars2d-container {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
}

.map-control-bar {
  position: absolute;
  width: 36px;
  height: 36px;
  padding: 5px;
  background-color: rgba(0, 0, 0, 0.3);
  z-index: 9999;
}

/*弹出层皮肤*/
.layui-layer-title {
  background-color: #1e9fff !important;
  color: #fff !important;
}

/*解决问题：https://github.com/Leaflet/Leaflet/issues/3575**/
.leaflet-tile-container img {
  width: 257px !important;
  height: 257px !important;
}

.map_print {
  position: absolute;
  top: 50px;
  bottom: 35px;
  left: 0;
  right: 0;
  width: 100%;
  min-width: 200px;
  min-height: 200px;
  margin: 0;
  padding: 0;
  border: none;
  background-color: #eee;
}

.map_print_title {
  position: absolute;
  width: 100%;
  top: 5px;
  text-align: center;
  font-size: 19px;
  font-weight: bold;
}

.map_print_foot {
  position: absolute;
  width: 100%;
  bottom: 5px;
  font-size: 14px;
  color: #808080;
  text-align: center;
}
</style>

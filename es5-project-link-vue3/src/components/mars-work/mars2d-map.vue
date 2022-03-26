<template>
  <div :id="withKeyId" class="mars2d-container"></div>
</template>
<script setup lang="ts">
/**
 * 地图渲染组件
 * @copyright 火星科技 mars2d.cn
 * @author 火星吴彦祖 2022-02-19
 */
import { computed, onBeforeUnmount, onMounted } from "vue";
let mars2d = window.mars2d;
let L = mars2d.L;

const props = withDefaults(
  defineProps<{
    url: string;
    widgetUrl: string;
    mapKey?: string;
    options?: any;
  }>(),
  {
    url: "",
    mapKey: "default",
    options: () => ({}),
  }
);

// 用于存放地球组件实例
let map: mars2d.Map; // 地图对象

// 使用用户传入的 mapKey 拼接生成 withKeyId 作为当前显示容器的id
const withKeyId = computed(() => `mars2d-container-${props.mapKey}`);

onMounted(() => {
  // 获取配置
  mars2d.Util.fetchJson({ url: props.url }).then((data: any) => {
    initMars3d({
      // 合并配置项
      ...data.mars2d,
      ...props.options,
    });
  });
});

// onload事件将在地图渲染后触发
const emit = defineEmits(["onload"]);
const initMars3d = (option: any) => {
  map = new mars2d.Map(withKeyId.value, option);

  // widget处理
  mars2d.Util.fetchJson({ url: props.widgetUrl }).then(function (options: any) {
    // @ts-ignore
    mars2d.widget.init(map, options, window.basePathUrl || "/");
  });

  // map构造完成后的一些处理
  onMapLoad();
  emit("onload", map);
};

// map构造完成后的一些处理
function onMapLoad() {
  // 用于 config.json 中 西藏垭口 图层的详情按钮 演示
  // @ts-ignore
  // window.showPopupDetails = (item: any) => {
  //   alert(item.NAME);
  // };
}

// 组件卸载之前销毁mars2d实例
onBeforeUnmount(() => {
  if (map) {
    map.destroy();
    map = null;
  }
});
</script>

<style>
.mars2d-container {
  height: 100%;
  overflow: hidden;
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

/**
 * ts下为window定义全局变量
 * @copyright 火星科技 mars2d.cn
 * @author 木遥 2022-01-01
 */

export { }
declare global {
  interface Window {
    mars2d: any // 第3方公共类库配置文件 
  }
}

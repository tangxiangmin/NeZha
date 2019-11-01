/**
 * 2019/11/1 下午9:12
 * 浏览器入口文件，等待服务端响应完成之后，浏览器会接手html并进行脱水
 */
import {h, renderDOM} from "../src";

import App from './app'

renderDOM(<App/>, document.getElementById("#root"), () => {
    console.log('app init')
})

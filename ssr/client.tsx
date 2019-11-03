/**
 * 2019/11/1 下午9:12
 * 浏览器入口文件，等待服务端响应完成之后，浏览器会接手html并进行脱水
 */
import {h, renderDOM, hydrateDOM} from "../src";

import App from './app'

// todo 此处需要提供hydrate接口
// renderDOM(<App/>, document.getElementById("root"), () => {
//     console.log('app init')
// })

hydrateDOM(<App/>, document.getElementById("root"))

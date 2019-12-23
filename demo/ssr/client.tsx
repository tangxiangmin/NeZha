/**
 * 2019/11/1 下午9:12
 * 浏览器入口文件，等待服务端响应完成之后，浏览器会接手html并进行脱水
 */
import {h, renderDOM, hydrateDOM, Component} from "../../packages/nezha/lib";

import App from './app'
import {createStore} from "./store";
// @ts-ignore
let store = createStore(window.INIT_DATA)

hydrateDOM(<App context={{store}}/>, document.getElementById("root"))

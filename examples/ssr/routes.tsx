/**
 * 2019/11/1 下午9:11
 * 一份前后台共用的路由配置，
 */
import {Component, h} from '../../packages/nezha/lib'
import {RouteConfig} from "../../packages/nezha-router/lib";


import {Home, About, List} from "./pages";

const routes: Array<RouteConfig> = [
    {path: '/', component: Home},
    {path: '/about', component: About},
    {path: '/list', component: List},
    {
        component: () => {
            return (<div>404</div>)
        }
    }
]

export default routes

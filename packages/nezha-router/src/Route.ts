// Route组件
import {Component, h} from "@shymean/nezha";
import * as router from "./history";
import {NeZhaLocation} from "./location";

export interface RouteConfig {
    path?: string,
    component: Function | Component,
    location?: NeZhaLocation
}

const Route = ({component, location}: RouteConfig) => {
    let Comp: Function | Component = component
    // 通过Route组件，向页面组件传入router、location等接口
    // @ts-ignore
    return h(Comp, {
        router,
        location
    })
}

export default Route

// 根据routes配置生成Route
export function createRoute(config: RouteConfig, location: NeZhaLocation) {
    return h(Route, {
        path: config.path,
        component: config.component,
        location: location
    })
}


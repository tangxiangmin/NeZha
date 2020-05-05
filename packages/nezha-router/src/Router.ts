// import * as pathToRegexp from 'path-to-regexp'
const {pathToRegexp} = require("path-to-regexp");

import {Component} from "@shymean/nezha";
import {VNode} from "@shymean/nezha/src/fiber";

import {getCurrentUrl} from './history'
import {createRoute, RouteConfig} from "./Route";
import {createLocation} from "./location";

const ROUTERS: Array<Router> = []
const IS_BROWSER = typeof window !== 'undefined'

// todo 如锚点跳转等也会触发popstate，需要处理此类场景
function onpopstate() {
    console.log('onpopstate')
    let url = getCurrentUrl()
    routeTo(url)
}

export function routeTo(url: string) {
    ROUTERS.forEach(router => {
        router.route(url)
    })
}

// 清空所有的Router组件实例
export function releaseRouter() {
    ROUTERS.splice(0, ROUTERS.length)
}

// 根据path判断当前页面路径url是否匹配
// path增加支持正则匹配组件 https://github.com/pillarjs/path-to-regexp#readme
function match(path: string, url: string): boolean {
    const keys = []
    // @ts-ignore
    const regexp = pathToRegexp(path, keys, {endsWith: "?"})
    return regexp.test(url)
}

// 找到第一个符合条件的route
export function getMatchRouteConfig(url: string, routes: Array<RouteConfig>): RouteConfig {
    for (let route of routes) {
        // 不配置任何path，作为通用匹配
        if (!route.path || route.path === url || match(route.path, url)) return route
    }
}

class Router extends Component {
    from: VNode
    to: VNode

    constructor(props) {
        super(props);
        let url = props.url || getCurrentUrl()

        this.state = {
            url,
        }

        // 浏览器环境下注册popstate事件
        if (IS_BROWSER && window.addEventListener) {
            ROUTERS.push(this) // 通过routers保存当前router实例
            window.removeEventListener('popstate', onpopstate)
            window.addEventListener('popstate', onpopstate)
        }
    }

    componentWillUnmount() {
        let idx = ROUTERS.indexOf(this)
        idx > -1 && ROUTERS.splice(idx, 1)
    }

    route(url) {
        // 保留旧的节点
        this.from = this.to
        // todo setState回调函数可能不被执行，需要的diff方法中进行处理
        this.setState({
            url,
        }, () => {
            let {onChange} = this.props

            // from和to对应路由切换前后的Route组件，需要通过$child获取对应的页面组件节点
            let from = this.from && this.from.$child
            let to = this.to && this.to.$child
            onChange && onChange(from, to)
        })
    }

    getMatchRoute() {
        let {url} = this.state
        let routes: Array<RouteConfig> = this.props.routes || []
        let config = getMatchRouteConfig(url, routes)
        // 根据url找到route配置，根据route及url生成location对象
        let location = createLocation(url, config.path)
        return config ? createRoute(config, location) : null
    }

    render() {
        this.to = this.getMatchRoute()
        return this.to
    }
}

export default Router

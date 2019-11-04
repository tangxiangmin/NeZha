import {Component} from "../src";
import {VNode} from "../src/fiber";

import {getCurrentUrl} from './history'
import {createRoute, RouteConfig} from "./Route";
import {createLocation} from "./location";

const ROUTERS: Array<Router> = []
const IS_BROWSER = typeof window !== 'undefined'

function onpopstate() {
    let url = getCurrentUrl()
    routeTo(url)
}

export function routeTo(url: string) {
    ROUTERS.forEach(router => {
        router.route(url)
    })
}

// 找到第一个符合条件的route
export function getMatchRouteConfig(url: string, routes: Array<RouteConfig>): RouteConfig {
    let location = createLocation(url)
    let matches = routes.filter((route) => !route.path || route.path === location.path)
    return matches[0]
}

class Router extends Component {
    constructor(props) {
        super(props);
        let url = props.url || getCurrentUrl()
        let location = createLocation(url)

        this.state = {
            url,
            location,
        }

        ROUTERS.push(this) // 通过routers保存当前router实例

        // 浏览器环境下注册popstate事件
        if (IS_BROWSER && window.addEventListener) {
            window.removeEventListener('popstate', onpopstate)
            window.addEventListener('popstate', onpopstate)
        }
    }

    route(url) {
        let location = createLocation(url)
        this.setState({
            url,
            location
        })
    }

    // todo path增加支持正则匹配组件 https://github.com/pillarjs/path-to-regexp#readme
    // todo 实现404页面
    getMatchRoute() {
        // @ts-ignore
        let routes: Array<RouteConfig> = this.props.routes || []
        let {location, url} = this.state
        let config = getMatchRouteConfig(url, routes)

        return config ? createRoute(config, location) : null
    }

    render() {
        return this.getMatchRoute()
    }
}

export default Router

import {Component} from "../src";
import {VNode} from "../src/fiber";

import {getCurrentUrl} from './history'
import {createRoute} from "./Route";
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

class Router extends Component {
    constructor(props) {
        super(props);
        let url = props.url || getCurrentUrl()
        let location = createLocation(url)

        this.state = {
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
            location
        })
    }

    // todo path增加支持正则匹配组件 https://github.com/pillarjs/path-to-regexp#readme
    // todo 实现404页面
    getMatchRoute() {
        // @ts-ignore
        let routes: Array<RouteConfig> = this.props.routes || []
        let location = this.state.location

        let children: Array<VNode> = routes
            .map((config) => {
                return createRoute(config, location)
            })
            // @ts-ignore
            .concat(this.props.children || [])

        for (let i = 0; i < children.length; ++i) {
            let child = children[i]
            // @ts-ignore
            if (child.props.path === location.path) {
                return child
            }
        }
        return null
    }

    render() {
        return this.getMatchRoute()
    }
}

export default Router

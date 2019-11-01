import {h, Component} from '../src/index'

import {VNode} from "../src/fiber";

const ROUTERS: Array<Router> = []

interface RouteConfig {
    path: string,
    component: Function | Component
}

interface RouterAPI {
    push: Function,
    redirect: Function,
    back: Function
}

// 获取当前的url
function getCurrentUrl() {
    return location.pathname
}

// 加载新的url
function push(url: string) {
    history.pushState(null, null, url)
    // 目前通过ROUTERS数组保持对于路由组件实例的引用
    // 稍后我们会实现Route组件，将这些方法路由方法通过props传给应用组件，这样就不必在每个页面中手动引入push和redirect接口了
    routeTo(url)
}

// 重定向到新的url
function redirect(url: string) {
    history.replaceState(null, null, url)
    routeTo(url)
}

// 返回上一页
function back() {
    history.back()
    routeTo(getCurrentUrl())
}

function routeTo(url: string) {
    ROUTERS.forEach(router => {
        router.route(url)
    })
}

function onpopstate() {
    let url = getCurrentUrl()
    routeTo(url)
}

// 导出的接口
const router: RouterAPI = {
    push,
    redirect,
    back
}

// Route组件
const Route = ({path, component}: RouteConfig) => {
    let Comp: Function | Component = component
    // @ts-ignore
    return h(Comp, {
        router
    })
}

// 根据routes配置生成Route
function createRoute(config: RouteConfig) {
    return h(Route, {
        path: config.path,
        component: config.component
    })
}

// Link组件
const linkHandler = (e, url) => {
    e.preventDefault()
    push(url)
}

const Link = ({href, children}) => {
    return h('a', {
        href,
        onClick: (e) => linkHandler(e, href)
    })
}

// Router组件
class Router extends Component {

    constructor(props) {
        super(props);
        this.state = {
            url: props.url || getCurrentUrl()
        }

        ROUTERS.push(this) // 通过routers保存当前router实例
        // SSR不需要该逻辑
        // TODO，新增abstract路由机制
        if (typeof window !== 'undefined' && window.addEventListener) {
            window.removeEventListener('popstate', onpopstate)
            window.addEventListener('popstate', onpopstate)
        }
    }

    route(url) {
        this.setState({
            url
        })
    }

    // todo path增加支持正则匹配组件 https://github.com/pillarjs/path-to-regexp#readme
    // todo 实现404页面
    getMatchRoute() {
        // @ts-ignore
        let routes: Array<RouteConfig> = this.props.routes || []
        let {url} = this.state

        let children: Array<VNode> = routes
            .map(createRoute)
            // @ts-ignore
            .concat(this.props.children || [])

        for (let i = 0; i < children.length; ++i) {
            let child = children[i]
            // @ts-ignore
            if (child.props.path === url) {
                return child
            }
        }
        return null
    }

    render() {
        return this.getMatchRoute()
    }
}

export {
    Link,
    Route,
    Router,
    router
}


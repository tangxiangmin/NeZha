import {h, Component} from '../src/index'
import {VNode} from "../src/virtualDOM/h";

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
    return (<Comp router={router}/>)
}

// 根据routes配置生成Route
function createRoute(config: RouteConfig) {
    return (<Route path={config.path} component={config.component}/>)
}

// Link组件
const linkHandler = (e, url) => {
    e.preventDefault()
    push(url)
}
const Link = ({href, children}) => {
    return (<a href={href} onClick={(e) => linkHandler(e, href)}>{children}</a>)
}

// Router组件
class Router extends Component {
    state = {
        url: getCurrentUrl()
    }

    constructor(props) {
        super(props);
        ROUTERS.push(this) // 通过routers保存当前router实例
        // SSR不需要该逻辑
        if (window && window.addEventListener) {
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
    getMatchRoute() {
        let routes: Array<RouteConfig> = this.props.routes || []
        let {url} = this.state

        let children: Array<VNode> = routes
            .map(createRoute)
            .concat(this.props.children || [])

        for (let i = 0; i < children.length; ++i) {
            let child = children[i]
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

// todo 为了简化使用及迭代，部分接口应该不需要暴露给用户
export {
    Link,
    Route,
    router
}

export default Router

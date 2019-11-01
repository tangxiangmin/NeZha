
## 实现Router

从使用方式出发，思考应该如何实现一个单页应用的Router组件。

```jsx
<Router url={url}>
    <Route1 path="/route1"/>
    <Route2 path="/route2"/>
</Router>
```
当url为`/route1`时应该渲染`Route1`组件，为`/route2`时应该渲染`Route2`组件，理解成一个`if-else-if`的条件分支即可

在`Router`中，可以通过`props.children`拿到需要渲染的所有页面，这样，只需要知道当前url，然后找到需要渲染的页面组件即可。

理解了这一点，就能理解页面切换的操作也就是修改url，重新渲染页面组件的问题。

因此，我们先来实现`Router`组件

## Router组件
下面是一个最简单的版本
```js
class Router extends Component {
    constructor(props) {
        super(props);
    }
    getCurrentUrl() {
        return location.pathname
    }

    getMatchRoute() {
        let {children} = this.props
        let url = this.getCurrentUrl()
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
```
地址栏改变，刷新后就可以看见渲染了对应的组件，理想状态是`getCurrentUrl`支持从`location.pathname`、`location.hash`等地方获取当前url，这对应了不同的`history`模型，我们后面再提。

接下来实现页面的切换，

## 页面切换更新与Link组件
页面的切换操作包括前进、后退、重定向，前面提到页面切换就是改变当前url重新渲染的过程，因此我们需要实现监听url变化的逻辑，这里可以使用[HTML5 History](https://developer.mozilla.org/zh-CN/docs/Web/API/History)实现
* `pushState`前进
* `replaceState`重定向
* `onpopupState`后退


```ts
const ROUTERS: Array<Router> = []
function getCurrentUrl() {
    return location.pathname
}

function push(url) {
    history.pushState(null, null, url)
    // 目前通过ROUTERS数组保持对于路由组件实例的引用
    // 稍后我们会实现Route组件，将这些方法路由方法通过props传给应用组件，这样就不必在每个页面中手动引入push和redirect接口了
    routeTo(url)
}

function redirect(url) {
    history.replaceState(null, null, url)
    routeTo(url)
}

function routeTo(url) {
    ROUTERS.forEach(router => {
        router.route(url)
    })
}

function onpopstate() {
    let url = getCurrentUrl()
    routeTo(url)
}

class Router extends Component {
    state = {
        url: getCurrentUrl()
    }

    constructor(props) {
        super(props);
        ROUTERS.push(this) // 通过routers保存当前router实例
        
        window.addEventListener('popstate', onpopstate)
    }

    route(url) {
        this.setState({
            url
        })
    }
}

export const router = {
    push,
    redirect
}
```
这样我们就可以在页面中使用api进行路由跳转，实现页面切换
```jsx
// 在页面中使用api进行路由跳转
<button onClick={(e) => {
     router.push('/route1')
 }}></button>
```

此时，我们还可以顺便实现`Link组件`，其原理就是渲染一个`a`标签，然后修改其点击事件，加入路由跳转逻辑即可
```tsx
const linkHandler = (e, url) => {
    e.preventDefault()
    push(url)
}
export const Link = ({href, children}) => {
    return (<a href={href} onClick={(e) => linkJump(e, href)}>{children}</a>)
}
```

此外，一般还要在路由切换时需要携带参数，在`push`、`redirect`方法中增加相关参数即可，

## Route组件
除了上面这种手动引入`push`、`redirect`等API的方式，我们可能更习惯在页面组件中直接调用这些API。因此我们可以通过高阶组件，将路由相关接口通过props注入到页面组件中。这个高阶组件我们命名为`Route`

组件定义
```jsx
const Route = ({component}) => {
    let Component = component
    return (<Component router={router}/>)
}
```
使用`Route`组件
```jsx
<Router>
    <Route path='/' component={() => {
        return (<div>Index</div>)
    }}/>
    <Route path='/route1' component={Route1}/>
    <Route path='/route2' component={Route2}/>
</Router>
```
这样在路由组件中可以根据props.router访问到router相关接口
```jsx
const Route1 = ({router}) => {
    console.log(router)
    return (
        <div>Route page 1</div>
    )
}
```

## 共用routes配置
在某些时候我们并不想在`Router`组件下编写`Route`配置路由，反之，一个更好的方式是将路由配置通过props的方式传递给`Router`，这样我们可以更灵活地管理路由配置，甚至包括在SSR中实现路由同构复用！

之前我们是直接从`props.children`上获取需要渲染的子节点列表，现在我们需要从routes配置里面生成需要渲染的子节点，因此修改Router实现代码，根据routes自动生成相关Route
```tsx
getMatchRoute() {
    let routes: Array<RouteConfig> = this.props.routes || []
    let {url} = this.state

    function createRoute(config: RouteConfig) {
        return (<Route path={config.path} component={config.component}/>)
    }

    // 根据routes生成Route
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
```
使用方式修改为如下
```jsx
const routes = [{
    path: '/',
    component: () => {
        return (<div>Index</div>)
    }
}, {
    path: '/route1',
    component: Route1,
}, {
    path: '/route2',
    component: Route2
}]

<Router routes={routes} />
```
这样，我们就可以更为灵活的管理传入的routes配置了。

## 需要完善的地方
* 实现嵌套路由
* 支持对routes排序，支持展示默认视图如404等
* url与path的匹配应该更加灵活
* 路由api参数传递
* 中间件、相关钩子函数
* 滚动位置
* 路由组件缓存，这个应该是组件缓存自身的逻辑，也许不需要在router中实现

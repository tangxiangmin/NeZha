import {doPatch} from './patch'
import {diffSync, diff} from "./diff";
import {VNode} from "./fiber";

let appRoot

// 实现一个浅比较
function shallowCompare(a, b) {
    if (Object.is(a, b)) return true
    const keysA = Object.keys(a)
    const keysB = Object.keys(b)

    if (keysA.length !== keysB.length) return false

    const hasOwn = Object.prototype.hasOwnProperty
    for (let i = 0; i < keysA.length; i++) {
        if (!hasOwn.call(b, keysA[i]) ||
            !Object.is(a[keysA[i]], b[keysA[i]])) {
            return false
        }
    }
    return true
}


function diffRoot(cb) {
    // 从根节点开始进行diff，当遇见Component时，需要使用新的props和props更新节点
    diff(appRoot, appRoot, (patches) => {
        doPatch(patches)
        cb && cb()
    })
}

abstract class Component {
    static _isClassComponent = true // 判断是函数组件还是类组件

    shouldComponentUpdate: Function
    props: Object

    _isForce = false
    nextState = null
    state = null

    // todo 当前的调度器机制导致不能在render函数中调用render
    abstract render(): VNode

    setState(newState, cb) {
        // 保存需要更新的状态
        let nextState = Object.assign({}, this.state, newState)
        // 判断新旧属性是否相同
        // todo，对于引用相同对象，应该不参与比较，否则如数组shuffle等不会更新
        if (!shallowCompare(nextState, this.state)) {
            this.nextState = nextState
            diffRoot(cb)
        }
    }

    // 当render方法中依赖了一些外部变量时，我们无法直接通过this.setState()方法来触发render方法的更新
    // 因此需要提供一个forceUpdate的方法，强制执行render
    forceUpdate() {
        this._isForce = true
        diffRoot(() => {
            this._isForce = false
        })
    }
}

// 将根组件节点渲染到页面上
function renderDOM(root, dom, cb) {
    // 整个应用的根节点
    root.$parent = {
        $el: dom
    }
    if (!appRoot) {
        appRoot = root // 保存整个应用根节点的引用
    }
    // 初始化时直接使用同步diff
    let patches = diffSync(null, root)
    doPatch(patches)
    cb && cb()
}


export {
    Component,
    renderDOM
}

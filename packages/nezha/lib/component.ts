import {VNode} from "./fiber";

import {diffRoot} from "./reconciler";

import {shallowCompare} from './util'

abstract class Component {
    static _isClassComponent = true // 判断是函数组件还是类组件
    _isForce = false

    props: any
    nextState = null
    state = null

    constructor(props) {
        this.props = props
    }

    // 一些生命周期方法
    shouldComponentUpdate() {
        return true
    }

    componentWillUnmount() {
    }

    componentDidMount() {
    }

    componentDidUpdate() {
    }

    // todo 当前的调度器机制导致不能在render函数中调用setState
    abstract render(): VNode

    setState(newState: Object, cb?: Function) {
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

export {
    Component,
}

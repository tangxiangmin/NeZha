import {isComponent, isTextNode, VNode} from "./fiber";
import {isEventProp, isFilterProp, isNativeProp} from "./util";
import {diffSync} from "./diff";
import {doPatch} from "./patch";

const {getAppRoot, setAppRoot} = (() => {
    let appRoot: VNode

    function getAppRoot(): VNode {
        return appRoot
    }

    function setAppRoot(node: VNode) {
        appRoot = node
    }

    return {
        getAppRoot,
        setAppRoot
    }
})();


// 向上找到最近的DOM节点
function findLatestParentDOM(node: VNode) {
    let parent = node.$parent
    // 从父节点向上找到第一个DOM父节点
    while (parent && isComponent(parent.type)) {
        parent = parent.$parent
    }
    return parent
}

// 向下找到最近的DOM节点
function findLatestChildDOM(node: VNode) {
    let child = node
    while (isComponent(child.type)) {
        child = child.$child
    }
    return child
}

// 向dom元素增加属性
function setAttribute(el, prop, val) {
    if (prop === 'dangerouslyInnerHTML') {
        el.innerHTML = val
    }
    if (isFilterProp(prop)) return
    if (prop === 'className') prop = 'class'

    if (isEventProp(prop)) {
        let eventName = prop.slice(2).toLowerCase()
        el.addEventListener(eventName, val)
    } else {
        el.setAttribute(prop, val)
    }
}

// 创建节点
function createDOM(node) {
    let type = node.type
    return isComponent(type) ?
        createComponent(node) :
        isTextNode(type) ?
            document.createTextNode(node.props.nodeValue) :
            document.createElement(type)
}

// 将节点插入父节点，如果节点存在父节点中，则调用insertBefore执行的是移动操作而不是复制操作，因此也可以用来进行MOVE操作
function insertDOM(newNode: VNode) {
    let parent = findLatestParentDOM(newNode)
    let parentDOM = parent && parent.$el
    if (!parentDOM) return

    let child = findLatestChildDOM(newNode)

    let el = child && child.$el
    let after = parentDOM.children[newNode.index]
    after ? parentDOM.insertBefore(el, after) : parentDOM.appendChild(el)
}

// 移除DOM节点
function removeDOM(oldNode: VNode) {
    let parent = findLatestParentDOM(oldNode)
    let child = findLatestChildDOM(oldNode)
    parent.$el.removeChild(child.$el)
}

// 设置DOM节点属性
function setAttributes(vnode: VNode, attrs) {
    if (isComponent(vnode.type) && attrs) {
        // 如果是在组件节点上设置某些原生属性，则将其属性设置到其元素子节点上
        let nativePropKeys = Object.keys(attrs).filter(isNativeProp)
        if (nativePropKeys.length > 0) {
            let nativeProps = nativePropKeys.reduce((acc, key) => {
                acc[key] = attrs[key]
                return acc
            }, {})

            setAttributes(vnode.$child, nativeProps)
        }

    } else if (isTextNode(vnode.type)) {
        // @ts-ignore
        vnode.$el.nodeValue = vnode.props.nodeValue
    } else {
        let el = vnode.$el
        attrs && Object.keys(attrs).forEach(key => {
            setAttribute(el, key, attrs[key])
        });
    }
}

// 创建组件的DOM节点，在最后的策略中，决定让组件节点不携带任何DOM实例，及vnode.$el = null
// 组件节点插入页面的操作交给其向上第一个DOM父级元素节点和向下第一个DOM字节元素节点处理
function createComponent(node) {
    return null
}

// 将根组件节点渲染到页面上
function renderDOM(root, dom, cb?: Function) {
    // 整个应用的根节点
    root.$parent = {
        $el: dom
    }

    // 保存整个应用根节点的引用，单个页面只会存在一个应用实例
    setAppRoot(root)

    // 初始化时直接使用同步diff
    let patches = diffSync(null, root)
    doPatch(patches)
    cb && cb()
}

export {
    createDOM,
    removeDOM,
    insertDOM,
    setAttributes,

    getAppRoot,
    setAppRoot,
    renderDOM
}

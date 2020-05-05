// todo 在SSR中复用浏览器已经渲染的DOM节点
import {renderDOM} from "./index";
import {diffSync} from './diff'
import {isClassComponent, isComponent, isTextNode, VNode} from "./fiber";
import {setAttributes, setAppRoot} from "./renderDOM";

function clearContainer(dom) {
    Array.from(dom.children).forEach(child => {
        dom.removeChild(child)
    })
}

// 当vnode树和dom树无法完全匹配时，强制重新根据vnode渲染DOM节点
function forceHydrate(root, dom) {
    // 为了验证ssr，暂时将其处理成清空容器，由浏览器重新渲染
    clearContainer(dom)
    renderDOM(root, dom)
}

// 遍历虚拟DOM和真实DOM
function walk(node: VNode, dom: any): Boolean {
    if (!node && !dom) return true
    if (!node || !dom) return false


    while (isComponent(node.type)) {
        node = node.$child
    }
    // 处理文本节点
    if (isTextNode(node.type) && dom.nodeType === 3) {
        node.$el = dom
        return true
    }

    // 处理元素节点
    if (node.type !== dom.tagName.toLowerCase()) return false

    node.$el = dom // 复用已经渲染的DOM节点
    setAttributes(node, node.props) // 更新DOM节点属性，如注册事件等

    if (node.props.dangerouslyInnerHTML) return true // 如果子节点是通过dangerouslyInnerHTML设置的，则直接跳过后续工作

    let children = node.children
    let domList = dom.childNodes
    if (children.length !== domList.length) return false

    for (let i = 0; i < children.length; ++i) {
        if (!walk(children[i], domList[i])) {
            return false
        }
    }
    return true
}

// 尝试将已存在的DOM树脱水到vnode树上，更新vnode的$el
function hydrateDOM(root, dom) {
    setAppRoot(root)
    diffSync(null, root)
    root.$parent = {
        $el: dom
    }
    // 与第一个真实DOM做比较，因此此处要求组件都是单节点结果
    let isSuccess = walk(root, dom.children[0])
    if (!isSuccess) forceHydrate(root, dom)
}

export {
    hydrateDOM
}

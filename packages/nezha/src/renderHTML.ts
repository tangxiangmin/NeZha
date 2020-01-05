/*
    在ssr中，我们需要的不是DOM节点，而是HTML字符串，renderHTML方法将根节点组件渲染成HTML字符串
 */

import {isComponent, isTextNode, VNode} from "./fiber";

import {diffSync} from './diff'
import {isEventProp, isFilterProp} from "./util";

// 在ssr中，我们需要的不是DOM节点，而是HTML字符串，

function VNode2HTML(root: VNode): string {
    let {type, props, children} = root

    let sub = '' // 获取子节点渲染的html片段
    Array.isArray(children) && children.forEach(child => {
        sub += VNode2HTML(child)
    })

    let el = '' // 当前节点渲染的html片段
    if (isComponent(type)) {
        el += sub // 组件节点不渲染任何文本
    } else if (isTextNode(type)) {
        // @ts-ignore
        el += props.nodeValue // 纯文本节点则直接返回
    } else {
        let attrs = ''
        for (let key in props) {
            if (key === 'dangerouslyInnerHTML') {
                sub += props[key]
            } else {
                attrs += getAttr(key, props[key])
            }
        }
        el += `<${type}${attrs}>${sub}</${type}>` // 将子节点插入当前节点
    }

    return el

    function getAttr(prop, val) {
        if (isFilterProp(prop)) return ''
        // 渲染HTML，我们不需要 事件 等props，而是在hydrate阶段重新设置属性
        return isEventProp(prop) ? '' : ` ${prop}="${val}"`
    }
}

// 为了更加直观地渲染HTML标签，在此处递归遍历了两次，
// TODO 也可以通过在doPatches的INSERT操作也可以实现将VNode转换为HTML

function renderHTML(root: VNode): string {
    // 首先将调用diff获取初始化组件节点，获取完整的节点树
    diffSync(null, root)
    // 将vnode转换为html节点
    return VNode2HTML(root)
}

export {
    renderHTML
}

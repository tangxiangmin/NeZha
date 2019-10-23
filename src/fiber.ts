import {Component} from "./component";
import {flattenArray} from "./util";

export interface VNode {
    type: Function | string,
    $el: any, // DOM实例
    $instance?: Component, // 组件实例
    key?: string | number,
    props: Object,
    index: number, // 在父节点中的索引值顺序
    children: Array<VNode>,

    $parent: VNode,
    $child: VNode,
    $sibling: VNode,

    oldFiber?: VNode
}

// todo 当特殊类型的节点较多时，难免需要增加多种判断条件，我们可以在VNode上扩展一个tag属性来处理这个问题
// 处理传入的字面量文本节点
const TEXT_NODE = Symbol.for('__text_node')

function isTextNode(type: any) {
    return type === TEXT_NODE
}

// 根据type判断是是否为自定义组件
function isComponent(type: any) {
    return typeof type === 'function'
}

function isClassComponent(type) {
    return isComponent(type) && type._isClassComponent
}

function createFiber(type, props, ...children) {
    if (!props) props = {}
    let key = props.key
    delete props.key

    let vnode: VNode = {
        type,
        props,
        key,
        $el: null,
        index: 0,
        children: [],

        $parent: null,
        $child: null,
        $sibling: null
    }

    children = flattenArray(children).map((child, index) => {
        if (!child.type) {
            // 处理文本节点
            child = {
                type: TEXT_NODE,
                props: {
                    nodeValue: child
                },
                children: []
            }
        }
        return child
    })

    vnode.children = bindFiber(vnode, children)
    return vnode
}

function bindFiber(parent: VNode, children: Array<VNode>) {
    let firstChild: VNode
    return children.map((child: VNode, index: number) => {
        child.$parent = parent // 每个子节点保存对父节点的引用
        child.index = index

        if (!firstChild) {
            parent.$child = child // 父节点保存对于第一个子节点的引用
        } else {
            firstChild.$sibling = child // 保存对于下一个兄弟节点的引用
        }
        firstChild = child
        return child
    })
}

export {
    isTextNode,
    isComponent,
    isClassComponent,
    createFiber,
    bindFiber
}

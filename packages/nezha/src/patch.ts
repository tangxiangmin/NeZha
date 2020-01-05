import {REMOVE, INSERT, UPDATE, MOVE, Patch} from './diff'
import {isClassComponent, VNode} from './fiber'
import {createDOM, removeDOM, setAttributes, insertDOM} from './renderDOM'
import {isFunc} from "./util";

// 特定类型的变化，需要重新生成DOM节点，由于无法完全保证patches的顺序，因此在此步骤生成vnode.$el
const beforeCommit = {
    [UPDATE](oldNode: VNode, newNode: VNode) {
        // 复用旧的DOM节点，只需要更新必要的属性即可
        newNode.$el = oldNode.$el
    },
    [INSERT](oldNode: VNode, newNode: VNode) {
        newNode.$el = createDOM(newNode)
    },
};
// 执行此步骤时所有vnode.$el都已准备就绪
const commit = {
    [REMOVE](oldNode: VNode, newNode: VNode) {
        // 调用willUnmount钩子
        if (isClassComponent(oldNode.type) && isFunc(oldNode.$instance.componentWillUnmount)) {
            oldNode.$instance.componentWillUnmount()
        }
        removeDOM(oldNode)
    },
    [UPDATE](oldNode: VNode, newNode: VNode, attrs: Object) {
        // 只需要更更新diff阶段收集到的需要变化的属性
        setAttributes(newNode, attrs)
        // 调用updated钩子函数
        if (isClassComponent(newNode.type) && isFunc(newNode.$instance.componentDidUpdate)) {
            newNode.$instance.componentDidUpdate()
        }
    },
    [INSERT](oldNode: VNode, newNode: VNode) {
        // 新插入的节点上添加属性
        setAttributes(newNode, newNode.props)
        insertDOM(newNode)
        // 调用mounted钩子函数
        if (isClassComponent(newNode.type) && isFunc(newNode.$instance.componentDidMount)) {
            newNode.$instance.componentDidMount()
        }
    },
}

// 对于需要MOVE元素，我们先找到对应的父节点，然后移动该父节点下的所有子节点
// TODO 这一步是可以优化的，避免不必要的move操作，尽管当前操作比较直观
function doMovePatches(patches: Patch[]) {
    let movePatches = patches
        .filter(patch => patch.type === MOVE)

    let parentMap = new Set()
    movePatches.forEach(patch => {
        let {newNode, oldNode} = patch
        let parent = newNode.$parent
        if (!parentMap.has(parent)) {
            parentMap.add(parent)
        }
    })

    parentMap.forEach((val, parent) => {
        // @ts-ignore
        parent.children.forEach(node => {
            insertDOM(node)
        })
    })
}

// =====patch过程，更新视图==== //
function doPatch(patches: Patch[]) {

    // 首先对处理需要重新创建的DOM节点
    patches.forEach(patch => {
        const {type, oldNode, newNode} = patch
        let handler = beforeCommit[type];
        handler && handler(oldNode, newNode);
    })

    // 将每个变化更新到真实的视图上
    patches.forEach(patch => {
        const {type, oldNode, newNode, attrs} = patch
        let handler = commit[type];
        handler && handler(oldNode, newNode, attrs);
    })

    // 单独处理处理MOVE类型的patch
    doMovePatches(patches)
}


export {
    doPatch
}

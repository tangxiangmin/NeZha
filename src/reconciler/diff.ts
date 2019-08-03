/*
    实现 diff
    参考：https://zhuanlan.zhihu.com/p/20346379
 */


import {VNode} from "../virtualDOM/h";
import {Fiber, createFiber, enqueueUpdate, getFiberChildren} from "./fiber";

// 单个DOM节点diff时可能进行的操作
export enum PatchTag {
    NONE = "none",
    DELETE = "delete",
    UPDATE = 'update',
    MOVE = 'move',
    ADD = 'add',
    REPLACE = 'replace'
}

function isSameVnode(a: VNode, b: Fiber) {
    // 组件元素类型相同、dom元素名称相同，则可以复用
    return a.type === b.vnode.type
}

// 比较新旧fiber的子节点，并将可用的fiber节点转换为fiber
export function diff(parentFiber: Fiber, newChildren: Array<VNode>) {
    const oldChildren = parentFiber.children // 获取旧的子节点列表
    let newFibers = []
    let prevFiber = null
    let i
    // 新节点与旧节点对比
    for (i = 0; i < newChildren.length; ++i) {
        let newNode = newChildren[i]
        let oldFiber = oldChildren[i]
        let newFiber: Fiber
        if (!newNode) {
            continue
        }
        if (oldFiber) {
            if (isSameVnode(newNode, oldFiber)) {
                // 如果存在相同类型的旧节点，则可以直接复用对应的dom实例，即newFiber.stateNode
                // 保留props属性等待complete时更新
                newFiber = createFiber(newNode, PatchTag.UPDATE)
                newFiber.children = oldFiber.children
                newFiber.stateNode = oldFiber.stateNode // dom类型的fiber其stateNode为dom实例
                newFiber.alternate = oldFiber
            } else {
                // 如果类型不同，则需要删除对应位置的旧节点，然后插入新的节点
                // todo 添加key判断，如果存在key相同的子节点，只需要移动位置即可
                newFiber = createFiber(newNode, PatchTag.REPLACE)
                newFiber.alternate = oldFiber
            }
        } else {
            // 当前位置不存在旧节点，表示新增
            newFiber = createFiber(newNode, PatchTag.ADD)
        }

        // 调整fiber之间的引用，构建新的fiber树
        newFiber.return = parentFiber
        if (prevFiber) {
            prevFiber.sibling = newFiber
        } else {
            parentFiber.child = newFiber
        }
        prevFiber = newFiber
        newFibers.push(newFiber)
    }

    parentFiber.children = newFibers // 保存更新后的children，用作下次diff使用

    // 移除剩余未被比较的旧节点
    for (; i < oldChildren.length; ++i) {
        let oldFiber = oldChildren[i]
        oldFiber.patchTag = PatchTag.DELETE
        enqueueUpdate(parentFiber, oldFiber) // 由于被删除的节点不存在fiber树中，因此交给父节点托管
    }
}

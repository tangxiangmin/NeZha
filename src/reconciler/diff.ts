/*
    实现 diff
    参考：https://zhuanlan.zhihu.com/p/20346379
 */


import {VNode} from "../virtualDOM/h";
import {Fiber, createFiber, enqueueUpdate} from "./fiber";

export enum PatchTag {
    NONE,
    DELETE,
    UPDATE,
    MOVE,
    ADD
}

function isSameVnode(a: VNode, b: Fiber) {
    // 组件元素类型相同、dom元素名称相同，则可以复用
    // todo 处理文本节点
    return a.type === b.vnode.type
}

// 比较新旧fiber的子节点，并将可用的fiber节点转换为fiber
export function diff(parentFiber: Fiber, oldChildren: Array<Fiber>, newChildren: Array<VNode>) {
    let reused: any = {}
    for (let i in oldChildren) {
        let newNode = newChildren[i]
        let oldFiber = oldChildren[i]
        if (newNode && isSameVnode(newNode, oldFiber)) {
            reused[i] = oldFiber
        } else {
            // 标记需要删除的节点
            oldFiber.patchTag = PatchTag.DELETE
            enqueueUpdate(parentFiber, oldFiber) // 旧fiber的删除任务需要委托父节点执行

        }
    }

    let prevFiber = null
    for (let i in newChildren) {
        // todo 添加key判断
        let newNode = newChildren[i]
        let oldFiber = reused[i]
        let newFiber
        if (oldFiber) {
            // 如果存在旧节点，则可以直接复用对应的dom实例
            oldFiber.patchTag = PatchTag.UPDATE
            newFiber = oldFiber
        } else {
            newFiber = createFiber(newNode, PatchTag.ADD)
        }

        // 调整fiber之间的引用
        newFiber.return = parentFiber
        if (prevFiber) {
            prevFiber.sibling = newFiber
        } else {
            parentFiber.child = newFiber
        }
        prevFiber = newFiber
    }
}

import {VNode} from "../virtualDOM/h";
import {PatchTag} from "./diff";
import {isFunc, isStr} from "../util";

export enum FiberTag {HostRoot, HostComponent, FunctionComponent}


export interface Fiber {
    updateQueue?: Array<Fiber>

    return?: Fiber,
    sibling?: Fiber,
    child?: Fiber,

    vnode: VNode,
    tag: FiberTag,

    patchTag: PatchTag, // 当前fiber对应的改动
    stateNode?: any, // dom实例或class组件实例
}

export function createFiberRoot(vnode: VNode, el: any): Fiber {
    // fiber链表头节点
    let root: Fiber = {
        tag: FiberTag.HostRoot,
        vnode: vnode,
        stateNode: el,
        updateQueue: [],
        patchTag: PatchTag.NONE
    }
    return root
}

export function createFiber(vnode: VNode, patchTag: PatchTag): Fiber {
    let fiber: Fiber = {
        vnode,
        patchTag,
        return: null,
        sibling: null,
        child: null,
        tag: null
    }

    // 初始化fiber的节点类型
    const {type} = vnode
    if (isStr(type)) {
        fiber.tag = FiberTag.HostComponent
    } else if (isFunc(type)) {
        fiber.tag = FiberTag.FunctionComponent
    }
    return fiber
}


export function getFiberChildren(fiber: Fiber) {
    let child: Fiber = fiber.child
    let children: Array<Fiber> = []
    while (child) {
        children.push(child)
        child = child.sibling
    }
    return children
}

export function enqueueUpdate(fiber: Fiber, update: Fiber): void {
    if (!fiber.updateQueue) {
        fiber.updateQueue = []
    }

    fiber.updateQueue.push(update)
}

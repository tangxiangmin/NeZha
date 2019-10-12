import {Fiber, FiberTag} from "./fiber";
import {PatchTag} from "./diff";
import {createElement, insertDOM, removeDOM, replaceDOM, updateElement} from "../render/renderDOM";

// 开始依次提交变更，根据patchTag执行对应逻辑
export default function commitWork(currentWorkRoot: Fiber) {
    let updateQueue = currentWorkRoot.updateQueue
    // console.log(updateQueue)

    updateQueue.forEach((fiber: Fiber) => beforeCommit(fiber))

    updateQueue.forEach((fiber: Fiber) => commit(fiber))
    
    

    currentWorkRoot.updateQueue = []
}

// 阶段一
function beforeCommit(fiber: Fiber) {
    if (fiber.tag === FiberTag.HostComponent) {
        const {patchTag} = fiber
        switch (patchTag) {
            case PatchTag.MOVE:
                beforeMoveNode(fiber)
                break
        }
    }
}

// 阶段二
function commit(fiber: Fiber) {
    let parentFiber = fiber.return
    if (!parentFiber) {
        return
    }

    // 只需要提交DOM节点的更新
    // todo 可以在此处为类组件增加生命周期函数componentDitMounted、componentDidUpdate、componentWillUnmount
    if (fiber.tag === FiberTag.HostComponent) {
        const {patchTag} = fiber
        switch (patchTag) {
            case PatchTag.ADD:
                insertNode(fiber)
                break
            case PatchTag.UPDATE:
                updateNode(fiber)
                break
            case PatchTag.DELETE:
                removeNode(fiber)
                break
            case PatchTag.MOVE:
                moveNode(fiber)
                updateNode(fiber)
                break
            case PatchTag.REPLACE:
                replaceNode(fiber)
            default:
        }
    }
}

// todo 下面方法应该为跨平台的
function removeNode(fiber) {
    let parent = findParentHostComponent(fiber)
    let container = parent.stateNode

    removeDOM(container, fiber.stateNode)
    fiber.return = null
}

function updateNode(fiber) {
    let alternate = fiber.alternate
    updateElement(fiber.stateNode, alternate.vnode.props, fiber.vnode.props)
}

function insertNode(fiber) {
    let parent = findParentHostComponent(fiber)
    let container = parent.stateNode

    createStateNode(fiber)

    let index = fiber.index

    insertDOM(container, fiber.stateNode, index)
}

function replaceNode(fiber) {
    let parent = findParentHostComponent(fiber)
    let container = parent.stateNode

    createStateNode(fiber)

    replaceDOM(container, fiber.stateNode, fiber.alternate.stateNode)
}

// 交换两个节点的位置
// 具体步骤为：先删除待move的节点，然后将其按顺序放在指定位置
function beforeMoveNode(fiber) {
    let parent = findParentHostComponent(fiber)
    let container = parent.stateNode
    removeDOM(container, fiber.stateNode)
}

function moveNode(fiber) {
    let parent = findParentHostComponent(fiber)
    let container = parent.stateNode

    let index = fiber.index // 现在fiber在父节点中的索引
    insertDOM(container, fiber.stateNode, index)
}

// 向上找到最新的DOM节点类型的父节点
function findParentHostComponent(fiber): Fiber {
    let parent = fiber.return
    while (![FiberTag.HostComponent, FiberTag.HostRoot].includes(parent.tag)) {
        parent = parent.return
    }
    return parent
}

// 初始化节点
function createStateNode(fiber): void {
    if (fiber.tag === FiberTag.HostComponent && !fiber.stateNode) {
        fiber.stateNode = createElement(fiber)
    }
}

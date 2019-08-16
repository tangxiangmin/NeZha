import {Fiber, FiberTag} from "./fiber";
import {PatchTag} from "./diff";
import {createElement, updateElement} from "../render/renderDOM";

export default function commitWork(currentWorkRoot: Fiber) {
    let updateQueue = currentWorkRoot.updateQueue
    updateQueue.forEach((fiber: Fiber) => commit(fiber))
}

// 提交单个fiber，根据patchTag执行对应逻辑，然后调用
// pendingCommit的顺序为后续遍历，因此叶子节点最先执行
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
                break
            case PatchTag.REPLACE:
                replaceNode(fiber)
            default:
        }
    }
}

// todo 将下面方法修改为跨平台的
function removeNode(fiber) {
    let parent = findParentHostComponent(fiber)
    let container = parent.stateNode

    container.removeChild(fiber.stateNode)
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

    container.appendChild(fiber.stateNode)
}

function replaceNode(fiber) {
    let current = fiber.alternate
    let sibling = current.stateNode

    let parent = findParentHostComponent(fiber)
    let container = parent.stateNode

    createStateNode(fiber)

    container.insertBefore(fiber.stateNode, sibling)
    container.removeChild(sibling)
}

// todo 根据key实现移动node
function moveNode(fiber) {
    console.log('todo moveNode')
}

// 向上找到最新的DOM节点类型的父节点
function findParentHostComponent(fiber): Fiber {
    let parent = fiber.return
    while (![FiberTag.HostComponent, FiberTag.HostRoot].includes(parent.tag)) {
        parent = parent.return
    }
    return parent
}

function createStateNode(fiber): void {
    if (fiber.tag === FiberTag.HostComponent && !fiber.stateNode) {
        fiber.stateNode = createElement(fiber)
    }
}

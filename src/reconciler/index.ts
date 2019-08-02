import {Fiber, FiberTag, getFiberChildren} from "./fiber";
import {VNode} from "../virtualDOM/h";
import {diff, PatchTag} from "./diff";
import {createElement} from "../render/renderDOM";

let workInProgress: Fiber = null // 记录当前正在运行的fiber
let pendingCommit: Array<Fiber> = [] // 记录需要提交更新的节点

// 从某个需要更新的fiber开始比较子节点
// 初始化时从FiberRoot开始
// todo 计算节点的可使用工作时间
export function scheduleWork(fiber: Fiber) {
    fiber.patchTag = PatchTag.UPDATE

    workLoop(fiber)
}

function workLoop(fiber: Fiber) {
    const updateQueue = fiber.updateQueue
    // 检测更新队列是否待更新的节点
    if (updateQueue.length || fiber.patchTag !== PatchTag.NONE) {
        if (!workInProgress) {
            workInProgress = fiber
        } else {
            // todo 处理有未完成的nextWork的情况
            console.log(`当前有更新任务正在运行:`, {workInProgress})
            return
        }
    } else {
        console.log(`当前fiber无更新任务，退出:`, {fiber})
        return
    }

    // 某个节点发生变化，则其该节点和其子节点均需要进行diff操作

    while (workInProgress) {
        workInProgress = performUnitWork(workInProgress)
    }

    if (pendingCommit.length) {
        commitWork(pendingCommit)
    }
}

function performUnitWork(fiber: Fiber) {
    // 根据fiber.tag调用对应的diff方法
    switch (fiber.tag) {
        case FiberTag.HostRoot:
            updateHost(fiber)
            break
        case FiberTag.FunctionComponent:
            updateFunctionComponent(fiber)
            break
        case FiberTag.HostComponent:
            updateHostComponent(fiber)
            break
        default:
            console.log(`无tag为${fiber.tag}的处理方法`, fiber)
    }

    // 开始遍历子节点
    if (fiber.child) {
        return fiber.child
    }

    while (fiber) {
        // 从叶子节点开始完成工作
        completeWork(fiber)
        // 然后遍历兄弟节点和父节点
        if (fiber.sibling) {
            return fiber.sibling
        }

        fiber = fiber.return
    }


    return null // 遍历fiber完毕，则退出workLoop循环

    // 处理根节点
    function updateHost(fiber: Fiber) {
        const {vnode} = fiber
        reconcileChildren(fiber, [vnode])
    }

    // 处理函数组件
    function updateFunctionComponent(fiber: Fiber) {
        const {vnode} = fiber
        const component = vnode.type
        // @ts-ignore
        let children = component(vnode.props)

        if (!Array.isArray(children)) {
            children = [children]
        }
        reconcileChildren(fiber, children)
    }

    // 处理dom节点
    function updateHostComponent(fiber: Fiber) {
        const {vnode} = fiber
        const {children} = vnode.props
        reconcileChildren(fiber, children)
    }
}

function reconcileChildren(parentFiber: Fiber, newChildren: Array<VNode>) {
    const oldChildren = getFiberChildren(parentFiber)
    diff(parentFiber, oldChildren, newChildren)
}

// 保存需要开始处理的Fiber节点
function completeWork(fiber: Fiber) {
    // 初始化当前fiber的dom实例
    // todo 应该在最后统一实例化，避免中途某些不必要实例化导致的性能浪费
    if (fiber.tag === FiberTag.HostComponent) {
        let instance = createElement(fiber)
        fiber.stateNode = instance
    }

    // 将需要patch的fiber，和updateQueue不为空的fiber记录到pendingCommit，准备后续提交
    if (fiber.patchTag !== PatchTag.NONE) {
        pendingCommit.push(fiber)
    }
    if (fiber.updateQueue && fiber.updateQueue.length) {
        pendingCommit = pendingCommit.concat(...fiber.updateQueue)
        fiber.updateQueue = [] // 清空updateQueue
    }
}

function commitWork(commitList: Array<Fiber>) {
    // 提交单个fiber，根据patchTag执行对应逻辑，然后调用
    // pendingCommit的顺序为后续遍历，因此叶子节点最先执行
    function commit(fiber: Fiber) {
        let parentFiber = fiber.return
        if (!parentFiber) {
            return
        }

        if (parentFiber.tag === FiberTag.FunctionComponent) {
            parentFiber = fiber.return.return
        }
        const container = parentFiber.stateNode

        if (fiber.tag === FiberTag.HostComponent) {
            const {patchTag} = fiber
            switch (patchTag) {
                case PatchTag.ADD:
                    container.appendChild(fiber.stateNode)
                    break
                case PatchTag.UPDATE:
                    // updateElement()
                    break
                case PatchTag.DELETE:
                    break
                case PatchTag.MOVE:
                    break
                default:
            }
        } else {
            console.log('// todo 处理其他类型fiber的更新', {fiber})
        }
    }

    commitList.forEach((fiber: Fiber) => {
        commit(fiber)
    })

    // 一次性提交完毕，清空状态
    pendingCommit = []
}


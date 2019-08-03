import {Fiber, FiberTag, getFiberChildren} from "./fiber";
import {VNode} from "../virtualDOM/h";
import {diff, PatchTag} from "./diff";
import {createElement, updateElement} from "../render/renderDOM";
import {ClassComponentConfig} from "../virtualDOM/component";
import {flattenArray} from "../util";

let workInProgress: Fiber = null // 记录当前正在运行的fiber
let pendingCommit: Array<Fiber> = [] // 记录需要提交更新的节点
let currentWorkRoot: Fiber = null

const deffer = typeof Promise === 'function' ? cb => Promise.resolve().then(cb) : setTimeout
// 从某个需要更新的fiber开始比较子节点
// 初始化时从FiberRoot开始
// todo 计算节点的可使用工作时间
export function scheduleWork(fiber: Fiber) {
    fiber.patchTag = PatchTag.UPDATE
    workInProgress = fiber
    currentWorkRoot = fiber

    // 放入延迟队列执行
    deffer(workLoop)
}

function workLoop() {
    // 检测更新队列是否待更新的节点
    if (!workInProgress) {
        console.log(`当前fiber无更新任务，退出:`, {workInProgress})
        return
    }

    // 某个节点发生变化，则其该节点和其子节点均需要进行diff操作
    // 整个工作流程为：首先从根节点向下更新fiber树，然后从叶子节点向上complete准备提交
    while (workInProgress) {
        workInProgress = performUnitWork(workInProgress)
    }

    if (pendingCommit.length) {
        commitWork(pendingCommit)
    }
}

function performUnitWork(fiber: Fiber) {
    // 根据fiber.tag来调用不同的子节点获取防范，然后diff其子节点，更新下一层的fiber树
    switch (fiber.tag) {
        case FiberTag.HostRoot:
            updateHost(fiber)
            break
        case FiberTag.FunctionComponent:
            updateFunctionComponent(fiber)
            break
        case FiberTag.ClassComponent:
            updateClassComponent(fiber)
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
        // 然后遍历兄弟节点，完成兄弟节点的diff操作
        if (fiber.sibling) {
            return fiber.sibling
        }
        // 完成父节点的工作
        fiber = fiber.return

        if (currentWorkRoot === fiber) {
            return null
        }
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
        console.log(children)
        reconcileChildren(fiber, children)
    }

    // 处理类组件
    function updateClassComponent(fiber: Fiber) {
        const {vnode} = fiber
        const component = vnode.type
        const config: ClassComponentConfig = {
            props: vnode.props
        }

        let instance
        if (!fiber.stateNode) {
            // @ts-ignore
            // 初始化节点
            instance = new component(config)
            fiber.stateNode = instance
            instance.fiber = fiber
        } else if (fiber.patchTag === PatchTag.UPDATE) {
            instance = fiber.stateNode
            // 更新state
            Object.assign(instance.state, fiber.newState)
        }

        let children = instance.render()
        reconcileChildren(fiber, children)
    }

    // 处理dom节点
    function updateHostComponent(fiber: Fiber) {
        const {vnode} = fiber
        const {children} = vnode.props
        reconcileChildren(fiber, children)
    }
}

function reconcileChildren(parentFiber: Fiber, vnodeList: Array<VNode>) {
    if (!Array.isArray(vnodeList)) {
        vnodeList = [vnodeList]
    }
    // bugfix：处理通过props传入children为数组的情况
    vnodeList = flattenArray(vnodeList)
    // 处理vnode为单个数字或者字符串的情形
    let newChildren = vnodeList.map(vnode => {
        if (typeof vnode === 'string' || typeof vnode === 'number') {
            return {
                type: 'text',
                props: {
                    nodeValue: vnode,
                }
            }
        }
        return vnode
    })

    // 更新parentFiber.child
    diff(parentFiber, newChildren)
}

// 保存需要开始处理的Fiber节点
function completeWork(fiber: Fiber) {
    // 初始化当前fiber的dom实例
    // todo 应该在最后统一实例化，避免中途某些不必要实例化导致的性能浪费
    if (fiber.tag === FiberTag.HostComponent && !fiber.stateNode) {
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
    commitList.forEach((fiber: Fiber) => commit(fiber))

    // 一次性提交完毕，清空状态
    pendingCommit = []
    currentWorkRoot = null
}

// 提交单个fiber，根据patchTag执行对应逻辑，然后调用
// pendingCommit的顺序为后续遍历，因此叶子节点最先执行
function commit(fiber: Fiber) {
    let parentFiber = fiber.return
    if (!parentFiber) {
        return
    }

    // todo 这里对于非dom组件的处理太草率了
    if ([FiberTag.FunctionComponent, FiberTag.ClassComponent].includes(parentFiber.tag)) {
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
                updateElement(fiber.stateNode, {}, fiber.vnode.props)
                break
            case PatchTag.DELETE:
                container.removeChild(fiber.stateNode)
                break
            case PatchTag.MOVE:
                console.log('//todo move')
                break
            case PatchTag.REPLACE:
                let sibling = fiber.alternate.stateNode
                container.insertBefore(fiber.stateNode, sibling)
                container.removeChild(sibling)
            default:
        }
    } else {
        // console.log('// todo 处理其他类型fiber的更新', {fiber})
    }
}


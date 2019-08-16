/*
    实现 diff
    参考：https://zhuanlan.zhihu.com/p/20346379
 */


import {VNode} from "../virtualDOM/h";
import {createFiber, enqueueUpdate, Fiber, FiberTag, getFiberChildren} from "./fiber";
import {ClassComponentConfig} from "../virtualDOM/component";
import {flattenArray} from "../util";
import {currentWorkRoot} from "./index";
import {isValidAttr} from "../render/renderDOM";

// 单个DOM节点diff时可能进行的操作
export enum PatchTag {
    NONE = "none",
    DELETE = "delete",
    UPDATE = 'update',
    MOVE = 'move',
    ADD = 'add',
    REPLACE = 'replace'
}

export function performUnitWork(fiber: Fiber) {
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

    return null  // 遍历fiber完毕，则退出workLoop循
}

// 处理新节点，然后进行diff操作
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
    }).filter(item => !!item)

    // 更新parentFiber.child
    diff(parentFiber, newChildren)
}


function isSameVnode(a: VNode, b: Fiber) {
    // 组件元素类型相同、dom元素名称相同，则可以复用
    return a.type === b.vnode.type
}

function isSameParams(oldAttrs: Object, newAttrs: Object) {
    let patch = {};

    // 判断老的属性中和新的属性的关系
    for (let key in oldAttrs) {
        if (isValidAttr(key) && oldAttrs[key] !== newAttrs[key]) {
            patch[key] = newAttrs[key]; // 有可能还是undefined
        }
    }
    for (let key in newAttrs) {
        // 老节点没有新节点的属性
        if (isValidAttr(key) && !oldAttrs.hasOwnProperty(key)) {
            patch[key] = newAttrs[key];
        }
    }
    return Object.keys(patch).length > 0;
}


// 比较新旧fiber的子节点，并将可用的fiber节点转换为fiber
export function diff(parentFiber: Fiber, newChildren: Array<VNode>) {
    let current = parentFiber.alternate

    const oldChildren = current ? getFiberChildren(current) : [];
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
            // todo 添加key判断，如果存在key相同的子节点，只需要移动位置即可
            if (isSameVnode(newNode, oldFiber)) {
                // 如果存在相同类型的旧节点，则可以直接复用对应的dom实例，即newFiber.stateNode

                // 判断属性是否发生变化，如果未变化在不需要更新
                let needUpdate = isSameParams(newNode.props, oldFiber.vnode.props)

                newFiber = createFiber(newNode, needUpdate ? PatchTag.UPDATE : PatchTag.NONE)
                newFiber.children = oldFiber.children
                newFiber.stateNode = oldFiber.stateNode // 复用实例
            } else {
                // 如果类型不同，则需要删除对应位置的旧节点，然后插入新的节点
                newFiber = createFiber(newNode, PatchTag.REPLACE)
            }
            newFiber.alternate = oldFiber
        } else {
            // 当前位置不存在旧节点，表示新增
            newFiber = createFiber(newNode, PatchTag.ADD)
            newFiber.alternate = newFiber
        }

        // 调整fiber之间的引用，构建新的fiber树
        newFiber.return = parentFiber
        if (prevFiber) {
            prevFiber.sibling = newFiber
        } else {
            parentFiber.child = newFiber
        }
        prevFiber = newFiber
    }

    // 移除剩余未被比较的旧节点
    for (; i < oldChildren.length; ++i) {
        let oldFiber = oldChildren[i]
        oldFiber.patchTag = PatchTag.DELETE
        enqueueUpdate(parentFiber, oldFiber) // 由于被删除的节点不存在fiber树中，因此交给父节点托管
    }
}

// 保存需要开始处理的Fiber节点
function completeWork(fiber: Fiber) {
    // 将需要patch的fiber，更新到父节点上
    let parent = fiber.return || fiber
    parent.updateQueue = parent.updateQueue.concat(
        fiber.patchTag !== PatchTag.NONE ? fiber : [],
        ...fiber.updateQueue,
    )
    // 由于已经提交到父节点上，因此重置当前fiber收集的变化
    if (parent !== fiber) {
        fiber.updateQueue = []
    }
}


/* 下面是处理不同组件类型根节点的相关方法 */

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
    reconcileChildren(fiber, children)
}

// 处理类组件
function updateClassComponent(fiber: Fiber) {
    const {vnode} = fiber
    const component = vnode.type
    const config: ClassComponentConfig = {
        props: vnode.props
    }

    // todo 可以再此处增加生命周期函数getDerivedStateFromProps 和  shouldComponentUpdate
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

import {bindFiber, isComponent, isClassComponent, VNode} from "./fiber";
import {cancelWork, shouldYield, scheduleWork} from './schedule'

// 定义几种patch类型
export enum PatchType {
    REMOVE, INSERT, UPDATE, MOVE
}

export const {REMOVE, INSERT, UPDATE, MOVE} = PatchType;

export interface Patch {
    type: PatchType,
    oldNode?: VNode,
    newNode?: VNode,
    attrs?: Object
}

// 循环diff与递归diff最大的区别在于：循环diff的过程可以在某些时刻中断，并在空闲的时候决定继续或者从头调用节点
// 同步循环执行diff流程
function diffSync(oldFiber: VNode, newFiber: VNode) {
    newFiber.oldFiber = oldFiber
    let cursor: VNode = newFiber // 当前正在进行diff操作的节点
    let patches: Array<Patch> = []
    while (cursor) {
        cursor = performUnitWork(cursor, patches)
    }
    return patches
}

let currentRoot: VNode // 保存当前diff过程新的根节点，判断是否需要重置diff流程
// 现在diff过程变成了异步的流程，因此只能在回调函数中等待
function diff(oldFiber: VNode, newFiber: VNode, cb?: Function) {
    // 表示前一个diff任务尚未结束，但又调用了新的diff
    // todo ，此处不能单纯地放弃旧任务，而应该合并旧任务与新任务的变化
    if (currentRoot) {
        cancelWork()
    }
    currentRoot = newFiber // 记录

    newFiber.oldFiber = oldFiber
    // 当前正在进行diff操作的节点，workLoop通过闭包维持了对该节点的引用，因此下次diff可以直接从上一次的暂停点继续执行
    let cursor = newFiber
    let patches = []
    // workLoop可以理解每个切片需要执行的diff任务
    const workLoop = () => {
        while (cursor) {
            // shouldYield在每diff完一个节点之后都会调用该方法，用于判断是否需要暂时中断diff过程
            if (shouldYield()) {
                // workLoop返回true表示当前diff流程还未执行完毕
                return true
            } else {
                cursor = performUnitWork(cursor, patches)
            }
        }
        // diff流程执行完毕，我们可以使用收集到的patches了
        cb && cb(patches)
        currentRoot = null // 重置
        return false
    }
    // 将diff流程进行切片，现在只能异步等待patches收集完毕了
    scheduleWork(workLoop)
}

// 单个节点的diff工作
function performUnitWork(fiber, patches) {
    let oldFiber = fiber.oldFiber
    let oldChildren = oldFiber && oldFiber.children || []

    appendContext(fiber)
    // 任务一：对比当前新旧节点，收集变化
    diffFiber(oldFiber, fiber, patches)
    // 任务二：为新节点中children的每个元素找到需要对比的旧节点，设置oldFiber属性，方便下个循环继续执行performUnitWork
    diffChildren(oldChildren, fiber.children, patches)

    // 将游标移动至新vnode树中的下一个节点，以
    // (div, {}, [
    //     (h1, {}, [text]),
    //     (ul, {}, [
    //         li1, li2,li3
    //     ])]
    // ]) 为例，整个应用的的遍历流程是
    // div -> h1 ->  h1(text) -> h1 -> ul ->li1 -> li2 -> li3 -> ul -> div

    // 上面的diffFiber就是遍历当前节点

    // 有子节点继续遍历子节点
    if (fiber.$child) return fiber.$child

    while (fiber) {
        // 无子节点但是有兄弟节点，继续遍历兄弟节点
        if (fiber.$sibling) return fiber.$sibling
        // 子节点和兄弟节点都遍历完毕，返回父节点，开始遍历父节点的兄弟节点，重复该过程
        fiber = fiber.$parent;
    }

    return null
}


// 组件节点的子节点是在diff过程中动态生成的
function renderComponentChildren(node: VNode) {
    let instance = node.$instance

    // 将组件节点的props传递给组件实例
    instance.props = {
        ...node.props,
        children: node.children // 将组件节点原本的children节点也传递给组件实例
    }

    // 我们约定render函数返回的是单个节点
    let child = instance.render()
    bindChildren(node, child)
}

// 渲染函数组件的节点，函数组件在不包含state，当props修改时，都将重新调用并生成新的子节点
function renderFunctionComponentChildren(node: VNode) {
    let component = <Function>node.type

    let child = component(node.props)
    bindChildren(node, child)
}

function bindChildren(node, child) {
    // 为render函数中的节点更新fiber相关的属性
    node.children = bindFiber(node, [child])
    // 保存父节点的索引值，插入真实DOM节点
    child.index = node.index
}

// 我们保证比较的节点的type实现相同的
function diffFiber(oldNode: VNode, newNode: VNode, patches: Patch[]) {
    // todo 下面区分元素节点、函数组件节点和类组件节点的条件分支有点多，需要优化一下
    if (!oldNode) {
        // 当前节点与其子节点都将插入
        if (isClassComponent(newNode.type)) {
            // 类组件
            let component = newNode.type
            // @ts-ignore
            let instance = new component(newNode.props)

            instance.$vnode = newNode // 组件实例保存节点
            newNode.$instance = instance // 节点保存组件实例
            renderComponentChildren(newNode)
        } else if (isComponent(newNode.type)) {
            // 函数组件
            renderFunctionComponentChildren(newNode)
        }
        patches.push({type: INSERT, newNode})
    } else {
        let attrs = diffAttr(oldNode.props, newNode.props) // diff props
        let isPropsChange = Object.keys(attrs).length > 0 // 判断props是否发生了变化

        // 更新时
        if (isClassComponent(newNode.type)) {
            // 组件节点需要判断状态是否发生了变化，如果已变化，则需要对比新旧组件子节点
            let instance = oldNode.$instance
            // 更新时，复用组件实例
            newNode.$instance = oldNode.$instance // 复用组件实例
            let nextState = instance.nextState
            // 判断组件是否需要更新
            let shouldUpdate: boolean = instance.shouldComponentUpdate ? instance.shouldComponentUpdate() : true

            if ((nextState && shouldUpdate) || isPropsChange || instance._isForce) {
                if (nextState) {
                    instance.state = nextState // 在此处更新组件的state
                    instance.nextState = null
                }
                renderComponentChildren(newNode)
            } else {
                // 未进行任何修改，则直接使用之前的子节点
                newNode.children = oldNode.children
            }
        } else if (isComponent(newNode.type)) {
            // 函数组件更新
            if (isPropsChange) {
                renderFunctionComponentChildren(newNode)
            } else {
                newNode.children = oldNode.children
            }
        } else {
            // 如果存在有变化的属性，则使用新节点的属性更新旧节点
            if (isPropsChange) {
                patches.push({type: UPDATE, oldNode, newNode, attrs})
            }

            // 节点需要移动位置
            if (oldNode.index !== newNode.index) {
                patches.push({type: MOVE, oldNode, newNode})
            }
        }
        newNode.$el = oldNode.$el // 直接复用旧节点
    }
}

function diffAttr(oldAttrs: Object, newAttrs: Object) {
    let attrs = {};
    // 判断老的属性中和新的属性的关系
    for (let key in oldAttrs) {
        if (oldAttrs[key] !== newAttrs[key]) {
            attrs[key] = newAttrs[key]; // 有可能还是undefined
        }
    }
    for (let key in newAttrs) {
        // 老节点没有新节点的属性
        if (!oldAttrs.hasOwnProperty(key)) {
            attrs[key] = newAttrs[key];
        }
    }
    return attrs;
}

// 根据type和key来进行判断，避免同类型元素顺序变化导致的不必要更新
function diffChildren(oldChildren: Array<VNode>, newChildren: Array<VNode>, patches: Array<Patch>) {
    newChildren = newChildren.slice() // 复制一份children，避免影响父节点的children属性
    // 找到新节点列表中带key的节点
    let keyMap = {}
    newChildren.forEach((child: VNode, index: number) => {
        let {key} = child
        // 只有携带key属性的会参与同key节点的比较
        if (key !== undefined) {
            if (keyMap[key]) {
                console.warn(`请保证${key}的唯一`, child)
            } else {
                keyMap[key] = {
                    vnode: child,
                    index
                }
            }
        }
    })

    // 在遍历旧列表时，先比较类型与key均相同的节点，如果新节点中不存在key相同的节点，才会将旧节点保存起来
    // 我们在执行组件时扩展了type，因此这里需要使用Map来保存type，而不能直接使用{}简单字面量
    let typeMap: Map<string | Function, VNode[]> = new Map()
    oldChildren.forEach(child => {
        let {type, key} = child
        // 先比较类型与key均相同的节点
        // @ts-ignore
        let {vnode, index} = (keyMap[key] || {})
        if (vnode && vnode.type === type) {
            newChildren[index] = null // 该节点已被比较，需要弹出
            delete keyMap[key]
            vnode.oldFiber = child
        } else {
            // 将剩余的节点保存起来，与剩余的新节点进行比较
            if (!typeMap.has(type)) typeMap.set(type, <Array<VNode>>[])
            typeMap.get(type).push(child)
        }
    })

    // 此时key相同的节点已被比较
    for (let i = 0; i < newChildren.length; ++i) {
        let cur: VNode = newChildren[i]
        if (!cur) continue; // 已在在前面与此时key相同的节点进行比较

        let arr = typeMap.has(cur.type) && typeMap.get(cur.type) || []
        if (arr.length) {
            cur.oldFiber = arr.shift()
        } else {
            cur.oldFiber = null
        }
    }

    // 剩余未被使用的旧节点，将其移除
    typeMap.forEach((arr, type) => {
        arr.forEach((old: VNode) => {
            patches.push({type: REMOVE, oldNode: old,})
        })
    })
}


// 一种处理Context数据透传的方式，采取的策略为：如果为某个组件注册了名为context的prop，则其所有组件子节点都可以访问到该context
// 这里并没有采取深拷贝，根据约定，我们不应该修改context上的任何属性
function appendContext(child: VNode) {
    if (!isComponent(child.type)) return

    let parent = child.$parent
    while (parent && !isComponent(parent.type)) {
        parent = parent.$parent
    }

    if (parent && parent.props && parent.props.context) {
        child.props.context = Object.assign(child.props.context || {}, parent.props.context)
    }
}

export {
    diff,
    diffSync,
}

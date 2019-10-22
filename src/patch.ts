import {REMOVE, INSERT, UPDATE, MOVE, Patch} from './diff'
import {isTextNode, VNode} from './fiber'


// interface PatchFunc {
//     (oldNode: VNode, newNode: VNode, attrs: Object): void;
// }

// =====patch过程，更新视图==== //
function doPatch(patches: Patch[]) {
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
            removeDOM(oldNode)
        },
        [UPDATE](oldNode: VNode, newNode: VNode, attrs: Object) {
            // 只需要更更新diff阶段收集到的需要变化的属性
            setAttributes(newNode, attrs)
            // 将newNode移动到新的位置，问题在于前面的节点移动后，会影响后面节点的顺序
        },
        [INSERT](oldNode: VNode, newNode: VNode) {
            // 新插入的节点上添加属性
            setAttributes(newNode, newNode.props)
            insertDOM(newNode)
        },
    }

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

    // TODO 这一步是可以优化的，避免不必要的move操作，尽管当前操作已经比较直观
    // 对于需要MOVE元素，我们先找到对应的父节点，然后移动该父节点下的所有子节点
    let sortPatches = patches
        .filter(patch => patch.type === MOVE)
    let parentMap = new Set()
    sortPatches.forEach(patch => {
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

// 创建节点
function createDOM(node) {
    let type = node.type
    return isComponent(type) ?
        createComponent(node) :
        isTextNode(type) ?
            document.createTextNode(node.props.nodeValue) :
            document.createElement(type)
}

function findLatestParentDOM(node: VNode) {
    let parent = node.$parent
    // 从父节点向上找到第一个DOM父节点
    while (parent && isComponent(parent.type)) {
        parent = parent.$parent
    }
    return parent
}

function findLatestChildDOM(node: VNode) {
    let child = node
    while (isComponent(child.type)) {
        child = child.$child
    }
    return child
}

// 将节点插入父节点，如果节点存在父节点中，则调用insertBefore执行的是移动操作而不是复制操作，因此也可以用来进行MOVE操作
function insertDOM(newNode: VNode) {
    let parent = findLatestParentDOM(newNode)
    let parentDOM = parent && parent.$el
    if (!parentDOM) return

    let child = findLatestChildDOM(newNode)

    let el = child && child.$el
    let after = parentDOM.children[newNode.index]
    after ? parentDOM.insertBefore(el, after) : parentDOM.appendChild(el)
}

// 移除DOM节点
function removeDOM(oldNode: VNode) {
    let parent = findLatestParentDOM(oldNode)
    let child = findLatestChildDOM(oldNode)
    parent.$el.removeChild(child.$el)
}

// 设置DOM节点属性
function setAttributes(vnode: VNode, attrs) {
    if (isComponent(vnode.type)) {

    } else if (isTextNode(vnode.type)) {
        // @ts-ignore
        vnode.$el.nodeValue = vnode.props.nodeValue
    } else {
        let el = vnode.$el
        attrs && Object.keys(attrs).forEach(key => {
            setAttribute(el, key, attrs[key])
        });
    }
}

// 向dom元素增加属性
function setAttribute(el, prop, val) {
    // 处理事件
    let isEvent = prop.indexOf('on') === 0
    if (isEvent) {
        let eventName = prop.slice(2).toLowerCase()
        el.addEventListener(eventName, val)
    } else {
        el.setAttribute(prop, val)
    }
}

// ===支持Component=== //

// 根据type判断是是否为自定义组件
function isComponent(type) {
    return typeof type === 'function'
}

// 创建组件的DOM节点，在最后的策略中，决定让组件节点不携带任何DOM实例，及vnode.$el = null
// 组件节点插入页面的操作交给其向上第一个DOM父级元素节点和向下第一个DOM字节元素节点处理
function createComponent(node) {
    return null
}

export {
    doPatch
}

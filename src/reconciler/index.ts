import {Fiber} from "./fiber";
import {PatchTag, performUnitWork} from "./diff";

import {hasMoreWork, requestHostCallback, shouldYield} from "./scheduler";
import commitWork from "./commit";

let workInProgress: Fiber = null // 记录当前正在运行的fiber
export let currentWorkRoot: Fiber = null

// 从根节点开始更新fiber树
// todo 计算节点的可使用工作时间
// todo 在当前更新未结束之前，如果又调用了scheduleWork，需要先将其放入队列
export function scheduleWork(fiber: Fiber) {
    fiber.patchTag = PatchTag.UPDATE
    workInProgress = fiber
    currentWorkRoot = fiber

    requestHostCallback(workLoop)
}

// 循环构建fiber树
function workLoop(): hasMoreWork {
    // 检测更新队列是否待更新的节点
    if (!workInProgress) {
        return false
    }
    // diff阶段
    // todo 检测之前更新过的节点是否已发生变化，如果是则需要重新从根节点执行workLoop
    // 整个工作流程为：首先从根节点向下更新fiber树，然后从叶子节点向上complete准备提交
    while (workInProgress) {
        if (shouldYield()) {
            return true
        } else {
            workInProgress = performUnitWork(workInProgress)
        }
    }

    // patch阶段
    if (currentWorkRoot.updateQueue.length) {
        commitWork(currentWorkRoot)
        // 一次性提交完毕，清空状态
        currentWorkRoot = null
    }
    return false
}



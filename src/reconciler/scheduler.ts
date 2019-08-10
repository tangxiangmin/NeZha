/**
 * 具体思路，在当前帧结束后暂停任务交给主线程，然后再下一帧继续未完成的任务
 */

let scheduledHostCallback = null
let frameDeadline = null; // 当前帧结束时间

const frameLength = 1000 / 30 // 默认1秒30帧运行

// scheduledHostCallback是否需要继续执行
export type hasMoreWork = boolean

// 在workLoop时会判断当前帧是否已经到期，如果是则会退出循环，将程序交给主线程
export function shouldYield(): boolean {
    return getCurrentTime() >= frameDeadline;
}

// 注册一个调度任务
export function requestHostCallback(cb): void {
    scheduledHostCallback = cb
    let idleTimeoutID;

    // 下一帧继续执行
    requestAnimationFrame(function (rAFTime) {
        // 如果idleTimeoutID任务还未执行，则需要清除
        clearTimeout(idleTimeoutID);
        onAnimationFrame(rAFTime);
    })

    // 在当前idle区域内执行任务
    idleTimeoutID = setTimeout(workOnFrame, 0);
}

function workOnFrame() {
    // 更新deadline，再指定时间切片内执行任务
    frameDeadline = getCurrentTime() + frameLength;
    performWorkUntilDeadline();
}

function onAnimationFrame(rAFTime) {
    // 如果任务已经执行完毕，则不再注册requestAnimationFrame
    if (!scheduledHostCallback) {
        return
    }
    workOnFrame()

    let rAFTimeoutID
    requestAnimationFrame(nextRAFTime => {
        clearTimeout(rAFTimeoutID);
        onAnimationFrame(nextRAFTime);
    });

    // 由于标签页在后台时会暂停requestAnimationFrame，因此使用timeout在暂停时继续执行
    const onTimeout = () => {
        frameDeadline = getCurrentTime() + frameLength / 2;
        performWorkUntilDeadline();
        rAFTimeoutID = setTimeout(onTimeout, frameLength * 3);
    };
    rAFTimeoutID = setTimeout(onTimeout, frameLength * 3);
}

// 在当前帧执行注册的回调函数
function performWorkUntilDeadline() {
    if (scheduledHostCallback) {
        const hasMoreWork = scheduledHostCallback();
        // 如果已经执行完毕，则清空
        if (!hasMoreWork) {
            scheduledHostCallback = null;
        }
    }
}

function getCurrentTime() {
    return Date.now()
}

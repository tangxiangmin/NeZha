import {diff, diffSync} from "./diff";
import {doPatch} from "./patch";
import {getAppRoot} from './renderDOM'


// 从根节点开始进行diff，当遇见Component时，需要使用新的props和props更新节点
function diffRoot(cb) {
    let appRoot = getAppRoot()
    diff(appRoot, appRoot, (patches) => {
        doPatch(patches)
        cb && cb()
    })
}


export {
    diffRoot,
}

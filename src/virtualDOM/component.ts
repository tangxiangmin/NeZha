/**
 * 2019-08-02 14:18
 */
import {Props} from "./h";
import {Fiber} from "../reconciler/fiber";
import {scheduleWork} from "../reconciler";
import {PatchTag} from "../reconciler/diff";


export interface ClassComponentConfig {
    props: Props
}

export default class Component {
    static _isClassComponent = true // 判断是函数组件还是类组件
    fiber: Fiber
    props: Object

    constructor({props}: ClassComponentConfig) {
        this.props = props
    }

    setState(newState: any, cb?: Function) {
        let fiber = this.fiber
        fiber.newState = newState

        fiber.patchTag = PatchTag.UPDATE

        scheduleWork(fiber)
    }

    forceUpdate() {
    }
}

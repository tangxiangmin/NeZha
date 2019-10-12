import {scheduleWork, getWorkInProgress} from "./index";
import {Fiber} from "./fiber";


let count = 0

export function useState(initState) {
    let current: Fiber = getWorkInProgress()
    let key = `_hook_state_${count++}`

    function updateState() {
        scheduleWork(current)
    }

    return [initState, updateState]
}

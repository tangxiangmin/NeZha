
interface Action {
    type: string,
    payload?: any

    [proName: string]: any
}

export interface Store {
    getState: Function,
    dispatch: Function,
    subscribe: Function
}


function createStore(reducer, initState?): Store {
    let state = initState
    let listeners = []

    // 获取初始state，__INIT作为一个保留action type
    dispatch({type: '__INIT'})

    return {
        getState,
        subscribe,
        dispatch
    }

    function getState() {
        return state
    }

    function subscribe(cb: Function) {
        listeners.push(cb)
        let idx = listeners.length - 1

        return function unsubscribe() {
            listeners.splice(idx, 1)
        }
    }

    function dispatch(action: Action) {
        // reducer的作用是返回一个全新的state
        state = reducer(state, action)

        listeners.forEach((cb) => {
            cb()
        })
    }
}

export default createStore

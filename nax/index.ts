/**
 * 一个简化版的redux
 */

interface Action {
    type: string,
    payload?: any

    [proName: string]: any
}

interface Store {
    getState: Function,
    dispatch: Function,
    subscribe: Function
}

function compose(...funcs) {
    if (funcs.length === 0) {
        return arg => arg
    }
    if (funcs.length === 1) {
        return funcs[0]
    }
    return funcs.reduce((a, b) => (...args) => a(b(...args)))
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

// 注册中间件
// 单个中间件格式为 function(next, action, {getState}){}，需要在前一个中间件中手动调用next，才会触发下一个中间件
function useMiddleware(middlewares, api) {
    return (dispatch) => {
        return (action) => {
            let next = dispatch.bind(null, action)
            for (let i = middlewares.length - 1; i >= 0; --i) {
                next = middlewares[i].bind(null, next, action, api) // 每个中间件的格式按照该形式处理
            }
            return next()
        }
    }
}

// let createStoreWithMiddleware = applyMiddleware([f1,f2])(createStore)
// let store = createStoreWithMiddleware(reducer)
// store.dispatch // 此处可以使用增强版的dispatch
function applyMiddleware(middlewares) {
    return (createStore) => {
        return (...args) => {
            let store = createStore(...args)
            let api = {getState: store.getState} // 为每个中间件提供额外的接口
            let dispatch = useMiddleware(middlewares, api)(store.dispatch) // 获取经过中间件修饰的dispatch
            return {
                ...store,
                dispatch
            }
        }
    }
}

export {
    createStore,
    applyMiddleware
}

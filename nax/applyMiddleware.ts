

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


export default applyMiddleware

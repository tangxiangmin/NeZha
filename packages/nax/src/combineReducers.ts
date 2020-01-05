// 在大型项目中，单个reducer必然会变得十分庞大，因此需要一种可以将reducer拆分的方案

// reducers的键名将作为全局state上的某个属性，按照约定reducers每个键值都是一个子reducer函数
function combineReducers(reducers) {
    let reducerKeys = Object.keys(reducers)
    return function (state = {}, action) {
        const nextState = {}
        reducerKeys.forEach(key => {
            const reducer = reducers[key]
            nextState[key] = reducer(state[key], action)
        })
        return nextState
    }
}


export default combineReducers

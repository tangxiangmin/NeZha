import * as Redux from 'redux'

// 在服务端需要保证每个请求返回的都是不同的store
export function createStore(initState = {}) {
    function reducer(state, {type, payload}) {
        state = state || initState // 在服务端的时候，将asyncData方法返回的数据作为initState

        switch (type) {
            case 'STORE_LIST':
                return {
                    ...state,
                    list: payload.list
                }
            default:
                return state
        }
    }

    return Redux.createStore(reducer, initState);
}

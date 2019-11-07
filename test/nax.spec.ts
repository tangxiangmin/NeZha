import {createStore, applyMiddleware} from "../nax";
import {assert} from "chai";


describe('nax', () => {
    let initState = {
        list: [1, 2]
    }

    function reducer(state, action) {
        state = state || initState
        let list = state.list.slice()

        switch (action.type) {
            case 'ADD_ITEM':
                list.push(action.payload)
                return {...state, list}
            case 'DELETE_ITEM':
                list.splice(action.payload, 1)
                return {...state, list}
            default:
                return {...state}
        }
    }

    context('createStore', () => {
        it('init getState should return default state', () => {
            let store = createStore(reducer)

            let {list} = store.getState()
            assert.deepEqual(list, [1, 2])
        })
        it('dispatch should return currentState', () => {
            let store = createStore(reducer)

            store.dispatch({type: 'ADD_ITEM', payload: 3})
            assert.deepEqual(store.getState().list, [1, 2, 3])

            store.dispatch({type: 'DELETE_ITEM', payload: 0})
            assert.deepEqual(store.getState().list, [2, 3])
        })

        it('dispatch should trigger subscribe callback ', () => {
            let store = createStore(reducer)
            let a, b
            store.subscribe(() => a = 2)
            store.subscribe(() => b = 3)
            assert(a === undefined && b === undefined)

            store.dispatch({type: 'ADD_ITEM', payload: 3})
            assert(a === 2 && b === 3)
        })
    })

    context('applyMiddleware', () => {
        function logger({getState, dispatch}) {
            return next => action => {
                console.log("before change", action);
                // 调用 middleware 链中下一个 middleware 的 dispatch。
                let val = next(action);
                console.log("after change", getState(), val);
            };
        }


        it('createStoreWithMiddleware', () => {
            let arr = []
            function m1(next, action, {getState}) {
                arr.push(1)
                next()
                arr.push(2)
            }
            function m2(next, action, {getState}) {
                arr.push(3)
                next()
                arr.push(4)
            }

            let createStoreWithMiddleware = applyMiddleware([m1, m2])(createStore)
            let store = createStoreWithMiddleware(reducer)
            store.dispatch({type: 'ADD_ITEM', payload: 3})
        })
    })
})

/**
 * 一个简化版的redux
 */

import createStore, {Store} from './createStore'
import applyMiddleware from './applyMiddleware'
import connect from "./connect";
import combineReducers from './combineReducers'

export {
    Store,
    createStore,
    applyMiddleware,
    connect,
    combineReducers
}

import {h} from '../src'
import {assert} from "chai";
import {createLocation, parseQuery} from "../router/location";

describe('router', () => {
    context('location', () => {
        it('parseQuery should parse search into query object', () => {
            let input = '/index?a=1&b=2&c=3'
            let res = parseQuery(input)
            assert.deepEqual(res, {a: '1', b: '2', c: '3'})
        })

        it('parseQuery should return empty Object when search is empty', () => {
            assert.deepEqual(parseQuery(""), {})
            assert.deepEqual(parseQuery(null), {})
            assert.deepEqual(parseQuery(undefined), {})
        })

        it('createLocation should return Location Object', () => {
            let i1 = '/index?a=1&b=2&c=3'
            let r1 = createLocation(i1)
            assert.deepEqual(r1, {
                path: '/index',
                query: {a: '1', b: '2', c: '3'},
            })
        })
        it('createLocation should return Location path when search is empty', () => {
            let i2 = '/index'
            let r2 = createLocation(i2)
            assert.deepEqual(r2, {
                path: '/index',
                query: {},
            })
        })
    })
})

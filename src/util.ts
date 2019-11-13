/**
 * 2019-07-31 16:55
 */

export function isStr(a: any): boolean {
    return typeof a === 'string'
}

export function isFunc(a: any): boolean {
    return typeof a === 'function'
}

export function isEventProp(prop: string): boolean {
    return prop.indexOf('on') === 0
}

export function isFilterProp(prop: string): boolean {
    let blackList = ['key', 'children', 'context', 'dangerouslyInnerHTML']
    return blackList.includes(prop)
}

// 组件节点向其子节点透传一些原生的属性
export function isNativeProp(prop: string): boolean {
    let whiteList = ['title', 'class', 'className', 'style']
    return whiteList.includes(prop)
}

export const flattenArray = function (arr: Array<any>) {
    let ans = []
    for (let i = 0; i < arr.length; ++i) {
        if (Array.isArray(arr[i])) {
            ans = ans.concat(flattenArray(arr[i]))
        } else {
            ans.push(arr[i])
        }
    }
    return ans
}

// 实现一个浅比较
export function shallowCompare(a, b): Boolean {
    if (Object.is(a, b)) return true
    const keysA = Object.keys(a)
    const keysB = Object.keys(b)

    if (keysA.length !== keysB.length) return false

    const hasOwn = Object.prototype.hasOwnProperty
    for (let i = 0; i < keysA.length; i++) {
        if (!hasOwn.call(b, keysA[i]) ||
            !Object.is(a[keysA[i]], b[keysA[i]])) {
            return false
        }
    }
    return true
}

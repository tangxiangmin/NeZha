/**
 * 2019-07-31 16:55
 */

export const isStr = function (a: any) {
    return typeof a === 'string'
}
export const isFunc = function (a: any) {
    return typeof a === 'function'
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

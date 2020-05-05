// import * as pathToRegexp from 'path-to-regexp'
const {pathToRegexp} = require("path-to-regexp");


// 将a=1&b=2&c=3形式的search参数解析为{a:1,b:2,c:3}形式的query对象
export function parseQuery(search: string): Object {
    let pattern = new RegExp('([\\w\\d\\_\\-]+)=([^\\s\\&]+)', 'ig')
    let query = {};
    search && search.replace(pattern, (a, b, c) => {
        query[b] = c
        return a
    });
    return query;
}

// 解析链接上/id/:id类型的参数为{id:xxx}
function parseParam(url: string, path: string): Object {
    const keys = []
    const params = {}
    if (path) {
        const regexp = pathToRegexp(path, keys, {endsWith: "?"})
        if (regexp.test(url)) {
            url.replace(regexp, (...args) => {
                let idx = 1
                keys.forEach(key => {
                    params[key.name] = args[idx++]
                })
                return ''
            })
        }
    }

    return params
}

export function createLocation(url: string, path?: string): NeZhaRouter.NeZhaLocation {
    let arr = url.split('?')
    let pathName = arr[0]
    return {
        path: pathName,
        params: parseParam(pathName, path),
        query: parseQuery(arr[1] || '')
    }
}

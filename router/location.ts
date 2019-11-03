// 将url解析成location对象
export interface NeZhaLocation {
    path: string,
    query: Object
}

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

export function createLocation(url: string): NeZhaLocation {
    let arr = url.split('?')
    return {
        path: arr[0],
        query: parseQuery(arr[1] || '')
    }
}

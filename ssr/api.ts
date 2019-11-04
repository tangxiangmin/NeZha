/*
    在此处mock一些数据接口，
    对于服务端而言，需要连接数据库获取数据
    对于浏览器而言，需要通过ajax请求http接口获取数据
 */

function sleep(ms) {
    return new Promise((resolve => {
        setTimeout(resolve, ms)
    }))
}

export const getList = async () => {
    await sleep(1000)
    return [1, 2, 3]
}

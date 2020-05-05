
declare namespace NeZhaRouter {
    interface NeZhaLocation {
        path: string,
        query: Object,
        params?: Object, // 类似/:id/:foo路径上的参数
    }
}

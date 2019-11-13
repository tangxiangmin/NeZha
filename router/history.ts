/**
 * 浏览器中的history相关路由接口
 */
import {routeTo} from "./Router";

// 获取当前的url
export function getCurrentUrl() {
    return location.pathname + location.search
}

// 加载新的url
export function push(url: string) {
    if (url === getCurrentUrl()) return
    history.pushState(null, null, url)
    routeTo(url)
}

// 重定向到新的url
export function redirect(url: string) {
    if (url === getCurrentUrl()) return
    history.replaceState(null, null, url)
    routeTo(url)
}

// 返回上一页
export function back() {
    history.back()
    routeTo(getCurrentUrl())
}

// todo 在SSR中复用浏览器已经渲染的DOM节点
import {renderDOM} from "./index";

function clearContainer(dom) {
    Array.from(dom.children).forEach(child => {
        dom.removeChild(child)
    })
}

function hydrateDOM(root, dom) {
    // todo 递归遍历rootDOM和vnode，将真实DOM一一赋值给vnode
    // 为了验证ssr，暂时将其处理成清空容器，由浏览器重新渲染
    clearContainer(dom)
    renderDOM(root, dom)
}

export {
    hydrateDOM
}

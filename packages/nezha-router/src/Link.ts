// Link组件
import {h} from "@shymean/nezha";

import {push} from './history'

// TODO 临时处理视图更新时，点击穿透导致触发多次linkHandler
let timer
const linkHandler = (e, url) => {
    e.preventDefault()
    clearTimeout(timer)
    timer = setTimeout(() => {
        push(url)
    })
}

const Link = (props: any) => {
    let {href, children = []} = props
    return h('a', {
        ...props,
        onClick: (e) => linkHandler(e, href)
    }, children)
}

export default Link

// Link组件
import {h} from "@shymean/nezha";

import {push} from './history'

const linkHandler = (e, url) => {
    e.preventDefault()
    push(url)
}

const Link = (props: any) => {
    let {href, children = []} = props
    return h('a', {
        href,
        onClick: (e) => linkHandler(e, href)
    }, children)
}

export default Link

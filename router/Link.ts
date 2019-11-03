// Link组件
import {h} from "../src";

import {push} from './history'

const linkHandler = (e, url) => {
    e.preventDefault()
    push(url)
}

const Link = ({href, children}) => {
    return h('a', {
        href,
        onClick: (e) => linkHandler(e, href)
    }, children)
}

export default Link

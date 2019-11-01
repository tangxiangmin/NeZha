/**
 * 2019/11/1 下午9:34
 */

import {h, renderHTML} from '../src/index'
// const {h, renderHTML} = require('../dist/index')

const Test = () => {
    return (<div>Hello test</div>)
}

let node = (<Test/>)
let html = renderHTML(node)
console.log(html)

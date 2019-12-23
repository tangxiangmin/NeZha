/**
 * 2019/11/14 下午9:45
 */
import {h, hydrateDOM} from '../packages/nezha/lib'


app.innerHTML = `<div><h1>title</h1><p>content</p><p>123123</p></div>`


function clickTitle() {
    console.log('click title')
}

const Root = () => {
    let html = `<a href="javascript:;">html</a>`
    return (<div>
        <h1 onClick={clickTitle}>title</h1>
        <p>content</p>
        <p dangerouslyInnerHTML={html}></p>
    </div>)
}

let root = <Root/>
console.time('hydrate')
hydrateDOM(root, app)

console.timeEnd('hydrate')

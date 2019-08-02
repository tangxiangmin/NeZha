/**
 * 2019-07-31 15:01
 */
import {h} from '../src/index.ts'
import {renderDOM} from '../src/index.ts'

const Test = ({msg}) => {
    return (<div className="test">
        <p>inner test</p>
    </div>)
}

let vnode = (<Test msg={"hello"}></Test>)

renderDOM(vnode, document.querySelector("#app"))


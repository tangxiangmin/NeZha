/**
 * 2019/11/4 下午10:58
 * 如果为某个组件注册了名为context的prop，则其所有子节点都可以访问到该context
 */
import {h, Component, renderDOM} from '../src/index.ts'

const Title = ({context}) => {
    console.log(context)
    return (<h1>Hello</h1>)
}

class App extends Component {

    componentDidMount() {
        console.log(123)
    }

    render() {
        let {context} = this.props
        return (
            <div>
                <Title/>
                <p>global a: {context.a}</p>
            </div>
        )
    }
}

let globalContext = {
    a: 100,
    hello: () => {
        console.log('hello from globalContext')
    }
}
let root = <App context={globalContext}/>
console.log(root)
renderDOM(root, document.querySelector("#app"))

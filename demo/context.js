/**
 * 2019/11/4 下午10:58
 * 如果为某个组件注册了名为context的prop，则其所有子节点都可以访问到该context
 */
import {h, Component, renderDOM} from '../src/index.ts'
import * as Nax from "../nax";

import connect from "../nax/connect";

const initState = {
    list: [1, 2, 3]
}

function reducer(state, {type, payload}) {
    state = state || initState

    switch (type) {
        case 'ADD_ITEM':
            let list = state.list.slice()
            list.push(payload)
            return {
                ...state,
                list
            }
        case 'STORE_LIST':
            return {
                ...state,
                list: payload.list
            }
        default:
            return state
    }
}

let store = Nax.createStore(reducer);

const Title = ({context}) => {
    return (<h1>Hello</h1>)
}

const List = ({list, dispatch}) => {
    return (<ul>
        {
            list.map((item) => {
                return <li>{item}</li>
            })
        }
    </ul>)
}

const WrapList = connect((state) => {
    return {
        list: state.list
    }
})(List)

class App extends Component {
    componentDidMount() {
        console.log(123)
        let {store} = this.props.context
        store.subscribe(() => {
            this.forceUpdate()
        })
    }

    appendList = () => {
        let {store} = this.props.context
        store.dispatch({
            type: 'ADD_ITEM',
            payload: Math.random()
        })
        console.log(store.getState())
    }


    render() {
        let {context} = this.props
        return (
            <div>
                <Title/>
                <button onClick={this.appendList}>add item</button>
                <p>global a: {context.a}</p>
                <WrapList/>
            </div>
        )
    }
}

let globalContext = {
    a: 100,
    hello: () => {
        console.log('hello from globalContext')
    },
    store,
}

let root = <App context={globalContext} title="hello"/>
console.log(root)
renderDOM(root, document.querySelector("#app"))

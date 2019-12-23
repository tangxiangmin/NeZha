/**
 * 2019-07-31 15:01
 */
import {h, Component, renderDOM} from '../packages/nezha/lib'

// props和children属性
const Test = ({msg, children}) => {
    // console.log(children)
    return (<div className="test">
        <p>inner test {msg}</p>
        {children}
    </div>)
}

const PropsDemo = () => {

    return (
        <Test msg={"hello"}>
            <p>this is a child</p>
        </Test>
    )
}

// 事件和列表渲染
class ListDemo extends Component {
    state = {
        list: [0, 1, 2, 3, 4, 5]
    }
    addListItem = (e) => {
        let list = this.state.list

        list.push('new item:' + Math.random())
        this.setState({list})
    }

    deleteListItem = () => {
        let list = this.state.list
        list.pop()
        this.setState({list})
    }
    shuffle = () => {
        let list = this.state.list
        console.log(list)
        list = list.sort((a, b) => Math.random() - 0.5)
        console.log(list)
        console.log('=======')
        this.setState({list})
    }
    unshift = () => {
        let list = this.state.list
        list.splice(0, 0, 'new item:' + Math.random())
        this.setState({list})
    }

    render() {
        let list = this.state.list
        return (
            <div>
                <button onClick={this.addListItem}>add Item</button>
                <button onClick={this.deleteListItem}>delete Item</button>
                <button onClick={this.shuffle}>shuffle Item</button>
                <button onClick={this.unshift}>unshift item</button>
                <ul>
                    {
                        list.map(item => (<li key={item}>{item}</li>))
                    }
                </ul>
            </div>

        )
    }
}

class FlagDemo extends Component {
    state = {
        flag: true,
    }

    toggle = (e) => {
        this.setState({
            flag: !this.state.flag
        })
    }

    render() {
        const {flag} = this.state
        const vnode = flag ? ' show Flag' : null

        return (
            <div>
                <button onClick={this.toggle}>
                    {flag ? 'flag is yes' : 'flag is no'}
                </button>

                {vnode}
            </div>
        )
    }
}

class App extends Component {
    render() {
        return (
            <div className="app">
                {/*<FlagDemo/>*/}

                <ListDemo/>
                {/*<PropsDemo/>*/}
            </div>
        )
    }
}

//

let vnode = (<App/>)

renderDOM(vnode, document.querySelector("#app"))


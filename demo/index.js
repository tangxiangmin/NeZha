/**
 * 2019-07-31 15:01
 */
import {h, Component, renderDOM} from '../src/index.ts'

const Test = ({msg, children}) => {
    // console.log(children)
    return (<div className="test">
        <p>inner test {msg}</p>
        {children}
    </div>)
}

class App extends Component {
    state = {
        flag: true,
        list: [1, 2]
    }

    toggle = (e) => {
        this.setState({
            flag: !this.state.flag
        })
    }
    addListItem = (e) => {
        let list = this.state.list

        list.push('new item')
        this.setState({
            list: list
        })
    }

    render() {
        const {flag, list} = this.state
        return (
            <div className="app">
                <button onClick={this.toggle}>
                    {flag ? 'flag is yes' : 'flag is no'}
                </button>

                <button onClick={this.addListItem}>add item</button>

                <ul>
                    {
                        list.map(item => {
                            return (<li>{item}</li>)
                        })
                    }
                </ul>
            </div>
        )
    }
}

//
// let vnode = (<Test msg={"hello"}>
//     <p>this is a child</p>
// </Test>)
let vnode = (<App></App>)

renderDOM(vnode, document.querySelector("#app"))


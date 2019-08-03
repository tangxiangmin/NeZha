/**
 * 2019-07-31 15:01
 */
import {h, Component, renderDOM} from '../src/index.ts'

const Test = ({msg, children}) => {
    console.log(children)
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

    render() {
        const {flag} = this.state
        const {children} = this.props
        return (
            <div className="app">
                <button onClick={this.toggle}>
                    {flag ? 'flag is yes' : 'flag is no'}
                </button>
            </div>
        )
    }
}

let vnode = (<Test msg={"hello"}>
    <p>this is a child</p>
</Test>)
// let vnode = (<App>
//     <p>this is a child</p>
// </App>)

renderDOM(vnode, document.querySelector("#app"))


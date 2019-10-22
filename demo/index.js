/**
 * 2019/10/22 下午1:44
 */
import {createFiber as h} from '../src/fiber'

import {renderDOM, Component} from "../src/component";

class App extends Component {
    state = {
        title: 'hello nezha',
        list: [2, 4, 5, 3, 1]
    }

    changeTitle = () => {
        this.setState({
            title: 'hello change Title'
        })
    }
    shuffle = () => {
        let {list} = this.state
        list.sort((a, b) => Math.random() - 0.5)
        this.setState({
            list: [...list]
            // list: [1, 3, 5, 4, 2]
        }, () => {
        })
    }

    render() {
        let {title, list} = this.state
        let listItem = list.map(item => {
            return (<li key={item}>{item}</li>)
        })

        return (
            <div>
                <h1 onClick={this.changeTitle} title={Math.random()}>{title}</h1>
                <p>sub</p>
                <button onClick={this.shuffle}>forceUpdate</button>
                <p>{list.join(',')}</p>
                <ul>
                    {listItem}
                </ul>

            </div>
        );
    }
}

renderDOM(<App/>, document.querySelector("#app"), () => {
    console.log('app init')
})

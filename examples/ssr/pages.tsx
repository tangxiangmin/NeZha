// TODO 实现初始化时服务端的数据请求，以及数据的埋入与同步
// TODO 实现404页面
import {Component, h} from "../../packages/nezha/lib";
import {getList} from "./api";

const Home = () => {
    return (<div>Hello Home</div>)
}

const About = () => {
    return (<div>Hello About</div>)
}

class List extends Component {

    static async asyncData(store) {
        // 首先获取数据
        let list = await getList()
        // 然后将数据通过store进行托管
        store.dispatch({
            type: 'STORE_LIST',
            payload: {
                list
            }
        })
    }

    constructor(props) {
        super(props);
        // let {store} = this.props.context
        //
        // let {list} = store.getState()
        // this.state = {
        //     list
        // }
        //
        // store.subscribe(function () {
        //     let {list} = store.getState()
        //     this.setState({list})
        // })
    }

    render() {
        // let {list} = this.state
        let list = [1, 2, 3]
        return (<div>
            <h2>list</h2>
            <ul>
                {
                    list.map(item => {
                        return <li key={item}><a class="anchor" href={'#t' + item}>{item}</a></li>
                    })
                }
            </ul>
            {
                ['t1', 't2', 't3'].map(item => {
                    return <div id={item} style="height:1000px;">{item}</div>
                })
            }
        </div>);
    }
}

export {
    Home,
    About,
    List
}

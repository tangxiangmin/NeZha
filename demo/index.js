/**
 * 2019/10/11 下午10:00
 */
import {h, Component, renderDOM} from '../src/index.ts'

import {Router, router, Link, Route} from '../nezha-router/index'

import './index.scss'


const Route1 = ({router}) => {
    return (
        <div>Route page 1</div>
    )
}

const Route2 = () => {
    return (
        <div>Route page 2</div>
    )
}

const routes = [{
    path: '/',
    component: () => {
        return (<div>Index</div>)
    }
}, {
    path: '/route1',
    component: Route1,
}, {
    path: '/route2',
    component: Route2
}]

class App extends Component {
    togglePage1 = (e) => {
        router.push('/route1')
    }
    togglePage2 = (e) => {
        router.redirect('/route2')
    }

    render() {
        let {url} = this.props;
        return (
            <div>
                <nav>
                    <button onClick={this.togglePage1}>push</button>
                    <button onClick={this.togglePage2}>redirect</button>

                    <Link href="/">index</Link>
                    <Link href="/route1">router1</Link>
                    <Link href="/route2">router2</Link>
                </nav>
                <main>
                    <Router routes={routes}/>
                </main>
            </div>
        );
    }
}

renderDOM(<App/>, document.querySelector("#app"))


/**
 * 2019/11/1 下午10:23
 * 整个单页应用的根节点 <App />
 */
import {h} from '../../packages/nezha/lib'

import {Router, Link} from '../../packages/nezha-router/lib'
import routes from './routes'

const App = ({url = '', context}) => {
    return (
        <div>
            <h1>Hello SSR</h1>
            <nav>
                <Link class="nav_item" href="/" ><button>home</button> </Link>
                <Link class="nav_item"  href="/about"><button>about</button> </Link>
                <Link class="nav_item"  href="/list"><button>list</button> </Link>
            </nav>

            <Router routes={routes} url={url}/>
        </div>
    )
}

export default App


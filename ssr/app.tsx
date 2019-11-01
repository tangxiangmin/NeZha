/**
 * 2019/11/1 下午10:23
 * 整个单页应用的根节点 <App />
 */
import {h} from '../src'

import {Router} from '../router'
import routes from './routes'

const App = ({url = ''}) => {
    return (
        <div>
            <h1>Hello SSR</h1>
            <Router routes={routes} url={url}/>
        </div>
    )
}

export default App


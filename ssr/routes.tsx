/**
 * 2019/11/1 下午9:11
 * 一份前后台共用的路由配置，
 */
import {h} from '../src'

// TODO 实现初始化时服务端的数据请求，以及数据的埋入与同步
// TODO 实现404页面
const Home = () => {
    return (<div>Hello Home</div>)
}

const About = () => {
    return (<div>Hello About</div>)
}

const routes = [
    {
        path: '/',
        component: Home
    },
    {
        path: '/about',
        component: About
    },
    {
        component: () => {
            return (<div>404</div>)
        }
    }
]

export default routes

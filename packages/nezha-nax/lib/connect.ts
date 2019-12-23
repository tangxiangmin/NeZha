/**
 * connect是一个避免在处处引用store.getState()和store.subscribe()的方法
 * 通过connect，可以比较方便地为组件注入所需的state和dispatch方法
 * 使用connect之前，需要通过context注入全局的store
 * 使用方式 connect((state)=>{list:state.list})(App)
 */
import {h} from 'nezha'

function connect(mapStateToProps: Function) {
    return (Comp) => {
        return (props) => {
            let {store} = props.context
            let deriveProps = mapStateToProps(store.getState())

            return h(Comp, {
                ...props,
                ...deriveProps,
                dispatch: store.dispatch
            }, props.children)
        }
    }
}

export default connect

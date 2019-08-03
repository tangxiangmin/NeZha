/**
 * 2019-07-31 15:04
 */
export interface Props {
    children?: [],
    nodeValue?: string,
}

export interface VNode {
    type: Function | string
    props: Props,
}

function h(type: Function | string, props: Props, ...children: any) {
    if (!props) {
        props = {}
    }
    props.children = children.map((vnode: any) => {
        // 将jsx编译的为字符串的child也转换成节点形式
        if (typeof vnode === 'string') {
            return {
                type: 'text',
                props: {
                    nodeValue: vnode,
                }
            }
        }
        return vnode
    })

    return {
        type,
        props
    }
}

export default h

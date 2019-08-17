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
    key?: number | string,
}

function h(type: Function | string, props: any, ...children: any): VNode {
    if (!props) {
        props = {}
    }   
    
    props.children = children
    
    return {
        type,
        props,
        key: props.key
    }
}

export default h

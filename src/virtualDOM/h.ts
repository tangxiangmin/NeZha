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

    props.children = children

    return {
        type,
        props
    }
}

export default h

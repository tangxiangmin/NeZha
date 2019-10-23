import {assert} from 'chai'

import {isTextNode} from "../src/fiber";

import {h, Component} from "../src";

describe('createFiber', () => {
    it('check env: should pass 100%', () => {
        assert(1 + 1 == 2)
    })

    context('fiber', () => {

        class App extends Component {
            render() {
                return h('div', {}, ["hello"])
            }
        }

        it('create element node', () => {
            let node = h('div', {})
            assert(node.type === 'div')
        })
        it('create element node', () => {
            let node = h('div', {})
            assert(node.type === 'div')
        })
     
    })

    context('children', () => {

        it('当第三个参数为undefined时，children.length == 0 ', () => {
            let node = h('div', {})
            assert(node.children.length === 0)
        })

        it('当children中元素为字面量时，转换为文本节点', () => {
            let node = h('div', {}, ['hello'])
            let child = node.children[0]
            assert(isTextNode(child.type))
            // @ts-ignore
            assert(child.props.nodeValue == 'hello')
        })
        it('当children中元素的index属性为其在children列表中的索引值', () => {
            let children = ['hello', 'world', '!']
            let node = h('div', {}, children)
            children.forEach((child, index) => {
                assert(node.children[index].index === index)
            })
        })
    })
})

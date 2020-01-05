/**
 * 2019-07-31 15:04
 */

import {createFiber as h} from './fiber'
import {Component} from "./component";
import {renderDOM} from './renderDOM'
import {renderHTML} from "./renderHTML";
import {hydrateDOM} from './hydrateDOM'

export {
    h,
    renderDOM,
    renderHTML,
    Component,
    hydrateDOM
}

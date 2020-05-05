/// <reference path="./router.d.ts" />

import * as router from './history'
import Router, {releaseRouter, getMatchRouteConfig} from './Router'
import {createLocation} from './location'
import Route, {RouteConfig} from './Route'
import Link from './Link'

export {
    // component
    Router,
    Route,
    Link,
    // api
    router,

    releaseRouter,
    getMatchRouteConfig,
    createLocation,
    // interface
    RouteConfig
}

/**
 * 2019/11/1 下午9:11
 * 服务器应用，响应浏览器请求，根据url渲染对应页面组件，然后返回
 */
import {h, renderHTML} from '../src'

const express = require('express')
const app = express();
import App from './app'

app.get("/*", (req, res) => {
    let url = req.url
    if (url === '/favicon.ico') return res.end('')

    let vnode = (<App url={url}/>)
    let html = renderHTML(vnode)

    res.writeHead(200, {"Content-Type": "text/html"});
    res.end(html);
})


const port = 9876
app.listen(port);
console.log(`server listen at ${port}`)

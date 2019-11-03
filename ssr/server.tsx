/**
 * 2019/11/1 下午9:11
 * 服务器应用，响应浏览器请求，根据url渲染对应页面组件，然后返回
 */

const express = require('express')
const path = require('path')
const app = express();

import App from './app'
import {h, renderHTML} from '../src'

app.use(express.static(path.resolve(__dirname, "./dist")));

app.get("/*", (req, res) => {
    let url = req.url
    if (url === '/favicon.ico') return res.end('')

    let vnode = (<App url={url}/>)
    let html = renderHTML(vnode)

    res.writeHead(200, {"Content-Type": "text/html"});
    res.end(getTemplate(html));
})


const port = 9876
app.listen(port);
console.log(`server listen at ${port}`)

// 返回完整的html模板，包括
// * 插入ssr渲染的html片段
// * 嵌入为客户端打包的相关文件
function getTemplate(html) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Document</title>
</head>
<body>
    <div id="root">${html}</div>
    <script src="./main.js"></script>
</body>
</html>`
}

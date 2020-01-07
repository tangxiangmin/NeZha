let typescript = require("rollup-plugin-typescript2")
let resolve= require('rollup-plugin-node-resolve')

let path = require('path')

module.exports = (name, input) => {
    const external = []
    if(name !== 'nezha'){
        external.push('@shymean/nezha')
    }
    return {
        input,
        plugins: [
            resolve({
                // 将自定义选项传递给解析插件
                customResolveOptions: {
                    moduleDirectory: 'node_modules'
                }
            }),
            typescript({
                tsconfigDefaults: {
                    exclude: [path.resolve(__dirname, `../packages/${name}/node_modules`)],
                    include: [path.resolve(__dirname, `../packages/${name}/src`)],
                    compilerOptions: {
                        // "declaration": true
                    }
                }

            })
        ],
        external
    };
}

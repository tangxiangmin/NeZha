let typescript = require("rollup-plugin-typescript2")
let path = require('path')

module.exports = (name, input) => {
    return {
        input,
        plugins: [
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
    };
}

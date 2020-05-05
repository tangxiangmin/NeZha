let createRollupConfig = require('./rollup.config')

let path = require('path')

const rollup = require('rollup');

async function build(inputOptions, outputOptions) {
    const bundle = await rollup.rollup(inputOptions);
    const {code, map} = await bundle.generate(outputOptions);

    await bundle.write(outputOptions);

    // todo 实现watch
    // rollup.watch({
    //     ...inputOptions,
    //     output: [outputOptions],
    //     watch: {
    //         include: 'packages/**/src'
    //     }
    // })
}


async function start() {
    let modules = ['nezha', 'nax', 'nezha-router'].map(key => {
        return {
            name: key,
            input: path.resolve(__dirname, `../packages/${key}/src/index.ts`)
        }
    })

    for (let config of modules) {
        let rollupConfig = createRollupConfig(config.name, config.input)
        await build(rollupConfig, {
            file: path.resolve(__dirname, `../packages/${config.name}/esm/index.js`),
            format: 'es'
        })
        await build(rollupConfig, {
            file: path.resolve(__dirname, `../packages/${config.name}/lib/index.js`),
            format: 'cjs'
        })
    }
}

console.log('===start build===')
start().then(() => {
    console.log('===end build===')
})



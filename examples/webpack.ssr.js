/**
 * 2019/11/3 下午11:16
 */
const path = require('path');

module.exports = {
    entry: './ssr/client.tsx',
    output: {
        path: path.resolve(__dirname, './ssr/dist/'),
        publicPath: '/'
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js', '.jsx']
    },
    module: {
        rules: [
            {
                test: /\.(ts|js)x?$/,
                loader: 'babel-loader',
            },
            {
                test: /\.s?css$/,
                loader: ['style-loader', 'css-loader', 'sass-loader']
            }
        ]
    },
};

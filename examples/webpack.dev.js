const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    context: __dirname,
    entry: './src/index.js',
    output: {
        publicPath: '/'
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js', '.jsx'],
        alias: {
            'nezha': path.resolve(__dirname, '../packages/nezha/esm/index.js'),
            'nezha-router': path.resolve(__dirname, '../packages/nezha-router/esm/index.js'),
            'nezha-nax': path.resolve(__dirname, '../packages/nezha-nax/esm/index.js'),
        }
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
    devtool: 'inline-source-map',
    devServer: {
        historyApiFallback: true
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, "./index.html"),
        })
    ]
};

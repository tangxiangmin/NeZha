const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    context: __dirname,
    entry: './demo/index',
    output: {
        publicPath: '/'
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js']
    },
    module: {
        rules: [
            {
                test: /\.ts|.tsx$/,
                exclude: [
                    path.resolve(__dirname, 'node_modules'),
                ],
                use: () => {
                    return [
                        {
                            loader: ['ts-loader'],
                        },
                    ];
                },
            },
            {
                test: /\.jsx?$/,
                loader: 'babel-loader',
                options: {
                    sourceMap: true,
                    presets: [
                        [require.resolve('@babel/preset-env')],
                        [require.resolve('@babel/preset-react')],
                    ],
                    plugins: [
                        [require.resolve('@babel/plugin-transform-react-jsx'), {
                            pragma: 'h',
                        }],
                    ]
                }
            },
        ]
    },
    devtool: 'inline-source-map',

    devServer: {
        historyApiFallback: true
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, "./demo/index.html"),
        })
    ]
};

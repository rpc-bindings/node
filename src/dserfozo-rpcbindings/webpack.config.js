var nodeExternals = require('webpack-node-externals');
var webpack = require('webpack');
var path = require('path');

var libPath = function (name) {
    if (undefined === name) {
        return 'dist';
    }

    return path.join('dist', name);
}

var webpack_opts = {
    entry: './src/index.ts',
    target: 'node',
    output: {
        filename: libPath('index.js'),
        libraryTarget: 'commonjs2'
    },
    resolve: {
        extensions: ['.ts', '.js'],
        modules: [
            'node_modules',
            'src',
        ]
    },
    module: {
        loaders: [{
                test: /\.ts$/,
                loader: 'ts-loader',
                exclude: [
                    /node_modules/
                ],
            },
        ],
    },
    externals: [nodeExternals()],
    plugins: [
        new webpack.LoaderOptionsPlugin({
            options: {
                tslint: {
                    emitErrors: true,
                    failOnHint: true
                }
            }
        })
    ],
}

module.exports = webpack_opts;
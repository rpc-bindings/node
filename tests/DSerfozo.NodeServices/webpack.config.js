var path = require('path')

module.exports = {
    target: 'node',
    externals: ['fs', 'net', 'events', 'readline', 'stream'],
    resolve: {
        extensions: ['.ts']
    },
    module: {
        loaders: [
            { test: /\.ts$/, loader: 'ts-loader' },
        ]
    },
    entry: {
        'entrypoint-http': ['../../JavaScriptServices/src/Microsoft.AspNetCore.NodeServices/TypeScript/HttpNodeInstanceEntryPoint']
    },
    output: {
        libraryTarget: 'commonjs',
        path: path.join(__dirname, './Content/Node'),
        filename: '[name].js'
    }
};

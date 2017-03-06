const path = require('path');

module.exports = {
    entry: './dist/filter.js',
    output: {
        path: path.resolve(__dirname, 'dist', 'web'),
        filename: 'filter-bundle.js',
        library: "SimpleFilter",
        libraryTarget: "umd"
    },
    externals: {
        "moment": {
            commonjs: "moment",
            commonjs2: "moment",
            amd: "moment",
            root: "moment"
        },
        "underscore": {
            commonjs: "underscore",
            commonjs2: "underscore",
            amd: "underscore",
            root: "_"
        }
    }
};
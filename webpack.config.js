const path = require('path');
var webpack = require("webpack");

module.exports = {
    entry: {
        "filter": './src/filter.ts'
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js',
        // Export the module as the SimpleFilter variable
        library: "SimpleFilter",
        libraryTarget: "umd",
        sourceMapFilename: '[name].js.map'
    },

    // Enable sourcemaps for debugging webpack's output.
    devtool: "source-map",

    resolve: {
        // Add '.ts' and '.tsx' as resolvable extensions.
        extensions: [".ts", ".tsx", ".js"]
    },

    module: {

        rules: [
            // All files with a '.ts' or '.tsx' extension will be handled by 'awesome-typescript-loader'.
            { test: /\.tsx?$/, loader: "ts-loader" },

            // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
            { test: /\.js$/, loader: "source-map-loader", enforce: "pre" }
        ]
    },

    externals: {
        "moment": "moment",
        "underscore": {
            commonjs: "underscore",
            commonjs2: "underscore",
            amd: "underscore",
            root: "_"
        }
    }
};
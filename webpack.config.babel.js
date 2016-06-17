var webpack = require('webpack');
var path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require("extract-text-webpack-plugin");

function generateHtmlPlugin(pageName) {
    let pIns = new HtmlWebpackPlugin({
        template: `./page/${pageName}.html`,
        chunks: ['vendor', pageName],
        hash: true,
        filename: `${pageName}.html`,
        // minify: {
        //     minifyCSS: true,   
        //     minifyJS: true,
        //     collapseWhitespace: true   
        // }
    });
    return pIns;
}

module.exports = {
    entry: {
        index : "./js/index.js",
        vendor: ['jquery'],
    },
    output: {
        path: 'build',
        filename: "[name].bundle.js"
    },
    resolve: {
        extensions: ['', '.js', '.jsx'],
        alias: {
            
        }
    },
    module: {
        loaders: [
            {
                test: /\.css$/,
                loader: 'style!css'
            }, {
                test: /\.scss$/,
                loader: ExtractTextPlugin.extract('css!sass')
            }, {
                test: /\.(png|jpg|gif)$/,
                loader: 'url?limit=8192'
            },
            {
                test: /\.jsx$/,
                exclude: /node_modules/,
                loader: 'babel-loader?stage=0'
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader?stage=0'
            },
            { 
                test: /\.ejs/,
                loader: "ejs-loader"
            }
        ]
    },
    // externals: {
    //     // require('data') is external and available
    //     //  on the global var data
    //     'global': 'global'
    // },
    plugins: [
        generateHtmlPlugin("index"),
        new webpack.optimize.CommonsChunkPlugin('vendor', 'vendor.js', Infinity),
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery",
            "window.jQuery": "jquery"
        }),
        // new webpack.optimize.UglifyJsPlugin({ minimize: true }),
        new ExtractTextPlugin("global.css"),
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify("production")
            }
        }),
    ]

};

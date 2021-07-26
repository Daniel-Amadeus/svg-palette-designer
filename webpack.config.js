const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const config = {
    entry: {
        main: './source/code/main.ts'
    },
    devtool: 'inline-source-map',
    mode: 'development',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /(source\/shaders|node_modules)/,
            },
            {
                test: /\.css$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            esModule: false,
                            name: '[name].css'
                        }
                    }
                ]
            },
            {
                test: /\.pug$/,
                loader: 'pug-loader'
            },
            {
                resourceQuery: /raw/,
                type: 'asset/source'
            },
            {
                test: /\.(jpe?g|png|woff2?|eot|ttf)$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            esModule: false,
                            name: '[name]_[md5:hash:hex:4].[ext]'
                        }
                    }
                ]
            }
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'build'),
        library: undefined,
        libraryTarget: 'umd',
    },
    devServer: {
        open: true,
        contentBase: path.resolve(__dirname, "./source"),
        watchContentBase: true
    },
    plugins: [
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: 'source/pages/index.pug'
        })
    ]
}

module.exports = (env, argv) => {
    const devMode = argv.mode === 'development';
    config.output.publicPath = devMode ? '/' : '/svg-palette-designer/';
    // config.plugins.push(
    //     new FaviconsWebpackPlugin({
    //         logo: './source/img/logo.svg',
    //         mode: devMode ? 'light' : 'webapp'
    //     })
    // );
    return config;
}
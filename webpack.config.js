const path = require('path');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const tsImportPluginFactory = require("ts-import-plugin");
const { isDev } = require('./constants');
const webpack = require('webpack');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
    context: path.resolve(__dirname),
    entry: {
        app: ['./src/index.tsx']
    },
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist/cloudDisk'),
        publicPath: path.resolve(__dirname, 'dist/cloudDisk')
    },
    optimization: {
        splitChunks: {
            cacheGroups: {
                vendor: {
                    name: "common",
                    test: /[\\/]node_modules[\\/]/,
                    chunks: "initial",
                    minSize: 30000,   //  注释掉的话也不会打出来
                    minChunks: 1,   //  如果是2的话一个也抽不出来，因为好多只用了一次
                    priority: 8 // 优先级
                }
            },
        },
    },
    plugins: [
        new MiniCssExtractPlugin({      //对css进行打包，webpack4推荐语法
            filename: "[name].css",
            chunkFilename: "[name].css"
        }),
        //  使用DefinePlugin定义变量的时候，一定要stringfy,否则打包后会理解为变量而不是字符串
        new webpack.DefinePlugin({
            'ENVIRONMENT': JSON.stringify(isDev ? 'DEV' : 'PRO')
        }),
        //  moment包太大了，只使用中文包
        new webpack.ContextReplacementPlugin(
            /moment[/\\]locale$/,
            /zh-cn/,
        ),
        new BundleAnalyzerPlugin({
            analyzerPort: 8899
        })
    ],
    module: {
        rules: [
            // {
            //     test: /\.(js|jsx)$/,
            //     exclude: /node_modules/,
            //     use: [
            //         {
            //             loader: 'babel-loader',
            //             query: {
            //                 presets: [
            //                     '@babel/react', 
            //                     '@babel/preset-env'
            //                 ],
            //                 plugins: [
            //                     //  给antd做按需加载
            //                     ["import", {
            //                         "libraryName": "antd",
            //                         //"libraryDirectory": "es",
            //                         "style": 'css' // `style: true` 会加载 less 文件
            //                     }],
            //                     //  这个拿来做注入代码优化的
            //                     ['@babel/plugin-transform-runtime',
            //                     {
            //                         "corejs": false,
            //                         "helpers": true,
            //                         "regenerator": true,
            //                         "useESModules": false
            //                     }],
            //                     //  支持类写法
            //                     "@babel/plugin-proposal-class-properties"
            //                 ]
            //             }
            //         }
            //     ]
            // },
            {
                test: /\.(css|scss)$/,
                exclude: /node_modules/,
                use: [
                    'isomorphic-style-loader',
                    {
                        loader: 'typings-for-css-modules-loader',
                        options: {
                            modules: true,
                            namedExport: true
                        }
                    }
                ]
            },
            {
                //  专门处理antd的css样式
                test: /\.(less)$/,
                include: /node_modules/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    {
                        loader: "less-loader",
                        options: {
                            lessOptions: {
                                javascriptEnabled: true
                            }
                        }
                    }
                ],
            },
            {
                test: /\.tsx?$/,
                loader: "awesome-typescript-loader",
                options: {
                  useCache: true,
                  useBabel: false, // !important!
                  getCustomTransformers: () => ({
                    before: [tsImportPluginFactory({
                      libraryName: 'antd',
                      libraryDirectory: 'lib',
                      style: true
                    })]
                  }),
                },
                exclude: [
                    /node_modules/
                ]
              }
        ]
    },
    resolve: {
        alias: {
            // '@apiMap': path.resolve(__dirname, 'map/api.tsx'),
            // '@constants': path.resolve(__dirname, 'constants'),
            '@utils': path.resolve(__dirname, 'utils'),
            '@widgets': path.resolve(__dirname, 'widgets'),
            // '@UI': path.resolve(__dirname, 'UIwidgets')
        },
        extensions: [
            '.ts', '.tsx', '.js', '.json'
        ]
    },
    mode: isDev ? "development" : "production",
}
const path = require('path');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const tsImportPluginFactory = require("ts-import-plugin");
const webpack = require('webpack');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const isDev = true;

module.exports = {
    context: path.resolve(__dirname),
    entry: {
        app: ['./src/index.tsx']
    },
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'app'),
        publicPath: path.resolve(__dirname, 'app')
    },
    //  watch内容
    watch: true,
    watchOptions: {
      poll: 1000, // 每秒询问多少次
      aggregateTimeout: 500,  //防抖 多少毫秒后再次触发
      ignored: /node_modules/ //忽略时时监听
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
        //  moment包太大了，只使用中文包
        new webpack.ContextReplacementPlugin(
            /moment[/\\]locale$/,
            /zh-cn/,
        ),
        // new BundleAnalyzerPlugin({
        //     analyzerPort: 8899
        // })
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
                    //  'isomorphic-style-loader',
                    //  'css-loader',
                    MiniCssExtractPlugin.loader,  //自动提取出css
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
    // node: {
    //     fs: true,
    //     path: true
    // },
    mode: isDev ? "development" : "production",
}
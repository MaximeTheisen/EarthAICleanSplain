const path = require('path')
const SentryWebpackPlugin = require('@sentry/webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const webpack = require('webpack')

module.exports = (env) => {
    const envKeys = Object.keys(env).reduce((prev, next) => {
        prev[`process.env.${next}`] = JSON.stringify(env[next])
        return prev
    }, {})

    const isProduction = env && env.env === 'production'

    console.log(
        'Webpack Mode: ',
        isProduction ? 'Production\n' : 'Development\n'
    )

    const config = {
        entry: {
            popup: './popup/src/index.tsx',
            worker: './worker/worker.ts',
            models: './models/index.ts',
        },
        devtool: 'source-map',
        cache: !isProduction,
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    use: [
                        {
                            loader: 'ts-loader',
                            options: {
                                compilerOptions: { noEmit: false },
                            },
                        },
                    ],
                    exclude: /node_modules/,
                },
                {
                    test: /\.css$/i,
                    use: ['style-loader', 'css-loader'],
                },
            ],
        },
        plugins: [
            new webpack.DefinePlugin(envKeys),
            new CopyPlugin({
                patterns: [
                    { from: './img/*', to: '.' },
                    {
                        from: './manifest.json',
                        to: '.',
                        transform(content) {
                            if (isProduction) {
                                return content
                            } else {
                                return content
                                    .toString()
                                    .replaceAll('icon.png', 'icon-dev.png')
                            }
                        },
                    },

                ],
            }),
            new HtmlWebpackPlugin({
                template: './popup/public/index.html',
                filename: 'popup.html',
                chunks: ['popup'],
            }),
        ],
        resolve: {
            extensions: ['.tsx', '.ts', '.js'],
        },
        optimization: {
            minimize: isProduction,
        },
        output: {
            filename: '[name].js',
            path: path.resolve(__dirname, 'dist'),
            clean: true,
        },
    }

    // Development mode configuration
    if (!isProduction) {
        config.mode = 'development'
    } else {
        // Production mode configuration
        config.mode = 'production'
        config.plugins.push(
            new SentryWebpackPlugin({
                org: 'chromeai',
                project: 'extension',
                include: '../dist',
                authToken: process.env.SENTRY_AUTH_TOKEN,
                ignoreFile: '.sentrycliignore',
                ignore: ['node_modules', 'webpack.config.js'],
                configFile: 'sentry.properties',
            })
        )
    }

    return config
}

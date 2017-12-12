import * as webpack from 'webpack'
import * as Koa from 'koa'
import * as webpackDevMiddleware from 'webpack-dev-middleware'
import * as webpackHotMiddleware from 'webpack-hot-middleware'
import { NextHandleFunction } from 'connect'

declare namespace KoaWebpack
{
    interface Options
    {
        compiler?: webpack.Compiler
        config?: webpack.Configuration
        dev?: webpackDevMiddleware.Options
        hot?: webpackHotMiddleware.Options
    }

    interface CombinedWebpackMiddleware
    {
        dev: NextHandleFunction & webpackDevMiddleware.WebpackDevMiddleware
        hot: NextHandleFunction & webpackHotMiddleware.EventStream
    }
}

declare function KoaWebpack(
    options?: KoaWebpack.Options
): Koa.Middleware & KoaWebpack.CombinedWebpackMiddleware

export = KoaWebpack

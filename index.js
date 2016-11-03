import Webpack from 'webpack';
import devMiddleware from 'webpack-dev-middleware';
import hotMiddleware from 'webpack-hot-middleware';
import { PassThrough } from 'stream';
import compose from 'koa-compose';
import root from 'app-root-path';
import * as path from 'path';

/**
 * @method koaDevware
 * @desc   Middleware for Koa to proxy webpack-dev-middleware
 **/
function koaDevware (compiler, options) {
  const dev = devMiddleware(compiler, options);

  /**
   * @method waitMiddleware
   * @desc   Provides blocking for the Webpack processes to complete.
   **/
  function waitMiddleware () {
    return new Promise((resolve, reject) => {
      dev.waitUntilValid(() => {
        resolve(true);
      });

      compiler.plugin('failed', (error) => {
        reject(error);
      });
    });
  }

  return async (context, next) => {
    await waitMiddleware();
    await dev(context.req, {
      end: (content) => {
        context.body = content;
      },
      setHeader: context.set.bind(context)
    }, next);
  };
}

/**
 * @method koaHotware
 * @desc   Middleware for Koa to proxy webpack-hot-middleware
 **/
function koaHotware (compiler, options) {
  const hot = hotMiddleware(compiler, options);

  return async (context, next) => {
    let stream = new PassThrough();
    context.body = stream;

    await hot(context.req, {
      write: stream.write.bind(stream),
      writeHead: (state, headers) => {
        context.state = state;
        context.set(headers);
      }
    }, next);
  };
}

/**
 * The entry point for the Koa middleware.
 **/
export default (options) => {

  const defaults = { dev: {}, hot: {} };

  options = Object.assign(defaults, options);

  let config = options.config,
    compiler = options.compiler;

  if (!config && (!compiler || !options.dev.publicPath)) {
    config = require(path.join(root.path, 'webpack.config.js'));
  }

  if (!compiler) {
    compiler = Webpack(config);
  }

  if (!options.dev.publicPath) {
    options.dev.publicPath = config.output.publicPath;
  }

  return compose([
    koaDevware(compiler, options.dev),
    koaHotware(compiler, options.hot)
  ]);
};

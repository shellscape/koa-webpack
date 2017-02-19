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

  async function koaMiddleware (context, next) {
    await waitMiddleware();
    await dev(context.req, {
      end: (content) => {
        context.body = content;
      },
      setHeader: context.set.bind(context)
    }, next);
  };

  return Object.assign(koaMiddleware, { dev });
}

/**
 * @method koaHotware
 * @desc   Middleware for Koa to proxy webpack-hot-middleware
 **/
function koaHotware (compiler, options) {
  const hot = hotMiddleware(compiler, options);

  async function koaMiddleware (context, next) {
    let stream = new PassThrough();

    await hot(context.req, {
      write: stream.write.bind(stream),
      writeHead: (status, headers) => {
        context.body = stream;
        context.status = status;
        context.set(headers);
      }
    }, next);
  };

  return Object.assign(koaMiddleware, { hot });
}

/**
 * The entry point for the Koa middleware.
 **/
export default function (options) {

  const defaults = { dev: {}, hot: {} };

  options = Object.assign(defaults, options);

  let config = options.config,
    compiler = options.compiler,
    koaDevMiddleware,
    koaHotMiddleware,
    koaMiddleware;

  if (!compiler) {
    if (!config) {
      config = require(path.join(root.path, 'webpack.config.js'));
    }

    compiler = Webpack(config);
  }

  if (!options.dev.publicPath) {
    let publicPath = compiler.options.output.publicPath;

    if (!publicPath) {
      throw new Error('koa-webpack: publicPath must be set on `dev` options, or in a compiler\'s `output` configuration.');
    }

    options.dev.publicPath = publicPath;
  }

  koaDevMiddleware = koaDevware(compiler, options.dev),
  koaHotMiddleware = koaHotware(compiler, options.hot),
  koaMiddleware = compose([koaDevMiddleware, koaHotMiddleware]);

  return Object.assign(koaMiddleware, {
    devMiddleware: koaDevMiddleware.dev,
    hotMiddleware: koaHotMiddleware.hot
  });
};

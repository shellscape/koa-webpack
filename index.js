'use strict';

const path = require('path');
const Webpack = require('webpack');
const devMiddleware = require('webpack-dev-middleware');
const hotClient = require('webpack-hot-client');
const root = require('app-root-path');

/**
 * @method koaDevware
 * @desc   Middleware for Koa to proxy webpack-dev-middleware
 **/
function koaDevware(dev, compiler) {
  /**
   * @method waitMiddleware
   * @desc   Provides blocking for the Webpack processes to complete.
   **/
  function waitMiddleware() {
    return new Promise((resolve, reject) => {
      dev.waitUntilValid(() => {
        resolve(true);
      });

      function tapFailedHook(comp) {
        comp.hooks.failed.tap('KoaWebpack', (error) => {
          reject(error);
        });
      }

      if (compiler.compilers) {
        for (const child of compiler.compilers) {
          tapFailedHook(child);
        }
      } else {
        tapFailedHook(compiler);
      }
    });
  }

  return (context, next) => Promise.all([
    waitMiddleware(),
    new Promise((resolve) => {
      dev(context.req, {
        end: (content) => {
          context.body = content; // eslint-disable-line no-param-reassign
          resolve();
        },
        setHeader: context.set.bind(context),
        locals: context.state
      }, () => resolve(next()));
    })
  ]);
}

/**
 * The entry point for the Koa middleware.
 **/
module.exports = function fn(opts) {
  const defaults = { dev: {}, hot: {} };

  const options = Object.assign(defaults, opts);

  let { compiler, config } = options;

  if (!compiler) {
    if (!config) {
      // eslint-disable-next-line import/no-dynamic-require, global-require
      config = require(path.join(root.path, 'webpack.config.js'));
    }

    compiler = Webpack(config);
  }

  if (!options.dev.publicPath) {
    const { publicPath } = compiler.options.output;

    if (!publicPath) {
      throw new Error('koa-webpack: publicPath must be set on `dev` options, or in a compiler\'s `output` configuration.');
    }

    options.dev.publicPath = publicPath;
  }

  const client = options.hot ? hotClient(compiler, options.hot) : null;
  const dev = devMiddleware(compiler, options.dev);

  return Object.assign(koaDevware(dev, compiler), {
    dev,
    client,
    close(callback) {
      const next = client ? () => { client.close(callback); } : callback;
      dev.close(next);
    }
  });
};

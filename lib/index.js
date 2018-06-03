const { join } = require('path');

const validate = require('@webpack-contrib/schema-utils');
const root = require('app-root-path');
const webpack = require('webpack');
const devMiddleware = require('webpack-dev-middleware');
const hotClient = require('webpack-hot-client');

const schema = require('../schemas/options.json');

const defaults = { devMiddleware: {}, hotClient: {} };

const getClient = (compiler, options) => {
  if (!options.hotClient) {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    const client = hotClient(compiler, options.hotClient);
    const { server } = client;

    server.on('listening', () => resolve(client));
  });
};

const getMiddleware = (devWare, options) => (context, next) =>
  // wait for webpack-dev-middleware to signal that the build is ready
  Promise.all([
    new Promise((resolve, reject) => {
      const { compiler } = options;

      devWare.waitUntilValid(() => {
        resolve(true);
      });

      for (const comp of [].concat(compiler.compilers || compiler)) {
        comp.hooks.failed.tap('KoaWebpack', (error) => {
          reject(error);
        });
      }
    }),

    // tell webpack-dev-middleware to handle the request
    new Promise((resolve) => {
      devWare(
        context.req,
        {
          end: (content) => {
            // eslint-disable-next-line no-param-reassign
            context.body = content;
            resolve();
          },
          setHeader: context.set.bind(context),
          locals: context.state,
        },
        () => resolve(next())
      );
    }),
  ]);

module.exports = (opts) => {
  const options = Object.assign({}, defaults, opts);

  validate({ name: 'koa-webpack', schema, target: options });

  let { compiler, config } = options;

  if (!compiler) {
    if (!config) {
      // eslint-disable-next-line import/no-dynamic-require, global-require
      config = require(join(root.path, 'webpack.config.js'));
    }

    compiler = webpack(config);
    options.compiler = compiler;
  }

  if (!options.devMiddleware.publicPath) {
    const { publicPath } = compiler.options.output;

    if (!publicPath) {
      throw new Error(
        "koa-webpack: publicPath must be set on `dev` options, or in a compiler's `output` configuration."
      );
    }

    options.devMiddleware.publicPath = publicPath;
  }

  return getClient(compiler, options).then((client) => {
    const devWare = devMiddleware(compiler, options.devMiddleware);
    const middleware = getMiddleware(devWare, options);
    const close = (callback) => {
      const next = client ? () => client.close(callback) : callback;
      devWare.close(next);
    };

    return Object.assign(middleware, {
      hotClient: client,
      devMiddleware: devWare,
      close,
    });
  });
};

import Webpack from 'webpack';
import devMiddleware from 'webpack-dev-middleware';
import hotMiddleware from 'webpack-hot-middleware';
import { PassThrough } from 'stream';
import compose from 'koa-compose';
import root from 'app-root-path';
import * as path from 'path';

function koaDevware (compiler, options) {
  const dev = devMiddleware(compiler, options);

  function middleware (context, next) {
    return new Promise((resolve, reject) => {
      // https://github.com/webpack/docs/wiki/plugins#donestats-stats
      compiler.plugin('done', (stats) => {
        console.log('done');
        resolve(stats);
      });

      compiler.plugin('failed', (error) => {
        console.log('failed');
        reject(error);
      });

      dev(context.req, {
        end: (content) => {
          context.body = content;
        },
        setHeader: context.set.bind(context)
      }, next);
      console.log('dev');
    });
  }

  return async (context, next) => {
    await middleware(context, next);
    console.log('await');
  };
}

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

export default (options) => {

  const defaults = { dev: {}, hot: {} };

  options = Object.assign(defaults, options);

  let config = options.config,
    compiler = options.compiler;

  if (!config) {
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

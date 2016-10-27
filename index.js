/*
  Copyright © 2016 Andrew Powell

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.

  The above copyright notice and this permission notice shall be
  included in all copies or substantial portions of this Source Code Form.
*/

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
        resolve(stats);
      });

      compiler.plugin('failed', (error) => {
        reject(error);
      });

      dev(context.req, {
        end: (content) => {
          context.body = content;
        },
        setHeader: context.set.bind(context)
      }, next);
    });
  }

  return async (context, next) => {
    await middleware(context, next);
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

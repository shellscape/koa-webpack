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

function devWare (compiler, opts) {
  const dev = devMiddleware(compiler, opts);

  return async (ctx, next) => {
    await dev(ctx.req, {
      end: (content) => {
        ctx.body = content;
      },
      setHeader: ctx.set.bind(ctx)
    }, next);
  };
}

function hotWare (compiler, opts) {
  const hot = hotMiddleware(compiler, opts);

  return async (ctx, next) => {
    let stream = new PassThrough();
    ctx.body = stream;

    await hot(ctx.req, {
      write: stream.write.bind(stream),
      writeHead: (state, headers) => {
        ctx.state = state;
        ctx.set(headers);
      }
    }, next);
  };
}

export default (options) => {

  options = Object.assign(options || {}, { dev: {}, hot: {} });

  let config = options.config,
    compiler = options.compiler;

  if (!config) {
    config = require(path.join(root, 'webpack.config.js'));
  }

  if (!compiler) {
    compiler = Webpack(config);
  }

  if (!options.dev.publicPath) {
    options.dev.publicPath = config.output.publicPath;
  }

  const dev = devMiddleware(compiler, options.dev),
    hot = hotMiddleware(compiler, options.hot);

  return compose([ devWare, hotWare ]);
};

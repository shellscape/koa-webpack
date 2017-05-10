import * as assert from 'assert';
import * as path from 'path';

import merge from 'deepmerge';
import Koa from 'koa';
import compose from 'koa-compose';
import request from 'supertest';
import Webpack from 'webpack';

import koaWebpack from '../index';

const DEFAULT_OPTIONS = {
  config: {
    entry: path.resolve(__dirname, 'fixtures', 'input.js'),
    output: {
      path: path.resolve(__dirname, 'fixtures'),
      filename: 'output.js',
    },
  },
  dev: {
    publicPath: '/',
    noInfo: true,
    quiet: true,
  },
};

function buildOptions (options) {
  options = merge(DEFAULT_OPTIONS, options);
  return merge(options, {
    config: null,
    compiler: Webpack(options.config),
  });
};

function defaultApp (middleware) {
  return middleware;
}

function requestWith (options, setupMiddleware = defaultApp) {
  const app = new Koa();
  const webpackMiddleware = koaWebpack(buildOptions(options));
  app.use(setupMiddleware(webpackMiddleware));
  const server = app.listen();
  return request(server);
};

describe('devMiddleware', () => {
  it('sends the result in watch mode', () => {
    return requestWith({ dev: { lazy: false } })
      .get('/output.js')
      .expect(200)
      .expect(response => {
        assert.ok(/Hello world/.test(response.text),
          "Expected result to contain 'Hello world'");
      });
  });

  it('builds and sends the result in lazy mode', () => {
    return requestWith({ dev: { lazy: true } })
      .get('/output.js')
      .expect(200)
      .expect(response => {
        assert.ok(/Hello world/.test(response.text),
          "Expected result to contain 'Hello world'");
      });
  });

  it('continues on if the file is not part of webpack', () => {
    const middleware = (webpack) =>
      compose([
        webpack,
        async (ctx) => {
          ctx.body = 'foo';
        },
      ]);

    return requestWith({}, middleware)
      .get('/some-other-file.js')
      .expect(200, 'foo');
  });
});

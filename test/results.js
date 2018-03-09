'use strict';

const assert = require('assert');
const path = require('path');
const killable = require('killable');
const merge = require('merge-options');
const Koa = require('koa');
const compose = require('koa-compose');
const request = require('supertest');
const Webpack = require('webpack');
const koaWebpack = require('../index');

const DEFAULT_OPTIONS = {
  mode: 'development',
  config: {
    entry: [path.resolve(__dirname, 'fixtures', 'input.js')],
    output: {
      path: path.resolve(__dirname, 'fixtures'),
      filename: 'output.js'
    }
  },
  dev: {
    publicPath: '/',
    logLevel: 'silent'
  },
  hot: {
    logLevel: 'silent'
  }
};

function buildOptions(opts) {
  const options = merge({}, DEFAULT_OPTIONS, opts);
  return merge(options, {
    config: null,
    compiler: Webpack(options.config)
  });
}

function defaultApp(middleware) {
  return middleware;
}

function setup(options, setupMiddleware = defaultApp) {
  const app = new Koa();
  const middleware = koaWebpack(buildOptions(options));
  app.use(setupMiddleware(middleware));
  const server = app.listen();
  const req = request(server);
  killable(server);
  return { middleware, req, server };
}

describe('koa-webpack', () => {
  it('should provide access to middleware and client', (done) => {
    const { middleware, server, req } = setup({ dev: { lazy: false } });

    req.get('/output.js')
      .then(() => {
        assert(middleware.dev);
        assert(middleware.client);

        server.kill();
        middleware.close(done);
      });
  }).timeout(5e3);

  it('should disable hot-client', (done) => {
    const { middleware, server, req } = setup({ dev: { lazy: false }, hot: false });

    req.get('/output.js')
      .then(() => {
        assert(middleware.dev);
        assert.equal(middleware.client, null);

        server.kill();
        middleware.close(done);
      });
  }).timeout(5e3);

  it('sends the result in watch mode', (done) => {
    const { middleware, req, server } = setup({ dev: { lazy: false } });
    req.get('/output.js')
      .expect(200)
      .expect((response) => {
        assert.ok(/Hello world/.test(response.text), "Expected result to contain 'Hello world'");
      })
      .then(() => {
        server.kill();
        middleware.close(done);
      });
  }).timeout(5e3);

  it('sends the result to a MultiCompiler in watch mode', (done) => {
    const { middleware, req, server } = setup({
      dev: { lazy: false },
      config: [
        {
          entry: [path.resolve(__dirname, 'fixtures', 'input.js')],
          output: {
            path: path.resolve(__dirname, 'fixtures'),
            filename: 'output.js'
          }
        },
        {
          entry: [path.resolve(__dirname, 'fixtures', 'input.js')],
          output: {
            path: path.resolve(__dirname, 'fixtures'),
            filename: 'output2.js'
          }
        }
      ]
    });
    req.get('/output.js')
      .expect(200)
      .expect((response) => {
        assert.ok(/Hello world/.test(response.text), "Expected result to contain 'Hello world'");
      })
      .then(() => req.get('/output2.js')
        .expect(200)
        .expect((response) => {
          assert.ok(/Hello world/.test(response.text), "Expected result to contain 'Hello world'");
        })
        .then(() => {
          server.kill();
          middleware.close(done);
        }));
  }).timeout(5e3);

  it('builds and sends the result in lazy mode', (done) => {
    const { middleware, req, server } = setup({ dev: { lazy: true } });
    req.get('/output.js')
      .expect(200)
      .expect((response) => {
        assert.ok(/Hello world/.test(response.text), "Expected result to contain 'Hello world'");
      })
      .then(() => {
        server.kill();
        middleware.close(done);
      });
  }).timeout(5e3);

  it('continues on if the file is not part of webpack', (done) => {
    const mware = webpack =>
      compose([
        webpack,
        async (ctx) => {
          ctx.body = 'foo'; // eslint-disable-line
        }
      ]);

    const { middleware, req, server } = setup({}, mware);
    req.get('/some-other-file.js')
      .expect(200, 'foo')
      .then(() => {
        server.kill();
        middleware.close(done);
      });
  }).timeout(5e3);
});

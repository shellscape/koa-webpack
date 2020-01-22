const { resolve } = require('path');

const test = require('ava');
const killable = require('killable');
const merge = require('merge-options');
const Koa = require('koa');
const compose = require('koa-compose');
const request = require('supertest');
const webpack = require('webpack');

const koaWebpack = require('../lib');
const config = require('./fixtures/webpack.config');

const defaults = {
  config,
  devMiddleware: {
    publicPath: '/',
    logLevel: 'silent'
  },
  hotClient: {
    logLevel: 'silent'
  }
};

function buildOptions(opts) {
  const options = merge({}, defaults, opts);
  return merge(options, {
    config: null,
    ...opts.configPath ? {} : { compiler: webpack(options.config) }
  });
}

function defaultApp(middleware) {
  return middleware;
}

async function setup(opts, setupMiddleware = defaultApp) {
  const app = new Koa();
  const options = buildOptions(opts);
  const middleware = await koaWebpack(options);

  app.use(setupMiddleware(middleware));

  const server = app.listen();
  const req = request(server);

  killable(server);

  return { middleware, req, server };
}

function close(server, middleware) {
  return new Promise((r) => server.kill(middleware.close(r)));
}

test('should provide access to middleware and client', async (t) => {
  const { middleware, req, server } = await setup({
    devMiddleware: { lazy: false }
  });

  await req.get('/output.js');

  const { devMiddleware, hotClient } = middleware;

  t.truthy(devMiddleware);
  t.truthy(devMiddleware.close);
  t.truthy(hotClient);
  t.truthy(hotClient.close);

  return close(server, middleware);
});

test('should disable hot-client', async (t) => {
  const { middleware, req, server } = await setup({
    devMiddleware: { lazy: false },
    hotClient: false
  });

  await req.get('/output.js');

  t.truthy(middleware.devMiddleware);
  t.is(middleware.hotClient, null);

  return close(server, middleware);
});

test('sends the result in watch mode', async (t) => {
  const { middleware, req, server } = await setup({
    devMiddleware: { lazy: false }
  });

  const response = await req.get('/output.js').expect(200);

  t.regex(response.text, /Hello World/);

  return close(server, middleware);
});

test('sends the result to a MultiCompiler in watch mode', async (t) => {
  const { middleware, req, server } = await setup({
    devMiddleware: { lazy: false },
    config: [
      {
        entry: [resolve(__dirname, 'fixtures', 'input.js')],
        output: {
          path: resolve(__dirname, 'fixtures'),
          filename: 'output.js'
        }
      },
      {
        entry: [resolve(__dirname, 'fixtures', 'input.js')],
        output: {
          path: resolve(__dirname, 'fixtures'),
          filename: 'output2.js'
        }
      }
    ]
  });

  let response = await req.get('/output.js').expect(200);

  t.regex(response.text, /Hello World/);

  response = await req.get('/output2.js').expect(200);

  t.regex(response.text, /Hello World/);

  return close(server, middleware);
});

test('builds and sends the result in lazy mode', async (t) => {
  const { middleware, req, server } = await setup({
    devMiddleware: { lazy: true }
  });

  const response = await req.get('/output.js').expect(200);

  t.regex(response.text, /Hello World/);

  return close(server, middleware);
});

test('continues on if the file is not part of webpack', async (t) => {
  const mware = (webpackMiddleware) =>
    compose([
      webpackMiddleware,
      async (ctx) => {
        ctx.body = 'foo'; // eslint-disable-line no-param-reassign
      }
    ]);

  const { middleware, req, server } = await setup({}, mware);

  const response = await req.get('/some-other-file.js').expect(200);

  t.is(response.text, 'foo');

  return close(server, middleware);
});

test('uses supplied Webpack configuration file', async (t) => {
  const { middleware, req, server } = await setup({
    configPath: resolve(__dirname, 'fixtures', 'webpack.config.js')
  });

  const response = await req.get('/output.js').expect(200);

  t.regex(response.text, /Hello World/);

  return close(server, middleware);
});

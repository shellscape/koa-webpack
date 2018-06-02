const { resolve } = require('path');

const killable = require('killable');
const merge = require('merge-options');
const Koa = require('koa');
const compose = require('koa-compose');
const request = require('supertest');
const webpack = require('webpack');

const koaWebpack = require('../src');

const defaults = {
  config: {
    mode: 'development',
    entry: [resolve(__dirname, 'fixtures', 'input.js')],
    output: {
      path: resolve(__dirname, 'fixtures'),
      filename: 'output.js',
    },
  },
  devMiddleware: {
    publicPath: '/',
    logLevel: 'silent',
  },
  hotClient: {
    logLevel: 'silent',
  },
};

function buildOptions(opts) {
  const options = merge({}, defaults, opts);
  return merge(options, {
    config: null,
    compiler: webpack(options.config),
  });
}

function defaultApp(middleware) {
  return middleware;
}

async function setup(opts, setupMiddleware = defaultApp) {
  const app = new Koa();
  const options = buildOptions(opts);
  const middleware = await koaWebpack(options);

  // console.log(middleware);

  app.use(setupMiddleware(middleware));

  const server = app.listen();
  const req = request(server);

  killable(server);

  return { middleware, req, server };
}

function close(server, middleware) {
  return new Promise((r) => server.kill(middleware.close(r)));
}

describe('koa-webpack', () => {
  test('should provide access to middleware and client', async () => {
    const { middleware, req, server } = await setup({
      devMiddleware: { lazy: false },
    });

    await req.get('/output.js');

    expect(middleware.devMiddleware).toBeDefined();
    expect(middleware.hotClient).toBeDefined();

    return close(server, middleware);
  });

  test('should disable hot-client', async () => {
    const { middleware, req, server } = await setup({
      devMiddleware: { lazy: false },
      hotClient: false,
    });

    await req.get('/output.js');

    expect(middleware.devMiddleware).toBeDefined();
    expect(middleware.hotClient).toBe(null);

    return close(server, middleware);
  });

  test('sends the result in watch mode', async () => {
    const { middleware, req, server } = await setup({
      devMiddleware: { lazy: false },
    });

    const response = await req.get('/output.js').expect(200);

    expect(response.text).toMatch(/Hello World/);

    return close(server, middleware);
  });

  test('sends the result to a MultiCompiler in watch mode', async () => {
    const { middleware, req, server } = await setup({
      devMiddleware: { lazy: false },
      config: [
        {
          entry: [resolve(__dirname, 'fixtures', 'input.js')],
          output: {
            path: resolve(__dirname, 'fixtures'),
            filename: 'output.js',
          },
        },
        {
          entry: [resolve(__dirname, 'fixtures', 'input.js')],
          output: {
            path: resolve(__dirname, 'fixtures'),
            filename: 'output2.js',
          },
        },
      ],
    });

    let response = await req.get('/output.js').expect(200);

    expect(response.text).toMatch(/Hello World/);

    response = await req.get('/output2.js').expect(200);

    expect(response.text).toMatch(/Hello World/);

    return close(server, middleware);
  });

  test('builds and sends the result in lazy mode', async () => {
    const { middleware, req, server } = await setup({
      devMiddleware: { lazy: true },
    });

    const response = await req.get('/output.js').expect(200);

    expect(response.text).toMatch(/Hello World/);

    return close(server, middleware);
  });

  test('continues on if the file is not part of webpack', async () => {
    const mware = (webpackMiddleware) =>
      compose([
        webpackMiddleware,
        async (ctx) => {
          ctx.body = 'foo'; // eslint-disable-line no-param-reassign
        },
      ]);

    const { middleware, req, server } = await setup({}, mware);

    await req.get('/some-other-file.js').expect(200, 'foo');

    return close(server, middleware);
  });
});

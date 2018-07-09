<div align="center">
  <a href="https://koajs.com">
    <img width="200" src="https://i.imgur.com/IABvnrD.png"/>
  </a>
  <a href="https://github.com/webpack/webpack">
    <img width="200" height="200" src="https://webpack.js.org/assets/icon-square-big.svg"/>
  </a>
</div>

[![npm][npm]][npm-url]
[![node][node]][node-url]
[![deps][deps]][deps-url]
[![tests][tests]][tests-url]
[![chat][chat]][chat-url]
[![size][size]][size-url]

# koa-webpack

Development and Hot Module Reload Middleware for **Koa2**, in a single
middleware module.

This module wraps and composes
[`webpack-dev-middleware`](https://github.com/webpack/webpack-dev-middleware) and
[`webpack-hot-client`](https://github.com/webpack-contrib/webpack-hot-client)
into a single middleware module, allowing for quick and concise implementation.

As an added bonus, it'll also use the installed `webpack` module from your project,
and the `webpack.config.js` file in the root of your project, automagically, should
you choose to let it. This negates the need for all of the repetitive setup and
config that you get with `koa-webpack-middleware`.

## Requirements

This module requires a minimum of Node v6.9.0 and Webpack v4.0.0.

## Getting Started

To begin, you'll need to install `koa-webpack`:

```console
$ npm install koa-webpack --save-dev
```

Next, setup the module in your code. (We're assuming ES6 syntax here)

```js
const Koa = require('koa');

const app = new Koa();

const koaWebpack = require('koa-webpack');

koaWebpack({ .. options .. })
 .then((middleware) => {
  app.use(middleware);
});
```

## API

### koaWebpack([options])

Returns a `Promise` which resolves the server `middleware` containing the
following additional properties:

- `close(callback)` *(Function)* - Closes both the instance of `webpack-dev-middleware`
and `webpack-hot-client`. Accepts a single `Function` callback parameter that is
executed when complete.
- `hotClient` *(Object)* - An instance of `webpack-hot-client`.
- `devMiddleware` *(Object)* - An instance of `webpack-dev-middleware`

## Options

The middleware accepts an `options` Object, which can contain options for the
`webpack-dev-middleware` and `webpack-hot-client` bundled with this module.
The following is a property reference for the Object:

### compiler

Type: `Object`  
`optional`

Should you rather that the middleware use an instance of `webpack` that you've
already init'd [with webpack config], you can pass it to the middleware using
this option.

Example:

```js
const webpack = require('webpack');
const config = require('./webpack.config.js');
const compiler = Webpack(config);
const koaWebpack = require('koa-webpack');

koaWebpack({ compiler })
 .then((middleware) => {
  app.use(middleware);
});
```

### config

Type: `Object`  
`optional`

Should you rather that the middleware use an instance of webpack configuration
that you've already required/imported, you can pass it to the middleware using
this option.

Example:

```js
const config = require('./webpack.config.js');
const koaWebpack = require('koa-webpack');

koaWebpack({ config })
 .then((middleware) => {
  app.use(middleware);
});
```

### devMiddleware

Type: `Object`  
`optional`

The `devMiddleware` property should contain options for `webpack-dev-middleware`, a list of
which is available at [webpack-dev-middleware](https://github.com/webpack/webpack-dev-middleware).
Omitting this property will result in `webpack-dev-middleware` using its default
options.

### hotClient

Type: `Object|Boolean`  
`optional`

The `hotClient` property should contain options for `webpack-hot-client`, a list of
which is available at [webpack-hot-client](https://github.com/webpack-contrib/webpack-hot-client).
Omitting this property will result in `webpack-hot-client` using its default
options.

As of `v3.0.1` setting this to `false` will completely disable `webpack-hot-client`
and all automatic Hot Module Replacement functionality.

## Using with koa-compress

When using `koa-webpack` with [koa-compress](https://github.com/koajs/compress),
you may experience issues with saving files and hot module reload. Please review
[this issue](https://github.com/shellscape/koa-webpack/issues/36#issuecomment-289565573)
for more information and a workaround.

## Server-Side-Rendering

When `serverSideRender` is set to true in `config.dev`, `webpackStats` is
accessible from `ctx.state.webpackStats`.

```js
app.use(async (ctx, next) => {
  const assetsByChunkName = ctx.state.webpackStats.toJson().assetsByChunkName;
  // do something with assetsByChunkName
})
```

For more details please refer to:
[webpack-dev-middleware](https://github.com/webpack/webpack-dev-middleware#server-side-rendering)


## Using with html-webpack-plugin

When using with html-webpack-plugin, you can access dev-middleware in-memory filesystem to serve index.html file:

```js
koaWebpack({
  config: webpackConfig
}).then(middleware => {
  app.use(middleware)

  app.use(async ctx => {
    const filename = path.resolve(webpackConfig.output.path, 'index.html')
    ctx.response.type = 'html'
    ctx.response.body = middleware.devMiddleware.fileSystem.createReadStream(filename)
  })
})
```

## Contributing

Please take a moment to read our contributing guidelines if you haven't yet done so.

#### [CONTRIBUTING](./.github/CONTRIBUTING.md)

## Attribution

This module started as a fork of
[`koa-webpack-middleware`](https://github.com/leecade/koa-webpack-middleware)

## License

#### [MPL](./LICENSE)

[npm]: https://img.shields.io/npm/v/koa-webpack.svg
[npm-url]: https://npmjs.com/package/koa-webpack

[node]: https://img.shields.io/node/v/koa-webpack.svg
[node-url]: https://nodejs.org

[deps]: https://david-dm.org/shellscape/koa-webpack.svg
[deps-url]: https://david-dm.org/shellscape/koa-webpack

[tests]: 	https://img.shields.io/circleci/project/github/shellscape/koa-webpack.svg
[tests-url]: https://circleci.com/gh/shellscape/koa-webpack

[cover]: https://codecov.io/gh/shellscape/koa-webpack/branch/master/graph/badge.svg
[cover-url]: https://codecov.io/gh/shellscape/koa-webpack

[chat]: https://img.shields.io/badge/gitter-webpack%2Fwebpack-brightgreen.svg
[chat-url]: https://gitter.im/webpack/webpack

[size]: https://packagephobia.now.sh/badge?p=koa-webpack
[size-url]: https://packagephobia.now.sh/result?p=koa-webpack

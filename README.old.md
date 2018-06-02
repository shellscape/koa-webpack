# koa-webpack [![Build Status](https://travis-ci.org/shellscape/koa-webpack.svg?branch=master)](https://travis-ci.org/shellscape/koa-webpack)

Development and Hot Module Reload Middleware for **Koa2**, in a single middleware module.

This module wraps and composes
[`webpack-dev-middleware`](https://github.com/webpack/webpack-dev-middleware) and
[`webpack-hot-client`](https://github.com/webpack-contrib/webpack-hot-client)
into a single middleware module, allowing for quick and concise implementation.

As an added bonus, it'll also use the installed `webpack` module from your project,
and the `webpack.config.js` file in the root of your project, automagically, should
you choose to let it. This negates the need for all of the repetitive setup and
config that you get with `koa-webpack-middleware`.

## Version 2 Breaking Changes

As of version 2.0.0, Node v4 is no longer supported. The minimum version of Node
supported is v6.11. Browser support is limited to those browsers which support
_native_ `WebSocket`. That typically means the last two major versions of a
browser. If you need support for older browsers, please use version 1.x of this
module. If you would like to submit a fix for a 1.x version of the module, please
submit that to the `1.x` branch.

### Migrating to Version 2.x

Version 1.x leveraged webpack-hot-middleware, which required the user to add an entry to the config for `webpack-hot-middleware/client`, and also add `webpack.HotModuleReplacementPlugin` to plugins. These are no longer needed, and will cause errors if not removed from the webpack config.

If you have setup `hot` options for `koa-webpack` in your config or code, you'll need to reference the [`webpack-hot-client` options](https://github.com/webpack-contrib/webpack-hot-client#options) and update those accordingly. The options for `webpack-hot-middleware` are _not_ 1:1 with `webpack-hot-client`

## Getting Started

First thing's first, install the module:

```bash
npm install koa-webpack --save-dev
```

If you happen to see warning from npm that reads:
`UNMET PEER DEPENDENCY webpack@2.1.0-beta.25` fear not, simply install the latest
beta version of `webpack`.

Next, setup the module in your code. (We're assuming ES6 syntax here)

```js
import Koa from 'koa';
import middleware from 'koa-webpack';

const app = new Koa();

app.use(middleware({
  // options
}))
```

## API

### koaWebpack([options])

Returns an `Object` containing:

- `close(callback)` *(Function)* - Closes both the instance of `webpack-dev-middleware`
and `webpack-hot-client`. Accepts a single `Function` callback parameter that is
executed when complete.
- `client` *(Object)* - An instance of `webpack-hot-client`.
- `dev` *(Object)* - An instance of `webpack-dev-middleware`

## options

The middleware accepts an `options` Object, which can contain options for the
`webpack-dev-middleware` and `webpack-hot-client` bundled with this module.
The following is a property reference for the Object:

#### compiler

Type: `Object`  
`optional`

Should you rather that the middleware use an instance of `webpack` that you've
already init'd [with webpack config], you can pass it to the middleware using
this option.

Example:

```js
import Webpack from 'webpack';
import config from './webpack.config.js';

const compiler = Webpack(config);

app.use(middleware({
  compiler: compiler
}))
```

#### config

Type: `Object`  
`optional`

Should you rather that the middleware use an instance of webpack configuration
that you've already required/imported, you can pass it to the middleware using
this option.

Example:

```js
import config from './webpack.config.js';

app.use(middleware({
  config: config
}))
```

#### dev

Type: `Object`  
`optional`

The `dev` property should contain options for `webpack-dev-middleware`, a list of
which is available at [webpack-dev-middleware](https://github.com/webpack/webpack-dev-middleware).
Omitting this property will result in `webpack-dev-middleware` using its default
options.

#### hot

Type: `Object|Boolean`  
`optional`

The `hot` property should contain options for `webpack-hot-client`, a list of
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

When `serverSideRender` is set to true in `config.dev`, `webpackStats` is accessible from `ctx.state.webpackStats`.

```js
app.use(async (ctx, next) => {
  const assetsByChunkName = ctx.state.webpackStats.toJson().assetsByChunkName;
  // do something with assetsByChunkName
})
```

For more details please refer to: [webpack-dev-middleware](https://github.com/webpack/webpack-dev-middleware#server-side-rendering)

## Lint and test

```bash
npm install
npm run lint
npm test
```

## Contributing

We welcome your contributions! Please have a read of [CONTRIBUTING](CONTRIBUTING.md).

## Attribution

This module started as a fork of [`koa-webpack-middleware`](https://github.com/leecade/koa-webpack-middleware)

# koa-webpack [![Build Status](https://travis-ci.org/shellscape/koa-webpack.svg?branch=master)](https://travis-ci.org/shellscape/koa-webpack)

Development and Hot Module Reload Middleware for **Koa2**, in a single middleware module.

## &nbsp;
<p align="center">
  <b>:rocket: &nbsp; Are you ready to tackle ES6 and hone your JavaScript Skills?</b> &nbsp; :rocket:<br/>
  Check out these outstanding <a href="https://es6.io/friend/POWELL">ES6 courses</a> by <a href="https://github.com/wesbos">@wesbos</a>
</p>

---

This module wraps and composes `webpack-dev-middleware` and `webpack-hot-middleware`
into a single middleware module, allowing for quick and concise implementation.

As an added bonus, it'll also use the install `webpack` module from your project,
and the `webpack.config.js` file in the root of your project, automagically, should
you choose to let it. This negates the need for all of the repetitive setup and
config that you get with `koa-webpack-middleware`.

This module is a fork of [koa-webpack-middleware](https://github.com/leecade/koa-webpack-middleware), as
the afore mentioned project has fallen into a state of neglect, and contains many
enhancements and updates.

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

### Accessing the Underlying Middleware

In some cases, you may have the need to access the `webpack-dev-middleware` or
`webpack-hot-middleware` instances that this module composes. As of `v0.3.0` you
can access both by using the following pattern:

```js
import Koa from 'koa';
import koaWebpack from 'koa-webpack';

const app = new Koa();
const middleware = koaWebpack({
  // options
});

app.use(middleware);

function doSomething () {
  middleware.hot.publish({ action: 'reload' })
}

```

## Options

The middleware accepts an `options` Object, which can contain options for the
`webpack-dev-middleware` and `webpack-hot-middleware` bundled with this module.
The following is a property reference for the Object:

### compiler

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

### config

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

### dev

Type: `Object`  
`optional`

The `dev` property should contain options for `webpack-dev-middleware`, a list of
which is available at [webpack-dev-middleware](https://github.com/webpack/webpack-dev-middleware).
Omitting this property will result in `webpack-dev-middleware` using its default
options.

### hot

Type: `Object`  
`optional`

The `hot` property should contain options for `webpack-hot-middleware`, a list of
which is available at [webpack-hot-middleware](https://github.com/glenjamin/webpack-hot-middleware).
Omitting this property will result in `webpack-hot-middleware` using its default
options.

## Access to webpack-hot-middleware and webpack-dev-middleware

As of `0.2.1`, you can access the webpack middleware directly. This was enabled
by request as some power users wanted to do more with the composed middleware
than is available through pure config.

```js
import middleware from 'koa-webpack';

// middleware.devMiddleware
// middleware.hotMiddleware
```
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

## Building

```bash
npm install
npm install gulp -g
gulp build
```

The `dist` directory will contain the `index.js` file that the module uses as the entry point.

## Contributing

We welcome your contributions! Please have a read of [CONTRIBUTING](CONTRIBUTING.md).

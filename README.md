# koa-webpack

Development and Hot Module Reload Middleware for Koa2, in a single middleware module.

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
  compiler: compiler;
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
  config: config;
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

The `dev` property should contain options for `webpack-hot-middleware`, a list of
which is available at [webpack-hot-middleware](https://github.com/webpack/webpack-hot-middleware).
Omitting this property will result in `webpack-hot-middleware` using its default
options.

## Building

```bash
npm install
npm install gulp -g
gulp build
```

The `dist` directory will contain the `index.js` file that the module uses as the entry point.

## Contributing

We welcome your contributions! Please have a read of [CONTRIBUTING](CONTRIBUTING.md).

'use strict';

/* eslint global-require: off */
require('loud-rejection/register');

if (parseInt(process.version.substring(1), 10) < 8) {
  require('@babel/polyfill');
  require('@babel/register')({
    ignore: [/node_modules\/(?!koa)/],
    presets: [
      ['@babel/preset-env', {
        targets: {
          node: '6.11'
        }
      }]
    ]
  });
}

require('./results');

'use strict';

if (parseInt(process.version.substring(1), 10) < 8) {
  require('babel-polyfill'); // eslint-disable-line
  require('babel-register'); // eslint-disable-line
}

require('./results');

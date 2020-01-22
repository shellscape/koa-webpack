const { resolve } = require('path');

module.exports = {
  mode: 'development',
  entry: [resolve(__dirname, 'input.js')],
  output: {
    path: __dirname,
    filename: 'output.js'
  }
};

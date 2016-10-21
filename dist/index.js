'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _webpack = require('webpack');

var _webpack2 = _interopRequireDefault(_webpack);

var _webpackDevMiddleware = require('webpack-dev-middleware');

var _webpackDevMiddleware2 = _interopRequireDefault(_webpackDevMiddleware);

var _webpackHotMiddleware = require('webpack-hot-middleware');

var _webpackHotMiddleware2 = _interopRequireDefault(_webpackHotMiddleware);

var _stream = require('stream');

var _koaCompose = require('koa-compose');

var _koaCompose2 = _interopRequireDefault(_koaCompose);

var _appRootPath = require('app-root-path');

var _appRootPath2 = _interopRequireDefault(_appRootPath);

var _path = require('path');

var path = _interopRequireWildcard(_path);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function devWare(compiler, options) {
  var _this = this;

  var dev = (0, _webpackDevMiddleware2.default)(compiler, options);

  return function () {
    var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(ctx, next) {
      return _regenerator2.default.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return dev(ctx.req, {
                end: function end(content) {
                  ctx.body = content;
                },
                setHeader: ctx.set.bind(ctx)
              }, next);

            case 2:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, _this);
    }));

    return function (_x, _x2) {
      return _ref.apply(this, arguments);
    };
  }();
}

function hotWare(compiler, options) {
  var _this2 = this;

  var hot = (0, _webpackHotMiddleware2.default)(compiler, options);

  return function () {
    var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(ctx, next) {
      var stream;
      return _regenerator2.default.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              stream = new _stream.PassThrough();

              ctx.body = stream;

              _context2.next = 4;
              return hot(ctx.req, {
                write: stream.write.bind(stream),
                writeHead: function writeHead(state, headers) {
                  ctx.state = state;
                  ctx.set(headers);
                }
              }, next);

            case 4:
            case 'end':
              return _context2.stop();
          }
        }
      }, _callee2, _this2);
    }));

    return function (_x3, _x4) {
      return _ref2.apply(this, arguments);
    };
  }();
}

exports.default = function (options) {

  var defaults = { dev: {}, hot: {} };

  options = (0, _assign2.default)(defaults, options);

  var config = options.config,
      compiler = options.compiler;

  if (!config) {
    config = require(path.join(_appRootPath2.default.path, 'webpack.config.js'));
  }

  if (!compiler) {
    compiler = (0, _webpack2.default)(config);
  }

  if (!options.dev.publicPath) {
    options.dev.publicPath = config.output.publicPath;
  }

  var dev = (0, _webpackDevMiddleware2.default)(compiler, options.dev),
      // eslint-disable-line one-var
  hot = (0, _webpackHotMiddleware2.default)(compiler, options.hot);

  return (0, _koaCompose2.default)([devWare, hotWare]);
};

module.exports = exports['default'];
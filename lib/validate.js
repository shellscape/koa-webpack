/*
  Copyright © 2016 Andrew Powell

  This Source Code Form is subject to the terms of the Mozilla Public
  License, v. 2.0. If a copy of the MPL was not distributed with this
  file, You can obtain one at http://mozilla.org/MPL/2.0/.

  The above copyright notice and this permission notice shall be
  included in all copies or substantial portions of this Source Code Form.
*/
const Joi = require('@hapi/joi');

module.exports = {
  validate(options) {
    const keys = {
      compiler: [Joi.object().allow(null)],
      config: [Joi.object().allow(null)],
      configPath: [Joi.string().allow(null)],
      devMiddleware: [Joi.object()],
      hotClient: [Joi.boolean(), Joi.object().allow(null)]
    };
    const schema = Joi.object().keys(keys);
    const results = schema.validate(options);

    return results;
  }
};

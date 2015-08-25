'use strict';

let Config = require('config');
let _ = require('lodash');

module.exports = (configKey, inConfig, defaultConfig) => {
  inConfig = inConfig || { };

  let loadConfig = Config.has(configKey) ? Config.get(configKey) : { };
  let config = _.defaultsDeep({ }, inConfig, loadConfig, defaultConfig);

  return config;
};

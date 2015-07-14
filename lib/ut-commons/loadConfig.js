'use strict';

let Config = require('config');
let _ = require('lodash');

module.exports = (configKey, inConfig, defaultConfig, specialKeys) => {
  let loadConfig = Config.has(configKey) ? Config.get(configKey) : { };
  let config = _.defaults({ }, inConfig, loadConfig, defaultConfig);

  _.each(specialKeys, key => {
    config[key] = _.defaults({ }, inConfig[key], loadConfig[ey], defaultConfig[key]);
  });

  return config;
};

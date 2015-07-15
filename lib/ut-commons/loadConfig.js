'use strict';

let Config = require('config');
let _ = require('lodash');

module.exports = (configKey, inConfig, defaultConfig, specialKeys) => {
  inConfig = inConfig || { };

  let loadConfig = Config.has(configKey) ? Config.get(configKey) : { };
  let config = _.defaults({ }, inConfig, loadConfig, defaultConfig);

  _.each(specialKeys, key => {
    config[key] = _.defaults({ }, inConfig[key], loadConfig[key], defaultConfig[key]);
  });

  return config;
};

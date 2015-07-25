'use strict';

let Util = require('util');
let _ = require('lodash');

let sprintf = Util.format;

exports.loadConfig = require('./loadConfig.js');
exports.createLogger = config => {
  let logLevel = config.level;
  let format = ' %s\t | %s\t | %s\t | %s';

  let boundFn = _.spread(console.log);

  let logFnBuilder = (level) => {
    return () => {
      let endArg = sprintf.apply(this, arguments);
      let args = [format, level, new Date, config.name, endArg];
      boundFn(args);
    };
  }

  let ignore = () => { };

  let log = {
    debug: ignore,
    info: ignore,
    warn: ignore,
    error: ignore
  };

  switch (logLevel) {
  case 'debug':
    log.debug = logFnBuilder('DEBUG');
  case 'info':
    log.info = logFnBuilder('INFO');
  case 'warn':
    log.warn = logFnBuilder('WARN');
  case 'error':
    log.error = logFnBuilder('ERROR');
  default:
    break;
  };
  return log;
};

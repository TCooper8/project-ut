'use strict';

let Promise = require('bluebird');

let Commons = require('../ut-commons');
let Net = require('net');
let Util = require('util');
let Server = require('./server.js');
let _ = require('lodash');

let async = Promise.coroutine;
let sprintf = Util.format;

const configKey = 'ut-cluster.clusterNet';

let defaultConfig = {
  server: {
    port: 8080,
    host: 'localhost'
  },
  logger: {
    name: configKey,
    level: 'info'
  }
};

exports.bind = (inContext) => {
  let context = Commong.loadConfig(configKey, inContext, defaultConfig);
  Server.bind(context.server);
};

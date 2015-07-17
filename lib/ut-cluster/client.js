'use strict';

let Commons = require('../ut-commons');
let Libuuid = require('node-uuid');
let Net = require('net');
let Types = require('./types.js');
let Server = require('./server.js');
let _ = require('lodash');

let g = _.defaults({ }, Types);

exports.bindJoinSuccess = context => {
  let log = context.log;
  let client = context.client;
  let name = client.name;

  return msg => {
    log.info('Succesfully joined server.');

    client.send(g.Leave(name));
    client.shutdown();
  };
};

exports.bindJoinFailure = context => {
  let log = context.log;
  let client = context.client;

  return msg => {
    client.shutdown();
  };
};

let bindConn = (context, conn) => {
  let client = Server.wrapConn(conn);
  context.client = client;

  client.handleJoinSuccess = exports.bindJoinSuccess(context);
  client.handleJoinFailure = exports.bindJoinFailure(context);

  let routes = { };
  routes[g.JoinSuccess.method] = client.handleJoinSuccess;
  routes[g.JoinFailure.method] = client.handleJoinFailure;

  client.on('msg', msg => {
    routes[msg.method](msg);
  });

  client.send(g.Join(client.name));
};

const configKey = 'ut-cluster.client';

let defaultConfig = {
  logger: {
    name: configKey,
    level: 'info'
  }
};

exports.bind = inContext => {
  let context = Commons.loadConfig(configKey, inContext, defaultConfig);
  if (! _.has(context, 'log')) {
    context.log = Commons.createLogger(context.logger);
  }
  let log = context.log;
  let client;

  log.info('Connecting to server...');
  let conn = Net.createConnection(inContext.port, inContext.host, () => {
    bindConn(context, conn);
  });
};

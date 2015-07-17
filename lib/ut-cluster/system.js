'use strict';

let Promise = require('bluebird');

let Bunyan = require('bunyan');
let Commons = require('../ut-commons');
let Libuuid = require('node-uuid');
let Net = require('net');
let Util = require('util');
let _ = require('lodash');

let async = Promise.coroutine;
let sprintf = Util.format;

let defaultArg = (a, b) => {
	if (_.isUndefined(a)) return b;
	return a;
};

let defaultKey = (map, key, defaultValue) => {
	let v = map[key];
	if (_.isUndefined(v)) {
		map[key] = defaultValue;
		return map[key];
	}
	return v;
};

const configKey = 'ut-cluster';

let defaultConfig = {
  port: 2222,
  host: 'localhost',
  peers: [ ],
  logger: {
    name: configKey,
    level: 'info'
  }
};

let makeSystem = async(function*(context) {
  let log = context.log;

  let system = { };
  let curPid = -1;

  system.name = Libuuid();

  // Contains a mapping of actorNames to actors.
  let actorMap = { };
	let routeMap = { };

  let getActorRef = actorName => {
    let actorRef = actorMap[actorName];

    if (_.isUndefined(actorRef)) {
      throw new Error(sprintf(
        'No actor listening to actorName %s',
        actorName
      ));
    }

    return actorRef;
  };

	// Will subscribe an actorRef by name to the routing key and group.
	system.subscribe = (actorRef, routingKey, groupKey) => {
		if (_.isUndefined(routingKey)) {
			throw new Error('RoutingKey is undefined.');
		}
		groupKey = defaultArg(groupKey, 'default');

		let groups = defaultKey(routeMap, routingKey, {});
		let queueSubs = defaultKey(groups, groupKey, []);

		queueSubs.push(actorRef.name);
	};

	system.publish = (msg, sender, routingKey) => {
		let groups = routeMap[routingKey];
		if (!groups) return;

		_.each(groups, queueSubs => {
			if (queueSubs.length === 0) return;
			if (queueSubs.length === 1) {
				getActorRef(queueSubs[0]).send(msg, sender);
				return;
			}

			let actors = _.map(queueSubs, name => getActorRef(name));
			_.sortBy(actors, 'queueLength');

			let actorRef = _.first(actors);
			actorRef.send(msg, sender);
		});
	};

  // Routes will be determined by the routingKey.
  system.sendByName = (msg, name, sender) => {
    let actorRef = getActorRef(name);
    actorRef.send(msg, sender);
  }

  system.actorOf = actorConfig => {
    curPid += 1;

    // If no name is given, one will be assigned;
    let pid = curPid;
    let name = actorConfig.name || sprintf('%s.%s', system.name, pid);
    let receive = actorConfig.receive;

    let actorRef = actorMap[name];
    if (! _.isUndefined(actorRef) ) {
      throw new Error(sprintf(
        'Actor name is not unique %s',
        name
      ));
    }

    actorRef = { };
    actorRef.pid = pid;
    actorRef.name = name;

    actorMap[name] = actorRef;

    actorRef.send = (msg, sender) => {
      if (!sender) {
        sender = system.deadLetter;
      }

      receive(msg, sender, actorRef);
    };

    return actorRef;
  };

  system.deadLetter = system.actorOf({
    receive: () => { }
  });
  system.deadLetter.send = (msg, sender) => {
    log.warn('DeadLetter from %s: %j', sender.name, msg);
  };

  return system;
});

module.exports = async(function*(inConfig) {
  let self = this;

  let config = Commons.loadConfig(configKey, inConfig, defaultConfig, [ 'logger' ]);
  let log = Bunyan.createLogger(config.logger);

  // These will be other cluster systems to communicate with.
  let peers = config.peers;
  let port = config.port;
  let host = config.host;

  let context = {
    config: config,
    log: log
  };

  let system = yield makeSystem(context);

  return system;
});

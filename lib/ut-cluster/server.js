'use strict';

let Commons = require('../ut-commons');
let Net = require('net');
let Types = require('./types.js');
let Client = require('./client.js');
let Util = require('util');
let _ = require('lodash');

let g = _.defaults({ }, Types);

let sprintf = Util.format;

exports.wrapConn = conn => {
  let client = {
    remoteAddress: conn.remoteAddress,
    remotePort: conn.remotePort,
    remoteEndPoint: g.TcpEndPoint(conn.remoteAddress, conn.remotePort)
  };

  client.on = (event, listener) => {
    if (event === 'msg') {
      conn.on('data', data => {
        let msg = JSON.parse(data.toString());
        listener(msg);
      });
    }
    else {
      conn.on(event, listener);
    }
  };

  client.send = msg => {
    let data = JSON.stringify(msg);
    conn.write(data);
  };

  client.shutdown = () => {
    conn.destroy();
  }

  return client;
};

let State = {
  connected: 'Connected',
  unknown: 'Unknown',
  closed: 'Closed'
};

let NetInfo = client => Object({
  name: client.name,
  state: State.connected,
  endPoint: client.remoteEndPoint
});

let ClientSub = () => Object({
	subs: { }
});

let defaultKey = (map, key, defaultValue) => {
  let res = map[key];
  if (_.isUndefined(res)) {
    map[key] = defaultValue;
    return map[key];
  }
  return res;
};

exports.handleClose = context => {
  let log = context.log;
  let clients = context.network.clients;

  return (client) => {
    log.warn('Client %s closed', client.remoteEndPoint);
    if(! _.has(client, 'name') ) {
      // Just let the client close.
      return;
    }

    let name = client.name;
    let info = clients[name];

    if (_.isUndefined(info)) {
      // let the client die.
      return;
    }

    // Switch the client state.
    info.state = State.unknown;
  };
};

exports.handleConnect = (context) => {
  let log = context.log;

  return (conn) => {
    let client = exports.wrapConn(conn);

    client.on('msg', msg => {
      log.info('Got msg method %s', msg.method);

      let reply = {
        'join': context.clientJoin,
        'leave': context.clientLeave
      }[msg.method](client, msg);
    });

    client.on('error', err => {
      context.clientError(client, err);
    });

    client.on('close', () => {
      context.clientClose(client);
    });
  };
};

exports.handleError = context => {
  let clients = context.network.clients;

  return (client, error) => {
    let name = client.name;
    if (_.isUndefined(name)) {
      // Let the client die.
      return;
    }

    let info = clients[name];
    if (_.isUndefined(info)) {
      // Let the client die.
      return;
    }

    // Client is a part of the network, change the state.
    client.state = State.unknown;
  };
};

exports.handleJoin = context => {
  let clients = context.network.clients;

  return (client, msg) => {
    let name = msg.token;
    client.name = name;

    let info = clients[name];
    if (! _.isUndefined(info) ) {
      // Validate the connection.
      return client.send(g.JoinSuccess());
    }

    clients[name] = NetInfo(client);

    return client.send(g.JoinSuccess());
  };
};

// This is a voluntary leave.
exports.handleLeave = context => {
  let clients = context.network.clients;

  return (client, msg) => {
    let name = client.name;
    if (_.isUndefined(name)) {
      return;
    }

    let info = clients[name];
    if (_.isUndefined(info)) {
      return;
    }

    info.state = State.closed;
  };
};

exports.handleSubscribe = context => {
  let network = context.network;
  let clients = network.clients;
  let topics = network.topics;

  return (client, msg) => {
		let clientInfo = clients[client.name];

		if (_.isUndefined(clientInfo)) {
			return client.send(g.SubscribeFailed(
				'ClientNotJoined',
				'Client is not joined in the network.'
			));
		}

    let groupKey = msg.group || 'default';
    let topicKey = msg.topic;

    let groupMap = defaultKey(subs, topicKey, { });
    let subsMap = defaultKey(groupMap, groupKey, { });

    // Check if this client has already subscribed.
    if (! _.has(subsMap, client.name)) {
			let queue = defaultKey(subsMap, client.name, []);
			queue.push(client.name);
    }

		let clientSubs = defaultKey(info, 'subs', { });
		let clientGroups = defaultKey(clientSubs, topicKey, { });
		defaultKey(clientGroups, groupKey, true);

    return client.send(g.SubscribeSuccess());
  };
};

const configKey = 'ut-cluster.server';
let defaultConfig = {
  port: 8080,
  host: 'localhost',
  logger: {
    name: configKey,
    level: 'info'
  }
};

exports.bind = (inContext) => {
  let context = Commons.loadConfig(configKey, inContext, defaultConfig);
  let log = context.log || Commons.createLogger(context.logger);

  let connContext = {
    log: log,
    network: {
      clients: { }
    }
  };

  connContext.clientJoin = exports.handleJoin(connContext);
  connContext.clientLeave = exports.handleLeave(connContext);
  connContext.clientError = exports.handleError(connContext);
  connContext.clientClose = exports.handleClose(connContext);

  log.info('Binding server.');

  let server = Net.createServer( exports.handleConnect(connContext) );

  server.listen(context.port, context.host, () => {
    log.info('Connected to %s:%s', context.host, context.port);
  });

  if (_.has(context, 'cluster')) {
    let cluster = context.cluster;

    _.each(cluster.seeds, seed => {
      let clientContext = {
        logger: {
          name: sprintf('Client(%s)', seed.port)
        },
        network: connContext.network,
        port: seed.port,
        host: seed.host
      };
      Client.bind(clientContext);
    });
  }
};

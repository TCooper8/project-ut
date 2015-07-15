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

let makeNetcom = async(function*(context, system, host, port) {
  let task = Promise.defer();

  let log = context.log;

  let clients = { };

  let addClient = client => {
    if (_.has(clients, client.name)) {
      throw new Error(sprintf(
        'Client %s already joined.',
        client.name
      ));
    }

    clients[client.name] = client;

    client.conn.on('data', data => {
      console.log('Received from %s =>', client.name);
      console.dir(data);
    });

    client.conn.on('end', () => {
      delete clients[client.name];
      console.log('Client %s closed', client.name);
    });

    client.conn.on('error', err => {
      console.error('ClientError %s: %s', client.name, err.stack);
    });
  };

  let asyncConn = async(function*(options) {
    let task = Promise.defer();

    let client = { };
    client.isConnected = false;

    let conn = Net.connect(options, () => {
      client.isConnected = true;
      task.resolve(client);
    });

    conn.once('error', err => {
      task.reject(err);
      client.isConnected = false;
    });

    client.write = conn.write;

    return yield task.promise;
  });

  let handleNewPeers = peers => {
    _.each(peers, peer => {
      let conn = net.connect(peer, () => {

      });
    });
  };

  let server = Net.createServer( client => {
    conn.once('data', data => {
      // This has to be the connMsg reply.
      try {
        let resp = JSON.parse(data.toString());

        let name = resp.name;
        let peers = resp.peers;

        // Add peers to the system.
        let newPeers = _.diff(peers, system.peers);
        system.peers.concat(newPeers);
        handleNewPeers(newPeers);

        if (! _.every([name, peers], v => !_.isUndefined(v)) ) {
          throw new Error(sprintf(
            'Invalid response %j',
            resp
          ));
        }

        let client = {
          name: name,
          conn: conn
        };
        addClient(client);
      }
      catch (err) {
        console.error('Conn error: %s', err.stack);
        conn.end();
      }
    });

    let connMsg = {
      name: system.name
      peers: system.peers
    };

    conn.write(JSON.stringify(connMsg));
  });

  server.listen({
    host: host,
    port: port,
    exclusive: true
  }, () => {
    log.info('Started tcp server on %s:%s', host, port);
    task.resolve();
  });

  // This will only fire if the server fails to connect.
  server.on('error', err => {
    task.reject(err);

    log.error(err, 'Server error.');
  });

  yield task.promise;

  self.connect = peer => {
    let task = Promise.defer();

    let client = { };

    let conn = Net.createConnection(peer, () => {
      client.remoteAddress = conn.remoteAddress;
    });

    return task.promise;
  };
});

let makeSystem = async(function*(context) {
  let log = context.log;

  let system = { };
  let curPid = -1;

  system.name = Libuuid();

  // Contains a mapping of actorNames to actors.
  let actorMap = { };

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

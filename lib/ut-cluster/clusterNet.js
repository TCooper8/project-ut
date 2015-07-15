'use strict';

let Promise = require('bluebird');

let Net = require('net');

let async = Promise.coroutine;

let clientConnect = peer => {
  let task = Promise.defer();

  let conn = Net.connect(peer, () => {
    task.resolve(conn);
  });

  conn.once('error', err => {
    task.reject(err);
  });

  yield task.promise;
  conn.removeAllListeners('error');

  let client = {
    remoteAddress: conn.remoteAddress,
    isConnected: true
  };

  conn.on('error', err => {
    client.isConnected = false;
  });

  client.write = (msg, serialize) => {
    let data;
    if (serialize) data = JSON.stringify(msg);
    else data = msg;

    let task = Promise.defer();

    conn.write(data, () => {
      task.resolve();
    });

    return task.promise;
  };

  client.read = (parse) => {
    let task = Promise.defer();

    conn.once('data', data => {
      if (parse) {
        try {
          let msg = JSON.parse(data);
          task.resolve(msg);
        }
        catch (err) {
          task.reject(err);
        }
      }
      else {
        task.resolve(data);
      }
    });

    return task.promise;
  };

  return client;
};

let EndPoint = (port, host) => Object({
  port: port,
  host: host
});

let Join = (name, group, endPoint, seeds) => Object({
  name: name,
  group: group,
  endPoint: endPoint,
  seeds: seeds
});

module.exports = (context, system, host, port) =.> {
  let config = context.config;
  let cluster = config.cluster;
  let log = context.log;

  let knownNetwork = { };
  let groupNetwork = { };
  let activeClients = { };

  let server = Net.createServer( conn => {

  });

  // This will enact a discovery mechanism, and looking for group to the cluster.
  let clientJoin = async(function*(client) {
    // Publish a join request to the client.
    let join = Join(
      system.name,
      system.group,
      EndPoint(config.port, config.host),
      cluster.seeds,
      groups: system.groups
    );
    yield client.write(join, true);
    let resp = yield client.read(true);

    return resp;
  });

  let clientJoins = async(function*(clients) {
    let success = [];
    let fails = [];

    yield Promise.all(_.map(clients, client => {
      return clientJoin(client)
        .then( resp => {
          activeClients[client.remoteAddress] = client;
          success.push({
            client: client,
            resp: resp
          });
        })
        .catch( err => {
          log.warn('Unable to send join to client %s : %s', client.remoteAddress, err);
          fails.push(client);
        });
    }));

    // Retry joins for those that failed.
    Promise.delay(cluster.retryJoinTimeout).then( () => {
      clientJoins(fails);
    });


  });

  let initPeers = async(function*(peers, peerRetries) {
    peerRetries = peerRetires || { };

    let clients = [];
    let failures = [];

    // Attempt to connect to the peers.
    yield Promise.all(_.map(peers, peer => {
      return clientConnect(peer)
        .then( clients.push )
        .catch( err => {
          log.warn('Unable to connect to peer %s: %s', peer, err.stack);
          failures.push(peer)
        });
    }));

    // Filter out those that have exceeded retries.
    failures = _.reduce(failures, (acc, peer) => {
      let retries = peerRetries[peer] || 0;
      if (retries > cluster.retryJoinMax) {
        log.warn('Exceeded max join retries for peer %s', peer);
        return acc;
      }

      peerRetries[peer] = retries + 1;
      return acc.concat(peer);
    }, []);

    // In some timeout, retry for the failed peers until retry max.
    Promise.delay(cluster.retryJoinTimeout).then( () => {
      initPeers(failures);
    });

    // Continue with the client joins.
    yield clientJoins(clients);
  });

  // Initializes cluster
  yield initPeers(system.peers);
};

/*

let system = Commons.actor.system({
  port: 2222,
  groups: ['A'], // Defaults to 'Default'
  cluster: {
    seeds: 'tcp://SystemA@localhost:2223',
    seedsTimeout: 5000,
    retryJoinTimeout: 5000,
    retryJoinMax: 5,
    gossipInterval: 1000,
    leaderActionsInterval: 1000,
  }
});

*/

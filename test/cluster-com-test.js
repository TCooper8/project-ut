'use strict';

let Commons = require('../lib/ut-commons');
let Cluster = require('../lib/ut-cluster');

let A = Cluster.system({
  port: 2222,
  logger: {
    name: 'A'
  }
});
let B = Cluster.system({
  port: 2223,
  logger: {
    name: 'B'
  },
  peers: [ {
    port: 2222,
    host: 'localhost'
  }]
});


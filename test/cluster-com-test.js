'use strict';

let Commons = require('../lib/ut-commons');
let Cluster = require('../lib/ut-cluster');

let A = Cluster.server.bind({
  port: 2222,
  host: 'localhost'
});

let B = Cluster.server.bind({
  port: 2223,
  host: 'localhost',
  cluster: {
    seeds: [
      { port: 2222, host: 'localhost' }
    ]
  }
});

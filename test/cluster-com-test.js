'use strict';

let Commons = require('../lib/ut-commons');
let Cluster = require('../lib/ut-cluster');

let A = Cluster.server.bind({
  server: {
    port: 2222,
    host: 'localhost'
  }
});

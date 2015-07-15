'use strict';

let Promise = require('bluebird');
let Commons = require('../lib/ut-commons');
let Cluster = require('../lib/ut-cluster');

let async = Promise.coroutine;

async(function*() {
  let A = yield Cluster.system({
    port: 2222,
    logger: {
      name: 'A'
    }
  });

  let a = A.actorOf({
    name: 'a',
    receive: (msg, sender) => {
      console.log('actor %s received %j', a.name, msg);
      sender.send('Hello back!', a);
    }
  });

  let b = A.actorOf({
    name: 'b',
    receive: (msg, sender) => {
      console.log('Actor %s recevied %j', b.name, msg);
    }
  });

  a.send('Hello', b);
  A.sendByName('Hello', a.name);

})().catch( err => console.error('Cannot start: %s', err.stack) );

'use strict';

let Promise = require('bluebird');
let _ = require('lodash');

let Async = { };

Async.bind = routine => Promise.coroutine(routine);

global.Async = Async;

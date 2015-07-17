'use strict';

let _ = require('lodash');
let Types = require('./types.js');

_.each(Types, (v, k) => exports[k] = v);
exports.server = require('./server.js');


'use strict';

let Promise = require('bluebird');
let Bunyan = require('bunyan');
let Binding = require('../lib/binding');
let BindModel = Binding.BindModel;
let _ = require('lodash');

let bindLog = BindModel({
  config: {
    log: {
      name: String,
      level: String
    }
  }
})('log', context => {
  return Bunyan.createLogger(context.config.log);
});

let bindWrite = BindModel({
  log: Object,
  read: Function,
  fileCache: {
    _type: Object,
    _default: () => Object()
  }
})('write', context => (key, val) => _.set(context.fileCache, key, val));

let bindRead = BindModel({
  log: Object,
  fileCache: {
    _type: Object,
    _default: () => Object()
  }
})('read', context => {
  return key => _.get(context.fileCache, key);
});

describe('Binding some context to the model', () => {
	it('Should pass validation', done => {
		let context = {
      config: {
        log: {
          name: 'bob',
          level: 'warn'
        }
      }
		};

    Promise.coroutine(function*() {
      yield bindLog(context);
      yield bindRead(context);
      yield bindWrite(context);

      console.log('Resulting context =>');
      console.dir(context);

    })().then(done).catch(done);
	});
});

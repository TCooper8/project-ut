'use strict';

let Promise = require('bluebird');

let Commons = require('../ut-commons');
let Bunyan = require('bunyan');
let Mongoose = require('mongoose');
let Util = require('util');
let Libuuid = require('node-uuid');
let _ = require('lodash');

let Schema = Mongoose.Schema;

let async = Promise.coroutine;
let sprintf = Util.format;

const configKey = 'ut-auth';

let defaultConfig = {
  logger: {
    name: configKey,
    level: 'info'
  },
  mongo: {
    endPoint: 'mongodb://localhost/' + configKey
  }
};

let liftP = () => {
  let keys = arguments;
  return promise => promise
    .then( () => {
      let args = arguments;
      return _.reduce(_.range(keys), (acc, i) => {
        acc[keys[i]] = args[i]; return acc;
      }, { });
    })
    .catch( err => {
      return {
        error: err
      };
    });
};

let profileSchema = new Schema({
  username: String,
  password: String,
  salt: String,
  email: String,
  dates: {
    lastLogin: Date,
    createdOn: Date,
    birthdate: Date
  },
  publicInfo: {
    screenName: String
  }
});

profileSchema.statics.findByUsername = (username, cb) => {
  return this.find({ username: username }, cb);
};

let initMongo = async(function*(context) {
  let config = context.config.mongo;
  let log = _.has(config, 'logger') ? Bunyan.createLogger(config.logger) : context.log;

  Mongoose.connect(config.mongo.endPoint);
  let Profile = Mongoose.model('Profile', profileSchema);

  let self = { };

  // Returns a single profile that is linked to the username.
  self.findByUsername = username => {
    let task = Promise.defer();

    Profile.findByUsername(username, (err, res) => {
      if (err) {
        task.reject(err);
        return;
      }
      else if (res.length !== 1) {
        let err = new Error('Authentication failure, multiple user profiles linking to same username.');
        err.code = 'MultiUserError';
        task.reject(err);
        return;
      }

      let profile = res[0];
      task.resolve(profile);
    });

    return task.promise;
  };
});

let saltHash = async(function*(password, salt) {
  let attempt = () => {
    let task = Promise.defer();
    Crypto.pbkdf2(password, salt, 4096, 512, 'sha256', (err, key) => {
      err ? task.reject(err) : task.resolve(key);
    });
    return task.promise;
  }

  let maxAttempts = 5;
  let attempts = -1;

  while (attempts < maxAttempts) {
    attempts += 1;
    try {
      let res = yield attempt();
      return res;
    }
    catch (err) { }
  }

  throw new Error('Unable to hash');
});

module.exports = async(function*(inConfig) {
  let self = this;
  let config = Commons.loadConfig(configKey, inConfig, defaultConfig, [ 'logger', 'mongo' ]);

  let log = Bunyan.createLogger(config.logger);

  let context = {
    config: config,
    log: log
  };

  let db = yield initMongo(context);
  let service = Commons.eventConsumer({
    responds: [
      { msg: 'ut-auth.login',
        group: 'auth'
      },
      { msg: 'ut-auth.logout',
        group: 'auth'
      }
    ]
  });

  let handleLogin = async(function*(msg) {
    let username = msg.username;
    let password = msg.password;

    let res = liftP('profile')(db.findByUsername(username));
    if (res.error) {
      return new Failure(
        'DBError',
        res.error
      );
    }

    let profile = res.profile;
    let _password = profile.password;
    let salt = profile.salt;

    let hash = saltHash(password, salt);
    if (hash !== _password) {
      return new Failure(
        'BadCredentials',
        'Unable to login.'
      );
    }

    return new Success({
      token: Libuuid()
    });
  });

  service.on('ut-auth.login', msg => {
    return handleLogin(msg).catch( err => {
      return new Failure('HandleError', err);
    });
  });

  service.on('ut-auth.logout', msg => {
    return handleLogout(msg).catch( err => {
      return new Failure('HandleError', err);
    });
  });

  return self;
});

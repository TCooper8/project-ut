'use strict';

let _ = require('lodash');
let Commons = require('../ut-commons');
let Actor = require('./actor.js');

const configKey = 'ut-commons.actorSystem';
const defaultConfig = {
	logger: {
		name: configKey,
		level: 'info'
	}
};

let defaultKey = (map, key, val) => {
	let v = map[key];
	if (_.isUndefined(v)) {
		map[key] = val;
		return map[key];
	}
	return v;
};

module.exports = (context, inConfig) => {
	let config = Commons.loadConfig(configKey, inConfig, defaultConfig);
	let log = _.has(context, 'log') ? 
		context.log : Commons.createLogger(config.logger);

	let self = {
		log: log
	};

	self.spawnActor = func => {
		let actor = Actor(self);
		// They should fill the actor with their own values here.
		func(actor);
	};
};

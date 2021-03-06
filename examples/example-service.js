'use strict';

let Promise = require('bluebird');
let Commons = require('./ut-commons');

let async = Promise.coroutine;

const configKey = 'bb-auth';

module.exports = function(config) {
	let self = this;

	config = loadConfig(configKey, config);

	let service = Commons.service.create({
		responds: [{
			key: 'ut-auth.login',
			group: 'auths'
		}, {
			key: 'ut-auth.logout',
			group: 'auths'
		}]
	});

	service.on('ut-auth.login', msg => {
		let username = msg.username;
		let password = msg.password;
		let originIp = msg.originIp;

		return new Failure(
			'AuthFailed',
			'No authentication mechanism available.'
		);
	});

	service.on('at-auth.logout', msg => {
		let token = msg.token;

		return new Failure(
			'AuthFailed',
			'No authentication mechanism available.'
		);
	});

	self.init = async(function*() {
		yield service.connect();
	});
};














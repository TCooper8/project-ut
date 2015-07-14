'use strict';

let Promise = require('bluebird');
let Commons = require('./ut-commons');
let Mongoose = require('mongoose');

let async = Promise.coroutine;

const configKey = 'bb-auth';

let credSchema = {
	emailAddress: String,
	username: String,
	password: String,
	lastLogin: Date,
	loginFailedAttempts: Number,
	firstName: String,
	lastName: String
};

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

	let Cred = Mongoose.model('Cred', credSchema);
	let db = mongoose.Connect(config.db.endPoint);

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














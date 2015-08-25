'use strict';

let Promise = require('bluebird');

let Amqp = require('amqplib');
let Util = require('util');
let Libuuid = require('node-uuid');
let _ = require('lodash');

let sprintf = Util.format;

let multiBinding = (msgKey, bindings) => {
	return obj => {
		_.each(bindings, binding => {
			let key = binding.key;
			let rule = binding.rule;

			let val = obj[key];

			try {
				rule(val);
			}
			catch (err) {
				let err = new Error(sprintf(
					'ArgError: msgKey => %s | key => %s | msg => %s',
					msgKey
					key,
					err
				));
				throw err;
			}
		});
	};
};

let stringBinding = (key) => Object({
	key: key,
	rule: v => {
		if (! _.isString(v) ) {
			throw new Error('Argument must be a string!');
		}
	}
});

let makeBindings = (msgKey, desc) => {
	let loop = (key, idesc) => {
		if (idesc === String) {
			return stringBinding(key);
		}
		else if ( _.isObject(idesc) ) {
			let bindings = _.map(idesc, (v, k) => loop(k, v));
			return obj => {
				let v = obj[key];
				_.each(bindings, binding => binding(v));
			};
		}
		else {
			throw new Error(sprintf(
				'Invalid message description. MsgKey => %s | argKey => %s | desc => %s',
				msgKey,
				key,
				desc
			)):
		}
	};

	let bindings = _.map(desc, (v, k) => loop(k, v));
	return multiBinding(mksgKey, bindings);
};

let bindingsCache = { };
let amqpCache = { };

module.exports = config => {
	let responds = config.responds;
	let bindings = _.reduce(responds, (acc, desc) => {
		let msgKey = desc.msg;
		let group = desc.group || "default";

		if (_.has(bindingsCache, msgKey)) {
			acc[msgKey] = {
				msgKey: msgKey,
				bindings: bindingsCache[msgKey],
				group: group
			};
			return acc;
		}

		let msgKeyParts = msgKey.split('.');

		let dotIndex = msgKey.indexOf('.');

		let msgRoot = msgKey.slice(0, dotIndex);
		let msgTail = msgKey.slice(dotIndex);

		let msgDesc = require(sprintf('../messages/%s.js', msgRoot))[msgTail];
		let bindings = makeBindings(msgKey, msgDesc);

		bindingsCache[msgKey] = bindings;

		acc[msgKey] = {
			rules: bindings,
			group: group,
			msgKey: msgKey
		};
		return acc;
	}, { });

	let self = { };

	let listenersMap = { };

	self.on = (msgKey, func) => {
		if (_.has(listenersMap, msgKey)) {
			listenersMap[msgKey].push(func);
		}
		else {
			listenersMap[msgKey] = [ func ];
		}
	};

	self.connect = async(function*(host) {
		let amqp = amqpCache[host];

		if (_.isUndefined(amqp)) {
			let conn = yield Amqp.connect(host);
			let chan = yield conn.createChannel();
			amqp = {
				conn: conn,
				chan: chan
			};
			amqpCache[host] = amqp;
		}

		let conn = amqp.conn;
		let chan = amqp.chan;

		let msgKeys = _.keys(bindings);
		for (let i = 0; i < msgKeys.length; i++) {
			let msgKey = msgKeys[i];
			let listeners = listenersMap[msgKey];

			if (!listeners) {
				throw new Error(sprintf(
					'No listeners defined for msgKey %s',
					msgKey
				)):
			}

			let binding = bindings[msgKey];

			let rules = binding.rules;
			let group = binding.group;

			let queueName = sprintf('%s.%s', msgKey, group); 
			let routingKey = msgKey;

			yield chan.assertQueue(queueName, { durable: false, autodelete: true );
			yield chan.prefetch(1);

			let reply = letter => {
				try {
					let msg = JSON.parse(letter.msg.toString());


				}
			};

			yield chan.consume(
		}	
	});

	return self;
};

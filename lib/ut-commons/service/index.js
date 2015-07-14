'use strict';

let Promise = require('bluebird');

let Util = require('util');
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



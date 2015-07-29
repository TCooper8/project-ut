'use strict';

let sprintf = require('util').format;
let Match = require('../match');
let _ = require('lodash');

let bindTypePredicate = (typeKey, predicate) => key => context => Match.bind([
	Match.val( false )( () => sprintf(
		'Expected key( %s ) to have type( %s ), but got val( %j )',
		key,
		typeKey,
		val
	)),
	Match.val( true )( () => undefined )
])(predicate(val));

let bindStringType = bindTypePredicate('String', _.isString);
let bindNumberType = bindTypePredicate('Number', _.isNumber);
let bindObjectType = bindTypePredicate('Object', _.isObject);

let ignore = () => undefined;

let createRule = (key, desc) => {
	let rule = {
		key: key
	};

	if (_.has(desc, '_default')) {
		rule.default = desc._default;
	}

	rule.bind = Match.bind([
		Match.val(String)( () => bindStringType(key) ),
		Match.val(Number)( () => bindNumberType(key) ),
		Match.objHas('_type')( () => createRule(key, desc._type).bind ),
		Match.object( () => {
			let bindings = _.filter(_.map(desc, (childDesc, k) => {
				Match.bind([
					Match.String.startsWith('_')(ignore),
					Match.any( childKey => createRule(
						sprintf('%s.%s', key, childKey),
						childDesc
					))
				])(k);
			}));

			return context => {
				let msgs = _.filter(_.map(bindings, binding => binding(context)));
				if (msgs.length === 0) return;
				return msgs.join('\n');
			};
		})
	])(desc);
};

let applyRules = rules => Async.bind(function*(context) {
	//let msgs = _.map(rules, rule => {
	//	return Match.bind([
	//		Match.val(undefined)(ignore),
	//		Match.string( msg => Object({
	//			rule: rule,
	//			msg: msg
	//		}))
	//	])(rule.bind(context));
	//});

	let msgs = [];
	for (let i = 0; i < rules.length; i++) {
		let rule = rules[i];
		console.log(rule);


		let bindMsg = rule.bind(context);
		if (_.isUndefined(bindMsg)) continue;

		// The message is defined, check for a default.
		if (_.has(rule, 'default')) {
			let def = rule.default;
			if (_.isFunction(def)) {
				let ctx = _.copy(context, true);
				def = def(ctx);
			}
			
			if (def instanceof Promise) {
				def = yield def;
			}

			_.set(context, rule.key, def);
			continue;
		}

		msgs.push(bindMsg);
	}
	console.log(msgs);

	if (msgs.length === 0) {
		return;
	}

	return msgs.join('\n');
});

module.exports = ruleDesc => {
	let rules = _.filter(_.map(ruleDesc, (desc, key) => {
		if (key.startsWith('_')) return undefined;
		return createRule(key, desc);
	}));

	return method => Async.bind(function*(context) {
		let msg = yield applyRules(rules)(context);
		if (_.isUndefined(msg)) return;

		throw new Error('Unable to bind %s to context \n%s', method, msg);
	});
};

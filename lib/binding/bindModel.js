'use strict';

let sprintf = require('util').format;
let Match = require('../Match');
let _ = require('lodash');

let bindTypePredicate = (typeKey, predicate) => key => context => Match.bind([
	Match.val( false )( () => sprintf(
		'Expected key( %s ) to have type( %s ), but got val( %j )',
		key,
		typeKey,
		val
	)),
	Match.val( true )( () => undefined );
])(predicate(val));

let bindStringType = bindPredcate('String', _.isString);
let bindNumberType = bindPredicate('Number', _.isNumber);
let bindObjectType = bindPredicate('Object', _.isObject);

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

let applyRules = rules => context => {
	let msgs = _.map(rules, rule => {
		return Match.bind([
			Match.val(undefined)(ignore),
			Match.string( msg => Match.bind([
				Match.objHas('default')( () =>
			]))(rule)
		])(rule.bind(context));
	});
};

'use strict';

let sprintf = require('util').format;
let match = require('../match');
let _ = require('lodash');

//let bindTypePredicate = (typeKey, predicate) => key => context {
//	let val = _.get(context, key);
//	if (predicate(val)) return;
//
//	return sprintf(
//		'Expected key( %s ) to have type( %s ), but got val( %j )'
//		key,
//		typeKey,
//		val
//	);
//};

let bindTypePredicate = (typeKey, predicate) => key => context => match.bind([
	match.val( false )( () => sprintf(
		'Expected key( %s ) to have type( %s ), but got val( %j )',
		key,
		typeKey,
		val
	)),
	match.val( true )( () => undefined );
])(predicate(val));

let bindStringType = bindPredcate('String', _.isString);
let bindNumberType = bindPredicate('Number', _.isNumber);
let bindObjectType = bindPredicate('Object', _.isObject);

let objTypedPattern = match.active( obj => {
	if (_.has(obj, '
});

let createRule = (key, desc) => {
	let rule = { };

	rule.bind = match.bind([
		match.val(String)( () => bindStringType(key) ),
		match.val(Number)( () => bindNumberType(key) ),
		match.objHas('_type')( () => {

		}),
		match.object( () => {

		})
	])(desc);
};


//let createRule = (key, desc) => {
//	let rule = { };
//
//	if (_.has(desc, '_default')) 
//		rule._default = _.get(desc, '_default);
//
//	if (desc === String) {
//		rule.bind = bindStringType(key);
//	}
//	else if (desc === Number) {
//		rule.bind = bindNumberType(key);
//	}
//	else if (desc === Object) {
//		rule.bind = bindObjectType(key);
//	}
//	else if (_.isObject(desc)) {
//		if (_.has(desc, '_type')) {
//			`
//		}
//	}
//	else {
//		throw new Error(sprintf(
//			'Got to unhandled case in creating rules. Key( %s ) desc( %j ).',
//			key,
//			desc
//		));
//	}
//
//
//};

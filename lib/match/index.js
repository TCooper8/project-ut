'use strict';

let System = require('../system');
let _ = require('lodash');

let pipe = v => f => f(v);
let cons = ls => f => f(_.first(ls), _.rest(ls));

exports.bind = patterns => value => {
	let loop = acc =>
		_.isEmpty(acc) ?
			None : cons(acc)( (h,t) => {
				let res = h(value);
				return res.isNone() ?
					loop(t) : res;
			});
	let res = loop(patterns);
	if (res.isNone()) {
		throw Exception('MatchException', 'Value could not be matched by expression');
	}
		
	return res.get();
};

exports.number = mapping => any =>
	_.isNumber(any) ?
		Some(mapping(any)) : None;

exports.active = binder => func => any =>
	pipe(binder(any))( res =>
		res.isNone() ?
			None : Some(func(res.get()))
	);

exports.objHas = key => mapping => obj =>
	_.isObject(obj) ?
		_.has(obj, key) ?
			Some(mapping(obj)) :
			None :
		None;

exports.String = { };
exports.String.startsWith = key => mapping => obj =>
	_.isString(obj) ?
		obj.startsWith(key) ?
			Some(mapping(obj)) :
			None :
		None;

exports.string = mapping => obj =>
	_.isString(obj) ?
		Some(mapping(obj)) : None;

exports.object = mapping => obj =>
	_.isObject(obj) ?
		Some(mapping(obj)) : None;

exports.int = mapping => obj =>
	_.isNumber(obj) ?
		Number.isInteger(obj) ?
			Some(mapping(obj)) :
			None :
		None;

exports.val = what => mapping => obj =>
	what === obj ?
		Some(mapping(obj)) :
		None;

exports.stringSliceAt = i => func => exports.bind([
	exports.string( str => pipe(func(str.slice(i)))(Some)),
	exports.any(None)
]);

exports.stringSplitAt = i => func => exports.bind([
	exports.string( str => {
		let h = str.slice(0, i);
		let t = str.slice(i);
		return Some(func(h, t));
	}),
	exports.any(None)
]);

exports.any = mapping => any =>
	Some(mapping(any));

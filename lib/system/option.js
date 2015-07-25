'use strict';

require('./exn.js');

global.Some = val => Object({
	isNone: () => false,
	get: () => val
});

global.None = {
	isNone: () => true,
	get: () => { throw Exception('ArgumentException', 'Cannot get value from None object.') }
};

let Option = { };

Option.bind = mapping => option => 
	option.isNone() ?
		None	:
		mapping(option.get());

Option.count = option => 
	option.isNone() ? 
		0 : 1;

Option.exists = predicate => option => 
	option.isNone() ? 
		false : predicate(option.get());

Option.fold = folder => state => option =>
	option.isNone() ?
		state	: folder(state)(option.get());

Option.foldBack = folder => option => state =>
	option.isNone() ?
		state	: folder(option.get())(state);

Option.forall = predicate => option =>
	option.isNone() ?
		false : predicate(option.get());

Option.get = option => 
	option.get();

Option.isNone = option => 
	option.isNone();

Option.isSome = option =>
	! option.isNone();

Option.map = mapping => option =>
	option.isNone() ?
		undefined	:
		Some(mapping(option.get()));

Option.toArray = option =>
	option.isNone() ?
		[]	:
		[ option.get() ];

Option.getOrElse = option => defaultArg =>
	option.isNone() ?
		defaultArg : option.get();

Option.getOrElsef = option => func =>
	option.isNone() ?
		func() : option.get();
		
global.Option = Option;

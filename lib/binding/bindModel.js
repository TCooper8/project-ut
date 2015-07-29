'use strict';

let sprintf = require('util').format;
let Match = require('../match');
let _ = require('lodash');

let ignore = () => undefined;

let bindTypePredicate = (typeKey, predicate) => key => context => Match.bind([
	Match.val( false )( () => sprintf(
		'Expected key( %s ) to have type( %s ), but got val( %j )',
		key,
		typeKey,
		_.get(context, key)
  )),
	Match.val( true )(ignore)
])(predicate(_.get(context, key)));

let bindStringType = key =>
  Match.val(String)( () => bindTypePredicate('String', _.isString)(key) );

let bindNumberType = key =>
  Match.val(Number)( () => bindTypePredicate('Number', _.isNumber)(key) );

let bindObjectType = key =>
  Match.val(Object)( () => bindTypePredicate('Object', _.isObject)(key) );

let bindFunctionType = key =>
  Match.val(Function)( () => bindTypePredicate('Function', _.isFunction)(key) );

let createRule = (key, desc) => {
	let rule = {
		key: key
	};

	if (_.has(desc, '_default')) {
		rule.default = desc._default;
  }

  console.log('Creating rule for %s', key);

	rule.bind = Match.bind([
    bindStringType(key),
    bindNumberType(key),
    bindObjectType(key),
    bindFunctionType(key),
		Match.objHas('_type')( () => createRule(key, desc._type).bind ),
		Match.object( () => {
			let bindings = _.filter(_.map(desc, (childDesc, k) => Match.bind([
        Match.String.startsWith('_')(ignore),
        Match.any( childKey => createRule(
          sprintf('%s.%s', key, childKey),
          childDesc
        ))
			])(k)));

      console.log('Created child rules for %s', key);
      rule.childRules = bindings;

      return bindTypePredicate('Object', _.isObject)(key);
		})
	])(desc);

  return rule;
};

let applyRules = rules => Async.bind(function*(context) {
  if (_.isUndefined(rules)) return;

	let msgs = [];

	for (let i = 0; i < rules.length; i++) {
		let rule = rules[i];

    if (_.has(context, rule.key)) {
      if (_.has(rule, 'childRules')) {
        let childMsg = yield applyRules(rule.childRules)(context);
        msgs.push(childMsg);
      }
      continue;
    };

		let bindMsg = rule.bind(context);

		if (_.isUndefined(bindMsg)) {
      msgs.push(bindMsg);
      _.set(closed, rule.key, true);

      if (! _.has(rule, 'childRules')) continue;

      let childMsg = yield applyRules(rule.childRules)(context);
      msgs.push(childMsg);
      continue;
    }

		// The message is defined, check for a default.
		if (_.has(rule, 'default')) {
			let def = rule.default;
			if (_.isFunction(def)) {
				let ctx = _.clone(context, true);
				def = def(ctx);
			}

			if (def instanceof Promise) {
				def = yield def;
			}

			_.set(context, rule.key, def);
      let newMsg = yield applyRules([rule])(context);
      msgs.push(newMsg);
			continue;
		}

    if (_.has(rule, 'childRules')) {
      console.log('Resolving child rules for %s', rule.key);
      //let childMsg = yield applyRules(rule.childRules)(context);
      //msgs.push(childMsg);
      i = i - 1;
      continue;
    }

		msgs.push(bindMsg);
	}

  msgs = _.filter(msgs);

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

	return (method, func) => Async.bind(function*(context) {
		let msg = yield applyRules(rules)(context);

		if (_.isUndefined(msg) || msg === '') {
      let binding = func(_.clone(context, true));
      _.set(context, method, binding);
      console.log('Result from binding => %s', method);

      return;
    };

    msg = sprintf('Unable to bind %s to context \n%s', method, msg);
    throw new Error(msg);
	});
};

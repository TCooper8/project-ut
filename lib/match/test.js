'use strict';

let _ = require('lodash');

let match = require('./index.js');

Object.prototype.with = params => {
	return _.defaultsDeep({ }, this, params);
};

let obj = {
	type: 'Obj',
	name: 'bob'
};
let obj2 = obj.with({ title: 'lord!' })
console.log(obj);
console.log(obj2);

let m = match.bind([
	match.stringSplitAt(5)( (h,t) => t + h ),
	match.number( n => n.toString().slice(5) ),
	match.any( obj => "Hello!")
])("Hello world!")

console.log("result => %s", m);

m = match.bind([
	match.int( i => i * 2 )
])(5.5);

console.log("result => %s", m);

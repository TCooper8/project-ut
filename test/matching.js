'use strict';

let Match = require('../lib/match');
let _ = require('lodash');

describe('Testing pattern matching.', () => {
	describe('Basic type matching', () => {
		it('Should pass basic type matching', () => {
			_.every([5.5, 5, 0.5], n => 
				Match.bind([
					Match.number( n => true )
				])(n));

			try {
				Match.bind([
					Match.int( n => true )
				])(5.5);

				throw Error('Invalid bad-match');
			} catch (err) { } 
		});

		it ('Should match for object keys', () => {

			Match.bind([
				Match.objHas('name')( obj => true )
			])({
				name: 'bob'
			});

			try {
				Match.bind([
					Match.objHas('name')( obj => true )
				])({ });
			} catch(err) { }
		});

		it('Should pass multiple match expressions', () => {
			Match.bind([
				Match.object( o => { throw 'Invalid match!' } ),
				Match.int( i => i )
			])(5);

			_.every( _.map(_.range(1000), i => Match.bind([
				Match.object( o => { throw 'Invalid object match' } ),
				Match.objHas('key')( o => { throw 'Invalid objHas match' } ),
				Match.int( i => true )
			])(i)));
		});
	});
});

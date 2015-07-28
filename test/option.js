'use strict';

require('../lib/system');

describe('Option testing.', () => {
	it('Option methods.', () => {
		let o = Some(5);
		let res = Option.map( i => i * 2 )(o);
		Option.map( console.log )( res );
	});
});

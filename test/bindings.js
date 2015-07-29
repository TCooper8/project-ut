'use strict';

let Promise = require('bluebird');
let Binding = require('../lib/binding');
let BindModel = Binding.BindModel;

let bind = BindModel({
	config: {
		log: {
			name: String,
			level: String
		}
	}
})('test');

describe('Binding some context to the model', () => {
	it('Should pass validation', done => {
		let context = {
			config: {
				log: {
					level: 'info'
				}
			}
		};
		bind(context).then(done).catch(done);
	});
});

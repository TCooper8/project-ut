'use strict';

module.exports = {
	'bb-auth.login': {
		request: {
			username: String,
			password: String,
			originIp: String
		},
		reponse: {
			Try: {
				token: String
			}
		}
	},
	'bb-auth.logout': {
		request: {
			token: String
		},
		response: {
			Try: undefined
		}
	}
};













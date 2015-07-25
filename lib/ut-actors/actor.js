'use strict';

let _ = require('lodash');

module.exports = (context, desc) => {
	let self = { }
	_.defaults(self, desc, {
		postRestart: () => { },
		postStop: () => { },
		preRestart: () => { },
		preStart: () => { },
		self: self,
		context: context,
		sender: context.deadLetters,
		receive: () => { }
	});

	return self;
};

/*

let actorA = system.spawnActor( self => {
	self.receive = msg => {
		self.log('Got %j', msg);
		self.sender.send(msg);
	};
});

let actorB = system.makeActor( self => {
	self.name = 'actorB';

	self.context.watch(actorA);

	self.receive = msg => {
		switch (msg.case) {
		case 'Terminated': 
			self.log('%s was terminaed', msg.who);
			break;

		default:
			self.log('Got %j', msg);
		}	
	};
});

*/

'use strict';

let Util = require('util');

let sprintf = Util.format;

exports.EndPoint = (protocol, host, port) => sprintf('%s://%s:%s', protocol, host, port);

exports.TcpEndPoint = (host, port) => exports.EndPoint('tcp', host, port);

exports.Subscribe = (group, topic) => Object({
  method: 'subscribe',
  group: group,
  topic: topic
});
exports.Subscribe.method = 'subscribe';

exports.SubscribeSuccess = () => Object({
  method: 'subscribeSuccess'
});
exports.SubscribeSuccess.method = 'subscribeSuccess';

exports.SubscribeFailed = (code, message) => Object({
	method: 'subscribeFailed',
	code: code,
	message: message
});
exports.SubscribeFailed.method = 'subscribeFailed';

exports.Join = (token) => Object({
  token: token,
  method: 'join'
});
exports.Join.method = 'join';

exports.JoinSuccess = () => Object({
  method: 'joinSuccess'
});
exports.JoinSuccess.method = 'joinSuccess';

exports.JoinFailure = (code, reason) => Object({
  method: 'joinFailure',
  code: code,
  reason: reason
});
exports.JoinFailure.method = 'joinFailure'

exports.Leave = () => Object({
  method: 'leave'
});
exports.Leave.method = 'leave';

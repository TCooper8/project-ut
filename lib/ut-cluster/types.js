'use strict';

let Util = require('util');

let sprintf = Util.format;

exports.EndPoint = (protocol, host, port) => sprintf('%s://%s:%s', protocol, host, port);

exports.TcpEndPoint = (host, port) => exports.EndPoint('tcp', host, port);

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

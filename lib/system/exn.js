'use strict';

module.exports = (tag, msg) => {
	let err = new Error(msg);
	err.tag = tag;
	return err;
};

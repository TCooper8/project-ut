'use strict';

global.Exception = (tag, msg) => {
	let err = new Error(msg);
	err.tag = tag;
	return err;
};

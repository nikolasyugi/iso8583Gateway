module.exports = function() {
	var modules = {};

	modules.net = require("net");
	modules.fs = require("fs");
	modules.mongoose = require("mongoose");
	modules.dotenv = require("dotenv");

	return modules;
};

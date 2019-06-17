module.exports = msg => {
	hex2binary = require("./hex2binary.js");

	/* Bit Mapping */
	decoded = {};
	decoded["firstBitmap"] = hex2binary(msg.substring(12, 28));
	decoded["secondBitmap"] = hex2binary(msg.substring(28, 44));
	/* Bit Mapping */

	/* Fields present in message */
	let fields = [];
	let i = 1;
	for (const c of decoded["firstBitmap"]) {
		if (c == 1) {
			fields.push(i);
		}
		i++;
	}
	let j = 65;
	for (const c of decoded["secondBitmap"]) {
		if (c == 1) {
			fields.push(j);
		}
		j++;
	}
	/* Fields present in message */
	return fields;
};

/** Takes iso msg string and adds new field to it */
const fieldsLength = require("../../src/fieldsLength.js")();
const asciiFields = require("../../src/asciiFields.js")();

module.exports = (msg, fieldToAdd, dataToAdd, mti) => {
	const hex2binary = require("../hex2binary.js");
	const binary2hex = require("../binary2hex.js");
	const getMessageFields = require("../getMessageFields.js");

	/* Bit Mapping */
	let originalFirstBitmap = hex2binary(msg.substring(12, 28));
	let newFirstBitmap = originalFirstBitmap;
	let originalSecondBitmap = hex2binary(msg.substring(28, 44));
	let newSecondBitmap = originalSecondBitmap;

	if (fieldToAdd < 65) {
		newFirstBitmap =
			originalFirstBitmap.substring(0, fieldToAdd - 1) +
			"1" +
			originalFirstBitmap.substring(fieldToAdd, originalFirstBitmap.length);
	} else {
		fieldToAdd -= 64;
		newSecondBitmap =
			originalSecondBitmap.substring(0, fieldToAdd - 1) +
			"1" +
			originalSecondBitmap.substring(fieldToAdd, originalSecondBitmap.length);
		fieldToAdd += 64;
	}
	newFirstBitmap = binary2hex(newFirstBitmap);
	newSecondBitmap = binary2hex(newSecondBitmap);
	/* Bit Mapping */

	/* Payload Encoding */
	let payload = msg.substring(44, msg.length); //8 (header) + 4 (mti) + 32(bitmaps) = 44

	/* Fields present in message */
	fields = getMessageFields(msg);

	let skip = 0;
	let i = 0;
	fieldsLength.forEach(fieldLength => {
		if (i < fieldToAdd) {
			if (fields.includes(i)) {
				//if field is present in message
				if (fieldLength > 0) {
					//fixed length fields
					if (asciiFields.includes(i)) {
						//ASCII Fields
						skip += fieldLength * 2;
					} else {
						//non ASCII Fields
						skip += fieldLength;
					}
				} else if (fieldLength < 0) {
					//variable length fields
					if (asciiFields.includes(i)) {
						//ASCII Fields
						skip += parseInt(payload.substr(skip, 2)) * 2;
					} else {
						//non ASCII Fields
						skip += parseInt(payload.substr(skip, 2));
					}
					skip += 2; //skip the 2 digits that indicate the length
				}
			}
			i++;
		}
	});
	/* New Payload */
	let newPayload =
		payload.substr(0, skip) +
		dataToAdd +
		payload.substring(skip, payload.length);

	/* Encoding */
	let encoded = newFirstBitmap + newSecondBitmap + newPayload;

	/* Header */
	let header = msg.substring(0, 12);
	let msgLength = ((encoded.length + 8) / 2).toString(16);
	msgLength = msgLength.length < 4 ? `00${msgLength}` : msgLength;
	let newHeader = msgLength + header.substr(4, 4) + mti; //change MTI and message length
	/* Header */

	/* Encoding */
	encoded = newHeader + encoded;

	return encoded;
};

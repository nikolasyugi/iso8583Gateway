module.exports = (iso8583decoder, iso8583encoder, modules) => {
	let testBuffer = modules.fs.readFileSync("iso8583TestMsg.txt", "utf-8");

	encoded = iso8583encoder(testBuffer.toString("hex"), 39, "0001", "1430");

	decoded = iso8583decoder(Buffer.from(encoded, "hex"));

	console.log("**************** Encoding Test ****************");
	console.log(encoded);
	console.log(decoded);
	console.log("");
};

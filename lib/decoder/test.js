module.exports = (
	iso8583decoder,
	iso8583encoder,
	modules,
	mongoose,
	keys,
	matchIso,
	processSales
) => {
	modules.fs.readFile("iso8583TestMsg.txt", "utf-8", function(err, data) {
		if (err) throw err;

		const decoded = iso8583decoder(data);

		console.log("**************** Decoding Test ****************");
		console.log(data);
		console.log(decoded);
		console.log("");

		//timeout variables
		let time = 0;
		const qrCodeTimeout = Math.round(keys.maxTimeout / 2); //time between arrival of pos msg and user scan
		const confirmBuyTimeout = Math.round(keys.maxTimeout / 2); //time between scan and password input

		//process message
		processSales(
			decoded,
			data,
			time,
			qrCodeTimeout,
			confirmBuyTimeout,
			iso8583encoder,
			matchIso,
			mongoose,
			null,
			true
		);
	});
};

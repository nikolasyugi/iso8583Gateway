module.exports = function(decoded, data, iso8583encoder, mongoose, socket) {
	//message 1420 came prom POS, return 1430 to cancel order

	mongoose.connection.db
		.collection("iso_messages")
		.findOne({ stan: decoded.field_56, mti: "1200" }, function(
			err,
			iso1200Found
		) {
			//find iso 1200 with same stan in mongo db
			if (!err) {
				if (iso1200Found) {
					foundIso(
						iso8583encoder,
						data,
						decoded,
						socket,
						iso1200Found,
						mongoose
					);
				} else {
					isoNotFound(iso8583encoder, data, socket);
				}
			} else {
				console.log(err);
			}
		});
};

function isoNotFound(iso8583encoder, data, socket) {
	//didnt find corresponding 1200 in db
	replyMsg = iso8583encoder(data.toString("hex"), 39, "0001", "1430");
	replyMsg = Buffer.from(replyMsg, "hex");

	console.log("**************** ISO 1200 Not found ****************");
	console.log(replyMsg);
	console.log("");

	socket.write(replyMsg);
}

function foundIso(
	iso8583encoder,
	data,
	decoded,
	socket,
	iso1200Found,
	mongoose
) {
	//found corresponding 1200 in db
	replyMsg = iso8583encoder(data.toString("hex"), 39, "0001", "1430");
	replyMsg = Buffer.from(replyMsg, "hex");

	mongoose.connection.db.collection("iso_messages").findOneAndUpdate( //add relation of 1400 msg to order
		{
			stan: decoded.field_11,
			message: data.toString("hex"),
			mti: decoded.mti,
		},
		{ $set: { order_id: iso1200Found.order_id } }
	);

	console.log("**************** Sent ISO Reversal ****************");
	console.log(replyMsg);
	console.log("");

	socket.write(replyMsg);
}

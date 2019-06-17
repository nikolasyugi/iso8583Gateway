const modules = require("./modules.js")();

const net = modules.net;
const mongoose = modules.mongoose;
const dotenv = modules.dotenv;

const keys = require("./keys.js")(dotenv);

const iso8583decoder = require("../lib/decoder/iso8583decoder.js");
const iso8583encoder = require("../lib/encoder/iso8583encoder.js");
const matchIso = require("../lib/decoder/matchIso.js");
const processSales = require("../lib/processSales.js");
const processReversal = require("../lib/processReversal.js");

const listenPort = keys.port;
const listenIp = keys.ip;

/** Mongo Connection */
mongoose.set("useCreateIndex", true);
mongoose
	.connect(keys.dbUrl, { useNewUrlParser: true })
	.then(() => {
		/** Runs decoding test if there's no data available in socket */

		// require("../lib/decoder/test.js")(iso8583decoder, iso8583encoder, modules, mongoose, keys, matchIso, processSales);

		/** Runs decoding test if there's no data available in socket */

		/** Runs encoding test if there's no data available in socket */

		// require("../lib/encoder/test.js")(iso8583decoder, iso8583encoder, modules);

		/** Runs encoding test if there's no data available in socket */

		/** TCP Socket */
		const server = net.createServer(function(socket) {
			socket.on("data", function(data) {
				const decoded = iso8583decoder(data); //JSON with decoded msg

				console.log(data.toString("hex"));
				console.log("**************** Incoming data ****************");
				console.log(decoded);
				console.log("");

				//timeout variables
				let time = 0;
				const qrCodeTimeout = Math.round(keys.maxTimeout / 2); //time between arrival of pos msg and user scan
				const confirmBuyTimeout = Math.round(keys.maxTimeout / 2); //time between scan and password input

				//insert message in db
				mongoose.connection.db.collection("iso_messages").insertOne({
					stan: decoded.field_11,
					message: data.toString("hex"),
					mti: decoded.mti,
				});

				if (decoded.mti == "1420") {
					//process message reversal
					processReversal(decoded, data, iso8583encoder, mongoose, socket);
				} else {
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
						socket,
						false
					);
				}
			});
		});
		console.log(`Server is on, listening on ${listenIp}:${listenPort}`);
		console.log("");

		server.listen(listenPort, listenIp);
		/** TCP Socket */
	})
	.catch(err => {
		//Mongo connection
		console.log(err);
	});

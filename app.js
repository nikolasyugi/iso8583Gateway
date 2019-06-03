const modules = require('./modules.js')();

const net = modules.net
const fs = modules.fs
const mongoose = modules.mongoose
const dotenv = modules.dotenv

const keys = require('./keys.js')(dotenv);
const iso8583decoder = require('./lib/decoder/iso8583decoder.js')
const iso8583encoder = require('./lib/encoder/iso8583encoder.js')
const changeMti = require('./lib/encoder/changeMti.js')
const matchIso = require('./lib/decoder/matchIso.js')
const listenPort = keys.port
const listenIp = keys.ip

/* Fields according to docs */
const fieldsLength = [0, 0, -1, 6, 12, 0, 0, 0, 0, 0, 0, 6, 12, 0, 4, 0, 0, 0, 0, 0, 0, 0, 12, 0, 0, 0, 0, 0, 0, 0, 0, -1, -1, 0, 0, 0, 0, 12, 0, 0, 0, 8, 15, -1, 0, 0, 0, 0, 0, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -3, 0, 0, 0, 0, 0] //0 = not used, -1 = variable max 2 digits, -2 = variable max 3 digits, -3 = variable max 4 digits, this array is consistent with provided documentation (array starts with field_0)
const asciiFields = [22, 31, 37, 41, 42, 43, 49, 50, 61, 63, 123]

// /****DEBUG FIELDS LENGTH ****/
// /****DEBUG FIELDS LENGTH ****/
// let fieldsDebug = {}
// fieldsLength.forEach((element, i) => fieldsDebug[`Field ${i}`] = fieldsLength[i])
// console.log(fieldsDebug)
// /****DEBUG FIELDS LENGTH ****/
// /****DEBUG FIELDS LENGTH ****/

/* Fields according to docs */



/** Mongo Connection */
mongoose.set('useCreateIndex', true);
mongoose.connect(keys.dbUrl, { useNewUrlParser: true })
    .then(() => {

        /** Runs test if there's no data available in socket */
        // require("./lib/decoder/test.js")(iso8583decoder, iso8583encoder, fs, mongoose, keys, matchIso, fieldsLength, asciiFields);
        /** Runs test if there's no data available in socket */


        /** TCP Socket */
        const server = net.createServer(function (socket) {
            socket.on('data', function (data) {
                const decoded = iso8583decoder(data, fieldsLength, asciiFields) //JSON with decoded msg

                console.log("**************** Incoming data ****************")
                console.log(decoded)
                console.log("**************** Incoming data ****************")

                let time = 0;
                const qrCodeTimeout = Math.round(keys.maxTimeout / 2)
                const confirmBuyTimeout = Math.round(keys.maxTimeout / 2)

                const interval = setInterval(() => {
                    mongoose.connection.db.collection('iso_messages').findOne({ stan: decoded.field_11 }, function (err, isoFound) {
                        if (!err) {
                            //While not found wait until timeout

                            if (time >= qrCodeTimeout) {//TIMEOUT
                                clearInterval(interval);
                                console.log("**************** Timeout ****************")
                                mongoose.connection.db.collection('iso_messages').findOneAndUpdate({ stan: decoded.field_11 }, { $set: { timeout: true } })
                                replyMsg = iso8583encoder(data.toString('hex'), fieldsLength, asciiFields, 39, '0001')
                                replyMsg = Buffer.from(replyMsg, "hex")

                                console.log(replyMsg)
                                socket.write(replyMsg);
                                console.log("**************** Timeout ****************")

                            } else if (isoFound) {//FOUND ISO IN DB
                                console.log(isoFound)

                                clearInterval(interval);
                                if (matchIso(isoFound, decoded)) { //CORRECT ISO
                                    console.log("**************** Matched ISO ****************")

                                    let buyTime = 0

                                    mongoose.connection.db.collection('iso_messages').findOneAndUpdate({ stan: decoded.field_11 }, { $set: { confirmed_order: true } }, (err, doc) => {
                                        if (err) return console.log(err)
                                        const buyInterval = setInterval(() => {


                                            mongoose.connection.db.collection('iso_messages').findOne({ stan: decoded.field_11, cancel: true }, function (err, cancelOrder) { //cancel order
                                                if (cancelOrder) { //CANCEL ORDER
                                                    clearInterval(buyInterval);
                                                    replyMsg = iso8583encoder(data.toString('hex'), fieldsLength, asciiFields, 39, '0001')
                                                    replyMsg = Buffer.from(replyMsg, "hex")


                                                    console.log("**************** Cancel ****************")
                                                    console.log(replyMsg)
                                                    socket.write(replyMsg)
                                                    console.log("**************** Cancel ****************")
                                                    console.log("")
                                                    console.log("")
                                                } else {
                                                    mongoose.connection.db.collection('iso_messages').findOne({ stan: decoded.field_11, confirmed_order: true, buy_order: true, timeout: false }, function (err, isoFound) {
                                                        if (!err) {
                                                            if (isoFound) {
                                                                console.log("**************** Success ****************")
                                                                replyMsg = iso8583encoder(data.toString('hex'), fieldsLength, asciiFields, 39, '0000')
                                                                replyMsg = Buffer.from(replyMsg, "hex")

                                                                console.log(replyMsg)
                                                                socket.write(replyMsg);
                                                                console.log("**************** Success ****************")
                                                                console.log("")
                                                                console.log("")
                                                                clearInterval(buyInterval);
                                                            } else if (buyTime >= confirmBuyTimeout) {
                                                                console.log("**************** Timeout ****************")
                                                                mongoose.connection.db.collection('iso_messages').findOneAndUpdate({ stan: decoded.field_11 }, { $set: { timeout: true } })

                                                                replyMsg = iso8583encoder(data.toString('hex'), fieldsLength, asciiFields, 39, '0001')
                                                                replyMsg = Buffer.from(replyMsg, "hex")

                                                                console.log(replyMsg)
                                                                socket.write(replyMsg);
                                                                console.log("**************** Timeout ****************")
                                                                console.log("")
                                                                console.log("")
                                                                clearInterval(buyInterval);
                                                            }
                                                        } else {
                                                            console.log(err)
                                                        }

                                                    })
                                                }
                                            })
                                            buyTime++;
                                            console.log(confirmBuyTimeout - buyTime)
                                        }, 1000)

                                    });

                                } else { //WRONG ISO
                                    console.log("**************** Didn't Match ISO ****************")
                                    replyMsg = iso8583encoder(data.toString('hex'), fieldsLength, asciiFields, 39, '0001')
                                    replyMsg = Buffer.from(replyMsg, "hex")


                                    console.log(replyMsg)
                                    fieldsLength[39] = 4
                                    console.log(iso8583decoder(Buffer.from(replyMsg.toString("hex"), "hex"), fieldsLength, asciiFields))
                                    socket.write(replyMsg)
                                    console.log("**************** Didn't Match ISO ****************")
                                    console.log("")
                                    console.log("")
                                }
                            }
                        } else {
                            console.log(err)
                        }
                    });
                    time++;
                    console.log(qrCodeTimeout - time)
                }, 1000)

                console.log("***********************************************")
                console.log("")
                console.log("")
            });

        });
        console.log(`Server is on, listening on ${listenIp}:${listenPort}`)
        console.log("")

        server.listen(listenPort, listenIp);
        /** TCP Socket */
    })
    .catch((err) => { //Mongo connection
        console.log(err)
    }) 
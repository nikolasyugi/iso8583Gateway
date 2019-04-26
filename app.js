const modules = require('./modules.js')();

const net = modules.net
const fs = modules.fs
const mongoose = modules.mongoose
const dotenv = modules.dotenv

const keys = require('./keys.js')(dotenv);

const iso8583decoder = require('./lib/decoder/iso8583decoder.js')
const changeMti = require('./lib/decoder/changeMti.js')
const matchIso = require('./lib/decoder/matchIso.js')
const listenPort = keys.port
const listenIp = keys.ip

/** Mongo Connection */
mongoose.set('useCreateIndex', true);
mongoose.connect(keys.dbUrl, { useNewUrlParser: true })
    .then(() => {

        /** Runs test if there's no data available in socket */
        require("./lib/decoder/test.js")(iso8583decoder, changeMti, fs, mongoose, keys, matchIso);
        /** Runs test if there's no data available in socket */


        /** TCP Socket */
        const server = net.createServer(function (socket) {
            socket.on('data', function (data) {

                const decoded = iso8583decoder(data) //JSON with decoded msg

                console.log("")
                console.log("")
                console.log("***********************************************")
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
                                replyMsg = Buffer.from(changeMti("1210", data.toString('hex')), "hex")
                                console.log(replyMsg)
                                console.log("**************** Timeout ****************")

                            } else if (isoFound) {//FOUND ISO IN DB
                                console.log(isoFound)

                                clearInterval(interval);
                                if (matchIso(isoFound, decoded)) { //CORRECT ISO
                                    console.log("**************** Matched ISO ****************")

                                    let buyTime = 0

                                    mongoose.connection.db.collection('iso_messages').findOneAndUpdate({ stan: decoded.field_11 }, { $set: { confirmed_order: true } }, { upsert: true }, (err, doc) => {
                                        if (err) return console.log(err)
                                        const buyInterval = setInterval(() => {


                                            mongoose.connection.db.collection('iso_messages').findOne({ stan: decoded.field_11, confirmed_order: true, buy_order: true }, function (err, isoFound) {
                                                if (!err) {
                                                    if (isoFound) {
                                                        console.log("**************** Success ****************")
                                                        replyMsg = Buffer.from(changeMti("1210", testMsg), "hex")
                                                        console.log(replyMsg)
                                                        console.log("**************** Success ****************")
                                                        clearInterval(buyInterval);
                                                    } else if (buyTime >= confirmBuyTimeout) {
                                                        console.log("**************** Timeout ****************")
                                                        replyMsg = Buffer.from(changeMti("1210", testMsg), "hex")
                                                        console.log(replyMsg)
                                                        console.log("**************** Timeout ****************")
                                                        clearInterval(buyInterval);
                                                    }
                                                } else {
                                                    console.log(err)
                                                }

                                            })
                                            buyTime++;
                                            console.log(confirmBuyTimeout - buyTime)
                                        }, 1000)

                                    });

                                } else { //WRONG ISO
                                    console.log("**************** Didn't Match ISO ****************")
                                    replyMsg = Buffer.from(changeMti("1210", data.toString('hex')), "hex")
                                    console.log(replyMsg)
                                    console.log("**************** Didn't Match ISO ****************")

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

        server.listen(listenPort, listenIp);
        /** TCP Socket */
    })
    .catch((err) => {
        console.log(err)
    }) 
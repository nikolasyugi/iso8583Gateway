const modules = require('./modules.js')();

const net = modules.net
const request = modules.request
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
        require("./lib/decoder/test.js")(iso8583decoder, changeMti, fs, request, mongoose, keys, matchIso);
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
                const maxTimeout = keys.maxTimeout

                const interval = setInterval(() => {
                    mongoose.connection.db.collection('iso_messages').findOne({ stan: '322968' }, function (err, isoFound) {
                        if (!err) {
                            //While not found wait until timeout

                            if (time >= maxTimeout) {//TIMEOUT
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
                                    replyMsg = Buffer.from(changeMti("1210", data.toString('hex')), "hex")
                                    console.log(replyMsg)
                                    console.log("**************** Matched ISO ****************")

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
                    console.log(maxTimeout - time)
                }, 2000)

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
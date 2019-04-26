const modules = require('./modules.js')();

const net = modules.net
const request = modules.request
const fs = modules.fs
const mongoose = modules.mongoose
const dotenv = modules.dotenv

const keys = require('./keys.js')(dotenv);

const iso8583decoder = require('./lib/decoder/iso8583decoder.js')
const changeMti = require('./lib/decoder/changeMti.js')
const listenPort = keys.port
const listenIp = keys.ip

/** Mongo Connection */
mongoose.set('useCreateIndex', true);
mongoose.connect(keys.dbUrl, { useNewUrlParser: true })
    .then(() => {

        /** Runs test if there's no data available in socket */
        require("./lib/decoder/test.js")(iso8583decoder, changeMti, fs, request);
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


                request.post({
                    headers: { 'content-type': 'application/json' },
                    url: 'http://powercredit-backend-hmg.herokuapp.com/api/pos',
                    json: true,
                    body: {
                        data: decoded
                    }
                }, function (error, response, body) {
                    if (body.success) {
                        console.log("**************** Response data ****************")


                        replyMsg = Buffer.from(changeMti("1210", data.toString('hex')), "hex")
                        socket.write(replyMsg);


                        console.log(replyMsg)
                        console.log("**************** Response data ****************")
                    } else {
                        console.log("**************** Response ERROR ****************")


                        replyMsg = Buffer.from(changeMti("1210", data.toString('hex')), "hex")
                        socket.write(replyMsg);


                        console.log(replyMsg)
                        console.log("**************** Response ERROR ****************")
                    }
                    console.log(body)
                    console.log("***********************************************")
                    console.log("")
                    console.log("")
                });
            });
        });

        server.listen(listenPort, listenIp);
        /** TCP Socket */
    })
    .catch((err) => {
        console.log(err)
    }) 
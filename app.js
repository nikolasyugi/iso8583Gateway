const modules = require('./modules.js')();

const net = modules.net
const request = modules.request
const fs = modules.fs
const mongoose = modules.mongoose
const dotenv = modules.dotenv

const keys = require('./keys.js')(dotenv);

const iso8583decoder = require('./lib/decoder/iso8583decoder.js')
const changeMti = require('./lib/decoder/changeMti.js')
const listenPort = 3030
const listenIp = '10.8.0.6'

/** Runs test if there's no data available in socket */
require("./lib/decoder/test.js")(iso8583decoder, changeMti, fs, request);
/** Runs test if there's no data available in socket */


/** Mongo Connection */
mongoose.connect(keys.dbUrl, { useNewUrlParser: true });
mongoose.set('useCreateIndex', true);
/** Mongo Connection */

var server = net.createServer(function (socket) {
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
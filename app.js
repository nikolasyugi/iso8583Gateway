const net = require('net');
const request = require('request');

console.log("")
console.log("")
console.log("*************************************")
console.log("****************Teste****************")
iso8583 = require('./iso8583.js')
console.log(iso8583())
console.log("****************Teste****************")
console.log("*************************************")
console.log("")
console.log("")

var server = net.createServer(function (socket) {
    socket.on('data', function (data) {
        console.log("")
        console.log("")
        console.log("***********************************************")
        console.log("**************** Incoming data ****************")
        console.log(iso8583(data))
        console.log("**************** Incoming data ****************")

        request.post({
            headers: { 'content-type': 'application/json' },
            url: 'http://powercredit-backend-hmg.herokuapp.com/api/pos',
            json: true,
            body: {
                data: iso8583(data)
            }
        }, function (error, response, body) {
            if (!body.error) {
                console.log("**************** Response data ****************")
                replyMsg = Buffer.from(changeMti("1210", data), "hex")
                console.log(replyMsg)
                console.log("**************** Response data ****************")
                socket.write(replyMsg);
            }
            console.log(body)
            console.log("***********************************************")
            console.log("")
            console.log("")
        });
    });
});

server.listen(3030, '10.8.0.6');
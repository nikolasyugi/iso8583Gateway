const net = require('net');
const request = require('request');

console.log("****************Teste****************")
iso8583 = require('./iso8583.js')
console.log(iso8583())
console.log("****************Teste****************")


var server = net.createServer(function (socket) {
    socket.on('data', function (data) {
        console.log("")
        console.log("")
        console.log("**************** Incoming data ****************")
        dataToString = require('./iso8583.js')
        console.log(iso8583(data))
        console.log("**************** Incoming data ****************")

        request.post({
            headers: { 'content-type': 'application/json' },
            url: 'http://powercredit-backend-hmg.herokuapp.com/api/pos',
            json: true,
            body: {
                data: dataToString
            }
        }, function (error, response, body) {
            if (!body.error) {
                console.log("**************** Response data ****************")
                replyMsg = Buffer.from("010447101200F834040328E0800800000000000000201699001812345678900000000000000010000000000010003229681904110956450369353131313031323133313443203130303030303030303030303030303030303031040123339900181234567890D4912101000007001030303030303030383136313430303030303131313030303030303030303030303132330832383132313938303834300088564231383230313631303235313435333432313133345649313832303136313032353134353334323131333456453138323031363130323531343533343231313334564331383230313631303235313435333432313133340012573F463331332E4430313132", "hex")
                console.log(replyMsg)
                console.log("**************** Response data ****************")
                socket.write(replyMsg);
            }
            console.log(body)
            console.log("")
            console.log("")
        });
    });
});

server.listen(3030, '10.8.0.6');
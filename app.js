const net = require('net');
const request = require('request');

console.log("*************************************")
console.log("****************Teste****************")
iso8583 = require('./iso8583.js')
console.log(iso8583())
console.log("****************Teste****************")
console.log("*************************************")


var server = net.createServer(function (socket) {
    socket.on('data', function (data) {
        console.log("")
        console.log("")
        console.log("***********************************************")
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
                replyMsg = Buffer.from("00f247101210f834040308e080080000000000000020169900181234567890000000000000001000000000001000322968190411095645036935313131303132313331344320313030303030303030303030303030303030303104012330303030303030383136313430303030303131313030303030303030303030303132330832383132313938303834300088564231383230313631303235313435333432313133345649313832303136313032353134353334323131333456453138323031363130323531343533343231313334564331383230313631303235313435333432313133340012573f463331332e4430313132", "hex")
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
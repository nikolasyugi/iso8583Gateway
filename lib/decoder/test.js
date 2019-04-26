module.exports = (iso8583decoder, changeMti, fs, request) => {

    fs.readFile("iso8583TestMsg.txt", 'utf-8', function (err, data) {
        if (err) throw err;
        const testMsg = data

        const decoded = iso8583decoder()

        console.log("")
        console.log("")
        console.log("*************************************")
        console.log("****************Teste****************")
        console.log(decoded)


        request.post({
            headers: { 'content-type': 'application/json' },
            url: 'http://localhost:3000/api/pos',
            json: true,
            body: {
                data: decoded
            }
        }, function (error, response, body) {
            if (body.success) {
                console.log("**************** Response data ****************")


                replyMsg = Buffer.from(changeMti("1210", testMsg), "hex")


                console.log(replyMsg)
                console.log("**************** Response data ****************")
            } else {
                console.log("**************** Response ERROR ****************")


                replyMsg = Buffer.from(changeMti("1240", testMsg), "hex")


                console.log(replyMsg)
                console.log("**************** Response ERROR ****************")
            }
        });
        console.log("****************Teste****************")
        console.log("*************************************")
        console.log("")
        console.log("")
    });
}
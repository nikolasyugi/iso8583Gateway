module.exports = (iso8583decoder, iso8583encoder, fs, mongoose, keys, matchIso, fieldsLength, asciiFields, processIncomingMessage) => {

    fs.readFile("iso8583TestMsg.txt", 'utf-8', function (err, data) {
        if (err) throw err;

        const decoded = iso8583decoder(null, fieldsLength, asciiFields, fs)

        console.log("**************** Teste ****************")
        console.log(decoded)
        console.log("")

        //timeout variables
        let time = 0;
        const qrCodeTimeout = Math.round(keys.maxTimeout / 2) //time between arrival of pos msg and user scan
        const confirmBuyTimeout = Math.round(keys.maxTimeout / 2) //time between scan and password input

        //process message
        processIncomingMessage(decoded, data, fieldsLength, asciiFields, time, qrCodeTimeout, confirmBuyTimeout, iso8583encoder, matchIso, mongoose, null, true)
    });
}
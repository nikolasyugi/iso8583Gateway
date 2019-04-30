module.exports = (iso8583decoder, iso8583encoder, fs, mongoose, keys, matchIso, fieldsLength, asciiFields) => {

    fs.readFile("iso8583TestMsg.txt", 'utf-8', function (err, data) {
        if (err) throw err;

        const decoded = iso8583decoder(null, fieldsLength, asciiFields)

        console.log("")
        console.log("")
        console.log("***************************************")
        console.log("**************** Teste ****************")
        console.log(decoded)

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

                        replyMsg = iso8583encoder(data.toString('hex'), fieldsLength, asciiFields, 39, '0000')
                        console.log(replyMsg)
                        replyMsg = Buffer.from(replyMsg, "hex")

                        console.log(replyMsg)
                        console.log("**************** Timeout ****************")
                        console.log("")
                        console.log("")
                    } else if (isoFound) {//FOUND ISO IN DB

                        clearInterval(interval);
                        if (matchIso(isoFound, decoded)) { //CORRECT ISO
                            console.log("**************** Matched ISO ****************")

                            let buyTime = 0
                            mongoose.connection.db.collection('iso_messages').findOneAndUpdate({ stan: decoded.field_11 }, { $set: { confirmed_order: true } }, (err, doc) => {
                                if (err) return console.log(err)
                                const buyInterval = setInterval(() => {

                                    mongoose.connection.db.collection('iso_messages').findOne({ stan: decoded.field_11, confirmed_order: true, buy_order: true, timeout: false }, function (err, isoFound) {
                                        if (!err) {
                                            if (isoFound) {
                                                console.log("**************** Success ****************")
                                                replyMsg = iso8583encoder(data.toString('hex'), fieldsLength, asciiFields, 39, '0000')
                                                replyMsg = Buffer.from(replyMsg, "hex")

                                                console.log(replyMsg)
                                                console.log("**************** Success ****************")
                                                console.log("")
                                                console.log("")
                                                clearInterval(buyInterval);
                                            } else if (buyTime >= confirmBuyTimeout) {
                                                console.log("**************** Timeout ****************")
                                                mongoose.connection.db.collection('iso_messages').findOneAndUpdate({ stan: decoded.field_11 }, { $set: { timeout: true } })
                                                replyMsg = iso8583encoder(data.toString('hex'), fieldsLength, asciiFields, 39, '0000')
                                                replyMsg = Buffer.from(replyMsg, "hex")

                                                console.log(replyMsg)
                                                console.log("**************** Timeout ****************")
                                                console.log("")
                                                console.log("")
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

                            replyMsg = iso8583encoder(data.toString('hex'), fieldsLength, asciiFields, 39, '0000')
                            replyMsg = Buffer.from(replyMsg, "hex")

                            console.log(replyMsg)
                            fieldsLength[39] = 4
                            console.log(iso8583decoder(Buffer.from("00f2"+replyMsg.toString("hex"), "hex"), fieldsLength, asciiFields))

                            console.log("**************** Didn't Match ISO ****************")
                            console.log("")
                            console.log("")
                        }
                    }
                } else {
                    return console.log(err)
                }
            });
            time++;
            console.log(qrCodeTimeout - time)
        }, 1000)
        console.log("**************** Teste ****************")
        console.log("***************************************")
        console.log("")
        console.log("")
    });
}
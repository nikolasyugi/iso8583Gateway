module.exports = (iso8583decoder, changeMti, fs, mongoose, keys, matchIso) => {

    fs.readFile("iso8583TestMsg.txt", 'utf-8', function (err, data) {
        if (err) throw err;
        const testMsg = data

        const decoded = iso8583decoder()

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
                        mongoose.connection.db.collection('iso_messages').findOneAndUpdate({ stan: decoded.field_11 }, { $set: { timeout: true } }, { upsert: true })
                        replyMsg = Buffer.from(changeMti("1210", testMsg), "hex")
                        console.log(replyMsg)
                        console.log("**************** Timeout ****************")

                    } else if (isoFound) {//FOUND ISO IN DB

                        clearInterval(interval);
                        if (matchIso(isoFound, decoded)) { //CORRECT ISO
                            console.log("**************** Matched ISO ****************")

                            let buyTime = 0
                            mongoose.connection.db.collection('iso_messages').findOneAndUpdate({ stan: decoded.field_11 }, { $set: { confirmed_order: true } }, { upsert: true }, (err, doc) => {
                                if (err) return console.log(err)
                                const buyInterval = setInterval(() => {

                                    mongoose.connection.db.collection('iso_messages').findOne({ stan: decoded.field_11, confirmed_order: true, buy_order: true, timeout: false, $or: [{ 'tries': 0 }, { 'tries': 1 }] }, function (err, isoFound) {
                                        if (!err) {
                                            if (isoFound) {
                                                console.log("**************** Success ****************")
                                                replyMsg = Buffer.from(changeMti("1210", testMsg), "hex")
                                                console.log(replyMsg)
                                                console.log("**************** Success ****************")
                                                clearInterval(buyInterval);
                                            } else if (buyTime >= confirmBuyTimeout) {
                                                console.log("**************** Timeout ****************")
                                                mongoose.connection.db.collection('iso_messages').findOneAndUpdate({ stan: decoded.field_11 }, { $set: { timeout: true } }, { upsert: true })
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
                            replyMsg = Buffer.from(changeMti("1210", testMsg), "hex")
                            console.log(replyMsg)
                            console.log("**************** Didn't Match ISO ****************")

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
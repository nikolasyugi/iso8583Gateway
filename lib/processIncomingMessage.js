module.exports = function (decoded, data, fieldsLength, asciiFields, time, qrCodeTimeout, confirmBuyTimeout, iso8583encoder, matchIso, mongoose, socket, testing) { //message came prom POS, wait for app to scan QR Code

    const interval = setInterval(() => { //find qr code with same stan in mongo db
        mongoose.connection.db.collection('qr_codes').findOne({ stan: decoded.field_11 }, function (err, isoFound) {
            if (!err) {
                //While not found wait until timeout

                if (time >= qrCodeTimeout) {//TIMEOUT
                    isoNotFound(iso8583encoder, decoded, data, fieldsLength, asciiFields, interval, mongoose, socket, testing);

                } else if (isoFound) {//FOUND ISO IN DB
                    foundIso(interval, decoded, data, fieldsLength, asciiFields, confirmBuyTimeout, iso8583encoder, matchIso, mongoose, socket, testing, isoFound);
                }
            } else {
                console.log(err)
            }
        });
        time++;
        console.log(qrCodeTimeout - time)
    }, 1000)
}







function isoNotFound(iso8583encoder, decoded, data, fieldsLength, asciiFields, interval, mongoose, socket, testing) { //user didnt scan QR Code in time
    mongoose.connection.db.collection('qr_codes').findOneAndUpdate({ stan: decoded.field_11 }, { $set: { timeout: true } })

    replyMsg = iso8583encoder(data.toString('hex'), fieldsLength, asciiFields, 39, '0001', '1210')
    replyMsg = Buffer.from(replyMsg, "hex")

    console.log("**************** Timeout ****************")
    console.log(replyMsg)
    console.log("")
    if (!testing) {
        socket.write(replyMsg);
    }
    clearInterval(interval);
}







function foundIso(interval, decoded, data, fieldsLength, asciiFields, confirmBuyTimeout, iso8583encoder, matchIso, mongoose, socket, testing, isoFound) { //user scanned QR Code in time
    console.log(isoFound)

    clearInterval(interval);

    if (matchIso(isoFound, decoded)) { //CORRECT ISO -> set confirmed_order flag = TRUE
        console.log("**************** Matched ISO ****************")

        let buyTime = 0

        mongoose.connection.db.collection('qr_codes').findOneAndUpdate({ stan: decoded.field_11 }, { $set: { confirmed_order: true } }, (err, doc) => {
            if (err) return console.log(err)

            //start waiting for password input
            const buyInterval = setInterval(() => {
                mongoose.connection.db.collection('qr_codes').findOne({ stan: decoded.field_11, cancel: true }, function (err, cancelOrder) {
                    if (cancelOrder) { //CANCEL ORDER
                        orderCancelling(buyInterval, data, fieldsLength, asciiFields, iso8583encoder, socket, testing)
                    } else {
                        validatePassword(decoded, data, fieldsLength, asciiFields, buyTime, buyInterval, confirmBuyTimeout, iso8583encoder, mongoose, socket, testing)
                    }
                })

                buyTime++;
                console.log(confirmBuyTimeout - buyTime)
            }, 1000)

        });

    } else { //WRONG ISO
        replyMsg = iso8583encoder(data.toString('hex'), fieldsLength, asciiFields, 39, '0001', '1210')
        replyMsg = Buffer.from(replyMsg, "hex")


        console.log("**************** Didn't Match ISO ****************")
        console.log(replyMsg)
        console.log("")

        if (!testing) {
            socket.write(replyMsg);
        }
    }
}







function orderCancelling(buyInterval, data, fieldsLength, asciiFields, iso8583encoder, socket, testing) { //cancel order because user typed password incorrectly twice (flag cancel)

    replyMsg = iso8583encoder(data.toString('hex'), fieldsLength, asciiFields, 39, '0001', '1210')
    replyMsg = Buffer.from(replyMsg, "hex")

    console.log("**************** Cancel ****************")
    console.log(replyMsg)
    console.log("")

    if (!testing) {
        socket.write(replyMsg);
    }
    clearInterval(buyInterval);
}







function validatePassword(decoded, data, fieldsLength, asciiFields, buyTime, buyInterval, confirmBuyTimeout, iso8583encoder, mongoose, socket, testing) { //password validation step in app (rails will set buy_order flag = TRUE when user types it correctly)

    mongoose.connection.db.collection('qr_codes').findOne({ stan: decoded.field_11, confirmed_order: true, buy_order: true, timeout: false }, function (err, isoFound) {
        if (!err) {
            if (isoFound) { //user typed correct password in time
                replyMsg = iso8583encoder(data.toString('hex'), fieldsLength, asciiFields, 39, '0000', '1210')
                replyMsg = Buffer.from(replyMsg, "hex")

                console.log("**************** Success ****************")
                console.log(replyMsg)
                console.log("")

                if (!testing) {
                    socket.write(replyMsg);
                }
                clearInterval(buyInterval);

            } else if (buyTime >= confirmBuyTimeout) { //user didnt type password in time
                mongoose.connection.db.collection('qr_codes').findOneAndUpdate({ stan: decoded.field_11 }, { $set: { timeout: true } })

                replyMsg = iso8583encoder(data.toString('hex'), fieldsLength, asciiFields, 39, '0001', '1210')
                replyMsg = Buffer.from(replyMsg, "hex")

                console.log("**************** Timeout ****************")
                console.log(replyMsg)
                console.log("")

                if (!testing) {
                    socket.write(replyMsg);
                }
                clearInterval(buyInterval);
            }
        } else {
            console.log(err)
        }
    })
}
module.exports = function (decoded, data, fieldsLength, asciiFields, iso8583encoder, mongoose, socket) { //message 1420 came prom POS, return 1430 to cancel order

    mongoose.connection.db.collection('iso_messages').findOne({ stan: decoded.field_56, mti: '1200' }, function (err, isoFound) {//find iso 1200 with same stan in mongo db
        if (!err) {
            if (isoFound) {
                foundIso(iso8583encoder, data, fieldsLength, asciiFields, socket);
            } else {
                isoNotFound(iso8583encoder, data, fieldsLength, asciiFields, socket);
            }
        } else {
            console.log(err)
        }
    });
}







function isoNotFound(iso8583encoder, data, fieldsLength, asciiFields, socket) { //didnt find corresponding 1200 in db
    replyMsg = iso8583encoder(data.toString('hex'), fieldsLength, asciiFields, 39, '0001', '1430')
    replyMsg = Buffer.from(replyMsg, "hex")

    console.log("**************** ISO 1200 Not found ****************")
    console.log(replyMsg)
    console.log("")

    socket.write(replyMsg);
}







function foundIso(iso8583encoder, data, fieldsLength, asciiFields, socket) { //found corresponding 1200 in db
    replyMsg = iso8583encoder(data.toString('hex'), fieldsLength, asciiFields, 39, '0001', '1430')
    replyMsg = Buffer.from(replyMsg, "hex")

    console.log("**************** Sent ISO Reversal ****************")
    console.log(replyMsg)
    console.log("")

    socket.write(replyMsg);
}
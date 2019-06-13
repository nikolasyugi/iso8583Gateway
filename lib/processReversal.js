module.exports = function (decoded, data, fieldsLength, asciiFields, time, qrCodeTimeout, confirmBuyTimeout, iso8583encoder, matchIso, mongoose, socket, testing) { //message 1420 came prom POS, return 1430 to cancel order

    mongoose.connection.db.collection('iso_messages').findOne({ stan: decoded.field_56, mti: '1200' }, function (err, isoFound) {//find iso 1200 with same stan in mongo db
        if (!err) {
            if (isoFound) {
                foundIso(isoFound);
            } else {
                isoNotFound();
            }
        } else {
            console.log(err)
        }
    });
}







function isoNotFound() { //didnt find corresponding 1200 in db
    console.log("**************** ISO 1200 Not found ****************")
}







function foundIso(isoFound) { //found corresponding 1200 in db
    console.log(isoFound)
    console.log("**************** Matched ISO ****************")
}
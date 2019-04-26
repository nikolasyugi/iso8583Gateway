module.exports = (iso8583decoder, changeMti, fs, request, mongoose, keys, matchIso) => {

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
        const maxTimeout = keys.maxTimeout

        const interval = setInterval(() => {
            mongoose.connection.db.collection('iso_messages').findOne({ stan: '322968' }, function (err, isoFound) {
                if (!err) {
                    //While not found wait until timeout

                    if (time >= maxTimeout) {//TIMEOUT
                        clearInterval(interval);
                        console.log("**************** Timeout ****************")
                        replyMsg = Buffer.from(changeMti("1210", testMsg), "hex")
                        console.log(replyMsg)
                        console.log("**************** Timeout ****************")

                    } else if (isoFound) {//FOUND ISO IN DB
                        console.log(isoFound)

                        clearInterval(interval);
                        if (matchIso(isoFound, decoded)) { //CORRECT ISO
                            console.log("**************** Matched ISO ****************")
                            replyMsg = Buffer.from(changeMti("1210", testMsg), "hex")
                            console.log(replyMsg)
                            console.log("**************** Matched ISO ****************")

                        } else { //WRONG ISO
                            console.log("**************** Didn't Match ISO ****************")
                            replyMsg = Buffer.from(changeMti("1210", testMsg), "hex")
                            console.log(replyMsg)
                            console.log("**************** Didn't Match ISO ****************")

                        }
                    }
                } else {
                    console.log(err)
                }
            });
            time++;
            console.log(maxTimeout - time)
        }, 2000)
        console.log("**************** Teste ****************")
        console.log("***************************************")
        console.log("")
        console.log("")
    });
}
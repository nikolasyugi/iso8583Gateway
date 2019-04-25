/* Example */
/*

incoming buffer:
010447101200F834040328E0800800000000000000201699001812345678900000000000000010000000000010003229681904110956450369353131313031323133313443203130303030303030303030303030303030303031040123339900181234567890D4912101000007001030303030303030383136313430303030303131313030303030303030303030303132330832383132313938303834300088564231383230313631303235313435333432313133345649313832303136313032353134353334323131333456453138323031363130323531343533343231313334564331383230313631303235313435333432313133340012573F463331332E4430313132

DECODING:

01044710 -> TCP Header
1200 -> MTI - in this case the MTI means that this is a ISO 1993 Financial Request Message sent by Acquirer
f834040328e08008 -> First Bitmap:
    1111100000110100000001000000001100101000111000001000000000001000
    Fields 1x (MTI), 2, 3, 4, 5, 11, 12, 14, 22, 31, 32, 35, 37, 41, 42, 43, 49, 61 are present
0000000000000020 -> Second Bitmap:
    0000000000000000000000000000000000000000000000000000000000100000
    Field 123 is present

Field 2 (LLVAR) -> Length 16 -> 9900181234567890
Field 3 -> 000000
Field 4 -> 0000000001000
Field 5 -> 0000000001000
Field 11 -> 322968
Field 12 -> 190411095645
Field 14 -> 0369
Field 22 -> 353131313031
Field 31 (LLVAR) -> Legnth 32 -> 

*/
/* Example */







module.exports = (incomingBuffer) => {
    testBuffer = Buffer.from("010447101200F834040328E0800800000000000000201699001812345678900000000000000010000000000010003229681904110956450369353131313031323133313443203130303030303030303030303030303030303031040123339900181234567890D4912101000007001030303030303030383136313430303030303131313030303030303030303030303132330832383132313938303834300088564231383230313631303235313435333432313133345649313832303136313032353134353334323131333456453138323031363130323531343533343231313334564331383230313631303235313435333432313133340012573F463331332E4430313132", "hex")

    let fieldsLength = [0, 0, 19, 6, 12, 12, 0, 0, 0, 0, 0, 6, 12, 0, 4, 0, 0, 0, 0, 0, 0, 0, 12, 0, 0, 0, 0, 0, 0, 0, 0, -1, 4, 0, 0, 0, 0, 12, 0, 0, 0, 8, 15, -1, 0, 0, 0, 0, 0, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -2, 0, -3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -1, 0, 0, 0, 0, 0] //0 = not used, -1 = variable max 2 digits, -2 = variable max 3 digits, -3 = variable max 4 digits

    // /****DEBUG FIELDS LENGTH ****/
    // /****DEBUG FIELDS LENGTH ****/
    // let fieldsDebug = {}
    // fieldsLength.forEach((element, i) => fieldsDebug[`Field ${i}`] = fieldsLength[i])
    // console.log(fieldsDebug)
    // /****DEBUG FIELDS LENGTH ****/
    // /****DEBUG FIELDS LENGTH ****/

    let buffer = incomingBuffer || testBuffer

    let msg = buffer.toString('hex')
    let json = {}
    let payload = msg.substring(44, msg.length - 1) //8 (header) + 4 (mti) + 32(bitmaps) = 44

    json["mti"] = msg.substring(8, 12)

    json["firstBitmap"] = parseInt(msg.substring(12, 28), 16).toString(2)
    json["firstBitmap"] = json["firstBitmap"].length == 64 ? json["firstBitmap"] : `00${json["firstBitmap"]}`

    json["secondBitmap"] = parseInt(msg.substring(28, 44), 16).toString(2)
    json["secondBitmap"] = json["secondBitmap"].length == 64 ? json["secondBitmap"] : `${'0'.repeat(64 - json["secondBitmap"].length)}${json["secondBitmap"]}`

    let fields = [];
    let i = 1
    for (const c of json["firstBitmap"]) {
        if (c == 1) {
            fields.push(i)
        }
        i++;
    }
    let j = 65
    for (const c of json["secondBitmap"]) {
        if (c == 1) {
            fields.push(j)
        }
        j++;
    }

    console.log(`Fields present: ${fields}`)

    json["field_2"] = msg.substring(44, 60)
    return json
}

/* Example */
/*

incoming buffer:
47101200F834040328E0800800000000000000201699001812345678900000000000000010000000000010003229681904110956450369353131313031323133313443203130303030303030303030303030303030303031040123339900181234567890D4912101000007001030303030303030383136313430303030303131313030303030303030303030303132330832383132313938303834300088564231383230313631303235313435333432313133345649313832303136313032353134353334323131333456453138323031363130323531343533343231313334564331383230313631303235313435333432313133340012573F463331332E4430313132

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
[...]

*/
/* Example */







module.exports = (incomingBuffer) => {

    hex2binary = require('./hex2binary.js')

    let testBuffer = Buffer.from("00f247101200f834040308e080080000000000000020169900181234567890000000000000001000000000001000322968190411095645036935313131303132313331344320313030303030303030303030303030303030303104012330303030303030383136313430303030303131313030303030303030303030303132330832383132313938303834300088564231383230313631303235313435333432313133345649313832303136313032353134353334323131333456453138323031363130323531343533343231313334564331383230313631303235313435333432313133340012573f463331332e4430313132", "hex")
    let fieldsLength = [0, 0, -1, 6, 12, 12, 0, 0, 0, 0, 0, 6, 12, 0, 4, 0, 0, 0, 0, 0, 0, 0, 12, 0, 0, 0, 0, 0, 0, 0, 0, -1, -1, 0, 0, 0, 0, 12, 0, 0, 0, 8, 15, -1, 0, 0, 0, 0, 0, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -3, 0, 0, 0, 0, 0] //0 = not used, -1 = variable max 2 digits, -2 = variable max 3 digits, -3 = variable max 4 digits, this array is consistent with provided documentation

    //Response test
    // let testBuffer = Buffer.from("00f247101210f83404030ce080080000000000000020169900181234567890000000000000001000000000001000322968190411095645036935313131303132313331344320313030303030303030303030303030303030303104012330303030303030383136313400030303030303131313030303030303030303030303132330832383132313938303834300088564231383230313631303235313435333432313133345649313832303136313032353134353334323131333456453138323031363130323531343533343231313334564331383230313631303235313435333432313133340012573f463331332e4430313132", "hex")
    // let fieldsLength = [0, 0, -1, 6, 12, 12, 0, 0, 0, 0, 0, 6, 12, 0, 4, 0, 0, 0, 0, 0, 0, 0, 12, 0, 0, 0, 0, 0, 0, 0, 0, -1, -1, 0, 0, 0, 0, 12, 3, 0, 0, 8, 15, -1, 0, 0, 0, 0, 0, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -3, 0, 0, 0, 0, 0]

    let asciiFields = [22, 31, 37, 41, 42, 43, 49, 50, 61, 63, 123]

    // /****DEBUG FIELDS LENGTH ****/
    // /****DEBUG FIELDS LENGTH ****/
    // let fieldsDebug = {}
    // fieldsLength.forEach((element, i) => fieldsDebug[`Field ${i}`] = fieldsLength[i])
    // console.log(fieldsDebug)
    // /****DEBUG FIELDS LENGTH ****/
    // /****DEBUG FIELDS LENGTH ****/

    let buffer = incomingBuffer || testBuffer

    let msg = buffer.toString('hex')
    console.log(`Message: ${msg}`)

    let decoded = {}
    decoded["mti"] = msg.substring(8, 12)


    /* Bit Mapping */
    decoded["firstBitmap"] = hex2binary(msg.substring(12, 28))
    decoded["secondBitmap"] = hex2binary(msg.substring(28, 44))
    /* Bit Mapping */

    /* Fields present in message */
    let fields = [];
    let i = 1
    for (const c of decoded["firstBitmap"]) {
        if (c == 1) {
            fields.push(i)
        }
        i++;
    }
    let j = 65
    for (const c of decoded["secondBitmap"]) {
        if (c == 1) {
            fields.push(j)
        }
        j++;
    }
    console.log(`Fields: ${fields}`)
    /* Fields present in message */


    /* Decoding */
    let payload = msg.substring(44, msg.length - 1) //8 (header) + 4 (mti) + 32(bitmaps) = 44
    let start = 0
    fields.forEach((field) => {
        if (fieldsLength[field] > 0) { //fixed length fields

            if (asciiFields.includes(field)) { //ASCII Fields

                decoded[`field_${field}`] = Buffer.from(payload.substr(start, fieldsLength[field] * 2), 'hex').toString()
                start += fieldsLength[field] * 2

            } else { //non ASCII Fields

                decoded[`field_${field}`] = payload.substr(start, fieldsLength[field])
                start += fieldsLength[field]
            }

        } else if (fieldsLength[field] < 0) { //variable length fields
            if (asciiFields.includes(field)) { //ASCII Fields

                if (fieldsLength[field] == -1) { //variable max 2 digits

                    let length = parseInt(payload.substring(start, start + 2)) * 2

                    start = start + 2
                    decoded[`field_${field}`] = Buffer.from(payload.substr(start, length), 'hex').toString()
                    start += length

                } else if (fieldsLength[field] == -2) { //variable max 3 digits
                    let length = parseInt(payload.substring(start, start + 3)) * 2
                    start = start + 3
                    decoded[`field_${field}`] = Buffer.from(payload.substr(start, length), 'hex').toString()
                    start += length
                } else if (fieldsLength[field] == -3) { //variable max 4 digits
                    let length = parseInt(payload.substring(start, start + 4)) * 2
                    start = start + 4
                    decoded[`field_${field}`] = Buffer.from(payload.substr(start, length), 'hex').toString()
                    start += length
                }

            } else { //non ASCII Fields

                if (fieldsLength[field] == -1) { //variable max 2 digits
                    let length = parseInt(payload.substring(start, start + 2))
                    start = start + 2
                    decoded[`field_${field}`] = payload.substr(start, length)
                    start += length
                } else if (fieldsLength[field] == -2) { //variable max 3 digits
                    let length = parseInt(payload.substring(start, start + 3))
                    start = start + 3
                    decoded[`field_${field}`] = payload.substr(start, length)
                    start += length
                } else if (fieldsLength[field] == -3) { //variable max 4 digits
                    let length = parseInt(payload.substring(start, start + 4))
                    start = start + 4
                    decoded[`field_${field}`] = payload.substr(start, length)
                    start += length
                }

            }
        }
    })
    /* Decoding */

    return decoded
}

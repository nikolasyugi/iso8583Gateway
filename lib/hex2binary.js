module.exports = (hexa) => {

    let binaryFirst = parseInt(hexa.substr(0, 8), 16).toString(2)
    let binarySecond = parseInt(hexa.substr(8, 8), 16).toString(2)

    binaryFirst = binaryFirst.length == 32 ? binaryFirst : `${'0'.repeat(32 - binaryFirst.length)}${binaryFirst}`
    binarySecond = binarySecond.length == 32 ? binarySecond : `${'0'.repeat(32 - binarySecond.length)}${binarySecond}`

    return binaryFirst + binarySecond
}
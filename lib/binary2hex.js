module.exports = (bin) => {

    let hexaFirst = parseInt(bin.substr(0, 32), 2).toString(16)
    let hexaSecond = parseInt(bin.substr(32, 32), 2).toString(16)

    hexaFirst = hexaFirst.length == 8 ? hexaFirst : `${'0'.repeat(8 - hexaFirst.length)}${hexaFirst}`
    hexaSecond = hexaSecond.length == 8 ? hexaSecond : `${'0'.repeat(8 - hexaSecond.length)}${hexaSecond}`

    return hexaFirst + hexaSecond
}
module.exports = (newMti, isoMsg) => {
    let newMsg = isoMsg
    newMsg = newMsg.substring(0, 8) + newMti + newMsg.substring(12, isoMsg.length)
    return newMsg
}
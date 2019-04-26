module.exports = function matchIso(isoApp, isoPOS) {
    return isoApp.logic_number == isoPOS.field_41 && isoApp.merchant == isoPOS.field_42 && isoApp.pan == isoPOS.field_2 && isoApp.amount == isoPOS.field_4 && isoApp.date_time == isoPOS.field_12 && isoApp.expiry == isoPOS.field_14 && isoApp.currency == isoPOS.field_49
}
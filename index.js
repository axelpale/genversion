
const gv = require('./lib/genversion')
const v = require('./lib/version')
const cv = require('./lib/checkVersion')

exports.check = gv.check
exports.generate = gv.generate
exports.version = v
exports.checkVersion = cv

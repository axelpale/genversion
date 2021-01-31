
var gv = require('./lib/genversion');
var v = require('./lib/version');
var cv = require('./lib/checkVersion');

exports.check = gv.check;
exports.generate = gv.generate;
exports.version = v;
exports.checkVersion = cv;

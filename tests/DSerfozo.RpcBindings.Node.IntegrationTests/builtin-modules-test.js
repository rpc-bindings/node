var builtin = require('builtin');

exports.test = function (callback, a, b) {
    callback(null, builtin.add(a, b));
}
var rpcbindings = require('dserfozo-rpcbindings');

exports.initialize = function (callback, modules) {
    rpcbindings.overrideModuleLoad(rpcbindings.buildMapStringKey(modules));
    
    callback(null, {});
}
var rpcbindings = require('dserfozo-rpcbindings');

let binder;
exports.initialize = function (callback, bindings) {
    debugger;

    const stream = callback.stream;
    
    binder = new rpcbindings.Binder(new rpcbindings.BindingConnection(stream), rpcbindings.buildMapIntKeyRecursive(bindings, 'methods', 'properties'));
    binder.bind(global);

    global.requireObject = binder.require.bind(binder);
}
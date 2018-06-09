const EventEmitter = require('events');
const readline = jest.genMockFromModule('readline');

let emitter;
readline.createInterface = function() {
    return emitter = new EventEmitter();
}

readline.__sendLine = function(line) {
    emitter.emit('line', line);
}

module.exports = readline;
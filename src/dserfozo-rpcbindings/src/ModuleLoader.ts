const Module = require('module');

export function overrideModuleLoad(builtInModules: Map<string, string>): void {
    const originalLoader = Module._load;
    Module._load = function (request, parent) {
        if (builtInModules.has(request)) {
            return originalLoader.apply(this, [builtInModules.get(request), parent]);
        }

        return originalLoader.apply(this, arguments);
    };
}
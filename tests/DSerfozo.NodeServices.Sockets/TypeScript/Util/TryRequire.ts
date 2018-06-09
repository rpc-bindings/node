const _req: any = eval('require');

export function tryRequire(id: string) {
    let path;
    debugger;
    try {
        path = _req.resolve(id);
    } catch (e) {
    }

    if (path) {
        return _req(path);
    }

    return undefined;
}
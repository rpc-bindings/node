export function buildMapStringKey<V>(obj: any) : Map<string, V> {
    return Object.keys(obj).reduce((m, k) => m.set(k, obj[k]), new Map());
}

export function buildMapIntKeyRecursive<V>(obj: any, ...recursivePaths:string[]) : Map<number, V> {
    const current = Object.keys(obj).reduce((m, k) => m.set(parseInt(k), obj[k]), new Map());
    
    recursivePaths.forEach(p => {
        current.forEach((v) => {
            if(v[p]) {
                v[p] = buildMapIntKeyRecursive<any>(v[p], ...recursivePaths);
            }
        })
    });

    return current;
}
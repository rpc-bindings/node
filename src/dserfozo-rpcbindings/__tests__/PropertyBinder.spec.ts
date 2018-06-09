import 'jest';
import { PropertyBinder, Registry, SavedCall } from '../src';

describe('PropertyBinder', () => {
    it('Should create', () => {
        expect(typeof new PropertyBinder(null, null, null, null, null)).toBe('object');
    });

    it('Should create property', () => {
        const binder = new PropertyBinder(1, <any>{id: 3, name: 'testProp', readable: true}, <any>{save:function(sc){sc.resolve();}}, <any>{save:function(){}}, <any>{})
        const obj = {};
        binder.bind(obj);

        expect(obj).toHaveProperty('testProp');
    });

    it('Should fail get for write-only', () => {
        const binder = new PropertyBinder(1, <any>{id: 3, name: 'testProp', writable: true, readable: false}, <any>{save:function(){}}, <any>{save:function(){}}, <any>{})
        const obj = {};
        binder.bind(obj);

        expect(obj.testProp).rejects.toBeTruthy();
    });

    it('Should fail set for read-only', () => {
        const binder = new PropertyBinder(1, <any>{id: 3, name: 'testProp', writable: false, readable: true}, <any>{save:function(){}}, <any>{save:function(){}}, <any>{})
        const obj = {};
        binder.bind(obj);

        expect(() => obj.testProp = '').toThrowError();
    });


    it('Should save getter execution', async () => {
        const saveFn = jest.fn();
        const binder = new PropertyBinder(1, <any>{id: 3, name: 'testProp', readable: true},
            <any>{save:saveFn}, <any>{save:function(){}},
            <any>{sendPropertyGetExecution:function(){}})
        const obj = {};
        binder.bind(obj);

        saveFn.mockImplementation(function(sc){sc.resolve()});

        const retPromise = await obj.testProp;

        expect(saveFn).toBeCalled();
    });

    it('Should send getter execution', async () => {
        const saveFn = jest.fn();
        const binder = new PropertyBinder(1, <any>{id: 3, name: 'testProp', readable: true},
            <any>{save:function(sc){sc.resolve(); return 1;}}, <any>{save:function(){}},
            <any>{sendPropertyGetExecution:saveFn})
        const obj = {};
        binder.bind(obj);

        const retPromise = await obj.testProp;

        expect(saveFn).toBeCalledWith({executionId:1, objectId:1, propertyId: 3});
    });

    it('Should send setter execution', () => {
        const saveFn = jest.fn();
        const binder = new PropertyBinder(1, <any>{id: 3, name: 'testProp', writable: true},
            <any>{save:function(sc){sc.resolve(); return 1;}}, <any>{save:function(){}},
            <any>{sendPropertySetExecution:saveFn})
        const obj = {};
        binder.bind(obj);

        obj.testProp = 'value';

        expect(saveFn).toBeCalledWith({executionId:1, objectId:1, propertyId: 3, value: 'value'});
    });

    it('Should save callback when set', () => {
        const saveFn = jest.fn();
        const func = function(){};
        const binder = new PropertyBinder(1, <any>{id: 3, name: 'testProp', writable: true},
            <any>{save:function(sc){sc.resolve(); return 1;}}, <any>{save:function(f){if(f === func) return 10; return 0; }},
            <any>{sendPropertySetExecution:saveFn})
        const obj = {};
        binder.bind(obj);

        obj.testProp = func;

        expect(saveFn).toBeCalledWith({executionId:1, objectId:1, propertyId: 3, value: {functionId: 10}});
    });

    it('Should save setter execution promise and wait for it in get', async () => {
        let savedCalls = new Array<SavedCall>();
        const binder = new PropertyBinder(1, <any>{ id: 3, name: 'testProp', writable: true, readable: true },
            <any>{
                save: function (sc:SavedCall) {
                    savedCalls.push(sc);
                    if(savedCalls.length > 0) {
                        sc.resolve();
                    }
                    return savedCalls.length;
                }
            }, <any>{ save: function () { } },
            <any>{ sendPropertySetExecution: function () { }, sendPropertyGetExecution: function () { } })
        const obj = {};
        binder.bind(obj);

        obj.testProp = 'value';

        let timeOfGet;
        const getPromise = obj.testProp.then(function () {
            timeOfGet = Date.now();

            return Promise.resolve();
        });

        let timeBeforeSetFinish = Date.now()
        savedCalls[0].resolve();

        await getPromise;

        expect(timeBeforeSetFinish).toBeLessThanOrEqual(timeOfGet);
    });

    it('Should set values instead of binding if present', async () => {
        const binder = new PropertyBinder(1, {
            id: 3,
            isValueSet: true,
            name: 'testProp',
            readable: true,
            value: {prop: 1},
        } as any, {save(sc) {sc.resolve(); }} as any, {save() {}} as any, {} as any);
        const obj = {};
        binder.bind(obj);

        expect(obj.testProp).toEqual({prop: 1});
    });
});
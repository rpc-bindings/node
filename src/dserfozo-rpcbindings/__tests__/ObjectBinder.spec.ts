import 'jest';
import { FunctionBinder, MethodDescriptor, ObjectBinder, PropertyBinder } from '../src';
import { ObjectDescriptor, MethodDescriptor } from '../src/ObjectDescriptor';

describe('ObjectBinder', () => {
    it('Should create', () => {
        expect(typeof new ObjectBinder(<any>{methods:[]}, <any>{}, <any>{}, <any>{}, <any>{})).toBe('object');
    });

    it('Should create bound object', () => {
        const binder = new ObjectBinder(<any>{id:1, name:'objName', methods:[]}, <any>{}, <any>{}, <any>{}, <any>{});
        const obj = {};
        binder.bind(obj);

        expect(typeof obj.objName).toBe('object');
    });

    it('Should create function binder', () => {
        var _bind = Function.prototype.apply.bind(Function.prototype.bind);
        Object.defineProperty(Function.prototype, 'bind', {
            value: function(obj) {
                var boundFunction = _bind(this, arguments);
                boundFunction.boundObject = obj;
                return boundFunction;
            }
        });

        const binder = new ObjectBinder(<any>{id:1, name:'objName', methods:[{id:3, name:'testFunc'}]}, <any>{}, <any>{}, <any>{}, <any>{});
        const obj = {};
        binder.bind(obj);

        expect(obj.objName.testFunc.boundObject).toBeInstanceOf(FunctionBinder);
    });

    it('Should create property binder', () => {
        var _bind = Function.prototype.apply.bind(Function.prototype.bind);
        Object.defineProperty(Function.prototype, 'bind', {
            value: function(obj) {
                var boundFunction = _bind(this, arguments);
                boundFunction.boundObject = obj;
                return boundFunction;
            }
        });

        const binder = new ObjectBinder(<any>{id:1, name:'objName', methods:[], properties: [{id:3, name:'testProp'}]}, <any>{}, <any>{}, <any>{}, <any>{});
        const obj = {};
        binder.bind(obj);

        const descriptor = Object.getOwnPropertyDescriptor(obj.objName, 'testProp');

        console.log(descriptor.get.toString());
        expect(descriptor.get.boundObject).toBeInstanceOf(PropertyBinder);
    });

    it('Should create nested bound object', () => {
        const binder = new ObjectBinder(<any>{id:1, name:'namespace1.namespace2.objName', methods:[]}, <any>{}, <any>{}, <any>{}, <any>{});
        const obj = {};
        binder.bind(obj);

        expect(typeof obj.namespace1.namespace2.objName).toBe('object');
    });

    it('Should create new object', () => {
        const testMethods = {1: { id: 1, name: 'method'}};
        const binder = new ObjectBinder({
            id: 1,
            methods: testMethods,
            name: 'objName',
        } as ObjectDescriptor,
         {} as any, {} as any, {} as any, {} as any);
        const obj = binder.bindToNew();

        expect(typeof obj.method).toBe('function');
    });
});

import 'jest';
import { FunctionBinder, Registry } from '../src';

describe('FunctionBinder', () => {
    it('Should create', () => {
        expect(typeof new FunctionBinder(null, null, null, null, null)).toBe('object');
    });

    it('Should create function', () => {
        const binder = new FunctionBinder(1, {id: 3, name: 'testFunc'}, <any>{save:function(){}}, <any>{save:function(){}}, <any>{})
        const obj = {};
        binder.bind(obj);

        expect(typeof obj.testFunc).toBe('function');
    });

    it('Should save execution', () => {
        const saveFn = jest.fn();
        const binder = new FunctionBinder(1, {id: 3, name: 'testFunc'},
            <any>{save:saveFn}, <any>{save:function(){}},
            <any>{sendMethodExecution:function(){}})
        const obj = {};
        binder.bind(obj);

        obj.testFunc();

        expect(saveFn).toBeCalled();
    });

    it('Should return Promise', async () => {
        let exec;
        const binder = new FunctionBinder(1, {id: 3, name: 'testFunc'},
            <any>{save:function(execution){exec = execution;return 1;}},
            <any>{save:function(){}},
            <any>{sendMethodExecution:function(){}})
        const obj = {};
        binder.bind(obj);

        const promise = obj.testFunc();
        exec.resolve();

        await expect(promise).resolves.toEqual(undefined);
    });

    it('Should save function arguments', async () => {
        const saveFn = jest.fn();
        const binder = new FunctionBinder(1, {id: 3, name: 'testFunc'},
            <any>{save:function(){return 1;}},
            <any>{save:saveFn},
            <any>{sendMethodExecution:function(){}})
        const obj = {};
        binder.bind(obj);

        const funcArg = function() {};
        obj.testFunc(funcArg);

        await expect(saveFn).toBeCalledWith(funcArg);
    });

    it('Should send message execution', async () => {
        let execution;
        let msg;
        const binder = new FunctionBinder(1, {id: 3, name: 'testFunc'},
            <any>{save:function(exec){execution = exec; return 1;}},
            <any>{save:function(){}},
            <any>{sendMethodExecution:function(message){msg = message;}})
        const obj = {};
        binder.bind(obj);

        const promise = obj.testFunc(1, 2, 3);
        execution.resolve();
        await promise;

        expect(msg).toEqual({
            objectId: 1,
            methodId: 3,
            executionId: 1,
            parameters: [1,2,3]
        });
    });

    it('Should convert function arguments', async () => {
        const saveFn = jest.fn();
        saveFn.mockReturnValue(1);

        let execution;
        let msg;
        const binder = new FunctionBinder(1, {id: 3, name: 'testFunc'},
            <any>{save:function(exec){execution = exec; return 1;}},
            <any>{save:saveFn},
            <any>{sendMethodExecution:function(message){msg = message;}})
        const obj = {};
        binder.bind(obj);

        const funcArg = function() {};
        const promise = obj.testFunc(funcArg);
        execution.resolve();
        await promise;

        expect(msg.parameters[0].functionId).toBe(1);
    });
});
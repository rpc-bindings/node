import 'jest';
import { Binder, BindingConnection, ObjectDescriptor, MethodDescriptor } from '../src';
import { EventEmitter } from 'events';
import { DynamicObjectRequest, DynamicObjectResponse } from '../src/RpcRequest';

describe('Binder', () => {
    it('Should be created', () => {
        expect(typeof new Binder(<any>{ on: function () { } }, new Map<number, any>())).toBe('object');
    });

    it('Should do method execution', async () => {
        const connection = <any>(new EventEmitter());
        let msg;
        connection.sendMethodExecution = function (message) {
            msg = message;
        };
        const binder = new Binder(<any>connection, new Map<number, any>([[1, { id: 1, name: 'test', methods: [{ id: 3, name: 'testFunc' }] }]]));
        const obj = {};

        binder.bind(obj);

        const promise = obj.test.testFunc();

        connection.emit(BindingConnection.METHOD_RESULT, { executionId: msg.executionId, success: true, result: 'test' });

        await expect(promise).resolves.toEqual('test');
    });

    it('Should execute sync callback', async () => {
        const connection = <any>(new EventEmitter());
        let msg;
        connection.sendMethodExecution = function (message) {
            msg = message;
        };
        connection.sendCallbackResult = function () { };
        const binder = new Binder(<any>connection, new Map<number, any>([[1, { id: 1, name: 'test', methods: [{ id: 3, name: 'testFunc' }] }]]));
        const obj = {};

        binder.bind(obj);

        const callback = jest.fn().mockReturnValue(1);
        const promise = obj.test.testFunc(callback);

        connection.emit(BindingConnection.METHOD_RESULT, { executionId: msg.executionId, success: true, result: 'test' });

        await promise;

        connection.emit(BindingConnection.CALLBACK_EXECUTION, { functionId: msg.parameters[0].functionId, executionId: 2, parameters: ['text', 1] })

        expect(callback).toBeCalledWith('text', 1);
    });

    it('Should send sync callback result', async () => {
        const connection = <any>(new EventEmitter());
        let msg;
        connection.sendMethodExecution = function (message) {
            msg = message;
        };
        connection.sendCallbackResult = jest.fn();
        const binder = new Binder(<any>connection, new Map<number, any>([[1, { id: 1, name: 'test', methods: [{ id: 3, name: 'testFunc' }] }]]));
        const obj = {};

        binder.bind(obj);

        const promise = obj.test.testFunc(function () { return 'result' });

        connection.emit(BindingConnection.METHOD_RESULT, { executionId: msg.executionId, success: true, result: 'test' });

        await promise;

        connection.emit(BindingConnection.CALLBACK_EXECUTION, { functionId: msg.parameters[0].functionId, executionId: 2, parameters: ['text', 1] })

        expect(connection.sendCallbackResult).toBeCalledWith({ executionId: 2, success: true, result: 'result' });
    });

    it('Should send sync callback error', async () => {
        const connection = <any>(new EventEmitter());
        let msg;
        connection.sendMethodExecution = function (message) {
            msg = message;
        };
        connection.sendCallbackResult = jest.fn();
        const binder = new Binder(<any>connection, new Map<number, any>([[1, { id: 1, name: 'test', methods: [{ id: 3, name: 'testFunc' }] }]]));
        const obj = {};

        binder.bind(obj);

        obj.test.testFunc(function () { throw 'exception'; });

        connection.emit(BindingConnection.METHOD_RESULT, { executionId: msg.executionId, success: true, result: 'test' });

        connection.emit(BindingConnection.CALLBACK_EXECUTION, { functionId: msg.parameters[0].functionId, executionId: 2, parameters: ['text', 1] })

        expect(connection.sendCallbackResult).toBeCalledWith({ executionId: 2, success: false, exception: 'exception' });
    });

    it('Should send async callback result', async () => {
        const connection = <any>(new EventEmitter());
        let msg;
        connection.sendMethodExecution = function (message) {
            msg = message;
        };
        connection.sendCallbackResult = jest.fn();
        const binder = new Binder(<any>connection, new Map<number, any>([[1, { id: 1, name: 'test', methods: [{ id: 3, name: 'testFunc' }] }]]));
        const obj = {};

        binder.bind(obj);

        const callbackPromise = Promise.resolve('result');
        const promise = obj.test.testFunc(function () { return callbackPromise; });

        connection.emit(BindingConnection.METHOD_RESULT, { executionId: msg.executionId, success: true, result: 'test' });

        await promise;

        connection.emit(BindingConnection.CALLBACK_EXECUTION, { functionId: msg.parameters[0].functionId, executionId: 2, parameters: ['text', 1] })

        await callbackPromise;

        expect(connection.sendCallbackResult).toBeCalledWith({ executionId: 2, success: true, result: 'result' });
    });

    it('Should send async callback error', async () => {
        const connection = <any>(new EventEmitter());
        let msg;
        connection.sendMethodExecution = function (message) {
            msg = message;
        };
        connection.sendCallbackResult = jest.fn();
        const binder = new Binder(<any>connection, new Map<number, any>([[1, { id: 1, name: 'test', methods: [{ id: 3, name: 'testFunc' }] }]]));
        const obj = {};

        binder.bind(obj);

        const callbackPromise = Promise.reject('exception');
        obj.test.testFunc(function () { return callbackPromise; });

        connection.emit(BindingConnection.METHOD_RESULT, { executionId: msg.executionId, success: true, result: 'test' });
        connection.emit(BindingConnection.CALLBACK_EXECUTION, { functionId: msg.parameters[0].functionId, executionId: 2, parameters: ['text', 1] })

        try {
            await callbackPromise;
        } catch {

        }

        expect(connection.sendCallbackResult).toBeCalledWith({ executionId: 2, success: false, exception: 'exception' });
    });

    it('Should delete callback', async () => {
        const connection = <any>(new EventEmitter());
        let msg;
        connection.sendMethodExecution = function (message) {
            msg = message;
        };
        connection.sendCallbackResult = jest.fn();
        const binder = new Binder(<any>connection, new Map<number, any>([[1, { id: 1, name: 'test', methods: [{ id: 3, name: 'testFunc' }] }]]));
        const obj = {};

        binder.bind(obj);

        const callback = jest.fn();
        const promise = obj.test.testFunc(callback);

        connection.emit(BindingConnection.METHOD_RESULT, { executionId: msg.executionId, success: true, result: 'test' });

        await promise;

        connection.emit(BindingConnection.DELETE_CALLBACK, { functionId: msg.parameters[0].functionId })
        connection.emit(BindingConnection.CALLBACK_EXECUTION, { functionId: msg.parameters[0].functionId, executionId: 2, parameters: ['text', 1] })

        expect(callback).not.toBeCalled();
    });

    it('Should do dynamic object request', async () => {
        const connection = new EventEmitter() as BindingConnection;
        let resolveFunc;
        const msgPromise = new Promise((resolve, reject) => {
            resolveFunc = resolve;
        });
        connection.sendDynamicObjectRequeset = (message) => {
            resolveFunc(message);
        };

        const binder = new Binder(connection, new Map<number, ObjectDescriptor>());

        const resultPromise = binder.require('testObj');

        const msg: DynamicObjectRequest = (await msgPromise) as DynamicObjectRequest;
        connection.emit(BindingConnection.DYNAMIC_OBJECT_RESULT, {
            executionId: msg.executionId,
            objectDescriptor: {
                id: 1,
                methods: new Map<number, MethodDescriptor>([[1, { id: 1, name: 'test' }]]),
                name: 'testObj',
            },
            success: true,
        } as DynamicObjectResponse);

        const result = await resultPromise;

        expect(typeof result.test).toBe('function');
    });

    it('Should bind method result', async () => {
        const connection = (new EventEmitter()) as any;
        let msg;
        connection.sendMethodExecution = (message) => {
            msg = message;
        };
        const binder = new Binder(connection as any,
            new Map<number, any>([[1, { id: 1, name: 'test', methods: [{ id: 3, name: 'testFunc' }] }]]));
        const obj = {};

        binder.bind(obj);

        const promise = obj.test.testFunc();

        connection.emit(BindingConnection.METHOD_RESULT,
            {
                executionId: msg.executionId,
                result: {
                    id: 1,
                    methods: new Map<number, MethodDescriptor>([[1, { id: 1, name: 'test' }]]),
                    type: '5F6FA749-5CD1-4A51-9F69-0B9657C55ECC',
                },
                success: true,
            });

        const result = await promise;

        expect(typeof result.test).toBe('function');
    });

    it('Should bind callback parameter.', async () => {
        const connection = (new EventEmitter()) as any;
        let msg;
        connection.sendMethodExecution = (message) => {
            msg = message;
        };
        // tslint:disable-next-line:no-empty
        connection.sendCallbackResult = () => { };
        const binder = new Binder(connection as any,
            new Map<number, any>([[1, { id: 1, name: 'test', methods: [{ id: 3, name: 'testFunc' }] }]]));
        const obj = {};

        binder.bind(obj);

        const callback = jest.fn().mockReturnValue(1);
        const promise = obj.test.testFunc(callback);

        connection.emit(BindingConnection.METHOD_RESULT,
            {
                executionId: msg.executionId,
                result: 'test',
                success: true,
            });

        await promise;

        connection.emit(BindingConnection.CALLBACK_EXECUTION,
            {
                executionId: 2,
                functionId: msg.parameters[0].functionId,
                parameters: ['text', {
                    id: 1,
                    methods: new Map<number, MethodDescriptor>([[1, { id: 1, name: 'test' }]]),
                    type: '5F6FA749-5CD1-4A51-9F69-0B9657C55ECC',
                }] ,
            });

        expect(callback).toBeCalledWith('text', expect.objectContaining({
            test: expect.any(Function),
        }));
    });

    it('Should handle dynamic object request error', async () => {
        const connection = new EventEmitter() as BindingConnection;
        let resolveFunc;
        const msgPromise = new Promise((resolve, reject) => {
            resolveFunc = resolve;
        });
        connection.sendDynamicObjectRequeset = (message) => {
            resolveFunc(message);
        };

        const binder = new Binder(connection, new Map<number, ObjectDescriptor>());

        const resultPromise = binder.require('testObj');

        const msg: DynamicObjectRequest = (await msgPromise) as DynamicObjectRequest;
        connection.emit(BindingConnection.DYNAMIC_OBJECT_RESULT, {
            exception: 'error',
            executionId: msg.executionId,
            success: false,
        } as DynamicObjectResponse);

        expect(resultPromise).rejects.toEqual('error');
    });

    it('Should not do dynamic object request when object already registered', async () => {
        const connection = new EventEmitter() as BindingConnection;
        const binder = new Binder(connection, new Map<number, ObjectDescriptor>([[1,
            {
                id: 1,
                methods: {
                    1: {
                        id: 1,
                        name: 'test',
                    },
                },
                name: 'testObj',
            }]]));

        const resultPromise = binder.require('testObj');

        const result = await resultPromise;

        expect(typeof result.test).toBe('function');
    });
});

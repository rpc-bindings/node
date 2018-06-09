import { BindingConnection } from './BindingConnection';
import { ObjectBinder } from './ObjectBinder';
import { MethodDescriptor, ObjectDescriptor } from './ObjectDescriptor';
import { Registry } from './Registry';
import {
    CallbackExecution,
    CallbackResult,
    DeleteCallback,
    DynamicObjectRequest,
    DynamicObjectResponse,
    MethodResult,
    PropertyGetSetResult,
} from './RpcRequest';
import { SavedCall } from './SavedCall';
import { buildMapIntKeyRecursive } from './Utils';

export class Binder {
    private readonly callRegistry = new Registry<SavedCall>();
    private readonly propertyExecutionRegistry = new Registry<SavedCall>();
    private readonly callbackRegistry = new Registry<(...args: any[]) => any>();
    private readonly dynamicObjectRequestRegistry = new Registry<SavedCall>();
    private readonly boundObjects = new Map<number, ObjectBinder>();

    constructor(private connection: BindingConnection, objectDescriptors: Map<number, ObjectDescriptor> | any) {
        connection.on(BindingConnection.CALLBACK_EXECUTION, this.onCallbackExecution.bind(this));
        connection.on(BindingConnection.DELETE_CALLBACK, this.onDeleteCallback.bind(this));
        connection.on(BindingConnection.METHOD_RESULT, this.onMethodResult.bind(this));
        connection.on(BindingConnection.PROPERTY_RESULT, this.onPropertyResult.bind(this));
        connection.on(BindingConnection.DYNAMIC_OBJECT_RESULT, this.onDynamicObjectResponse.bind(this));

        objectDescriptors.forEach(((elem: ObjectDescriptor) => {
            this.boundObjects.set(elem.id,
                new ObjectBinder(elem,
                    connection,
                    this.callRegistry,
                    this.propertyExecutionRegistry,
                    this.callbackRegistry));
        }).bind(this));
    }

    public require(objectName: string): Promise<any> {
        const registry = this.dynamicObjectRequestRegistry;
        const boundObjects = this.boundObjects;
        const connection = this.connection;
        return new Promise((resolve, reject) => {
            const objects = Array.from(boundObjects.values());
            const existingObjectBinder = objects.find((o) => o.name === objectName);
            if (existingObjectBinder) {
                const result = existingObjectBinder.bindToNew();
                resolve(result);
            } else {
                const id = registry.save(new SavedCall(resolve, reject));
                const req = {
                    executionId: id,
                    name: objectName,
                } as DynamicObjectRequest;

                connection.sendDynamicObjectRequeset(req);
            }
        });
    }

    public bind(rootObject: any): void {
        this.boundObjects.forEach((e) => e.bind(rootObject));
    }

    private onDynamicObjectResponse(dynamicObj: DynamicObjectResponse): void {
        const request = this.dynamicObjectRequestRegistry.get(dynamicObj.executionId);
        if (request) {
            if (dynamicObj.success) {
                const objectBinder = new ObjectBinder(dynamicObj.objectDescriptor,
                    this.connection,
                    this.callRegistry,
                    this.propertyExecutionRegistry,
                    this.callbackRegistry);
                const bindObj = {};
                request.resolve(objectBinder.bindToNew());
            } else {
                request.reject(dynamicObj.exception);
            }
        }
    }

    private onDeleteCallback(deleteCallback: DeleteCallback): void {
        this.callbackRegistry.delete(deleteCallback.functionId);
    }

    private onCallbackExecution(execution: CallbackExecution): void {
        const callback = this.callbackRegistry.get(execution.functionId);
        const connection = this.connection;

        if (callback) {
            try {
                const params = execution.parameters.map((p) => {
                    let result = p;
                    if (p && p.type === '5F6FA749-5CD1-4A51-9F69-0B9657C55ECC') {
                        const descriptor = result as ObjectDescriptor;
                        result = new ObjectBinder(descriptor,
                            this.connection,
                            this.callRegistry,
                            this.propertyExecutionRegistry,
                            this.callbackRegistry).bindToNew();
                    }

                    return result;
                });
                const callResult = callback.apply(null, params);
                if (callResult && typeof callResult.then === 'function') {
                    callResult.then((res) => {
                        connection.sendCallbackResult(
                            {
                                executionId: execution.executionId,
                                result: res,
                                success: true,
                            } as CallbackResult);
                    }, (error) => {
                        connection.sendCallbackResult(
                            {
                                exception: error.toString(),
                                executionId: execution.executionId,
                                success: false,
                            } as CallbackResult);
                    });
                } else {
                    connection.sendCallbackResult({
                        executionId: execution.executionId,
                        result: callResult,
                        success: true,
                    } as any);
                }
            } catch (e) {
                connection.sendCallbackResult({
                    exception: e.toString() ,
                    executionId: execution.executionId,
                    success: false,
                } as any);
            }
        }
    }

    private onMethodResult(result: MethodResult): void {
        const execution = this.callRegistry.get(result.executionId);
        if (execution) {
            this.callRegistry.delete(result.executionId);

            if (result.success) {
                let resultVal = result.result;
                if (resultVal && resultVal.type === '5F6FA749-5CD1-4A51-9F69-0B9657C55ECC') {
                    const descriptor = resultVal as ObjectDescriptor;
                    resultVal = new ObjectBinder(descriptor,
                        this.connection,
                        this.callRegistry,
                        this.propertyExecutionRegistry,
                        this.callbackRegistry).bindToNew();
                }

                execution.resolve(resultVal);
            } else {
                execution.reject(result.error);
            }
        }
    }

    private onPropertyResult(result: PropertyGetSetResult): void {
        const execution = this.propertyExecutionRegistry.get(result.executionId);
        if (execution) {
            this.propertyExecutionRegistry.delete(result.executionId);

            if (result.success) {
                execution.resolve(result.value);
            } else {
                execution.reject(result.error);
            }
        }
    }
}

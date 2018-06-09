import { ObjectDescriptor } from './ObjectDescriptor';

export interface CallbackExecution {
    executionId: number;
    functionId: number;
    parameters: any[];
}

export interface MethodResult {
    executionId: number;
    success: boolean;
    result: any;
    error: string;
}

export interface DeleteCallback {
    functionId: number;
}

export interface MethodExecution {
    executionId: number;
    methodId: number;
    objectId: number;
    parameters: any[];
}

export interface PropertyGetExecution {
    executionId: number;
    propertyId: number;
    objectId: number;

}

export interface PropertySetExecution {
    executionId: number;
    propertyId: number;
    objectId: number;
    value: any;
}

export interface PropertyGetSetResult {
    executionId: number;
    success: boolean;
    error: string;
    value: any;
}

export interface CallbackResult {
    executionId: number;
    success: boolean;
    result: any;
    exception: string;
}

export interface DynamicObjectResponse {
    executionId: number;
    success: boolean;
    objectDescriptor: ObjectDescriptor;
    exception: string;
}

export interface DynamicObjectRequest {
    executionId: number;
    name: string;
}

export interface RpcRequest {
    callbackExecution: CallbackExecution;
    methodResult: MethodResult;
    deleteCallback: DeleteCallback;
    propertyResult: PropertyGetSetResult;
    dynamicObjectResult: DynamicObjectResponse;
}

export interface RpcResponse {
    methodExecution: MethodExecution;
    propertyGet: PropertyGetExecution;
    propertySet: PropertySetExecution;
    callbackResult:CallbackResult;
}
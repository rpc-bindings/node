import { EventEmitter } from 'events';
import * as readline from 'readline';
import { Duplex } from 'stream';

import { CallbackResult, MethodExecution, PropertyGetExecution, PropertySetExecution, RpcRequest, DynamicObjectRequest } from './RpcRequest';

export class BindingConnection extends EventEmitter {
    public static readonly CALLBACK_EXECUTION = 'callback-execution';
    public static readonly METHOD_RESULT = 'method-result';
    public static readonly DELETE_CALLBACK = 'delete-callback';
    public static readonly PROPERTY_RESULT = 'property-result';
    public static readonly DYNAMIC_OBJECT_RESULT = 'dynamic-object-result';

    constructor(private stream: Duplex) {
        super();

        readline.createInterface(stream, null).on('line', (line) => {
            const rpcRequest = JSON.parse(line) as RpcRequest;

            if (rpcRequest.callbackExecution) {
                this.emit(BindingConnection.CALLBACK_EXECUTION, rpcRequest.callbackExecution);
            } else if (rpcRequest.methodResult) {
                this.emit(BindingConnection.METHOD_RESULT, rpcRequest.methodResult);
            } else if (rpcRequest.deleteCallback) {
                this.emit(BindingConnection.DELETE_CALLBACK, rpcRequest.deleteCallback);
            } else if (rpcRequest.propertyResult) {
                this.emit(BindingConnection.PROPERTY_RESULT, rpcRequest.propertyResult);
            } else if (rpcRequest.dynamicObjectResult) {
                this.emit(BindingConnection.DYNAMIC_OBJECT_RESULT, rpcRequest.dynamicObjectResult);
            }
        });
    }

    public sendCallbackResult(result: CallbackResult): void {
        this.writeLine(JSON.stringify({ callbackResult: result }));
    }

    public sendMethodExecution(execution: MethodExecution): void {
        this.writeLine(JSON.stringify({ methodExecution: execution }));
    }

    public sendPropertyGetExecution(execution: PropertyGetExecution) {
        this.writeLine(JSON.stringify({ propertyGet: execution }));
    }

    public sendPropertySetExecution(execution: PropertySetExecution) {
        this.writeLine(JSON.stringify({ propertySet: execution }));
    }

    public sendDynamicObjectRequeset(req: DynamicObjectRequest) {
        this.writeLine(JSON.stringify({ dynamicObjectRequest: req }));
    }

    private writeLine(line: string): void {
        this.stream.write(line);
        this.stream.write('\n');
    }
}

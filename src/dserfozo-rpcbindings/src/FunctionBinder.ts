import { MethodDescriptor } from './ObjectDescriptor';
import { Registry } from './Registry';
import { SavedCall } from './SavedCall';
import { BindingConnection } from './BindingConnection';

export class FunctionBinder {
    constructor(private objectId: number, 
                private descriptor: MethodDescriptor,
                private functionCallRegistry: Registry<SavedCall>,
                private callbackRegistry: Registry<(...args:any[]) => any>,
                private connection: BindingConnection) {

    }

    bind(obj: any): void {
        obj[this.descriptor.name] = (function () {
            const args = Array.prototype.slice.call(arguments);

            for (var i = 0; i < args.length; i++) {
                if (typeof (args[i]) === 'function') {
                    const callbackId = this.callbackRegistry.save(args[i]);
                    args[i] = { functionId: callbackId };
                }
            }

            const registry:Registry<SavedCall> = this.functionCallRegistry;
            const connection:BindingConnection = this.connection;
            const methodId = this.descriptor.id;
            const objectId = this.objectId;
            const promise = new Promise<any>((resolve, reject) => {
                const executionId = registry.save(new SavedCall(resolve, reject));
                connection.sendMethodExecution( {
                    executionId: executionId,
                    methodId: methodId,
                    objectId: objectId,
                    parameters: args
                });
            });

            return promise;
        }).bind(this);
    }
}
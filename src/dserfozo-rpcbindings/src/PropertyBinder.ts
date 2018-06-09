import { BindingConnection } from './BindingConnection';
import { PropertyDescriptor } from './ObjectDescriptor';
import { Registry } from './Registry';
import { SavedCall } from './SavedCall';

export class PropertyBinder {
    constructor(private objectId: number,
        private descriptor: PropertyDescriptor,
        private propertyExecutionRegistry: Registry<SavedCall>,
        private callbackRegistry: Registry<(...args: any[]) => any>,
        private connection: BindingConnection) {

    }

    public bind(obj: any): void {
        const descriptor = this.descriptor;
        const connection = this.connection;
        const objectId = this.objectId;
        const registry = this.propertyExecutionRegistry;
        const callbackRegistry = this.callbackRegistry;

        if (descriptor.isValueSet) {
            Object.defineProperty(obj, descriptor.name, {
                configurable: false,
                enumerable: true,
                value: descriptor.value,
                writable: false,
            });
        } else {
            let lastSetPromise = Promise.resolve();
            const propertyDescriptor = {
                configurable: false,
                enumerable: true,
                get: (() => {
                    if (!descriptor.readable) {
                        return Promise.reject('Property is not readable.');
                    }

                    return lastSetPromise.then(() => {
                        return new Promise((resolve, reject) => {
                            const executionId = registry.save(new SavedCall(resolve, reject));

                            connection.sendPropertyGetExecution({
                                executionId,
                                objectId,
                                propertyId: descriptor.id,
                            });
                        });
                    });
                }).bind(this),
            };

            if (descriptor.writable) {
                propertyDescriptor['set'] = ((value) => {
                    lastSetPromise = new Promise((resolve, reject) => {
                        const executionId = registry.save(new SavedCall(resolve, reject));

                        if (typeof value === 'function') {
                            value = { functionId: callbackRegistry.save(value) }
                        }

                        connection.sendPropertySetExecution({
                            executionId,
                            objectId,
                            propertyId: descriptor.id,
                            value,
                        });
                    });
                }).bind(this);
            }

            Object.defineProperty(obj, this.descriptor.name, propertyDescriptor);
        }
    }
}
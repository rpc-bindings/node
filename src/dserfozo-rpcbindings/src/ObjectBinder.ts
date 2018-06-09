import { BindingConnection } from './BindingConnection';
import { FunctionBinder } from './FunctionBinder';
import { MethodDescriptor, ObjectDescriptor } from './ObjectDescriptor';
import { PropertyBinder } from './PropertyBinder';
import { Registry } from './Registry';
import { CallbackExecution, MethodResult } from './RpcRequest';
import { SavedCall } from './SavedCall';
import { buildMapIntKeyRecursive } from './Utils';

export class ObjectBinder {
    private readonly functions = new Map<number, FunctionBinder>();
    private readonly properties = new Map<number, PropertyBinder>();

    public get name(): string {
        return this.objectDescriptor.name;
    }

    constructor(private objectDescriptor: ObjectDescriptor,
                connection: BindingConnection,
                functionCallRegistry: Registry<SavedCall>,
                propertyExecutionRegistry: Registry<SavedCall>,
                callbackRegistry: Registry<(...args: any[]) => any>) {
        if (this.objectDescriptor.methods) {
            if (typeof this.objectDescriptor.methods.forEach === 'undefined') {
                this.objectDescriptor.methods = buildMapIntKeyRecursive(this.objectDescriptor.methods);
            }

            this.objectDescriptor.methods.forEach(function(f: MethodDescriptor) {
                this.functions.set(f.id,
                    new FunctionBinder(objectDescriptor.id, f, functionCallRegistry, callbackRegistry, connection));
            }.bind(this));
        }

        if (this.objectDescriptor.properties) {
            if (typeof this.objectDescriptor.properties.forEach === 'undefined') {
                this.objectDescriptor.properties = buildMapIntKeyRecursive(this.objectDescriptor.properties);
            }

            this.objectDescriptor.properties
            .forEach((p) => this.properties.set(p.id,
                new PropertyBinder(objectDescriptor.id, p, propertyExecutionRegistry, callbackRegistry, connection)));
        }
    }

    public bind(rootObject: any): void {
        const namespace = this.objectDescriptor.name.split('.');

        let context = rootObject;
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < namespace.length; i++) {
            context = context[namespace[i]] ? context[namespace[i]] : (context[namespace[i]] = {});
        }

        this.functions.forEach((e) => e.bind(context));
        this.properties.forEach((e) => e.bind(context));
    }

    public bindToNew(): any {
        const result = {};

        this.functions.forEach((e) => e.bind(result));
        this.properties.forEach((e) => e.bind(result));

        return result;
    }
}

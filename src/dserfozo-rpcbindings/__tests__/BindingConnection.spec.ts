import 'jest';
import { BindingConnection } from '../src';

jest.mock('readline');

describe('BindingConnection', () => {
    it('Should create', () => {
        expect(typeof new BindingConnection(null)).toBe('object');
    });

    it('Should report callback execution', () => {
        const handler = jest.fn();
        const connection = new BindingConnection(null);
        connection.on(BindingConnection.CALLBACK_EXECUTION, handler);

        require('readline').__sendLine('{"callbackExecution":{"functionId":1,"executionId":3}}');

        expect(handler).toBeCalledWith({ functionId: 1, executionId: 3 });
    });

    it('Should report method result', () => {
        const handler = jest.fn();
        const connection = new BindingConnection(null);
        connection.on(BindingConnection.METHOD_RESULT, handler);

        require('readline').__sendLine('{"methodResult":{"methodId":1,"objectId":3}}');

        expect(handler).toBeCalledWith({ methodId: 1, objectId: 3 });
    });

    it('Should report delete callback', () => {
        const handler = jest.fn();
        const connection = new BindingConnection(null);
        connection.on(BindingConnection.DELETE_CALLBACK, handler);

        require('readline').__sendLine('{"deleteCallback":{"functionId":1}}');

        expect(handler).toBeCalledWith({ functionId: 1 });
    });

    it('Should report property result', () => {
        const handler = jest.fn();
        const connection = new BindingConnection(null);
        connection.on(BindingConnection.PROPERTY_RESULT, handler);

        require('readline').__sendLine('{"propertyResult":{"executionId":1}}');

        expect(handler).toBeCalledWith({ executionId: 1 });
    });

    it('Should report dynamic object response', () => {
        const handler = jest.fn();
        const connection = new BindingConnection(null);
        connection.on(BindingConnection.DYNAMIC_OBJECT_RESULT, handler);

        require('readline').__sendLine('{"dynamicObjectResult":{"executionId":1}}');

        expect(handler).toBeCalledWith({ executionId: 1 });
    });

    it('Should write dynamic object request', () => {
        let strContent = '';
        const connection = new BindingConnection({
            write(data) {
                strContent += data;
            },
        } as any);

        connection.sendDynamicObjectRequeset({ executionId: 1 } as any);

        expect(strContent).toBe('{"dynamicObjectRequest":{"executionId":1}}\n');
    });

    it('Should write callback result', () => {
        let strContent = '';
        const connection = new BindingConnection(<any>{
            write(data) {
                strContent += data;
            }
        });

        connection.sendCallbackResult(<any>{ executionId: 1 });

        expect(strContent).toBe('{"callbackResult":{"executionId":1}}\n');
    });

    it('Should write method execution', () => {
        let strContent = '';
        const connection = new BindingConnection(<any>{
            write(data) {
                strContent += data;
            }
        });

        connection.sendMethodExecution(<any>{ methodId: 1, objectId: 2 });

        expect(strContent).toBe('{"methodExecution":{"methodId":1,"objectId":2}}\n');
    });

    it('Should write property get execution', () => {
        let strContent = '';
        const connection = new BindingConnection(<any>{
            write(data) {
                strContent += data;
            }
        });

        connection.sendPropertyGetExecution(<any>{ propertyId: 1, objectId: 2 });

        expect(strContent).toBe('{"propertyGet":{"propertyId":1,"objectId":2}}\n');
    });

    it('Should write property set execution', () => {
        let strContent = '';
        const connection = new BindingConnection(<any>{
            write(data) {
                strContent += data;
            }
        });

        connection.sendPropertySetExecution(<any>{ propertyId: 1, objectId: 2, value: {} });

        expect(strContent).toBe('{"propertySet":{"propertyId":1,"objectId":2,"value":{}}}\n');
    });
});
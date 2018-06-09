import 'jest';
import { buildMapIntKeyRecursive } from '../src';

describe('Utils', ()=>{
    it('Should convert objects to map', () => {
        const testObj = {"2": 
            {
                id:2,
                methods: {
                    "1": { id:1 },
                    "2": { id:2 }
                }
            }
        } 

        const actual = buildMapIntKeyRecursive<any>(testObj, 'methods');

        expect(actual).toEqual(new Map<number, any>([[2, {id:2, methods: new Map<number, any>([[1, {id:1}], [2, {id:2}]])}]]));
    });
});
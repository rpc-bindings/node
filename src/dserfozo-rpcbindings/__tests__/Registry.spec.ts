import 'jest';
import { Registry } from '../src';

describe('Registry', () => {
    it('Should create', () => {
        expect(typeof new Registry<number>()).toBe('object');
    });

    it('Should store callbacks', () => {
        const registry = new Registry<any>();
        const saved = {};

        const id = registry.save(saved);

        expect(registry.get(id)).toBe(saved);
    });

    it('Should delete callbacks', () => {
        const registry = new Registry<any>();
        const saved = {};

        const id = registry.save(saved);
        registry.delete(id);

        expect(registry.get(id)).toBeNull();
    });

    it('Should generate new ids', () => {
        const registry = new Registry<any>();
        const saved = {};

        const id = registry.save(saved);
        const id2 = registry.save(saved);

        expect(id2).toBeGreaterThan(id);
    });
});
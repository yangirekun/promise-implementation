import { PromiseImplementation } from '..';

describe('Promise implementation, base', () => {
    test('it should throw error if executor is not provided', () => {
        const promiseCreator = () => new PromiseImplementation();

        expect(promiseCreator).toThrow('No executor provided.');
    });

    test('it should have the correct initial state', () => {
        const promise = new PromiseImplementation(() => {});

        expect(promise['state']).toBe('pending');
        expect(promise['result']).toBeUndefined();
    });
});

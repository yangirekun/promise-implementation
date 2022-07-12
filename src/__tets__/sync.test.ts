import { PromiseImplementation } from '..';

describe('Promise implementation, sync', () => {
    test('it should have the correct state after resolve', () => {
        const promise = new PromiseImplementation((resolve, reject) => {
            resolve('result');
        });

        expect(promise['state']).toBe('fulfilled');
        expect(promise['result']).toBe('result');
    });

    test('it should have the correct state after reject', () => {
        const promise = new PromiseImplementation((resolve, reject) => {
            reject('error');
        });

        expect(promise['state']).toBe('rejected');
        expect(promise['result']).toBe('error');
    });

    test('it should call resolve | reject only once', () => {
        const promise1 = new PromiseImplementation((resolve, reject) => {
            resolve('result');
            resolve('another result');
        });

        expect(promise1['state']).toBe('fulfilled');
        expect(promise1['result']).toBe('result');

        const promise2 = new PromiseImplementation((resolve, reject) => {
            reject('error');
            reject('another error');
        });

        expect(promise2['state']).toBe('rejected');
        expect(promise2['result']).toBe('error');

        const promise3 = new PromiseImplementation((resolve, reject) => {
            resolve('result');
            reject('error');
        });

        expect(promise3['state']).toBe('fulfilled');
        expect(promise3['result']).toBe('result');

        const promise4 = new PromiseImplementation((resolve, reject) => {
            reject('error');
            resolve('another error');
        });

        expect(promise4['state']).toBe('rejected');
        expect(promise4['result']).toBe('error');
    });
});
import { PromiseImplementation } from '..';

describe('Promise implementation, async', () => {
    test('it should have the correct state after resolve', (done) => {
        const promise = new PromiseImplementation((resolve, reject) => {
            setTimeout(() => resolve('result'), 100);
        });

        expect(promise['state']).toBe('pending');
        expect(promise['result']).toBeUndefined();

        setTimeout(() => {
            expect(promise['state']).toBe('fulfilled');
            expect(promise['result']).toBe('result');

            done();
        }, 100);
    });

    test('it should have the correct state after reject', (done) => {
        const promise = new PromiseImplementation((resolve, reject) => {
            setTimeout(() => reject('error'), 100);
        });

        expect(promise['state']).toBe('pending');
        expect(promise['result']).toBeUndefined();

        setTimeout(() => {
            expect(promise['state']).toBe('rejected');
            expect(promise['result']).toBe('error');

            done();
        }, 100);
    });

    test('it should call resolve | reject only once', (done) => {
        const promise1 = new PromiseImplementation((resolve, reject) => {
            setTimeout(() => {
                resolve('result');
                resolve('another result');
            }, 100);
        });

        expect(promise1['state']).toBe('pending');
        expect(promise1['result']).toBeUndefined();

        setTimeout(() => {
            expect(promise1['state']).toBe('fulfilled');
            expect(promise1['result']).toBe('result');

            done();
        }, 100);

        const promise2 = new PromiseImplementation((resolve, reject) => {
            setTimeout(() => {
                reject('error');
                reject('another error');
            }, 100);
        });

        expect(promise2['state']).toBe('pending');
        expect(promise2['result']).toBeUndefined();

        setTimeout(() => {
            expect(promise2['state']).toBe('rejected');
            expect(promise2['result']).toBe('error');

            done();
        }, 100);

        const promise3 = new PromiseImplementation((resolve, reject) => {
            setTimeout(() => {
                resolve('result');
                reject('error');
            }, 100);
        });

        expect(promise3['state']).toBe('pending');
        expect(promise3['result']).toBeUndefined();

        setTimeout(() => {
            expect(promise3['state']).toBe('fulfilled');
            expect(promise3['result']).toBe('result');

            done();
        }, 100);

        const promise4 = new PromiseImplementation((resolve, reject) => {
            setTimeout(() => {
                reject('error');
                resolve('another error');
            }, 100);
        });

        expect(promise4['state']).toBe('pending');
        expect(promise4['result']).toBeUndefined();

        setTimeout(() => {
            expect(promise4['state']).toBe('rejected');
            expect(promise4['result']).toBe('error');

            done();
        }, 100);
    });
});

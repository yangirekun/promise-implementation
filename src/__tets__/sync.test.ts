import { PromiseImplementation } from '..';

describe('Promise implementation, sync', () => {
    test('it should have the correct state after resolve', () => {
        const promise = new PromiseImplementation((resolve, reject) => {
            resolve('result');
        });

        expect(promise['state']).toBe('fulfilled');
        expect(promise['result']).toBe('result');
    });

    test('it should have the correct state after resolve with resolved promise', (done) => {
        const promise = new PromiseImplementation((resolve) => {
            resolve(
                new PromiseImplementation((resolve) => {
                    resolve('result');
                })
            );
        });

        expect(promise['state']).toBe('pending');
        expect(promise['result']).toBeUndefined();

        promise.then((x) => {
            expect(x).toBe('result');

            expect(promise['state']).toBe('fulfilled');
            expect(promise['result']).toBe('result');

            done();
        });

        expect.assertions(5);
    });

    test('it should have the correct state after resolve with rejected promise', (done) => {
        const promise = new PromiseImplementation((resolve) => {
            resolve(
                new PromiseImplementation((resolve, reject) => {
                    reject('Whoops');
                })
            );
        });

        expect(promise['state']).toBe('pending');
        expect(promise['result']).toBeUndefined();

        promise
            .then((x) => {
                // wouldn't invoke
                expect(x).toBe('blablabla');
                return 'blablabla';
            })
            .catch((err) => {
                expect(err).toBe('Whoops');

                expect(promise['state']).toBe('rejected');
                expect(promise['result']).toBe('Whoops');

                done();
            });

        expect.assertions(5);
    });

    test('it should have the correct state after resolve with resolved chain', (done) => {
        const promise = new PromiseImplementation((resolve) => {
            resolve(
                new PromiseImplementation((resolve) => {
                    resolve(1);
                })
                    .then((x) => x * 2)
                    .then((x) => x * 2)
            );
        });

        expect(promise['state']).toBe('pending');
        expect(promise['result']).toBeUndefined();

        promise.then((x) => {
            expect(x).toBe(4);

            expect(promise['state']).toBe('fulfilled');
            expect(promise['result']).toBe(4);

            done();
        });

        expect.assertions(5);
    });

    test('it should have the correct state after resolve with rejected chain', (done) => {
        const promise = new PromiseImplementation((resolve) => {
            resolve(
                new PromiseImplementation((resolve) => {
                    resolve(1);
                })
                    .then((x) => x * 2)
                    .then((x) => {
                        throw new Error('Whoops');
                    })
            );
        });

        expect(promise['state']).toBe('pending');
        expect(promise['result']).toBeUndefined();

        promise
            .then((x) => {
                // wouldn't invoke
                expect(x).toBe('blablabla');
                return 'blablabla';
            })
            .catch((err) => {
                expect(err.message).toBe('Whoops');

                expect(promise['state']).toBe('rejected');
                expect(promise['result'].message).toBe('Whoops');

                done();
            });

        expect.assertions(5);
    });

    test('it should have the correct state after resolve with nested resolved promise', (done) => {
        const promise = new PromiseImplementation((resolve) => {
            resolve(
                new PromiseImplementation((resolve) => {
                    resolve(
                        new PromiseImplementation((resolve) => {
                            resolve('result');
                        })
                    );
                })
            );
        });

        expect(promise['state']).toBe('pending');
        expect(promise['result']).toBeUndefined();

        promise.then((x) => {
            expect(x).toBe('result');

            expect(promise['state']).toBe('fulfilled');
            expect(promise['result']).toBe('result');

            done();
        });

        expect.assertions(5);
    });

    test('it should have the correct state after resolve with nested rejected promise', (done) => {
        const promise = new PromiseImplementation((resolve) => {
            resolve(
                new PromiseImplementation((resolve) => {
                    resolve(
                        new PromiseImplementation((resolve, reject) => {
                            reject('Whoops');
                        })
                    );
                })
            );
        });

        expect(promise['state']).toBe('pending');
        expect(promise['result']).toBeUndefined();

        promise
            .then((x) => {
                // wouldn't invoke
                expect(x).toBe('blablabla');
                return 'blablabla';
            })
            .catch((err) => {
                expect(err).toBe('Whoops');

                expect(promise['state']).toBe('rejected');
                expect(promise['result']).toBe('Whoops');

                done();
            });

        expect.assertions(5);
    });

    test('it should have the correct state after reject', () => {
        const promise = new PromiseImplementation((resolve, reject) => {
            reject('error');
        });

        expect(promise['state']).toBe('rejected');
        expect(promise['result']).toBe('error');
    });

    test('it should have the correct state after reject with any promise', () => {
        const promise = new PromiseImplementation((resolve, reject) => {
            reject(new PromiseImplementation(() => {}));
        });

        expect(promise['state']).toBe('rejected');
        expect(promise['result']).toBeInstanceOf(PromiseImplementation);
    });

    test('it should call resolve | reject only once', (done) => {
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

        const promise5 = new PromiseImplementation((resolve) => {
            resolve(
                new PromiseImplementation((resolve, reject) => {
                    resolve('result');
                })
            );
            resolve('another result');
        });

        promise5.then((x) => {
            expect(x).toBe('result');

            expect(promise5['state']).toBe('fulfilled');
            expect(promise5['result']).toBe('result');
        });

        const promise6 = new PromiseImplementation((resolve, reject) => {
            resolve(
                new PromiseImplementation((resolve, reject) => {
                    resolve('result');
                })
            );
            reject('Whoops');
        });

        promise6.then((x) => {
            expect(x).toBe('result');

            expect(promise6['state']).toBe('fulfilled');
            expect(promise6['result']).toBe('result');
        });

        const promise7 = new PromiseImplementation((resolve, reject) => {
            resolve(
                new PromiseImplementation((resolve, reject) => {
                    resolve('result');
                })
            );
            resolve(
                new PromiseImplementation((resolve, reject) => {
                    resolve('another result');
                })
            );
        });

        promise7.then((x) => {
            expect(x).toBe('result');

            expect(promise7['state']).toBe('fulfilled');
            expect(promise7['result']).toBe('result');

            done();
        });

        expect.assertions(17);
    });
});

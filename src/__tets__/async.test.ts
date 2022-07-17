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

    test('it should have the correct state after resolve with resolved promise', (done) => {
        const promise = new PromiseImplementation((resolve) => {
            setTimeout(
                () =>
                    resolve(
                        new PromiseImplementation((resolve) => {
                            setTimeout(() => resolve('result'), 100);
                        })
                    ),
                100
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
            setTimeout(
                () =>
                    resolve(
                        new PromiseImplementation((resolve, reject) => {
                            setTimeout(() => reject('Whoops'), 100);
                        })
                    ),
                100
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
            setTimeout(
                () =>
                    resolve(
                        new PromiseImplementation((resolve) => {
                            setTimeout(() => resolve(1), 100);
                        })
                            .then((x) => x * 2)
                            .then((x) => x * 2)
                    ),
                100
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
            setTimeout(
                () =>
                    resolve(
                        new PromiseImplementation((resolve) => {
                            setTimeout(() => resolve(1), 100);
                        })
                            .then((x) => x * 2)
                            .then((x) => {
                                throw new Error('Whoops');
                            })
                    ),
                100
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
            setTimeout(
                () =>
                    resolve(
                        new PromiseImplementation((resolve) => {
                            setTimeout(
                                () =>
                                    resolve(
                                        new PromiseImplementation((resolve) => {
                                            setTimeout(() => resolve('result'), 100);
                                        })
                                    ),
                                100
                            );
                        })
                    ),
                100
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
            setTimeout(
                () =>
                    resolve(
                        new PromiseImplementation((resolve) => {
                            setTimeout(
                                () =>
                                    resolve(
                                        new PromiseImplementation((resolve, reject) => {
                                            setTimeout(() => reject('Whoops'), 100);
                                        })
                                    ),
                                100
                            );
                        })
                    ),
                100
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

    test('it should have the correct state after reject with any promise', (done) => {
        const promise = new PromiseImplementation((resolve, reject) => {
            setTimeout(
                () =>
                    reject(
                        new PromiseImplementation(() => {
                            setTimeout(() => {}, 100);
                        })
                    ),
                100
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
                expect(err).toBeInstanceOf(PromiseImplementation);

                expect(promise['state']).toBe('rejected');
                expect(promise['result']).toBeInstanceOf(PromiseImplementation);

                done();
            });

        expect.assertions(5);
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
        }, 100);

        const promise5 = new PromiseImplementation((resolve) => {
            resolve(
                new PromiseImplementation((resolve, reject) => {
                    setTimeout(() => resolve('result'), 100);
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
                    setTimeout(() => resolve('result'), 100);
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
                    setTimeout(() => resolve('result'), 100);
                })
            );
            resolve(
                new PromiseImplementation((resolve, reject) => {
                    setTimeout(() => resolve('another result'), 100);
                })
            );
        });

        promise7.then((x) => {
            expect(x).toBe('result');

            expect(promise7['state']).toBe('fulfilled');
            expect(promise7['result']).toBe('result');

            done();
        });

        expect.assertions(25);
    });
});

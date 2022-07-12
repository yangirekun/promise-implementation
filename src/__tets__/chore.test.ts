import { PromiseImplementation } from '..';

describe('Promise implementation, edge cases', () => {
    test('it should correctly handle different consumers on the same instance (sync scenario)', (done) => {
        const promise = new PromiseImplementation((resolve) => {
            resolve(1);
        });

        const output = [];

        promise
            .then((x1) => {
                expect(x1).toBe(1);
                output.push('x1: ' + x1);
                return x1 * 2;
            })
            .then((x2) => {
                expect(x2).toBe(2);
                output.push('x2: ' + x2);
                return x2 * 2;
            });

        promise
            .then((x3) => {
                expect(x3).toBe(1);
                output.push('x3: ' + x3);
                return x3 * 2;
            })
            .then((x4) => {
                expect(x4).toBe(2);
                output.push('x4: ' + x4);
                return x4 * 2;
            });

        promise
            .then((x5) => {
                expect(x5).toBe(1);
                output.push('x5: ' + x5);
                return x5 * 2;
            })
            .then((x6) => {
                expect(x6).toBe(2);
                output.push('x6: ' + x6);
                expect(output.join(', ')).toBe('x1: 1, x3: 1, x5: 1, x2: 2, x4: 2, x6: 2');
                done();
                return x6 * 2;
            });

        expect.assertions(7);
    });

    test('it should correctly handle different consumers on the same instance (async scenario)', (done) => {
        const promise = new PromiseImplementation((resolve) => {
            setTimeout(() => {
                resolve(1);
            }, 100);
        });

        const output = [];

        promise
            .then((x1) => {
                expect(x1).toBe(1);
                output.push('x1: ' + x1);
                return x1 * 2;
            })
            .then((x2) => {
                expect(x2).toBe(2);
                output.push('x2: ' + x2);
                return x2 * 2;
            });

        promise
            .then((x3) => {
                expect(x3).toBe(1);
                output.push('x3: ' + x3);
                return x3 * 2;
            })
            .then((x4) => {
                expect(x4).toBe(2);
                output.push('x4: ' + x4);
                return x4 * 2;
            });

        promise
            .then((x5) => {
                expect(x5).toBe(1);
                output.push('x5: ' + x5);
                return x5 * 2;
            })
            .then((x6) => {
                expect(x6).toBe(2);
                output.push('x6: ' + x6);
                expect(output.join(', ')).toBe('x1: 1, x3: 1, x5: 1, x2: 2, x4: 2, x6: 2');
                done();
                return x6 * 2;
            });

        expect.assertions(7);
    });

    test('it should call .catch after exception in constructor', (done) => {
        new PromiseImplementation((resolve, reject) => {
            throw new Error('Whooops!');
        }).catch((err) => {
            expect(err.message).toBe('Whooops!');
            done();
        });
    });

    test('it should call .catch after exception in finally', (done) => {
        new PromiseImplementation((resolve, reject) => {
            resolve('result');
        })
            .then((x) => {
                expect(x).toBe('result');
            })
            .finally(() => {
                throw new Error('Whoops!');
            })
            .then((x) => {
                // wouldn't invoke
                expect(x).toBe('blablabla');
                return 'result';
            })
            .catch((err) => {
                expect(err.message).toBe('Whoops!');
                done();
            });

        expect.assertions(2);
    });

    test('it should return instance only on user usage', (done) => {
        const promise = new PromiseImplementation((resolve, reject) => {
            setTimeout(() => resolve('result'), 100);
        });

        const spy = jest.spyOn(promise, 'then');

        promise.then(() => {});

        expect(spy).toBeCalledTimes(1);

        expect(spy.mock.results[0].type).toBe('return');
        expect(spy.mock.results[0].value).toBeInstanceOf(PromiseImplementation);

        setTimeout(() => {
            expect(spy).toBeCalledTimes(2);

            expect(spy.mock.results[1].type).toBe('return');
            expect(spy.mock.results[1].value).toBeUndefined();

            done();
        }, 100);
    });
});

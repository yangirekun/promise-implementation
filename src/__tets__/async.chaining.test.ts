import { PromiseImplementation } from '..';

describe('Promise implementation, async chaining', () => {
    test('it should call .then and pass result to it after resolve', (done) => {
        new PromiseImplementation((resolve, reject) => {
            setTimeout(() => {
                resolve('result');
            }, 100);
        }).then((result) => {
            expect(result).toBe('result');
            done();
        });

        expect.assertions(1);
    });

    test('it should pass results through the chain', (done) => {
        new PromiseImplementation((resolve, reject) => {
            setTimeout(() => {
                resolve(1);
            }, 100);
        })
            .then((result) => {
                expect(result).toBe(1);
                return result * 2;
            })
            .then((result) => {
                expect(result).toBe(2);
                return result * 2;
            })
            .then((result) => {
                expect(result).toBe(4);
                done();
            });

        expect.assertions(3);
    });

    test('it should pass results through the chain of promises', (done) => {
        new PromiseImplementation((resolve, reject) => {
            setTimeout(() => {
                resolve(1);
            }, 100);
        })
            .then((result) => {
                expect(result).toBe(1);
                return new PromiseImplementation((resolve) => {
                    setTimeout(() => resolve(result * 2), 100);
                });
            })
            .then((result) => {
                expect(result).toBe(2);
                return new PromiseImplementation((resolve) => {
                    setTimeout(() => resolve(result * 2), 100);
                });
            })
            .then((result) => {
                expect(result).toBe(4);
                return new PromiseImplementation((resolve) => {
                    setTimeout(() => resolve(result * 2), 100);
                });
            })
            .then((result) => {
                expect(result).toBe(8);
                done();
            });

        expect.assertions(4);
    });

    test('it should ignore "empty" .then in chain', (done) => {
        new PromiseImplementation((resolve, reject) => {
            setTimeout(() => {
                resolve('result');
            }, 100);
        })
            .then()
            .then((result) => {
                expect(result).toBe('result');
                done();
            });

        expect.assertions(1);
    });

    test('it should correctly handle return of resolved promise in the arbitary .then', (done) => {
        new PromiseImplementation((resolve, reject) => {
            setTimeout(() => {
                resolve(1);
            }, 100);
        })
            .then((result) => {
                return new PromiseImplementation((resolve) => {
                    setTimeout(() => {
                        resolve(result * 2);
                    }, 100);
                });
            })
            .then((result) => {
                expect(result).toBe(2);
                done();
            });

        expect.assertions(1);
    });

    test('it should correctly handle return of rejected promise in the arbitary .then', (done) => {
        new PromiseImplementation((resolve, reject) => {
            setTimeout(() => {
                resolve(1);
            }, 100);
        })
            .then((result) => {
                return new PromiseImplementation((resolve, reject) => {
                    setTimeout(() => {
                        reject('error');
                    }, 100);
                });
            })
            .then((result) => {
                // wouldn't invoke
                expect(result).toBe('blablabla');
                return result * 2;
            })
            .catch((error) => {
                expect(error).toBe('error');
                done();
            });

        expect.assertions(1);
    });

    test('it should call .catch and pass error to it after reject', (done) => {
        new PromiseImplementation((resolve, reject) => {
            setTimeout(() => {
                reject('error');
            }, 100);
        }).catch((err) => {
            expect(err).toBe('error');
            done();
        });

        expect.assertions(1);
    });

    test('it should call .catch at the end of the chain and "ignore" .then handlers', (done) => {
        new PromiseImplementation((resolve, reject) => {
            setTimeout(() => {
                reject('error');
            }, 100);
        })
            .then((result) => {
                // wouldn't invoke
                expect(result).toBe('blablabla');
                return 'result';
            })
            .then((result) => {
                // wouldn't invoke
                expect(result).toBe('blablabla');
                return result;
            })
            .catch((err) => {
                expect(err).toBe('error');
                done();
            });

        expect.assertions(1);
    });

    test('it should call .catch, when error is occured in arbitary .then', (done) => {
        new PromiseImplementation((resolve, reject) => {
            setTimeout(() => {
                resolve(1);
            }, 100);
        })
            .then((result) => {
                expect(result).toBe(1);
                return result * 2;
            })
            .then((result) => {
                expect(result).toBe(2);
                throw new Error('error in .then');
            })
            .catch((err) => {
                expect(err.message).toBe('error in .then');
                done();
            });

        expect.assertions(3);
    });

    test('it should call .catch after rethrow', (done) => {
        new PromiseImplementation((resolve, reject) => {
            setTimeout(() => {
                reject('error');
            }, 100);
        })
            .then((result) => {
                // wouldn't invoke
                expect(result).toBe('blablabla');
                return 'result';
            })
            .then((result) => {
                // wouldn't invoke
                expect(result).toBe('blablabla');
                return result;
            })
            .catch((err) => {
                expect(err).toBe('error');
                throw new Error('another error');
            })
            .catch((err) => {
                expect(err.message).toBe('another error');
                done();
            });

        expect.assertions(2);
    });

    test('it should call .then after error handling', (done) => {
        new PromiseImplementation((resolve, reject) => {
            setTimeout(() => {
                reject('error');
            }, 100);
        })
            .then((result) => {
                // wouldn't invoke
                expect(result).toBe('blablabla');
                return 'result';
            })
            .then((result) => {
                // wouldn't invoke
                expect(result).toBe('blablabla');
                return result;
            })
            .catch((err) => {
                expect(err).toBe('error');
                return 'result from error handler';
            })
            .then((result) => {
                expect(result).toBe('result from error handler');
                done();
            });

        expect.assertions(2);
    });

    test('it should correctly handle return of resolved promise in .catch', (done) => {
        new PromiseImplementation((resolve, reject) => {
            setTimeout(() => {
                reject('Whoops');
            }, 100);
        })
            .catch((error) => {
                expect(error).toBe('Whoops');

                return new PromiseImplementation((resolve, reject) => {
                    setTimeout(() => {
                        resolve(1);
                    }, 100);
                });
            })
            .then((result) => {
                expect(result).toBe(1);
                done();
            });

        expect.assertions(2);
    });

    test('it should correctly handle return of rejected promise in .catch', (done) => {
        new PromiseImplementation((resolve, reject) => {
            setTimeout(() => {
                reject('Whoops');
            }, 100);
        })
            .catch((error) => {
                expect(error).toBe('Whoops');

                return new PromiseImplementation((resolve, reject) => {
                    setTimeout(() => {
                        reject('another error');
                    }, 100);
                });
            })
            .catch((err) => {
                expect(err).toBe('another error');
                done();
            });

        expect.assertions(2);
    });

    test('it should correctly handle return of resolved promise in .finally', (done) => {
        new PromiseImplementation((resolve, reject) => {
            setTimeout(() => {
                resolve(1);
            }, 100);
        })
            .finally(() => {
                return new PromiseImplementation((resolve, reject) => {
                    setTimeout(() => {
                        resolve(2);
                    }, 100);
                });
            })
            .then((result) => {
                expect(result).toBe(1);
                done();
            });

        expect.assertions(1);
    });

    test('it should correctly handle return of rejected promise in .finally', (done) => {
        new PromiseImplementation((resolve, reject) => {
            setTimeout(() => {
                resolve(1);
            }, 100);
        })
            .finally(() => {
                return new PromiseImplementation((resolve, reject) => {
                    setTimeout(() => {
                        reject('error from finally');
                    }, 100);
                });
            })
            .then((result) => {
                // wouldn't invoke
                expect(result).toBe('blablabla');
                return result * 2;
            })
            .catch((err) => {
                expect(err).toBe('error from finally');
                done();
            });

        expect.assertions(1);
    });

    test('it should call .then after .finally without args and affection on next .then', (done) => {
        new PromiseImplementation((resolve, reject) => {
            setTimeout(() => {
                resolve(1);
            }, 100);
        })
            .then((result) => {
                return result * 2;
            })
            .finally((result) => {
                expect(result).toBeUndefined();
                return 4;
            })
            .then((result) => {
                expect(result).toBe(2);
                done();
            });

        expect.assertions(2);
    });

    test('it should call .finally after exception and jump to closest .catch (1)', (done) => {
        new PromiseImplementation((resolve, reject) => {
            setTimeout(() => {
                resolve(1);
            }, 100);
        })
            .then((result) => {
                throw new Error('Whoops');
            })
            .finally((result) => {
                expect(result).toBeUndefined();
                return 4;
            })
            .catch((err) => {
                expect(err.message).toBe('Whoops');
                done();
            });

        expect.assertions(2);
    });

    test('it should call .finally after exception and jump to closest .catch (2)', (done) => {
        new PromiseImplementation((resolve, reject) => {
            setTimeout(() => {
                resolve(1);
            }, 100);
        })
            .then((result) => {
                throw new Error('Whoops');
            })
            .finally((result) => {
                expect(result).toBeUndefined();
                return 4;
            })
            .then((result) => {
                expect(result).toBe('blablabla');
                return 4;
            })
            .catch((err) => {
                expect(err.message).toBe('Whoops');
                done();
            });

        expect.assertions(2);
    });

    test('it should call .finally after .catch', (done) => {
        new PromiseImplementation((resolve, reject) => {
            setTimeout(() => {
                resolve(1);
            }, 100);
        })
            .then((result) => {
                throw new Error('Whoops');
            })
            .catch((err) => {
                expect(err.message).toBe('Whoops');
                return 'hadnled';
            })
            .finally((result) => {
                expect(result).toBeUndefined();
                done();
            });

        expect.assertions(2);
    });

    test('it should call .catch after exception in .finally', (done) => {
        new PromiseImplementation((resolve, reject) => {
            setTimeout(() => {
                resolve(1);
            }, 100);
        })
            .finally((result) => {
                expect(result).toBeUndefined();
                throw new Error('Whoops!');
            })
            .then((res) => {
                // wouldn't invoke
                expect(res).toBe('blablabla');
                return 4;
            })
            .catch((err) => {
                expect(err.message).toBe('Whoops!');
                done();
            });

        expect.assertions(2);
    });
});

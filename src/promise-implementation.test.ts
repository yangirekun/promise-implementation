import { PromiseImplementation } from '.';

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

describe('Promise implementation, sync', () => {
    test('it should have the correct state after resolve', (done) => {
        const promise = new PromiseImplementation((resolve, reject) => {
            resolve('result');
        });

        setTimeout(() => {
            expect(promise['state']).toBe('fulfilled');
            expect(promise['result']).toBe('result');

            done();
        }, 0);
    });

    test('it should have the correct state after reject', (done) => {
        const promise = new PromiseImplementation((resolve, reject) => {
            reject('error');
        });

        setTimeout(() => {
            expect(promise['state']).toBe('rejected');
            expect(promise['result']).toBe('error');

            done();
        }, 0);
    });

    test('it should call resolve | reject only once', (done) => {
        const promise1 = new PromiseImplementation((resolve, reject) => {
            resolve('result');
            resolve('another result');
        });

        setTimeout(() => {
            expect(promise1['state']).toBe('fulfilled');
            expect(promise1['result']).toBe('result');

            done();
        }, 0);

        const promise2 = new PromiseImplementation((resolve, reject) => {
            reject('error');
            reject('another error');
        });

        setTimeout(() => {
            expect(promise2['state']).toBe('rejected');
            expect(promise2['result']).toBe('error');

            done();
        }, 0);

        const promise3 = new PromiseImplementation((resolve, reject) => {
            resolve('result');
            reject('error');
        });

        setTimeout(() => {
            expect(promise3['state']).toBe('fulfilled');
            expect(promise3['result']).toBe('result');

            done();
        }, 0);

        const promise4 = new PromiseImplementation((resolve, reject) => {
            reject('error');
            resolve('another error');
        });

        setTimeout(() => {
            expect(promise4['state']).toBe('rejected');
            expect(promise4['result']).toBe('error');

            done();
        }, 0);
    });
});

describe('Promise implementation, sync chaining', () => {
    test('it should call .then and pass result to it after resolve', (done) => {
        new PromiseImplementation((resolve, reject) => {
            resolve('result');
        }).then((result) => {
            expect(result).toBe('result');
            done();
        });
    });

    test('it should pass results through the chain', (done) => {
        new PromiseImplementation((resolve, reject) => {
            resolve(1);
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
    });

    test('it should ignore "empty" .then in chain', (done) => {
        new PromiseImplementation((resolve, reject) => {
            resolve('result');
        })
            .then()
            .then((result) => {
                expect(result).toBe('result');
                done();
            });
    });

    test('it should correctly handle return of resolved promise in the arbitary .then', (done) => {
        new PromiseImplementation((resolve, reject) => {
            resolve(1);
        })
            .then((result) => {
                return new PromiseImplementation((resolve) => {
                    resolve(result * 2);
                });
            })
            .then((result) => {
                expect(result).toBe(2);
                done();
            });
    });

    test('it should correctly handle return of rejected promise in the arbitary .then', (done) => {
        new PromiseImplementation((resolve, reject) => {
            resolve(1);
        })
            .then((result) => {
                return new PromiseImplementation((resolve, reject) => {
                    reject('error');
                });
            })
            .then((result) => {
                // wouldn't invoke
                return result * 2;
            })
            .catch((error) => {
                expect(error).toBe('error');
                done();
            });
    });

    test('it should call .catch and pass error to it after reject', (done) => {
        new PromiseImplementation((resolve, reject) => {
            reject('error');
        }).catch((err) => {
            expect(err).toBe('error');
            done();
        });
    });

    test('it should call .catch at the end of the chain and "ignore" .then handlers', (done) => {
        new PromiseImplementation((resolve, reject) => {
            reject('error');
        })
            .then((result) => {
                // wouldn't invoke
                return 'result';
            })
            .then((result) => {
                // wouldn't invoke
                return result;
            })
            .catch((err) => {
                expect(err).toBe('error');
                done();
            });
    });

    test('it should call .catch, when error is occured in arbitary .then', (done) => {
        new PromiseImplementation((resolve, reject) => {
            resolve(1);
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
    });

    test('it should call .catch after rethrow', (done) => {
        new PromiseImplementation((resolve, reject) => {
            reject('error');
        })
            .then((result) => {
                // wouldn't invoke
                return 'result';
            })
            .then((result) => {
                // wouldn't invoke
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
    });

    test('it should call .then after error handling', (done) => {
        new PromiseImplementation((resolve, reject) => {
            reject('error');
        })
            .then((result) => {
                // wouldn't invoke
                return 'result';
            })
            .then((result) => {
                // wouldn't invoke
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
    });

    test('it should correctly handle return of resolved promise in .catch', (done) => {
        new PromiseImplementation((resolve, reject) => {
            reject('Whoops');
        })
            .catch((error) => {
                expect(error).toBe('Whoops');

                return new PromiseImplementation((resolve, reject) => {
                    resolve(1);
                });
            })
            .then((result) => {
                expect(result).toBe(1);
                done();
            });
    });

    test('it should correctly handle return of rejected promise in .catch', (done) => {
        new PromiseImplementation((resolve, reject) => {
            reject('Whoops');
        })
            .catch((error) => {
                expect(error).toBe('Whoops');

                return new PromiseImplementation((resolve, reject) => {
                    reject('another error');
                });
            })
            .catch((err) => {
                expect(err).toBe('another error');
                done();
            });
    });

    test('it should call .then after .finally without args and affection on next .then', (done) => {
        new PromiseImplementation((resolve, reject) => {
            resolve(1);
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
    });

    test('it should call .finally after exception and jump to closest .catch (1)', (done) => {
        new PromiseImplementation((resolve, reject) => {
            resolve(1);
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
    });

    test('it should call .finally after exception and jump to closest .catch (2)', (done) => {
        new PromiseImplementation((resolve, reject) => {
            resolve(1);
        })
            .then((result) => {
                throw new Error('Whoops');
            })
            .finally((result) => {
                expect(result).toBeUndefined();
                return 4;
            })
            .then((result) => {
                return 4;
            })
            .catch((err) => {
                expect(err.message).toBe('Whoops');
                done();
            });
    });

    test('it should call .finally after .catch', (done) => {
        new PromiseImplementation((resolve, reject) => {
            resolve(1);
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
    });
});

describe('Promise implementation, async', () => {
    test('it should have the correct state after resolve', (done) => {
        const promise = new PromiseImplementation((resolve, reject) => {
            setTimeout(() => resolve('result'), 1000);
        });

        setTimeout(() => {
            expect(promise['state']).toBe('fulfilled');
            expect(promise['result']).toBe('result');

            done();
        }, 1010);
    });

    test('it should have the correct state after reject', (done) => {
        const promise = new PromiseImplementation((resolve, reject) => {
            setTimeout(() => reject('error'), 1000);
        });

        setTimeout(() => {
            expect(promise['state']).toBe('rejected');
            expect(promise['result']).toBe('error');

            done();
        }, 1010);
    });

    test('it should call resolve | reject only once', (done) => {
        const promise1 = new PromiseImplementation((resolve, reject) => {
            setTimeout(() => {
                resolve('result');
                resolve('another result');
            }, 1000);
        });

        setTimeout(() => {
            expect(promise1['state']).toBe('fulfilled');
            expect(promise1['result']).toBe('result');

            done();
        }, 1010);

        const promise2 = new PromiseImplementation((resolve, reject) => {
            setTimeout(() => {
                reject('error');
                reject('another error');
            }, 1000);
        });

        setTimeout(() => {
            expect(promise2['state']).toBe('rejected');
            expect(promise2['result']).toBe('error');

            done();
        }, 1010);

        const promise3 = new PromiseImplementation((resolve, reject) => {
            setTimeout(() => {
                resolve('result');
                reject('error');
            }, 1000);
        });

        setTimeout(() => {
            expect(promise3['state']).toBe('fulfilled');
            expect(promise3['result']).toBe('result');

            done();
        }, 1010);

        const promise4 = new PromiseImplementation((resolve, reject) => {
            setTimeout(() => {
                reject('error');
                resolve('another error');
            }, 1000);
        });

        setTimeout(() => {
            expect(promise4['state']).toBe('rejected');
            expect(promise4['result']).toBe('error');

            done();
        }, 1010);
    });
});

describe('Promise implementation, async chaining', () => {
    test('it should call .then and pass result to it after resolve', (done) => {
        new PromiseImplementation((resolve, reject) => {
            setTimeout(() => {
                resolve('result');
            }, 1000);
        }).then((result) => {
            expect(result).toBe('result');
            done();
        });
    });

    test('it should pass results through the chain', (done) => {
        new PromiseImplementation((resolve, reject) => {
            setTimeout(() => {
                resolve(1);
            }, 1000);
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
    });

    test('it should pass results through the chain of promises', (done) => {
        new PromiseImplementation((resolve, reject) => {
            setTimeout(() => {
                resolve(1);
            }, 1000);
        })
            .then((result) => {
                expect(result).toBe(1);
                return new PromiseImplementation((resolve) => {
                    setTimeout(() => resolve(result * 2), 1000);
                });
            })
            .then((result) => {
                expect(result).toBe(2);
                return new PromiseImplementation((resolve) => {
                    setTimeout(() => resolve(result * 2), 1000);
                });
            })
            .then((result) => {
                expect(result).toBe(4);
                return new PromiseImplementation((resolve) => {
                    resolve(result * 2);
                });
            })
            .then((result) => {
                expect(result).toBe(8);
                done();
            });
    });

    test('it should ignore "empty" .then in chain', (done) => {
        new PromiseImplementation((resolve, reject) => {
            setTimeout(() => {
                resolve('result');
            }, 1000);
        })
            .then()
            .then((result) => {
                expect(result).toBe('result');
                done();
            });
    });

    test('it should correctly handle return of resolved promise in the arbitary .then', (done) => {
        new PromiseImplementation((resolve, reject) => {
            setTimeout(() => {
                resolve(1);
            }, 1000);
        })
            .then((result) => {
                return new PromiseImplementation((resolve) => {
                    setTimeout(() => {
                        resolve(result * 2);
                    }, 1000);
                });
            })
            .then((result) => {
                expect(result).toBe(2);
                done();
            });
    });

    test('it should correctly handle return of rejected promise in the arbitary .then', (done) => {
        new PromiseImplementation((resolve, reject) => {
            setTimeout(() => {
                resolve(1);
            }, 1000);
        })
            .then((result) => {
                return new PromiseImplementation((resolve, reject) => {
                    setTimeout(() => {
                        reject('error');
                    }, 1000);
                });
            })
            .then((result) => {
                // wouldn't invoke
                return result * 2;
            })
            .catch((error) => {
                expect(error).toBe('error');
                done();
            });
    });

    test('it should call .catch and pass error to it after reject', (done) => {
        new PromiseImplementation((resolve, reject) => {
            setTimeout(() => {
                reject('error');
            }, 1000);
        }).catch((err) => {
            expect(err).toBe('error');
            done();
        });
    });

    test('it should call .catch at the end of the chain and "ignore" .then handlers', (done) => {
        new PromiseImplementation((resolve, reject) => {
            setTimeout(() => {
                reject('error');
            }, 1000);
        })
            .then((result) => {
                // wouldn't invoke
                return 'result';
            })
            .then((result) => {
                // wouldn't invoke
                return result;
            })
            .catch((err) => {
                expect(err).toBe('error');
                done();
            });
    });

    test('it should call .catch, when error is occured in arbitary .then', (done) => {
        new PromiseImplementation((resolve, reject) => {
            setTimeout(() => {
                resolve(1);
            }, 1000);
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
    });

    test('it should call .catch after rethrow', (done) => {
        new PromiseImplementation((resolve, reject) => {
            setTimeout(() => {
                reject('error');
            }, 1000);
        })
            .then((result) => {
                // wouldn't invoke
                return 'result';
            })
            .then((result) => {
                // wouldn't invoke
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
    });

    test('it should call .then after error handling', (done) => {
        new PromiseImplementation((resolve, reject) => {
            setTimeout(() => {
                reject('error');
            }, 1000);
        })
            .then((result) => {
                // wouldn't invoke
                return 'result';
            })
            .then((result) => {
                // wouldn't invoke
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
    });

    test('it should correctly handle return of resolved promise in .catch', (done) => {
        new PromiseImplementation((resolve, reject) => {
            setTimeout(() => {
                reject('Whoops');
            }, 1000);
        })
            .catch((error) => {
                expect(error).toBe('Whoops');

                return new PromiseImplementation((resolve, reject) => {
                    setTimeout(() => {
                        resolve(1);
                    }, 1000);
                });
            })
            .then((result) => {
                expect(result).toBe(1);
                done();
            });
    });

    test('it should correctly handle return of rejected promise in .catch', (done) => {
        new PromiseImplementation((resolve, reject) => {
            setTimeout(() => {
                reject('Whoops');
            }, 1000);
        })
            .catch((error) => {
                expect(error).toBe('Whoops');

                return new PromiseImplementation((resolve, reject) => {
                    setTimeout(() => {
                        reject('another error');
                    }, 1000);
                });
            })
            .catch((err) => {
                expect(err).toBe('another error');
                done();
            });
    });

    test('it should call .then after .finally without args and affection on next .then', (done) => {
        new PromiseImplementation((resolve, reject) => {
            setTimeout(() => {
                resolve(1);
            }, 1000);
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
    });

    test('it should call .finally after exception and jump to closest .catch (1)', (done) => {
        new PromiseImplementation((resolve, reject) => {
            setTimeout(() => {
                resolve(1);
            }, 1000);
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
    });

    test('it should call .finally after exception and jump to closest .catch (2)', (done) => {
        new PromiseImplementation((resolve, reject) => {
            setTimeout(() => {
                resolve(1);
            }, 1000);
        })
            .then((result) => {
                throw new Error('Whoops');
            })
            .finally((result) => {
                expect(result).toBeUndefined();
                return 4;
            })
            .then((result) => {
                return 4;
            })
            .catch((err) => {
                expect(err.message).toBe('Whoops');
                done();
            });
    });

    test('it should call .finally after .catch', (done) => {
        new PromiseImplementation((resolve, reject) => {
            setTimeout(() => {
                resolve(1);
            }, 1000);
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
    });
});

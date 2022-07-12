import { PromiseState, PromiseResult, ExecutorCallback, PromiseExecutor, ConsumerCallback } from './types';

export default class PromiseImplementation {
    private state: PromiseState = 'pending';
    private result: PromiseResult;

    constructor(executor?: PromiseExecutor) {
        try {
            if (executor) {
                executor(this.resolve.bind(this), this.reject.bind(this));
            } else {
                throw new Error('No executor provided.');
            }
        } catch (err) {
            if (err.message === 'No executor provided.') {
                throw err;
            }

            this.reject(err);
        }
    }

    private currentConsumerIndex = 0;
    private consumersArgs: ConsumerCallback[][] = [];
    private consumersInstanceSettlers: {
        resolvers: ExecutorCallback[];
        rejecters: ExecutorCallback[];
    } = {
        resolvers: [],
        rejecters: [],
    };

    private resolve(value?: any) {
        if (this.state === 'pending') {
            this.state = 'fulfilled';
            this.result = value;

            if (this.consumersArgs.length) {
                for (let i = 0; i < this.consumersArgs.length; i++) {
                    const handleSuccess = this.consumersArgs[i][0];
                    const handleError = this.consumersArgs[i][1];

                    this.then(handleSuccess, handleError, false);
                }
            }
        }
    }

    static resolve(value?: any) {
        return new PromiseImplementation((resolve, reject) => resolve(value));
    }

    private reject(error?: any) {
        if (this.state === 'pending') {
            this.state = 'rejected';
            this.result = error;

            if (this.consumersArgs.length) {
                for (let i = 0; i < this.consumersArgs.length; i++) {
                    const handleSuccess = this.consumersArgs[i][0];
                    const handleError = this.consumersArgs[i][1];

                    this.then(handleSuccess, handleError, false);
                }
            }
        }
    }

    static reject(error?: any) {
        return new PromiseImplementation((resolve, reject) => reject(error));
    }

    private handleResult(result: any, handler?: ConsumerCallback, state?: PromiseState) {
        const index = this.currentConsumerIndex++;

        const resolveNext = this.consumersInstanceSettlers.resolvers[index];
        const rejectNext = this.consumersInstanceSettlers.rejecters[index];

        try {
            const handlerResult = handler ? handler(result) : result;

            if (handlerResult instanceof PromiseImplementation) {
                handlerResult.then(
                    (result) => resolveNext(result),
                    (error) => rejectNext(error)
                );

                return;
            }

            if (!handler && state === 'rejected') {
                rejectNext(handlerResult);

                return;
            }

            resolveNext(handlerResult);
        } catch (err) {
            this.consumersInstanceSettlers.rejecters[index](err);
        }
    }

    private handleFinally(result: any, handler: ConsumerCallback, state: PromiseState) {
        try {
            handler();
        } catch (err) {
            this.handleResult(err, undefined, 'rejected');

            return;
        }

        this.handleResult(result, undefined, state);
    }

    then = (handleSuccess?: ConsumerCallback, handleError?: ConsumerCallback, shouldReturnInstance = true) => {
        if (!handleSuccess && !handleError) {
            return this;
        }

        const { state, result } = this;

        if (state !== 'pending' && 'result' in this) {
            setTimeout(() => {
                if (handleSuccess === handleError) {
                    this.handleFinally(result, handleSuccess || handleError, state);

                    return;
                }

                if (state === 'fulfilled') {
                    this.handleResult(result, handleSuccess, state);
                }

                if (state === 'rejected') {
                    this.handleResult(result, handleError, state);
                }
            }, 0);
        }

        if (shouldReturnInstance) {
            this.consumersArgs.push([handleSuccess, handleError]);

            return new PromiseImplementation((resolve, reject) => {
                this.consumersInstanceSettlers.resolvers.push(resolve);
                this.consumersInstanceSettlers.rejecters.push(reject);
            });
        }
    };

    catch = (handleError?: ConsumerCallback) => {
        return this.then(undefined, handleError);
    };

    finally = (callback?: ConsumerCallback) => {
        return this.then(callback, callback);
    };
}

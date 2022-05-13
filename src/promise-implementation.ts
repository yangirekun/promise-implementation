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

    private resolveNext?: ExecutorCallback;
    private resolve(value?: any) {
        setTimeout(() => {
            if (this.state === 'pending') {
                this.state = 'fulfilled';
                this.result = value;

                if (this.consumerArgs.length) {
                    this.then(...this.consumerArgs);
                }
            }
        }, 0);
    }

    static resolve(value?: any) {
        return new PromiseImplementation((resolve, reject) => resolve(value));
    }

    private rejectNext?: ExecutorCallback;
    private reject(error?: any) {
        setTimeout(() => {
            if (this.state === 'pending') {
                this.state = 'rejected';
                this.result = error;

                if (this.consumerArgs.length) {
                    this.then(...this.consumerArgs);
                }
            }
        }, 0);
    }

    static reject(error?: any) {
        return new PromiseImplementation((resolve, reject) => reject(error));
    }

    private consumerArgs: ConsumerCallback[] = [];
    private saveConsumerArgs(...args: ConsumerCallback[]) {
        this.consumerArgs = args;
    }

    private handleResult(result: any, handler?: ConsumerCallback, state?: PromiseState) {
        try {
            const handlerResult = handler ? handler(result) : result;

            if (handlerResult instanceof PromiseImplementation) {
                handlerResult.then(
                    (result) => this.resolveNext(result),
                    (err) => this.rejectNext(err)
                );

                return;
            }

            if (!handler && state === 'rejected') {
                this.rejectNext(handlerResult);

                return;
            }

            this.resolveNext(handlerResult);
        } catch (err) {
            this.rejectNext(err);
        }
    }

    private handleFinally(result: any, handler: ConsumerCallback, state: PromiseState) {
        handler();
        this.handleResult(result, undefined, state);
    }

    then = (handleSuccess?: ConsumerCallback, handleError?: ConsumerCallback) => {
        if (!handleSuccess && !handleError) {
            return this;
        }

        const { state, result } = this;

        if (state === 'pending') {
            this.saveConsumerArgs(handleSuccess, handleError);

            return new PromiseImplementation((resolve, reject) => {
                this.resolveNext = resolve;
                this.rejectNext = reject;
            });
        }

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
    };

    catch = (handleError?: ConsumerCallback) => {
        return this.then(undefined, handleError);
    };

    finally = (callback?: ConsumerCallback) => {
        return this.then(callback, callback);
    };
}

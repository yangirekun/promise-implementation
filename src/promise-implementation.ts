import { PromiseState, PromiseResult, ExecutorCallback, PromiseExecutor, ConsumerCallback } from './types';

export default class PromiseImplementation {
    private state: PromiseState = 'pending';
    private result: PromiseResult;

    constructor(executor?: PromiseExecutor) {
        if (typeof executor !== 'function') {
            throw new Error('Invalid executor is provided.');
        }

        try {
            executor(this.resolve.bind(this), this.reject.bind(this));
        } catch (err) {
            this.reject(err);
        }
    }

    private currentConsumerIndex = 0;
    private consumersArgs: ConsumerCallback[][] = [];
    private consumerShouldReturnInstance = true;
    private consumersInstanceSettlers: {
        resolvers: ExecutorCallback[];
        rejecters: ExecutorCallback[];
    } = {
        resolvers: [],
        rejecters: [],
    };

    private getConsumerInstanceSettlers() {
        const index = this.currentConsumerIndex++;

        const resolveNext = this.consumersInstanceSettlers.resolvers[index];
        const rejectNext = this.consumersInstanceSettlers.rejecters[index];

        return {
            resolveNext,
            rejectNext,
        };
    }

    private applyResolveMainLogic(value?: any) {
        if (this.state === 'pending') {
            this.state = 'fulfilled';
            this.result = value;

            if (this.consumersArgs.length) {
                this.consumerShouldReturnInstance = false;

                for (let consumerArgs of this.consumersArgs) {
                    this.then(...consumerArgs);
                }
            }
        }
    }

    private resolveCallsCount = 0;
    private resolve(value?: any) {
        if (this.resolveCallsCount > 0 || this.rejectCallsCount > 0) {
            this.resolveCallsCount += 1;
            return;
        }

        this.resolveCallsCount += 1;

        if (value instanceof PromiseImplementation) {
            value.then(
                (result) => this.applyResolveMainLogic(result),
                (err) => this.applyRejectMainLogic(err)
            );

            return;
        }

        this.applyResolveMainLogic(value);
    }

    static resolve(value?: any) {
        return new PromiseImplementation((resolve, reject) => resolve(value));
    }

    private applyRejectMainLogic(error?: any) {
        if (this.state === 'pending') {
            this.state = 'rejected';
            this.result = error;

            if (this.consumersArgs.length) {
                this.consumerShouldReturnInstance = false;

                for (let consumerArgs of this.consumersArgs) {
                    this.then(...consumerArgs);
                }
            }
        }
    }

    private rejectCallsCount = 0;
    private reject(error?: any) {
        if (this.rejectCallsCount > 0 || this.resolveCallsCount > 0) {
            this.rejectCallsCount += 1;
            return;
        }

        this.rejectCallsCount += 1;

        this.applyRejectMainLogic(error);
    }

    static reject(error?: any) {
        return new PromiseImplementation((resolve, reject) => reject(error));
    }

    private handleResult(result: any, handler?: ConsumerCallback, state?: PromiseState) {
        const { resolveNext, rejectNext } = this.getConsumerInstanceSettlers();

        try {
            const handlerResult = handler && handler(result);

            if (handlerResult instanceof PromiseImplementation) {
                const resolve = (result) => resolveNext(result);
                const reject = (err) => rejectNext(err);

                handlerResult.then(resolve, reject);

                return;
            }

            if (state === 'rejected' && !handler) {
                rejectNext(result);

                return;
            }

            resolveNext(handlerResult);
        } catch (err) {
            rejectNext(err);
        }
    }

    private handleFinally(result: any, handler?: ConsumerCallback, state?: PromiseState) {
        const { resolveNext, rejectNext } = this.getConsumerInstanceSettlers();

        try {
            const handlerResult = handler && handler();

            if (handlerResult instanceof PromiseImplementation) {
                const resolve = () => resolveNext(result);
                const reject = (err) => rejectNext(err);

                handlerResult.then(resolve, reject);

                return;
            }

            if (state === 'rejected') {
                rejectNext(result);

                return;
            }

            resolveNext(result);
        } catch (err) {
            rejectNext(err);
        }
    }

    then = (handleSuccess?: ConsumerCallback, handleError?: ConsumerCallback) => {
        if (!handleSuccess && !handleError) {
            return this;
        }

        const { state, result } = this;
        const isSettled = state !== 'pending' && 'result' in this;

        if (isSettled) {
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

        if (this.consumerShouldReturnInstance) {
            if (!isSettled) {
                this.consumersArgs.push([handleSuccess, handleError]);
            }

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

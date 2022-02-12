export type PromiseState = 'pending' | 'fulfilled' | 'rejected';
export type PromiseResult = any;

export type ExecutorCallback = (argument?: any) => void;
export type PromiseExecutor = (resolve: ExecutorCallback, reject: ExecutorCallback) => any;

export type ConsumerCallback = (argument?: any) => any;
export type FinallyCallback = () => void;

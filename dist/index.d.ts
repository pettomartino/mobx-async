import { IComputedValue, IObservable, IObservableArray, IObservableValue, ObservableMap, ObservableSet } from 'mobx';
declare type IFunction = (...args: any[]) => void;
interface TrackedAction extends IFunction {
    trackedAction: boolean;
    pending: boolean;
    error?: Error;
    response?: any;
    success: boolean;
    reset: () => void;
}
declare type AsyncItem<T = any> = Promise<T> | TrackedAction | IGettable<T> | IFunction;
declare type IGettable<T = any> = IObservable | IComputedValue<T> | IObservableValue<T> | IObservableArray | ObservableMap | ObservableSet;
export declare function isPending(v: AsyncItem): boolean;
export declare const getError: (v: AsyncItem) => Error | undefined;
export declare const succeeded: (action: TrackedAction | IFunction) => boolean;
declare function getValue<T>(v: IGettable<Promise<T>> | Promise<T>): T | undefined;
export { getValue };
export declare const resetter: (action: TrackedAction | IFunction) => (() => void);
export declare function dependsOn(...dependencies: AsyncItem[]): void;
declare function trackedAction<T extends TrackedAction>(actionBody: T): T;
declare function trackedAction(target: Object, key?: string | symbol, baseDescriptor?: PropertyDescriptor): void;
export { trackedAction };

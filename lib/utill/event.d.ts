declare type EventFunc<T> = (data: T) => void;
export default class Event<T> {
    private event;
    constructor();
    excute(data?: T): void;
    subscribe(func: EventFunc<T>): {
        unSubscribe: () => void;
    };
    allUnsubscribe(): void;
    once(func: EventFunc<T>): void;
    asPromise: (timelimit?: number | undefined) => Promise<T | undefined>;
}
export {};

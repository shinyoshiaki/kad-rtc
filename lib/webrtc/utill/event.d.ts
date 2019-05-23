declare type EventFunc<T> = (data: T) => void;
export default class Event<T> {
    private event;
    constructor();
    execute(data?: T): void;
    subscribe(func: EventFunc<T>): {
        unSubscribe: () => void;
    };
    once(func: EventFunc<T>): void;
    asPromise: (timelimit?: number | undefined) => Promise<T>;
}
export {};

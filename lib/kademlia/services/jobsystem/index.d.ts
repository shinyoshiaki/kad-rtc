import Event from "rx.mini";
declare type Option = {
    a: number;
};
declare type AA<T> = T extends (...arg: infer I) => any ? I : never;
declare type ThenArg<T> = T extends Promise<infer U> ? U : T;
declare type Job = {
    func: any;
    args: any[];
    event: Event<any>;
};
declare class Worker {
    private jobs;
    running: boolean;
    constructor(jobs: Job[]);
    private execute;
    wakeup(): void;
}
export default class JobSystem {
    private opt;
    jobs: Job[];
    workers: Worker[];
    constructor(opt?: Option);
    add<T extends (...args: any[]) => Promise<any>>(func: T, args: AA<typeof func>): Promise<ThenArg<ReturnType<T>>>;
}
export {};

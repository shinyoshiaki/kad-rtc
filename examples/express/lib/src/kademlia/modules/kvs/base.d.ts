import Event from "rx.mini";
export default class KevValueStore {
    db: {
        [key: string]: string;
    };
    onSet: Event<{
        key: string;
        value: string;
    }>;
    set(key: string, value: string): void;
    get: (key: string) => string | undefined;
}
export declare const KvsModule: KevValueStore;

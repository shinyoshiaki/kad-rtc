import Event from "rx.mini";
export default class KevValueStore {
    db: {
        [key: string]: string | ArrayBuffer;
    };
    onSet: Event<{
        key: string;
        value: string | ArrayBuffer;
    }>;
    set(key: string, value: string | ArrayBuffer): void;
    get: (key: string) => string | ArrayBuffer | undefined;
}
export declare const KvsModule: KevValueStore;

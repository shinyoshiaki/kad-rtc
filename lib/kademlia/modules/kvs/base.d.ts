import Event from "../../../utill/event";
export declare const KvsModule: () => KevValueStore;
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

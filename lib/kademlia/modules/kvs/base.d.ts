import Event from "rx.mini";
export declare type Item = {
    value: string | ArrayBuffer;
    msg?: string;
};
export default class KeyValueStore {
    db: {
        [key: string]: Item;
    };
    onSet: Event<{
        key: string;
        value: string | ArrayBuffer;
    }>;
    set(key: string, value: string | ArrayBuffer, msg: string): void;
    get: (key: string) => Item | undefined;
    delete: (key: string) => void;
}

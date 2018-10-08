export default class KStorage {
    kvs: {
        [key: string]: any;
    };
    set(key: string, value: any): void;
    get(key: string): any;
}

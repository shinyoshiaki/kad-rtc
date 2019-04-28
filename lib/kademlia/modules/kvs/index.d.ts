export default class KevValueStore {
    db: {
        [key: string]: string;
    };
    set(key: string, value: string): void;
    get: (key: string) => string | undefined;
}

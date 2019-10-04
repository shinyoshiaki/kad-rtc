export default class Uuid {
    private prefix;
    private i;
    constructor(prefix?: string);
    setPrefix(s: string): void;
    get(): string;
}

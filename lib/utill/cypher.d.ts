export default class Cypher {
    secKey: string;
    pubKey: string;
    constructor(secKey?: string, pubKey?: string);
    encrypt(raw: string): string;
    decrypt(encrypted: string, publicKey: string): string;
}

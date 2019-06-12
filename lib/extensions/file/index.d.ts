import { Kademlia } from "../..";
export declare function storeFile(file: ArrayBuffer[], kad: Kademlia): Promise<string | undefined>;
export declare function findFile(headerKey: string, kad: Kademlia): Promise<(ArrayBuffer | SharedArrayBuffer)[] | undefined>;

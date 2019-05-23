import { Kademlia } from "../..";
export declare function storeFile(blob: Blob, kad: Kademlia): Promise<string>;
export declare function findFile(headerKey: string, kad: Kademlia): Promise<Blob | undefined>;

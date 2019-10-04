import { DependencyInjection } from "../../di";
import { Peer } from "../../modules/peer/base";
export default function store(di: DependencyInjection, key: string, value: string | ArrayBuffer, msg?: string): Promise<{
    item: {
        type: "Store";
        key: string;
        value: string | ArrayBuffer;
        msg: string | undefined;
    };
    peers: Peer[];
}>;
declare const Store: (key: string, value: string | ArrayBuffer, msg?: string | undefined) => {
    type: "Store";
    key: string;
    value: string | ArrayBuffer;
    msg: string | undefined;
};
export declare type Store = ReturnType<typeof Store>;
export {};

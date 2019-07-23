import { DependencyInjection } from "../../di";
export default function store(di: DependencyInjection, key: string, value: string | ArrayBuffer, msg?: string): Promise<{
    rpc: "Store";
    key: string;
    value: string | ArrayBuffer;
    msg: string | undefined;
}>;
declare const Store: (key: string, value: string | ArrayBuffer, msg?: string | undefined) => {
    rpc: "Store";
    key: string;
    value: string | ArrayBuffer;
    msg: string | undefined;
};
export declare type Store = ReturnType<typeof Store>;
export {};

import { DependencyInjection } from "../../di";
declare const Store: (key: string, value: string | ArrayBuffer, msg?: string | undefined) => {
    rpc: "store";
    key: string;
    value: string | ArrayBuffer;
    msg: string | undefined;
};
export declare type Store = ReturnType<typeof Store>;
export default function store(di: DependencyInjection, key: string, value: string | ArrayBuffer, msg?: string): Promise<{
    rpc: "store";
    key: string;
    value: string | ArrayBuffer;
    msg: string | undefined;
}>;
export {};

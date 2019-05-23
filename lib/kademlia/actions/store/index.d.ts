import { DependencyInjection } from "../../di";
declare const Store: (key: string, value: string | ArrayBuffer) => {
    rpc: "store";
    key: string;
    value: string | ArrayBuffer;
};
export declare type Store = ReturnType<typeof Store>;
export default function store(key: string, value: string | ArrayBuffer, di: DependencyInjection): Promise<string>;
export {};

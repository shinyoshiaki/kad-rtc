import { DependencyInjection } from "../../di";
export default function store(di: DependencyInjection, key: string, value: string | ArrayBuffer, msg?: string): Promise<{
    type: "Store";
    key: string;
    value: string | ArrayBuffer;
    msg: string | undefined;
}>;
declare const Store: (key: string, value: string | ArrayBuffer, msg?: string | undefined) => {
    type: "Store";
    key: string;
    value: string | ArrayBuffer;
    msg: string | undefined;
};
export declare type Store = ReturnType<typeof Store>;
export {};

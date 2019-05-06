import { DependencyInjection } from "../../di";
declare const Store: (key: string, value: string) => {
    rpc: "store";
    key: string;
    value: string;
};
export declare type Store = ReturnType<typeof Store>;
export default function store(value: string, di: DependencyInjection): Promise<string>;
export {};

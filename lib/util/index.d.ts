export interface IEvents {
    [key: string]: (v?: any) => void;
}
export declare function excuteEvent(ev: IEvents, v?: any): void;

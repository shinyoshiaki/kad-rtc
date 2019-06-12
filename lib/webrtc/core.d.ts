/// <reference types="node" />
export interface message {
    label: string | "datachannel";
    data: any;
    nodeId: string;
}
interface option {
    disable_stun: boolean;
    stream: MediaStream;
    track: MediaStreamTrack;
    nodeId: string;
    trickle: boolean;
}
export default class WebRTC {
    opt: Partial<option>;
    rtc: RTCPeerConnection;
    private pack;
    private event;
    onSignal: import("rx.mini").default<any>;
    onConnect: import("rx.mini").default<{}>;
    onDisconnect: import("rx.mini").default<{}>;
    onData: import("rx.mini").default<message>;
    onAddTrack: import("rx.mini").default<MediaStream>;
    private dataChannels;
    nodeId: string;
    isConnected: boolean;
    isDisconnected: boolean;
    isOffer: boolean;
    remoteStream: MediaStream | undefined;
    timeoutPing: any | undefined;
    services: import("./services").Services;
    constructor(opt?: Partial<option>);
    private prepareNewConnection;
    hangUp(): void;
    makeOffer(): void;
    negotiating: boolean;
    private negotiationSetting;
    private setAnswer;
    private makeAnswer;
    setSdp(sdp: any): Promise<void>;
    private createDatachannel;
    private dataChannelEvents;
    send(data: string | ArrayBuffer | Buffer, label?: string): Promise<void>;
    addTrack(track: MediaStreamTrack, stream: MediaStream): void;
    private disconnect;
}
export {};

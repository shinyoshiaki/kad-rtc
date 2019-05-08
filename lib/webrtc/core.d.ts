/// <reference types="node" />
import Event from "rx.mini";
export interface message {
    label: string;
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
    onSignal: Event<any>;
    onConnect: Event<{}>;
    onDisconnect: Event<{}>;
    onData: Event<message>;
    onAddTrack: Event<MediaStream>;
    private dataChannels;
    nodeId: string;
    isConnected: boolean;
    isDisconnected: boolean;
    isOffer: boolean;
    remoteStream: MediaStream | undefined;
    timeoutPing: NodeJS.Timeout | undefined;
    constructor(opt?: Partial<option>);
    private prepareNewConnection;
    hangUp(): void;
    makeOffer(): void;
    negotiating: boolean;
    private negotiation;
    private setAnswer;
    private makeAnswer;
    setSdp(sdp: any): Promise<void>;
    private createDatachannel;
    private dataChannelEvents;
    send(data: any, label?: string): Promise<void>;
    addTrack(track: MediaStreamTrack, stream: MediaStream): void;
    disconnect(): Promise<void>;
}
export {};

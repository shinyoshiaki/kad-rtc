declare module "simple-datachannel" {
  export default class WebRTC {
    rtc: RTCPeerConnection;
    ev: any;
    nodeId: string;
    isConnected: boolean;
    isDisconnected: boolean;
    connect: () => void;
    data: (raw: { label: string; data: Object; nodeId: string }) => void;
    disconnect: () => void;
    signal: (sdp: Object) => void;

    makeOffer(opt?: any): void;
    setAnswer(sdp: Object): void;
    makeAnswer(sdp: Object, opt?: any): void;
    send(data: string, label: string): void;
    connecting(nodeId: string): void;
  }
}

declare module "simple-datachannel/lib/NodeRTC" {
  export default class WebRTC {
    rtc: RTCPeerConnection;
    ev: any;
    nodeId: string;
    isConnected: boolean;
    isDisconnected: boolean;
    connect: () => void;
    data: (raw: { label: string; data: Object; nodeId: string }) => void;
    disconnect: () => void;
    signal: (sdp: Object) => void;

    makeOffer(opt?: any): void;
    setAnswer(sdp: Object): void;
    makeAnswer(sdp: Object, opt?: any): void;
    send(data: string, label: string): void;
    connecting(nodeId: string): void;
  }
}

declare module "wrtc";

interface RTCDataChannel {
  channel: any;
  data: any;
}

interface DataChannel {
  remotePeer: PeerConnection;
  readyState: string;
  onopen: () => void;
  onclose: () => void;
  onmessage: (event: RTCDataChannel) => void;
  send: (message: string) => void;
}

interface PeerDescription {
  type: string;
  from: number;
  to: number;
  rtcsd: RTCSessionDescription;
}

interface PeerConnection {
  id: number;
  candidateSent: boolean;
  setRemoteDescription: (
    rtcsd: RTCSessionDescription,
    success: () => void,
    failure: (error: any) => void
  ) => void;
  setLocalDescription: (
    rtcsd: RTCSessionDescription,
    success: () => void,
    failure: (error: any) => void
  ) => void;
  addIceCandidate: (candidate: RTCIceCandidate) => void;
  createDataChannel: (name: string, opts: Object) => DataChannel;
  createOffer: (
    cb: (rtcsd: RTCSessionDescription) => void,
    failcb: (...args: any[]) => void
  ) => void;
  createAnswer: (
    cb: (rtcsd: RTCSessionDescription) => void,
    failcb: (...args: any[]) => void
  ) => void;
}

declare module "wrtc" {
  const v: any;
  export default v;
}

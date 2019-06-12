import WebRTC from "../../core";
export default class ArrayBufferService {
    label: string;
    private origin;
    private memory;
    listen(peer: WebRTC): void;
    send(ab: ArrayBuffer, origin: string, rtc: RTCDataChannel): void;
}

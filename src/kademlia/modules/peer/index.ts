import { PeerMock } from "../..";
import { PeerModule } from "./webrtc";

export const PeerMockModule = (kid: string) => new PeerMock(kid);

export default PeerModule;

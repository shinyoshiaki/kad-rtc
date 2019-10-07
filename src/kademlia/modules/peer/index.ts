import { PeerMock } from "../..";
import { PeerModule } from "./webrtc";

const PeerMockModule = (kid: string) => new PeerMock(kid);

export { PeerMockModule };

export default PeerModule;

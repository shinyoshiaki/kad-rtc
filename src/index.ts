import KeyValueStore, { Item } from "./kademlia/modules/kvs/base";
import { ReceiveVideo, StreamVideo } from "./extensions/media";
import { findFile, storeFile } from "./extensions/file";

import EventManager from "./kademlia/services/eventmanager";
import Kademlia from "./kademlia";
import { Peer } from "./kademlia/modules/peer/base";
import { PeerModule } from "./kademlia/modules/peer/webrtc";
import RenderArraybuffer from "./extensions/abstream/renderer";
import StreamArraybuffer from "./extensions/abstream/streamer";
import SuperReceiveVideo from "./extensions/supermedia/renderer";
import SuperStreamVideo from "./extensions/supermedia/streamer";
import genKid from "./kademlia/util/kid";
import { updateTimeout } from "./kademlia/const";

export {
  PeerModule,
  Kademlia,
  KeyValueStore,
  Peer,
  genKid,
  updateTimeout,
  storeFile,
  findFile,
  StreamVideo,
  ReceiveVideo,
  SuperStreamVideo,
  SuperReceiveVideo,
  StreamArraybuffer,
  RenderArraybuffer,
  EventManager,
  Item
};

export default Kademlia;

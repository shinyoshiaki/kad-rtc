interface Req {
  nodeId: string;
  data: any;
}
interface StoreFormat {
  sender: string;
  key: string;
  value: any;
  persist?: boolean;
}

interface StoreChunks {
  sender: string;
  key: string;
  value: any;
  index: number;
  size: number;
}

interface Findnode {
  targetKey: string;
}

interface FindnodeR {
  closeIds: Array<string>;
}

interface FindValue {
  targetKey: string;
}

interface FindValueR {
  success?: {
    value: string;
    key: string;
  };
  fail?: {
    ids: string[];
    targetNode: string;
    targetKey: string;
    to: string;
  };
  chunks?: {
    value: any;
    key: string;
    index: number;
    size: number;
  };
}

interface StoreSignaling {
  type: string;
  target: string;
  sdp: any;
  proxy: any;
}

interface network {
  layer: "networkLayer";
  type: string;
  nodeId: string;
  data: any;
  date: Buffer;
  hash: any;
}

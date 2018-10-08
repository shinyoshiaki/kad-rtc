interface Req {
  nodeId: string;
  data: any;
}
interface Store {
  sender: string;
  key: string;
  value: any;
  persist?: boolean;
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
  targetKey: string;
  keys?: Array<string>;
  value?: any;
}

interface StoreSignaling {
  type: string;
  target: string;
  sdp: any;
  proxy: any;
}

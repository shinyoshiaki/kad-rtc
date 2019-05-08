"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const portal_1 = tslib_1.__importDefault(require("./portal"));
const src_1 = require("../../../src");
const kad = new src_1.Kademlia(src_1.genKid(), { kvs: src_1.KvsModule, peerCreate: src_1.PeerModule });
portal_1.default(kad, 60000);
//# sourceMappingURL=portalnode.js.map
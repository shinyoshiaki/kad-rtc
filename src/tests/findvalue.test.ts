import { PeerModule, findValue, store } from "../kademlia";

import sha1 from "sha1";
import { testSetupNodes } from "./testtools";

const kBucketSize = 8;
const num = 10;

const getRandomInt = (min: number, max: number) =>
  Math.floor(
    Math.random() * (Math.floor(max) - Math.ceil(min)) + Math.ceil(min)
  );

describe("findvalue", () => {
  test(
    "findvalue",
    async () => {
      const nodes = await testSetupNodes(
        kBucketSize,
        num,
        PeerModule,
        60_000 * 10
      );

      const testStore = async (value: string) => {
        const node = nodes[0];
        const key = sha1(value).toString();
        await store(node, key, value);
      };

      await testStore("test");

      const testFindValue = async (value: string) => {
        const key = sha1(value).toString();
        const node = nodes[getRandomInt(0, nodes.length - 1)];
        const { item } = (await findValue(key, node))!;
        expect(item!.value).toBe(value);
      };

      for (let _ in [...Array(kBucketSize)]) {
        await testFindValue("test");
      }

      await new Promise(r => setTimeout(r, 0));

      nodes.forEach(node =>
        node.kTable.allPeers.forEach(peer => peer.disconnect())
      );
    },
    1000 * 6000
  );
});

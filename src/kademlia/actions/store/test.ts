import { testSetupNodes } from "../findnode/test";
import store from ".";
import sha1 from "sha1";

const kBucketSize = 5;
const num = kBucketSize * 2;

describe("store", () => {
  test(
    "store",
    async () => {
      const nodes = await testSetupNodes(kBucketSize, num);

      const testStore = async (value: string) => {
        const node = nodes[0];
        await store(value, node);
      };

      await testStore("test");

      expect(
        Object.keys(nodes.slice(-1)[0].modules.kvs.db).includes(
          sha1("test").toString()
        )
      ).toBe(true);
    },
    1000 * 6000
  );
});

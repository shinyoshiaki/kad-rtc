import { testSetupNodes } from "../findnode/test";
import store from ".";

const kBucketSize = 8;
const num = 5;

describe("store", () => {
  test(
    "store",
    async () => {
      const nodes = await testSetupNodes(kBucketSize, num);

      const test = async (value: string) => {
        const node = nodes[0];
        await store(value, node);
      };

      await test("test");

      expect(true).toBe(true);
    },
    1000 * 6000
  );
});

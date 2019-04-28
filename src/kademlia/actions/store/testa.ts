import { setupNodes } from "../findnode/test";
import store from ".";

const kBucketSize = 8;
const num = 5;

describe("store", () => {
  test(
    "store",
    async () => {
      const nodes = await setupNodes(kBucketSize, num);

      const search = async (value: string) => {
        const node = nodes[0];
        store(value, node);
      };
    },
    1000 * 6000
  );
});

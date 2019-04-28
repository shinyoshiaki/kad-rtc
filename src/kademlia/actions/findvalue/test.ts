import { testSetupNodes } from "../findnode/testa";
import store from "../store";
import sha1 from "sha1";
import findValue from ".";

const kBucketSize = 8;
const num = kBucketSize * 2;

const getRandomInt = (min: number, max: number) =>
  Math.floor(
    Math.random() * (Math.floor(max) - Math.ceil(min)) + Math.ceil(min)
  );

describe("findvalue", () => {
  test(
    "findvalue",
    async () => {
      const nodes = await testSetupNodes(kBucketSize, num);

      const testStore = async (value: string) => {
        const node = nodes[0];
        await store(value, node);
      };

      await testStore("test");

      const testFindValue = async (value: string) => {
        const key = sha1(value).toString();
        const node = nodes[getRandomInt(0, nodes.length - 1)];
        const res = await findValue(key, node);
        expect(res).toBe(value);
      };

      for (let _ in [...Array(kBucketSize)]) {
        await testFindValue("test");
      }

      await new Promise(r => setTimeout(r, 0));
    },
    1000 * 6000
  );
});
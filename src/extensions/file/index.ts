import { Kademlia } from "../..";
import bson from "bson";
import sha1 from "sha1";
import { getSliceArrayBuffer } from "../../utill/file";

export async function storeFile(blob: Blob, kad: Kademlia) {
  const file: ArrayBuffer[] = await getSliceArrayBuffer(blob);
  const jobs: {
    key: string;
    value: Buffer;
  }[] = [];

  {
    const last: ArrayBuffer = file.pop()!;
    const item = { value: Buffer.from(last), next: undefined };

    const value = bson.serialize(item);
    const key = sha1(value).toString();
    jobs.push({ key, value });
  }

  const reverse = file.reverse();
  reverse.forEach(ab => {
    const pre = jobs.slice(-1)[0];
    const item = { value: Buffer.from(ab), next: pre.key };
    const value = bson.serialize(item);
    const key = sha1(value).toString();
    jobs.push({ key, value });
  });

  await Promise.all(jobs.map(job => kad.store(job.key, job.value)));
  return jobs.slice(-1)[0].key;
}

export async function findFile(headerKey: string, kad: Kademlia) {
  const chunks: Buffer[] = [];
  const first: any = await kad.findValue(headerKey);
  const firstJson: { value: Buffer; next: string } = bson.deserialize(
    first.buffer
  );

  const work = () =>
    new Promise<boolean>(async (resolve, reject) => {
      try {
        for (let json = firstJson; ; ) {
          chunks.push(json.value);
          if (!json.next) {
            resolve(true);
            break;
          }
          const value: any = await kad.findValue(json.next);
          if (!value) {
            reject(false);
            break;
          }
          json = bson.deserialize(value.buffer);
        }
      } catch (error) {}
    });

  if (first) {
    const res = await work().catch(console.error);
    if (res) {
      return new Blob(chunks.map(uint => uint.buffer));
    }
  }
  return undefined;
}

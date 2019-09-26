import { decode, encode } from "@msgpack/msgpack";

import JobSystem from "../../kademlia/services/jobsystem";
import { Kademlia } from "../..";
import sha1 from "sha1";

export async function storeFile(file: ArrayBuffer[], kad: Kademlia) {
  if (file.length > 0) {
    const jobs: {
      key: string;
      value: Uint8Array;
    }[] = [];

    {
      const last: ArrayBuffer = file.pop()!;
      console.log({ last });
      const item = { value: new Uint8Array(last), next: undefined };
      console.log({ item });
      const value = encode(item);
      const key = sha1(Buffer.from(value.buffer)).toString();
      jobs.push({ key, value });
    }
    console.log({ file });

    const reverse = file.reverse();
    reverse.forEach(ab => {
      const pre = jobs.slice(-1)[0];
      const item = { value: new Uint8Array(ab), next: pre.key };
      const value = encode(item);
      const key = sha1(Buffer.from(value)).toString();
      jobs.push({ key, value });
    });

    const workers = new JobSystem({ a: 10 });

    await Promise.all(
      jobs.map(async job => {
        await workers.add(kad.store.bind(kad), [job.key, job.value]);
      })
    );

    return jobs.slice(-1)[0].key;
  }
  return undefined;
}

export async function findFile(headerKey: string, kad: Kademlia) {
  const chunks: Uint8Array[] = [];
  const { item } = (await kad.findValue(headerKey))!;
  if (!item) return;
  const firstJson = decode(new Uint8Array(item.value as ArrayBuffer)) as {
    value: Uint8Array;
    next: string;
  };
  console.log({ firstJson });

  const work = () =>
    new Promise<boolean>(async (resolve, reject) => {
      try {
        for (let json = firstJson; ; ) {
          chunks.push(json.value);
          if (!json.next) {
            resolve(true);
            break;
          }
          const { item } = (await kad.findValue(json.next))!;
          if (!item) {
            reject(false);
            break;
          }
          json = decode(new Uint8Array(item.value as ArrayBuffer)) as any;
          console.log({ json });
        }
      } catch (error) {}
    });

  if (item) {
    const res = await work().catch(console.error);
    if (res) {
      return chunks.map(buffer => buffer.buffer);
    }
  }
  return undefined;
}

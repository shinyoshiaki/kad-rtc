import { Kademlia } from "../..";
import bson from "bson";
import sha1 from "sha1";

export async function storeFile(file: ArrayBuffer[], kad: Kademlia) {
  if (file.length > 0) {
    const jobs: {
      key: string;
      value: Buffer;
    }[] = [];

    {
      const last: ArrayBuffer = file.pop as any;
      const item = { value: last, next: undefined };
      const value = bson.serialize(item);
      const key = sha1(value).toString();
      jobs.push({ key, value });
    }

    const reverse = file.reverse();
    reverse.forEach(ab => {
      const pre = jobs.slice(-1)[0];
      const item = { value: ab, next: pre.key };
      const value = bson.serialize(item);
      const key = sha1(value).toString();
      jobs.push({ key, value });
    });

    await Promise.all(
      jobs.map(job => kad.store(job.key, Buffer.from(job.value)))
    );
    return jobs.slice(-1)[0].key;
  }
  return undefined;
}

export async function findFile(headerKey: string, kad: Kademlia) {
  const chunks: ArrayBuffer[] = [];
  const first = await kad.findValue(headerKey);
  const firstJson: { value: ArrayBuffer; next: string } = bson.deserialize(
    first as Buffer
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
          const value = await kad.findValue(json.next);
          if (!value) {
            reject(false);
            break;
          }
          json = bson.deserialize(value as Buffer);
        }
      } catch (error) {}
    });

  if (first) {
    const res = await work().catch(console.error);
    if (res) {
      return chunks;
    }
  }
  return undefined;
}

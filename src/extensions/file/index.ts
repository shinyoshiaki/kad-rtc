import { Kademlia } from "../..";
import bson from "bson";
import sha1 from "sha1";
import JobSystem from "../../kademlia/services/jobsystem";

export async function storeFile(file: ArrayBuffer[], kad: Kademlia) {
  if (file.length > 0) {
    const jobs: {
      key: string;
      value: Buffer;
    }[] = [];

    {
      const last: ArrayBuffer = file.pop()!;
      console.log({ last });
      const item = { value: Buffer.from(last), next: undefined };
      console.log({ item });
      const value = bson.serialize(item);
      const key = sha1(value).toString();
      jobs.push({ key, value });
    }
    console.log({ file });

    const reverse = file.reverse();
    reverse.forEach(ab => {
      const pre = jobs.slice(-1)[0];
      const item = { value: Buffer.from(ab), next: pre.key };
      const value = bson.serialize(item);
      const key = sha1(value).toString();
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
  const chunks: Buffer[] = [];
  const firstItem = await kad.findValue(headerKey);
  if (!firstItem) return;
  const firstJson: { value: Buffer; next: string } = bson.deserialize(
    (firstItem.value as any).buffer
  );
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
          const value = await kad.findValue(json.next);
          if (!value) {
            reject(false);
            break;
          }
          json = bson.deserialize((value.value as any).buffer);
          console.log({ json });
        }
      } catch (error) {}
    });

  if (firstItem) {
    const res = await work().catch(console.error);
    if (res) {
      return chunks.map(buffer => buffer.buffer);
    }
  }
  return undefined;
}

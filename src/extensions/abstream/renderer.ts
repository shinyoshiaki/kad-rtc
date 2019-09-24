import Event, { Buffer } from "rx.mini";

import { Kademlia } from "../..";
import { Torrent } from "./const";

export default class RenderArraybuffer {
  private torrents: Torrent[] = [];
  observer = new Event<Uint8Array>();
  buffer = Buffer(10, this.observer);

  constructor(private kad: Kademlia) {}

  getVideo = (headerKey: string) => {
    const { kad } = this;

    const getTorrent = async () => {
      const first = await kad.findValue(headerKey);
      if (!first) return;

      for (let { item } = first, bufMsg = headerKey, retry = 0; retry < 20; ) {
        if (!item.msg) break;

        if (item.msg !== bufMsg) {
          const torrent: Torrent = JSON.parse(item.value as string);
          this.torrents.push(torrent);
          bufMsg = item.msg;
        }

        const next = await kad.findValue(item.msg);
        console.log(item.msg, { next });

        if (!next) {
          console.log("fail next", { retry });
          retry++;
          if (this.torrents.length === 0)
            await new Promise(r => setTimeout(r, 100 * retry));
          else await new Promise(r => setTimeout(r, 4_000));
          continue;
        } else {
          item = next.item;
          retry = 0;
        }
      }
    };
    getTorrent();
    this.getChunks();
  };

  private getChunks = () => {
    const { kad, torrents } = this;

    const caches: { [hash: string]: Uint8Array } = {};
    const playList: Torrent[] = [];

    const find = async () => {
      findloop: while (true) {
        const torrentBlocks = torrents.shift();
        if (!torrentBlocks) {
          await new Promise(r => setTimeout(r, 10));
          continue;
        }
        playList.push(torrentBlocks);

        for (let torrent of torrentBlocks) {
          const { v } = torrent;
          let { item } = (await kad.findValue(v))!;
          if (!item) {
            for (let retry = 0; retry < 20; retry++) {
              item = (await kad.findValue(v))!.item;
              if (item) {
                break;
              } else {
                console.log("fail chunk", retry);
                await new Promise(r => setTimeout(r, 100 * retry));
              }
            }
          }
          if (!item) {
            console.error("broken");
            break findloop;
          } else {
            caches[v] = item.value as any;
          }
        }
      }
    };
    find();

    const seek = async () => {
      for (let torrent: Torrent | undefined; ; ) {
        await new Promise(r => setTimeout(r, 10));

        if (!torrent) torrent = playList.shift();
        if (!torrent) continue;

        const unexist = torrent.some(
          item => !Object.keys(caches).includes(item.v)
        );

        if (unexist) {
          continue;
        } else {
          torrent
            .sort((a, b) => a.i - b.i)
            .forEach(item => {
              const chunk = caches[item.v];
              this.observer.execute(chunk);
            });
          torrent = undefined;
        }
      }
    };
    seek();
  };
}

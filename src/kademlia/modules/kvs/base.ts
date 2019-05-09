import Event from "rx.mini";

export default class KevValueStore {
  db: { [key: string]: string | ArrayBuffer } = {};
  onSet = new Event<{ key: string; value: string | ArrayBuffer }>();

  set(key: string, value: string | ArrayBuffer) {
    this.db[key] = value;
    this.onSet.excute({ key, value });
  }

  get = (key: string): string | ArrayBuffer | undefined => this.db[key];
}

export const KvsModule = (() => new KevValueStore())();

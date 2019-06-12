import Event from "rx.mini";

export type Item = { value: string | ArrayBuffer; msg?: string };

export default class KevValueStore {
  db: { [key: string]: Item } = {};
  onSet = new Event<{ key: string; value: string | ArrayBuffer }>();

  set(key: string, value: string | ArrayBuffer, msg: string) {
    this.db[key] = { value, msg };
    this.onSet.execute({ key, value });
  }

  get = (key: string): Item | undefined => this.db[key];
}

export const KvsModule = (() => new KevValueStore())();

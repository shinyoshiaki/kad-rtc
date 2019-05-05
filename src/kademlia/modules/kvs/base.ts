import Event from "rx.mini";

export const KvsModule = () => new KevValueStore();

export default class KevValueStore {
  db: { [key: string]: string } = {};
  onSet = new Event<{ key: string; value: string }>();

  set(key: string, value: string) {
    this.db[key] = value;
    this.onSet.excute({ key, value });
  }

  get = (key: string): string | undefined => this.db[key];
}
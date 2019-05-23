import Event from "rx.mini";

export default class KevValueStore {
  db: { [key: string]: { value: string | ArrayBuffer; msg?: string } } = {};
  onSet = new Event<{ key: string; value: string | ArrayBuffer }>();

  set(key: string, value: string | ArrayBuffer, msg?: string) {
    this.db[key] = { value, msg };
    this.onSet.execute({ key, value });
  }

  get = (key: string): string | ArrayBuffer | undefined => this.db[key].value;

  getMsg = (key: string): string | undefined => this.db[key].msg;
}

export const KvsModule = (() => new KevValueStore())();

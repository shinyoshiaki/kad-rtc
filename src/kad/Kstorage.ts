export default class KStorage {
  kvs: { [key: string]: any } = {};

  set(key: string, value: any) {
    this.kvs[key] = value;
  }

  get(key: string) {
    if (Object.keys(this.kvs).includes(key)) {
      return this.kvs[key];
    } else {
      return false;
    }
  }
}

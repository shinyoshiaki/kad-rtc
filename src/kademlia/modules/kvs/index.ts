export default class KevValueStore {
  db: { [key: string]: string } = {};

  set(key: string, value: string) {
    this.db[key] = value;
  }

  get = (key: string): string | undefined => this.db[key];
}

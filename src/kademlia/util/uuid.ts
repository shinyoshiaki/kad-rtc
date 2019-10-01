export default class Uuid {
  private i = 0;

  constructor(private prefix = Math.random().toString()) {}

  setPrefix(s: string) {
    this.prefix = s;
  }

  get() {
    return this.prefix + this.i++;
  }
}

export class Count {
  private count = 0;
  constructor(private times: number, private resolve: any) {}

  check = () => {
    this.count++;
    if (this.count === this.times) this.resolve();
  };
}

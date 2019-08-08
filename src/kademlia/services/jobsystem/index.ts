import Event from "rx.mini";

type Option = { a: number };

type AA<T> = T extends (...arg: infer I) => any ? I : never;
type ThenArg<T> = T extends Promise<infer U> ? U : T;

type Job = { func: any; args: any[]; event: Event<any> };

export default class JobSystem {
  jobs: Job[] = [];
  workers: Worker[] = [];

  constructor(private opt: Option = { a: 5 }) {
    const { a } = opt;
    this.workers = [...Array(a)].map(() => new Worker(this.jobs));
  }

  async add<T extends (...args: any[]) => Promise<any>>(
    func: T,
    args: AA<typeof func>
  ) {
    const { a } = this.opt;

    const event = new Event<ThenArg<ReturnType<T>>>();

    this.jobs.push({ func, args, event });

    if (this.jobs.length < a) {
      this.workers.forEach(worker => worker.wakeup());
    }

    return event.asPromise();
  }
}

class Worker {
  running = false;

  constructor(private jobs: Job[]) {}

  private async execute() {
    const job = this.jobs.shift();
    if (job) {
      this.running = true;

      const { func, args, event } = job;

      const res = await func(...args);
      event.execute(res);

      this.execute();
    } else {
      this.running = false;
    }
  }

  wakeup() {
    if (!this.running) {
      this.execute();
    }
  }
}

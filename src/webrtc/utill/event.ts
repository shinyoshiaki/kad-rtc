type EventFunc<T> = (data: T) => void;

interface IEvent<T> {
  stack: { func: EventFunc<T>; id: number }[];
  index: number;
}

export default class Event<T> {
  private event: IEvent<T>;

  constructor() {
    this.event = {
      stack: [],
      index: 0
    };
  }

  excute(data?: T) {
    for (let item of this.event.stack) {
      if (data) item.func(data);
      else item.func(undefined as any);
    }
  }

  subscribe(func: EventFunc<T>) {
    const id = this.event.index;
    this.event.stack.push({ func, id });
    this.event.index++;
    const unSubscribe = () => {
      this.event.stack = this.event.stack.filter(
        item => item.id !== id && item
      );
    };
    return { unSubscribe };
  }

  once(func: EventFunc<T>) {
    const off = this.subscribe(data => {
      off.unSubscribe();
      func(data);
    });
  }

  asPromise = (timelimit?: number) =>
    new Promise<T>((resolve, reject) => {
      const timeout =
        timelimit &&
        setTimeout(() => {
          reject();
        }, timelimit);
      this.once(data => {
        if (timeout) clearTimeout(timeout);
        resolve(data);
      });
    });
}

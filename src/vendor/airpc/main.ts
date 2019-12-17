import { decode, encode } from "@msgpack/msgpack";

import { Remote } from "./typings/remote";
import { Subject } from "rxjs";

export type Wrapper = {
  subject: Subject<Uint8Array>;
  post: (v: Uint8Array) => void;
};
export type Exposer = Subject<ExposerObject>;
export type ExposerObject = {
  postMessage: (v: Uint8Array) => void;
  value: Uint8Array;
};

class Wrap {
  constructor(target: any, wrapper: Wrapper, timeout?: number) {
    Object.getOwnPropertyNames(target.prototype).forEach(type => {
      if (type === "constructor") return;

      (this as any)[type] = (...args: any[]) =>
        new Promise((r, f) => {
          const parentId = generateUUID();

          const id = timeout && setTimeout(() => f("wrap timeout"), timeout);

          wrapper.subject.subscribe(res => {
            const { uuid, response } = decode(res) as any;
            if (parentId === uuid) {
              if (id) clearTimeout(id);
              r(response);
            }
          });

          wrapper.post(encode({ type, args, uuid: parentId }));
        });
    });
  }
}

export function wrap<T>(
  target: { new (...args: any[]): T },
  wrapper: Wrapper,
  timeout?: number
): Remote<T> {
  return new Wrap(target, wrapper, timeout) as any;
}

export function expose(instance: any, exposer: Exposer) {
  exposer.subscribe(async v => {
    const { postMessage, value } = v;
    const { type, args, uuid } = decode(value) as any;
    if (instance[type]) {
      const response = await instance[type](...args);
      postMessage(encode({ uuid, response }));
    }
  });
}

function generateUUID(): string {
  return new Array(4)
    .fill(0)
    .map(() => Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(16))
    .join("-");
}

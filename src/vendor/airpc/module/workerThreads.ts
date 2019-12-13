import { Exposer, ExposerObject, Wrapper } from "../main";
import { MessageChannel, Worker, parentPort } from "worker_threads";

import { Subject } from "rxjs";

export const workerThreadsWrapper = (worker: Worker): Wrapper => {
  const subject = new Subject<Uint8Array>();

  const post = (value: Uint8Array) => {
    const { port1, port2 } = new MessageChannel();

    port1.on("message", s => {
      subject.next(s);
    });

    worker.postMessage(
      {
        port: port2,
        value
      },
      [port2]
    );
  };

  return { subject, post };
};

export const workerThreadsExposer = (): Exposer => {
  const subject = new Subject<ExposerObject>();

  if (parentPort) {
    parentPort.on("message", data => {
      const { port, value } = data;
      subject.next({ port, value });
    });
  }

  return subject;
};

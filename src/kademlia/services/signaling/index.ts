import Event from "rx.mini";

export default class Signaling {
  candidates: { [kid: string]: Event<any> } = {};
}

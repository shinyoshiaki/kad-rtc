import Event from "rx.mini";

export default class Candidates {
  private candidates: { [key: string]: Event<any> } = {};

  addCandidate(kid: string) {
    const observer = new Event();
    this.candidates[kid] = observer;
    return observer;
  }

  finishCandidate(kid: string) {
    const observer = this.candidates[kid];
    observer.excute();
    delete this.candidates[kid];
  }

  exist(kid: string) {
    const candidate = this.candidates[kid];
    if (candidate) return candidate;
    else return undefined;
  }
}

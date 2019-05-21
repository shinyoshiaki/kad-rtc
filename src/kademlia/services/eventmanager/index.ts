export default class EventManager {
  events: { [kid: string]: { [session: string]: any } } = {};
}

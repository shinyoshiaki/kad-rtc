import ArrayBufferService from "./arraybuffer";

export type Services = {
  arrayBufferService: ArrayBufferService;
};

export default function SetupServices(): Services {
  const arrayBufferService = new ArrayBufferService();
  return { arrayBufferService };
}

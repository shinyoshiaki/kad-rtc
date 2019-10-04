import sha1 from "sha1";

export default function genKid(seed?: string) {
  const str = seed || Math.random().toString();
  return sha1(str).toString();
}

import sha1 from "sha1";

export const abHash = (ab: ArrayBuffer) => sha1(Buffer.from(ab)).toString();

export const jsonHash = (obj: {}) => sha1(JSON.stringify(obj)).toString();

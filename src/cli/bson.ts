import { BSON } from "bson";
var bufferToArrayBuffer = require("buffer-to-arraybuffer");
const bson = new BSON();

const test = bson.serialize({ test: "sumsing" });

const json = {
  fuck: "test",
  data: { sex: "sitai" },
  inc: Buffer.from(bufferToArrayBuffer(bson.serialize({ test: "sumsing" })))
};
const enc = bson.serialize(json);
const dec = bson.deserialize(enc);

console.log({ dec }, dec.inc);
const inc = bson.deserialize(Buffer.from(dec.inc));
console.log({ inc });

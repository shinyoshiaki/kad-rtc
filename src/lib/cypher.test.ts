import Cypher from "./cypher";

const cypher = new Cypher();
const enc = cypher.encrypt("test");
console.log(cypher.decrypt(enc, cypher.pubKey));

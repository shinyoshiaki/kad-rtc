"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const msgpack_1 = require("@msgpack/msgpack");
const jobsystem_1 = tslib_1.__importDefault(require("../../kademlia/services/jobsystem"));
const sha1_1 = tslib_1.__importDefault(require("sha1"));
function storeFile(file, kad) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        if (file.length > 0) {
            const jobs = [];
            {
                const last = file.pop();
                console.log({ last });
                const item = { value: new Uint8Array(last), next: undefined };
                console.log({ item });
                const value = msgpack_1.encode(item);
                const key = sha1_1.default(Buffer.from(value.buffer)).toString();
                jobs.push({ key, value });
            }
            console.log({ file });
            const reverse = file.reverse();
            reverse.forEach(ab => {
                const pre = jobs.slice(-1)[0];
                const item = { value: new Uint8Array(ab), next: pre.key };
                const value = msgpack_1.encode(item);
                const key = sha1_1.default(Buffer.from(value)).toString();
                jobs.push({ key, value });
            });
            const workers = new jobsystem_1.default({ a: 10 });
            yield Promise.all(jobs.map((job) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield workers.add(kad.store.bind(kad), [job.key, job.value]);
            })));
            return jobs.slice(-1)[0].key;
        }
        return undefined;
    });
}
exports.storeFile = storeFile;
function findFile(headerKey, kad) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const chunks = [];
        const { item } = (yield kad.findValue(headerKey));
        if (!item)
            return;
        const firstJson = msgpack_1.decode(new Uint8Array(item.value));
        console.log({ firstJson });
        const work = () => new Promise((resolve, reject) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                for (let json = firstJson;;) {
                    chunks.push(json.value);
                    if (!json.next) {
                        resolve(true);
                        break;
                    }
                    const { item } = (yield kad.findValue(json.next));
                    if (!item) {
                        reject(false);
                        break;
                    }
                    json = msgpack_1.decode(new Uint8Array(item.value));
                    console.log({ json });
                }
            }
            catch (error) { }
        }));
        if (item) {
            const res = yield work().catch(console.error);
            if (res) {
                return chunks.map(buffer => buffer.buffer);
            }
        }
        return undefined;
    });
}
exports.findFile = findFile;
//# sourceMappingURL=index.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const bson_1 = tslib_1.__importDefault(require("bson"));
const sha1_1 = tslib_1.__importDefault(require("sha1"));
const file_1 = require("../../utill/file");
function storeFile(blob, kad) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const file = yield file_1.getSliceArrayBuffer(blob);
        const jobs = [];
        {
            const last = file.pop();
            const item = { value: Buffer.from(last), next: undefined };
            const value = bson_1.default.serialize(item);
            const key = sha1_1.default(value).toString();
            jobs.push({ key, value });
        }
        const reverse = file.reverse();
        reverse.forEach(ab => {
            const pre = jobs.slice(-1)[0];
            const item = { value: Buffer.from(ab), next: pre.key };
            const value = bson_1.default.serialize(item);
            const key = sha1_1.default(value).toString();
            jobs.push({ key, value });
        });
        yield Promise.all(jobs.map(job => kad.store(job.key, job.value)));
        return jobs.slice(-1)[0].key;
    });
}
exports.storeFile = storeFile;
function findFile(headerKey, kad) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const chunks = [];
        const first = yield kad.findValue(headerKey);
        const firstJson = bson_1.default.deserialize(first.buffer);
        const work = () => new Promise((resolve, reject) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                for (let json = firstJson;;) {
                    chunks.push(json.value);
                    if (!json.next) {
                        resolve(true);
                        break;
                    }
                    const value = yield kad.findValue(json.next);
                    if (!value) {
                        reject(false);
                        break;
                    }
                    json = bson_1.default.deserialize(value.buffer);
                }
            }
            catch (error) { }
        }));
        if (first) {
            const res = yield work().catch(console.error);
            if (res) {
                return new Blob(chunks.map(uint => uint.buffer));
            }
        }
        return undefined;
    });
}
exports.findFile = findFile;
//# sourceMappingURL=index.js.map
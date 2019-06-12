"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const arraybuffer_1 = tslib_1.__importDefault(require("./arraybuffer"));
function SetupServices() {
    const arrayBufferService = new arraybuffer_1.default();
    return { arrayBufferService };
}
exports.default = SetupServices;
//# sourceMappingURL=index.js.map
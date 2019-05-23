"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const ktable_1 = tslib_1.__importDefault(require("./ktable"));
const rpcmanager_1 = tslib_1.__importDefault(require("./services/rpcmanager"));
const signaling_1 = tslib_1.__importDefault(require("./services/signaling"));
const jobsystem_1 = tslib_1.__importDefault(require("./services/jobsystem"));
exports.dependencyInjection = (kid, modules, opt = {}) => {
    return {
        kTable: new ktable_1.default(kid, opt),
        modules,
        rpcManager: new rpcmanager_1.default(),
        signaling: new signaling_1.default(modules.peerCreate),
        jobSystem: new jobsystem_1.default()
    };
};
//# sourceMappingURL=di.js.map
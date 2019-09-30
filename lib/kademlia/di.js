"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const ktable_1 = tslib_1.__importDefault(require("./ktable"));
const eventmanager_1 = tslib_1.__importDefault(require("./services/eventmanager"));
const jobsystem_1 = tslib_1.__importDefault(require("./services/jobsystem"));
const rpcmanager_1 = tslib_1.__importDefault(require("./services/rpcmanager"));
const signaling_1 = tslib_1.__importDefault(require("./services/signaling"));
exports.dependencyInjection = (kid, modules, opt = {}) => {
    const rpcManager = new rpcmanager_1.default();
    return {
        modules,
        kTable: new ktable_1.default(kid, opt),
        rpcManager,
        signaling: new signaling_1.default(modules.peerCreate),
        jobSystem: new jobsystem_1.default(),
        eventManager: new eventmanager_1.default(rpcManager)
    };
};
//# sourceMappingURL=di.js.map
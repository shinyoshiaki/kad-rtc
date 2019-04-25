"use strict";
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var ktable_1 = tslib_1.__importDefault(require("../../ktable"));
var webrtc_1 = tslib_1.__importStar(require("../../modules/peer/webrtc"));
var sha1_1 = tslib_1.__importDefault(require("sha1"));
var listen_1 = tslib_1.__importDefault(require("./listen"));
var _1 = tslib_1.__importDefault(require("."));
var kBucketSize = 8;
var num = 24;
describe("findnode", function () {
    test("findnode", function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
        var nodes, kOffer, kAnswer, offer, offerSdp, answer, answerSdp, i, pop, push, offer_1, offerSdp_1, answer_1, answerSdp_1, _i, nodes_1, node, search, _a, nodes_2, word;
        var _this = this;
        return tslib_1.__generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    nodes = [];
                    kOffer = new ktable_1.default(sha1_1.default("0").toString(), { kBucketSize: kBucketSize });
                    kAnswer = new ktable_1.default(sha1_1.default("1").toString(), { kBucketSize: kBucketSize });
                    offer = new webrtc_1.default(kAnswer.kid);
                    return [4 /*yield*/, offer.createOffer()];
                case 1:
                    offerSdp = _b.sent();
                    answer = new webrtc_1.default(kOffer.kid);
                    return [4 /*yield*/, answer.setOffer(offerSdp)];
                case 2:
                    answerSdp = _b.sent();
                    return [4 /*yield*/, offer.setAnswer(answerSdp)];
                case 3:
                    _b.sent();
                    kOffer.add(offer);
                    listen_1.default(webrtc_1.PeerModule, offer, kOffer);
                    kAnswer.add(answer);
                    listen_1.default(webrtc_1.PeerModule, answer, kAnswer);
                    nodes.push(kOffer);
                    nodes.push(kAnswer);
                    i = 2;
                    _b.label = 4;
                case 4:
                    if (!(i < 2 + num)) return [3 /*break*/, 9];
                    pop = nodes.slice(-1)[0];
                    push = new ktable_1.default(sha1_1.default(i.toString()).toString(), { kBucketSize: kBucketSize });
                    offer_1 = new webrtc_1.default(push.kid);
                    return [4 /*yield*/, offer_1.createOffer()];
                case 5:
                    offerSdp_1 = _b.sent();
                    answer_1 = new webrtc_1.default(pop.kid);
                    return [4 /*yield*/, answer_1.setOffer(offerSdp_1)];
                case 6:
                    answerSdp_1 = _b.sent();
                    return [4 /*yield*/, offer_1.setAnswer(answerSdp_1)];
                case 7:
                    _b.sent();
                    pop.add(offer_1);
                    listen_1.default(webrtc_1.PeerModule, offer_1, pop);
                    push.add(answer_1);
                    listen_1.default(webrtc_1.PeerModule, answer_1, push);
                    nodes.push(push);
                    _b.label = 8;
                case 8:
                    i++;
                    return [3 /*break*/, 4];
                case 9:
                    _i = 0, nodes_1 = nodes;
                    _b.label = 10;
                case 10:
                    if (!(_i < nodes_1.length)) return [3 /*break*/, 13];
                    node = nodes_1[_i];
                    return [4 /*yield*/, _1.default(webrtc_1.PeerModule, node.kid, node)];
                case 11:
                    _b.sent();
                    _b.label = 12;
                case 12:
                    _i++;
                    return [3 /*break*/, 10];
                case 13:
                    search = function (word) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                        var node, target, _a, _b, _i, _;
                        return tslib_1.__generator(this, function (_c) {
                            switch (_c.label) {
                                case 0:
                                    node = nodes[0];
                                    _a = [];
                                    for (_b in Array(5).slice())
                                        _a.push(_b);
                                    _i = 0;
                                    _c.label = 1;
                                case 1:
                                    if (!(_i < _a.length)) return [3 /*break*/, 4];
                                    _ = _a[_i];
                                    return [4 /*yield*/, _1.default(webrtc_1.PeerModule, word, node)];
                                case 2:
                                    target = _c.sent();
                                    if (target)
                                        return [3 /*break*/, 4];
                                    _c.label = 3;
                                case 3:
                                    _i++;
                                    return [3 /*break*/, 1];
                                case 4:
                                    expect(target).not.toBe(undefined);
                                    return [2 /*return*/];
                            }
                        });
                    }); };
                    _a = 0, nodes_2 = nodes;
                    _b.label = 14;
                case 14:
                    if (!(_a < nodes_2.length)) return [3 /*break*/, 17];
                    word = nodes_2[_a];
                    if (word.kid === nodes[0].kid)
                        return [3 /*break*/, 16];
                    return [4 /*yield*/, search(word.kid)];
                case 15:
                    _b.sent();
                    _b.label = 16;
                case 16:
                    _a++;
                    return [3 /*break*/, 14];
                case 17: return [2 /*return*/];
            }
        });
    }); }, 1000 * 6000);
});
//# sourceMappingURL=test.js.map
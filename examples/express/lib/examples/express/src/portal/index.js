"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const express_1 = tslib_1.__importDefault(require("express"));
const src_1 = require("../../../../src");
const body_parser_1 = tslib_1.__importDefault(require("body-parser"));
const peers = {};
function potalnode(kad, port) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const app = express_1.default();
        app.use(body_parser_1.default.urlencoded({ extended: true }));
        app.use(body_parser_1.default.json());
        app.listen(port, () => {
            console.log("Example app listening on port " + port);
        });
        app.post("/join", (req, res) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                console.log("join", req.body);
                const kid = req.body.kid;
                if (kid) {
                    console.log({ kid });
                    const peer = src_1.PeerModule(kid);
                    peers[kid] = peer;
                    const offer = yield peer.createOffer();
                    return res.send({ offer, kid: kad.kid });
                }
            }
            catch (error) { }
        }));
        app.post("/answer", (req, res) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                const { answer, kid } = req.body;
                if (answer && kid) {
                    const peer = peers[kid];
                    yield peer.setAnswer(answer);
                    kad.add(peer);
                    delete peers[kid];
                    console.log("connected");
                    return res.send("connected");
                }
            }
            catch (error) { }
        }));
    });
}
exports.default = potalnode;
//# sourceMappingURL=index.js.map
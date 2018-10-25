"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _webrtc4me = _interopRequireDefault(require("webrtc4me"));

var _kUtil = _interopRequireDefault(require("./kUtil"));

var _kResponder = _interopRequireDefault(require("./kResponder"));

var _KConst = _interopRequireWildcard(require("./KConst"));

var _kadDistance = require("kad-distance");

var _bson = require("bson");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

require("babel-polyfill");

var bson = new _bson.BSON();

var Kademlia =
/*#__PURE__*/
function () {
  function Kademlia(_nodeId, opt) {
    _classCallCheck(this, Kademlia);

    _defineProperty(this, "nodeId", void 0);

    _defineProperty(this, "k", void 0);

    _defineProperty(this, "kbuckets", void 0);

    _defineProperty(this, "f", void 0);

    _defineProperty(this, "responder", void 0);

    _defineProperty(this, "dataList", []);

    _defineProperty(this, "keyValueList", {});

    _defineProperty(this, "ref", {});

    _defineProperty(this, "buffer", {});

    _defineProperty(this, "state", {
      isConnect: false,
      isOffer: false,
      findNode: "",
      hash: {}
    });

    _defineProperty(this, "callback", {
      onConnect: function onConnect() {},
      onAddPeer: function onAddPeer(v) {},
      onPeerDisconnect: function onPeerDisconnect(v) {},
      _onFindValue: function _onFindValue(v) {},
      onFindNode: function onFindNode(v) {},
      onStore: function onStore(v) {},
      onApp: function onApp(v) {}
    });

    console.log("start kad", _nodeId);
    this.k = 20;
    if (opt) if (opt.kLength) this.k = opt.kLength;
    this.nodeId = _nodeId;
    this.kbuckets = new Array(160);

    for (var i = 0; i < 160; i++) {
      var kbucket = [];
      this.kbuckets[i] = kbucket;
    }

    this.f = new _kUtil.default(this.k, this.kbuckets);
    this.responder = new _kResponder.default(this);
  }

  _createClass(Kademlia, [{
    key: "store",
    value: function store(sender, key, value) {
      //自分に一番近いピアを取得
      var peer = this.f.getCloseEstPeer(key);
      if (!peer) return;
      console.log(_KConst.default.STORE, "next", peer.nodeId, "target", key);
      var sendData = {
        sender: sender,
        key: key,
        value: value
      };
      var network = (0, _KConst.networkFormat)(this.nodeId, _KConst.default.STORE, sendData);
      peer.send(network, "kad");
      console.log("store done", {
        network: network
      });
      this.keyValueList[key] = value;
      this.callback.onStore(this.keyValueList);
    }
  }, {
    key: "storeChunks",
    value: function storeChunks(sender, key, chunks) {
      var _this = this;

      var peer = this.f.getCloseEstPeer(key);
      if (!peer) return;
      chunks.forEach(function (chunk, i) {
        var sendData = {
          sender: _this.nodeId,
          key: key,
          value: chunk,
          index: i,
          size: chunks.length
        };
        var network = (0, _KConst.networkFormat)(sender, _KConst.default.STORE_CHUNKS, sendData);
        peer.send(network, "kad");
        _this.keyValueList[key] = chunks;

        _this.callback.onStore(_this.keyValueList);
      });
    }
  }, {
    key: "findNode",
    value: function findNode(targetId, peer) {
      console.log("findnode", targetId);
      this.state.findNode = targetId;
      var sendData = {
        targetKey: targetId
      }; //送る

      peer.send((0, _KConst.networkFormat)(this.nodeId, _KConst.default.FINDNODE, sendData), "kad");
    }
  }, {
    key: "findValue",
    value: function findValue(key) {
      var _this2 = this;

      return new Promise(function (resolve, reject) {
        var timeout = setTimeout(function () {
          reject("findvalue timeout");
        }, 10 * 1000);

        _this2.callback._onFindValue = function (value) {
          clearTimeout(timeout);
          resolve(value);
        }; //keyに近いピアを取得


        var peers = _this2.f.getClosePeers(key);

        peers.forEach(function (peer) {
          _this2.doFindvalue(key, peer);
        });
      });
    }
  }, {
    key: "doFindvalue",
    value: function () {
      var _doFindvalue = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee(key, peer) {
        var sendData;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                console.log("dofindvalue", peer.nodeId);
                sendData = {
                  targetKey: key
                };
                peer.send((0, _KConst.networkFormat)(this.nodeId, _KConst.default.FINDVALUE, sendData), "kad");

              case 3:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      return function doFindvalue(_x, _x2) {
        return _doFindvalue.apply(this, arguments);
      };
    }()
  }, {
    key: "connect",
    value: function connect(peer) {
      if (!this.state.isConnect) {
        this.state.isConnect = true;
        this.addknode(peer);
        this.callback.onConnect();
      }
    }
  }, {
    key: "addknode",
    value: function addknode(peer) {
      var _this3 = this;

      peer.events.data["kademlia.ts"] = function (raw) {
        _this3.onCommand(raw);
      };

      peer.disconnect = function () {
        console.log("kad node disconnected");

        _this3.f.cleanDiscon();

        _this3.callback.onAddPeer(_this3.f.getAllPeerIds());
      };

      if (!this.f.isNodeExist(peer.nodeId)) {
        //自分のノードIDと追加するノードIDの距離
        var num = (0, _kadDistance.distance)(this.nodeId, peer.nodeId); //kbucketsの該当する距離のkbucketを呼び出す

        var kbucket = this.kbuckets[num]; //該当するkbucketに新しいピアを加える

        kbucket.push(peer);
        console.log("addknode kbuckets", "peer.nodeId:", peer.nodeId);
        console.log(this.f.getAllPeerIds());
        setTimeout(function () {
          _this3.findNewPeer(peer);
        }, 1000);
        this.callback.onAddPeer(this.f.getAllPeerIds());
      }
    }
  }, {
    key: "findNewPeer",
    value: function findNewPeer(peer) {
      if (this.f.getKbucketNum() < this.k) {
        //自身のノードIDをkeyとしてFIND_NODE
        this.findNode(this.nodeId, peer);
      } else {
        console.log("kbucket ready", this.f.getKbucketNum());
      }
    }
  }, {
    key: "maintain",
    value: function () {
      var _maintain = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee2(network) {
        var inx, kbucket;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                inx = (0, _kadDistance.distance)(this.nodeId, network.nodeId);
                kbucket = this.kbuckets[inx]; //送信元が該当するk-bucketの中にあった場合
                //そのノードをk-bucketの末尾に移す

                kbucket.forEach(function (peer, i) {
                  if (peer.nodeId === network.nodeId) {
                    console.log("maintain", "Moves it to the tail of the list");
                    kbucket.splice(i, 1);
                    kbucket.push(peer);
                    return 0;
                  }
                }); //k-bucketがすでに満杯な場合、
                //そのk-bucket中の先頭のノードがオンラインなら先頭のノードを残す

                if (kbucket.length > this.k) {
                  kbucket.shift();
                }

              case 4:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      return function maintain(_x3) {
        return _maintain.apply(this, arguments);
      };
    }()
  }, {
    key: "offer",
    value: function offer(target) {
      var _this4 = this;

      var proxy = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      return new Promise(function (resolve, reject) {
        var r = _this4.ref;
        var peer = r[target] = new _webrtc4me.default();
        peer.makeOffer();
        var timeout = setTimeout(function () {
          reject("kad offer timeout");
        }, 5 * 1000);

        peer.signal = function (sdp) {
          console.log("kad offer store", target);

          var _ = _this4.f.getCloseEstPeer(target);

          if (!_) return;
          if (_.nodeId !== target) _this4.store(_this4.nodeId, target, {
            sdp: sdp,
            proxy: proxy
          });
        };

        peer.connect = function () {
          peer.nodeId = target;
          console.log("kad offer connected", target);

          _this4.addknode(peer);

          clearTimeout(timeout);
          resolve(true);
        };
      });
    }
  }, {
    key: "answer",
    value: function answer(target, sdp, proxy) {
      var _this5 = this;

      return new Promise(function (resolve, reject) {
        var r = _this5.ref;
        var peer = r[target] = new _webrtc4me.default();
        peer.makeAnswer(sdp);
        console.log("kad answer", target);
        var timeout = setTimeout(function () {
          reject("kad answer timeout");
        }, 5 * 1000);

        peer.signal = function (sdp) {
          var _ = _this5.f.getPeerFromnodeId(proxy); //来たルートに送り返す


          var sendData = {
            sender: _this5.nodeId,
            key: target,
            value: {
              sdp: sdp
            }
          };
          if (_) _.send((0, _KConst.networkFormat)(_this5.nodeId, _KConst.default.STORE, sendData), "kad");
        };

        peer.connect = function () {
          peer.nodeId = target;
          console.log("kad answer connected", target);

          _this5.addknode(peer);

          clearTimeout(timeout);
          resolve(true);
        };
      });
    }
  }, {
    key: "send",
    value: function send(target, data) {
      var _ = this.f.getPeerFromnodeId(target);

      if (_) _.send((0, _KConst.networkFormat)(this.nodeId, _KConst.default.SEND, data), "kad");
    }
  }, {
    key: "onCommand",
    value: function onCommand(message) {
      switch (message.label) {
        case "kad":
          var dataLink = Buffer.from(message.data);
          console.log({
            dataLink: dataLink
          });

          try {
            console.log("oncommand kad", {
              message: message
            }, {
              dataLink: dataLink
            });
            var networkLayer = bson.deserialize(dataLink);

            if (!JSON.stringify(this.dataList).includes(networkLayer.hash)) {
              this.dataList.push(networkLayer.hash);
              this.onRequest(networkLayer);
            }
          } catch (error) {
            console.log(error);
          }

          break;
      }
    }
  }, {
    key: "onRequest",
    value: function onRequest(network) {
      this.responder.response(network.type, network);
      this.maintain(network);
    }
  }]);

  return Kademlia;
}();

exports.default = Kademlia;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9rYWQva2FkZW1saWEudHMiXSwibmFtZXMiOlsicmVxdWlyZSIsImJzb24iLCJCU09OIiwiS2FkZW1saWEiLCJfbm9kZUlkIiwib3B0IiwiaXNDb25uZWN0IiwiaXNPZmZlciIsImZpbmROb2RlIiwiaGFzaCIsIm9uQ29ubmVjdCIsIm9uQWRkUGVlciIsInYiLCJvblBlZXJEaXNjb25uZWN0IiwiX29uRmluZFZhbHVlIiwib25GaW5kTm9kZSIsIm9uU3RvcmUiLCJvbkFwcCIsImNvbnNvbGUiLCJsb2ciLCJrIiwia0xlbmd0aCIsIm5vZGVJZCIsImtidWNrZXRzIiwiQXJyYXkiLCJpIiwia2J1Y2tldCIsImYiLCJIZWxwZXIiLCJyZXNwb25kZXIiLCJLUmVzcG9uZGVyIiwic2VuZGVyIiwia2V5IiwidmFsdWUiLCJwZWVyIiwiZ2V0Q2xvc2VFc3RQZWVyIiwiZGVmIiwiU1RPUkUiLCJzZW5kRGF0YSIsIm5ldHdvcmsiLCJzZW5kIiwia2V5VmFsdWVMaXN0IiwiY2FsbGJhY2siLCJjaHVua3MiLCJmb3JFYWNoIiwiY2h1bmsiLCJpbmRleCIsInNpemUiLCJsZW5ndGgiLCJTVE9SRV9DSFVOS1MiLCJ0YXJnZXRJZCIsInN0YXRlIiwidGFyZ2V0S2V5IiwiRklORE5PREUiLCJQcm9taXNlIiwicmVzb2x2ZSIsInJlamVjdCIsInRpbWVvdXQiLCJzZXRUaW1lb3V0IiwiY2xlYXJUaW1lb3V0IiwicGVlcnMiLCJnZXRDbG9zZVBlZXJzIiwiZG9GaW5kdmFsdWUiLCJGSU5EVkFMVUUiLCJhZGRrbm9kZSIsImV2ZW50cyIsImRhdGEiLCJyYXciLCJvbkNvbW1hbmQiLCJkaXNjb25uZWN0IiwiY2xlYW5EaXNjb24iLCJnZXRBbGxQZWVySWRzIiwiaXNOb2RlRXhpc3QiLCJudW0iLCJwdXNoIiwiZmluZE5ld1BlZXIiLCJnZXRLYnVja2V0TnVtIiwiaW54Iiwic3BsaWNlIiwic2hpZnQiLCJ0YXJnZXQiLCJwcm94eSIsInIiLCJyZWYiLCJXZWJSVEMiLCJtYWtlT2ZmZXIiLCJzaWduYWwiLCJzZHAiLCJfIiwic3RvcmUiLCJjb25uZWN0IiwibWFrZUFuc3dlciIsImdldFBlZXJGcm9tbm9kZUlkIiwiU0VORCIsIm1lc3NhZ2UiLCJsYWJlbCIsImRhdGFMaW5rIiwiQnVmZmVyIiwiZnJvbSIsIm5ldHdvcmtMYXllciIsImRlc2VyaWFsaXplIiwiSlNPTiIsInN0cmluZ2lmeSIsImRhdGFMaXN0IiwiaW5jbHVkZXMiLCJvblJlcXVlc3QiLCJlcnJvciIsInJlc3BvbnNlIiwidHlwZSIsIm1haW50YWluIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBRUE7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQVBBQSxPQUFPLENBQUMsZ0JBQUQsQ0FBUDs7QUFTQSxJQUFNQyxJQUFJLEdBQUcsSUFBSUMsVUFBSixFQUFiOztJQUVxQkMsUTs7O0FBMkJuQixvQkFBWUMsT0FBWixFQUE2QkMsR0FBN0IsRUFBeUQ7QUFBQTs7QUFBQTs7QUFBQTs7QUFBQTs7QUFBQTs7QUFBQTs7QUFBQSxzQ0FyQmxDLEVBcUJrQzs7QUFBQSwwQ0FwQmxCLEVBb0JrQjs7QUFBQSxpQ0FuQnhCLEVBbUJ3Qjs7QUFBQSxvQ0FsQmpCLEVBa0JpQjs7QUFBQSxtQ0FqQmpEO0FBQ05DLE1BQUFBLFNBQVMsRUFBRSxLQURMO0FBRU5DLE1BQUFBLE9BQU8sRUFBRSxLQUZIO0FBR05DLE1BQUFBLFFBQVEsRUFBRSxFQUhKO0FBSU5DLE1BQUFBLElBQUksRUFBRTtBQUpBLEtBaUJpRDs7QUFBQSxzQ0FWOUM7QUFDVEMsTUFBQUEsU0FBUyxFQUFFLHFCQUFNLENBQUUsQ0FEVjtBQUVUQyxNQUFBQSxTQUFTLEVBQUUsbUJBQUNDLENBQUQsRUFBYSxDQUFFLENBRmpCO0FBR1RDLE1BQUFBLGdCQUFnQixFQUFFLDBCQUFDRCxDQUFELEVBQWEsQ0FBRSxDQUh4QjtBQUlURSxNQUFBQSxZQUFZLEVBQUUsc0JBQUNGLENBQUQsRUFBYSxDQUFFLENBSnBCO0FBS1RHLE1B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ZXNDb250ZW50IjpbInJlcXVpcmUoXCJiYWJlbC1wb2x5ZmlsbFwiKTtcbmltcG9ydCBXZWJSVEMgZnJvbSBcIndlYnJ0YzRtZVwiO1xuaW1wb3J0IEhlbHBlciBmcm9tIFwiLi9rVXRpbFwiO1xuaW1wb3J0IEtSZXNwb25kZXIgZnJvbSBcIi4va1Jlc3BvbmRlclwiO1xuaW1wb3J0IGRlZiwgeyBuZXR3b3JrRm9ybWF0IH0gZnJvbSBcIi4vS0NvbnN0XCI7XG5pbXBvcnQgeyBkaXN0YW5jZSB9IGZyb20gXCJrYWQtZGlzdGFuY2VcIjtcbmltcG9ydCB7IG1lc3NhZ2UgfSBmcm9tIFwid2VicnRjNG1lL2xpYi9pbnRlcmZhY2VcIjtcbmltcG9ydCB7IEJTT04gfSBmcm9tIFwiYnNvblwiO1xuXG5jb25zdCBic29uID0gbmV3IEJTT04oKTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgS2FkZW1saWEge1xuICBub2RlSWQ6IHN0cmluZztcbiAgazogbnVtYmVyO1xuICBrYnVja2V0czogQXJyYXk8QXJyYXk8V2ViUlRDPj47XG4gIGY6IEhlbHBlcjtcbiAgcmVzcG9uZGVyOiBLUmVzcG9uZGVyO1xuICBkYXRhTGlzdDogQXJyYXk8YW55PiA9IFtdO1xuICBrZXlWYWx1ZUxpc3Q6IHsgW2tleTogc3RyaW5nXTogYW55IH0gPSB7fTtcbiAgcmVmOiB7IFtrZXk6IHN0cmluZ106IFdlYlJUQyB9ID0ge307XG4gIGJ1ZmZlcjogeyBba2V5OiBzdHJpbmddOiBBcnJheTxhbnk+IH0gPSB7fTtcbiAgc3RhdGUgPSB7XG4gICAgaXNDb25uZWN0OiBmYWxzZSxcbiAgICBpc09mZmVyOiBmYWxzZSxcbiAgICBmaW5kTm9kZTogXCJcIixcbiAgICBoYXNoOiB7fVxuICB9O1xuXG4gIGNhbGxiYWNrID0ge1xuICAgIG9uQ29ubmVjdDogKCkgPT4ge30sXG4gICAgb25BZGRQZWVyOiAodj86IGFueSkgPT4ge30sXG4gICAgb25QZWVyRGlzY29ubmVjdDogKHY/OiBhbnkpID0+IHt9LFxuICAgIF9vbkZpbmRWYWx1ZTogKHY/OiBhbnkpID0+IHt9LFxuICAgIG9uRmluZE5vZGU6ICh2PzogYW55KSA9PiB7fSxcbiAgICBvblN0b3JlOiAodj86IGFueSkgPT4ge30sXG4gICAgb25BcHA6ICh2PzogYW55KSA9PiB7fVxuICB9O1xuXG4gIGNvbnN0cnVjdG9yKF9ub2RlSWQ6IHN0cmluZywgb3B0PzogeyBrTGVuZ3RoPzogbnVtYmVyIH0pIHtcbiAgICBjb25zb2xlLmxvZyhcInN0YXJ0IGthZFwiLCBfbm9kZUlkKTtcbiAgICB0aGlzLmsgPSAyMDtcbiAgICBpZiAob3B0KSBpZiAob3B0LmtMZW5ndGgpIHRoaXMuayA9IG9wdC5rTGVuZ3RoO1xuICAgIHRoaXMubm9kZUlkID0gX25vZGVJZDtcblxuICAgIHRoaXMua2J1Y2tldHMgPSBuZXcgQXJyYXkoMTYwKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IDE2MDsgaSsrKSB7XG4gICAgICBsZXQga2J1Y2tldDogQXJyYXk8YW55PiA9IFtdO1xuICAgICAgdGhpcy5rYnVja2V0c1tpXSA9IGtidWNrZXQ7XG4gICAgfVxuXG4gICAgdGhpcy5mID0gbmV3IEhlbHBlcih0aGlzLmssIHRoaXMua2J1Y2tldHMpO1xuICAgIHRoaXMucmVzcG9uZGVyID0gbmV3IEtSZXNwb25kZXIodGhpcyk7XG4gIH1cblxuICBzdG9yZShzZW5kZXI6IHN0cmluZywga2V5OiBzdHJpbmcsIHZhbHVlOiBhbnkpIHtcbiAgICAvL+iHquWIhuOBq+S4gOeVqui/keOBhOODlOOCouOCkuWPluW+l1xuICAgIGNvbnN0IHBlZXIgPSB0aGlzLmYuZ2V0Q2xvc2VFc3RQZWVyKGtleSk7XG4gICAgaWYgKCFwZWVyKSByZXR1cm47XG4gICAgY29uc29sZS5sb2coZGVmLlNUT1JFLCBcIm5leHRcIiwgcGVlci5ub2RlSWQsIFwidGFyZ2V0XCIsIGtleSk7XG4gICAgY29uc3Qgc2VuZERhdGE6IFN0b3JlRm9ybWF0ID0geyBzZW5kZXIsIGtleSwgdmFsdWUgfTtcbiAgICBjb25zdCBuZXR3b3JrID0gbmV0d29ya0Zvcm1hdCh0aGlzLm5vZGVJZCwgZGVmLlNUT1JFLCBzZW5kRGF0YSk7XG4gICAgcGVlci5zZW5kKG5ldHdvcmssIFwia2FkXCIpO1xuICAgIGNvbnNvbGUubG9nKFwic3RvcmUgZG9uZVwiLCB7IG5ldHdvcmsgfSk7XG4gICAgdGhpcy5rZXlWYWx1ZUxpc3Rba2V5XSA9IHZhbHVlO1xuICAgIHRoaXMuY2FsbGJhY2sub25TdG9yZSh0aGlzLmtleVZhbHVlTGlzdCk7XG4gIH1cblxuICBzdG9yZUNodW5rcyhzZW5kZXI6IHN0cmluZywga2V5OiBzdHJpbmcsIGNodW5rczogQXJyYXlCdWZmZXJbXSkge1xuICAgIGNvbnN0IHBlZXIgPSB0aGlzLmYuZ2V0Q2xvc2VFc3RQZWVyKGtleSk7XG4gICAgaWYgKCFwZWVyKSByZXR1cm47XG4gICAgY2h1bmtzLmZvckVhY2goKGNodW5rLCBpKSA9PiB7XG4gICAgICBjb25zdCBzZW5kRGF0YTogU3RvcmVDaHVua3MgPSB7XG4gICAgICAgIHNlbmRlcjogdGhpcy5ub2RlSWQsXG4gICAgICAgIGtleSxcbiAgICAgICAgdmFsdWU6IGNodW5rLFxuICAgICAgICBpbmRleDogaSxcbiAgICAgICAgc2l6ZTogY2h1bmtzLmxlbmd0aFxuICAgICAgfTtcbiAgICAgIGNvbnN0IG5ldHdvcmsgPSBuZXR3b3JrRm9ybWF0KHNlbmRlciwgZGVmLlNUT1JFX0NIVU5LUywgc2VuZERhdGEpO1xuICAgICAgcGVlci5zZW5kKG5ldHdvcmssIFwia2FkXCIpO1xuICAgICAgdGhpcy5rZXlWYWx1ZUxpc3Rba2V5XSA9IGNodW5rcztcbiAgICAgIHRoaXMuY2FsbGJhY2sub25TdG9yZSh0aGlzLmtleVZhbHVlTGlzdCk7XG4gICAgfSk7XG4gIH1cblxuICBmaW5kTm9kZSh0YXJnZXRJZDogc3RyaW5nLCBwZWVyOiBXZWJSVEMpIHtcbiAgICBjb25zb2xlLmxvZyhcImZpbmRub2RlXCIsIHRhcmdldElkKTtcbiAgICB0aGlzLnN0YXRlLmZpbmROb2RlID0gdGFyZ2V0SWQ7XG4gICAgY29uc3Qgc2VuZERhdGEgPSB7IHRhcmdldEtleTogdGFyZ2V0SWQgfTtcbiAgICAvL+mAgeOCi1xuICAgIHBlZXIuc2VuZChuZXR3b3JrRm9ybWF0KHRoaXMubm9kZUlkLCBkZWYuRklORE5PREUsIHNlbmREYXRhKSwgXCJrYWRcIik7XG4gIH1cblxuICBmaW5kVmFsdWUoa2V5OiBzdHJpbmcpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY29uc3QgdGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICByZWplY3QoXCJmaW5kdmFsdWUgdGltZW91dFwiKTtcbiAgICAgIH0sIDEwICogMTAwMCk7XG4gICAgICB0aGlzLmNhbGxiYWNrLl9vbkZpbmRWYWx1ZSA9IHZhbHVlID0+IHtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xuICAgICAgICByZXNvbHZlKHZhbHVlKTtcbiAgICAgIH07XG4gICAgICAvL2tleeOBq+i/keOBhOODlOOCouOCkuWPluW+l1xuICAgICAgY29uc3QgcGVlcnMgPSB0aGlzLmYuZ2V0Q2xvc2VQZWVycyhrZXkpO1xuICAgICAgcGVlcnMuZm9yRWFjaChwZWVyID0+IHtcbiAgICAgICAgdGhpcy5kb0ZpbmR2YWx1ZShrZXksIHBlZXIpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICBhc3luYyBkb0ZpbmR2YWx1ZShrZXk6IHN0cmluZywgcGVlcjogV2ViUlRDKSB7XG4gICAgY29uc29sZS5sb2coXCJkb2ZpbmR2YWx1ZVwiLCBwZWVyLm5vZGVJZCk7XG4gICAgY29uc3Qgc2VuZERhdGE6IEZpbmRWYWx1ZSA9IHsgdGFyZ2V0S2V5OiBrZXkgfTtcbiAgICBwZWVyLnNlbmQobmV0d29ya0Zvcm1hdCh0aGlzLm5vZGVJZCwgZGVmLkZJTkRWQUxVRSwgc2VuZERhdGEpLCBcImthZFwiKTtcbiAgfVxuXG4gIGNvbm5lY3QocGVlcjogV2ViUlRDKSB7XG4gICAgaWYgKCF0aGlzLnN0YXRlLmlzQ29ubmVjdCkge1xuICAgICAgdGhpcy5zdGF0ZS5pc0Nvbm5lY3QgPSB0cnVlO1xuICAgICAgdGhpcy5hZGRrbm9kZShwZWVyKTtcbiAgICAgIHRoaXMuY2FsbGJhY2sub25Db25uZWN0KCk7XG4gICAgfVxuICB9XG5cbiAgYWRka25vZGUocGVlcjogV2ViUlRDKSB7XG4gICAgcGVlci5ldmVudHMuZGF0YVtcImthZGVtbGlhLnRzXCJdID0gcmF3ID0+IHtcbiAgICAgIHRoaXMub25Db21tYW5kKHJhdyk7XG4gICAgfTtcblxuICAgIHBlZXIuZGlzY29ubmVjdCA9ICgpID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKFwia2FkIG5vZGUgZGlzY29ubmVjdGVkXCIpO1xuICAgICAgdGhpcy5mLmNsZWFuRGlzY29uKCk7XG4gICAgICB0aGlzLmNhbGxiYWNrLm9uQWRkUGVlcih0aGlzLmYuZ2V0QWxsUGVlcklkcygpKTtcbiAgICB9O1xuXG4gICAgaWYgKCF0aGlzLmYuaXNOb2RlRXhpc3QocGVlci5ub2RlSWQpKSB7XG4gICAgICAvL+iHquWIhuOBruODjuODvOODiUlE44Go6L+95Yqg44GZ44KL44OO44O844OJSUTjga7ot53pm6JcbiAgICAgIGNvbnN0IG51bSA9IGRpc3RhbmNlKHRoaXMubm9kZUlkLCBwZWVyLm5vZGVJZCk7XG4gICAgICAvL2tidWNrZXRz44Gu6Kmy5b2T44GZ44KL6Led6Zui44Gua2J1Y2tldOOCkuWRvOOBs+WHuuOBmVxuICAgICAgY29uc3Qga2J1Y2tldCA9IHRoaXMua2J1Y2tldHNbbnVtXTtcbiAgICAgIC8v6Kmy5b2T44GZ44KLa2J1Y2tldOOBq+aWsOOBl+OBhOODlOOCouOCkuWKoOOBiOOCi1xuICAgICAga2J1Y2tldC5wdXNoKHBlZXIpO1xuXG4gICAgICBjb25zb2xlLmxvZyhcImFkZGtub2RlIGtidWNrZXRzXCIsIFwicGVlci5ub2RlSWQ6XCIsIHBlZXIubm9kZUlkKTtcbiAgICAgIGNvbnNvbGUubG9nKHRoaXMuZi5nZXRBbGxQZWVySWRzKCkpO1xuXG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgdGhpcy5maW5kTmV3UGVlcihwZWVyKTtcbiAgICAgIH0sIDEwMDApO1xuXG4gICAgICB0aGlzLmNhbGxiYWNrLm9uQWRkUGVlcih0aGlzLmYuZ2V0QWxsUGVlcklkcygpKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGZpbmROZXdQZWVyKHBlZXI6IFdlYlJUQykge1xuICAgIGlmICh0aGlzLmYuZ2V0S2J1Y2tldE51bSgpIDwgdGhpcy5rKSB7XG4gICAgICAvL+iHqui6q+OBruODjuODvOODiUlE44KSa2V544Go44GX44GmRklORF9OT0RFXG4gICAgICB0aGlzLmZpbmROb2RlKHRoaXMubm9kZUlkLCBwZWVyKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5sb2coXCJrYnVja2V0IHJlYWR5XCIsIHRoaXMuZi5nZXRLYnVja2V0TnVtKCkpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgbWFpbnRhaW4obmV0d29yazogYW55KSB7XG4gICAgY29uc3QgaW54ID0gZGlzdGFuY2UodGhpcy5ub2RlSWQsIG5ldHdvcmsubm9kZUlkKTtcbiAgICBjb25zdCBrYnVja2V0ID0gdGhpcy5rYnVja2V0c1tpbnhdO1xuXG4gICAgLy/pgIHkv6HlhYPjgYzoqbLlvZPjgZnjgotrLWJ1Y2tldOOBruS4reOBq+OBguOBo+OBn+WgtOWQiFxuICAgIC8v44Gd44Gu44OO44O844OJ44KSay1idWNrZXTjga7mnKvlsL7jgavnp7vjgZlcbiAgICBrYnVja2V0LmZvckVhY2goKHBlZXIsIGkpID0+IHtcbiAgICAgIGlmIChwZWVyLm5vZGVJZCA9PT0gbmV0d29yay5ub2RlSWQpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJtYWludGFpblwiLCBcIk1vdmVzwqBpdMKgdG/CoHRoZcKgdGFpbMKgb2bCoHRoZcKgbGlzdFwiKTtcbiAgICAgICAga2J1Y2tldC5zcGxpY2UoaSwgMSk7XG4gICAgICAgIGtidWNrZXQucHVzaChwZWVyKTtcbiAgICAgICAgcmV0dXJuIDA7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvL2stYnVja2V044GM44GZ44Gn44Gr5rqA5p2v44Gq5aC05ZCI44CBXG4gICAgLy/jgZ3jga5rLWJ1Y2tldOS4reOBruWFiOmgreOBruODjuODvOODieOBjOOCquODs+ODqeOCpOODs+OBquOCieWFiOmgreOBruODjuODvOODieOCkuaui+OBmVxuICAgIGlmIChrYnVja2V0Lmxlbmd0aCA+IHRoaXMuaykge1xuICAgICAga2J1Y2tldC5zaGlmdCgpO1xuICAgIH1cbiAgfVxuXG4gIG9mZmVyKHRhcmdldDogc3RyaW5nLCBwcm94eSA9IG51bGwpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY29uc3QgciA9IHRoaXMucmVmO1xuICAgICAgY29uc3QgcGVlciA9IChyW3RhcmdldF0gPSBuZXcgV2ViUlRDKCkpO1xuICAgICAgcGVlci5tYWtlT2ZmZXIoKTtcblxuICAgICAgY29uc3QgdGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICByZWplY3QoXCJrYWQgb2ZmZXIgdGltZW91dFwiKTtcbiAgICAgIH0sIDUgKiAxMDAwKTtcblxuICAgICAgcGVlci5zaWduYWwgPSBzZHAgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZyhcImthZCBvZmZlciBzdG9yZVwiLCB0YXJnZXQpO1xuICAgICAgICBjb25zdCBfID0gdGhpcy5mLmdldENsb3NlRXN0UGVlcih0YXJnZXQpO1xuICAgICAgICBpZiAoIV8pIHJldHVybjtcbiAgICAgICAgaWYgKF8ubm9kZUlkICE9PSB0YXJnZXQpXG4gICAgICAgICAgdGhpcy5zdG9yZSh0aGlzLm5vZGVJZCwgdGFyZ2V0LCB7IHNkcCwgcHJveHkgfSk7XG4gICAgICB9O1xuXG4gICAgICBwZWVyLmNvbm5lY3QgPSAoKSA9PiB7XG4gICAgICAgIHBlZXIubm9kZUlkID0gdGFyZ2V0O1xuICAgICAgICBjb25zb2xlLmxvZyhcImthZCBvZmZlciBjb25uZWN0ZWRcIiwgdGFyZ2V0KTtcbiAgICAgICAgdGhpcy5hZGRrbm9kZShwZWVyKTtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xuICAgICAgICByZXNvbHZlKHRydWUpO1xuICAgICAgfTtcbiAgICB9KTtcbiAgfVxuXG4gIGFuc3dlcih0YXJnZXQ6IHN0cmluZywgc2RwOiBzdHJpbmcsIHByb3h5OiBzdHJpbmcpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY29uc3QgciA9IHRoaXMucmVmO1xuICAgICAgY29uc3QgcGVlciA9IChyW3RhcmdldF0gPSBuZXcgV2ViUlRDKCkpO1xuICAgICAgcGVlci5tYWtlQW5zd2VyKHNkcCk7XG4gICAgICBjb25zb2xlLmxvZyhcImthZCBhbnN3ZXJcIiwgdGFyZ2V0KTtcblxuICAgICAgY29uc3QgdGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICByZWplY3QoXCJrYWQgYW5zd2VyIHRpbWVvdXRcIik7XG4gICAgICB9LCA1ICogMTAwMCk7XG5cbiAgICAgIHBlZXIuc2lnbmFsID0gc2RwID0+IHtcbiAgICAgICAgY29uc3QgXyA9IHRoaXMuZi5nZXRQZWVyRnJvbW5vZGVJZChwcm94eSk7XG4gICAgICAgIC8v5p2l44Gf44Or44O844OI44Gr6YCB44KK6L+U44GZXG4gICAgICAgIGNvbnN0IHNlbmREYXRhOiBTdG9yZUZvcm1hdCA9IHtcbiAgICAgICAgICBzZW5kZXI6IHRoaXMubm9kZUlkLFxuICAgICAgICAgIGtleTogdGFyZ2V0LFxuICAgICAgICAgIHZhbHVlOiB7IHNkcCB9XG4gICAgICAgIH07XG4gICAgICAgIGlmIChfKSBfLnNlbmQobmV0d29ya0Zvcm1hdCh0aGlzLm5vZGVJZCwgZGVmLlNUT1JFLCBzZW5kRGF0YSksIFwia2FkXCIpO1xuICAgICAgfTtcblxuICAgICAgcGVlci5jb25uZWN0ID0gKCkgPT4ge1xuICAgICAgICBwZWVyLm5vZGVJZCA9IHRhcmdldDtcbiAgICAgICAgY29uc29sZS5sb2coXCJrYWQgYW5zd2VyIGNvbm5lY3RlZFwiLCB0YXJnZXQpO1xuICAgICAgICB0aGlzLmFkZGtub2RlKHBlZXIpO1xuICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dCk7XG4gICAgICAgIHJlc29sdmUodHJ1ZSk7XG4gICAgICB9O1xuICAgIH0pO1xuICB9XG5cbiAgc2VuZCh0YXJnZXQ6IHN0cmluZywgZGF0YTogYW55KSB7XG4gICAgY29uc3QgXyA9IHRoaXMuZi5nZXRQZWVyRnJvbW5vZGVJZCh0YXJnZXQpO1xuICAgIGlmIChfKSBfLnNlbmQobmV0d29ya0Zvcm1hdCh0aGlzLm5vZGVJZCwgZGVmLlNFTkQsIGRhdGEpLCBcImthZFwiKTtcbiAgfVxuXG4gIHByaXZhdGUgb25Db21tYW5kKG1lc3NhZ2U6IG1lc3NhZ2UpIHtcbiAgICBzd2l0Y2ggKG1lc3NhZ2UubGFiZWwpIHtcbiAgICAgIGNhc2UgXCJrYWRcIjpcbiAgICAgICAgY29uc3QgZGF0YUxpbms6IEJ1ZmZlciA9IEJ1ZmZlci5mcm9tKG1lc3NhZ2UuZGF0YSk7XG4gICAgICAgIGNvbnNvbGUubG9nKHsgZGF0YUxpbmsgfSk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgY29uc29sZS5sb2coXCJvbmNvbW1hbmQga2FkXCIsIHsgbWVzc2FnZSB9LCB7IGRhdGFMaW5rIH0pO1xuICAgICAgICAgIGNvbnN0IG5ldHdvcmtMYXllcjogbmV0d29yayA9IGJzb24uZGVzZXJpYWxpemUoZGF0YUxpbmspO1xuICAgICAgICAgIGlmICghSlNPTi5zdHJpbmdpZnkodGhpcy5kYXRhTGlzdCkuaW5jbHVkZXMobmV0d29ya0xheWVyLmhhc2gpKSB7XG4gICAgICAgICAgICB0aGlzLmRhdGFMaXN0LnB1c2gobmV0d29ya0xheWVyLmhhc2gpO1xuICAgICAgICAgICAgdGhpcy5vblJlcXVlc3QobmV0d29ya0xheWVyKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coZXJyb3IpO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgb25SZXF1ZXN0KG5ldHdvcms6IGFueSkge1xuICAgIHRoaXMucmVzcG9uZGVyLnJlc3BvbnNlKG5ldHdvcmsudHlwZSwgbmV0d29yayk7XG4gICAgdGhpcy5tYWludGFpbihuZXR3b3JrKTtcbiAgfVxufVxuIl19
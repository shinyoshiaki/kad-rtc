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

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

require("babel-polyfill");

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
      isOffer: false,
      findNode: "",
      hash: {}
    });

    _defineProperty(this, "callback", {
      onAddPeer: function onAddPeer(v) {},
      onPeerDisconnect: function onPeerDisconnect(v) {},
      onFindValue: function onFindValue(v) {},
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
    value: function () {
      var _store = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee(sender, key, value) {
        var peer, sendData, network;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                //自分に一番近いピアを取得
                peer = this.f.getCloseEstPeer(key);

                if (peer) {
                  _context.next = 3;
                  break;
                }

                return _context.abrupt("return");

              case 3:
                console.log(_KConst.default.STORE, "next", peer.nodeId, "target", key);
                sendData = {
                  sender: sender,
                  key: key,
                  value: value
                };
                network = (0, _KConst.networkFormat)(this.nodeId, _KConst.default.STORE, sendData);
                peer.send(network, "kad");
                console.log("store done", {
                  network: network
                });
                this.keyValueList[key] = value;

              case 9:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      return function store(_x, _x2, _x3) {
        return _store.apply(this, arguments);
      };
    }()
  }, {
    key: "findNode",
    value: function () {
      var _findNode = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee2(targetId, peer) {
        var sendData;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                console.log("findnode", targetId);
                this.state.findNode = targetId;
                sendData = {
                  targetKey: targetId
                }; //送る

                peer.send((0, _KConst.networkFormat)(this.nodeId, _KConst.default.FINDNODE, sendData), "kad");

              case 4:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      return function findNode(_x4, _x5) {
        return _findNode.apply(this, arguments);
      };
    }()
  }, {
    key: "findValue",
    value: function findValue(key) {
      var _this = this;

      var cb = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function (value) {};
      this.callback.onFindValue = cb; //keyに近いピアを取得

      var peers = this.f.getClosePeers(key);
      peers.forEach(function (peer) {
        _this.doFindvalue(key, peer);
      }); // const peer = this.f.getCloseEstPeer(key);
      // if (!peer) return;
      // this.doFindvalue(key, peer);
    }
  }, {
    key: "doFindvalue",
    value: function () {
      var _doFindvalue = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee3(key, peer) {
        var findvalue;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                console.log("dofindvalue", peer.nodeId);
                findvalue = {
                  targetKey: key
                };
                peer.send((0, _KConst.networkFormat)(this.nodeId, _KConst.default.FINDVALUE, findvalue), "kad");

              case 3:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      return function doFindvalue(_x6, _x7) {
        return _doFindvalue.apply(this, arguments);
      };
    }()
  }, {
    key: "addknode",
    value: function addknode(peer) {
      var _this2 = this;

      peer.events.data["kademlia.ts"] = function (raw) {
        _this2.onCommand(raw);
      };

      peer.disconnect = function () {
        console.log("kad node disconnected");

        _this2.f.cleanDiscon();

        _this2.callback.onAddPeer(_this2.f.getAllPeerIds());
      };

      if (!this.f.isNodeExist(peer.nodeId)) {
        //自分のノードIDと追加するノードIDの距離
        var num = (0, _kadDistance.distance)(this.nodeId, peer.nodeId); //kbucketsの該当する距離のkbucketを呼び出す

        var kbucket = this.kbuckets[num]; //該当するkbucketに新しいピアを加える

        kbucket.push(peer);
        console.log("addknode kbuckets", "peer.nodeId:", peer.nodeId);
        console.log(this.f.getAllPeerIds());
        setTimeout(function () {
          _this2.findNewPeer(peer);
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
    key: "onRequest",
    value: function onRequest(datalink) {
      var network = JSON.parse(datalink);
      this.responder.response(network.type, network);
      this.maintain(network);
    }
  }, {
    key: "maintain",
    value: function () {
      var _maintain = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee4(network) {
        var inx, kbucket;
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
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
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      return function maintain(_x8) {
        return _maintain.apply(this, arguments);
      };
    }()
  }, {
    key: "offer",
    value: function offer(target) {
      var _this3 = this;

      var proxy = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      return new Promise(function (resolve, reject) {
        var r = _this3.ref;
        var peer = r[target] = new _webrtc4me.default();
        peer.makeOffer();
        var timeout = setTimeout(function () {
          reject("kad offer timeout");
        }, 5 * 1000);

        peer.signal = function (sdp) {
          console.log("kad offer store", target);

          var _ = _this3.f.getCloseEstPeer(target);

          if (!_) return;
          if (_.nodeId !== target) _this3.store(_this3.nodeId, target, {
            sdp: sdp,
            proxy: proxy
          });
        };

        peer.connect = function () {
          peer.nodeId = target;
          console.log("kad offer connected", target);

          _this3.addknode(peer);

          clearTimeout(timeout);
          resolve(true);
        };
      });
    }
  }, {
    key: "answer",
    value: function answer(target, sdp, proxy) {
      var _this4 = this;

      return new Promise(function (resolve, reject) {
        var r = _this4.ref;
        var peer = r[target] = new _webrtc4me.default();
        peer.makeAnswer(sdp);
        console.log("kad answer", target);
        var timeout = setTimeout(function () {
          reject("kad answer timeout");
        }, 5 * 1000);

        peer.signal = function (sdp) {
          var _ = _this4.f.getPeerFromnodeId(proxy); //来たルートに送り返す


          var sendData = {
            sender: _this4.nodeId,
            key: target,
            value: {
              sdp: sdp
            }
          };
          if (_) _.send((0, _KConst.networkFormat)(_this4.nodeId, _KConst.default.STORE, sendData), "kad");
        };

        peer.connect = function () {
          peer.nodeId = target;
          console.log("kad answer connected", target);

          _this4.addknode(peer);

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
          var dataLink = message.data;

          try {
            console.log("oncommand kad", {
              message: message
            });
            var networkLayer = JSON.parse(dataLink);

            if (!JSON.stringify(this.dataList).includes(networkLayer.hash)) {
              this.dataList.push(networkLayer.hash);
              this.onRequest(dataLink);
            }
          } catch (error) {
            console.log(error);
          }

          break;

        case "app":
          console.log("kad onapp", message.data);
          this.callback.onApp(JSON.parse(message.data));
          break;

        case "bin":
          try {
            var json = JSON.parse(message.data);

            if (json.type === "start") {
              this.buffer[message.nodeId] = [];
            } else if (json.type === "end") {}
          } catch (error) {
            if (!this.buffer[message.nodeId]) {
              this.buffer[message.nodeId] = [];
            }

            this.buffer[message.nodeId].push(message.data);
          }

          break;
      }
    }
  }]);

  return Kademlia;
}();

exports.default = Kademlia;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9rYWQva2FkZW1saWEudHMiXSwibmFtZXMiOlsicmVxdWlyZSIsIkthZGVtbGlhIiwiX25vZGVJZCIsIm9wdCIsImlzT2ZmZXIiLCJmaW5kTm9kZSIsImhhc2giLCJvbkFkZFBlZXIiLCJ2Iiwib25QZWVyRGlzY29ubmVjdCIsIm9uRmluZFZhbHVlIiwib25GaW5kTm9kZSIsIm9uU3RvcmUiLCJvbkFwcCIsImNvbnNvbGUiLCJsb2ciLCJrIiwia0xlbmd0aCIsIm5vZGVJZCIsImtidWNrZXRzIiwiQXJyYXkiLCJpIiwia2J1Y2tldCIsImYiLCJIZWxwZXIiLCJyZXNwb25kZXIiLCJLUmVzcG9uZGVyIiwic2VuZGVyIiwia2V5IiwidmFsdWUiLCJwZWVyIiwiZ2V0Q2xvc2VFc3RQZWVyIiwiZGVmIiwiU1RPUkUiLCJzZW5kRGF0YSIsIm5ldHdvcmsiLCJzZW5kIiwia2V5VmFsdWVMaXN0IiwidGFyZ2V0SWQiLCJzdGF0ZSIsInRhcmdldEtleSIsIkZJTkROT0RFIiwiY2IiLCJjYWxsYmFjayIsInBlZXJzIiwiZ2V0Q2xvc2VQZWVycyIsImZvckVhY2giLCJkb0ZpbmR2YWx1ZSIsImZpbmR2YWx1ZSIsIkZJTkRWQUxVRSIsImV2ZW50cyIsImRhdGEiLCJyYXciLCJvbkNvbW1hbmQiLCJkaXNjb25uZWN0IiwiY2xlYW5EaXNjb24iLCJnZXRBbGxQZWVySWRzIiwiaXNOb2RlRXhpc3QiLCJudW0iLCJwdXNoIiwic2V0VGltZW91dCIsImZpbmROZXdQZWVyIiwiZ2V0S2J1Y2tldE51bSIsImRhdGFsaW5rIiwiSlNPTiIsInBhcnNlIiwicmVzcG9uc2UiLCJ0eXBlIiwibWFpbnRhaW4iLCJpbngiLCJzcGxpY2UiLCJsZW5ndGgiLCJzaGlmdCIsInRhcmdldCIsInByb3h5IiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZWplY3QiLCJyIiwicmVmIiwiV2ViUlRDIiwibWFrZU9mZmVyIiwidGltZW91dCIsInNpZ25hbCIsInNkcCIsIl8iLCJzdG9yZSIsImNvbm5lY3QiLCJhZGRrbm9kZSIsImNsZWFyVGltZW91dCIsIm1ha2VBbnN3ZXIiLCJnZXRQZWVyRnJvbW5vZGVJZCIsIlNFTkQiLCJtZXNzYWdlIiwibGFiZWwiLCJkYXRhTGluayIsIm5ldHdvcmtMYXllciIsInN0cmluZ2lmeSIsImRhdGFMaXN0IiwiaW5jbHVkZXMiLCJvblJlcXVlc3QiLCJlcnJvciIsImpzb24iLCJidWZmZXIiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBTEFBLE9BQU8sQ0FBQyxnQkFBRCxDQUFQOztJQVFxQkMsUTs7O0FBeUJuQixvQkFBWUMsT0FBWixFQUE2QkMsR0FBN0IsRUFBeUQ7QUFBQTs7QUFBQTs7QUFBQTs7QUFBQTs7QUFBQTs7QUFBQTs7QUFBQSxzQ0FuQmxDLEVBbUJrQzs7QUFBQSwwQ0FsQmxCLEVBa0JrQjs7QUFBQSxpQ0FqQnhCLEVBaUJ3Qjs7QUFBQSxvQ0FoQmpCLEVBZ0JpQjs7QUFBQSxtQ0FmakQ7QUFDTkMsTUFBQUEsT0FBTyxFQUFFLEtBREg7QUFFTkMsTUFBQUEsUUFBUSxFQUFFLEVBRko7QUFHTkMsTUFBQUEsSUFBSSxFQUFFO0FBSEEsS0FlaUQ7O0FBQUEsc0NBVDlDO0FBQ1RDLE1BQUFBLFNBQVMsRUFBRSxtQkFBQ0MsQ0FBRCxFQUFhLENBQUUsQ0FEakI7QUFFVEMsTUFBQUEsZ0JBQWdCLEVBQUUsMEJBQUNELENBQUQsRUFBYSxDQUFFLENBRnhCO0FBR1RFLE1BQUFBLFdBQVcsRUFBRSxxQkFBQ0YsQ0FBRCxFQUFhLENBQUUsQ0FIbkI7QUFJVEcsTUFBQUEsVUFBVSxFQUFFLG9CQUFDSCxDQUFELEVBQWEsQ0FBRSxDQUpsQjtBQUtUSSxNQUFBQSxPQUFPLEVBQUUsaUJBQUNKLENBQUQsRUFBYSxDQUFFLENBTGY7QUFNVEssTUFBQUEsS0FBSyxFQUFFLGVBQUNMLENBQUQsRUFBYSxDQUFFO0FBTmIsS0FTOEM7O0FBQ3ZETSxJQUFBQSxPQUFPLENBQUNDLEdBQVIs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T2tDLEtBQVAsRUFBYztBQUNkLGdCQUFJLENBQUMsS0FBS0UsTUFBTCxDQUFZVixPQUFPLENBQUMzRSxNQUFwQixDQUFMLEVBQWtDO0FBQ2hDLG1CQUFLcUYsTUFBTCxDQUFZVixPQUFPLENBQUMzRSxNQUFwQixJQUE4QixFQUE5QjtBQUNEOztBQUNELGlCQUFLcUYsTUFBTCxDQUFZVixPQUFPLENBQUMzRSxNQUFwQixFQUE0QnlDLElBQTVCLENBQWlDa0MsT0FBTyxDQUFDMUMsSUFBekM7QUFDRDs7QUFDRDtBQS9CSjtBQWlDRCIsInNvdXJjZXNDb250ZW50IjpbInJlcXVpcmUoXCJiYWJlbC1wb2x5ZmlsbFwiKTtcbmltcG9ydCBXZWJSVEMgZnJvbSBcIndlYnJ0YzRtZVwiO1xuaW1wb3J0IEhlbHBlciBmcm9tIFwiLi9rVXRpbFwiO1xuaW1wb3J0IEtSZXNwb25kZXIgZnJvbSBcIi4va1Jlc3BvbmRlclwiO1xuaW1wb3J0IGRlZiwgeyBuZXR3b3JrRm9ybWF0IH0gZnJvbSBcIi4vS0NvbnN0XCI7XG5pbXBvcnQgeyBkaXN0YW5jZSB9IGZyb20gXCJrYWQtZGlzdGFuY2VcIjtcbmltcG9ydCB7IG1lc3NhZ2UgfSBmcm9tIFwid2VicnRjNG1lL2xpYi9pbnRlcmZhY2VcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgS2FkZW1saWEge1xuICBub2RlSWQ6IHN0cmluZztcbiAgazogbnVtYmVyO1xuICBrYnVja2V0czogQXJyYXk8QXJyYXk8V2ViUlRDPj47XG4gIGY6IEhlbHBlcjtcbiAgcmVzcG9uZGVyOiBLUmVzcG9uZGVyO1xuICBkYXRhTGlzdDogQXJyYXk8YW55PiA9IFtdO1xuICBrZXlWYWx1ZUxpc3Q6IHsgW2tleTogc3RyaW5nXTogYW55IH0gPSB7fTtcbiAgcmVmOiB7IFtrZXk6IHN0cmluZ106IFdlYlJUQyB9ID0ge307XG4gIGJ1ZmZlcjogeyBba2V5OiBzdHJpbmddOiBBcnJheTxhbnk+IH0gPSB7fTtcbiAgc3RhdGUgPSB7XG4gICAgaXNPZmZlcjogZmFsc2UsXG4gICAgZmluZE5vZGU6IFwiXCIsXG4gICAgaGFzaDoge31cbiAgfTtcblxuICBjYWxsYmFjayA9IHtcbiAgICBvbkFkZFBlZXI6ICh2PzogYW55KSA9PiB7fSxcbiAgICBvblBlZXJEaXNjb25uZWN0OiAodj86IGFueSkgPT4ge30sXG4gICAgb25GaW5kVmFsdWU6ICh2PzogYW55KSA9PiB7fSxcbiAgICBvbkZpbmROb2RlOiAodj86IGFueSkgPT4ge30sXG4gICAgb25TdG9yZTogKHY/OiBhbnkpID0+IHt9LFxuICAgIG9uQXBwOiAodj86IGFueSkgPT4ge31cbiAgfTtcblxuICBjb25zdHJ1Y3Rvcihfbm9kZUlkOiBzdHJpbmcsIG9wdD86IHsga0xlbmd0aD86IG51bWJlciB9KSB7XG4gICAgY29uc29sZS5sb2coXCJzdGFydCBrYWRcIiwgX25vZGVJZCk7XG4gICAgdGhpcy5rID0gMjA7XG4gICAgaWYgKG9wdCkgaWYgKG9wdC5rTGVuZ3RoKSB0aGlzLmsgPSBvcHQua0xlbmd0aDtcbiAgICB0aGlzLm5vZGVJZCA9IF9ub2RlSWQ7XG5cbiAgICB0aGlzLmtidWNrZXRzID0gbmV3IEFycmF5KDE2MCk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCAxNjA7IGkrKykge1xuICAgICAgbGV0IGtidWNrZXQ6IEFycmF5PGFueT4gPSBbXTtcbiAgICAgIHRoaXMua2J1Y2tldHNbaV0gPSBrYnVja2V0O1xuICAgIH1cblxuICAgIHRoaXMuZiA9IG5ldyBIZWxwZXIodGhpcy5rLCB0aGlzLmtidWNrZXRzKTtcbiAgICB0aGlzLnJlc3BvbmRlciA9IG5ldyBLUmVzcG9uZGVyKHRoaXMpO1xuICB9XG5cbiAgYXN5bmMgc3RvcmUoc2VuZGVyOiBzdHJpbmcsIGtleTogc3RyaW5nLCB2YWx1ZTogYW55KSB7XG4gICAgLy/oh6rliIbjgavkuIDnlarov5HjgYTjg5TjgqLjgpLlj5blvpdcbiAgICBjb25zdCBwZWVyID0gdGhpcy5mLmdldENsb3NlRXN0UGVlcihrZXkpO1xuICAgIGlmICghcGVlcikgcmV0dXJuO1xuICAgIGNvbnNvbGUubG9nKGRlZi5TVE9SRSwgXCJuZXh0XCIsIHBlZXIubm9kZUlkLCBcInRhcmdldFwiLCBrZXkpO1xuICAgIGNvbnN0IHNlbmREYXRhOiBTdG9yZUZvcm1hdCA9IHsgc2VuZGVyLCBrZXksIHZhbHVlIH07XG4gICAgY29uc3QgbmV0d29yayA9IG5ldHdvcmtGb3JtYXQodGhpcy5ub2RlSWQsIGRlZi5TVE9SRSwgc2VuZERhdGEpO1xuICAgIHBlZXIuc2VuZChuZXR3b3JrLCBcImthZFwiKTtcbiAgICBjb25zb2xlLmxvZyhcInN0b3JlIGRvbmVcIiwgeyBuZXR3b3JrIH0pO1xuICAgIHRoaXMua2V5VmFsdWVMaXN0W2tleV0gPSB2YWx1ZTtcbiAgfVxuXG4gIGFzeW5jIGZpbmROb2RlKHRhcmdldElkOiBzdHJpbmcsIHBlZXI6IFdlYlJUQykge1xuICAgIGNvbnNvbGUubG9nKFwiZmluZG5vZGVcIiwgdGFyZ2V0SWQpO1xuICAgIHRoaXMuc3RhdGUuZmluZE5vZGUgPSB0YXJnZXRJZDtcbiAgICBjb25zdCBzZW5kRGF0YSA9IHsgdGFyZ2V0S2V5OiB0YXJnZXRJZCB9O1xuICAgIC8v6YCB44KLXG4gICAgcGVlci5zZW5kKG5ldHdvcmtGb3JtYXQodGhpcy5ub2RlSWQsIGRlZi5GSU5ETk9ERSwgc2VuZERhdGEpLCBcImthZFwiKTtcbiAgfVxuXG4gIGZpbmRWYWx1ZShrZXk6IHN0cmluZywgY2IgPSAodmFsdWU6IGFueSkgPT4ge30pIHtcbiAgICB0aGlzLmNhbGxiYWNrLm9uRmluZFZhbHVlID0gY2I7XG4gICAgLy9rZXnjgavov5HjgYTjg5TjgqLjgpLlj5blvpdcbiAgICBjb25zdCBwZWVycyA9IHRoaXMuZi5nZXRDbG9zZVBlZXJzKGtleSk7XG4gICAgcGVlcnMuZm9yRWFjaChwZWVyID0+IHtcbiAgICAgIHRoaXMuZG9GaW5kdmFsdWUoa2V5LCBwZWVyKTtcbiAgICB9KTtcbiAgICAvLyBjb25zdCBwZWVyID0gdGhpcy5mLmdldENsb3NlRXN0UGVlcihrZXkpO1xuICAgIC8vIGlmICghcGVlcikgcmV0dXJuO1xuICAgIC8vIHRoaXMuZG9GaW5kdmFsdWUoa2V5LCBwZWVyKTtcbiAgfVxuXG4gIGFzeW5jIGRvRmluZHZhbHVlKGtleTogc3RyaW5nLCBwZWVyOiBXZWJSVEMpIHtcbiAgICBjb25zb2xlLmxvZyhcImRvZmluZHZhbHVlXCIsIHBlZXIubm9kZUlkKTtcbiAgICBjb25zdCBmaW5kdmFsdWU6IEZpbmRWYWx1ZSA9IHsgdGFyZ2V0S2V5OiBrZXkgfTtcbiAgICBwZWVyLnNlbmQobmV0d29ya0Zvcm1hdCh0aGlzLm5vZGVJZCwgZGVmLkZJTkRWQUxVRSwgZmluZHZhbHVlKSwgXCJrYWRcIik7XG4gIH1cblxuICBhZGRrbm9kZShwZWVyOiBXZWJSVEMpIHtcbiAgICBwZWVyLmV2ZW50cy5kYXRhW1wia2FkZW1saWEudHNcIl0gPSByYXcgPT4ge1xuICAgICAgdGhpcy5vbkNvbW1hbmQocmF3KTtcbiAgICB9O1xuXG4gICAgcGVlci5kaXNjb25uZWN0ID0gKCkgPT4ge1xuICAgICAgY29uc29sZS5sb2coXCJrYWQgbm9kZSBkaXNjb25uZWN0ZWRcIik7XG4gICAgICB0aGlzLmYuY2xlYW5EaXNjb24oKTtcbiAgICAgIHRoaXMuY2FsbGJhY2sub25BZGRQZWVyKHRoaXMuZi5nZXRBbGxQZWVySWRzKCkpO1xuICAgIH07XG5cbiAgICBpZiAoIXRoaXMuZi5pc05vZGVFeGlzdChwZWVyLm5vZGVJZCkpIHtcbiAgICAgIC8v6Ieq5YiG44Gu44OO44O844OJSUTjgajov73liqDjgZnjgovjg47jg7zjg4lJROOBrui3nembolxuICAgICAgY29uc3QgbnVtID0gZGlzdGFuY2UodGhpcy5ub2RlSWQsIHBlZXIubm9kZUlkKTtcbiAgICAgIC8va2J1Y2tldHPjga7oqbLlvZPjgZnjgovot53pm6Ljga5rYnVja2V044KS5ZG844Gz5Ye644GZXG4gICAgICBjb25zdCBrYnVja2V0ID0gdGhpcy5rYnVja2V0c1tudW1dO1xuICAgICAgLy/oqbLlvZPjgZnjgotrYnVja2V044Gr5paw44GX44GE44OU44Ki44KS5Yqg44GI44KLXG4gICAgICBrYnVja2V0LnB1c2gocGVlcik7XG5cbiAgICAgIGNvbnNvbGUubG9nKFwiYWRka25vZGUga2J1Y2tldHNcIiwgXCJwZWVyLm5vZGVJZDpcIiwgcGVlci5ub2RlSWQpO1xuICAgICAgY29uc29sZS5sb2codGhpcy5mLmdldEFsbFBlZXJJZHMoKSk7XG5cbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICB0aGlzLmZpbmROZXdQZWVyKHBlZXIpO1xuICAgICAgfSwgMTAwMCk7XG5cbiAgICAgIHRoaXMuY2FsbGJhY2sub25BZGRQZWVyKHRoaXMuZi5nZXRBbGxQZWVySWRzKCkpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgZmluZE5ld1BlZXIocGVlcjogV2ViUlRDKSB7XG4gICAgaWYgKHRoaXMuZi5nZXRLYnVja2V0TnVtKCkgPCB0aGlzLmspIHtcbiAgICAgIC8v6Ieq6Lqr44Gu44OO44O844OJSUTjgpJrZXnjgajjgZfjgaZGSU5EX05PREVcbiAgICAgIHRoaXMuZmluZE5vZGUodGhpcy5ub2RlSWQsIHBlZXIpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmxvZyhcImtidWNrZXQgcmVhZHlcIiwgdGhpcy5mLmdldEtidWNrZXROdW0oKSk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBvblJlcXVlc3QoZGF0YWxpbms6IHN0cmluZykge1xuICAgIGNvbnN0IG5ldHdvcmsgPSBKU09OLnBhcnNlKGRhdGFsaW5rKTtcbiAgICB0aGlzLnJlc3BvbmRlci5yZXNwb25zZShuZXR3b3JrLnR5cGUsIG5ldHdvcmspO1xuICAgIHRoaXMubWFpbnRhaW4obmV0d29yayk7XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIG1haW50YWluKG5ldHdvcms6IGFueSkge1xuICAgIGNvbnN0IGlueCA9IGRpc3RhbmNlKHRoaXMubm9kZUlkLCBuZXR3b3JrLm5vZGVJZCk7XG4gICAgY29uc3Qga2J1Y2tldCA9IHRoaXMua2J1Y2tldHNbaW54XTtcblxuICAgIC8v6YCB5L+h5YWD44GM6Kmy5b2T44GZ44KLay1idWNrZXTjga7kuK3jgavjgYLjgaPjgZ/loLTlkIhcbiAgICAvL+OBneOBruODjuODvOODieOCkmstYnVja2V044Gu5pyr5bC+44Gr56e744GZXG4gICAga2J1Y2tldC5mb3JFYWNoKChwZWVyLCBpKSA9PiB7XG4gICAgICBpZiAocGVlci5ub2RlSWQgPT09IG5ldHdvcmsubm9kZUlkKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwibWFpbnRhaW5cIiwgXCJNb3Zlc8KgaXTCoHRvwqB0aGXCoHRhaWzCoG9mwqB0aGXCoGxpc3RcIik7XG4gICAgICAgIGtidWNrZXQuc3BsaWNlKGksIDEpO1xuICAgICAgICBrYnVja2V0LnB1c2gocGVlcik7XG4gICAgICAgIHJldHVybiAwO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy9rLWJ1Y2tldOOBjOOBmeOBp+OBq+a6gOadr+OBquWgtOWQiOOAgVxuICAgIC8v44Gd44Guay1idWNrZXTkuK3jga7lhYjpoK3jga7jg47jg7zjg4njgYzjgqrjg7Pjg6njgqTjg7PjgarjgonlhYjpoK3jga7jg47jg7zjg4njgpLmrovjgZlcbiAgICBpZiAoa2J1Y2tldC5sZW5ndGggPiB0aGlzLmspIHtcbiAgICAgIGtidWNrZXQuc2hpZnQoKTtcbiAgICB9XG4gIH1cblxuICBvZmZlcih0YXJnZXQ6IHN0cmluZywgcHJveHkgPSBudWxsKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGNvbnN0IHIgPSB0aGlzLnJlZjtcbiAgICAgIGNvbnN0IHBlZXIgPSAoclt0YXJnZXRdID0gbmV3IFdlYlJUQygpKTtcbiAgICAgIHBlZXIubWFrZU9mZmVyKCk7XG5cbiAgICAgIGNvbnN0IHRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgcmVqZWN0KFwia2FkIG9mZmVyIHRpbWVvdXRcIik7XG4gICAgICB9LCA1ICogMTAwMCk7XG5cbiAgICAgIHBlZXIuc2lnbmFsID0gc2RwID0+IHtcbiAgICAgICAgY29uc29sZS5sb2coXCJrYWQgb2ZmZXIgc3RvcmVcIiwgdGFyZ2V0KTtcbiAgICAgICAgY29uc3QgXyA9IHRoaXMuZi5nZXRDbG9zZUVzdFBlZXIodGFyZ2V0KTtcbiAgICAgICAgaWYgKCFfKSByZXR1cm47XG4gICAgICAgIGlmIChfLm5vZGVJZCAhPT0gdGFyZ2V0KVxuICAgICAgICAgIHRoaXMuc3RvcmUodGhpcy5ub2RlSWQsIHRhcmdldCwgeyBzZHAsIHByb3h5IH0pO1xuICAgICAgfTtcblxuICAgICAgcGVlci5jb25uZWN0ID0gKCkgPT4ge1xuICAgICAgICBwZWVyLm5vZGVJZCA9IHRhcmdldDtcbiAgICAgICAgY29uc29sZS5sb2coXCJrYWQgb2ZmZXIgY29ubmVjdGVkXCIsIHRhcmdldCk7XG4gICAgICAgIHRoaXMuYWRka25vZGUocGVlcik7XG4gICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KTtcbiAgICAgICAgcmVzb2x2ZSh0cnVlKTtcbiAgICAgIH07XG4gICAgfSk7XG4gIH1cblxuICBhbnN3ZXIodGFyZ2V0OiBzdHJpbmcsIHNkcDogc3RyaW5nLCBwcm94eTogc3RyaW5nKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGNvbnN0IHIgPSB0aGlzLnJlZjtcbiAgICAgIGNvbnN0IHBlZXIgPSAoclt0YXJnZXRdID0gbmV3IFdlYlJUQygpKTtcbiAgICAgIHBlZXIubWFrZUFuc3dlcihzZHApO1xuICAgICAgY29uc29sZS5sb2coXCJrYWQgYW5zd2VyXCIsIHRhcmdldCk7XG5cbiAgICAgIGNvbnN0IHRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgcmVqZWN0KFwia2FkIGFuc3dlciB0aW1lb3V0XCIpO1xuICAgICAgfSwgNSAqIDEwMDApO1xuXG4gICAgICBwZWVyLnNpZ25hbCA9IHNkcCA9PiB7XG4gICAgICAgIGNvbnN0IF8gPSB0aGlzLmYuZ2V0UGVlckZyb21ub2RlSWQocHJveHkpO1xuICAgICAgICAvL+adpeOBn+ODq+ODvOODiOOBq+mAgeOCiui/lOOBmVxuICAgICAgICBjb25zdCBzZW5kRGF0YTogU3RvcmVGb3JtYXQgPSB7XG4gICAgICAgICAgc2VuZGVyOiB0aGlzLm5vZGVJZCxcbiAgICAgICAgICBrZXk6IHRhcmdldCxcbiAgICAgICAgICB2YWx1ZTogeyBzZHAgfVxuICAgICAgICB9O1xuICAgICAgICBpZiAoXykgXy5zZW5kKG5ldHdvcmtGb3JtYXQodGhpcy5ub2RlSWQsIGRlZi5TVE9SRSwgc2VuZERhdGEpLCBcImthZFwiKTtcbiAgICAgIH07XG5cbiAgICAgIHBlZXIuY29ubmVjdCA9ICgpID0+IHtcbiAgICAgICAgcGVlci5ub2RlSWQgPSB0YXJnZXQ7XG4gICAgICAgIGNvbnNvbGUubG9nKFwia2FkIGFuc3dlciBjb25uZWN0ZWRcIiwgdGFyZ2V0KTtcbiAgICAgICAgdGhpcy5hZGRrbm9kZShwZWVyKTtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xuICAgICAgICByZXNvbHZlKHRydWUpO1xuICAgICAgfTtcbiAgICB9KTtcbiAgfVxuXG4gIHNlbmQodGFyZ2V0OiBzdHJpbmcsIGRhdGE6IGFueSkge1xuICAgIGNvbnN0IF8gPSB0aGlzLmYuZ2V0UGVlckZyb21ub2RlSWQodGFyZ2V0KTtcbiAgICBpZiAoXykgXy5zZW5kKG5ldHdvcmtGb3JtYXQodGhpcy5ub2RlSWQsIGRlZi5TRU5ELCBkYXRhKSwgXCJrYWRcIik7XG4gIH1cblxuICBwcml2YXRlIG9uQ29tbWFuZChtZXNzYWdlOiBtZXNzYWdlKSB7XG4gICAgc3dpdGNoIChtZXNzYWdlLmxhYmVsKSB7XG4gICAgICBjYXNlIFwia2FkXCI6XG4gICAgICAgIGNvbnN0IGRhdGFMaW5rID0gbWVzc2FnZS5kYXRhO1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKFwib25jb21tYW5kIGthZFwiLCB7IG1lc3NhZ2UgfSk7XG4gICAgICAgICAgY29uc3QgbmV0d29ya0xheWVyOiBuZXR3b3JrID0gSlNPTi5wYXJzZShkYXRhTGluayk7XG4gICAgICAgICAgaWYgKCFKU09OLnN0cmluZ2lmeSh0aGlzLmRhdGFMaXN0KS5pbmNsdWRlcyhuZXR3b3JrTGF5ZXIuaGFzaCkpIHtcbiAgICAgICAgICAgIHRoaXMuZGF0YUxpc3QucHVzaChuZXR3b3JrTGF5ZXIuaGFzaCk7XG4gICAgICAgICAgICB0aGlzLm9uUmVxdWVzdChkYXRhTGluayk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yKTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgXCJhcHBcIjpcbiAgICAgICAgY29uc29sZS5sb2coXCJrYWQgb25hcHBcIiwgbWVzc2FnZS5kYXRhKTtcbiAgICAgICAgdGhpcy5jYWxsYmFjay5vbkFwcChKU09OLnBhcnNlKG1lc3NhZ2UuZGF0YSkpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgXCJiaW5cIjpcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBjb25zdCBqc29uID0gSlNPTi5wYXJzZShtZXNzYWdlLmRhdGEpO1xuICAgICAgICAgIGlmIChqc29uLnR5cGUgPT09IFwic3RhcnRcIikge1xuICAgICAgICAgICAgdGhpcy5idWZmZXJbbWVzc2FnZS5ub2RlSWRdID0gW107XG4gICAgICAgICAgfSBlbHNlIGlmIChqc29uLnR5cGUgPT09IFwiZW5kXCIpIHtcbiAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgaWYgKCF0aGlzLmJ1ZmZlclttZXNzYWdlLm5vZGVJZF0pIHtcbiAgICAgICAgICAgIHRoaXMuYnVmZmVyW21lc3NhZ2Uubm9kZUlkXSA9IFtdO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLmJ1ZmZlclttZXNzYWdlLm5vZGVJZF0ucHVzaChtZXNzYWdlLmRhdGEpO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxufVxuIl19
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
        var peer, storeFormat;
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
                storeFormat = {
                  sender: sender,
                  key: key,
                  value: value
                };
                peer.send(JSON.stringify(storeFormat), "kad");
                console.log("store done", storeFormat);
                this.keyValueList[key] = value;

              case 8:
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


          var storeFormat = {
            sender: _this4.nodeId,
            key: target,
            value: {
              sdp: sdp
            }
          };
          if (_) _.send(JSON.stringify(storeFormat), "kad");
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9rYWQva2FkZW1saWEudHMiXSwibmFtZXMiOlsicmVxdWlyZSIsIkthZGVtbGlhIiwiX25vZGVJZCIsIm9wdCIsImlzT2ZmZXIiLCJmaW5kTm9kZSIsImhhc2giLCJvbkFkZFBlZXIiLCJ2Iiwib25QZWVyRGlzY29ubmVjdCIsIm9uRmluZFZhbHVlIiwib25GaW5kTm9kZSIsIm9uU3RvcmUiLCJvbkFwcCIsImNvbnNvbGUiLCJsb2ciLCJrIiwia0xlbmd0aCIsIm5vZGVJZCIsImtidWNrZXRzIiwiQXJyYXkiLCJpIiwia2J1Y2tldCIsImYiLCJIZWxwZXIiLCJyZXNwb25kZXIiLCJLUmVzcG9uZGVyIiwic2VuZGVyIiwia2V5IiwidmFsdWUiLCJwZWVyIiwiZ2V0Q2xvc2VFc3RQZWVyIiwiZGVmIiwiU1RPUkUiLCJzdG9yZUZvcm1hdCIsInNlbmQiLCJKU09OIiwic3RyaW5naWZ5Iiwia2V5VmFsdWVMaXN0IiwidGFyZ2V0SWQiLCJzdGF0ZSIsInNlbmREYXRhIiwidGFyZ2V0S2V5IiwiRklORE5PREUiLCJjYiIsImNhbGxiYWNrIiwicGVlcnMiLCJnZXRDbG9zZVBlZXJzIiwiZm9yRWFjaCIsImRvRmluZHZhbHVlIiwiZmluZHZhbHVlIiwiRklORFZBTFVFIiwiZXZlbnRzIiwiZGF0YSIsInJhdyIsIm9uQ29tbWFuZCIsImRpc2Nvbm5lY3QiLCJjbGVhbkRpc2NvbiIsImdldEFsbFBlZXJJZHMiLCJpc05vZGVFeGlzdCIsIm51bSIsInB1c2giLCJzZXRUaW1lb3V0IiwiZmluZE5ld1BlZXIiLCJnZXRLYnVja2V0TnVtIiwiZGF0YWxpbmsiLCJuZXR3b3JrIiwicGFyc2UiLCJyZXNwb25zZSIsInR5cGUiLCJtYWludGFpbiIsImlueCIsInNwbGljZSIsImxlbmd0aCIsInNoaWZ0IiwidGFyZ2V0IiwicHJveHkiLCJQcm9taXNlIiwicmVzb2x2ZSIsInJlamVjdCIsInIiLCJyZWYiLCJXZWJSVEMiLCJtYWtlT2ZmZXIiLCJ0aW1lb3V0Iiwic2lnbmFsIiwic2RwIiwiXyIsInN0b3JlIiwiY29ubmVjdCIsImFkZGtub2RlIiwiY2xlYXJUaW1lb3V0IiwibWFrZUFuc3dlciIsImdldFBlZXJGcm9tbm9kZUlkIiwiU0VORCIsIm1lc3NhZ2UiLCJsYWJlbCIsImRhdGFMaW5rIiwibmV0d29ya0xheWVyIiwiZGF0YUxpc3QiLCJpbmNsdWRlcyIsIm9uUmVxdWVzdCIsImVycm9yIiwianNvbiIsImJ1ZmZlciJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFMQUEsT0FBTyxDQUFDLGdCQUFELENBQVA7O0lBUXFCQyxROzs7QUF5Qm5CLG9CQUFZQyxPQUFaLEVBQTZCQyxHQUE3QixFQUF5RDtBQUFBOztBQUFBOztBQUFBOztBQUFBOztBQUFBOztBQUFBOztBQUFBLHNDQW5CbEMsRUFtQmtDOztBQUFBLDBDQWxCbEIsRUFrQmtCOztBQUFBLGlDQWpCeEIsRUFpQndCOztBQUFBLG9DQWhCakIsRUFnQmlCOztBQUFBLG1DQWZqRDtBQUNOQyxNQUFBQSxPQUFPLEVBQUUsS0FESDtBQUVOQyxNQUFBQSxRQUFRLEVBQUUsRUFGSjtBQUdOQyxNQUFBQSxJQUFJLEVBQUU7QUFIQSxLQWVpRDs7QUFBQSxzQ0FUOUM7QUFDVEMsTUFBQUEsU0FBUyxFQUFFLG1CQUFDQyxDQUFELEVBQWEsQ0FBRSxDQURqQjtBQUVUQyxNQUFBQSxnQkFBZ0IsRUFBRSwwQkFBQ0QsQ0FBRCxFQUFhLENBQUUsQ0FGeEI7QUFHVEUsTUFBQUEsV0FBVyxFQUFFLHFCQUFDRixDQUFELEVBQWEsQ0FBRSxDQUhuQjtBQUlURyxNQUFBQSxVQUFVLEVBQUUsb0JBQUNILENBQUQsRUFBYSxDQUFFLENBSmxCO0FBS1RJLE1BQUFBLE9BQU8sRUFBRSxpQkFBQ0osQ0FBRCxFQUFhLENBQUUsQ0FMZjtBQU1USyxNQUFBQSxLQUFLLEVBQUUsZUFBQ0wsQ0FBRCxFQUFhLENBQUU7QUFOYixLQVM4Qzs7QUFDdkRNLElBQUFBLE9B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QUwsQ0FBWVQsT0FBTyxDQUFDN0UsTUFBcEIsSUFBOEIsRUFBOUI7QUFDRDs7QUFDRCxpQkFBS3NGLE1BQUwsQ0FBWVQsT0FBTyxDQUFDN0UsTUFBcEIsRUFBNEIyQyxJQUE1QixDQUFpQ2tDLE9BQU8sQ0FBQzFDLElBQXpDO0FBQ0Q7O0FBQ0Q7QUEvQko7QUFpQ0QiLCJzb3VyY2VzQ29udGVudCI6WyJyZXF1aXJlKFwiYmFiZWwtcG9seWZpbGxcIik7XG5pbXBvcnQgV2ViUlRDIGZyb20gXCJ3ZWJydGM0bWVcIjtcbmltcG9ydCBIZWxwZXIgZnJvbSBcIi4va1V0aWxcIjtcbmltcG9ydCBLUmVzcG9uZGVyIGZyb20gXCIuL2tSZXNwb25kZXJcIjtcbmltcG9ydCBkZWYsIHsgbmV0d29ya0Zvcm1hdCB9IGZyb20gXCIuL0tDb25zdFwiO1xuaW1wb3J0IHsgZGlzdGFuY2UgfSBmcm9tIFwia2FkLWRpc3RhbmNlXCI7XG5pbXBvcnQgeyBtZXNzYWdlIH0gZnJvbSBcIndlYnJ0YzRtZS9saWIvaW50ZXJmYWNlXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEthZGVtbGlhIHtcbiAgbm9kZUlkOiBzdHJpbmc7XG4gIGs6IG51bWJlcjtcbiAga2J1Y2tldHM6IEFycmF5PEFycmF5PFdlYlJUQz4+O1xuICBmOiBIZWxwZXI7XG4gIHJlc3BvbmRlcjogS1Jlc3BvbmRlcjtcbiAgZGF0YUxpc3Q6IEFycmF5PGFueT4gPSBbXTtcbiAga2V5VmFsdWVMaXN0OiB7IFtrZXk6IHN0cmluZ106IGFueSB9ID0ge307XG4gIHJlZjogeyBba2V5OiBzdHJpbmddOiBXZWJSVEMgfSA9IHt9O1xuICBidWZmZXI6IHsgW2tleTogc3RyaW5nXTogQXJyYXk8YW55PiB9ID0ge307XG4gIHN0YXRlID0ge1xuICAgIGlzT2ZmZXI6IGZhbHNlLFxuICAgIGZpbmROb2RlOiBcIlwiLFxuICAgIGhhc2g6IHt9XG4gIH07XG5cbiAgY2FsbGJhY2sgPSB7XG4gICAgb25BZGRQZWVyOiAodj86IGFueSkgPT4ge30sXG4gICAgb25QZWVyRGlzY29ubmVjdDogKHY/OiBhbnkpID0+IHt9LFxuICAgIG9uRmluZFZhbHVlOiAodj86IGFueSkgPT4ge30sXG4gICAgb25GaW5kTm9kZTogKHY/OiBhbnkpID0+IHt9LFxuICAgIG9uU3RvcmU6ICh2PzogYW55KSA9PiB7fSxcbiAgICBvbkFwcDogKHY/OiBhbnkpID0+IHt9XG4gIH07XG5cbiAgY29uc3RydWN0b3IoX25vZGVJZDogc3RyaW5nLCBvcHQ/OiB7IGtMZW5ndGg/OiBudW1iZXIgfSkge1xuICAgIGNvbnNvbGUubG9nKFwic3RhcnQga2FkXCIsIF9ub2RlSWQpO1xuICAgIHRoaXMuayA9IDIwO1xuICAgIGlmIChvcHQpIGlmIChvcHQua0xlbmd0aCkgdGhpcy5rID0gb3B0LmtMZW5ndGg7XG4gICAgdGhpcy5ub2RlSWQgPSBfbm9kZUlkO1xuXG4gICAgdGhpcy5rYnVja2V0cyA9IG5ldyBBcnJheSgxNjApO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgMTYwOyBpKyspIHtcbiAgICAgIGxldCBrYnVja2V0OiBBcnJheTxhbnk+ID0gW107XG4gICAgICB0aGlzLmtidWNrZXRzW2ldID0ga2J1Y2tldDtcbiAgICB9XG5cbiAgICB0aGlzLmYgPSBuZXcgSGVscGVyKHRoaXMuaywgdGhpcy5rYnVja2V0cyk7XG4gICAgdGhpcy5yZXNwb25kZXIgPSBuZXcgS1Jlc3BvbmRlcih0aGlzKTtcbiAgfVxuXG4gIGFzeW5jIHN0b3JlKHNlbmRlcjogc3RyaW5nLCBrZXk6IHN0cmluZywgdmFsdWU6IGFueSkge1xuICAgIC8v6Ieq5YiG44Gr5LiA55Wq6L+R44GE44OU44Ki44KS5Y+W5b6XXG4gICAgY29uc3QgcGVlciA9IHRoaXMuZi5nZXRDbG9zZUVzdFBlZXIoa2V5KTtcbiAgICBpZiAoIXBlZXIpIHJldHVybjtcbiAgICBjb25zb2xlLmxvZyhkZWYuU1RPUkUsIFwibmV4dFwiLCBwZWVyLm5vZGVJZCwgXCJ0YXJnZXRcIiwga2V5KTtcbiAgICBjb25zdCBzdG9yZUZvcm1hdDogU3RvcmVGb3JtYXQgPSB7IHNlbmRlciwga2V5LCB2YWx1ZSB9O1xuICAgIHBlZXIuc2VuZChKU09OLnN0cmluZ2lmeShzdG9yZUZvcm1hdCksIFwia2FkXCIpO1xuICAgIGNvbnNvbGUubG9nKFwic3RvcmUgZG9uZVwiLCBzdG9yZUZvcm1hdCk7XG4gICAgdGhpcy5rZXlWYWx1ZUxpc3Rba2V5XSA9IHZhbHVlO1xuICB9XG5cbiAgYXN5bmMgZmluZE5vZGUodGFyZ2V0SWQ6IHN0cmluZywgcGVlcjogV2ViUlRDKSB7XG4gICAgY29uc29sZS5sb2coXCJmaW5kbm9kZVwiLCB0YXJnZXRJZCk7XG4gICAgdGhpcy5zdGF0ZS5maW5kTm9kZSA9IHRhcmdldElkO1xuICAgIGNvbnN0IHNlbmREYXRhID0geyB0YXJnZXRLZXk6IHRhcmdldElkIH07XG4gICAgLy/pgIHjgotcbiAgICBwZWVyLnNlbmQobmV0d29ya0Zvcm1hdCh0aGlzLm5vZGVJZCwgZGVmLkZJTkROT0RFLCBzZW5kRGF0YSksIFwia2FkXCIpO1xuICB9XG5cbiAgZmluZFZhbHVlKGtleTogc3RyaW5nLCBjYiA9ICh2YWx1ZTogYW55KSA9PiB7fSkge1xuICAgIHRoaXMuY2FsbGJhY2sub25GaW5kVmFsdWUgPSBjYjtcbiAgICAvL2tleeOBq+i/keOBhOODlOOCouOCkuWPluW+l1xuICAgIGNvbnN0IHBlZXJzID0gdGhpcy5mLmdldENsb3NlUGVlcnMoa2V5KTtcbiAgICBwZWVycy5mb3JFYWNoKHBlZXIgPT4ge1xuICAgICAgdGhpcy5kb0ZpbmR2YWx1ZShrZXksIHBlZXIpO1xuICAgIH0pO1xuICAgIC8vIGNvbnN0IHBlZXIgPSB0aGlzLmYuZ2V0Q2xvc2VFc3RQZWVyKGtleSk7XG4gICAgLy8gaWYgKCFwZWVyKSByZXR1cm47XG4gICAgLy8gdGhpcy5kb0ZpbmR2YWx1ZShrZXksIHBlZXIpO1xuICB9XG5cbiAgYXN5bmMgZG9GaW5kdmFsdWUoa2V5OiBzdHJpbmcsIHBlZXI6IFdlYlJUQykge1xuICAgIGNvbnNvbGUubG9nKFwiZG9maW5kdmFsdWVcIiwgcGVlci5ub2RlSWQpO1xuICAgIGNvbnN0IGZpbmR2YWx1ZTogRmluZFZhbHVlID0geyB0YXJnZXRLZXk6IGtleSB9O1xuICAgIHBlZXIuc2VuZChuZXR3b3JrRm9ybWF0KHRoaXMubm9kZUlkLCBkZWYuRklORFZBTFVFLCBmaW5kdmFsdWUpLCBcImthZFwiKTtcbiAgfVxuXG4gIGFkZGtub2RlKHBlZXI6IFdlYlJUQykge1xuICAgIHBlZXIuZXZlbnRzLmRhdGFbXCJrYWRlbWxpYS50c1wiXSA9IHJhdyA9PiB7XG4gICAgICB0aGlzLm9uQ29tbWFuZChyYXcpO1xuICAgIH07XG5cbiAgICBwZWVyLmRpc2Nvbm5lY3QgPSAoKSA9PiB7XG4gICAgICBjb25zb2xlLmxvZyhcImthZCBub2RlIGRpc2Nvbm5lY3RlZFwiKTtcbiAgICAgIHRoaXMuZi5jbGVhbkRpc2NvbigpO1xuICAgICAgdGhpcy5jYWxsYmFjay5vbkFkZFBlZXIodGhpcy5mLmdldEFsbFBlZXJJZHMoKSk7XG4gICAgfTtcblxuICAgIGlmICghdGhpcy5mLmlzTm9kZUV4aXN0KHBlZXIubm9kZUlkKSkge1xuICAgICAgLy/oh6rliIbjga7jg47jg7zjg4lJROOBqOi/veWKoOOBmeOCi+ODjuODvOODiUlE44Gu6Led6ZuiXG4gICAgICBjb25zdCBudW0gPSBkaXN0YW5jZSh0aGlzLm5vZGVJZCwgcGVlci5ub2RlSWQpO1xuICAgICAgLy9rYnVja2V0c+OBruipsuW9k+OBmeOCi+i3nembouOBrmtidWNrZXTjgpLlkbzjgbPlh7rjgZlcbiAgICAgIGNvbnN0IGtidWNrZXQgPSB0aGlzLmtidWNrZXRzW251bV07XG4gICAgICAvL+ipsuW9k+OBmeOCi2tidWNrZXTjgavmlrDjgZfjgYTjg5TjgqLjgpLliqDjgYjjgotcbiAgICAgIGtidWNrZXQucHVzaChwZWVyKTtcblxuICAgICAgY29uc29sZS5sb2coXCJhZGRrbm9kZSBrYnVja2V0c1wiLCBcInBlZXIubm9kZUlkOlwiLCBwZWVyLm5vZGVJZCk7XG4gICAgICBjb25zb2xlLmxvZyh0aGlzLmYuZ2V0QWxsUGVlcklkcygpKTtcblxuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHRoaXMuZmluZE5ld1BlZXIocGVlcik7XG4gICAgICB9LCAxMDAwKTtcblxuICAgICAgdGhpcy5jYWxsYmFjay5vbkFkZFBlZXIodGhpcy5mLmdldEFsbFBlZXJJZHMoKSk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBmaW5kTmV3UGVlcihwZWVyOiBXZWJSVEMpIHtcbiAgICBpZiAodGhpcy5mLmdldEtidWNrZXROdW0oKSA8IHRoaXMuaykge1xuICAgICAgLy/oh6rouqvjga7jg47jg7zjg4lJROOCkmtleeOBqOOBl+OBpkZJTkRfTk9ERVxuICAgICAgdGhpcy5maW5kTm9kZSh0aGlzLm5vZGVJZCwgcGVlcik7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUubG9nKFwia2J1Y2tldCByZWFkeVwiLCB0aGlzLmYuZ2V0S2J1Y2tldE51bSgpKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIG9uUmVxdWVzdChkYXRhbGluazogc3RyaW5nKSB7XG4gICAgY29uc3QgbmV0d29yayA9IEpTT04ucGFyc2UoZGF0YWxpbmspO1xuICAgIHRoaXMucmVzcG9uZGVyLnJlc3BvbnNlKG5ldHdvcmsudHlwZSwgbmV0d29yayk7XG4gICAgdGhpcy5tYWludGFpbihuZXR3b3JrKTtcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgbWFpbnRhaW4obmV0d29yazogYW55KSB7XG4gICAgY29uc3QgaW54ID0gZGlzdGFuY2UodGhpcy5ub2RlSWQsIG5ldHdvcmsubm9kZUlkKTtcbiAgICBjb25zdCBrYnVja2V0ID0gdGhpcy5rYnVja2V0c1tpbnhdO1xuXG4gICAgLy/pgIHkv6HlhYPjgYzoqbLlvZPjgZnjgotrLWJ1Y2tldOOBruS4reOBq+OBguOBo+OBn+WgtOWQiFxuICAgIC8v44Gd44Gu44OO44O844OJ44KSay1idWNrZXTjga7mnKvlsL7jgavnp7vjgZlcbiAgICBrYnVja2V0LmZvckVhY2goKHBlZXIsIGkpID0+IHtcbiAgICAgIGlmIChwZWVyLm5vZGVJZCA9PT0gbmV0d29yay5ub2RlSWQpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJtYWludGFpblwiLCBcIk1vdmVzwqBpdMKgdG/CoHRoZcKgdGFpbMKgb2bCoHRoZcKgbGlzdFwiKTtcbiAgICAgICAga2J1Y2tldC5zcGxpY2UoaSwgMSk7XG4gICAgICAgIGtidWNrZXQucHVzaChwZWVyKTtcbiAgICAgICAgcmV0dXJuIDA7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvL2stYnVja2V044GM44GZ44Gn44Gr5rqA5p2v44Gq5aC05ZCI44CBXG4gICAgLy/jgZ3jga5rLWJ1Y2tldOS4reOBruWFiOmgreOBruODjuODvOODieOBjOOCquODs+ODqeOCpOODs+OBquOCieWFiOmgreOBruODjuODvOODieOCkuaui+OBmVxuICAgIGlmIChrYnVja2V0Lmxlbmd0aCA+IHRoaXMuaykge1xuICAgICAga2J1Y2tldC5zaGlmdCgpO1xuICAgIH1cbiAgfVxuXG4gIG9mZmVyKHRhcmdldDogc3RyaW5nLCBwcm94eSA9IG51bGwpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY29uc3QgciA9IHRoaXMucmVmO1xuICAgICAgY29uc3QgcGVlciA9IChyW3RhcmdldF0gPSBuZXcgV2ViUlRDKCkpO1xuICAgICAgcGVlci5tYWtlT2ZmZXIoKTtcblxuICAgICAgY29uc3QgdGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICByZWplY3QoXCJrYWQgb2ZmZXIgdGltZW91dFwiKTtcbiAgICAgIH0sIDUgKiAxMDAwKTtcblxuICAgICAgcGVlci5zaWduYWwgPSBzZHAgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZyhcImthZCBvZmZlciBzdG9yZVwiLCB0YXJnZXQpO1xuICAgICAgICBjb25zdCBfID0gdGhpcy5mLmdldENsb3NlRXN0UGVlcih0YXJnZXQpO1xuICAgICAgICBpZiAoIV8pIHJldHVybjtcbiAgICAgICAgaWYgKF8ubm9kZUlkICE9PSB0YXJnZXQpXG4gICAgICAgICAgdGhpcy5zdG9yZSh0aGlzLm5vZGVJZCwgdGFyZ2V0LCB7IHNkcCwgcHJveHkgfSk7XG4gICAgICB9O1xuXG4gICAgICBwZWVyLmNvbm5lY3QgPSAoKSA9PiB7XG4gICAgICAgIHBlZXIubm9kZUlkID0gdGFyZ2V0O1xuICAgICAgICBjb25zb2xlLmxvZyhcImthZCBvZmZlciBjb25uZWN0ZWRcIiwgdGFyZ2V0KTtcbiAgICAgICAgdGhpcy5hZGRrbm9kZShwZWVyKTtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xuICAgICAgICByZXNvbHZlKHRydWUpO1xuICAgICAgfTtcbiAgICB9KTtcbiAgfVxuXG4gIGFuc3dlcih0YXJnZXQ6IHN0cmluZywgc2RwOiBzdHJpbmcsIHByb3h5OiBzdHJpbmcpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY29uc3QgciA9IHRoaXMucmVmO1xuICAgICAgY29uc3QgcGVlciA9IChyW3RhcmdldF0gPSBuZXcgV2ViUlRDKCkpO1xuICAgICAgcGVlci5tYWtlQW5zd2VyKHNkcCk7XG4gICAgICBjb25zb2xlLmxvZyhcImthZCBhbnN3ZXJcIiwgdGFyZ2V0KTtcblxuICAgICAgY29uc3QgdGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICByZWplY3QoXCJrYWQgYW5zd2VyIHRpbWVvdXRcIik7XG4gICAgICB9LCA1ICogMTAwMCk7XG5cbiAgICAgIHBlZXIuc2lnbmFsID0gc2RwID0+IHtcbiAgICAgICAgY29uc3QgXyA9IHRoaXMuZi5nZXRQZWVyRnJvbW5vZGVJZChwcm94eSk7XG4gICAgICAgIC8v5p2l44Gf44Or44O844OI44Gr6YCB44KK6L+U44GZXG4gICAgICAgIGNvbnN0IHN0b3JlRm9ybWF0OiBTdG9yZUZvcm1hdCA9IHtcbiAgICAgICAgICBzZW5kZXI6IHRoaXMubm9kZUlkLFxuICAgICAgICAgIGtleTogdGFyZ2V0LFxuICAgICAgICAgIHZhbHVlOiB7IHNkcCB9XG4gICAgICAgIH07XG4gICAgICAgIGlmIChfKSBfLnNlbmQoSlNPTi5zdHJpbmdpZnkoc3RvcmVGb3JtYXQpLCBcImthZFwiKTtcbiAgICAgIH07XG5cbiAgICAgIHBlZXIuY29ubmVjdCA9ICgpID0+IHtcbiAgICAgICAgcGVlci5ub2RlSWQgPSB0YXJnZXQ7XG4gICAgICAgIGNvbnNvbGUubG9nKFwia2FkIGFuc3dlciBjb25uZWN0ZWRcIiwgdGFyZ2V0KTtcbiAgICAgICAgdGhpcy5hZGRrbm9kZShwZWVyKTtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xuICAgICAgICByZXNvbHZlKHRydWUpO1xuICAgICAgfTtcbiAgICB9KTtcbiAgfVxuXG4gIHNlbmQodGFyZ2V0OiBzdHJpbmcsIGRhdGE6IGFueSkge1xuICAgIGNvbnN0IF8gPSB0aGlzLmYuZ2V0UGVlckZyb21ub2RlSWQodGFyZ2V0KTtcbiAgICBpZiAoXykgXy5zZW5kKG5ldHdvcmtGb3JtYXQodGhpcy5ub2RlSWQsIGRlZi5TRU5ELCBkYXRhKSwgXCJrYWRcIik7XG4gIH1cblxuICBwcml2YXRlIG9uQ29tbWFuZChtZXNzYWdlOiBtZXNzYWdlKSB7XG4gICAgc3dpdGNoIChtZXNzYWdlLmxhYmVsKSB7XG4gICAgICBjYXNlIFwia2FkXCI6XG4gICAgICAgIGNvbnN0IGRhdGFMaW5rID0gbWVzc2FnZS5kYXRhO1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKFwib25jb21tYW5kIGthZFwiLCB7IG1lc3NhZ2UgfSk7XG4gICAgICAgICAgY29uc3QgbmV0d29ya0xheWVyOiBuZXR3b3JrID0gSlNPTi5wYXJzZShkYXRhTGluayk7XG4gICAgICAgICAgaWYgKCFKU09OLnN0cmluZ2lmeSh0aGlzLmRhdGFMaXN0KS5pbmNsdWRlcyhuZXR3b3JrTGF5ZXIuaGFzaCkpIHtcbiAgICAgICAgICAgIHRoaXMuZGF0YUxpc3QucHVzaChuZXR3b3JrTGF5ZXIuaGFzaCk7XG4gICAgICAgICAgICB0aGlzLm9uUmVxdWVzdChkYXRhTGluayk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yKTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgXCJhcHBcIjpcbiAgICAgICAgY29uc29sZS5sb2coXCJrYWQgb25hcHBcIiwgbWVzc2FnZS5kYXRhKTtcbiAgICAgICAgdGhpcy5jYWxsYmFjay5vbkFwcChKU09OLnBhcnNlKG1lc3NhZ2UuZGF0YSkpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgXCJiaW5cIjpcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBjb25zdCBqc29uID0gSlNPTi5wYXJzZShtZXNzYWdlLmRhdGEpO1xuICAgICAgICAgIGlmIChqc29uLnR5cGUgPT09IFwic3RhcnRcIikge1xuICAgICAgICAgICAgdGhpcy5idWZmZXJbbWVzc2FnZS5ub2RlSWRdID0gW107XG4gICAgICAgICAgfSBlbHNlIGlmIChqc29uLnR5cGUgPT09IFwiZW5kXCIpIHtcbiAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgaWYgKCF0aGlzLmJ1ZmZlclttZXNzYWdlLm5vZGVJZF0pIHtcbiAgICAgICAgICAgIHRoaXMuYnVmZmVyW21lc3NhZ2Uubm9kZUlkXSA9IFtdO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLmJ1ZmZlclttZXNzYWdlLm5vZGVJZF0ucHVzaChtZXNzYWdlLmRhdGEpO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxufVxuIl19
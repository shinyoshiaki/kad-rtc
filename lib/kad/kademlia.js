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
      hash: {},
      maintain: false
    });

    _defineProperty(this, "onPing", {});

    _defineProperty(this, "callback", {
      onAddPeer: function onAddPeer(v) {},
      onPeerDisconnect: function onPeerDisconnect(v) {},
      onFindValue: function onFindValue(v) {},
      onFindNode: function onFindNode(v) {},
      onStore: function onStore(v) {},
      _onPing: this.onPing,
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
    key: "ping",
    value: function ping(peer) {
      var _this = this;

      return new Promise(function (resolve, reject) {
        console.log("ping", peer.nodeId); //10秒以内にpingのフラグが立てば成功

        var timeout = setTimeout(function () {
          console.log("ping fail", peer.nodeId);
          peer.isDisconnected = true;

          _this.f.cleanDiscon();

          _this.callback.onPeerDisconnect(_this.kbuckets);

          reject("ping timeout " + peer.nodeId);
        }, 10 * 1000); //ping完了時のコールバック

        _this.callback._onPing[peer.nodeId] = function () {
          console.log("ping success", peer.nodeId);
          clearTimeout(timeout);
          resolve(true);
        }; //自分のノードIDを含める


        var sendData = {
          target: peer.nodeId
        }; //pingを送る

        peer.send((0, _KConst.networkFormat)(_this.nodeId, _KConst.default.PING, sendData), "kad");
      });
    }
  }, {
    key: "storeFormat",
    value: function storeFormat(sender, key, value) {
      var sendData = {
        sender: sender,
        key: key,
        value: value
      };
      return (0, _KConst.networkFormat)(this.nodeId, _KConst.default.STORE, sendData);
    }
  }, {
    key: "store",
    value: function () {
      var _store = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee(sender, key, value) {
        var peer;
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
                peer.send(this.storeFormat(sender, key, value), "kad");
                console.log("store done", this.storeFormat(sender, key, value));

              case 6:
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
        var ping, sendData;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                console.log("findnode"); //接続確認

                ping = this.ping(peer).catch(console.log);

                if (ping) {
                  _context2.next = 4;
                  break;
                }

                return _context2.abrupt("return");

              case 4:
                console.log("findnode", targetId);
                this.state.findNode = targetId;
                sendData = {
                  targetKey: targetId
                }; //送る

                peer.send((0, _KConst.networkFormat)(this.nodeId, _KConst.default.FINDNODE, sendData), "kad");

              case 8:
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
      var cb = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function (value) {};
      this.callback.onFindValue = cb; //keyに近いピアを取得
      // const peers = this.f.getClosePeers(key);
      // peers.forEach(peer => {
      //   this.doFindvalue(key, peer);
      // });

      var peer = this.f.getCloseEstPeer(key);
      if (!peer) return;
      this.doFindvalue(key, peer);
    }
  }, {
    key: "doFindvalue",
    value: function () {
      var _doFindvalue = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee3(key, peer) {
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                console.log("dofindvalue", peer.nodeId);
                peer.send((0, _KConst.networkFormat)(this.nodeId, _KConst.default.FINDVALUE, {
                  targetKey: key
                }), "kad");

              case 2:
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

      peer.data = function (raw) {
        _this2.onCommand(raw);
      };

      peer.disconnect = function () {
        console.log("kad node disconnected");

        _this2.f.cleanDiscon();
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
      if (!this.state.maintain) this.maintain(network);
    }
  }, {
    key: "maintain",
    value: function () {
      var _maintain = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee4(network) {
        var inx, kbucket, result;
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

                if (!(kbucket.length > this.k)) {
                  _context4.next = 11;
                  break;
                }

                this.state.maintain = true;
                console.log("maintain", "bucket fulled", network.nodeId);
                _context4.next = 8;
                return this.ping(kbucket[0]).catch(console.log);

              case 8:
                result = _context4.sent;
                this.state.maintain = false;

                if (!result) {
                  kbucket.splice(0, 1);
                }

              case 11:
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


          if (_) _.send(_this4.storeFormat(_this4.nodeId, target, {
            sdp: sdp
          }), "kad");
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
          var networkLayer = JSON.parse(dataLink);

          if (!JSON.stringify(this.dataList).includes(networkLayer.hash)) {
            this.dataList.push(networkLayer.hash);
            this.f.cleanDiscon();
            this.onRequest(dataLink);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9rYWQva2FkZW1saWEudHMiXSwibmFtZXMiOlsicmVxdWlyZSIsIkthZGVtbGlhIiwiX25vZGVJZCIsIm9wdCIsImlzT2ZmZXIiLCJmaW5kTm9kZSIsImhhc2giLCJtYWludGFpbiIsIm9uQWRkUGVlciIsInYiLCJvblBlZXJEaXNjb25uZWN0Iiwib25GaW5kVmFsdWUiLCJvbkZpbmROb2RlIiwib25TdG9yZSIsIl9vblBpbmciLCJvblBpbmciLCJvbkFwcCIsImNvbnNvbGUiLCJsb2ciLCJrIiwia0xlbmd0aCIsIm5vZGVJZCIsImtidWNrZXRzIiwiQXJyYXkiLCJpIiwia2J1Y2tldCIsImYiLCJIZWxwZXIiLCJyZXNwb25kZXIiLCJLUmVzcG9uZGVyIiwicGVlciIsIlByb21pc2UiLCJyZXNvbHZlIiwicmVqZWN0IiwidGltZW91dCIsInNldFRpbWVvdXQiLCJpc0Rpc2Nvbm5lY3RlZCIsImNsZWFuRGlzY29uIiwiY2FsbGJhY2siLCJjbGVhclRpbWVvdXQiLCJzZW5kRGF0YSIsInRhcmdldCIsInNlbmQiLCJkZWYiLCJQSU5HIiwic2VuZGVyIiwia2V5IiwidmFsdWUiLCJTVE9SRSIsImdldENsb3NlRXN0UGVlciIsInN0b3JlRm9ybWF0IiwidGFyZ2V0SWQiLCJwaW5nIiwiY2F0Y2giLCJzdGF0ZSIsInRhcmdldEtleSIsIkZJTkROT0RFIiwiY2IiLCJkb0ZpbmR2YWx1ZSIsIkZJTkRWQUxVRSIsImRhdGEiLCJyYXciLCJvbkNvbW1hbmQiLCJkaXNjb25uZWN0IiwiaXNOb2RlRXhpc3QiLCJudW0iLCJwdXNoIiwiZ2V0QWxsUGVlcklkcyIsImZpbmROZXdQZWVyIiwiZ2V0S2J1Y2tldE51bSIsImRhdGFsaW5rIiwibmV0d29yayIsIkpTT04iLCJwYXJzZSIsInJlc3BvbnNlIiwidHlwZSIsImlueCIsImZvckVhY2giLCJzcGxpY2UiLCJsZW5ndGgiLCJyZXN1bHQiLCJwcm94eSIsInIiLCJyZWYiLCJXZWJSVEMiLCJtYWtlT2ZmZXIiLCJzaWduYWwiLCJzZHAiLCJfIiwic3RvcmUiLCJjb25uZWN0IiwiYWRka25vZGUiLCJtYWtlQW5zd2VyIiwiZ2V0UGVlckZyb21ub2RlSWQiLCJTRU5EIiwibWVzc2FnZSIsImxhYmVsIiwiZGF0YUxpbmsiLCJuZXR3b3JrTGF5ZXIiLCJzdHJpbmdpZnkiLCJkYXRhTGlzdCIsImluY2x1ZGVzIiwib25SZXF1ZXN0IiwianNvbiIsImJ1ZmZlciIsImVycm9yIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUxBQSxPQUFPLENBQUMsZ0JBQUQsQ0FBUDs7SUFRcUJDLFE7OztBQTZCbkIsb0JBQVlDLE9BQVosRUFBNkJDLEdBQTdCLEVBQXlEO0FBQUE7O0FBQUE7O0FBQUE7O0FBQUE7O0FBQUE7O0FBQUE7O0FBQUEsc0NBdkJsQyxFQXVCa0M7O0FBQUEsMENBdEJsQixFQXNCa0I7O0FBQUEsaUNBckJ4QixFQXFCd0I7O0FBQUEsb0NBcEJqQixFQW9CaUI7O0FBQUEsbUNBbkJqRDtBQUNOQyxNQUFBQSxPQUFPLEVBQUUsS0FESDtBQUVOQyxNQUFBQSxRQUFRLEVBQUUsRUFGSjtBQUdOQyxNQUFBQSxJQUFJLEVBQUUsRUFIQTtBQUlOQyxNQUFBQSxRQUFRLEVBQUU7QUFKSixLQW1CaUQ7O0FBQUEsb0NBWlQsRUFZUzs7QUFBQSxzQ0FWOUM7QUFDVEMsTUFBQUEsU0FBUyxFQUFFLG1CQUFDQyxDQUFELEVBQWEsQ0FBRSxDQURqQjtBQUVUQyxNQUFBQSxnQkFBZ0IsRUFBRSwwQkFBQ0QsQ0FBRCxFQUFhLENBQUUsQ0FGeEI7QUFHVEUsTUFBQUEsV0FBVyxFQUFFLHFCQUFDRixDQUFELEVBQWEsQ0FBRSxDQUhuQjtBQUlURyxNQUFBQSxVQUFVLEVBQUUsb0JBQUNILENBQUQsRUFBYSxDQUFFLENBSmxCO0FBS1RJLE1BQUFBLE9BQU8sRUFBRSxpQkFBQ0osQ0FBRCxFQUFhLENBQUUsQ0FMZjtBQU1USyxNQUFBQSxPQUFPLEVBQUUsS0FB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Y0FBSTtBQUNGLGdCQUFNMkMsSUFBSSxHQUFHL0IsSUFBSSxDQUFDQyxLQUFMLENBQVdzQixPQUFPLENBQUNuQyxJQUFuQixDQUFiOztBQUNBLGdCQUFJMkMsSUFBSSxDQUFDNUIsSUFBTCxLQUFjLE9BQWxCLEVBQTJCO0FBQ3pCLG1CQUFLNkIsTUFBTCxDQUFZVCxPQUFPLENBQUMxRSxNQUFwQixJQUE4QixFQUE5QjtBQUNELGFBRkQsTUFFTyxJQUFJa0YsSUFBSSxDQUFDNUIsSUFBTCxLQUFjLEtBQWxCLEVBQXlCLENBQy9CO0FBQ0YsV0FORCxDQU1FLE9BQU84QixLQUFQLEVBQWM7QUFDZCxnQkFBSSxDQUFDLEtBQUtELE1BQUwsQ0FBWVQsT0FBTyxDQUFDMUUsTUFBcEIsQ0FBTCxFQUFrQztBQUNoQyxtQkFBS21GLE1BQUwsQ0FBWVQsT0FBTyxDQUFDMUUsTUFBcEIsSUFBOEIsRUFBOUI7QUFDRDs7QUFDRCxpQkFBS21GLE1BQUwsQ0FBWVQsT0FBTyxDQUFDMUUsTUFBcEIsRUFBNEI2QyxJQUE1QixDQUFpQzZCLE9BQU8sQ0FBQ25DLElBQXpDO0FBQ0Q7O0FBQ0Q7QUEzQko7QUE2QkQiLCJzb3VyY2VzQ29udGVudCI6WyJyZXF1aXJlKFwiYmFiZWwtcG9seWZpbGxcIik7XG5pbXBvcnQgV2ViUlRDIGZyb20gXCJ3ZWJydGM0bWVcIjtcbmltcG9ydCBIZWxwZXIgZnJvbSBcIi4va1V0aWxcIjtcbmltcG9ydCBLUmVzcG9uZGVyIGZyb20gXCIuL2tSZXNwb25kZXJcIjtcbmltcG9ydCBkZWYsIHsgbmV0d29ya0Zvcm1hdCB9IGZyb20gXCIuL0tDb25zdFwiO1xuaW1wb3J0IHsgZGlzdGFuY2UgfSBmcm9tIFwia2FkLWRpc3RhbmNlXCI7XG5pbXBvcnQgeyBtZXNzYWdlIH0gZnJvbSBcIndlYnJ0YzRtZS9saWIvaW50ZXJmYWNlXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEthZGVtbGlhIHtcbiAgbm9kZUlkOiBzdHJpbmc7XG4gIGs6IG51bWJlcjtcbiAga2J1Y2tldHM6IEFycmF5PEFycmF5PFdlYlJUQz4+O1xuICBmOiBIZWxwZXI7XG4gIHJlc3BvbmRlcjogS1Jlc3BvbmRlcjtcbiAgZGF0YUxpc3Q6IEFycmF5PGFueT4gPSBbXTtcbiAga2V5VmFsdWVMaXN0OiB7IFtrZXk6IHN0cmluZ106IGFueSB9ID0ge307XG4gIHJlZjogeyBba2V5OiBzdHJpbmddOiBXZWJSVEMgfSA9IHt9O1xuICBidWZmZXI6IHsgW2tleTogc3RyaW5nXTogQXJyYXk8YW55PiB9ID0ge307XG4gIHN0YXRlID0ge1xuICAgIGlzT2ZmZXI6IGZhbHNlLFxuICAgIGZpbmROb2RlOiBcIlwiLFxuICAgIGhhc2g6IHt9LFxuICAgIG1haW50YWluOiBmYWxzZVxuICB9O1xuXG4gIHByaXZhdGUgb25QaW5nOiB7IFtrZXk6IHN0cmluZ106ICgpID0+IHZvaWQgfSA9IHt9O1xuXG4gIGNhbGxiYWNrID0ge1xuICAgIG9uQWRkUGVlcjogKHY/OiBhbnkpID0+IHt9LFxuICAgIG9uUGVlckRpc2Nvbm5lY3Q6ICh2PzogYW55KSA9PiB7fSxcbiAgICBvbkZpbmRWYWx1ZTogKHY/OiBhbnkpID0+IHt9LFxuICAgIG9uRmluZE5vZGU6ICh2PzogYW55KSA9PiB7fSxcbiAgICBvblN0b3JlOiAodj86IGFueSkgPT4ge30sXG4gICAgX29uUGluZzogdGhpcy5vblBpbmcsXG4gICAgb25BcHA6ICh2PzogYW55KSA9PiB7fVxuICB9O1xuXG4gIGNvbnN0cnVjdG9yKF9ub2RlSWQ6IHN0cmluZywgb3B0PzogeyBrTGVuZ3RoPzogbnVtYmVyIH0pIHtcbiAgICBjb25zb2xlLmxvZyhcInN0YXJ0IGthZFwiLCBfbm9kZUlkKTtcbiAgICB0aGlzLmsgPSAyMDtcbiAgICBpZiAob3B0KSBpZiAob3B0LmtMZW5ndGgpIHRoaXMuayA9IG9wdC5rTGVuZ3RoO1xuICAgIHRoaXMubm9kZUlkID0gX25vZGVJZDtcblxuICAgIHRoaXMua2J1Y2tldHMgPSBuZXcgQXJyYXkoMTYwKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IDE2MDsgaSsrKSB7XG4gICAgICBsZXQga2J1Y2tldDogQXJyYXk8YW55PiA9IFtdO1xuICAgICAgdGhpcy5rYnVja2V0c1tpXSA9IGtidWNrZXQ7XG4gICAgfVxuXG4gICAgdGhpcy5mID0gbmV3IEhlbHBlcih0aGlzLmssIHRoaXMua2J1Y2tldHMpO1xuICAgIHRoaXMucmVzcG9uZGVyID0gbmV3IEtSZXNwb25kZXIodGhpcyk7XG4gIH1cblxuICBwaW5nKHBlZXI6IFdlYlJUQykge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjb25zb2xlLmxvZyhcInBpbmdcIiwgcGVlci5ub2RlSWQpO1xuXG4gICAgICAvLzEw56eS5Lul5YaF44GrcGluZ+OBruODleODqeOCsOOBjOeri+OBpuOBsOaIkOWKn1xuICAgICAgY29uc3QgdGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZyhcInBpbmcgZmFpbFwiLCBwZWVyLm5vZGVJZCk7XG4gICAgICAgIHBlZXIuaXNEaXNjb25uZWN0ZWQgPSB0cnVlO1xuICAgICAgICB0aGlzLmYuY2xlYW5EaXNjb24oKTtcbiAgICAgICAgdGhpcy5jYWxsYmFjay5vblBlZXJEaXNjb25uZWN0KHRoaXMua2J1Y2tldHMpO1xuICAgICAgICByZWplY3QoXCJwaW5nIHRpbWVvdXQgXCIgKyBwZWVyLm5vZGVJZCk7XG4gICAgICB9LCAxMCAqIDEwMDApO1xuXG4gICAgICAvL3BpbmflrozkuobmmYLjga7jgrPjg7zjg6vjg5Djg4Pjgq9cbiAgICAgIHRoaXMuY2FsbGJhY2suX29uUGluZ1twZWVyLm5vZGVJZF0gPSAoKSA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwicGluZyBzdWNjZXNzXCIsIHBlZXIubm9kZUlkKTtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xuICAgICAgICByZXNvbHZlKHRydWUpO1xuICAgICAgfTtcblxuICAgICAgLy/oh6rliIbjga7jg47jg7zjg4lJROOCkuWQq+OCgeOCi1xuICAgICAgY29uc3Qgc2VuZERhdGEgPSB7IHRhcmdldDogcGVlci5ub2RlSWQgfTtcbiAgICAgIC8vcGluZ+OCkumAgeOCi1xuICAgICAgcGVlci5zZW5kKG5ldHdvcmtGb3JtYXQodGhpcy5ub2RlSWQsIGRlZi5QSU5HLCBzZW5kRGF0YSksIFwia2FkXCIpO1xuICAgIH0pO1xuICB9XG5cbiAgc3RvcmVGb3JtYXQoc2VuZGVyOiBzdHJpbmcsIGtleTogc3RyaW5nLCB2YWx1ZTogYW55KSB7XG4gICAgY29uc3Qgc2VuZERhdGEgPSB7XG4gICAgICBzZW5kZXIsXG4gICAgICBrZXksXG4gICAgICB2YWx1ZVxuICAgIH07XG4gICAgcmV0dXJuIG5ldHdvcmtGb3JtYXQodGhpcy5ub2RlSWQsIGRlZi5TVE9SRSwgc2VuZERhdGEpO1xuICB9XG5cbiAgYXN5bmMgc3RvcmUoc2VuZGVyOiBzdHJpbmcsIGtleTogc3RyaW5nLCB2YWx1ZTogYW55KSB7XG4gICAgLy/oh6rliIbjgavkuIDnlarov5HjgYTjg5TjgqLjgpLlj5blvpdcbiAgICBjb25zdCBwZWVyID0gdGhpcy5mLmdldENsb3NlRXN0UGVlcihrZXkpO1xuICAgIGlmICghcGVlcikgcmV0dXJuO1xuICAgIGNvbnNvbGUubG9nKGRlZi5TVE9SRSwgXCJuZXh0XCIsIHBlZXIubm9kZUlkLCBcInRhcmdldFwiLCBrZXkpO1xuICAgIHBlZXIuc2VuZCh0aGlzLnN0b3JlRm9ybWF0KHNlbmRlciwga2V5LCB2YWx1ZSksIFwia2FkXCIpO1xuICAgIGNvbnNvbGUubG9nKFwic3RvcmUgZG9uZVwiLCB0aGlzLnN0b3JlRm9ybWF0KHNlbmRlciwga2V5LCB2YWx1ZSkpO1xuICB9XG5cbiAgYXN5bmMgZmluZE5vZGUodGFyZ2V0SWQ6IHN0cmluZywgcGVlcjogV2ViUlRDKSB7XG4gICAgY29uc29sZS5sb2coXCJmaW5kbm9kZVwiKTtcbiAgICAvL+aOpee2mueiuuiqjVxuICAgIGNvbnN0IHBpbmcgPSB0aGlzLnBpbmcocGVlcikuY2F0Y2goY29uc29sZS5sb2cpO1xuICAgIGlmICghcGluZykgcmV0dXJuO1xuICAgIGNvbnNvbGUubG9nKFwiZmluZG5vZGVcIiwgdGFyZ2V0SWQpO1xuICAgIHRoaXMuc3RhdGUuZmluZE5vZGUgPSB0YXJnZXRJZDtcbiAgICBjb25zdCBzZW5kRGF0YSA9IHsgdGFyZ2V0S2V5OiB0YXJnZXRJZCB9O1xuICAgIC8v6YCB44KLXG4gICAgcGVlci5zZW5kKG5ldHdvcmtGb3JtYXQodGhpcy5ub2RlSWQsIGRlZi5GSU5ETk9ERSwgc2VuZERhdGEpLCBcImthZFwiKTtcbiAgfVxuXG4gIGZpbmRWYWx1ZShrZXk6IHN0cmluZywgY2IgPSAodmFsdWU6IGFueSkgPT4ge30pIHtcbiAgICB0aGlzLmNhbGxiYWNrLm9uRmluZFZhbHVlID0gY2I7XG4gICAgLy9rZXnjgavov5HjgYTjg5TjgqLjgpLlj5blvpdcbiAgICAvLyBjb25zdCBwZWVycyA9IHRoaXMuZi5nZXRDbG9zZVBlZXJzKGtleSk7XG4gICAgLy8gcGVlcnMuZm9yRWFjaChwZWVyID0+IHtcbiAgICAvLyAgIHRoaXMuZG9GaW5kdmFsdWUoa2V5LCBwZWVyKTtcbiAgICAvLyB9KTtcbiAgICBjb25zdCBwZWVyID0gdGhpcy5mLmdldENsb3NlRXN0UGVlcihrZXkpO1xuICAgIGlmICghcGVlcikgcmV0dXJuO1xuICAgIHRoaXMuZG9GaW5kdmFsdWUoa2V5LCBwZWVyKTtcbiAgfVxuXG4gIGFzeW5jIGRvRmluZHZhbHVlKGtleTogc3RyaW5nLCBwZWVyOiBXZWJSVEMpIHtcbiAgICBjb25zb2xlLmxvZyhcImRvZmluZHZhbHVlXCIsIHBlZXIubm9kZUlkKTtcbiAgICBwZWVyLnNlbmQoXG4gICAgICBuZXR3b3JrRm9ybWF0KHRoaXMubm9kZUlkLCBkZWYuRklORFZBTFVFLCB7XG4gICAgICAgIHRhcmdldEtleToga2V5XG4gICAgICB9KSxcbiAgICAgIFwia2FkXCJcbiAgICApO1xuICB9XG5cbiAgYWRka25vZGUocGVlcjogV2ViUlRDKSB7XG4gICAgcGVlci5kYXRhID0gcmF3ID0+IHtcbiAgICAgIHRoaXMub25Db21tYW5kKHJhdyk7XG4gICAgfTtcblxuICAgIHBlZXIuZGlzY29ubmVjdCA9ICgpID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKFwia2FkIG5vZGUgZGlzY29ubmVjdGVkXCIpO1xuICAgICAgdGhpcy5mLmNsZWFuRGlzY29uKCk7XG4gICAgfTtcblxuICAgIGlmICghdGhpcy5mLmlzTm9kZUV4aXN0KHBlZXIubm9kZUlkKSkge1xuICAgICAgLy/oh6rliIbjga7jg47jg7zjg4lJROOBqOi/veWKoOOBmeOCi+ODjuODvOODiUlE44Gu6Led6ZuiXG4gICAgICBjb25zdCBudW0gPSBkaXN0YW5jZSh0aGlzLm5vZGVJZCwgcGVlci5ub2RlSWQpO1xuICAgICAgLy9rYnVja2V0c+OBruipsuW9k+OBmeOCi+i3nembouOBrmtidWNrZXTjgpLlkbzjgbPlh7rjgZlcbiAgICAgIGNvbnN0IGtidWNrZXQgPSB0aGlzLmtidWNrZXRzW251bV07XG4gICAgICAvL+ipsuW9k+OBmeOCi2tidWNrZXTjgavmlrDjgZfjgYTjg5TjgqLjgpLliqDjgYjjgotcbiAgICAgIGtidWNrZXQucHVzaChwZWVyKTtcblxuICAgICAgY29uc29sZS5sb2coXCJhZGRrbm9kZSBrYnVja2V0c1wiLCBcInBlZXIubm9kZUlkOlwiLCBwZWVyLm5vZGVJZCk7XG4gICAgICBjb25zb2xlLmxvZyh0aGlzLmYuZ2V0QWxsUGVlcklkcygpKTtcblxuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHRoaXMuZmluZE5ld1BlZXIocGVlcik7XG4gICAgICB9LCAxMDAwKTtcblxuICAgICAgdGhpcy5jYWxsYmFjay5vbkFkZFBlZXIodGhpcy5mLmdldEFsbFBlZXJJZHMoKSk7XG4gICAgfVxuICB9XG5cbiAgZmluZE5ld1BlZXIocGVlcjogV2ViUlRDKSB7XG4gICAgaWYgKHRoaXMuZi5nZXRLYnVja2V0TnVtKCkgPCB0aGlzLmspIHtcbiAgICAgIC8v6Ieq6Lqr44Gu44OO44O844OJSUTjgpJrZXnjgajjgZfjgaZGSU5EX05PREVcbiAgICAgIHRoaXMuZmluZE5vZGUodGhpcy5ub2RlSWQsIHBlZXIpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmxvZyhcImtidWNrZXQgcmVhZHlcIiwgdGhpcy5mLmdldEtidWNrZXROdW0oKSk7XG4gICAgfVxuICB9XG5cbiAgb25SZXF1ZXN0KGRhdGFsaW5rOiBzdHJpbmcpIHtcbiAgICBjb25zdCBuZXR3b3JrID0gSlNPTi5wYXJzZShkYXRhbGluayk7XG4gICAgdGhpcy5yZXNwb25kZXIucmVzcG9uc2UobmV0d29yay50eXBlLCBuZXR3b3JrKTtcbiAgICBpZiAoIXRoaXMuc3RhdGUubWFpbnRhaW4pIHRoaXMubWFpbnRhaW4obmV0d29yayk7XG4gIH1cblxuICBhc3luYyBtYWludGFpbihuZXR3b3JrOiBhbnkpIHtcbiAgICBjb25zdCBpbnggPSBkaXN0YW5jZSh0aGlzLm5vZGVJZCwgbmV0d29yay5ub2RlSWQpO1xuICAgIGNvbnN0IGtidWNrZXQgPSB0aGlzLmtidWNrZXRzW2lueF07XG5cbiAgICAvL+mAgeS/oeWFg+OBjOipsuW9k+OBmeOCi2stYnVja2V044Gu5Lit44Gr44GC44Gj44Gf5aC05ZCIXG4gICAgLy/jgZ3jga7jg47jg7zjg4njgpJrLWJ1Y2tldOOBruacq+WwvuOBq+enu+OBmVxuICAgIGtidWNrZXQuZm9yRWFjaCgocGVlciwgaSkgPT4ge1xuICAgICAgaWYgKHBlZXIubm9kZUlkID09PSBuZXR3b3JrLm5vZGVJZCkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIm1haW50YWluXCIsIFwiTW92ZXPCoGl0wqB0b8KgdGhlwqB0YWlswqBvZsKgdGhlwqBsaXN0XCIpO1xuICAgICAgICBrYnVja2V0LnNwbGljZShpLCAxKTtcbiAgICAgICAga2J1Y2tldC5wdXNoKHBlZXIpO1xuICAgICAgICByZXR1cm4gMDtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vay1idWNrZXTjgYzjgZnjgafjgavmuoDmna/jgarloLTlkIjjgIFcbiAgICAvL+OBneOBrmstYnVja2V05Lit44Gu5YWI6aCt44Gu44OO44O844OJ44GM44Kq44Oz44Op44Kk44Oz44Gq44KJ5YWI6aCt44Gu44OO44O844OJ44KS5q6L44GZXG4gICAgaWYgKGtidWNrZXQubGVuZ3RoID4gdGhpcy5rKSB7XG4gICAgICB0aGlzLnN0YXRlLm1haW50YWluID0gdHJ1ZTtcbiAgICAgIGNvbnNvbGUubG9nKFwibWFpbnRhaW5cIiwgXCJidWNrZXQgZnVsbGVkXCIsIG5ldHdvcmsubm9kZUlkKTtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMucGluZyhrYnVja2V0WzBdKS5jYXRjaChjb25zb2xlLmxvZyk7XG4gICAgICB0aGlzLnN0YXRlLm1haW50YWluID0gZmFsc2U7XG4gICAgICBpZiAoIXJlc3VsdCkge1xuICAgICAgICBrYnVja2V0LnNwbGljZSgwLCAxKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBvZmZlcih0YXJnZXQ6IHN0cmluZywgcHJveHkgPSBudWxsKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGNvbnN0IHIgPSB0aGlzLnJlZjtcbiAgICAgIGNvbnN0IHBlZXIgPSAoclt0YXJnZXRdID0gbmV3IFdlYlJUQygpKTtcbiAgICAgIHBlZXIubWFrZU9mZmVyKCk7XG5cbiAgICAgIGNvbnN0IHRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgcmVqZWN0KFwia2FkIG9mZmVyIHRpbWVvdXRcIik7XG4gICAgICB9LCA1ICogMTAwMCk7XG5cbiAgICAgIHBlZXIuc2lnbmFsID0gc2RwID0+IHtcbiAgICAgICAgY29uc29sZS5sb2coXCJrYWQgb2ZmZXIgc3RvcmVcIiwgdGFyZ2V0KTtcbiAgICAgICAgY29uc3QgXyA9IHRoaXMuZi5nZXRDbG9zZUVzdFBlZXIodGFyZ2V0KTtcbiAgICAgICAgaWYgKCFfKSByZXR1cm47XG4gICAgICAgIGlmIChfLm5vZGVJZCAhPT0gdGFyZ2V0KVxuICAgICAgICAgIHRoaXMuc3RvcmUodGhpcy5ub2RlSWQsIHRhcmdldCwgeyBzZHAsIHByb3h5IH0pO1xuICAgICAgfTtcblxuICAgICAgcGVlci5jb25uZWN0ID0gKCkgPT4ge1xuICAgICAgICBwZWVyLm5vZGVJZCA9IHRhcmdldDtcbiAgICAgICAgY29uc29sZS5sb2coXCJrYWQgb2ZmZXIgY29ubmVjdGVkXCIsIHRhcmdldCk7XG4gICAgICAgIHRoaXMuYWRka25vZGUocGVlcik7XG4gICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KTtcbiAgICAgICAgcmVzb2x2ZSh0cnVlKTtcbiAgICAgIH07XG4gICAgfSk7XG4gIH1cblxuICBhbnN3ZXIodGFyZ2V0OiBzdHJpbmcsIHNkcDogc3RyaW5nLCBwcm94eTogc3RyaW5nKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGNvbnN0IHIgPSB0aGlzLnJlZjtcbiAgICAgIGNvbnN0IHBlZXIgPSAoclt0YXJnZXRdID0gbmV3IFdlYlJUQygpKTtcbiAgICAgIHBlZXIubWFrZUFuc3dlcihzZHApO1xuICAgICAgY29uc29sZS5sb2coXCJrYWQgYW5zd2VyXCIsIHRhcmdldCk7XG5cbiAgICAgIGNvbnN0IHRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgcmVqZWN0KFwia2FkIGFuc3dlciB0aW1lb3V0XCIpO1xuICAgICAgfSwgNSAqIDEwMDApO1xuXG4gICAgICBwZWVyLnNpZ25hbCA9IHNkcCA9PiB7XG4gICAgICAgIGNvbnN0IF8gPSB0aGlzLmYuZ2V0UGVlckZyb21ub2RlSWQocHJveHkpO1xuICAgICAgICAvL+adpeOBn+ODq+ODvOODiOOBq+mAgeOCiui/lOOBmVxuICAgICAgICBpZiAoXykgXy5zZW5kKHRoaXMuc3RvcmVGb3JtYXQodGhpcy5ub2RlSWQsIHRhcmdldCwgeyBzZHAgfSksIFwia2FkXCIpO1xuICAgICAgfTtcblxuICAgICAgcGVlci5jb25uZWN0ID0gKCkgPT4ge1xuICAgICAgICBwZWVyLm5vZGVJZCA9IHRhcmdldDtcbiAgICAgICAgY29uc29sZS5sb2coXCJrYWQgYW5zd2VyIGNvbm5lY3RlZFwiLCB0YXJnZXQpO1xuICAgICAgICB0aGlzLmFkZGtub2RlKHBlZXIpO1xuICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dCk7XG4gICAgICAgIHJlc29sdmUodHJ1ZSk7XG4gICAgICB9O1xuICAgIH0pO1xuICB9XG5cbiAgc2VuZCh0YXJnZXQ6IHN0cmluZywgZGF0YTogYW55KSB7XG4gICAgY29uc3QgXyA9IHRoaXMuZi5nZXRQZWVyRnJvbW5vZGVJZCh0YXJnZXQpO1xuICAgIGlmIChfKSBfLnNlbmQobmV0d29ya0Zvcm1hdCh0aGlzLm5vZGVJZCwgZGVmLlNFTkQsIGRhdGEpLCBcImthZFwiKTtcbiAgfVxuXG4gIG9uQ29tbWFuZChtZXNzYWdlOiBtZXNzYWdlKSB7XG4gICAgc3dpdGNoIChtZXNzYWdlLmxhYmVsKSB7XG4gICAgICBjYXNlIFwia2FkXCI6XG4gICAgICAgIGNvbnN0IGRhdGFMaW5rID0gbWVzc2FnZS5kYXRhO1xuICAgICAgICBjb25zdCBuZXR3b3JrTGF5ZXI6IG5ldHdvcmsgPSBKU09OLnBhcnNlKGRhdGFMaW5rKTtcbiAgICAgICAgaWYgKCFKU09OLnN0cmluZ2lmeSh0aGlzLmRhdGFMaXN0KS5pbmNsdWRlcyhuZXR3b3JrTGF5ZXIuaGFzaCkpIHtcbiAgICAgICAgICB0aGlzLmRhdGFMaXN0LnB1c2gobmV0d29ya0xheWVyLmhhc2gpO1xuICAgICAgICAgIHRoaXMuZi5jbGVhbkRpc2NvbigpO1xuICAgICAgICAgIHRoaXMub25SZXF1ZXN0KGRhdGFMaW5rKTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgXCJhcHBcIjpcbiAgICAgICAgY29uc29sZS5sb2coXCJrYWQgb25hcHBcIiwgbWVzc2FnZS5kYXRhKTtcbiAgICAgICAgdGhpcy5jYWxsYmFjay5vbkFwcChKU09OLnBhcnNlKG1lc3NhZ2UuZGF0YSkpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgXCJiaW5cIjpcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBjb25zdCBqc29uID0gSlNPTi5wYXJzZShtZXNzYWdlLmRhdGEpO1xuICAgICAgICAgIGlmIChqc29uLnR5cGUgPT09IFwic3RhcnRcIikge1xuICAgICAgICAgICAgdGhpcy5idWZmZXJbbWVzc2FnZS5ub2RlSWRdID0gW107XG4gICAgICAgICAgfSBlbHNlIGlmIChqc29uLnR5cGUgPT09IFwiZW5kXCIpIHtcbiAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgaWYgKCF0aGlzLmJ1ZmZlclttZXNzYWdlLm5vZGVJZF0pIHtcbiAgICAgICAgICAgIHRoaXMuYnVmZmVyW21lc3NhZ2Uubm9kZUlkXSA9IFtdO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLmJ1ZmZlclttZXNzYWdlLm5vZGVJZF0ucHVzaChtZXNzYWdlLmRhdGEpO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxufVxuIl19
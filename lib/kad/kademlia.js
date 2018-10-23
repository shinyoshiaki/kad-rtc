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
      this.maintain(network);
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
                  _context4.next = 9;
                  break;
                }

                console.log("maintain", "bucket fulled", network.nodeId);
                _context4.next = 7;
                return this.ping(kbucket[0]).catch(console.log);

              case 7:
                result = _context4.sent;

                if (!result) {
                  kbucket.splice(0, 1);
                }

              case 9:
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
        }, 10 * 1000);

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
        }, 10 * 1000);

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9rYWQva2FkZW1saWEudHMiXSwibmFtZXMiOlsicmVxdWlyZSIsIkthZGVtbGlhIiwiX25vZGVJZCIsIm9wdCIsImlzT2ZmZXIiLCJmaW5kTm9kZSIsImhhc2giLCJvbkFkZFBlZXIiLCJ2Iiwib25QZWVyRGlzY29ubmVjdCIsIm9uRmluZFZhbHVlIiwib25GaW5kTm9kZSIsIm9uU3RvcmUiLCJfb25QaW5nIiwib25QaW5nIiwib25BcHAiLCJjb25zb2xlIiwibG9nIiwiayIsImtMZW5ndGgiLCJub2RlSWQiLCJrYnVja2V0cyIsIkFycmF5IiwiaSIsImtidWNrZXQiLCJmIiwiSGVscGVyIiwicmVzcG9uZGVyIiwiS1Jlc3BvbmRlciIsInBlZXIiLCJQcm9taXNlIiwicmVzb2x2ZSIsInJlamVjdCIsInRpbWVvdXQiLCJzZXRUaW1lb3V0IiwiaXNEaXNjb25uZWN0ZWQiLCJjbGVhbkRpc2NvbiIsImNhbGxiYWNrIiwiY2xlYXJUaW1lb3V0Iiwic2VuZERhdGEiLCJ0YXJnZXQiLCJzZW5kIiwiZGVmIiwiUElORyIsInNlbmRlciIsImtleSIsInZhbHVlIiwiU1RPUkUiLCJnZXRDbG9zZUVzdFBlZXIiLCJzdG9yZUZvcm1hdCIsInRhcmdldElkIiwicGluZyIsImNhdGNoIiwic3RhdGUiLCJ0YXJnZXRLZXkiLCJGSU5ETk9ERSIsImNiIiwiZG9GaW5kdmFsdWUiLCJGSU5EVkFMVUUiLCJkYXRhIiwicmF3Iiwib25Db21tYW5kIiwiZGlzY29ubmVjdCIsImlzTm9kZUV4aXN0IiwibnVtIiwicHVzaCIsImdldEFsbFBlZXJJZHMiLCJmaW5kTmV3UGVlciIsImdldEtidWNrZXROdW0iLCJkYXRhbGluayIsIm5ldHdvcmsiLCJKU09OIiwicGFyc2UiLCJyZXNwb25zZSIsInR5cGUiLCJtYWludGFpbiIsImlueCIsImZvckVhY2giLCJzcGxpY2UiLCJsZW5ndGgiLCJyZXN1bHQiLCJwcm94eSIsInIiLCJyZWYiLCJXZWJSVEMiLCJtYWtlT2ZmZXIiLCJzaWduYWwiLCJzZHAiLCJfIiwic3RvcmUiLCJjb25uZWN0IiwiYWRka25vZGUiLCJtYWtlQW5zd2VyIiwiZ2V0UGVlckZyb21ub2RlSWQiLCJTRU5EIiwibWVzc2FnZSIsImxhYmVsIiwiZGF0YUxpbmsiLCJuZXR3b3JrTGF5ZXIiLCJzdHJpbmdpZnkiLCJkYXRhTGlzdCIsImluY2x1ZGVzIiwib25SZXF1ZXN0IiwianNvbiIsImJ1ZmZlciIsImVycm9yIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUxBQSxPQUFPLENBQUMsZ0JBQUQsQ0FBUDs7SUFRcUJDLFE7OztBQTRCbkIsb0JBQVlDLE9BQVosRUFBNkJDLEdBQTdCLEVBQXlEO0FBQUE7O0FBQUE7O0FBQUE7O0FBQUE7O0FBQUE7O0FBQUE7O0FBQUEsc0NBdEJsQyxFQXNCa0M7O0FBQUEsMENBckJsQixFQXFCa0I7O0FBQUEsaUNBcEJ4QixFQW9Cd0I7O0FBQUEsb0NBbkJqQixFQW1CaUI7O0FBQUEsbUNBbEJqRDtBQUNOQyxNQUFBQSxPQUFPLEVBQUUsS0FESDtBQUVOQyxNQUFBQSxRQUFRLEVBQUUsRUFGSjtBQUdOQyxNQUFBQSxJQUFJLEVBQUU7QUFIQSxLQWtCaUQ7O0FBQUEsb0NBWlQsRUFZUzs7QUFBQSxzQ0FWOUM7QUFDVEMsTUFBQUEsU0FBUyxFQUFFLG1CQUFDQyxDQUFELEVBQWEsQ0FBRSxDQURqQjtBQUVUQyxNQUFBQSxnQkFBZ0IsRUFBRSwwQkFBQ0QsQ0FBRCxFQUFhLENBQUUsQ0FGeEI7QUFHVEUsTUFBQUEsV0FBVyxFQUFFLHFCQUFDRixDQUFELEVBQWEsQ0FBRSxDQUhuQjtBQUlURyxNQUFBQSxVQUFVLEVBQUUsb0JBQUNILENBQUQsRUFBYSxDQUFFLENBSmxCO0FBS1RJLE1BQUFBLE9BQU8sRUFBRSxpQkFBQ0osQ0FBRCxFQUFhLENBQUUsQ0FMZjtBQU1USyxNQUFBQSxPQUFPLEVBQUUsS0FBS0MsTUFOTDtBQU9UQyxNQUFBQSxLQUFLLEVB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RSxNQUFwQixJQUE4QixFQUE5QjtBQUNELGFBRkQsTUFFTyxJQUFJbUYsSUFBSSxDQUFDN0IsSUFBTCxLQUFjLEtBQWxCLEVBQXlCLENBQy9CO0FBQ0YsV0FORCxDQU1FLE9BQU8rQixLQUFQLEVBQWM7QUFDZCxnQkFBSSxDQUFDLEtBQUtELE1BQUwsQ0FBWVQsT0FBTyxDQUFDM0UsTUFBcEIsQ0FBTCxFQUFrQztBQUNoQyxtQkFBS29GLE1BQUwsQ0FBWVQsT0FBTyxDQUFDM0UsTUFBcEIsSUFBOEIsRUFBOUI7QUFDRDs7QUFDRCxpQkFBS29GLE1BQUwsQ0FBWVQsT0FBTyxDQUFDM0UsTUFBcEIsRUFBNEI2QyxJQUE1QixDQUFpQzhCLE9BQU8sQ0FBQ3BDLElBQXpDO0FBQ0Q7O0FBQ0Q7QUEzQko7QUE2QkQiLCJzb3VyY2VzQ29udGVudCI6WyJyZXF1aXJlKFwiYmFiZWwtcG9seWZpbGxcIik7XG5pbXBvcnQgV2ViUlRDIGZyb20gXCJ3ZWJydGM0bWVcIjtcbmltcG9ydCBIZWxwZXIgZnJvbSBcIi4va1V0aWxcIjtcbmltcG9ydCBLUmVzcG9uZGVyIGZyb20gXCIuL2tSZXNwb25kZXJcIjtcbmltcG9ydCBkZWYsIHsgbmV0d29ya0Zvcm1hdCB9IGZyb20gXCIuL0tDb25zdFwiO1xuaW1wb3J0IHsgZGlzdGFuY2UgfSBmcm9tIFwia2FkLWRpc3RhbmNlXCI7XG5pbXBvcnQgeyBtZXNzYWdlIH0gZnJvbSBcIndlYnJ0YzRtZS9saWIvaW50ZXJmYWNlXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEthZGVtbGlhIHtcbiAgbm9kZUlkOiBzdHJpbmc7XG4gIGs6IG51bWJlcjtcbiAga2J1Y2tldHM6IEFycmF5PEFycmF5PFdlYlJUQz4+O1xuICBmOiBIZWxwZXI7XG4gIHJlc3BvbmRlcjogS1Jlc3BvbmRlcjtcbiAgZGF0YUxpc3Q6IEFycmF5PGFueT4gPSBbXTtcbiAga2V5VmFsdWVMaXN0OiB7IFtrZXk6IHN0cmluZ106IGFueSB9ID0ge307XG4gIHJlZjogeyBba2V5OiBzdHJpbmddOiBXZWJSVEMgfSA9IHt9O1xuICBidWZmZXI6IHsgW2tleTogc3RyaW5nXTogQXJyYXk8YW55PiB9ID0ge307XG4gIHN0YXRlID0ge1xuICAgIGlzT2ZmZXI6IGZhbHNlLFxuICAgIGZpbmROb2RlOiBcIlwiLFxuICAgIGhhc2g6IHt9XG4gIH07XG5cbiAgcHJpdmF0ZSBvblBpbmc6IHsgW2tleTogc3RyaW5nXTogKCkgPT4gdm9pZCB9ID0ge307XG5cbiAgY2FsbGJhY2sgPSB7XG4gICAgb25BZGRQZWVyOiAodj86IGFueSkgPT4ge30sXG4gICAgb25QZWVyRGlzY29ubmVjdDogKHY/OiBhbnkpID0+IHt9LFxuICAgIG9uRmluZFZhbHVlOiAodj86IGFueSkgPT4ge30sXG4gICAgb25GaW5kTm9kZTogKHY/OiBhbnkpID0+IHt9LFxuICAgIG9uU3RvcmU6ICh2PzogYW55KSA9PiB7fSxcbiAgICBfb25QaW5nOiB0aGlzLm9uUGluZyxcbiAgICBvbkFwcDogKHY/OiBhbnkpID0+IHt9XG4gIH07XG5cbiAgY29uc3RydWN0b3IoX25vZGVJZDogc3RyaW5nLCBvcHQ/OiB7IGtMZW5ndGg/OiBudW1iZXIgfSkge1xuICAgIGNvbnNvbGUubG9nKFwic3RhcnQga2FkXCIsIF9ub2RlSWQpO1xuICAgIHRoaXMuayA9IDIwO1xuICAgIGlmIChvcHQpIGlmIChvcHQua0xlbmd0aCkgdGhpcy5rID0gb3B0LmtMZW5ndGg7XG4gICAgdGhpcy5ub2RlSWQgPSBfbm9kZUlkO1xuXG4gICAgdGhpcy5rYnVja2V0cyA9IG5ldyBBcnJheSgxNjApO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgMTYwOyBpKyspIHtcbiAgICAgIGxldCBrYnVja2V0OiBBcnJheTxhbnk+ID0gW107XG4gICAgICB0aGlzLmtidWNrZXRzW2ldID0ga2J1Y2tldDtcbiAgICB9XG5cbiAgICB0aGlzLmYgPSBuZXcgSGVscGVyKHRoaXMuaywgdGhpcy5rYnVja2V0cyk7XG4gICAgdGhpcy5yZXNwb25kZXIgPSBuZXcgS1Jlc3BvbmRlcih0aGlzKTtcbiAgfVxuXG4gIHBpbmcocGVlcjogV2ViUlRDKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKFwicGluZ1wiLCBwZWVyLm5vZGVJZCk7XG5cbiAgICAgIC8vMTDnp5Lku6XlhoXjgatwaW5n44Gu44OV44Op44Kw44GM56uL44Gm44Gw5oiQ5YqfXG4gICAgICBjb25zdCB0aW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwicGluZyBmYWlsXCIsIHBlZXIubm9kZUlkKTtcbiAgICAgICAgcGVlci5pc0Rpc2Nvbm5lY3RlZCA9IHRydWU7XG4gICAgICAgIHRoaXMuZi5jbGVhbkRpc2NvbigpO1xuICAgICAgICB0aGlzLmNhbGxiYWNrLm9uUGVlckRpc2Nvbm5lY3QodGhpcy5rYnVja2V0cyk7XG4gICAgICAgIHJlamVjdChcInBpbmcgdGltZW91dCBcIiArIHBlZXIubm9kZUlkKTtcbiAgICAgIH0sIDEwICogMTAwMCk7XG5cbiAgICAgIC8vcGluZ+WujOS6huaZguOBruOCs+ODvOODq+ODkOODg+OCr1xuICAgICAgdGhpcy5jYWxsYmFjay5fb25QaW5nW3BlZXIubm9kZUlkXSA9ICgpID0+IHtcbiAgICAgICAgY29uc29sZS5sb2coXCJwaW5nIHN1Y2Nlc3NcIiwgcGVlci5ub2RlSWQpO1xuICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dCk7XG4gICAgICAgIHJlc29sdmUodHJ1ZSk7XG4gICAgICB9O1xuXG4gICAgICAvL+iHquWIhuOBruODjuODvOODiUlE44KS5ZCr44KB44KLXG4gICAgICBjb25zdCBzZW5kRGF0YSA9IHsgdGFyZ2V0OiBwZWVyLm5vZGVJZCB9O1xuICAgICAgLy9waW5n44KS6YCB44KLXG4gICAgICBwZWVyLnNlbmQobmV0d29ya0Zvcm1hdCh0aGlzLm5vZGVJZCwgZGVmLlBJTkcsIHNlbmREYXRhKSwgXCJrYWRcIik7XG4gICAgfSk7XG4gIH1cblxuICBzdG9yZUZvcm1hdChzZW5kZXI6IHN0cmluZywga2V5OiBzdHJpbmcsIHZhbHVlOiBhbnkpIHtcbiAgICBjb25zdCBzZW5kRGF0YSA9IHtcbiAgICAgIHNlbmRlcixcbiAgICAgIGtleSxcbiAgICAgIHZhbHVlXG4gICAgfTtcbiAgICByZXR1cm4gbmV0d29ya0Zvcm1hdCh0aGlzLm5vZGVJZCwgZGVmLlNUT1JFLCBzZW5kRGF0YSk7XG4gIH1cblxuICBhc3luYyBzdG9yZShzZW5kZXI6IHN0cmluZywga2V5OiBzdHJpbmcsIHZhbHVlOiBhbnkpIHtcbiAgICAvL+iHquWIhuOBq+S4gOeVqui/keOBhOODlOOCouOCkuWPluW+l1xuICAgIGNvbnN0IHBlZXIgPSB0aGlzLmYuZ2V0Q2xvc2VFc3RQZWVyKGtleSk7XG4gICAgaWYgKCFwZWVyKSByZXR1cm47XG4gICAgY29uc29sZS5sb2coZGVmLlNUT1JFLCBcIm5leHRcIiwgcGVlci5ub2RlSWQsIFwidGFyZ2V0XCIsIGtleSk7XG4gICAgcGVlci5zZW5kKHRoaXMuc3RvcmVGb3JtYXQoc2VuZGVyLCBrZXksIHZhbHVlKSwgXCJrYWRcIik7XG4gICAgY29uc29sZS5sb2coXCJzdG9yZSBkb25lXCIsIHRoaXMuc3RvcmVGb3JtYXQoc2VuZGVyLCBrZXksIHZhbHVlKSk7XG4gIH1cblxuICBhc3luYyBmaW5kTm9kZSh0YXJnZXRJZDogc3RyaW5nLCBwZWVyOiBXZWJSVEMpIHtcbiAgICBjb25zb2xlLmxvZyhcImZpbmRub2RlXCIpO1xuICAgIC8v5o6l57aa56K66KqNXG4gICAgY29uc3QgcGluZyA9IHRoaXMucGluZyhwZWVyKS5jYXRjaChjb25zb2xlLmxvZyk7XG4gICAgaWYgKCFwaW5nKSByZXR1cm47XG4gICAgY29uc29sZS5sb2coXCJmaW5kbm9kZVwiLCB0YXJnZXRJZCk7XG4gICAgdGhpcy5zdGF0ZS5maW5kTm9kZSA9IHRhcmdldElkO1xuICAgIGNvbnN0IHNlbmREYXRhID0geyB0YXJnZXRLZXk6IHRhcmdldElkIH07XG4gICAgLy/pgIHjgotcbiAgICBwZWVyLnNlbmQobmV0d29ya0Zvcm1hdCh0aGlzLm5vZGVJZCwgZGVmLkZJTkROT0RFLCBzZW5kRGF0YSksIFwia2FkXCIpO1xuICB9XG5cbiAgZmluZFZhbHVlKGtleTogc3RyaW5nLCBjYiA9ICh2YWx1ZTogYW55KSA9PiB7fSkge1xuICAgIHRoaXMuY2FsbGJhY2sub25GaW5kVmFsdWUgPSBjYjtcbiAgICAvL2tleeOBq+i/keOBhOODlOOCouOCkuWPluW+l1xuICAgIC8vIGNvbnN0IHBlZXJzID0gdGhpcy5mLmdldENsb3NlUGVlcnMoa2V5KTtcbiAgICAvLyBwZWVycy5mb3JFYWNoKHBlZXIgPT4ge1xuICAgIC8vICAgdGhpcy5kb0ZpbmR2YWx1ZShrZXksIHBlZXIpO1xuICAgIC8vIH0pO1xuICAgIGNvbnN0IHBlZXIgPSB0aGlzLmYuZ2V0Q2xvc2VFc3RQZWVyKGtleSk7XG4gICAgaWYgKCFwZWVyKSByZXR1cm47XG4gICAgdGhpcy5kb0ZpbmR2YWx1ZShrZXksIHBlZXIpO1xuICB9XG5cbiAgYXN5bmMgZG9GaW5kdmFsdWUoa2V5OiBzdHJpbmcsIHBlZXI6IFdlYlJUQykge1xuICAgIGNvbnNvbGUubG9nKFwiZG9maW5kdmFsdWVcIiwgcGVlci5ub2RlSWQpO1xuICAgIHBlZXIuc2VuZChcbiAgICAgIG5ldHdvcmtGb3JtYXQodGhpcy5ub2RlSWQsIGRlZi5GSU5EVkFMVUUsIHtcbiAgICAgICAgdGFyZ2V0S2V5OiBrZXlcbiAgICAgIH0pLFxuICAgICAgXCJrYWRcIlxuICAgICk7XG4gIH1cblxuICBhZGRrbm9kZShwZWVyOiBXZWJSVEMpIHtcbiAgICBwZWVyLmRhdGEgPSByYXcgPT4ge1xuICAgICAgdGhpcy5vbkNvbW1hbmQocmF3KTtcbiAgICB9O1xuXG4gICAgcGVlci5kaXNjb25uZWN0ID0gKCkgPT4ge1xuICAgICAgY29uc29sZS5sb2coXCJrYWQgbm9kZSBkaXNjb25uZWN0ZWRcIik7XG4gICAgICB0aGlzLmYuY2xlYW5EaXNjb24oKTtcbiAgICB9O1xuXG4gICAgaWYgKCF0aGlzLmYuaXNOb2RlRXhpc3QocGVlci5ub2RlSWQpKSB7XG4gICAgICAvL+iHquWIhuOBruODjuODvOODiUlE44Go6L+95Yqg44GZ44KL44OO44O844OJSUTjga7ot53pm6JcbiAgICAgIGNvbnN0IG51bSA9IGRpc3RhbmNlKHRoaXMubm9kZUlkLCBwZWVyLm5vZGVJZCk7XG4gICAgICAvL2tidWNrZXRz44Gu6Kmy5b2T44GZ44KL6Led6Zui44Gua2J1Y2tldOOCkuWRvOOBs+WHuuOBmVxuICAgICAgY29uc3Qga2J1Y2tldCA9IHRoaXMua2J1Y2tldHNbbnVtXTtcbiAgICAgIC8v6Kmy5b2T44GZ44KLa2J1Y2tldOOBq+aWsOOBl+OBhOODlOOCouOCkuWKoOOBiOOCi1xuICAgICAga2J1Y2tldC5wdXNoKHBlZXIpO1xuXG4gICAgICBjb25zb2xlLmxvZyhcImFkZGtub2RlIGtidWNrZXRzXCIsIFwicGVlci5ub2RlSWQ6XCIsIHBlZXIubm9kZUlkKTtcbiAgICAgIGNvbnNvbGUubG9nKHRoaXMuZi5nZXRBbGxQZWVySWRzKCkpO1xuXG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgdGhpcy5maW5kTmV3UGVlcihwZWVyKTtcbiAgICAgIH0sIDEwMDApO1xuXG4gICAgICB0aGlzLmNhbGxiYWNrLm9uQWRkUGVlcih0aGlzLmYuZ2V0QWxsUGVlcklkcygpKTtcbiAgICB9XG4gIH1cblxuICBmaW5kTmV3UGVlcihwZWVyOiBXZWJSVEMpIHtcbiAgICBpZiAodGhpcy5mLmdldEtidWNrZXROdW0oKSA8IHRoaXMuaykge1xuICAgICAgLy/oh6rouqvjga7jg47jg7zjg4lJROOCkmtleeOBqOOBl+OBpkZJTkRfTk9ERVxuICAgICAgdGhpcy5maW5kTm9kZSh0aGlzLm5vZGVJZCwgcGVlcik7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUubG9nKFwia2J1Y2tldCByZWFkeVwiLCB0aGlzLmYuZ2V0S2J1Y2tldE51bSgpKTtcbiAgICB9XG4gIH1cblxuICBvblJlcXVlc3QoZGF0YWxpbms6IHN0cmluZykge1xuICAgIGNvbnN0IG5ldHdvcmsgPSBKU09OLnBhcnNlKGRhdGFsaW5rKTtcbiAgICB0aGlzLnJlc3BvbmRlci5yZXNwb25zZShuZXR3b3JrLnR5cGUsIG5ldHdvcmspO1xuICAgIHRoaXMubWFpbnRhaW4obmV0d29yayk7XG4gIH1cblxuICBhc3luYyBtYWludGFpbihuZXR3b3JrOiBhbnkpIHtcbiAgICBjb25zdCBpbnggPSBkaXN0YW5jZSh0aGlzLm5vZGVJZCwgbmV0d29yay5ub2RlSWQpO1xuICAgIGNvbnN0IGtidWNrZXQgPSB0aGlzLmtidWNrZXRzW2lueF07XG5cbiAgICAvL+mAgeS/oeWFg+OBjOipsuW9k+OBmeOCi2stYnVja2V044Gu5Lit44Gr44GC44Gj44Gf5aC05ZCIXG4gICAgLy/jgZ3jga7jg47jg7zjg4njgpJrLWJ1Y2tldOOBruacq+WwvuOBq+enu+OBmVxuICAgIGtidWNrZXQuZm9yRWFjaCgocGVlciwgaSkgPT4ge1xuICAgICAgaWYgKHBlZXIubm9kZUlkID09PSBuZXR3b3JrLm5vZGVJZCkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIm1haW50YWluXCIsIFwiTW92ZXPCoGl0wqB0b8KgdGhlwqB0YWlswqBvZsKgdGhlwqBsaXN0XCIpO1xuICAgICAgICBrYnVja2V0LnNwbGljZShpLCAxKTtcbiAgICAgICAga2J1Y2tldC5wdXNoKHBlZXIpO1xuICAgICAgICByZXR1cm4gMDtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vay1idWNrZXTjgYzjgZnjgafjgavmuoDmna/jgarloLTlkIjjgIFcbiAgICAvL+OBneOBrmstYnVja2V05Lit44Gu5YWI6aCt44Gu44OO44O844OJ44GM44Kq44Oz44Op44Kk44Oz44Gq44KJ5YWI6aCt44Gu44OO44O844OJ44KS5q6L44GZXG4gICAgaWYgKGtidWNrZXQubGVuZ3RoID4gdGhpcy5rKSB7XG4gICAgICBjb25zb2xlLmxvZyhcIm1haW50YWluXCIsIFwiYnVja2V0IGZ1bGxlZFwiLCBuZXR3b3JrLm5vZGVJZCk7XG4gICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0aGlzLnBpbmcoa2J1Y2tldFswXSkuY2F0Y2goY29uc29sZS5sb2cpO1xuICAgICAgaWYgKCFyZXN1bHQpIHtcbiAgICAgICAga2J1Y2tldC5zcGxpY2UoMCwgMSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgb2ZmZXIodGFyZ2V0OiBzdHJpbmcsIHByb3h5ID0gbnVsbCkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjb25zdCByID0gdGhpcy5yZWY7XG4gICAgICBjb25zdCBwZWVyID0gKHJbdGFyZ2V0XSA9IG5ldyBXZWJSVEMoKSk7XG4gICAgICBwZWVyLm1ha2VPZmZlcigpO1xuXG4gICAgICBjb25zdCB0aW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHJlamVjdChcImthZCBvZmZlciB0aW1lb3V0XCIpO1xuICAgICAgfSwgMTAgKiAxMDAwKTtcblxuICAgICAgcGVlci5zaWduYWwgPSBzZHAgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZyhcImthZCBvZmZlciBzdG9yZVwiLCB0YXJnZXQpO1xuICAgICAgICBjb25zdCBfID0gdGhpcy5mLmdldENsb3NlRXN0UGVlcih0YXJnZXQpO1xuICAgICAgICBpZiAoIV8pIHJldHVybjtcbiAgICAgICAgaWYgKF8ubm9kZUlkICE9PSB0YXJnZXQpXG4gICAgICAgICAgdGhpcy5zdG9yZSh0aGlzLm5vZGVJZCwgdGFyZ2V0LCB7IHNkcCwgcHJveHkgfSk7XG4gICAgICB9O1xuXG4gICAgICBwZWVyLmNvbm5lY3QgPSAoKSA9PiB7XG4gICAgICAgIHBlZXIubm9kZUlkID0gdGFyZ2V0O1xuICAgICAgICBjb25zb2xlLmxvZyhcImthZCBvZmZlciBjb25uZWN0ZWRcIiwgdGFyZ2V0KTtcbiAgICAgICAgdGhpcy5hZGRrbm9kZShwZWVyKTtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xuICAgICAgICByZXNvbHZlKHRydWUpO1xuICAgICAgfTtcbiAgICB9KTtcbiAgfVxuXG4gIGFuc3dlcih0YXJnZXQ6IHN0cmluZywgc2RwOiBzdHJpbmcsIHByb3h5OiBzdHJpbmcpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY29uc3QgciA9IHRoaXMucmVmO1xuICAgICAgY29uc3QgcGVlciA9IChyW3RhcmdldF0gPSBuZXcgV2ViUlRDKCkpO1xuICAgICAgcGVlci5tYWtlQW5zd2VyKHNkcCk7XG4gICAgICBjb25zb2xlLmxvZyhcImthZCBhbnN3ZXJcIiwgdGFyZ2V0KTtcblxuICAgICAgY29uc3QgdGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICByZWplY3QoXCJrYWQgYW5zd2VyIHRpbWVvdXRcIik7XG4gICAgICB9LCAxMCAqIDEwMDApO1xuXG4gICAgICBwZWVyLnNpZ25hbCA9IHNkcCA9PiB7XG4gICAgICAgIGNvbnN0IF8gPSB0aGlzLmYuZ2V0UGVlckZyb21ub2RlSWQocHJveHkpO1xuICAgICAgICAvL+adpeOBn+ODq+ODvOODiOOBq+mAgeOCiui/lOOBmVxuICAgICAgICBpZiAoXykgXy5zZW5kKHRoaXMuc3RvcmVGb3JtYXQodGhpcy5ub2RlSWQsIHRhcmdldCwgeyBzZHAgfSksIFwia2FkXCIpO1xuICAgICAgfTtcblxuICAgICAgcGVlci5jb25uZWN0ID0gKCkgPT4ge1xuICAgICAgICBwZWVyLm5vZGVJZCA9IHRhcmdldDtcbiAgICAgICAgY29uc29sZS5sb2coXCJrYWQgYW5zd2VyIGNvbm5lY3RlZFwiLCB0YXJnZXQpO1xuICAgICAgICB0aGlzLmFkZGtub2RlKHBlZXIpO1xuICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dCk7XG4gICAgICAgIHJlc29sdmUodHJ1ZSk7XG4gICAgICB9O1xuICAgIH0pO1xuICB9XG5cbiAgc2VuZCh0YXJnZXQ6IHN0cmluZywgZGF0YTogYW55KSB7XG4gICAgY29uc3QgXyA9IHRoaXMuZi5nZXRQZWVyRnJvbW5vZGVJZCh0YXJnZXQpO1xuICAgIGlmIChfKSBfLnNlbmQobmV0d29ya0Zvcm1hdCh0aGlzLm5vZGVJZCwgZGVmLlNFTkQsIGRhdGEpLCBcImthZFwiKTtcbiAgfVxuXG4gIG9uQ29tbWFuZChtZXNzYWdlOiBtZXNzYWdlKSB7XG4gICAgc3dpdGNoIChtZXNzYWdlLmxhYmVsKSB7XG4gICAgICBjYXNlIFwia2FkXCI6XG4gICAgICAgIGNvbnN0IGRhdGFMaW5rID0gbWVzc2FnZS5kYXRhO1xuICAgICAgICBjb25zdCBuZXR3b3JrTGF5ZXI6IG5ldHdvcmsgPSBKU09OLnBhcnNlKGRhdGFMaW5rKTtcbiAgICAgICAgaWYgKCFKU09OLnN0cmluZ2lmeSh0aGlzLmRhdGFMaXN0KS5pbmNsdWRlcyhuZXR3b3JrTGF5ZXIuaGFzaCkpIHtcbiAgICAgICAgICB0aGlzLmRhdGFMaXN0LnB1c2gobmV0d29ya0xheWVyLmhhc2gpO1xuICAgICAgICAgIHRoaXMuZi5jbGVhbkRpc2NvbigpO1xuICAgICAgICAgIHRoaXMub25SZXF1ZXN0KGRhdGFMaW5rKTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgXCJhcHBcIjpcbiAgICAgICAgY29uc29sZS5sb2coXCJrYWQgb25hcHBcIiwgbWVzc2FnZS5kYXRhKTtcbiAgICAgICAgdGhpcy5jYWxsYmFjay5vbkFwcChKU09OLnBhcnNlKG1lc3NhZ2UuZGF0YSkpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgXCJiaW5cIjpcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBjb25zdCBqc29uID0gSlNPTi5wYXJzZShtZXNzYWdlLmRhdGEpO1xuICAgICAgICAgIGlmIChqc29uLnR5cGUgPT09IFwic3RhcnRcIikge1xuICAgICAgICAgICAgdGhpcy5idWZmZXJbbWVzc2FnZS5ub2RlSWRdID0gW107XG4gICAgICAgICAgfSBlbHNlIGlmIChqc29uLnR5cGUgPT09IFwiZW5kXCIpIHtcbiAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgaWYgKCF0aGlzLmJ1ZmZlclttZXNzYWdlLm5vZGVJZF0pIHtcbiAgICAgICAgICAgIHRoaXMuYnVmZmVyW21lc3NhZ2Uubm9kZUlkXSA9IFtdO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLmJ1ZmZlclttZXNzYWdlLm5vZGVJZF0ucHVzaChtZXNzYWdlLmRhdGEpO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxufVxuIl19
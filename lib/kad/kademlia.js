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
                peer.send(storeFormat, "kad");
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
      var _this2 = this;

      var cb = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function (value) {};
      this.callback.onFindValue = cb; //keyに近いピアを取得

      var peers = this.f.getClosePeers(key);
      peers.forEach(function (peer) {
        _this2.doFindvalue(key, peer);
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


          var storeFormat = {
            sender: _this5.nodeId,
            key: target,
            value: {
              sdp: sdp
            }
          };
          if (_) _.send(storeFormat, "kad");
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9rYWQva2FkZW1saWEudHMiXSwibmFtZXMiOlsicmVxdWlyZSIsIkthZGVtbGlhIiwiX25vZGVJZCIsIm9wdCIsImlzT2ZmZXIiLCJmaW5kTm9kZSIsImhhc2giLCJtYWludGFpbiIsIm9uQWRkUGVlciIsInYiLCJvblBlZXJEaXNjb25uZWN0Iiwib25GaW5kVmFsdWUiLCJvbkZpbmROb2RlIiwib25TdG9yZSIsIl9vblBpbmciLCJvblBpbmciLCJvbkFwcCIsImNvbnNvbGUiLCJsb2ciLCJrIiwia0xlbmd0aCIsIm5vZGVJZCIsImtidWNrZXRzIiwiQXJyYXkiLCJpIiwia2J1Y2tldCIsImYiLCJIZWxwZXIiLCJyZXNwb25kZXIiLCJLUmVzcG9uZGVyIiwicGVlciIsIlByb21pc2UiLCJyZXNvbHZlIiwicmVqZWN0IiwidGltZW91dCIsInNldFRpbWVvdXQiLCJpc0Rpc2Nvbm5lY3RlZCIsImNsZWFuRGlzY29uIiwiY2FsbGJhY2siLCJjbGVhclRpbWVvdXQiLCJzZW5kRGF0YSIsInRhcmdldCIsInNlbmQiLCJkZWYiLCJQSU5HIiwic2VuZGVyIiwia2V5IiwidmFsdWUiLCJnZXRDbG9zZUVzdFBlZXIiLCJTVE9SRSIsInN0b3JlRm9ybWF0Iiwia2V5VmFsdWVMaXN0IiwidGFyZ2V0SWQiLCJwaW5nIiwiY2F0Y2giLCJzdGF0ZSIsInRhcmdldEtleSIsIkZJTkROT0RFIiwiY2IiLCJwZWVycyIsImdldENsb3NlUGVlcnMiLCJmb3JFYWNoIiwiZG9GaW5kdmFsdWUiLCJmaW5kdmFsdWUiLCJGSU5EVkFMVUUiLCJldmVudHMiLCJkYXRhIiwicmF3Iiwib25Db21tYW5kIiwiZGlzY29ubmVjdCIsImdldEFsbFBlZXJJZHMiLCJpc05vZGVFeGlzdCIsIm51bSIsInB1c2giLCJmaW5kTmV3UGVlciIsImdldEtidWNrZXROdW0iLCJkYXRhbGluayIsIm5ldHdvcmsiLCJKU09OIiwicGFyc2UiLCJyZXNwb25zZSIsInR5cGUiLCJpbngiLCJzcGxpY2UiLCJsZW5ndGgiLCJyZXN1bHQiLCJwcm94eSIsInIiLCJyZWYiLCJXZWJSVEMiLCJtYWtlT2ZmZXIiLCJzaWduYWwiLCJzZHAiLCJfIiwic3RvcmUiLCJjb25uZWN0IiwiYWRka25vZGUiLCJtYWtlQW5zd2VyIiwiZ2V0UGVlckZyb21ub2RlSWQiLCJTRU5EIiwibWVzc2FnZSIsImxhYmVsIiwiZGF0YUxpbmsiLCJuZXR3b3JrTGF5ZXIiLCJzdHJpbmdpZnkiLCJkYXRhTGlzdCIsImluY2x1ZGVzIiwib25SZXF1ZXN0IiwianNvbiIsImJ1ZmZlciIsImVycm9yIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUxBQSxPQUFPLENBQUMsZ0JBQUQsQ0FBUDs7SUFRcUJDLFE7OztBQTZCbkIsb0JBQVlDLE9BQVosRUFBNkJDLEdBQTdCLEVBQXlEO0FBQUE7O0FBQUE7O0FBQUE7O0FBQUE7O0FBQUE7O0FBQUE7O0FBQUEsc0NBdkJsQyxFQXVCa0M7O0FBQUEsMENBdEJsQixFQXNCa0I7O0FBQUEsaUNBckJ4QixFQXFCd0I7O0FBQUEsb0NBcEJqQixFQW9CaUI7O0FBQUEsbUNBbkJqRDtBQUNOQyxNQUFBQSxPQUFPLEVBQUUsS0FESDtBQUVOQyxNQUFBQSxRQUFRLEVBQUUsRUFGSjtBQUdOQyxNQUFBQSxJQUFJLEVBQUUsRUFIQTtBQUlOQyxNQUFBQSxRQUFRLEVBQUU7QUFKSixLQW1CaUQ7O0FBQUEsb0NBWlQsRUFZUzs7QUFBQSxzQ0FWOUM7QUFDVEMsTUFBQUEsU0FBUyxFQUFFLG1CQUFDQyxDQUFELEVBQWEsQ0FBRSxDQURqQjtBQUVUQyxNQUFBQSxnQkFBZ0IsRUFBRSwwQkFBQ0QsQ0FBRCxFQUFhLENBQUUsQ0FGeEI7QUFHVEUsTUFBQUEsV0FBVyxFQUFFLHFCQUFDRixDQUFELEVBQWEsQ0FBRSxDQUhuQjtBQUlURyxNQUFBQSxVQUFVLEVBQUUsb0JBQUNILENBQUQsRUFBYSxDQUFFLENBSmxCO0FBS1RJLE1BQUFBLE9B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QUNDLEdBQVIsQ0FBWSxXQUFaLEVBQXlCa0YsT0FBTyxDQUFDbEMsSUFBakM7QUFDQSxlQUFLNUIsUUFBTCxDQUFjdEIsS0FBZCxDQUFvQjhELElBQUksQ0FBQ0MsS0FBTCxDQUFXcUIsT0FBTyxDQUFDbEMsSUFBbkIsQ0FBcEI7QUFDQTs7QUFDRixhQUFLLEtBQUw7QUFDRSxjQUFJO0FBQ0YsZ0JBQU0wQyxJQUFJLEdBQUc5QixJQUFJLENBQUNDLEtBQUwsQ0FBV3FCLE9BQU8sQ0FBQ2xDLElBQW5CLENBQWI7O0FBQ0EsZ0JBQUkwQyxJQUFJLENBQUMzQixJQUFMLEtBQWMsT0FBbEIsRUFBMkI7QUFDekIsbUJBQUs0QixNQUFMLENBQVlULE9BQU8sQ0FBQy9FLE1BQXBCLElBQThCLEVBQTlCO0FBQ0QsYUFGRCxNQUVPLElBQUl1RixJQUFJLENBQUMzQixJQUFMLEtBQWMsS0FBbEIsRUFBeUIsQ0FDL0I7QUFDRixXQU5ELENBTUUsT0FBTzZCLEtBQVAsRUFBYztBQUNkLGdCQUFJLENBQUMsS0FBS0QsTUFBTCxDQUFZVCxPQUFPLENBQUMvRSxNQUFwQixDQUFMLEVBQWtDO0FBQ2hDLG1CQUFLd0YsTUFBTCxDQUFZVCxPQUFPLENBQUMvRSxNQUFwQixJQUE4QixFQUE5QjtBQUNEOztBQUNELGlCQUFLd0YsTUFBTCxDQUFZVCxPQUFPLENBQUMvRSxNQUFwQixFQUE0Qm9ELElBQTVCLENBQWlDMkIsT0FBTyxDQUFDbEMsSUFBekM7QUFDRDs7QUFDRDtBQTNCSjtBQTZCRCIsInNvdXJjZXNDb250ZW50IjpbInJlcXVpcmUoXCJiYWJlbC1wb2x5ZmlsbFwiKTtcbmltcG9ydCBXZWJSVEMgZnJvbSBcIndlYnJ0YzRtZVwiO1xuaW1wb3J0IEhlbHBlciBmcm9tIFwiLi9rVXRpbFwiO1xuaW1wb3J0IEtSZXNwb25kZXIgZnJvbSBcIi4va1Jlc3BvbmRlclwiO1xuaW1wb3J0IGRlZiwgeyBuZXR3b3JrRm9ybWF0IH0gZnJvbSBcIi4vS0NvbnN0XCI7XG5pbXBvcnQgeyBkaXN0YW5jZSB9IGZyb20gXCJrYWQtZGlzdGFuY2VcIjtcbmltcG9ydCB7IG1lc3NhZ2UgfSBmcm9tIFwid2VicnRjNG1lL2xpYi9pbnRlcmZhY2VcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgS2FkZW1saWEge1xuICBub2RlSWQ6IHN0cmluZztcbiAgazogbnVtYmVyO1xuICBrYnVja2V0czogQXJyYXk8QXJyYXk8V2ViUlRDPj47XG4gIGY6IEhlbHBlcjtcbiAgcmVzcG9uZGVyOiBLUmVzcG9uZGVyO1xuICBkYXRhTGlzdDogQXJyYXk8YW55PiA9IFtdO1xuICBrZXlWYWx1ZUxpc3Q6IHsgW2tleTogc3RyaW5nXTogYW55IH0gPSB7fTtcbiAgcmVmOiB7IFtrZXk6IHN0cmluZ106IFdlYlJUQyB9ID0ge307XG4gIGJ1ZmZlcjogeyBba2V5OiBzdHJpbmddOiBBcnJheTxhbnk+IH0gPSB7fTtcbiAgc3RhdGUgPSB7XG4gICAgaXNPZmZlcjogZmFsc2UsXG4gICAgZmluZE5vZGU6IFwiXCIsXG4gICAgaGFzaDoge30sXG4gICAgbWFpbnRhaW46IGZhbHNlXG4gIH07XG5cbiAgcHJpdmF0ZSBvblBpbmc6IHsgW2tleTogc3RyaW5nXTogKCkgPT4gdm9pZCB9ID0ge307XG5cbiAgY2FsbGJhY2sgPSB7XG4gICAgb25BZGRQZWVyOiAodj86IGFueSkgPT4ge30sXG4gICAgb25QZWVyRGlzY29ubmVjdDogKHY/OiBhbnkpID0+IHt9LFxuICAgIG9uRmluZFZhbHVlOiAodj86IGFueSkgPT4ge30sXG4gICAgb25GaW5kTm9kZTogKHY/OiBhbnkpID0+IHt9LFxuICAgIG9uU3RvcmU6ICh2PzogYW55KSA9PiB7fSxcbiAgICBfb25QaW5nOiB0aGlzLm9uUGluZyxcbiAgICBvbkFwcDogKHY/OiBhbnkpID0+IHt9XG4gIH07XG5cbiAgY29uc3RydWN0b3IoX25vZGVJZDogc3RyaW5nLCBvcHQ/OiB7IGtMZW5ndGg/OiBudW1iZXIgfSkge1xuICAgIGNvbnNvbGUubG9nKFwic3RhcnQga2FkXCIsIF9ub2RlSWQpO1xuICAgIHRoaXMuayA9IDIwO1xuICAgIGlmIChvcHQpIGlmIChvcHQua0xlbmd0aCkgdGhpcy5rID0gb3B0LmtMZW5ndGg7XG4gICAgdGhpcy5ub2RlSWQgPSBfbm9kZUlkO1xuXG4gICAgdGhpcy5rYnVja2V0cyA9IG5ldyBBcnJheSgxNjApO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgMTYwOyBpKyspIHtcbiAgICAgIGxldCBrYnVja2V0OiBBcnJheTxhbnk+ID0gW107XG4gICAgICB0aGlzLmtidWNrZXRzW2ldID0ga2J1Y2tldDtcbiAgICB9XG5cbiAgICB0aGlzLmYgPSBuZXcgSGVscGVyKHRoaXMuaywgdGhpcy5rYnVja2V0cyk7XG4gICAgdGhpcy5yZXNwb25kZXIgPSBuZXcgS1Jlc3BvbmRlcih0aGlzKTtcbiAgfVxuXG4gIHBpbmcocGVlcjogV2ViUlRDKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKFwicGluZ1wiLCBwZWVyLm5vZGVJZCk7XG5cbiAgICAgIC8vMTDnp5Lku6XlhoXjgatwaW5n44Gu44OV44Op44Kw44GM56uL44Gm44Gw5oiQ5YqfXG4gICAgICBjb25zdCB0aW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwicGluZyBmYWlsXCIsIHBlZXIubm9kZUlkKTtcbiAgICAgICAgcGVlci5pc0Rpc2Nvbm5lY3RlZCA9IHRydWU7XG4gICAgICAgIHRoaXMuZi5jbGVhbkRpc2NvbigpO1xuICAgICAgICB0aGlzLmNhbGxiYWNrLm9uUGVlckRpc2Nvbm5lY3QodGhpcy5rYnVja2V0cyk7XG4gICAgICAgIHJlamVjdChcInBpbmcgdGltZW91dCBcIiArIHBlZXIubm9kZUlkKTtcbiAgICAgIH0sIDEwICogMTAwMCk7XG5cbiAgICAgIC8vcGluZ+WujOS6huaZguOBruOCs+ODvOODq+ODkOODg+OCr1xuICAgICAgdGhpcy5jYWxsYmFjay5fb25QaW5nW3BlZXIubm9kZUlkXSA9ICgpID0+IHtcbiAgICAgICAgY29uc29sZS5sb2coXCJwaW5nIHN1Y2Nlc3NcIiwgcGVlci5ub2RlSWQpO1xuICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dCk7XG4gICAgICAgIHJlc29sdmUodHJ1ZSk7XG4gICAgICB9O1xuXG4gICAgICAvL+iHquWIhuOBruODjuODvOODiUlE44KS5ZCr44KB44KLXG4gICAgICBjb25zdCBzZW5kRGF0YSA9IHsgdGFyZ2V0OiBwZWVyLm5vZGVJZCB9O1xuICAgICAgLy9waW5n44KS6YCB44KLXG4gICAgICBwZWVyLnNlbmQobmV0d29ya0Zvcm1hdCh0aGlzLm5vZGVJZCwgZGVmLlBJTkcsIHNlbmREYXRhKSwgXCJrYWRcIik7XG4gICAgfSk7XG4gIH1cblxuICBhc3luYyBzdG9yZShzZW5kZXI6IHN0cmluZywga2V5OiBzdHJpbmcsIHZhbHVlOiBhbnkpIHtcbiAgICAvL+iHquWIhuOBq+S4gOeVqui/keOBhOODlOOCouOCkuWPluW+l1xuICAgIGNvbnN0IHBlZXIgPSB0aGlzLmYuZ2V0Q2xvc2VFc3RQZWVyKGtleSk7XG4gICAgaWYgKCFwZWVyKSByZXR1cm47XG4gICAgY29uc29sZS5sb2coZGVmLlNUT1JFLCBcIm5leHRcIiwgcGVlci5ub2RlSWQsIFwidGFyZ2V0XCIsIGtleSk7XG4gICAgY29uc3Qgc3RvcmVGb3JtYXQ6IFN0b3JlRm9ybWF0ID0geyBzZW5kZXIsIGtleSwgdmFsdWUgfTtcbiAgICBwZWVyLnNlbmQoc3RvcmVGb3JtYXQsIFwia2FkXCIpO1xuICAgIGNvbnNvbGUubG9nKFwic3RvcmUgZG9uZVwiLCBzdG9yZUZvcm1hdCk7XG4gICAgdGhpcy5rZXlWYWx1ZUxpc3Rba2V5XSA9IHZhbHVlO1xuICB9XG5cbiAgYXN5bmMgZmluZE5vZGUodGFyZ2V0SWQ6IHN0cmluZywgcGVlcjogV2ViUlRDKSB7XG4gICAgY29uc29sZS5sb2coXCJmaW5kbm9kZVwiKTtcbiAgICAvL+aOpee2mueiuuiqjVxuICAgIGNvbnN0IHBpbmcgPSB0aGlzLnBpbmcocGVlcikuY2F0Y2goY29uc29sZS5sb2cpO1xuICAgIGlmICghcGluZykgcmV0dXJuO1xuICAgIGNvbnNvbGUubG9nKFwiZmluZG5vZGVcIiwgdGFyZ2V0SWQpO1xuICAgIHRoaXMuc3RhdGUuZmluZE5vZGUgPSB0YXJnZXRJZDtcbiAgICBjb25zdCBzZW5kRGF0YSA9IHsgdGFyZ2V0S2V5OiB0YXJnZXRJZCB9O1xuICAgIC8v6YCB44KLXG4gICAgcGVlci5zZW5kKG5ldHdvcmtGb3JtYXQodGhpcy5ub2RlSWQsIGRlZi5GSU5ETk9ERSwgc2VuZERhdGEpLCBcImthZFwiKTtcbiAgfVxuXG4gIGZpbmRWYWx1ZShrZXk6IHN0cmluZywgY2IgPSAodmFsdWU6IGFueSkgPT4ge30pIHtcbiAgICB0aGlzLmNhbGxiYWNrLm9uRmluZFZhbHVlID0gY2I7XG4gICAgLy9rZXnjgavov5HjgYTjg5TjgqLjgpLlj5blvpdcbiAgICBjb25zdCBwZWVycyA9IHRoaXMuZi5nZXRDbG9zZVBlZXJzKGtleSk7XG4gICAgcGVlcnMuZm9yRWFjaChwZWVyID0+IHtcbiAgICAgIHRoaXMuZG9GaW5kdmFsdWUoa2V5LCBwZWVyKTtcbiAgICB9KTtcbiAgICAvLyBjb25zdCBwZWVyID0gdGhpcy5mLmdldENsb3NlRXN0UGVlcihrZXkpO1xuICAgIC8vIGlmICghcGVlcikgcmV0dXJuO1xuICAgIC8vIHRoaXMuZG9GaW5kdmFsdWUoa2V5LCBwZWVyKTtcbiAgfVxuXG4gIGFzeW5jIGRvRmluZHZhbHVlKGtleTogc3RyaW5nLCBwZWVyOiBXZWJSVEMpIHtcbiAgICBjb25zb2xlLmxvZyhcImRvZmluZHZhbHVlXCIsIHBlZXIubm9kZUlkKTtcbiAgICBjb25zdCBmaW5kdmFsdWU6IEZpbmRWYWx1ZSA9IHsgdGFyZ2V0S2V5OiBrZXkgfTtcbiAgICBwZWVyLnNlbmQobmV0d29ya0Zvcm1hdCh0aGlzLm5vZGVJZCwgZGVmLkZJTkRWQUxVRSwgZmluZHZhbHVlKSwgXCJrYWRcIik7XG4gIH1cblxuICBhZGRrbm9kZShwZWVyOiBXZWJSVEMpIHtcbiAgICBwZWVyLmV2ZW50cy5kYXRhW1wia2FkZW1saWEudHNcIl0gPSByYXcgPT4ge1xuICAgICAgdGhpcy5vbkNvbW1hbmQocmF3KTtcbiAgICB9O1xuXG4gICAgcGVlci5kaXNjb25uZWN0ID0gKCkgPT4ge1xuICAgICAgY29uc29sZS5sb2coXCJrYWQgbm9kZSBkaXNjb25uZWN0ZWRcIik7XG4gICAgICB0aGlzLmYuY2xlYW5EaXNjb24oKTtcbiAgICAgIHRoaXMuY2FsbGJhY2sub25BZGRQZWVyKHRoaXMuZi5nZXRBbGxQZWVySWRzKCkpO1xuICAgIH07XG5cbiAgICBpZiAoIXRoaXMuZi5pc05vZGVFeGlzdChwZWVyLm5vZGVJZCkpIHtcbiAgICAgIC8v6Ieq5YiG44Gu44OO44O844OJSUTjgajov73liqDjgZnjgovjg47jg7zjg4lJROOBrui3nembolxuICAgICAgY29uc3QgbnVtID0gZGlzdGFuY2UodGhpcy5ub2RlSWQsIHBlZXIubm9kZUlkKTtcbiAgICAgIC8va2J1Y2tldHPjga7oqbLlvZPjgZnjgovot53pm6Ljga5rYnVja2V044KS5ZG844Gz5Ye644GZXG4gICAgICBjb25zdCBrYnVja2V0ID0gdGhpcy5rYnVja2V0c1tudW1dO1xuICAgICAgLy/oqbLlvZPjgZnjgotrYnVja2V044Gr5paw44GX44GE44OU44Ki44KS5Yqg44GI44KLXG4gICAgICBrYnVja2V0LnB1c2gocGVlcik7XG5cbiAgICAgIGNvbnNvbGUubG9nKFwiYWRka25vZGUga2J1Y2tldHNcIiwgXCJwZWVyLm5vZGVJZDpcIiwgcGVlci5ub2RlSWQpO1xuICAgICAgY29uc29sZS5sb2codGhpcy5mLmdldEFsbFBlZXJJZHMoKSk7XG5cbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICB0aGlzLmZpbmROZXdQZWVyKHBlZXIpO1xuICAgICAgfSwgMTAwMCk7XG5cbiAgICAgIHRoaXMuY2FsbGJhY2sub25BZGRQZWVyKHRoaXMuZi5nZXRBbGxQZWVySWRzKCkpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgZmluZE5ld1BlZXIocGVlcjogV2ViUlRDKSB7XG4gICAgaWYgKHRoaXMuZi5nZXRLYnVja2V0TnVtKCkgPCB0aGlzLmspIHtcbiAgICAgIC8v6Ieq6Lqr44Gu44OO44O844OJSUTjgpJrZXnjgajjgZfjgaZGSU5EX05PREVcbiAgICAgIHRoaXMuZmluZE5vZGUodGhpcy5ub2RlSWQsIHBlZXIpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmxvZyhcImtidWNrZXQgcmVhZHlcIiwgdGhpcy5mLmdldEtidWNrZXROdW0oKSk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBvblJlcXVlc3QoZGF0YWxpbms6IHN0cmluZykge1xuICAgIGNvbnN0IG5ldHdvcmsgPSBKU09OLnBhcnNlKGRhdGFsaW5rKTtcbiAgICB0aGlzLnJlc3BvbmRlci5yZXNwb25zZShuZXR3b3JrLnR5cGUsIG5ldHdvcmspO1xuICAgIGlmICghdGhpcy5zdGF0ZS5tYWludGFpbikgdGhpcy5tYWludGFpbihuZXR3b3JrKTtcbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgbWFpbnRhaW4obmV0d29yazogYW55KSB7XG4gICAgY29uc3QgaW54ID0gZGlzdGFuY2UodGhpcy5ub2RlSWQsIG5ldHdvcmsubm9kZUlkKTtcbiAgICBjb25zdCBrYnVja2V0ID0gdGhpcy5rYnVja2V0c1tpbnhdO1xuXG4gICAgLy/pgIHkv6HlhYPjgYzoqbLlvZPjgZnjgotrLWJ1Y2tldOOBruS4reOBq+OBguOBo+OBn+WgtOWQiFxuICAgIC8v44Gd44Gu44OO44O844OJ44KSay1idWNrZXTjga7mnKvlsL7jgavnp7vjgZlcbiAgICBrYnVja2V0LmZvckVhY2goKHBlZXIsIGkpID0+IHtcbiAgICAgIGlmIChwZWVyLm5vZGVJZCA9PT0gbmV0d29yay5ub2RlSWQpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJtYWludGFpblwiLCBcIk1vdmVzwqBpdMKgdG/CoHRoZcKgdGFpbMKgb2bCoHRoZcKgbGlzdFwiKTtcbiAgICAgICAga2J1Y2tldC5zcGxpY2UoaSwgMSk7XG4gICAgICAgIGtidWNrZXQucHVzaChwZWVyKTtcbiAgICAgICAgcmV0dXJuIDA7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvL2stYnVja2V044GM44GZ44Gn44Gr5rqA5p2v44Gq5aC05ZCI44CBXG4gICAgLy/jgZ3jga5rLWJ1Y2tldOS4reOBruWFiOmgreOBruODjuODvOODieOBjOOCquODs+ODqeOCpOODs+OBquOCieWFiOmgreOBruODjuODvOODieOCkuaui+OBmVxuICAgIGlmIChrYnVja2V0Lmxlbmd0aCA+IHRoaXMuaykge1xuICAgICAgdGhpcy5zdGF0ZS5tYWludGFpbiA9IHRydWU7XG4gICAgICBjb25zb2xlLmxvZyhcIm1haW50YWluXCIsIFwiYnVja2V0IGZ1bGxlZFwiLCBuZXR3b3JrLm5vZGVJZCk7XG4gICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0aGlzLnBpbmcoa2J1Y2tldFswXSkuY2F0Y2goY29uc29sZS5sb2cpO1xuICAgICAgdGhpcy5zdGF0ZS5tYWludGFpbiA9IGZhbHNlO1xuICAgICAgaWYgKCFyZXN1bHQpIHtcbiAgICAgICAga2J1Y2tldC5zcGxpY2UoMCwgMSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgb2ZmZXIodGFyZ2V0OiBzdHJpbmcsIHByb3h5ID0gbnVsbCkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjb25zdCByID0gdGhpcy5yZWY7XG4gICAgICBjb25zdCBwZWVyID0gKHJbdGFyZ2V0XSA9IG5ldyBXZWJSVEMoKSk7XG4gICAgICBwZWVyLm1ha2VPZmZlcigpO1xuXG4gICAgICBjb25zdCB0aW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHJlamVjdChcImthZCBvZmZlciB0aW1lb3V0XCIpO1xuICAgICAgfSwgNSAqIDEwMDApO1xuXG4gICAgICBwZWVyLnNpZ25hbCA9IHNkcCA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwia2FkIG9mZmVyIHN0b3JlXCIsIHRhcmdldCk7XG4gICAgICAgIGNvbnN0IF8gPSB0aGlzLmYuZ2V0Q2xvc2VFc3RQZWVyKHRhcmdldCk7XG4gICAgICAgIGlmICghXykgcmV0dXJuO1xuICAgICAgICBpZiAoXy5ub2RlSWQgIT09IHRhcmdldClcbiAgICAgICAgICB0aGlzLnN0b3JlKHRoaXMubm9kZUlkLCB0YXJnZXQsIHsgc2RwLCBwcm94eSB9KTtcbiAgICAgIH07XG5cbiAgICAgIHBlZXIuY29ubmVjdCA9ICgpID0+IHtcbiAgICAgICAgcGVlci5ub2RlSWQgPSB0YXJnZXQ7XG4gICAgICAgIGNvbnNvbGUubG9nKFwia2FkIG9mZmVyIGNvbm5lY3RlZFwiLCB0YXJnZXQpO1xuICAgICAgICB0aGlzLmFkZGtub2RlKHBlZXIpO1xuICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dCk7XG4gICAgICAgIHJlc29sdmUodHJ1ZSk7XG4gICAgICB9O1xuICAgIH0pO1xuICB9XG5cbiAgYW5zd2VyKHRhcmdldDogc3RyaW5nLCBzZHA6IHN0cmluZywgcHJveHk6IHN0cmluZykge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjb25zdCByID0gdGhpcy5yZWY7XG4gICAgICBjb25zdCBwZWVyID0gKHJbdGFyZ2V0XSA9IG5ldyBXZWJSVEMoKSk7XG4gICAgICBwZWVyLm1ha2VBbnN3ZXIoc2RwKTtcbiAgICAgIGNvbnNvbGUubG9nKFwia2FkIGFuc3dlclwiLCB0YXJnZXQpO1xuXG4gICAgICBjb25zdCB0aW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHJlamVjdChcImthZCBhbnN3ZXIgdGltZW91dFwiKTtcbiAgICAgIH0sIDUgKiAxMDAwKTtcblxuICAgICAgcGVlci5zaWduYWwgPSBzZHAgPT4ge1xuICAgICAgICBjb25zdCBfID0gdGhpcy5mLmdldFBlZXJGcm9tbm9kZUlkKHByb3h5KTtcbiAgICAgICAgLy/mnaXjgZ/jg6vjg7zjg4jjgavpgIHjgorov5TjgZlcbiAgICAgICAgY29uc3Qgc3RvcmVGb3JtYXQ6IFN0b3JlRm9ybWF0ID0ge1xuICAgICAgICAgIHNlbmRlcjogdGhpcy5ub2RlSWQsXG4gICAgICAgICAga2V5OiB0YXJnZXQsXG4gICAgICAgICAgdmFsdWU6IHsgc2RwIH1cbiAgICAgICAgfTtcbiAgICAgICAgaWYgKF8pIF8uc2VuZChzdG9yZUZvcm1hdCwgXCJrYWRcIik7XG4gICAgICB9O1xuXG4gICAgICBwZWVyLmNvbm5lY3QgPSAoKSA9PiB7XG4gICAgICAgIHBlZXIubm9kZUlkID0gdGFyZ2V0O1xuICAgICAgICBjb25zb2xlLmxvZyhcImthZCBhbnN3ZXIgY29ubmVjdGVkXCIsIHRhcmdldCk7XG4gICAgICAgIHRoaXMuYWRka25vZGUocGVlcik7XG4gICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KTtcbiAgICAgICAgcmVzb2x2ZSh0cnVlKTtcbiAgICAgIH07XG4gICAgfSk7XG4gIH1cblxuICBzZW5kKHRhcmdldDogc3RyaW5nLCBkYXRhOiBhbnkpIHtcbiAgICBjb25zdCBfID0gdGhpcy5mLmdldFBlZXJGcm9tbm9kZUlkKHRhcmdldCk7XG4gICAgaWYgKF8pIF8uc2VuZChuZXR3b3JrRm9ybWF0KHRoaXMubm9kZUlkLCBkZWYuU0VORCwgZGF0YSksIFwia2FkXCIpO1xuICB9XG5cbiAgcHJpdmF0ZSBvbkNvbW1hbmQobWVzc2FnZTogbWVzc2FnZSkge1xuICAgIHN3aXRjaCAobWVzc2FnZS5sYWJlbCkge1xuICAgICAgY2FzZSBcImthZFwiOlxuICAgICAgICBjb25zdCBkYXRhTGluayA9IG1lc3NhZ2UuZGF0YTtcbiAgICAgICAgY29uc3QgbmV0d29ya0xheWVyOiBuZXR3b3JrID0gSlNPTi5wYXJzZShkYXRhTGluayk7XG4gICAgICAgIGlmICghSlNPTi5zdHJpbmdpZnkodGhpcy5kYXRhTGlzdCkuaW5jbHVkZXMobmV0d29ya0xheWVyLmhhc2gpKSB7XG4gICAgICAgICAgdGhpcy5kYXRhTGlzdC5wdXNoKG5ldHdvcmtMYXllci5oYXNoKTtcbiAgICAgICAgICB0aGlzLmYuY2xlYW5EaXNjb24oKTtcbiAgICAgICAgICB0aGlzLm9uUmVxdWVzdChkYXRhTGluayk7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFwiYXBwXCI6XG4gICAgICAgIGNvbnNvbGUubG9nKFwia2FkIG9uYXBwXCIsIG1lc3NhZ2UuZGF0YSk7XG4gICAgICAgIHRoaXMuY2FsbGJhY2sub25BcHAoSlNPTi5wYXJzZShtZXNzYWdlLmRhdGEpKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFwiYmluXCI6XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgY29uc3QganNvbiA9IEpTT04ucGFyc2UobWVzc2FnZS5kYXRhKTtcbiAgICAgICAgICBpZiAoanNvbi50eXBlID09PSBcInN0YXJ0XCIpIHtcbiAgICAgICAgICAgIHRoaXMuYnVmZmVyW21lc3NhZ2Uubm9kZUlkXSA9IFtdO1xuICAgICAgICAgIH0gZWxzZSBpZiAoanNvbi50eXBlID09PSBcImVuZFwiKSB7XG4gICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgIGlmICghdGhpcy5idWZmZXJbbWVzc2FnZS5ub2RlSWRdKSB7XG4gICAgICAgICAgICB0aGlzLmJ1ZmZlclttZXNzYWdlLm5vZGVJZF0gPSBbXTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5idWZmZXJbbWVzc2FnZS5ub2RlSWRdLnB1c2gobWVzc2FnZS5kYXRhKTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cbn1cbiJdfQ==
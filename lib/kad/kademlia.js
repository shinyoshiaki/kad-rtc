"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _NodeRTC = _interopRequireDefault(require("simple-datachannel/lib/NodeRTC"));

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
  function Kademlia(_nodeId) {
    _classCallCheck(this, Kademlia);

    _defineProperty(this, "nodeId", void 0);

    _defineProperty(this, "k", void 0);

    _defineProperty(this, "kbuckets", void 0);

    _defineProperty(this, "f", void 0);

    _defineProperty(this, "responder", void 0);

    _defineProperty(this, "dataList", []);

    _defineProperty(this, "keyValueList", {});

    _defineProperty(this, "ref", {});

    _defineProperty(this, "state", {
      isOffer: false,
      findNode: "",
      hash: {}
    });

    _defineProperty(this, "callback", {
      onAddPeer: function onAddPeer(v) {},
      onPeerDisconnect: function onPeerDisconnect(v) {},
      onCommand: function onCommand(v) {},
      onFindValue: function onFindValue(v) {},
      onFindNode: function onFindNode(v) {},
      onPing: function onPing() {}
    });

    console.log("start kad", _nodeId);
    this.k = 20;
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

        _this.callback.onPing = function () {
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
        var sendData;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                console.log("findnode"); //接続確認

                console.log("findnode", targetId);
                this.state.findNode = targetId;
                sendData = {
                  targetKey: targetId
                }; //送る

                peer.send((0, _KConst.networkFormat)(this.nodeId, _KConst.default.FINDNODE, sendData), "kad");

              case 5:
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
                peer.send((0, _KConst.networkFormat)(this.nodeId, _KConst.default.FINDVALUE, {
                  targetKey: key
                }), "kad");

              case 1:
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

      peer.ev.on("data", function (data) {
        console.log("on data", data);

        _this2.onCommand(data);
      });
      peer.ev.on("disconnect", function () {
        console.log("kad node disconnected");

        _this2.f.cleanDiscon();
      });

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
        var peer = r[target] = new _NodeRTC.default();
        peer.makeOffer();
        peer.connecting(target);
        var timeout = setTimeout(function () {
          reject("kad offer timeout");
        }, 10 * 1000);
        peer.ev.on("signal", function (sdp) {
          console.log("kad offer store", target);

          var _ = _this3.f.getCloseEstPeer(target);

          if (!_) return;
          if (_.nodeId !== target) _this3.store(_this3.nodeId, target, {
            sdp: sdp,
            proxy: proxy
          });
        });
        peer.ev.on("connect", function () {
          console.log("kad offer connected", target);

          _this3.addknode(peer);

          clearTimeout(timeout);
          resolve(true);
        });
      });
    }
  }, {
    key: "answer",
    value: function answer(target, sdp, proxy) {
      var _this4 = this;

      return new Promise(function (resolve, reject) {
        var r = _this4.ref;
        var peer = r[target] = new _NodeRTC.default();
        peer.makeAnswer(sdp);
        peer.connecting(target);
        console.log("kad answer", target);
        var timeout = setTimeout(function () {
          reject("kad answer timeout");
        }, 10 * 1000);
        peer.ev.on("signal", function (sdp) {
          var _ = _this4.f.getPeerFromnodeId(proxy);

          if (_) _.send(_this4.storeFormat(_this4.nodeId, target, {
            sdp: sdp
          }), "kad");
        });
        peer.ev.on("connect", function () {
          console.log("kad answer connected", target);

          _this4.addknode(peer);

          clearTimeout(timeout);
          resolve(true);
        });
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
    value: function onCommand(datachannel) {
      var dataLink = datachannel.data;
      var networkLayer = JSON.parse(dataLink);

      if (!JSON.stringify(this.dataList).includes(networkLayer.hash)) {
        this.dataList.push(networkLayer.hash);
        this.f.cleanDiscon();
        this.onRequest(dataLink);
        this.callback.onCommand(networkLayer);
      }
    }
  }]);

  return Kademlia;
}();

exports.default = Kademlia;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9rYWQva2FkZW1saWEudHMiXSwibmFtZXMiOlsicmVxdWlyZSIsIkthZGVtbGlhIiwiX25vZGVJZCIsImlzT2ZmZXIiLCJmaW5kTm9kZSIsImhhc2giLCJvbkFkZFBlZXIiLCJ2Iiwib25QZWVyRGlzY29ubmVjdCIsIm9uQ29tbWFuZCIsIm9uRmluZFZhbHVlIiwib25GaW5kTm9kZSIsIm9uUGluZyIsImNvbnNvbGUiLCJsb2ciLCJrIiwibm9kZUlkIiwia2J1Y2tldHMiLCJBcnJheSIsImkiLCJrYnVja2V0IiwiZiIsIkhlbHBlciIsInJlc3BvbmRlciIsIktSZXNwb25kZXIiLCJwZWVyIiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZWplY3QiLCJ0aW1lb3V0Iiwic2V0VGltZW91dCIsImlzRGlzY29ubmVjdGVkIiwiY2xlYW5EaXNjb24iLCJjYWxsYmFjayIsImNsZWFyVGltZW91dCIsInNlbmREYXRhIiwidGFyZ2V0Iiwic2VuZCIsImRlZiIsIlBJTkciLCJzZW5kZXIiLCJrZXkiLCJ2YWx1ZSIsIlNUT1JFIiwiZ2V0Q2xvc2VFc3RQZWVyIiwic3RvcmVGb3JtYXQiLCJ0YXJnZXRJZCIsInN0YXRlIiwidGFyZ2V0S2V5IiwiRklORE5PREUiLCJjYiIsImRvRmluZHZhbHVlIiwiRklORFZBTFVFIiwiZXYiLCJvbiIsImRhdGEiLCJpc05vZGVFeGlzdCIsIm51bSIsInB1c2giLCJnZXRBbGxQZWVySWRzIiwiZmluZE5ld1BlZXIiLCJnZXRLYnVja2V0TnVtIiwiZGF0YWxpbmsiLCJuZXR3b3JrIiwiSlNPTiIsInBhcnNlIiwicmVzcG9uc2UiLCJ0eXBlIiwibWFpbnRhaW4iLCJpbngiLCJmb3JFYWNoIiwic3BsaWNlIiwibGVuZ3RoIiwicGluZyIsImNhdGNoIiwicmVzdWx0IiwicHJveHkiLCJyIiwicmVmIiwiV2ViUlRDIiwibWFrZU9mZmVyIiwiY29ubmVjdGluZyIsInNkcCIsIl8iLCJzdG9yZSIsImFkZGtub2RlIiwibWFrZUFuc3dlciIsImdldFBlZXJGcm9tbm9kZUlkIiwiU0VORCIsImRhdGFjaGFubmVsIiwiZGF0YUxpbmsiLCJuZXR3b3JrTGF5ZXIiLCJzdHJpbmdpZnkiLCJkYXRhTGlzdCIsImluY2x1ZGVzIiwib25SZXF1ZXN0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUxBQSxPQUFPLENBQUMsZ0JBQUQsQ0FBUDs7SUFPcUJDLFE7OztBQXdCbkIsb0JBQVlDLE9BQVosRUFBNkI7QUFBQTs7QUFBQTs7QUFBQTs7QUFBQTs7QUFBQTs7QUFBQTs7QUFBQSxzQ0FsQk4sRUFrQk07O0FBQUEsMENBakJVLEVBaUJWOztBQUFBLGlDQWhCSSxFQWdCSjs7QUFBQSxtQ0FmckI7QUFDTkMsTUFBQUEsT0FBTyxFQUFFLEtBREg7QUFFTkMsTUFBQUEsUUFBUSxFQUFFLEVBRko7QUFHTkMsTUFBQUEsSUFBSSxFQUFFO0FBSEEsS0FlcUI7O0FBQUEsc0NBVGxCO0FBQ1RDLE1BQUFBLFNBQVMsRUFBRSxtQkFBQ0MsQ0FBRCxFQUFhLENBQUUsQ0FEakI7QUFFVEMsTUFBQUEsZ0JBQWdCLEVBQUUsMEJBQUNELENBQUQsRUFBYSxDQUFFLENBRnhCO0FBR1RFLE1BQUFBLFNBQVMsRUFBRSxtQkFBQ0YsQ0FBRCxFQUFhLENBQUUsQ0FIakI7QUFJVEcsTUFBQUEsV0FBVyxFQUFFLHFCQUFDSCxDQUFELEVBQWEsQ0FBRSxDQUpuQjtBQUtUSSxNQUFBQSxVQUFVLEVBQUUsb0JBQUNKLENBQUQsRUFBYSxDQUFFLENBTGxCO0FBTVRLLE1BQUFBLE1BQU0sRUFBRSxrQkFBTSxDQUFFO0FBTlAsS0FTa0I7O0FBQzNCQyxJQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWSxXQUFaLEVBQXlCWixPQUF6QjtBQUNBLFNBQUthLENBQUwsR0FBUyxFQUFUO0FBQ0EsU0FBS0MsTUFBTCxHQUFjZCxPQUFkO0FBRUEsU0FBS2UsUUFBTCxHQUFnQixJQUFJQyxLQUFKLENBQVUsR0FBVixDQUFo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MUIsSUFBSSxDQUFDNEIsU0FBTCxDQUFlLEtBQUtDLFFBQXBCLEVBQThCQyxRQUE5QixDQUF1Q0gsWUFBWSxDQUFDdEYsSUFBcEQsQ0FBTCxFQUFnRTtBQUM5RCxhQUFLd0YsUUFBTCxDQUFjbkMsSUFBZCxDQUFtQmlDLFlBQVksQ0FBQ3RGLElBQWhDO0FBQ0EsYUFBS2dCLENBQUwsQ0FBT1csV0FBUDtBQUNBLGFBQUsrRCxTQUFMLENBQWVMLFFBQWY7QUFDQSxhQUFLekQsUUFBTCxDQUFjeEIsU0FBZCxDQUF3QmtGLFlBQXhCO0FBQ0Q7QUFDRiIsInNvdXJjZXNDb250ZW50IjpbInJlcXVpcmUoXCJiYWJlbC1wb2x5ZmlsbFwiKTtcbmltcG9ydCBXZWJSVEMgZnJvbSBcInNpbXBsZS1kYXRhY2hhbm5lbC9saWIvTm9kZVJUQ1wiO1xuaW1wb3J0IEhlbHBlciBmcm9tIFwiLi9rVXRpbFwiO1xuaW1wb3J0IEtSZXNwb25kZXIgZnJvbSBcIi4va1Jlc3BvbmRlclwiO1xuaW1wb3J0IGRlZiwgeyBuZXR3b3JrRm9ybWF0IH0gZnJvbSBcIi4vS0NvbnN0XCI7XG5pbXBvcnQgeyBkaXN0YW5jZSB9IGZyb20gXCJrYWQtZGlzdGFuY2VcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgS2FkZW1saWEge1xuICBub2RlSWQ6IHN0cmluZztcbiAgazogbnVtYmVyO1xuICBrYnVja2V0czogQXJyYXk8QXJyYXk8V2ViUlRDPj47XG4gIGY6IEhlbHBlcjtcbiAgcmVzcG9uZGVyOiBLUmVzcG9uZGVyO1xuICBkYXRhTGlzdDogQXJyYXk8YW55PiA9IFtdO1xuICBrZXlWYWx1ZUxpc3Q6IHsgW2tleTogc3RyaW5nXTogYW55IH0gPSB7fTtcbiAgcmVmOiB7IFtrZXk6IHN0cmluZ106IFdlYlJUQyB9ID0ge307XG4gIHN0YXRlID0ge1xuICAgIGlzT2ZmZXI6IGZhbHNlLFxuICAgIGZpbmROb2RlOiBcIlwiLFxuICAgIGhhc2g6IHt9XG4gIH07XG5cbiAgY2FsbGJhY2sgPSB7XG4gICAgb25BZGRQZWVyOiAodj86IGFueSkgPT4ge30sXG4gICAgb25QZWVyRGlzY29ubmVjdDogKHY/OiBhbnkpID0+IHt9LFxuICAgIG9uQ29tbWFuZDogKHY/OiBhbnkpID0+IHt9LFxuICAgIG9uRmluZFZhbHVlOiAodj86IGFueSkgPT4ge30sXG4gICAgb25GaW5kTm9kZTogKHY/OiBhbnkpID0+IHt9LFxuICAgIG9uUGluZzogKCkgPT4ge31cbiAgfTtcblxuICBjb25zdHJ1Y3Rvcihfbm9kZUlkOiBzdHJpbmcpIHtcbiAgICBjb25zb2xlLmxvZyhcInN0YXJ0IGthZFwiLCBfbm9kZUlkKTtcbiAgICB0aGlzLmsgPSAyMDtcbiAgICB0aGlzLm5vZGVJZCA9IF9ub2RlSWQ7XG5cbiAgICB0aGlzLmtidWNrZXRzID0gbmV3IEFycmF5KDE2MCk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCAxNjA7IGkrKykge1xuICAgICAgbGV0IGtidWNrZXQ6IEFycmF5PGFueT4gPSBbXTtcbiAgICAgIHRoaXMua2J1Y2tldHNbaV0gPSBrYnVja2V0O1xuICAgIH1cblxuICAgIHRoaXMuZiA9IG5ldyBIZWxwZXIodGhpcy5rLCB0aGlzLmtidWNrZXRzKTtcbiAgICB0aGlzLnJlc3BvbmRlciA9IG5ldyBLUmVzcG9uZGVyKHRoaXMpO1xuICB9XG5cbiAgcGluZyhwZWVyOiBXZWJSVEMpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY29uc29sZS5sb2coXCJwaW5nXCIsIHBlZXIubm9kZUlkKTtcblxuICAgICAgLy8xMOenkuS7peWGheOBq3Bpbmfjga7jg5Xjg6njgrDjgYznq4vjgabjgbDmiJDlip9cbiAgICAgIGNvbnN0IHRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgY29uc29sZS5sb2coXCJwaW5nIGZhaWxcIiwgcGVlci5ub2RlSWQpO1xuICAgICAgICBwZWVyLmlzRGlzY29ubmVjdGVkID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5mLmNsZWFuRGlzY29uKCk7XG4gICAgICAgIHRoaXMuY2FsbGJhY2sub25QZWVyRGlzY29ubmVjdCh0aGlzLmtidWNrZXRzKTtcbiAgICAgICAgcmVqZWN0KFwicGluZyB0aW1lb3V0IFwiICsgcGVlci5ub2RlSWQpO1xuICAgICAgfSwgMTAgKiAxMDAwKTtcblxuICAgICAgLy9waW5n5a6M5LqG5pmC44Gu44Kz44O844Or44OQ44OD44KvXG4gICAgICB0aGlzLmNhbGxiYWNrLm9uUGluZyA9ICgpID0+IHtcbiAgICAgICAgY29uc29sZS5sb2coXCJwaW5nIHN1Y2Nlc3NcIiwgcGVlci5ub2RlSWQpO1xuICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dCk7XG4gICAgICAgIHJlc29sdmUodHJ1ZSk7XG4gICAgICB9O1xuXG4gICAgICAvL+iHquWIhuOBruODjuODvOODiUlE44KS5ZCr44KB44KLXG4gICAgICBjb25zdCBzZW5kRGF0YSA9IHsgdGFyZ2V0OiBwZWVyLm5vZGVJZCB9O1xuICAgICAgLy9waW5n44KS6YCB44KLXG4gICAgICBwZWVyLnNlbmQobmV0d29ya0Zvcm1hdCh0aGlzLm5vZGVJZCwgZGVmLlBJTkcsIHNlbmREYXRhKSwgXCJrYWRcIik7XG4gICAgfSk7XG4gIH1cblxuICBzdG9yZUZvcm1hdChzZW5kZXI6IHN0cmluZywga2V5OiBzdHJpbmcsIHZhbHVlOiBhbnkpIHtcbiAgICBjb25zdCBzZW5kRGF0YSA9IHtcbiAgICAgIHNlbmRlcixcbiAgICAgIGtleSxcbiAgICAgIHZhbHVlXG4gICAgfTtcbiAgICByZXR1cm4gbmV0d29ya0Zvcm1hdCh0aGlzLm5vZGVJZCwgZGVmLlNUT1JFLCBzZW5kRGF0YSk7XG4gIH1cblxuICBhc3luYyBzdG9yZShzZW5kZXI6IHN0cmluZywga2V5OiBzdHJpbmcsIHZhbHVlOiBhbnkpIHtcbiAgICAvL+iHquWIhuOBq+S4gOeVqui/keOBhOODlOOCouOCkuWPluW+l1xuICAgIGNvbnN0IHBlZXIgPSB0aGlzLmYuZ2V0Q2xvc2VFc3RQZWVyKGtleSk7XG4gICAgaWYgKCFwZWVyKSByZXR1cm47XG4gICAgY29uc29sZS5sb2coZGVmLlNUT1JFLCBcIm5leHRcIiwgcGVlci5ub2RlSWQsIFwidGFyZ2V0XCIsIGtleSk7XG4gICAgcGVlci5zZW5kKHRoaXMuc3RvcmVGb3JtYXQoc2VuZGVyLCBrZXksIHZhbHVlKSwgXCJrYWRcIik7XG4gICAgY29uc29sZS5sb2coXCJzdG9yZSBkb25lXCIsIHRoaXMuc3RvcmVGb3JtYXQoc2VuZGVyLCBrZXksIHZhbHVlKSk7XG4gIH1cblxuICBhc3luYyBmaW5kTm9kZSh0YXJnZXRJZDogc3RyaW5nLCBwZWVyOiBXZWJSVEMpIHtcbiAgICBjb25zb2xlLmxvZyhcImZpbmRub2RlXCIpO1xuICAgIC8v5o6l57aa56K66KqNXG5cbiAgICBjb25zb2xlLmxvZyhcImZpbmRub2RlXCIsIHRhcmdldElkKTtcbiAgICB0aGlzLnN0YXRlLmZpbmROb2RlID0gdGFyZ2V0SWQ7XG4gICAgY29uc3Qgc2VuZERhdGEgPSB7IHRhcmdldEtleTogdGFyZ2V0SWQgfTtcbiAgICAvL+mAgeOCi1xuICAgIHBlZXIuc2VuZChuZXR3b3JrRm9ybWF0KHRoaXMubm9kZUlkLCBkZWYuRklORE5PREUsIHNlbmREYXRhKSwgXCJrYWRcIik7XG4gIH1cblxuICBmaW5kVmFsdWUoa2V5OiBzdHJpbmcsIGNiID0gKHZhbHVlOiBhbnkpID0+IHt9KSB7XG4gICAgdGhpcy5jYWxsYmFjay5vbkZpbmRWYWx1ZSA9IGNiO1xuICAgIC8va2V544Gr6L+R44GE44OU44Ki44KS5Y+W5b6XXG4gICAgLy8gY29uc3QgcGVlcnMgPSB0aGlzLmYuZ2V0Q2xvc2VQZWVycyhrZXkpO1xuICAgIC8vIHBlZXJzLmZvckVhY2gocGVlciA9PiB7XG4gICAgLy8gICB0aGlzLmRvRmluZHZhbHVlKGtleSwgcGVlcik7XG4gICAgLy8gfSk7XG4gICAgY29uc3QgcGVlciA9IHRoaXMuZi5nZXRDbG9zZUVzdFBlZXIoa2V5KTtcbiAgICBpZiAoIXBlZXIpIHJldHVybjtcbiAgICB0aGlzLmRvRmluZHZhbHVlKGtleSwgcGVlcik7XG4gIH1cblxuICBhc3luYyBkb0ZpbmR2YWx1ZShrZXk6IHN0cmluZywgcGVlcjogV2ViUlRDKSB7XG4gICAgcGVlci5zZW5kKFxuICAgICAgbmV0d29ya0Zvcm1hdCh0aGlzLm5vZGVJZCwgZGVmLkZJTkRWQUxVRSwge1xuICAgICAgICB0YXJnZXRLZXk6IGtleVxuICAgICAgfSksXG4gICAgICBcImthZFwiXG4gICAgKTtcbiAgfVxuXG4gIGFkZGtub2RlKHBlZXI6IFdlYlJUQykge1xuICAgIHBlZXIuZXYub24oXCJkYXRhXCIsIChkYXRhOiBhbnkpID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKFwib24gZGF0YVwiLCBkYXRhKTtcbiAgICAgIHRoaXMub25Db21tYW5kKGRhdGEpO1xuICAgIH0pO1xuXG4gICAgcGVlci5ldi5vbihcImRpc2Nvbm5lY3RcIiwgKCkgPT4ge1xuICAgICAgY29uc29sZS5sb2coXCJrYWQgbm9kZSBkaXNjb25uZWN0ZWRcIik7XG4gICAgICB0aGlzLmYuY2xlYW5EaXNjb24oKTtcbiAgICB9KTtcblxuICAgIGlmICghdGhpcy5mLmlzTm9kZUV4aXN0KHBlZXIubm9kZUlkKSkge1xuICAgICAgLy/oh6rliIbjga7jg47jg7zjg4lJROOBqOi/veWKoOOBmeOCi+ODjuODvOODiUlE44Gu6Led6ZuiXG4gICAgICBjb25zdCBudW0gPSBkaXN0YW5jZSh0aGlzLm5vZGVJZCwgcGVlci5ub2RlSWQpO1xuICAgICAgLy9rYnVja2V0c+OBruipsuW9k+OBmeOCi+i3nembouOBrmtidWNrZXTjgpLlkbzjgbPlh7rjgZlcbiAgICAgIGNvbnN0IGtidWNrZXQgPSB0aGlzLmtidWNrZXRzW251bV07XG4gICAgICAvL+ipsuW9k+OBmeOCi2tidWNrZXTjgavmlrDjgZfjgYTjg5TjgqLjgpLliqDjgYjjgotcbiAgICAgIGtidWNrZXQucHVzaChwZWVyKTtcblxuICAgICAgY29uc29sZS5sb2coXCJhZGRrbm9kZSBrYnVja2V0c1wiLCBcInBlZXIubm9kZUlkOlwiLCBwZWVyLm5vZGVJZCk7XG4gICAgICBjb25zb2xlLmxvZyh0aGlzLmYuZ2V0QWxsUGVlcklkcygpKTtcblxuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHRoaXMuZmluZE5ld1BlZXIocGVlcik7XG4gICAgICB9LCAxMDAwKTtcblxuICAgICAgdGhpcy5jYWxsYmFjay5vbkFkZFBlZXIodGhpcy5mLmdldEFsbFBlZXJJZHMoKSk7XG4gICAgfVxuICB9XG5cbiAgZmluZE5ld1BlZXIocGVlcjogV2ViUlRDKSB7XG4gICAgaWYgKHRoaXMuZi5nZXRLYnVja2V0TnVtKCkgPCB0aGlzLmspIHtcbiAgICAgIC8v6Ieq6Lqr44Gu44OO44O844OJSUTjgpJrZXnjgajjgZfjgaZGSU5EX05PREVcbiAgICAgIHRoaXMuZmluZE5vZGUodGhpcy5ub2RlSWQsIHBlZXIpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmxvZyhcImtidWNrZXQgcmVhZHlcIiwgdGhpcy5mLmdldEtidWNrZXROdW0oKSk7XG4gICAgfVxuICB9XG5cbiAgb25SZXF1ZXN0KGRhdGFsaW5rOiBzdHJpbmcpIHtcbiAgICBjb25zdCBuZXR3b3JrID0gSlNPTi5wYXJzZShkYXRhbGluayk7XG4gICAgdGhpcy5yZXNwb25kZXIucmVzcG9uc2UobmV0d29yay50eXBlLCBuZXR3b3JrKTtcbiAgICB0aGlzLm1haW50YWluKG5ldHdvcmspO1xuICB9XG5cbiAgYXN5bmMgbWFpbnRhaW4obmV0d29yazogYW55KSB7XG4gICAgY29uc3QgaW54ID0gZGlzdGFuY2UodGhpcy5ub2RlSWQsIG5ldHdvcmsubm9kZUlkKTtcbiAgICBjb25zdCBrYnVja2V0ID0gdGhpcy5rYnVja2V0c1tpbnhdO1xuXG4gICAgLy/pgIHkv6HlhYPjgYzoqbLlvZPjgZnjgotrLWJ1Y2tldOOBruS4reOBq+OBguOBo+OBn+WgtOWQiFxuICAgIC8v44Gd44Gu44OO44O844OJ44KSay1idWNrZXTjga7mnKvlsL7jgavnp7vjgZlcbiAgICBrYnVja2V0LmZvckVhY2goKHBlZXIsIGkpID0+IHtcbiAgICAgIGlmIChwZWVyLm5vZGVJZCA9PT0gbmV0d29yay5ub2RlSWQpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJtYWludGFpblwiLCBcIk1vdmVzwqBpdMKgdG/CoHRoZcKgdGFpbMKgb2bCoHRoZcKgbGlzdFwiKTtcbiAgICAgICAga2J1Y2tldC5zcGxpY2UoaSwgMSk7XG4gICAgICAgIGtidWNrZXQucHVzaChwZWVyKTtcbiAgICAgICAgcmV0dXJuIDA7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvL2stYnVja2V044GM44GZ44Gn44Gr5rqA5p2v44Gq5aC05ZCI44CBXG4gICAgLy/jgZ3jga5rLWJ1Y2tldOS4reOBruWFiOmgreOBruODjuODvOODieOBjOOCquODs+ODqeOCpOODs+OBquOCieWFiOmgreOBruODjuODvOODieOCkuaui+OBmVxuICAgIGlmIChrYnVja2V0Lmxlbmd0aCA+IHRoaXMuaykge1xuICAgICAgY29uc29sZS5sb2coXCJtYWludGFpblwiLCBcImJ1Y2tldCBmdWxsZWRcIiwgbmV0d29yay5ub2RlSWQpO1xuICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5waW5nKGtidWNrZXRbMF0pLmNhdGNoKGNvbnNvbGUubG9nKTtcbiAgICAgIGlmICghcmVzdWx0KSB7XG4gICAgICAgIGtidWNrZXQuc3BsaWNlKDAsIDEpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIG9mZmVyKHRhcmdldDogc3RyaW5nLCBwcm94eSA9IG51bGwpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY29uc3QgciA9IHRoaXMucmVmO1xuICAgICAgY29uc3QgcGVlciA9IChyW3RhcmdldF0gPSBuZXcgV2ViUlRDKCkpO1xuICAgICAgcGVlci5tYWtlT2ZmZXIoKTtcbiAgICAgIHBlZXIuY29ubmVjdGluZyh0YXJnZXQpO1xuXG4gICAgICBjb25zdCB0aW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHJlamVjdChcImthZCBvZmZlciB0aW1lb3V0XCIpO1xuICAgICAgfSwgMTAgKiAxMDAwKTtcblxuICAgICAgcGVlci5ldi5vbihcInNpZ25hbFwiLCAoc2RwOiBzdHJpbmcpID0+IHtcbiAgICAgICAgY29uc29sZS5sb2coXCJrYWQgb2ZmZXIgc3RvcmVcIiwgdGFyZ2V0KTtcbiAgICAgICAgY29uc3QgXyA9IHRoaXMuZi5nZXRDbG9zZUVzdFBlZXIodGFyZ2V0KTtcbiAgICAgICAgaWYgKCFfKSByZXR1cm47XG4gICAgICAgIGlmIChfLm5vZGVJZCAhPT0gdGFyZ2V0KVxuICAgICAgICAgIHRoaXMuc3RvcmUodGhpcy5ub2RlSWQsIHRhcmdldCwgeyBzZHAsIHByb3h5IH0pO1xuICAgICAgfSk7XG5cbiAgICAgIHBlZXIuZXYub24oXCJjb25uZWN0XCIsICgpID0+IHtcbiAgICAgICAgY29uc29sZS5sb2coXCJrYWQgb2ZmZXIgY29ubmVjdGVkXCIsIHRhcmdldCk7XG4gICAgICAgIHRoaXMuYWRka25vZGUocGVlcik7XG4gICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KTtcbiAgICAgICAgcmVzb2x2ZSh0cnVlKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgYW5zd2VyKHRhcmdldDogc3RyaW5nLCBzZHA6IHN0cmluZywgcHJveHk6IHN0cmluZykge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjb25zdCByID0gdGhpcy5yZWY7XG4gICAgICBjb25zdCBwZWVyID0gKHJbdGFyZ2V0XSA9IG5ldyBXZWJSVEMoKSk7XG4gICAgICBwZWVyLm1ha2VBbnN3ZXIoc2RwKTtcbiAgICAgIHBlZXIuY29ubmVjdGluZyh0YXJnZXQpO1xuICAgICAgY29uc29sZS5sb2coXCJrYWQgYW5zd2VyXCIsIHRhcmdldCk7XG5cbiAgICAgIGNvbnN0IHRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgcmVqZWN0KFwia2FkIGFuc3dlciB0aW1lb3V0XCIpO1xuICAgICAgfSwgMTAgKiAxMDAwKTtcblxuICAgICAgcGVlci5ldi5vbihcInNpZ25hbFwiLCAoc2RwOiBzdHJpbmcpID0+IHtcbiAgICAgICAgY29uc3QgXyA9IHRoaXMuZi5nZXRQZWVyRnJvbW5vZGVJZChwcm94eSk7XG4gICAgICAgIGlmIChfKSBfLnNlbmQodGhpcy5zdG9yZUZvcm1hdCh0aGlzLm5vZGVJZCwgdGFyZ2V0LCB7IHNkcCB9KSwgXCJrYWRcIik7XG4gICAgICB9KTtcblxuICAgICAgcGVlci5ldi5vbihcImNvbm5lY3RcIiwgKCkgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZyhcImthZCBhbnN3ZXIgY29ubmVjdGVkXCIsIHRhcmdldCk7XG4gICAgICAgIHRoaXMuYWRka25vZGUocGVlcik7XG4gICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KTtcbiAgICAgICAgcmVzb2x2ZSh0cnVlKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgc2VuZCh0YXJnZXQ6IHN0cmluZywgZGF0YTogYW55KSB7XG4gICAgY29uc3QgXyA9IHRoaXMuZi5nZXRQZWVyRnJvbW5vZGVJZCh0YXJnZXQpO1xuICAgIGlmIChfKSBfLnNlbmQobmV0d29ya0Zvcm1hdCh0aGlzLm5vZGVJZCwgZGVmLlNFTkQsIGRhdGEpLCBcImthZFwiKTtcbiAgfVxuXG4gIG9uQ29tbWFuZChkYXRhY2hhbm5lbDogYW55KSB7XG4gICAgY29uc3QgZGF0YUxpbmsgPSBkYXRhY2hhbm5lbC5kYXRhO1xuICAgIGNvbnN0IG5ldHdvcmtMYXllciA9IEpTT04ucGFyc2UoZGF0YUxpbmspO1xuXG4gICAgaWYgKCFKU09OLnN0cmluZ2lmeSh0aGlzLmRhdGFMaXN0KS5pbmNsdWRlcyhuZXR3b3JrTGF5ZXIuaGFzaCkpIHtcbiAgICAgIHRoaXMuZGF0YUxpc3QucHVzaChuZXR3b3JrTGF5ZXIuaGFzaCk7XG4gICAgICB0aGlzLmYuY2xlYW5EaXNjb24oKTtcbiAgICAgIHRoaXMub25SZXF1ZXN0KGRhdGFMaW5rKTtcbiAgICAgIHRoaXMuY2FsbGJhY2sub25Db21tYW5kKG5ldHdvcmtMYXllcik7XG4gICAgfVxuICB9XG59XG4iXX0=
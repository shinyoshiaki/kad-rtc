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
      isFirstConnect: true,
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
      console.log("kad connect");
      if (this.state.isFirstConnect) this.callback.onConnect();
      this.state.isFirstConnect = false;
      this.addknode(peer);
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
          var buffer = Buffer.from(message.data);
          console.log({
            buffer: buffer
          });

          try {
            console.log("oncommand kad", {
              message: message
            });
            var networkLayer = bson.deserialize(buffer);

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9rYWQva2FkZW1saWEudHMiXSwibmFtZXMiOlsicmVxdWlyZSIsImJzb24iLCJCU09OIiwiS2FkZW1saWEiLCJfbm9kZUlkIiwib3B0IiwiaXNGaXJzdENvbm5lY3QiLCJpc09mZmVyIiwiZmluZE5vZGUiLCJoYXNoIiwib25Db25uZWN0Iiwib25BZGRQZWVyIiwidiIsIm9uUGVlckRpc2Nvbm5lY3QiLCJfb25GaW5kVmFsdWUiLCJvbkZpbmROb2RlIiwib25TdG9yZSIsIm9uQXBwIiwiY29uc29sZSIsImxvZyIsImsiLCJrTGVuZ3RoIiwibm9kZUlkIiwia2J1Y2tldHMiLCJBcnJheSIsImkiLCJrYnVja2V0IiwiZiIsIkhlbHBlciIsInJlc3BvbmRlciIsIktSZXNwb25kZXIiLCJzZW5kZXIiLCJrZXkiLCJ2YWx1ZSIsInBlZXIiLCJnZXRDbG9zZUVzdFBlZXIiLCJkZWYiLCJTVE9SRSIsInNlbmREYXRhIiwibmV0d29yayIsInNlbmQiLCJrZXlWYWx1ZUxpc3QiLCJjYWxsYmFjayIsImNodW5rcyIsImZvckVhY2giLCJjaHVuayIsImluZGV4Iiwic2l6ZSIsImxlbmd0aCIsIlNUT1JFX0NIVU5LUyIsInRhcmdldElkIiwic3RhdGUiLCJ0YXJnZXRLZXkiLCJGSU5ETk9ERSIsIlByb21pc2UiLCJyZXNvbHZlIiwicmVqZWN0IiwidGltZW91dCIsInNldFRpbWVvdXQiLCJjbGVhclRpbWVvdXQiLCJwZWVycyIsImdldENsb3NlUGVlcnMiLCJkb0ZpbmR2YWx1ZSIsIkZJTkRWQUxVRSIsImFkZGtub2RlIiwiZXZlbnRzIiwiZGF0YSIsInJhdyIsIm9uQ29tbWFuZCIsImRpc2Nvbm5lY3QiLCJjbGVhbkRpc2NvbiIsImdldEFsbFBlZXJJZHMiLCJpc05vZGVFeGlzdCIsIm51bSIsInB1c2giLCJmaW5kTmV3UGVlciIsImdldEtidWNrZXROdW0iLCJpbngiLCJzcGxpY2UiLCJzaGlmdCIsInRhcmdldCIsInByb3h5IiwiciIsInJlZiIsIldlYlJUQyIsIm1ha2VPZmZlciIsInNpZ25hbCIsInNkcCIsIl8iLCJzdG9yZSIsImNvbm5lY3QiLCJtYWtlQW5zd2VyIiwiZ2V0UGVlckZyb21ub2RlSWQiLCJTRU5EIiwibWVzc2FnZSIsImxhYmVsIiwiYnVmZmVyIiwiQnVmZmVyIiwiZnJvbSIsIm5ldHdvcmtMYXllciIsImRlc2VyaWFsaXplIiwiSlNPTiIsInN0cmluZ2lmeSIsImRhdGFMaXN0IiwiaW5jbHVkZXMiLCJvblJlcXVlc3QiLCJlcnJvciIsInJlc3BvbnNlIiwidHlwZSIsIm1haW50YWluIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBRUE7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQVBBQSxPQUFPLENBQUMsZ0JBQUQsQ0FBUDs7QUFTQSxJQUFNQyxJQUFJLEdBQUcsSUFBSUMsVUFBSixFQUFiOztJQUVxQkMsUTs7O0FBMkJuQixvQkFBWUMsT0FBWixFQUE2QkMsR0FBN0IsRUFBeUQ7QUFBQTs7QUFBQTs7QUFBQTs7QUFBQTs7QUFBQTs7QUFBQTs7QUFBQSxzQ0FyQmxDLEVBcUJrQzs7QUFBQSwwQ0FwQmxCLEVBb0JrQjs7QUFBQSxpQ0FuQnhCLEVBbUJ3Qjs7QUFBQSxvQ0FsQmpCLEVBa0JpQjs7QUFBQSxtQ0FqQmpEO0FBQ05DLE1BQUFBLGNBQWMsRUFBRSxJQURWO0FBRU5DLE1BQUFBLE9BQU8sRUFBRSxLQUZIO0FBR05DLE1BQUFBLFFBQVEsRUFBRSxFQUhKO0FBSU5DLE1BQUFBLElBQUksRUFBRTtBQUpBLEtBaUJpRDs7QUFBQSxzQ0FWOUM7QUFDVEMsTUFBQUEsU0FBUyxFQUFFLHFCQUFNLENBQUUsQ0FEVjtBQUVUQyxNQUFBQSxTQUFTLEVBQUUsbUJBQUNDLENBQUQsRUFBYSxDQUFFLENBRmpCO0FBR1RDLE1BQUFBLGdCQUFnQixFQUFFLDBCQUFDRCxDQUFELEVBQWEsQ0FBRSxDQUh4QjtBQUlURSxNQUFBQSxZQUFZLEVBQUUsc0JBQUNGLENBQUQsRUFBYSxDQUFFLENBSnBCO0FBS1RH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ZXF1aXJlKFwiYmFiZWwtcG9seWZpbGxcIik7XG5pbXBvcnQgV2ViUlRDIGZyb20gXCJ3ZWJydGM0bWVcIjtcbmltcG9ydCBIZWxwZXIgZnJvbSBcIi4va1V0aWxcIjtcbmltcG9ydCBLUmVzcG9uZGVyIGZyb20gXCIuL2tSZXNwb25kZXJcIjtcbmltcG9ydCBkZWYsIHsgbmV0d29ya0Zvcm1hdCB9IGZyb20gXCIuL0tDb25zdFwiO1xuaW1wb3J0IHsgZGlzdGFuY2UgfSBmcm9tIFwia2FkLWRpc3RhbmNlXCI7XG5pbXBvcnQgeyBtZXNzYWdlIH0gZnJvbSBcIndlYnJ0YzRtZS9saWIvaW50ZXJmYWNlXCI7XG5pbXBvcnQgeyBCU09OIH0gZnJvbSBcImJzb25cIjtcblxuY29uc3QgYnNvbiA9IG5ldyBCU09OKCk7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEthZGVtbGlhIHtcbiAgbm9kZUlkOiBzdHJpbmc7XG4gIGs6IG51bWJlcjtcbiAga2J1Y2tldHM6IEFycmF5PEFycmF5PFdlYlJUQz4+O1xuICBmOiBIZWxwZXI7XG4gIHJlc3BvbmRlcjogS1Jlc3BvbmRlcjtcbiAgZGF0YUxpc3Q6IEFycmF5PGFueT4gPSBbXTtcbiAga2V5VmFsdWVMaXN0OiB7IFtrZXk6IHN0cmluZ106IGFueSB9ID0ge307XG4gIHJlZjogeyBba2V5OiBzdHJpbmddOiBXZWJSVEMgfSA9IHt9O1xuICBidWZmZXI6IHsgW2tleTogc3RyaW5nXTogQXJyYXk8YW55PiB9ID0ge307XG4gIHN0YXRlID0ge1xuICAgIGlzRmlyc3RDb25uZWN0OiB0cnVlLFxuICAgIGlzT2ZmZXI6IGZhbHNlLFxuICAgIGZpbmROb2RlOiBcIlwiLFxuICAgIGhhc2g6IHt9XG4gIH07XG5cbiAgY2FsbGJhY2sgPSB7XG4gICAgb25Db25uZWN0OiAoKSA9PiB7fSxcbiAgICBvbkFkZFBlZXI6ICh2PzogYW55KSA9PiB7fSxcbiAgICBvblBlZXJEaXNjb25uZWN0OiAodj86IGFueSkgPT4ge30sXG4gICAgX29uRmluZFZhbHVlOiAodj86IGFueSkgPT4ge30sXG4gICAgb25GaW5kTm9kZTogKHY/OiBhbnkpID0+IHt9LFxuICAgIG9uU3RvcmU6ICh2PzogYW55KSA9PiB7fSxcbiAgICBvbkFwcDogKHY/OiBhbnkpID0+IHt9XG4gIH07XG5cbiAgY29uc3RydWN0b3IoX25vZGVJZDogc3RyaW5nLCBvcHQ/OiB7IGtMZW5ndGg/OiBudW1iZXIgfSkge1xuICAgIGNvbnNvbGUubG9nKFwic3RhcnQga2FkXCIsIF9ub2RlSWQpO1xuICAgIHRoaXMuayA9IDIwO1xuICAgIGlmIChvcHQpIGlmIChvcHQua0xlbmd0aCkgdGhpcy5rID0gb3B0LmtMZW5ndGg7XG4gICAgdGhpcy5ub2RlSWQgPSBfbm9kZUlkO1xuXG4gICAgdGhpcy5rYnVja2V0cyA9IG5ldyBBcnJheSgxNjApO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgMTYwOyBpKyspIHtcbiAgICAgIGxldCBrYnVja2V0OiBBcnJheTxhbnk+ID0gW107XG4gICAgICB0aGlzLmtidWNrZXRzW2ldID0ga2J1Y2tldDtcbiAgICB9XG5cbiAgICB0aGlzLmYgPSBuZXcgSGVscGVyKHRoaXMuaywgdGhpcy5rYnVja2V0cyk7XG4gICAgdGhpcy5yZXNwb25kZXIgPSBuZXcgS1Jlc3BvbmRlcih0aGlzKTtcbiAgfVxuXG4gIHN0b3JlKHNlbmRlcjogc3RyaW5nLCBrZXk6IHN0cmluZywgdmFsdWU6IGFueSkge1xuICAgIC8v6Ieq5YiG44Gr5LiA55Wq6L+R44GE44OU44Ki44KS5Y+W5b6XXG4gICAgY29uc3QgcGVlciA9IHRoaXMuZi5nZXRDbG9zZUVzdFBlZXIoa2V5KTtcbiAgICBpZiAoIXBlZXIpIHJldHVybjtcbiAgICBjb25zb2xlLmxvZyhkZWYuU1RPUkUsIFwibmV4dFwiLCBwZWVyLm5vZGVJZCwgXCJ0YXJnZXRcIiwga2V5KTtcbiAgICBjb25zdCBzZW5kRGF0YTogU3RvcmVGb3JtYXQgPSB7IHNlbmRlciwga2V5LCB2YWx1ZSB9O1xuICAgIGNvbnN0IG5ldHdvcmsgPSBuZXR3b3JrRm9ybWF0KHRoaXMubm9kZUlkLCBkZWYuU1RPUkUsIHNlbmREYXRhKTtcbiAgICBwZWVyLnNlbmQobmV0d29yaywgXCJrYWRcIik7XG4gICAgY29uc29sZS5sb2coXCJzdG9yZSBkb25lXCIsIHsgbmV0d29yayB9KTtcbiAgICB0aGlzLmtleVZhbHVlTGlzdFtrZXldID0gdmFsdWU7XG4gICAgdGhpcy5jYWxsYmFjay5vblN0b3JlKHRoaXMua2V5VmFsdWVMaXN0KTtcbiAgfVxuXG4gIHN0b3JlQ2h1bmtzKHNlbmRlcjogc3RyaW5nLCBrZXk6IHN0cmluZywgY2h1bmtzOiBBcnJheUJ1ZmZlcltdKSB7XG4gICAgY29uc3QgcGVlciA9IHRoaXMuZi5nZXRDbG9zZUVzdFBlZXIoa2V5KTtcbiAgICBpZiAoIXBlZXIpIHJldHVybjtcbiAgICBjaHVua3MuZm9yRWFjaCgoY2h1bmssIGkpID0+IHtcbiAgICAgIGNvbnN0IHNlbmREYXRhOiBTdG9yZUNodW5rcyA9IHtcbiAgICAgICAgc2VuZGVyOiB0aGlzLm5vZGVJZCxcbiAgICAgICAga2V5LFxuICAgICAgICB2YWx1ZTogY2h1bmssXG4gICAgICAgIGluZGV4OiBpLFxuICAgICAgICBzaXplOiBjaHVua3MubGVuZ3RoXG4gICAgICB9O1xuICAgICAgY29uc3QgbmV0d29yayA9IG5ldHdvcmtGb3JtYXQoc2VuZGVyLCBkZWYuU1RPUkVfQ0hVTktTLCBzZW5kRGF0YSk7XG4gICAgICBwZWVyLnNlbmQobmV0d29yaywgXCJrYWRcIik7XG4gICAgICB0aGlzLmtleVZhbHVlTGlzdFtrZXldID0gY2h1bmtzO1xuICAgICAgdGhpcy5jYWxsYmFjay5vblN0b3JlKHRoaXMua2V5VmFsdWVMaXN0KTtcbiAgICB9KTtcbiAgfVxuXG4gIGZpbmROb2RlKHRhcmdldElkOiBzdHJpbmcsIHBlZXI6IFdlYlJUQykge1xuICAgIGNvbnNvbGUubG9nKFwiZmluZG5vZGVcIiwgdGFyZ2V0SWQpO1xuICAgIHRoaXMuc3RhdGUuZmluZE5vZGUgPSB0YXJnZXRJZDtcbiAgICBjb25zdCBzZW5kRGF0YSA9IHsgdGFyZ2V0S2V5OiB0YXJnZXRJZCB9O1xuICAgIC8v6YCB44KLXG4gICAgcGVlci5zZW5kKG5ldHdvcmtGb3JtYXQodGhpcy5ub2RlSWQsIGRlZi5GSU5ETk9ERSwgc2VuZERhdGEpLCBcImthZFwiKTtcbiAgfVxuXG4gIGZpbmRWYWx1ZShrZXk6IHN0cmluZykge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZTxhbnk+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGNvbnN0IHRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgcmVqZWN0KFwiZmluZHZhbHVlIHRpbWVvdXRcIik7XG4gICAgICB9LCAxMCAqIDEwMDApO1xuICAgICAgdGhpcy5jYWxsYmFjay5fb25GaW5kVmFsdWUgPSB2YWx1ZSA9PiB7XG4gICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KTtcbiAgICAgICAgcmVzb2x2ZSh2YWx1ZSk7XG4gICAgICB9O1xuICAgICAgLy9rZXnjgavov5HjgYTjg5TjgqLjgpLlj5blvpdcbiAgICAgIGNvbnN0IHBlZXJzID0gdGhpcy5mLmdldENsb3NlUGVlcnMoa2V5KTtcbiAgICAgIHBlZXJzLmZvckVhY2gocGVlciA9PiB7XG4gICAgICAgIHRoaXMuZG9GaW5kdmFsdWUoa2V5LCBwZWVyKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgYXN5bmMgZG9GaW5kdmFsdWUoa2V5OiBzdHJpbmcsIHBlZXI6IFdlYlJUQykge1xuICAgIGNvbnNvbGUubG9nKFwiZG9maW5kdmFsdWVcIiwgcGVlci5ub2RlSWQpO1xuICAgIGNvbnN0IHNlbmREYXRhOiBGaW5kVmFsdWUgPSB7IHRhcmdldEtleToga2V5IH07XG4gICAgcGVlci5zZW5kKG5ldHdvcmtGb3JtYXQodGhpcy5ub2RlSWQsIGRlZi5GSU5EVkFMVUUsIHNlbmREYXRhKSwgXCJrYWRcIik7XG4gIH1cblxuICBjb25uZWN0KHBlZXI6IFdlYlJUQykge1xuICAgIGNvbnNvbGUubG9nKFwia2FkIGNvbm5lY3RcIik7XG4gICAgaWYgKHRoaXMuc3RhdGUuaXNGaXJzdENvbm5lY3QpIHRoaXMuY2FsbGJhY2sub25Db25uZWN0KCk7XG4gICAgdGhpcy5zdGF0ZS5pc0ZpcnN0Q29ubmVjdCA9IGZhbHNlO1xuICAgIHRoaXMuYWRka25vZGUocGVlcik7XG4gIH1cblxuICBhZGRrbm9kZShwZWVyOiBXZWJSVEMpIHtcbiAgICBwZWVyLmV2ZW50cy5kYXRhW1wia2FkZW1saWEudHNcIl0gPSByYXcgPT4ge1xuICAgICAgdGhpcy5vbkNvbW1hbmQocmF3KTtcbiAgICB9O1xuXG4gICAgcGVlci5kaXNjb25uZWN0ID0gKCkgPT4ge1xuICAgICAgY29uc29sZS5sb2coXCJrYWQgbm9kZSBkaXNjb25uZWN0ZWRcIik7XG4gICAgICB0aGlzLmYuY2xlYW5EaXNjb24oKTtcbiAgICAgIHRoaXMuY2FsbGJhY2sub25BZGRQZWVyKHRoaXMuZi5nZXRBbGxQZWVySWRzKCkpO1xuICAgIH07XG5cbiAgICBpZiAoIXRoaXMuZi5pc05vZGVFeGlzdChwZWVyLm5vZGVJZCkpIHtcbiAgICAgIC8v6Ieq5YiG44Gu44OO44O844OJSUTjgajov73liqDjgZnjgovjg47jg7zjg4lJROOBrui3nembolxuICAgICAgY29uc3QgbnVtID0gZGlzdGFuY2UodGhpcy5ub2RlSWQsIHBlZXIubm9kZUlkKTtcbiAgICAgIC8va2J1Y2tldHPjga7oqbLlvZPjgZnjgovot53pm6Ljga5rYnVja2V044KS5ZG844Gz5Ye644GZXG4gICAgICBjb25zdCBrYnVja2V0ID0gdGhpcy5rYnVja2V0c1tudW1dO1xuICAgICAgLy/oqbLlvZPjgZnjgotrYnVja2V044Gr5paw44GX44GE44OU44Ki44KS5Yqg44GI44KLXG4gICAgICBrYnVja2V0LnB1c2gocGVlcik7XG5cbiAgICAgIGNvbnNvbGUubG9nKFwiYWRka25vZGUga2J1Y2tldHNcIiwgXCJwZWVyLm5vZGVJZDpcIiwgcGVlci5ub2RlSWQpO1xuICAgICAgY29uc29sZS5sb2codGhpcy5mLmdldEFsbFBlZXJJZHMoKSk7XG5cbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICB0aGlzLmZpbmROZXdQZWVyKHBlZXIpO1xuICAgICAgfSwgMTAwMCk7XG5cbiAgICAgIHRoaXMuY2FsbGJhY2sub25BZGRQZWVyKHRoaXMuZi5nZXRBbGxQZWVySWRzKCkpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgZmluZE5ld1BlZXIocGVlcjogV2ViUlRDKSB7XG4gICAgaWYgKHRoaXMuZi5nZXRLYnVja2V0TnVtKCkgPCB0aGlzLmspIHtcbiAgICAgIC8v6Ieq6Lqr44Gu44OO44O844OJSUTjgpJrZXnjgajjgZfjgaZGSU5EX05PREVcbiAgICAgIHRoaXMuZmluZE5vZGUodGhpcy5ub2RlSWQsIHBlZXIpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmxvZyhcImtidWNrZXQgcmVhZHlcIiwgdGhpcy5mLmdldEtidWNrZXROdW0oKSk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBtYWludGFpbihuZXR3b3JrOiBhbnkpIHtcbiAgICBjb25zdCBpbnggPSBkaXN0YW5jZSh0aGlzLm5vZGVJZCwgbmV0d29yay5ub2RlSWQpO1xuICAgIGNvbnN0IGtidWNrZXQgPSB0aGlzLmtidWNrZXRzW2lueF07XG5cbiAgICAvL+mAgeS/oeWFg+OBjOipsuW9k+OBmeOCi2stYnVja2V044Gu5Lit44Gr44GC44Gj44Gf5aC05ZCIXG4gICAgLy/jgZ3jga7jg47jg7zjg4njgpJrLWJ1Y2tldOOBruacq+WwvuOBq+enu+OBmVxuICAgIGtidWNrZXQuZm9yRWFjaCgocGVlciwgaSkgPT4ge1xuICAgICAgaWYgKHBlZXIubm9kZUlkID09PSBuZXR3b3JrLm5vZGVJZCkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIm1haW50YWluXCIsIFwiTW92ZXPCoGl0wqB0b8KgdGhlwqB0YWlswqBvZsKgdGhlwqBsaXN0XCIpO1xuICAgICAgICBrYnVja2V0LnNwbGljZShpLCAxKTtcbiAgICAgICAga2J1Y2tldC5wdXNoKHBlZXIpO1xuICAgICAgICByZXR1cm4gMDtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vay1idWNrZXTjgYzjgZnjgafjgavmuoDmna/jgarloLTlkIjjgIFcbiAgICAvL+OBneOBrmstYnVja2V05Lit44Gu5YWI6aCt44Gu44OO44O844OJ44GM44Kq44Oz44Op44Kk44Oz44Gq44KJ5YWI6aCt44Gu44OO44O844OJ44KS5q6L44GZXG4gICAgaWYgKGtidWNrZXQubGVuZ3RoID4gdGhpcy5rKSB7XG4gICAgICBrYnVja2V0LnNoaWZ0KCk7XG4gICAgfVxuICB9XG5cbiAgb2ZmZXIodGFyZ2V0OiBzdHJpbmcsIHByb3h5ID0gbnVsbCkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjb25zdCByID0gdGhpcy5yZWY7XG4gICAgICBjb25zdCBwZWVyID0gKHJbdGFyZ2V0XSA9IG5ldyBXZWJSVEMoKSk7XG4gICAgICBwZWVyLm1ha2VPZmZlcigpO1xuXG4gICAgICBjb25zdCB0aW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHJlamVjdChcImthZCBvZmZlciB0aW1lb3V0XCIpO1xuICAgICAgfSwgNSAqIDEwMDApO1xuXG4gICAgICBwZWVyLnNpZ25hbCA9IHNkcCA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwia2FkIG9mZmVyIHN0b3JlXCIsIHRhcmdldCk7XG4gICAgICAgIGNvbnN0IF8gPSB0aGlzLmYuZ2V0Q2xvc2VFc3RQZWVyKHRhcmdldCk7XG4gICAgICAgIGlmICghXykgcmV0dXJuO1xuICAgICAgICBpZiAoXy5ub2RlSWQgIT09IHRhcmdldClcbiAgICAgICAgICB0aGlzLnN0b3JlKHRoaXMubm9kZUlkLCB0YXJnZXQsIHsgc2RwLCBwcm94eSB9KTtcbiAgICAgIH07XG5cbiAgICAgIHBlZXIuY29ubmVjdCA9ICgpID0+IHtcbiAgICAgICAgcGVlci5ub2RlSWQgPSB0YXJnZXQ7XG4gICAgICAgIGNvbnNvbGUubG9nKFwia2FkIG9mZmVyIGNvbm5lY3RlZFwiLCB0YXJnZXQpO1xuICAgICAgICB0aGlzLmFkZGtub2RlKHBlZXIpO1xuICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dCk7XG4gICAgICAgIHJlc29sdmUodHJ1ZSk7XG4gICAgICB9O1xuICAgIH0pO1xuICB9XG5cbiAgYW5zd2VyKHRhcmdldDogc3RyaW5nLCBzZHA6IHN0cmluZywgcHJveHk6IHN0cmluZykge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjb25zdCByID0gdGhpcy5yZWY7XG4gICAgICBjb25zdCBwZWVyID0gKHJbdGFyZ2V0XSA9IG5ldyBXZWJSVEMoKSk7XG4gICAgICBwZWVyLm1ha2VBbnN3ZXIoc2RwKTtcbiAgICAgIGNvbnNvbGUubG9nKFwia2FkIGFuc3dlclwiLCB0YXJnZXQpO1xuXG4gICAgICBjb25zdCB0aW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHJlamVjdChcImthZCBhbnN3ZXIgdGltZW91dFwiKTtcbiAgICAgIH0sIDUgKiAxMDAwKTtcblxuICAgICAgcGVlci5zaWduYWwgPSBzZHAgPT4ge1xuICAgICAgICBjb25zdCBfID0gdGhpcy5mLmdldFBlZXJGcm9tbm9kZUlkKHByb3h5KTtcbiAgICAgICAgLy/mnaXjgZ/jg6vjg7zjg4jjgavpgIHjgorov5TjgZlcbiAgICAgICAgY29uc3Qgc2VuZERhdGE6IFN0b3JlRm9ybWF0ID0ge1xuICAgICAgICAgIHNlbmRlcjogdGhpcy5ub2RlSWQsXG4gICAgICAgICAga2V5OiB0YXJnZXQsXG4gICAgICAgICAgdmFsdWU6IHsgc2RwIH1cbiAgICAgICAgfTtcbiAgICAgICAgaWYgKF8pIF8uc2VuZChuZXR3b3JrRm9ybWF0KHRoaXMubm9kZUlkLCBkZWYuU1RPUkUsIHNlbmREYXRhKSwgXCJrYWRcIik7XG4gICAgICB9O1xuXG4gICAgICBwZWVyLmNvbm5lY3QgPSAoKSA9PiB7XG4gICAgICAgIHBlZXIubm9kZUlkID0gdGFyZ2V0O1xuICAgICAgICBjb25zb2xlLmxvZyhcImthZCBhbnN3ZXIgY29ubmVjdGVkXCIsIHRhcmdldCk7XG4gICAgICAgIHRoaXMuYWRka25vZGUocGVlcik7XG4gICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KTtcbiAgICAgICAgcmVzb2x2ZSh0cnVlKTtcbiAgICAgIH07XG4gICAgfSk7XG4gIH1cblxuICBzZW5kKHRhcmdldDogc3RyaW5nLCBkYXRhOiBhbnkpIHtcbiAgICBjb25zdCBfID0gdGhpcy5mLmdldFBlZXJGcm9tbm9kZUlkKHRhcmdldCk7XG4gICAgaWYgKF8pIF8uc2VuZChuZXR3b3JrRm9ybWF0KHRoaXMubm9kZUlkLCBkZWYuU0VORCwgZGF0YSksIFwia2FkXCIpO1xuICB9XG5cbiAgcHJpdmF0ZSBvbkNvbW1hbmQobWVzc2FnZTogbWVzc2FnZSkge1xuICAgIHN3aXRjaCAobWVzc2FnZS5sYWJlbCkge1xuICAgICAgY2FzZSBcImthZFwiOlxuICAgICAgICBjb25zdCBidWZmZXI6IEJ1ZmZlciA9IEJ1ZmZlci5mcm9tKG1lc3NhZ2UuZGF0YSk7XG4gICAgICAgIGNvbnNvbGUubG9nKHsgYnVmZmVyIH0pO1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKFwib25jb21tYW5kIGthZFwiLCB7IG1lc3NhZ2UgfSk7XG4gICAgICAgICAgY29uc3QgbmV0d29ya0xheWVyOiBuZXR3b3JrID0gYnNvbi5kZXNlcmlhbGl6ZShidWZmZXIpO1xuICAgICAgICAgIGlmICghSlNPTi5zdHJpbmdpZnkodGhpcy5kYXRhTGlzdCkuaW5jbHVkZXMobmV0d29ya0xheWVyLmhhc2gpKSB7XG4gICAgICAgICAgICB0aGlzLmRhdGFMaXN0LnB1c2gobmV0d29ya0xheWVyLmhhc2gpO1xuICAgICAgICAgICAgdGhpcy5vblJlcXVlc3QobmV0d29ya0xheWVyKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coZXJyb3IpO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgb25SZXF1ZXN0KG5ldHdvcms6IGFueSkge1xuICAgIHRoaXMucmVzcG9uZGVyLnJlc3BvbnNlKG5ldHdvcmsudHlwZSwgbmV0d29yayk7XG4gICAgdGhpcy5tYWludGFpbihuZXR3b3JrKTtcbiAgfVxufVxuIl19
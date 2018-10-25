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

      var cb = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function (value) {};
      this.callback.onFindValue = cb; //keyに近いピアを取得

      var peers = this.f.getClosePeers(key);
      peers.forEach(function (peer) {
        _this2.doFindvalue(key, peer);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9rYWQva2FkZW1saWEudHMiXSwibmFtZXMiOlsicmVxdWlyZSIsImJzb24iLCJCU09OIiwiS2FkZW1saWEiLCJfbm9kZUlkIiwib3B0IiwiaXNDb25uZWN0IiwiaXNPZmZlciIsImZpbmROb2RlIiwiaGFzaCIsIm9uQ29ubmVjdCIsIm9uQWRkUGVlciIsInYiLCJvblBlZXJEaXNjb25uZWN0Iiwib25GaW5kVmFsdWUiLCJvbkZpbmROb2RlIiwib25TdG9yZSIsIm9uQXBwIiwiY29uc29sZSIsImxvZyIsImsiLCJrTGVuZ3RoIiwibm9kZUlkIiwia2J1Y2tldHMiLCJBcnJheSIsImkiLCJrYnVja2V0IiwiZiIsIkhlbHBlciIsInJlc3BvbmRlciIsIktSZXNwb25kZXIiLCJzZW5kZXIiLCJrZXkiLCJ2YWx1ZSIsInBlZXIiLCJnZXRDbG9zZUVzdFBlZXIiLCJkZWYiLCJTVE9SRSIsInNlbmREYXRhIiwibmV0d29yayIsInNlbmQiLCJrZXlWYWx1ZUxpc3QiLCJjYWxsYmFjayIsImNodW5rcyIsImZvckVhY2giLCJjaHVuayIsImluZGV4Iiwic2l6ZSIsImxlbmd0aCIsIlNUT1JFX0NIVU5LUyIsInRhcmdldElkIiwic3RhdGUiLCJ0YXJnZXRLZXkiLCJGSU5ETk9ERSIsImNiIiwicGVlcnMiLCJnZXRDbG9zZVBlZXJzIiwiZG9GaW5kdmFsdWUiLCJGSU5EVkFMVUUiLCJhZGRrbm9kZSIsImV2ZW50cyIsImRhdGEiLCJyYXciLCJvbkNvbW1hbmQiLCJkaXNjb25uZWN0IiwiY2xlYW5EaXNjb24iLCJnZXRBbGxQZWVySWRzIiwiaXNOb2RlRXhpc3QiLCJudW0iLCJwdXNoIiwic2V0VGltZW91dCIsImZpbmROZXdQZWVyIiwiZ2V0S2J1Y2tldE51bSIsImlueCIsInNwbGljZSIsInNoaWZ0IiwidGFyZ2V0IiwicHJveHkiLCJQcm9taXNlIiwicmVzb2x2ZSIsInJlamVjdCIsInIiLCJyZWYiLCJXZWJSVEMiLCJtYWtlT2ZmZXIiLCJ0aW1lb3V0Iiwic2lnbmFsIiwic2RwIiwiXyIsInN0b3JlIiwiY29ubmVjdCIsImNsZWFyVGltZW91dCIsIm1ha2VBbnN3ZXIiLCJnZXRQZWVyRnJvbW5vZGVJZCIsIlNFTkQiLCJtZXNzYWdlIiwibGFiZWwiLCJkYXRhTGluayIsIkJ1ZmZlciIsImZyb20iLCJuZXR3b3JrTGF5ZXIiLCJkZXNlcmlhbGl6ZSIsIkpTT04iLCJzdHJpbmdpZnkiLCJkYXRhTGlzdCIsImluY2x1ZGVzIiwib25SZXF1ZXN0IiwiZXJyb3IiLCJyZXNwb25zZSIsInR5cGUiLCJtYWludGFpbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUVBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFQQUEsT0FBTyxDQUFDLGdCQUFELENBQVA7O0FBU0EsSUFBTUMsSUFBSSxHQUFHLElBQUlDLFVBQUosRUFBYjs7SUFFcUJDLFE7OztBQTJCbkIsb0JBQVlDLE9BQVosRUFBNkJDLEdBQTdCLEVBQXlEO0FBQUE7O0FBQUE7O0FBQUE7O0FBQUE7O0FBQUE7O0FBQUE7O0FBQUEsc0NBckJsQyxFQXFCa0M7O0FBQUEsMENBcEJsQixFQW9Ca0I7O0FBQUEsaUNBbkJ4QixFQW1Cd0I7O0FBQUEsb0NBbEJqQixFQWtCaUI7O0FBQUEsbUNBakJqRDtBQUNOQyxNQUFBQSxTQUFTLEVBQUUsS0FETDtBQUVOQyxNQUFBQSxPQUFPLEVBQUUsS0FGSDtBQUdOQyxNQUFBQSxRQUFRLEVBQUUsRUFISjtBQUlOQyxNQUFBQSxJQUFJLEVBQUU7QUFKQSxLQWlCaUQ7O0FBQUEsc0NBVjlDO0FBQ1RDLE1BQUFBLFNBQVMsRUFBRSxxQkFBTSxDQUFFLENBRFY7QUFFVEMsTUFBQUEsU0FBUyxFQUFFLG1CQUFDQyxDQUFELEVBQWEsQ0FBRSxDQUZqQjtBQUdUQyxNQUFBQSxnQkFBZ0IsRUFBRSwwQkFBQ0QsQ0FBRCxFQUFhLENBQUUsQ0FIeEI7QUFJVEUsTUFBQUEsV0FBVyxFQUFFLHFCQUFDRixDQUFELEVBQWEsQ0FBRSxDQUpuQjtBQUtU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QyxVQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWTtBQUFFOEUsWUFBQUEsUUFBUSxFQUFSQTtBQUFGLFdBQVo7O0FBQ0EsY0FBSTtBQUNGL0UsWUFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVksZUFBWixFQUE2QjtBQUFFNEUsY0FBQUEsT0FBTyxFQUFQQTtBQUFGLGFBQTdCLEVBQTBDO0FBQUVFLGNBQUFBLFFBQVEsRUFBUkE7QUFBRixhQUExQztBQUNBLGdCQUFNRyxZQUFxQixHQUFHbkcsSUFBSSxDQUFDb0csV0FBTCxDQUFpQkosUUFBakIsQ0FBOUI7O0FBQ0EsZ0JBQUksQ0FBQ0ssSUFBSSxDQUFDQyxTQUFMLENBQWUsS0FBS0MsUUFBcEIsRUFBOEJDLFFBQTlCLENBQXVDTCxZQUFZLENBQUMzRixJQUFwRCxDQUFMLEVBQWdFO0FBQzlELG1CQUFLK0YsUUFBTCxDQUFjbkMsSUFBZCxDQUFtQitCLFlBQVksQ0FBQzNGLElBQWhDO0FBQ0EsbUJBQUtpRyxTQUFMLENBQWVOLFlBQWY7QUFDRDtBQUNGLFdBUEQsQ0FPRSxPQUFPTyxLQUFQLEVBQWM7QUFDZHpGLFlBQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZd0YsS0FBWjtBQUNEOztBQUNEO0FBZEo7QUFnQkQ7Ozs4QkFFaUJwRSxPLEVBQWM7QUFDOUIsV0FBS1YsU0FBTCxDQUFlK0UsUUFBZixDQUF3QnJFLE9BQU8sQ0FBQ3NFLElBQWhDLEVBQXNDdEUsT0FBdEM7QUFDQSxXQUFLdUUsUUFBTCxDQUFjdkUsT0FBZDtBQUNEIiwic291cmNlc0NvbnRlbnQiOlsicmVxdWlyZShcImJhYmVsLXBvbHlmaWxsXCIpO1xuaW1wb3J0IFdlYlJUQyBmcm9tIFwid2VicnRjNG1lXCI7XG5pbXBvcnQgSGVscGVyIGZyb20gXCIuL2tVdGlsXCI7XG5pbXBvcnQgS1Jlc3BvbmRlciBmcm9tIFwiLi9rUmVzcG9uZGVyXCI7XG5pbXBvcnQgZGVmLCB7IG5ldHdvcmtGb3JtYXQgfSBmcm9tIFwiLi9LQ29uc3RcIjtcbmltcG9ydCB7IGRpc3RhbmNlIH0gZnJvbSBcImthZC1kaXN0YW5jZVwiO1xuaW1wb3J0IHsgbWVzc2FnZSB9IGZyb20gXCJ3ZWJydGM0bWUvbGliL2ludGVyZmFjZVwiO1xuaW1wb3J0IHsgQlNPTiB9IGZyb20gXCJic29uXCI7XG5cbmNvbnN0IGJzb24gPSBuZXcgQlNPTigpO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBLYWRlbWxpYSB7XG4gIG5vZGVJZDogc3RyaW5nO1xuICBrOiBudW1iZXI7XG4gIGtidWNrZXRzOiBBcnJheTxBcnJheTxXZWJSVEM+PjtcbiAgZjogSGVscGVyO1xuICByZXNwb25kZXI6IEtSZXNwb25kZXI7XG4gIGRhdGFMaXN0OiBBcnJheTxhbnk+ID0gW107XG4gIGtleVZhbHVlTGlzdDogeyBba2V5OiBzdHJpbmddOiBhbnkgfSA9IHt9O1xuICByZWY6IHsgW2tleTogc3RyaW5nXTogV2ViUlRDIH0gPSB7fTtcbiAgYnVmZmVyOiB7IFtrZXk6IHN0cmluZ106IEFycmF5PGFueT4gfSA9IHt9O1xuICBzdGF0ZSA9IHtcbiAgICBpc0Nvbm5lY3Q6IGZhbHNlLFxuICAgIGlzT2ZmZXI6IGZhbHNlLFxuICAgIGZpbmROb2RlOiBcIlwiLFxuICAgIGhhc2g6IHt9XG4gIH07XG5cbiAgY2FsbGJhY2sgPSB7XG4gICAgb25Db25uZWN0OiAoKSA9PiB7fSxcbiAgICBvbkFkZFBlZXI6ICh2PzogYW55KSA9PiB7fSxcbiAgICBvblBlZXJEaXNjb25uZWN0OiAodj86IGFueSkgPT4ge30sXG4gICAgb25GaW5kVmFsdWU6ICh2PzogYW55KSA9PiB7fSxcbiAgICBvbkZpbmROb2RlOiAodj86IGFueSkgPT4ge30sXG4gICAgb25TdG9yZTogKHY/OiBhbnkpID0+IHt9LFxuICAgIG9uQXBwOiAodj86IGFueSkgPT4ge31cbiAgfTtcblxuICBjb25zdHJ1Y3Rvcihfbm9kZUlkOiBzdHJpbmcsIG9wdD86IHsga0xlbmd0aD86IG51bWJlciB9KSB7XG4gICAgY29uc29sZS5sb2coXCJzdGFydCBrYWRcIiwgX25vZGVJZCk7XG4gICAgdGhpcy5rID0gMjA7XG4gICAgaWYgKG9wdCkgaWYgKG9wdC5rTGVuZ3RoKSB0aGlzLmsgPSBvcHQua0xlbmd0aDtcbiAgICB0aGlzLm5vZGVJZCA9IF9ub2RlSWQ7XG5cbiAgICB0aGlzLmtidWNrZXRzID0gbmV3IEFycmF5KDE2MCk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCAxNjA7IGkrKykge1xuICAgICAgbGV0IGtidWNrZXQ6IEFycmF5PGFueT4gPSBbXTtcbiAgICAgIHRoaXMua2J1Y2tldHNbaV0gPSBrYnVja2V0O1xuICAgIH1cblxuICAgIHRoaXMuZiA9IG5ldyBIZWxwZXIodGhpcy5rLCB0aGlzLmtidWNrZXRzKTtcbiAgICB0aGlzLnJlc3BvbmRlciA9IG5ldyBLUmVzcG9uZGVyKHRoaXMpO1xuICB9XG5cbiAgc3RvcmUoc2VuZGVyOiBzdHJpbmcsIGtleTogc3RyaW5nLCB2YWx1ZTogYW55KSB7XG4gICAgLy/oh6rliIbjgavkuIDnlarov5HjgYTjg5TjgqLjgpLlj5blvpdcbiAgICBjb25zdCBwZWVyID0gdGhpcy5mLmdldENsb3NlRXN0UGVlcihrZXkpO1xuICAgIGlmICghcGVlcikgcmV0dXJuO1xuICAgIGNvbnNvbGUubG9nKGRlZi5TVE9SRSwgXCJuZXh0XCIsIHBlZXIubm9kZUlkLCBcInRhcmdldFwiLCBrZXkpO1xuICAgIGNvbnN0IHNlbmREYXRhOiBTdG9yZUZvcm1hdCA9IHsgc2VuZGVyLCBrZXksIHZhbHVlIH07XG4gICAgY29uc3QgbmV0d29yayA9IG5ldHdvcmtGb3JtYXQodGhpcy5ub2RlSWQsIGRlZi5TVE9SRSwgc2VuZERhdGEpO1xuICAgIHBlZXIuc2VuZChuZXR3b3JrLCBcImthZFwiKTtcbiAgICBjb25zb2xlLmxvZyhcInN0b3JlIGRvbmVcIiwgeyBuZXR3b3JrIH0pO1xuICAgIHRoaXMua2V5VmFsdWVMaXN0W2tleV0gPSB2YWx1ZTtcbiAgICB0aGlzLmNhbGxiYWNrLm9uU3RvcmUodGhpcy5rZXlWYWx1ZUxpc3QpO1xuICB9XG5cbiAgc3RvcmVDaHVua3Moc2VuZGVyOiBzdHJpbmcsIGtleTogc3RyaW5nLCBjaHVua3M6IEFycmF5QnVmZmVyW10pIHtcbiAgICBjb25zdCBwZWVyID0gdGhpcy5mLmdldENsb3NlRXN0UGVlcihrZXkpO1xuICAgIGlmICghcGVlcikgcmV0dXJuO1xuICAgIGNodW5rcy5mb3JFYWNoKChjaHVuaywgaSkgPT4ge1xuICAgICAgY29uc3Qgc2VuZERhdGE6IFN0b3JlQ2h1bmtzID0ge1xuICAgICAgICBzZW5kZXI6IHRoaXMubm9kZUlkLFxuICAgICAgICBrZXksXG4gICAgICAgIHZhbHVlOiBjaHVuayxcbiAgICAgICAgaW5kZXg6IGksXG4gICAgICAgIHNpemU6IGNodW5rcy5sZW5ndGhcbiAgICAgIH07XG4gICAgICBjb25zdCBuZXR3b3JrID0gbmV0d29ya0Zvcm1hdChzZW5kZXIsIGRlZi5TVE9SRV9DSFVOS1MsIHNlbmREYXRhKTtcbiAgICAgIHBlZXIuc2VuZChuZXR3b3JrLCBcImthZFwiKTtcbiAgICAgIHRoaXMua2V5VmFsdWVMaXN0W2tleV0gPSBjaHVua3M7XG4gICAgICB0aGlzLmNhbGxiYWNrLm9uU3RvcmUodGhpcy5rZXlWYWx1ZUxpc3QpO1xuICAgIH0pO1xuICB9XG5cbiAgZmluZE5vZGUodGFyZ2V0SWQ6IHN0cmluZywgcGVlcjogV2ViUlRDKSB7XG4gICAgY29uc29sZS5sb2coXCJmaW5kbm9kZVwiLCB0YXJnZXRJZCk7XG4gICAgdGhpcy5zdGF0ZS5maW5kTm9kZSA9IHRhcmdldElkO1xuICAgIGNvbnN0IHNlbmREYXRhID0geyB0YXJnZXRLZXk6IHRhcmdldElkIH07XG4gICAgLy/pgIHjgotcbiAgICBwZWVyLnNlbmQobmV0d29ya0Zvcm1hdCh0aGlzLm5vZGVJZCwgZGVmLkZJTkROT0RFLCBzZW5kRGF0YSksIFwia2FkXCIpO1xuICB9XG5cbiAgZmluZFZhbHVlKGtleTogc3RyaW5nLCBjYiA9ICh2YWx1ZTogYW55KSA9PiB7fSkge1xuICAgIHRoaXMuY2FsbGJhY2sub25GaW5kVmFsdWUgPSBjYjtcbiAgICAvL2tleeOBq+i/keOBhOODlOOCouOCkuWPluW+l1xuICAgIGNvbnN0IHBlZXJzID0gdGhpcy5mLmdldENsb3NlUGVlcnMoa2V5KTtcbiAgICBwZWVycy5mb3JFYWNoKHBlZXIgPT4ge1xuICAgICAgdGhpcy5kb0ZpbmR2YWx1ZShrZXksIHBlZXIpO1xuICAgIH0pO1xuICB9XG5cbiAgYXN5bmMgZG9GaW5kdmFsdWUoa2V5OiBzdHJpbmcsIHBlZXI6IFdlYlJUQykge1xuICAgIGNvbnNvbGUubG9nKFwiZG9maW5kdmFsdWVcIiwgcGVlci5ub2RlSWQpO1xuICAgIGNvbnN0IHNlbmREYXRhOiBGaW5kVmFsdWUgPSB7IHRhcmdldEtleToga2V5IH07XG4gICAgcGVlci5zZW5kKG5ldHdvcmtGb3JtYXQodGhpcy5ub2RlSWQsIGRlZi5GSU5EVkFMVUUsIHNlbmREYXRhKSwgXCJrYWRcIik7XG4gIH1cblxuICBjb25uZWN0KHBlZXI6IFdlYlJUQykge1xuICAgIGlmICghdGhpcy5zdGF0ZS5pc0Nvbm5lY3QpIHtcbiAgICAgIHRoaXMuc3RhdGUuaXNDb25uZWN0ID0gdHJ1ZTtcbiAgICAgIHRoaXMuYWRka25vZGUocGVlcik7XG4gICAgICB0aGlzLmNhbGxiYWNrLm9uQ29ubmVjdCgpO1xuICAgIH1cbiAgfVxuXG4gIGFkZGtub2RlKHBlZXI6IFdlYlJUQykge1xuICAgIHBlZXIuZXZlbnRzLmRhdGFbXCJrYWRlbWxpYS50c1wiXSA9IHJhdyA9PiB7XG4gICAgICB0aGlzLm9uQ29tbWFuZChyYXcpO1xuICAgIH07XG5cbiAgICBwZWVyLmRpc2Nvbm5lY3QgPSAoKSA9PiB7XG4gICAgICBjb25zb2xlLmxvZyhcImthZCBub2RlIGRpc2Nvbm5lY3RlZFwiKTtcbiAgICAgIHRoaXMuZi5jbGVhbkRpc2NvbigpO1xuICAgICAgdGhpcy5jYWxsYmFjay5vbkFkZFBlZXIodGhpcy5mLmdldEFsbFBlZXJJZHMoKSk7XG4gICAgfTtcblxuICAgIGlmICghdGhpcy5mLmlzTm9kZUV4aXN0KHBlZXIubm9kZUlkKSkge1xuICAgICAgLy/oh6rliIbjga7jg47jg7zjg4lJROOBqOi/veWKoOOBmeOCi+ODjuODvOODiUlE44Gu6Led6ZuiXG4gICAgICBjb25zdCBudW0gPSBkaXN0YW5jZSh0aGlzLm5vZGVJZCwgcGVlci5ub2RlSWQpO1xuICAgICAgLy9rYnVja2V0c+OBruipsuW9k+OBmeOCi+i3nembouOBrmtidWNrZXTjgpLlkbzjgbPlh7rjgZlcbiAgICAgIGNvbnN0IGtidWNrZXQgPSB0aGlzLmtidWNrZXRzW251bV07XG4gICAgICAvL+ipsuW9k+OBmeOCi2tidWNrZXTjgavmlrDjgZfjgYTjg5TjgqLjgpLliqDjgYjjgotcbiAgICAgIGtidWNrZXQucHVzaChwZWVyKTtcblxuICAgICAgY29uc29sZS5sb2coXCJhZGRrbm9kZSBrYnVja2V0c1wiLCBcInBlZXIubm9kZUlkOlwiLCBwZWVyLm5vZGVJZCk7XG4gICAgICBjb25zb2xlLmxvZyh0aGlzLmYuZ2V0QWxsUGVlcklkcygpKTtcblxuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHRoaXMuZmluZE5ld1BlZXIocGVlcik7XG4gICAgICB9LCAxMDAwKTtcblxuICAgICAgdGhpcy5jYWxsYmFjay5vbkFkZFBlZXIodGhpcy5mLmdldEFsbFBlZXJJZHMoKSk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBmaW5kTmV3UGVlcihwZWVyOiBXZWJSVEMpIHtcbiAgICBpZiAodGhpcy5mLmdldEtidWNrZXROdW0oKSA8IHRoaXMuaykge1xuICAgICAgLy/oh6rouqvjga7jg47jg7zjg4lJROOCkmtleeOBqOOBl+OBpkZJTkRfTk9ERVxuICAgICAgdGhpcy5maW5kTm9kZSh0aGlzLm5vZGVJZCwgcGVlcik7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUubG9nKFwia2J1Y2tldCByZWFkeVwiLCB0aGlzLmYuZ2V0S2J1Y2tldE51bSgpKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIG1haW50YWluKG5ldHdvcms6IGFueSkge1xuICAgIGNvbnN0IGlueCA9IGRpc3RhbmNlKHRoaXMubm9kZUlkLCBuZXR3b3JrLm5vZGVJZCk7XG4gICAgY29uc3Qga2J1Y2tldCA9IHRoaXMua2J1Y2tldHNbaW54XTtcblxuICAgIC8v6YCB5L+h5YWD44GM6Kmy5b2T44GZ44KLay1idWNrZXTjga7kuK3jgavjgYLjgaPjgZ/loLTlkIhcbiAgICAvL+OBneOBruODjuODvOODieOCkmstYnVja2V044Gu5pyr5bC+44Gr56e744GZXG4gICAga2J1Y2tldC5mb3JFYWNoKChwZWVyLCBpKSA9PiB7XG4gICAgICBpZiAocGVlci5ub2RlSWQgPT09IG5ldHdvcmsubm9kZUlkKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwibWFpbnRhaW5cIiwgXCJNb3Zlc8KgaXTCoHRvwqB0aGXCoHRhaWzCoG9mwqB0aGXCoGxpc3RcIik7XG4gICAgICAgIGtidWNrZXQuc3BsaWNlKGksIDEpO1xuICAgICAgICBrYnVja2V0LnB1c2gocGVlcik7XG4gICAgICAgIHJldHVybiAwO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy9rLWJ1Y2tldOOBjOOBmeOBp+OBq+a6gOadr+OBquWgtOWQiOOAgVxuICAgIC8v44Gd44Guay1idWNrZXTkuK3jga7lhYjpoK3jga7jg47jg7zjg4njgYzjgqrjg7Pjg6njgqTjg7PjgarjgonlhYjpoK3jga7jg47jg7zjg4njgpLmrovjgZlcbiAgICBpZiAoa2J1Y2tldC5sZW5ndGggPiB0aGlzLmspIHtcbiAgICAgIGtidWNrZXQuc2hpZnQoKTtcbiAgICB9XG4gIH1cblxuICBvZmZlcih0YXJnZXQ6IHN0cmluZywgcHJveHkgPSBudWxsKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGNvbnN0IHIgPSB0aGlzLnJlZjtcbiAgICAgIGNvbnN0IHBlZXIgPSAoclt0YXJnZXRdID0gbmV3IFdlYlJUQygpKTtcbiAgICAgIHBlZXIubWFrZU9mZmVyKCk7XG5cbiAgICAgIGNvbnN0IHRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgcmVqZWN0KFwia2FkIG9mZmVyIHRpbWVvdXRcIik7XG4gICAgICB9LCA1ICogMTAwMCk7XG5cbiAgICAgIHBlZXIuc2lnbmFsID0gc2RwID0+IHtcbiAgICAgICAgY29uc29sZS5sb2coXCJrYWQgb2ZmZXIgc3RvcmVcIiwgdGFyZ2V0KTtcbiAgICAgICAgY29uc3QgXyA9IHRoaXMuZi5nZXRDbG9zZUVzdFBlZXIodGFyZ2V0KTtcbiAgICAgICAgaWYgKCFfKSByZXR1cm47XG4gICAgICAgIGlmIChfLm5vZGVJZCAhPT0gdGFyZ2V0KVxuICAgICAgICAgIHRoaXMuc3RvcmUodGhpcy5ub2RlSWQsIHRhcmdldCwgeyBzZHAsIHByb3h5IH0pO1xuICAgICAgfTtcblxuICAgICAgcGVlci5jb25uZWN0ID0gKCkgPT4ge1xuICAgICAgICBwZWVyLm5vZGVJZCA9IHRhcmdldDtcbiAgICAgICAgY29uc29sZS5sb2coXCJrYWQgb2ZmZXIgY29ubmVjdGVkXCIsIHRhcmdldCk7XG4gICAgICAgIHRoaXMuYWRka25vZGUocGVlcik7XG4gICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KTtcbiAgICAgICAgcmVzb2x2ZSh0cnVlKTtcbiAgICAgIH07XG4gICAgfSk7XG4gIH1cblxuICBhbnN3ZXIodGFyZ2V0OiBzdHJpbmcsIHNkcDogc3RyaW5nLCBwcm94eTogc3RyaW5nKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGNvbnN0IHIgPSB0aGlzLnJlZjtcbiAgICAgIGNvbnN0IHBlZXIgPSAoclt0YXJnZXRdID0gbmV3IFdlYlJUQygpKTtcbiAgICAgIHBlZXIubWFrZUFuc3dlcihzZHApO1xuICAgICAgY29uc29sZS5sb2coXCJrYWQgYW5zd2VyXCIsIHRhcmdldCk7XG5cbiAgICAgIGNvbnN0IHRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgcmVqZWN0KFwia2FkIGFuc3dlciB0aW1lb3V0XCIpO1xuICAgICAgfSwgNSAqIDEwMDApO1xuXG4gICAgICBwZWVyLnNpZ25hbCA9IHNkcCA9PiB7XG4gICAgICAgIGNvbnN0IF8gPSB0aGlzLmYuZ2V0UGVlckZyb21ub2RlSWQocHJveHkpO1xuICAgICAgICAvL+adpeOBn+ODq+ODvOODiOOBq+mAgeOCiui/lOOBmVxuICAgICAgICBjb25zdCBzZW5kRGF0YTogU3RvcmVGb3JtYXQgPSB7XG4gICAgICAgICAgc2VuZGVyOiB0aGlzLm5vZGVJZCxcbiAgICAgICAgICBrZXk6IHRhcmdldCxcbiAgICAgICAgICB2YWx1ZTogeyBzZHAgfVxuICAgICAgICB9O1xuICAgICAgICBpZiAoXykgXy5zZW5kKG5ldHdvcmtGb3JtYXQodGhpcy5ub2RlSWQsIGRlZi5TVE9SRSwgc2VuZERhdGEpLCBcImthZFwiKTtcbiAgICAgIH07XG5cbiAgICAgIHBlZXIuY29ubmVjdCA9ICgpID0+IHtcbiAgICAgICAgcGVlci5ub2RlSWQgPSB0YXJnZXQ7XG4gICAgICAgIGNvbnNvbGUubG9nKFwia2FkIGFuc3dlciBjb25uZWN0ZWRcIiwgdGFyZ2V0KTtcbiAgICAgICAgdGhpcy5hZGRrbm9kZShwZWVyKTtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xuICAgICAgICByZXNvbHZlKHRydWUpO1xuICAgICAgfTtcbiAgICB9KTtcbiAgfVxuXG4gIHNlbmQodGFyZ2V0OiBzdHJpbmcsIGRhdGE6IGFueSkge1xuICAgIGNvbnN0IF8gPSB0aGlzLmYuZ2V0UGVlckZyb21ub2RlSWQodGFyZ2V0KTtcbiAgICBpZiAoXykgXy5zZW5kKG5ldHdvcmtGb3JtYXQodGhpcy5ub2RlSWQsIGRlZi5TRU5ELCBkYXRhKSwgXCJrYWRcIik7XG4gIH1cblxuICBwcml2YXRlIG9uQ29tbWFuZChtZXNzYWdlOiBtZXNzYWdlKSB7XG4gICAgc3dpdGNoIChtZXNzYWdlLmxhYmVsKSB7XG4gICAgICBjYXNlIFwia2FkXCI6XG4gICAgICAgIGNvbnN0IGRhdGFMaW5rOiBCdWZmZXIgPSBCdWZmZXIuZnJvbShtZXNzYWdlLmRhdGEpO1xuICAgICAgICBjb25zb2xlLmxvZyh7IGRhdGFMaW5rIH0pO1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKFwib25jb21tYW5kIGthZFwiLCB7IG1lc3NhZ2UgfSwgeyBkYXRhTGluayB9KTtcbiAgICAgICAgICBjb25zdCBuZXR3b3JrTGF5ZXI6IG5ldHdvcmsgPSBic29uLmRlc2VyaWFsaXplKGRhdGFMaW5rKTtcbiAgICAgICAgICBpZiAoIUpTT04uc3RyaW5naWZ5KHRoaXMuZGF0YUxpc3QpLmluY2x1ZGVzKG5ldHdvcmtMYXllci5oYXNoKSkge1xuICAgICAgICAgICAgdGhpcy5kYXRhTGlzdC5wdXNoKG5ldHdvcmtMYXllci5oYXNoKTtcbiAgICAgICAgICAgIHRoaXMub25SZXF1ZXN0KG5ldHdvcmtMYXllcik7XG4gICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yKTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIG9uUmVxdWVzdChuZXR3b3JrOiBhbnkpIHtcbiAgICB0aGlzLnJlc3BvbmRlci5yZXNwb25zZShuZXR3b3JrLnR5cGUsIG5ldHdvcmspO1xuICAgIHRoaXMubWFpbnRhaW4obmV0d29yayk7XG4gIH1cbn1cbiJdfQ==
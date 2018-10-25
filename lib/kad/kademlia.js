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
      this.addknode(peer);
      this.callback.onConnect();
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9rYWQva2FkZW1saWEudHMiXSwibmFtZXMiOlsicmVxdWlyZSIsImJzb24iLCJCU09OIiwiS2FkZW1saWEiLCJfbm9kZUlkIiwib3B0IiwiaXNPZmZlciIsImZpbmROb2RlIiwiaGFzaCIsIm9uQ29ubmVjdCIsIm9uQWRkUGVlciIsInYiLCJvblBlZXJEaXNjb25uZWN0Iiwib25GaW5kVmFsdWUiLCJvbkZpbmROb2RlIiwib25TdG9yZSIsIm9uQXBwIiwiY29uc29sZSIsImxvZyIsImsiLCJrTGVuZ3RoIiwibm9kZUlkIiwia2J1Y2tldHMiLCJBcnJheSIsImkiLCJrYnVja2V0IiwiZiIsIkhlbHBlciIsInJlc3BvbmRlciIsIktSZXNwb25kZXIiLCJzZW5kZXIiLCJrZXkiLCJ2YWx1ZSIsInBlZXIiLCJnZXRDbG9zZUVzdFBlZXIiLCJkZWYiLCJTVE9SRSIsInNlbmREYXRhIiwibmV0d29yayIsInNlbmQiLCJrZXlWYWx1ZUxpc3QiLCJjYWxsYmFjayIsImNodW5rcyIsImZvckVhY2giLCJjaHVuayIsImluZGV4Iiwic2l6ZSIsImxlbmd0aCIsIlNUT1JFX0NIVU5LUyIsInRhcmdldElkIiwic3RhdGUiLCJ0YXJnZXRLZXkiLCJGSU5ETk9ERSIsImNiIiwicGVlcnMiLCJnZXRDbG9zZVBlZXJzIiwiZG9GaW5kdmFsdWUiLCJGSU5EVkFMVUUiLCJhZGRrbm9kZSIsImV2ZW50cyIsImRhdGEiLCJyYXciLCJvbkNvbW1hbmQiLCJkaXNjb25uZWN0IiwiY2xlYW5EaXNjb24iLCJnZXRBbGxQZWVySWRzIiwiaXNOb2RlRXhpc3QiLCJudW0iLCJwdXNoIiwic2V0VGltZW91dCIsImZpbmROZXdQZWVyIiwiZ2V0S2J1Y2tldE51bSIsImlueCIsInNwbGljZSIsInNoaWZ0IiwidGFyZ2V0IiwicHJveHkiLCJQcm9taXNlIiwicmVzb2x2ZSIsInJlamVjdCIsInIiLCJyZWYiLCJXZWJSVEMiLCJtYWtlT2ZmZXIiLCJ0aW1lb3V0Iiwic2lnbmFsIiwic2RwIiwiXyIsInN0b3JlIiwiY29ubmVjdCIsImNsZWFyVGltZW91dCIsIm1ha2VBbnN3ZXIiLCJnZXRQZWVyRnJvbW5vZGVJZCIsIlNFTkQiLCJtZXNzYWdlIiwibGFiZWwiLCJkYXRhTGluayIsIkJ1ZmZlciIsImZyb20iLCJuZXR3b3JrTGF5ZXIiLCJkZXNlcmlhbGl6ZSIsIkpTT04iLCJzdHJpbmdpZnkiLCJkYXRhTGlzdCIsImluY2x1ZGVzIiwib25SZXF1ZXN0IiwiZXJyb3IiLCJyZXNwb25zZSIsInR5cGUiLCJtYWludGFpbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUVBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFQQUEsT0FBTyxDQUFDLGdCQUFELENBQVA7O0FBU0EsSUFBTUMsSUFBSSxHQUFHLElBQUlDLFVBQUosRUFBYjs7SUFFcUJDLFE7OztBQTBCbkIsb0JBQVlDLE9BQVosRUFBNkJDLEdBQTdCLEVBQXlEO0FBQUE7O0FBQUE7O0FBQUE7O0FBQUE7O0FBQUE7O0FBQUE7O0FBQUEsc0NBcEJsQyxFQW9Ca0M7O0FBQUEsMENBbkJsQixFQW1Ca0I7O0FBQUEsaUNBbEJ4QixFQWtCd0I7O0FBQUEsb0NBakJqQixFQWlCaUI7O0FBQUEsbUNBaEJqRDtBQUNOQyxNQUFBQSxPQUFPLEVBQUUsS0FESDtBQUVOQyxNQUFBQSxRQUFRLEVBQUUsRUFGSjtBQUdOQyxNQUFBQSxJQUFJLEVBQUU7QUFIQSxLQWdCaUQ7O0FBQUEsc0NBVjlDO0FBQ1RDLE1BQUFBLFNBQVMsRUFBRSxxQkFBTSxDQUFFLENBRFY7QUFFVEMsTUFBQUEsU0FBUyxFQUFFLG1CQUFDQyxDQUFELEVBQWEsQ0FBRSxDQUZqQjtBQUdUQyxNQUFBQSxnQkFBZ0IsRUFBRSwwQkFBQ0QsQ0FBRCxFQUFhLENBQUUsQ0FIeEI7QUFJVEUsTUFBQUEsV0FBVyxFQUFFLHFCQUFDRixDQUFELEVBQWEsQ0FBRSxDQUpuQjtBQUtURyxNQUFBQSxVQUFVLEVBQUUsb0JBQUNILENBQUQsRUFBYSxDQUFF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TyxFQUFQQTtBQUFGLGFBQTdCLEVBQTBDO0FBQUVFLGNBQUFBLFFBQVEsRUFBUkE7QUFBRixhQUExQztBQUNBLGdCQUFNRyxZQUFxQixHQUFHbEcsSUFBSSxDQUFDbUcsV0FBTCxDQUFpQkosUUFBakIsQ0FBOUI7O0FBQ0EsZ0JBQUksQ0FBQ0ssSUFBSSxDQUFDQyxTQUFMLENBQWUsS0FBS0MsUUFBcEIsRUFBOEJDLFFBQTlCLENBQXVDTCxZQUFZLENBQUMzRixJQUFwRCxDQUFMLEVBQWdFO0FBQzlELG1CQUFLK0YsUUFBTCxDQUFjbkMsSUFBZCxDQUFtQitCLFlBQVksQ0FBQzNGLElBQWhDO0FBQ0EsbUJBQUtpRyxTQUFMLENBQWVOLFlBQWY7QUFDRDtBQUNGLFdBUEQsQ0FPRSxPQUFPTyxLQUFQLEVBQWM7QUFDZHpGLFlBQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZd0YsS0FBWjtBQUNEOztBQUNEO0FBZEo7QUFnQkQ7Ozs4QkFFaUJwRSxPLEVBQWM7QUFDOUIsV0FBS1YsU0FBTCxDQUFlK0UsUUFBZixDQUF3QnJFLE9BQU8sQ0FBQ3NFLElBQWhDLEVBQXNDdEUsT0FBdEM7QUFDQSxXQUFLdUUsUUFBTCxDQUFjdkUsT0FBZDtBQUNEIiwic291cmNlc0NvbnRlbnQiOlsicmVxdWlyZShcImJhYmVsLXBvbHlmaWxsXCIpO1xuaW1wb3J0IFdlYlJUQyBmcm9tIFwid2VicnRjNG1lXCI7XG5pbXBvcnQgSGVscGVyIGZyb20gXCIuL2tVdGlsXCI7XG5pbXBvcnQgS1Jlc3BvbmRlciBmcm9tIFwiLi9rUmVzcG9uZGVyXCI7XG5pbXBvcnQgZGVmLCB7IG5ldHdvcmtGb3JtYXQgfSBmcm9tIFwiLi9LQ29uc3RcIjtcbmltcG9ydCB7IGRpc3RhbmNlIH0gZnJvbSBcImthZC1kaXN0YW5jZVwiO1xuaW1wb3J0IHsgbWVzc2FnZSB9IGZyb20gXCJ3ZWJydGM0bWUvbGliL2ludGVyZmFjZVwiO1xuaW1wb3J0IHsgQlNPTiB9IGZyb20gXCJic29uXCI7XG5cbmNvbnN0IGJzb24gPSBuZXcgQlNPTigpO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBLYWRlbWxpYSB7XG4gIG5vZGVJZDogc3RyaW5nO1xuICBrOiBudW1iZXI7XG4gIGtidWNrZXRzOiBBcnJheTxBcnJheTxXZWJSVEM+PjtcbiAgZjogSGVscGVyO1xuICByZXNwb25kZXI6IEtSZXNwb25kZXI7XG4gIGRhdGFMaXN0OiBBcnJheTxhbnk+ID0gW107XG4gIGtleVZhbHVlTGlzdDogeyBba2V5OiBzdHJpbmddOiBhbnkgfSA9IHt9O1xuICByZWY6IHsgW2tleTogc3RyaW5nXTogV2ViUlRDIH0gPSB7fTtcbiAgYnVmZmVyOiB7IFtrZXk6IHN0cmluZ106IEFycmF5PGFueT4gfSA9IHt9O1xuICBzdGF0ZSA9IHtcbiAgICBpc09mZmVyOiBmYWxzZSxcbiAgICBmaW5kTm9kZTogXCJcIixcbiAgICBoYXNoOiB7fVxuICB9O1xuXG4gIGNhbGxiYWNrID0ge1xuICAgIG9uQ29ubmVjdDogKCkgPT4ge30sXG4gICAgb25BZGRQZWVyOiAodj86IGFueSkgPT4ge30sXG4gICAgb25QZWVyRGlzY29ubmVjdDogKHY/OiBhbnkpID0+IHt9LFxuICAgIG9uRmluZFZhbHVlOiAodj86IGFueSkgPT4ge30sXG4gICAgb25GaW5kTm9kZTogKHY/OiBhbnkpID0+IHt9LFxuICAgIG9uU3RvcmU6ICh2PzogYW55KSA9PiB7fSxcbiAgICBvbkFwcDogKHY/OiBhbnkpID0+IHt9XG4gIH07XG5cbiAgY29uc3RydWN0b3IoX25vZGVJZDogc3RyaW5nLCBvcHQ/OiB7IGtMZW5ndGg/OiBudW1iZXIgfSkge1xuICAgIGNvbnNvbGUubG9nKFwic3RhcnQga2FkXCIsIF9ub2RlSWQpO1xuICAgIHRoaXMuayA9IDIwO1xuICAgIGlmIChvcHQpIGlmIChvcHQua0xlbmd0aCkgdGhpcy5rID0gb3B0LmtMZW5ndGg7XG4gICAgdGhpcy5ub2RlSWQgPSBfbm9kZUlkO1xuXG4gICAgdGhpcy5rYnVja2V0cyA9IG5ldyBBcnJheSgxNjApO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgMTYwOyBpKyspIHtcbiAgICAgIGxldCBrYnVja2V0OiBBcnJheTxhbnk+ID0gW107XG4gICAgICB0aGlzLmtidWNrZXRzW2ldID0ga2J1Y2tldDtcbiAgICB9XG5cbiAgICB0aGlzLmYgPSBuZXcgSGVscGVyKHRoaXMuaywgdGhpcy5rYnVja2V0cyk7XG4gICAgdGhpcy5yZXNwb25kZXIgPSBuZXcgS1Jlc3BvbmRlcih0aGlzKTtcbiAgfVxuXG4gIHN0b3JlKHNlbmRlcjogc3RyaW5nLCBrZXk6IHN0cmluZywgdmFsdWU6IGFueSkge1xuICAgIC8v6Ieq5YiG44Gr5LiA55Wq6L+R44GE44OU44Ki44KS5Y+W5b6XXG4gICAgY29uc3QgcGVlciA9IHRoaXMuZi5nZXRDbG9zZUVzdFBlZXIoa2V5KTtcbiAgICBpZiAoIXBlZXIpIHJldHVybjtcbiAgICBjb25zb2xlLmxvZyhkZWYuU1RPUkUsIFwibmV4dFwiLCBwZWVyLm5vZGVJZCwgXCJ0YXJnZXRcIiwga2V5KTtcbiAgICBjb25zdCBzZW5kRGF0YTogU3RvcmVGb3JtYXQgPSB7IHNlbmRlciwga2V5LCB2YWx1ZSB9O1xuICAgIGNvbnN0IG5ldHdvcmsgPSBuZXR3b3JrRm9ybWF0KHRoaXMubm9kZUlkLCBkZWYuU1RPUkUsIHNlbmREYXRhKTtcbiAgICBwZWVyLnNlbmQobmV0d29yaywgXCJrYWRcIik7XG4gICAgY29uc29sZS5sb2coXCJzdG9yZSBkb25lXCIsIHsgbmV0d29yayB9KTtcbiAgICB0aGlzLmtleVZhbHVlTGlzdFtrZXldID0gdmFsdWU7XG4gICAgdGhpcy5jYWxsYmFjay5vblN0b3JlKHRoaXMua2V5VmFsdWVMaXN0KTtcbiAgfVxuXG4gIHN0b3JlQ2h1bmtzKHNlbmRlcjogc3RyaW5nLCBrZXk6IHN0cmluZywgY2h1bmtzOiBBcnJheUJ1ZmZlcltdKSB7XG4gICAgY29uc3QgcGVlciA9IHRoaXMuZi5nZXRDbG9zZUVzdFBlZXIoa2V5KTtcbiAgICBpZiAoIXBlZXIpIHJldHVybjtcbiAgICBjaHVua3MuZm9yRWFjaCgoY2h1bmssIGkpID0+IHtcbiAgICAgIGNvbnN0IHNlbmREYXRhOiBTdG9yZUNodW5rcyA9IHtcbiAgICAgICAgc2VuZGVyOiB0aGlzLm5vZGVJZCxcbiAgICAgICAga2V5LFxuICAgICAgICB2YWx1ZTogY2h1bmssXG4gICAgICAgIGluZGV4OiBpLFxuICAgICAgICBzaXplOiBjaHVua3MubGVuZ3RoXG4gICAgICB9O1xuICAgICAgY29uc3QgbmV0d29yayA9IG5ldHdvcmtGb3JtYXQoc2VuZGVyLCBkZWYuU1RPUkVfQ0hVTktTLCBzZW5kRGF0YSk7XG4gICAgICBwZWVyLnNlbmQobmV0d29yaywgXCJrYWRcIik7XG4gICAgICB0aGlzLmtleVZhbHVlTGlzdFtrZXldID0gY2h1bmtzO1xuICAgICAgdGhpcy5jYWxsYmFjay5vblN0b3JlKHRoaXMua2V5VmFsdWVMaXN0KTtcbiAgICB9KTtcbiAgfVxuXG4gIGZpbmROb2RlKHRhcmdldElkOiBzdHJpbmcsIHBlZXI6IFdlYlJUQykge1xuICAgIGNvbnNvbGUubG9nKFwiZmluZG5vZGVcIiwgdGFyZ2V0SWQpO1xuICAgIHRoaXMuc3RhdGUuZmluZE5vZGUgPSB0YXJnZXRJZDtcbiAgICBjb25zdCBzZW5kRGF0YSA9IHsgdGFyZ2V0S2V5OiB0YXJnZXRJZCB9O1xuICAgIC8v6YCB44KLXG4gICAgcGVlci5zZW5kKG5ldHdvcmtGb3JtYXQodGhpcy5ub2RlSWQsIGRlZi5GSU5ETk9ERSwgc2VuZERhdGEpLCBcImthZFwiKTtcbiAgfVxuXG4gIGZpbmRWYWx1ZShrZXk6IHN0cmluZywgY2IgPSAodmFsdWU6IGFueSkgPT4ge30pIHtcbiAgICB0aGlzLmNhbGxiYWNrLm9uRmluZFZhbHVlID0gY2I7XG4gICAgLy9rZXnjgavov5HjgYTjg5TjgqLjgpLlj5blvpdcbiAgICBjb25zdCBwZWVycyA9IHRoaXMuZi5nZXRDbG9zZVBlZXJzKGtleSk7XG4gICAgcGVlcnMuZm9yRWFjaChwZWVyID0+IHtcbiAgICAgIHRoaXMuZG9GaW5kdmFsdWUoa2V5LCBwZWVyKTtcbiAgICB9KTtcbiAgfVxuXG4gIGFzeW5jIGRvRmluZHZhbHVlKGtleTogc3RyaW5nLCBwZWVyOiBXZWJSVEMpIHtcbiAgICBjb25zb2xlLmxvZyhcImRvZmluZHZhbHVlXCIsIHBlZXIubm9kZUlkKTtcbiAgICBjb25zdCBzZW5kRGF0YTogRmluZFZhbHVlID0geyB0YXJnZXRLZXk6IGtleSB9O1xuICAgIHBlZXIuc2VuZChuZXR3b3JrRm9ybWF0KHRoaXMubm9kZUlkLCBkZWYuRklORFZBTFVFLCBzZW5kRGF0YSksIFwia2FkXCIpO1xuICB9XG5cbiAgY29ubmVjdChwZWVyOiBXZWJSVEMpIHtcbiAgICB0aGlzLmFkZGtub2RlKHBlZXIpO1xuICAgIHRoaXMuY2FsbGJhY2sub25Db25uZWN0KCk7XG4gIH1cblxuICBhZGRrbm9kZShwZWVyOiBXZWJSVEMpIHtcbiAgICBwZWVyLmV2ZW50cy5kYXRhW1wia2FkZW1saWEudHNcIl0gPSByYXcgPT4ge1xuICAgICAgdGhpcy5vbkNvbW1hbmQocmF3KTtcbiAgICB9O1xuXG4gICAgcGVlci5kaXNjb25uZWN0ID0gKCkgPT4ge1xuICAgICAgY29uc29sZS5sb2coXCJrYWQgbm9kZSBkaXNjb25uZWN0ZWRcIik7XG4gICAgICB0aGlzLmYuY2xlYW5EaXNjb24oKTtcbiAgICAgIHRoaXMuY2FsbGJhY2sub25BZGRQZWVyKHRoaXMuZi5nZXRBbGxQZWVySWRzKCkpO1xuICAgIH07XG5cbiAgICBpZiAoIXRoaXMuZi5pc05vZGVFeGlzdChwZWVyLm5vZGVJZCkpIHtcbiAgICAgIC8v6Ieq5YiG44Gu44OO44O844OJSUTjgajov73liqDjgZnjgovjg47jg7zjg4lJROOBrui3nembolxuICAgICAgY29uc3QgbnVtID0gZGlzdGFuY2UodGhpcy5ub2RlSWQsIHBlZXIubm9kZUlkKTtcbiAgICAgIC8va2J1Y2tldHPjga7oqbLlvZPjgZnjgovot53pm6Ljga5rYnVja2V044KS5ZG844Gz5Ye644GZXG4gICAgICBjb25zdCBrYnVja2V0ID0gdGhpcy5rYnVja2V0c1tudW1dO1xuICAgICAgLy/oqbLlvZPjgZnjgotrYnVja2V044Gr5paw44GX44GE44OU44Ki44KS5Yqg44GI44KLXG4gICAgICBrYnVja2V0LnB1c2gocGVlcik7XG5cbiAgICAgIGNvbnNvbGUubG9nKFwiYWRka25vZGUga2J1Y2tldHNcIiwgXCJwZWVyLm5vZGVJZDpcIiwgcGVlci5ub2RlSWQpO1xuICAgICAgY29uc29sZS5sb2codGhpcy5mLmdldEFsbFBlZXJJZHMoKSk7XG5cbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICB0aGlzLmZpbmROZXdQZWVyKHBlZXIpO1xuICAgICAgfSwgMTAwMCk7XG5cbiAgICAgIHRoaXMuY2FsbGJhY2sub25BZGRQZWVyKHRoaXMuZi5nZXRBbGxQZWVySWRzKCkpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgZmluZE5ld1BlZXIocGVlcjogV2ViUlRDKSB7XG4gICAgaWYgKHRoaXMuZi5nZXRLYnVja2V0TnVtKCkgPCB0aGlzLmspIHtcbiAgICAgIC8v6Ieq6Lqr44Gu44OO44O844OJSUTjgpJrZXnjgajjgZfjgaZGSU5EX05PREVcbiAgICAgIHRoaXMuZmluZE5vZGUodGhpcy5ub2RlSWQsIHBlZXIpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmxvZyhcImtidWNrZXQgcmVhZHlcIiwgdGhpcy5mLmdldEtidWNrZXROdW0oKSk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBtYWludGFpbihuZXR3b3JrOiBhbnkpIHtcbiAgICBjb25zdCBpbnggPSBkaXN0YW5jZSh0aGlzLm5vZGVJZCwgbmV0d29yay5ub2RlSWQpO1xuICAgIGNvbnN0IGtidWNrZXQgPSB0aGlzLmtidWNrZXRzW2lueF07XG5cbiAgICAvL+mAgeS/oeWFg+OBjOipsuW9k+OBmeOCi2stYnVja2V044Gu5Lit44Gr44GC44Gj44Gf5aC05ZCIXG4gICAgLy/jgZ3jga7jg47jg7zjg4njgpJrLWJ1Y2tldOOBruacq+WwvuOBq+enu+OBmVxuICAgIGtidWNrZXQuZm9yRWFjaCgocGVlciwgaSkgPT4ge1xuICAgICAgaWYgKHBlZXIubm9kZUlkID09PSBuZXR3b3JrLm5vZGVJZCkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIm1haW50YWluXCIsIFwiTW92ZXPCoGl0wqB0b8KgdGhlwqB0YWlswqBvZsKgdGhlwqBsaXN0XCIpO1xuICAgICAgICBrYnVja2V0LnNwbGljZShpLCAxKTtcbiAgICAgICAga2J1Y2tldC5wdXNoKHBlZXIpO1xuICAgICAgICByZXR1cm4gMDtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vay1idWNrZXTjgYzjgZnjgafjgavmuoDmna/jgarloLTlkIjjgIFcbiAgICAvL+OBneOBrmstYnVja2V05Lit44Gu5YWI6aCt44Gu44OO44O844OJ44GM44Kq44Oz44Op44Kk44Oz44Gq44KJ5YWI6aCt44Gu44OO44O844OJ44KS5q6L44GZXG4gICAgaWYgKGtidWNrZXQubGVuZ3RoID4gdGhpcy5rKSB7XG4gICAgICBrYnVja2V0LnNoaWZ0KCk7XG4gICAgfVxuICB9XG5cbiAgb2ZmZXIodGFyZ2V0OiBzdHJpbmcsIHByb3h5ID0gbnVsbCkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjb25zdCByID0gdGhpcy5yZWY7XG4gICAgICBjb25zdCBwZWVyID0gKHJbdGFyZ2V0XSA9IG5ldyBXZWJSVEMoKSk7XG4gICAgICBwZWVyLm1ha2VPZmZlcigpO1xuXG4gICAgICBjb25zdCB0aW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHJlamVjdChcImthZCBvZmZlciB0aW1lb3V0XCIpO1xuICAgICAgfSwgNSAqIDEwMDApO1xuXG4gICAgICBwZWVyLnNpZ25hbCA9IHNkcCA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwia2FkIG9mZmVyIHN0b3JlXCIsIHRhcmdldCk7XG4gICAgICAgIGNvbnN0IF8gPSB0aGlzLmYuZ2V0Q2xvc2VFc3RQZWVyKHRhcmdldCk7XG4gICAgICAgIGlmICghXykgcmV0dXJuO1xuICAgICAgICBpZiAoXy5ub2RlSWQgIT09IHRhcmdldClcbiAgICAgICAgICB0aGlzLnN0b3JlKHRoaXMubm9kZUlkLCB0YXJnZXQsIHsgc2RwLCBwcm94eSB9KTtcbiAgICAgIH07XG5cbiAgICAgIHBlZXIuY29ubmVjdCA9ICgpID0+IHtcbiAgICAgICAgcGVlci5ub2RlSWQgPSB0YXJnZXQ7XG4gICAgICAgIGNvbnNvbGUubG9nKFwia2FkIG9mZmVyIGNvbm5lY3RlZFwiLCB0YXJnZXQpO1xuICAgICAgICB0aGlzLmFkZGtub2RlKHBlZXIpO1xuICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dCk7XG4gICAgICAgIHJlc29sdmUodHJ1ZSk7XG4gICAgICB9O1xuICAgIH0pO1xuICB9XG5cbiAgYW5zd2VyKHRhcmdldDogc3RyaW5nLCBzZHA6IHN0cmluZywgcHJveHk6IHN0cmluZykge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjb25zdCByID0gdGhpcy5yZWY7XG4gICAgICBjb25zdCBwZWVyID0gKHJbdGFyZ2V0XSA9IG5ldyBXZWJSVEMoKSk7XG4gICAgICBwZWVyLm1ha2VBbnN3ZXIoc2RwKTtcbiAgICAgIGNvbnNvbGUubG9nKFwia2FkIGFuc3dlclwiLCB0YXJnZXQpO1xuXG4gICAgICBjb25zdCB0aW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHJlamVjdChcImthZCBhbnN3ZXIgdGltZW91dFwiKTtcbiAgICAgIH0sIDUgKiAxMDAwKTtcblxuICAgICAgcGVlci5zaWduYWwgPSBzZHAgPT4ge1xuICAgICAgICBjb25zdCBfID0gdGhpcy5mLmdldFBlZXJGcm9tbm9kZUlkKHByb3h5KTtcbiAgICAgICAgLy/mnaXjgZ/jg6vjg7zjg4jjgavpgIHjgorov5TjgZlcbiAgICAgICAgY29uc3Qgc2VuZERhdGE6IFN0b3JlRm9ybWF0ID0ge1xuICAgICAgICAgIHNlbmRlcjogdGhpcy5ub2RlSWQsXG4gICAgICAgICAga2V5OiB0YXJnZXQsXG4gICAgICAgICAgdmFsdWU6IHsgc2RwIH1cbiAgICAgICAgfTtcbiAgICAgICAgaWYgKF8pIF8uc2VuZChuZXR3b3JrRm9ybWF0KHRoaXMubm9kZUlkLCBkZWYuU1RPUkUsIHNlbmREYXRhKSwgXCJrYWRcIik7XG4gICAgICB9O1xuXG4gICAgICBwZWVyLmNvbm5lY3QgPSAoKSA9PiB7XG4gICAgICAgIHBlZXIubm9kZUlkID0gdGFyZ2V0O1xuICAgICAgICBjb25zb2xlLmxvZyhcImthZCBhbnN3ZXIgY29ubmVjdGVkXCIsIHRhcmdldCk7XG4gICAgICAgIHRoaXMuYWRka25vZGUocGVlcik7XG4gICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KTtcbiAgICAgICAgcmVzb2x2ZSh0cnVlKTtcbiAgICAgIH07XG4gICAgfSk7XG4gIH1cblxuICBzZW5kKHRhcmdldDogc3RyaW5nLCBkYXRhOiBhbnkpIHtcbiAgICBjb25zdCBfID0gdGhpcy5mLmdldFBlZXJGcm9tbm9kZUlkKHRhcmdldCk7XG4gICAgaWYgKF8pIF8uc2VuZChuZXR3b3JrRm9ybWF0KHRoaXMubm9kZUlkLCBkZWYuU0VORCwgZGF0YSksIFwia2FkXCIpO1xuICB9XG5cbiAgcHJpdmF0ZSBvbkNvbW1hbmQobWVzc2FnZTogbWVzc2FnZSkge1xuICAgIHN3aXRjaCAobWVzc2FnZS5sYWJlbCkge1xuICAgICAgY2FzZSBcImthZFwiOlxuICAgICAgICBjb25zdCBkYXRhTGluazogQnVmZmVyID0gQnVmZmVyLmZyb20obWVzc2FnZS5kYXRhKTtcbiAgICAgICAgY29uc29sZS5sb2coeyBkYXRhTGluayB9KTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhcIm9uY29tbWFuZCBrYWRcIiwgeyBtZXNzYWdlIH0sIHsgZGF0YUxpbmsgfSk7XG4gICAgICAgICAgY29uc3QgbmV0d29ya0xheWVyOiBuZXR3b3JrID0gYnNvbi5kZXNlcmlhbGl6ZShkYXRhTGluayk7XG4gICAgICAgICAgaWYgKCFKU09OLnN0cmluZ2lmeSh0aGlzLmRhdGFMaXN0KS5pbmNsdWRlcyhuZXR3b3JrTGF5ZXIuaGFzaCkpIHtcbiAgICAgICAgICAgIHRoaXMuZGF0YUxpc3QucHVzaChuZXR3b3JrTGF5ZXIuaGFzaCk7XG4gICAgICAgICAgICB0aGlzLm9uUmVxdWVzdChuZXR3b3JrTGF5ZXIpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvcik7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBvblJlcXVlc3QobmV0d29yazogYW55KSB7XG4gICAgdGhpcy5yZXNwb25kZXIucmVzcG9uc2UobmV0d29yay50eXBlLCBuZXR3b3JrKTtcbiAgICB0aGlzLm1haW50YWluKG5ldHdvcmspO1xuICB9XG59XG4iXX0=
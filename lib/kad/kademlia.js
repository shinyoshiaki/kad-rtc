"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.excuteEvent = excuteEvent;
exports.default = void 0;

var _webrtc4me = _interopRequireDefault(require("webrtc4me"));

var _kUtil = _interopRequireDefault(require("./kUtil"));

var _kResponder = _interopRequireDefault(require("./kResponder"));

var _KConst = _interopRequireWildcard(require("./KConst"));

var _kadDistance = require("kad-distance");

var _bson = require("bson");

var _cypher = _interopRequireDefault(require("../lib/cypher"));

var _sha = _interopRequireDefault(require("sha1"));

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

function excuteEvent(ev, v) {
  console.log("excuteEvent", ev);
  Object.keys(ev).forEach(function (key) {
    ev[key](v);
  });
}

var Kademlia =
/*#__PURE__*/
function () {
  function Kademlia(opt) {
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
      _onFindNode: function _onFindNode(v) {},
      onApp: function onApp(v) {}
    });

    _defineProperty(this, "onStore", {});

    _defineProperty(this, "onFindValue", {});

    _defineProperty(this, "onFindNode", {});

    _defineProperty(this, "events", {
      store: this.onStore,
      findvalue: this.onFindValue,
      findnode: this.onFindNode
    });

    _defineProperty(this, "cypher", void 0);

    this.k = 20;
    if (opt && opt.kLength) this.k = opt.kLength;
    if (opt) this.cypher = new _cypher.default(opt.secKey, opt.pubkey);else this.cypher = new _cypher.default();
    this.nodeId = (0, _sha.default)(this.cypher.pubKey).toString();
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
    value: function store(sender, key, value, opt) {
      var peers = this.f.getClosePeers(key, opt);
      var hash = (0, _sha.default)(Math.random().toString()).toString();
      var sendData = {
        sender: sender,
        key: key,
        value: value,
        pubKey: this.cypher.pubKey,
        hash: hash,
        sign: this.cypher.encrypt(hash)
      };
      var network = (0, _KConst.networkFormat)(this.nodeId, _KConst.default.STORE, sendData);
      peers.forEach(function (peer) {
        console.log(_KConst.default.STORE, "next", peer.nodeId, "target", key);
        peer.send(network, "kad");
      }); //no sdp

      if (!value.sdp) this.keyValueList[key] = value;
    }
  }, {
    key: "storeChunks",
    value: function storeChunks(sender, key, chunks, opt) {
      var _this = this;

      var peers = this.f.getClosePeers(key, opt);
      console.log("store chunks", {
        chunks: chunks
      });
      chunks.forEach(function (chunk, i) {
        var hash = (0, _sha.default)(Math.random().toString()).toString();
        var sendData = {
          sender: _this.nodeId,
          key: key,
          value: Buffer.from(chunk),
          index: i,
          pubKey: _this.cypher.pubKey,
          hash: hash,
          sign: _this.cypher.encrypt(hash),
          size: chunks.length
        };
        var network = (0, _KConst.networkFormat)(sender, _KConst.default.STORE_CHUNKS, sendData);
        peers.forEach(function (peer) {
          console.log(_KConst.default.STORE, "next", peer.nodeId, "target", key);
          peer.send(network, "kad");
        });
      }); //レプリケーション

      this.keyValueList[key] = {
        chunks: chunks
      };
    }
  }, {
    key: "findNode",
    value: function findNode(targetId, peer) {
      var _this2 = this;

      console.log("findnode", targetId);
      this.state.findNode = targetId;
      var sendData = {
        targetKey: targetId
      }; //送る

      peer.send((0, _KConst.networkFormat)(this.nodeId, _KConst.default.FINDNODE, sendData), "kad");

      this.callback._onFindNode(function (nodeId) {
        excuteEvent(_this2.events.findnode, nodeId);
      });
    }
  }, {
    key: "findValue",
    value: function findValue(key, opt) {
      var _this3 = this;

      return new Promise(
      /*#__PURE__*/
      function () {
        var _ref = _asyncToGenerator(
        /*#__PURE__*/
        regeneratorRuntime.mark(function _callee(resolve, reject) {
          var peers, _ownerId, _peers;

          return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
              switch (_context.prev = _context.next) {
                case 0:
                  _this3.callback._onFindValue = function (value) {
                    excuteEvent(_this3.events.findvalue, value);
                    resolve(value);
                  }; //keyに近いピアを取得


                  peers = _this3.f.getClosePeers(key);
                  peers.forEach(function (peer) {
                    _this3.doFindvalue(key, peer);
                  });
                  _context.next = 5;
                  return new Promise(function (r) {
                    return setTimeout(r, 5000);
                  });

                case 5:
                  if (!(opt && opt.ownerId)) {
                    _context.next = 11;
                    break;
                  }

                  _ownerId = opt.ownerId;
                  _peers = _this3.f.getClosePeers(_ownerId);

                  _peers.forEach(function (peer) {
                    _this3.doFindvalue(_ownerId, peer);
                  });

                  _context.next = 11;
                  return new Promise(function (r) {
                    return setTimeout(r, 5000);
                  });

                case 11:
                  reject("findvalue timeout");

                case 12:
                case "end":
                  return _context.stop();
              }
            }
          }, _callee, this);
        }));

        return function (_x, _x2) {
          return _ref.apply(this, arguments);
        };
      }());
    }
  }, {
    key: "doFindvalue",
    value: function () {
      var _doFindvalue = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee2(key, peer) {
        var sendData;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                console.log("dofindvalue", peer.nodeId);
                sendData = {
                  targetKey: key
                };
                peer.send((0, _KConst.networkFormat)(this.nodeId, _KConst.default.FINDVALUE, sendData), "kad");

              case 3:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      return function doFindvalue(_x3, _x4) {
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
      var _this4 = this;

      peer.events.data["kademlia.ts"] = function (raw) {
        _this4.onCommand(raw);
      };

      peer.disconnect = function () {
        console.log("kad node disconnected");

        _this4.f.cleanDiscon();

        _this4.callback.onAddPeer(_this4.f.getAllPeerIds());
      };

      if (!this.f.isNodeExist(peer.nodeId)) {
        //自分のノードIDと追加するノードIDの距離
        var num = (0, _kadDistance.distance)(this.nodeId, peer.nodeId); //kbucketsの該当する距離のkbucketを呼び出す

        var kbucket = this.kbuckets[num]; //該当するkbucketに新しいピアを加える

        kbucket.push(peer);
        console.log("addknode kbuckets", "peer.nodeId:", peer.nodeId);
        console.log(this.f.getAllPeerIds());
        setTimeout(function () {
          _this4.findNewPeer(peer);
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
      regeneratorRuntime.mark(function _callee3(network) {
        var inx, kbucket;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
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
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      return function maintain(_x5) {
        return _maintain.apply(this, arguments);
      };
    }()
  }, {
    key: "offer",
    value: function offer(target) {
      var _this5 = this;

      var proxy = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      return new Promise(function (resolve, reject) {
        var r = _this5.ref;
        var peer = r[target] = new _webrtc4me.default();
        peer.makeOffer();
        var timeout = setTimeout(function () {
          reject("kad offer timeout");
        }, 5 * 1000);

        peer.signal = function (sdp) {
          console.log("kad offer store", target);

          var _ = _this5.f.getCloseEstPeer(target);

          if (!_) return;
          if (_.nodeId !== target) _this5.store(_this5.nodeId, target, {
            sdp: sdp,
            proxy: proxy
          });
        };

        peer.connect = function () {
          peer.nodeId = target;
          console.log("kad offer connected", target);

          _this5.addknode(peer);

          clearTimeout(timeout);
          resolve(true);
        };
      });
    }
  }, {
    key: "answer",
    value: function answer(target, sdp, proxy) {
      var _this6 = this;

      return new Promise(function (resolve, reject) {
        var r = _this6.ref;
        var peer = r[target] = new _webrtc4me.default();
        peer.makeAnswer(sdp);
        console.log("kad answer", target);
        var timeout = setTimeout(function () {
          reject("kad answer timeout");
        }, 5 * 1000);

        peer.signal = function (sdp) {
          var _ = _this6.f.getPeerFromnodeId(proxy);

          var hash = (0, _sha.default)(Math.random().toString()).toString();
          var sendData = {
            sender: _this6.nodeId,
            key: target,
            value: {
              sdp: sdp
            },
            pubKey: _this6.cypher.pubKey,
            hash: hash,
            sign: _this6.cypher.encrypt(hash)
          };
          if (_) _.send((0, _KConst.networkFormat)(_this6.nodeId, _KConst.default.STORE, sendData), "kad");
        };

        peer.connect = function () {
          peer.nodeId = target;
          console.log("kad answer connected", target);

          _this6.addknode(peer);

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

          try {
            var networkLayer = bson.deserialize(buffer);
            console.log("oncommand kad", {
              message: message
            }, {
              networkLayer: networkLayer
            });

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9rYWQva2FkZW1saWEudHMiXSwibmFtZXMiOlsicmVxdWlyZSIsImJzb24iLCJCU09OIiwiZXhjdXRlRXZlbnQiLCJldiIsInYiLCJjb25zb2xlIiwibG9nIiwiT2JqZWN0Iiwia2V5cyIsImZvckVhY2giLCJrZXkiLCJLYWRlbWxpYSIsIm9wdCIsImlzRmlyc3RDb25uZWN0IiwiaXNPZmZlciIsImZpbmROb2RlIiwiaGFzaCIsIm9uQ29ubmVjdCIsIm9uQWRkUGVlciIsIm9uUGVlckRpc2Nvbm5lY3QiLCJfb25GaW5kVmFsdWUiLCJfb25GaW5kTm9kZSIsIm9uQXBwIiwic3RvcmUiLCJvblN0b3JlIiwiZmluZHZhbHVlIiwib25GaW5kVmFsdWUiLCJmaW5kbm9kZSIsIm9uRmluZE5vZGUiLCJrIiwia0xlbmd0aCIsImN5cGhlciIsIkN5cGhlciIsInNlY0tleSIsInB1YmtleSIsIm5vZGVJZCIsInB1YktleSIsInRvU3RyaW5nIiwia2J1Y2tldHMiLCJBcnJheSIsImkiLCJrYnVja2V0IiwiZiIsIkhlbHBlciIsInJlc3BvbmRlciIsIktSZXNwb25kZXIiLCJzZW5kZXIiLCJ2YWx1ZSIsInBlZXJzIiwiZ2V0Q2xvc2VQZWVycyIsIk1hdGgiLCJyYW5kb20iLCJzZW5kRGF0YSIsInNpZ24iLCJlbmNyeXB0IiwibmV0d29yayIsImRlZiIsIlNUT1JFIiwicGVlciIsInNlbmQiLCJzZHAiLCJrZXlWYWx1ZUxpc3QiLCJjaHVua3MiLCJjaHVuayIsIkJ1ZmZlciIsImZyb20iLCJpbmRleCIsInNpemUiLCJsZW5ndGgiLCJTVE9SRV9DSFVOS1MiLCJ0YXJnZXRJZCIsInN0YXRlIiwidGFyZ2V0S2V5IiwiRklORE5PREUiLCJjYWxsYmFjayIsImV2ZW50cyIsIlByb21pc2UiLCJyZXNvbHZlIiwicmVqZWN0IiwiZG9GaW5kdmFsdWUiLCJyIiwic2V0VGltZW91dCIsIm93bmVySWQiLCJGSU5EVkFMVUUiLCJhZGRrbm9kZSIsImRhdGEiLCJyYXciLCJvbkNvbW1hbmQiLCJkaXNjb25uZWN0IiwiY2xlYW5EaXNjb24iLCJnZXRBbGxQZWVySWRzIiwiaXNOb2RlRXhpc3QiLCJudW0iLCJwdXNoIiwiZmluZE5ld1BlZXIiLCJnZXRLYnVja2V0TnVtIiwiaW54Iiwic3BsaWNlIiwic2hpZnQiLCJ0YXJnZXQiLCJwcm94eSIsInJlZiIsIldlYlJUQyIsIm1ha2VPZmZlciIsInRpbWVvdXQiLCJzaWduYWwiLCJfIiwiZ2V0Q2xvc2VFc3RQZWVyIiwiY29ubmVjdCIsImNsZWFyVGltZW91dCIsIm1ha2VBbnN3ZXIiLCJnZXRQZWVyRnJvbW5vZGVJZCIsIlNFTkQiLCJtZXNzYWdlIiwibGFiZWwiLCJidWZmZXIiLCJuZXR3b3JrTGF5ZXIiLCJkZXNlcmlhbGl6ZSIsIkpTT04iLCJzdHJpbmdpZnkiLCJkYXRhTGlzdCIsImluY2x1ZGVzIiwib25SZXF1ZXN0IiwiZXJyb3IiLCJyZXNwb25zZSIsInR5cGUiLCJtYWludGFpbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBVEFBLE9BQU8sQ0FBQyxnQkFBRCxDQUFQOztBQVdBLElBQU1DLElBQUksR0FBRyxJQUFJQyxVQUFKLEVBQWI7O0FBQ08sU0FBU0MsV0FBVCxDQUFxQkMsRUFBckIsRUFBOEJDLENBQTlCLEVBQXVDO0FBQzVDQyxFQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWSxhQUFaLEVBQTJCSCxFQUEzQjtBQUNBSSxFQUFBQSxNQUFNLENBQUNDLElBQVAsQ0FBWUwsRUFBWixFQUFnQk0sT0FBaEIsQ0FBd0IsVUFBQUMsR0FBRyxFQUFJO0FBQzdCUCxJQUFBQSxFQUFFLENBQUNPLEdBQUQsQ0FBRixDQUFRTixDQUFSO0FBQ0QsR0FGRDtBQUdEOztJQUVvQk8sUTs7O0FBb0NuQixvQkFBWUMsR0FBWixFQUEwRTtBQUFBOztBQUFBOztBQUFBOztBQUFBOztBQUFBOztBQUFBOztBQUFBLHNDQTlCbkQsRUE4Qm1EOztBQUFBLDBDQTdCbkMsRUE2Qm1DOztBQUFBLGlDQTVCekMsRUE0QnlDOztBQUFBLG9DQTNCbEMsRUEyQmtDOztBQUFBLG1DQTFCbEU7QUFDTkMsTUFBQUEsY0FBYyxFQUFFLElBRFY7QUFFTkMsTUFBQUEsT0FBTyxFQUFFLEtBRkg7QUFHTkMsTUFBQUEsUUFBUSxFQUFFLEVBSEo7QUFJTkMsTUFBQUEsSUFBSSxFQUFFO0FBSkEsS0EwQmtFOztBQUFBLHNDQW5CL0Q7QUFDVEMsTUFBQUEsU0FBUyxFQUFFLHFCQUFNLENBQUUsQ0FEVjtBQUVUQyxNQUFBQSxTQUFTLEVBQUUsbUJBQUNkLENBQUQsRUFBYSxDQUFFLENBRmpCO0FBR1RlLE1BQUFBLGdCQUFnQixFQUFFLDBCQUFDZixDQUFELEVBQWEsQ0FBRSxDQUh4QjtBQUlUZ0IsTUFBQUEsWUFBWSxFQUFFLHNCQUFDaEIsQ0FBRCxFQUFhLENBQUUsQ0FKcEI7QUFLVGlCLE1BQUFBLFdBQVcsRUFBRSxxQkFBQ2pCLENBQUQsRUFBYSxDQUFFLENBTG5CO0FBTVRrQixNQUFBQSxLQUFLLEVBQUUsZUFBQ2xCLENBQUQsRUFBYSxDQUFFO0FBTmIsS0FtQitEOztBQUFBLHFDQVYzQixFQVUyQjs7QUFBQSx5Q0FUdkIsRUFTdUI7O0FBQUEsd0NBUnhCLEVBUXdCOztBQUFBLG9DQVBqRTtBQUNQbUIsTUFBQUEsS0FBSyxFQUFFLEtBQUtDLE9BREw7QUFFUEMsTUFBQUEsU0FBUyxFQUFFLEtBQUtDLFdBRlQ7QUFHUEMsTUFBQUEsUUFBUSxFQUFFLEtBQUtDO0FBSFIsS0FPaUU7O0FBQUE7O0FBQ3hFLFNBQUtDLENBQUwsR0FBUyxFQUFUO0FBQ0EsUUFBSWpCLEdBQUcsSUFBSUEsR0FBRyxDQUFDa0IsT0FBZixFQUF3QixLQUFLRCxDQUFMLEdBQVNqQixHQUFHLENBQUNrQixPQUFiO0FBQ3hCLFFBQUlsQixHQUFKLEVBQVMsS0FBS21CLE1BQUwsR0FBYyxJQUFJQyxlQUFKLENBQVdwQixHQUFHLENBQUNxQixNQUFmLEVBQXVCckIsR0FBRyxDQUFDc0IsTUFBM0IsQ0FBZCxDQUFULEtBQ0ssS0FBS0gsTUFBTCxHQUFjLElBQUlDLGVBQUosRUFBZDtBQUNMLFNBQUtHLE1BQUwsR0FBYyxrQkFBSyxLQUFLSixNQUFMLENBQVlLLE1BQWpCLEVBQXlCQyxRQUF6QixFQUFkO0FBRUEsU0FBS0MsUUFBTCxHQUFnQixJQUFJQyxLQUFKLENBQVUsR0FBVixDQUFoQjs7QUFDQSxTQUFLLElBQUlDLENBQUMsR0FBRyxDQUFiLEVBQWdCQSxDQUFDLEdBQUcsR0FBcEIsRUFBeUJBLENBQUMsRUFBMUIsRUFBOEI7QUFDNUIsVUFBSUMsT0FBbUIsR0FBRyxFQUExQjtBQUNBLFdBQUtILFFBQUwsQ0FBY0UsQ0FBZCxJQUFtQkMsT0FBbkI7QUFDRDs7QUFFRCxTQUFLQyxDQUFMLEdBQVMsSUFBSUMsY0FBSixDQUFXLEtBQUtkLENBQWhCLEVBQW1CLEtBQUtTLFFBQXhCLENBQVQ7QUFDQSxTQUFLTSxTQUFMLEdBQWlCLElBQUlDLG1CQUFKLENBQWUsSUFBZixDQUFqQjtBQUNEOzs7OzBCQUVLQyxNLEVBQWdCcEMsRyxFQUFhcUMsSyxFQUFZbkMsRyxFQUE4QjtBQUMzRSxVQUFNb0MsS0FBSyxHQUFHLEtBQUtOLENBQUwsQ0FBT08sYUFBUCxDQUFxQnZDLEdBQXJCLEVBQTBCRSxHQUExQixDQUFkO0FBQ0EsVUFBTUksSUFBSSxHQUFHLGtCQUFLa0MsSUFBSSxDQUFDQyxNQUFMLEdBQWNkLFFBQWQsRUFBTCxFQUErQkEsUUFBL0IsRUFBYjtBQUNBLFVBQU1lLFFBQXFCLEdBQUc7QUFDNUJOLFFBQUFBLE1BQU0sRUFBTkEsTUFENEI7QUFFNUJwQyxRQUFBQSxHQUFHLEVBQUhBLEdBRjRCO0FBRzVCcUMsUUFBQUEsS0FBSyxFQUFMQSxLQUg0QjtBQUk1QlgsUUFBQUEsTUFBTSxFQUFFLEtBQUtMLE1BQUwsQ0FBWUssTUFKUTtBQUs1QnBCLFFBQUFBLElBQUksRUFBSkEsSUFMNEI7QUFNNUJxQyxRQUFBQSxJQUFJLEVBQUUsS0FBS3RCLE1BQUwsQ0FBWXVCLE9BQVosQ0FBb0J0QyxJQUFwQjtBQU5zQixPQUE5QjtBQVFBLFVBQU11QyxPQUFPLEdBQUcsMkJBQWMsS0FBS3BCLE1BQW5CLEVBQTJCcUIsZ0JBQUlDLEtBQS9CLEVBQXNDTCxRQUF0QyxDQUFoQjtBQUNBSixNQUFBQSxLQUFLLENBQUN2QyxPQUFOLENBQWMsVUFBQWlELElBQUksRUFBSTtBQUNwQnJELFFBQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZa0QsZ0JBQUlDLEtBQWhCLEVBQXVCLE1BQXZCLEVBQStCQyxJQUFJLENBQUN2QixNQUFwQyxFQUE0QyxRQUE1QyxFQUFzRHpCLEdBQXREO0FBQ0FnRCxRQUFBQSxJQUFJLENBQUNDLElBQUwsQ0FBVUosT0FBVixFQUFtQixLQUFuQjtBQUNELE9BSEQsRUFaMkUsQ0FnQjNFOztBQUNBLFVBQUksQ0FBQ1IsS0FBSyxDQUFDYSxHQUFYLEVBQWdCLEtBQUtDLFlBQUwsQ0FBa0JuRCxHQUFsQixJQUF5QnFDLEtBQXpCO0FBQ2pCOzs7Z0NBR0NELE0sRUFDQXBDLEcsRUFDQW9ELE0sRUFDQWxELEcsRUFDQTtBQUFBOztBQUNBLFVBQU1vQyxLQUFLLEdBQUcsS0FBS04sQ0FBTCxDQUFPTyxhQUFQLENBQXFCdkMsR0FBckIsRUFBMEJFLEdBQTFCLENBQWQ7QUFDQVAsTUFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVksY0FBWixFQUE0QjtBQUFFd0QsUUFBQUEsTUFBTSxFQUFOQTtBQUFGLE9BQTVCO0FBQ0FBLE1BQUFBLE1BQU0sQ0FBQ3JELE9BQVAsQ0FBZSxVQUFDc0QsS0FBRCxFQUFRdkIsQ0FBUixFQUFjO0FBQzNCLFlBQU14QixJQUFJLEdBQUcsa0JBQUtrQyxJQUFJLENBQUNDLE1BQUwsR0FBY2QsUUFBZCxFQUFMLEVBQStCQSxRQUEvQixFQUFiO0FBQ0EsWUFBTWUsUUFBcUIsR0FBRztBQUM1Qk4sVUFBQUEsTUFBTSxFQUFFLEtBQUksQ0FBQ1gsTUFEZTtBQUU1QnpCLFVBQUFBLEdBQUcsRUFBSEEsR0FGNEI7QUFHNUJxQyxVQUFBQSxLQUFLLEVBQUVpQixNQUFNLENBQUNDLElBQVAsQ0FBWUYsS0FBWixDQUhxQjtBQUk1QkcsVUFBQUEsS0FBSyxFQUFFMUIsQ0FKcUI7QUFLNUJKLFVBQUFBLE1BQU0sRUFBRSxLQUFJLENBQUNMLE1BQUwsQ0FBWUssTUFMUTtBQU01QnBCLFVBQUFBLElBQUksRUFBSkEsSUFONEI7QUFPNUJxQyxVQUFBQSxJQUFJLEVBQUUsS0FBSSxDQUFDdEIsTUFBTCxDQUFZdUIsT0FBWixDQUFvQnRDLElBQXBCLENBUHNCO0FBUTVCbUQsVUFBQUEsSUFBSSxFQUFFTCxNQUFNLENBQUNNO0FBUmUsU0FBOUI7QUFVQSxZQUFNYixPQUFPLEdBQUcsMkJBQWNULE1BQWQsRUFBc0JVLGdCQUFJYSxZQUExQixFQUF3Q2pCLFFBQXhDLENBQWhCO0FBQ0FKLFFBQUFBLEtBQUssQ0FBQ3ZDLE9BQU4sQ0FBYyxVQUFBaUQsSUFBSSxFQUFJO0FBQ3BCckQsVUFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVlrRCxnQkFBSUMsS0FBaEIsRUFBdUIsTUFBdkIsRUFBK0JDLElBQUksQ0FBQ3ZCLE1BQXBDLEVBQTRDLFFBQTVDLEVBQXNEekIsR0FBdEQ7QUFDQWdELFVBQUFBLElBQUksQ0FBQ0MsSUFBTCxDQUFVSixPQUFWLEVBQW1CLEtBQW5CO0FBQ0QsU0FIRDtBQUlELE9BakJELEVBSEEsQ0FxQkE7O0FBQ0EsV0FBS00sWUFBTCxDQUFrQm5ELEdBQWxCLElBQXlCO0FBQUVvRCxRQUFBQSxNQUFNLEVBQU5BO0FBQUYsT0FBekI7QUFDRDs7OzZCQUVRUSxRLEVBQWtCWixJLEVBQWM7QUFBQTs7QUFDdkNyRCxNQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWSxVQUFaLEVBQXdCZ0UsUUFBeEI7QUFDQSxXQUFLQyxLQUFMLENBQVd4RCxRQUFYLEdBQXNCdUQsUUFBdEI7QUFDQSxVQUFNbEIsUUFBUSxHQUFHO0FBQUVvQixRQUFBQSxTQUFTLEVBQUVGO0FBQWIsT0FBakIsQ0FIdUMsQ0FJdkM7O0FBQ0FaLE1BQUFBLElBQUksQ0FBQ0MsSUFBTCxDQUFVLDJCQUFjLEtBQUt4QixNQUFuQixFQUEyQnFCLGdCQUFJaUIsUUFBL0IsRUFBeUNyQixRQUF6QyxDQUFWLEVBQThELEtBQTlEOztBQUVBLFdBQUtzQixRQUFMLENBQWNyRCxXQUFkLENBQTBCLFVBQUNjLE1BQUQsRUFBb0I7QUFDNUNqQyxRQUFBQSxXQUFXLENBQUMsTUFBSSxDQUFDeUUsTUFBTCxDQUFZaEQsUUFBYixFQUF1QlEsTUFBdkIsQ0FBWDtBQUNELE9BRkQ7QUFHRDs7OzhCQUVTekIsRyxFQUFhRSxHLEVBQTRCO0FBQUE7O0FBQ2pELGFBQU8sSUFBSWdFLE9BQUo7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLGdDQUFpQixpQkFBT0MsT0FBUCxFQUFnQkMsTUFBaEI7QUFBQTs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUN0QixrQkFBQSxNQUFJLENBQUNKLFFBQUwsQ0FBY3RELFlBQWQsR0FBNkIsVUFBQTJCLEtBQUssRUFBSTtBQUNwQzdDLG9CQUFBQSxXQUFXLENBQUMsTUFBSSxDQUFDeUUsTUFBTCxDQUFZbEQsU0FBYixFQUF3QnNCLEtBQXhCLENBQVg7QUFDQThCLG9CQUFBQSxPQUFPLENBQUM5QixLQUFELENBQVA7QUFDRCxtQkFIRCxDQURzQixDQUt0Qjs7O0FBQ01DLGtCQUFBQSxLQU5nQixHQU1SLE1BQUksQ0FBQ04sQ0FBTCxDQUFPTyxhQUFQLENBQXFCdkMsR0FBckIsQ0FOUTtBQU90QnNDLGtCQUFBQSxLQUFLLENBQUN2QyxPQUFOLENBQWMsVUFBQWlELElBQUksRUFBSTtBQUNwQixvQkFBQSxNQUFJLENBQUNxQixXQUFMLENBQWlCckUsR0FBakIsRUFBc0JnRCxJQUF0QjtBQUNELG1CQUZEO0FBUHNCO0FBQUEseUJBV2hCLElBQUlrQixPQUFKLENBQVksVUFBQUksQ0FBQztBQUFBLDJCQUFJQyxVQUFVLENBQUNELENBQUQsRUFBSSxJQUFKLENBQWQ7QUFBQSxtQkFBYixDQVhnQjs7QUFBQTtBQUFBLHdCQVlsQnBFLEdBQUcsSUFBSUEsR0FBRyxDQUFDc0UsT0FaTztBQUFBO0FBQUE7QUFBQTs7QUFhZEEsa0JBQUFBLFFBYmMsR0FhSnRFLEdBQUcsQ0FBQ3NFLE9BYkE7QUFjZGxDLGtCQUFBQSxNQWRjLEdBY04sTUFBSSxDQUFDTixDQUFMLENBQU9PLGFBQVAsQ0FBcUJpQyxRQUFyQixDQWRNOztBQWVwQmxDLGtCQUFBQSxNQUFLLENBQUN2QyxPQUFOLENBQWMsVUFBQWlELElBQUksRUFBSTtBQUNwQixvQkFBQSxNQUFJLENBQUNxQixXQUFMLENBQWlCRyxRQUFqQixFQUEwQnhCLElBQTFCO0FBQ0QsbUJBRkQ7O0FBZm9CO0FBQUEseUJBa0JkLElBQUlrQixPQUFKLENBQVksVUFBQUksQ0FBQztBQUFBLDJCQUFJQyxVQUFVLENBQUNELENBQUQsRUFBSSxJQUFKLENBQWQ7QUFBQSxtQkFBYixDQWxCYzs7QUFBQTtBQW9CdEJGLGtCQUFBQSxNQUFNLENBQUMsbUJBQUQsQ0FBTjs7QUFwQnNCO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLFNBQWpCOztBQUFBO0FBQUE7QUFBQTtBQUFBLFVBQVA7QUFzQkQ7Ozs7OztnREFFaUJwRSxHLEVBQWFnRCxJOzs7Ozs7QUFDN0JyRCxnQkFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVksYUFBWixFQUEyQm9ELElBQUksQ0FBQ3ZCLE1BQWhDO0FBQ01pQixnQkFBQUEsUSxHQUFzQjtBQUFFb0Isa0JBQUFBLFNBQVMsRUFBRTlEO0FBQWIsaUI7QUFDNUJnRCxnQkFBQUEsSUFBSSxDQUFDQyxJQUFMLENBQVUsMkJBQWMsS0FBS3hCLE1BQW5CLEVBQTJCcUIsZ0JBQUkyQixTQUEvQixFQUEwQy9CLFFBQTFDLENBQVYsRUFBK0QsS0FBL0Q7Ozs7Ozs7Ozs7Ozs7Ozs7NEJBR01NLEksRUFBYztBQUNwQnJELE1BQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZLGFBQVo7QUFDQSxVQUFJLEtBQUtpRSxLQUFMLENBQVcxRCxjQUFmLEVBQStCLEtBQUs2RCxRQUFMLENBQWN6RCxTQUFkO0FBQy9CLFdBQUtzRCxLQUFMLENBQVcxRCxjQUFYLEdBQTRCLEtBQTVCO0FBQ0EsV0FBS3VFLFFBQUwsQ0FBYzFCLElBQWQ7QUFDRDs7OzZCQUVRQSxJLEVBQWM7QUFBQTs7QUFDckJBLE1BQUFBLElBQUksQ0FBQ2lCLE1BQUwsQ0FBWVUsSUFBWixDQUFpQixhQUFqQixJQUFrQyxVQUFBQyxHQUFHLEVBQUk7QUFDdkMsUUFBQSxNQUFJLENBQUNDLFNBQUwsQ0FBZUQsR0FBZjtBQUNELE9BRkQ7O0FBSUE1QixNQUFBQSxJQUFJLENBQUM4QixVQUFMLEdBQWtCLFlBQU07QUFDdEJuRixRQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWSx1QkFBWjs7QUFDQSxRQUFBLE1BQUksQ0FBQ29DLENBQUwsQ0FBTytDLFdBQVA7O0FBQ0EsUUFBQSxNQUFJLENBQUNmLFFBQUwsQ0FBY3hELFNBQWQsQ0FBd0IsTUFBSSxDQUFDd0IsQ0FBTCxDQUFPZ0QsYUFBUCxFQUF4QjtBQUNELE9BSkQ7O0FBTUEsVUFBSSxDQUFDLEtBQUtoRCxDQUFMLENBQU9pRCxXQUFQLENBQW1CakMsSUFBSSxDQUFDdkIsTUFBeEIsQ0FBTCxFQUFzQztBQUNwQztBQUNBLFlBQU15RCxHQUFHLEdBQUcsMkJBQVMsS0FBS3pELE1BQWQsRUFBc0J1QixJQUFJLENBQUN2QixNQUEzQixDQUFaLENBRm9DLENBR3BDOztBQUNBLFlBQU1NLE9BQU8sR0FBRyxLQUFLSCxRQUFMLENBQWNzRCxHQUFkLENBQWhCLENBSm9DLENBS3BDOztBQUNBbkQsUUFBQUEsT0FBTyxDQUFDb0QsSUFBUixDQUFhbkMsSUFBYjtBQUVBckQsUUFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVksbUJBQVosRUFBaUMsY0FBakMsRUFBaURvRCxJQUFJLENBQUN2QixNQUF0RDtBQUNBOUIsUUFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVksS0FBS29DLENBQUwsQ0FBT2dELGFBQVAsRUFBWjtBQUVBVCxRQUFBQSxVQUFVLENBQUMsWUFBTTtBQUNmLFVBQUEsTUFBSSxDQUFDYSxXQUFMLENBQWlCcEMsSUFBakI7QUFDRCxTQUZTLEVBRVAsSUFGTyxDQUFWO0FBSUEsYUFBS2dCLFFBQUwsQ0FBY3hELFNBQWQsQ0FBd0IsS0FBS3dCLENBQUwsQ0FBT2dELGFBQVAsRUFBeEI7QUFDRDtBQUNGOzs7Z0NBRW1CaEMsSSxFQUFjO0FBQ2hDLFVBQUksS0FBS2hCLENBQUwsQ0FBT3FELGFBQVAsS0FBeUIsS0FBS2xFLENBQWxDLEVBQXFDO0FBQ25DO0FBQ0EsYUFBS2QsUUFBTCxDQUFjLEtBQUtvQixNQUFuQixFQUEyQnVCLElBQTNCO0FBQ0QsT0FIRCxNQUdPO0FBQ0xyRCxRQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWSxlQUFaLEVBQTZCLEtBQUtvQyxDQUFMLENBQU9xRCxhQUFQLEVBQTdCO0FBQ0Q7QUFDRjs7Ozs7O2dEQUVzQnhDLE87Ozs7OztBQUNmeUMsZ0JBQUFBLEcsR0FBTSwyQkFBUyxLQUFLN0QsTUFBZCxFQUFzQm9CLE9BQU8sQ0FBQ3BCLE1BQTlCLEM7QUFDTk0sZ0JBQUFBLE8sR0FBVSxLQUFLSCxRQUFMLENBQWMwRCxHQUFkLEMsRUFFaEI7QUFDQTs7QUFDQXZELGdCQUFBQSxPQUFPLENBQUNoQyxPQUFSLENBQWdCLFVBQUNpRCxJQUFELEVBQU9sQixDQUFQLEVBQWE7QUFDM0Isc0JBQUlrQixJQUFJLENBQUN2QixNQUFMLEtBQWdCb0IsT0FBTyxDQUFDcEIsTUFBNUIsRUFBb0M7QUFDbEM5QixvQkFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVksVUFBWixFQUF3QixrQ0FBeEI7QUFDQW1DLG9CQUFBQSxPQUFPLENBQUN3RCxNQUFSLENBQWV6RCxDQUFmLEVBQWtCLENBQWxCO0FBQ0FDLG9CQUFBQSxPQUFPLENBQUNvRCxJQUFSLENBQWFuQyxJQUFiO0FBQ0EsMkJBQU8sQ0FBUDtBQUNEO0FBQ0YsaUJBUEQsRSxDQVNBO0FBQ0E7O0FBQ0Esb0JBQUlqQixPQUFPLENBQUMyQixNQUFSLEdBQWlCLEtBQUt2QyxDQUExQixFQUE2QjtBQUMzQlksa0JBQUFBLE9BQU8sQ0FBQ3lELEtBQVI7QUFDRDs7Ozs7Ozs7Ozs7Ozs7OzswQkFHR0MsTSxFQUE4QjtBQUFBOztBQUFBLFVBQWRDLEtBQWMsdUVBQU4sSUFBTTtBQUNsQyxhQUFPLElBQUl4QixPQUFKLENBQVksVUFBQ0MsT0FBRCxFQUFVQyxNQUFWLEVBQXFCO0FBQ3RDLFlBQU1FLENBQUMsR0FBRyxNQUFJLENBQUNxQixHQUFmO0FBQ0EsWUFBTTNDLElBQUksR0FBSXNCLENBQUMsQ0FBQ21CLE1BQUQsQ0FBRCxHQUFZLElBQUlHLGtCQUFKLEVBQTFCO0FBQ0E1QyxRQUFBQSxJQUFJLENBQUM2QyxTQUFMO0FBRUEsWUFBTUMsT0FBTyxHQUFHdkIsVUFBVSxDQUFDLFlBQU07QUFDL0JILFVBQUFBLE1BQU0sQ0FBQyxtQkFBRCxDQUFOO0FBQ0QsU0FGeUIsRUFFdkIsSUFBSSxJQUZtQixDQUExQjs7QUFJQXBCLFFBQUFBLElBQUksQ0FBQytDLE1BQUwsR0FBYyxVQUFBN0MsR0FBRyxFQUFJO0FBQ25CdkQsVUFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVksaUJBQVosRUFBK0I2RixNQUEvQjs7QUFDQSxjQUFNTyxDQUFDLEdBQUcsTUFBSSxDQUFDaEUsQ0FBTCxDQUFPaUUsZUFBUCxDQUF1QlIsTUFBdkIsQ0FBVjs7QUFDQSxjQUFJLENBQUNPLENBQUwsRUFBUTtBQUNSLGNBQUlBLENBQUMsQ0FBQ3ZFLE1BQUYsS0FBYWdFLE1BQWpCLEVBQ0UsTUFBSSxDQUFDNUUsS0FBTCxDQUFXLE1BQUksQ0FBQ1ksTUFBaEIsRUFBd0JnRSxNQUF4QixFQUFnQztBQUFFdkMsWUFBQUEsR0FBRyxFQUFIQSxHQUFGO0FBQU93QyxZQUFBQSxLQUFLLEVBQUxBO0FBQVAsV0FBaEM7QUFDSCxTQU5EOztBQVFBMUMsUUFBQUEsSUFBSSxDQUFDa0QsT0FBTCxHQUFlLFlBQU07QUFDbkJsRCxVQUFBQSxJQUFJLENBQUN2QixNQUFMLEdBQWNnRSxNQUFkO0FBQ0E5RixVQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWSxxQkFBWixFQUFtQzZGLE1BQW5DOztBQUNBLFVBQUEsTUFBSSxDQUFDZixRQUFMLENBQWMxQixJQUFkOztBQUNBbUQsVUFBQUEsWUFBWSxDQUFDTCxPQUFELENBQVo7QUFDQTNCLFVBQUFBLE9BQU8sQ0FBQyxJQUFELENBQVA7QUFDRCxTQU5EO0FBT0QsT0F4Qk0sQ0FBUDtBQXlCRDs7OzJCQUVNc0IsTSxFQUFnQnZDLEcsRUFBYXdDLEssRUFBZTtBQUFBOztBQUNqRCxhQUFPLElBQUl4QixPQUFKLENBQVksVUFBQ0MsT0FBRCxFQUFVQyxNQUFWLEVBQXFCO0FBQ3RDLFlBQU1FLENBQUMsR0FBRyxNQUFJLENBQUNxQixHQUFmO0FBQ0EsWUFBTTNDLElBQUksR0FBSXNCLENBQUMsQ0FBQ21CLE1BQUQsQ0FBRCxHQUFZLElBQUlHLGtCQUFKLEVBQTFCO0FBQ0E1QyxRQUFBQSxJQUFJLENBQUNvRCxVQUFMLENBQWdCbEQsR0FBaEI7QUFDQXZELFFBQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZLFlBQVosRUFBMEI2RixNQUExQjtBQUVBLFlBQU1LLE9BQU8sR0FBR3ZCLFVBQVUsQ0FBQyxZQUFNO0FBQy9CSCxVQUFBQSxNQUFNLENBQUMsb0JBQUQsQ0FBTjtBQUNELFNBRnlCLEVBRXZCLElBQUksSUFGbUIsQ0FBMUI7O0FBSUFwQixRQUFBQSxJQUFJLENBQUMrQyxNQUFMLEdBQWMsVUFBQTdDLEdBQUcsRUFBSTtBQUNuQixjQUFNOEMsQ0FBQyxHQUFHLE1BQUksQ0FBQ2hFLENBQUwsQ0FBT3FFLGlCQUFQLENBQXlCWCxLQUF6QixDQUFWOztBQUNBLGNBQU1wRixJQUFJLEdBQUcsa0JBQUtrQyxJQUFJLENBQUNDLE1BQUwsR0FBY2QsUUFBZCxFQUFMLEVBQStCQSxRQUEvQixFQUFiO0FBQ0EsY0FBTWUsUUFBcUIsR0FBRztBQUM1Qk4sWUFBQUEsTUFBTSxFQUFFLE1BQUksQ0FBQ1gsTUFEZTtBQUU1QnpCLFlBQUFBLEdBQUcsRUFBRXlGLE1BRnVCO0FBRzVCcEQsWUFBQUEsS0FBSyxFQUFFO0FBQUVhLGNBQUFBLEdBQUcsRUFBSEE7QUFBRixhQUhxQjtBQUk1QnhCLFlBQUFBLE1BQU0sRUFBRSxNQUFJLENBQUNMLE1BQUwsQ0FBWUssTUFKUTtBQUs1QnBCLFlBQUFBLElBQUksRUFBSkEsSUFMNEI7QUFNNUJxQyxZQUFBQSxJQUFJLEVBQUUsTUFBSSxDQUFDdEIsTUFBTCxDQUFZdUIsT0FBWixDQUFvQnRDLElBQXBCO0FBTnNCLFdBQTlCO0FBUUEsY0FBSTBGLENBQUosRUFBT0EsQ0FBQyxDQUFDL0MsSUFBRixDQUFPLDJCQUFjLE1BQUksQ0FBQ3hCLE1BQW5CLEVBQTJCcUIsZ0JBQUlDLEtBQS9CLEVBQXNDTCxRQUF0QyxDQUFQLEVBQXdELEtBQXhEO0FBQ1IsU0FaRDs7QUFjQU0sUUFBQUEsSUFBSSxDQUFDa0QsT0FBTCxHQUFlLFlBQU07QUFDbkJsRCxVQUFBQSxJQUFJLENBQUN2QixNQUFMLEdBQWNnRSxNQUFkO0FBQ0E5RixVQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWSxzQkFBWixFQUFvQzZGLE1BQXBDOztBQUNBLFVBQUEsTUFBSSxDQUFDZixRQUFMLENBQWMxQixJQUFkOztBQUNBbUQsVUFBQUEsWUFBWSxDQUFDTCxPQUFELENBQVo7QUFDQTNCLFVBQUFBLE9BQU8sQ0FBQyxJQUFELENBQVA7QUFDRCxTQU5EO0FBT0QsT0EvQk0sQ0FBUDtBQWdDRDs7O3lCQUVJc0IsTSxFQUFnQmQsSSxFQUFXO0FBQzlCLFVBQU1xQixDQUFDLEdBQUcsS0FBS2hFLENBQUwsQ0FBT3FFLGlCQUFQLENBQXlCWixNQUF6QixDQUFWOztBQUNBLFVBQUlPLENBQUosRUFBT0EsQ0FBQyxDQUFDL0MsSUFBRixDQUFPLDJCQUFjLEtBQUt4QixNQUFuQixFQUEyQnFCLGdCQUFJd0QsSUFBL0IsRUFBcUMzQixJQUFyQyxDQUFQLEVBQW1ELEtBQW5EO0FBQ1I7Ozs4QkFFaUI0QixPLEVBQWtCO0FBQ2xDLGNBQVFBLE9BQU8sQ0FBQ0MsS0FBaEI7QUFDRSxhQUFLLEtBQUw7QUFDRSxjQUFNQyxNQUFjLEdBQUduRCxNQUFNLENBQUNDLElBQVAsQ0FBWWdELE9BQU8sQ0FBQzVCLElBQXBCLENBQXZCOztBQUNBLGNBQUk7QUFDRixnQkFBTStCLFlBQXFCLEdBQUdwSCxJQUFJLENBQUNxSCxXQUFMLENBQWlCRixNQUFqQixDQUE5QjtBQUNBOUcsWUFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVksZUFBWixFQUE2QjtBQUFFMkcsY0FBQUEsT0FBTyxFQUFQQTtBQUFGLGFBQTdCLEVBQTBDO0FBQUVHLGNBQUFBLFlBQVksRUFBWkE7QUFBRixhQUExQzs7QUFDQSxnQkFBSSxDQUFDRSxJQUFJLENBQUNDLFNBQUwsQ0FBZSxLQUFLQyxRQUFwQixFQUE4QkMsUUFBOUIsQ0FBdUNMLFlBQVksQ0FBQ3BHLElBQXBELENBQUwsRUFBZ0U7QUFDOUQsbUJBQUt3RyxRQUFMLENBQWMzQixJQUFkLENBQW1CdUIsWUFBWSxDQUFDcEcsSUFBaEM7QUFDQSxtQkFBSzBHLFNBQUwsQ0FBZU4sWUFBZjtBQUNEO0FBQ0YsV0FQRCxDQU9FLE9BQU9PLEtBQVAsRUFBYztBQUNkdEgsWUFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVlxSCxLQUFaO0FBQ0Q7O0FBQ0Q7QUFiSjtBQWVEOzs7OEJBRWlCcEUsTyxFQUFjO0FBQzlCLFdBQUtYLFNBQUwsQ0FBZWdGLFFBQWYsQ0FBd0JyRSxPQUFPLENBQUNzRSxJQUFoQyxFQUFzQ3RFLE9BQXRDO0FBQ0EsV0FBS3VFLFFBQUwsQ0FBY3ZFLE9BQWQ7QUFDRCIsInNvdXJjZXNDb250ZW50IjpbInJlcXVpcmUoXCJiYWJlbC1wb2x5ZmlsbFwiKTtcbmltcG9ydCBXZWJSVEMgZnJvbSBcIndlYnJ0YzRtZVwiO1xuaW1wb3J0IEhlbHBlciBmcm9tIFwiLi9rVXRpbFwiO1xuaW1wb3J0IEtSZXNwb25kZXIgZnJvbSBcIi4va1Jlc3BvbmRlclwiO1xuaW1wb3J0IGRlZiwgeyBuZXR3b3JrRm9ybWF0IH0gZnJvbSBcIi4vS0NvbnN0XCI7XG5pbXBvcnQgeyBkaXN0YW5jZSB9IGZyb20gXCJrYWQtZGlzdGFuY2VcIjtcbmltcG9ydCB7IG1lc3NhZ2UgfSBmcm9tIFwid2VicnRjNG1lL2xpYi9pbnRlcmZhY2VcIjtcbmltcG9ydCB7IEJTT04gfSBmcm9tIFwiYnNvblwiO1xuaW1wb3J0IEN5cGhlciBmcm9tIFwiLi4vbGliL2N5cGhlclwiO1xuaW1wb3J0IHNoYTEgZnJvbSBcInNoYTFcIjtcblxuY29uc3QgYnNvbiA9IG5ldyBCU09OKCk7XG5leHBvcnQgZnVuY3Rpb24gZXhjdXRlRXZlbnQoZXY6IGFueSwgdj86IGFueSkge1xuICBjb25zb2xlLmxvZyhcImV4Y3V0ZUV2ZW50XCIsIGV2KTtcbiAgT2JqZWN0LmtleXMoZXYpLmZvckVhY2goa2V5ID0+IHtcbiAgICBldltrZXldKHYpO1xuICB9KTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgS2FkZW1saWEge1xuICBub2RlSWQ6IHN0cmluZztcbiAgazogbnVtYmVyO1xuICBrYnVja2V0czogQXJyYXk8QXJyYXk8V2ViUlRDPj47XG4gIGY6IEhlbHBlcjtcbiAgcmVzcG9uZGVyOiBLUmVzcG9uZGVyO1xuICBkYXRhTGlzdDogQXJyYXk8YW55PiA9IFtdO1xuICBrZXlWYWx1ZUxpc3Q6IHsgW2tleTogc3RyaW5nXTogYW55IH0gPSB7fTtcbiAgcmVmOiB7IFtrZXk6IHN0cmluZ106IFdlYlJUQyB9ID0ge307XG4gIGJ1ZmZlcjogeyBba2V5OiBzdHJpbmddOiBBcnJheTxhbnk+IH0gPSB7fTtcbiAgc3RhdGUgPSB7XG4gICAgaXNGaXJzdENvbm5lY3Q6IHRydWUsXG4gICAgaXNPZmZlcjogZmFsc2UsXG4gICAgZmluZE5vZGU6IFwiXCIsXG4gICAgaGFzaDoge31cbiAgfTtcblxuICBjYWxsYmFjayA9IHtcbiAgICBvbkNvbm5lY3Q6ICgpID0+IHt9LFxuICAgIG9uQWRkUGVlcjogKHY/OiBhbnkpID0+IHt9LFxuICAgIG9uUGVlckRpc2Nvbm5lY3Q6ICh2PzogYW55KSA9PiB7fSxcbiAgICBfb25GaW5kVmFsdWU6ICh2PzogYW55KSA9PiB7fSxcbiAgICBfb25GaW5kTm9kZTogKHY/OiBhbnkpID0+IHt9LFxuICAgIG9uQXBwOiAodj86IGFueSkgPT4ge31cbiAgfTtcblxuICBvblN0b3JlOiB7IFtrZXk6IHN0cmluZ106ICh2OiBhbnkpID0+IHZvaWQgfSA9IHt9O1xuICBvbkZpbmRWYWx1ZTogeyBba2V5OiBzdHJpbmddOiAodjogYW55KSA9PiB2b2lkIH0gPSB7fTtcbiAgb25GaW5kTm9kZTogeyBba2V5OiBzdHJpbmddOiAodjogYW55KSA9PiB2b2lkIH0gPSB7fTtcbiAgZXZlbnRzID0ge1xuICAgIHN0b3JlOiB0aGlzLm9uU3RvcmUsXG4gICAgZmluZHZhbHVlOiB0aGlzLm9uRmluZFZhbHVlLFxuICAgIGZpbmRub2RlOiB0aGlzLm9uRmluZE5vZGVcbiAgfTtcbiAgY3lwaGVyOiBDeXBoZXI7XG5cbiAgY29uc3RydWN0b3Iob3B0PzogeyBwdWJrZXk/OiBzdHJpbmc7IHNlY0tleT86IHN0cmluZzsga0xlbmd0aD86IG51bWJlciB9KSB7XG4gICAgdGhpcy5rID0gMjA7XG4gICAgaWYgKG9wdCAmJiBvcHQua0xlbmd0aCkgdGhpcy5rID0gb3B0LmtMZW5ndGg7XG4gICAgaWYgKG9wdCkgdGhpcy5jeXBoZXIgPSBuZXcgQ3lwaGVyKG9wdC5zZWNLZXksIG9wdC5wdWJrZXkpO1xuICAgIGVsc2UgdGhpcy5jeXBoZXIgPSBuZXcgQ3lwaGVyKCk7XG4gICAgdGhpcy5ub2RlSWQgPSBzaGExKHRoaXMuY3lwaGVyLnB1YktleSkudG9TdHJpbmcoKTtcblxuICAgIHRoaXMua2J1Y2tldHMgPSBuZXcgQXJyYXkoMTYwKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IDE2MDsgaSsrKSB7XG4gICAgICBsZXQga2J1Y2tldDogQXJyYXk8YW55PiA9IFtdO1xuICAgICAgdGhpcy5rYnVja2V0c1tpXSA9IGtidWNrZXQ7XG4gICAgfVxuXG4gICAgdGhpcy5mID0gbmV3IEhlbHBlcih0aGlzLmssIHRoaXMua2J1Y2tldHMpO1xuICAgIHRoaXMucmVzcG9uZGVyID0gbmV3IEtSZXNwb25kZXIodGhpcyk7XG4gIH1cblxuICBzdG9yZShzZW5kZXI6IHN0cmluZywga2V5OiBzdHJpbmcsIHZhbHVlOiBhbnksIG9wdD86IHsgZXhjbHVkZUlkPzogc3RyaW5nIH0pIHtcbiAgICBjb25zdCBwZWVycyA9IHRoaXMuZi5nZXRDbG9zZVBlZXJzKGtleSwgb3B0KTtcbiAgICBjb25zdCBoYXNoID0gc2hhMShNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKCkpLnRvU3RyaW5nKCk7XG4gICAgY29uc3Qgc2VuZERhdGE6IFN0b3JlRm9ybWF0ID0ge1xuICAgICAgc2VuZGVyLFxuICAgICAga2V5LFxuICAgICAgdmFsdWUsXG4gICAgICBwdWJLZXk6IHRoaXMuY3lwaGVyLnB1YktleSxcbiAgICAgIGhhc2gsXG4gICAgICBzaWduOiB0aGlzLmN5cGhlci5lbmNyeXB0KGhhc2gpXG4gICAgfTtcbiAgICBjb25zdCBuZXR3b3JrID0gbmV0d29ya0Zvcm1hdCh0aGlzLm5vZGVJZCwgZGVmLlNUT1JFLCBzZW5kRGF0YSk7XG4gICAgcGVlcnMuZm9yRWFjaChwZWVyID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKGRlZi5TVE9SRSwgXCJuZXh0XCIsIHBlZXIubm9kZUlkLCBcInRhcmdldFwiLCBrZXkpO1xuICAgICAgcGVlci5zZW5kKG5ldHdvcmssIFwia2FkXCIpO1xuICAgIH0pO1xuICAgIC8vbm8gc2RwXG4gICAgaWYgKCF2YWx1ZS5zZHApIHRoaXMua2V5VmFsdWVMaXN0W2tleV0gPSB2YWx1ZTtcbiAgfVxuXG4gIHN0b3JlQ2h1bmtzKFxuICAgIHNlbmRlcjogc3RyaW5nLFxuICAgIGtleTogc3RyaW5nLFxuICAgIGNodW5rczogQXJyYXlCdWZmZXJbXSxcbiAgICBvcHQ/OiB7IGV4Y2x1ZGVJZD86IHN0cmluZyB9XG4gICkge1xuICAgIGNvbnN0IHBlZXJzID0gdGhpcy5mLmdldENsb3NlUGVlcnMoa2V5LCBvcHQpO1xuICAgIGNvbnNvbGUubG9nKFwic3RvcmUgY2h1bmtzXCIsIHsgY2h1bmtzIH0pO1xuICAgIGNodW5rcy5mb3JFYWNoKChjaHVuaywgaSkgPT4ge1xuICAgICAgY29uc3QgaGFzaCA9IHNoYTEoTWF0aC5yYW5kb20oKS50b1N0cmluZygpKS50b1N0cmluZygpO1xuICAgICAgY29uc3Qgc2VuZERhdGE6IFN0b3JlQ2h1bmtzID0ge1xuICAgICAgICBzZW5kZXI6IHRoaXMubm9kZUlkLFxuICAgICAgICBrZXksXG4gICAgICAgIHZhbHVlOiBCdWZmZXIuZnJvbShjaHVuayksXG4gICAgICAgIGluZGV4OiBpLFxuICAgICAgICBwdWJLZXk6IHRoaXMuY3lwaGVyLnB1YktleSxcbiAgICAgICAgaGFzaCxcbiAgICAgICAgc2lnbjogdGhpcy5jeXBoZXIuZW5jcnlwdChoYXNoKSxcbiAgICAgICAgc2l6ZTogY2h1bmtzLmxlbmd0aFxuICAgICAgfTtcbiAgICAgIGNvbnN0IG5ldHdvcmsgPSBuZXR3b3JrRm9ybWF0KHNlbmRlciwgZGVmLlNUT1JFX0NIVU5LUywgc2VuZERhdGEpO1xuICAgICAgcGVlcnMuZm9yRWFjaChwZWVyID0+IHtcbiAgICAgICAgY29uc29sZS5sb2coZGVmLlNUT1JFLCBcIm5leHRcIiwgcGVlci5ub2RlSWQsIFwidGFyZ2V0XCIsIGtleSk7XG4gICAgICAgIHBlZXIuc2VuZChuZXR3b3JrLCBcImthZFwiKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIC8v44Os44OX44Oq44Kx44O844K344On44OzXG4gICAgdGhpcy5rZXlWYWx1ZUxpc3Rba2V5XSA9IHsgY2h1bmtzIH07XG4gIH1cblxuICBmaW5kTm9kZSh0YXJnZXRJZDogc3RyaW5nLCBwZWVyOiBXZWJSVEMpIHtcbiAgICBjb25zb2xlLmxvZyhcImZpbmRub2RlXCIsIHRhcmdldElkKTtcbiAgICB0aGlzLnN0YXRlLmZpbmROb2RlID0gdGFyZ2V0SWQ7XG4gICAgY29uc3Qgc2VuZERhdGEgPSB7IHRhcmdldEtleTogdGFyZ2V0SWQgfTtcbiAgICAvL+mAgeOCi1xuICAgIHBlZXIuc2VuZChuZXR3b3JrRm9ybWF0KHRoaXMubm9kZUlkLCBkZWYuRklORE5PREUsIHNlbmREYXRhKSwgXCJrYWRcIik7XG5cbiAgICB0aGlzLmNhbGxiYWNrLl9vbkZpbmROb2RlKChub2RlSWQ6IHN0cmluZykgPT4ge1xuICAgICAgZXhjdXRlRXZlbnQodGhpcy5ldmVudHMuZmluZG5vZGUsIG5vZGVJZCk7XG4gICAgfSk7XG4gIH1cblxuICBmaW5kVmFsdWUoa2V5OiBzdHJpbmcsIG9wdD86IHsgb3duZXJJZD86IHN0cmluZyB9KSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlPGFueT4oYXN5bmMgKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgdGhpcy5jYWxsYmFjay5fb25GaW5kVmFsdWUgPSB2YWx1ZSA9PiB7XG4gICAgICAgIGV4Y3V0ZUV2ZW50KHRoaXMuZXZlbnRzLmZpbmR2YWx1ZSwgdmFsdWUpO1xuICAgICAgICByZXNvbHZlKHZhbHVlKTtcbiAgICAgIH07XG4gICAgICAvL2tleeOBq+i/keOBhOODlOOCouOCkuWPluW+l1xuICAgICAgY29uc3QgcGVlcnMgPSB0aGlzLmYuZ2V0Q2xvc2VQZWVycyhrZXkpO1xuICAgICAgcGVlcnMuZm9yRWFjaChwZWVyID0+IHtcbiAgICAgICAgdGhpcy5kb0ZpbmR2YWx1ZShrZXksIHBlZXIpO1xuICAgICAgfSk7XG5cbiAgICAgIGF3YWl0IG5ldyBQcm9taXNlKHIgPT4gc2V0VGltZW91dChyLCA1MDAwKSk7XG4gICAgICBpZiAob3B0ICYmIG9wdC5vd25lcklkKSB7XG4gICAgICAgIGNvbnN0IG93bmVySWQgPSBvcHQub3duZXJJZDtcbiAgICAgICAgY29uc3QgcGVlcnMgPSB0aGlzLmYuZ2V0Q2xvc2VQZWVycyhvd25lcklkKTtcbiAgICAgICAgcGVlcnMuZm9yRWFjaChwZWVyID0+IHtcbiAgICAgICAgICB0aGlzLmRvRmluZHZhbHVlKG93bmVySWQsIHBlZXIpO1xuICAgICAgICB9KTtcbiAgICAgICAgYXdhaXQgbmV3IFByb21pc2UociA9PiBzZXRUaW1lb3V0KHIsIDUwMDApKTtcbiAgICAgIH1cbiAgICAgIHJlamVjdChcImZpbmR2YWx1ZSB0aW1lb3V0XCIpO1xuICAgIH0pO1xuICB9XG5cbiAgYXN5bmMgZG9GaW5kdmFsdWUoa2V5OiBzdHJpbmcsIHBlZXI6IFdlYlJUQykge1xuICAgIGNvbnNvbGUubG9nKFwiZG9maW5kdmFsdWVcIiwgcGVlci5ub2RlSWQpO1xuICAgIGNvbnN0IHNlbmREYXRhOiBGaW5kVmFsdWUgPSB7IHRhcmdldEtleToga2V5IH07XG4gICAgcGVlci5zZW5kKG5ldHdvcmtGb3JtYXQodGhpcy5ub2RlSWQsIGRlZi5GSU5EVkFMVUUsIHNlbmREYXRhKSwgXCJrYWRcIik7XG4gIH1cblxuICBjb25uZWN0KHBlZXI6IFdlYlJUQykge1xuICAgIGNvbnNvbGUubG9nKFwia2FkIGNvbm5lY3RcIik7XG4gICAgaWYgKHRoaXMuc3RhdGUuaXNGaXJzdENvbm5lY3QpIHRoaXMuY2FsbGJhY2sub25Db25uZWN0KCk7XG4gICAgdGhpcy5zdGF0ZS5pc0ZpcnN0Q29ubmVjdCA9IGZhbHNlO1xuICAgIHRoaXMuYWRka25vZGUocGVlcik7XG4gIH1cblxuICBhZGRrbm9kZShwZWVyOiBXZWJSVEMpIHtcbiAgICBwZWVyLmV2ZW50cy5kYXRhW1wia2FkZW1saWEudHNcIl0gPSByYXcgPT4ge1xuICAgICAgdGhpcy5vbkNvbW1hbmQocmF3KTtcbiAgICB9O1xuXG4gICAgcGVlci5kaXNjb25uZWN0ID0gKCkgPT4ge1xuICAgICAgY29uc29sZS5sb2coXCJrYWQgbm9kZSBkaXNjb25uZWN0ZWRcIik7XG4gICAgICB0aGlzLmYuY2xlYW5EaXNjb24oKTtcbiAgICAgIHRoaXMuY2FsbGJhY2sub25BZGRQZWVyKHRoaXMuZi5nZXRBbGxQZWVySWRzKCkpO1xuICAgIH07XG5cbiAgICBpZiAoIXRoaXMuZi5pc05vZGVFeGlzdChwZWVyLm5vZGVJZCkpIHtcbiAgICAgIC8v6Ieq5YiG44Gu44OO44O844OJSUTjgajov73liqDjgZnjgovjg47jg7zjg4lJROOBrui3nembolxuICAgICAgY29uc3QgbnVtID0gZGlzdGFuY2UodGhpcy5ub2RlSWQsIHBlZXIubm9kZUlkKTtcbiAgICAgIC8va2J1Y2tldHPjga7oqbLlvZPjgZnjgovot53pm6Ljga5rYnVja2V044KS5ZG844Gz5Ye644GZXG4gICAgICBjb25zdCBrYnVja2V0ID0gdGhpcy5rYnVja2V0c1tudW1dO1xuICAgICAgLy/oqbLlvZPjgZnjgotrYnVja2V044Gr5paw44GX44GE44OU44Ki44KS5Yqg44GI44KLXG4gICAgICBrYnVja2V0LnB1c2gocGVlcik7XG5cbiAgICAgIGNvbnNvbGUubG9nKFwiYWRka25vZGUga2J1Y2tldHNcIiwgXCJwZWVyLm5vZGVJZDpcIiwgcGVlci5ub2RlSWQpO1xuICAgICAgY29uc29sZS5sb2codGhpcy5mLmdldEFsbFBlZXJJZHMoKSk7XG5cbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICB0aGlzLmZpbmROZXdQZWVyKHBlZXIpO1xuICAgICAgfSwgMTAwMCk7XG5cbiAgICAgIHRoaXMuY2FsbGJhY2sub25BZGRQZWVyKHRoaXMuZi5nZXRBbGxQZWVySWRzKCkpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgZmluZE5ld1BlZXIocGVlcjogV2ViUlRDKSB7XG4gICAgaWYgKHRoaXMuZi5nZXRLYnVja2V0TnVtKCkgPCB0aGlzLmspIHtcbiAgICAgIC8v6Ieq6Lqr44Gu44OO44O844OJSUTjgpJrZXnjgajjgZfjgaZGSU5EX05PREVcbiAgICAgIHRoaXMuZmluZE5vZGUodGhpcy5ub2RlSWQsIHBlZXIpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmxvZyhcImtidWNrZXQgcmVhZHlcIiwgdGhpcy5mLmdldEtidWNrZXROdW0oKSk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBtYWludGFpbihuZXR3b3JrOiBhbnkpIHtcbiAgICBjb25zdCBpbnggPSBkaXN0YW5jZSh0aGlzLm5vZGVJZCwgbmV0d29yay5ub2RlSWQpO1xuICAgIGNvbnN0IGtidWNrZXQgPSB0aGlzLmtidWNrZXRzW2lueF07XG5cbiAgICAvL+mAgeS/oeWFg+OBjOipsuW9k+OBmeOCi2stYnVja2V044Gu5Lit44Gr44GC44Gj44Gf5aC05ZCIXG4gICAgLy/jgZ3jga7jg47jg7zjg4njgpJrLWJ1Y2tldOOBruacq+WwvuOBq+enu+OBmVxuICAgIGtidWNrZXQuZm9yRWFjaCgocGVlciwgaSkgPT4ge1xuICAgICAgaWYgKHBlZXIubm9kZUlkID09PSBuZXR3b3JrLm5vZGVJZCkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIm1haW50YWluXCIsIFwiTW92ZXPCoGl0wqB0b8KgdGhlwqB0YWlswqBvZsKgdGhlwqBsaXN0XCIpO1xuICAgICAgICBrYnVja2V0LnNwbGljZShpLCAxKTtcbiAgICAgICAga2J1Y2tldC5wdXNoKHBlZXIpO1xuICAgICAgICByZXR1cm4gMDtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vay1idWNrZXTjgYzjgZnjgafjgavmuoDmna/jgarloLTlkIjjgIFcbiAgICAvL+OBneOBrmstYnVja2V05Lit44Gu5YWI6aCt44Gu44OO44O844OJ44GM44Kq44Oz44Op44Kk44Oz44Gq44KJ5YWI6aCt44Gu44OO44O844OJ44KS5q6L44GZXG4gICAgaWYgKGtidWNrZXQubGVuZ3RoID4gdGhpcy5rKSB7XG4gICAgICBrYnVja2V0LnNoaWZ0KCk7XG4gICAgfVxuICB9XG5cbiAgb2ZmZXIodGFyZ2V0OiBzdHJpbmcsIHByb3h5ID0gbnVsbCkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjb25zdCByID0gdGhpcy5yZWY7XG4gICAgICBjb25zdCBwZWVyID0gKHJbdGFyZ2V0XSA9IG5ldyBXZWJSVEMoKSk7XG4gICAgICBwZWVyLm1ha2VPZmZlcigpO1xuXG4gICAgICBjb25zdCB0aW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHJlamVjdChcImthZCBvZmZlciB0aW1lb3V0XCIpO1xuICAgICAgfSwgNSAqIDEwMDApO1xuXG4gICAgICBwZWVyLnNpZ25hbCA9IHNkcCA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwia2FkIG9mZmVyIHN0b3JlXCIsIHRhcmdldCk7XG4gICAgICAgIGNvbnN0IF8gPSB0aGlzLmYuZ2V0Q2xvc2VFc3RQZWVyKHRhcmdldCk7XG4gICAgICAgIGlmICghXykgcmV0dXJuO1xuICAgICAgICBpZiAoXy5ub2RlSWQgIT09IHRhcmdldClcbiAgICAgICAgICB0aGlzLnN0b3JlKHRoaXMubm9kZUlkLCB0YXJnZXQsIHsgc2RwLCBwcm94eSB9KTtcbiAgICAgIH07XG5cbiAgICAgIHBlZXIuY29ubmVjdCA9ICgpID0+IHtcbiAgICAgICAgcGVlci5ub2RlSWQgPSB0YXJnZXQ7XG4gICAgICAgIGNvbnNvbGUubG9nKFwia2FkIG9mZmVyIGNvbm5lY3RlZFwiLCB0YXJnZXQpO1xuICAgICAgICB0aGlzLmFkZGtub2RlKHBlZXIpO1xuICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dCk7XG4gICAgICAgIHJlc29sdmUodHJ1ZSk7XG4gICAgICB9O1xuICAgIH0pO1xuICB9XG5cbiAgYW5zd2VyKHRhcmdldDogc3RyaW5nLCBzZHA6IHN0cmluZywgcHJveHk6IHN0cmluZykge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjb25zdCByID0gdGhpcy5yZWY7XG4gICAgICBjb25zdCBwZWVyID0gKHJbdGFyZ2V0XSA9IG5ldyBXZWJSVEMoKSk7XG4gICAgICBwZWVyLm1ha2VBbnN3ZXIoc2RwKTtcbiAgICAgIGNvbnNvbGUubG9nKFwia2FkIGFuc3dlclwiLCB0YXJnZXQpO1xuXG4gICAgICBjb25zdCB0aW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHJlamVjdChcImthZCBhbnN3ZXIgdGltZW91dFwiKTtcbiAgICAgIH0sIDUgKiAxMDAwKTtcblxuICAgICAgcGVlci5zaWduYWwgPSBzZHAgPT4ge1xuICAgICAgICBjb25zdCBfID0gdGhpcy5mLmdldFBlZXJGcm9tbm9kZUlkKHByb3h5KTtcbiAgICAgICAgY29uc3QgaGFzaCA9IHNoYTEoTWF0aC5yYW5kb20oKS50b1N0cmluZygpKS50b1N0cmluZygpO1xuICAgICAgICBjb25zdCBzZW5kRGF0YTogU3RvcmVGb3JtYXQgPSB7XG4gICAgICAgICAgc2VuZGVyOiB0aGlzLm5vZGVJZCxcbiAgICAgICAgICBrZXk6IHRhcmdldCxcbiAgICAgICAgICB2YWx1ZTogeyBzZHAgfSxcbiAgICAgICAgICBwdWJLZXk6IHRoaXMuY3lwaGVyLnB1YktleSxcbiAgICAgICAgICBoYXNoLFxuICAgICAgICAgIHNpZ246IHRoaXMuY3lwaGVyLmVuY3J5cHQoaGFzaClcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKF8pIF8uc2VuZChuZXR3b3JrRm9ybWF0KHRoaXMubm9kZUlkLCBkZWYuU1RPUkUsIHNlbmREYXRhKSwgXCJrYWRcIik7XG4gICAgICB9O1xuXG4gICAgICBwZWVyLmNvbm5lY3QgPSAoKSA9PiB7XG4gICAgICAgIHBlZXIubm9kZUlkID0gdGFyZ2V0O1xuICAgICAgICBjb25zb2xlLmxvZyhcImthZCBhbnN3ZXIgY29ubmVjdGVkXCIsIHRhcmdldCk7XG4gICAgICAgIHRoaXMuYWRka25vZGUocGVlcik7XG4gICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KTtcbiAgICAgICAgcmVzb2x2ZSh0cnVlKTtcbiAgICAgIH07XG4gICAgfSk7XG4gIH1cblxuICBzZW5kKHRhcmdldDogc3RyaW5nLCBkYXRhOiBhbnkpIHtcbiAgICBjb25zdCBfID0gdGhpcy5mLmdldFBlZXJGcm9tbm9kZUlkKHRhcmdldCk7XG4gICAgaWYgKF8pIF8uc2VuZChuZXR3b3JrRm9ybWF0KHRoaXMubm9kZUlkLCBkZWYuU0VORCwgZGF0YSksIFwia2FkXCIpO1xuICB9XG5cbiAgcHJpdmF0ZSBvbkNvbW1hbmQobWVzc2FnZTogbWVzc2FnZSkge1xuICAgIHN3aXRjaCAobWVzc2FnZS5sYWJlbCkge1xuICAgICAgY2FzZSBcImthZFwiOlxuICAgICAgICBjb25zdCBidWZmZXI6IEJ1ZmZlciA9IEJ1ZmZlci5mcm9tKG1lc3NhZ2UuZGF0YSk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgY29uc3QgbmV0d29ya0xheWVyOiBuZXR3b3JrID0gYnNvbi5kZXNlcmlhbGl6ZShidWZmZXIpO1xuICAgICAgICAgIGNvbnNvbGUubG9nKFwib25jb21tYW5kIGthZFwiLCB7IG1lc3NhZ2UgfSwgeyBuZXR3b3JrTGF5ZXIgfSk7XG4gICAgICAgICAgaWYgKCFKU09OLnN0cmluZ2lmeSh0aGlzLmRhdGFMaXN0KS5pbmNsdWRlcyhuZXR3b3JrTGF5ZXIuaGFzaCkpIHtcbiAgICAgICAgICAgIHRoaXMuZGF0YUxpc3QucHVzaChuZXR3b3JrTGF5ZXIuaGFzaCk7XG4gICAgICAgICAgICB0aGlzLm9uUmVxdWVzdChuZXR3b3JrTGF5ZXIpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvcik7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBvblJlcXVlc3QobmV0d29yazogYW55KSB7XG4gICAgdGhpcy5yZXNwb25kZXIucmVzcG9uc2UobmV0d29yay50eXBlLCBuZXR3b3JrKTtcbiAgICB0aGlzLm1haW50YWluKG5ldHdvcmspO1xuICB9XG59XG4iXX0=
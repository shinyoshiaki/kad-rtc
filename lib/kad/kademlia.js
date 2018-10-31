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

    this.f = new _kUtil.default(this.k, this.kbuckets, this.nodeId);
    this.responder = new _kResponder.default(this);
  }

  _createClass(Kademlia, [{
    key: "store",
    value: function store(sender, key, value, opt) {
      // const peers = this.f.getClosePeers(key, opt);
      var peer = this.f.getCloseEstPeer(key);
      if (!peer) return;
      var hash = (0, _sha.default)(Math.random().toString()).toString();
      var sendData = {
        sender: sender,
        key: key,
        value: value,
        pubKey: this.cypher.pubKey,
        hash: hash,
        sign: this.cypher.encrypt(hash)
      };
      var network = (0, _KConst.networkFormat)(this.nodeId, _KConst.default.STORE, sendData); // peers.forEach(peer => {
      //   console.log(def.STORE, "next", peer.nodeId, "target", key);
      //   peer.send(network, "kad");
      // });

      console.log(_KConst.default.STORE, "next", peer.nodeId, "target", key);
      peer.send(network, "kad"); //no sdp

      if (!value.sdp) this.keyValueList[key] = value;
    }
  }, {
    key: "storeChunks",
    value: function storeChunks(sender, key, chunks, opt) {
      var _this = this;

      // const peers = this.f.getClosePeers(key, opt);
      var peer = this.f.getCloseEstPeer(key);
      if (!peer) return;
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
        var network = (0, _KConst.networkFormat)(sender, _KConst.default.STORE_CHUNKS, sendData); // peers.forEach(peer => {
        //   console.log(def.STORE, "next", peer.nodeId, "target", key);
        //   peer.send(network, "kad");
        // });

        console.log(_KConst.default.STORE, "next", peer.nodeId, "target", key);
        peer.send(network, "kad");
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9rYWQva2FkZW1saWEudHMiXSwibmFtZXMiOlsicmVxdWlyZSIsImJzb24iLCJCU09OIiwiZXhjdXRlRXZlbnQiLCJldiIsInYiLCJjb25zb2xlIiwibG9nIiwiT2JqZWN0Iiwia2V5cyIsImZvckVhY2giLCJrZXkiLCJLYWRlbWxpYSIsIm9wdCIsImlzRmlyc3RDb25uZWN0IiwiaXNPZmZlciIsImZpbmROb2RlIiwiaGFzaCIsIm9uQ29ubmVjdCIsIm9uQWRkUGVlciIsIm9uUGVlckRpc2Nvbm5lY3QiLCJfb25GaW5kVmFsdWUiLCJfb25GaW5kTm9kZSIsIm9uQXBwIiwic3RvcmUiLCJvblN0b3JlIiwiZmluZHZhbHVlIiwib25GaW5kVmFsdWUiLCJmaW5kbm9kZSIsIm9uRmluZE5vZGUiLCJrIiwia0xlbmd0aCIsImN5cGhlciIsIkN5cGhlciIsInNlY0tleSIsInB1YmtleSIsIm5vZGVJZCIsInB1YktleSIsInRvU3RyaW5nIiwia2J1Y2tldHMiLCJBcnJheSIsImkiLCJrYnVja2V0IiwiZiIsIkhlbHBlciIsInJlc3BvbmRlciIsIktSZXNwb25kZXIiLCJzZW5kZXIiLCJ2YWx1ZSIsInBlZXIiLCJnZXRDbG9zZUVzdFBlZXIiLCJNYXRoIiwicmFuZG9tIiwic2VuZERhdGEiLCJzaWduIiwiZW5jcnlwdCIsIm5ldHdvcmsiLCJkZWYiLCJTVE9SRSIsInNlbmQiLCJzZHAiLCJrZXlWYWx1ZUxpc3QiLCJjaHVua3MiLCJjaHVuayIsIkJ1ZmZlciIsImZyb20iLCJpbmRleCIsInNpemUiLCJsZW5ndGgiLCJTVE9SRV9DSFVOS1MiLCJ0YXJnZXRJZCIsInN0YXRlIiwidGFyZ2V0S2V5IiwiRklORE5PREUiLCJjYWxsYmFjayIsImV2ZW50cyIsIlByb21pc2UiLCJyZXNvbHZlIiwicmVqZWN0IiwicGVlcnMiLCJnZXRDbG9zZVBlZXJzIiwiZG9GaW5kdmFsdWUiLCJyIiwic2V0VGltZW91dCIsIm93bmVySWQiLCJGSU5EVkFMVUUiLCJhZGRrbm9kZSIsImRhdGEiLCJyYXciLCJvbkNvbW1hbmQiLCJkaXNjb25uZWN0IiwiY2xlYW5EaXNjb24iLCJnZXRBbGxQZWVySWRzIiwiaXNOb2RlRXhpc3QiLCJudW0iLCJwdXNoIiwiZmluZE5ld1BlZXIiLCJnZXRLYnVja2V0TnVtIiwiaW54Iiwic3BsaWNlIiwic2hpZnQiLCJ0YXJnZXQiLCJwcm94eSIsInJlZiIsIldlYlJUQyIsIm1ha2VPZmZlciIsInRpbWVvdXQiLCJzaWduYWwiLCJfIiwiY29ubmVjdCIsImNsZWFyVGltZW91dCIsIm1ha2VBbnN3ZXIiLCJnZXRQZWVyRnJvbW5vZGVJZCIsIlNFTkQiLCJtZXNzYWdlIiwibGFiZWwiLCJidWZmZXIiLCJuZXR3b3JrTGF5ZXIiLCJkZXNlcmlhbGl6ZSIsIkpTT04iLCJzdHJpbmdpZnkiLCJkYXRhTGlzdCIsImluY2x1ZGVzIiwib25SZXF1ZXN0IiwiZXJyb3IiLCJyZXNwb25zZSIsInR5cGUiLCJtYWludGFpbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBVEFBLE9BQU8sQ0FBQyxnQkFBRCxDQUFQOztBQVdBLElBQU1DLElBQUksR0FBRyxJQUFJQyxVQUFKLEVBQWI7O0FBQ08sU0FBU0MsV0FBVCxDQUFxQkMsRUFBckIsRUFBOEJDLENBQTlCLEVBQXVDO0FBQzVDQyxFQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWSxhQUFaLEVBQTJCSCxFQUEzQjtBQUNBSSxFQUFBQSxNQUFNLENBQUNDLElBQVAsQ0FBWUwsRUFBWixFQUFnQk0sT0FBaEIsQ0FBd0IsVUFBQUMsR0FBRyxFQUFJO0FBQzdCUCxJQUFBQSxFQUFFLENBQUNPLEdBQUQsQ0FBRixDQUFRTixDQUFSO0FBQ0QsR0FGRDtBQUdEOztJQUVvQk8sUTs7O0FBb0NuQixvQkFBWUMsR0FBWixFQUEwRTtBQUFBOztBQUFBOztBQUFBOztBQUFBOztBQUFBOztBQUFBOztBQUFBLHNDQTlC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LENBQTlCO0FBQ0E5RyxZQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWSxlQUFaLEVBQTZCO0FBQUUyRyxjQUFBQSxPQUFPLEVBQVBBO0FBQUYsYUFBN0IsRUFBMEM7QUFBRUcsY0FBQUEsWUFBWSxFQUFaQTtBQUFGLGFBQTFDOztBQUNBLGdCQUFJLENBQUNFLElBQUksQ0FBQ0MsU0FBTCxDQUFlLEtBQUtDLFFBQXBCLEVBQThCQyxRQUE5QixDQUF1Q0wsWUFBWSxDQUFDcEcsSUFBcEQsQ0FBTCxFQUFnRTtBQUM5RCxtQkFBS3dHLFFBQUwsQ0FBYzFCLElBQWQsQ0FBbUJzQixZQUFZLENBQUNwRyxJQUFoQztBQUNBLG1CQUFLMEcsU0FBTCxDQUFlTixZQUFmO0FBQ0Q7QUFDRixXQVBELENBT0UsT0FBT08sS0FBUCxFQUFjO0FBQ2R0SCxZQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWXFILEtBQVo7QUFDRDs7QUFDRDtBQWJKO0FBZUQ7Ozs4QkFFaUJwRSxPLEVBQWM7QUFDOUIsV0FBS1gsU0FBTCxDQUFlZ0YsUUFBZixDQUF3QnJFLE9BQU8sQ0FBQ3NFLElBQWhDLEVBQXNDdEUsT0FBdEM7QUFDQSxXQUFLdUUsUUFBTCxDQUFjdkUsT0FBZDtBQUNEIiwic291cmNlc0NvbnRlbnQiOlsicmVxdWlyZShcImJhYmVsLXBvbHlmaWxsXCIpO1xuaW1wb3J0IFdlYlJUQyBmcm9tIFwid2VicnRjNG1lXCI7XG5pbXBvcnQgSGVscGVyIGZyb20gXCIuL2tVdGlsXCI7XG5pbXBvcnQgS1Jlc3BvbmRlciBmcm9tIFwiLi9rUmVzcG9uZGVyXCI7XG5pbXBvcnQgZGVmLCB7IG5ldHdvcmtGb3JtYXQgfSBmcm9tIFwiLi9LQ29uc3RcIjtcbmltcG9ydCB7IGRpc3RhbmNlIH0gZnJvbSBcImthZC1kaXN0YW5jZVwiO1xuaW1wb3J0IHsgbWVzc2FnZSB9IGZyb20gXCJ3ZWJydGM0bWUvbGliL2ludGVyZmFjZVwiO1xuaW1wb3J0IHsgQlNPTiB9IGZyb20gXCJic29uXCI7XG5pbXBvcnQgQ3lwaGVyIGZyb20gXCIuLi9saWIvY3lwaGVyXCI7XG5pbXBvcnQgc2hhMSBmcm9tIFwic2hhMVwiO1xuXG5jb25zdCBic29uID0gbmV3IEJTT04oKTtcbmV4cG9ydCBmdW5jdGlvbiBleGN1dGVFdmVudChldjogYW55LCB2PzogYW55KSB7XG4gIGNvbnNvbGUubG9nKFwiZXhjdXRlRXZlbnRcIiwgZXYpO1xuICBPYmplY3Qua2V5cyhldikuZm9yRWFjaChrZXkgPT4ge1xuICAgIGV2W2tleV0odik7XG4gIH0pO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBLYWRlbWxpYSB7XG4gIG5vZGVJZDogc3RyaW5nO1xuICBrOiBudW1iZXI7XG4gIGtidWNrZXRzOiBBcnJheTxBcnJheTxXZWJSVEM+PjtcbiAgZjogSGVscGVyO1xuICByZXNwb25kZXI6IEtSZXNwb25kZXI7XG4gIGRhdGFMaXN0OiBBcnJheTxhbnk+ID0gW107XG4gIGtleVZhbHVlTGlzdDogeyBba2V5OiBzdHJpbmddOiBhbnkgfSA9IHt9O1xuICByZWY6IHsgW2tleTogc3RyaW5nXTogV2ViUlRDIH0gPSB7fTtcbiAgYnVmZmVyOiB7IFtrZXk6IHN0cmluZ106IEFycmF5PGFueT4gfSA9IHt9O1xuICBzdGF0ZSA9IHtcbiAgICBpc0ZpcnN0Q29ubmVjdDogdHJ1ZSxcbiAgICBpc09mZmVyOiBmYWxzZSxcbiAgICBmaW5kTm9kZTogXCJcIixcbiAgICBoYXNoOiB7fVxuICB9O1xuXG4gIGNhbGxiYWNrID0ge1xuICAgIG9uQ29ubmVjdDogKCkgPT4ge30sXG4gICAgb25BZGRQZWVyOiAodj86IGFueSkgPT4ge30sXG4gICAgb25QZWVyRGlzY29ubmVjdDogKHY/OiBhbnkpID0+IHt9LFxuICAgIF9vbkZpbmRWYWx1ZTogKHY/OiBhbnkpID0+IHt9LFxuICAgIF9vbkZpbmROb2RlOiAodj86IGFueSkgPT4ge30sXG4gICAgb25BcHA6ICh2PzogYW55KSA9PiB7fVxuICB9O1xuXG4gIG9uU3RvcmU6IHsgW2tleTogc3RyaW5nXTogKHY6IGFueSkgPT4gdm9pZCB9ID0ge307XG4gIG9uRmluZFZhbHVlOiB7IFtrZXk6IHN0cmluZ106ICh2OiBhbnkpID0+IHZvaWQgfSA9IHt9O1xuICBvbkZpbmROb2RlOiB7IFtrZXk6IHN0cmluZ106ICh2OiBhbnkpID0+IHZvaWQgfSA9IHt9O1xuICBldmVudHMgPSB7XG4gICAgc3RvcmU6IHRoaXMub25TdG9yZSxcbiAgICBmaW5kdmFsdWU6IHRoaXMub25GaW5kVmFsdWUsXG4gICAgZmluZG5vZGU6IHRoaXMub25GaW5kTm9kZVxuICB9O1xuICBjeXBoZXI6IEN5cGhlcjtcblxuICBjb25zdHJ1Y3RvcihvcHQ/OiB7IHB1YmtleT86IHN0cmluZzsgc2VjS2V5Pzogc3RyaW5nOyBrTGVuZ3RoPzogbnVtYmVyIH0pIHtcbiAgICB0aGlzLmsgPSAyMDtcbiAgICBpZiAob3B0ICYmIG9wdC5rTGVuZ3RoKSB0aGlzLmsgPSBvcHQua0xlbmd0aDtcbiAgICBpZiAob3B0KSB0aGlzLmN5cGhlciA9IG5ldyBDeXBoZXIob3B0LnNlY0tleSwgb3B0LnB1YmtleSk7XG4gICAgZWxzZSB0aGlzLmN5cGhlciA9IG5ldyBDeXBoZXIoKTtcbiAgICB0aGlzLm5vZGVJZCA9IHNoYTEodGhpcy5jeXBoZXIucHViS2V5KS50b1N0cmluZygpO1xuXG4gICAgdGhpcy5rYnVja2V0cyA9IG5ldyBBcnJheSgxNjApO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgMTYwOyBpKyspIHtcbiAgICAgIGxldCBrYnVja2V0OiBBcnJheTxhbnk+ID0gW107XG4gICAgICB0aGlzLmtidWNrZXRzW2ldID0ga2J1Y2tldDtcbiAgICB9XG5cbiAgICB0aGlzLmYgPSBuZXcgSGVscGVyKHRoaXMuaywgdGhpcy5rYnVja2V0cywgdGhpcy5ub2RlSWQpO1xuICAgIHRoaXMucmVzcG9uZGVyID0gbmV3IEtSZXNwb25kZXIodGhpcyk7XG4gIH1cblxuICBzdG9yZShzZW5kZXI6IHN0cmluZywga2V5OiBzdHJpbmcsIHZhbHVlOiBhbnksIG9wdD86IHsgZXhjbHVkZUlkPzogc3RyaW5nIH0pIHtcbiAgICAvLyBjb25zdCBwZWVycyA9IHRoaXMuZi5nZXRDbG9zZVBlZXJzKGtleSwgb3B0KTtcbiAgICBjb25zdCBwZWVyID0gdGhpcy5mLmdldENsb3NlRXN0UGVlcihrZXkpO1xuICAgIGlmICghcGVlcikgcmV0dXJuO1xuICAgIGNvbnN0IGhhc2ggPSBzaGExKE1hdGgucmFuZG9tKCkudG9TdHJpbmcoKSkudG9TdHJpbmcoKTtcbiAgICBjb25zdCBzZW5kRGF0YTogU3RvcmVGb3JtYXQgPSB7XG4gICAgICBzZW5kZXIsXG4gICAgICBrZXksXG4gICAgICB2YWx1ZSxcbiAgICAgIHB1YktleTogdGhpcy5jeXBoZXIucHViS2V5LFxuICAgICAgaGFzaCxcbiAgICAgIHNpZ246IHRoaXMuY3lwaGVyLmVuY3J5cHQoaGFzaClcbiAgICB9O1xuICAgIGNvbnN0IG5ldHdvcmsgPSBuZXR3b3JrRm9ybWF0KHRoaXMubm9kZUlkLCBkZWYuU1RPUkUsIHNlbmREYXRhKTtcbiAgICAvLyBwZWVycy5mb3JFYWNoKHBlZXIgPT4ge1xuICAgIC8vICAgY29uc29sZS5sb2coZGVmLlNUT1JFLCBcIm5leHRcIiwgcGVlci5ub2RlSWQsIFwidGFyZ2V0XCIsIGtleSk7XG4gICAgLy8gICBwZWVyLnNlbmQobmV0d29yaywgXCJrYWRcIik7XG4gICAgLy8gfSk7XG4gICAgY29uc29sZS5sb2coZGVmLlNUT1JFLCBcIm5leHRcIiwgcGVlci5ub2RlSWQsIFwidGFyZ2V0XCIsIGtleSk7XG4gICAgcGVlci5zZW5kKG5ldHdvcmssIFwia2FkXCIpO1xuICAgIC8vbm8gc2RwXG4gICAgaWYgKCF2YWx1ZS5zZHApIHRoaXMua2V5VmFsdWVMaXN0W2tleV0gPSB2YWx1ZTtcbiAgfVxuXG4gIHN0b3JlQ2h1bmtzKFxuICAgIHNlbmRlcjogc3RyaW5nLFxuICAgIGtleTogc3RyaW5nLFxuICAgIGNodW5rczogQXJyYXlCdWZmZXJbXSxcbiAgICBvcHQ/OiB7IGV4Y2x1ZGVJZD86IHN0cmluZyB9XG4gICkge1xuICAgIC8vIGNvbnN0IHBlZXJzID0gdGhpcy5mLmdldENsb3NlUGVlcnMoa2V5LCBvcHQpO1xuICAgIGNvbnN0IHBlZXIgPSB0aGlzLmYuZ2V0Q2xvc2VFc3RQZWVyKGtleSk7XG4gICAgaWYgKCFwZWVyKSByZXR1cm47XG4gICAgY29uc29sZS5sb2coXCJzdG9yZSBjaHVua3NcIiwgeyBjaHVua3MgfSk7XG4gICAgY2h1bmtzLmZvckVhY2goKGNodW5rLCBpKSA9PiB7XG4gICAgICBjb25zdCBoYXNoID0gc2hhMShNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKCkpLnRvU3RyaW5nKCk7XG4gICAgICBjb25zdCBzZW5kRGF0YTogU3RvcmVDaHVua3MgPSB7XG4gICAgICAgIHNlbmRlcjogdGhpcy5ub2RlSWQsXG4gICAgICAgIGtleSxcbiAgICAgICAgdmFsdWU6IEJ1ZmZlci5mcm9tKGNodW5rKSxcbiAgICAgICAgaW5kZXg6IGksXG4gICAgICAgIHB1YktleTogdGhpcy5jeXBoZXIucHViS2V5LFxuICAgICAgICBoYXNoLFxuICAgICAgICBzaWduOiB0aGlzLmN5cGhlci5lbmNyeXB0KGhhc2gpLFxuICAgICAgICBzaXplOiBjaHVua3MubGVuZ3RoXG4gICAgICB9O1xuICAgICAgY29uc3QgbmV0d29yayA9IG5ldHdvcmtGb3JtYXQoc2VuZGVyLCBkZWYuU1RPUkVfQ0hVTktTLCBzZW5kRGF0YSk7XG4gICAgICAvLyBwZWVycy5mb3JFYWNoKHBlZXIgPT4ge1xuICAgICAgLy8gICBjb25zb2xlLmxvZyhkZWYuU1RPUkUsIFwibmV4dFwiLCBwZWVyLm5vZGVJZCwgXCJ0YXJnZXRcIiwga2V5KTtcbiAgICAgIC8vICAgcGVlci5zZW5kKG5ldHdvcmssIFwia2FkXCIpO1xuICAgICAgLy8gfSk7XG4gICAgICBjb25zb2xlLmxvZyhkZWYuU1RPUkUsIFwibmV4dFwiLCBwZWVyLm5vZGVJZCwgXCJ0YXJnZXRcIiwga2V5KTtcbiAgICAgIHBlZXIuc2VuZChuZXR3b3JrLCBcImthZFwiKTtcbiAgICB9KTtcbiAgICAvL+ODrOODl+ODquOCseODvOOCt+ODp+ODs1xuICAgIHRoaXMua2V5VmFsdWVMaXN0W2tleV0gPSB7IGNodW5rcyB9O1xuICB9XG5cbiAgZmluZE5vZGUodGFyZ2V0SWQ6IHN0cmluZywgcGVlcjogV2ViUlRDKSB7XG4gICAgY29uc29sZS5sb2coXCJmaW5kbm9kZVwiLCB0YXJnZXRJZCk7XG4gICAgdGhpcy5zdGF0ZS5maW5kTm9kZSA9IHRhcmdldElkO1xuICAgIGNvbnN0IHNlbmREYXRhID0geyB0YXJnZXRLZXk6IHRhcmdldElkIH07XG4gICAgLy/pgIHjgotcbiAgICBwZWVyLnNlbmQobmV0d29ya0Zvcm1hdCh0aGlzLm5vZGVJZCwgZGVmLkZJTkROT0RFLCBzZW5kRGF0YSksIFwia2FkXCIpO1xuXG4gICAgdGhpcy5jYWxsYmFjay5fb25GaW5kTm9kZSgobm9kZUlkOiBzdHJpbmcpID0+IHtcbiAgICAgIGV4Y3V0ZUV2ZW50KHRoaXMuZXZlbnRzLmZpbmRub2RlLCBub2RlSWQpO1xuICAgIH0pO1xuICB9XG5cbiAgZmluZFZhbHVlKGtleTogc3RyaW5nLCBvcHQ/OiB7IG93bmVySWQ/OiBzdHJpbmcgfSkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZTxhbnk+KGFzeW5jIChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIHRoaXMuY2FsbGJhY2suX29uRmluZFZhbHVlID0gdmFsdWUgPT4ge1xuICAgICAgICBleGN1dGVFdmVudCh0aGlzLmV2ZW50cy5maW5kdmFsdWUsIHZhbHVlKTtcbiAgICAgICAgcmVzb2x2ZSh2YWx1ZSk7XG4gICAgICB9O1xuICAgICAgLy9rZXnjgavov5HjgYTjg5TjgqLjgpLlj5blvpdcbiAgICAgIGNvbnN0IHBlZXJzID0gdGhpcy5mLmdldENsb3NlUGVlcnMoa2V5KTtcbiAgICAgIHBlZXJzLmZvckVhY2gocGVlciA9PiB7XG4gICAgICAgIHRoaXMuZG9GaW5kdmFsdWUoa2V5LCBwZWVyKTtcbiAgICAgIH0pO1xuXG4gICAgICBhd2FpdCBuZXcgUHJvbWlzZShyID0+IHNldFRpbWVvdXQociwgNTAwMCkpO1xuICAgICAgaWYgKG9wdCAmJiBvcHQub3duZXJJZCkge1xuICAgICAgICBjb25zdCBvd25lcklkID0gb3B0Lm93bmVySWQ7XG4gICAgICAgIGNvbnN0IHBlZXJzID0gdGhpcy5mLmdldENsb3NlUGVlcnMob3duZXJJZCk7XG4gICAgICAgIHBlZXJzLmZvckVhY2gocGVlciA9PiB7XG4gICAgICAgICAgdGhpcy5kb0ZpbmR2YWx1ZShvd25lcklkLCBwZWVyKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGF3YWl0IG5ldyBQcm9taXNlKHIgPT4gc2V0VGltZW91dChyLCA1MDAwKSk7XG4gICAgICB9XG4gICAgICByZWplY3QoXCJmaW5kdmFsdWUgdGltZW91dFwiKTtcbiAgICB9KTtcbiAgfVxuXG4gIGFzeW5jIGRvRmluZHZhbHVlKGtleTogc3RyaW5nLCBwZWVyOiBXZWJSVEMpIHtcbiAgICBjb25zb2xlLmxvZyhcImRvZmluZHZhbHVlXCIsIHBlZXIubm9kZUlkKTtcbiAgICBjb25zdCBzZW5kRGF0YTogRmluZFZhbHVlID0geyB0YXJnZXRLZXk6IGtleSB9O1xuICAgIHBlZXIuc2VuZChuZXR3b3JrRm9ybWF0KHRoaXMubm9kZUlkLCBkZWYuRklORFZBTFVFLCBzZW5kRGF0YSksIFwia2FkXCIpO1xuICB9XG5cbiAgY29ubmVjdChwZWVyOiBXZWJSVEMpIHtcbiAgICBjb25zb2xlLmxvZyhcImthZCBjb25uZWN0XCIpO1xuICAgIGlmICh0aGlzLnN0YXRlLmlzRmlyc3RDb25uZWN0KSB0aGlzLmNhbGxiYWNrLm9uQ29ubmVjdCgpO1xuICAgIHRoaXMuc3RhdGUuaXNGaXJzdENvbm5lY3QgPSBmYWxzZTtcbiAgICB0aGlzLmFkZGtub2RlKHBlZXIpO1xuICB9XG5cbiAgYWRka25vZGUocGVlcjogV2ViUlRDKSB7XG4gICAgcGVlci5ldmVudHMuZGF0YVtcImthZGVtbGlhLnRzXCJdID0gcmF3ID0+IHtcbiAgICAgIHRoaXMub25Db21tYW5kKHJhdyk7XG4gICAgfTtcblxuICAgIHBlZXIuZGlzY29ubmVjdCA9ICgpID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKFwia2FkIG5vZGUgZGlzY29ubmVjdGVkXCIpO1xuICAgICAgdGhpcy5mLmNsZWFuRGlzY29uKCk7XG4gICAgICB0aGlzLmNhbGxiYWNrLm9uQWRkUGVlcih0aGlzLmYuZ2V0QWxsUGVlcklkcygpKTtcbiAgICB9O1xuXG4gICAgaWYgKCF0aGlzLmYuaXNOb2RlRXhpc3QocGVlci5ub2RlSWQpKSB7XG4gICAgICAvL+iHquWIhuOBruODjuODvOODiUlE44Go6L+95Yqg44GZ44KL44OO44O844OJSUTjga7ot53pm6JcbiAgICAgIGNvbnN0IG51bSA9IGRpc3RhbmNlKHRoaXMubm9kZUlkLCBwZWVyLm5vZGVJZCk7XG4gICAgICAvL2tidWNrZXRz44Gu6Kmy5b2T44GZ44KL6Led6Zui44Gua2J1Y2tldOOCkuWRvOOBs+WHuuOBmVxuICAgICAgY29uc3Qga2J1Y2tldCA9IHRoaXMua2J1Y2tldHNbbnVtXTtcbiAgICAgIC8v6Kmy5b2T44GZ44KLa2J1Y2tldOOBq+aWsOOBl+OBhOODlOOCouOCkuWKoOOBiOOCi1xuICAgICAga2J1Y2tldC5wdXNoKHBlZXIpO1xuXG4gICAgICBjb25zb2xlLmxvZyhcImFkZGtub2RlIGtidWNrZXRzXCIsIFwicGVlci5ub2RlSWQ6XCIsIHBlZXIubm9kZUlkKTtcbiAgICAgIGNvbnNvbGUubG9nKHRoaXMuZi5nZXRBbGxQZWVySWRzKCkpO1xuXG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgdGhpcy5maW5kTmV3UGVlcihwZWVyKTtcbiAgICAgIH0sIDEwMDApO1xuXG4gICAgICB0aGlzLmNhbGxiYWNrLm9uQWRkUGVlcih0aGlzLmYuZ2V0QWxsUGVlcklkcygpKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGZpbmROZXdQZWVyKHBlZXI6IFdlYlJUQykge1xuICAgIGlmICh0aGlzLmYuZ2V0S2J1Y2tldE51bSgpIDwgdGhpcy5rKSB7XG4gICAgICAvL+iHqui6q+OBruODjuODvOODiUlE44KSa2V544Go44GX44GmRklORF9OT0RFXG4gICAgICB0aGlzLmZpbmROb2RlKHRoaXMubm9kZUlkLCBwZWVyKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5sb2coXCJrYnVja2V0IHJlYWR5XCIsIHRoaXMuZi5nZXRLYnVja2V0TnVtKCkpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgbWFpbnRhaW4obmV0d29yazogYW55KSB7XG4gICAgY29uc3QgaW54ID0gZGlzdGFuY2UodGhpcy5ub2RlSWQsIG5ldHdvcmsubm9kZUlkKTtcbiAgICBjb25zdCBrYnVja2V0ID0gdGhpcy5rYnVja2V0c1tpbnhdO1xuXG4gICAgLy/pgIHkv6HlhYPjgYzoqbLlvZPjgZnjgotrLWJ1Y2tldOOBruS4reOBq+OBguOBo+OBn+WgtOWQiFxuICAgIC8v44Gd44Gu44OO44O844OJ44KSay1idWNrZXTjga7mnKvlsL7jgavnp7vjgZlcbiAgICBrYnVja2V0LmZvckVhY2goKHBlZXIsIGkpID0+IHtcbiAgICAgIGlmIChwZWVyLm5vZGVJZCA9PT0gbmV0d29yay5ub2RlSWQpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJtYWludGFpblwiLCBcIk1vdmVzwqBpdMKgdG/CoHRoZcKgdGFpbMKgb2bCoHRoZcKgbGlzdFwiKTtcbiAgICAgICAga2J1Y2tldC5zcGxpY2UoaSwgMSk7XG4gICAgICAgIGtidWNrZXQucHVzaChwZWVyKTtcbiAgICAgICAgcmV0dXJuIDA7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvL2stYnVja2V044GM44GZ44Gn44Gr5rqA5p2v44Gq5aC05ZCI44CBXG4gICAgLy/jgZ3jga5rLWJ1Y2tldOS4reOBruWFiOmgreOBruODjuODvOODieOBjOOCquODs+ODqeOCpOODs+OBquOCieWFiOmgreOBruODjuODvOODieOCkuaui+OBmVxuICAgIGlmIChrYnVja2V0Lmxlbmd0aCA+IHRoaXMuaykge1xuICAgICAga2J1Y2tldC5zaGlmdCgpO1xuICAgIH1cbiAgfVxuXG4gIG9mZmVyKHRhcmdldDogc3RyaW5nLCBwcm94eSA9IG51bGwpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY29uc3QgciA9IHRoaXMucmVmO1xuICAgICAgY29uc3QgcGVlciA9IChyW3RhcmdldF0gPSBuZXcgV2ViUlRDKCkpO1xuICAgICAgcGVlci5tYWtlT2ZmZXIoKTtcblxuICAgICAgY29uc3QgdGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICByZWplY3QoXCJrYWQgb2ZmZXIgdGltZW91dFwiKTtcbiAgICAgIH0sIDUgKiAxMDAwKTtcblxuICAgICAgcGVlci5zaWduYWwgPSBzZHAgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZyhcImthZCBvZmZlciBzdG9yZVwiLCB0YXJnZXQpO1xuICAgICAgICBjb25zdCBfID0gdGhpcy5mLmdldENsb3NlRXN0UGVlcih0YXJnZXQpO1xuICAgICAgICBpZiAoIV8pIHJldHVybjtcbiAgICAgICAgaWYgKF8ubm9kZUlkICE9PSB0YXJnZXQpXG4gICAgICAgICAgdGhpcy5zdG9yZSh0aGlzLm5vZGVJZCwgdGFyZ2V0LCB7IHNkcCwgcHJveHkgfSk7XG4gICAgICB9O1xuXG4gICAgICBwZWVyLmNvbm5lY3QgPSAoKSA9PiB7XG4gICAgICAgIHBlZXIubm9kZUlkID0gdGFyZ2V0O1xuICAgICAgICBjb25zb2xlLmxvZyhcImthZCBvZmZlciBjb25uZWN0ZWRcIiwgdGFyZ2V0KTtcbiAgICAgICAgdGhpcy5hZGRrbm9kZShwZWVyKTtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xuICAgICAgICByZXNvbHZlKHRydWUpO1xuICAgICAgfTtcbiAgICB9KTtcbiAgfVxuXG4gIGFuc3dlcih0YXJnZXQ6IHN0cmluZywgc2RwOiBzdHJpbmcsIHByb3h5OiBzdHJpbmcpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY29uc3QgciA9IHRoaXMucmVmO1xuICAgICAgY29uc3QgcGVlciA9IChyW3RhcmdldF0gPSBuZXcgV2ViUlRDKCkpO1xuICAgICAgcGVlci5tYWtlQW5zd2VyKHNkcCk7XG4gICAgICBjb25zb2xlLmxvZyhcImthZCBhbnN3ZXJcIiwgdGFyZ2V0KTtcblxuICAgICAgY29uc3QgdGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICByZWplY3QoXCJrYWQgYW5zd2VyIHRpbWVvdXRcIik7XG4gICAgICB9LCA1ICogMTAwMCk7XG5cbiAgICAgIHBlZXIuc2lnbmFsID0gc2RwID0+IHtcbiAgICAgICAgY29uc3QgXyA9IHRoaXMuZi5nZXRQZWVyRnJvbW5vZGVJZChwcm94eSk7XG4gICAgICAgIGNvbnN0IGhhc2ggPSBzaGExKE1hdGgucmFuZG9tKCkudG9TdHJpbmcoKSkudG9TdHJpbmcoKTtcbiAgICAgICAgY29uc3Qgc2VuZERhdGE6IFN0b3JlRm9ybWF0ID0ge1xuICAgICAgICAgIHNlbmRlcjogdGhpcy5ub2RlSWQsXG4gICAgICAgICAga2V5OiB0YXJnZXQsXG4gICAgICAgICAgdmFsdWU6IHsgc2RwIH0sXG4gICAgICAgICAgcHViS2V5OiB0aGlzLmN5cGhlci5wdWJLZXksXG4gICAgICAgICAgaGFzaCxcbiAgICAgICAgICBzaWduOiB0aGlzLmN5cGhlci5lbmNyeXB0KGhhc2gpXG4gICAgICAgIH07XG4gICAgICAgIGlmIChfKSBfLnNlbmQobmV0d29ya0Zvcm1hdCh0aGlzLm5vZGVJZCwgZGVmLlNUT1JFLCBzZW5kRGF0YSksIFwia2FkXCIpO1xuICAgICAgfTtcblxuICAgICAgcGVlci5jb25uZWN0ID0gKCkgPT4ge1xuICAgICAgICBwZWVyLm5vZGVJZCA9IHRhcmdldDtcbiAgICAgICAgY29uc29sZS5sb2coXCJrYWQgYW5zd2VyIGNvbm5lY3RlZFwiLCB0YXJnZXQpO1xuICAgICAgICB0aGlzLmFkZGtub2RlKHBlZXIpO1xuICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dCk7XG4gICAgICAgIHJlc29sdmUodHJ1ZSk7XG4gICAgICB9O1xuICAgIH0pO1xuICB9XG5cbiAgc2VuZCh0YXJnZXQ6IHN0cmluZywgZGF0YTogYW55KSB7XG4gICAgY29uc3QgXyA9IHRoaXMuZi5nZXRQZWVyRnJvbW5vZGVJZCh0YXJnZXQpO1xuICAgIGlmIChfKSBfLnNlbmQobmV0d29ya0Zvcm1hdCh0aGlzLm5vZGVJZCwgZGVmLlNFTkQsIGRhdGEpLCBcImthZFwiKTtcbiAgfVxuXG4gIHByaXZhdGUgb25Db21tYW5kKG1lc3NhZ2U6IG1lc3NhZ2UpIHtcbiAgICBzd2l0Y2ggKG1lc3NhZ2UubGFiZWwpIHtcbiAgICAgIGNhc2UgXCJrYWRcIjpcbiAgICAgICAgY29uc3QgYnVmZmVyOiBCdWZmZXIgPSBCdWZmZXIuZnJvbShtZXNzYWdlLmRhdGEpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGNvbnN0IG5ldHdvcmtMYXllcjogbmV0d29yayA9IGJzb24uZGVzZXJpYWxpemUoYnVmZmVyKTtcbiAgICAgICAgICBjb25zb2xlLmxvZyhcIm9uY29tbWFuZCBrYWRcIiwgeyBtZXNzYWdlIH0sIHsgbmV0d29ya0xheWVyIH0pO1xuICAgICAgICAgIGlmICghSlNPTi5zdHJpbmdpZnkodGhpcy5kYXRhTGlzdCkuaW5jbHVkZXMobmV0d29ya0xheWVyLmhhc2gpKSB7XG4gICAgICAgICAgICB0aGlzLmRhdGFMaXN0LnB1c2gobmV0d29ya0xheWVyLmhhc2gpO1xuICAgICAgICAgICAgdGhpcy5vblJlcXVlc3QobmV0d29ya0xheWVyKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coZXJyb3IpO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgb25SZXF1ZXN0KG5ldHdvcms6IGFueSkge1xuICAgIHRoaXMucmVzcG9uZGVyLnJlc3BvbnNlKG5ldHdvcmsudHlwZSwgbmV0d29yayk7XG4gICAgdGhpcy5tYWludGFpbihuZXR3b3JrKTtcbiAgfVxufVxuIl19
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
      var peer = this.f.getCloseEstPeer(key, opt);
      if (!peer) return;
      var hash = (0, _sha.default)(JSON.stringify(value)).toString();
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
      var peer = this.f.getCloseEstPeer(key, opt);
      if (!peer) return;
      console.log("store chunks", {
        chunks: chunks
      });
      chunks.forEach(function (chunk, i) {
        var hash = (0, _sha.default)(Buffer.from(chunk)).toString();
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9rYWQva2FkZW1saWEudHMiXSwibmFtZXMiOlsicmVxdWlyZSIsImJzb24iLCJCU09OIiwiZXhjdXRlRXZlbnQiLCJldiIsInYiLCJjb25zb2xlIiwibG9nIiwiT2JqZWN0Iiwia2V5cyIsImZvckVhY2giLCJrZXkiLCJLYWRlbWxpYSIsIm9wdCIsImlzRmlyc3RDb25uZWN0IiwiaXNPZmZlciIsImZpbmROb2RlIiwiaGFzaCIsIm9uQ29ubmVjdCIsIm9uQWRkUGVlciIsIm9uUGVlckRpc2Nvbm5lY3QiLCJfb25GaW5kVmFsdWUiLCJfb25GaW5kTm9kZSIsIm9uQXBwIiwic3RvcmUiLCJvblN0b3JlIiwiZmluZHZhbHVlIiwib25GaW5kVmFsdWUiLCJmaW5kbm9kZSIsIm9uRmluZE5vZGUiLCJrIiwia0xlbmd0aCIsImN5cGhlciIsIkN5cGhlciIsInNlY0tleSIsInB1YmtleSIsIm5vZGVJZCIsInB1YktleSIsInRvU3RyaW5nIiwia2J1Y2tldHMiLCJBcnJheSIsImkiLCJrYnVja2V0IiwiZiIsIkhlbHBlciIsInJlc3BvbmRlciIsIktSZXNwb25kZXIiLCJzZW5kZXIiLCJ2YWx1ZSIsInBlZXIiLCJnZXRDbG9zZUVzdFBlZXIiLCJKU09OIiwic3RyaW5naWZ5Iiwic2VuZERhdGEiLCJzaWduIiwiZW5jcnlwdCIsIm5ldHdvcmsiLCJkZWYiLCJTVE9SRSIsInNlbmQiLCJzZHAiLCJrZXlWYWx1ZUxpc3QiLCJjaHVua3MiLCJjaHVuayIsIkJ1ZmZlciIsImZyb20iLCJpbmRleCIsInNpemUiLCJsZW5ndGgiLCJTVE9SRV9DSFVOS1MiLCJ0YXJnZXRJZCIsInN0YXRlIiwidGFyZ2V0S2V5IiwiRklORE5PREUiLCJjYWxsYmFjayIsImV2ZW50cyIsIlByb21pc2UiLCJyZXNvbHZlIiwicmVqZWN0IiwicGVlcnMiLCJnZXRDbG9zZVBlZXJzIiwiZG9GaW5kdmFsdWUiLCJyIiwic2V0VGltZW91dCIsIm93bmVySWQiLCJGSU5EVkFMVUUiLCJhZGRrbm9kZSIsImRhdGEiLCJyYXciLCJvbkNvbW1hbmQiLCJkaXNjb25uZWN0IiwiY2xlYW5EaXNjb24iLCJnZXRBbGxQZWVySWRzIiwiaXNOb2RlRXhpc3QiLCJudW0iLCJwdXNoIiwiZmluZE5ld1BlZXIiLCJnZXRLYnVja2V0TnVtIiwiaW54Iiwic3BsaWNlIiwic2hpZnQiLCJ0YXJnZXQiLCJwcm94eSIsInJlZiIsIldlYlJUQyIsIm1ha2VPZmZlciIsInRpbWVvdXQiLCJzaWduYWwiLCJfIiwiY29ubmVjdCIsImNsZWFyVGltZW91dCIsIm1ha2VBbnN3ZXIiLCJnZXRQZWVyRnJvbW5vZGVJZCIsIk1hdGgiLCJyYW5kb20iLCJTRU5EIiwibWVzc2FnZSIsImxhYmVsIiwiYnVmZmVyIiwibmV0d29ya0xheWVyIiwiZGVzZXJpYWxpemUiLCJkYXRhTGlzdCIsImluY2x1ZGVzIiwib25SZXF1ZXN0IiwiZXJyb3IiLCJyZXNwb25zZSIsInR5cGUiLCJtYWludGFpbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBVEFBLE9BQU8sQ0FBQyxnQkFBRCxDQUFQOztBQVdBLElBQU1DLElBQUksR0FBRyxJQUFJQyxVQUFKLEVBQWI7O0FBQ08sU0FBU0MsV0FBVCxDQUFxQkMsRUFBckIsRUFBOEJDLENBQTlCLEVBQXVDO0FBQzVDQyxFQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWSxhQUFaLEVBQTJCSCxFQUEzQjtBQUNBSSxFQUFBQSxNQUFNLENBQUNDLElBQVAsQ0FBWUwsRUFBWixFQUFnQk0sT0FBaEIsQ0FBd0IsVUFBQUMsR0FBRyxFQUFJO0FBQzdCUCxJQUFBQSxFQUFFLENBQUNPLEdBQUQsQ0FBRixDQUFRTixDQUFSO0FBQ0QsR0FGRDtBQUdEOztJQUVvQk8sUTs7O0FBb0NuQixvQkFBWUMsR0FBWixFQUEwRTtBQUFBOztBQUFBOztBQUFBOztBQUFBOztBQUFBOztBQUFBOztBQUFBLHNDQTlC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QUFJLENBQUN1SCxXQUFMLENBQWlCRixNQUFqQixDQUE5QjtBQUNBaEgsWUFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVksZUFBWixFQUE2QjtBQUFFNkcsY0FBQUEsT0FBTyxFQUFQQTtBQUFGLGFBQTdCLEVBQTBDO0FBQUVHLGNBQUFBLFlBQVksRUFBWkE7QUFBRixhQUExQzs7QUFDQSxnQkFBSSxDQUFDcEUsSUFBSSxDQUFDQyxTQUFMLENBQWUsS0FBS3FFLFFBQXBCLEVBQThCQyxRQUE5QixDQUF1Q0gsWUFBWSxDQUFDdEcsSUFBcEQsQ0FBTCxFQUFnRTtBQUM5RCxtQkFBS3dHLFFBQUwsQ0FBYzFCLElBQWQsQ0FBbUJ3QixZQUFZLENBQUN0RyxJQUFoQztBQUNBLG1CQUFLMEcsU0FBTCxDQUFlSixZQUFmO0FBQ0Q7QUFDRixXQVBELENBT0UsT0FBT0ssS0FBUCxFQUFjO0FBQ2R0SCxZQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWXFILEtBQVo7QUFDRDs7QUFDRDtBQWJKO0FBZUQ7Ozs4QkFFaUJwRSxPLEVBQWM7QUFDOUIsV0FBS1gsU0FBTCxDQUFlZ0YsUUFBZixDQUF3QnJFLE9BQU8sQ0FBQ3NFLElBQWhDLEVBQXNDdEUsT0FBdEM7QUFDQSxXQUFLdUUsUUFBTCxDQUFjdkUsT0FBZDtBQUNEIiwic291cmNlc0NvbnRlbnQiOlsicmVxdWlyZShcImJhYmVsLXBvbHlmaWxsXCIpO1xuaW1wb3J0IFdlYlJUQyBmcm9tIFwid2VicnRjNG1lXCI7XG5pbXBvcnQgSGVscGVyIGZyb20gXCIuL2tVdGlsXCI7XG5pbXBvcnQgS1Jlc3BvbmRlciBmcm9tIFwiLi9rUmVzcG9uZGVyXCI7XG5pbXBvcnQgZGVmLCB7IG5ldHdvcmtGb3JtYXQgfSBmcm9tIFwiLi9LQ29uc3RcIjtcbmltcG9ydCB7IGRpc3RhbmNlIH0gZnJvbSBcImthZC1kaXN0YW5jZVwiO1xuaW1wb3J0IHsgbWVzc2FnZSB9IGZyb20gXCJ3ZWJydGM0bWUvbGliL2ludGVyZmFjZVwiO1xuaW1wb3J0IHsgQlNPTiB9IGZyb20gXCJic29uXCI7XG5pbXBvcnQgQ3lwaGVyIGZyb20gXCIuLi9saWIvY3lwaGVyXCI7XG5pbXBvcnQgc2hhMSBmcm9tIFwic2hhMVwiO1xuXG5jb25zdCBic29uID0gbmV3IEJTT04oKTtcbmV4cG9ydCBmdW5jdGlvbiBleGN1dGVFdmVudChldjogYW55LCB2PzogYW55KSB7XG4gIGNvbnNvbGUubG9nKFwiZXhjdXRlRXZlbnRcIiwgZXYpO1xuICBPYmplY3Qua2V5cyhldikuZm9yRWFjaChrZXkgPT4ge1xuICAgIGV2W2tleV0odik7XG4gIH0pO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBLYWRlbWxpYSB7XG4gIG5vZGVJZDogc3RyaW5nO1xuICBrOiBudW1iZXI7XG4gIGtidWNrZXRzOiBBcnJheTxBcnJheTxXZWJSVEM+PjtcbiAgZjogSGVscGVyO1xuICByZXNwb25kZXI6IEtSZXNwb25kZXI7XG4gIGRhdGFMaXN0OiBBcnJheTxhbnk+ID0gW107XG4gIGtleVZhbHVlTGlzdDogeyBba2V5OiBzdHJpbmddOiBhbnkgfSA9IHt9O1xuICByZWY6IHsgW2tleTogc3RyaW5nXTogV2ViUlRDIH0gPSB7fTtcbiAgYnVmZmVyOiB7IFtrZXk6IHN0cmluZ106IEFycmF5PGFueT4gfSA9IHt9O1xuICBzdGF0ZSA9IHtcbiAgICBpc0ZpcnN0Q29ubmVjdDogdHJ1ZSxcbiAgICBpc09mZmVyOiBmYWxzZSxcbiAgICBmaW5kTm9kZTogXCJcIixcbiAgICBoYXNoOiB7fVxuICB9O1xuXG4gIGNhbGxiYWNrID0ge1xuICAgIG9uQ29ubmVjdDogKCkgPT4ge30sXG4gICAgb25BZGRQZWVyOiAodj86IGFueSkgPT4ge30sXG4gICAgb25QZWVyRGlzY29ubmVjdDogKHY/OiBhbnkpID0+IHt9LFxuICAgIF9vbkZpbmRWYWx1ZTogKHY/OiBhbnkpID0+IHt9LFxuICAgIF9vbkZpbmROb2RlOiAodj86IGFueSkgPT4ge30sXG4gICAgb25BcHA6ICh2PzogYW55KSA9PiB7fVxuICB9O1xuXG4gIG9uU3RvcmU6IHsgW2tleTogc3RyaW5nXTogKHY6IGFueSkgPT4gdm9pZCB9ID0ge307XG4gIG9uRmluZFZhbHVlOiB7IFtrZXk6IHN0cmluZ106ICh2OiBhbnkpID0+IHZvaWQgfSA9IHt9O1xuICBvbkZpbmROb2RlOiB7IFtrZXk6IHN0cmluZ106ICh2OiBhbnkpID0+IHZvaWQgfSA9IHt9O1xuICBldmVudHMgPSB7XG4gICAgc3RvcmU6IHRoaXMub25TdG9yZSxcbiAgICBmaW5kdmFsdWU6IHRoaXMub25GaW5kVmFsdWUsXG4gICAgZmluZG5vZGU6IHRoaXMub25GaW5kTm9kZVxuICB9O1xuICBjeXBoZXI6IEN5cGhlcjtcblxuICBjb25zdHJ1Y3RvcihvcHQ/OiB7IHB1YmtleT86IHN0cmluZzsgc2VjS2V5Pzogc3RyaW5nOyBrTGVuZ3RoPzogbnVtYmVyIH0pIHtcbiAgICB0aGlzLmsgPSAyMDtcbiAgICBpZiAob3B0ICYmIG9wdC5rTGVuZ3RoKSB0aGlzLmsgPSBvcHQua0xlbmd0aDtcbiAgICBpZiAob3B0KSB0aGlzLmN5cGhlciA9IG5ldyBDeXBoZXIob3B0LnNlY0tleSwgb3B0LnB1YmtleSk7XG4gICAgZWxzZSB0aGlzLmN5cGhlciA9IG5ldyBDeXBoZXIoKTtcbiAgICB0aGlzLm5vZGVJZCA9IHNoYTEodGhpcy5jeXBoZXIucHViS2V5KS50b1N0cmluZygpO1xuXG4gICAgdGhpcy5rYnVja2V0cyA9IG5ldyBBcnJheSgxNjApO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgMTYwOyBpKyspIHtcbiAgICAgIGxldCBrYnVja2V0OiBBcnJheTxhbnk+ID0gW107XG4gICAgICB0aGlzLmtidWNrZXRzW2ldID0ga2J1Y2tldDtcbiAgICB9XG5cbiAgICB0aGlzLmYgPSBuZXcgSGVscGVyKHRoaXMuaywgdGhpcy5rYnVja2V0cywgdGhpcy5ub2RlSWQpO1xuICAgIHRoaXMucmVzcG9uZGVyID0gbmV3IEtSZXNwb25kZXIodGhpcyk7XG4gIH1cblxuICBzdG9yZShzZW5kZXI6IHN0cmluZywga2V5OiBzdHJpbmcsIHZhbHVlOiBhbnksIG9wdD86IHsgZXhjbHVkZUlkPzogc3RyaW5nIH0pIHtcbiAgICAvLyBjb25zdCBwZWVycyA9IHRoaXMuZi5nZXRDbG9zZVBlZXJzKGtleSwgb3B0KTtcbiAgICBjb25zdCBwZWVyID0gdGhpcy5mLmdldENsb3NlRXN0UGVlcihrZXksIG9wdCk7XG4gICAgaWYgKCFwZWVyKSByZXR1cm47XG4gICAgY29uc3QgaGFzaCA9IHNoYTEoSlNPTi5zdHJpbmdpZnkodmFsdWUpKS50b1N0cmluZygpO1xuICAgIGNvbnN0IHNlbmREYXRhOiBTdG9yZUZvcm1hdCA9IHtcbiAgICAgIHNlbmRlcixcbiAgICAgIGtleSxcbiAgICAgIHZhbHVlLFxuICAgICAgcHViS2V5OiB0aGlzLmN5cGhlci5wdWJLZXksXG4gICAgICBoYXNoLFxuICAgICAgc2lnbjogdGhpcy5jeXBoZXIuZW5jcnlwdChoYXNoKVxuICAgIH07XG4gICAgY29uc3QgbmV0d29yayA9IG5ldHdvcmtGb3JtYXQodGhpcy5ub2RlSWQsIGRlZi5TVE9SRSwgc2VuZERhdGEpO1xuICAgIC8vIHBlZXJzLmZvckVhY2gocGVlciA9PiB7XG4gICAgLy8gICBjb25zb2xlLmxvZyhkZWYuU1RPUkUsIFwibmV4dFwiLCBwZWVyLm5vZGVJZCwgXCJ0YXJnZXRcIiwga2V5KTtcbiAgICAvLyAgIHBlZXIuc2VuZChuZXR3b3JrLCBcImthZFwiKTtcbiAgICAvLyB9KTtcbiAgICBjb25zb2xlLmxvZyhkZWYuU1RPUkUsIFwibmV4dFwiLCBwZWVyLm5vZGVJZCwgXCJ0YXJnZXRcIiwga2V5KTtcbiAgICBwZWVyLnNlbmQobmV0d29yaywgXCJrYWRcIik7XG4gICAgLy9ubyBzZHBcbiAgICBpZiAoIXZhbHVlLnNkcCkgdGhpcy5rZXlWYWx1ZUxpc3Rba2V5XSA9IHZhbHVlO1xuICB9XG5cbiAgc3RvcmVDaHVua3MoXG4gICAgc2VuZGVyOiBzdHJpbmcsXG4gICAga2V5OiBzdHJpbmcsXG4gICAgY2h1bmtzOiBBcnJheUJ1ZmZlcltdLFxuICAgIG9wdD86IHsgZXhjbHVkZUlkPzogc3RyaW5nIH1cbiAgKSB7XG4gICAgLy8gY29uc3QgcGVlcnMgPSB0aGlzLmYuZ2V0Q2xvc2VQZWVycyhrZXksIG9wdCk7XG4gICAgY29uc3QgcGVlciA9IHRoaXMuZi5nZXRDbG9zZUVzdFBlZXIoa2V5LCBvcHQpO1xuICAgIGlmICghcGVlcikgcmV0dXJuO1xuICAgIGNvbnNvbGUubG9nKFwic3RvcmUgY2h1bmtzXCIsIHsgY2h1bmtzIH0pO1xuICAgIGNodW5rcy5mb3JFYWNoKChjaHVuaywgaSkgPT4ge1xuICAgICAgY29uc3QgaGFzaCA9IHNoYTEoQnVmZmVyLmZyb20oY2h1bmspKS50b1N0cmluZygpO1xuICAgICAgY29uc3Qgc2VuZERhdGE6IFN0b3JlQ2h1bmtzID0ge1xuICAgICAgICBzZW5kZXI6IHRoaXMubm9kZUlkLFxuICAgICAgICBrZXksXG4gICAgICAgIHZhbHVlOiBCdWZmZXIuZnJvbShjaHVuayksXG4gICAgICAgIGluZGV4OiBpLFxuICAgICAgICBwdWJLZXk6IHRoaXMuY3lwaGVyLnB1YktleSxcbiAgICAgICAgaGFzaCxcbiAgICAgICAgc2lnbjogdGhpcy5jeXBoZXIuZW5jcnlwdChoYXNoKSxcbiAgICAgICAgc2l6ZTogY2h1bmtzLmxlbmd0aFxuICAgICAgfTtcbiAgICAgIGNvbnN0IG5ldHdvcmsgPSBuZXR3b3JrRm9ybWF0KHNlbmRlciwgZGVmLlNUT1JFX0NIVU5LUywgc2VuZERhdGEpO1xuICAgICAgLy8gcGVlcnMuZm9yRWFjaChwZWVyID0+IHtcbiAgICAgIC8vICAgY29uc29sZS5sb2coZGVmLlNUT1JFLCBcIm5leHRcIiwgcGVlci5ub2RlSWQsIFwidGFyZ2V0XCIsIGtleSk7XG4gICAgICAvLyAgIHBlZXIuc2VuZChuZXR3b3JrLCBcImthZFwiKTtcbiAgICAgIC8vIH0pO1xuICAgICAgY29uc29sZS5sb2coZGVmLlNUT1JFLCBcIm5leHRcIiwgcGVlci5ub2RlSWQsIFwidGFyZ2V0XCIsIGtleSk7XG4gICAgICBwZWVyLnNlbmQobmV0d29yaywgXCJrYWRcIik7XG4gICAgfSk7XG4gICAgLy/jg6zjg5fjg6rjgrHjg7zjgrfjg6fjg7NcbiAgICB0aGlzLmtleVZhbHVlTGlzdFtrZXldID0geyBjaHVua3MgfTtcbiAgfVxuXG4gIGZpbmROb2RlKHRhcmdldElkOiBzdHJpbmcsIHBlZXI6IFdlYlJUQykge1xuICAgIGNvbnNvbGUubG9nKFwiZmluZG5vZGVcIiwgdGFyZ2V0SWQpO1xuICAgIHRoaXMuc3RhdGUuZmluZE5vZGUgPSB0YXJnZXRJZDtcbiAgICBjb25zdCBzZW5kRGF0YSA9IHsgdGFyZ2V0S2V5OiB0YXJnZXRJZCB9O1xuICAgIC8v6YCB44KLXG4gICAgcGVlci5zZW5kKG5ldHdvcmtGb3JtYXQodGhpcy5ub2RlSWQsIGRlZi5GSU5ETk9ERSwgc2VuZERhdGEpLCBcImthZFwiKTtcblxuICAgIHRoaXMuY2FsbGJhY2suX29uRmluZE5vZGUoKG5vZGVJZDogc3RyaW5nKSA9PiB7XG4gICAgICBleGN1dGVFdmVudCh0aGlzLmV2ZW50cy5maW5kbm9kZSwgbm9kZUlkKTtcbiAgICB9KTtcbiAgfVxuXG4gIGZpbmRWYWx1ZShrZXk6IHN0cmluZywgb3B0PzogeyBvd25lcklkPzogc3RyaW5nIH0pIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2U8YW55Pihhc3luYyAocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICB0aGlzLmNhbGxiYWNrLl9vbkZpbmRWYWx1ZSA9IHZhbHVlID0+IHtcbiAgICAgICAgZXhjdXRlRXZlbnQodGhpcy5ldmVudHMuZmluZHZhbHVlLCB2YWx1ZSk7XG4gICAgICAgIHJlc29sdmUodmFsdWUpO1xuICAgICAgfTtcbiAgICAgIC8va2V544Gr6L+R44GE44OU44Ki44KS5Y+W5b6XXG4gICAgICBjb25zdCBwZWVycyA9IHRoaXMuZi5nZXRDbG9zZVBlZXJzKGtleSk7XG4gICAgICBwZWVycy5mb3JFYWNoKHBlZXIgPT4ge1xuICAgICAgICB0aGlzLmRvRmluZHZhbHVlKGtleSwgcGVlcik7XG4gICAgICB9KTtcblxuICAgICAgYXdhaXQgbmV3IFByb21pc2UociA9PiBzZXRUaW1lb3V0KHIsIDUwMDApKTtcbiAgICAgIGlmIChvcHQgJiYgb3B0Lm93bmVySWQpIHtcbiAgICAgICAgY29uc3Qgb3duZXJJZCA9IG9wdC5vd25lcklkO1xuICAgICAgICBjb25zdCBwZWVycyA9IHRoaXMuZi5nZXRDbG9zZVBlZXJzKG93bmVySWQpO1xuICAgICAgICBwZWVycy5mb3JFYWNoKHBlZXIgPT4ge1xuICAgICAgICAgIHRoaXMuZG9GaW5kdmFsdWUob3duZXJJZCwgcGVlcik7XG4gICAgICAgIH0pO1xuICAgICAgICBhd2FpdCBuZXcgUHJvbWlzZShyID0+IHNldFRpbWVvdXQociwgNTAwMCkpO1xuICAgICAgfVxuICAgICAgcmVqZWN0KFwiZmluZHZhbHVlIHRpbWVvdXRcIik7XG4gICAgfSk7XG4gIH1cblxuICBhc3luYyBkb0ZpbmR2YWx1ZShrZXk6IHN0cmluZywgcGVlcjogV2ViUlRDKSB7XG4gICAgY29uc29sZS5sb2coXCJkb2ZpbmR2YWx1ZVwiLCBwZWVyLm5vZGVJZCk7XG4gICAgY29uc3Qgc2VuZERhdGE6IEZpbmRWYWx1ZSA9IHsgdGFyZ2V0S2V5OiBrZXkgfTtcbiAgICBwZWVyLnNlbmQobmV0d29ya0Zvcm1hdCh0aGlzLm5vZGVJZCwgZGVmLkZJTkRWQUxVRSwgc2VuZERhdGEpLCBcImthZFwiKTtcbiAgfVxuXG4gIGNvbm5lY3QocGVlcjogV2ViUlRDKSB7XG4gICAgY29uc29sZS5sb2coXCJrYWQgY29ubmVjdFwiKTtcbiAgICBpZiAodGhpcy5zdGF0ZS5pc0ZpcnN0Q29ubmVjdCkgdGhpcy5jYWxsYmFjay5vbkNvbm5lY3QoKTtcbiAgICB0aGlzLnN0YXRlLmlzRmlyc3RDb25uZWN0ID0gZmFsc2U7XG4gICAgdGhpcy5hZGRrbm9kZShwZWVyKTtcbiAgfVxuXG4gIGFkZGtub2RlKHBlZXI6IFdlYlJUQykge1xuICAgIHBlZXIuZXZlbnRzLmRhdGFbXCJrYWRlbWxpYS50c1wiXSA9IHJhdyA9PiB7XG4gICAgICB0aGlzLm9uQ29tbWFuZChyYXcpO1xuICAgIH07XG5cbiAgICBwZWVyLmRpc2Nvbm5lY3QgPSAoKSA9PiB7XG4gICAgICBjb25zb2xlLmxvZyhcImthZCBub2RlIGRpc2Nvbm5lY3RlZFwiKTtcbiAgICAgIHRoaXMuZi5jbGVhbkRpc2NvbigpO1xuICAgICAgdGhpcy5jYWxsYmFjay5vbkFkZFBlZXIodGhpcy5mLmdldEFsbFBlZXJJZHMoKSk7XG4gICAgfTtcblxuICAgIGlmICghdGhpcy5mLmlzTm9kZUV4aXN0KHBlZXIubm9kZUlkKSkge1xuICAgICAgLy/oh6rliIbjga7jg47jg7zjg4lJROOBqOi/veWKoOOBmeOCi+ODjuODvOODiUlE44Gu6Led6ZuiXG4gICAgICBjb25zdCBudW0gPSBkaXN0YW5jZSh0aGlzLm5vZGVJZCwgcGVlci5ub2RlSWQpO1xuICAgICAgLy9rYnVja2V0c+OBruipsuW9k+OBmeOCi+i3nembouOBrmtidWNrZXTjgpLlkbzjgbPlh7rjgZlcbiAgICAgIGNvbnN0IGtidWNrZXQgPSB0aGlzLmtidWNrZXRzW251bV07XG4gICAgICAvL+ipsuW9k+OBmeOCi2tidWNrZXTjgavmlrDjgZfjgYTjg5TjgqLjgpLliqDjgYjjgotcbiAgICAgIGtidWNrZXQucHVzaChwZWVyKTtcblxuICAgICAgY29uc29sZS5sb2coXCJhZGRrbm9kZSBrYnVja2V0c1wiLCBcInBlZXIubm9kZUlkOlwiLCBwZWVyLm5vZGVJZCk7XG4gICAgICBjb25zb2xlLmxvZyh0aGlzLmYuZ2V0QWxsUGVlcklkcygpKTtcblxuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHRoaXMuZmluZE5ld1BlZXIocGVlcik7XG4gICAgICB9LCAxMDAwKTtcblxuICAgICAgdGhpcy5jYWxsYmFjay5vbkFkZFBlZXIodGhpcy5mLmdldEFsbFBlZXJJZHMoKSk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBmaW5kTmV3UGVlcihwZWVyOiBXZWJSVEMpIHtcbiAgICBpZiAodGhpcy5mLmdldEtidWNrZXROdW0oKSA8IHRoaXMuaykge1xuICAgICAgLy/oh6rouqvjga7jg47jg7zjg4lJROOCkmtleeOBqOOBl+OBpkZJTkRfTk9ERVxuICAgICAgdGhpcy5maW5kTm9kZSh0aGlzLm5vZGVJZCwgcGVlcik7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUubG9nKFwia2J1Y2tldCByZWFkeVwiLCB0aGlzLmYuZ2V0S2J1Y2tldE51bSgpKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIG1haW50YWluKG5ldHdvcms6IGFueSkge1xuICAgIGNvbnN0IGlueCA9IGRpc3RhbmNlKHRoaXMubm9kZUlkLCBuZXR3b3JrLm5vZGVJZCk7XG4gICAgY29uc3Qga2J1Y2tldCA9IHRoaXMua2J1Y2tldHNbaW54XTtcblxuICAgIC8v6YCB5L+h5YWD44GM6Kmy5b2T44GZ44KLay1idWNrZXTjga7kuK3jgavjgYLjgaPjgZ/loLTlkIhcbiAgICAvL+OBneOBruODjuODvOODieOCkmstYnVja2V044Gu5pyr5bC+44Gr56e744GZXG4gICAga2J1Y2tldC5mb3JFYWNoKChwZWVyLCBpKSA9PiB7XG4gICAgICBpZiAocGVlci5ub2RlSWQgPT09IG5ldHdvcmsubm9kZUlkKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwibWFpbnRhaW5cIiwgXCJNb3Zlc8KgaXTCoHRvwqB0aGXCoHRhaWzCoG9mwqB0aGXCoGxpc3RcIik7XG4gICAgICAgIGtidWNrZXQuc3BsaWNlKGksIDEpO1xuICAgICAgICBrYnVja2V0LnB1c2gocGVlcik7XG4gICAgICAgIHJldHVybiAwO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy9rLWJ1Y2tldOOBjOOBmeOBp+OBq+a6gOadr+OBquWgtOWQiOOAgVxuICAgIC8v44Gd44Guay1idWNrZXTkuK3jga7lhYjpoK3jga7jg47jg7zjg4njgYzjgqrjg7Pjg6njgqTjg7PjgarjgonlhYjpoK3jga7jg47jg7zjg4njgpLmrovjgZlcbiAgICBpZiAoa2J1Y2tldC5sZW5ndGggPiB0aGlzLmspIHtcbiAgICAgIGtidWNrZXQuc2hpZnQoKTtcbiAgICB9XG4gIH1cblxuICBvZmZlcih0YXJnZXQ6IHN0cmluZywgcHJveHkgPSBudWxsKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGNvbnN0IHIgPSB0aGlzLnJlZjtcbiAgICAgIGNvbnN0IHBlZXIgPSAoclt0YXJnZXRdID0gbmV3IFdlYlJUQygpKTtcbiAgICAgIHBlZXIubWFrZU9mZmVyKCk7XG5cbiAgICAgIGNvbnN0IHRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgcmVqZWN0KFwia2FkIG9mZmVyIHRpbWVvdXRcIik7XG4gICAgICB9LCA1ICogMTAwMCk7XG5cbiAgICAgIHBlZXIuc2lnbmFsID0gc2RwID0+IHtcbiAgICAgICAgY29uc29sZS5sb2coXCJrYWQgb2ZmZXIgc3RvcmVcIiwgdGFyZ2V0KTtcbiAgICAgICAgY29uc3QgXyA9IHRoaXMuZi5nZXRDbG9zZUVzdFBlZXIodGFyZ2V0KTtcbiAgICAgICAgaWYgKCFfKSByZXR1cm47XG4gICAgICAgIGlmIChfLm5vZGVJZCAhPT0gdGFyZ2V0KVxuICAgICAgICAgIHRoaXMuc3RvcmUodGhpcy5ub2RlSWQsIHRhcmdldCwgeyBzZHAsIHByb3h5IH0pO1xuICAgICAgfTtcblxuICAgICAgcGVlci5jb25uZWN0ID0gKCkgPT4ge1xuICAgICAgICBwZWVyLm5vZGVJZCA9IHRhcmdldDtcbiAgICAgICAgY29uc29sZS5sb2coXCJrYWQgb2ZmZXIgY29ubmVjdGVkXCIsIHRhcmdldCk7XG4gICAgICAgIHRoaXMuYWRka25vZGUocGVlcik7XG4gICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KTtcbiAgICAgICAgcmVzb2x2ZSh0cnVlKTtcbiAgICAgIH07XG4gICAgfSk7XG4gIH1cblxuICBhbnN3ZXIodGFyZ2V0OiBzdHJpbmcsIHNkcDogc3RyaW5nLCBwcm94eTogc3RyaW5nKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGNvbnN0IHIgPSB0aGlzLnJlZjtcbiAgICAgIGNvbnN0IHBlZXIgPSAoclt0YXJnZXRdID0gbmV3IFdlYlJUQygpKTtcbiAgICAgIHBlZXIubWFrZUFuc3dlcihzZHApO1xuICAgICAgY29uc29sZS5sb2coXCJrYWQgYW5zd2VyXCIsIHRhcmdldCk7XG5cbiAgICAgIGNvbnN0IHRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgcmVqZWN0KFwia2FkIGFuc3dlciB0aW1lb3V0XCIpO1xuICAgICAgfSwgNSAqIDEwMDApO1xuXG4gICAgICBwZWVyLnNpZ25hbCA9IHNkcCA9PiB7XG4gICAgICAgIGNvbnN0IF8gPSB0aGlzLmYuZ2V0UGVlckZyb21ub2RlSWQocHJveHkpO1xuICAgICAgICBjb25zdCBoYXNoID0gc2hhMShNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKCkpLnRvU3RyaW5nKCk7XG4gICAgICAgIGNvbnN0IHNlbmREYXRhOiBTdG9yZUZvcm1hdCA9IHtcbiAgICAgICAgICBzZW5kZXI6IHRoaXMubm9kZUlkLFxuICAgICAgICAgIGtleTogdGFyZ2V0LFxuICAgICAgICAgIHZhbHVlOiB7IHNkcCB9LFxuICAgICAgICAgIHB1YktleTogdGhpcy5jeXBoZXIucHViS2V5LFxuICAgICAgICAgIGhhc2gsXG4gICAgICAgICAgc2lnbjogdGhpcy5jeXBoZXIuZW5jcnlwdChoYXNoKVxuICAgICAgICB9O1xuICAgICAgICBpZiAoXykgXy5zZW5kKG5ldHdvcmtGb3JtYXQodGhpcy5ub2RlSWQsIGRlZi5TVE9SRSwgc2VuZERhdGEpLCBcImthZFwiKTtcbiAgICAgIH07XG5cbiAgICAgIHBlZXIuY29ubmVjdCA9ICgpID0+IHtcbiAgICAgICAgcGVlci5ub2RlSWQgPSB0YXJnZXQ7XG4gICAgICAgIGNvbnNvbGUubG9nKFwia2FkIGFuc3dlciBjb25uZWN0ZWRcIiwgdGFyZ2V0KTtcbiAgICAgICAgdGhpcy5hZGRrbm9kZShwZWVyKTtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xuICAgICAgICByZXNvbHZlKHRydWUpO1xuICAgICAgfTtcbiAgICB9KTtcbiAgfVxuXG4gIHNlbmQodGFyZ2V0OiBzdHJpbmcsIGRhdGE6IGFueSkge1xuICAgIGNvbnN0IF8gPSB0aGlzLmYuZ2V0UGVlckZyb21ub2RlSWQodGFyZ2V0KTtcbiAgICBpZiAoXykgXy5zZW5kKG5ldHdvcmtGb3JtYXQodGhpcy5ub2RlSWQsIGRlZi5TRU5ELCBkYXRhKSwgXCJrYWRcIik7XG4gIH1cblxuICBwcml2YXRlIG9uQ29tbWFuZChtZXNzYWdlOiBtZXNzYWdlKSB7XG4gICAgc3dpdGNoIChtZXNzYWdlLmxhYmVsKSB7XG4gICAgICBjYXNlIFwia2FkXCI6XG4gICAgICAgIGNvbnN0IGJ1ZmZlcjogQnVmZmVyID0gQnVmZmVyLmZyb20obWVzc2FnZS5kYXRhKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBjb25zdCBuZXR3b3JrTGF5ZXI6IG5ldHdvcmsgPSBic29uLmRlc2VyaWFsaXplKGJ1ZmZlcik7XG4gICAgICAgICAgY29uc29sZS5sb2coXCJvbmNvbW1hbmQga2FkXCIsIHsgbWVzc2FnZSB9LCB7IG5ldHdvcmtMYXllciB9KTtcbiAgICAgICAgICBpZiAoIUpTT04uc3RyaW5naWZ5KHRoaXMuZGF0YUxpc3QpLmluY2x1ZGVzKG5ldHdvcmtMYXllci5oYXNoKSkge1xuICAgICAgICAgICAgdGhpcy5kYXRhTGlzdC5wdXNoKG5ldHdvcmtMYXllci5oYXNoKTtcbiAgICAgICAgICAgIHRoaXMub25SZXF1ZXN0KG5ldHdvcmtMYXllcik7XG4gICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yKTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIG9uUmVxdWVzdChuZXR3b3JrOiBhbnkpIHtcbiAgICB0aGlzLnJlc3BvbmRlci5yZXNwb25zZShuZXR3b3JrLnR5cGUsIG5ldHdvcmspO1xuICAgIHRoaXMubWFpbnRhaW4obmV0d29yayk7XG4gIH1cbn1cbiJdfQ==
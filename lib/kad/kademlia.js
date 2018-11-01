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

    _defineProperty(this, "onP2P", {});

    _defineProperty(this, "events", {
      store: this.onStore,
      findvalue: this.onFindValue,
      findnode: this.onFindNode,
      p2p: this.onP2P
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
      var network = (0, _KConst.networkFormat)(this.nodeId, _KConst.default.STORE, sendData);
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
        var network = (0, _KConst.networkFormat)(sender, _KConst.default.STORE_CHUNKS, sendData);
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

      return new Promise(
      /*#__PURE__*/
      function () {
        var _ref = _asyncToGenerator(
        /*#__PURE__*/
        regeneratorRuntime.mark(function _callee(resolve, reject) {
          var sendData;
          return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
              switch (_context.prev = _context.next) {
                case 0:
                  console.log("findnode", targetId);
                  _this2.state.findNode = targetId;
                  sendData = {
                    targetKey: targetId
                  }; //送る

                  peer.send((0, _KConst.networkFormat)(_this2.nodeId, _KConst.default.FINDNODE, sendData), "kad");

                  _this2.callback._onFindNode(function (nodeId) {
                    excuteEvent(_this2.events.findnode, nodeId);
                    resolve(_this2.f.getPeerFromnodeId(nodeId));
                  });

                  _context.next = 7;
                  return new Promise(function (r) {
                    return setTimeout(r, 10 * 1000);
                  });

                case 7:
                  reject("timeout findnode");

                case 8:
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
    key: "findValue",
    value: function findValue(key, opt) {
      var _this3 = this;

      return new Promise(
      /*#__PURE__*/
      function () {
        var _ref2 = _asyncToGenerator(
        /*#__PURE__*/
        regeneratorRuntime.mark(function _callee2(resolve, reject) {
          var peers, _ownerId, _peers;

          return regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
              switch (_context2.prev = _context2.next) {
                case 0:
                  _this3.callback._onFindValue = function (value) {
                    excuteEvent(_this3.events.findvalue, value);
                    resolve(value);
                  }; //keyに近いピアを取得


                  peers = _this3.f.getClosePeers(key);
                  peers.forEach(function (peer) {
                    _this3.doFindvalue(key, peer);
                  });
                  _context2.next = 5;
                  return new Promise(function (r) {
                    return setTimeout(r, 5000);
                  });

                case 5:
                  if (!(opt && opt.ownerId)) {
                    _context2.next = 11;
                    break;
                  }

                  _ownerId = opt.ownerId;
                  _peers = _this3.f.getClosePeers(_ownerId);

                  _peers.forEach(function (peer) {
                    _this3.doFindvalue(_ownerId, peer);
                  });

                  _context2.next = 11;
                  return new Promise(function (r) {
                    return setTimeout(r, 5000);
                  });

                case 11:
                  reject("findvalue timeout");

                case 12:
                case "end":
                  return _context2.stop();
              }
            }
          }, _callee2, this);
        }));

        return function (_x3, _x4) {
          return _ref2.apply(this, arguments);
        };
      }());
    }
  }, {
    key: "doFindvalue",
    value: function () {
      var _doFindvalue = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee3(key, peer) {
        var sendData;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                console.log("dofindvalue", peer.nodeId);
                sendData = {
                  targetKey: key
                };
                peer.send((0, _KConst.networkFormat)(this.nodeId, _KConst.default.FINDVALUE, sendData), "kad");

              case 3:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      return function doFindvalue(_x5, _x6) {
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
    value: function () {
      var _findNewPeer = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee4(peer) {
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                if (!(this.f.getKbucketNum() < this.k)) {
                  _context4.next = 5;
                  break;
                }

                _context4.next = 3;
                return this.findNode(this.nodeId, peer).catch(console.log);

              case 3:
                _context4.next = 6;
                break;

              case 5:
                console.log("kbucket ready", this.f.getKbucketNum());

              case 6:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      return function findNewPeer(_x7) {
        return _findNewPeer.apply(this, arguments);
      };
    }()
  }, {
    key: "maintain",
    value: function () {
      var _maintain = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee5(network) {
        var inx, kbucket;
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
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
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      return function maintain(_x8) {
        return _maintain.apply(this, arguments);
      };
    }()
  }, {
    key: "offer",
    value: function offer(target) {
      var _this5 = this;

      var proxy = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      return new Promise(
      /*#__PURE__*/
      function () {
        var _ref3 = _asyncToGenerator(
        /*#__PURE__*/
        regeneratorRuntime.mark(function _callee6(resolve, reject) {
          var r, peer, timeout;
          return regeneratorRuntime.wrap(function _callee6$(_context6) {
            while (1) {
              switch (_context6.prev = _context6.next) {
                case 0:
                  r = _this5.ref;
                  peer = r[target] = new _webrtc4me.default();
                  peer.makeOffer();
                  timeout = setTimeout(function () {
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

                case 6:
                case "end":
                  return _context6.stop();
              }
            }
          }, _callee6, this);
        }));

        return function (_x9, _x10) {
          return _ref3.apply(this, arguments);
        };
      }());
    }
  }, {
    key: "answer",
    value: function answer(target, sdp, proxy) {
      var _this6 = this;

      return new Promise(
      /*#__PURE__*/
      function () {
        var _ref4 = _asyncToGenerator(
        /*#__PURE__*/
        regeneratorRuntime.mark(function _callee7(resolve, reject) {
          var r, peer, timeout;
          return regeneratorRuntime.wrap(function _callee7$(_context7) {
            while (1) {
              switch (_context7.prev = _context7.next) {
                case 0:
                  r = _this6.ref;
                  peer = r[target] = new _webrtc4me.default();
                  peer.makeAnswer(sdp);
                  console.log("kad answer", target);
                  timeout = setTimeout(function () {
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

                case 7:
                case "end":
                  return _context7.stop();
              }
            }
          }, _callee7, this);
        }));

        return function (_x11, _x12) {
          return _ref4.apply(this, arguments);
        };
      }());
    }
  }, {
    key: "send",
    value: function send(target, data) {
      var _this7 = this;

      return new Promise(
      /*#__PURE__*/
      function () {
        var _ref5 = _asyncToGenerator(
        /*#__PURE__*/
        regeneratorRuntime.mark(function _callee8(resolve, reject) {
          var peer, close, result;
          return regeneratorRuntime.wrap(function _callee8$(_context8) {
            while (1) {
              switch (_context8.prev = _context8.next) {
                case 0:
                  peer = _this7.f.getPeerFromnodeId(target);

                  if (!peer) {
                    _context8.next = 6;
                    break;
                  }

                  peer.send((0, _KConst.networkFormat)(_this7.nodeId, _KConst.default.SEND, data), "kad");
                  resolve(true);
                  _context8.next = 16;
                  break;

                case 6:
                  close = _this7.f.getCloseEstPeer(target);

                  if (close) {
                    _context8.next = 9;
                    break;
                  }

                  return _context8.abrupt("return");

                case 9:
                  _context8.next = 11;
                  return _this7.findNode(target, close).catch(console.log);

                case 11:
                  result = _context8.sent;

                  if (result) {
                    _context8.next = 14;
                    break;
                  }

                  return _context8.abrupt("return");

                case 14:
                  result.send(data, "p2p");
                  resolve(true);

                case 16:
                  _context8.next = 18;
                  return new Promise(function (r) {
                    return setTimeout(r, 10 * 1000);
                  });

                case 18:
                  reject("send timeout");

                case 19:
                case "end":
                  return _context8.stop();
              }
            }
          }, _callee8, this);
        }));

        return function (_x13, _x14) {
          return _ref5.apply(this, arguments);
        };
      }());
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

        case "p2p":
          excuteEvent(this.events.p2p, {
            nodeId: message.nodeId,
            data: message.data
          });
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9rYWQva2FkZW1saWEudHMiXSwibmFtZXMiOlsicmVxdWlyZSIsImJzb24iLCJCU09OIiwiZXhjdXRlRXZlbnQiLCJldiIsInYiLCJjb25zb2xlIiwibG9nIiwiT2JqZWN0Iiwia2V5cyIsImZvckVhY2giLCJrZXkiLCJLYWRlbWxpYSIsIm9wdCIsImlzRmlyc3RDb25uZWN0IiwiaXNPZmZlciIsImZpbmROb2RlIiwiaGFzaCIsIm9uQ29ubmVjdCIsIm9uQWRkUGVlciIsIm9uUGVlckRpc2Nvbm5lY3QiLCJfb25GaW5kVmFsdWUiLCJfb25GaW5kTm9kZSIsIm9uQXBwIiwic3RvcmUiLCJvblN0b3JlIiwiZmluZHZhbHVlIiwib25GaW5kVmFsdWUiLCJmaW5kbm9kZSIsIm9uRmluZE5vZGUiLCJwMnAiLCJvblAyUCIsImsiLCJrTGVuZ3RoIiwiY3lwaGVyIiwiQ3lwaGVyIiwic2VjS2V5IiwicHVia2V5Iiwibm9kZUlkIiwicHViS2V5IiwidG9TdHJpbmciLCJrYnVja2V0cyIsIkFycmF5IiwiaSIsImtidWNrZXQiLCJmIiwiSGVscGVyIiwicmVzcG9uZGVyIiwiS1Jlc3BvbmRlciIsInNlbmRlciIsInZhbHVlIiwicGVlciIsImdldENsb3NlRXN0UGVlciIsIkpTT04iLCJzdHJpbmdpZnkiLCJzZW5kRGF0YSIsInNpZ24iLCJlbmNyeXB0IiwibmV0d29yayIsImRlZiIsIlNUT1JFIiwic2VuZCIsInNkcCIsImtleVZhbHVlTGlzdCIsImNodW5rcyIsImNodW5rIiwiQnVmZmVyIiwiZnJvbSIsImluZGV4Iiwic2l6ZSIsImxlbmd0aCIsIlNUT1JFX0NIVU5LUyIsInRhcmdldElkIiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZWplY3QiLCJzdGF0ZSIsInRhcmdldEtleSIsIkZJTkROT0RFIiwiY2FsbGJhY2siLCJldmVudHMiLCJnZXRQZWVyRnJvbW5vZGVJZCIsInIiLCJzZXRUaW1lb3V0IiwicGVlcnMiLCJnZXRDbG9zZVBlZXJzIiwiZG9GaW5kdmFsdWUiLCJvd25lcklkIiwiRklORFZBTFVFIiwiYWRka25vZGUiLCJkYXRhIiwicmF3Iiwib25Db21tYW5kIiwiZGlzY29ubmVjdCIsImNsZWFuRGlzY29uIiwiZ2V0QWxsUGVlcklkcyIsImlzTm9kZUV4aXN0IiwibnVtIiwicHVzaCIsImZpbmROZXdQZWVyIiwiZ2V0S2J1Y2tldE51bSIsImNhdGNoIiwiaW54Iiwic3BsaWNlIiwic2hpZnQiLCJ0YXJnZXQiLCJwcm94eSIsInJlZiIsIldlYlJUQyIsIm1ha2VPZmZlciIsInRpbWVvdXQiLCJzaWduYWwiLCJfIiwiY29ubmVjdCIsImNsZWFyVGltZW91dCIsIm1ha2VBbnN3ZXIiLCJNYXRoIiwicmFuZG9tIiwiU0VORCIsImNsb3NlIiwicmVzdWx0IiwibWVzc2FnZSIsImxhYmVsIiwiYnVmZmVyIiwibmV0d29ya0xheWVyIiwiZGVzZXJpYWxpemUiLCJkYXRhTGlzdCIsImluY2x1ZGVzIiwib25SZXF1ZXN0IiwiZXJyb3IiLCJyZXNwb25zZSIsInR5cGUiLCJtYWludGFpbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBVEFBLE9BQU8sQ0FBQyxnQkFBRCxDQUFQOztBQVdBLElBQU1DLElBQUksR0FBRyxJQUFJQyxVQUFKLEVBQWI7O0FBQ08sU0FBU0MsV0FBVCxDQUFxQkMsRUFBckIsRUFBOEJDLENBQTlCLEVBQXVDO0FBQzVDQyxFQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWSxhQUFaLEVBQTJCSCxFQUEzQjtBQUNBSSxFQUFBQSxNQUFNLENBQUNDLElBQVAsQ0FBWUwsRUFBWixFQUFnQk0sT0FBaEIsQ0FBd0IsVUFBQUMsR0FBRyxFQUFJO0FBQzdCUCxJQUFBQSxFQUFFLENBQUNPLEdBQUQsQ0FBRixDQUFRTixDQUFSO0FBQ0QsR0FGRDtBQUdEOztJQUVvQk8sUTs7O0FBc0NuQixvQkFBWUMsR0FBWixFQUEwRTtBQUFBOztB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QUFDM0csSUFBcEQsQ0FBTCxFQUFnRTtBQUM5RCxtQkFBSzZHLFFBQUwsQ0FBYzVCLElBQWQsQ0FBbUIwQixZQUFZLENBQUMzRyxJQUFoQztBQUNBLG1CQUFLK0csU0FBTCxDQUFlSixZQUFmO0FBQ0Q7QUFDRixXQVBELENBT0UsT0FBT0ssS0FBUCxFQUFjO0FBQ2QzSCxZQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWTBILEtBQVo7QUFDRDs7QUFDRDs7QUFDRixhQUFLLEtBQUw7QUFDRTlILFVBQUFBLFdBQVcsQ0FBQyxLQUFLNkUsTUFBTCxDQUFZbEQsR0FBYixFQUFrQjtBQUMzQlEsWUFBQUEsTUFBTSxFQUFFbUYsT0FBTyxDQUFDbkYsTUFEVztBQUUzQm9ELFlBQUFBLElBQUksRUFBRStCLE9BQU8sQ0FBQy9CO0FBRmEsV0FBbEIsQ0FBWDtBQUlBO0FBbkJKO0FBcUJEOzs7OEJBRWlCaEMsTyxFQUFjO0FBQzlCLFdBQUtYLFNBQUwsQ0FBZW1GLFFBQWYsQ0FBd0J4RSxPQUFPLENBQUN5RSxJQUFoQyxFQUFzQ3pFLE9BQXRDO0FBQ0EsV0FBSzBFLFFBQUwsQ0FBYzFFLE9BQWQ7QUFDRCIsInNvdXJjZXNDb250ZW50IjpbInJlcXVpcmUoXCJiYWJlbC1wb2x5ZmlsbFwiKTtcbmltcG9ydCBXZWJSVEMgZnJvbSBcIndlYnJ0YzRtZVwiO1xuaW1wb3J0IEhlbHBlciBmcm9tIFwiLi9rVXRpbFwiO1xuaW1wb3J0IEtSZXNwb25kZXIgZnJvbSBcIi4va1Jlc3BvbmRlclwiO1xuaW1wb3J0IGRlZiwgeyBuZXR3b3JrRm9ybWF0IH0gZnJvbSBcIi4vS0NvbnN0XCI7XG5pbXBvcnQgeyBkaXN0YW5jZSB9IGZyb20gXCJrYWQtZGlzdGFuY2VcIjtcbmltcG9ydCB7IG1lc3NhZ2UgfSBmcm9tIFwid2VicnRjNG1lL2xpYi9pbnRlcmZhY2VcIjtcbmltcG9ydCB7IEJTT04gfSBmcm9tIFwiYnNvblwiO1xuaW1wb3J0IEN5cGhlciBmcm9tIFwiLi4vbGliL2N5cGhlclwiO1xuaW1wb3J0IHNoYTEgZnJvbSBcInNoYTFcIjtcblxuY29uc3QgYnNvbiA9IG5ldyBCU09OKCk7XG5leHBvcnQgZnVuY3Rpb24gZXhjdXRlRXZlbnQoZXY6IGFueSwgdj86IGFueSkge1xuICBjb25zb2xlLmxvZyhcImV4Y3V0ZUV2ZW50XCIsIGV2KTtcbiAgT2JqZWN0LmtleXMoZXYpLmZvckVhY2goa2V5ID0+IHtcbiAgICBldltrZXldKHYpO1xuICB9KTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgS2FkZW1saWEge1xuICBub2RlSWQ6IHN0cmluZztcbiAgazogbnVtYmVyO1xuICBrYnVja2V0czogQXJyYXk8QXJyYXk8V2ViUlRDPj47XG4gIGY6IEhlbHBlcjtcbiAgcmVzcG9uZGVyOiBLUmVzcG9uZGVyO1xuICBkYXRhTGlzdDogQXJyYXk8YW55PiA9IFtdO1xuICBrZXlWYWx1ZUxpc3Q6IHsgW2tleTogc3RyaW5nXTogYW55IH0gPSB7fTtcbiAgcmVmOiB7IFtrZXk6IHN0cmluZ106IFdlYlJUQyB9ID0ge307XG4gIGJ1ZmZlcjogeyBba2V5OiBzdHJpbmddOiBBcnJheTxhbnk+IH0gPSB7fTtcbiAgc3RhdGUgPSB7XG4gICAgaXNGaXJzdENvbm5lY3Q6IHRydWUsXG4gICAgaXNPZmZlcjogZmFsc2UsXG4gICAgZmluZE5vZGU6IFwiXCIsXG4gICAgaGFzaDoge31cbiAgfTtcblxuICBjYWxsYmFjayA9IHtcbiAgICBvbkNvbm5lY3Q6ICgpID0+IHt9LFxuICAgIG9uQWRkUGVlcjogKHY/OiBhbnkpID0+IHt9LFxuICAgIG9uUGVlckRpc2Nvbm5lY3Q6ICh2PzogYW55KSA9PiB7fSxcbiAgICBfb25GaW5kVmFsdWU6ICh2PzogYW55KSA9PiB7fSxcbiAgICBfb25GaW5kTm9kZTogKHY/OiBhbnkpID0+IHt9LFxuICAgIG9uQXBwOiAodj86IGFueSkgPT4ge31cbiAgfTtcblxuICBvblN0b3JlOiB7IFtrZXk6IHN0cmluZ106ICh2OiBhbnkpID0+IHZvaWQgfSA9IHt9O1xuICBvbkZpbmRWYWx1ZTogeyBba2V5OiBzdHJpbmddOiAodjogYW55KSA9PiB2b2lkIH0gPSB7fTtcbiAgb25GaW5kTm9kZTogeyBba2V5OiBzdHJpbmddOiAodjogYW55KSA9PiB2b2lkIH0gPSB7fTtcbiAgb25QMlA6IHsgW2tleTogc3RyaW5nXTogKG5vZGVJZDogc3RyaW5nLCBkYXRhOiBzdHJpbmcpID0+IHZvaWQgfSA9IHt9O1xuICBldmVudHMgPSB7XG4gICAgc3RvcmU6IHRoaXMub25TdG9yZSxcbiAgICBmaW5kdmFsdWU6IHRoaXMub25GaW5kVmFsdWUsXG4gICAgZmluZG5vZGU6IHRoaXMub25GaW5kTm9kZSxcbiAgICBwMnA6IHRoaXMub25QMlBcbiAgfTtcbiAgY3lwaGVyOiBDeXBoZXI7XG5cbiAgY29uc3RydWN0b3Iob3B0PzogeyBwdWJrZXk/OiBzdHJpbmc7IHNlY0tleT86IHN0cmluZzsga0xlbmd0aD86IG51bWJlciB9KSB7XG4gICAgdGhpcy5rID0gMjA7XG4gICAgaWYgKG9wdCAmJiBvcHQua0xlbmd0aCkgdGhpcy5rID0gb3B0LmtMZW5ndGg7XG4gICAgaWYgKG9wdCkgdGhpcy5jeXBoZXIgPSBuZXcgQ3lwaGVyKG9wdC5zZWNLZXksIG9wdC5wdWJrZXkpO1xuICAgIGVsc2UgdGhpcy5jeXBoZXIgPSBuZXcgQ3lwaGVyKCk7XG4gICAgdGhpcy5ub2RlSWQgPSBzaGExKHRoaXMuY3lwaGVyLnB1YktleSkudG9TdHJpbmcoKTtcblxuICAgIHRoaXMua2J1Y2tldHMgPSBuZXcgQXJyYXkoMTYwKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IDE2MDsgaSsrKSB7XG4gICAgICBsZXQga2J1Y2tldDogQXJyYXk8YW55PiA9IFtdO1xuICAgICAgdGhpcy5rYnVja2V0c1tpXSA9IGtidWNrZXQ7XG4gICAgfVxuXG4gICAgdGhpcy5mID0gbmV3IEhlbHBlcih0aGlzLmssIHRoaXMua2J1Y2tldHMsIHRoaXMubm9kZUlkKTtcbiAgICB0aGlzLnJlc3BvbmRlciA9IG5ldyBLUmVzcG9uZGVyKHRoaXMpO1xuICB9XG5cbiAgc3RvcmUoc2VuZGVyOiBzdHJpbmcsIGtleTogc3RyaW5nLCB2YWx1ZTogYW55LCBvcHQ/OiB7IGV4Y2x1ZGVJZD86IHN0cmluZyB9KSB7XG4gICAgY29uc3QgcGVlciA9IHRoaXMuZi5nZXRDbG9zZUVzdFBlZXIoa2V5LCBvcHQpO1xuICAgIGlmICghcGVlcikgcmV0dXJuO1xuICAgIGNvbnN0IGhhc2ggPSBzaGExKEpTT04uc3RyaW5naWZ5KHZhbHVlKSkudG9TdHJpbmcoKTtcbiAgICBjb25zdCBzZW5kRGF0YTogU3RvcmVGb3JtYXQgPSB7XG4gICAgICBzZW5kZXIsXG4gICAgICBrZXksXG4gICAgICB2YWx1ZSxcbiAgICAgIHB1YktleTogdGhpcy5jeXBoZXIucHViS2V5LFxuICAgICAgaGFzaCxcbiAgICAgIHNpZ246IHRoaXMuY3lwaGVyLmVuY3J5cHQoaGFzaClcbiAgICB9O1xuICAgIGNvbnN0IG5ldHdvcmsgPSBuZXR3b3JrRm9ybWF0KHRoaXMubm9kZUlkLCBkZWYuU1RPUkUsIHNlbmREYXRhKTtcblxuICAgIGNvbnNvbGUubG9nKGRlZi5TVE9SRSwgXCJuZXh0XCIsIHBlZXIubm9kZUlkLCBcInRhcmdldFwiLCBrZXkpO1xuICAgIHBlZXIuc2VuZChuZXR3b3JrLCBcImthZFwiKTtcbiAgICAvL25vIHNkcFxuICAgIGlmICghdmFsdWUuc2RwKSB0aGlzLmtleVZhbHVlTGlzdFtrZXldID0gdmFsdWU7XG4gIH1cblxuICBzdG9yZUNodW5rcyhcbiAgICBzZW5kZXI6IHN0cmluZyxcbiAgICBrZXk6IHN0cmluZyxcbiAgICBjaHVua3M6IEFycmF5QnVmZmVyW10sXG4gICAgb3B0PzogeyBleGNsdWRlSWQ/OiBzdHJpbmcgfVxuICApIHtcbiAgICAvLyBjb25zdCBwZWVycyA9IHRoaXMuZi5nZXRDbG9zZVBlZXJzKGtleSwgb3B0KTtcbiAgICBjb25zdCBwZWVyID0gdGhpcy5mLmdldENsb3NlRXN0UGVlcihrZXksIG9wdCk7XG4gICAgaWYgKCFwZWVyKSByZXR1cm47XG4gICAgY29uc29sZS5sb2coXCJzdG9yZSBjaHVua3NcIiwgeyBjaHVua3MgfSk7XG4gICAgY2h1bmtzLmZvckVhY2goKGNodW5rLCBpKSA9PiB7XG4gICAgICBjb25zdCBoYXNoID0gc2hhMShCdWZmZXIuZnJvbShjaHVuaykpLnRvU3RyaW5nKCk7XG4gICAgICBjb25zdCBzZW5kRGF0YTogU3RvcmVDaHVua3MgPSB7XG4gICAgICAgIHNlbmRlcjogdGhpcy5ub2RlSWQsXG4gICAgICAgIGtleSxcbiAgICAgICAgdmFsdWU6IEJ1ZmZlci5mcm9tKGNodW5rKSxcbiAgICAgICAgaW5kZXg6IGksXG4gICAgICAgIHB1YktleTogdGhpcy5jeXBoZXIucHViS2V5LFxuICAgICAgICBoYXNoLFxuICAgICAgICBzaWduOiB0aGlzLmN5cGhlci5lbmNyeXB0KGhhc2gpLFxuICAgICAgICBzaXplOiBjaHVua3MubGVuZ3RoXG4gICAgICB9O1xuICAgICAgY29uc3QgbmV0d29yayA9IG5ldHdvcmtGb3JtYXQoc2VuZGVyLCBkZWYuU1RPUkVfQ0hVTktTLCBzZW5kRGF0YSk7XG5cbiAgICAgIGNvbnNvbGUubG9nKGRlZi5TVE9SRSwgXCJuZXh0XCIsIHBlZXIubm9kZUlkLCBcInRhcmdldFwiLCBrZXkpO1xuICAgICAgcGVlci5zZW5kKG5ldHdvcmssIFwia2FkXCIpO1xuICAgIH0pO1xuICAgIC8v44Os44OX44Oq44Kx44O844K344On44OzXG4gICAgdGhpcy5rZXlWYWx1ZUxpc3Rba2V5XSA9IHsgY2h1bmtzIH07XG4gIH1cblxuICBmaW5kTm9kZSh0YXJnZXRJZDogc3RyaW5nLCBwZWVyOiBXZWJSVEMpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2U8V2ViUlRDPihhc3luYyAocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjb25zb2xlLmxvZyhcImZpbmRub2RlXCIsIHRhcmdldElkKTtcbiAgICAgIHRoaXMuc3RhdGUuZmluZE5vZGUgPSB0YXJnZXRJZDtcbiAgICAgIGNvbnN0IHNlbmREYXRhID0geyB0YXJnZXRLZXk6IHRhcmdldElkIH07XG4gICAgICAvL+mAgeOCi1xuICAgICAgcGVlci5zZW5kKG5ldHdvcmtGb3JtYXQodGhpcy5ub2RlSWQsIGRlZi5GSU5ETk9ERSwgc2VuZERhdGEpLCBcImthZFwiKTtcblxuICAgICAgdGhpcy5jYWxsYmFjay5fb25GaW5kTm9kZSgobm9kZUlkOiBzdHJpbmcpID0+IHtcbiAgICAgICAgZXhjdXRlRXZlbnQodGhpcy5ldmVudHMuZmluZG5vZGUsIG5vZGVJZCk7XG4gICAgICAgIHJlc29sdmUodGhpcy5mLmdldFBlZXJGcm9tbm9kZUlkKG5vZGVJZCkpO1xuICAgICAgfSk7XG5cbiAgICAgIGF3YWl0IG5ldyBQcm9taXNlKHIgPT4gc2V0VGltZW91dChyLCAxMCAqIDEwMDApKTtcbiAgICAgIHJlamVjdChcInRpbWVvdXQgZmluZG5vZGVcIik7XG4gICAgfSk7XG4gIH1cblxuICBmaW5kVmFsdWUoa2V5OiBzdHJpbmcsIG9wdD86IHsgb3duZXJJZD86IHN0cmluZyB9KSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlPGFueT4oYXN5bmMgKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgdGhpcy5jYWxsYmFjay5fb25GaW5kVmFsdWUgPSB2YWx1ZSA9PiB7XG4gICAgICAgIGV4Y3V0ZUV2ZW50KHRoaXMuZXZlbnRzLmZpbmR2YWx1ZSwgdmFsdWUpO1xuICAgICAgICByZXNvbHZlKHZhbHVlKTtcbiAgICAgIH07XG4gICAgICAvL2tleeOBq+i/keOBhOODlOOCouOCkuWPluW+l1xuICAgICAgY29uc3QgcGVlcnMgPSB0aGlzLmYuZ2V0Q2xvc2VQZWVycyhrZXkpO1xuICAgICAgcGVlcnMuZm9yRWFjaChwZWVyID0+IHtcbiAgICAgICAgdGhpcy5kb0ZpbmR2YWx1ZShrZXksIHBlZXIpO1xuICAgICAgfSk7XG5cbiAgICAgIGF3YWl0IG5ldyBQcm9taXNlKHIgPT4gc2V0VGltZW91dChyLCA1MDAwKSk7XG4gICAgICBpZiAob3B0ICYmIG9wdC5vd25lcklkKSB7XG4gICAgICAgIGNvbnN0IG93bmVySWQgPSBvcHQub3duZXJJZDtcbiAgICAgICAgY29uc3QgcGVlcnMgPSB0aGlzLmYuZ2V0Q2xvc2VQZWVycyhvd25lcklkKTtcbiAgICAgICAgcGVlcnMuZm9yRWFjaChwZWVyID0+IHtcbiAgICAgICAgICB0aGlzLmRvRmluZHZhbHVlKG93bmVySWQsIHBlZXIpO1xuICAgICAgICB9KTtcbiAgICAgICAgYXdhaXQgbmV3IFByb21pc2UociA9PiBzZXRUaW1lb3V0KHIsIDUwMDApKTtcbiAgICAgIH1cbiAgICAgIHJlamVjdChcImZpbmR2YWx1ZSB0aW1lb3V0XCIpO1xuICAgIH0pO1xuICB9XG5cbiAgYXN5bmMgZG9GaW5kdmFsdWUoa2V5OiBzdHJpbmcsIHBlZXI6IFdlYlJUQykge1xuICAgIGNvbnNvbGUubG9nKFwiZG9maW5kdmFsdWVcIiwgcGVlci5ub2RlSWQpO1xuICAgIGNvbnN0IHNlbmREYXRhOiBGaW5kVmFsdWUgPSB7IHRhcmdldEtleToga2V5IH07XG4gICAgcGVlci5zZW5kKG5ldHdvcmtGb3JtYXQodGhpcy5ub2RlSWQsIGRlZi5GSU5EVkFMVUUsIHNlbmREYXRhKSwgXCJrYWRcIik7XG4gIH1cblxuICBjb25uZWN0KHBlZXI6IFdlYlJUQykge1xuICAgIGNvbnNvbGUubG9nKFwia2FkIGNvbm5lY3RcIik7XG4gICAgaWYgKHRoaXMuc3RhdGUuaXNGaXJzdENvbm5lY3QpIHRoaXMuY2FsbGJhY2sub25Db25uZWN0KCk7XG4gICAgdGhpcy5zdGF0ZS5pc0ZpcnN0Q29ubmVjdCA9IGZhbHNlO1xuICAgIHRoaXMuYWRka25vZGUocGVlcik7XG4gIH1cblxuICBhZGRrbm9kZShwZWVyOiBXZWJSVEMpIHtcbiAgICBwZWVyLmV2ZW50cy5kYXRhW1wia2FkZW1saWEudHNcIl0gPSByYXcgPT4ge1xuICAgICAgdGhpcy5vbkNvbW1hbmQocmF3KTtcbiAgICB9O1xuXG4gICAgcGVlci5kaXNjb25uZWN0ID0gKCkgPT4ge1xuICAgICAgY29uc29sZS5sb2coXCJrYWQgbm9kZSBkaXNjb25uZWN0ZWRcIik7XG4gICAgICB0aGlzLmYuY2xlYW5EaXNjb24oKTtcbiAgICAgIHRoaXMuY2FsbGJhY2sub25BZGRQZWVyKHRoaXMuZi5nZXRBbGxQZWVySWRzKCkpO1xuICAgIH07XG5cbiAgICBpZiAoIXRoaXMuZi5pc05vZGVFeGlzdChwZWVyLm5vZGVJZCkpIHtcbiAgICAgIC8v6Ieq5YiG44Gu44OO44O844OJSUTjgajov73liqDjgZnjgovjg47jg7zjg4lJROOBrui3nembolxuICAgICAgY29uc3QgbnVtID0gZGlzdGFuY2UodGhpcy5ub2RlSWQsIHBlZXIubm9kZUlkKTtcbiAgICAgIC8va2J1Y2tldHPjga7oqbLlvZPjgZnjgovot53pm6Ljga5rYnVja2V044KS5ZG844Gz5Ye644GZXG4gICAgICBjb25zdCBrYnVja2V0ID0gdGhpcy5rYnVja2V0c1tudW1dO1xuICAgICAgLy/oqbLlvZPjgZnjgotrYnVja2V044Gr5paw44GX44GE44OU44Ki44KS5Yqg44GI44KLXG4gICAgICBrYnVja2V0LnB1c2gocGVlcik7XG5cbiAgICAgIGNvbnNvbGUubG9nKFwiYWRka25vZGUga2J1Y2tldHNcIiwgXCJwZWVyLm5vZGVJZDpcIiwgcGVlci5ub2RlSWQpO1xuICAgICAgY29uc29sZS5sb2codGhpcy5mLmdldEFsbFBlZXJJZHMoKSk7XG5cbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICB0aGlzLmZpbmROZXdQZWVyKHBlZXIpO1xuICAgICAgfSwgMTAwMCk7XG5cbiAgICAgIHRoaXMuY2FsbGJhY2sub25BZGRQZWVyKHRoaXMuZi5nZXRBbGxQZWVySWRzKCkpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgZmluZE5ld1BlZXIocGVlcjogV2ViUlRDKSB7XG4gICAgaWYgKHRoaXMuZi5nZXRLYnVja2V0TnVtKCkgPCB0aGlzLmspIHtcbiAgICAgIC8v6Ieq6Lqr44Gu44OO44O844OJSUTjgpJrZXnjgajjgZfjgaZGSU5EX05PREVcbiAgICAgIGF3YWl0IHRoaXMuZmluZE5vZGUodGhpcy5ub2RlSWQsIHBlZXIpLmNhdGNoKGNvbnNvbGUubG9nKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5sb2coXCJrYnVja2V0IHJlYWR5XCIsIHRoaXMuZi5nZXRLYnVja2V0TnVtKCkpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgbWFpbnRhaW4obmV0d29yazogYW55KSB7XG4gICAgY29uc3QgaW54ID0gZGlzdGFuY2UodGhpcy5ub2RlSWQsIG5ldHdvcmsubm9kZUlkKTtcbiAgICBjb25zdCBrYnVja2V0ID0gdGhpcy5rYnVja2V0c1tpbnhdO1xuXG4gICAgLy/pgIHkv6HlhYPjgYzoqbLlvZPjgZnjgotrLWJ1Y2tldOOBruS4reOBq+OBguOBo+OBn+WgtOWQiFxuICAgIC8v44Gd44Gu44OO44O844OJ44KSay1idWNrZXTjga7mnKvlsL7jgavnp7vjgZlcbiAgICBrYnVja2V0LmZvckVhY2goKHBlZXIsIGkpID0+IHtcbiAgICAgIGlmIChwZWVyLm5vZGVJZCA9PT0gbmV0d29yay5ub2RlSWQpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJtYWludGFpblwiLCBcIk1vdmVzwqBpdMKgdG/CoHRoZcKgdGFpbMKgb2bCoHRoZcKgbGlzdFwiKTtcbiAgICAgICAga2J1Y2tldC5zcGxpY2UoaSwgMSk7XG4gICAgICAgIGtidWNrZXQucHVzaChwZWVyKTtcbiAgICAgICAgcmV0dXJuIDA7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvL2stYnVja2V044GM44GZ44Gn44Gr5rqA5p2v44Gq5aC05ZCI44CBXG4gICAgLy/jgZ3jga5rLWJ1Y2tldOS4reOBruWFiOmgreOBruODjuODvOODieOBjOOCquODs+ODqeOCpOODs+OBquOCieWFiOmgreOBruODjuODvOODieOCkuaui+OBmVxuICAgIGlmIChrYnVja2V0Lmxlbmd0aCA+IHRoaXMuaykge1xuICAgICAga2J1Y2tldC5zaGlmdCgpO1xuICAgIH1cbiAgfVxuXG4gIG9mZmVyKHRhcmdldDogc3RyaW5nLCBwcm94eSA9IG51bGwpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2U8YW55Pihhc3luYyAocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjb25zdCByID0gdGhpcy5yZWY7XG4gICAgICBjb25zdCBwZWVyID0gKHJbdGFyZ2V0XSA9IG5ldyBXZWJSVEMoKSk7XG4gICAgICBwZWVyLm1ha2VPZmZlcigpO1xuXG4gICAgICBjb25zdCB0aW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHJlamVjdChcImthZCBvZmZlciB0aW1lb3V0XCIpO1xuICAgICAgfSwgNSAqIDEwMDApO1xuXG4gICAgICBwZWVyLnNpZ25hbCA9IHNkcCA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwia2FkIG9mZmVyIHN0b3JlXCIsIHRhcmdldCk7XG4gICAgICAgIGNvbnN0IF8gPSB0aGlzLmYuZ2V0Q2xvc2VFc3RQZWVyKHRhcmdldCk7XG4gICAgICAgIGlmICghXykgcmV0dXJuO1xuICAgICAgICBpZiAoXy5ub2RlSWQgIT09IHRhcmdldClcbiAgICAgICAgICB0aGlzLnN0b3JlKHRoaXMubm9kZUlkLCB0YXJnZXQsIHsgc2RwLCBwcm94eSB9KTtcbiAgICAgIH07XG5cbiAgICAgIHBlZXIuY29ubmVjdCA9ICgpID0+IHtcbiAgICAgICAgcGVlci5ub2RlSWQgPSB0YXJnZXQ7XG4gICAgICAgIGNvbnNvbGUubG9nKFwia2FkIG9mZmVyIGNvbm5lY3RlZFwiLCB0YXJnZXQpO1xuICAgICAgICB0aGlzLmFkZGtub2RlKHBlZXIpO1xuICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dCk7XG4gICAgICAgIHJlc29sdmUodHJ1ZSk7XG4gICAgICB9O1xuICAgIH0pO1xuICB9XG5cbiAgYW5zd2VyKHRhcmdldDogc3RyaW5nLCBzZHA6IHN0cmluZywgcHJveHk6IHN0cmluZykge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZTxhbnk+KGFzeW5jIChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGNvbnN0IHIgPSB0aGlzLnJlZjtcbiAgICAgIGNvbnN0IHBlZXIgPSAoclt0YXJnZXRdID0gbmV3IFdlYlJUQygpKTtcbiAgICAgIHBlZXIubWFrZUFuc3dlcihzZHApO1xuICAgICAgY29uc29sZS5sb2coXCJrYWQgYW5zd2VyXCIsIHRhcmdldCk7XG5cbiAgICAgIGNvbnN0IHRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgcmVqZWN0KFwia2FkIGFuc3dlciB0aW1lb3V0XCIpO1xuICAgICAgfSwgNSAqIDEwMDApO1xuXG4gICAgICBwZWVyLnNpZ25hbCA9IHNkcCA9PiB7XG4gICAgICAgIGNvbnN0IF8gPSB0aGlzLmYuZ2V0UGVlckZyb21ub2RlSWQocHJveHkpO1xuICAgICAgICBjb25zdCBoYXNoID0gc2hhMShNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKCkpLnRvU3RyaW5nKCk7XG4gICAgICAgIGNvbnN0IHNlbmREYXRhOiBTdG9yZUZvcm1hdCA9IHtcbiAgICAgICAgICBzZW5kZXI6IHRoaXMubm9kZUlkLFxuICAgICAgICAgIGtleTogdGFyZ2V0LFxuICAgICAgICAgIHZhbHVlOiB7IHNkcCB9LFxuICAgICAgICAgIHB1YktleTogdGhpcy5jeXBoZXIucHViS2V5LFxuICAgICAgICAgIGhhc2gsXG4gICAgICAgICAgc2lnbjogdGhpcy5jeXBoZXIuZW5jcnlwdChoYXNoKVxuICAgICAgICB9O1xuICAgICAgICBpZiAoXykgXy5zZW5kKG5ldHdvcmtGb3JtYXQodGhpcy5ub2RlSWQsIGRlZi5TVE9SRSwgc2VuZERhdGEpLCBcImthZFwiKTtcbiAgICAgIH07XG5cbiAgICAgIHBlZXIuY29ubmVjdCA9ICgpID0+IHtcbiAgICAgICAgcGVlci5ub2RlSWQgPSB0YXJnZXQ7XG4gICAgICAgIGNvbnNvbGUubG9nKFwia2FkIGFuc3dlciBjb25uZWN0ZWRcIiwgdGFyZ2V0KTtcbiAgICAgICAgdGhpcy5hZGRrbm9kZShwZWVyKTtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xuICAgICAgICByZXNvbHZlKHRydWUpO1xuICAgICAgfTtcbiAgICB9KTtcbiAgfVxuXG4gIHNlbmQodGFyZ2V0OiBzdHJpbmcsIGRhdGE6IGFueSkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZTxhbnk+KGFzeW5jIChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGNvbnN0IHBlZXIgPSB0aGlzLmYuZ2V0UGVlckZyb21ub2RlSWQodGFyZ2V0KTtcbiAgICAgIGlmIChwZWVyKSB7XG4gICAgICAgIHBlZXIuc2VuZChuZXR3b3JrRm9ybWF0KHRoaXMubm9kZUlkLCBkZWYuU0VORCwgZGF0YSksIFwia2FkXCIpO1xuICAgICAgICByZXNvbHZlKHRydWUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgY2xvc2UgPSB0aGlzLmYuZ2V0Q2xvc2VFc3RQZWVyKHRhcmdldCk7XG4gICAgICAgIGlmICghY2xvc2UpIHJldHVybjtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5maW5kTm9kZSh0YXJnZXQsIGNsb3NlKS5jYXRjaChjb25zb2xlLmxvZyk7XG4gICAgICAgIGlmICghcmVzdWx0KSByZXR1cm47XG4gICAgICAgIHJlc3VsdC5zZW5kKGRhdGEsIFwicDJwXCIpO1xuICAgICAgICByZXNvbHZlKHRydWUpO1xuICAgICAgfVxuICAgICAgYXdhaXQgbmV3IFByb21pc2UociA9PiBzZXRUaW1lb3V0KHIsIDEwICogMTAwMCkpO1xuICAgICAgcmVqZWN0KFwic2VuZCB0aW1lb3V0XCIpO1xuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBvbkNvbW1hbmQobWVzc2FnZTogbWVzc2FnZSkge1xuICAgIHN3aXRjaCAobWVzc2FnZS5sYWJlbCkge1xuICAgICAgY2FzZSBcImthZFwiOlxuICAgICAgICBjb25zdCBidWZmZXI6IEJ1ZmZlciA9IEJ1ZmZlci5mcm9tKG1lc3NhZ2UuZGF0YSk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgY29uc3QgbmV0d29ya0xheWVyOiBuZXR3b3JrID0gYnNvbi5kZXNlcmlhbGl6ZShidWZmZXIpO1xuICAgICAgICAgIGNvbnNvbGUubG9nKFwib25jb21tYW5kIGthZFwiLCB7IG1lc3NhZ2UgfSwgeyBuZXR3b3JrTGF5ZXIgfSk7XG4gICAgICAgICAgaWYgKCFKU09OLnN0cmluZ2lmeSh0aGlzLmRhdGFMaXN0KS5pbmNsdWRlcyhuZXR3b3JrTGF5ZXIuaGFzaCkpIHtcbiAgICAgICAgICAgIHRoaXMuZGF0YUxpc3QucHVzaChuZXR3b3JrTGF5ZXIuaGFzaCk7XG4gICAgICAgICAgICB0aGlzLm9uUmVxdWVzdChuZXR3b3JrTGF5ZXIpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvcik7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFwicDJwXCI6XG4gICAgICAgIGV4Y3V0ZUV2ZW50KHRoaXMuZXZlbnRzLnAycCwge1xuICAgICAgICAgIG5vZGVJZDogbWVzc2FnZS5ub2RlSWQsXG4gICAgICAgICAgZGF0YTogbWVzc2FnZS5kYXRhXG4gICAgICAgIH0pO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIG9uUmVxdWVzdChuZXR3b3JrOiBhbnkpIHtcbiAgICB0aGlzLnJlc3BvbmRlci5yZXNwb25zZShuZXR3b3JrLnR5cGUsIG5ldHdvcmspO1xuICAgIHRoaXMubWFpbnRhaW4obmV0d29yayk7XG4gIH1cbn1cbiJdfQ==
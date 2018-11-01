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

      var send = function send(peer) {
        var bson = new _bson.BSON();
        var packet = {
          sender: _this7.nodeId,
          target: target
        };

        if (data.text) {
          packet.text = data.text;
          var bin = bson.serialize(packet);
          peer.send(bin, "p2p");
        } else if (data.file) {
          var _file = data.file;

          _file.forEach(function (chunk, i) {
            packet.file = {
              index: i,
              length: _file.length,
              chunk: chunk
            };
            var bin = bson.serialize(packet);
            peer.send(bin, "p2p");
          });
        }
      };

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

                  send(peer);
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
                  send(result);
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
          {
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
          }
          break;

        case "p2p":
          {
            var _buffer = Buffer.from(message.data);

            var packet = bson.deserialize(_buffer);
            excuteEvent(this.events.p2p, packet);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9rYWQva2FkZW1saWEudHMiXSwibmFtZXMiOlsicmVxdWlyZSIsImJzb24iLCJCU09OIiwiZXhjdXRlRXZlbnQiLCJldiIsInYiLCJjb25zb2xlIiwibG9nIiwiT2JqZWN0Iiwia2V5cyIsImZvckVhY2giLCJrZXkiLCJLYWRlbWxpYSIsIm9wdCIsImlzRmlyc3RDb25uZWN0IiwiaXNPZmZlciIsImZpbmROb2RlIiwiaGFzaCIsIm9uQ29ubmVjdCIsIm9uQWRkUGVlciIsIm9uUGVlckRpc2Nvbm5lY3QiLCJfb25GaW5kVmFsdWUiLCJfb25GaW5kTm9kZSIsIm9uQXBwIiwic3RvcmUiLCJvblN0b3JlIiwiZmluZHZhbHVlIiwib25GaW5kVmFsdWUiLCJmaW5kbm9kZSIsIm9uRmluZE5vZGUiLCJwMnAiLCJvblAyUCIsImsiLCJrTGVuZ3RoIiwiY3lwaGVyIiwiQ3lwaGVyIiwic2VjS2V5IiwicHVia2V5Iiwibm9kZUlkIiwicHViS2V5IiwidG9TdHJpbmciLCJrYnVja2V0cyIsIkFycmF5IiwiaSIsImtidWNrZXQiLCJmIiwiSGVscGVyIiwicmVzcG9uZGVyIiwiS1Jlc3BvbmRlciIsInNlbmRlciIsInZhbHVlIiwicGVlciIsImdldENsb3NlRXN0UGVlciIsIkpTT04iLCJzdHJpbmdpZnkiLCJzZW5kRGF0YSIsInNpZ24iLCJlbmNyeXB0IiwibmV0d29yayIsImRlZiIsIlNUT1JFIiwic2VuZCIsInNkcCIsImtleVZhbHVlTGlzdCIsImNodW5rcyIsImNodW5rIiwiQnVmZmVyIiwiZnJvbSIsImluZGV4Iiwic2l6ZSIsImxlbmd0aCIsIlNUT1JFX0NIVU5LUyIsInRhcmdldElkIiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZWplY3QiLCJzdGF0ZSIsInRhcmdldEtleSIsIkZJTkROT0RFIiwiY2FsbGJhY2siLCJldmVudHMiLCJnZXRQZWVyRnJvbW5vZGVJZCIsInIiLCJzZXRUaW1lb3V0IiwicGVlcnMiLCJnZXRDbG9zZVBlZXJzIiwiZG9GaW5kdmFsdWUiLCJvd25lcklkIiwiRklORFZBTFVFIiwiYWRka25vZGUiLCJkYXRhIiwicmF3Iiwib25Db21tYW5kIiwiZGlzY29ubmVjdCIsImNsZWFuRGlzY29uIiwiZ2V0QWxsUGVlcklkcyIsImlzTm9kZUV4aXN0IiwibnVtIiwicHVzaCIsImZpbmROZXdQZWVyIiwiZ2V0S2J1Y2tldE51bSIsImNhdGNoIiwiaW54Iiwic3BsaWNlIiwic2hpZnQiLCJ0YXJnZXQiLCJwcm94eSIsInJlZiIsIldlYlJUQyIsIm1ha2VPZmZlciIsInRpbWVvdXQiLCJzaWduYWwiLCJfIiwiY29ubmVjdCIsImNsZWFyVGltZW91dCIsIm1ha2VBbnN3ZXIiLCJNYXRoIiwicmFuZG9tIiwicGFja2V0IiwidGV4dCIsImJpbiIsInNlcmlhbGl6ZSIsImZpbGUiLCJjbG9zZSIsInJlc3VsdCIsIm1lc3NhZ2UiLCJsYWJlbCIsImJ1ZmZlciIsIm5ldHdvcmtMYXllciIsImRlc2VyaWFsaXplIiwiZGF0YUxpc3QiLCJpbmNsdWRlcyIsIm9uUmVxdWVzdCIsImVycm9yIiwicmVzcG9uc2UiLCJ0eXBlIiwibWFpbnRhaW4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBRUE7O0FBQ0E7O0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQVRBQSxPQUFPLENBQUMsZ0JBQUQsQ0FBUDs7QUFXQSxJQUFNQyxJQUFJLEdBQUcsSUFBSUMsVUFBSixFQUFiOztBQUNPLFNBQVNDLFdBQVQsQ0FBcUJDLEVBQXJCLEVBQThCQyxDQUE5QixFQUF1QztBQUM1Q0MsRUFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVksYUFBWixFQUEyQkgsRUFBM0I7QUFDQUksRUFBQUEsTUFBTSxDQUFDQyxJQUFQLENBQVlMLEVBQVosRUFBZ0JNLE9BQWhCLENBQXdCLFVBQUFDLEdBQUcsRUFBSTtBQUM3QlAsSUFBQUEsRUFBRSxDQUFDTyxHQUFELENBQUYsQ0FBUU4sQ0FBUjtBQUNELEdBRkQ7QUFHRDs7SUFFb0JPLFE7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QUFQLEVBQWM7QUFDZC9ILGNBQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZOEgsS0FBWjtBQUNEO0FBQ0Y7QUFDRDs7QUFDRixhQUFLLEtBQUw7QUFDRTtBQUNFLGdCQUFNTixPQUFjLEdBQUc3RCxNQUFNLENBQUNDLElBQVAsQ0FBWTBELE9BQU8sQ0FBQ25DLElBQXBCLENBQXZCOztBQUNBLGdCQUFNNEIsTUFBa0IsR0FBR3JILElBQUksQ0FBQ2dJLFdBQUwsQ0FBaUJGLE9BQWpCLENBQTNCO0FBQ0E1SCxZQUFBQSxXQUFXLENBQUMsS0FBSzZFLE1BQUwsQ0FBWWxELEdBQWIsRUFBa0J3RixNQUFsQixDQUFYO0FBQ0Q7QUFDRDtBQXRCSjtBQXdCRDs7OzhCQUVpQjVELE8sRUFBYztBQUM5QixXQUFLWCxTQUFMLENBQWV1RixRQUFmLENBQXdCNUUsT0FBTyxDQUFDNkUsSUFBaEMsRUFBc0M3RSxPQUF0QztBQUNBLFdBQUs4RSxRQUFMLENBQWM5RSxPQUFkO0FBQ0QiLCJzb3VyY2VzQ29udGVudCI6WyJyZXF1aXJlKFwiYmFiZWwtcG9seWZpbGxcIik7XG5pbXBvcnQgV2ViUlRDIGZyb20gXCJ3ZWJydGM0bWVcIjtcbmltcG9ydCBIZWxwZXIgZnJvbSBcIi4va1V0aWxcIjtcbmltcG9ydCBLUmVzcG9uZGVyIGZyb20gXCIuL2tSZXNwb25kZXJcIjtcbmltcG9ydCBkZWYsIHsgbmV0d29ya0Zvcm1hdCB9IGZyb20gXCIuL0tDb25zdFwiO1xuaW1wb3J0IHsgZGlzdGFuY2UgfSBmcm9tIFwia2FkLWRpc3RhbmNlXCI7XG5pbXBvcnQgeyBtZXNzYWdlIH0gZnJvbSBcIndlYnJ0YzRtZS9saWIvaW50ZXJmYWNlXCI7XG5pbXBvcnQgeyBCU09OIH0gZnJvbSBcImJzb25cIjtcbmltcG9ydCBDeXBoZXIgZnJvbSBcIi4uL2xpYi9jeXBoZXJcIjtcbmltcG9ydCBzaGExIGZyb20gXCJzaGExXCI7XG5cbmNvbnN0IGJzb24gPSBuZXcgQlNPTigpO1xuZXhwb3J0IGZ1bmN0aW9uIGV4Y3V0ZUV2ZW50KGV2OiBhbnksIHY/OiBhbnkpIHtcbiAgY29uc29sZS5sb2coXCJleGN1dGVFdmVudFwiLCBldik7XG4gIE9iamVjdC5rZXlzKGV2KS5mb3JFYWNoKGtleSA9PiB7XG4gICAgZXZba2V5XSh2KTtcbiAgfSk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEthZGVtbGlhIHtcbiAgbm9kZUlkOiBzdHJpbmc7XG4gIGs6IG51bWJlcjtcbiAga2J1Y2tldHM6IEFycmF5PEFycmF5PFdlYlJUQz4+O1xuICBmOiBIZWxwZXI7XG4gIHJlc3BvbmRlcjogS1Jlc3BvbmRlcjtcbiAgZGF0YUxpc3Q6IEFycmF5PGFueT4gPSBbXTtcbiAga2V5VmFsdWVMaXN0OiB7IFtrZXk6IHN0cmluZ106IGFueSB9ID0ge307XG4gIHJlZjogeyBba2V5OiBzdHJpbmddOiBXZWJSVEMgfSA9IHt9O1xuICBidWZmZXI6IHsgW2tleTogc3RyaW5nXTogQXJyYXk8YW55PiB9ID0ge307XG4gIHN0YXRlID0ge1xuICAgIGlzRmlyc3RDb25uZWN0OiB0cnVlLFxuICAgIGlzT2ZmZXI6IGZhbHNlLFxuICAgIGZpbmROb2RlOiBcIlwiLFxuICAgIGhhc2g6IHt9XG4gIH07XG5cbiAgY2FsbGJhY2sgPSB7XG4gICAgb25Db25uZWN0OiAoKSA9PiB7fSxcbiAgICBvbkFkZFBlZXI6ICh2PzogYW55KSA9PiB7fSxcbiAgICBvblBlZXJEaXNjb25uZWN0OiAodj86IGFueSkgPT4ge30sXG4gICAgX29uRmluZFZhbHVlOiAodj86IGFueSkgPT4ge30sXG4gICAgX29uRmluZE5vZGU6ICh2PzogYW55KSA9PiB7fSxcbiAgICBvbkFwcDogKHY/OiBhbnkpID0+IHt9XG4gIH07XG5cbiAgb25TdG9yZTogeyBba2V5OiBzdHJpbmddOiAodjogYW55KSA9PiB2b2lkIH0gPSB7fTtcbiAgb25GaW5kVmFsdWU6IHsgW2tleTogc3RyaW5nXTogKHY6IGFueSkgPT4gdm9pZCB9ID0ge307XG4gIG9uRmluZE5vZGU6IHsgW2tleTogc3RyaW5nXTogKHY6IGFueSkgPT4gdm9pZCB9ID0ge307XG4gIG9uUDJQOiB7IFtrZXk6IHN0cmluZ106IChub2RlSWQ6IHN0cmluZywgZGF0YTogc3RyaW5nKSA9PiB2b2lkIH0gPSB7fTtcbiAgZXZlbnRzID0ge1xuICAgIHN0b3JlOiB0aGlzLm9uU3RvcmUsXG4gICAgZmluZHZhbHVlOiB0aGlzLm9uRmluZFZhbHVlLFxuICAgIGZpbmRub2RlOiB0aGlzLm9uRmluZE5vZGUsXG4gICAgcDJwOiB0aGlzLm9uUDJQXG4gIH07XG4gIGN5cGhlcjogQ3lwaGVyO1xuXG4gIGNvbnN0cnVjdG9yKG9wdD86IHsgcHVia2V5Pzogc3RyaW5nOyBzZWNLZXk/OiBzdHJpbmc7IGtMZW5ndGg/OiBudW1iZXIgfSkge1xuICAgIHRoaXMuayA9IDIwO1xuICAgIGlmIChvcHQgJiYgb3B0LmtMZW5ndGgpIHRoaXMuayA9IG9wdC5rTGVuZ3RoO1xuICAgIGlmIChvcHQpIHRoaXMuY3lwaGVyID0gbmV3IEN5cGhlcihvcHQuc2VjS2V5LCBvcHQucHVia2V5KTtcbiAgICBlbHNlIHRoaXMuY3lwaGVyID0gbmV3IEN5cGhlcigpO1xuICAgIHRoaXMubm9kZUlkID0gc2hhMSh0aGlzLmN5cGhlci5wdWJLZXkpLnRvU3RyaW5nKCk7XG5cbiAgICB0aGlzLmtidWNrZXRzID0gbmV3IEFycmF5KDE2MCk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCAxNjA7IGkrKykge1xuICAgICAgbGV0IGtidWNrZXQ6IEFycmF5PGFueT4gPSBbXTtcbiAgICAgIHRoaXMua2J1Y2tldHNbaV0gPSBrYnVja2V0O1xuICAgIH1cblxuICAgIHRoaXMuZiA9IG5ldyBIZWxwZXIodGhpcy5rLCB0aGlzLmtidWNrZXRzLCB0aGlzLm5vZGVJZCk7XG4gICAgdGhpcy5yZXNwb25kZXIgPSBuZXcgS1Jlc3BvbmRlcih0aGlzKTtcbiAgfVxuXG4gIHN0b3JlKHNlbmRlcjogc3RyaW5nLCBrZXk6IHN0cmluZywgdmFsdWU6IGFueSwgb3B0PzogeyBleGNsdWRlSWQ/OiBzdHJpbmcgfSkge1xuICAgIGNvbnN0IHBlZXIgPSB0aGlzLmYuZ2V0Q2xvc2VFc3RQZWVyKGtleSwgb3B0KTtcbiAgICBpZiAoIXBlZXIpIHJldHVybjtcbiAgICBjb25zdCBoYXNoID0gc2hhMShKU09OLnN0cmluZ2lmeSh2YWx1ZSkpLnRvU3RyaW5nKCk7XG4gICAgY29uc3Qgc2VuZERhdGE6IFN0b3JlRm9ybWF0ID0ge1xuICAgICAgc2VuZGVyLFxuICAgICAga2V5LFxuICAgICAgdmFsdWUsXG4gICAgICBwdWJLZXk6IHRoaXMuY3lwaGVyLnB1YktleSxcbiAgICAgIGhhc2gsXG4gICAgICBzaWduOiB0aGlzLmN5cGhlci5lbmNyeXB0KGhhc2gpXG4gICAgfTtcbiAgICBjb25zdCBuZXR3b3JrID0gbmV0d29ya0Zvcm1hdCh0aGlzLm5vZGVJZCwgZGVmLlNUT1JFLCBzZW5kRGF0YSk7XG5cbiAgICBjb25zb2xlLmxvZyhkZWYuU1RPUkUsIFwibmV4dFwiLCBwZWVyLm5vZGVJZCwgXCJ0YXJnZXRcIiwga2V5KTtcbiAgICBwZWVyLnNlbmQobmV0d29yaywgXCJrYWRcIik7XG4gICAgLy9ubyBzZHBcbiAgICBpZiAoIXZhbHVlLnNkcCkgdGhpcy5rZXlWYWx1ZUxpc3Rba2V5XSA9IHZhbHVlO1xuICB9XG5cbiAgc3RvcmVDaHVua3MoXG4gICAgc2VuZGVyOiBzdHJpbmcsXG4gICAga2V5OiBzdHJpbmcsXG4gICAgY2h1bmtzOiBBcnJheUJ1ZmZlcltdLFxuICAgIG9wdD86IHsgZXhjbHVkZUlkPzogc3RyaW5nIH1cbiAgKSB7XG4gICAgLy8gY29uc3QgcGVlcnMgPSB0aGlzLmYuZ2V0Q2xvc2VQZWVycyhrZXksIG9wdCk7XG4gICAgY29uc3QgcGVlciA9IHRoaXMuZi5nZXRDbG9zZUVzdFBlZXIoa2V5LCBvcHQpO1xuICAgIGlmICghcGVlcikgcmV0dXJuO1xuICAgIGNvbnNvbGUubG9nKFwic3RvcmUgY2h1bmtzXCIsIHsgY2h1bmtzIH0pO1xuICAgIGNodW5rcy5mb3JFYWNoKChjaHVuaywgaSkgPT4ge1xuICAgICAgY29uc3QgaGFzaCA9IHNoYTEoQnVmZmVyLmZyb20oY2h1bmspKS50b1N0cmluZygpO1xuICAgICAgY29uc3Qgc2VuZERhdGE6IFN0b3JlQ2h1bmtzID0ge1xuICAgICAgICBzZW5kZXI6IHRoaXMubm9kZUlkLFxuICAgICAgICBrZXksXG4gICAgICAgIHZhbHVlOiBCdWZmZXIuZnJvbShjaHVuayksXG4gICAgICAgIGluZGV4OiBpLFxuICAgICAgICBwdWJLZXk6IHRoaXMuY3lwaGVyLnB1YktleSxcbiAgICAgICAgaGFzaCxcbiAgICAgICAgc2lnbjogdGhpcy5jeXBoZXIuZW5jcnlwdChoYXNoKSxcbiAgICAgICAgc2l6ZTogY2h1bmtzLmxlbmd0aFxuICAgICAgfTtcbiAgICAgIGNvbnN0IG5ldHdvcmsgPSBuZXR3b3JrRm9ybWF0KHNlbmRlciwgZGVmLlNUT1JFX0NIVU5LUywgc2VuZERhdGEpO1xuXG4gICAgICBjb25zb2xlLmxvZyhkZWYuU1RPUkUsIFwibmV4dFwiLCBwZWVyLm5vZGVJZCwgXCJ0YXJnZXRcIiwga2V5KTtcbiAgICAgIHBlZXIuc2VuZChuZXR3b3JrLCBcImthZFwiKTtcbiAgICB9KTtcbiAgICAvL+ODrOODl+ODquOCseODvOOCt+ODp+ODs1xuICAgIHRoaXMua2V5VmFsdWVMaXN0W2tleV0gPSB7IGNodW5rcyB9O1xuICB9XG5cbiAgZmluZE5vZGUodGFyZ2V0SWQ6IHN0cmluZywgcGVlcjogV2ViUlRDKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlPFdlYlJUQz4oYXN5bmMgKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY29uc29sZS5sb2coXCJmaW5kbm9kZVwiLCB0YXJnZXRJZCk7XG4gICAgICB0aGlzLnN0YXRlLmZpbmROb2RlID0gdGFyZ2V0SWQ7XG4gICAgICBjb25zdCBzZW5kRGF0YSA9IHsgdGFyZ2V0S2V5OiB0YXJnZXRJZCB9O1xuICAgICAgLy/pgIHjgotcbiAgICAgIHBlZXIuc2VuZChuZXR3b3JrRm9ybWF0KHRoaXMubm9kZUlkLCBkZWYuRklORE5PREUsIHNlbmREYXRhKSwgXCJrYWRcIik7XG5cbiAgICAgIHRoaXMuY2FsbGJhY2suX29uRmluZE5vZGUoKG5vZGVJZDogc3RyaW5nKSA9PiB7XG4gICAgICAgIGV4Y3V0ZUV2ZW50KHRoaXMuZXZlbnRzLmZpbmRub2RlLCBub2RlSWQpO1xuICAgICAgICByZXNvbHZlKHRoaXMuZi5nZXRQZWVyRnJvbW5vZGVJZChub2RlSWQpKTtcbiAgICAgIH0pO1xuXG4gICAgICBhd2FpdCBuZXcgUHJvbWlzZShyID0+IHNldFRpbWVvdXQociwgMTAgKiAxMDAwKSk7XG4gICAgICByZWplY3QoXCJ0aW1lb3V0IGZpbmRub2RlXCIpO1xuICAgIH0pO1xuICB9XG5cbiAgZmluZFZhbHVlKGtleTogc3RyaW5nLCBvcHQ/OiB7IG93bmVySWQ/OiBzdHJpbmcgfSkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZTxhbnk+KGFzeW5jIChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIHRoaXMuY2FsbGJhY2suX29uRmluZFZhbHVlID0gdmFsdWUgPT4ge1xuICAgICAgICBleGN1dGVFdmVudCh0aGlzLmV2ZW50cy5maW5kdmFsdWUsIHZhbHVlKTtcbiAgICAgICAgcmVzb2x2ZSh2YWx1ZSk7XG4gICAgICB9O1xuICAgICAgLy9rZXnjgavov5HjgYTjg5TjgqLjgpLlj5blvpdcbiAgICAgIGNvbnN0IHBlZXJzID0gdGhpcy5mLmdldENsb3NlUGVlcnMoa2V5KTtcbiAgICAgIHBlZXJzLmZvckVhY2gocGVlciA9PiB7XG4gICAgICAgIHRoaXMuZG9GaW5kdmFsdWUoa2V5LCBwZWVyKTtcbiAgICAgIH0pO1xuXG4gICAgICBhd2FpdCBuZXcgUHJvbWlzZShyID0+IHNldFRpbWVvdXQociwgNTAwMCkpO1xuICAgICAgaWYgKG9wdCAmJiBvcHQub3duZXJJZCkge1xuICAgICAgICBjb25zdCBvd25lcklkID0gb3B0Lm93bmVySWQ7XG4gICAgICAgIGNvbnN0IHBlZXJzID0gdGhpcy5mLmdldENsb3NlUGVlcnMob3duZXJJZCk7XG4gICAgICAgIHBlZXJzLmZvckVhY2gocGVlciA9PiB7XG4gICAgICAgICAgdGhpcy5kb0ZpbmR2YWx1ZShvd25lcklkLCBwZWVyKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGF3YWl0IG5ldyBQcm9taXNlKHIgPT4gc2V0VGltZW91dChyLCA1MDAwKSk7XG4gICAgICB9XG4gICAgICByZWplY3QoXCJmaW5kdmFsdWUgdGltZW91dFwiKTtcbiAgICB9KTtcbiAgfVxuXG4gIGFzeW5jIGRvRmluZHZhbHVlKGtleTogc3RyaW5nLCBwZWVyOiBXZWJSVEMpIHtcbiAgICBjb25zb2xlLmxvZyhcImRvZmluZHZhbHVlXCIsIHBlZXIubm9kZUlkKTtcbiAgICBjb25zdCBzZW5kRGF0YTogRmluZFZhbHVlID0geyB0YXJnZXRLZXk6IGtleSB9O1xuICAgIHBlZXIuc2VuZChuZXR3b3JrRm9ybWF0KHRoaXMubm9kZUlkLCBkZWYuRklORFZBTFVFLCBzZW5kRGF0YSksIFwia2FkXCIpO1xuICB9XG5cbiAgY29ubmVjdChwZWVyOiBXZWJSVEMpIHtcbiAgICBjb25zb2xlLmxvZyhcImthZCBjb25uZWN0XCIpO1xuICAgIGlmICh0aGlzLnN0YXRlLmlzRmlyc3RDb25uZWN0KSB0aGlzLmNhbGxiYWNrLm9uQ29ubmVjdCgpO1xuICAgIHRoaXMuc3RhdGUuaXNGaXJzdENvbm5lY3QgPSBmYWxzZTtcbiAgICB0aGlzLmFkZGtub2RlKHBlZXIpO1xuICB9XG5cbiAgYWRka25vZGUocGVlcjogV2ViUlRDKSB7XG4gICAgcGVlci5ldmVudHMuZGF0YVtcImthZGVtbGlhLnRzXCJdID0gcmF3ID0+IHtcbiAgICAgIHRoaXMub25Db21tYW5kKHJhdyk7XG4gICAgfTtcblxuICAgIHBlZXIuZGlzY29ubmVjdCA9ICgpID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKFwia2FkIG5vZGUgZGlzY29ubmVjdGVkXCIpO1xuICAgICAgdGhpcy5mLmNsZWFuRGlzY29uKCk7XG4gICAgICB0aGlzLmNhbGxiYWNrLm9uQWRkUGVlcih0aGlzLmYuZ2V0QWxsUGVlcklkcygpKTtcbiAgICB9O1xuXG4gICAgaWYgKCF0aGlzLmYuaXNOb2RlRXhpc3QocGVlci5ub2RlSWQpKSB7XG4gICAgICAvL+iHquWIhuOBruODjuODvOODiUlE44Go6L+95Yqg44GZ44KL44OO44O844OJSUTjga7ot53pm6JcbiAgICAgIGNvbnN0IG51bSA9IGRpc3RhbmNlKHRoaXMubm9kZUlkLCBwZWVyLm5vZGVJZCk7XG4gICAgICAvL2tidWNrZXRz44Gu6Kmy5b2T44GZ44KL6Led6Zui44Gua2J1Y2tldOOCkuWRvOOBs+WHuuOBmVxuICAgICAgY29uc3Qga2J1Y2tldCA9IHRoaXMua2J1Y2tldHNbbnVtXTtcbiAgICAgIC8v6Kmy5b2T44GZ44KLa2J1Y2tldOOBq+aWsOOBl+OBhOODlOOCouOCkuWKoOOBiOOCi1xuICAgICAga2J1Y2tldC5wdXNoKHBlZXIpO1xuXG4gICAgICBjb25zb2xlLmxvZyhcImFkZGtub2RlIGtidWNrZXRzXCIsIFwicGVlci5ub2RlSWQ6XCIsIHBlZXIubm9kZUlkKTtcbiAgICAgIGNvbnNvbGUubG9nKHRoaXMuZi5nZXRBbGxQZWVySWRzKCkpO1xuXG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgdGhpcy5maW5kTmV3UGVlcihwZWVyKTtcbiAgICAgIH0sIDEwMDApO1xuXG4gICAgICB0aGlzLmNhbGxiYWNrLm9uQWRkUGVlcih0aGlzLmYuZ2V0QWxsUGVlcklkcygpKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIGZpbmROZXdQZWVyKHBlZXI6IFdlYlJUQykge1xuICAgIGlmICh0aGlzLmYuZ2V0S2J1Y2tldE51bSgpIDwgdGhpcy5rKSB7XG4gICAgICAvL+iHqui6q+OBruODjuODvOODiUlE44KSa2V544Go44GX44GmRklORF9OT0RFXG4gICAgICBhd2FpdCB0aGlzLmZpbmROb2RlKHRoaXMubm9kZUlkLCBwZWVyKS5jYXRjaChjb25zb2xlLmxvZyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUubG9nKFwia2J1Y2tldCByZWFkeVwiLCB0aGlzLmYuZ2V0S2J1Y2tldE51bSgpKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIG1haW50YWluKG5ldHdvcms6IGFueSkge1xuICAgIGNvbnN0IGlueCA9IGRpc3RhbmNlKHRoaXMubm9kZUlkLCBuZXR3b3JrLm5vZGVJZCk7XG4gICAgY29uc3Qga2J1Y2tldCA9IHRoaXMua2J1Y2tldHNbaW54XTtcblxuICAgIC8v6YCB5L+h5YWD44GM6Kmy5b2T44GZ44KLay1idWNrZXTjga7kuK3jgavjgYLjgaPjgZ/loLTlkIhcbiAgICAvL+OBneOBruODjuODvOODieOCkmstYnVja2V044Gu5pyr5bC+44Gr56e744GZXG4gICAga2J1Y2tldC5mb3JFYWNoKChwZWVyLCBpKSA9PiB7XG4gICAgICBpZiAocGVlci5ub2RlSWQgPT09IG5ldHdvcmsubm9kZUlkKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwibWFpbnRhaW5cIiwgXCJNb3Zlc8KgaXTCoHRvwqB0aGXCoHRhaWzCoG9mwqB0aGXCoGxpc3RcIik7XG4gICAgICAgIGtidWNrZXQuc3BsaWNlKGksIDEpO1xuICAgICAgICBrYnVja2V0LnB1c2gocGVlcik7XG4gICAgICAgIHJldHVybiAwO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy9rLWJ1Y2tldOOBjOOBmeOBp+OBq+a6gOadr+OBquWgtOWQiOOAgVxuICAgIC8v44Gd44Guay1idWNrZXTkuK3jga7lhYjpoK3jga7jg47jg7zjg4njgYzjgqrjg7Pjg6njgqTjg7PjgarjgonlhYjpoK3jga7jg47jg7zjg4njgpLmrovjgZlcbiAgICBpZiAoa2J1Y2tldC5sZW5ndGggPiB0aGlzLmspIHtcbiAgICAgIGtidWNrZXQuc2hpZnQoKTtcbiAgICB9XG4gIH1cblxuICBvZmZlcih0YXJnZXQ6IHN0cmluZywgcHJveHkgPSBudWxsKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlPGFueT4oYXN5bmMgKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY29uc3QgciA9IHRoaXMucmVmO1xuICAgICAgY29uc3QgcGVlciA9IChyW3RhcmdldF0gPSBuZXcgV2ViUlRDKCkpO1xuICAgICAgcGVlci5tYWtlT2ZmZXIoKTtcblxuICAgICAgY29uc3QgdGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICByZWplY3QoXCJrYWQgb2ZmZXIgdGltZW91dFwiKTtcbiAgICAgIH0sIDUgKiAxMDAwKTtcblxuICAgICAgcGVlci5zaWduYWwgPSBzZHAgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZyhcImthZCBvZmZlciBzdG9yZVwiLCB0YXJnZXQpO1xuICAgICAgICBjb25zdCBfID0gdGhpcy5mLmdldENsb3NlRXN0UGVlcih0YXJnZXQpO1xuICAgICAgICBpZiAoIV8pIHJldHVybjtcbiAgICAgICAgaWYgKF8ubm9kZUlkICE9PSB0YXJnZXQpXG4gICAgICAgICAgdGhpcy5zdG9yZSh0aGlzLm5vZGVJZCwgdGFyZ2V0LCB7IHNkcCwgcHJveHkgfSk7XG4gICAgICB9O1xuXG4gICAgICBwZWVyLmNvbm5lY3QgPSAoKSA9PiB7XG4gICAgICAgIHBlZXIubm9kZUlkID0gdGFyZ2V0O1xuICAgICAgICBjb25zb2xlLmxvZyhcImthZCBvZmZlciBjb25uZWN0ZWRcIiwgdGFyZ2V0KTtcbiAgICAgICAgdGhpcy5hZGRrbm9kZShwZWVyKTtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xuICAgICAgICByZXNvbHZlKHRydWUpO1xuICAgICAgfTtcbiAgICB9KTtcbiAgfVxuXG4gIGFuc3dlcih0YXJnZXQ6IHN0cmluZywgc2RwOiBzdHJpbmcsIHByb3h5OiBzdHJpbmcpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2U8YW55Pihhc3luYyAocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjb25zdCByID0gdGhpcy5yZWY7XG4gICAgICBjb25zdCBwZWVyID0gKHJbdGFyZ2V0XSA9IG5ldyBXZWJSVEMoKSk7XG4gICAgICBwZWVyLm1ha2VBbnN3ZXIoc2RwKTtcbiAgICAgIGNvbnNvbGUubG9nKFwia2FkIGFuc3dlclwiLCB0YXJnZXQpO1xuXG4gICAgICBjb25zdCB0aW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHJlamVjdChcImthZCBhbnN3ZXIgdGltZW91dFwiKTtcbiAgICAgIH0sIDUgKiAxMDAwKTtcblxuICAgICAgcGVlci5zaWduYWwgPSBzZHAgPT4ge1xuICAgICAgICBjb25zdCBfID0gdGhpcy5mLmdldFBlZXJGcm9tbm9kZUlkKHByb3h5KTtcbiAgICAgICAgY29uc3QgaGFzaCA9IHNoYTEoTWF0aC5yYW5kb20oKS50b1N0cmluZygpKS50b1N0cmluZygpO1xuICAgICAgICBjb25zdCBzZW5kRGF0YTogU3RvcmVGb3JtYXQgPSB7XG4gICAgICAgICAgc2VuZGVyOiB0aGlzLm5vZGVJZCxcbiAgICAgICAgICBrZXk6IHRhcmdldCxcbiAgICAgICAgICB2YWx1ZTogeyBzZHAgfSxcbiAgICAgICAgICBwdWJLZXk6IHRoaXMuY3lwaGVyLnB1YktleSxcbiAgICAgICAgICBoYXNoLFxuICAgICAgICAgIHNpZ246IHRoaXMuY3lwaGVyLmVuY3J5cHQoaGFzaClcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKF8pIF8uc2VuZChuZXR3b3JrRm9ybWF0KHRoaXMubm9kZUlkLCBkZWYuU1RPUkUsIHNlbmREYXRhKSwgXCJrYWRcIik7XG4gICAgICB9O1xuXG4gICAgICBwZWVyLmNvbm5lY3QgPSAoKSA9PiB7XG4gICAgICAgIHBlZXIubm9kZUlkID0gdGFyZ2V0O1xuICAgICAgICBjb25zb2xlLmxvZyhcImthZCBhbnN3ZXIgY29ubmVjdGVkXCIsIHRhcmdldCk7XG4gICAgICAgIHRoaXMuYWRka25vZGUocGVlcik7XG4gICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KTtcbiAgICAgICAgcmVzb2x2ZSh0cnVlKTtcbiAgICAgIH07XG4gICAgfSk7XG4gIH1cblxuICBzZW5kKHRhcmdldDogc3RyaW5nLCBkYXRhOiB7IHRleHQ/OiBzdHJpbmc7IGZpbGU/OiBbXSB9KSB7XG4gICAgY29uc3Qgc2VuZCA9IChwZWVyOiBXZWJSVEMpID0+IHtcbiAgICAgIGNvbnN0IGJzb24gPSBuZXcgQlNPTigpO1xuICAgICAgY29uc3QgcGFja2V0OiBwMnBNZXNzYWdlID0ge1xuICAgICAgICBzZW5kZXI6IHRoaXMubm9kZUlkLFxuICAgICAgICB0YXJnZXRcbiAgICAgIH07XG4gICAgICBpZiAoZGF0YS50ZXh0KSB7XG4gICAgICAgIHBhY2tldC50ZXh0ID0gZGF0YS50ZXh0O1xuICAgICAgICBjb25zdCBiaW4gPSBic29uLnNlcmlhbGl6ZShwYWNrZXQpO1xuICAgICAgICBwZWVyLnNlbmQoYmluLCBcInAycFwiKTtcbiAgICAgIH0gZWxzZSBpZiAoZGF0YS5maWxlKSB7XG4gICAgICAgIGNvbnN0IGZpbGUgPSBkYXRhLmZpbGU7XG4gICAgICAgIGZpbGUuZm9yRWFjaCgoY2h1bmssIGkpID0+IHtcbiAgICAgICAgICBwYWNrZXQuZmlsZSA9IHsgaW5kZXg6IGksIGxlbmd0aDogZmlsZS5sZW5ndGgsIGNodW5rIH07XG4gICAgICAgICAgY29uc3QgYmluID0gYnNvbi5zZXJpYWxpemUocGFja2V0KTtcbiAgICAgICAgICBwZWVyLnNlbmQoYmluLCBcInAycFwiKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiBuZXcgUHJvbWlzZTxhbnk+KGFzeW5jIChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGNvbnN0IHBlZXIgPSB0aGlzLmYuZ2V0UGVlckZyb21ub2RlSWQodGFyZ2V0KTtcbiAgICAgIGlmIChwZWVyKSB7XG4gICAgICAgIHNlbmQocGVlcik7XG4gICAgICAgIHJlc29sdmUodHJ1ZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBjbG9zZSA9IHRoaXMuZi5nZXRDbG9zZUVzdFBlZXIodGFyZ2V0KTtcbiAgICAgICAgaWYgKCFjbG9zZSkgcmV0dXJuO1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0aGlzLmZpbmROb2RlKHRhcmdldCwgY2xvc2UpLmNhdGNoKGNvbnNvbGUubG9nKTtcbiAgICAgICAgaWYgKCFyZXN1bHQpIHJldHVybjtcbiAgICAgICAgc2VuZChyZXN1bHQpO1xuICAgICAgICByZXNvbHZlKHRydWUpO1xuICAgICAgfVxuICAgICAgYXdhaXQgbmV3IFByb21pc2UociA9PiBzZXRUaW1lb3V0KHIsIDEwICogMTAwMCkpO1xuICAgICAgcmVqZWN0KFwic2VuZCB0aW1lb3V0XCIpO1xuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBvbkNvbW1hbmQobWVzc2FnZTogbWVzc2FnZSkge1xuICAgIHN3aXRjaCAobWVzc2FnZS5sYWJlbCkge1xuICAgICAgY2FzZSBcImthZFwiOlxuICAgICAgICB7XG4gICAgICAgICAgY29uc3QgYnVmZmVyOiBCdWZmZXIgPSBCdWZmZXIuZnJvbShtZXNzYWdlLmRhdGEpO1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBuZXR3b3JrTGF5ZXI6IG5ldHdvcmsgPSBic29uLmRlc2VyaWFsaXplKGJ1ZmZlcik7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIm9uY29tbWFuZCBrYWRcIiwgeyBtZXNzYWdlIH0sIHsgbmV0d29ya0xheWVyIH0pO1xuICAgICAgICAgICAgaWYgKCFKU09OLnN0cmluZ2lmeSh0aGlzLmRhdGFMaXN0KS5pbmNsdWRlcyhuZXR3b3JrTGF5ZXIuaGFzaCkpIHtcbiAgICAgICAgICAgICAgdGhpcy5kYXRhTGlzdC5wdXNoKG5ldHdvcmtMYXllci5oYXNoKTtcbiAgICAgICAgICAgICAgdGhpcy5vblJlcXVlc3QobmV0d29ya0xheWVyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3IpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgXCJwMnBcIjpcbiAgICAgICAge1xuICAgICAgICAgIGNvbnN0IGJ1ZmZlcjogQnVmZmVyID0gQnVmZmVyLmZyb20obWVzc2FnZS5kYXRhKTtcbiAgICAgICAgICBjb25zdCBwYWNrZXQ6IHAycE1lc3NhZ2UgPSBic29uLmRlc2VyaWFsaXplKGJ1ZmZlcik7XG4gICAgICAgICAgZXhjdXRlRXZlbnQodGhpcy5ldmVudHMucDJwLCBwYWNrZXQpO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgb25SZXF1ZXN0KG5ldHdvcms6IGFueSkge1xuICAgIHRoaXMucmVzcG9uZGVyLnJlc3BvbnNlKG5ldHdvcmsudHlwZSwgbmV0d29yayk7XG4gICAgdGhpcy5tYWludGFpbihuZXR3b3JrKTtcbiAgfVxufVxuIl19
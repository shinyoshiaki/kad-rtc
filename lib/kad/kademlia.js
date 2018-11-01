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

    _defineProperty(this, "p2pMsgBuffer", {});

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

          _file.value.forEach(function (chunk, i) {
            packet.file = {
              index: i,
              length: _file.value.length,
              chunk: Buffer.from(chunk),
              filename: _file.name
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

            if (packet.text) {
              var payload = {
                nodeId: packet.sender,
                text: packet.text
              };
              excuteEvent(this.events.p2p, payload);
            } else if (packet.file) {
              if (packet.file.index === 0) this.p2pMsgBuffer[packet.sender] = [];
              this.p2pMsgBuffer[packet.sender].push(packet.file.chunk.buffer);

              if (packet.file.index === packet.file.length - 1) {
                var _payload = {
                  nodeId: packet.sender,
                  file: this.p2pMsgBuffer[packet.sender],
                  filename: packet.file.filename
                };
                excuteEvent(this.events.p2p, _payload);
              }
            }
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9rYWQva2FkZW1saWEudHMiXSwibmFtZXMiOlsicmVxdWlyZSIsImJzb24iLCJCU09OIiwiZXhjdXRlRXZlbnQiLCJldiIsInYiLCJjb25zb2xlIiwibG9nIiwiT2JqZWN0Iiwia2V5cyIsImZvckVhY2giLCJrZXkiLCJLYWRlbWxpYSIsIm9wdCIsImlzRmlyc3RDb25uZWN0IiwiaXNPZmZlciIsImZpbmROb2RlIiwiaGFzaCIsIm9uQ29ubmVjdCIsIm9uQWRkUGVlciIsIm9uUGVlckRpc2Nvbm5lY3QiLCJfb25GaW5kVmFsdWUiLCJfb25GaW5kTm9kZSIsIm9uQXBwIiwic3RvcmUiLCJvblN0b3JlIiwiZmluZHZhbHVlIiwib25GaW5kVmFsdWUiLCJmaW5kbm9kZSIsIm9uRmluZE5vZGUiLCJwMnAiLCJvblAyUCIsImsiLCJrTGVuZ3RoIiwiY3lwaGVyIiwiQ3lwaGVyIiwic2VjS2V5IiwicHVia2V5Iiwibm9kZUlkIiwicHViS2V5IiwidG9TdHJpbmciLCJrYnVja2V0cyIsIkFycmF5IiwiaSIsImtidWNrZXQiLCJmIiwiSGVscGVyIiwicmVzcG9uZGVyIiwiS1Jlc3BvbmRlciIsInNlbmRlciIsInZhbHVlIiwicGVlciIsImdldENsb3NlRXN0UGVlciIsIkpTT04iLCJzdHJpbmdpZnkiLCJzZW5kRGF0YSIsInNpZ24iLCJlbmNyeXB0IiwibmV0d29yayIsImRlZiIsIlNUT1JFIiwic2VuZCIsInNkcCIsImtleVZhbHVlTGlzdCIsImNodW5rcyIsImNodW5rIiwiQnVmZmVyIiwiZnJvbSIsImluZGV4Iiwic2l6ZSIsImxlbmd0aCIsIlNUT1JFX0NIVU5LUyIsInRhcmdldElkIiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZWplY3QiLCJzdGF0ZSIsInRhcmdldEtleSIsIkZJTkROT0RFIiwiY2FsbGJhY2siLCJldmVudHMiLCJnZXRQZWVyRnJvbW5vZGVJZCIsInIiLCJzZXRUaW1lb3V0IiwicGVlcnMiLCJnZXRDbG9zZVBlZXJzIiwiZG9GaW5kdmFsdWUiLCJvd25lcklkIiwiRklORFZBTFVFIiwiYWRka25vZGUiLCJkYXRhIiwicmF3Iiwib25Db21tYW5kIiwiZGlzY29ubmVjdCIsImNsZWFuRGlzY29uIiwiZ2V0QWxsUGVlcklkcyIsImlzTm9kZUV4aXN0IiwibnVtIiwicHVzaCIsImZpbmROZXdQZWVyIiwiZ2V0S2J1Y2tldE51bSIsImNhdGNoIiwiaW54Iiwic3BsaWNlIiwic2hpZnQiLCJ0YXJnZXQiLCJwcm94eSIsInJlZiIsIldlYlJUQyIsIm1ha2VPZmZlciIsInRpbWVvdXQiLCJzaWduYWwiLCJfIiwiY29ubmVjdCIsImNsZWFyVGltZW91dCIsIm1ha2VBbnN3ZXIiLCJNYXRoIiwicmFuZG9tIiwicGFja2V0IiwidGV4dCIsImJpbiIsInNlcmlhbGl6ZSIsImZpbGUiLCJmaWxlbmFtZSIsIm5hbWUiLCJjbG9zZSIsInJlc3VsdCIsIm1lc3NhZ2UiLCJsYWJlbCIsImJ1ZmZlciIsIm5ldHdvcmtMYXllciIsImRlc2VyaWFsaXplIiwiZGF0YUxpc3QiLCJpbmNsdWRlcyIsIm9uUmVxdWVzdCIsImVycm9yIiwicGF5bG9hZCIsInAycE1zZ0J1ZmZlciIsInJlc3BvbnNlIiwidHlwZSIsIm1haW50YWluIl0sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUVBOztBQUNBOztBQUNBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFUQUEsT0FBTyxDQUFDLGdCQUFELENBQVA7O0FBV0EsSUFBTUMsSUFBSSxHQUFHLElBQUlDLFVBQUosRUFBYjs7QUFDTyxTQUFTQyxXQUFULENBQXFCQyxFQUFyQixFQUE4QkMsQ0FBOUIsRUFBdUM7QUFDNUNDLEVBQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZLGFBQVosRUFBMkJILEVBQTNCO0FBQ0FJLEVBQUFBLE1BQU0sQ0FBQ0MsSUFBUCxDQUFZTCxFQUFaLEVBQWdCTSxPQUFoQixDQUF3QixVQUFBQyxHQUFHLEVBQUk7QUFDN0JQLElBQUFBLEVBQUUsQ0FBQ08sR0FB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QUFNLENBQUNJLElBQVAsQ0FBWXBELE1BQVosR0FBcUIsQ0FBL0MsRUFBa0Q7QUFDaEQsb0JBQU1rRSxRQUF3QixHQUFHO0FBQy9CbEcsa0JBQUFBLE1BQU0sRUFBRWdGLE1BQU0sQ0FBQ3JFLE1BRGdCO0FBRS9CeUUsa0JBQUFBLElBQUksRUFBRSxLQUFLZSxZQUFMLENBQWtCbkIsTUFBTSxDQUFDckUsTUFBekIsQ0FGeUI7QUFHL0IwRSxrQkFBQUEsUUFBUSxFQUFFTCxNQUFNLENBQUNJLElBQVAsQ0FBWUM7QUFIUyxpQkFBakM7QUFLQXhILGdCQUFBQSxXQUFXLENBQUMsS0FBSzZFLE1BQUwsQ0FBWWxELEdBQWIsRUFBa0IwRyxRQUFsQixDQUFYO0FBQ0Q7QUFDRjtBQUNGO0FBQ0Q7QUF2Q0o7QUF5Q0Q7Ozs4QkFFaUI5RSxPLEVBQWM7QUFDOUIsV0FBS1gsU0FBTCxDQUFlMkYsUUFBZixDQUF3QmhGLE9BQU8sQ0FBQ2lGLElBQWhDLEVBQXNDakYsT0FBdEM7QUFDQSxXQUFLa0YsUUFBTCxDQUFjbEYsT0FBZDtBQUNEIiwic291cmNlc0NvbnRlbnQiOlsicmVxdWlyZShcImJhYmVsLXBvbHlmaWxsXCIpO1xuaW1wb3J0IFdlYlJUQyBmcm9tIFwid2VicnRjNG1lXCI7XG5pbXBvcnQgSGVscGVyIGZyb20gXCIuL2tVdGlsXCI7XG5pbXBvcnQgS1Jlc3BvbmRlciBmcm9tIFwiLi9rUmVzcG9uZGVyXCI7XG5pbXBvcnQgZGVmLCB7IG5ldHdvcmtGb3JtYXQgfSBmcm9tIFwiLi9LQ29uc3RcIjtcbmltcG9ydCB7IGRpc3RhbmNlIH0gZnJvbSBcImthZC1kaXN0YW5jZVwiO1xuaW1wb3J0IHsgbWVzc2FnZSB9IGZyb20gXCJ3ZWJydGM0bWUvbGliL2ludGVyZmFjZVwiO1xuaW1wb3J0IHsgQlNPTiB9IGZyb20gXCJic29uXCI7XG5pbXBvcnQgQ3lwaGVyIGZyb20gXCIuLi9saWIvY3lwaGVyXCI7XG5pbXBvcnQgc2hhMSBmcm9tIFwic2hhMVwiO1xuXG5jb25zdCBic29uID0gbmV3IEJTT04oKTtcbmV4cG9ydCBmdW5jdGlvbiBleGN1dGVFdmVudChldjogYW55LCB2PzogYW55KSB7XG4gIGNvbnNvbGUubG9nKFwiZXhjdXRlRXZlbnRcIiwgZXYpO1xuICBPYmplY3Qua2V5cyhldikuZm9yRWFjaChrZXkgPT4ge1xuICAgIGV2W2tleV0odik7XG4gIH0pO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBLYWRlbWxpYSB7XG4gIG5vZGVJZDogc3RyaW5nO1xuICBrOiBudW1iZXI7XG4gIGtidWNrZXRzOiBBcnJheTxBcnJheTxXZWJSVEM+PjtcbiAgZjogSGVscGVyO1xuICByZXNwb25kZXI6IEtSZXNwb25kZXI7XG4gIGRhdGFMaXN0OiBBcnJheTxhbnk+ID0gW107XG4gIGtleVZhbHVlTGlzdDogeyBba2V5OiBzdHJpbmddOiBhbnkgfSA9IHt9O1xuICByZWY6IHsgW2tleTogc3RyaW5nXTogV2ViUlRDIH0gPSB7fTtcbiAgYnVmZmVyOiB7IFtrZXk6IHN0cmluZ106IEFycmF5PGFueT4gfSA9IHt9O1xuICBwMnBNc2dCdWZmZXI6IHsgW2tleTogc3RyaW5nXTogYW55W10gfSA9IHt9O1xuICBzdGF0ZSA9IHtcbiAgICBpc0ZpcnN0Q29ubmVjdDogdHJ1ZSxcbiAgICBpc09mZmVyOiBmYWxzZSxcbiAgICBmaW5kTm9kZTogXCJcIixcbiAgICBoYXNoOiB7fVxuICB9O1xuXG4gIGNhbGxiYWNrID0ge1xuICAgIG9uQ29ubmVjdDogKCkgPT4ge30sXG4gICAgb25BZGRQZWVyOiAodj86IGFueSkgPT4ge30sXG4gICAgb25QZWVyRGlzY29ubmVjdDogKHY/OiBhbnkpID0+IHt9LFxuICAgIF9vbkZpbmRWYWx1ZTogKHY/OiBhbnkpID0+IHt9LFxuICAgIF9vbkZpbmROb2RlOiAodj86IGFueSkgPT4ge30sXG4gICAgb25BcHA6ICh2PzogYW55KSA9PiB7fVxuICB9O1xuXG4gIG9uU3RvcmU6IHsgW2tleTogc3RyaW5nXTogKHY6IGFueSkgPT4gdm9pZCB9ID0ge307XG4gIG9uRmluZFZhbHVlOiB7IFtrZXk6IHN0cmluZ106ICh2OiBhbnkpID0+IHZvaWQgfSA9IHt9O1xuICBvbkZpbmROb2RlOiB7IFtrZXk6IHN0cmluZ106ICh2OiBhbnkpID0+IHZvaWQgfSA9IHt9O1xuICBvblAyUDogeyBba2V5OiBzdHJpbmddOiAocGF5bG9hZDogcDJwTWVzc2FnZUV2ZW50KSA9PiB2b2lkIH0gPSB7fTtcbiAgZXZlbnRzID0ge1xuICAgIHN0b3JlOiB0aGlzLm9uU3RvcmUsXG4gICAgZmluZHZhbHVlOiB0aGlzLm9uRmluZFZhbHVlLFxuICAgIGZpbmRub2RlOiB0aGlzLm9uRmluZE5vZGUsXG4gICAgcDJwOiB0aGlzLm9uUDJQXG4gIH07XG4gIGN5cGhlcjogQ3lwaGVyO1xuXG4gIGNvbnN0cnVjdG9yKG9wdD86IHsgcHVia2V5Pzogc3RyaW5nOyBzZWNLZXk/OiBzdHJpbmc7IGtMZW5ndGg/OiBudW1iZXIgfSkge1xuICAgIHRoaXMuayA9IDIwO1xuICAgIGlmIChvcHQgJiYgb3B0LmtMZW5ndGgpIHRoaXMuayA9IG9wdC5rTGVuZ3RoO1xuICAgIGlmIChvcHQpIHRoaXMuY3lwaGVyID0gbmV3IEN5cGhlcihvcHQuc2VjS2V5LCBvcHQucHVia2V5KTtcbiAgICBlbHNlIHRoaXMuY3lwaGVyID0gbmV3IEN5cGhlcigpO1xuICAgIHRoaXMubm9kZUlkID0gc2hhMSh0aGlzLmN5cGhlci5wdWJLZXkpLnRvU3RyaW5nKCk7XG5cbiAgICB0aGlzLmtidWNrZXRzID0gbmV3IEFycmF5KDE2MCk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCAxNjA7IGkrKykge1xuICAgICAgbGV0IGtidWNrZXQ6IEFycmF5PGFueT4gPSBbXTtcbiAgICAgIHRoaXMua2J1Y2tldHNbaV0gPSBrYnVja2V0O1xuICAgIH1cblxuICAgIHRoaXMuZiA9IG5ldyBIZWxwZXIodGhpcy5rLCB0aGlzLmtidWNrZXRzLCB0aGlzLm5vZGVJZCk7XG4gICAgdGhpcy5yZXNwb25kZXIgPSBuZXcgS1Jlc3BvbmRlcih0aGlzKTtcbiAgfVxuXG4gIHN0b3JlKHNlbmRlcjogc3RyaW5nLCBrZXk6IHN0cmluZywgdmFsdWU6IGFueSwgb3B0PzogeyBleGNsdWRlSWQ/OiBzdHJpbmcgfSkge1xuICAgIGNvbnN0IHBlZXIgPSB0aGlzLmYuZ2V0Q2xvc2VFc3RQZWVyKGtleSwgb3B0KTtcbiAgICBpZiAoIXBlZXIpIHJldHVybjtcbiAgICBjb25zdCBoYXNoID0gc2hhMShKU09OLnN0cmluZ2lmeSh2YWx1ZSkpLnRvU3RyaW5nKCk7XG4gICAgY29uc3Qgc2VuZERhdGE6IFN0b3JlRm9ybWF0ID0ge1xuICAgICAgc2VuZGVyLFxuICAgICAga2V5LFxuICAgICAgdmFsdWUsXG4gICAgICBwdWJLZXk6IHRoaXMuY3lwaGVyLnB1YktleSxcbiAgICAgIGhhc2gsXG4gICAgICBzaWduOiB0aGlzLmN5cGhlci5lbmNyeXB0KGhhc2gpXG4gICAgfTtcbiAgICBjb25zdCBuZXR3b3JrID0gbmV0d29ya0Zvcm1hdCh0aGlzLm5vZGVJZCwgZGVmLlNUT1JFLCBzZW5kRGF0YSk7XG5cbiAgICBjb25zb2xlLmxvZyhkZWYuU1RPUkUsIFwibmV4dFwiLCBwZWVyLm5vZGVJZCwgXCJ0YXJnZXRcIiwga2V5KTtcbiAgICBwZWVyLnNlbmQobmV0d29yaywgXCJrYWRcIik7XG4gICAgLy9ubyBzZHBcbiAgICBpZiAoIXZhbHVlLnNkcCkgdGhpcy5rZXlWYWx1ZUxpc3Rba2V5XSA9IHZhbHVlO1xuICB9XG5cbiAgc3RvcmVDaHVua3MoXG4gICAgc2VuZGVyOiBzdHJpbmcsXG4gICAga2V5OiBzdHJpbmcsXG4gICAgY2h1bmtzOiBBcnJheUJ1ZmZlcltdLFxuICAgIG9wdD86IHsgZXhjbHVkZUlkPzogc3RyaW5nIH1cbiAgKSB7XG4gICAgLy8gY29uc3QgcGVlcnMgPSB0aGlzLmYuZ2V0Q2xvc2VQZWVycyhrZXksIG9wdCk7XG4gICAgY29uc3QgcGVlciA9IHRoaXMuZi5nZXRDbG9zZUVzdFBlZXIoa2V5LCBvcHQpO1xuICAgIGlmICghcGVlcikgcmV0dXJuO1xuICAgIGNvbnNvbGUubG9nKFwic3RvcmUgY2h1bmtzXCIsIHsgY2h1bmtzIH0pO1xuICAgIGNodW5rcy5mb3JFYWNoKChjaHVuaywgaSkgPT4ge1xuICAgICAgY29uc3QgaGFzaCA9IHNoYTEoQnVmZmVyLmZyb20oY2h1bmspKS50b1N0cmluZygpO1xuICAgICAgY29uc3Qgc2VuZERhdGE6IFN0b3JlQ2h1bmtzID0ge1xuICAgICAgICBzZW5kZXI6IHRoaXMubm9kZUlkLFxuICAgICAgICBrZXksXG4gICAgICAgIHZhbHVlOiBCdWZmZXIuZnJvbShjaHVuayksXG4gICAgICAgIGluZGV4OiBpLFxuICAgICAgICBwdWJLZXk6IHRoaXMuY3lwaGVyLnB1YktleSxcbiAgICAgICAgaGFzaCxcbiAgICAgICAgc2lnbjogdGhpcy5jeXBoZXIuZW5jcnlwdChoYXNoKSxcbiAgICAgICAgc2l6ZTogY2h1bmtzLmxlbmd0aFxuICAgICAgfTtcbiAgICAgIGNvbnN0IG5ldHdvcmsgPSBuZXR3b3JrRm9ybWF0KHNlbmRlciwgZGVmLlNUT1JFX0NIVU5LUywgc2VuZERhdGEpO1xuXG4gICAgICBjb25zb2xlLmxvZyhkZWYuU1RPUkUsIFwibmV4dFwiLCBwZWVyLm5vZGVJZCwgXCJ0YXJnZXRcIiwga2V5KTtcbiAgICAgIHBlZXIuc2VuZChuZXR3b3JrLCBcImthZFwiKTtcbiAgICB9KTtcbiAgICAvL+ODrOODl+ODquOCseODvOOCt+ODp+ODs1xuICAgIHRoaXMua2V5VmFsdWVMaXN0W2tleV0gPSB7IGNodW5rcyB9O1xuICB9XG5cbiAgZmluZE5vZGUodGFyZ2V0SWQ6IHN0cmluZywgcGVlcjogV2ViUlRDKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlPFdlYlJUQz4oYXN5bmMgKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY29uc29sZS5sb2coXCJmaW5kbm9kZVwiLCB0YXJnZXRJZCk7XG4gICAgICB0aGlzLnN0YXRlLmZpbmROb2RlID0gdGFyZ2V0SWQ7XG4gICAgICBjb25zdCBzZW5kRGF0YSA9IHsgdGFyZ2V0S2V5OiB0YXJnZXRJZCB9O1xuICAgICAgLy/pgIHjgotcbiAgICAgIHBlZXIuc2VuZChuZXR3b3JrRm9ybWF0KHRoaXMubm9kZUlkLCBkZWYuRklORE5PREUsIHNlbmREYXRhKSwgXCJrYWRcIik7XG5cbiAgICAgIHRoaXMuY2FsbGJhY2suX29uRmluZE5vZGUoKG5vZGVJZDogc3RyaW5nKSA9PiB7XG4gICAgICAgIGV4Y3V0ZUV2ZW50KHRoaXMuZXZlbnRzLmZpbmRub2RlLCBub2RlSWQpO1xuICAgICAgICByZXNvbHZlKHRoaXMuZi5nZXRQZWVyRnJvbW5vZGVJZChub2RlSWQpKTtcbiAgICAgIH0pO1xuXG4gICAgICBhd2FpdCBuZXcgUHJvbWlzZShyID0+IHNldFRpbWVvdXQociwgMTAgKiAxMDAwKSk7XG4gICAgICByZWplY3QoXCJ0aW1lb3V0IGZpbmRub2RlXCIpO1xuICAgIH0pO1xuICB9XG5cbiAgZmluZFZhbHVlKGtleTogc3RyaW5nLCBvcHQ/OiB7IG93bmVySWQ/OiBzdHJpbmcgfSkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZTxhbnk+KGFzeW5jIChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIHRoaXMuY2FsbGJhY2suX29uRmluZFZhbHVlID0gdmFsdWUgPT4ge1xuICAgICAgICBleGN1dGVFdmVudCh0aGlzLmV2ZW50cy5maW5kdmFsdWUsIHZhbHVlKTtcbiAgICAgICAgcmVzb2x2ZSh2YWx1ZSk7XG4gICAgICB9O1xuICAgICAgLy9rZXnjgavov5HjgYTjg5TjgqLjgpLlj5blvpdcbiAgICAgIGNvbnN0IHBlZXJzID0gdGhpcy5mLmdldENsb3NlUGVlcnMoa2V5KTtcbiAgICAgIHBlZXJzLmZvckVhY2gocGVlciA9PiB7XG4gICAgICAgIHRoaXMuZG9GaW5kdmFsdWUoa2V5LCBwZWVyKTtcbiAgICAgIH0pO1xuXG4gICAgICBhd2FpdCBuZXcgUHJvbWlzZShyID0+IHNldFRpbWVvdXQociwgNTAwMCkpO1xuICAgICAgaWYgKG9wdCAmJiBvcHQub3duZXJJZCkge1xuICAgICAgICBjb25zdCBvd25lcklkID0gb3B0Lm93bmVySWQ7XG4gICAgICAgIGNvbnN0IHBlZXJzID0gdGhpcy5mLmdldENsb3NlUGVlcnMob3duZXJJZCk7XG4gICAgICAgIHBlZXJzLmZvckVhY2gocGVlciA9PiB7XG4gICAgICAgICAgdGhpcy5kb0ZpbmR2YWx1ZShvd25lcklkLCBwZWVyKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGF3YWl0IG5ldyBQcm9taXNlKHIgPT4gc2V0VGltZW91dChyLCA1MDAwKSk7XG4gICAgICB9XG4gICAgICByZWplY3QoXCJmaW5kdmFsdWUgdGltZW91dFwiKTtcbiAgICB9KTtcbiAgfVxuXG4gIGFzeW5jIGRvRmluZHZhbHVlKGtleTogc3RyaW5nLCBwZWVyOiBXZWJSVEMpIHtcbiAgICBjb25zb2xlLmxvZyhcImRvZmluZHZhbHVlXCIsIHBlZXIubm9kZUlkKTtcbiAgICBjb25zdCBzZW5kRGF0YTogRmluZFZhbHVlID0geyB0YXJnZXRLZXk6IGtleSB9O1xuICAgIHBlZXIuc2VuZChuZXR3b3JrRm9ybWF0KHRoaXMubm9kZUlkLCBkZWYuRklORFZBTFVFLCBzZW5kRGF0YSksIFwia2FkXCIpO1xuICB9XG5cbiAgY29ubmVjdChwZWVyOiBXZWJSVEMpIHtcbiAgICBjb25zb2xlLmxvZyhcImthZCBjb25uZWN0XCIpO1xuICAgIGlmICh0aGlzLnN0YXRlLmlzRmlyc3RDb25uZWN0KSB0aGlzLmNhbGxiYWNrLm9uQ29ubmVjdCgpO1xuICAgIHRoaXMuc3RhdGUuaXNGaXJzdENvbm5lY3QgPSBmYWxzZTtcbiAgICB0aGlzLmFkZGtub2RlKHBlZXIpO1xuICB9XG5cbiAgYWRka25vZGUocGVlcjogV2ViUlRDKSB7XG4gICAgcGVlci5ldmVudHMuZGF0YVtcImthZGVtbGlhLnRzXCJdID0gcmF3ID0+IHtcbiAgICAgIHRoaXMub25Db21tYW5kKHJhdyk7XG4gICAgfTtcblxuICAgIHBlZXIuZGlzY29ubmVjdCA9ICgpID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKFwia2FkIG5vZGUgZGlzY29ubmVjdGVkXCIpO1xuICAgICAgdGhpcy5mLmNsZWFuRGlzY29uKCk7XG4gICAgICB0aGlzLmNhbGxiYWNrLm9uQWRkUGVlcih0aGlzLmYuZ2V0QWxsUGVlcklkcygpKTtcbiAgICB9O1xuXG4gICAgaWYgKCF0aGlzLmYuaXNOb2RlRXhpc3QocGVlci5ub2RlSWQpKSB7XG4gICAgICAvL+iHquWIhuOBruODjuODvOODiUlE44Go6L+95Yqg44GZ44KL44OO44O844OJSUTjga7ot53pm6JcbiAgICAgIGNvbnN0IG51bSA9IGRpc3RhbmNlKHRoaXMubm9kZUlkLCBwZWVyLm5vZGVJZCk7XG4gICAgICAvL2tidWNrZXRz44Gu6Kmy5b2T44GZ44KL6Led6Zui44Gua2J1Y2tldOOCkuWRvOOBs+WHuuOBmVxuICAgICAgY29uc3Qga2J1Y2tldCA9IHRoaXMua2J1Y2tldHNbbnVtXTtcbiAgICAgIC8v6Kmy5b2T44GZ44KLa2J1Y2tldOOBq+aWsOOBl+OBhOODlOOCouOCkuWKoOOBiOOCi1xuICAgICAga2J1Y2tldC5wdXNoKHBlZXIpO1xuXG4gICAgICBjb25zb2xlLmxvZyhcImFkZGtub2RlIGtidWNrZXRzXCIsIFwicGVlci5ub2RlSWQ6XCIsIHBlZXIubm9kZUlkKTtcbiAgICAgIGNvbnNvbGUubG9nKHRoaXMuZi5nZXRBbGxQZWVySWRzKCkpO1xuXG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgdGhpcy5maW5kTmV3UGVlcihwZWVyKTtcbiAgICAgIH0sIDEwMDApO1xuXG4gICAgICB0aGlzLmNhbGxiYWNrLm9uQWRkUGVlcih0aGlzLmYuZ2V0QWxsUGVlcklkcygpKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIGZpbmROZXdQZWVyKHBlZXI6IFdlYlJUQykge1xuICAgIGlmICh0aGlzLmYuZ2V0S2J1Y2tldE51bSgpIDwgdGhpcy5rKSB7XG4gICAgICAvL+iHqui6q+OBruODjuODvOODiUlE44KSa2V544Go44GX44GmRklORF9OT0RFXG4gICAgICBhd2FpdCB0aGlzLmZpbmROb2RlKHRoaXMubm9kZUlkLCBwZWVyKS5jYXRjaChjb25zb2xlLmxvZyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUubG9nKFwia2J1Y2tldCByZWFkeVwiLCB0aGlzLmYuZ2V0S2J1Y2tldE51bSgpKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIG1haW50YWluKG5ldHdvcms6IGFueSkge1xuICAgIGNvbnN0IGlueCA9IGRpc3RhbmNlKHRoaXMubm9kZUlkLCBuZXR3b3JrLm5vZGVJZCk7XG4gICAgY29uc3Qga2J1Y2tldCA9IHRoaXMua2J1Y2tldHNbaW54XTtcblxuICAgIC8v6YCB5L+h5YWD44GM6Kmy5b2T44GZ44KLay1idWNrZXTjga7kuK3jgavjgYLjgaPjgZ/loLTlkIhcbiAgICAvL+OBneOBruODjuODvOODieOCkmstYnVja2V044Gu5pyr5bC+44Gr56e744GZXG4gICAga2J1Y2tldC5mb3JFYWNoKChwZWVyLCBpKSA9PiB7XG4gICAgICBpZiAocGVlci5ub2RlSWQgPT09IG5ldHdvcmsubm9kZUlkKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwibWFpbnRhaW5cIiwgXCJNb3Zlc8KgaXTCoHRvwqB0aGXCoHRhaWzCoG9mwqB0aGXCoGxpc3RcIik7XG4gICAgICAgIGtidWNrZXQuc3BsaWNlKGksIDEpO1xuICAgICAgICBrYnVja2V0LnB1c2gocGVlcik7XG4gICAgICAgIHJldHVybiAwO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy9rLWJ1Y2tldOOBjOOBmeOBp+OBq+a6gOadr+OBquWgtOWQiOOAgVxuICAgIC8v44Gd44Guay1idWNrZXTkuK3jga7lhYjpoK3jga7jg47jg7zjg4njgYzjgqrjg7Pjg6njgqTjg7PjgarjgonlhYjpoK3jga7jg47jg7zjg4njgpLmrovjgZlcbiAgICBpZiAoa2J1Y2tldC5sZW5ndGggPiB0aGlzLmspIHtcbiAgICAgIGtidWNrZXQuc2hpZnQoKTtcbiAgICB9XG4gIH1cblxuICBvZmZlcih0YXJnZXQ6IHN0cmluZywgcHJveHkgPSBudWxsKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlPGFueT4oYXN5bmMgKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY29uc3QgciA9IHRoaXMucmVmO1xuICAgICAgY29uc3QgcGVlciA9IChyW3RhcmdldF0gPSBuZXcgV2ViUlRDKCkpO1xuICAgICAgcGVlci5tYWtlT2ZmZXIoKTtcblxuICAgICAgY29uc3QgdGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICByZWplY3QoXCJrYWQgb2ZmZXIgdGltZW91dFwiKTtcbiAgICAgIH0sIDUgKiAxMDAwKTtcblxuICAgICAgcGVlci5zaWduYWwgPSBzZHAgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZyhcImthZCBvZmZlciBzdG9yZVwiLCB0YXJnZXQpO1xuICAgICAgICBjb25zdCBfID0gdGhpcy5mLmdldENsb3NlRXN0UGVlcih0YXJnZXQpO1xuICAgICAgICBpZiAoIV8pIHJldHVybjtcbiAgICAgICAgaWYgKF8ubm9kZUlkICE9PSB0YXJnZXQpXG4gICAgICAgICAgdGhpcy5zdG9yZSh0aGlzLm5vZGVJZCwgdGFyZ2V0LCB7IHNkcCwgcHJveHkgfSk7XG4gICAgICB9O1xuXG4gICAgICBwZWVyLmNvbm5lY3QgPSAoKSA9PiB7XG4gICAgICAgIHBlZXIubm9kZUlkID0gdGFyZ2V0O1xuICAgICAgICBjb25zb2xlLmxvZyhcImthZCBvZmZlciBjb25uZWN0ZWRcIiwgdGFyZ2V0KTtcbiAgICAgICAgdGhpcy5hZGRrbm9kZShwZWVyKTtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xuICAgICAgICByZXNvbHZlKHRydWUpO1xuICAgICAgfTtcbiAgICB9KTtcbiAgfVxuXG4gIGFuc3dlcih0YXJnZXQ6IHN0cmluZywgc2RwOiBzdHJpbmcsIHByb3h5OiBzdHJpbmcpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2U8YW55Pihhc3luYyAocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjb25zdCByID0gdGhpcy5yZWY7XG4gICAgICBjb25zdCBwZWVyID0gKHJbdGFyZ2V0XSA9IG5ldyBXZWJSVEMoKSk7XG4gICAgICBwZWVyLm1ha2VBbnN3ZXIoc2RwKTtcbiAgICAgIGNvbnNvbGUubG9nKFwia2FkIGFuc3dlclwiLCB0YXJnZXQpO1xuXG4gICAgICBjb25zdCB0aW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHJlamVjdChcImthZCBhbnN3ZXIgdGltZW91dFwiKTtcbiAgICAgIH0sIDUgKiAxMDAwKTtcblxuICAgICAgcGVlci5zaWduYWwgPSBzZHAgPT4ge1xuICAgICAgICBjb25zdCBfID0gdGhpcy5mLmdldFBlZXJGcm9tbm9kZUlkKHByb3h5KTtcbiAgICAgICAgY29uc3QgaGFzaCA9IHNoYTEoTWF0aC5yYW5kb20oKS50b1N0cmluZygpKS50b1N0cmluZygpO1xuICAgICAgICBjb25zdCBzZW5kRGF0YTogU3RvcmVGb3JtYXQgPSB7XG4gICAgICAgICAgc2VuZGVyOiB0aGlzLm5vZGVJZCxcbiAgICAgICAgICBrZXk6IHRhcmdldCxcbiAgICAgICAgICB2YWx1ZTogeyBzZHAgfSxcbiAgICAgICAgICBwdWJLZXk6IHRoaXMuY3lwaGVyLnB1YktleSxcbiAgICAgICAgICBoYXNoLFxuICAgICAgICAgIHNpZ246IHRoaXMuY3lwaGVyLmVuY3J5cHQoaGFzaClcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKF8pIF8uc2VuZChuZXR3b3JrRm9ybWF0KHRoaXMubm9kZUlkLCBkZWYuU1RPUkUsIHNlbmREYXRhKSwgXCJrYWRcIik7XG4gICAgICB9O1xuXG4gICAgICBwZWVyLmNvbm5lY3QgPSAoKSA9PiB7XG4gICAgICAgIHBlZXIubm9kZUlkID0gdGFyZ2V0O1xuICAgICAgICBjb25zb2xlLmxvZyhcImthZCBhbnN3ZXIgY29ubmVjdGVkXCIsIHRhcmdldCk7XG4gICAgICAgIHRoaXMuYWRka25vZGUocGVlcik7XG4gICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KTtcbiAgICAgICAgcmVzb2x2ZSh0cnVlKTtcbiAgICAgIH07XG4gICAgfSk7XG4gIH1cblxuICBzZW5kKFxuICAgIHRhcmdldDogc3RyaW5nLFxuICAgIGRhdGE6IHsgdGV4dD86IHN0cmluZzsgZmlsZT86IHsgbmFtZTogc3RyaW5nOyB2YWx1ZTogQXJyYXlCdWZmZXJbXSB9IH1cbiAgKSB7XG4gICAgY29uc3Qgc2VuZCA9IChwZWVyOiBXZWJSVEMpID0+IHtcbiAgICAgIGNvbnN0IGJzb24gPSBuZXcgQlNPTigpO1xuICAgICAgY29uc3QgcGFja2V0OiBwMnBNZXNzYWdlID0ge1xuICAgICAgICBzZW5kZXI6IHRoaXMubm9kZUlkLFxuICAgICAgICB0YXJnZXRcbiAgICAgIH07XG4gICAgICBpZiAoZGF0YS50ZXh0KSB7XG4gICAgICAgIHBhY2tldC50ZXh0ID0gZGF0YS50ZXh0O1xuICAgICAgICBjb25zdCBiaW4gPSBic29uLnNlcmlhbGl6ZShwYWNrZXQpO1xuICAgICAgICBwZWVyLnNlbmQoYmluLCBcInAycFwiKTtcbiAgICAgIH0gZWxzZSBpZiAoZGF0YS5maWxlKSB7XG4gICAgICAgIGNvbnN0IGZpbGUgPSBkYXRhLmZpbGU7XG4gICAgICAgIGZpbGUudmFsdWUuZm9yRWFjaCgoY2h1bmssIGkpID0+IHtcbiAgICAgICAgICBwYWNrZXQuZmlsZSA9IHtcbiAgICAgICAgICAgIGluZGV4OiBpLFxuICAgICAgICAgICAgbGVuZ3RoOiBmaWxlLnZhbHVlLmxlbmd0aCxcbiAgICAgICAgICAgIGNodW5rOiBCdWZmZXIuZnJvbShjaHVuayksXG4gICAgICAgICAgICBmaWxlbmFtZTogZmlsZS5uYW1lXG4gICAgICAgICAgfTtcbiAgICAgICAgICBjb25zdCBiaW4gPSBic29uLnNlcmlhbGl6ZShwYWNrZXQpO1xuICAgICAgICAgIHBlZXIuc2VuZChiaW4sIFwicDJwXCIpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlPGFueT4oYXN5bmMgKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY29uc3QgcGVlciA9IHRoaXMuZi5nZXRQZWVyRnJvbW5vZGVJZCh0YXJnZXQpO1xuICAgICAgaWYgKHBlZXIpIHtcbiAgICAgICAgc2VuZChwZWVyKTtcbiAgICAgICAgcmVzb2x2ZSh0cnVlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IGNsb3NlID0gdGhpcy5mLmdldENsb3NlRXN0UGVlcih0YXJnZXQpO1xuICAgICAgICBpZiAoIWNsb3NlKSByZXR1cm47XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMuZmluZE5vZGUodGFyZ2V0LCBjbG9zZSkuY2F0Y2goY29uc29sZS5sb2cpO1xuICAgICAgICBpZiAoIXJlc3VsdCkgcmV0dXJuO1xuICAgICAgICBzZW5kKHJlc3VsdCk7XG4gICAgICAgIHJlc29sdmUodHJ1ZSk7XG4gICAgICB9XG4gICAgICBhd2FpdCBuZXcgUHJvbWlzZShyID0+IHNldFRpbWVvdXQociwgMTAgKiAxMDAwKSk7XG4gICAgICByZWplY3QoXCJzZW5kIHRpbWVvdXRcIik7XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIG9uQ29tbWFuZChtZXNzYWdlOiBtZXNzYWdlKSB7XG4gICAgc3dpdGNoIChtZXNzYWdlLmxhYmVsKSB7XG4gICAgICBjYXNlIFwia2FkXCI6XG4gICAgICAgIHtcbiAgICAgICAgICBjb25zdCBidWZmZXI6IEJ1ZmZlciA9IEJ1ZmZlci5mcm9tKG1lc3NhZ2UuZGF0YSk7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IG5ldHdvcmtMYXllcjogbmV0d29yayA9IGJzb24uZGVzZXJpYWxpemUoYnVmZmVyKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwib25jb21tYW5kIGthZFwiLCB7IG1lc3NhZ2UgfSwgeyBuZXR3b3JrTGF5ZXIgfSk7XG4gICAgICAgICAgICBpZiAoIUpTT04uc3RyaW5naWZ5KHRoaXMuZGF0YUxpc3QpLmluY2x1ZGVzKG5ldHdvcmtMYXllci5oYXNoKSkge1xuICAgICAgICAgICAgICB0aGlzLmRhdGFMaXN0LnB1c2gobmV0d29ya0xheWVyLmhhc2gpO1xuICAgICAgICAgICAgICB0aGlzLm9uUmVxdWVzdChuZXR3b3JrTGF5ZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvcik7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBcInAycFwiOlxuICAgICAgICB7XG4gICAgICAgICAgY29uc3QgYnVmZmVyOiBCdWZmZXIgPSBCdWZmZXIuZnJvbShtZXNzYWdlLmRhdGEpO1xuICAgICAgICAgIGNvbnN0IHBhY2tldDogcDJwTWVzc2FnZSA9IGJzb24uZGVzZXJpYWxpemUoYnVmZmVyKTtcbiAgICAgICAgICBpZiAocGFja2V0LnRleHQpIHtcbiAgICAgICAgICAgIGNvbnN0IHBheWxvYWQ6IHAycE1lc3NhZ2VFdmVudCA9IHtcbiAgICAgICAgICAgICAgbm9kZUlkOiBwYWNrZXQuc2VuZGVyLFxuICAgICAgICAgICAgICB0ZXh0OiBwYWNrZXQudGV4dFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGV4Y3V0ZUV2ZW50KHRoaXMuZXZlbnRzLnAycCwgcGF5bG9hZCk7XG4gICAgICAgICAgfSBlbHNlIGlmIChwYWNrZXQuZmlsZSkge1xuICAgICAgICAgICAgaWYgKHBhY2tldC5maWxlLmluZGV4ID09PSAwKSB0aGlzLnAycE1zZ0J1ZmZlcltwYWNrZXQuc2VuZGVyXSA9IFtdO1xuICAgICAgICAgICAgdGhpcy5wMnBNc2dCdWZmZXJbcGFja2V0LnNlbmRlcl0ucHVzaChwYWNrZXQuZmlsZS5jaHVuay5idWZmZXIpO1xuICAgICAgICAgICAgaWYgKHBhY2tldC5maWxlLmluZGV4ID09PSBwYWNrZXQuZmlsZS5sZW5ndGggLSAxKSB7XG4gICAgICAgICAgICAgIGNvbnN0IHBheWxvYWQ6IHAycE1lc3NhZ2VFdmVudCA9IHtcbiAgICAgICAgICAgICAgICBub2RlSWQ6IHBhY2tldC5zZW5kZXIsXG4gICAgICAgICAgICAgICAgZmlsZTogdGhpcy5wMnBNc2dCdWZmZXJbcGFja2V0LnNlbmRlcl0sXG4gICAgICAgICAgICAgICAgZmlsZW5hbWU6IHBhY2tldC5maWxlLmZpbGVuYW1lXG4gICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgIGV4Y3V0ZUV2ZW50KHRoaXMuZXZlbnRzLnAycCwgcGF5bG9hZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgb25SZXF1ZXN0KG5ldHdvcms6IGFueSkge1xuICAgIHRoaXMucmVzcG9uZGVyLnJlc3BvbnNlKG5ldHdvcmsudHlwZSwgbmV0d29yayk7XG4gICAgdGhpcy5tYWludGFpbihuZXR3b3JrKTtcbiAgfVxufVxuIl19
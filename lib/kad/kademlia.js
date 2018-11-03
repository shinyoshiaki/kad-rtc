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
    value: function () {
      var _send = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee10(target, data) {
        var _this7 = this;

        var send;
        return regeneratorRuntime.wrap(function _callee10$(_context10) {
          while (1) {
            switch (_context10.prev = _context10.next) {
              case 0:
                send =
                /*#__PURE__*/
                function () {
                  var _ref5 = _asyncToGenerator(
                  /*#__PURE__*/
                  regeneratorRuntime.mark(function _callee8(peer) {
                    var bson, packet, bin, _file, i, chunk, _bin;

                    return regeneratorRuntime.wrap(function _callee8$(_context8) {
                      while (1) {
                        switch (_context8.prev = _context8.next) {
                          case 0:
                            bson = new _bson.BSON();
                            packet = {
                              sender: _this7.nodeId,
                              target: target
                            };

                            if (!data.text) {
                              _context8.next = 8;
                              break;
                            }

                            packet.text = data.text;
                            bin = bson.serialize(packet);
                            peer.send(bin, "p2p");
                            _context8.next = 21;
                            break;

                          case 8:
                            if (!data.file) {
                              _context8.next = 21;
                              break;
                            }

                            _file = data.file;
                            i = 0;

                          case 11:
                            if (!(i < _file.value.length)) {
                              _context8.next = 21;
                              break;
                            }

                            chunk = _file.value[i];
                            packet.file = {
                              index: i,
                              length: _file.value.length,
                              chunk: Buffer.from(chunk),
                              filename: _file.name
                            };
                            _bin = bson.serialize(packet);
                            peer.send(_bin, "p2p");
                            _context8.next = 18;
                            return new Promise(function (r) {
                              return setTimeout(r, 10);
                            });

                          case 18:
                            i++;
                            _context8.next = 11;
                            break;

                          case 21:
                          case "end":
                            return _context8.stop();
                        }
                      }
                    }, _callee8, this);
                  }));

                  return function send(_x15) {
                    return _ref5.apply(this, arguments);
                  };
                }();

                return _context10.abrupt("return", new Promise(
                /*#__PURE__*/
                function () {
                  var _ref6 = _asyncToGenerator(
                  /*#__PURE__*/
                  regeneratorRuntime.mark(function _callee9(resolve, reject) {
                    var peer, close, result;
                    return regeneratorRuntime.wrap(function _callee9$(_context9) {
                      while (1) {
                        switch (_context9.prev = _context9.next) {
                          case 0:
                            peer = _this7.f.getPeerFromnodeId(target);

                            if (!peer) {
                              _context9.next = 7;
                              break;
                            }

                            _context9.next = 4;
                            return send(peer);

                          case 4:
                            resolve(true);
                            _context9.next = 18;
                            break;

                          case 7:
                            close = _this7.f.getCloseEstPeer(target);

                            if (close) {
                              _context9.next = 10;
                              break;
                            }

                            return _context9.abrupt("return");

                          case 10:
                            _context9.next = 12;
                            return _this7.findNode(target, close).catch(console.log);

                          case 12:
                            result = _context9.sent;

                            if (result) {
                              _context9.next = 15;
                              break;
                            }

                            return _context9.abrupt("return");

                          case 15:
                            _context9.next = 17;
                            return send(result);

                          case 17:
                            resolve(true);

                          case 18:
                            _context9.next = 20;
                            return new Promise(function (r) {
                              return setTimeout(r, 10 * 1000);
                            });

                          case 20:
                            reject("send timeout");

                          case 21:
                          case "end":
                            return _context9.stop();
                        }
                      }
                    }, _callee9, this);
                  }));

                  return function (_x16, _x17) {
                    return _ref6.apply(this, arguments);
                  };
                }()));

              case 2:
              case "end":
                return _context10.stop();
            }
          }
        }, _callee10, this);
      }));

      return function send(_x13, _x14) {
        return _send.apply(this, arguments);
      };
    }()
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9rYWQva2FkZW1saWEudHMiXSwibmFtZXMiOlsicmVxdWlyZSIsImJzb24iLCJCU09OIiwiZXhjdXRlRXZlbnQiLCJldiIsInYiLCJjb25zb2xlIiwibG9nIiwiT2JqZWN0Iiwia2V5cyIsImZvckVhY2giLCJrZXkiLCJLYWRlbWxpYSIsIm9wdCIsImlzRmlyc3RDb25uZWN0IiwiaXNPZmZlciIsImZpbmROb2RlIiwiaGFzaCIsIm9uQ29ubmVjdCIsIm9uQWRkUGVlciIsIm9uUGVlckRpc2Nvbm5lY3QiLCJfb25GaW5kVmFsdWUiLCJfb25GaW5kTm9kZSIsIm9uQXBwIiwic3RvcmUiLCJvblN0b3JlIiwiZmluZHZhbHVlIiwib25GaW5kVmFsdWUiLCJmaW5kbm9kZSIsIm9uRmluZE5vZGUiLCJwMnAiLCJvblAyUCIsImsiLCJrTGVuZ3RoIiwiY3lwaGVyIiwiQ3lwaGVyIiwic2VjS2V5IiwicHVia2V5Iiwibm9kZUlkIiwicHViS2V5IiwidG9TdHJpbmciLCJrYnVja2V0cyIsIkFycmF5IiwiaSIsImtidWNrZXQiLCJmIiwiSGVscGVyIiwicmVzcG9uZGVyIiwiS1Jlc3BvbmRlciIsInNlbmRlciIsInZhbHVlIiwicGVlciIsImdldENsb3NlRXN0UGVlciIsIkpTT04iLCJzdHJpbmdpZnkiLCJzZW5kRGF0YSIsInNpZ24iLCJlbmNyeXB0IiwibmV0d29yayIsImRlZiIsIlNUT1JFIiwic2VuZCIsInNkcCIsImtleVZhbHVlTGlzdCIsImNodW5rcyIsImNodW5rIiwiQnVmZmVyIiwiZnJvbSIsImluZGV4Iiwic2l6ZSIsImxlbmd0aCIsIlNUT1JFX0NIVU5LUyIsInRhcmdldElkIiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZWplY3QiLCJzdGF0ZSIsInRhcmdldEtleSIsIkZJTkROT0RFIiwiY2FsbGJhY2siLCJldmVudHMiLCJnZXRQZWVyRnJvbW5vZGVJZCIsInIiLCJzZXRUaW1lb3V0IiwicGVlcnMiLCJnZXRDbG9zZVBlZXJzIiwiZG9GaW5kdmFsdWUiLCJvd25lcklkIiwiRklORFZBTFVFIiwiYWRka25vZGUiLCJkYXRhIiwicmF3Iiwib25Db21tYW5kIiwiZGlzY29ubmVjdCIsImNsZWFuRGlzY29uIiwiZ2V0QWxsUGVlcklkcyIsImlzTm9kZUV4aXN0IiwibnVtIiwicHVzaCIsImZpbmROZXdQZWVyIiwiZ2V0S2J1Y2tldE51bSIsImNhdGNoIiwiaW54Iiwic3BsaWNlIiwic2hpZnQiLCJ0YXJnZXQiLCJwcm94eSIsInJlZiIsIldlYlJUQyIsIm1ha2VPZmZlciIsInRpbWVvdXQiLCJzaWduYWwiLCJfIiwiY29ubmVjdCIsImNsZWFyVGltZW91dCIsIm1ha2VBbnN3ZXIiLCJNYXRoIiwicmFuZG9tIiwicGFja2V0IiwidGV4dCIsImJpbiIsInNlcmlhbGl6ZSIsImZpbGUiLCJmaWxlbmFtZSIsIm5hbWUiLCJjbG9zZSIsInJlc3VsdCIsIm1lc3NhZ2UiLCJsYWJlbCIsImJ1ZmZlciIsIm5ldHdvcmtMYXllciIsImRlc2VyaWFsaXplIiwiZGF0YUxpc3QiLCJpbmNsdWRlcyIsIm9uUmVxdWVzdCIsImVycm9yIiwicGF5bG9hZCIsInAycE1zZ0J1ZmZlciIsInJlc3BvbnNlIiwidHlwZSIsIm1haW50YWluIl0sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUVBOztBQUNBOztBQUNBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFUQUEsT0FBTyxDQUFDLGdCQUFELENBQVA7O0FBV0EsSUFBTUMsSUFBSSxHQUFHLElBQUlDLFVBQUosRUFBYjs7QUFDTyxTQUFTQyxXQUFULENBQXFCQyxFQUFyQixFQUE4QkMsQ0FBOUIsRUFBdUM7QUFDNUNDLEVBQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZLGFBQVosRUFBMkJILEVBQTNCO0FBQ0FJLEVBQUFBLE1BQU0sQ0FBQ0MsSUFBUCxDQUFZTCxFQUFaLEVBQWdCTSxPQUFoQixDQUF3QixVQUFBQyxHQUFHLEVBQUk7QUFDN0JQLElBQUFBLEVBQUUsQ0FBQ08sR0FB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QUwsQ0FBWWxELEdBQWIsRUFBa0IwRyxPQUFsQixDQUFYO0FBQ0QsYUFORCxNQU1PLElBQUlsQixNQUFNLENBQUNJLElBQVgsRUFBaUI7QUFDdEIsa0JBQUlKLE1BQU0sQ0FBQ0ksSUFBUCxDQUFZdEQsS0FBWixLQUFzQixDQUExQixFQUE2QixLQUFLcUUsWUFBTCxDQUFrQm5CLE1BQU0sQ0FBQ3JFLE1BQXpCLElBQW1DLEVBQW5DO0FBQzdCLG1CQUFLd0YsWUFBTCxDQUFrQm5CLE1BQU0sQ0FBQ3JFLE1BQXpCLEVBQWlDaUQsSUFBakMsQ0FBc0NvQixNQUFNLENBQUNJLElBQVAsQ0FBWXpELEtBQVosQ0FBa0JnRSxNQUF4RDs7QUFDQSxrQkFBSVgsTUFBTSxDQUFDSSxJQUFQLENBQVl0RCxLQUFaLEtBQXNCa0QsTUFBTSxDQUFDSSxJQUFQLENBQVlwRCxNQUFaLEdBQXFCLENBQS9DLEVBQWtEO0FBQ2hELG9CQUFNa0UsUUFBd0IsR0FBRztBQUMvQmxHLGtCQUFBQSxNQUFNLEVBQUVnRixNQUFNLENBQUNyRSxNQURnQjtBQUUvQnlFLGtCQUFBQSxJQUFJLEVBQUUsS0FBS2UsWUFBTCxDQUFrQm5CLE1BQU0sQ0FBQ3JFLE1BQXpCLENBRnlCO0FBRy9CMEUsa0JBQUFBLFFBQVEsRUFBRUwsTUFBTSxDQUFDSSxJQUFQLENBQVlDO0FBSFMsaUJBQWpDO0FBS0F4SCxnQkFBQUEsV0FBVyxDQUFDLEtBQUs2RSxNQUFMLENBQVlsRCxHQUFiLEVBQWtCMEcsUUFBbEIsQ0FBWDtBQUNEO0FBQ0Y7QUFDRjtBQUNEO0FBdkNKO0FBeUNEOzs7OEJBRWlCOUUsTyxFQUFjO0FBQzlCLFdBQUtYLFNBQUwsQ0FBZTJGLFFBQWYsQ0FBd0JoRixPQUFPLENBQUNpRixJQUFoQyxFQUFzQ2pGLE9BQXRDO0FBQ0EsV0FBS2tGLFFBQUwsQ0FBY2xGLE9BQWQ7QUFDRCIsInNvdXJjZXNDb250ZW50IjpbInJlcXVpcmUoXCJiYWJlbC1wb2x5ZmlsbFwiKTtcbmltcG9ydCBXZWJSVEMgZnJvbSBcIndlYnJ0YzRtZVwiO1xuaW1wb3J0IEhlbHBlciBmcm9tIFwiLi9rVXRpbFwiO1xuaW1wb3J0IEtSZXNwb25kZXIgZnJvbSBcIi4va1Jlc3BvbmRlclwiO1xuaW1wb3J0IGRlZiwgeyBuZXR3b3JrRm9ybWF0IH0gZnJvbSBcIi4vS0NvbnN0XCI7XG5pbXBvcnQgeyBkaXN0YW5jZSB9IGZyb20gXCJrYWQtZGlzdGFuY2VcIjtcbmltcG9ydCB7IG1lc3NhZ2UgfSBmcm9tIFwid2VicnRjNG1lL2xpYi9pbnRlcmZhY2VcIjtcbmltcG9ydCB7IEJTT04gfSBmcm9tIFwiYnNvblwiO1xuaW1wb3J0IEN5cGhlciBmcm9tIFwiLi4vbGliL2N5cGhlclwiO1xuaW1wb3J0IHNoYTEgZnJvbSBcInNoYTFcIjtcblxuY29uc3QgYnNvbiA9IG5ldyBCU09OKCk7XG5leHBvcnQgZnVuY3Rpb24gZXhjdXRlRXZlbnQoZXY6IGFueSwgdj86IGFueSkge1xuICBjb25zb2xlLmxvZyhcImV4Y3V0ZUV2ZW50XCIsIGV2KTtcbiAgT2JqZWN0LmtleXMoZXYpLmZvckVhY2goa2V5ID0+IHtcbiAgICBldltrZXldKHYpO1xuICB9KTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgS2FkZW1saWEge1xuICBub2RlSWQ6IHN0cmluZztcbiAgazogbnVtYmVyO1xuICBrYnVja2V0czogQXJyYXk8QXJyYXk8V2ViUlRDPj47XG4gIGY6IEhlbHBlcjtcbiAgcmVzcG9uZGVyOiBLUmVzcG9uZGVyO1xuICBkYXRhTGlzdDogQXJyYXk8YW55PiA9IFtdO1xuICBrZXlWYWx1ZUxpc3Q6IHsgW2tleTogc3RyaW5nXTogYW55IH0gPSB7fTtcbiAgcmVmOiB7IFtrZXk6IHN0cmluZ106IFdlYlJUQyB9ID0ge307XG4gIGJ1ZmZlcjogeyBba2V5OiBzdHJpbmddOiBBcnJheTxhbnk+IH0gPSB7fTtcbiAgcDJwTXNnQnVmZmVyOiB7IFtrZXk6IHN0cmluZ106IGFueVtdIH0gPSB7fTtcbiAgc3RhdGUgPSB7XG4gICAgaXNGaXJzdENvbm5lY3Q6IHRydWUsXG4gICAgaXNPZmZlcjogZmFsc2UsXG4gICAgZmluZE5vZGU6IFwiXCIsXG4gICAgaGFzaDoge31cbiAgfTtcblxuICBjYWxsYmFjayA9IHtcbiAgICBvbkNvbm5lY3Q6ICgpID0+IHt9LFxuICAgIG9uQWRkUGVlcjogKHY/OiBhbnkpID0+IHt9LFxuICAgIG9uUGVlckRpc2Nvbm5lY3Q6ICh2PzogYW55KSA9PiB7fSxcbiAgICBfb25GaW5kVmFsdWU6ICh2PzogYW55KSA9PiB7fSxcbiAgICBfb25GaW5kTm9kZTogKHY/OiBhbnkpID0+IHt9LFxuICAgIG9uQXBwOiAodj86IGFueSkgPT4ge31cbiAgfTtcblxuICBvblN0b3JlOiB7IFtrZXk6IHN0cmluZ106ICh2OiBhbnkpID0+IHZvaWQgfSA9IHt9O1xuICBvbkZpbmRWYWx1ZTogeyBba2V5OiBzdHJpbmddOiAodjogYW55KSA9PiB2b2lkIH0gPSB7fTtcbiAgb25GaW5kTm9kZTogeyBba2V5OiBzdHJpbmddOiAodjogYW55KSA9PiB2b2lkIH0gPSB7fTtcbiAgb25QMlA6IHsgW2tleTogc3RyaW5nXTogKHBheWxvYWQ6IHAycE1lc3NhZ2VFdmVudCkgPT4gdm9pZCB9ID0ge307XG4gIGV2ZW50cyA9IHtcbiAgICBzdG9yZTogdGhpcy5vblN0b3JlLFxuICAgIGZpbmR2YWx1ZTogdGhpcy5vbkZpbmRWYWx1ZSxcbiAgICBmaW5kbm9kZTogdGhpcy5vbkZpbmROb2RlLFxuICAgIHAycDogdGhpcy5vblAyUFxuICB9O1xuICBjeXBoZXI6IEN5cGhlcjtcblxuICBjb25zdHJ1Y3RvcihvcHQ/OiB7IHB1YmtleT86IHN0cmluZzsgc2VjS2V5Pzogc3RyaW5nOyBrTGVuZ3RoPzogbnVtYmVyIH0pIHtcbiAgICB0aGlzLmsgPSAyMDtcbiAgICBpZiAob3B0ICYmIG9wdC5rTGVuZ3RoKSB0aGlzLmsgPSBvcHQua0xlbmd0aDtcbiAgICBpZiAob3B0KSB0aGlzLmN5cGhlciA9IG5ldyBDeXBoZXIob3B0LnNlY0tleSwgb3B0LnB1YmtleSk7XG4gICAgZWxzZSB0aGlzLmN5cGhlciA9IG5ldyBDeXBoZXIoKTtcbiAgICB0aGlzLm5vZGVJZCA9IHNoYTEodGhpcy5jeXBoZXIucHViS2V5KS50b1N0cmluZygpO1xuXG4gICAgdGhpcy5rYnVja2V0cyA9IG5ldyBBcnJheSgxNjApO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgMTYwOyBpKyspIHtcbiAgICAgIGxldCBrYnVja2V0OiBBcnJheTxhbnk+ID0gW107XG4gICAgICB0aGlzLmtidWNrZXRzW2ldID0ga2J1Y2tldDtcbiAgICB9XG5cbiAgICB0aGlzLmYgPSBuZXcgSGVscGVyKHRoaXMuaywgdGhpcy5rYnVja2V0cywgdGhpcy5ub2RlSWQpO1xuICAgIHRoaXMucmVzcG9uZGVyID0gbmV3IEtSZXNwb25kZXIodGhpcyk7XG4gIH1cblxuICBzdG9yZShzZW5kZXI6IHN0cmluZywga2V5OiBzdHJpbmcsIHZhbHVlOiBhbnksIG9wdD86IHsgZXhjbHVkZUlkPzogc3RyaW5nIH0pIHtcbiAgICBjb25zdCBwZWVyID0gdGhpcy5mLmdldENsb3NlRXN0UGVlcihrZXksIG9wdCk7XG4gICAgaWYgKCFwZWVyKSByZXR1cm47XG4gICAgY29uc3QgaGFzaCA9IHNoYTEoSlNPTi5zdHJpbmdpZnkodmFsdWUpKS50b1N0cmluZygpO1xuICAgIGNvbnN0IHNlbmREYXRhOiBTdG9yZUZvcm1hdCA9IHtcbiAgICAgIHNlbmRlcixcbiAgICAgIGtleSxcbiAgICAgIHZhbHVlLFxuICAgICAgcHViS2V5OiB0aGlzLmN5cGhlci5wdWJLZXksXG4gICAgICBoYXNoLFxuICAgICAgc2lnbjogdGhpcy5jeXBoZXIuZW5jcnlwdChoYXNoKVxuICAgIH07XG4gICAgY29uc3QgbmV0d29yayA9IG5ldHdvcmtGb3JtYXQodGhpcy5ub2RlSWQsIGRlZi5TVE9SRSwgc2VuZERhdGEpO1xuXG4gICAgY29uc29sZS5sb2coZGVmLlNUT1JFLCBcIm5leHRcIiwgcGVlci5ub2RlSWQsIFwidGFyZ2V0XCIsIGtleSk7XG4gICAgcGVlci5zZW5kKG5ldHdvcmssIFwia2FkXCIpO1xuICAgIC8vbm8gc2RwXG4gICAgaWYgKCF2YWx1ZS5zZHApIHRoaXMua2V5VmFsdWVMaXN0W2tleV0gPSB2YWx1ZTtcbiAgfVxuXG4gIHN0b3JlQ2h1bmtzKFxuICAgIHNlbmRlcjogc3RyaW5nLFxuICAgIGtleTogc3RyaW5nLFxuICAgIGNodW5rczogQXJyYXlCdWZmZXJbXSxcbiAgICBvcHQ/OiB7IGV4Y2x1ZGVJZD86IHN0cmluZyB9XG4gICkge1xuICAgIC8vIGNvbnN0IHBlZXJzID0gdGhpcy5mLmdldENsb3NlUGVlcnMoa2V5LCBvcHQpO1xuICAgIGNvbnN0IHBlZXIgPSB0aGlzLmYuZ2V0Q2xvc2VFc3RQZWVyKGtleSwgb3B0KTtcbiAgICBpZiAoIXBlZXIpIHJldHVybjtcbiAgICBjb25zb2xlLmxvZyhcInN0b3JlIGNodW5rc1wiLCB7IGNodW5rcyB9KTtcbiAgICBjaHVua3MuZm9yRWFjaCgoY2h1bmssIGkpID0+IHtcbiAgICAgIGNvbnN0IGhhc2ggPSBzaGExKEJ1ZmZlci5mcm9tKGNodW5rKSkudG9TdHJpbmcoKTtcbiAgICAgIGNvbnN0IHNlbmREYXRhOiBTdG9yZUNodW5rcyA9IHtcbiAgICAgICAgc2VuZGVyOiB0aGlzLm5vZGVJZCxcbiAgICAgICAga2V5LFxuICAgICAgICB2YWx1ZTogQnVmZmVyLmZyb20oY2h1bmspLFxuICAgICAgICBpbmRleDogaSxcbiAgICAgICAgcHViS2V5OiB0aGlzLmN5cGhlci5wdWJLZXksXG4gICAgICAgIGhhc2gsXG4gICAgICAgIHNpZ246IHRoaXMuY3lwaGVyLmVuY3J5cHQoaGFzaCksXG4gICAgICAgIHNpemU6IGNodW5rcy5sZW5ndGhcbiAgICAgIH07XG4gICAgICBjb25zdCBuZXR3b3JrID0gbmV0d29ya0Zvcm1hdChzZW5kZXIsIGRlZi5TVE9SRV9DSFVOS1MsIHNlbmREYXRhKTtcblxuICAgICAgY29uc29sZS5sb2coZGVmLlNUT1JFLCBcIm5leHRcIiwgcGVlci5ub2RlSWQsIFwidGFyZ2V0XCIsIGtleSk7XG4gICAgICBwZWVyLnNlbmQobmV0d29yaywgXCJrYWRcIik7XG4gICAgfSk7XG4gICAgLy/jg6zjg5fjg6rjgrHjg7zjgrfjg6fjg7NcbiAgICB0aGlzLmtleVZhbHVlTGlzdFtrZXldID0geyBjaHVua3MgfTtcbiAgfVxuXG4gIGZpbmROb2RlKHRhcmdldElkOiBzdHJpbmcsIHBlZXI6IFdlYlJUQykge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZTxXZWJSVEM+KGFzeW5jIChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKFwiZmluZG5vZGVcIiwgdGFyZ2V0SWQpO1xuICAgICAgdGhpcy5zdGF0ZS5maW5kTm9kZSA9IHRhcmdldElkO1xuICAgICAgY29uc3Qgc2VuZERhdGEgPSB7IHRhcmdldEtleTogdGFyZ2V0SWQgfTtcbiAgICAgIC8v6YCB44KLXG4gICAgICBwZWVyLnNlbmQobmV0d29ya0Zvcm1hdCh0aGlzLm5vZGVJZCwgZGVmLkZJTkROT0RFLCBzZW5kRGF0YSksIFwia2FkXCIpO1xuXG4gICAgICB0aGlzLmNhbGxiYWNrLl9vbkZpbmROb2RlKChub2RlSWQ6IHN0cmluZykgPT4ge1xuICAgICAgICBleGN1dGVFdmVudCh0aGlzLmV2ZW50cy5maW5kbm9kZSwgbm9kZUlkKTtcbiAgICAgICAgcmVzb2x2ZSh0aGlzLmYuZ2V0UGVlckZyb21ub2RlSWQobm9kZUlkKSk7XG4gICAgICB9KTtcblxuICAgICAgYXdhaXQgbmV3IFByb21pc2UociA9PiBzZXRUaW1lb3V0KHIsIDEwICogMTAwMCkpO1xuICAgICAgcmVqZWN0KFwidGltZW91dCBmaW5kbm9kZVwiKTtcbiAgICB9KTtcbiAgfVxuXG4gIGZpbmRWYWx1ZShrZXk6IHN0cmluZywgb3B0PzogeyBvd25lcklkPzogc3RyaW5nIH0pIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2U8YW55Pihhc3luYyAocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICB0aGlzLmNhbGxiYWNrLl9vbkZpbmRWYWx1ZSA9IHZhbHVlID0+IHtcbiAgICAgICAgZXhjdXRlRXZlbnQodGhpcy5ldmVudHMuZmluZHZhbHVlLCB2YWx1ZSk7XG4gICAgICAgIHJlc29sdmUodmFsdWUpO1xuICAgICAgfTtcbiAgICAgIC8va2V544Gr6L+R44GE44OU44Ki44KS5Y+W5b6XXG4gICAgICBjb25zdCBwZWVycyA9IHRoaXMuZi5nZXRDbG9zZVBlZXJzKGtleSk7XG4gICAgICBwZWVycy5mb3JFYWNoKHBlZXIgPT4ge1xuICAgICAgICB0aGlzLmRvRmluZHZhbHVlKGtleSwgcGVlcik7XG4gICAgICB9KTtcblxuICAgICAgYXdhaXQgbmV3IFByb21pc2UociA9PiBzZXRUaW1lb3V0KHIsIDUwMDApKTtcbiAgICAgIGlmIChvcHQgJiYgb3B0Lm93bmVySWQpIHtcbiAgICAgICAgY29uc3Qgb3duZXJJZCA9IG9wdC5vd25lcklkO1xuICAgICAgICBjb25zdCBwZWVycyA9IHRoaXMuZi5nZXRDbG9zZVBlZXJzKG93bmVySWQpO1xuICAgICAgICBwZWVycy5mb3JFYWNoKHBlZXIgPT4ge1xuICAgICAgICAgIHRoaXMuZG9GaW5kdmFsdWUob3duZXJJZCwgcGVlcik7XG4gICAgICAgIH0pO1xuICAgICAgICBhd2FpdCBuZXcgUHJvbWlzZShyID0+IHNldFRpbWVvdXQociwgNTAwMCkpO1xuICAgICAgfVxuICAgICAgcmVqZWN0KFwiZmluZHZhbHVlIHRpbWVvdXRcIik7XG4gICAgfSk7XG4gIH1cblxuICBhc3luYyBkb0ZpbmR2YWx1ZShrZXk6IHN0cmluZywgcGVlcjogV2ViUlRDKSB7XG4gICAgY29uc29sZS5sb2coXCJkb2ZpbmR2YWx1ZVwiLCBwZWVyLm5vZGVJZCk7XG4gICAgY29uc3Qgc2VuZERhdGE6IEZpbmRWYWx1ZSA9IHsgdGFyZ2V0S2V5OiBrZXkgfTtcbiAgICBwZWVyLnNlbmQobmV0d29ya0Zvcm1hdCh0aGlzLm5vZGVJZCwgZGVmLkZJTkRWQUxVRSwgc2VuZERhdGEpLCBcImthZFwiKTtcbiAgfVxuXG4gIGNvbm5lY3QocGVlcjogV2ViUlRDKSB7XG4gICAgY29uc29sZS5sb2coXCJrYWQgY29ubmVjdFwiKTtcbiAgICBpZiAodGhpcy5zdGF0ZS5pc0ZpcnN0Q29ubmVjdCkgdGhpcy5jYWxsYmFjay5vbkNvbm5lY3QoKTtcbiAgICB0aGlzLnN0YXRlLmlzRmlyc3RDb25uZWN0ID0gZmFsc2U7XG4gICAgdGhpcy5hZGRrbm9kZShwZWVyKTtcbiAgfVxuXG4gIGFkZGtub2RlKHBlZXI6IFdlYlJUQykge1xuICAgIHBlZXIuZXZlbnRzLmRhdGFbXCJrYWRlbWxpYS50c1wiXSA9IHJhdyA9PiB7XG4gICAgICB0aGlzLm9uQ29tbWFuZChyYXcpO1xuICAgIH07XG5cbiAgICBwZWVyLmRpc2Nvbm5lY3QgPSAoKSA9PiB7XG4gICAgICBjb25zb2xlLmxvZyhcImthZCBub2RlIGRpc2Nvbm5lY3RlZFwiKTtcbiAgICAgIHRoaXMuZi5jbGVhbkRpc2NvbigpO1xuICAgICAgdGhpcy5jYWxsYmFjay5vbkFkZFBlZXIodGhpcy5mLmdldEFsbFBlZXJJZHMoKSk7XG4gICAgfTtcblxuICAgIGlmICghdGhpcy5mLmlzTm9kZUV4aXN0KHBlZXIubm9kZUlkKSkge1xuICAgICAgLy/oh6rliIbjga7jg47jg7zjg4lJROOBqOi/veWKoOOBmeOCi+ODjuODvOODiUlE44Gu6Led6ZuiXG4gICAgICBjb25zdCBudW0gPSBkaXN0YW5jZSh0aGlzLm5vZGVJZCwgcGVlci5ub2RlSWQpO1xuICAgICAgLy9rYnVja2V0c+OBruipsuW9k+OBmeOCi+i3nembouOBrmtidWNrZXTjgpLlkbzjgbPlh7rjgZlcbiAgICAgIGNvbnN0IGtidWNrZXQgPSB0aGlzLmtidWNrZXRzW251bV07XG4gICAgICAvL+ipsuW9k+OBmeOCi2tidWNrZXTjgavmlrDjgZfjgYTjg5TjgqLjgpLliqDjgYjjgotcbiAgICAgIGtidWNrZXQucHVzaChwZWVyKTtcblxuICAgICAgY29uc29sZS5sb2coXCJhZGRrbm9kZSBrYnVja2V0c1wiLCBcInBlZXIubm9kZUlkOlwiLCBwZWVyLm5vZGVJZCk7XG4gICAgICBjb25zb2xlLmxvZyh0aGlzLmYuZ2V0QWxsUGVlcklkcygpKTtcblxuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHRoaXMuZmluZE5ld1BlZXIocGVlcik7XG4gICAgICB9LCAxMDAwKTtcblxuICAgICAgdGhpcy5jYWxsYmFjay5vbkFkZFBlZXIodGhpcy5mLmdldEFsbFBlZXJJZHMoKSk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBmaW5kTmV3UGVlcihwZWVyOiBXZWJSVEMpIHtcbiAgICBpZiAodGhpcy5mLmdldEtidWNrZXROdW0oKSA8IHRoaXMuaykge1xuICAgICAgLy/oh6rouqvjga7jg47jg7zjg4lJROOCkmtleeOBqOOBl+OBpkZJTkRfTk9ERVxuICAgICAgYXdhaXQgdGhpcy5maW5kTm9kZSh0aGlzLm5vZGVJZCwgcGVlcikuY2F0Y2goY29uc29sZS5sb2cpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmxvZyhcImtidWNrZXQgcmVhZHlcIiwgdGhpcy5mLmdldEtidWNrZXROdW0oKSk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBtYWludGFpbihuZXR3b3JrOiBhbnkpIHtcbiAgICBjb25zdCBpbnggPSBkaXN0YW5jZSh0aGlzLm5vZGVJZCwgbmV0d29yay5ub2RlSWQpO1xuICAgIGNvbnN0IGtidWNrZXQgPSB0aGlzLmtidWNrZXRzW2lueF07XG5cbiAgICAvL+mAgeS/oeWFg+OBjOipsuW9k+OBmeOCi2stYnVja2V044Gu5Lit44Gr44GC44Gj44Gf5aC05ZCIXG4gICAgLy/jgZ3jga7jg47jg7zjg4njgpJrLWJ1Y2tldOOBruacq+WwvuOBq+enu+OBmVxuICAgIGtidWNrZXQuZm9yRWFjaCgocGVlciwgaSkgPT4ge1xuICAgICAgaWYgKHBlZXIubm9kZUlkID09PSBuZXR3b3JrLm5vZGVJZCkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIm1haW50YWluXCIsIFwiTW92ZXPCoGl0wqB0b8KgdGhlwqB0YWlswqBvZsKgdGhlwqBsaXN0XCIpO1xuICAgICAgICBrYnVja2V0LnNwbGljZShpLCAxKTtcbiAgICAgICAga2J1Y2tldC5wdXNoKHBlZXIpO1xuICAgICAgICByZXR1cm4gMDtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vay1idWNrZXTjgYzjgZnjgafjgavmuoDmna/jgarloLTlkIjjgIFcbiAgICAvL+OBneOBrmstYnVja2V05Lit44Gu5YWI6aCt44Gu44OO44O844OJ44GM44Kq44Oz44Op44Kk44Oz44Gq44KJ5YWI6aCt44Gu44OO44O844OJ44KS5q6L44GZXG4gICAgaWYgKGtidWNrZXQubGVuZ3RoID4gdGhpcy5rKSB7XG4gICAgICBrYnVja2V0LnNoaWZ0KCk7XG4gICAgfVxuICB9XG5cbiAgb2ZmZXIodGFyZ2V0OiBzdHJpbmcsIHByb3h5ID0gbnVsbCkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZTxhbnk+KGFzeW5jIChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGNvbnN0IHIgPSB0aGlzLnJlZjtcbiAgICAgIGNvbnN0IHBlZXIgPSAoclt0YXJnZXRdID0gbmV3IFdlYlJUQygpKTtcbiAgICAgIHBlZXIubWFrZU9mZmVyKCk7XG5cbiAgICAgIGNvbnN0IHRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgcmVqZWN0KFwia2FkIG9mZmVyIHRpbWVvdXRcIik7XG4gICAgICB9LCA1ICogMTAwMCk7XG5cbiAgICAgIHBlZXIuc2lnbmFsID0gc2RwID0+IHtcbiAgICAgICAgY29uc29sZS5sb2coXCJrYWQgb2ZmZXIgc3RvcmVcIiwgdGFyZ2V0KTtcbiAgICAgICAgY29uc3QgXyA9IHRoaXMuZi5nZXRDbG9zZUVzdFBlZXIodGFyZ2V0KTtcbiAgICAgICAgaWYgKCFfKSByZXR1cm47XG4gICAgICAgIGlmIChfLm5vZGVJZCAhPT0gdGFyZ2V0KVxuICAgICAgICAgIHRoaXMuc3RvcmUodGhpcy5ub2RlSWQsIHRhcmdldCwgeyBzZHAsIHByb3h5IH0pO1xuICAgICAgfTtcblxuICAgICAgcGVlci5jb25uZWN0ID0gKCkgPT4ge1xuICAgICAgICBwZWVyLm5vZGVJZCA9IHRhcmdldDtcbiAgICAgICAgY29uc29sZS5sb2coXCJrYWQgb2ZmZXIgY29ubmVjdGVkXCIsIHRhcmdldCk7XG4gICAgICAgIHRoaXMuYWRka25vZGUocGVlcik7XG4gICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KTtcbiAgICAgICAgcmVzb2x2ZSh0cnVlKTtcbiAgICAgIH07XG4gICAgfSk7XG4gIH1cblxuICBhbnN3ZXIodGFyZ2V0OiBzdHJpbmcsIHNkcDogc3RyaW5nLCBwcm94eTogc3RyaW5nKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlPGFueT4oYXN5bmMgKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY29uc3QgciA9IHRoaXMucmVmO1xuICAgICAgY29uc3QgcGVlciA9IChyW3RhcmdldF0gPSBuZXcgV2ViUlRDKCkpO1xuICAgICAgcGVlci5tYWtlQW5zd2VyKHNkcCk7XG4gICAgICBjb25zb2xlLmxvZyhcImthZCBhbnN3ZXJcIiwgdGFyZ2V0KTtcblxuICAgICAgY29uc3QgdGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICByZWplY3QoXCJrYWQgYW5zd2VyIHRpbWVvdXRcIik7XG4gICAgICB9LCA1ICogMTAwMCk7XG5cbiAgICAgIHBlZXIuc2lnbmFsID0gc2RwID0+IHtcbiAgICAgICAgY29uc3QgXyA9IHRoaXMuZi5nZXRQZWVyRnJvbW5vZGVJZChwcm94eSk7XG4gICAgICAgIGNvbnN0IGhhc2ggPSBzaGExKE1hdGgucmFuZG9tKCkudG9TdHJpbmcoKSkudG9TdHJpbmcoKTtcbiAgICAgICAgY29uc3Qgc2VuZERhdGE6IFN0b3JlRm9ybWF0ID0ge1xuICAgICAgICAgIHNlbmRlcjogdGhpcy5ub2RlSWQsXG4gICAgICAgICAga2V5OiB0YXJnZXQsXG4gICAgICAgICAgdmFsdWU6IHsgc2RwIH0sXG4gICAgICAgICAgcHViS2V5OiB0aGlzLmN5cGhlci5wdWJLZXksXG4gICAgICAgICAgaGFzaCxcbiAgICAgICAgICBzaWduOiB0aGlzLmN5cGhlci5lbmNyeXB0KGhhc2gpXG4gICAgICAgIH07XG4gICAgICAgIGlmIChfKSBfLnNlbmQobmV0d29ya0Zvcm1hdCh0aGlzLm5vZGVJZCwgZGVmLlNUT1JFLCBzZW5kRGF0YSksIFwia2FkXCIpO1xuICAgICAgfTtcblxuICAgICAgcGVlci5jb25uZWN0ID0gKCkgPT4ge1xuICAgICAgICBwZWVyLm5vZGVJZCA9IHRhcmdldDtcbiAgICAgICAgY29uc29sZS5sb2coXCJrYWQgYW5zd2VyIGNvbm5lY3RlZFwiLCB0YXJnZXQpO1xuICAgICAgICB0aGlzLmFkZGtub2RlKHBlZXIpO1xuICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dCk7XG4gICAgICAgIHJlc29sdmUodHJ1ZSk7XG4gICAgICB9O1xuICAgIH0pO1xuICB9XG5cbiAgYXN5bmMgc2VuZChcbiAgICB0YXJnZXQ6IHN0cmluZyxcbiAgICBkYXRhOiB7IHRleHQ/OiBzdHJpbmc7IGZpbGU/OiB7IG5hbWU6IHN0cmluZzsgdmFsdWU6IEFycmF5QnVmZmVyW10gfSB9XG4gICkge1xuICAgIGNvbnN0IHNlbmQgPSBhc3luYyAocGVlcjogV2ViUlRDKSA9PiB7XG4gICAgICBjb25zdCBic29uID0gbmV3IEJTT04oKTtcbiAgICAgIGNvbnN0IHBhY2tldDogcDJwTWVzc2FnZSA9IHtcbiAgICAgICAgc2VuZGVyOiB0aGlzLm5vZGVJZCxcbiAgICAgICAgdGFyZ2V0XG4gICAgICB9O1xuICAgICAgaWYgKGRhdGEudGV4dCkge1xuICAgICAgICBwYWNrZXQudGV4dCA9IGRhdGEudGV4dDtcbiAgICAgICAgY29uc3QgYmluID0gYnNvbi5zZXJpYWxpemUocGFja2V0KTtcbiAgICAgICAgcGVlci5zZW5kKGJpbiwgXCJwMnBcIik7XG4gICAgICB9IGVsc2UgaWYgKGRhdGEuZmlsZSkge1xuICAgICAgICBjb25zdCBmaWxlID0gZGF0YS5maWxlO1xuXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZmlsZS52YWx1ZS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGNvbnN0IGNodW5rID0gZmlsZS52YWx1ZVtpXTtcbiAgICAgICAgICBwYWNrZXQuZmlsZSA9IHtcbiAgICAgICAgICAgIGluZGV4OiBpLFxuICAgICAgICAgICAgbGVuZ3RoOiBmaWxlLnZhbHVlLmxlbmd0aCxcbiAgICAgICAgICAgIGNodW5rOiBCdWZmZXIuZnJvbShjaHVuayksXG4gICAgICAgICAgICBmaWxlbmFtZTogZmlsZS5uYW1lXG4gICAgICAgICAgfTtcbiAgICAgICAgICBjb25zdCBiaW4gPSBic29uLnNlcmlhbGl6ZShwYWNrZXQpO1xuICAgICAgICAgIHBlZXIuc2VuZChiaW4sIFwicDJwXCIpO1xuICAgICAgICAgIGF3YWl0IG5ldyBQcm9taXNlKHIgPT4gc2V0VGltZW91dChyLCAxMCkpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiBuZXcgUHJvbWlzZTxhbnk+KGFzeW5jIChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGNvbnN0IHBlZXIgPSB0aGlzLmYuZ2V0UGVlckZyb21ub2RlSWQodGFyZ2V0KTtcbiAgICAgIGlmIChwZWVyKSB7XG4gICAgICAgIGF3YWl0IHNlbmQocGVlcik7XG4gICAgICAgIHJlc29sdmUodHJ1ZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBjbG9zZSA9IHRoaXMuZi5nZXRDbG9zZUVzdFBlZXIodGFyZ2V0KTtcbiAgICAgICAgaWYgKCFjbG9zZSkgcmV0dXJuO1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0aGlzLmZpbmROb2RlKHRhcmdldCwgY2xvc2UpLmNhdGNoKGNvbnNvbGUubG9nKTtcbiAgICAgICAgaWYgKCFyZXN1bHQpIHJldHVybjtcbiAgICAgICAgYXdhaXQgc2VuZChyZXN1bHQpO1xuICAgICAgICByZXNvbHZlKHRydWUpO1xuICAgICAgfVxuICAgICAgYXdhaXQgbmV3IFByb21pc2UociA9PiBzZXRUaW1lb3V0KHIsIDEwICogMTAwMCkpO1xuICAgICAgcmVqZWN0KFwic2VuZCB0aW1lb3V0XCIpO1xuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBvbkNvbW1hbmQobWVzc2FnZTogbWVzc2FnZSkge1xuICAgIHN3aXRjaCAobWVzc2FnZS5sYWJlbCkge1xuICAgICAgY2FzZSBcImthZFwiOlxuICAgICAgICB7XG4gICAgICAgICAgY29uc3QgYnVmZmVyOiBCdWZmZXIgPSBCdWZmZXIuZnJvbShtZXNzYWdlLmRhdGEpO1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBuZXR3b3JrTGF5ZXI6IG5ldHdvcmsgPSBic29uLmRlc2VyaWFsaXplKGJ1ZmZlcik7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIm9uY29tbWFuZCBrYWRcIiwgeyBtZXNzYWdlIH0sIHsgbmV0d29ya0xheWVyIH0pO1xuICAgICAgICAgICAgaWYgKCFKU09OLnN0cmluZ2lmeSh0aGlzLmRhdGFMaXN0KS5pbmNsdWRlcyhuZXR3b3JrTGF5ZXIuaGFzaCkpIHtcbiAgICAgICAgICAgICAgdGhpcy5kYXRhTGlzdC5wdXNoKG5ldHdvcmtMYXllci5oYXNoKTtcbiAgICAgICAgICAgICAgdGhpcy5vblJlcXVlc3QobmV0d29ya0xheWVyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3IpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgXCJwMnBcIjpcbiAgICAgICAge1xuICAgICAgICAgIGNvbnN0IGJ1ZmZlcjogQnVmZmVyID0gQnVmZmVyLmZyb20obWVzc2FnZS5kYXRhKTtcbiAgICAgICAgICBjb25zdCBwYWNrZXQ6IHAycE1lc3NhZ2UgPSBic29uLmRlc2VyaWFsaXplKGJ1ZmZlcik7XG4gICAgICAgICAgaWYgKHBhY2tldC50ZXh0KSB7XG4gICAgICAgICAgICBjb25zdCBwYXlsb2FkOiBwMnBNZXNzYWdlRXZlbnQgPSB7XG4gICAgICAgICAgICAgIG5vZGVJZDogcGFja2V0LnNlbmRlcixcbiAgICAgICAgICAgICAgdGV4dDogcGFja2V0LnRleHRcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBleGN1dGVFdmVudCh0aGlzLmV2ZW50cy5wMnAsIHBheWxvYWQpO1xuICAgICAgICAgIH0gZWxzZSBpZiAocGFja2V0LmZpbGUpIHtcbiAgICAgICAgICAgIGlmIChwYWNrZXQuZmlsZS5pbmRleCA9PT0gMCkgdGhpcy5wMnBNc2dCdWZmZXJbcGFja2V0LnNlbmRlcl0gPSBbXTtcbiAgICAgICAgICAgIHRoaXMucDJwTXNnQnVmZmVyW3BhY2tldC5zZW5kZXJdLnB1c2gocGFja2V0LmZpbGUuY2h1bmsuYnVmZmVyKTtcbiAgICAgICAgICAgIGlmIChwYWNrZXQuZmlsZS5pbmRleCA9PT0gcGFja2V0LmZpbGUubGVuZ3RoIC0gMSkge1xuICAgICAgICAgICAgICBjb25zdCBwYXlsb2FkOiBwMnBNZXNzYWdlRXZlbnQgPSB7XG4gICAgICAgICAgICAgICAgbm9kZUlkOiBwYWNrZXQuc2VuZGVyLFxuICAgICAgICAgICAgICAgIGZpbGU6IHRoaXMucDJwTXNnQnVmZmVyW3BhY2tldC5zZW5kZXJdLFxuICAgICAgICAgICAgICAgIGZpbGVuYW1lOiBwYWNrZXQuZmlsZS5maWxlbmFtZVxuICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICBleGN1dGVFdmVudCh0aGlzLmV2ZW50cy5wMnAsIHBheWxvYWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIG9uUmVxdWVzdChuZXR3b3JrOiBhbnkpIHtcbiAgICB0aGlzLnJlc3BvbmRlci5yZXNwb25zZShuZXR3b3JrLnR5cGUsIG5ldHdvcmspO1xuICAgIHRoaXMubWFpbnRhaW4obmV0d29yayk7XG4gIH1cbn1cbiJdfQ==
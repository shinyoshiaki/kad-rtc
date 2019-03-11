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

    _defineProperty(this, "onResponder", {});

    _defineProperty(this, "events", {
      store: this.onStore,
      findvalue: this.onFindValue,
      findnode: this.onFindNode,
      responder: this.onResponder
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
                  _this2.state.findNode = targetId;
                  sendData = {
                    targetKey: targetId
                  }; //送る

                  peer.send((0, _KConst.networkFormat)(_this2.nodeId, _KConst.default.FINDNODE, sendData), "kad");

                  _this2.callback._onFindNode(function (nodeId) {
                    excuteEvent(_this2.events.findnode, nodeId);
                    resolve(_this2.f.getPeerFromnodeId(nodeId));
                  });

                  _context.next = 6;
                  return new Promise(function (r) {
                    return setTimeout(r, 10 * 1000);
                  });

                case 6:
                  reject("timeout findnode");

                case 7:
                case "end":
                  return _context.stop();
              }
            }
          }, _callee);
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
          }, _callee2);
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

      function doFindvalue(_x5, _x6) {
        return _doFindvalue.apply(this, arguments);
      }

      return doFindvalue;
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

      peer.onData.subscribe(function (raw) {
        _this4.onCommand(raw);
      });

      peer.disconnect = function () {
        console.log("kad node disconnected");

        _this4.f.cleanDiscon();

        _this4.callback.onAddPeer(_this4.f.getAllPeerIds());
      };

      if (!this.f.isNodeExist(peer.nodeId)) {
        var num = (0, _kadDistance.distance)(this.nodeId, peer.nodeId);
        var kbucket = this.kbuckets[num];
        kbucket.push(peer);
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
                console.log("kbucket fulled", this.f.getKbucketNum());

              case 6:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function findNewPeer(_x7) {
        return _findNewPeer.apply(this, arguments);
      }

      return findNewPeer;
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

      function maintain(_x8) {
        return _maintain.apply(this, arguments);
      }

      return maintain;
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
                    var close = _this5.f.getCloseEstPeer(target);

                    if (!close) return;
                    if (close.nodeId !== target) _this5.store(_this5.nodeId, target, {
                      sdp: sdp,
                      proxy: proxy
                    });
                  };

                  peer.connect = function () {
                    peer.nodeId = target;

                    _this5.addknode(peer);

                    clearTimeout(timeout);
                    resolve(true);
                  };

                case 6:
                case "end":
                  return _context6.stop();
              }
            }
          }, _callee6);
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
        regeneratorRuntime.mark(function _callee8(resolve, reject) {
          var r, peer, timeout;
          return regeneratorRuntime.wrap(function _callee8$(_context8) {
            while (1) {
              switch (_context8.prev = _context8.next) {
                case 0:
                  r = _this6.ref;
                  peer = r[target] = new _webrtc4me.default();
                  peer.setSdp(sdp);
                  timeout = setTimeout(function () {
                    reject("kad answer timeout");
                  }, 5 * 1000);

                  peer.signal =
                  /*#__PURE__*/
                  function () {
                    var _ref5 = _asyncToGenerator(
                    /*#__PURE__*/
                    regeneratorRuntime.mark(function _callee7(sdp) {
                      var p, hash, sendData;
                      return regeneratorRuntime.wrap(function _callee7$(_context7) {
                        while (1) {
                          switch (_context7.prev = _context7.next) {
                            case 0:
                              p = _this6.f.getPeerFromnodeId(proxy);

                              if (p) {
                                _context7.next = 3;
                                break;
                              }

                              return _context7.abrupt("return");

                            case 3:
                              hash = (0, _sha.default)(Math.random().toString()).toString();
                              sendData = {
                                sender: _this6.nodeId,
                                key: target,
                                value: {
                                  sdp: sdp
                                },
                                pubKey: _this6.cypher.pubKey,
                                hash: hash,
                                sign: _this6.cypher.encrypt(hash)
                              };
                              p.send((0, _KConst.networkFormat)(_this6.nodeId, _KConst.default.STORE, sendData), "kad");

                            case 6:
                            case "end":
                              return _context7.stop();
                          }
                        }
                      }, _callee7);
                    }));

                    return function (_x13) {
                      return _ref5.apply(this, arguments);
                    };
                  }();

                  peer.connect = function () {
                    peer.nodeId = target;

                    _this6.addknode(peer);

                    clearTimeout(timeout);
                    resolve(true);
                  };

                case 6:
                case "end":
                  return _context8.stop();
              }
            }
          }, _callee8);
        }));

        return function (_x11, _x12) {
          return _ref4.apply(this, arguments);
        };
      }());
    }
  }, {
    key: "onCommand",
    value: function onCommand(message) {
      if (message.label === "kad") {
        var buffer = Buffer.from(message.data);

        try {
          var networkLayer = bson.deserialize(buffer);

          if (!JSON.stringify(this.dataList).includes(networkLayer.hash)) {
            this.dataList.push(networkLayer.hash);
            this.onRequest(networkLayer);
          }
        } catch (error) {
          console.log(error);
        }
      } else {
        excuteEvent(this.events.responder, message);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9rYWQva2FkZW1saWEudHMiXSwibmFtZXMiOlsicmVxdWlyZSIsImJzb24iLCJCU09OIiwiZXhjdXRlRXZlbnQiLCJldiIsInYiLCJjb25zb2xlIiwibG9nIiwiT2JqZWN0Iiwia2V5cyIsImZvckVhY2giLCJrZXkiLCJLYWRlbWxpYSIsIm9wdCIsImlzRmlyc3RDb25uZWN0IiwiaXNPZmZlciIsImZpbmROb2RlIiwiaGFzaCIsIm9uQ29ubmVjdCIsIm9uQWRkUGVlciIsIm9uUGVlckRpc2Nvbm5lY3QiLCJfb25GaW5kVmFsdWUiLCJfb25GaW5kTm9kZSIsIm9uQXBwIiwic3RvcmUiLCJvblN0b3JlIiwiZmluZHZhbHVlIiwib25GaW5kVmFsdWUiLCJmaW5kbm9kZSIsIm9uRmluZE5vZGUiLCJyZXNwb25kZXIiLCJvblJlc3BvbmRlciIsImsiLCJrTGVuZ3RoIiwiY3lwaGVyIiwiQ3lwaGVyIiwic2VjS2V5IiwicHVia2V5Iiwibm9kZUlkIiwicHViS2V5IiwidG9TdHJpbmciLCJrYnVja2V0cyIsIkFycmF5IiwiaSIsImtidWNrZXQiLCJmIiwiSGVscGVyIiwiS1Jlc3BvbmRlciIsInNlbmRlciIsInZhbHVlIiwicGVlciIsImdldENsb3NlRXN0UGVlciIsIkpTT04iLCJzdHJpbmdpZnkiLCJzZW5kRGF0YSIsInNpZ24iLCJlbmNyeXB0IiwibmV0d29yayIsImRlZiIsIlNUT1JFIiwic2VuZCIsInNkcCIsImtleVZhbHVlTGlzdCIsImNodW5rcyIsImNodW5rIiwiQnVmZmVyIiwiZnJvbSIsImluZGV4Iiwic2l6ZSIsImxlbmd0aCIsIlNUT1JFX0NIVU5LUyIsInRhcmdldElkIiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZWplY3QiLCJzdGF0ZSIsInRhcmdldEtleSIsIkZJTkROT0RFIiwiY2FsbGJhY2siLCJldmVudHMiLCJnZXRQZWVyRnJvbW5vZGVJZCIsInIiLCJzZXRUaW1lb3V0IiwicGVlcnMiLCJnZXRDbG9zZVBlZXJzIiwiZG9GaW5kdmFsdWUiLCJvd25lcklkIiwiRklORFZBTFVFIiwiYWRka25vZGUiLCJvbkRhdGEiLCJzdWJzY3JpYmUiLCJyYXciLCJvbkNvbW1hbmQiLCJkaXNjb25uZWN0IiwiY2xlYW5EaXNjb24iLCJnZXRBbGxQZWVySWRzIiwiaXNOb2RlRXhpc3QiLCJudW0iLCJwdXNoIiwiZmluZE5ld1BlZXIiLCJnZXRLYnVja2V0TnVtIiwiY2F0Y2giLCJpbngiLCJzcGxpY2UiLCJzaGlmdCIsInRhcmdldCIsInByb3h5IiwicmVmIiwiV2ViUlRDIiwibWFrZU9mZmVyIiwidGltZW91dCIsInNpZ25hbCIsImNsb3NlIiwiY29ubmVjdCIsImNsZWFyVGltZW91dCIsInNldFNkcCIsInAiLCJNYXRoIiwicmFuZG9tIiwibWVzc2FnZSIsImxhYmVsIiwiYnVmZmVyIiwiZGF0YSIsIm5ldHdvcmtMYXllciIsImRlc2VyaWFsaXplIiwiZGF0YUxpc3QiLCJpbmNsdWRlcyIsIm9uUmVxdWVzdCIsImVycm9yIiwicmVzcG9uc2UiLCJ0eXBlIiwibWFpbnRhaW4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQVJBQSxPQUFPLENBQUMsZ0JBQUQsQ0FBUDs7QUFhQSxJQUFNQyxJQUFJLEdBQUcsSUFBSUMsVUFBSixFQUFiOztBQUNPLFNBQVNDLFdBQVQsQ0FBcUJDLEVBQXJCLEVBQThCQyxDQUE5QixFQUF1QztBQUM1Q0MsRUFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVksYUFBWixFQUEyQkgsRUFBM0I7QUFDQUksRUFBQUEsTUFBTSxDQUFDQyxJQUFQLENBQVlMLEVBQVosRUFBZ0JNLE9BQWhCLENBQXdCLFVBQUFDLEdBQUcsRUFBSTtBQUM3QlAsSUFBQUEsRUFBRSxDQUFDTyxHQUFELENBQUYsQ0FBUU4sQ0FBUjtBQUNELEdBRkQ7QUFHRDs7SUFFb0JPLFE7OztBQXVDbkIsb0JBQVlDLEdBQVosRUFBMEU7QUFBQTs7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QUEsVUFBUDtBQStCRDs7OzhCQUVpQjhDLE8sRUFBa0I7QUFDbEMsVUFBSUEsT0FBTyxDQUFDQyxLQUFSLEtBQWtCLEtBQXRCLEVBQTZCO0FBQzNCLFlBQU1DLE1BQWMsR0FBR3hELE1BQU0sQ0FBQ0MsSUFBUCxDQUFZcUQsT0FBTyxDQUFDRyxJQUFwQixDQUF2Qjs7QUFDQSxZQUFJO0FBQ0YsY0FBTUMsWUFBcUIsR0FBRzFILElBQUksQ0FBQzJILFdBQUwsQ0FBaUJILE1BQWpCLENBQTlCOztBQUNBLGNBQUksQ0FBQ3JFLElBQUksQ0FBQ0MsU0FBTCxDQUFlLEtBQUt3RSxRQUFwQixFQUE4QkMsUUFBOUIsQ0FBdUNILFlBQVksQ0FBQzFHLElBQXBELENBQUwsRUFBZ0U7QUFDOUQsaUJBQUs0RyxRQUFMLENBQWMzQixJQUFkLENBQW1CeUIsWUFBWSxDQUFDMUcsSUFBaEM7QUFDQSxpQkFBSzhHLFNBQUwsQ0FBZUosWUFBZjtBQUNEO0FBQ0YsU0FORCxDQU1FLE9BQU9LLEtBQVAsRUFBYztBQUNkMUgsVUFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVl5SCxLQUFaO0FBQ0Q7QUFDRixPQVhELE1BV087QUFDTDdILFFBQUFBLFdBQVcsQ0FBQyxLQUFLNEUsTUFBTCxDQUFZakQsU0FBYixFQUF3QnlGLE9BQXhCLENBQVg7QUFDRDtBQUNGOzs7OEJBRWlCOUQsTyxFQUFjO0FBQzlCLFdBQUszQixTQUFMLENBQWVtRyxRQUFmLENBQXdCeEUsT0FBTyxDQUFDeUUsSUFBaEMsRUFBc0N6RSxPQUF0QztBQUNBLFdBQUswRSxRQUFMLENBQWMxRSxPQUFkO0FBQ0QiLCJzb3VyY2VzQ29udGVudCI6WyJyZXF1aXJlKFwiYmFiZWwtcG9seWZpbGxcIik7XG5pbXBvcnQgV2ViUlRDIGZyb20gXCJ3ZWJydGM0bWVcIjtcbmltcG9ydCBIZWxwZXIgZnJvbSBcIi4va1V0aWxcIjtcbmltcG9ydCBLUmVzcG9uZGVyIGZyb20gXCIuL2tSZXNwb25kZXJcIjtcbmltcG9ydCBkZWYsIHsgbmV0d29ya0Zvcm1hdCB9IGZyb20gXCIuL0tDb25zdFwiO1xuaW1wb3J0IHsgZGlzdGFuY2UgfSBmcm9tIFwia2FkLWRpc3RhbmNlXCI7XG5pbXBvcnQgeyBCU09OIH0gZnJvbSBcImJzb25cIjtcbmltcG9ydCBDeXBoZXIgZnJvbSBcIi4uL2xpYi9jeXBoZXJcIjtcbmltcG9ydCBzaGExIGZyb20gXCJzaGExXCI7XG5pbXBvcnQgeyBJRXZlbnRzIH0gZnJvbSBcIi4uL3V0aWxcIjtcbmltcG9ydCB7IFN0b3JlRm9ybWF0LCBTdG9yZUNodW5rcywgRmluZFZhbHVlLCBuZXR3b3JrIH0gZnJvbSBcIi4vaW50ZXJmYWNlXCI7XG5pbXBvcnQgeyBtZXNzYWdlIH0gZnJvbSBcIndlYnJ0YzRtZS9saWIvaW50ZXJmYWNlXCI7XG5cbmNvbnN0IGJzb24gPSBuZXcgQlNPTigpO1xuZXhwb3J0IGZ1bmN0aW9uIGV4Y3V0ZUV2ZW50KGV2OiBhbnksIHY/OiBhbnkpIHtcbiAgY29uc29sZS5sb2coXCJleGN1dGVFdmVudFwiLCBldik7XG4gIE9iamVjdC5rZXlzKGV2KS5mb3JFYWNoKGtleSA9PiB7XG4gICAgZXZba2V5XSh2KTtcbiAgfSk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEthZGVtbGlhIHtcbiAgbm9kZUlkOiBzdHJpbmc7XG4gIGs6IG51bWJlcjtcbiAga2J1Y2tldHM6IFdlYlJUQ1tdW107XG4gIGY6IEhlbHBlcjtcbiAgcmVzcG9uZGVyOiBLUmVzcG9uZGVyO1xuICBkYXRhTGlzdDogQXJyYXk8YW55PiA9IFtdO1xuICBrZXlWYWx1ZUxpc3Q6IHsgW2tleTogc3RyaW5nXTogYW55IH0gPSB7fTtcbiAgcmVmOiB7IFtrZXk6IHN0cmluZ106IFdlYlJUQyB9ID0ge307XG4gIGJ1ZmZlcjogeyBba2V5OiBzdHJpbmddOiBBcnJheTxhbnk+IH0gPSB7fTtcblxuICBzdGF0ZSA9IHtcbiAgICBpc0ZpcnN0Q29ubmVjdDogdHJ1ZSxcbiAgICBpc09mZmVyOiBmYWxzZSxcbiAgICBmaW5kTm9kZTogXCJcIixcbiAgICBoYXNoOiB7fVxuICB9O1xuXG4gIGNhbGxiYWNrID0ge1xuICAgIG9uQ29ubmVjdDogKCkgPT4ge30sXG4gICAgb25BZGRQZWVyOiAodj86IGFueSkgPT4ge30sXG4gICAgb25QZWVyRGlzY29ubmVjdDogKHY/OiBhbnkpID0+IHt9LFxuICAgIF9vbkZpbmRWYWx1ZTogKHY/OiBhbnkpID0+IHt9LFxuICAgIF9vbkZpbmROb2RlOiAodj86IGFueSkgPT4ge30sXG4gICAgb25BcHA6ICh2PzogYW55KSA9PiB7fVxuICB9O1xuXG4gIHByaXZhdGUgb25TdG9yZTogSUV2ZW50cyA9IHt9O1xuICBwcml2YXRlIG9uRmluZFZhbHVlOiBJRXZlbnRzID0ge307XG4gIHByaXZhdGUgb25GaW5kTm9kZTogSUV2ZW50cyA9IHt9O1xuICBwcml2YXRlIG9uUmVzcG9uZGVyOiBJRXZlbnRzID0ge307XG4gIGV2ZW50cyA9IHtcbiAgICBzdG9yZTogdGhpcy5vblN0b3JlLFxuICAgIGZpbmR2YWx1ZTogdGhpcy5vbkZpbmRWYWx1ZSxcbiAgICBmaW5kbm9kZTogdGhpcy5vbkZpbmROb2RlLFxuICAgIHJlc3BvbmRlcjogdGhpcy5vblJlc3BvbmRlclxuICB9O1xuICBjeXBoZXI6IEN5cGhlcjtcblxuICBjb25zdHJ1Y3RvcihvcHQ/OiB7IHB1YmtleT86IHN0cmluZzsgc2VjS2V5Pzogc3RyaW5nOyBrTGVuZ3RoPzogbnVtYmVyIH0pIHtcbiAgICB0aGlzLmsgPSAyMDtcbiAgICBpZiAob3B0ICYmIG9wdC5rTGVuZ3RoKSB0aGlzLmsgPSBvcHQua0xlbmd0aDtcbiAgICBpZiAob3B0KSB0aGlzLmN5cGhlciA9IG5ldyBDeXBoZXIob3B0LnNlY0tleSwgb3B0LnB1YmtleSk7XG4gICAgZWxzZSB0aGlzLmN5cGhlciA9IG5ldyBDeXBoZXIoKTtcbiAgICB0aGlzLm5vZGVJZCA9IHNoYTEodGhpcy5jeXBoZXIucHViS2V5KS50b1N0cmluZygpO1xuXG4gICAgdGhpcy5rYnVja2V0cyA9IG5ldyBBcnJheSgxNjApO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgMTYwOyBpKyspIHtcbiAgICAgIGxldCBrYnVja2V0OiBBcnJheTxhbnk+ID0gW107XG4gICAgICB0aGlzLmtidWNrZXRzW2ldID0ga2J1Y2tldDtcbiAgICB9XG5cbiAgICB0aGlzLmYgPSBuZXcgSGVscGVyKHRoaXMuaywgdGhpcy5rYnVja2V0cywgdGhpcy5ub2RlSWQpO1xuICAgIHRoaXMucmVzcG9uZGVyID0gbmV3IEtSZXNwb25kZXIodGhpcyk7XG4gIH1cblxuICBzdG9yZShzZW5kZXI6IHN0cmluZywga2V5OiBzdHJpbmcsIHZhbHVlOiBhbnksIG9wdD86IHsgZXhjbHVkZUlkPzogc3RyaW5nIH0pIHtcbiAgICBjb25zdCBwZWVyID0gdGhpcy5mLmdldENsb3NlRXN0UGVlcihrZXksIG9wdCk7XG4gICAgaWYgKCFwZWVyKSByZXR1cm47XG4gICAgY29uc3QgaGFzaCA9IHNoYTEoSlNPTi5zdHJpbmdpZnkodmFsdWUpKS50b1N0cmluZygpO1xuICAgIGNvbnN0IHNlbmREYXRhOiBTdG9yZUZvcm1hdCA9IHtcbiAgICAgIHNlbmRlcixcbiAgICAgIGtleSxcbiAgICAgIHZhbHVlLFxuICAgICAgcHViS2V5OiB0aGlzLmN5cGhlci5wdWJLZXksXG4gICAgICBoYXNoLFxuICAgICAgc2lnbjogdGhpcy5jeXBoZXIuZW5jcnlwdChoYXNoKVxuICAgIH07XG4gICAgY29uc3QgbmV0d29yayA9IG5ldHdvcmtGb3JtYXQodGhpcy5ub2RlSWQsIGRlZi5TVE9SRSwgc2VuZERhdGEpO1xuXG4gICAgY29uc29sZS5sb2coZGVmLlNUT1JFLCBcIm5leHRcIiwgcGVlci5ub2RlSWQsIFwidGFyZ2V0XCIsIGtleSk7XG4gICAgcGVlci5zZW5kKG5ldHdvcmssIFwia2FkXCIpO1xuICAgIC8vbm8gc2RwXG4gICAgaWYgKCF2YWx1ZS5zZHApIHRoaXMua2V5VmFsdWVMaXN0W2tleV0gPSB2YWx1ZTtcbiAgfVxuXG4gIHN0b3JlQ2h1bmtzKFxuICAgIHNlbmRlcjogc3RyaW5nLFxuICAgIGtleTogc3RyaW5nLFxuICAgIGNodW5rczogQXJyYXlCdWZmZXJbXSxcbiAgICBvcHQ/OiB7IGV4Y2x1ZGVJZD86IHN0cmluZyB9XG4gICkge1xuICAgIC8vIGNvbnN0IHBlZXJzID0gdGhpcy5mLmdldENsb3NlUGVlcnMoa2V5LCBvcHQpO1xuICAgIGNvbnN0IHBlZXIgPSB0aGlzLmYuZ2V0Q2xvc2VFc3RQZWVyKGtleSwgb3B0KTtcbiAgICBpZiAoIXBlZXIpIHJldHVybjtcbiAgICBjb25zb2xlLmxvZyhcInN0b3JlIGNodW5rc1wiLCB7IGNodW5rcyB9KTtcbiAgICBjaHVua3MuZm9yRWFjaCgoY2h1bmssIGkpID0+IHtcbiAgICAgIGNvbnN0IGhhc2ggPSBzaGExKEJ1ZmZlci5mcm9tKGNodW5rKSkudG9TdHJpbmcoKTtcbiAgICAgIGNvbnN0IHNlbmREYXRhOiBTdG9yZUNodW5rcyA9IHtcbiAgICAgICAgc2VuZGVyOiB0aGlzLm5vZGVJZCxcbiAgICAgICAga2V5LFxuICAgICAgICB2YWx1ZTogQnVmZmVyLmZyb20oY2h1bmspLFxuICAgICAgICBpbmRleDogaSxcbiAgICAgICAgcHViS2V5OiB0aGlzLmN5cGhlci5wdWJLZXksXG4gICAgICAgIGhhc2gsXG4gICAgICAgIHNpZ246IHRoaXMuY3lwaGVyLmVuY3J5cHQoaGFzaCksXG4gICAgICAgIHNpemU6IGNodW5rcy5sZW5ndGhcbiAgICAgIH07XG4gICAgICBjb25zdCBuZXR3b3JrID0gbmV0d29ya0Zvcm1hdChzZW5kZXIsIGRlZi5TVE9SRV9DSFVOS1MsIHNlbmREYXRhKTtcblxuICAgICAgY29uc29sZS5sb2coZGVmLlNUT1JFLCBcIm5leHRcIiwgcGVlci5ub2RlSWQsIFwidGFyZ2V0XCIsIGtleSk7XG4gICAgICBwZWVyLnNlbmQobmV0d29yaywgXCJrYWRcIik7XG4gICAgfSk7XG4gICAgLy/jg6zjg5fjg6rjgrHjg7zjgrfjg6fjg7NcbiAgICB0aGlzLmtleVZhbHVlTGlzdFtrZXldID0geyBjaHVua3MgfTtcbiAgfVxuXG4gIGZpbmROb2RlKHRhcmdldElkOiBzdHJpbmcsIHBlZXI6IFdlYlJUQykge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZTxXZWJSVEM+KGFzeW5jIChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIHRoaXMuc3RhdGUuZmluZE5vZGUgPSB0YXJnZXRJZDtcbiAgICAgIGNvbnN0IHNlbmREYXRhID0geyB0YXJnZXRLZXk6IHRhcmdldElkIH07XG4gICAgICAvL+mAgeOCi1xuICAgICAgcGVlci5zZW5kKG5ldHdvcmtGb3JtYXQodGhpcy5ub2RlSWQsIGRlZi5GSU5ETk9ERSwgc2VuZERhdGEpLCBcImthZFwiKTtcblxuICAgICAgdGhpcy5jYWxsYmFjay5fb25GaW5kTm9kZSgobm9kZUlkOiBzdHJpbmcpID0+IHtcbiAgICAgICAgZXhjdXRlRXZlbnQodGhpcy5ldmVudHMuZmluZG5vZGUsIG5vZGVJZCk7XG4gICAgICAgIHJlc29sdmUodGhpcy5mLmdldFBlZXJGcm9tbm9kZUlkKG5vZGVJZCkpO1xuICAgICAgfSk7XG5cbiAgICAgIGF3YWl0IG5ldyBQcm9taXNlKHIgPT4gc2V0VGltZW91dChyLCAxMCAqIDEwMDApKTtcbiAgICAgIHJlamVjdChcInRpbWVvdXQgZmluZG5vZGVcIik7XG4gICAgfSk7XG4gIH1cblxuICBmaW5kVmFsdWUoa2V5OiBzdHJpbmcsIG9wdD86IHsgb3duZXJJZD86IHN0cmluZyB9KSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlPGFueT4oYXN5bmMgKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgdGhpcy5jYWxsYmFjay5fb25GaW5kVmFsdWUgPSB2YWx1ZSA9PiB7XG4gICAgICAgIGV4Y3V0ZUV2ZW50KHRoaXMuZXZlbnRzLmZpbmR2YWx1ZSwgdmFsdWUpO1xuICAgICAgICByZXNvbHZlKHZhbHVlKTtcbiAgICAgIH07XG4gICAgICAvL2tleeOBq+i/keOBhOODlOOCouOCkuWPluW+l1xuICAgICAgY29uc3QgcGVlcnMgPSB0aGlzLmYuZ2V0Q2xvc2VQZWVycyhrZXkpO1xuICAgICAgcGVlcnMuZm9yRWFjaChwZWVyID0+IHtcbiAgICAgICAgdGhpcy5kb0ZpbmR2YWx1ZShrZXksIHBlZXIpO1xuICAgICAgfSk7XG5cbiAgICAgIGF3YWl0IG5ldyBQcm9taXNlKHIgPT4gc2V0VGltZW91dChyLCA1MDAwKSk7XG4gICAgICBpZiAob3B0ICYmIG9wdC5vd25lcklkKSB7XG4gICAgICAgIGNvbnN0IG93bmVySWQgPSBvcHQub3duZXJJZDtcbiAgICAgICAgY29uc3QgcGVlcnMgPSB0aGlzLmYuZ2V0Q2xvc2VQZWVycyhvd25lcklkKTtcbiAgICAgICAgcGVlcnMuZm9yRWFjaChwZWVyID0+IHtcbiAgICAgICAgICB0aGlzLmRvRmluZHZhbHVlKG93bmVySWQsIHBlZXIpO1xuICAgICAgICB9KTtcbiAgICAgICAgYXdhaXQgbmV3IFByb21pc2UociA9PiBzZXRUaW1lb3V0KHIsIDUwMDApKTtcbiAgICAgIH1cbiAgICAgIHJlamVjdChcImZpbmR2YWx1ZSB0aW1lb3V0XCIpO1xuICAgIH0pO1xuICB9XG5cbiAgYXN5bmMgZG9GaW5kdmFsdWUoa2V5OiBzdHJpbmcsIHBlZXI6IFdlYlJUQykge1xuICAgIGNvbnNvbGUubG9nKFwiZG9maW5kdmFsdWVcIiwgcGVlci5ub2RlSWQpO1xuICAgIGNvbnN0IHNlbmREYXRhOiBGaW5kVmFsdWUgPSB7IHRhcmdldEtleToga2V5IH07XG4gICAgcGVlci5zZW5kKG5ldHdvcmtGb3JtYXQodGhpcy5ub2RlSWQsIGRlZi5GSU5EVkFMVUUsIHNlbmREYXRhKSwgXCJrYWRcIik7XG4gIH1cblxuICBjb25uZWN0KHBlZXI6IFdlYlJUQykge1xuICAgIGNvbnNvbGUubG9nKFwia2FkIGNvbm5lY3RcIik7XG4gICAgaWYgKHRoaXMuc3RhdGUuaXNGaXJzdENvbm5lY3QpIHRoaXMuY2FsbGJhY2sub25Db25uZWN0KCk7XG4gICAgdGhpcy5zdGF0ZS5pc0ZpcnN0Q29ubmVjdCA9IGZhbHNlO1xuICAgIHRoaXMuYWRka25vZGUocGVlcik7XG4gIH1cblxuICBhZGRrbm9kZShwZWVyOiBXZWJSVEMpIHtcbiAgICBwZWVyLm9uRGF0YS5zdWJzY3JpYmUocmF3ID0+IHtcbiAgICAgIHRoaXMub25Db21tYW5kKHJhdyk7XG4gICAgfSk7XG5cbiAgICBwZWVyLmRpc2Nvbm5lY3QgPSAoKSA9PiB7XG4gICAgICBjb25zb2xlLmxvZyhcImthZCBub2RlIGRpc2Nvbm5lY3RlZFwiKTtcbiAgICAgIHRoaXMuZi5jbGVhbkRpc2NvbigpO1xuICAgICAgdGhpcy5jYWxsYmFjay5vbkFkZFBlZXIodGhpcy5mLmdldEFsbFBlZXJJZHMoKSk7XG4gICAgfTtcblxuICAgIGlmICghdGhpcy5mLmlzTm9kZUV4aXN0KHBlZXIubm9kZUlkKSkge1xuICAgICAgY29uc3QgbnVtID0gZGlzdGFuY2UodGhpcy5ub2RlSWQsIHBlZXIubm9kZUlkKTtcbiAgICAgIGNvbnN0IGtidWNrZXQgPSB0aGlzLmtidWNrZXRzW251bV07XG4gICAgICBrYnVja2V0LnB1c2gocGVlcik7XG5cbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICB0aGlzLmZpbmROZXdQZWVyKHBlZXIpO1xuICAgICAgfSwgMTAwMCk7XG5cbiAgICAgIHRoaXMuY2FsbGJhY2sub25BZGRQZWVyKHRoaXMuZi5nZXRBbGxQZWVySWRzKCkpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgZmluZE5ld1BlZXIocGVlcjogV2ViUlRDKSB7XG4gICAgaWYgKHRoaXMuZi5nZXRLYnVja2V0TnVtKCkgPCB0aGlzLmspIHtcbiAgICAgIGF3YWl0IHRoaXMuZmluZE5vZGUodGhpcy5ub2RlSWQsIHBlZXIpLmNhdGNoKGNvbnNvbGUubG9nKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5sb2coXCJrYnVja2V0IGZ1bGxlZFwiLCB0aGlzLmYuZ2V0S2J1Y2tldE51bSgpKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIG1haW50YWluKG5ldHdvcms6IGFueSkge1xuICAgIGNvbnN0IGlueCA9IGRpc3RhbmNlKHRoaXMubm9kZUlkLCBuZXR3b3JrLm5vZGVJZCk7XG4gICAgY29uc3Qga2J1Y2tldCA9IHRoaXMua2J1Y2tldHNbaW54XTtcblxuICAgIC8v6YCB5L+h5YWD44GM6Kmy5b2T44GZ44KLay1idWNrZXTjga7kuK3jgavjgYLjgaPjgZ/loLTlkIhcbiAgICAvL+OBneOBruODjuODvOODieOCkmstYnVja2V044Gu5pyr5bC+44Gr56e744GZXG4gICAga2J1Y2tldC5mb3JFYWNoKChwZWVyLCBpKSA9PiB7XG4gICAgICBpZiAocGVlci5ub2RlSWQgPT09IG5ldHdvcmsubm9kZUlkKSB7XG4gICAgICAgIGtidWNrZXQuc3BsaWNlKGksIDEpO1xuICAgICAgICBrYnVja2V0LnB1c2gocGVlcik7XG4gICAgICAgIHJldHVybiAwO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy9rLWJ1Y2tldOOBjOOBmeOBp+OBq+a6gOadr+OBquWgtOWQiOOAgVxuICAgIC8v44Gd44Guay1idWNrZXTkuK3jga7lhYjpoK3jga7jg47jg7zjg4njgYzjgqrjg7Pjg6njgqTjg7PjgarjgonlhYjpoK3jga7jg47jg7zjg4njgpLmrovjgZlcbiAgICBpZiAoa2J1Y2tldC5sZW5ndGggPiB0aGlzLmspIHtcbiAgICAgIGtidWNrZXQuc2hpZnQoKTtcbiAgICB9XG4gIH1cblxuICBvZmZlcih0YXJnZXQ6IHN0cmluZywgcHJveHkgPSBudWxsKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlPGFueT4oYXN5bmMgKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY29uc3QgciA9IHRoaXMucmVmO1xuICAgICAgY29uc3QgcGVlciA9IChyW3RhcmdldF0gPSBuZXcgV2ViUlRDKCkpO1xuICAgICAgcGVlci5tYWtlT2ZmZXIoKTtcblxuICAgICAgY29uc3QgdGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICByZWplY3QoXCJrYWQgb2ZmZXIgdGltZW91dFwiKTtcbiAgICAgIH0sIDUgKiAxMDAwKTtcblxuICAgICAgcGVlci5zaWduYWwgPSBzZHAgPT4ge1xuICAgICAgICBjb25zdCBjbG9zZSA9IHRoaXMuZi5nZXRDbG9zZUVzdFBlZXIodGFyZ2V0KTtcbiAgICAgICAgaWYgKCFjbG9zZSkgcmV0dXJuO1xuICAgICAgICBpZiAoY2xvc2Uubm9kZUlkICE9PSB0YXJnZXQpXG4gICAgICAgICAgdGhpcy5zdG9yZSh0aGlzLm5vZGVJZCwgdGFyZ2V0LCB7IHNkcCwgcHJveHkgfSk7XG4gICAgICB9O1xuXG4gICAgICBwZWVyLmNvbm5lY3QgPSAoKSA9PiB7XG4gICAgICAgIHBlZXIubm9kZUlkID0gdGFyZ2V0O1xuICAgICAgICB0aGlzLmFkZGtub2RlKHBlZXIpO1xuICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dCk7XG4gICAgICAgIHJlc29sdmUodHJ1ZSk7XG4gICAgICB9O1xuICAgIH0pO1xuICB9XG5cbiAgYW5zd2VyKHRhcmdldDogc3RyaW5nLCBzZHA6IHN0cmluZywgcHJveHk6IHN0cmluZykge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZTxhbnk+KGFzeW5jIChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGNvbnN0IHIgPSB0aGlzLnJlZjtcbiAgICAgIGNvbnN0IHBlZXIgPSAoclt0YXJnZXRdID0gbmV3IFdlYlJUQygpKTtcbiAgICAgIHBlZXIuc2V0U2RwKHNkcCk7XG5cbiAgICAgIGNvbnN0IHRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgcmVqZWN0KFwia2FkIGFuc3dlciB0aW1lb3V0XCIpO1xuICAgICAgfSwgNSAqIDEwMDApO1xuXG4gICAgICBwZWVyLnNpZ25hbCA9IGFzeW5jIHNkcCA9PiB7XG4gICAgICAgIGNvbnN0IHAgPSB0aGlzLmYuZ2V0UGVlckZyb21ub2RlSWQocHJveHkpO1xuICAgICAgICBpZiAoIXApIHJldHVybjtcbiAgICAgICAgY29uc3QgaGFzaCA9IHNoYTEoTWF0aC5yYW5kb20oKS50b1N0cmluZygpKS50b1N0cmluZygpO1xuICAgICAgICBjb25zdCBzZW5kRGF0YTogU3RvcmVGb3JtYXQgPSB7XG4gICAgICAgICAgc2VuZGVyOiB0aGlzLm5vZGVJZCxcbiAgICAgICAgICBrZXk6IHRhcmdldCxcbiAgICAgICAgICB2YWx1ZTogeyBzZHAgfSxcbiAgICAgICAgICBwdWJLZXk6IHRoaXMuY3lwaGVyLnB1YktleSxcbiAgICAgICAgICBoYXNoLFxuICAgICAgICAgIHNpZ246IHRoaXMuY3lwaGVyLmVuY3J5cHQoaGFzaClcbiAgICAgICAgfTtcbiAgICAgICAgcC5zZW5kKG5ldHdvcmtGb3JtYXQodGhpcy5ub2RlSWQsIGRlZi5TVE9SRSwgc2VuZERhdGEpLCBcImthZFwiKTtcbiAgICAgIH07XG5cbiAgICAgIHBlZXIuY29ubmVjdCA9ICgpID0+IHtcbiAgICAgICAgcGVlci5ub2RlSWQgPSB0YXJnZXQ7XG4gICAgICAgIHRoaXMuYWRka25vZGUocGVlcik7XG4gICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KTtcbiAgICAgICAgcmVzb2x2ZSh0cnVlKTtcbiAgICAgIH07XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIG9uQ29tbWFuZChtZXNzYWdlOiBtZXNzYWdlKSB7XG4gICAgaWYgKG1lc3NhZ2UubGFiZWwgPT09IFwia2FkXCIpIHtcbiAgICAgIGNvbnN0IGJ1ZmZlcjogQnVmZmVyID0gQnVmZmVyLmZyb20obWVzc2FnZS5kYXRhKTtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IG5ldHdvcmtMYXllcjogbmV0d29yayA9IGJzb24uZGVzZXJpYWxpemUoYnVmZmVyKTtcbiAgICAgICAgaWYgKCFKU09OLnN0cmluZ2lmeSh0aGlzLmRhdGFMaXN0KS5pbmNsdWRlcyhuZXR3b3JrTGF5ZXIuaGFzaCkpIHtcbiAgICAgICAgICB0aGlzLmRhdGFMaXN0LnB1c2gobmV0d29ya0xheWVyLmhhc2gpO1xuICAgICAgICAgIHRoaXMub25SZXF1ZXN0KG5ldHdvcmtMYXllcik7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGVycm9yKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgZXhjdXRlRXZlbnQodGhpcy5ldmVudHMucmVzcG9uZGVyLCBtZXNzYWdlKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIG9uUmVxdWVzdChuZXR3b3JrOiBhbnkpIHtcbiAgICB0aGlzLnJlc3BvbmRlci5yZXNwb25zZShuZXR3b3JrLnR5cGUsIG5ldHdvcmspO1xuICAgIHRoaXMubWFpbnRhaW4obmV0d29yayk7XG4gIH1cbn1cbiJdfQ==
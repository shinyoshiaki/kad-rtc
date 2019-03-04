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
        regeneratorRuntime.mark(function _callee7(resolve, reject) {
          var r, peer, timeout;
          return regeneratorRuntime.wrap(function _callee7$(_context7) {
            while (1) {
              switch (_context7.prev = _context7.next) {
                case 0:
                  r = _this6.ref;
                  peer = r[target] = new _webrtc4me.default();
                  peer.setSdp(sdp);
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
          }, _callee7);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9rYWQva2FkZW1saWEudHMiXSwibmFtZXMiOlsicmVxdWlyZSIsImJzb24iLCJCU09OIiwiZXhjdXRlRXZlbnQiLCJldiIsInYiLCJjb25zb2xlIiwibG9nIiwiT2JqZWN0Iiwia2V5cyIsImZvckVhY2giLCJrZXkiLCJLYWRlbWxpYSIsIm9wdCIsImlzRmlyc3RDb25uZWN0IiwiaXNPZmZlciIsImZpbmROb2RlIiwiaGFzaCIsIm9uQ29ubmVjdCIsIm9uQWRkUGVlciIsIm9uUGVlckRpc2Nvbm5lY3QiLCJfb25GaW5kVmFsdWUiLCJfb25GaW5kTm9kZSIsIm9uQXBwIiwic3RvcmUiLCJvblN0b3JlIiwiZmluZHZhbHVlIiwib25GaW5kVmFsdWUiLCJmaW5kbm9kZSIsIm9uRmluZE5vZGUiLCJyZXNwb25kZXIiLCJvblJlc3BvbmRlciIsImsiLCJrTGVuZ3RoIiwiY3lwaGVyIiwiQ3lwaGVyIiwic2VjS2V5IiwicHVia2V5Iiwibm9kZUlkIiwicHViS2V5IiwidG9TdHJpbmciLCJrYnVja2V0cyIsIkFycmF5IiwiaSIsImtidWNrZXQiLCJmIiwiSGVscGVyIiwiS1Jlc3BvbmRlciIsInNlbmRlciIsInZhbHVlIiwicGVlciIsImdldENsb3NlRXN0UGVlciIsIkpTT04iLCJzdHJpbmdpZnkiLCJzZW5kRGF0YSIsInNpZ24iLCJlbmNyeXB0IiwibmV0d29yayIsImRlZiIsIlNUT1JFIiwic2VuZCIsInNkcCIsImtleVZhbHVlTGlzdCIsImNodW5rcyIsImNodW5rIiwiQnVmZmVyIiwiZnJvbSIsImluZGV4Iiwic2l6ZSIsImxlbmd0aCIsIlNUT1JFX0NIVU5LUyIsInRhcmdldElkIiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZWplY3QiLCJzdGF0ZSIsInRhcmdldEtleSIsIkZJTkROT0RFIiwiY2FsbGJhY2siLCJldmVudHMiLCJnZXRQZWVyRnJvbW5vZGVJZCIsInIiLCJzZXRUaW1lb3V0IiwicGVlcnMiLCJnZXRDbG9zZVBlZXJzIiwiZG9GaW5kdmFsdWUiLCJvd25lcklkIiwiRklORFZBTFVFIiwiYWRka25vZGUiLCJvbkRhdGEiLCJzdWJzY3JpYmUiLCJyYXciLCJvbkNvbW1hbmQiLCJkaXNjb25uZWN0IiwiY2xlYW5EaXNjb24iLCJnZXRBbGxQZWVySWRzIiwiaXNOb2RlRXhpc3QiLCJudW0iLCJwdXNoIiwiZmluZE5ld1BlZXIiLCJnZXRLYnVja2V0TnVtIiwiY2F0Y2giLCJpbngiLCJzcGxpY2UiLCJzaGlmdCIsInRhcmdldCIsInByb3h5IiwicmVmIiwiV2ViUlRDIiwibWFrZU9mZmVyIiwidGltZW91dCIsInNpZ25hbCIsIl8iLCJjb25uZWN0IiwiY2xlYXJUaW1lb3V0Iiwic2V0U2RwIiwiTWF0aCIsInJhbmRvbSIsIm1lc3NhZ2UiLCJsYWJlbCIsImJ1ZmZlciIsImRhdGEiLCJuZXR3b3JrTGF5ZXIiLCJkZXNlcmlhbGl6ZSIsImRhdGFMaXN0IiwiaW5jbHVkZXMiLCJvblJlcXVlc3QiLCJlcnJvciIsInJlc3BvbnNlIiwidHlwZSIsIm1haW50YWluIl0sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUVBOztBQUNBOztBQUNBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFUQUEsT0FBTyxDQUFDLGdCQUFELENBQVA7O0FBYUEsSUFBTUMsSUFBSSxHQUFHLElBQUlDLFVBQUosRUFBYjs7QUFDTyxTQUFTQyxXQUFULENBQXFCQyxFQUFyQixFQUE4QkMsQ0FBOUIsRUFBdUM7QUFDNUNDLEVBQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZLGFBQVosRUFBMkJILEVBQTNCO0FBQ0FJLEVBQUFBLE1BQU0sQ0FBQ0MsSUFBUCxDQUFZTCxFQUFaLEVBQWdCTSxPQUFoQixDQUF3QixVQUFBQyxHQUFHLEVBQUk7QUFDN0JQLElBQUFBLEVBQUUsQ0FBQ08sR0FBRCxDQUFGLENBQVFOLENBQVI7QUFDRCxHQUZEO0FBR0Q7O0lBRW9CTyxROzs7QUF1Q25CLG9CQUFZQyxHQUFaLEVBQTBFO0FBQUE7O0FBQUE7O0FB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TyxDQUFDQyxHQUFSLENBQVl3SCxLQUFaO0FBQ0Q7QUFDRixPQVpELE1BWU87QUFDTDVILFFBQUFBLFdBQVcsQ0FBQyxLQUFLNEUsTUFBTCxDQUFZakQsU0FBYixFQUF3QndGLE9BQXhCLENBQVg7QUFDRDtBQUNGOzs7OEJBRWlCN0QsTyxFQUFjO0FBQzlCLFdBQUszQixTQUFMLENBQWVrRyxRQUFmLENBQXdCdkUsT0FBTyxDQUFDd0UsSUFBaEMsRUFBc0N4RSxPQUF0QztBQUNBLFdBQUt5RSxRQUFMLENBQWN6RSxPQUFkO0FBQ0QiLCJzb3VyY2VzQ29udGVudCI6WyJyZXF1aXJlKFwiYmFiZWwtcG9seWZpbGxcIik7XG5pbXBvcnQgV2ViUlRDIGZyb20gXCJ3ZWJydGM0bWVcIjtcbmltcG9ydCBIZWxwZXIgZnJvbSBcIi4va1V0aWxcIjtcbmltcG9ydCBLUmVzcG9uZGVyIGZyb20gXCIuL2tSZXNwb25kZXJcIjtcbmltcG9ydCBkZWYsIHsgbmV0d29ya0Zvcm1hdCB9IGZyb20gXCIuL0tDb25zdFwiO1xuaW1wb3J0IHsgZGlzdGFuY2UgfSBmcm9tIFwia2FkLWRpc3RhbmNlXCI7XG5pbXBvcnQgeyBtZXNzYWdlIH0gZnJvbSBcIndlYnJ0YzRtZS9saWIvaW50ZXJmYWNlXCI7XG5pbXBvcnQgeyBCU09OIH0gZnJvbSBcImJzb25cIjtcbmltcG9ydCBDeXBoZXIgZnJvbSBcIi4uL2xpYi9jeXBoZXJcIjtcbmltcG9ydCBzaGExIGZyb20gXCJzaGExXCI7XG5pbXBvcnQgeyBJRXZlbnRzIH0gZnJvbSBcIi4uL3V0aWxcIjtcbmltcG9ydCB7IFN0b3JlRm9ybWF0LCBTdG9yZUNodW5rcywgRmluZFZhbHVlLCBuZXR3b3JrIH0gZnJvbSBcIi4vaW50ZXJmYWNlXCI7XG5cbmNvbnN0IGJzb24gPSBuZXcgQlNPTigpO1xuZXhwb3J0IGZ1bmN0aW9uIGV4Y3V0ZUV2ZW50KGV2OiBhbnksIHY/OiBhbnkpIHtcbiAgY29uc29sZS5sb2coXCJleGN1dGVFdmVudFwiLCBldik7XG4gIE9iamVjdC5rZXlzKGV2KS5mb3JFYWNoKGtleSA9PiB7XG4gICAgZXZba2V5XSh2KTtcbiAgfSk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEthZGVtbGlhIHtcbiAgbm9kZUlkOiBzdHJpbmc7XG4gIGs6IG51bWJlcjtcbiAga2J1Y2tldHM6IEFycmF5PEFycmF5PFdlYlJUQz4+O1xuICBmOiBIZWxwZXI7XG4gIHJlc3BvbmRlcjogS1Jlc3BvbmRlcjtcbiAgZGF0YUxpc3Q6IEFycmF5PGFueT4gPSBbXTtcbiAga2V5VmFsdWVMaXN0OiB7IFtrZXk6IHN0cmluZ106IGFueSB9ID0ge307XG4gIHJlZjogeyBba2V5OiBzdHJpbmddOiBXZWJSVEMgfSA9IHt9O1xuICBidWZmZXI6IHsgW2tleTogc3RyaW5nXTogQXJyYXk8YW55PiB9ID0ge307XG5cbiAgc3RhdGUgPSB7XG4gICAgaXNGaXJzdENvbm5lY3Q6IHRydWUsXG4gICAgaXNPZmZlcjogZmFsc2UsXG4gICAgZmluZE5vZGU6IFwiXCIsXG4gICAgaGFzaDoge31cbiAgfTtcblxuICBjYWxsYmFjayA9IHtcbiAgICBvbkNvbm5lY3Q6ICgpID0+IHt9LFxuICAgIG9uQWRkUGVlcjogKHY/OiBhbnkpID0+IHt9LFxuICAgIG9uUGVlckRpc2Nvbm5lY3Q6ICh2PzogYW55KSA9PiB7fSxcbiAgICBfb25GaW5kVmFsdWU6ICh2PzogYW55KSA9PiB7fSxcbiAgICBfb25GaW5kTm9kZTogKHY/OiBhbnkpID0+IHt9LFxuICAgIG9uQXBwOiAodj86IGFueSkgPT4ge31cbiAgfTtcblxuICBwcml2YXRlIG9uU3RvcmU6IElFdmVudHMgPSB7fTtcbiAgcHJpdmF0ZSBvbkZpbmRWYWx1ZTogSUV2ZW50cyA9IHt9O1xuICBwcml2YXRlIG9uRmluZE5vZGU6IElFdmVudHMgPSB7fTtcbiAgcHJpdmF0ZSBvblJlc3BvbmRlcjogSUV2ZW50cyA9IHt9O1xuICBldmVudHMgPSB7XG4gICAgc3RvcmU6IHRoaXMub25TdG9yZSxcbiAgICBmaW5kdmFsdWU6IHRoaXMub25GaW5kVmFsdWUsXG4gICAgZmluZG5vZGU6IHRoaXMub25GaW5kTm9kZSxcbiAgICByZXNwb25kZXI6IHRoaXMub25SZXNwb25kZXJcbiAgfTtcbiAgY3lwaGVyOiBDeXBoZXI7XG5cbiAgY29uc3RydWN0b3Iob3B0PzogeyBwdWJrZXk/OiBzdHJpbmc7IHNlY0tleT86IHN0cmluZzsga0xlbmd0aD86IG51bWJlciB9KSB7XG4gICAgdGhpcy5rID0gMjA7XG4gICAgaWYgKG9wdCAmJiBvcHQua0xlbmd0aCkgdGhpcy5rID0gb3B0LmtMZW5ndGg7XG4gICAgaWYgKG9wdCkgdGhpcy5jeXBoZXIgPSBuZXcgQ3lwaGVyKG9wdC5zZWNLZXksIG9wdC5wdWJrZXkpO1xuICAgIGVsc2UgdGhpcy5jeXBoZXIgPSBuZXcgQ3lwaGVyKCk7XG4gICAgdGhpcy5ub2RlSWQgPSBzaGExKHRoaXMuY3lwaGVyLnB1YktleSkudG9TdHJpbmcoKTtcblxuICAgIHRoaXMua2J1Y2tldHMgPSBuZXcgQXJyYXkoMTYwKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IDE2MDsgaSsrKSB7XG4gICAgICBsZXQga2J1Y2tldDogQXJyYXk8YW55PiA9IFtdO1xuICAgICAgdGhpcy5rYnVja2V0c1tpXSA9IGtidWNrZXQ7XG4gICAgfVxuXG4gICAgdGhpcy5mID0gbmV3IEhlbHBlcih0aGlzLmssIHRoaXMua2J1Y2tldHMsIHRoaXMubm9kZUlkKTtcbiAgICB0aGlzLnJlc3BvbmRlciA9IG5ldyBLUmVzcG9uZGVyKHRoaXMpO1xuICB9XG5cbiAgc3RvcmUoc2VuZGVyOiBzdHJpbmcsIGtleTogc3RyaW5nLCB2YWx1ZTogYW55LCBvcHQ/OiB7IGV4Y2x1ZGVJZD86IHN0cmluZyB9KSB7XG4gICAgY29uc3QgcGVlciA9IHRoaXMuZi5nZXRDbG9zZUVzdFBlZXIoa2V5LCBvcHQpO1xuICAgIGlmICghcGVlcikgcmV0dXJuO1xuICAgIGNvbnN0IGhhc2ggPSBzaGExKEpTT04uc3RyaW5naWZ5KHZhbHVlKSkudG9TdHJpbmcoKTtcbiAgICBjb25zdCBzZW5kRGF0YTogU3RvcmVGb3JtYXQgPSB7XG4gICAgICBzZW5kZXIsXG4gICAgICBrZXksXG4gICAgICB2YWx1ZSxcbiAgICAgIHB1YktleTogdGhpcy5jeXBoZXIucHViS2V5LFxuICAgICAgaGFzaCxcbiAgICAgIHNpZ246IHRoaXMuY3lwaGVyLmVuY3J5cHQoaGFzaClcbiAgICB9O1xuICAgIGNvbnN0IG5ldHdvcmsgPSBuZXR3b3JrRm9ybWF0KHRoaXMubm9kZUlkLCBkZWYuU1RPUkUsIHNlbmREYXRhKTtcblxuICAgIGNvbnNvbGUubG9nKGRlZi5TVE9SRSwgXCJuZXh0XCIsIHBlZXIubm9kZUlkLCBcInRhcmdldFwiLCBrZXkpO1xuICAgIHBlZXIuc2VuZChuZXR3b3JrLCBcImthZFwiKTtcbiAgICAvL25vIHNkcFxuICAgIGlmICghdmFsdWUuc2RwKSB0aGlzLmtleVZhbHVlTGlzdFtrZXldID0gdmFsdWU7XG4gIH1cblxuICBzdG9yZUNodW5rcyhcbiAgICBzZW5kZXI6IHN0cmluZyxcbiAgICBrZXk6IHN0cmluZyxcbiAgICBjaHVua3M6IEFycmF5QnVmZmVyW10sXG4gICAgb3B0PzogeyBleGNsdWRlSWQ/OiBzdHJpbmcgfVxuICApIHtcbiAgICAvLyBjb25zdCBwZWVycyA9IHRoaXMuZi5nZXRDbG9zZVBlZXJzKGtleSwgb3B0KTtcbiAgICBjb25zdCBwZWVyID0gdGhpcy5mLmdldENsb3NlRXN0UGVlcihrZXksIG9wdCk7XG4gICAgaWYgKCFwZWVyKSByZXR1cm47XG4gICAgY29uc29sZS5sb2coXCJzdG9yZSBjaHVua3NcIiwgeyBjaHVua3MgfSk7XG4gICAgY2h1bmtzLmZvckVhY2goKGNodW5rLCBpKSA9PiB7XG4gICAgICBjb25zdCBoYXNoID0gc2hhMShCdWZmZXIuZnJvbShjaHVuaykpLnRvU3RyaW5nKCk7XG4gICAgICBjb25zdCBzZW5kRGF0YTogU3RvcmVDaHVua3MgPSB7XG4gICAgICAgIHNlbmRlcjogdGhpcy5ub2RlSWQsXG4gICAgICAgIGtleSxcbiAgICAgICAgdmFsdWU6IEJ1ZmZlci5mcm9tKGNodW5rKSxcbiAgICAgICAgaW5kZXg6IGksXG4gICAgICAgIHB1YktleTogdGhpcy5jeXBoZXIucHViS2V5LFxuICAgICAgICBoYXNoLFxuICAgICAgICBzaWduOiB0aGlzLmN5cGhlci5lbmNyeXB0KGhhc2gpLFxuICAgICAgICBzaXplOiBjaHVua3MubGVuZ3RoXG4gICAgICB9O1xuICAgICAgY29uc3QgbmV0d29yayA9IG5ldHdvcmtGb3JtYXQoc2VuZGVyLCBkZWYuU1RPUkVfQ0hVTktTLCBzZW5kRGF0YSk7XG5cbiAgICAgIGNvbnNvbGUubG9nKGRlZi5TVE9SRSwgXCJuZXh0XCIsIHBlZXIubm9kZUlkLCBcInRhcmdldFwiLCBrZXkpO1xuICAgICAgcGVlci5zZW5kKG5ldHdvcmssIFwia2FkXCIpO1xuICAgIH0pO1xuICAgIC8v44Os44OX44Oq44Kx44O844K344On44OzXG4gICAgdGhpcy5rZXlWYWx1ZUxpc3Rba2V5XSA9IHsgY2h1bmtzIH07XG4gIH1cblxuICBmaW5kTm9kZSh0YXJnZXRJZDogc3RyaW5nLCBwZWVyOiBXZWJSVEMpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2U8V2ViUlRDPihhc3luYyAocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjb25zb2xlLmxvZyhcImZpbmRub2RlXCIsIHRhcmdldElkKTtcbiAgICAgIHRoaXMuc3RhdGUuZmluZE5vZGUgPSB0YXJnZXRJZDtcbiAgICAgIGNvbnN0IHNlbmREYXRhID0geyB0YXJnZXRLZXk6IHRhcmdldElkIH07XG4gICAgICAvL+mAgeOCi1xuICAgICAgcGVlci5zZW5kKG5ldHdvcmtGb3JtYXQodGhpcy5ub2RlSWQsIGRlZi5GSU5ETk9ERSwgc2VuZERhdGEpLCBcImthZFwiKTtcblxuICAgICAgdGhpcy5jYWxsYmFjay5fb25GaW5kTm9kZSgobm9kZUlkOiBzdHJpbmcpID0+IHtcbiAgICAgICAgZXhjdXRlRXZlbnQodGhpcy5ldmVudHMuZmluZG5vZGUsIG5vZGVJZCk7XG4gICAgICAgIHJlc29sdmUodGhpcy5mLmdldFBlZXJGcm9tbm9kZUlkKG5vZGVJZCkpO1xuICAgICAgfSk7XG5cbiAgICAgIGF3YWl0IG5ldyBQcm9taXNlKHIgPT4gc2V0VGltZW91dChyLCAxMCAqIDEwMDApKTtcbiAgICAgIHJlamVjdChcInRpbWVvdXQgZmluZG5vZGVcIik7XG4gICAgfSk7XG4gIH1cblxuICBmaW5kVmFsdWUoa2V5OiBzdHJpbmcsIG9wdD86IHsgb3duZXJJZD86IHN0cmluZyB9KSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlPGFueT4oYXN5bmMgKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgdGhpcy5jYWxsYmFjay5fb25GaW5kVmFsdWUgPSB2YWx1ZSA9PiB7XG4gICAgICAgIGV4Y3V0ZUV2ZW50KHRoaXMuZXZlbnRzLmZpbmR2YWx1ZSwgdmFsdWUpO1xuICAgICAgICByZXNvbHZlKHZhbHVlKTtcbiAgICAgIH07XG4gICAgICAvL2tleeOBq+i/keOBhOODlOOCouOCkuWPluW+l1xuICAgICAgY29uc3QgcGVlcnMgPSB0aGlzLmYuZ2V0Q2xvc2VQZWVycyhrZXkpO1xuICAgICAgcGVlcnMuZm9yRWFjaChwZWVyID0+IHtcbiAgICAgICAgdGhpcy5kb0ZpbmR2YWx1ZShrZXksIHBlZXIpO1xuICAgICAgfSk7XG5cbiAgICAgIGF3YWl0IG5ldyBQcm9taXNlKHIgPT4gc2V0VGltZW91dChyLCA1MDAwKSk7XG4gICAgICBpZiAob3B0ICYmIG9wdC5vd25lcklkKSB7XG4gICAgICAgIGNvbnN0IG93bmVySWQgPSBvcHQub3duZXJJZDtcbiAgICAgICAgY29uc3QgcGVlcnMgPSB0aGlzLmYuZ2V0Q2xvc2VQZWVycyhvd25lcklkKTtcbiAgICAgICAgcGVlcnMuZm9yRWFjaChwZWVyID0+IHtcbiAgICAgICAgICB0aGlzLmRvRmluZHZhbHVlKG93bmVySWQsIHBlZXIpO1xuICAgICAgICB9KTtcbiAgICAgICAgYXdhaXQgbmV3IFByb21pc2UociA9PiBzZXRUaW1lb3V0KHIsIDUwMDApKTtcbiAgICAgIH1cbiAgICAgIHJlamVjdChcImZpbmR2YWx1ZSB0aW1lb3V0XCIpO1xuICAgIH0pO1xuICB9XG5cbiAgYXN5bmMgZG9GaW5kdmFsdWUoa2V5OiBzdHJpbmcsIHBlZXI6IFdlYlJUQykge1xuICAgIGNvbnNvbGUubG9nKFwiZG9maW5kdmFsdWVcIiwgcGVlci5ub2RlSWQpO1xuICAgIGNvbnN0IHNlbmREYXRhOiBGaW5kVmFsdWUgPSB7IHRhcmdldEtleToga2V5IH07XG4gICAgcGVlci5zZW5kKG5ldHdvcmtGb3JtYXQodGhpcy5ub2RlSWQsIGRlZi5GSU5EVkFMVUUsIHNlbmREYXRhKSwgXCJrYWRcIik7XG4gIH1cblxuICBjb25uZWN0KHBlZXI6IFdlYlJUQykge1xuICAgIGNvbnNvbGUubG9nKFwia2FkIGNvbm5lY3RcIik7XG4gICAgaWYgKHRoaXMuc3RhdGUuaXNGaXJzdENvbm5lY3QpIHRoaXMuY2FsbGJhY2sub25Db25uZWN0KCk7XG4gICAgdGhpcy5zdGF0ZS5pc0ZpcnN0Q29ubmVjdCA9IGZhbHNlO1xuICAgIHRoaXMuYWRka25vZGUocGVlcik7XG4gIH1cblxuICBhZGRrbm9kZShwZWVyOiBXZWJSVEMpIHtcbiAgICBwZWVyLm9uRGF0YS5zdWJzY3JpYmUocmF3ID0+IHtcbiAgICAgIHRoaXMub25Db21tYW5kKHJhdyk7XG4gICAgfSk7XG5cbiAgICBwZWVyLmRpc2Nvbm5lY3QgPSAoKSA9PiB7XG4gICAgICBjb25zb2xlLmxvZyhcImthZCBub2RlIGRpc2Nvbm5lY3RlZFwiKTtcbiAgICAgIHRoaXMuZi5jbGVhbkRpc2NvbigpO1xuICAgICAgdGhpcy5jYWxsYmFjay5vbkFkZFBlZXIodGhpcy5mLmdldEFsbFBlZXJJZHMoKSk7XG4gICAgfTtcblxuICAgIGlmICghdGhpcy5mLmlzTm9kZUV4aXN0KHBlZXIubm9kZUlkKSkge1xuICAgICAgY29uc3QgbnVtID0gZGlzdGFuY2UodGhpcy5ub2RlSWQsIHBlZXIubm9kZUlkKTtcbiAgICAgIGNvbnN0IGtidWNrZXQgPSB0aGlzLmtidWNrZXRzW251bV07XG4gICAgICBrYnVja2V0LnB1c2gocGVlcik7XG5cbiAgICAgIGNvbnNvbGUubG9nKFwiYWRka25vZGUga2J1Y2tldHNcIiwgXCJwZWVyLm5vZGVJZDpcIiwgcGVlci5ub2RlSWQpO1xuICAgICAgY29uc29sZS5sb2codGhpcy5mLmdldEFsbFBlZXJJZHMoKSk7XG5cbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICB0aGlzLmZpbmROZXdQZWVyKHBlZXIpO1xuICAgICAgfSwgMTAwMCk7XG5cbiAgICAgIHRoaXMuY2FsbGJhY2sub25BZGRQZWVyKHRoaXMuZi5nZXRBbGxQZWVySWRzKCkpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgZmluZE5ld1BlZXIocGVlcjogV2ViUlRDKSB7XG4gICAgaWYgKHRoaXMuZi5nZXRLYnVja2V0TnVtKCkgPCB0aGlzLmspIHtcbiAgICAgIGF3YWl0IHRoaXMuZmluZE5vZGUodGhpcy5ub2RlSWQsIHBlZXIpLmNhdGNoKGNvbnNvbGUubG9nKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5sb2coXCJrYnVja2V0IGZ1bGxlZFwiLCB0aGlzLmYuZ2V0S2J1Y2tldE51bSgpKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIG1haW50YWluKG5ldHdvcms6IGFueSkge1xuICAgIGNvbnN0IGlueCA9IGRpc3RhbmNlKHRoaXMubm9kZUlkLCBuZXR3b3JrLm5vZGVJZCk7XG4gICAgY29uc3Qga2J1Y2tldCA9IHRoaXMua2J1Y2tldHNbaW54XTtcblxuICAgIC8v6YCB5L+h5YWD44GM6Kmy5b2T44GZ44KLay1idWNrZXTjga7kuK3jgavjgYLjgaPjgZ/loLTlkIhcbiAgICAvL+OBneOBruODjuODvOODieOCkmstYnVja2V044Gu5pyr5bC+44Gr56e744GZXG4gICAga2J1Y2tldC5mb3JFYWNoKChwZWVyLCBpKSA9PiB7XG4gICAgICBpZiAocGVlci5ub2RlSWQgPT09IG5ldHdvcmsubm9kZUlkKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwibWFpbnRhaW5cIiwgXCJNb3Zlc8KgaXTCoHRvwqB0aGXCoHRhaWzCoG9mwqB0aGXCoGxpc3RcIik7XG4gICAgICAgIGtidWNrZXQuc3BsaWNlKGksIDEpO1xuICAgICAgICBrYnVja2V0LnB1c2gocGVlcik7XG4gICAgICAgIHJldHVybiAwO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy9rLWJ1Y2tldOOBjOOBmeOBp+OBq+a6gOadr+OBquWgtOWQiOOAgVxuICAgIC8v44Gd44Guay1idWNrZXTkuK3jga7lhYjpoK3jga7jg47jg7zjg4njgYzjgqrjg7Pjg6njgqTjg7PjgarjgonlhYjpoK3jga7jg47jg7zjg4njgpLmrovjgZlcbiAgICBpZiAoa2J1Y2tldC5sZW5ndGggPiB0aGlzLmspIHtcbiAgICAgIGtidWNrZXQuc2hpZnQoKTtcbiAgICB9XG4gIH1cblxuICBvZmZlcih0YXJnZXQ6IHN0cmluZywgcHJveHkgPSBudWxsKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlPGFueT4oYXN5bmMgKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY29uc3QgciA9IHRoaXMucmVmO1xuICAgICAgY29uc3QgcGVlciA9IChyW3RhcmdldF0gPSBuZXcgV2ViUlRDKCkpO1xuICAgICAgcGVlci5tYWtlT2ZmZXIoKTtcblxuICAgICAgY29uc3QgdGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICByZWplY3QoXCJrYWQgb2ZmZXIgdGltZW91dFwiKTtcbiAgICAgIH0sIDUgKiAxMDAwKTtcblxuICAgICAgcGVlci5zaWduYWwgPSBzZHAgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZyhcImthZCBvZmZlciBzdG9yZVwiLCB0YXJnZXQpO1xuICAgICAgICBjb25zdCBfID0gdGhpcy5mLmdldENsb3NlRXN0UGVlcih0YXJnZXQpO1xuICAgICAgICBpZiAoIV8pIHJldHVybjtcbiAgICAgICAgaWYgKF8ubm9kZUlkICE9PSB0YXJnZXQpXG4gICAgICAgICAgdGhpcy5zdG9yZSh0aGlzLm5vZGVJZCwgdGFyZ2V0LCB7IHNkcCwgcHJveHkgfSk7XG4gICAgICB9O1xuXG4gICAgICBwZWVyLmNvbm5lY3QgPSAoKSA9PiB7XG4gICAgICAgIHBlZXIubm9kZUlkID0gdGFyZ2V0O1xuICAgICAgICBjb25zb2xlLmxvZyhcImthZCBvZmZlciBjb25uZWN0ZWRcIiwgdGFyZ2V0KTtcbiAgICAgICAgdGhpcy5hZGRrbm9kZShwZWVyKTtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xuICAgICAgICByZXNvbHZlKHRydWUpO1xuICAgICAgfTtcbiAgICB9KTtcbiAgfVxuXG4gIGFuc3dlcih0YXJnZXQ6IHN0cmluZywgc2RwOiBzdHJpbmcsIHByb3h5OiBzdHJpbmcpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2U8YW55Pihhc3luYyAocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjb25zdCByID0gdGhpcy5yZWY7XG4gICAgICBjb25zdCBwZWVyID0gKHJbdGFyZ2V0XSA9IG5ldyBXZWJSVEMoKSk7XG4gICAgICBwZWVyLnNldFNkcChzZHApO1xuICAgICAgY29uc29sZS5sb2coXCJrYWQgYW5zd2VyXCIsIHRhcmdldCk7XG5cbiAgICAgIGNvbnN0IHRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgcmVqZWN0KFwia2FkIGFuc3dlciB0aW1lb3V0XCIpO1xuICAgICAgfSwgNSAqIDEwMDApO1xuXG4gICAgICBwZWVyLnNpZ25hbCA9IHNkcCA9PiB7XG4gICAgICAgIGNvbnN0IF8gPSB0aGlzLmYuZ2V0UGVlckZyb21ub2RlSWQocHJveHkpO1xuICAgICAgICBjb25zdCBoYXNoID0gc2hhMShNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKCkpLnRvU3RyaW5nKCk7XG4gICAgICAgIGNvbnN0IHNlbmREYXRhOiBTdG9yZUZvcm1hdCA9IHtcbiAgICAgICAgICBzZW5kZXI6IHRoaXMubm9kZUlkLFxuICAgICAgICAgIGtleTogdGFyZ2V0LFxuICAgICAgICAgIHZhbHVlOiB7IHNkcCB9LFxuICAgICAgICAgIHB1YktleTogdGhpcy5jeXBoZXIucHViS2V5LFxuICAgICAgICAgIGhhc2gsXG4gICAgICAgICAgc2lnbjogdGhpcy5jeXBoZXIuZW5jcnlwdChoYXNoKVxuICAgICAgICB9O1xuICAgICAgICBpZiAoXykgXy5zZW5kKG5ldHdvcmtGb3JtYXQodGhpcy5ub2RlSWQsIGRlZi5TVE9SRSwgc2VuZERhdGEpLCBcImthZFwiKTtcbiAgICAgIH07XG5cbiAgICAgIHBlZXIuY29ubmVjdCA9ICgpID0+IHtcbiAgICAgICAgcGVlci5ub2RlSWQgPSB0YXJnZXQ7XG4gICAgICAgIGNvbnNvbGUubG9nKFwia2FkIGFuc3dlciBjb25uZWN0ZWRcIiwgdGFyZ2V0KTtcbiAgICAgICAgdGhpcy5hZGRrbm9kZShwZWVyKTtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xuICAgICAgICByZXNvbHZlKHRydWUpO1xuICAgICAgfTtcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgb25Db21tYW5kKG1lc3NhZ2U6IG1lc3NhZ2UpIHtcbiAgICBpZiAobWVzc2FnZS5sYWJlbCA9PT0gXCJrYWRcIikge1xuICAgICAgY29uc3QgYnVmZmVyOiBCdWZmZXIgPSBCdWZmZXIuZnJvbShtZXNzYWdlLmRhdGEpO1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgbmV0d29ya0xheWVyOiBuZXR3b3JrID0gYnNvbi5kZXNlcmlhbGl6ZShidWZmZXIpO1xuICAgICAgICBjb25zb2xlLmxvZyhcIm9uY29tbWFuZCBrYWRcIiwgeyBtZXNzYWdlIH0sIHsgbmV0d29ya0xheWVyIH0pO1xuICAgICAgICBpZiAoIUpTT04uc3RyaW5naWZ5KHRoaXMuZGF0YUxpc3QpLmluY2x1ZGVzKG5ldHdvcmtMYXllci5oYXNoKSkge1xuICAgICAgICAgIHRoaXMuZGF0YUxpc3QucHVzaChuZXR3b3JrTGF5ZXIuaGFzaCk7XG4gICAgICAgICAgdGhpcy5vblJlcXVlc3QobmV0d29ya0xheWVyKTtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5sb2coZXJyb3IpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBleGN1dGVFdmVudCh0aGlzLmV2ZW50cy5yZXNwb25kZXIsIG1lc3NhZ2UpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgb25SZXF1ZXN0KG5ldHdvcms6IGFueSkge1xuICAgIHRoaXMucmVzcG9uZGVyLnJlc3BvbnNlKG5ldHdvcmsudHlwZSwgbmV0d29yayk7XG4gICAgdGhpcy5tYWludGFpbihuZXR3b3JrKTtcbiAgfVxufVxuIl19
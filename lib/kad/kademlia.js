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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9rYWQva2FkZW1saWEudHMiXSwibmFtZXMiOlsicmVxdWlyZSIsImJzb24iLCJCU09OIiwiZXhjdXRlRXZlbnQiLCJldiIsInYiLCJjb25zb2xlIiwibG9nIiwiT2JqZWN0Iiwia2V5cyIsImZvckVhY2giLCJrZXkiLCJLYWRlbWxpYSIsIm9wdCIsImlzRmlyc3RDb25uZWN0IiwiaXNPZmZlciIsImZpbmROb2RlIiwiaGFzaCIsIm9uQ29ubmVjdCIsIm9uQWRkUGVlciIsIm9uUGVlckRpc2Nvbm5lY3QiLCJfb25GaW5kVmFsdWUiLCJfb25GaW5kTm9kZSIsIm9uQXBwIiwic3RvcmUiLCJvblN0b3JlIiwiZmluZHZhbHVlIiwib25GaW5kVmFsdWUiLCJmaW5kbm9kZSIsIm9uRmluZE5vZGUiLCJyZXNwb25kZXIiLCJvblJlc3BvbmRlciIsImsiLCJrTGVuZ3RoIiwiY3lwaGVyIiwiQ3lwaGVyIiwic2VjS2V5IiwicHVia2V5Iiwibm9kZUlkIiwicHViS2V5IiwidG9TdHJpbmciLCJrYnVja2V0cyIsIkFycmF5IiwiaSIsImtidWNrZXQiLCJmIiwiSGVscGVyIiwiS1Jlc3BvbmRlciIsInNlbmRlciIsInZhbHVlIiwicGVlciIsImdldENsb3NlRXN0UGVlciIsIkpTT04iLCJzdHJpbmdpZnkiLCJzZW5kRGF0YSIsInNpZ24iLCJlbmNyeXB0IiwibmV0d29yayIsImRlZiIsIlNUT1JFIiwic2VuZCIsInNkcCIsImtleVZhbHVlTGlzdCIsImNodW5rcyIsImNodW5rIiwiQnVmZmVyIiwiZnJvbSIsImluZGV4Iiwic2l6ZSIsImxlbmd0aCIsIlNUT1JFX0NIVU5LUyIsInRhcmdldElkIiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZWplY3QiLCJzdGF0ZSIsInRhcmdldEtleSIsIkZJTkROT0RFIiwiY2FsbGJhY2siLCJldmVudHMiLCJnZXRQZWVyRnJvbW5vZGVJZCIsInIiLCJzZXRUaW1lb3V0IiwicGVlcnMiLCJnZXRDbG9zZVBlZXJzIiwiZG9GaW5kdmFsdWUiLCJvd25lcklkIiwiRklORFZBTFVFIiwiYWRka25vZGUiLCJvbkRhdGEiLCJzdWJzY3JpYmUiLCJyYXciLCJvbkNvbW1hbmQiLCJkaXNjb25uZWN0IiwiY2xlYW5EaXNjb24iLCJnZXRBbGxQZWVySWRzIiwiaXNOb2RlRXhpc3QiLCJudW0iLCJwdXNoIiwiZmluZE5ld1BlZXIiLCJnZXRLYnVja2V0TnVtIiwiY2F0Y2giLCJpbngiLCJzcGxpY2UiLCJzaGlmdCIsInRhcmdldCIsInByb3h5IiwicmVmIiwiV2ViUlRDIiwibWFrZU9mZmVyIiwidGltZW91dCIsInNpZ25hbCIsIl8iLCJjb25uZWN0IiwiY2xlYXJUaW1lb3V0Iiwic2V0U2RwIiwiTWF0aCIsInJhbmRvbSIsIm1lc3NhZ2UiLCJsYWJlbCIsImJ1ZmZlciIsImRhdGEiLCJuZXR3b3JrTGF5ZXIiLCJkZXNlcmlhbGl6ZSIsImRhdGFMaXN0IiwiaW5jbHVkZXMiLCJvblJlcXVlc3QiLCJlcnJvciIsInJlc3BvbnNlIiwidHlwZSIsIm1haW50YWluIl0sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUVBOztBQUNBOztBQUNBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFUQUEsT0FBTyxDQUFDLGdCQUFELENBQVA7O0FBYUEsSUFBTUMsSUFBSSxHQUFHLElBQUlDLFVBQUosRUFBYjs7QUFDTyxTQUFTQyxXQUFULENBQXFCQyxFQUFyQixFQUE4QkMsQ0FBOUIsRUFBdUM7QUFDNUNDLEVBQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZLGFBQVosRUFBMkJILEVBQTNCO0FBQ0FJLEVBQUFBLE1BQU0sQ0FBQ0MsSUFBUCxDQUFZTCxFQUFaLEVBQWdCTSxPQUFoQixDQUF3QixVQUFBQyxHQUFHLEVBQUk7QUFDN0JQLElBQUFBLEVBQUUsQ0FBQ08sR0FBRCxDQUFGLENBQVFOLENBQVI7QUFDRCxHQUZEO0FBR0Q7O0lBRW9CTyxROzs7QUF1Q25CLG9CQUFZQyxHQUFaLEVBQTBFO0FBQUE7O0FBQUE7O0FB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QU9LLEtBQVAsRUFBYztBQUNkekgsVUFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVl3SCxLQUFaO0FBQ0Q7QUFDRixPQVpELE1BWU87QUFDTDVILFFBQUFBLFdBQVcsQ0FBQyxLQUFLNEUsTUFBTCxDQUFZakQsU0FBYixFQUF3QndGLE9BQXhCLENBQVg7QUFDRDtBQUNGOzs7OEJBRWlCN0QsTyxFQUFjO0FBQzlCLFdBQUszQixTQUFMLENBQWVrRyxRQUFmLENBQXdCdkUsT0FBTyxDQUFDd0UsSUFBaEMsRUFBc0N4RSxPQUF0QztBQUNBLFdBQUt5RSxRQUFMLENBQWN6RSxPQUFkO0FBQ0QiLCJzb3VyY2VzQ29udGVudCI6WyJyZXF1aXJlKFwiYmFiZWwtcG9seWZpbGxcIik7XG5pbXBvcnQgV2ViUlRDIGZyb20gXCJ3ZWJydGM0bWVcIjtcbmltcG9ydCBIZWxwZXIgZnJvbSBcIi4va1V0aWxcIjtcbmltcG9ydCBLUmVzcG9uZGVyIGZyb20gXCIuL2tSZXNwb25kZXJcIjtcbmltcG9ydCBkZWYsIHsgbmV0d29ya0Zvcm1hdCB9IGZyb20gXCIuL0tDb25zdFwiO1xuaW1wb3J0IHsgZGlzdGFuY2UgfSBmcm9tIFwia2FkLWRpc3RhbmNlXCI7XG5pbXBvcnQgeyBtZXNzYWdlIH0gZnJvbSBcIndlYnJ0YzRtZS9saWIvaW50ZXJmYWNlXCI7XG5pbXBvcnQgeyBCU09OIH0gZnJvbSBcImJzb25cIjtcbmltcG9ydCBDeXBoZXIgZnJvbSBcIi4uL2xpYi9jeXBoZXJcIjtcbmltcG9ydCBzaGExIGZyb20gXCJzaGExXCI7XG5pbXBvcnQgeyBJRXZlbnRzIH0gZnJvbSBcIi4uL3V0aWxcIjtcbmltcG9ydCB7IFN0b3JlRm9ybWF0LCBTdG9yZUNodW5rcywgRmluZFZhbHVlLCBuZXR3b3JrIH0gZnJvbSBcIi4vaW50ZXJmYWNlXCI7XG5cbmNvbnN0IGJzb24gPSBuZXcgQlNPTigpO1xuZXhwb3J0IGZ1bmN0aW9uIGV4Y3V0ZUV2ZW50KGV2OiBhbnksIHY/OiBhbnkpIHtcbiAgY29uc29sZS5sb2coXCJleGN1dGVFdmVudFwiLCBldik7XG4gIE9iamVjdC5rZXlzKGV2KS5mb3JFYWNoKGtleSA9PiB7XG4gICAgZXZba2V5XSh2KTtcbiAgfSk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEthZGVtbGlhIHtcbiAgbm9kZUlkOiBzdHJpbmc7XG4gIGs6IG51bWJlcjtcbiAga2J1Y2tldHM6IEFycmF5PEFycmF5PFdlYlJUQz4+O1xuICBmOiBIZWxwZXI7XG4gIHJlc3BvbmRlcjogS1Jlc3BvbmRlcjtcbiAgZGF0YUxpc3Q6IEFycmF5PGFueT4gPSBbXTtcbiAga2V5VmFsdWVMaXN0OiB7IFtrZXk6IHN0cmluZ106IGFueSB9ID0ge307XG4gIHJlZjogeyBba2V5OiBzdHJpbmddOiBXZWJSVEMgfSA9IHt9O1xuICBidWZmZXI6IHsgW2tleTogc3RyaW5nXTogQXJyYXk8YW55PiB9ID0ge307XG5cbiAgc3RhdGUgPSB7XG4gICAgaXNGaXJzdENvbm5lY3Q6IHRydWUsXG4gICAgaXNPZmZlcjogZmFsc2UsXG4gICAgZmluZE5vZGU6IFwiXCIsXG4gICAgaGFzaDoge31cbiAgfTtcblxuICBjYWxsYmFjayA9IHtcbiAgICBvbkNvbm5lY3Q6ICgpID0+IHt9LFxuICAgIG9uQWRkUGVlcjogKHY/OiBhbnkpID0+IHt9LFxuICAgIG9uUGVlckRpc2Nvbm5lY3Q6ICh2PzogYW55KSA9PiB7fSxcbiAgICBfb25GaW5kVmFsdWU6ICh2PzogYW55KSA9PiB7fSxcbiAgICBfb25GaW5kTm9kZTogKHY/OiBhbnkpID0+IHt9LFxuICAgIG9uQXBwOiAodj86IGFueSkgPT4ge31cbiAgfTtcblxuICBwcml2YXRlIG9uU3RvcmU6IElFdmVudHMgPSB7fTtcbiAgcHJpdmF0ZSBvbkZpbmRWYWx1ZTogSUV2ZW50cyA9IHt9O1xuICBwcml2YXRlIG9uRmluZE5vZGU6IElFdmVudHMgPSB7fTtcbiAgcHJpdmF0ZSBvblJlc3BvbmRlcjogSUV2ZW50cyA9IHt9O1xuICBldmVudHMgPSB7XG4gICAgc3RvcmU6IHRoaXMub25TdG9yZSxcbiAgICBmaW5kdmFsdWU6IHRoaXMub25GaW5kVmFsdWUsXG4gICAgZmluZG5vZGU6IHRoaXMub25GaW5kTm9kZSxcbiAgICByZXNwb25kZXI6IHRoaXMub25SZXNwb25kZXJcbiAgfTtcbiAgY3lwaGVyOiBDeXBoZXI7XG5cbiAgY29uc3RydWN0b3Iob3B0PzogeyBwdWJrZXk/OiBzdHJpbmc7IHNlY0tleT86IHN0cmluZzsga0xlbmd0aD86IG51bWJlciB9KSB7XG4gICAgdGhpcy5rID0gMjA7XG4gICAgaWYgKG9wdCAmJiBvcHQua0xlbmd0aCkgdGhpcy5rID0gb3B0LmtMZW5ndGg7XG4gICAgaWYgKG9wdCkgdGhpcy5jeXBoZXIgPSBuZXcgQ3lwaGVyKG9wdC5zZWNLZXksIG9wdC5wdWJrZXkpO1xuICAgIGVsc2UgdGhpcy5jeXBoZXIgPSBuZXcgQ3lwaGVyKCk7XG4gICAgdGhpcy5ub2RlSWQgPSBzaGExKHRoaXMuY3lwaGVyLnB1YktleSkudG9TdHJpbmcoKTtcblxuICAgIHRoaXMua2J1Y2tldHMgPSBuZXcgQXJyYXkoMTYwKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IDE2MDsgaSsrKSB7XG4gICAgICBsZXQga2J1Y2tldDogQXJyYXk8YW55PiA9IFtdO1xuICAgICAgdGhpcy5rYnVja2V0c1tpXSA9IGtidWNrZXQ7XG4gICAgfVxuXG4gICAgdGhpcy5mID0gbmV3IEhlbHBlcih0aGlzLmssIHRoaXMua2J1Y2tldHMsIHRoaXMubm9kZUlkKTtcbiAgICB0aGlzLnJlc3BvbmRlciA9IG5ldyBLUmVzcG9uZGVyKHRoaXMpO1xuICB9XG5cbiAgc3RvcmUoc2VuZGVyOiBzdHJpbmcsIGtleTogc3RyaW5nLCB2YWx1ZTogYW55LCBvcHQ/OiB7IGV4Y2x1ZGVJZD86IHN0cmluZyB9KSB7XG4gICAgY29uc3QgcGVlciA9IHRoaXMuZi5nZXRDbG9zZUVzdFBlZXIoa2V5LCBvcHQpO1xuICAgIGlmICghcGVlcikgcmV0dXJuO1xuICAgIGNvbnN0IGhhc2ggPSBzaGExKEpTT04uc3RyaW5naWZ5KHZhbHVlKSkudG9TdHJpbmcoKTtcbiAgICBjb25zdCBzZW5kRGF0YTogU3RvcmVGb3JtYXQgPSB7XG4gICAgICBzZW5kZXIsXG4gICAgICBrZXksXG4gICAgICB2YWx1ZSxcbiAgICAgIHB1YktleTogdGhpcy5jeXBoZXIucHViS2V5LFxuICAgICAgaGFzaCxcbiAgICAgIHNpZ246IHRoaXMuY3lwaGVyLmVuY3J5cHQoaGFzaClcbiAgICB9O1xuICAgIGNvbnN0IG5ldHdvcmsgPSBuZXR3b3JrRm9ybWF0KHRoaXMubm9kZUlkLCBkZWYuU1RPUkUsIHNlbmREYXRhKTtcblxuICAgIGNvbnNvbGUubG9nKGRlZi5TVE9SRSwgXCJuZXh0XCIsIHBlZXIubm9kZUlkLCBcInRhcmdldFwiLCBrZXkpO1xuICAgIHBlZXIuc2VuZChuZXR3b3JrLCBcImthZFwiKTtcbiAgICAvL25vIHNkcFxuICAgIGlmICghdmFsdWUuc2RwKSB0aGlzLmtleVZhbHVlTGlzdFtrZXldID0gdmFsdWU7XG4gIH1cblxuICBzdG9yZUNodW5rcyhcbiAgICBzZW5kZXI6IHN0cmluZyxcbiAgICBrZXk6IHN0cmluZyxcbiAgICBjaHVua3M6IEFycmF5QnVmZmVyW10sXG4gICAgb3B0PzogeyBleGNsdWRlSWQ/OiBzdHJpbmcgfVxuICApIHtcbiAgICAvLyBjb25zdCBwZWVycyA9IHRoaXMuZi5nZXRDbG9zZVBlZXJzKGtleSwgb3B0KTtcbiAgICBjb25zdCBwZWVyID0gdGhpcy5mLmdldENsb3NlRXN0UGVlcihrZXksIG9wdCk7XG4gICAgaWYgKCFwZWVyKSByZXR1cm47XG4gICAgY29uc29sZS5sb2coXCJzdG9yZSBjaHVua3NcIiwgeyBjaHVua3MgfSk7XG4gICAgY2h1bmtzLmZvckVhY2goKGNodW5rLCBpKSA9PiB7XG4gICAgICBjb25zdCBoYXNoID0gc2hhMShCdWZmZXIuZnJvbShjaHVuaykpLnRvU3RyaW5nKCk7XG4gICAgICBjb25zdCBzZW5kRGF0YTogU3RvcmVDaHVua3MgPSB7XG4gICAgICAgIHNlbmRlcjogdGhpcy5ub2RlSWQsXG4gICAgICAgIGtleSxcbiAgICAgICAgdmFsdWU6IEJ1ZmZlci5mcm9tKGNodW5rKSxcbiAgICAgICAgaW5kZXg6IGksXG4gICAgICAgIHB1YktleTogdGhpcy5jeXBoZXIucHViS2V5LFxuICAgICAgICBoYXNoLFxuICAgICAgICBzaWduOiB0aGlzLmN5cGhlci5lbmNyeXB0KGhhc2gpLFxuICAgICAgICBzaXplOiBjaHVua3MubGVuZ3RoXG4gICAgICB9O1xuICAgICAgY29uc3QgbmV0d29yayA9IG5ldHdvcmtGb3JtYXQoc2VuZGVyLCBkZWYuU1RPUkVfQ0hVTktTLCBzZW5kRGF0YSk7XG5cbiAgICAgIGNvbnNvbGUubG9nKGRlZi5TVE9SRSwgXCJuZXh0XCIsIHBlZXIubm9kZUlkLCBcInRhcmdldFwiLCBrZXkpO1xuICAgICAgcGVlci5zZW5kKG5ldHdvcmssIFwia2FkXCIpO1xuICAgIH0pO1xuICAgIC8v44Os44OX44Oq44Kx44O844K344On44OzXG4gICAgdGhpcy5rZXlWYWx1ZUxpc3Rba2V5XSA9IHsgY2h1bmtzIH07XG4gIH1cblxuICBmaW5kTm9kZSh0YXJnZXRJZDogc3RyaW5nLCBwZWVyOiBXZWJSVEMpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2U8V2ViUlRDPihhc3luYyAocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjb25zb2xlLmxvZyhcImZpbmRub2RlXCIsIHRhcmdldElkKTtcbiAgICAgIHRoaXMuc3RhdGUuZmluZE5vZGUgPSB0YXJnZXRJZDtcbiAgICAgIGNvbnN0IHNlbmREYXRhID0geyB0YXJnZXRLZXk6IHRhcmdldElkIH07XG4gICAgICAvL+mAgeOCi1xuICAgICAgcGVlci5zZW5kKG5ldHdvcmtGb3JtYXQodGhpcy5ub2RlSWQsIGRlZi5GSU5ETk9ERSwgc2VuZERhdGEpLCBcImthZFwiKTtcblxuICAgICAgdGhpcy5jYWxsYmFjay5fb25GaW5kTm9kZSgobm9kZUlkOiBzdHJpbmcpID0+IHtcbiAgICAgICAgZXhjdXRlRXZlbnQodGhpcy5ldmVudHMuZmluZG5vZGUsIG5vZGVJZCk7XG4gICAgICAgIHJlc29sdmUodGhpcy5mLmdldFBlZXJGcm9tbm9kZUlkKG5vZGVJZCkpO1xuICAgICAgfSk7XG5cbiAgICAgIGF3YWl0IG5ldyBQcm9taXNlKHIgPT4gc2V0VGltZW91dChyLCAxMCAqIDEwMDApKTtcbiAgICAgIHJlamVjdChcInRpbWVvdXQgZmluZG5vZGVcIik7XG4gICAgfSk7XG4gIH1cblxuICBmaW5kVmFsdWUoa2V5OiBzdHJpbmcsIG9wdD86IHsgb3duZXJJZD86IHN0cmluZyB9KSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlPGFueT4oYXN5bmMgKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgdGhpcy5jYWxsYmFjay5fb25GaW5kVmFsdWUgPSB2YWx1ZSA9PiB7XG4gICAgICAgIGV4Y3V0ZUV2ZW50KHRoaXMuZXZlbnRzLmZpbmR2YWx1ZSwgdmFsdWUpO1xuICAgICAgICByZXNvbHZlKHZhbHVlKTtcbiAgICAgIH07XG4gICAgICAvL2tleeOBq+i/keOBhOODlOOCouOCkuWPluW+l1xuICAgICAgY29uc3QgcGVlcnMgPSB0aGlzLmYuZ2V0Q2xvc2VQZWVycyhrZXkpO1xuICAgICAgcGVlcnMuZm9yRWFjaChwZWVyID0+IHtcbiAgICAgICAgdGhpcy5kb0ZpbmR2YWx1ZShrZXksIHBlZXIpO1xuICAgICAgfSk7XG5cbiAgICAgIGF3YWl0IG5ldyBQcm9taXNlKHIgPT4gc2V0VGltZW91dChyLCA1MDAwKSk7XG4gICAgICBpZiAob3B0ICYmIG9wdC5vd25lcklkKSB7XG4gICAgICAgIGNvbnN0IG93bmVySWQgPSBvcHQub3duZXJJZDtcbiAgICAgICAgY29uc3QgcGVlcnMgPSB0aGlzLmYuZ2V0Q2xvc2VQZWVycyhvd25lcklkKTtcbiAgICAgICAgcGVlcnMuZm9yRWFjaChwZWVyID0+IHtcbiAgICAgICAgICB0aGlzLmRvRmluZHZhbHVlKG93bmVySWQsIHBlZXIpO1xuICAgICAgICB9KTtcbiAgICAgICAgYXdhaXQgbmV3IFByb21pc2UociA9PiBzZXRUaW1lb3V0KHIsIDUwMDApKTtcbiAgICAgIH1cbiAgICAgIHJlamVjdChcImZpbmR2YWx1ZSB0aW1lb3V0XCIpO1xuICAgIH0pO1xuICB9XG5cbiAgYXN5bmMgZG9GaW5kdmFsdWUoa2V5OiBzdHJpbmcsIHBlZXI6IFdlYlJUQykge1xuICAgIGNvbnNvbGUubG9nKFwiZG9maW5kdmFsdWVcIiwgcGVlci5ub2RlSWQpO1xuICAgIGNvbnN0IHNlbmREYXRhOiBGaW5kVmFsdWUgPSB7IHRhcmdldEtleToga2V5IH07XG4gICAgcGVlci5zZW5kKG5ldHdvcmtGb3JtYXQodGhpcy5ub2RlSWQsIGRlZi5GSU5EVkFMVUUsIHNlbmREYXRhKSwgXCJrYWRcIik7XG4gIH1cblxuICBjb25uZWN0KHBlZXI6IFdlYlJUQykge1xuICAgIGNvbnNvbGUubG9nKFwia2FkIGNvbm5lY3RcIik7XG4gICAgaWYgKHRoaXMuc3RhdGUuaXNGaXJzdENvbm5lY3QpIHRoaXMuY2FsbGJhY2sub25Db25uZWN0KCk7XG4gICAgdGhpcy5zdGF0ZS5pc0ZpcnN0Q29ubmVjdCA9IGZhbHNlO1xuICAgIHRoaXMuYWRka25vZGUocGVlcik7XG4gIH1cblxuICBhZGRrbm9kZShwZWVyOiBXZWJSVEMpIHtcbiAgICBwZWVyLm9uRGF0YS5zdWJzY3JpYmUocmF3ID0+IHtcbiAgICAgIHRoaXMub25Db21tYW5kKHJhdyk7XG4gICAgfSk7XG5cbiAgICBwZWVyLmRpc2Nvbm5lY3QgPSAoKSA9PiB7XG4gICAgICBjb25zb2xlLmxvZyhcImthZCBub2RlIGRpc2Nvbm5lY3RlZFwiKTtcbiAgICAgIHRoaXMuZi5jbGVhbkRpc2NvbigpO1xuICAgICAgdGhpcy5jYWxsYmFjay5vbkFkZFBlZXIodGhpcy5mLmdldEFsbFBlZXJJZHMoKSk7XG4gICAgfTtcblxuICAgIGlmICghdGhpcy5mLmlzTm9kZUV4aXN0KHBlZXIubm9kZUlkKSkge1xuICAgICAgLy/oh6rliIbjga7jg47jg7zjg4lJROOBqOi/veWKoOOBmeOCi+ODjuODvOODiUlE44Gu6Led6ZuiXG4gICAgICBjb25zdCBudW0gPSBkaXN0YW5jZSh0aGlzLm5vZGVJZCwgcGVlci5ub2RlSWQpO1xuICAgICAgLy9rYnVja2V0c+OBruipsuW9k+OBmeOCi+i3nembouOBrmtidWNrZXTjgpLlkbzjgbPlh7rjgZlcbiAgICAgIGNvbnN0IGtidWNrZXQgPSB0aGlzLmtidWNrZXRzW251bV07XG4gICAgICAvL+ipsuW9k+OBmeOCi2tidWNrZXTjgavmlrDjgZfjgYTjg5TjgqLjgpLliqDjgYjjgotcbiAgICAgIGtidWNrZXQucHVzaChwZWVyKTtcblxuICAgICAgY29uc29sZS5sb2coXCJhZGRrbm9kZSBrYnVja2V0c1wiLCBcInBlZXIubm9kZUlkOlwiLCBwZWVyLm5vZGVJZCk7XG4gICAgICBjb25zb2xlLmxvZyh0aGlzLmYuZ2V0QWxsUGVlcklkcygpKTtcblxuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHRoaXMuZmluZE5ld1BlZXIocGVlcik7XG4gICAgICB9LCAxMDAwKTtcblxuICAgICAgdGhpcy5jYWxsYmFjay5vbkFkZFBlZXIodGhpcy5mLmdldEFsbFBlZXJJZHMoKSk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBmaW5kTmV3UGVlcihwZWVyOiBXZWJSVEMpIHtcbiAgICBpZiAodGhpcy5mLmdldEtidWNrZXROdW0oKSA8IHRoaXMuaykge1xuICAgICAgLy/oh6rouqvjga7jg47jg7zjg4lJROOCkmtleeOBqOOBl+OBpkZJTkRfTk9ERVxuICAgICAgYXdhaXQgdGhpcy5maW5kTm9kZSh0aGlzLm5vZGVJZCwgcGVlcikuY2F0Y2goY29uc29sZS5sb2cpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmxvZyhcImtidWNrZXQgcmVhZHlcIiwgdGhpcy5mLmdldEtidWNrZXROdW0oKSk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBtYWludGFpbihuZXR3b3JrOiBhbnkpIHtcbiAgICBjb25zdCBpbnggPSBkaXN0YW5jZSh0aGlzLm5vZGVJZCwgbmV0d29yay5ub2RlSWQpO1xuICAgIGNvbnN0IGtidWNrZXQgPSB0aGlzLmtidWNrZXRzW2lueF07XG5cbiAgICAvL+mAgeS/oeWFg+OBjOipsuW9k+OBmeOCi2stYnVja2V044Gu5Lit44Gr44GC44Gj44Gf5aC05ZCIXG4gICAgLy/jgZ3jga7jg47jg7zjg4njgpJrLWJ1Y2tldOOBruacq+WwvuOBq+enu+OBmVxuICAgIGtidWNrZXQuZm9yRWFjaCgocGVlciwgaSkgPT4ge1xuICAgICAgaWYgKHBlZXIubm9kZUlkID09PSBuZXR3b3JrLm5vZGVJZCkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIm1haW50YWluXCIsIFwiTW92ZXPCoGl0wqB0b8KgdGhlwqB0YWlswqBvZsKgdGhlwqBsaXN0XCIpO1xuICAgICAgICBrYnVja2V0LnNwbGljZShpLCAxKTtcbiAgICAgICAga2J1Y2tldC5wdXNoKHBlZXIpO1xuICAgICAgICByZXR1cm4gMDtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vay1idWNrZXTjgYzjgZnjgafjgavmuoDmna/jgarloLTlkIjjgIFcbiAgICAvL+OBneOBrmstYnVja2V05Lit44Gu5YWI6aCt44Gu44OO44O844OJ44GM44Kq44Oz44Op44Kk44Oz44Gq44KJ5YWI6aCt44Gu44OO44O844OJ44KS5q6L44GZXG4gICAgaWYgKGtidWNrZXQubGVuZ3RoID4gdGhpcy5rKSB7XG4gICAgICBrYnVja2V0LnNoaWZ0KCk7XG4gICAgfVxuICB9XG5cbiAgb2ZmZXIodGFyZ2V0OiBzdHJpbmcsIHByb3h5ID0gbnVsbCkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZTxhbnk+KGFzeW5jIChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGNvbnN0IHIgPSB0aGlzLnJlZjtcbiAgICAgIGNvbnN0IHBlZXIgPSAoclt0YXJnZXRdID0gbmV3IFdlYlJUQygpKTtcbiAgICAgIHBlZXIubWFrZU9mZmVyKCk7XG5cbiAgICAgIGNvbnN0IHRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgcmVqZWN0KFwia2FkIG9mZmVyIHRpbWVvdXRcIik7XG4gICAgICB9LCA1ICogMTAwMCk7XG5cbiAgICAgIHBlZXIuc2lnbmFsID0gc2RwID0+IHtcbiAgICAgICAgY29uc29sZS5sb2coXCJrYWQgb2ZmZXIgc3RvcmVcIiwgdGFyZ2V0KTtcbiAgICAgICAgY29uc3QgXyA9IHRoaXMuZi5nZXRDbG9zZUVzdFBlZXIodGFyZ2V0KTtcbiAgICAgICAgaWYgKCFfKSByZXR1cm47XG4gICAgICAgIGlmIChfLm5vZGVJZCAhPT0gdGFyZ2V0KVxuICAgICAgICAgIHRoaXMuc3RvcmUodGhpcy5ub2RlSWQsIHRhcmdldCwgeyBzZHAsIHByb3h5IH0pO1xuICAgICAgfTtcblxuICAgICAgcGVlci5jb25uZWN0ID0gKCkgPT4ge1xuICAgICAgICBwZWVyLm5vZGVJZCA9IHRhcmdldDtcbiAgICAgICAgY29uc29sZS5sb2coXCJrYWQgb2ZmZXIgY29ubmVjdGVkXCIsIHRhcmdldCk7XG4gICAgICAgIHRoaXMuYWRka25vZGUocGVlcik7XG4gICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KTtcbiAgICAgICAgcmVzb2x2ZSh0cnVlKTtcbiAgICAgIH07XG4gICAgfSk7XG4gIH1cblxuICBhbnN3ZXIodGFyZ2V0OiBzdHJpbmcsIHNkcDogc3RyaW5nLCBwcm94eTogc3RyaW5nKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlPGFueT4oYXN5bmMgKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY29uc3QgciA9IHRoaXMucmVmO1xuICAgICAgY29uc3QgcGVlciA9IChyW3RhcmdldF0gPSBuZXcgV2ViUlRDKCkpO1xuICAgICAgcGVlci5zZXRTZHAoc2RwKTtcbiAgICAgIGNvbnNvbGUubG9nKFwia2FkIGFuc3dlclwiLCB0YXJnZXQpO1xuXG4gICAgICBjb25zdCB0aW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHJlamVjdChcImthZCBhbnN3ZXIgdGltZW91dFwiKTtcbiAgICAgIH0sIDUgKiAxMDAwKTtcblxuICAgICAgcGVlci5zaWduYWwgPSBzZHAgPT4ge1xuICAgICAgICBjb25zdCBfID0gdGhpcy5mLmdldFBlZXJGcm9tbm9kZUlkKHByb3h5KTtcbiAgICAgICAgY29uc3QgaGFzaCA9IHNoYTEoTWF0aC5yYW5kb20oKS50b1N0cmluZygpKS50b1N0cmluZygpO1xuICAgICAgICBjb25zdCBzZW5kRGF0YTogU3RvcmVGb3JtYXQgPSB7XG4gICAgICAgICAgc2VuZGVyOiB0aGlzLm5vZGVJZCxcbiAgICAgICAgICBrZXk6IHRhcmdldCxcbiAgICAgICAgICB2YWx1ZTogeyBzZHAgfSxcbiAgICAgICAgICBwdWJLZXk6IHRoaXMuY3lwaGVyLnB1YktleSxcbiAgICAgICAgICBoYXNoLFxuICAgICAgICAgIHNpZ246IHRoaXMuY3lwaGVyLmVuY3J5cHQoaGFzaClcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKF8pIF8uc2VuZChuZXR3b3JrRm9ybWF0KHRoaXMubm9kZUlkLCBkZWYuU1RPUkUsIHNlbmREYXRhKSwgXCJrYWRcIik7XG4gICAgICB9O1xuXG4gICAgICBwZWVyLmNvbm5lY3QgPSAoKSA9PiB7XG4gICAgICAgIHBlZXIubm9kZUlkID0gdGFyZ2V0O1xuICAgICAgICBjb25zb2xlLmxvZyhcImthZCBhbnN3ZXIgY29ubmVjdGVkXCIsIHRhcmdldCk7XG4gICAgICAgIHRoaXMuYWRka25vZGUocGVlcik7XG4gICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KTtcbiAgICAgICAgcmVzb2x2ZSh0cnVlKTtcbiAgICAgIH07XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIG9uQ29tbWFuZChtZXNzYWdlOiBtZXNzYWdlKSB7XG4gICAgaWYgKG1lc3NhZ2UubGFiZWwgPT09IFwia2FkXCIpIHtcbiAgICAgIGNvbnN0IGJ1ZmZlcjogQnVmZmVyID0gQnVmZmVyLmZyb20obWVzc2FnZS5kYXRhKTtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IG5ldHdvcmtMYXllcjogbmV0d29yayA9IGJzb24uZGVzZXJpYWxpemUoYnVmZmVyKTtcbiAgICAgICAgY29uc29sZS5sb2coXCJvbmNvbW1hbmQga2FkXCIsIHsgbWVzc2FnZSB9LCB7IG5ldHdvcmtMYXllciB9KTtcbiAgICAgICAgaWYgKCFKU09OLnN0cmluZ2lmeSh0aGlzLmRhdGFMaXN0KS5pbmNsdWRlcyhuZXR3b3JrTGF5ZXIuaGFzaCkpIHtcbiAgICAgICAgICB0aGlzLmRhdGFMaXN0LnB1c2gobmV0d29ya0xheWVyLmhhc2gpO1xuICAgICAgICAgIHRoaXMub25SZXF1ZXN0KG5ldHdvcmtMYXllcik7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGVycm9yKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgZXhjdXRlRXZlbnQodGhpcy5ldmVudHMucmVzcG9uZGVyLCBtZXNzYWdlKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIG9uUmVxdWVzdChuZXR3b3JrOiBhbnkpIHtcbiAgICB0aGlzLnJlc3BvbmRlci5yZXNwb25zZShuZXR3b3JrLnR5cGUsIG5ldHdvcmspO1xuICAgIHRoaXMubWFpbnRhaW4obmV0d29yayk7XG4gIH1cbn1cbiJdfQ==
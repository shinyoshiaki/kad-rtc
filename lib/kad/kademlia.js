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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9rYWQva2FkZW1saWEudHMiXSwibmFtZXMiOlsicmVxdWlyZSIsImJzb24iLCJCU09OIiwiZXhjdXRlRXZlbnQiLCJldiIsInYiLCJjb25zb2xlIiwibG9nIiwiT2JqZWN0Iiwia2V5cyIsImZvckVhY2giLCJrZXkiLCJLYWRlbWxpYSIsIm9wdCIsImlzRmlyc3RDb25uZWN0IiwiaXNPZmZlciIsImZpbmROb2RlIiwiaGFzaCIsIm9uQ29ubmVjdCIsIm9uQWRkUGVlciIsIm9uUGVlckRpc2Nvbm5lY3QiLCJfb25GaW5kVmFsdWUiLCJfb25GaW5kTm9kZSIsIm9uQXBwIiwic3RvcmUiLCJvblN0b3JlIiwiZmluZHZhbHVlIiwib25GaW5kVmFsdWUiLCJmaW5kbm9kZSIsIm9uRmluZE5vZGUiLCJyZXNwb25kZXIiLCJvblJlc3BvbmRlciIsImsiLCJrTGVuZ3RoIiwiY3lwaGVyIiwiQ3lwaGVyIiwic2VjS2V5IiwicHVia2V5Iiwibm9kZUlkIiwicHViS2V5IiwidG9TdHJpbmciLCJrYnVja2V0cyIsIkFycmF5IiwiaSIsImtidWNrZXQiLCJmIiwiSGVscGVyIiwiS1Jlc3BvbmRlciIsInNlbmRlciIsInZhbHVlIiwicGVlciIsImdldENsb3NlRXN0UGVlciIsIkpTT04iLCJzdHJpbmdpZnkiLCJzZW5kRGF0YSIsInNpZ24iLCJlbmNyeXB0IiwibmV0d29yayIsImRlZiIsIlNUT1JFIiwic2VuZCIsInNkcCIsImtleVZhbHVlTGlzdCIsImNodW5rcyIsImNodW5rIiwiQnVmZmVyIiwiZnJvbSIsImluZGV4Iiwic2l6ZSIsImxlbmd0aCIsIlNUT1JFX0NIVU5LUyIsInRhcmdldElkIiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZWplY3QiLCJzdGF0ZSIsInRhcmdldEtleSIsIkZJTkROT0RFIiwiY2FsbGJhY2siLCJldmVudHMiLCJnZXRQZWVyRnJvbW5vZGVJZCIsInIiLCJzZXRUaW1lb3V0IiwicGVlcnMiLCJnZXRDbG9zZVBlZXJzIiwiZG9GaW5kdmFsdWUiLCJvd25lcklkIiwiRklORFZBTFVFIiwiYWRka25vZGUiLCJkYXRhIiwicmF3Iiwib25Db21tYW5kIiwiZGlzY29ubmVjdCIsImNsZWFuRGlzY29uIiwiZ2V0QWxsUGVlcklkcyIsImlzTm9kZUV4aXN0IiwibnVtIiwicHVzaCIsImZpbmROZXdQZWVyIiwiZ2V0S2J1Y2tldE51bSIsImNhdGNoIiwiaW54Iiwic3BsaWNlIiwic2hpZnQiLCJ0YXJnZXQiLCJwcm94eSIsInJlZiIsIldlYlJUQyIsIm1ha2VPZmZlciIsInRpbWVvdXQiLCJzaWduYWwiLCJfIiwiY29ubmVjdCIsImNsZWFyVGltZW91dCIsIm1ha2VBbnN3ZXIiLCJNYXRoIiwicmFuZG9tIiwibWVzc2FnZSIsImxhYmVsIiwiYnVmZmVyIiwibmV0d29ya0xheWVyIiwiZGVzZXJpYWxpemUiLCJkYXRhTGlzdCIsImluY2x1ZGVzIiwib25SZXF1ZXN0IiwiZXJyb3IiLCJyZXNwb25zZSIsInR5cGUiLCJtYWludGFpbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBVEFBLE9BQU8sQ0FBQyxnQkFBRCxDQUFQOztBQWFBLElBQU1DLElBQUksR0FBRyxJQUFJQyxVQUFKLEVBQWI7O0FBQ08sU0FBU0MsV0FBVCxDQUFxQkMsRUFBckIsRUFBOEJDLENBQTlCLEVBQXVDO0FBQzVDQyxFQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWSxhQUFaLEVBQTJCSCxFQUEzQjtBQUNBSSxFQUFBQSxNQUFNLENBQUNDLElBQVAsQ0FBWUwsRUFBWixFQUFnQk0sT0FBaEIsQ0FBd0IsVUFBQUMsR0FBRyxFQUFJO0FBQzdCUCxJQUFBQSxFQUFFLENBQUNPLEdBQUQsQ0FBRixDQUFRTixDQUFSO0FBQ0QsR0FGRDtBQUdEOztJQUVvQk8sUTs7O0FBdUNuQixvQkFBWUMsR0FBWixFQUEwRTtBQUFBOztBQUFBOztBQUFBOztBQUFBOztBQUFBOztB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LEVBQWM7QUFDZHZILFVBQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZc0gsS0FBWjtBQUNEO0FBQ0YsT0FaRCxNQVlPO0FBQ0wxSCxRQUFBQSxXQUFXLENBQUMsS0FBSzRFLE1BQUwsQ0FBWWpELFNBQWIsRUFBd0J1RixPQUF4QixDQUFYO0FBQ0Q7QUFDRjs7OzhCQUVpQjVELE8sRUFBYztBQUM5QixXQUFLM0IsU0FBTCxDQUFlZ0csUUFBZixDQUF3QnJFLE9BQU8sQ0FBQ3NFLElBQWhDLEVBQXNDdEUsT0FBdEM7QUFDQSxXQUFLdUUsUUFBTCxDQUFjdkUsT0FBZDtBQUNEIiwic291cmNlc0NvbnRlbnQiOlsicmVxdWlyZShcImJhYmVsLXBvbHlmaWxsXCIpO1xuaW1wb3J0IFdlYlJUQyBmcm9tIFwid2VicnRjNG1lXCI7XG5pbXBvcnQgSGVscGVyIGZyb20gXCIuL2tVdGlsXCI7XG5pbXBvcnQgS1Jlc3BvbmRlciBmcm9tIFwiLi9rUmVzcG9uZGVyXCI7XG5pbXBvcnQgZGVmLCB7IG5ldHdvcmtGb3JtYXQgfSBmcm9tIFwiLi9LQ29uc3RcIjtcbmltcG9ydCB7IGRpc3RhbmNlIH0gZnJvbSBcImthZC1kaXN0YW5jZVwiO1xuaW1wb3J0IHsgbWVzc2FnZSB9IGZyb20gXCJ3ZWJydGM0bWUvbGliL2ludGVyZmFjZVwiO1xuaW1wb3J0IHsgQlNPTiB9IGZyb20gXCJic29uXCI7XG5pbXBvcnQgQ3lwaGVyIGZyb20gXCIuLi9saWIvY3lwaGVyXCI7XG5pbXBvcnQgc2hhMSBmcm9tIFwic2hhMVwiO1xuaW1wb3J0IHsgSUV2ZW50cyB9IGZyb20gXCIuLi91dGlsXCI7XG5pbXBvcnQgeyBTdG9yZUZvcm1hdCwgU3RvcmVDaHVua3MsIEZpbmRWYWx1ZSwgbmV0d29yayB9IGZyb20gXCIuL2ludGVyZmFjZVwiO1xuXG5jb25zdCBic29uID0gbmV3IEJTT04oKTtcbmV4cG9ydCBmdW5jdGlvbiBleGN1dGVFdmVudChldjogYW55LCB2PzogYW55KSB7XG4gIGNvbnNvbGUubG9nKFwiZXhjdXRlRXZlbnRcIiwgZXYpO1xuICBPYmplY3Qua2V5cyhldikuZm9yRWFjaChrZXkgPT4ge1xuICAgIGV2W2tleV0odik7XG4gIH0pO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBLYWRlbWxpYSB7XG4gIG5vZGVJZDogc3RyaW5nO1xuICBrOiBudW1iZXI7XG4gIGtidWNrZXRzOiBBcnJheTxBcnJheTxXZWJSVEM+PjtcbiAgZjogSGVscGVyO1xuICByZXNwb25kZXI6IEtSZXNwb25kZXI7XG4gIGRhdGFMaXN0OiBBcnJheTxhbnk+ID0gW107XG4gIGtleVZhbHVlTGlzdDogeyBba2V5OiBzdHJpbmddOiBhbnkgfSA9IHt9O1xuICByZWY6IHsgW2tleTogc3RyaW5nXTogV2ViUlRDIH0gPSB7fTtcbiAgYnVmZmVyOiB7IFtrZXk6IHN0cmluZ106IEFycmF5PGFueT4gfSA9IHt9O1xuXG4gIHN0YXRlID0ge1xuICAgIGlzRmlyc3RDb25uZWN0OiB0cnVlLFxuICAgIGlzT2ZmZXI6IGZhbHNlLFxuICAgIGZpbmROb2RlOiBcIlwiLFxuICAgIGhhc2g6IHt9XG4gIH07XG5cbiAgY2FsbGJhY2sgPSB7XG4gICAgb25Db25uZWN0OiAoKSA9PiB7fSxcbiAgICBvbkFkZFBlZXI6ICh2PzogYW55KSA9PiB7fSxcbiAgICBvblBlZXJEaXNjb25uZWN0OiAodj86IGFueSkgPT4ge30sXG4gICAgX29uRmluZFZhbHVlOiAodj86IGFueSkgPT4ge30sXG4gICAgX29uRmluZE5vZGU6ICh2PzogYW55KSA9PiB7fSxcbiAgICBvbkFwcDogKHY/OiBhbnkpID0+IHt9XG4gIH07XG5cbiAgcHJpdmF0ZSBvblN0b3JlOiBJRXZlbnRzID0ge307XG4gIHByaXZhdGUgb25GaW5kVmFsdWU6IElFdmVudHMgPSB7fTtcbiAgcHJpdmF0ZSBvbkZpbmROb2RlOiBJRXZlbnRzID0ge307XG4gIHByaXZhdGUgb25SZXNwb25kZXI6IElFdmVudHMgPSB7fTtcbiAgZXZlbnRzID0ge1xuICAgIHN0b3JlOiB0aGlzLm9uU3RvcmUsXG4gICAgZmluZHZhbHVlOiB0aGlzLm9uRmluZFZhbHVlLFxuICAgIGZpbmRub2RlOiB0aGlzLm9uRmluZE5vZGUsXG4gICAgcmVzcG9uZGVyOiB0aGlzLm9uUmVzcG9uZGVyXG4gIH07XG4gIGN5cGhlcjogQ3lwaGVyO1xuXG4gIGNvbnN0cnVjdG9yKG9wdD86IHsgcHVia2V5Pzogc3RyaW5nOyBzZWNLZXk/OiBzdHJpbmc7IGtMZW5ndGg/OiBudW1iZXIgfSkge1xuICAgIHRoaXMuayA9IDIwO1xuICAgIGlmIChvcHQgJiYgb3B0LmtMZW5ndGgpIHRoaXMuayA9IG9wdC5rTGVuZ3RoO1xuICAgIGlmIChvcHQpIHRoaXMuY3lwaGVyID0gbmV3IEN5cGhlcihvcHQuc2VjS2V5LCBvcHQucHVia2V5KTtcbiAgICBlbHNlIHRoaXMuY3lwaGVyID0gbmV3IEN5cGhlcigpO1xuICAgIHRoaXMubm9kZUlkID0gc2hhMSh0aGlzLmN5cGhlci5wdWJLZXkpLnRvU3RyaW5nKCk7XG5cbiAgICB0aGlzLmtidWNrZXRzID0gbmV3IEFycmF5KDE2MCk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCAxNjA7IGkrKykge1xuICAgICAgbGV0IGtidWNrZXQ6IEFycmF5PGFueT4gPSBbXTtcbiAgICAgIHRoaXMua2J1Y2tldHNbaV0gPSBrYnVja2V0O1xuICAgIH1cblxuICAgIHRoaXMuZiA9IG5ldyBIZWxwZXIodGhpcy5rLCB0aGlzLmtidWNrZXRzLCB0aGlzLm5vZGVJZCk7XG4gICAgdGhpcy5yZXNwb25kZXIgPSBuZXcgS1Jlc3BvbmRlcih0aGlzKTtcbiAgfVxuXG4gIHN0b3JlKHNlbmRlcjogc3RyaW5nLCBrZXk6IHN0cmluZywgdmFsdWU6IGFueSwgb3B0PzogeyBleGNsdWRlSWQ/OiBzdHJpbmcgfSkge1xuICAgIGNvbnN0IHBlZXIgPSB0aGlzLmYuZ2V0Q2xvc2VFc3RQZWVyKGtleSwgb3B0KTtcbiAgICBpZiAoIXBlZXIpIHJldHVybjtcbiAgICBjb25zdCBoYXNoID0gc2hhMShKU09OLnN0cmluZ2lmeSh2YWx1ZSkpLnRvU3RyaW5nKCk7XG4gICAgY29uc3Qgc2VuZERhdGE6IFN0b3JlRm9ybWF0ID0ge1xuICAgICAgc2VuZGVyLFxuICAgICAga2V5LFxuICAgICAgdmFsdWUsXG4gICAgICBwdWJLZXk6IHRoaXMuY3lwaGVyLnB1YktleSxcbiAgICAgIGhhc2gsXG4gICAgICBzaWduOiB0aGlzLmN5cGhlci5lbmNyeXB0KGhhc2gpXG4gICAgfTtcbiAgICBjb25zdCBuZXR3b3JrID0gbmV0d29ya0Zvcm1hdCh0aGlzLm5vZGVJZCwgZGVmLlNUT1JFLCBzZW5kRGF0YSk7XG5cbiAgICBjb25zb2xlLmxvZyhkZWYuU1RPUkUsIFwibmV4dFwiLCBwZWVyLm5vZGVJZCwgXCJ0YXJnZXRcIiwga2V5KTtcbiAgICBwZWVyLnNlbmQobmV0d29yaywgXCJrYWRcIik7XG4gICAgLy9ubyBzZHBcbiAgICBpZiAoIXZhbHVlLnNkcCkgdGhpcy5rZXlWYWx1ZUxpc3Rba2V5XSA9IHZhbHVlO1xuICB9XG5cbiAgc3RvcmVDaHVua3MoXG4gICAgc2VuZGVyOiBzdHJpbmcsXG4gICAga2V5OiBzdHJpbmcsXG4gICAgY2h1bmtzOiBBcnJheUJ1ZmZlcltdLFxuICAgIG9wdD86IHsgZXhjbHVkZUlkPzogc3RyaW5nIH1cbiAgKSB7XG4gICAgLy8gY29uc3QgcGVlcnMgPSB0aGlzLmYuZ2V0Q2xvc2VQZWVycyhrZXksIG9wdCk7XG4gICAgY29uc3QgcGVlciA9IHRoaXMuZi5nZXRDbG9zZUVzdFBlZXIoa2V5LCBvcHQpO1xuICAgIGlmICghcGVlcikgcmV0dXJuO1xuICAgIGNvbnNvbGUubG9nKFwic3RvcmUgY2h1bmtzXCIsIHsgY2h1bmtzIH0pO1xuICAgIGNodW5rcy5mb3JFYWNoKChjaHVuaywgaSkgPT4ge1xuICAgICAgY29uc3QgaGFzaCA9IHNoYTEoQnVmZmVyLmZyb20oY2h1bmspKS50b1N0cmluZygpO1xuICAgICAgY29uc3Qgc2VuZERhdGE6IFN0b3JlQ2h1bmtzID0ge1xuICAgICAgICBzZW5kZXI6IHRoaXMubm9kZUlkLFxuICAgICAgICBrZXksXG4gICAgICAgIHZhbHVlOiBCdWZmZXIuZnJvbShjaHVuayksXG4gICAgICAgIGluZGV4OiBpLFxuICAgICAgICBwdWJLZXk6IHRoaXMuY3lwaGVyLnB1YktleSxcbiAgICAgICAgaGFzaCxcbiAgICAgICAgc2lnbjogdGhpcy5jeXBoZXIuZW5jcnlwdChoYXNoKSxcbiAgICAgICAgc2l6ZTogY2h1bmtzLmxlbmd0aFxuICAgICAgfTtcbiAgICAgIGNvbnN0IG5ldHdvcmsgPSBuZXR3b3JrRm9ybWF0KHNlbmRlciwgZGVmLlNUT1JFX0NIVU5LUywgc2VuZERhdGEpO1xuXG4gICAgICBjb25zb2xlLmxvZyhkZWYuU1RPUkUsIFwibmV4dFwiLCBwZWVyLm5vZGVJZCwgXCJ0YXJnZXRcIiwga2V5KTtcbiAgICAgIHBlZXIuc2VuZChuZXR3b3JrLCBcImthZFwiKTtcbiAgICB9KTtcbiAgICAvL+ODrOODl+ODquOCseODvOOCt+ODp+ODs1xuICAgIHRoaXMua2V5VmFsdWVMaXN0W2tleV0gPSB7IGNodW5rcyB9O1xuICB9XG5cbiAgZmluZE5vZGUodGFyZ2V0SWQ6IHN0cmluZywgcGVlcjogV2ViUlRDKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlPFdlYlJUQz4oYXN5bmMgKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY29uc29sZS5sb2coXCJmaW5kbm9kZVwiLCB0YXJnZXRJZCk7XG4gICAgICB0aGlzLnN0YXRlLmZpbmROb2RlID0gdGFyZ2V0SWQ7XG4gICAgICBjb25zdCBzZW5kRGF0YSA9IHsgdGFyZ2V0S2V5OiB0YXJnZXRJZCB9O1xuICAgICAgLy/pgIHjgotcbiAgICAgIHBlZXIuc2VuZChuZXR3b3JrRm9ybWF0KHRoaXMubm9kZUlkLCBkZWYuRklORE5PREUsIHNlbmREYXRhKSwgXCJrYWRcIik7XG5cbiAgICAgIHRoaXMuY2FsbGJhY2suX29uRmluZE5vZGUoKG5vZGVJZDogc3RyaW5nKSA9PiB7XG4gICAgICAgIGV4Y3V0ZUV2ZW50KHRoaXMuZXZlbnRzLmZpbmRub2RlLCBub2RlSWQpO1xuICAgICAgICByZXNvbHZlKHRoaXMuZi5nZXRQZWVyRnJvbW5vZGVJZChub2RlSWQpKTtcbiAgICAgIH0pO1xuXG4gICAgICBhd2FpdCBuZXcgUHJvbWlzZShyID0+IHNldFRpbWVvdXQociwgMTAgKiAxMDAwKSk7XG4gICAgICByZWplY3QoXCJ0aW1lb3V0IGZpbmRub2RlXCIpO1xuICAgIH0pO1xuICB9XG5cbiAgZmluZFZhbHVlKGtleTogc3RyaW5nLCBvcHQ/OiB7IG93bmVySWQ/OiBzdHJpbmcgfSkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZTxhbnk+KGFzeW5jIChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIHRoaXMuY2FsbGJhY2suX29uRmluZFZhbHVlID0gdmFsdWUgPT4ge1xuICAgICAgICBleGN1dGVFdmVudCh0aGlzLmV2ZW50cy5maW5kdmFsdWUsIHZhbHVlKTtcbiAgICAgICAgcmVzb2x2ZSh2YWx1ZSk7XG4gICAgICB9O1xuICAgICAgLy9rZXnjgavov5HjgYTjg5TjgqLjgpLlj5blvpdcbiAgICAgIGNvbnN0IHBlZXJzID0gdGhpcy5mLmdldENsb3NlUGVlcnMoa2V5KTtcbiAgICAgIHBlZXJzLmZvckVhY2gocGVlciA9PiB7XG4gICAgICAgIHRoaXMuZG9GaW5kdmFsdWUoa2V5LCBwZWVyKTtcbiAgICAgIH0pO1xuXG4gICAgICBhd2FpdCBuZXcgUHJvbWlzZShyID0+IHNldFRpbWVvdXQociwgNTAwMCkpO1xuICAgICAgaWYgKG9wdCAmJiBvcHQub3duZXJJZCkge1xuICAgICAgICBjb25zdCBvd25lcklkID0gb3B0Lm93bmVySWQ7XG4gICAgICAgIGNvbnN0IHBlZXJzID0gdGhpcy5mLmdldENsb3NlUGVlcnMob3duZXJJZCk7XG4gICAgICAgIHBlZXJzLmZvckVhY2gocGVlciA9PiB7XG4gICAgICAgICAgdGhpcy5kb0ZpbmR2YWx1ZShvd25lcklkLCBwZWVyKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGF3YWl0IG5ldyBQcm9taXNlKHIgPT4gc2V0VGltZW91dChyLCA1MDAwKSk7XG4gICAgICB9XG4gICAgICByZWplY3QoXCJmaW5kdmFsdWUgdGltZW91dFwiKTtcbiAgICB9KTtcbiAgfVxuXG4gIGFzeW5jIGRvRmluZHZhbHVlKGtleTogc3RyaW5nLCBwZWVyOiBXZWJSVEMpIHtcbiAgICBjb25zb2xlLmxvZyhcImRvZmluZHZhbHVlXCIsIHBlZXIubm9kZUlkKTtcbiAgICBjb25zdCBzZW5kRGF0YTogRmluZFZhbHVlID0geyB0YXJnZXRLZXk6IGtleSB9O1xuICAgIHBlZXIuc2VuZChuZXR3b3JrRm9ybWF0KHRoaXMubm9kZUlkLCBkZWYuRklORFZBTFVFLCBzZW5kRGF0YSksIFwia2FkXCIpO1xuICB9XG5cbiAgY29ubmVjdChwZWVyOiBXZWJSVEMpIHtcbiAgICBjb25zb2xlLmxvZyhcImthZCBjb25uZWN0XCIpO1xuICAgIGlmICh0aGlzLnN0YXRlLmlzRmlyc3RDb25uZWN0KSB0aGlzLmNhbGxiYWNrLm9uQ29ubmVjdCgpO1xuICAgIHRoaXMuc3RhdGUuaXNGaXJzdENvbm5lY3QgPSBmYWxzZTtcbiAgICB0aGlzLmFkZGtub2RlKHBlZXIpO1xuICB9XG5cbiAgYWRka25vZGUocGVlcjogV2ViUlRDKSB7XG4gICAgcGVlci5ldmVudHMuZGF0YVtcImthZGVtbGlhLnRzXCJdID0gcmF3ID0+IHtcbiAgICAgIHRoaXMub25Db21tYW5kKHJhdyk7XG4gICAgfTtcblxuICAgIHBlZXIuZGlzY29ubmVjdCA9ICgpID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKFwia2FkIG5vZGUgZGlzY29ubmVjdGVkXCIpO1xuICAgICAgdGhpcy5mLmNsZWFuRGlzY29uKCk7XG4gICAgICB0aGlzLmNhbGxiYWNrLm9uQWRkUGVlcih0aGlzLmYuZ2V0QWxsUGVlcklkcygpKTtcbiAgICB9O1xuXG4gICAgaWYgKCF0aGlzLmYuaXNOb2RlRXhpc3QocGVlci5ub2RlSWQpKSB7XG4gICAgICAvL+iHquWIhuOBruODjuODvOODiUlE44Go6L+95Yqg44GZ44KL44OO44O844OJSUTjga7ot53pm6JcbiAgICAgIGNvbnN0IG51bSA9IGRpc3RhbmNlKHRoaXMubm9kZUlkLCBwZWVyLm5vZGVJZCk7XG4gICAgICAvL2tidWNrZXRz44Gu6Kmy5b2T44GZ44KL6Led6Zui44Gua2J1Y2tldOOCkuWRvOOBs+WHuuOBmVxuICAgICAgY29uc3Qga2J1Y2tldCA9IHRoaXMua2J1Y2tldHNbbnVtXTtcbiAgICAgIC8v6Kmy5b2T44GZ44KLa2J1Y2tldOOBq+aWsOOBl+OBhOODlOOCouOCkuWKoOOBiOOCi1xuICAgICAga2J1Y2tldC5wdXNoKHBlZXIpO1xuXG4gICAgICBjb25zb2xlLmxvZyhcImFkZGtub2RlIGtidWNrZXRzXCIsIFwicGVlci5ub2RlSWQ6XCIsIHBlZXIubm9kZUlkKTtcbiAgICAgIGNvbnNvbGUubG9nKHRoaXMuZi5nZXRBbGxQZWVySWRzKCkpO1xuXG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgdGhpcy5maW5kTmV3UGVlcihwZWVyKTtcbiAgICAgIH0sIDEwMDApO1xuXG4gICAgICB0aGlzLmNhbGxiYWNrLm9uQWRkUGVlcih0aGlzLmYuZ2V0QWxsUGVlcklkcygpKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIGZpbmROZXdQZWVyKHBlZXI6IFdlYlJUQykge1xuICAgIGlmICh0aGlzLmYuZ2V0S2J1Y2tldE51bSgpIDwgdGhpcy5rKSB7XG4gICAgICAvL+iHqui6q+OBruODjuODvOODiUlE44KSa2V544Go44GX44GmRklORF9OT0RFXG4gICAgICBhd2FpdCB0aGlzLmZpbmROb2RlKHRoaXMubm9kZUlkLCBwZWVyKS5jYXRjaChjb25zb2xlLmxvZyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUubG9nKFwia2J1Y2tldCByZWFkeVwiLCB0aGlzLmYuZ2V0S2J1Y2tldE51bSgpKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIG1haW50YWluKG5ldHdvcms6IGFueSkge1xuICAgIGNvbnN0IGlueCA9IGRpc3RhbmNlKHRoaXMubm9kZUlkLCBuZXR3b3JrLm5vZGVJZCk7XG4gICAgY29uc3Qga2J1Y2tldCA9IHRoaXMua2J1Y2tldHNbaW54XTtcblxuICAgIC8v6YCB5L+h5YWD44GM6Kmy5b2T44GZ44KLay1idWNrZXTjga7kuK3jgavjgYLjgaPjgZ/loLTlkIhcbiAgICAvL+OBneOBruODjuODvOODieOCkmstYnVja2V044Gu5pyr5bC+44Gr56e744GZXG4gICAga2J1Y2tldC5mb3JFYWNoKChwZWVyLCBpKSA9PiB7XG4gICAgICBpZiAocGVlci5ub2RlSWQgPT09IG5ldHdvcmsubm9kZUlkKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwibWFpbnRhaW5cIiwgXCJNb3Zlc8KgaXTCoHRvwqB0aGXCoHRhaWzCoG9mwqB0aGXCoGxpc3RcIik7XG4gICAgICAgIGtidWNrZXQuc3BsaWNlKGksIDEpO1xuICAgICAgICBrYnVja2V0LnB1c2gocGVlcik7XG4gICAgICAgIHJldHVybiAwO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy9rLWJ1Y2tldOOBjOOBmeOBp+OBq+a6gOadr+OBquWgtOWQiOOAgVxuICAgIC8v44Gd44Guay1idWNrZXTkuK3jga7lhYjpoK3jga7jg47jg7zjg4njgYzjgqrjg7Pjg6njgqTjg7PjgarjgonlhYjpoK3jga7jg47jg7zjg4njgpLmrovjgZlcbiAgICBpZiAoa2J1Y2tldC5sZW5ndGggPiB0aGlzLmspIHtcbiAgICAgIGtidWNrZXQuc2hpZnQoKTtcbiAgICB9XG4gIH1cblxuICBvZmZlcih0YXJnZXQ6IHN0cmluZywgcHJveHkgPSBudWxsKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlPGFueT4oYXN5bmMgKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY29uc3QgciA9IHRoaXMucmVmO1xuICAgICAgY29uc3QgcGVlciA9IChyW3RhcmdldF0gPSBuZXcgV2ViUlRDKCkpO1xuICAgICAgcGVlci5tYWtlT2ZmZXIoKTtcblxuICAgICAgY29uc3QgdGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICByZWplY3QoXCJrYWQgb2ZmZXIgdGltZW91dFwiKTtcbiAgICAgIH0sIDUgKiAxMDAwKTtcblxuICAgICAgcGVlci5zaWduYWwgPSBzZHAgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZyhcImthZCBvZmZlciBzdG9yZVwiLCB0YXJnZXQpO1xuICAgICAgICBjb25zdCBfID0gdGhpcy5mLmdldENsb3NlRXN0UGVlcih0YXJnZXQpO1xuICAgICAgICBpZiAoIV8pIHJldHVybjtcbiAgICAgICAgaWYgKF8ubm9kZUlkICE9PSB0YXJnZXQpXG4gICAgICAgICAgdGhpcy5zdG9yZSh0aGlzLm5vZGVJZCwgdGFyZ2V0LCB7IHNkcCwgcHJveHkgfSk7XG4gICAgICB9O1xuXG4gICAgICBwZWVyLmNvbm5lY3QgPSAoKSA9PiB7XG4gICAgICAgIHBlZXIubm9kZUlkID0gdGFyZ2V0O1xuICAgICAgICBjb25zb2xlLmxvZyhcImthZCBvZmZlciBjb25uZWN0ZWRcIiwgdGFyZ2V0KTtcbiAgICAgICAgdGhpcy5hZGRrbm9kZShwZWVyKTtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xuICAgICAgICByZXNvbHZlKHRydWUpO1xuICAgICAgfTtcbiAgICB9KTtcbiAgfVxuXG4gIGFuc3dlcih0YXJnZXQ6IHN0cmluZywgc2RwOiBzdHJpbmcsIHByb3h5OiBzdHJpbmcpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2U8YW55Pihhc3luYyAocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjb25zdCByID0gdGhpcy5yZWY7XG4gICAgICBjb25zdCBwZWVyID0gKHJbdGFyZ2V0XSA9IG5ldyBXZWJSVEMoKSk7XG4gICAgICBwZWVyLm1ha2VBbnN3ZXIoc2RwKTtcbiAgICAgIGNvbnNvbGUubG9nKFwia2FkIGFuc3dlclwiLCB0YXJnZXQpO1xuXG4gICAgICBjb25zdCB0aW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHJlamVjdChcImthZCBhbnN3ZXIgdGltZW91dFwiKTtcbiAgICAgIH0sIDUgKiAxMDAwKTtcblxuICAgICAgcGVlci5zaWduYWwgPSBzZHAgPT4ge1xuICAgICAgICBjb25zdCBfID0gdGhpcy5mLmdldFBlZXJGcm9tbm9kZUlkKHByb3h5KTtcbiAgICAgICAgY29uc3QgaGFzaCA9IHNoYTEoTWF0aC5yYW5kb20oKS50b1N0cmluZygpKS50b1N0cmluZygpO1xuICAgICAgICBjb25zdCBzZW5kRGF0YTogU3RvcmVGb3JtYXQgPSB7XG4gICAgICAgICAgc2VuZGVyOiB0aGlzLm5vZGVJZCxcbiAgICAgICAgICBrZXk6IHRhcmdldCxcbiAgICAgICAgICB2YWx1ZTogeyBzZHAgfSxcbiAgICAgICAgICBwdWJLZXk6IHRoaXMuY3lwaGVyLnB1YktleSxcbiAgICAgICAgICBoYXNoLFxuICAgICAgICAgIHNpZ246IHRoaXMuY3lwaGVyLmVuY3J5cHQoaGFzaClcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKF8pIF8uc2VuZChuZXR3b3JrRm9ybWF0KHRoaXMubm9kZUlkLCBkZWYuU1RPUkUsIHNlbmREYXRhKSwgXCJrYWRcIik7XG4gICAgICB9O1xuXG4gICAgICBwZWVyLmNvbm5lY3QgPSAoKSA9PiB7XG4gICAgICAgIHBlZXIubm9kZUlkID0gdGFyZ2V0O1xuICAgICAgICBjb25zb2xlLmxvZyhcImthZCBhbnN3ZXIgY29ubmVjdGVkXCIsIHRhcmdldCk7XG4gICAgICAgIHRoaXMuYWRka25vZGUocGVlcik7XG4gICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KTtcbiAgICAgICAgcmVzb2x2ZSh0cnVlKTtcbiAgICAgIH07XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIG9uQ29tbWFuZChtZXNzYWdlOiBtZXNzYWdlKSB7XG4gICAgaWYgKG1lc3NhZ2UubGFiZWwgPT09IFwia2FkXCIpIHtcbiAgICAgIGNvbnN0IGJ1ZmZlcjogQnVmZmVyID0gQnVmZmVyLmZyb20obWVzc2FnZS5kYXRhKTtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IG5ldHdvcmtMYXllcjogbmV0d29yayA9IGJzb24uZGVzZXJpYWxpemUoYnVmZmVyKTtcbiAgICAgICAgY29uc29sZS5sb2coXCJvbmNvbW1hbmQga2FkXCIsIHsgbWVzc2FnZSB9LCB7IG5ldHdvcmtMYXllciB9KTtcbiAgICAgICAgaWYgKCFKU09OLnN0cmluZ2lmeSh0aGlzLmRhdGFMaXN0KS5pbmNsdWRlcyhuZXR3b3JrTGF5ZXIuaGFzaCkpIHtcbiAgICAgICAgICB0aGlzLmRhdGFMaXN0LnB1c2gobmV0d29ya0xheWVyLmhhc2gpO1xuICAgICAgICAgIHRoaXMub25SZXF1ZXN0KG5ldHdvcmtMYXllcik7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGVycm9yKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgZXhjdXRlRXZlbnQodGhpcy5ldmVudHMucmVzcG9uZGVyLCBtZXNzYWdlKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIG9uUmVxdWVzdChuZXR3b3JrOiBhbnkpIHtcbiAgICB0aGlzLnJlc3BvbmRlci5yZXNwb25zZShuZXR3b3JrLnR5cGUsIG5ldHdvcmspO1xuICAgIHRoaXMubWFpbnRhaW4obmV0d29yayk7XG4gIH1cbn1cbiJdfQ==
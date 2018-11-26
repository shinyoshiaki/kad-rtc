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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9rYWQva2FkZW1saWEudHMiXSwibmFtZXMiOlsicmVxdWlyZSIsImJzb24iLCJCU09OIiwiZXhjdXRlRXZlbnQiLCJldiIsInYiLCJjb25zb2xlIiwibG9nIiwiT2JqZWN0Iiwia2V5cyIsImZvckVhY2giLCJrZXkiLCJLYWRlbWxpYSIsIm9wdCIsImlzRmlyc3RDb25uZWN0IiwiaXNPZmZlciIsImZpbmROb2RlIiwiaGFzaCIsIm9uQ29ubmVjdCIsIm9uQWRkUGVlciIsIm9uUGVlckRpc2Nvbm5lY3QiLCJfb25GaW5kVmFsdWUiLCJfb25GaW5kTm9kZSIsIm9uQXBwIiwic3RvcmUiLCJvblN0b3JlIiwiZmluZHZhbHVlIiwib25GaW5kVmFsdWUiLCJmaW5kbm9kZSIsIm9uRmluZE5vZGUiLCJyZXNwb25kZXIiLCJvblJlc3BvbmRlciIsImsiLCJrTGVuZ3RoIiwiY3lwaGVyIiwiQ3lwaGVyIiwic2VjS2V5IiwicHVia2V5Iiwibm9kZUlkIiwicHViS2V5IiwidG9TdHJpbmciLCJrYnVja2V0cyIsIkFycmF5IiwiaSIsImtidWNrZXQiLCJmIiwiSGVscGVyIiwiS1Jlc3BvbmRlciIsInNlbmRlciIsInZhbHVlIiwicGVlciIsImdldENsb3NlRXN0UGVlciIsIkpTT04iLCJzdHJpbmdpZnkiLCJzZW5kRGF0YSIsInNpZ24iLCJlbmNyeXB0IiwibmV0d29yayIsImRlZiIsIlNUT1JFIiwic2VuZCIsInNkcCIsImtleVZhbHVlTGlzdCIsImNodW5rcyIsImNodW5rIiwiQnVmZmVyIiwiZnJvbSIsImluZGV4Iiwic2l6ZSIsImxlbmd0aCIsIlNUT1JFX0NIVU5LUyIsInRhcmdldElkIiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZWplY3QiLCJzdGF0ZSIsInRhcmdldEtleSIsIkZJTkROT0RFIiwiY2FsbGJhY2siLCJldmVudHMiLCJnZXRQZWVyRnJvbW5vZGVJZCIsInIiLCJzZXRUaW1lb3V0IiwicGVlcnMiLCJnZXRDbG9zZVBlZXJzIiwiZG9GaW5kdmFsdWUiLCJvd25lcklkIiwiRklORFZBTFVFIiwiYWRka25vZGUiLCJkYXRhIiwicmF3Iiwib25Db21tYW5kIiwiZGlzY29ubmVjdCIsImNsZWFuRGlzY29uIiwiZ2V0QWxsUGVlcklkcyIsImlzTm9kZUV4aXN0IiwibnVtIiwicHVzaCIsImZpbmROZXdQZWVyIiwiZ2V0S2J1Y2tldE51bSIsImNhdGNoIiwiaW54Iiwic3BsaWNlIiwic2hpZnQiLCJ0YXJnZXQiLCJwcm94eSIsInJlZiIsIldlYlJUQyIsIm1ha2VPZmZlciIsInRpbWVvdXQiLCJzaWduYWwiLCJfIiwiY29ubmVjdCIsImNsZWFyVGltZW91dCIsIm1ha2VBbnN3ZXIiLCJNYXRoIiwicmFuZG9tIiwibWVzc2FnZSIsImxhYmVsIiwiYnVmZmVyIiwibmV0d29ya0xheWVyIiwiZGVzZXJpYWxpemUiLCJkYXRhTGlzdCIsImluY2x1ZGVzIiwib25SZXF1ZXN0IiwiZXJyb3IiLCJyZXNwb25zZSIsInR5cGUiLCJtYWludGFpbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBVEFBLE9BQU8sQ0FBQyxnQkFBRCxDQUFQOztBQVlBLElBQU1DLElBQUksR0FBRyxJQUFJQyxVQUFKLEVBQWI7O0FBQ08sU0FBU0MsV0FBVCxDQUFxQkMsRUFBckIsRUFBOEJDLENBQTlCLEVBQXVDO0FBQzVDQyxFQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWSxhQUFaLEVBQTJCSCxFQUEzQjtBQUNBSSxFQUFBQSxNQUFNLENBQUNDLElBQVAsQ0FBWUwsRUFBWixFQUFnQk0sT0FBaEIsQ0FBd0IsVUFBQUMsR0FBRyxFQUFJO0FBQzdCUCxJQUFBQSxFQUFFLENBQUNPLEdBQUQsQ0FBRixDQUFRTixDQUFSO0FBQ0QsR0FGRDtBQUdEOztJQUVvQk8sUTs7O0FBdUNuQixvQkFBWUMsR0FBWixFQUEwRTtBQUFBOztBQUFBOztBQUFBOztBQUFBOztBQUFBOztB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LEVBQWM7QUFDZHZILFVBQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZc0gsS0FBWjtBQUNEO0FBQ0YsT0FaRCxNQVlPO0FBQ0wxSCxRQUFBQSxXQUFXLENBQUMsS0FBSzRFLE1BQUwsQ0FBWWpELFNBQWIsRUFBd0J1RixPQUF4QixDQUFYO0FBQ0Q7QUFDRjs7OzhCQUVpQjVELE8sRUFBYztBQUM5QixXQUFLM0IsU0FBTCxDQUFlZ0csUUFBZixDQUF3QnJFLE9BQU8sQ0FBQ3NFLElBQWhDLEVBQXNDdEUsT0FBdEM7QUFDQSxXQUFLdUUsUUFBTCxDQUFjdkUsT0FBZDtBQUNEIiwic291cmNlc0NvbnRlbnQiOlsicmVxdWlyZShcImJhYmVsLXBvbHlmaWxsXCIpO1xuaW1wb3J0IFdlYlJUQyBmcm9tIFwid2VicnRjNG1lXCI7XG5pbXBvcnQgSGVscGVyIGZyb20gXCIuL2tVdGlsXCI7XG5pbXBvcnQgS1Jlc3BvbmRlciBmcm9tIFwiLi9rUmVzcG9uZGVyXCI7XG5pbXBvcnQgZGVmLCB7IG5ldHdvcmtGb3JtYXQgfSBmcm9tIFwiLi9LQ29uc3RcIjtcbmltcG9ydCB7IGRpc3RhbmNlIH0gZnJvbSBcImthZC1kaXN0YW5jZVwiO1xuaW1wb3J0IHsgbWVzc2FnZSB9IGZyb20gXCJ3ZWJydGM0bWUvbGliL2ludGVyZmFjZVwiO1xuaW1wb3J0IHsgQlNPTiB9IGZyb20gXCJic29uXCI7XG5pbXBvcnQgQ3lwaGVyIGZyb20gXCIuLi9saWIvY3lwaGVyXCI7XG5pbXBvcnQgc2hhMSBmcm9tIFwic2hhMVwiO1xuaW1wb3J0IHsgSUV2ZW50cyB9IGZyb20gXCIuLi91dGlsXCI7XG5cbmNvbnN0IGJzb24gPSBuZXcgQlNPTigpO1xuZXhwb3J0IGZ1bmN0aW9uIGV4Y3V0ZUV2ZW50KGV2OiBhbnksIHY/OiBhbnkpIHtcbiAgY29uc29sZS5sb2coXCJleGN1dGVFdmVudFwiLCBldik7XG4gIE9iamVjdC5rZXlzKGV2KS5mb3JFYWNoKGtleSA9PiB7XG4gICAgZXZba2V5XSh2KTtcbiAgfSk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEthZGVtbGlhIHtcbiAgbm9kZUlkOiBzdHJpbmc7XG4gIGs6IG51bWJlcjtcbiAga2J1Y2tldHM6IEFycmF5PEFycmF5PFdlYlJUQz4+O1xuICBmOiBIZWxwZXI7XG4gIHJlc3BvbmRlcjogS1Jlc3BvbmRlcjtcbiAgZGF0YUxpc3Q6IEFycmF5PGFueT4gPSBbXTtcbiAga2V5VmFsdWVMaXN0OiB7IFtrZXk6IHN0cmluZ106IGFueSB9ID0ge307XG4gIHJlZjogeyBba2V5OiBzdHJpbmddOiBXZWJSVEMgfSA9IHt9O1xuICBidWZmZXI6IHsgW2tleTogc3RyaW5nXTogQXJyYXk8YW55PiB9ID0ge307XG5cbiAgc3RhdGUgPSB7XG4gICAgaXNGaXJzdENvbm5lY3Q6IHRydWUsXG4gICAgaXNPZmZlcjogZmFsc2UsXG4gICAgZmluZE5vZGU6IFwiXCIsXG4gICAgaGFzaDoge31cbiAgfTtcblxuICBjYWxsYmFjayA9IHtcbiAgICBvbkNvbm5lY3Q6ICgpID0+IHt9LFxuICAgIG9uQWRkUGVlcjogKHY/OiBhbnkpID0+IHt9LFxuICAgIG9uUGVlckRpc2Nvbm5lY3Q6ICh2PzogYW55KSA9PiB7fSxcbiAgICBfb25GaW5kVmFsdWU6ICh2PzogYW55KSA9PiB7fSxcbiAgICBfb25GaW5kTm9kZTogKHY/OiBhbnkpID0+IHt9LFxuICAgIG9uQXBwOiAodj86IGFueSkgPT4ge31cbiAgfTtcblxuICBwcml2YXRlIG9uU3RvcmU6IElFdmVudHMgPSB7fTtcbiAgcHJpdmF0ZSBvbkZpbmRWYWx1ZTogSUV2ZW50cyA9IHt9O1xuICBwcml2YXRlIG9uRmluZE5vZGU6IElFdmVudHMgPSB7fTtcbiAgcHJpdmF0ZSBvblJlc3BvbmRlcjogSUV2ZW50cyA9IHt9O1xuICBldmVudHMgPSB7XG4gICAgc3RvcmU6IHRoaXMub25TdG9yZSxcbiAgICBmaW5kdmFsdWU6IHRoaXMub25GaW5kVmFsdWUsXG4gICAgZmluZG5vZGU6IHRoaXMub25GaW5kTm9kZSxcbiAgICByZXNwb25kZXI6IHRoaXMub25SZXNwb25kZXJcbiAgfTtcbiAgY3lwaGVyOiBDeXBoZXI7XG5cbiAgY29uc3RydWN0b3Iob3B0PzogeyBwdWJrZXk/OiBzdHJpbmc7IHNlY0tleT86IHN0cmluZzsga0xlbmd0aD86IG51bWJlciB9KSB7XG4gICAgdGhpcy5rID0gMjA7XG4gICAgaWYgKG9wdCAmJiBvcHQua0xlbmd0aCkgdGhpcy5rID0gb3B0LmtMZW5ndGg7XG4gICAgaWYgKG9wdCkgdGhpcy5jeXBoZXIgPSBuZXcgQ3lwaGVyKG9wdC5zZWNLZXksIG9wdC5wdWJrZXkpO1xuICAgIGVsc2UgdGhpcy5jeXBoZXIgPSBuZXcgQ3lwaGVyKCk7XG4gICAgdGhpcy5ub2RlSWQgPSBzaGExKHRoaXMuY3lwaGVyLnB1YktleSkudG9TdHJpbmcoKTtcblxuICAgIHRoaXMua2J1Y2tldHMgPSBuZXcgQXJyYXkoMTYwKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IDE2MDsgaSsrKSB7XG4gICAgICBsZXQga2J1Y2tldDogQXJyYXk8YW55PiA9IFtdO1xuICAgICAgdGhpcy5rYnVja2V0c1tpXSA9IGtidWNrZXQ7XG4gICAgfVxuXG4gICAgdGhpcy5mID0gbmV3IEhlbHBlcih0aGlzLmssIHRoaXMua2J1Y2tldHMsIHRoaXMubm9kZUlkKTtcbiAgICB0aGlzLnJlc3BvbmRlciA9IG5ldyBLUmVzcG9uZGVyKHRoaXMpO1xuICB9XG5cbiAgc3RvcmUoc2VuZGVyOiBzdHJpbmcsIGtleTogc3RyaW5nLCB2YWx1ZTogYW55LCBvcHQ/OiB7IGV4Y2x1ZGVJZD86IHN0cmluZyB9KSB7XG4gICAgY29uc3QgcGVlciA9IHRoaXMuZi5nZXRDbG9zZUVzdFBlZXIoa2V5LCBvcHQpO1xuICAgIGlmICghcGVlcikgcmV0dXJuO1xuICAgIGNvbnN0IGhhc2ggPSBzaGExKEpTT04uc3RyaW5naWZ5KHZhbHVlKSkudG9TdHJpbmcoKTtcbiAgICBjb25zdCBzZW5kRGF0YTogU3RvcmVGb3JtYXQgPSB7XG4gICAgICBzZW5kZXIsXG4gICAgICBrZXksXG4gICAgICB2YWx1ZSxcbiAgICAgIHB1YktleTogdGhpcy5jeXBoZXIucHViS2V5LFxuICAgICAgaGFzaCxcbiAgICAgIHNpZ246IHRoaXMuY3lwaGVyLmVuY3J5cHQoaGFzaClcbiAgICB9O1xuICAgIGNvbnN0IG5ldHdvcmsgPSBuZXR3b3JrRm9ybWF0KHRoaXMubm9kZUlkLCBkZWYuU1RPUkUsIHNlbmREYXRhKTtcblxuICAgIGNvbnNvbGUubG9nKGRlZi5TVE9SRSwgXCJuZXh0XCIsIHBlZXIubm9kZUlkLCBcInRhcmdldFwiLCBrZXkpO1xuICAgIHBlZXIuc2VuZChuZXR3b3JrLCBcImthZFwiKTtcbiAgICAvL25vIHNkcFxuICAgIGlmICghdmFsdWUuc2RwKSB0aGlzLmtleVZhbHVlTGlzdFtrZXldID0gdmFsdWU7XG4gIH1cblxuICBzdG9yZUNodW5rcyhcbiAgICBzZW5kZXI6IHN0cmluZyxcbiAgICBrZXk6IHN0cmluZyxcbiAgICBjaHVua3M6IEFycmF5QnVmZmVyW10sXG4gICAgb3B0PzogeyBleGNsdWRlSWQ/OiBzdHJpbmcgfVxuICApIHtcbiAgICAvLyBjb25zdCBwZWVycyA9IHRoaXMuZi5nZXRDbG9zZVBlZXJzKGtleSwgb3B0KTtcbiAgICBjb25zdCBwZWVyID0gdGhpcy5mLmdldENsb3NlRXN0UGVlcihrZXksIG9wdCk7XG4gICAgaWYgKCFwZWVyKSByZXR1cm47XG4gICAgY29uc29sZS5sb2coXCJzdG9yZSBjaHVua3NcIiwgeyBjaHVua3MgfSk7XG4gICAgY2h1bmtzLmZvckVhY2goKGNodW5rLCBpKSA9PiB7XG4gICAgICBjb25zdCBoYXNoID0gc2hhMShCdWZmZXIuZnJvbShjaHVuaykpLnRvU3RyaW5nKCk7XG4gICAgICBjb25zdCBzZW5kRGF0YTogU3RvcmVDaHVua3MgPSB7XG4gICAgICAgIHNlbmRlcjogdGhpcy5ub2RlSWQsXG4gICAgICAgIGtleSxcbiAgICAgICAgdmFsdWU6IEJ1ZmZlci5mcm9tKGNodW5rKSxcbiAgICAgICAgaW5kZXg6IGksXG4gICAgICAgIHB1YktleTogdGhpcy5jeXBoZXIucHViS2V5LFxuICAgICAgICBoYXNoLFxuICAgICAgICBzaWduOiB0aGlzLmN5cGhlci5lbmNyeXB0KGhhc2gpLFxuICAgICAgICBzaXplOiBjaHVua3MubGVuZ3RoXG4gICAgICB9O1xuICAgICAgY29uc3QgbmV0d29yayA9IG5ldHdvcmtGb3JtYXQoc2VuZGVyLCBkZWYuU1RPUkVfQ0hVTktTLCBzZW5kRGF0YSk7XG5cbiAgICAgIGNvbnNvbGUubG9nKGRlZi5TVE9SRSwgXCJuZXh0XCIsIHBlZXIubm9kZUlkLCBcInRhcmdldFwiLCBrZXkpO1xuICAgICAgcGVlci5zZW5kKG5ldHdvcmssIFwia2FkXCIpO1xuICAgIH0pO1xuICAgIC8v44Os44OX44Oq44Kx44O844K344On44OzXG4gICAgdGhpcy5rZXlWYWx1ZUxpc3Rba2V5XSA9IHsgY2h1bmtzIH07XG4gIH1cblxuICBmaW5kTm9kZSh0YXJnZXRJZDogc3RyaW5nLCBwZWVyOiBXZWJSVEMpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2U8V2ViUlRDPihhc3luYyAocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjb25zb2xlLmxvZyhcImZpbmRub2RlXCIsIHRhcmdldElkKTtcbiAgICAgIHRoaXMuc3RhdGUuZmluZE5vZGUgPSB0YXJnZXRJZDtcbiAgICAgIGNvbnN0IHNlbmREYXRhID0geyB0YXJnZXRLZXk6IHRhcmdldElkIH07XG4gICAgICAvL+mAgeOCi1xuICAgICAgcGVlci5zZW5kKG5ldHdvcmtGb3JtYXQodGhpcy5ub2RlSWQsIGRlZi5GSU5ETk9ERSwgc2VuZERhdGEpLCBcImthZFwiKTtcblxuICAgICAgdGhpcy5jYWxsYmFjay5fb25GaW5kTm9kZSgobm9kZUlkOiBzdHJpbmcpID0+IHtcbiAgICAgICAgZXhjdXRlRXZlbnQodGhpcy5ldmVudHMuZmluZG5vZGUsIG5vZGVJZCk7XG4gICAgICAgIHJlc29sdmUodGhpcy5mLmdldFBlZXJGcm9tbm9kZUlkKG5vZGVJZCkpO1xuICAgICAgfSk7XG5cbiAgICAgIGF3YWl0IG5ldyBQcm9taXNlKHIgPT4gc2V0VGltZW91dChyLCAxMCAqIDEwMDApKTtcbiAgICAgIHJlamVjdChcInRpbWVvdXQgZmluZG5vZGVcIik7XG4gICAgfSk7XG4gIH1cblxuICBmaW5kVmFsdWUoa2V5OiBzdHJpbmcsIG9wdD86IHsgb3duZXJJZD86IHN0cmluZyB9KSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlPGFueT4oYXN5bmMgKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgdGhpcy5jYWxsYmFjay5fb25GaW5kVmFsdWUgPSB2YWx1ZSA9PiB7XG4gICAgICAgIGV4Y3V0ZUV2ZW50KHRoaXMuZXZlbnRzLmZpbmR2YWx1ZSwgdmFsdWUpO1xuICAgICAgICByZXNvbHZlKHZhbHVlKTtcbiAgICAgIH07XG4gICAgICAvL2tleeOBq+i/keOBhOODlOOCouOCkuWPluW+l1xuICAgICAgY29uc3QgcGVlcnMgPSB0aGlzLmYuZ2V0Q2xvc2VQZWVycyhrZXkpO1xuICAgICAgcGVlcnMuZm9yRWFjaChwZWVyID0+IHtcbiAgICAgICAgdGhpcy5kb0ZpbmR2YWx1ZShrZXksIHBlZXIpO1xuICAgICAgfSk7XG5cbiAgICAgIGF3YWl0IG5ldyBQcm9taXNlKHIgPT4gc2V0VGltZW91dChyLCA1MDAwKSk7XG4gICAgICBpZiAob3B0ICYmIG9wdC5vd25lcklkKSB7XG4gICAgICAgIGNvbnN0IG93bmVySWQgPSBvcHQub3duZXJJZDtcbiAgICAgICAgY29uc3QgcGVlcnMgPSB0aGlzLmYuZ2V0Q2xvc2VQZWVycyhvd25lcklkKTtcbiAgICAgICAgcGVlcnMuZm9yRWFjaChwZWVyID0+IHtcbiAgICAgICAgICB0aGlzLmRvRmluZHZhbHVlKG93bmVySWQsIHBlZXIpO1xuICAgICAgICB9KTtcbiAgICAgICAgYXdhaXQgbmV3IFByb21pc2UociA9PiBzZXRUaW1lb3V0KHIsIDUwMDApKTtcbiAgICAgIH1cbiAgICAgIHJlamVjdChcImZpbmR2YWx1ZSB0aW1lb3V0XCIpO1xuICAgIH0pO1xuICB9XG5cbiAgYXN5bmMgZG9GaW5kdmFsdWUoa2V5OiBzdHJpbmcsIHBlZXI6IFdlYlJUQykge1xuICAgIGNvbnNvbGUubG9nKFwiZG9maW5kdmFsdWVcIiwgcGVlci5ub2RlSWQpO1xuICAgIGNvbnN0IHNlbmREYXRhOiBGaW5kVmFsdWUgPSB7IHRhcmdldEtleToga2V5IH07XG4gICAgcGVlci5zZW5kKG5ldHdvcmtGb3JtYXQodGhpcy5ub2RlSWQsIGRlZi5GSU5EVkFMVUUsIHNlbmREYXRhKSwgXCJrYWRcIik7XG4gIH1cblxuICBjb25uZWN0KHBlZXI6IFdlYlJUQykge1xuICAgIGNvbnNvbGUubG9nKFwia2FkIGNvbm5lY3RcIik7XG4gICAgaWYgKHRoaXMuc3RhdGUuaXNGaXJzdENvbm5lY3QpIHRoaXMuY2FsbGJhY2sub25Db25uZWN0KCk7XG4gICAgdGhpcy5zdGF0ZS5pc0ZpcnN0Q29ubmVjdCA9IGZhbHNlO1xuICAgIHRoaXMuYWRka25vZGUocGVlcik7XG4gIH1cblxuICBhZGRrbm9kZShwZWVyOiBXZWJSVEMpIHtcbiAgICBwZWVyLmV2ZW50cy5kYXRhW1wia2FkZW1saWEudHNcIl0gPSByYXcgPT4ge1xuICAgICAgdGhpcy5vbkNvbW1hbmQocmF3KTtcbiAgICB9O1xuXG4gICAgcGVlci5kaXNjb25uZWN0ID0gKCkgPT4ge1xuICAgICAgY29uc29sZS5sb2coXCJrYWQgbm9kZSBkaXNjb25uZWN0ZWRcIik7XG4gICAgICB0aGlzLmYuY2xlYW5EaXNjb24oKTtcbiAgICAgIHRoaXMuY2FsbGJhY2sub25BZGRQZWVyKHRoaXMuZi5nZXRBbGxQZWVySWRzKCkpO1xuICAgIH07XG5cbiAgICBpZiAoIXRoaXMuZi5pc05vZGVFeGlzdChwZWVyLm5vZGVJZCkpIHtcbiAgICAgIC8v6Ieq5YiG44Gu44OO44O844OJSUTjgajov73liqDjgZnjgovjg47jg7zjg4lJROOBrui3nembolxuICAgICAgY29uc3QgbnVtID0gZGlzdGFuY2UodGhpcy5ub2RlSWQsIHBlZXIubm9kZUlkKTtcbiAgICAgIC8va2J1Y2tldHPjga7oqbLlvZPjgZnjgovot53pm6Ljga5rYnVja2V044KS5ZG844Gz5Ye644GZXG4gICAgICBjb25zdCBrYnVja2V0ID0gdGhpcy5rYnVja2V0c1tudW1dO1xuICAgICAgLy/oqbLlvZPjgZnjgotrYnVja2V044Gr5paw44GX44GE44OU44Ki44KS5Yqg44GI44KLXG4gICAgICBrYnVja2V0LnB1c2gocGVlcik7XG5cbiAgICAgIGNvbnNvbGUubG9nKFwiYWRka25vZGUga2J1Y2tldHNcIiwgXCJwZWVyLm5vZGVJZDpcIiwgcGVlci5ub2RlSWQpO1xuICAgICAgY29uc29sZS5sb2codGhpcy5mLmdldEFsbFBlZXJJZHMoKSk7XG5cbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICB0aGlzLmZpbmROZXdQZWVyKHBlZXIpO1xuICAgICAgfSwgMTAwMCk7XG5cbiAgICAgIHRoaXMuY2FsbGJhY2sub25BZGRQZWVyKHRoaXMuZi5nZXRBbGxQZWVySWRzKCkpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgZmluZE5ld1BlZXIocGVlcjogV2ViUlRDKSB7XG4gICAgaWYgKHRoaXMuZi5nZXRLYnVja2V0TnVtKCkgPCB0aGlzLmspIHtcbiAgICAgIC8v6Ieq6Lqr44Gu44OO44O844OJSUTjgpJrZXnjgajjgZfjgaZGSU5EX05PREVcbiAgICAgIGF3YWl0IHRoaXMuZmluZE5vZGUodGhpcy5ub2RlSWQsIHBlZXIpLmNhdGNoKGNvbnNvbGUubG9nKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5sb2coXCJrYnVja2V0IHJlYWR5XCIsIHRoaXMuZi5nZXRLYnVja2V0TnVtKCkpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgbWFpbnRhaW4obmV0d29yazogYW55KSB7XG4gICAgY29uc3QgaW54ID0gZGlzdGFuY2UodGhpcy5ub2RlSWQsIG5ldHdvcmsubm9kZUlkKTtcbiAgICBjb25zdCBrYnVja2V0ID0gdGhpcy5rYnVja2V0c1tpbnhdO1xuXG4gICAgLy/pgIHkv6HlhYPjgYzoqbLlvZPjgZnjgotrLWJ1Y2tldOOBruS4reOBq+OBguOBo+OBn+WgtOWQiFxuICAgIC8v44Gd44Gu44OO44O844OJ44KSay1idWNrZXTjga7mnKvlsL7jgavnp7vjgZlcbiAgICBrYnVja2V0LmZvckVhY2goKHBlZXIsIGkpID0+IHtcbiAgICAgIGlmIChwZWVyLm5vZGVJZCA9PT0gbmV0d29yay5ub2RlSWQpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJtYWludGFpblwiLCBcIk1vdmVzwqBpdMKgdG/CoHRoZcKgdGFpbMKgb2bCoHRoZcKgbGlzdFwiKTtcbiAgICAgICAga2J1Y2tldC5zcGxpY2UoaSwgMSk7XG4gICAgICAgIGtidWNrZXQucHVzaChwZWVyKTtcbiAgICAgICAgcmV0dXJuIDA7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvL2stYnVja2V044GM44GZ44Gn44Gr5rqA5p2v44Gq5aC05ZCI44CBXG4gICAgLy/jgZ3jga5rLWJ1Y2tldOS4reOBruWFiOmgreOBruODjuODvOODieOBjOOCquODs+ODqeOCpOODs+OBquOCieWFiOmgreOBruODjuODvOODieOCkuaui+OBmVxuICAgIGlmIChrYnVja2V0Lmxlbmd0aCA+IHRoaXMuaykge1xuICAgICAga2J1Y2tldC5zaGlmdCgpO1xuICAgIH1cbiAgfVxuXG4gIG9mZmVyKHRhcmdldDogc3RyaW5nLCBwcm94eSA9IG51bGwpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2U8YW55Pihhc3luYyAocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjb25zdCByID0gdGhpcy5yZWY7XG4gICAgICBjb25zdCBwZWVyID0gKHJbdGFyZ2V0XSA9IG5ldyBXZWJSVEMoKSk7XG4gICAgICBwZWVyLm1ha2VPZmZlcigpO1xuXG4gICAgICBjb25zdCB0aW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHJlamVjdChcImthZCBvZmZlciB0aW1lb3V0XCIpO1xuICAgICAgfSwgNSAqIDEwMDApO1xuXG4gICAgICBwZWVyLnNpZ25hbCA9IHNkcCA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwia2FkIG9mZmVyIHN0b3JlXCIsIHRhcmdldCk7XG4gICAgICAgIGNvbnN0IF8gPSB0aGlzLmYuZ2V0Q2xvc2VFc3RQZWVyKHRhcmdldCk7XG4gICAgICAgIGlmICghXykgcmV0dXJuO1xuICAgICAgICBpZiAoXy5ub2RlSWQgIT09IHRhcmdldClcbiAgICAgICAgICB0aGlzLnN0b3JlKHRoaXMubm9kZUlkLCB0YXJnZXQsIHsgc2RwLCBwcm94eSB9KTtcbiAgICAgIH07XG5cbiAgICAgIHBlZXIuY29ubmVjdCA9ICgpID0+IHtcbiAgICAgICAgcGVlci5ub2RlSWQgPSB0YXJnZXQ7XG4gICAgICAgIGNvbnNvbGUubG9nKFwia2FkIG9mZmVyIGNvbm5lY3RlZFwiLCB0YXJnZXQpO1xuICAgICAgICB0aGlzLmFkZGtub2RlKHBlZXIpO1xuICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dCk7XG4gICAgICAgIHJlc29sdmUodHJ1ZSk7XG4gICAgICB9O1xuICAgIH0pO1xuICB9XG5cbiAgYW5zd2VyKHRhcmdldDogc3RyaW5nLCBzZHA6IHN0cmluZywgcHJveHk6IHN0cmluZykge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZTxhbnk+KGFzeW5jIChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGNvbnN0IHIgPSB0aGlzLnJlZjtcbiAgICAgIGNvbnN0IHBlZXIgPSAoclt0YXJnZXRdID0gbmV3IFdlYlJUQygpKTtcbiAgICAgIHBlZXIubWFrZUFuc3dlcihzZHApO1xuICAgICAgY29uc29sZS5sb2coXCJrYWQgYW5zd2VyXCIsIHRhcmdldCk7XG5cbiAgICAgIGNvbnN0IHRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgcmVqZWN0KFwia2FkIGFuc3dlciB0aW1lb3V0XCIpO1xuICAgICAgfSwgNSAqIDEwMDApO1xuXG4gICAgICBwZWVyLnNpZ25hbCA9IHNkcCA9PiB7XG4gICAgICAgIGNvbnN0IF8gPSB0aGlzLmYuZ2V0UGVlckZyb21ub2RlSWQocHJveHkpO1xuICAgICAgICBjb25zdCBoYXNoID0gc2hhMShNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKCkpLnRvU3RyaW5nKCk7XG4gICAgICAgIGNvbnN0IHNlbmREYXRhOiBTdG9yZUZvcm1hdCA9IHtcbiAgICAgICAgICBzZW5kZXI6IHRoaXMubm9kZUlkLFxuICAgICAgICAgIGtleTogdGFyZ2V0LFxuICAgICAgICAgIHZhbHVlOiB7IHNkcCB9LFxuICAgICAgICAgIHB1YktleTogdGhpcy5jeXBoZXIucHViS2V5LFxuICAgICAgICAgIGhhc2gsXG4gICAgICAgICAgc2lnbjogdGhpcy5jeXBoZXIuZW5jcnlwdChoYXNoKVxuICAgICAgICB9O1xuICAgICAgICBpZiAoXykgXy5zZW5kKG5ldHdvcmtGb3JtYXQodGhpcy5ub2RlSWQsIGRlZi5TVE9SRSwgc2VuZERhdGEpLCBcImthZFwiKTtcbiAgICAgIH07XG5cbiAgICAgIHBlZXIuY29ubmVjdCA9ICgpID0+IHtcbiAgICAgICAgcGVlci5ub2RlSWQgPSB0YXJnZXQ7XG4gICAgICAgIGNvbnNvbGUubG9nKFwia2FkIGFuc3dlciBjb25uZWN0ZWRcIiwgdGFyZ2V0KTtcbiAgICAgICAgdGhpcy5hZGRrbm9kZShwZWVyKTtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xuICAgICAgICByZXNvbHZlKHRydWUpO1xuICAgICAgfTtcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgb25Db21tYW5kKG1lc3NhZ2U6IG1lc3NhZ2UpIHtcbiAgICBpZiAobWVzc2FnZS5sYWJlbCA9PT0gXCJrYWRcIikge1xuICAgICAgY29uc3QgYnVmZmVyOiBCdWZmZXIgPSBCdWZmZXIuZnJvbShtZXNzYWdlLmRhdGEpO1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgbmV0d29ya0xheWVyOiBuZXR3b3JrID0gYnNvbi5kZXNlcmlhbGl6ZShidWZmZXIpO1xuICAgICAgICBjb25zb2xlLmxvZyhcIm9uY29tbWFuZCBrYWRcIiwgeyBtZXNzYWdlIH0sIHsgbmV0d29ya0xheWVyIH0pO1xuICAgICAgICBpZiAoIUpTT04uc3RyaW5naWZ5KHRoaXMuZGF0YUxpc3QpLmluY2x1ZGVzKG5ldHdvcmtMYXllci5oYXNoKSkge1xuICAgICAgICAgIHRoaXMuZGF0YUxpc3QucHVzaChuZXR3b3JrTGF5ZXIuaGFzaCk7XG4gICAgICAgICAgdGhpcy5vblJlcXVlc3QobmV0d29ya0xheWVyKTtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5sb2coZXJyb3IpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBleGN1dGVFdmVudCh0aGlzLmV2ZW50cy5yZXNwb25kZXIsIG1lc3NhZ2UpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgb25SZXF1ZXN0KG5ldHdvcms6IGFueSkge1xuICAgIHRoaXMucmVzcG9uZGVyLnJlc3BvbnNlKG5ldHdvcmsudHlwZSwgbmV0d29yayk7XG4gICAgdGhpcy5tYWludGFpbihuZXR3b3JrKTtcbiAgfVxufVxuIl19
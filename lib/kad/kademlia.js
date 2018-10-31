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
  function Kademlia(_nodeId, opt) {
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

    console.log("start kad", _nodeId);
    this.k = 20;
    if (opt) if (opt.kLength) this.k = opt.kLength;
    this.nodeId = _nodeId;
    this.kbuckets = new Array(160);

    for (var i = 0; i < 160; i++) {
      var kbucket = [];
      this.kbuckets[i] = kbucket;
    }

    this.f = new _kUtil.default(this.k, this.kbuckets);
    this.responder = new _kResponder.default(this);
  }

  _createClass(Kademlia, [{
    key: "store",
    value: function store(sender, key, value, opt) {
      var peers = this.f.getClosePeers(key, opt);
      var sendData = {
        sender: sender,
        key: key,
        value: value
      };
      var network = (0, _KConst.networkFormat)(this.nodeId, _KConst.default.STORE, sendData);
      peers.forEach(function (peer) {
        console.log(_KConst.default.STORE, "next", peer.nodeId, "target", key);
        peer.send(network, "kad");
      }); //no sdp

      if (!value.sdp) this.keyValueList[key] = value;
    }
  }, {
    key: "storeChunks",
    value: function storeChunks(sender, key, chunks, opt) {
      var _this = this;

      var peers = this.f.getClosePeers(key, opt);
      console.log("store chunks", {
        chunks: chunks
      });
      chunks.forEach(function (chunk, i) {
        var sendData = {
          sender: _this.nodeId,
          key: key,
          value: Buffer.from(chunk),
          index: i,
          size: chunks.length
        };
        var network = (0, _KConst.networkFormat)(sender, _KConst.default.STORE_CHUNKS, sendData);
        peers.forEach(function (peer) {
          console.log(_KConst.default.STORE, "next", peer.nodeId, "target", key);
          peer.send(network, "kad");
        });
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
          var _ = _this6.f.getPeerFromnodeId(proxy); //来たルートに送り返す


          var sendData = {
            sender: _this6.nodeId,
            key: target,
            value: {
              sdp: sdp
            }
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9rYWQva2FkZW1saWEudHMiXSwibmFtZXMiOlsicmVxdWlyZSIsImJzb24iLCJCU09OIiwiZXhjdXRlRXZlbnQiLCJldiIsInYiLCJjb25zb2xlIiwibG9nIiwiT2JqZWN0Iiwia2V5cyIsImZvckVhY2giLCJrZXkiLCJLYWRlbWxpYSIsIl9ub2RlSWQiLCJvcHQiLCJpc0ZpcnN0Q29ubmVjdCIsImlzT2ZmZXIiLCJmaW5kTm9kZSIsImhhc2giLCJvbkNvbm5lY3QiLCJvbkFkZFBlZXIiLCJvblBlZXJEaXNjb25uZWN0IiwiX29uRmluZFZhbHVlIiwiX29uRmluZE5vZGUiLCJvbkFwcCIsInN0b3JlIiwib25TdG9yZSIsImZpbmR2YWx1ZSIsIm9uRmluZFZhbHVlIiwiZmluZG5vZGUiLCJvbkZpbmROb2RlIiwiayIsImtMZW5ndGgiLCJub2RlSWQiLCJrYnVja2V0cyIsIkFycmF5IiwiaSIsImtidWNrZXQiLCJmIiwiSGVscGVyIiwicmVzcG9uZGVyIiwiS1Jlc3BvbmRlciIsInNlbmRlciIsInZhbHVlIiwicGVlcnMiLCJnZXRDbG9zZVBlZXJzIiwic2VuZERhdGEiLCJuZXR3b3JrIiwiZGVmIiwiU1RPUkUiLCJwZWVyIiwic2VuZCIsInNkcCIsImtleVZhbHVlTGlzdCIsImNodW5rcyIsImNodW5rIiwiQnVmZmVyIiwiZnJvbSIsImluZGV4Iiwic2l6ZSIsImxlbmd0aCIsIlNUT1JFX0NIVU5LUyIsInRhcmdldElkIiwic3RhdGUiLCJ0YXJnZXRLZXkiLCJGSU5ETk9ERSIsImNhbGxiYWNrIiwiZXZlbnRzIiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZWplY3QiLCJkb0ZpbmR2YWx1ZSIsInIiLCJzZXRUaW1lb3V0Iiwib3duZXJJZCIsIkZJTkRWQUxVRSIsImFkZGtub2RlIiwiZGF0YSIsInJhdyIsIm9uQ29tbWFuZCIsImRpc2Nvbm5lY3QiLCJjbGVhbkRpc2NvbiIsImdldEFsbFBlZXJJZHMiLCJpc05vZGVFeGlzdCIsIm51bSIsInB1c2giLCJmaW5kTmV3UGVlciIsImdldEtidWNrZXROdW0iLCJpbngiLCJzcGxpY2UiLCJzaGlmdCIsInRhcmdldCIsInByb3h5IiwicmVmIiwiV2ViUlRDIiwibWFrZU9mZmVyIiwidGltZW91dCIsInNpZ25hbCIsIl8iLCJnZXRDbG9zZUVzdFBlZXIiLCJjb25uZWN0IiwiY2xlYXJUaW1lb3V0IiwibWFrZUFuc3dlciIsImdldFBlZXJGcm9tbm9kZUlkIiwiU0VORCIsIm1lc3NhZ2UiLCJsYWJlbCIsImJ1ZmZlciIsIm5ldHdvcmtMYXllciIsImRlc2VyaWFsaXplIiwiSlNPTiIsInN0cmluZ2lmeSIsImRhdGFMaXN0IiwiaW5jbHVkZXMiLCJvblJlcXVlc3QiLCJlcnJvciIsInJlc3BvbnNlIiwidHlwZSIsIm1haW50YWluIl0sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUVBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFQQUEsT0FBTyxDQUFDLGdCQUFELENBQVA7O0FBU0EsSUFBTUMsSUFBSSxHQUFHLElBQUlDLFVBQUosRUFBYjs7QUFDTyxTQUFTQyxXQUFULENBQXFCQyxFQUFyQixFQUE4QkMsQ0FBOUIsRUFBdUM7QUFDNUNDLEVBQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZLGFBQVosRUFBMkJILEVBQTNCO0FBQ0FJLEVBQUFBLE1BQU0sQ0FBQ0MsSUFBUCxDQUFZTCxFQUFaLEVBQWdCTSxPQUFoQixDQUF3QixVQUFBQyxHQUFHLEVBQUk7QUFDN0JQLElBQUFBLEVBQUUsQ0FBQ08sR0FBRCxDQUFGLENBQVFOLENBQVI7QUFDRCxHQUZEO0FBR0Q7O0lBRW9CTyxROzs7QUFtQ25CLG9CQUFZQyxPQUFaLEVBQTZCQyxHQUE3QixFQUF5RDtBQUFBOztBQUFBOztBQUFBOztBQUFBOztBQUFBOztBQUFBOztBQUFBLHNDQTdCbEMsRUE2QmtDOztBQUFBLDBDQTVCbEIsRUE0QmtCOztBQUFBLGlDQTNCeEIsRUEyQndCOztBQUFBLG9DQTFCakIsRUEwQmlCOztBQUFB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LENBQTlCO0FBQ0FyRyxZQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWSxlQUFaLEVBQTZCO0FBQUVrRyxjQUFBQSxPQUFPLEVBQVBBO0FBQUYsYUFBN0IsRUFBMEM7QUFBRUcsY0FBQUEsWUFBWSxFQUFaQTtBQUFGLGFBQTFDOztBQUNBLGdCQUFJLENBQUNFLElBQUksQ0FBQ0MsU0FBTCxDQUFlLEtBQUtDLFFBQXBCLEVBQThCQyxRQUE5QixDQUF1Q0wsWUFBWSxDQUFDMUYsSUFBcEQsQ0FBTCxFQUFnRTtBQUM5RCxtQkFBSzhGLFFBQUwsQ0FBYzNCLElBQWQsQ0FBbUJ1QixZQUFZLENBQUMxRixJQUFoQztBQUNBLG1CQUFLZ0csU0FBTCxDQUFlTixZQUFmO0FBQ0Q7QUFDRixXQVBELENBT0UsT0FBT08sS0FBUCxFQUFjO0FBQ2Q3RyxZQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWTRHLEtBQVo7QUFDRDs7QUFDRDtBQWJKO0FBZUQ7Ozs4QkFFaUJwRSxPLEVBQWM7QUFDOUIsV0FBS1AsU0FBTCxDQUFlNEUsUUFBZixDQUF3QnJFLE9BQU8sQ0FBQ3NFLElBQWhDLEVBQXNDdEUsT0FBdEM7QUFDQSxXQUFLdUUsUUFBTCxDQUFjdkUsT0FBZDtBQUNEIiwic291cmNlc0NvbnRlbnQiOlsicmVxdWlyZShcImJhYmVsLXBvbHlmaWxsXCIpO1xuaW1wb3J0IFdlYlJUQyBmcm9tIFwid2VicnRjNG1lXCI7XG5pbXBvcnQgSGVscGVyIGZyb20gXCIuL2tVdGlsXCI7XG5pbXBvcnQgS1Jlc3BvbmRlciBmcm9tIFwiLi9rUmVzcG9uZGVyXCI7XG5pbXBvcnQgZGVmLCB7IG5ldHdvcmtGb3JtYXQgfSBmcm9tIFwiLi9LQ29uc3RcIjtcbmltcG9ydCB7IGRpc3RhbmNlIH0gZnJvbSBcImthZC1kaXN0YW5jZVwiO1xuaW1wb3J0IHsgbWVzc2FnZSB9IGZyb20gXCJ3ZWJydGM0bWUvbGliL2ludGVyZmFjZVwiO1xuaW1wb3J0IHsgQlNPTiB9IGZyb20gXCJic29uXCI7XG5cbmNvbnN0IGJzb24gPSBuZXcgQlNPTigpO1xuZXhwb3J0IGZ1bmN0aW9uIGV4Y3V0ZUV2ZW50KGV2OiBhbnksIHY/OiBhbnkpIHtcbiAgY29uc29sZS5sb2coXCJleGN1dGVFdmVudFwiLCBldik7XG4gIE9iamVjdC5rZXlzKGV2KS5mb3JFYWNoKGtleSA9PiB7XG4gICAgZXZba2V5XSh2KTtcbiAgfSk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEthZGVtbGlhIHtcbiAgbm9kZUlkOiBzdHJpbmc7XG4gIGs6IG51bWJlcjtcbiAga2J1Y2tldHM6IEFycmF5PEFycmF5PFdlYlJUQz4+O1xuICBmOiBIZWxwZXI7XG4gIHJlc3BvbmRlcjogS1Jlc3BvbmRlcjtcbiAgZGF0YUxpc3Q6IEFycmF5PGFueT4gPSBbXTtcbiAga2V5VmFsdWVMaXN0OiB7IFtrZXk6IHN0cmluZ106IGFueSB9ID0ge307XG4gIHJlZjogeyBba2V5OiBzdHJpbmddOiBXZWJSVEMgfSA9IHt9O1xuICBidWZmZXI6IHsgW2tleTogc3RyaW5nXTogQXJyYXk8YW55PiB9ID0ge307XG4gIHN0YXRlID0ge1xuICAgIGlzRmlyc3RDb25uZWN0OiB0cnVlLFxuICAgIGlzT2ZmZXI6IGZhbHNlLFxuICAgIGZpbmROb2RlOiBcIlwiLFxuICAgIGhhc2g6IHt9XG4gIH07XG5cbiAgY2FsbGJhY2sgPSB7XG4gICAgb25Db25uZWN0OiAoKSA9PiB7fSxcbiAgICBvbkFkZFBlZXI6ICh2PzogYW55KSA9PiB7fSxcbiAgICBvblBlZXJEaXNjb25uZWN0OiAodj86IGFueSkgPT4ge30sXG4gICAgX29uRmluZFZhbHVlOiAodj86IGFueSkgPT4ge30sXG4gICAgX29uRmluZE5vZGU6ICh2PzogYW55KSA9PiB7fSxcbiAgICBvbkFwcDogKHY/OiBhbnkpID0+IHt9XG4gIH07XG5cbiAgb25TdG9yZTogeyBba2V5OiBzdHJpbmddOiAodjogYW55KSA9PiB2b2lkIH0gPSB7fTtcbiAgb25GaW5kVmFsdWU6IHsgW2tleTogc3RyaW5nXTogKHY6IGFueSkgPT4gdm9pZCB9ID0ge307XG4gIG9uRmluZE5vZGU6IHsgW2tleTogc3RyaW5nXTogKHY6IGFueSkgPT4gdm9pZCB9ID0ge307XG4gIGV2ZW50cyA9IHtcbiAgICBzdG9yZTogdGhpcy5vblN0b3JlLFxuICAgIGZpbmR2YWx1ZTogdGhpcy5vbkZpbmRWYWx1ZSxcbiAgICBmaW5kbm9kZTogdGhpcy5vbkZpbmROb2RlXG4gIH07XG5cbiAgY29uc3RydWN0b3IoX25vZGVJZDogc3RyaW5nLCBvcHQ/OiB7IGtMZW5ndGg/OiBudW1iZXIgfSkge1xuICAgIGNvbnNvbGUubG9nKFwic3RhcnQga2FkXCIsIF9ub2RlSWQpO1xuICAgIHRoaXMuayA9IDIwO1xuICAgIGlmIChvcHQpIGlmIChvcHQua0xlbmd0aCkgdGhpcy5rID0gb3B0LmtMZW5ndGg7XG4gICAgdGhpcy5ub2RlSWQgPSBfbm9kZUlkO1xuXG4gICAgdGhpcy5rYnVja2V0cyA9IG5ldyBBcnJheSgxNjApO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgMTYwOyBpKyspIHtcbiAgICAgIGxldCBrYnVja2V0OiBBcnJheTxhbnk+ID0gW107XG4gICAgICB0aGlzLmtidWNrZXRzW2ldID0ga2J1Y2tldDtcbiAgICB9XG5cbiAgICB0aGlzLmYgPSBuZXcgSGVscGVyKHRoaXMuaywgdGhpcy5rYnVja2V0cyk7XG4gICAgdGhpcy5yZXNwb25kZXIgPSBuZXcgS1Jlc3BvbmRlcih0aGlzKTtcbiAgfVxuXG4gIHN0b3JlKHNlbmRlcjogc3RyaW5nLCBrZXk6IHN0cmluZywgdmFsdWU6IGFueSwgb3B0PzogeyBleGNsdWRlSWQ/OiBzdHJpbmcgfSkge1xuICAgIGNvbnN0IHBlZXJzID0gdGhpcy5mLmdldENsb3NlUGVlcnMoa2V5LCBvcHQpO1xuICAgIGNvbnN0IHNlbmREYXRhOiBTdG9yZUZvcm1hdCA9IHsgc2VuZGVyLCBrZXksIHZhbHVlIH07XG4gICAgY29uc3QgbmV0d29yayA9IG5ldHdvcmtGb3JtYXQodGhpcy5ub2RlSWQsIGRlZi5TVE9SRSwgc2VuZERhdGEpO1xuICAgIHBlZXJzLmZvckVhY2gocGVlciA9PiB7XG4gICAgICBjb25zb2xlLmxvZyhkZWYuU1RPUkUsIFwibmV4dFwiLCBwZWVyLm5vZGVJZCwgXCJ0YXJnZXRcIiwga2V5KTtcbiAgICAgIHBlZXIuc2VuZChuZXR3b3JrLCBcImthZFwiKTtcbiAgICB9KTtcbiAgICAvL25vIHNkcFxuICAgIGlmICghdmFsdWUuc2RwKSB0aGlzLmtleVZhbHVlTGlzdFtrZXldID0gdmFsdWU7XG4gIH1cblxuICBzdG9yZUNodW5rcyhcbiAgICBzZW5kZXI6IHN0cmluZyxcbiAgICBrZXk6IHN0cmluZyxcbiAgICBjaHVua3M6IEFycmF5QnVmZmVyW10sXG4gICAgb3B0PzogeyBleGNsdWRlSWQ/OiBzdHJpbmcgfVxuICApIHtcbiAgICBjb25zdCBwZWVycyA9IHRoaXMuZi5nZXRDbG9zZVBlZXJzKGtleSwgb3B0KTtcbiAgICBjb25zb2xlLmxvZyhcInN0b3JlIGNodW5rc1wiLCB7IGNodW5rcyB9KTtcbiAgICBjaHVua3MuZm9yRWFjaCgoY2h1bmssIGkpID0+IHtcbiAgICAgIGNvbnN0IHNlbmREYXRhOiBTdG9yZUNodW5rcyA9IHtcbiAgICAgICAgc2VuZGVyOiB0aGlzLm5vZGVJZCxcbiAgICAgICAga2V5LFxuICAgICAgICB2YWx1ZTogQnVmZmVyLmZyb20oY2h1bmspLFxuICAgICAgICBpbmRleDogaSxcbiAgICAgICAgc2l6ZTogY2h1bmtzLmxlbmd0aFxuICAgICAgfTtcbiAgICAgIGNvbnN0IG5ldHdvcmsgPSBuZXR3b3JrRm9ybWF0KHNlbmRlciwgZGVmLlNUT1JFX0NIVU5LUywgc2VuZERhdGEpO1xuICAgICAgcGVlcnMuZm9yRWFjaChwZWVyID0+IHtcbiAgICAgICAgY29uc29sZS5sb2coZGVmLlNUT1JFLCBcIm5leHRcIiwgcGVlci5ub2RlSWQsIFwidGFyZ2V0XCIsIGtleSk7XG4gICAgICAgIHBlZXIuc2VuZChuZXR3b3JrLCBcImthZFwiKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIC8v44Os44OX44Oq44Kx44O844K344On44OzXG4gICAgdGhpcy5rZXlWYWx1ZUxpc3Rba2V5XSA9IHsgY2h1bmtzIH07XG4gIH1cblxuICBmaW5kTm9kZSh0YXJnZXRJZDogc3RyaW5nLCBwZWVyOiBXZWJSVEMpIHtcbiAgICBjb25zb2xlLmxvZyhcImZpbmRub2RlXCIsIHRhcmdldElkKTtcbiAgICB0aGlzLnN0YXRlLmZpbmROb2RlID0gdGFyZ2V0SWQ7XG4gICAgY29uc3Qgc2VuZERhdGEgPSB7IHRhcmdldEtleTogdGFyZ2V0SWQgfTtcbiAgICAvL+mAgeOCi1xuICAgIHBlZXIuc2VuZChuZXR3b3JrRm9ybWF0KHRoaXMubm9kZUlkLCBkZWYuRklORE5PREUsIHNlbmREYXRhKSwgXCJrYWRcIik7XG5cbiAgICB0aGlzLmNhbGxiYWNrLl9vbkZpbmROb2RlKChub2RlSWQ6IHN0cmluZykgPT4ge1xuICAgICAgZXhjdXRlRXZlbnQodGhpcy5ldmVudHMuZmluZG5vZGUsIG5vZGVJZCk7XG4gICAgfSk7XG4gIH1cblxuICBmaW5kVmFsdWUoa2V5OiBzdHJpbmcsIG9wdD86IHsgb3duZXJJZD86IHN0cmluZyB9KSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlPGFueT4oYXN5bmMgKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgdGhpcy5jYWxsYmFjay5fb25GaW5kVmFsdWUgPSB2YWx1ZSA9PiB7XG4gICAgICAgIGV4Y3V0ZUV2ZW50KHRoaXMuZXZlbnRzLmZpbmR2YWx1ZSwgdmFsdWUpO1xuICAgICAgICByZXNvbHZlKHZhbHVlKTtcbiAgICAgIH07XG4gICAgICAvL2tleeOBq+i/keOBhOODlOOCouOCkuWPluW+l1xuICAgICAgY29uc3QgcGVlcnMgPSB0aGlzLmYuZ2V0Q2xvc2VQZWVycyhrZXkpO1xuICAgICAgcGVlcnMuZm9yRWFjaChwZWVyID0+IHtcbiAgICAgICAgdGhpcy5kb0ZpbmR2YWx1ZShrZXksIHBlZXIpO1xuICAgICAgfSk7XG5cbiAgICAgIGF3YWl0IG5ldyBQcm9taXNlKHIgPT4gc2V0VGltZW91dChyLCA1MDAwKSk7XG4gICAgICBpZiAob3B0ICYmIG9wdC5vd25lcklkKSB7XG4gICAgICAgIGNvbnN0IG93bmVySWQgPSBvcHQub3duZXJJZDtcbiAgICAgICAgY29uc3QgcGVlcnMgPSB0aGlzLmYuZ2V0Q2xvc2VQZWVycyhvd25lcklkKTtcbiAgICAgICAgcGVlcnMuZm9yRWFjaChwZWVyID0+IHtcbiAgICAgICAgICB0aGlzLmRvRmluZHZhbHVlKG93bmVySWQsIHBlZXIpO1xuICAgICAgICB9KTtcbiAgICAgICAgYXdhaXQgbmV3IFByb21pc2UociA9PiBzZXRUaW1lb3V0KHIsIDUwMDApKTtcbiAgICAgIH1cbiAgICAgIHJlamVjdChcImZpbmR2YWx1ZSB0aW1lb3V0XCIpO1xuICAgIH0pO1xuICB9XG5cbiAgYXN5bmMgZG9GaW5kdmFsdWUoa2V5OiBzdHJpbmcsIHBlZXI6IFdlYlJUQykge1xuICAgIGNvbnNvbGUubG9nKFwiZG9maW5kdmFsdWVcIiwgcGVlci5ub2RlSWQpO1xuICAgIGNvbnN0IHNlbmREYXRhOiBGaW5kVmFsdWUgPSB7IHRhcmdldEtleToga2V5IH07XG4gICAgcGVlci5zZW5kKG5ldHdvcmtGb3JtYXQodGhpcy5ub2RlSWQsIGRlZi5GSU5EVkFMVUUsIHNlbmREYXRhKSwgXCJrYWRcIik7XG4gIH1cblxuICBjb25uZWN0KHBlZXI6IFdlYlJUQykge1xuICAgIGNvbnNvbGUubG9nKFwia2FkIGNvbm5lY3RcIik7XG4gICAgaWYgKHRoaXMuc3RhdGUuaXNGaXJzdENvbm5lY3QpIHRoaXMuY2FsbGJhY2sub25Db25uZWN0KCk7XG4gICAgdGhpcy5zdGF0ZS5pc0ZpcnN0Q29ubmVjdCA9IGZhbHNlO1xuICAgIHRoaXMuYWRka25vZGUocGVlcik7XG4gIH1cblxuICBhZGRrbm9kZShwZWVyOiBXZWJSVEMpIHtcbiAgICBwZWVyLmV2ZW50cy5kYXRhW1wia2FkZW1saWEudHNcIl0gPSByYXcgPT4ge1xuICAgICAgdGhpcy5vbkNvbW1hbmQocmF3KTtcbiAgICB9O1xuXG4gICAgcGVlci5kaXNjb25uZWN0ID0gKCkgPT4ge1xuICAgICAgY29uc29sZS5sb2coXCJrYWQgbm9kZSBkaXNjb25uZWN0ZWRcIik7XG4gICAgICB0aGlzLmYuY2xlYW5EaXNjb24oKTtcbiAgICAgIHRoaXMuY2FsbGJhY2sub25BZGRQZWVyKHRoaXMuZi5nZXRBbGxQZWVySWRzKCkpO1xuICAgIH07XG5cbiAgICBpZiAoIXRoaXMuZi5pc05vZGVFeGlzdChwZWVyLm5vZGVJZCkpIHtcbiAgICAgIC8v6Ieq5YiG44Gu44OO44O844OJSUTjgajov73liqDjgZnjgovjg47jg7zjg4lJROOBrui3nembolxuICAgICAgY29uc3QgbnVtID0gZGlzdGFuY2UodGhpcy5ub2RlSWQsIHBlZXIubm9kZUlkKTtcbiAgICAgIC8va2J1Y2tldHPjga7oqbLlvZPjgZnjgovot53pm6Ljga5rYnVja2V044KS5ZG844Gz5Ye644GZXG4gICAgICBjb25zdCBrYnVja2V0ID0gdGhpcy5rYnVja2V0c1tudW1dO1xuICAgICAgLy/oqbLlvZPjgZnjgotrYnVja2V044Gr5paw44GX44GE44OU44Ki44KS5Yqg44GI44KLXG4gICAgICBrYnVja2V0LnB1c2gocGVlcik7XG5cbiAgICAgIGNvbnNvbGUubG9nKFwiYWRka25vZGUga2J1Y2tldHNcIiwgXCJwZWVyLm5vZGVJZDpcIiwgcGVlci5ub2RlSWQpO1xuICAgICAgY29uc29sZS5sb2codGhpcy5mLmdldEFsbFBlZXJJZHMoKSk7XG5cbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICB0aGlzLmZpbmROZXdQZWVyKHBlZXIpO1xuICAgICAgfSwgMTAwMCk7XG5cbiAgICAgIHRoaXMuY2FsbGJhY2sub25BZGRQZWVyKHRoaXMuZi5nZXRBbGxQZWVySWRzKCkpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgZmluZE5ld1BlZXIocGVlcjogV2ViUlRDKSB7XG4gICAgaWYgKHRoaXMuZi5nZXRLYnVja2V0TnVtKCkgPCB0aGlzLmspIHtcbiAgICAgIC8v6Ieq6Lqr44Gu44OO44O844OJSUTjgpJrZXnjgajjgZfjgaZGSU5EX05PREVcbiAgICAgIHRoaXMuZmluZE5vZGUodGhpcy5ub2RlSWQsIHBlZXIpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmxvZyhcImtidWNrZXQgcmVhZHlcIiwgdGhpcy5mLmdldEtidWNrZXROdW0oKSk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBtYWludGFpbihuZXR3b3JrOiBhbnkpIHtcbiAgICBjb25zdCBpbnggPSBkaXN0YW5jZSh0aGlzLm5vZGVJZCwgbmV0d29yay5ub2RlSWQpO1xuICAgIGNvbnN0IGtidWNrZXQgPSB0aGlzLmtidWNrZXRzW2lueF07XG5cbiAgICAvL+mAgeS/oeWFg+OBjOipsuW9k+OBmeOCi2stYnVja2V044Gu5Lit44Gr44GC44Gj44Gf5aC05ZCIXG4gICAgLy/jgZ3jga7jg47jg7zjg4njgpJrLWJ1Y2tldOOBruacq+WwvuOBq+enu+OBmVxuICAgIGtidWNrZXQuZm9yRWFjaCgocGVlciwgaSkgPT4ge1xuICAgICAgaWYgKHBlZXIubm9kZUlkID09PSBuZXR3b3JrLm5vZGVJZCkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIm1haW50YWluXCIsIFwiTW92ZXPCoGl0wqB0b8KgdGhlwqB0YWlswqBvZsKgdGhlwqBsaXN0XCIpO1xuICAgICAgICBrYnVja2V0LnNwbGljZShpLCAxKTtcbiAgICAgICAga2J1Y2tldC5wdXNoKHBlZXIpO1xuICAgICAgICByZXR1cm4gMDtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vay1idWNrZXTjgYzjgZnjgafjgavmuoDmna/jgarloLTlkIjjgIFcbiAgICAvL+OBneOBrmstYnVja2V05Lit44Gu5YWI6aCt44Gu44OO44O844OJ44GM44Kq44Oz44Op44Kk44Oz44Gq44KJ5YWI6aCt44Gu44OO44O844OJ44KS5q6L44GZXG4gICAgaWYgKGtidWNrZXQubGVuZ3RoID4gdGhpcy5rKSB7XG4gICAgICBrYnVja2V0LnNoaWZ0KCk7XG4gICAgfVxuICB9XG5cbiAgb2ZmZXIodGFyZ2V0OiBzdHJpbmcsIHByb3h5ID0gbnVsbCkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjb25zdCByID0gdGhpcy5yZWY7XG4gICAgICBjb25zdCBwZWVyID0gKHJbdGFyZ2V0XSA9IG5ldyBXZWJSVEMoKSk7XG4gICAgICBwZWVyLm1ha2VPZmZlcigpO1xuXG4gICAgICBjb25zdCB0aW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHJlamVjdChcImthZCBvZmZlciB0aW1lb3V0XCIpO1xuICAgICAgfSwgNSAqIDEwMDApO1xuXG4gICAgICBwZWVyLnNpZ25hbCA9IHNkcCA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwia2FkIG9mZmVyIHN0b3JlXCIsIHRhcmdldCk7XG4gICAgICAgIGNvbnN0IF8gPSB0aGlzLmYuZ2V0Q2xvc2VFc3RQZWVyKHRhcmdldCk7XG4gICAgICAgIGlmICghXykgcmV0dXJuO1xuICAgICAgICBpZiAoXy5ub2RlSWQgIT09IHRhcmdldClcbiAgICAgICAgICB0aGlzLnN0b3JlKHRoaXMubm9kZUlkLCB0YXJnZXQsIHsgc2RwLCBwcm94eSB9KTtcbiAgICAgIH07XG5cbiAgICAgIHBlZXIuY29ubmVjdCA9ICgpID0+IHtcbiAgICAgICAgcGVlci5ub2RlSWQgPSB0YXJnZXQ7XG4gICAgICAgIGNvbnNvbGUubG9nKFwia2FkIG9mZmVyIGNvbm5lY3RlZFwiLCB0YXJnZXQpO1xuICAgICAgICB0aGlzLmFkZGtub2RlKHBlZXIpO1xuICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dCk7XG4gICAgICAgIHJlc29sdmUodHJ1ZSk7XG4gICAgICB9O1xuICAgIH0pO1xuICB9XG5cbiAgYW5zd2VyKHRhcmdldDogc3RyaW5nLCBzZHA6IHN0cmluZywgcHJveHk6IHN0cmluZykge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjb25zdCByID0gdGhpcy5yZWY7XG4gICAgICBjb25zdCBwZWVyID0gKHJbdGFyZ2V0XSA9IG5ldyBXZWJSVEMoKSk7XG4gICAgICBwZWVyLm1ha2VBbnN3ZXIoc2RwKTtcbiAgICAgIGNvbnNvbGUubG9nKFwia2FkIGFuc3dlclwiLCB0YXJnZXQpO1xuXG4gICAgICBjb25zdCB0aW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHJlamVjdChcImthZCBhbnN3ZXIgdGltZW91dFwiKTtcbiAgICAgIH0sIDUgKiAxMDAwKTtcblxuICAgICAgcGVlci5zaWduYWwgPSBzZHAgPT4ge1xuICAgICAgICBjb25zdCBfID0gdGhpcy5mLmdldFBlZXJGcm9tbm9kZUlkKHByb3h5KTtcbiAgICAgICAgLy/mnaXjgZ/jg6vjg7zjg4jjgavpgIHjgorov5TjgZlcbiAgICAgICAgY29uc3Qgc2VuZERhdGE6IFN0b3JlRm9ybWF0ID0ge1xuICAgICAgICAgIHNlbmRlcjogdGhpcy5ub2RlSWQsXG4gICAgICAgICAga2V5OiB0YXJnZXQsXG4gICAgICAgICAgdmFsdWU6IHsgc2RwIH1cbiAgICAgICAgfTtcbiAgICAgICAgaWYgKF8pIF8uc2VuZChuZXR3b3JrRm9ybWF0KHRoaXMubm9kZUlkLCBkZWYuU1RPUkUsIHNlbmREYXRhKSwgXCJrYWRcIik7XG4gICAgICB9O1xuXG4gICAgICBwZWVyLmNvbm5lY3QgPSAoKSA9PiB7XG4gICAgICAgIHBlZXIubm9kZUlkID0gdGFyZ2V0O1xuICAgICAgICBjb25zb2xlLmxvZyhcImthZCBhbnN3ZXIgY29ubmVjdGVkXCIsIHRhcmdldCk7XG4gICAgICAgIHRoaXMuYWRka25vZGUocGVlcik7XG4gICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KTtcbiAgICAgICAgcmVzb2x2ZSh0cnVlKTtcbiAgICAgIH07XG4gICAgfSk7XG4gIH1cblxuICBzZW5kKHRhcmdldDogc3RyaW5nLCBkYXRhOiBhbnkpIHtcbiAgICBjb25zdCBfID0gdGhpcy5mLmdldFBlZXJGcm9tbm9kZUlkKHRhcmdldCk7XG4gICAgaWYgKF8pIF8uc2VuZChuZXR3b3JrRm9ybWF0KHRoaXMubm9kZUlkLCBkZWYuU0VORCwgZGF0YSksIFwia2FkXCIpO1xuICB9XG5cbiAgcHJpdmF0ZSBvbkNvbW1hbmQobWVzc2FnZTogbWVzc2FnZSkge1xuICAgIHN3aXRjaCAobWVzc2FnZS5sYWJlbCkge1xuICAgICAgY2FzZSBcImthZFwiOlxuICAgICAgICBjb25zdCBidWZmZXI6IEJ1ZmZlciA9IEJ1ZmZlci5mcm9tKG1lc3NhZ2UuZGF0YSk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgY29uc3QgbmV0d29ya0xheWVyOiBuZXR3b3JrID0gYnNvbi5kZXNlcmlhbGl6ZShidWZmZXIpO1xuICAgICAgICAgIGNvbnNvbGUubG9nKFwib25jb21tYW5kIGthZFwiLCB7IG1lc3NhZ2UgfSwgeyBuZXR3b3JrTGF5ZXIgfSk7XG4gICAgICAgICAgaWYgKCFKU09OLnN0cmluZ2lmeSh0aGlzLmRhdGFMaXN0KS5pbmNsdWRlcyhuZXR3b3JrTGF5ZXIuaGFzaCkpIHtcbiAgICAgICAgICAgIHRoaXMuZGF0YUxpc3QucHVzaChuZXR3b3JrTGF5ZXIuaGFzaCk7XG4gICAgICAgICAgICB0aGlzLm9uUmVxdWVzdChuZXR3b3JrTGF5ZXIpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvcik7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBvblJlcXVlc3QobmV0d29yazogYW55KSB7XG4gICAgdGhpcy5yZXNwb25kZXIucmVzcG9uc2UobmV0d29yay50eXBlLCBuZXR3b3JrKTtcbiAgICB0aGlzLm1haW50YWluKG5ldHdvcmspO1xuICB9XG59XG4iXX0=
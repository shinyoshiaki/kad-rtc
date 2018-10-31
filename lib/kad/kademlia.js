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
    value: function store(sender, key, value) {
      //自分に一番近いピアを取得
      var peers = this.f.getClosePeers(key);
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
    value: function storeChunks(sender, key, chunks) {
      var _this = this;

      var peers = this.f.getClosePeers(key);
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
          console.log({
            buffer: buffer
          });

          try {
            console.log("oncommand kad", {
              message: message
            });
            var networkLayer = bson.deserialize(buffer);

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9rYWQva2FkZW1saWEudHMiXSwibmFtZXMiOlsicmVxdWlyZSIsImJzb24iLCJCU09OIiwiZXhjdXRlRXZlbnQiLCJldiIsInYiLCJjb25zb2xlIiwibG9nIiwiT2JqZWN0Iiwia2V5cyIsImZvckVhY2giLCJrZXkiLCJLYWRlbWxpYSIsIl9ub2RlSWQiLCJvcHQiLCJpc0ZpcnN0Q29ubmVjdCIsImlzT2ZmZXIiLCJmaW5kTm9kZSIsImhhc2giLCJvbkNvbm5lY3QiLCJvbkFkZFBlZXIiLCJvblBlZXJEaXNjb25uZWN0IiwiX29uRmluZFZhbHVlIiwiX29uRmluZE5vZGUiLCJvbkFwcCIsInN0b3JlIiwib25TdG9yZSIsImZpbmR2YWx1ZSIsIm9uRmluZFZhbHVlIiwiZmluZG5vZGUiLCJvbkZpbmROb2RlIiwiayIsImtMZW5ndGgiLCJub2RlSWQiLCJrYnVja2V0cyIsIkFycmF5IiwiaSIsImtidWNrZXQiLCJmIiwiSGVscGVyIiwicmVzcG9uZGVyIiwiS1Jlc3BvbmRlciIsInNlbmRlciIsInZhbHVlIiwicGVlcnMiLCJnZXRDbG9zZVBlZXJzIiwic2VuZERhdGEiLCJuZXR3b3JrIiwiZGVmIiwiU1RPUkUiLCJwZWVyIiwic2VuZCIsInNkcCIsImtleVZhbHVlTGlzdCIsImNodW5rcyIsImNodW5rIiwiQnVmZmVyIiwiZnJvbSIsImluZGV4Iiwic2l6ZSIsImxlbmd0aCIsIlNUT1JFX0NIVU5LUyIsInRhcmdldElkIiwic3RhdGUiLCJ0YXJnZXRLZXkiLCJGSU5ETk9ERSIsImNhbGxiYWNrIiwiZXZlbnRzIiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZWplY3QiLCJkb0ZpbmR2YWx1ZSIsInIiLCJzZXRUaW1lb3V0Iiwib3duZXJJZCIsIkZJTkRWQUxVRSIsImFkZGtub2RlIiwiZGF0YSIsInJhdyIsIm9uQ29tbWFuZCIsImRpc2Nvbm5lY3QiLCJjbGVhbkRpc2NvbiIsImdldEFsbFBlZXJJZHMiLCJpc05vZGVFeGlzdCIsIm51bSIsInB1c2giLCJmaW5kTmV3UGVlciIsImdldEtidWNrZXROdW0iLCJpbngiLCJzcGxpY2UiLCJzaGlmdCIsInRhcmdldCIsInByb3h5IiwicmVmIiwiV2ViUlRDIiwibWFrZU9mZmVyIiwidGltZW91dCIsInNpZ25hbCIsIl8iLCJnZXRDbG9zZUVzdFBlZXIiLCJjb25uZWN0IiwiY2xlYXJUaW1lb3V0IiwibWFrZUFuc3dlciIsImdldFBlZXJGcm9tbm9kZUlkIiwiU0VORCIsIm1lc3NhZ2UiLCJsYWJlbCIsImJ1ZmZlciIsIm5ldHdvcmtMYXllciIsImRlc2VyaWFsaXplIiwiSlNPTiIsInN0cmluZ2lmeSIsImRhdGFMaXN0IiwiaW5jbHVkZXMiLCJvblJlcXVlc3QiLCJlcnJvciIsInJlc3BvbnNlIiwidHlwZSIsIm1haW50YWluIl0sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUVBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFQQUEsT0FBTyxDQUFDLGdCQUFELENBQVA7O0FBU0EsSUFBTUMsSUFBSSxHQUFHLElBQUlDLFVBQUosRUFBYjs7QUFDTyxTQUFTQyxXQUFULENBQXFCQyxFQUFyQixFQUE4QkMsQ0FBOUIsRUFBdUM7QUFDNUNDLEVBQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZLGFBQVosRUFBMkJILEVBQTNCO0FBQ0FJLEVBQUFBLE1BQU0sQ0FBQ0MsSUFBUCxDQUFZTCxFQUFaLEVBQWdCTSxPQUFoQixDQUF3QixVQUFBQyxHQUFHLEVBQUk7QUFDN0JQLElBQUFBLEVBQUUsQ0FBQ08sR0FBRCxDQUFGLENBQVFOLENBQVI7QUFDRCxHQUZEO0FBR0Q7O0lBRW9CTyxROzs7QUFtQ25CLG9CQUFZQyxPQUFaLEVBQTZCQyxHQUE3QixFQUF5RDtBQUFBOztBQUFBOztBQUFBOztBQUFBOztBQUFBOztBQUFBOztBQUFBLHNDQTdCbEMsRUE2QmtDOztBQUFBLDBDQTVCbEIsRUE0QmtCOztBQUFBLGlDQTNCeEIsRUEyQndCOztBQUFBLG9DQTFCakIsRUEwQmlCOztBQUFB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R0FBUixDQUFZLGVBQVosRUFBNkI7QUFBRWtHLGNBQUFBLE9BQU8sRUFBUEE7QUFBRixhQUE3QjtBQUNBLGdCQUFNRyxZQUFxQixHQUFHM0csSUFBSSxDQUFDNEcsV0FBTCxDQUFpQkYsTUFBakIsQ0FBOUI7O0FBQ0EsZ0JBQUksQ0FBQ0csSUFBSSxDQUFDQyxTQUFMLENBQWUsS0FBS0MsUUFBcEIsRUFBOEJDLFFBQTlCLENBQXVDTCxZQUFZLENBQUMxRixJQUFwRCxDQUFMLEVBQWdFO0FBQzlELG1CQUFLOEYsUUFBTCxDQUFjM0IsSUFBZCxDQUFtQnVCLFlBQVksQ0FBQzFGLElBQWhDO0FBQ0EsbUJBQUtnRyxTQUFMLENBQWVOLFlBQWY7QUFDRDtBQUNGLFdBUEQsQ0FPRSxPQUFPTyxLQUFQLEVBQWM7QUFDZDdHLFlBQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZNEcsS0FBWjtBQUNEOztBQUNEO0FBZEo7QUFnQkQ7Ozs4QkFFaUJwRSxPLEVBQWM7QUFDOUIsV0FBS1AsU0FBTCxDQUFlNEUsUUFBZixDQUF3QnJFLE9BQU8sQ0FBQ3NFLElBQWhDLEVBQXNDdEUsT0FBdEM7QUFDQSxXQUFLdUUsUUFBTCxDQUFjdkUsT0FBZDtBQUNEIiwic291cmNlc0NvbnRlbnQiOlsicmVxdWlyZShcImJhYmVsLXBvbHlmaWxsXCIpO1xuaW1wb3J0IFdlYlJUQyBmcm9tIFwid2VicnRjNG1lXCI7XG5pbXBvcnQgSGVscGVyIGZyb20gXCIuL2tVdGlsXCI7XG5pbXBvcnQgS1Jlc3BvbmRlciBmcm9tIFwiLi9rUmVzcG9uZGVyXCI7XG5pbXBvcnQgZGVmLCB7IG5ldHdvcmtGb3JtYXQgfSBmcm9tIFwiLi9LQ29uc3RcIjtcbmltcG9ydCB7IGRpc3RhbmNlIH0gZnJvbSBcImthZC1kaXN0YW5jZVwiO1xuaW1wb3J0IHsgbWVzc2FnZSB9IGZyb20gXCJ3ZWJydGM0bWUvbGliL2ludGVyZmFjZVwiO1xuaW1wb3J0IHsgQlNPTiB9IGZyb20gXCJic29uXCI7XG5cbmNvbnN0IGJzb24gPSBuZXcgQlNPTigpO1xuZXhwb3J0IGZ1bmN0aW9uIGV4Y3V0ZUV2ZW50KGV2OiBhbnksIHY/OiBhbnkpIHtcbiAgY29uc29sZS5sb2coXCJleGN1dGVFdmVudFwiLCBldik7XG4gIE9iamVjdC5rZXlzKGV2KS5mb3JFYWNoKGtleSA9PiB7XG4gICAgZXZba2V5XSh2KTtcbiAgfSk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEthZGVtbGlhIHtcbiAgbm9kZUlkOiBzdHJpbmc7XG4gIGs6IG51bWJlcjtcbiAga2J1Y2tldHM6IEFycmF5PEFycmF5PFdlYlJUQz4+O1xuICBmOiBIZWxwZXI7XG4gIHJlc3BvbmRlcjogS1Jlc3BvbmRlcjtcbiAgZGF0YUxpc3Q6IEFycmF5PGFueT4gPSBbXTtcbiAga2V5VmFsdWVMaXN0OiB7IFtrZXk6IHN0cmluZ106IGFueSB9ID0ge307XG4gIHJlZjogeyBba2V5OiBzdHJpbmddOiBXZWJSVEMgfSA9IHt9O1xuICBidWZmZXI6IHsgW2tleTogc3RyaW5nXTogQXJyYXk8YW55PiB9ID0ge307XG4gIHN0YXRlID0ge1xuICAgIGlzRmlyc3RDb25uZWN0OiB0cnVlLFxuICAgIGlzT2ZmZXI6IGZhbHNlLFxuICAgIGZpbmROb2RlOiBcIlwiLFxuICAgIGhhc2g6IHt9XG4gIH07XG5cbiAgY2FsbGJhY2sgPSB7XG4gICAgb25Db25uZWN0OiAoKSA9PiB7fSxcbiAgICBvbkFkZFBlZXI6ICh2PzogYW55KSA9PiB7fSxcbiAgICBvblBlZXJEaXNjb25uZWN0OiAodj86IGFueSkgPT4ge30sXG4gICAgX29uRmluZFZhbHVlOiAodj86IGFueSkgPT4ge30sXG4gICAgX29uRmluZE5vZGU6ICh2PzogYW55KSA9PiB7fSxcbiAgICBvbkFwcDogKHY/OiBhbnkpID0+IHt9XG4gIH07XG5cbiAgb25TdG9yZTogeyBba2V5OiBzdHJpbmddOiAodjogYW55KSA9PiB2b2lkIH0gPSB7fTtcbiAgb25GaW5kVmFsdWU6IHsgW2tleTogc3RyaW5nXTogKHY6IGFueSkgPT4gdm9pZCB9ID0ge307XG4gIG9uRmluZE5vZGU6IHsgW2tleTogc3RyaW5nXTogKHY6IGFueSkgPT4gdm9pZCB9ID0ge307XG4gIGV2ZW50cyA9IHtcbiAgICBzdG9yZTogdGhpcy5vblN0b3JlLFxuICAgIGZpbmR2YWx1ZTogdGhpcy5vbkZpbmRWYWx1ZSxcbiAgICBmaW5kbm9kZTogdGhpcy5vbkZpbmROb2RlXG4gIH07XG5cbiAgY29uc3RydWN0b3IoX25vZGVJZDogc3RyaW5nLCBvcHQ/OiB7IGtMZW5ndGg/OiBudW1iZXIgfSkge1xuICAgIGNvbnNvbGUubG9nKFwic3RhcnQga2FkXCIsIF9ub2RlSWQpO1xuICAgIHRoaXMuayA9IDIwO1xuICAgIGlmIChvcHQpIGlmIChvcHQua0xlbmd0aCkgdGhpcy5rID0gb3B0LmtMZW5ndGg7XG4gICAgdGhpcy5ub2RlSWQgPSBfbm9kZUlkO1xuXG4gICAgdGhpcy5rYnVja2V0cyA9IG5ldyBBcnJheSgxNjApO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgMTYwOyBpKyspIHtcbiAgICAgIGxldCBrYnVja2V0OiBBcnJheTxhbnk+ID0gW107XG4gICAgICB0aGlzLmtidWNrZXRzW2ldID0ga2J1Y2tldDtcbiAgICB9XG5cbiAgICB0aGlzLmYgPSBuZXcgSGVscGVyKHRoaXMuaywgdGhpcy5rYnVja2V0cyk7XG4gICAgdGhpcy5yZXNwb25kZXIgPSBuZXcgS1Jlc3BvbmRlcih0aGlzKTtcbiAgfVxuXG4gIHN0b3JlKHNlbmRlcjogc3RyaW5nLCBrZXk6IHN0cmluZywgdmFsdWU6IGFueSkge1xuICAgIC8v6Ieq5YiG44Gr5LiA55Wq6L+R44GE44OU44Ki44KS5Y+W5b6XXG4gICAgY29uc3QgcGVlcnMgPSB0aGlzLmYuZ2V0Q2xvc2VQZWVycyhrZXkpO1xuICAgIGNvbnN0IHNlbmREYXRhOiBTdG9yZUZvcm1hdCA9IHsgc2VuZGVyLCBrZXksIHZhbHVlIH07XG4gICAgY29uc3QgbmV0d29yayA9IG5ldHdvcmtGb3JtYXQodGhpcy5ub2RlSWQsIGRlZi5TVE9SRSwgc2VuZERhdGEpO1xuICAgIHBlZXJzLmZvckVhY2gocGVlciA9PiB7XG4gICAgICBjb25zb2xlLmxvZyhkZWYuU1RPUkUsIFwibmV4dFwiLCBwZWVyLm5vZGVJZCwgXCJ0YXJnZXRcIiwga2V5KTtcbiAgICAgIHBlZXIuc2VuZChuZXR3b3JrLCBcImthZFwiKTtcbiAgICB9KTtcbiAgICAvL25vIHNkcFxuICAgIGlmICghdmFsdWUuc2RwKSB0aGlzLmtleVZhbHVlTGlzdFtrZXldID0gdmFsdWU7XG4gIH1cblxuICBzdG9yZUNodW5rcyhzZW5kZXI6IHN0cmluZywga2V5OiBzdHJpbmcsIGNodW5rczogQXJyYXlCdWZmZXJbXSkge1xuICAgIGNvbnN0IHBlZXJzID0gdGhpcy5mLmdldENsb3NlUGVlcnMoa2V5KTtcbiAgICBjb25zb2xlLmxvZyhcInN0b3JlIGNodW5rc1wiLCB7IGNodW5rcyB9KTtcbiAgICBjaHVua3MuZm9yRWFjaCgoY2h1bmssIGkpID0+IHtcbiAgICAgIGNvbnN0IHNlbmREYXRhOiBTdG9yZUNodW5rcyA9IHtcbiAgICAgICAgc2VuZGVyOiB0aGlzLm5vZGVJZCxcbiAgICAgICAga2V5LFxuICAgICAgICB2YWx1ZTogQnVmZmVyLmZyb20oY2h1bmspLFxuICAgICAgICBpbmRleDogaSxcbiAgICAgICAgc2l6ZTogY2h1bmtzLmxlbmd0aFxuICAgICAgfTtcbiAgICAgIGNvbnN0IG5ldHdvcmsgPSBuZXR3b3JrRm9ybWF0KHNlbmRlciwgZGVmLlNUT1JFX0NIVU5LUywgc2VuZERhdGEpO1xuICAgICAgcGVlcnMuZm9yRWFjaChwZWVyID0+IHtcbiAgICAgICAgY29uc29sZS5sb2coZGVmLlNUT1JFLCBcIm5leHRcIiwgcGVlci5ub2RlSWQsIFwidGFyZ2V0XCIsIGtleSk7XG4gICAgICAgIHBlZXIuc2VuZChuZXR3b3JrLCBcImthZFwiKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIC8v44Os44OX44Oq44Kx44O844K344On44OzXG4gICAgdGhpcy5rZXlWYWx1ZUxpc3Rba2V5XSA9IHsgY2h1bmtzIH07XG4gIH1cblxuICBmaW5kTm9kZSh0YXJnZXRJZDogc3RyaW5nLCBwZWVyOiBXZWJSVEMpIHtcbiAgICBjb25zb2xlLmxvZyhcImZpbmRub2RlXCIsIHRhcmdldElkKTtcbiAgICB0aGlzLnN0YXRlLmZpbmROb2RlID0gdGFyZ2V0SWQ7XG4gICAgY29uc3Qgc2VuZERhdGEgPSB7IHRhcmdldEtleTogdGFyZ2V0SWQgfTtcbiAgICAvL+mAgeOCi1xuICAgIHBlZXIuc2VuZChuZXR3b3JrRm9ybWF0KHRoaXMubm9kZUlkLCBkZWYuRklORE5PREUsIHNlbmREYXRhKSwgXCJrYWRcIik7XG5cbiAgICB0aGlzLmNhbGxiYWNrLl9vbkZpbmROb2RlKChub2RlSWQ6IHN0cmluZykgPT4ge1xuICAgICAgZXhjdXRlRXZlbnQodGhpcy5ldmVudHMuZmluZG5vZGUsIG5vZGVJZCk7XG4gICAgfSk7XG4gIH1cblxuICBmaW5kVmFsdWUoa2V5OiBzdHJpbmcsIG9wdD86IHsgb3duZXJJZD86IHN0cmluZyB9KSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlPGFueT4oYXN5bmMgKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgdGhpcy5jYWxsYmFjay5fb25GaW5kVmFsdWUgPSB2YWx1ZSA9PiB7XG4gICAgICAgIGV4Y3V0ZUV2ZW50KHRoaXMuZXZlbnRzLmZpbmR2YWx1ZSwgdmFsdWUpO1xuICAgICAgICByZXNvbHZlKHZhbHVlKTtcbiAgICAgIH07XG4gICAgICAvL2tleeOBq+i/keOBhOODlOOCouOCkuWPluW+l1xuICAgICAgY29uc3QgcGVlcnMgPSB0aGlzLmYuZ2V0Q2xvc2VQZWVycyhrZXkpO1xuICAgICAgcGVlcnMuZm9yRWFjaChwZWVyID0+IHtcbiAgICAgICAgdGhpcy5kb0ZpbmR2YWx1ZShrZXksIHBlZXIpO1xuICAgICAgfSk7XG5cbiAgICAgIGF3YWl0IG5ldyBQcm9taXNlKHIgPT4gc2V0VGltZW91dChyLCA1MDAwKSk7XG4gICAgICBpZiAob3B0ICYmIG9wdC5vd25lcklkKSB7XG4gICAgICAgIGNvbnN0IG93bmVySWQgPSBvcHQub3duZXJJZDtcbiAgICAgICAgY29uc3QgcGVlcnMgPSB0aGlzLmYuZ2V0Q2xvc2VQZWVycyhvd25lcklkKTtcbiAgICAgICAgcGVlcnMuZm9yRWFjaChwZWVyID0+IHtcbiAgICAgICAgICB0aGlzLmRvRmluZHZhbHVlKG93bmVySWQsIHBlZXIpO1xuICAgICAgICB9KTtcbiAgICAgICAgYXdhaXQgbmV3IFByb21pc2UociA9PiBzZXRUaW1lb3V0KHIsIDUwMDApKTtcbiAgICAgIH1cbiAgICAgIHJlamVjdChcImZpbmR2YWx1ZSB0aW1lb3V0XCIpO1xuICAgIH0pO1xuICB9XG5cbiAgYXN5bmMgZG9GaW5kdmFsdWUoa2V5OiBzdHJpbmcsIHBlZXI6IFdlYlJUQykge1xuICAgIGNvbnNvbGUubG9nKFwiZG9maW5kdmFsdWVcIiwgcGVlci5ub2RlSWQpO1xuICAgIGNvbnN0IHNlbmREYXRhOiBGaW5kVmFsdWUgPSB7IHRhcmdldEtleToga2V5IH07XG4gICAgcGVlci5zZW5kKG5ldHdvcmtGb3JtYXQodGhpcy5ub2RlSWQsIGRlZi5GSU5EVkFMVUUsIHNlbmREYXRhKSwgXCJrYWRcIik7XG4gIH1cblxuICBjb25uZWN0KHBlZXI6IFdlYlJUQykge1xuICAgIGNvbnNvbGUubG9nKFwia2FkIGNvbm5lY3RcIik7XG4gICAgaWYgKHRoaXMuc3RhdGUuaXNGaXJzdENvbm5lY3QpIHRoaXMuY2FsbGJhY2sub25Db25uZWN0KCk7XG4gICAgdGhpcy5zdGF0ZS5pc0ZpcnN0Q29ubmVjdCA9IGZhbHNlO1xuICAgIHRoaXMuYWRka25vZGUocGVlcik7XG4gIH1cblxuICBhZGRrbm9kZShwZWVyOiBXZWJSVEMpIHtcbiAgICBwZWVyLmV2ZW50cy5kYXRhW1wia2FkZW1saWEudHNcIl0gPSByYXcgPT4ge1xuICAgICAgdGhpcy5vbkNvbW1hbmQocmF3KTtcbiAgICB9O1xuXG4gICAgcGVlci5kaXNjb25uZWN0ID0gKCkgPT4ge1xuICAgICAgY29uc29sZS5sb2coXCJrYWQgbm9kZSBkaXNjb25uZWN0ZWRcIik7XG4gICAgICB0aGlzLmYuY2xlYW5EaXNjb24oKTtcbiAgICAgIHRoaXMuY2FsbGJhY2sub25BZGRQZWVyKHRoaXMuZi5nZXRBbGxQZWVySWRzKCkpO1xuICAgIH07XG5cbiAgICBpZiAoIXRoaXMuZi5pc05vZGVFeGlzdChwZWVyLm5vZGVJZCkpIHtcbiAgICAgIC8v6Ieq5YiG44Gu44OO44O844OJSUTjgajov73liqDjgZnjgovjg47jg7zjg4lJROOBrui3nembolxuICAgICAgY29uc3QgbnVtID0gZGlzdGFuY2UodGhpcy5ub2RlSWQsIHBlZXIubm9kZUlkKTtcbiAgICAgIC8va2J1Y2tldHPjga7oqbLlvZPjgZnjgovot53pm6Ljga5rYnVja2V044KS5ZG844Gz5Ye644GZXG4gICAgICBjb25zdCBrYnVja2V0ID0gdGhpcy5rYnVja2V0c1tudW1dO1xuICAgICAgLy/oqbLlvZPjgZnjgotrYnVja2V044Gr5paw44GX44GE44OU44Ki44KS5Yqg44GI44KLXG4gICAgICBrYnVja2V0LnB1c2gocGVlcik7XG5cbiAgICAgIGNvbnNvbGUubG9nKFwiYWRka25vZGUga2J1Y2tldHNcIiwgXCJwZWVyLm5vZGVJZDpcIiwgcGVlci5ub2RlSWQpO1xuICAgICAgY29uc29sZS5sb2codGhpcy5mLmdldEFsbFBlZXJJZHMoKSk7XG5cbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICB0aGlzLmZpbmROZXdQZWVyKHBlZXIpO1xuICAgICAgfSwgMTAwMCk7XG5cbiAgICAgIHRoaXMuY2FsbGJhY2sub25BZGRQZWVyKHRoaXMuZi5nZXRBbGxQZWVySWRzKCkpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgZmluZE5ld1BlZXIocGVlcjogV2ViUlRDKSB7XG4gICAgaWYgKHRoaXMuZi5nZXRLYnVja2V0TnVtKCkgPCB0aGlzLmspIHtcbiAgICAgIC8v6Ieq6Lqr44Gu44OO44O844OJSUTjgpJrZXnjgajjgZfjgaZGSU5EX05PREVcbiAgICAgIHRoaXMuZmluZE5vZGUodGhpcy5ub2RlSWQsIHBlZXIpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmxvZyhcImtidWNrZXQgcmVhZHlcIiwgdGhpcy5mLmdldEtidWNrZXROdW0oKSk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBtYWludGFpbihuZXR3b3JrOiBhbnkpIHtcbiAgICBjb25zdCBpbnggPSBkaXN0YW5jZSh0aGlzLm5vZGVJZCwgbmV0d29yay5ub2RlSWQpO1xuICAgIGNvbnN0IGtidWNrZXQgPSB0aGlzLmtidWNrZXRzW2lueF07XG5cbiAgICAvL+mAgeS/oeWFg+OBjOipsuW9k+OBmeOCi2stYnVja2V044Gu5Lit44Gr44GC44Gj44Gf5aC05ZCIXG4gICAgLy/jgZ3jga7jg47jg7zjg4njgpJrLWJ1Y2tldOOBruacq+WwvuOBq+enu+OBmVxuICAgIGtidWNrZXQuZm9yRWFjaCgocGVlciwgaSkgPT4ge1xuICAgICAgaWYgKHBlZXIubm9kZUlkID09PSBuZXR3b3JrLm5vZGVJZCkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIm1haW50YWluXCIsIFwiTW92ZXPCoGl0wqB0b8KgdGhlwqB0YWlswqBvZsKgdGhlwqBsaXN0XCIpO1xuICAgICAgICBrYnVja2V0LnNwbGljZShpLCAxKTtcbiAgICAgICAga2J1Y2tldC5wdXNoKHBlZXIpO1xuICAgICAgICByZXR1cm4gMDtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vay1idWNrZXTjgYzjgZnjgafjgavmuoDmna/jgarloLTlkIjjgIFcbiAgICAvL+OBneOBrmstYnVja2V05Lit44Gu5YWI6aCt44Gu44OO44O844OJ44GM44Kq44Oz44Op44Kk44Oz44Gq44KJ5YWI6aCt44Gu44OO44O844OJ44KS5q6L44GZXG4gICAgaWYgKGtidWNrZXQubGVuZ3RoID4gdGhpcy5rKSB7XG4gICAgICBrYnVja2V0LnNoaWZ0KCk7XG4gICAgfVxuICB9XG5cbiAgb2ZmZXIodGFyZ2V0OiBzdHJpbmcsIHByb3h5ID0gbnVsbCkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjb25zdCByID0gdGhpcy5yZWY7XG4gICAgICBjb25zdCBwZWVyID0gKHJbdGFyZ2V0XSA9IG5ldyBXZWJSVEMoKSk7XG4gICAgICBwZWVyLm1ha2VPZmZlcigpO1xuXG4gICAgICBjb25zdCB0aW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHJlamVjdChcImthZCBvZmZlciB0aW1lb3V0XCIpO1xuICAgICAgfSwgNSAqIDEwMDApO1xuXG4gICAgICBwZWVyLnNpZ25hbCA9IHNkcCA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwia2FkIG9mZmVyIHN0b3JlXCIsIHRhcmdldCk7XG4gICAgICAgIGNvbnN0IF8gPSB0aGlzLmYuZ2V0Q2xvc2VFc3RQZWVyKHRhcmdldCk7XG4gICAgICAgIGlmICghXykgcmV0dXJuO1xuICAgICAgICBpZiAoXy5ub2RlSWQgIT09IHRhcmdldClcbiAgICAgICAgICB0aGlzLnN0b3JlKHRoaXMubm9kZUlkLCB0YXJnZXQsIHsgc2RwLCBwcm94eSB9KTtcbiAgICAgIH07XG5cbiAgICAgIHBlZXIuY29ubmVjdCA9ICgpID0+IHtcbiAgICAgICAgcGVlci5ub2RlSWQgPSB0YXJnZXQ7XG4gICAgICAgIGNvbnNvbGUubG9nKFwia2FkIG9mZmVyIGNvbm5lY3RlZFwiLCB0YXJnZXQpO1xuICAgICAgICB0aGlzLmFkZGtub2RlKHBlZXIpO1xuICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dCk7XG4gICAgICAgIHJlc29sdmUodHJ1ZSk7XG4gICAgICB9O1xuICAgIH0pO1xuICB9XG5cbiAgYW5zd2VyKHRhcmdldDogc3RyaW5nLCBzZHA6IHN0cmluZywgcHJveHk6IHN0cmluZykge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjb25zdCByID0gdGhpcy5yZWY7XG4gICAgICBjb25zdCBwZWVyID0gKHJbdGFyZ2V0XSA9IG5ldyBXZWJSVEMoKSk7XG4gICAgICBwZWVyLm1ha2VBbnN3ZXIoc2RwKTtcbiAgICAgIGNvbnNvbGUubG9nKFwia2FkIGFuc3dlclwiLCB0YXJnZXQpO1xuXG4gICAgICBjb25zdCB0aW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHJlamVjdChcImthZCBhbnN3ZXIgdGltZW91dFwiKTtcbiAgICAgIH0sIDUgKiAxMDAwKTtcblxuICAgICAgcGVlci5zaWduYWwgPSBzZHAgPT4ge1xuICAgICAgICBjb25zdCBfID0gdGhpcy5mLmdldFBlZXJGcm9tbm9kZUlkKHByb3h5KTtcbiAgICAgICAgLy/mnaXjgZ/jg6vjg7zjg4jjgavpgIHjgorov5TjgZlcbiAgICAgICAgY29uc3Qgc2VuZERhdGE6IFN0b3JlRm9ybWF0ID0ge1xuICAgICAgICAgIHNlbmRlcjogdGhpcy5ub2RlSWQsXG4gICAgICAgICAga2V5OiB0YXJnZXQsXG4gICAgICAgICAgdmFsdWU6IHsgc2RwIH1cbiAgICAgICAgfTtcbiAgICAgICAgaWYgKF8pIF8uc2VuZChuZXR3b3JrRm9ybWF0KHRoaXMubm9kZUlkLCBkZWYuU1RPUkUsIHNlbmREYXRhKSwgXCJrYWRcIik7XG4gICAgICB9O1xuXG4gICAgICBwZWVyLmNvbm5lY3QgPSAoKSA9PiB7XG4gICAgICAgIHBlZXIubm9kZUlkID0gdGFyZ2V0O1xuICAgICAgICBjb25zb2xlLmxvZyhcImthZCBhbnN3ZXIgY29ubmVjdGVkXCIsIHRhcmdldCk7XG4gICAgICAgIHRoaXMuYWRka25vZGUocGVlcik7XG4gICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KTtcbiAgICAgICAgcmVzb2x2ZSh0cnVlKTtcbiAgICAgIH07XG4gICAgfSk7XG4gIH1cblxuICBzZW5kKHRhcmdldDogc3RyaW5nLCBkYXRhOiBhbnkpIHtcbiAgICBjb25zdCBfID0gdGhpcy5mLmdldFBlZXJGcm9tbm9kZUlkKHRhcmdldCk7XG4gICAgaWYgKF8pIF8uc2VuZChuZXR3b3JrRm9ybWF0KHRoaXMubm9kZUlkLCBkZWYuU0VORCwgZGF0YSksIFwia2FkXCIpO1xuICB9XG5cbiAgcHJpdmF0ZSBvbkNvbW1hbmQobWVzc2FnZTogbWVzc2FnZSkge1xuICAgIHN3aXRjaCAobWVzc2FnZS5sYWJlbCkge1xuICAgICAgY2FzZSBcImthZFwiOlxuICAgICAgICBjb25zdCBidWZmZXI6IEJ1ZmZlciA9IEJ1ZmZlci5mcm9tKG1lc3NhZ2UuZGF0YSk7XG4gICAgICAgIGNvbnNvbGUubG9nKHsgYnVmZmVyIH0pO1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKFwib25jb21tYW5kIGthZFwiLCB7IG1lc3NhZ2UgfSk7XG4gICAgICAgICAgY29uc3QgbmV0d29ya0xheWVyOiBuZXR3b3JrID0gYnNvbi5kZXNlcmlhbGl6ZShidWZmZXIpO1xuICAgICAgICAgIGlmICghSlNPTi5zdHJpbmdpZnkodGhpcy5kYXRhTGlzdCkuaW5jbHVkZXMobmV0d29ya0xheWVyLmhhc2gpKSB7XG4gICAgICAgICAgICB0aGlzLmRhdGFMaXN0LnB1c2gobmV0d29ya0xheWVyLmhhc2gpO1xuICAgICAgICAgICAgdGhpcy5vblJlcXVlc3QobmV0d29ya0xheWVyKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coZXJyb3IpO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgb25SZXF1ZXN0KG5ldHdvcms6IGFueSkge1xuICAgIHRoaXMucmVzcG9uZGVyLnJlc3BvbnNlKG5ldHdvcmsudHlwZSwgbmV0d29yayk7XG4gICAgdGhpcy5tYWludGFpbihuZXR3b3JrKTtcbiAgfVxufVxuIl19
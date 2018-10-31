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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9rYWQva2FkZW1saWEudHMiXSwibmFtZXMiOlsicmVxdWlyZSIsImJzb24iLCJCU09OIiwiZXhjdXRlRXZlbnQiLCJldiIsInYiLCJjb25zb2xlIiwibG9nIiwiT2JqZWN0Iiwia2V5cyIsImZvckVhY2giLCJrZXkiLCJLYWRlbWxpYSIsIl9ub2RlSWQiLCJvcHQiLCJpc0ZpcnN0Q29ubmVjdCIsImlzT2ZmZXIiLCJmaW5kTm9kZSIsImhhc2giLCJvbkNvbm5lY3QiLCJvbkFkZFBlZXIiLCJvblBlZXJEaXNjb25uZWN0IiwiX29uRmluZFZhbHVlIiwiX29uRmluZE5vZGUiLCJvbkFwcCIsInN0b3JlIiwib25TdG9yZSIsImZpbmR2YWx1ZSIsIm9uRmluZFZhbHVlIiwiZmluZG5vZGUiLCJvbkZpbmROb2RlIiwiayIsImtMZW5ndGgiLCJub2RlSWQiLCJrYnVja2V0cyIsIkFycmF5IiwiaSIsImtidWNrZXQiLCJmIiwiSGVscGVyIiwicmVzcG9uZGVyIiwiS1Jlc3BvbmRlciIsInNlbmRlciIsInZhbHVlIiwicGVlcnMiLCJnZXRDbG9zZVBlZXJzIiwic2VuZERhdGEiLCJuZXR3b3JrIiwiZGVmIiwiU1RPUkUiLCJwZWVyIiwic2VuZCIsInNkcCIsImtleVZhbHVlTGlzdCIsImNodW5rcyIsImNodW5rIiwiQnVmZmVyIiwiZnJvbSIsImluZGV4Iiwic2l6ZSIsImxlbmd0aCIsIlNUT1JFX0NIVU5LUyIsInRhcmdldElkIiwic3RhdGUiLCJ0YXJnZXRLZXkiLCJGSU5ETk9ERSIsImNhbGxiYWNrIiwiZXZlbnRzIiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZWplY3QiLCJkb0ZpbmR2YWx1ZSIsInIiLCJzZXRUaW1lb3V0Iiwib3duZXJJZCIsIkZJTkRWQUxVRSIsImFkZGtub2RlIiwiZGF0YSIsInJhdyIsIm9uQ29tbWFuZCIsImRpc2Nvbm5lY3QiLCJjbGVhbkRpc2NvbiIsImdldEFsbFBlZXJJZHMiLCJpc05vZGVFeGlzdCIsIm51bSIsInB1c2giLCJmaW5kTmV3UGVlciIsImdldEtidWNrZXROdW0iLCJpbngiLCJzcGxpY2UiLCJzaGlmdCIsInRhcmdldCIsInByb3h5IiwicmVmIiwiV2ViUlRDIiwibWFrZU9mZmVyIiwidGltZW91dCIsInNpZ25hbCIsIl8iLCJnZXRDbG9zZUVzdFBlZXIiLCJjb25uZWN0IiwiY2xlYXJUaW1lb3V0IiwibWFrZUFuc3dlciIsImdldFBlZXJGcm9tbm9kZUlkIiwiU0VORCIsIm1lc3NhZ2UiLCJsYWJlbCIsImJ1ZmZlciIsIm5ldHdvcmtMYXllciIsImRlc2VyaWFsaXplIiwiSlNPTiIsInN0cmluZ2lmeSIsImRhdGFMaXN0IiwiaW5jbHVkZXMiLCJvblJlcXVlc3QiLCJlcnJvciIsInJlc3BvbnNlIiwidHlwZSIsIm1haW50YWluIl0sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUVBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFQQUEsT0FBTyxDQUFDLGdCQUFELENBQVA7O0FBU0EsSUFBTUMsSUFBSSxHQUFHLElBQUlDLFVBQUosRUFBYjs7QUFDTyxTQUFTQyxXQUFULENBQXFCQyxFQUFyQixFQUE4QkMsQ0FBOUIsRUFBdUM7QUFDNUNDLEVBQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZLGFBQVosRUFBMkJILEVBQTNCO0FBQ0FJLEVBQUFBLE1BQU0sQ0FBQ0MsSUFBUCxDQUFZTCxFQUFaLEVBQWdCTSxPQUFoQixDQUF3QixVQUFBQyxHQUFHLEVBQUk7QUFDN0JQLElBQUFBLEVBQUUsQ0FBQ08sR0FBRCxDQUFGLENBQVFOLENBQVI7QUFDRCxHQUZEO0FBR0Q7O0lBRW9CTyxROzs7QUFtQ25CLG9CQUFZQyxPQUFaLEVBQTZCQyxHQUE3QixFQUF5RDtBQUFBOztBQUFBOztBQUFBOztBQUFBOztBQUFBOztBQUFBOztBQUFBLHNDQTdCbEMsRUE2QmtDOztBQUFBLDBDQTVCbEIsRUE0QmtCOztBQUFBLGlDQTNCeEIsRUEyQndCOztBQUFBLG9DQTFCakIsRUEwQmlCOztBQUFB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QUFZLGVBQVosRUFBNkI7QUFBRWtHLGNBQUFBLE9BQU8sRUFBUEE7QUFBRixhQUE3QixFQUEwQztBQUFFRyxjQUFBQSxZQUFZLEVBQVpBO0FBQUYsYUFBMUM7O0FBQ0EsZ0JBQUksQ0FBQ0UsSUFBSSxDQUFDQyxTQUFMLENBQWUsS0FBS0MsUUFBcEIsRUFBOEJDLFFBQTlCLENBQXVDTCxZQUFZLENBQUMxRixJQUFwRCxDQUFMLEVBQWdFO0FBQzlELG1CQUFLOEYsUUFBTCxDQUFjM0IsSUFBZCxDQUFtQnVCLFlBQVksQ0FBQzFGLElBQWhDO0FBQ0EsbUJBQUtnRyxTQUFMLENBQWVOLFlBQWY7QUFDRDtBQUNGLFdBUEQsQ0FPRSxPQUFPTyxLQUFQLEVBQWM7QUFDZDdHLFlBQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZNEcsS0FBWjtBQUNEOztBQUNEO0FBYko7QUFlRDs7OzhCQUVpQnBFLE8sRUFBYztBQUM5QixXQUFLUCxTQUFMLENBQWU0RSxRQUFmLENBQXdCckUsT0FBTyxDQUFDc0UsSUFBaEMsRUFBc0N0RSxPQUF0QztBQUNBLFdBQUt1RSxRQUFMLENBQWN2RSxPQUFkO0FBQ0QiLCJzb3VyY2VzQ29udGVudCI6WyJyZXF1aXJlKFwiYmFiZWwtcG9seWZpbGxcIik7XG5pbXBvcnQgV2ViUlRDIGZyb20gXCJ3ZWJydGM0bWVcIjtcbmltcG9ydCBIZWxwZXIgZnJvbSBcIi4va1V0aWxcIjtcbmltcG9ydCBLUmVzcG9uZGVyIGZyb20gXCIuL2tSZXNwb25kZXJcIjtcbmltcG9ydCBkZWYsIHsgbmV0d29ya0Zvcm1hdCB9IGZyb20gXCIuL0tDb25zdFwiO1xuaW1wb3J0IHsgZGlzdGFuY2UgfSBmcm9tIFwia2FkLWRpc3RhbmNlXCI7XG5pbXBvcnQgeyBtZXNzYWdlIH0gZnJvbSBcIndlYnJ0YzRtZS9saWIvaW50ZXJmYWNlXCI7XG5pbXBvcnQgeyBCU09OIH0gZnJvbSBcImJzb25cIjtcblxuY29uc3QgYnNvbiA9IG5ldyBCU09OKCk7XG5leHBvcnQgZnVuY3Rpb24gZXhjdXRlRXZlbnQoZXY6IGFueSwgdj86IGFueSkge1xuICBjb25zb2xlLmxvZyhcImV4Y3V0ZUV2ZW50XCIsIGV2KTtcbiAgT2JqZWN0LmtleXMoZXYpLmZvckVhY2goa2V5ID0+IHtcbiAgICBldltrZXldKHYpO1xuICB9KTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgS2FkZW1saWEge1xuICBub2RlSWQ6IHN0cmluZztcbiAgazogbnVtYmVyO1xuICBrYnVja2V0czogQXJyYXk8QXJyYXk8V2ViUlRDPj47XG4gIGY6IEhlbHBlcjtcbiAgcmVzcG9uZGVyOiBLUmVzcG9uZGVyO1xuICBkYXRhTGlzdDogQXJyYXk8YW55PiA9IFtdO1xuICBrZXlWYWx1ZUxpc3Q6IHsgW2tleTogc3RyaW5nXTogYW55IH0gPSB7fTtcbiAgcmVmOiB7IFtrZXk6IHN0cmluZ106IFdlYlJUQyB9ID0ge307XG4gIGJ1ZmZlcjogeyBba2V5OiBzdHJpbmddOiBBcnJheTxhbnk+IH0gPSB7fTtcbiAgc3RhdGUgPSB7XG4gICAgaXNGaXJzdENvbm5lY3Q6IHRydWUsXG4gICAgaXNPZmZlcjogZmFsc2UsXG4gICAgZmluZE5vZGU6IFwiXCIsXG4gICAgaGFzaDoge31cbiAgfTtcblxuICBjYWxsYmFjayA9IHtcbiAgICBvbkNvbm5lY3Q6ICgpID0+IHt9LFxuICAgIG9uQWRkUGVlcjogKHY/OiBhbnkpID0+IHt9LFxuICAgIG9uUGVlckRpc2Nvbm5lY3Q6ICh2PzogYW55KSA9PiB7fSxcbiAgICBfb25GaW5kVmFsdWU6ICh2PzogYW55KSA9PiB7fSxcbiAgICBfb25GaW5kTm9kZTogKHY/OiBhbnkpID0+IHt9LFxuICAgIG9uQXBwOiAodj86IGFueSkgPT4ge31cbiAgfTtcblxuICBvblN0b3JlOiB7IFtrZXk6IHN0cmluZ106ICh2OiBhbnkpID0+IHZvaWQgfSA9IHt9O1xuICBvbkZpbmRWYWx1ZTogeyBba2V5OiBzdHJpbmddOiAodjogYW55KSA9PiB2b2lkIH0gPSB7fTtcbiAgb25GaW5kTm9kZTogeyBba2V5OiBzdHJpbmddOiAodjogYW55KSA9PiB2b2lkIH0gPSB7fTtcbiAgZXZlbnRzID0ge1xuICAgIHN0b3JlOiB0aGlzLm9uU3RvcmUsXG4gICAgZmluZHZhbHVlOiB0aGlzLm9uRmluZFZhbHVlLFxuICAgIGZpbmRub2RlOiB0aGlzLm9uRmluZE5vZGVcbiAgfTtcblxuICBjb25zdHJ1Y3Rvcihfbm9kZUlkOiBzdHJpbmcsIG9wdD86IHsga0xlbmd0aD86IG51bWJlciB9KSB7XG4gICAgY29uc29sZS5sb2coXCJzdGFydCBrYWRcIiwgX25vZGVJZCk7XG4gICAgdGhpcy5rID0gMjA7XG4gICAgaWYgKG9wdCkgaWYgKG9wdC5rTGVuZ3RoKSB0aGlzLmsgPSBvcHQua0xlbmd0aDtcbiAgICB0aGlzLm5vZGVJZCA9IF9ub2RlSWQ7XG5cbiAgICB0aGlzLmtidWNrZXRzID0gbmV3IEFycmF5KDE2MCk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCAxNjA7IGkrKykge1xuICAgICAgbGV0IGtidWNrZXQ6IEFycmF5PGFueT4gPSBbXTtcbiAgICAgIHRoaXMua2J1Y2tldHNbaV0gPSBrYnVja2V0O1xuICAgIH1cblxuICAgIHRoaXMuZiA9IG5ldyBIZWxwZXIodGhpcy5rLCB0aGlzLmtidWNrZXRzKTtcbiAgICB0aGlzLnJlc3BvbmRlciA9IG5ldyBLUmVzcG9uZGVyKHRoaXMpO1xuICB9XG5cbiAgc3RvcmUoc2VuZGVyOiBzdHJpbmcsIGtleTogc3RyaW5nLCB2YWx1ZTogYW55KSB7XG4gICAgLy/oh6rliIbjgavkuIDnlarov5HjgYTjg5TjgqLjgpLlj5blvpdcbiAgICBjb25zdCBwZWVycyA9IHRoaXMuZi5nZXRDbG9zZVBlZXJzKGtleSk7XG4gICAgY29uc3Qgc2VuZERhdGE6IFN0b3JlRm9ybWF0ID0geyBzZW5kZXIsIGtleSwgdmFsdWUgfTtcbiAgICBjb25zdCBuZXR3b3JrID0gbmV0d29ya0Zvcm1hdCh0aGlzLm5vZGVJZCwgZGVmLlNUT1JFLCBzZW5kRGF0YSk7XG4gICAgcGVlcnMuZm9yRWFjaChwZWVyID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKGRlZi5TVE9SRSwgXCJuZXh0XCIsIHBlZXIubm9kZUlkLCBcInRhcmdldFwiLCBrZXkpO1xuICAgICAgcGVlci5zZW5kKG5ldHdvcmssIFwia2FkXCIpO1xuICAgIH0pO1xuICAgIC8vbm8gc2RwXG4gICAgaWYgKCF2YWx1ZS5zZHApIHRoaXMua2V5VmFsdWVMaXN0W2tleV0gPSB2YWx1ZTtcbiAgfVxuXG4gIHN0b3JlQ2h1bmtzKHNlbmRlcjogc3RyaW5nLCBrZXk6IHN0cmluZywgY2h1bmtzOiBBcnJheUJ1ZmZlcltdKSB7XG4gICAgY29uc3QgcGVlcnMgPSB0aGlzLmYuZ2V0Q2xvc2VQZWVycyhrZXkpO1xuICAgIGNvbnNvbGUubG9nKFwic3RvcmUgY2h1bmtzXCIsIHsgY2h1bmtzIH0pO1xuICAgIGNodW5rcy5mb3JFYWNoKChjaHVuaywgaSkgPT4ge1xuICAgICAgY29uc3Qgc2VuZERhdGE6IFN0b3JlQ2h1bmtzID0ge1xuICAgICAgICBzZW5kZXI6IHRoaXMubm9kZUlkLFxuICAgICAgICBrZXksXG4gICAgICAgIHZhbHVlOiBCdWZmZXIuZnJvbShjaHVuayksXG4gICAgICAgIGluZGV4OiBpLFxuICAgICAgICBzaXplOiBjaHVua3MubGVuZ3RoXG4gICAgICB9O1xuICAgICAgY29uc3QgbmV0d29yayA9IG5ldHdvcmtGb3JtYXQoc2VuZGVyLCBkZWYuU1RPUkVfQ0hVTktTLCBzZW5kRGF0YSk7XG4gICAgICBwZWVycy5mb3JFYWNoKHBlZXIgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZyhkZWYuU1RPUkUsIFwibmV4dFwiLCBwZWVyLm5vZGVJZCwgXCJ0YXJnZXRcIiwga2V5KTtcbiAgICAgICAgcGVlci5zZW5kKG5ldHdvcmssIFwia2FkXCIpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gICAgLy/jg6zjg5fjg6rjgrHjg7zjgrfjg6fjg7NcbiAgICB0aGlzLmtleVZhbHVlTGlzdFtrZXldID0geyBjaHVua3MgfTtcbiAgfVxuXG4gIGZpbmROb2RlKHRhcmdldElkOiBzdHJpbmcsIHBlZXI6IFdlYlJUQykge1xuICAgIGNvbnNvbGUubG9nKFwiZmluZG5vZGVcIiwgdGFyZ2V0SWQpO1xuICAgIHRoaXMuc3RhdGUuZmluZE5vZGUgPSB0YXJnZXRJZDtcbiAgICBjb25zdCBzZW5kRGF0YSA9IHsgdGFyZ2V0S2V5OiB0YXJnZXRJZCB9O1xuICAgIC8v6YCB44KLXG4gICAgcGVlci5zZW5kKG5ldHdvcmtGb3JtYXQodGhpcy5ub2RlSWQsIGRlZi5GSU5ETk9ERSwgc2VuZERhdGEpLCBcImthZFwiKTtcblxuICAgIHRoaXMuY2FsbGJhY2suX29uRmluZE5vZGUoKG5vZGVJZDogc3RyaW5nKSA9PiB7XG4gICAgICBleGN1dGVFdmVudCh0aGlzLmV2ZW50cy5maW5kbm9kZSwgbm9kZUlkKTtcbiAgICB9KTtcbiAgfVxuXG4gIGZpbmRWYWx1ZShrZXk6IHN0cmluZywgb3B0PzogeyBvd25lcklkPzogc3RyaW5nIH0pIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2U8YW55Pihhc3luYyAocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICB0aGlzLmNhbGxiYWNrLl9vbkZpbmRWYWx1ZSA9IHZhbHVlID0+IHtcbiAgICAgICAgZXhjdXRlRXZlbnQodGhpcy5ldmVudHMuZmluZHZhbHVlLCB2YWx1ZSk7XG4gICAgICAgIHJlc29sdmUodmFsdWUpO1xuICAgICAgfTtcbiAgICAgIC8va2V544Gr6L+R44GE44OU44Ki44KS5Y+W5b6XXG4gICAgICBjb25zdCBwZWVycyA9IHRoaXMuZi5nZXRDbG9zZVBlZXJzKGtleSk7XG4gICAgICBwZWVycy5mb3JFYWNoKHBlZXIgPT4ge1xuICAgICAgICB0aGlzLmRvRmluZHZhbHVlKGtleSwgcGVlcik7XG4gICAgICB9KTtcblxuICAgICAgYXdhaXQgbmV3IFByb21pc2UociA9PiBzZXRUaW1lb3V0KHIsIDUwMDApKTtcbiAgICAgIGlmIChvcHQgJiYgb3B0Lm93bmVySWQpIHtcbiAgICAgICAgY29uc3Qgb3duZXJJZCA9IG9wdC5vd25lcklkO1xuICAgICAgICBjb25zdCBwZWVycyA9IHRoaXMuZi5nZXRDbG9zZVBlZXJzKG93bmVySWQpO1xuICAgICAgICBwZWVycy5mb3JFYWNoKHBlZXIgPT4ge1xuICAgICAgICAgIHRoaXMuZG9GaW5kdmFsdWUob3duZXJJZCwgcGVlcik7XG4gICAgICAgIH0pO1xuICAgICAgICBhd2FpdCBuZXcgUHJvbWlzZShyID0+IHNldFRpbWVvdXQociwgNTAwMCkpO1xuICAgICAgfVxuICAgICAgcmVqZWN0KFwiZmluZHZhbHVlIHRpbWVvdXRcIik7XG4gICAgfSk7XG4gIH1cblxuICBhc3luYyBkb0ZpbmR2YWx1ZShrZXk6IHN0cmluZywgcGVlcjogV2ViUlRDKSB7XG4gICAgY29uc29sZS5sb2coXCJkb2ZpbmR2YWx1ZVwiLCBwZWVyLm5vZGVJZCk7XG4gICAgY29uc3Qgc2VuZERhdGE6IEZpbmRWYWx1ZSA9IHsgdGFyZ2V0S2V5OiBrZXkgfTtcbiAgICBwZWVyLnNlbmQobmV0d29ya0Zvcm1hdCh0aGlzLm5vZGVJZCwgZGVmLkZJTkRWQUxVRSwgc2VuZERhdGEpLCBcImthZFwiKTtcbiAgfVxuXG4gIGNvbm5lY3QocGVlcjogV2ViUlRDKSB7XG4gICAgY29uc29sZS5sb2coXCJrYWQgY29ubmVjdFwiKTtcbiAgICBpZiAodGhpcy5zdGF0ZS5pc0ZpcnN0Q29ubmVjdCkgdGhpcy5jYWxsYmFjay5vbkNvbm5lY3QoKTtcbiAgICB0aGlzLnN0YXRlLmlzRmlyc3RDb25uZWN0ID0gZmFsc2U7XG4gICAgdGhpcy5hZGRrbm9kZShwZWVyKTtcbiAgfVxuXG4gIGFkZGtub2RlKHBlZXI6IFdlYlJUQykge1xuICAgIHBlZXIuZXZlbnRzLmRhdGFbXCJrYWRlbWxpYS50c1wiXSA9IHJhdyA9PiB7XG4gICAgICB0aGlzLm9uQ29tbWFuZChyYXcpO1xuICAgIH07XG5cbiAgICBwZWVyLmRpc2Nvbm5lY3QgPSAoKSA9PiB7XG4gICAgICBjb25zb2xlLmxvZyhcImthZCBub2RlIGRpc2Nvbm5lY3RlZFwiKTtcbiAgICAgIHRoaXMuZi5jbGVhbkRpc2NvbigpO1xuICAgICAgdGhpcy5jYWxsYmFjay5vbkFkZFBlZXIodGhpcy5mLmdldEFsbFBlZXJJZHMoKSk7XG4gICAgfTtcblxuICAgIGlmICghdGhpcy5mLmlzTm9kZUV4aXN0KHBlZXIubm9kZUlkKSkge1xuICAgICAgLy/oh6rliIbjga7jg47jg7zjg4lJROOBqOi/veWKoOOBmeOCi+ODjuODvOODiUlE44Gu6Led6ZuiXG4gICAgICBjb25zdCBudW0gPSBkaXN0YW5jZSh0aGlzLm5vZGVJZCwgcGVlci5ub2RlSWQpO1xuICAgICAgLy9rYnVja2V0c+OBruipsuW9k+OBmeOCi+i3nembouOBrmtidWNrZXTjgpLlkbzjgbPlh7rjgZlcbiAgICAgIGNvbnN0IGtidWNrZXQgPSB0aGlzLmtidWNrZXRzW251bV07XG4gICAgICAvL+ipsuW9k+OBmeOCi2tidWNrZXTjgavmlrDjgZfjgYTjg5TjgqLjgpLliqDjgYjjgotcbiAgICAgIGtidWNrZXQucHVzaChwZWVyKTtcblxuICAgICAgY29uc29sZS5sb2coXCJhZGRrbm9kZSBrYnVja2V0c1wiLCBcInBlZXIubm9kZUlkOlwiLCBwZWVyLm5vZGVJZCk7XG4gICAgICBjb25zb2xlLmxvZyh0aGlzLmYuZ2V0QWxsUGVlcklkcygpKTtcblxuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHRoaXMuZmluZE5ld1BlZXIocGVlcik7XG4gICAgICB9LCAxMDAwKTtcblxuICAgICAgdGhpcy5jYWxsYmFjay5vbkFkZFBlZXIodGhpcy5mLmdldEFsbFBlZXJJZHMoKSk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBmaW5kTmV3UGVlcihwZWVyOiBXZWJSVEMpIHtcbiAgICBpZiAodGhpcy5mLmdldEtidWNrZXROdW0oKSA8IHRoaXMuaykge1xuICAgICAgLy/oh6rouqvjga7jg47jg7zjg4lJROOCkmtleeOBqOOBl+OBpkZJTkRfTk9ERVxuICAgICAgdGhpcy5maW5kTm9kZSh0aGlzLm5vZGVJZCwgcGVlcik7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUubG9nKFwia2J1Y2tldCByZWFkeVwiLCB0aGlzLmYuZ2V0S2J1Y2tldE51bSgpKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIG1haW50YWluKG5ldHdvcms6IGFueSkge1xuICAgIGNvbnN0IGlueCA9IGRpc3RhbmNlKHRoaXMubm9kZUlkLCBuZXR3b3JrLm5vZGVJZCk7XG4gICAgY29uc3Qga2J1Y2tldCA9IHRoaXMua2J1Y2tldHNbaW54XTtcblxuICAgIC8v6YCB5L+h5YWD44GM6Kmy5b2T44GZ44KLay1idWNrZXTjga7kuK3jgavjgYLjgaPjgZ/loLTlkIhcbiAgICAvL+OBneOBruODjuODvOODieOCkmstYnVja2V044Gu5pyr5bC+44Gr56e744GZXG4gICAga2J1Y2tldC5mb3JFYWNoKChwZWVyLCBpKSA9PiB7XG4gICAgICBpZiAocGVlci5ub2RlSWQgPT09IG5ldHdvcmsubm9kZUlkKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwibWFpbnRhaW5cIiwgXCJNb3Zlc8KgaXTCoHRvwqB0aGXCoHRhaWzCoG9mwqB0aGXCoGxpc3RcIik7XG4gICAgICAgIGtidWNrZXQuc3BsaWNlKGksIDEpO1xuICAgICAgICBrYnVja2V0LnB1c2gocGVlcik7XG4gICAgICAgIHJldHVybiAwO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy9rLWJ1Y2tldOOBjOOBmeOBp+OBq+a6gOadr+OBquWgtOWQiOOAgVxuICAgIC8v44Gd44Guay1idWNrZXTkuK3jga7lhYjpoK3jga7jg47jg7zjg4njgYzjgqrjg7Pjg6njgqTjg7PjgarjgonlhYjpoK3jga7jg47jg7zjg4njgpLmrovjgZlcbiAgICBpZiAoa2J1Y2tldC5sZW5ndGggPiB0aGlzLmspIHtcbiAgICAgIGtidWNrZXQuc2hpZnQoKTtcbiAgICB9XG4gIH1cblxuICBvZmZlcih0YXJnZXQ6IHN0cmluZywgcHJveHkgPSBudWxsKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGNvbnN0IHIgPSB0aGlzLnJlZjtcbiAgICAgIGNvbnN0IHBlZXIgPSAoclt0YXJnZXRdID0gbmV3IFdlYlJUQygpKTtcbiAgICAgIHBlZXIubWFrZU9mZmVyKCk7XG5cbiAgICAgIGNvbnN0IHRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgcmVqZWN0KFwia2FkIG9mZmVyIHRpbWVvdXRcIik7XG4gICAgICB9LCA1ICogMTAwMCk7XG5cbiAgICAgIHBlZXIuc2lnbmFsID0gc2RwID0+IHtcbiAgICAgICAgY29uc29sZS5sb2coXCJrYWQgb2ZmZXIgc3RvcmVcIiwgdGFyZ2V0KTtcbiAgICAgICAgY29uc3QgXyA9IHRoaXMuZi5nZXRDbG9zZUVzdFBlZXIodGFyZ2V0KTtcbiAgICAgICAgaWYgKCFfKSByZXR1cm47XG4gICAgICAgIGlmIChfLm5vZGVJZCAhPT0gdGFyZ2V0KVxuICAgICAgICAgIHRoaXMuc3RvcmUodGhpcy5ub2RlSWQsIHRhcmdldCwgeyBzZHAsIHByb3h5IH0pO1xuICAgICAgfTtcblxuICAgICAgcGVlci5jb25uZWN0ID0gKCkgPT4ge1xuICAgICAgICBwZWVyLm5vZGVJZCA9IHRhcmdldDtcbiAgICAgICAgY29uc29sZS5sb2coXCJrYWQgb2ZmZXIgY29ubmVjdGVkXCIsIHRhcmdldCk7XG4gICAgICAgIHRoaXMuYWRka25vZGUocGVlcik7XG4gICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KTtcbiAgICAgICAgcmVzb2x2ZSh0cnVlKTtcbiAgICAgIH07XG4gICAgfSk7XG4gIH1cblxuICBhbnN3ZXIodGFyZ2V0OiBzdHJpbmcsIHNkcDogc3RyaW5nLCBwcm94eTogc3RyaW5nKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGNvbnN0IHIgPSB0aGlzLnJlZjtcbiAgICAgIGNvbnN0IHBlZXIgPSAoclt0YXJnZXRdID0gbmV3IFdlYlJUQygpKTtcbiAgICAgIHBlZXIubWFrZUFuc3dlcihzZHApO1xuICAgICAgY29uc29sZS5sb2coXCJrYWQgYW5zd2VyXCIsIHRhcmdldCk7XG5cbiAgICAgIGNvbnN0IHRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgcmVqZWN0KFwia2FkIGFuc3dlciB0aW1lb3V0XCIpO1xuICAgICAgfSwgNSAqIDEwMDApO1xuXG4gICAgICBwZWVyLnNpZ25hbCA9IHNkcCA9PiB7XG4gICAgICAgIGNvbnN0IF8gPSB0aGlzLmYuZ2V0UGVlckZyb21ub2RlSWQocHJveHkpO1xuICAgICAgICAvL+adpeOBn+ODq+ODvOODiOOBq+mAgeOCiui/lOOBmVxuICAgICAgICBjb25zdCBzZW5kRGF0YTogU3RvcmVGb3JtYXQgPSB7XG4gICAgICAgICAgc2VuZGVyOiB0aGlzLm5vZGVJZCxcbiAgICAgICAgICBrZXk6IHRhcmdldCxcbiAgICAgICAgICB2YWx1ZTogeyBzZHAgfVxuICAgICAgICB9O1xuICAgICAgICBpZiAoXykgXy5zZW5kKG5ldHdvcmtGb3JtYXQodGhpcy5ub2RlSWQsIGRlZi5TVE9SRSwgc2VuZERhdGEpLCBcImthZFwiKTtcbiAgICAgIH07XG5cbiAgICAgIHBlZXIuY29ubmVjdCA9ICgpID0+IHtcbiAgICAgICAgcGVlci5ub2RlSWQgPSB0YXJnZXQ7XG4gICAgICAgIGNvbnNvbGUubG9nKFwia2FkIGFuc3dlciBjb25uZWN0ZWRcIiwgdGFyZ2V0KTtcbiAgICAgICAgdGhpcy5hZGRrbm9kZShwZWVyKTtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xuICAgICAgICByZXNvbHZlKHRydWUpO1xuICAgICAgfTtcbiAgICB9KTtcbiAgfVxuXG4gIHNlbmQodGFyZ2V0OiBzdHJpbmcsIGRhdGE6IGFueSkge1xuICAgIGNvbnN0IF8gPSB0aGlzLmYuZ2V0UGVlckZyb21ub2RlSWQodGFyZ2V0KTtcbiAgICBpZiAoXykgXy5zZW5kKG5ldHdvcmtGb3JtYXQodGhpcy5ub2RlSWQsIGRlZi5TRU5ELCBkYXRhKSwgXCJrYWRcIik7XG4gIH1cblxuICBwcml2YXRlIG9uQ29tbWFuZChtZXNzYWdlOiBtZXNzYWdlKSB7XG4gICAgc3dpdGNoIChtZXNzYWdlLmxhYmVsKSB7XG4gICAgICBjYXNlIFwia2FkXCI6XG4gICAgICAgIGNvbnN0IGJ1ZmZlcjogQnVmZmVyID0gQnVmZmVyLmZyb20obWVzc2FnZS5kYXRhKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBjb25zdCBuZXR3b3JrTGF5ZXI6IG5ldHdvcmsgPSBic29uLmRlc2VyaWFsaXplKGJ1ZmZlcik7XG4gICAgICAgICAgY29uc29sZS5sb2coXCJvbmNvbW1hbmQga2FkXCIsIHsgbWVzc2FnZSB9LCB7IG5ldHdvcmtMYXllciB9KTtcbiAgICAgICAgICBpZiAoIUpTT04uc3RyaW5naWZ5KHRoaXMuZGF0YUxpc3QpLmluY2x1ZGVzKG5ldHdvcmtMYXllci5oYXNoKSkge1xuICAgICAgICAgICAgdGhpcy5kYXRhTGlzdC5wdXNoKG5ldHdvcmtMYXllci5oYXNoKTtcbiAgICAgICAgICAgIHRoaXMub25SZXF1ZXN0KG5ldHdvcmtMYXllcik7XG4gICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yKTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIG9uUmVxdWVzdChuZXR3b3JrOiBhbnkpIHtcbiAgICB0aGlzLnJlc3BvbmRlci5yZXNwb25zZShuZXR3b3JrLnR5cGUsIG5ldHdvcmspO1xuICAgIHRoaXMubWFpbnRhaW4obmV0d29yayk7XG4gIH1cbn1cbiJdfQ==
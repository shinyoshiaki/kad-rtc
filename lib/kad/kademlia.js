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
      });
      this.keyValueList[key] = value;
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
        _this.keyValueList[key] = chunks;
      });
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9rYWQva2FkZW1saWEudHMiXSwibmFtZXMiOlsicmVxdWlyZSIsImJzb24iLCJCU09OIiwiZXhjdXRlRXZlbnQiLCJldiIsInYiLCJjb25zb2xlIiwibG9nIiwiT2JqZWN0Iiwia2V5cyIsImZvckVhY2giLCJrZXkiLCJLYWRlbWxpYSIsIl9ub2RlSWQiLCJvcHQiLCJpc0ZpcnN0Q29ubmVjdCIsImlzT2ZmZXIiLCJmaW5kTm9kZSIsImhhc2giLCJvbkNvbm5lY3QiLCJvbkFkZFBlZXIiLCJvblBlZXJEaXNjb25uZWN0IiwiX29uRmluZFZhbHVlIiwiX29uRmluZE5vZGUiLCJvbkFwcCIsInN0b3JlIiwib25TdG9yZSIsImZpbmR2YWx1ZSIsIm9uRmluZFZhbHVlIiwiZmluZG5vZGUiLCJvbkZpbmROb2RlIiwiayIsImtMZW5ndGgiLCJub2RlSWQiLCJrYnVja2V0cyIsIkFycmF5IiwiaSIsImtidWNrZXQiLCJmIiwiSGVscGVyIiwicmVzcG9uZGVyIiwiS1Jlc3BvbmRlciIsInNlbmRlciIsInZhbHVlIiwicGVlcnMiLCJnZXRDbG9zZVBlZXJzIiwic2VuZERhdGEiLCJuZXR3b3JrIiwiZGVmIiwiU1RPUkUiLCJwZWVyIiwic2VuZCIsImtleVZhbHVlTGlzdCIsImNodW5rcyIsImNodW5rIiwiQnVmZmVyIiwiZnJvbSIsImluZGV4Iiwic2l6ZSIsImxlbmd0aCIsIlNUT1JFX0NIVU5LUyIsInRhcmdldElkIiwic3RhdGUiLCJ0YXJnZXRLZXkiLCJGSU5ETk9ERSIsImNhbGxiYWNrIiwiZXZlbnRzIiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZWplY3QiLCJkb0ZpbmR2YWx1ZSIsInIiLCJzZXRUaW1lb3V0Iiwib3duZXJJZCIsIkZJTkRWQUxVRSIsImFkZGtub2RlIiwiZGF0YSIsInJhdyIsIm9uQ29tbWFuZCIsImRpc2Nvbm5lY3QiLCJjbGVhbkRpc2NvbiIsImdldEFsbFBlZXJJZHMiLCJpc05vZGVFeGlzdCIsIm51bSIsInB1c2giLCJmaW5kTmV3UGVlciIsImdldEtidWNrZXROdW0iLCJpbngiLCJzcGxpY2UiLCJzaGlmdCIsInRhcmdldCIsInByb3h5IiwicmVmIiwiV2ViUlRDIiwibWFrZU9mZmVyIiwidGltZW91dCIsInNpZ25hbCIsInNkcCIsIl8iLCJnZXRDbG9zZUVzdFBlZXIiLCJjb25uZWN0IiwiY2xlYXJUaW1lb3V0IiwibWFrZUFuc3dlciIsImdldFBlZXJGcm9tbm9kZUlkIiwiU0VORCIsIm1lc3NhZ2UiLCJsYWJlbCIsImJ1ZmZlciIsIm5ldHdvcmtMYXllciIsImRlc2VyaWFsaXplIiwiSlNPTiIsInN0cmluZ2lmeSIsImRhdGFMaXN0IiwiaW5jbHVkZXMiLCJvblJlcXVlc3QiLCJlcnJvciIsInJlc3BvbnNlIiwidHlwZSIsIm1haW50YWluIl0sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUVBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFQQUEsT0FBTyxDQUFDLGdCQUFELENBQVA7O0FBU0EsSUFBTUMsSUFBSSxHQUFHLElBQUlDLFVBQUosRUFBYjs7QUFDTyxTQUFTQyxXQUFULENBQXFCQyxFQUFyQixFQUE4QkMsQ0FBOUIsRUFBdUM7QUFDNUNDLEVBQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZLGFBQVosRUFBMkJILEVBQTNCO0FBQ0FJLEVBQUFBLE1BQU0sQ0FBQ0MsSUFBUCxDQUFZTCxFQUFaLEVBQWdCTSxPQUFoQixDQUF3QixVQUFBQyxHQUFHLEVBQUk7QUFDN0JQLElBQUFBLEVBQUUsQ0FBQ08sR0FBRCxDQUFGLENBQVFOLENBQVI7QUFDRCxHQUZEO0FBR0Q7O0lBRW9CTyxROzs7QUFtQ25CLG9CQUFZQyxPQUFaLEVBQTZCQyxHQUE3QixFQUF5RDtBQUFBOztBQUFBOztBQUFBOztBQUFBOztBQUFBOztBQUFBOztBQUFBLHNDQTdCbEMsRUE2QmtDOztBQUFBLDBDQTVCbEIsRUE0QmtCOztBQUFBLGlDQTNCeEIsRUEyQndCOztBQUFBLG9DQTFCakIsRUEwQmlCOztBQUFB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QUM0RyxXQUFMLENBQWlCRixNQUFqQixDQUE5Qjs7QUFDQSxnQkFBSSxDQUFDRyxJQUFJLENBQUNDLFNBQUwsQ0FBZSxLQUFLQyxRQUFwQixFQUE4QkMsUUFBOUIsQ0FBdUNMLFlBQVksQ0FBQzFGLElBQXBELENBQUwsRUFBZ0U7QUFDOUQsbUJBQUs4RixRQUFMLENBQWM1QixJQUFkLENBQW1Cd0IsWUFBWSxDQUFDMUYsSUFBaEM7QUFDQSxtQkFBS2dHLFNBQUwsQ0FBZU4sWUFBZjtBQUNEO0FBQ0YsV0FQRCxDQU9FLE9BQU9PLEtBQVAsRUFBYztBQUNkN0csWUFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVk0RyxLQUFaO0FBQ0Q7O0FBQ0Q7QUFkSjtBQWdCRDs7OzhCQUVpQnBFLE8sRUFBYztBQUM5QixXQUFLUCxTQUFMLENBQWU0RSxRQUFmLENBQXdCckUsT0FBTyxDQUFDc0UsSUFBaEMsRUFBc0N0RSxPQUF0QztBQUNBLFdBQUt1RSxRQUFMLENBQWN2RSxPQUFkO0FBQ0QiLCJzb3VyY2VzQ29udGVudCI6WyJyZXF1aXJlKFwiYmFiZWwtcG9seWZpbGxcIik7XG5pbXBvcnQgV2ViUlRDIGZyb20gXCJ3ZWJydGM0bWVcIjtcbmltcG9ydCBIZWxwZXIgZnJvbSBcIi4va1V0aWxcIjtcbmltcG9ydCBLUmVzcG9uZGVyIGZyb20gXCIuL2tSZXNwb25kZXJcIjtcbmltcG9ydCBkZWYsIHsgbmV0d29ya0Zvcm1hdCB9IGZyb20gXCIuL0tDb25zdFwiO1xuaW1wb3J0IHsgZGlzdGFuY2UgfSBmcm9tIFwia2FkLWRpc3RhbmNlXCI7XG5pbXBvcnQgeyBtZXNzYWdlIH0gZnJvbSBcIndlYnJ0YzRtZS9saWIvaW50ZXJmYWNlXCI7XG5pbXBvcnQgeyBCU09OIH0gZnJvbSBcImJzb25cIjtcblxuY29uc3QgYnNvbiA9IG5ldyBCU09OKCk7XG5leHBvcnQgZnVuY3Rpb24gZXhjdXRlRXZlbnQoZXY6IGFueSwgdj86IGFueSkge1xuICBjb25zb2xlLmxvZyhcImV4Y3V0ZUV2ZW50XCIsIGV2KTtcbiAgT2JqZWN0LmtleXMoZXYpLmZvckVhY2goa2V5ID0+IHtcbiAgICBldltrZXldKHYpO1xuICB9KTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgS2FkZW1saWEge1xuICBub2RlSWQ6IHN0cmluZztcbiAgazogbnVtYmVyO1xuICBrYnVja2V0czogQXJyYXk8QXJyYXk8V2ViUlRDPj47XG4gIGY6IEhlbHBlcjtcbiAgcmVzcG9uZGVyOiBLUmVzcG9uZGVyO1xuICBkYXRhTGlzdDogQXJyYXk8YW55PiA9IFtdO1xuICBrZXlWYWx1ZUxpc3Q6IHsgW2tleTogc3RyaW5nXTogYW55IH0gPSB7fTtcbiAgcmVmOiB7IFtrZXk6IHN0cmluZ106IFdlYlJUQyB9ID0ge307XG4gIGJ1ZmZlcjogeyBba2V5OiBzdHJpbmddOiBBcnJheTxhbnk+IH0gPSB7fTtcbiAgc3RhdGUgPSB7XG4gICAgaXNGaXJzdENvbm5lY3Q6IHRydWUsXG4gICAgaXNPZmZlcjogZmFsc2UsXG4gICAgZmluZE5vZGU6IFwiXCIsXG4gICAgaGFzaDoge31cbiAgfTtcblxuICBjYWxsYmFjayA9IHtcbiAgICBvbkNvbm5lY3Q6ICgpID0+IHt9LFxuICAgIG9uQWRkUGVlcjogKHY/OiBhbnkpID0+IHt9LFxuICAgIG9uUGVlckRpc2Nvbm5lY3Q6ICh2PzogYW55KSA9PiB7fSxcbiAgICBfb25GaW5kVmFsdWU6ICh2PzogYW55KSA9PiB7fSxcbiAgICBfb25GaW5kTm9kZTogKHY/OiBhbnkpID0+IHt9LFxuICAgIG9uQXBwOiAodj86IGFueSkgPT4ge31cbiAgfTtcblxuICBvblN0b3JlOiB7IFtrZXk6IHN0cmluZ106ICh2OiBhbnkpID0+IHZvaWQgfSA9IHt9O1xuICBvbkZpbmRWYWx1ZTogeyBba2V5OiBzdHJpbmddOiAodjogYW55KSA9PiB2b2lkIH0gPSB7fTtcbiAgb25GaW5kTm9kZTogeyBba2V5OiBzdHJpbmddOiAodjogYW55KSA9PiB2b2lkIH0gPSB7fTtcbiAgZXZlbnRzID0ge1xuICAgIHN0b3JlOiB0aGlzLm9uU3RvcmUsXG4gICAgZmluZHZhbHVlOiB0aGlzLm9uRmluZFZhbHVlLFxuICAgIGZpbmRub2RlOiB0aGlzLm9uRmluZE5vZGVcbiAgfTtcblxuICBjb25zdHJ1Y3Rvcihfbm9kZUlkOiBzdHJpbmcsIG9wdD86IHsga0xlbmd0aD86IG51bWJlciB9KSB7XG4gICAgY29uc29sZS5sb2coXCJzdGFydCBrYWRcIiwgX25vZGVJZCk7XG4gICAgdGhpcy5rID0gMjA7XG4gICAgaWYgKG9wdCkgaWYgKG9wdC5rTGVuZ3RoKSB0aGlzLmsgPSBvcHQua0xlbmd0aDtcbiAgICB0aGlzLm5vZGVJZCA9IF9ub2RlSWQ7XG5cbiAgICB0aGlzLmtidWNrZXRzID0gbmV3IEFycmF5KDE2MCk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCAxNjA7IGkrKykge1xuICAgICAgbGV0IGtidWNrZXQ6IEFycmF5PGFueT4gPSBbXTtcbiAgICAgIHRoaXMua2J1Y2tldHNbaV0gPSBrYnVja2V0O1xuICAgIH1cblxuICAgIHRoaXMuZiA9IG5ldyBIZWxwZXIodGhpcy5rLCB0aGlzLmtidWNrZXRzKTtcbiAgICB0aGlzLnJlc3BvbmRlciA9IG5ldyBLUmVzcG9uZGVyKHRoaXMpO1xuICB9XG5cbiAgc3RvcmUoc2VuZGVyOiBzdHJpbmcsIGtleTogc3RyaW5nLCB2YWx1ZTogYW55KSB7XG4gICAgLy/oh6rliIbjgavkuIDnlarov5HjgYTjg5TjgqLjgpLlj5blvpdcbiAgICBjb25zdCBwZWVycyA9IHRoaXMuZi5nZXRDbG9zZVBlZXJzKGtleSk7XG4gICAgY29uc3Qgc2VuZERhdGE6IFN0b3JlRm9ybWF0ID0geyBzZW5kZXIsIGtleSwgdmFsdWUgfTtcbiAgICBjb25zdCBuZXR3b3JrID0gbmV0d29ya0Zvcm1hdCh0aGlzLm5vZGVJZCwgZGVmLlNUT1JFLCBzZW5kRGF0YSk7XG4gICAgcGVlcnMuZm9yRWFjaChwZWVyID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKGRlZi5TVE9SRSwgXCJuZXh0XCIsIHBlZXIubm9kZUlkLCBcInRhcmdldFwiLCBrZXkpO1xuICAgICAgcGVlci5zZW5kKG5ldHdvcmssIFwia2FkXCIpO1xuICAgIH0pO1xuICAgIHRoaXMua2V5VmFsdWVMaXN0W2tleV0gPSB2YWx1ZTtcbiAgfVxuXG4gIHN0b3JlQ2h1bmtzKHNlbmRlcjogc3RyaW5nLCBrZXk6IHN0cmluZywgY2h1bmtzOiBBcnJheUJ1ZmZlcltdKSB7XG4gICAgY29uc3QgcGVlcnMgPSB0aGlzLmYuZ2V0Q2xvc2VQZWVycyhrZXkpO1xuICAgIGNvbnNvbGUubG9nKFwic3RvcmUgY2h1bmtzXCIsIHsgY2h1bmtzIH0pO1xuICAgIGNodW5rcy5mb3JFYWNoKChjaHVuaywgaSkgPT4ge1xuICAgICAgY29uc3Qgc2VuZERhdGE6IFN0b3JlQ2h1bmtzID0ge1xuICAgICAgICBzZW5kZXI6IHRoaXMubm9kZUlkLFxuICAgICAgICBrZXksXG4gICAgICAgIHZhbHVlOiBCdWZmZXIuZnJvbShjaHVuayksXG4gICAgICAgIGluZGV4OiBpLFxuICAgICAgICBzaXplOiBjaHVua3MubGVuZ3RoXG4gICAgICB9O1xuICAgICAgY29uc3QgbmV0d29yayA9IG5ldHdvcmtGb3JtYXQoc2VuZGVyLCBkZWYuU1RPUkVfQ0hVTktTLCBzZW5kRGF0YSk7XG4gICAgICBwZWVycy5mb3JFYWNoKHBlZXIgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZyhkZWYuU1RPUkUsIFwibmV4dFwiLCBwZWVyLm5vZGVJZCwgXCJ0YXJnZXRcIiwga2V5KTtcbiAgICAgICAgcGVlci5zZW5kKG5ldHdvcmssIFwia2FkXCIpO1xuICAgICAgfSk7XG4gICAgICB0aGlzLmtleVZhbHVlTGlzdFtrZXldID0gY2h1bmtzO1xuICAgIH0pO1xuICB9XG5cbiAgZmluZE5vZGUodGFyZ2V0SWQ6IHN0cmluZywgcGVlcjogV2ViUlRDKSB7XG4gICAgY29uc29sZS5sb2coXCJmaW5kbm9kZVwiLCB0YXJnZXRJZCk7XG4gICAgdGhpcy5zdGF0ZS5maW5kTm9kZSA9IHRhcmdldElkO1xuICAgIGNvbnN0IHNlbmREYXRhID0geyB0YXJnZXRLZXk6IHRhcmdldElkIH07XG4gICAgLy/pgIHjgotcbiAgICBwZWVyLnNlbmQobmV0d29ya0Zvcm1hdCh0aGlzLm5vZGVJZCwgZGVmLkZJTkROT0RFLCBzZW5kRGF0YSksIFwia2FkXCIpO1xuXG4gICAgdGhpcy5jYWxsYmFjay5fb25GaW5kTm9kZSgobm9kZUlkOiBzdHJpbmcpID0+IHtcbiAgICAgIGV4Y3V0ZUV2ZW50KHRoaXMuZXZlbnRzLmZpbmRub2RlLCBub2RlSWQpO1xuICAgIH0pO1xuICB9XG5cbiAgZmluZFZhbHVlKGtleTogc3RyaW5nLCBvcHQ/OiB7IG93bmVySWQ/OiBzdHJpbmcgfSkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZTxhbnk+KGFzeW5jIChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIHRoaXMuY2FsbGJhY2suX29uRmluZFZhbHVlID0gdmFsdWUgPT4ge1xuICAgICAgICBleGN1dGVFdmVudCh0aGlzLmV2ZW50cy5maW5kdmFsdWUsIHZhbHVlKTtcbiAgICAgICAgcmVzb2x2ZSh2YWx1ZSk7XG4gICAgICB9O1xuICAgICAgLy9rZXnjgavov5HjgYTjg5TjgqLjgpLlj5blvpdcbiAgICAgIGNvbnN0IHBlZXJzID0gdGhpcy5mLmdldENsb3NlUGVlcnMoa2V5KTtcbiAgICAgIHBlZXJzLmZvckVhY2gocGVlciA9PiB7XG4gICAgICAgIHRoaXMuZG9GaW5kdmFsdWUoa2V5LCBwZWVyKTtcbiAgICAgIH0pO1xuXG4gICAgICBhd2FpdCBuZXcgUHJvbWlzZShyID0+IHNldFRpbWVvdXQociwgNTAwMCkpO1xuICAgICAgaWYgKG9wdCAmJiBvcHQub3duZXJJZCkge1xuICAgICAgICBjb25zdCBvd25lcklkID0gb3B0Lm93bmVySWQ7XG4gICAgICAgIGNvbnN0IHBlZXJzID0gdGhpcy5mLmdldENsb3NlUGVlcnMob3duZXJJZCk7XG4gICAgICAgIHBlZXJzLmZvckVhY2gocGVlciA9PiB7XG4gICAgICAgICAgdGhpcy5kb0ZpbmR2YWx1ZShvd25lcklkLCBwZWVyKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGF3YWl0IG5ldyBQcm9taXNlKHIgPT4gc2V0VGltZW91dChyLCA1MDAwKSk7XG4gICAgICB9XG4gICAgICByZWplY3QoXCJmaW5kdmFsdWUgdGltZW91dFwiKTtcbiAgICB9KTtcbiAgfVxuXG4gIGFzeW5jIGRvRmluZHZhbHVlKGtleTogc3RyaW5nLCBwZWVyOiBXZWJSVEMpIHtcbiAgICBjb25zb2xlLmxvZyhcImRvZmluZHZhbHVlXCIsIHBlZXIubm9kZUlkKTtcbiAgICBjb25zdCBzZW5kRGF0YTogRmluZFZhbHVlID0geyB0YXJnZXRLZXk6IGtleSB9O1xuICAgIHBlZXIuc2VuZChuZXR3b3JrRm9ybWF0KHRoaXMubm9kZUlkLCBkZWYuRklORFZBTFVFLCBzZW5kRGF0YSksIFwia2FkXCIpO1xuICB9XG5cbiAgY29ubmVjdChwZWVyOiBXZWJSVEMpIHtcbiAgICBjb25zb2xlLmxvZyhcImthZCBjb25uZWN0XCIpO1xuICAgIGlmICh0aGlzLnN0YXRlLmlzRmlyc3RDb25uZWN0KSB0aGlzLmNhbGxiYWNrLm9uQ29ubmVjdCgpO1xuICAgIHRoaXMuc3RhdGUuaXNGaXJzdENvbm5lY3QgPSBmYWxzZTtcbiAgICB0aGlzLmFkZGtub2RlKHBlZXIpO1xuICB9XG5cbiAgYWRka25vZGUocGVlcjogV2ViUlRDKSB7XG4gICAgcGVlci5ldmVudHMuZGF0YVtcImthZGVtbGlhLnRzXCJdID0gcmF3ID0+IHtcbiAgICAgIHRoaXMub25Db21tYW5kKHJhdyk7XG4gICAgfTtcblxuICAgIHBlZXIuZGlzY29ubmVjdCA9ICgpID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKFwia2FkIG5vZGUgZGlzY29ubmVjdGVkXCIpO1xuICAgICAgdGhpcy5mLmNsZWFuRGlzY29uKCk7XG4gICAgICB0aGlzLmNhbGxiYWNrLm9uQWRkUGVlcih0aGlzLmYuZ2V0QWxsUGVlcklkcygpKTtcbiAgICB9O1xuXG4gICAgaWYgKCF0aGlzLmYuaXNOb2RlRXhpc3QocGVlci5ub2RlSWQpKSB7XG4gICAgICAvL+iHquWIhuOBruODjuODvOODiUlE44Go6L+95Yqg44GZ44KL44OO44O844OJSUTjga7ot53pm6JcbiAgICAgIGNvbnN0IG51bSA9IGRpc3RhbmNlKHRoaXMubm9kZUlkLCBwZWVyLm5vZGVJZCk7XG4gICAgICAvL2tidWNrZXRz44Gu6Kmy5b2T44GZ44KL6Led6Zui44Gua2J1Y2tldOOCkuWRvOOBs+WHuuOBmVxuICAgICAgY29uc3Qga2J1Y2tldCA9IHRoaXMua2J1Y2tldHNbbnVtXTtcbiAgICAgIC8v6Kmy5b2T44GZ44KLa2J1Y2tldOOBq+aWsOOBl+OBhOODlOOCouOCkuWKoOOBiOOCi1xuICAgICAga2J1Y2tldC5wdXNoKHBlZXIpO1xuXG4gICAgICBjb25zb2xlLmxvZyhcImFkZGtub2RlIGtidWNrZXRzXCIsIFwicGVlci5ub2RlSWQ6XCIsIHBlZXIubm9kZUlkKTtcbiAgICAgIGNvbnNvbGUubG9nKHRoaXMuZi5nZXRBbGxQZWVySWRzKCkpO1xuXG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgdGhpcy5maW5kTmV3UGVlcihwZWVyKTtcbiAgICAgIH0sIDEwMDApO1xuXG4gICAgICB0aGlzLmNhbGxiYWNrLm9uQWRkUGVlcih0aGlzLmYuZ2V0QWxsUGVlcklkcygpKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGZpbmROZXdQZWVyKHBlZXI6IFdlYlJUQykge1xuICAgIGlmICh0aGlzLmYuZ2V0S2J1Y2tldE51bSgpIDwgdGhpcy5rKSB7XG4gICAgICAvL+iHqui6q+OBruODjuODvOODiUlE44KSa2V544Go44GX44GmRklORF9OT0RFXG4gICAgICB0aGlzLmZpbmROb2RlKHRoaXMubm9kZUlkLCBwZWVyKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5sb2coXCJrYnVja2V0IHJlYWR5XCIsIHRoaXMuZi5nZXRLYnVja2V0TnVtKCkpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgbWFpbnRhaW4obmV0d29yazogYW55KSB7XG4gICAgY29uc3QgaW54ID0gZGlzdGFuY2UodGhpcy5ub2RlSWQsIG5ldHdvcmsubm9kZUlkKTtcbiAgICBjb25zdCBrYnVja2V0ID0gdGhpcy5rYnVja2V0c1tpbnhdO1xuXG4gICAgLy/pgIHkv6HlhYPjgYzoqbLlvZPjgZnjgotrLWJ1Y2tldOOBruS4reOBq+OBguOBo+OBn+WgtOWQiFxuICAgIC8v44Gd44Gu44OO44O844OJ44KSay1idWNrZXTjga7mnKvlsL7jgavnp7vjgZlcbiAgICBrYnVja2V0LmZvckVhY2goKHBlZXIsIGkpID0+IHtcbiAgICAgIGlmIChwZWVyLm5vZGVJZCA9PT0gbmV0d29yay5ub2RlSWQpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJtYWludGFpblwiLCBcIk1vdmVzwqBpdMKgdG/CoHRoZcKgdGFpbMKgb2bCoHRoZcKgbGlzdFwiKTtcbiAgICAgICAga2J1Y2tldC5zcGxpY2UoaSwgMSk7XG4gICAgICAgIGtidWNrZXQucHVzaChwZWVyKTtcbiAgICAgICAgcmV0dXJuIDA7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvL2stYnVja2V044GM44GZ44Gn44Gr5rqA5p2v44Gq5aC05ZCI44CBXG4gICAgLy/jgZ3jga5rLWJ1Y2tldOS4reOBruWFiOmgreOBruODjuODvOODieOBjOOCquODs+ODqeOCpOODs+OBquOCieWFiOmgreOBruODjuODvOODieOCkuaui+OBmVxuICAgIGlmIChrYnVja2V0Lmxlbmd0aCA+IHRoaXMuaykge1xuICAgICAga2J1Y2tldC5zaGlmdCgpO1xuICAgIH1cbiAgfVxuXG4gIG9mZmVyKHRhcmdldDogc3RyaW5nLCBwcm94eSA9IG51bGwpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY29uc3QgciA9IHRoaXMucmVmO1xuICAgICAgY29uc3QgcGVlciA9IChyW3RhcmdldF0gPSBuZXcgV2ViUlRDKCkpO1xuICAgICAgcGVlci5tYWtlT2ZmZXIoKTtcblxuICAgICAgY29uc3QgdGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICByZWplY3QoXCJrYWQgb2ZmZXIgdGltZW91dFwiKTtcbiAgICAgIH0sIDUgKiAxMDAwKTtcblxuICAgICAgcGVlci5zaWduYWwgPSBzZHAgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZyhcImthZCBvZmZlciBzdG9yZVwiLCB0YXJnZXQpO1xuICAgICAgICBjb25zdCBfID0gdGhpcy5mLmdldENsb3NlRXN0UGVlcih0YXJnZXQpO1xuICAgICAgICBpZiAoIV8pIHJldHVybjtcbiAgICAgICAgaWYgKF8ubm9kZUlkICE9PSB0YXJnZXQpXG4gICAgICAgICAgdGhpcy5zdG9yZSh0aGlzLm5vZGVJZCwgdGFyZ2V0LCB7IHNkcCwgcHJveHkgfSk7XG4gICAgICB9O1xuXG4gICAgICBwZWVyLmNvbm5lY3QgPSAoKSA9PiB7XG4gICAgICAgIHBlZXIubm9kZUlkID0gdGFyZ2V0O1xuICAgICAgICBjb25zb2xlLmxvZyhcImthZCBvZmZlciBjb25uZWN0ZWRcIiwgdGFyZ2V0KTtcbiAgICAgICAgdGhpcy5hZGRrbm9kZShwZWVyKTtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xuICAgICAgICByZXNvbHZlKHRydWUpO1xuICAgICAgfTtcbiAgICB9KTtcbiAgfVxuXG4gIGFuc3dlcih0YXJnZXQ6IHN0cmluZywgc2RwOiBzdHJpbmcsIHByb3h5OiBzdHJpbmcpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY29uc3QgciA9IHRoaXMucmVmO1xuICAgICAgY29uc3QgcGVlciA9IChyW3RhcmdldF0gPSBuZXcgV2ViUlRDKCkpO1xuICAgICAgcGVlci5tYWtlQW5zd2VyKHNkcCk7XG4gICAgICBjb25zb2xlLmxvZyhcImthZCBhbnN3ZXJcIiwgdGFyZ2V0KTtcblxuICAgICAgY29uc3QgdGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICByZWplY3QoXCJrYWQgYW5zd2VyIHRpbWVvdXRcIik7XG4gICAgICB9LCA1ICogMTAwMCk7XG5cbiAgICAgIHBlZXIuc2lnbmFsID0gc2RwID0+IHtcbiAgICAgICAgY29uc3QgXyA9IHRoaXMuZi5nZXRQZWVyRnJvbW5vZGVJZChwcm94eSk7XG4gICAgICAgIC8v5p2l44Gf44Or44O844OI44Gr6YCB44KK6L+U44GZXG4gICAgICAgIGNvbnN0IHNlbmREYXRhOiBTdG9yZUZvcm1hdCA9IHtcbiAgICAgICAgICBzZW5kZXI6IHRoaXMubm9kZUlkLFxuICAgICAgICAgIGtleTogdGFyZ2V0LFxuICAgICAgICAgIHZhbHVlOiB7IHNkcCB9XG4gICAgICAgIH07XG4gICAgICAgIGlmIChfKSBfLnNlbmQobmV0d29ya0Zvcm1hdCh0aGlzLm5vZGVJZCwgZGVmLlNUT1JFLCBzZW5kRGF0YSksIFwia2FkXCIpO1xuICAgICAgfTtcblxuICAgICAgcGVlci5jb25uZWN0ID0gKCkgPT4ge1xuICAgICAgICBwZWVyLm5vZGVJZCA9IHRhcmdldDtcbiAgICAgICAgY29uc29sZS5sb2coXCJrYWQgYW5zd2VyIGNvbm5lY3RlZFwiLCB0YXJnZXQpO1xuICAgICAgICB0aGlzLmFkZGtub2RlKHBlZXIpO1xuICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dCk7XG4gICAgICAgIHJlc29sdmUodHJ1ZSk7XG4gICAgICB9O1xuICAgIH0pO1xuICB9XG5cbiAgc2VuZCh0YXJnZXQ6IHN0cmluZywgZGF0YTogYW55KSB7XG4gICAgY29uc3QgXyA9IHRoaXMuZi5nZXRQZWVyRnJvbW5vZGVJZCh0YXJnZXQpO1xuICAgIGlmIChfKSBfLnNlbmQobmV0d29ya0Zvcm1hdCh0aGlzLm5vZGVJZCwgZGVmLlNFTkQsIGRhdGEpLCBcImthZFwiKTtcbiAgfVxuXG4gIHByaXZhdGUgb25Db21tYW5kKG1lc3NhZ2U6IG1lc3NhZ2UpIHtcbiAgICBzd2l0Y2ggKG1lc3NhZ2UubGFiZWwpIHtcbiAgICAgIGNhc2UgXCJrYWRcIjpcbiAgICAgICAgY29uc3QgYnVmZmVyOiBCdWZmZXIgPSBCdWZmZXIuZnJvbShtZXNzYWdlLmRhdGEpO1xuICAgICAgICBjb25zb2xlLmxvZyh7IGJ1ZmZlciB9KTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhcIm9uY29tbWFuZCBrYWRcIiwgeyBtZXNzYWdlIH0pO1xuICAgICAgICAgIGNvbnN0IG5ldHdvcmtMYXllcjogbmV0d29yayA9IGJzb24uZGVzZXJpYWxpemUoYnVmZmVyKTtcbiAgICAgICAgICBpZiAoIUpTT04uc3RyaW5naWZ5KHRoaXMuZGF0YUxpc3QpLmluY2x1ZGVzKG5ldHdvcmtMYXllci5oYXNoKSkge1xuICAgICAgICAgICAgdGhpcy5kYXRhTGlzdC5wdXNoKG5ldHdvcmtMYXllci5oYXNoKTtcbiAgICAgICAgICAgIHRoaXMub25SZXF1ZXN0KG5ldHdvcmtMYXllcik7XG4gICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yKTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIG9uUmVxdWVzdChuZXR3b3JrOiBhbnkpIHtcbiAgICB0aGlzLnJlc3BvbmRlci5yZXNwb25zZShuZXR3b3JrLnR5cGUsIG5ldHdvcmspO1xuICAgIHRoaXMubWFpbnRhaW4obmV0d29yayk7XG4gIH1cbn1cbiJdfQ==
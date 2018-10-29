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
      var _this = this;

      //自分に一番近いピアを取得
      var peers = this.f.getClosePeers(key);
      peers.forEach(function (peer) {
        console.log(_KConst.default.STORE, "next", peer.nodeId, "target", key);
        var sendData = {
          sender: sender,
          key: key,
          value: value
        };
        var network = (0, _KConst.networkFormat)(_this.nodeId, _KConst.default.STORE, sendData);
        peer.send(network, "kad");
      });
      this.keyValueList[key] = value;
    }
  }, {
    key: "storeChunks",
    value: function storeChunks(sender, key, chunks) {
      var _this2 = this;

      var peer = this.f.getCloseEstPeer(key);
      if (!peer) return;
      chunks.forEach(function (chunk, i) {
        var sendData = {
          sender: _this2.nodeId,
          key: key,
          value: chunk,
          index: i,
          size: chunks.length
        };
        var network = (0, _KConst.networkFormat)(sender, _KConst.default.STORE_CHUNKS, sendData);
        peer.send(network, "kad");
        _this2.keyValueList[key] = chunks;
      });
    }
  }, {
    key: "findNode",
    value: function findNode(targetId, peer) {
      var _this3 = this;

      console.log("findnode", targetId);
      this.state.findNode = targetId;
      var sendData = {
        targetKey: targetId
      }; //送る

      peer.send((0, _KConst.networkFormat)(this.nodeId, _KConst.default.FINDNODE, sendData), "kad");

      this.callback._onFindNode(function (nodeId) {
        excuteEvent(_this3.events.findnode, nodeId);
      });
    }
  }, {
    key: "findValue",
    value: function findValue(key, opt) {
      var _this4 = this;

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
                  _this4.callback._onFindValue = function (value) {
                    excuteEvent(_this4.events.findvalue, value);
                    resolve(value);
                  }; //keyに近いピアを取得


                  peers = _this4.f.getClosePeers(key);
                  peers.forEach(function (peer) {
                    _this4.doFindvalue(key, peer);
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
                  _peers = _this4.f.getClosePeers(_ownerId);

                  _peers.forEach(function (peer) {
                    _this4.doFindvalue(_ownerId, peer);
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
      var _this5 = this;

      peer.events.data["kademlia.ts"] = function (raw) {
        _this5.onCommand(raw);
      };

      peer.disconnect = function () {
        console.log("kad node disconnected");

        _this5.f.cleanDiscon();

        _this5.callback.onAddPeer(_this5.f.getAllPeerIds());
      };

      if (!this.f.isNodeExist(peer.nodeId)) {
        //自分のノードIDと追加するノードIDの距離
        var num = (0, _kadDistance.distance)(this.nodeId, peer.nodeId); //kbucketsの該当する距離のkbucketを呼び出す

        var kbucket = this.kbuckets[num]; //該当するkbucketに新しいピアを加える

        kbucket.push(peer);
        console.log("addknode kbuckets", "peer.nodeId:", peer.nodeId);
        console.log(this.f.getAllPeerIds());
        setTimeout(function () {
          _this5.findNewPeer(peer);
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
      var _this6 = this;

      var proxy = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      return new Promise(function (resolve, reject) {
        var r = _this6.ref;
        var peer = r[target] = new _webrtc4me.default();
        peer.makeOffer();
        var timeout = setTimeout(function () {
          reject("kad offer timeout");
        }, 5 * 1000);

        peer.signal = function (sdp) {
          console.log("kad offer store", target);

          var _ = _this6.f.getCloseEstPeer(target);

          if (!_) return;
          if (_.nodeId !== target) _this6.store(_this6.nodeId, target, {
            sdp: sdp,
            proxy: proxy
          });
        };

        peer.connect = function () {
          peer.nodeId = target;
          console.log("kad offer connected", target);

          _this6.addknode(peer);

          clearTimeout(timeout);
          resolve(true);
        };
      });
    }
  }, {
    key: "answer",
    value: function answer(target, sdp, proxy) {
      var _this7 = this;

      return new Promise(function (resolve, reject) {
        var r = _this7.ref;
        var peer = r[target] = new _webrtc4me.default();
        peer.makeAnswer(sdp);
        console.log("kad answer", target);
        var timeout = setTimeout(function () {
          reject("kad answer timeout");
        }, 5 * 1000);

        peer.signal = function (sdp) {
          var _ = _this7.f.getPeerFromnodeId(proxy); //来たルートに送り返す


          var sendData = {
            sender: _this7.nodeId,
            key: target,
            value: {
              sdp: sdp
            }
          };
          if (_) _.send((0, _KConst.networkFormat)(_this7.nodeId, _KConst.default.STORE, sendData), "kad");
        };

        peer.connect = function () {
          peer.nodeId = target;
          console.log("kad answer connected", target);

          _this7.addknode(peer);

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9rYWQva2FkZW1saWEudHMiXSwibmFtZXMiOlsicmVxdWlyZSIsImJzb24iLCJCU09OIiwiZXhjdXRlRXZlbnQiLCJldiIsInYiLCJjb25zb2xlIiwibG9nIiwiT2JqZWN0Iiwia2V5cyIsImZvckVhY2giLCJrZXkiLCJLYWRlbWxpYSIsIl9ub2RlSWQiLCJvcHQiLCJpc0ZpcnN0Q29ubmVjdCIsImlzT2ZmZXIiLCJmaW5kTm9kZSIsImhhc2giLCJvbkNvbm5lY3QiLCJvbkFkZFBlZXIiLCJvblBlZXJEaXNjb25uZWN0IiwiX29uRmluZFZhbHVlIiwiX29uRmluZE5vZGUiLCJvbkFwcCIsInN0b3JlIiwib25TdG9yZSIsImZpbmR2YWx1ZSIsIm9uRmluZFZhbHVlIiwiZmluZG5vZGUiLCJvbkZpbmROb2RlIiwiayIsImtMZW5ndGgiLCJub2RlSWQiLCJrYnVja2V0cyIsIkFycmF5IiwiaSIsImtidWNrZXQiLCJmIiwiSGVscGVyIiwicmVzcG9uZGVyIiwiS1Jlc3BvbmRlciIsInNlbmRlciIsInZhbHVlIiwicGVlcnMiLCJnZXRDbG9zZVBlZXJzIiwicGVlciIsImRlZiIsIlNUT1JFIiwic2VuZERhdGEiLCJuZXR3b3JrIiwic2VuZCIsImtleVZhbHVlTGlzdCIsImNodW5rcyIsImdldENsb3NlRXN0UGVlciIsImNodW5rIiwiaW5kZXgiLCJzaXplIiwibGVuZ3RoIiwiU1RPUkVfQ0hVTktTIiwidGFyZ2V0SWQiLCJzdGF0ZSIsInRhcmdldEtleSIsIkZJTkROT0RFIiwiY2FsbGJhY2siLCJldmVudHMiLCJQcm9taXNlIiwicmVzb2x2ZSIsInJlamVjdCIsImRvRmluZHZhbHVlIiwiciIsInNldFRpbWVvdXQiLCJvd25lcklkIiwiRklORFZBTFVFIiwiYWRka25vZGUiLCJkYXRhIiwicmF3Iiwib25Db21tYW5kIiwiZGlzY29ubmVjdCIsImNsZWFuRGlzY29uIiwiZ2V0QWxsUGVlcklkcyIsImlzTm9kZUV4aXN0IiwibnVtIiwicHVzaCIsImZpbmROZXdQZWVyIiwiZ2V0S2J1Y2tldE51bSIsImlueCIsInNwbGljZSIsInNoaWZ0IiwidGFyZ2V0IiwicHJveHkiLCJyZWYiLCJXZWJSVEMiLCJtYWtlT2ZmZXIiLCJ0aW1lb3V0Iiwic2lnbmFsIiwic2RwIiwiXyIsImNvbm5lY3QiLCJjbGVhclRpbWVvdXQiLCJtYWtlQW5zd2VyIiwiZ2V0UGVlckZyb21ub2RlSWQiLCJTRU5EIiwibWVzc2FnZSIsImxhYmVsIiwiYnVmZmVyIiwiQnVmZmVyIiwiZnJvbSIsIm5ldHdvcmtMYXllciIsImRlc2VyaWFsaXplIiwiSlNPTiIsInN0cmluZ2lmeSIsImRhdGFMaXN0IiwiaW5jbHVkZXMiLCJvblJlcXVlc3QiLCJlcnJvciIsInJlc3BvbnNlIiwidHlwZSIsIm1haW50YWluIl0sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUVBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFQQUEsT0FBTyxDQUFDLGdCQUFELENBQVA7O0FBU0EsSUFBTUMsSUFBSSxHQUFHLElBQUlDLFVBQUosRUFBYjs7QUFDTyxTQUFTQyxXQUFULENBQXFCQyxFQUFyQixFQUE4QkMsQ0FBOUIsRUFBdUM7QUFDNUNDLEVBQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZLGFBQVosRUFBMkJILEVBQTNCO0FBQ0FJLEVBQUFBLE1BQU0sQ0FBQ0MsSUFBUCxDQUFZTCxFQUFaLEVBQWdCTSxPQUFoQixDQUF3QixVQUFBQyxHQUFHLEVBQUk7QUFDN0JQLElBQUFBLEVBQUUsQ0FBQ08sR0FBRCxDQUFGLENBQVFOLENBQVI7QUFDRCxHQUZEO0FBR0Q7O0lBRW9CTyxROzs7QUFtQ25CLG9CQUFZQyxPQUFaLEVBQTZCQyxHQUE3QixFQUF5RDtBQUFBOztBQUFBOztBQUFBOztBQUFBOztBQUFBOztBQUFBOztBQUFBLHNDQTdCbEMsRUE2QmtDOztBQUFBLDBDQTVCbEIsRUE0QmtCOztBQUFBLGlDQTNCeEIsRUEyQndCOztBQUFBLG9DQTFCakIsRUEwQmlCOztBQUFB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O0FBQ2Q3RyxZQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWTRHLEtBQVo7QUFDRDs7QUFDRDtBQWRKO0FBZ0JEOzs7OEJBRWlCakUsTyxFQUFjO0FBQzlCLFdBQUtWLFNBQUwsQ0FBZTRFLFFBQWYsQ0FBd0JsRSxPQUFPLENBQUNtRSxJQUFoQyxFQUFzQ25FLE9BQXRDO0FBQ0EsV0FBS29FLFFBQUwsQ0FBY3BFLE9BQWQ7QUFDRCIsInNvdXJjZXNDb250ZW50IjpbInJlcXVpcmUoXCJiYWJlbC1wb2x5ZmlsbFwiKTtcbmltcG9ydCBXZWJSVEMgZnJvbSBcIndlYnJ0YzRtZVwiO1xuaW1wb3J0IEhlbHBlciBmcm9tIFwiLi9rVXRpbFwiO1xuaW1wb3J0IEtSZXNwb25kZXIgZnJvbSBcIi4va1Jlc3BvbmRlclwiO1xuaW1wb3J0IGRlZiwgeyBuZXR3b3JrRm9ybWF0IH0gZnJvbSBcIi4vS0NvbnN0XCI7XG5pbXBvcnQgeyBkaXN0YW5jZSB9IGZyb20gXCJrYWQtZGlzdGFuY2VcIjtcbmltcG9ydCB7IG1lc3NhZ2UgfSBmcm9tIFwid2VicnRjNG1lL2xpYi9pbnRlcmZhY2VcIjtcbmltcG9ydCB7IEJTT04gfSBmcm9tIFwiYnNvblwiO1xuXG5jb25zdCBic29uID0gbmV3IEJTT04oKTtcbmV4cG9ydCBmdW5jdGlvbiBleGN1dGVFdmVudChldjogYW55LCB2PzogYW55KSB7XG4gIGNvbnNvbGUubG9nKFwiZXhjdXRlRXZlbnRcIiwgZXYpO1xuICBPYmplY3Qua2V5cyhldikuZm9yRWFjaChrZXkgPT4ge1xuICAgIGV2W2tleV0odik7XG4gIH0pO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBLYWRlbWxpYSB7XG4gIG5vZGVJZDogc3RyaW5nO1xuICBrOiBudW1iZXI7XG4gIGtidWNrZXRzOiBBcnJheTxBcnJheTxXZWJSVEM+PjtcbiAgZjogSGVscGVyO1xuICByZXNwb25kZXI6IEtSZXNwb25kZXI7XG4gIGRhdGFMaXN0OiBBcnJheTxhbnk+ID0gW107XG4gIGtleVZhbHVlTGlzdDogeyBba2V5OiBzdHJpbmddOiBhbnkgfSA9IHt9O1xuICByZWY6IHsgW2tleTogc3RyaW5nXTogV2ViUlRDIH0gPSB7fTtcbiAgYnVmZmVyOiB7IFtrZXk6IHN0cmluZ106IEFycmF5PGFueT4gfSA9IHt9O1xuICBzdGF0ZSA9IHtcbiAgICBpc0ZpcnN0Q29ubmVjdDogdHJ1ZSxcbiAgICBpc09mZmVyOiBmYWxzZSxcbiAgICBmaW5kTm9kZTogXCJcIixcbiAgICBoYXNoOiB7fVxuICB9O1xuXG4gIGNhbGxiYWNrID0ge1xuICAgIG9uQ29ubmVjdDogKCkgPT4ge30sXG4gICAgb25BZGRQZWVyOiAodj86IGFueSkgPT4ge30sXG4gICAgb25QZWVyRGlzY29ubmVjdDogKHY/OiBhbnkpID0+IHt9LFxuICAgIF9vbkZpbmRWYWx1ZTogKHY/OiBhbnkpID0+IHt9LFxuICAgIF9vbkZpbmROb2RlOiAodj86IGFueSkgPT4ge30sXG4gICAgb25BcHA6ICh2PzogYW55KSA9PiB7fVxuICB9O1xuXG4gIG9uU3RvcmU6IHsgW2tleTogc3RyaW5nXTogKHY6IGFueSkgPT4gdm9pZCB9ID0ge307XG4gIG9uRmluZFZhbHVlOiB7IFtrZXk6IHN0cmluZ106ICh2OiBhbnkpID0+IHZvaWQgfSA9IHt9O1xuICBvbkZpbmROb2RlOiB7IFtrZXk6IHN0cmluZ106ICh2OiBhbnkpID0+IHZvaWQgfSA9IHt9O1xuICBldmVudHMgPSB7XG4gICAgc3RvcmU6IHRoaXMub25TdG9yZSxcbiAgICBmaW5kdmFsdWU6IHRoaXMub25GaW5kVmFsdWUsXG4gICAgZmluZG5vZGU6IHRoaXMub25GaW5kTm9kZVxuICB9O1xuXG4gIGNvbnN0cnVjdG9yKF9ub2RlSWQ6IHN0cmluZywgb3B0PzogeyBrTGVuZ3RoPzogbnVtYmVyIH0pIHtcbiAgICBjb25zb2xlLmxvZyhcInN0YXJ0IGthZFwiLCBfbm9kZUlkKTtcbiAgICB0aGlzLmsgPSAyMDtcbiAgICBpZiAob3B0KSBpZiAob3B0LmtMZW5ndGgpIHRoaXMuayA9IG9wdC5rTGVuZ3RoO1xuICAgIHRoaXMubm9kZUlkID0gX25vZGVJZDtcblxuICAgIHRoaXMua2J1Y2tldHMgPSBuZXcgQXJyYXkoMTYwKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IDE2MDsgaSsrKSB7XG4gICAgICBsZXQga2J1Y2tldDogQXJyYXk8YW55PiA9IFtdO1xuICAgICAgdGhpcy5rYnVja2V0c1tpXSA9IGtidWNrZXQ7XG4gICAgfVxuXG4gICAgdGhpcy5mID0gbmV3IEhlbHBlcih0aGlzLmssIHRoaXMua2J1Y2tldHMpO1xuICAgIHRoaXMucmVzcG9uZGVyID0gbmV3IEtSZXNwb25kZXIodGhpcyk7XG4gIH1cblxuICBzdG9yZShzZW5kZXI6IHN0cmluZywga2V5OiBzdHJpbmcsIHZhbHVlOiBhbnkpIHtcbiAgICAvL+iHquWIhuOBq+S4gOeVqui/keOBhOODlOOCouOCkuWPluW+l1xuICAgIGNvbnN0IHBlZXJzID0gdGhpcy5mLmdldENsb3NlUGVlcnMoa2V5KTtcbiAgICBwZWVycy5mb3JFYWNoKHBlZXIgPT4ge1xuICAgICAgY29uc29sZS5sb2coZGVmLlNUT1JFLCBcIm5leHRcIiwgcGVlci5ub2RlSWQsIFwidGFyZ2V0XCIsIGtleSk7XG4gICAgICBjb25zdCBzZW5kRGF0YTogU3RvcmVGb3JtYXQgPSB7IHNlbmRlciwga2V5LCB2YWx1ZSB9O1xuICAgICAgY29uc3QgbmV0d29yayA9IG5ldHdvcmtGb3JtYXQodGhpcy5ub2RlSWQsIGRlZi5TVE9SRSwgc2VuZERhdGEpO1xuICAgICAgcGVlci5zZW5kKG5ldHdvcmssIFwia2FkXCIpO1xuICAgIH0pO1xuICAgIHRoaXMua2V5VmFsdWVMaXN0W2tleV0gPSB2YWx1ZTtcbiAgfVxuXG4gIHN0b3JlQ2h1bmtzKHNlbmRlcjogc3RyaW5nLCBrZXk6IHN0cmluZywgY2h1bmtzOiBBcnJheUJ1ZmZlcltdKSB7XG4gICAgY29uc3QgcGVlciA9IHRoaXMuZi5nZXRDbG9zZUVzdFBlZXIoa2V5KTtcbiAgICBpZiAoIXBlZXIpIHJldHVybjtcbiAgICBjaHVua3MuZm9yRWFjaCgoY2h1bmssIGkpID0+IHtcbiAgICAgIGNvbnN0IHNlbmREYXRhOiBTdG9yZUNodW5rcyA9IHtcbiAgICAgICAgc2VuZGVyOiB0aGlzLm5vZGVJZCxcbiAgICAgICAga2V5LFxuICAgICAgICB2YWx1ZTogY2h1bmssXG4gICAgICAgIGluZGV4OiBpLFxuICAgICAgICBzaXplOiBjaHVua3MubGVuZ3RoXG4gICAgICB9O1xuICAgICAgY29uc3QgbmV0d29yayA9IG5ldHdvcmtGb3JtYXQoc2VuZGVyLCBkZWYuU1RPUkVfQ0hVTktTLCBzZW5kRGF0YSk7XG4gICAgICBwZWVyLnNlbmQobmV0d29yaywgXCJrYWRcIik7XG4gICAgICB0aGlzLmtleVZhbHVlTGlzdFtrZXldID0gY2h1bmtzO1xuICAgIH0pO1xuICB9XG5cbiAgZmluZE5vZGUodGFyZ2V0SWQ6IHN0cmluZywgcGVlcjogV2ViUlRDKSB7XG4gICAgY29uc29sZS5sb2coXCJmaW5kbm9kZVwiLCB0YXJnZXRJZCk7XG4gICAgdGhpcy5zdGF0ZS5maW5kTm9kZSA9IHRhcmdldElkO1xuICAgIGNvbnN0IHNlbmREYXRhID0geyB0YXJnZXRLZXk6IHRhcmdldElkIH07XG4gICAgLy/pgIHjgotcbiAgICBwZWVyLnNlbmQobmV0d29ya0Zvcm1hdCh0aGlzLm5vZGVJZCwgZGVmLkZJTkROT0RFLCBzZW5kRGF0YSksIFwia2FkXCIpO1xuXG4gICAgdGhpcy5jYWxsYmFjay5fb25GaW5kTm9kZSgobm9kZUlkOiBzdHJpbmcpID0+IHtcbiAgICAgIGV4Y3V0ZUV2ZW50KHRoaXMuZXZlbnRzLmZpbmRub2RlLCBub2RlSWQpO1xuICAgIH0pO1xuICB9XG5cbiAgZmluZFZhbHVlKGtleTogc3RyaW5nLCBvcHQ/OiB7IG93bmVySWQ/OiBzdHJpbmcgfSkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZTxhbnk+KGFzeW5jIChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIHRoaXMuY2FsbGJhY2suX29uRmluZFZhbHVlID0gdmFsdWUgPT4ge1xuICAgICAgICBleGN1dGVFdmVudCh0aGlzLmV2ZW50cy5maW5kdmFsdWUsIHZhbHVlKTtcbiAgICAgICAgcmVzb2x2ZSh2YWx1ZSk7XG4gICAgICB9O1xuICAgICAgLy9rZXnjgavov5HjgYTjg5TjgqLjgpLlj5blvpdcbiAgICAgIGNvbnN0IHBlZXJzID0gdGhpcy5mLmdldENsb3NlUGVlcnMoa2V5KTtcbiAgICAgIHBlZXJzLmZvckVhY2gocGVlciA9PiB7XG4gICAgICAgIHRoaXMuZG9GaW5kdmFsdWUoa2V5LCBwZWVyKTtcbiAgICAgIH0pO1xuXG4gICAgICBhd2FpdCBuZXcgUHJvbWlzZShyID0+IHNldFRpbWVvdXQociwgNTAwMCkpO1xuICAgICAgaWYgKG9wdCAmJiBvcHQub3duZXJJZCkge1xuICAgICAgICBjb25zdCBvd25lcklkID0gb3B0Lm93bmVySWQ7XG4gICAgICAgIGNvbnN0IHBlZXJzID0gdGhpcy5mLmdldENsb3NlUGVlcnMob3duZXJJZCk7XG4gICAgICAgIHBlZXJzLmZvckVhY2gocGVlciA9PiB7XG4gICAgICAgICAgdGhpcy5kb0ZpbmR2YWx1ZShvd25lcklkLCBwZWVyKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGF3YWl0IG5ldyBQcm9taXNlKHIgPT4gc2V0VGltZW91dChyLCA1MDAwKSk7XG4gICAgICB9XG4gICAgICByZWplY3QoXCJmaW5kdmFsdWUgdGltZW91dFwiKTtcbiAgICB9KTtcbiAgfVxuXG4gIGFzeW5jIGRvRmluZHZhbHVlKGtleTogc3RyaW5nLCBwZWVyOiBXZWJSVEMpIHtcbiAgICBjb25zb2xlLmxvZyhcImRvZmluZHZhbHVlXCIsIHBlZXIubm9kZUlkKTtcbiAgICBjb25zdCBzZW5kRGF0YTogRmluZFZhbHVlID0geyB0YXJnZXRLZXk6IGtleSB9O1xuICAgIHBlZXIuc2VuZChuZXR3b3JrRm9ybWF0KHRoaXMubm9kZUlkLCBkZWYuRklORFZBTFVFLCBzZW5kRGF0YSksIFwia2FkXCIpO1xuICB9XG5cbiAgY29ubmVjdChwZWVyOiBXZWJSVEMpIHtcbiAgICBjb25zb2xlLmxvZyhcImthZCBjb25uZWN0XCIpO1xuICAgIGlmICh0aGlzLnN0YXRlLmlzRmlyc3RDb25uZWN0KSB0aGlzLmNhbGxiYWNrLm9uQ29ubmVjdCgpO1xuICAgIHRoaXMuc3RhdGUuaXNGaXJzdENvbm5lY3QgPSBmYWxzZTtcbiAgICB0aGlzLmFkZGtub2RlKHBlZXIpO1xuICB9XG5cbiAgYWRka25vZGUocGVlcjogV2ViUlRDKSB7XG4gICAgcGVlci5ldmVudHMuZGF0YVtcImthZGVtbGlhLnRzXCJdID0gcmF3ID0+IHtcbiAgICAgIHRoaXMub25Db21tYW5kKHJhdyk7XG4gICAgfTtcblxuICAgIHBlZXIuZGlzY29ubmVjdCA9ICgpID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKFwia2FkIG5vZGUgZGlzY29ubmVjdGVkXCIpO1xuICAgICAgdGhpcy5mLmNsZWFuRGlzY29uKCk7XG4gICAgICB0aGlzLmNhbGxiYWNrLm9uQWRkUGVlcih0aGlzLmYuZ2V0QWxsUGVlcklkcygpKTtcbiAgICB9O1xuXG4gICAgaWYgKCF0aGlzLmYuaXNOb2RlRXhpc3QocGVlci5ub2RlSWQpKSB7XG4gICAgICAvL+iHquWIhuOBruODjuODvOODiUlE44Go6L+95Yqg44GZ44KL44OO44O844OJSUTjga7ot53pm6JcbiAgICAgIGNvbnN0IG51bSA9IGRpc3RhbmNlKHRoaXMubm9kZUlkLCBwZWVyLm5vZGVJZCk7XG4gICAgICAvL2tidWNrZXRz44Gu6Kmy5b2T44GZ44KL6Led6Zui44Gua2J1Y2tldOOCkuWRvOOBs+WHuuOBmVxuICAgICAgY29uc3Qga2J1Y2tldCA9IHRoaXMua2J1Y2tldHNbbnVtXTtcbiAgICAgIC8v6Kmy5b2T44GZ44KLa2J1Y2tldOOBq+aWsOOBl+OBhOODlOOCouOCkuWKoOOBiOOCi1xuICAgICAga2J1Y2tldC5wdXNoKHBlZXIpO1xuXG4gICAgICBjb25zb2xlLmxvZyhcImFkZGtub2RlIGtidWNrZXRzXCIsIFwicGVlci5ub2RlSWQ6XCIsIHBlZXIubm9kZUlkKTtcbiAgICAgIGNvbnNvbGUubG9nKHRoaXMuZi5nZXRBbGxQZWVySWRzKCkpO1xuXG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgdGhpcy5maW5kTmV3UGVlcihwZWVyKTtcbiAgICAgIH0sIDEwMDApO1xuXG4gICAgICB0aGlzLmNhbGxiYWNrLm9uQWRkUGVlcih0aGlzLmYuZ2V0QWxsUGVlcklkcygpKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGZpbmROZXdQZWVyKHBlZXI6IFdlYlJUQykge1xuICAgIGlmICh0aGlzLmYuZ2V0S2J1Y2tldE51bSgpIDwgdGhpcy5rKSB7XG4gICAgICAvL+iHqui6q+OBruODjuODvOODiUlE44KSa2V544Go44GX44GmRklORF9OT0RFXG4gICAgICB0aGlzLmZpbmROb2RlKHRoaXMubm9kZUlkLCBwZWVyKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5sb2coXCJrYnVja2V0IHJlYWR5XCIsIHRoaXMuZi5nZXRLYnVja2V0TnVtKCkpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgbWFpbnRhaW4obmV0d29yazogYW55KSB7XG4gICAgY29uc3QgaW54ID0gZGlzdGFuY2UodGhpcy5ub2RlSWQsIG5ldHdvcmsubm9kZUlkKTtcbiAgICBjb25zdCBrYnVja2V0ID0gdGhpcy5rYnVja2V0c1tpbnhdO1xuXG4gICAgLy/pgIHkv6HlhYPjgYzoqbLlvZPjgZnjgotrLWJ1Y2tldOOBruS4reOBq+OBguOBo+OBn+WgtOWQiFxuICAgIC8v44Gd44Gu44OO44O844OJ44KSay1idWNrZXTjga7mnKvlsL7jgavnp7vjgZlcbiAgICBrYnVja2V0LmZvckVhY2goKHBlZXIsIGkpID0+IHtcbiAgICAgIGlmIChwZWVyLm5vZGVJZCA9PT0gbmV0d29yay5ub2RlSWQpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJtYWludGFpblwiLCBcIk1vdmVzwqBpdMKgdG/CoHRoZcKgdGFpbMKgb2bCoHRoZcKgbGlzdFwiKTtcbiAgICAgICAga2J1Y2tldC5zcGxpY2UoaSwgMSk7XG4gICAgICAgIGtidWNrZXQucHVzaChwZWVyKTtcbiAgICAgICAgcmV0dXJuIDA7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvL2stYnVja2V044GM44GZ44Gn44Gr5rqA5p2v44Gq5aC05ZCI44CBXG4gICAgLy/jgZ3jga5rLWJ1Y2tldOS4reOBruWFiOmgreOBruODjuODvOODieOBjOOCquODs+ODqeOCpOODs+OBquOCieWFiOmgreOBruODjuODvOODieOCkuaui+OBmVxuICAgIGlmIChrYnVja2V0Lmxlbmd0aCA+IHRoaXMuaykge1xuICAgICAga2J1Y2tldC5zaGlmdCgpO1xuICAgIH1cbiAgfVxuXG4gIG9mZmVyKHRhcmdldDogc3RyaW5nLCBwcm94eSA9IG51bGwpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY29uc3QgciA9IHRoaXMucmVmO1xuICAgICAgY29uc3QgcGVlciA9IChyW3RhcmdldF0gPSBuZXcgV2ViUlRDKCkpO1xuICAgICAgcGVlci5tYWtlT2ZmZXIoKTtcblxuICAgICAgY29uc3QgdGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICByZWplY3QoXCJrYWQgb2ZmZXIgdGltZW91dFwiKTtcbiAgICAgIH0sIDUgKiAxMDAwKTtcblxuICAgICAgcGVlci5zaWduYWwgPSBzZHAgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZyhcImthZCBvZmZlciBzdG9yZVwiLCB0YXJnZXQpO1xuICAgICAgICBjb25zdCBfID0gdGhpcy5mLmdldENsb3NlRXN0UGVlcih0YXJnZXQpO1xuICAgICAgICBpZiAoIV8pIHJldHVybjtcbiAgICAgICAgaWYgKF8ubm9kZUlkICE9PSB0YXJnZXQpXG4gICAgICAgICAgdGhpcy5zdG9yZSh0aGlzLm5vZGVJZCwgdGFyZ2V0LCB7IHNkcCwgcHJveHkgfSk7XG4gICAgICB9O1xuXG4gICAgICBwZWVyLmNvbm5lY3QgPSAoKSA9PiB7XG4gICAgICAgIHBlZXIubm9kZUlkID0gdGFyZ2V0O1xuICAgICAgICBjb25zb2xlLmxvZyhcImthZCBvZmZlciBjb25uZWN0ZWRcIiwgdGFyZ2V0KTtcbiAgICAgICAgdGhpcy5hZGRrbm9kZShwZWVyKTtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xuICAgICAgICByZXNvbHZlKHRydWUpO1xuICAgICAgfTtcbiAgICB9KTtcbiAgfVxuXG4gIGFuc3dlcih0YXJnZXQ6IHN0cmluZywgc2RwOiBzdHJpbmcsIHByb3h5OiBzdHJpbmcpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY29uc3QgciA9IHRoaXMucmVmO1xuICAgICAgY29uc3QgcGVlciA9IChyW3RhcmdldF0gPSBuZXcgV2ViUlRDKCkpO1xuICAgICAgcGVlci5tYWtlQW5zd2VyKHNkcCk7XG4gICAgICBjb25zb2xlLmxvZyhcImthZCBhbnN3ZXJcIiwgdGFyZ2V0KTtcblxuICAgICAgY29uc3QgdGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICByZWplY3QoXCJrYWQgYW5zd2VyIHRpbWVvdXRcIik7XG4gICAgICB9LCA1ICogMTAwMCk7XG5cbiAgICAgIHBlZXIuc2lnbmFsID0gc2RwID0+IHtcbiAgICAgICAgY29uc3QgXyA9IHRoaXMuZi5nZXRQZWVyRnJvbW5vZGVJZChwcm94eSk7XG4gICAgICAgIC8v5p2l44Gf44Or44O844OI44Gr6YCB44KK6L+U44GZXG4gICAgICAgIGNvbnN0IHNlbmREYXRhOiBTdG9yZUZvcm1hdCA9IHtcbiAgICAgICAgICBzZW5kZXI6IHRoaXMubm9kZUlkLFxuICAgICAgICAgIGtleTogdGFyZ2V0LFxuICAgICAgICAgIHZhbHVlOiB7IHNkcCB9XG4gICAgICAgIH07XG4gICAgICAgIGlmIChfKSBfLnNlbmQobmV0d29ya0Zvcm1hdCh0aGlzLm5vZGVJZCwgZGVmLlNUT1JFLCBzZW5kRGF0YSksIFwia2FkXCIpO1xuICAgICAgfTtcblxuICAgICAgcGVlci5jb25uZWN0ID0gKCkgPT4ge1xuICAgICAgICBwZWVyLm5vZGVJZCA9IHRhcmdldDtcbiAgICAgICAgY29uc29sZS5sb2coXCJrYWQgYW5zd2VyIGNvbm5lY3RlZFwiLCB0YXJnZXQpO1xuICAgICAgICB0aGlzLmFkZGtub2RlKHBlZXIpO1xuICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dCk7XG4gICAgICAgIHJlc29sdmUodHJ1ZSk7XG4gICAgICB9O1xuICAgIH0pO1xuICB9XG5cbiAgc2VuZCh0YXJnZXQ6IHN0cmluZywgZGF0YTogYW55KSB7XG4gICAgY29uc3QgXyA9IHRoaXMuZi5nZXRQZWVyRnJvbW5vZGVJZCh0YXJnZXQpO1xuICAgIGlmIChfKSBfLnNlbmQobmV0d29ya0Zvcm1hdCh0aGlzLm5vZGVJZCwgZGVmLlNFTkQsIGRhdGEpLCBcImthZFwiKTtcbiAgfVxuXG4gIHByaXZhdGUgb25Db21tYW5kKG1lc3NhZ2U6IG1lc3NhZ2UpIHtcbiAgICBzd2l0Y2ggKG1lc3NhZ2UubGFiZWwpIHtcbiAgICAgIGNhc2UgXCJrYWRcIjpcbiAgICAgICAgY29uc3QgYnVmZmVyOiBCdWZmZXIgPSBCdWZmZXIuZnJvbShtZXNzYWdlLmRhdGEpO1xuICAgICAgICBjb25zb2xlLmxvZyh7IGJ1ZmZlciB9KTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhcIm9uY29tbWFuZCBrYWRcIiwgeyBtZXNzYWdlIH0pO1xuICAgICAgICAgIGNvbnN0IG5ldHdvcmtMYXllcjogbmV0d29yayA9IGJzb24uZGVzZXJpYWxpemUoYnVmZmVyKTtcbiAgICAgICAgICBpZiAoIUpTT04uc3RyaW5naWZ5KHRoaXMuZGF0YUxpc3QpLmluY2x1ZGVzKG5ldHdvcmtMYXllci5oYXNoKSkge1xuICAgICAgICAgICAgdGhpcy5kYXRhTGlzdC5wdXNoKG5ldHdvcmtMYXllci5oYXNoKTtcbiAgICAgICAgICAgIHRoaXMub25SZXF1ZXN0KG5ldHdvcmtMYXllcik7XG4gICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yKTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIG9uUmVxdWVzdChuZXR3b3JrOiBhbnkpIHtcbiAgICB0aGlzLnJlc3BvbmRlci5yZXNwb25zZShuZXR3b3JrLnR5cGUsIG5ldHdvcmspO1xuICAgIHRoaXMubWFpbnRhaW4obmV0d29yayk7XG4gIH1cbn1cbiJdfQ==
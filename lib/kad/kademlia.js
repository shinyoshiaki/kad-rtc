"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
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
      isOffer: false,
      findNode: "",
      hash: {}
    });

    _defineProperty(this, "callback", {
      onAddPeer: function onAddPeer(v) {},
      onPeerDisconnect: function onPeerDisconnect(v) {},
      onFindValue: function onFindValue(v) {},
      onFindNode: function onFindNode(v) {},
      onStore: function onStore(v) {},
      onApp: function onApp(v) {}
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
    value: function () {
      var _store = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee(sender, key, value) {
        var peer, sendData, network;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                //自分に一番近いピアを取得
                peer = this.f.getCloseEstPeer(key);

                if (peer) {
                  _context.next = 3;
                  break;
                }

                return _context.abrupt("return");

              case 3:
                console.log(_KConst.default.STORE, "next", peer.nodeId, "target", key);
                sendData = {
                  sender: sender,
                  key: key,
                  value: value
                };
                network = (0, _KConst.networkFormat)(this.nodeId, _KConst.default.STORE, sendData);
                peer.send(network, "kad");
                console.log("store done", {
                  network: network
                });
                this.keyValueList[key] = value;
                this.callback.onStore(this.keyValueList);

              case 10:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      return function store(_x, _x2, _x3) {
        return _store.apply(this, arguments);
      };
    }()
  }, {
    key: "findNode",
    value: function () {
      var _findNode = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee2(targetId, peer) {
        var sendData;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                console.log("findnode", targetId);
                this.state.findNode = targetId;
                sendData = {
                  targetKey: targetId
                }; //送る

                peer.send((0, _KConst.networkFormat)(this.nodeId, _KConst.default.FINDNODE, sendData), "kad");

              case 4:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      return function findNode(_x4, _x5) {
        return _findNode.apply(this, arguments);
      };
    }()
  }, {
    key: "findValue",
    value: function findValue(key) {
      var _this = this;

      var cb = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function (value) {};
      this.callback.onFindValue = cb; //keyに近いピアを取得

      var peers = this.f.getClosePeers(key);
      peers.forEach(function (peer) {
        _this.doFindvalue(key, peer);
      });
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

      return function doFindvalue(_x6, _x7) {
        return _doFindvalue.apply(this, arguments);
      };
    }()
  }, {
    key: "addknode",
    value: function addknode(peer) {
      var _this2 = this;

      peer.events.data["kademlia.ts"] = function (raw) {
        _this2.onCommand(raw);
      };

      peer.disconnect = function () {
        console.log("kad node disconnected");

        _this2.f.cleanDiscon();

        _this2.callback.onAddPeer(_this2.f.getAllPeerIds());
      };

      if (!this.f.isNodeExist(peer.nodeId)) {
        //自分のノードIDと追加するノードIDの距離
        var num = (0, _kadDistance.distance)(this.nodeId, peer.nodeId); //kbucketsの該当する距離のkbucketを呼び出す

        var kbucket = this.kbuckets[num]; //該当するkbucketに新しいピアを加える

        kbucket.push(peer);
        console.log("addknode kbuckets", "peer.nodeId:", peer.nodeId);
        console.log(this.f.getAllPeerIds());
        setTimeout(function () {
          _this2.findNewPeer(peer);
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
      regeneratorRuntime.mark(function _callee4(network) {
        var inx, kbucket;
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
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
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      return function maintain(_x8) {
        return _maintain.apply(this, arguments);
      };
    }()
  }, {
    key: "offer",
    value: function offer(target) {
      var _this3 = this;

      var proxy = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      return new Promise(function (resolve, reject) {
        var r = _this3.ref;
        var peer = r[target] = new _webrtc4me.default();
        peer.makeOffer();
        var timeout = setTimeout(function () {
          reject("kad offer timeout");
        }, 5 * 1000);

        peer.signal = function (sdp) {
          console.log("kad offer store", target);

          var _ = _this3.f.getCloseEstPeer(target);

          if (!_) return;
          if (_.nodeId !== target) _this3.store(_this3.nodeId, target, {
            sdp: sdp,
            proxy: proxy
          });
        };

        peer.connect = function () {
          peer.nodeId = target;
          console.log("kad offer connected", target);

          _this3.addknode(peer);

          clearTimeout(timeout);
          resolve(true);
        };
      });
    }
  }, {
    key: "answer",
    value: function answer(target, sdp, proxy) {
      var _this4 = this;

      return new Promise(function (resolve, reject) {
        var r = _this4.ref;
        var peer = r[target] = new _webrtc4me.default();
        peer.makeAnswer(sdp);
        console.log("kad answer", target);
        var timeout = setTimeout(function () {
          reject("kad answer timeout");
        }, 5 * 1000);

        peer.signal = function (sdp) {
          var _ = _this4.f.getPeerFromnodeId(proxy); //来たルートに送り返す


          var sendData = {
            sender: _this4.nodeId,
            key: target,
            value: {
              sdp: sdp
            }
          };
          if (_) _.send((0, _KConst.networkFormat)(_this4.nodeId, _KConst.default.STORE, sendData), "kad");
        };

        peer.connect = function () {
          peer.nodeId = target;
          console.log("kad answer connected", target);

          _this4.addknode(peer);

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
          var dataLink = Buffer.from(message.data);
          console.log({
            dataLink: dataLink
          });

          try {
            console.log("oncommand kad", {
              message: message
            }, {
              dataLink: dataLink
            });
            var networkLayer = bson.deserialize(dataLink);

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9rYWQva2FkZW1saWEudHMiXSwibmFtZXMiOlsicmVxdWlyZSIsImJzb24iLCJCU09OIiwiS2FkZW1saWEiLCJfbm9kZUlkIiwib3B0IiwiaXNPZmZlciIsImZpbmROb2RlIiwiaGFzaCIsIm9uQWRkUGVlciIsInYiLCJvblBlZXJEaXNjb25uZWN0Iiwib25GaW5kVmFsdWUiLCJvbkZpbmROb2RlIiwib25TdG9yZSIsIm9uQXBwIiwiY29uc29sZSIsImxvZyIsImsiLCJrTGVuZ3RoIiwibm9kZUlkIiwia2J1Y2tldHMiLCJBcnJheSIsImkiLCJrYnVja2V0IiwiZiIsIkhlbHBlciIsInJlc3BvbmRlciIsIktSZXNwb25kZXIiLCJzZW5kZXIiLCJrZXkiLCJ2YWx1ZSIsInBlZXIiLCJnZXRDbG9zZUVzdFBlZXIiLCJkZWYiLCJTVE9SRSIsInNlbmREYXRhIiwibmV0d29yayIsInNlbmQiLCJrZXlWYWx1ZUxpc3QiLCJjYWxsYmFjayIsInRhcmdldElkIiwic3RhdGUiLCJ0YXJnZXRLZXkiLCJGSU5ETk9ERSIsImNiIiwicGVlcnMiLCJnZXRDbG9zZVBlZXJzIiwiZm9yRWFjaCIsImRvRmluZHZhbHVlIiwiRklORFZBTFVFIiwiZXZlbnRzIiwiZGF0YSIsInJhdyIsIm9uQ29tbWFuZCIsImRpc2Nvbm5lY3QiLCJjbGVhbkRpc2NvbiIsImdldEFsbFBlZXJJZHMiLCJpc05vZGVFeGlzdCIsIm51bSIsInB1c2giLCJzZXRUaW1lb3V0IiwiZmluZE5ld1BlZXIiLCJnZXRLYnVja2V0TnVtIiwiaW54Iiwic3BsaWNlIiwibGVuZ3RoIiwic2hpZnQiLCJ0YXJnZXQiLCJwcm94eSIsIlByb21pc2UiLCJyZXNvbHZlIiwicmVqZWN0IiwiciIsInJlZiIsIldlYlJUQyIsIm1ha2VPZmZlciIsInRpbWVvdXQiLCJzaWduYWwiLCJzZHAiLCJfIiwic3RvcmUiLCJjb25uZWN0IiwiYWRka25vZGUiLCJjbGVhclRpbWVvdXQiLCJtYWtlQW5zd2VyIiwiZ2V0UGVlckZyb21ub2RlSWQiLCJTRU5EIiwibWVzc2FnZSIsImxhYmVsIiwiZGF0YUxpbmsiLCJCdWZmZXIiLCJmcm9tIiwibmV0d29ya0xheWVyIiwiZGVzZXJpYWxpemUiLCJKU09OIiwic3RyaW5naWZ5IiwiZGF0YUxpc3QiLCJpbmNsdWRlcyIsIm9uUmVxdWVzdCIsImVycm9yIiwicmVzcG9uc2UiLCJ0eXBlIiwibWFpbnRhaW4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFFQTs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBUEFBLE9BQU8sQ0FBQyxnQkFBRCxDQUFQOztBQVNBLElBQU1DLElBQUksR0FBRyxJQUFJQyxVQUFKLEVBQWI7O0lBRXFCQyxROzs7QUF5Qm5CLG9CQUFZQyxPQUFaLEVBQTZCQyxHQUE3QixFQUF5RDtBQUFBOztBQUFBOztBQUFBOztBQUFBOztBQUFBOztBQUFBOztBQUFBLHNDQW5CbEMsRUFtQmtDOztBQUFBLDBDQWxCbEIsRUFrQmtCOztBQUFBLGlDQWpCeEIsRUFpQndCOztBQUFBLG9DQWhCakIsRUFnQmlCOztBQUFBLG1DQWZqRDtBQUNOQyxNQUFBQSxPQUFPLEVBQUUsS0FESDtBQUVOQyxNQUFBQSxRQUFRLEVBQUUsRUFGSjtBQUdOQyxNQUFBQSxJQUFJLEVBQUU7QUFIQSxLQWVpRDs7QUFBQSxzQ0FUOUM7QUFDVEMsTUFBQUEsU0FBUyxFQUFFLG1CQUFDQyxDQUFELEVBQWEsQ0FBRSxDQURqQjtBQUVUQyxNQUFBQSxnQkFBZ0IsRUFBRSwwQkFBQ0QsQ0FBRCxFQUFhLENBQUUsQ0FGeEI7QUFHVEUsTUFBQUEsV0FBVyxFQUFFLHFCQUFDRixDQUFELEVBQWEsQ0FBRSxDQUhuQjtBQUlURyxNQUFBQSxVQUFVLEVBQUUsb0JBQUNILENBQUQsRUFBYSxDQUFFLENBSmxCO0FBS1RJLE1BQUFBLE9BQU8sRUFBRSxpQkFBQ0osQ0FBRCxFQUFhLENBQUUsQ0FMZjtBQU1USyxNQUFBQSxLQUFLLEVBQUUsZUFBQ0wsQ0FBRCxFQUFhLENBQUU7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QUFGLFdBQVo7O0FBQ0EsY0FBSTtBQUNGMUUsWUFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVksZUFBWixFQUE2QjtBQUFFdUUsY0FBQUEsT0FBTyxFQUFQQTtBQUFGLGFBQTdCLEVBQTBDO0FBQUVFLGNBQUFBLFFBQVEsRUFBUkE7QUFBRixhQUExQztBQUNBLGdCQUFNRyxZQUFxQixHQUFHNUYsSUFBSSxDQUFDNkYsV0FBTCxDQUFpQkosUUFBakIsQ0FBOUI7O0FBQ0EsZ0JBQUksQ0FBQ0ssSUFBSSxDQUFDQyxTQUFMLENBQWUsS0FBS0MsUUFBcEIsRUFBOEJDLFFBQTlCLENBQXVDTCxZQUFZLENBQUNyRixJQUFwRCxDQUFMLEVBQWdFO0FBQzlELG1CQUFLeUYsUUFBTCxDQUFjckMsSUFBZCxDQUFtQmlDLFlBQVksQ0FBQ3JGLElBQWhDO0FBQ0EsbUJBQUsyRixTQUFMLENBQWVOLFlBQWY7QUFDRDtBQUNGLFdBUEQsQ0FPRSxPQUFPTyxLQUFQLEVBQWM7QUFDZHBGLFlBQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZbUYsS0FBWjtBQUNEOztBQUNEO0FBZEo7QUFnQkQ7Ozs4QkFFaUIvRCxPLEVBQWM7QUFDOUIsV0FBS1YsU0FBTCxDQUFlMEUsUUFBZixDQUF3QmhFLE9BQU8sQ0FBQ2lFLElBQWhDLEVBQXNDakUsT0FBdEM7QUFDQSxXQUFLa0UsUUFBTCxDQUFjbEUsT0FBZDtBQUNEIiwic291cmNlc0NvbnRlbnQiOlsicmVxdWlyZShcImJhYmVsLXBvbHlmaWxsXCIpO1xuaW1wb3J0IFdlYlJUQyBmcm9tIFwid2VicnRjNG1lXCI7XG5pbXBvcnQgSGVscGVyIGZyb20gXCIuL2tVdGlsXCI7XG5pbXBvcnQgS1Jlc3BvbmRlciBmcm9tIFwiLi9rUmVzcG9uZGVyXCI7XG5pbXBvcnQgZGVmLCB7IG5ldHdvcmtGb3JtYXQgfSBmcm9tIFwiLi9LQ29uc3RcIjtcbmltcG9ydCB7IGRpc3RhbmNlIH0gZnJvbSBcImthZC1kaXN0YW5jZVwiO1xuaW1wb3J0IHsgbWVzc2FnZSB9IGZyb20gXCJ3ZWJydGM0bWUvbGliL2ludGVyZmFjZVwiO1xuaW1wb3J0IHsgQlNPTiB9IGZyb20gXCJic29uXCI7XG5cbmNvbnN0IGJzb24gPSBuZXcgQlNPTigpO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBLYWRlbWxpYSB7XG4gIG5vZGVJZDogc3RyaW5nO1xuICBrOiBudW1iZXI7XG4gIGtidWNrZXRzOiBBcnJheTxBcnJheTxXZWJSVEM+PjtcbiAgZjogSGVscGVyO1xuICByZXNwb25kZXI6IEtSZXNwb25kZXI7XG4gIGRhdGFMaXN0OiBBcnJheTxhbnk+ID0gW107XG4gIGtleVZhbHVlTGlzdDogeyBba2V5OiBzdHJpbmddOiBhbnkgfSA9IHt9O1xuICByZWY6IHsgW2tleTogc3RyaW5nXTogV2ViUlRDIH0gPSB7fTtcbiAgYnVmZmVyOiB7IFtrZXk6IHN0cmluZ106IEFycmF5PGFueT4gfSA9IHt9O1xuICBzdGF0ZSA9IHtcbiAgICBpc09mZmVyOiBmYWxzZSxcbiAgICBmaW5kTm9kZTogXCJcIixcbiAgICBoYXNoOiB7fVxuICB9O1xuXG4gIGNhbGxiYWNrID0ge1xuICAgIG9uQWRkUGVlcjogKHY/OiBhbnkpID0+IHt9LFxuICAgIG9uUGVlckRpc2Nvbm5lY3Q6ICh2PzogYW55KSA9PiB7fSxcbiAgICBvbkZpbmRWYWx1ZTogKHY/OiBhbnkpID0+IHt9LFxuICAgIG9uRmluZE5vZGU6ICh2PzogYW55KSA9PiB7fSxcbiAgICBvblN0b3JlOiAodj86IGFueSkgPT4ge30sXG4gICAgb25BcHA6ICh2PzogYW55KSA9PiB7fVxuICB9O1xuXG4gIGNvbnN0cnVjdG9yKF9ub2RlSWQ6IHN0cmluZywgb3B0PzogeyBrTGVuZ3RoPzogbnVtYmVyIH0pIHtcbiAgICBjb25zb2xlLmxvZyhcInN0YXJ0IGthZFwiLCBfbm9kZUlkKTtcbiAgICB0aGlzLmsgPSAyMDtcbiAgICBpZiAob3B0KSBpZiAob3B0LmtMZW5ndGgpIHRoaXMuayA9IG9wdC5rTGVuZ3RoO1xuICAgIHRoaXMubm9kZUlkID0gX25vZGVJZDtcblxuICAgIHRoaXMua2J1Y2tldHMgPSBuZXcgQXJyYXkoMTYwKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IDE2MDsgaSsrKSB7XG4gICAgICBsZXQga2J1Y2tldDogQXJyYXk8YW55PiA9IFtdO1xuICAgICAgdGhpcy5rYnVja2V0c1tpXSA9IGtidWNrZXQ7XG4gICAgfVxuXG4gICAgdGhpcy5mID0gbmV3IEhlbHBlcih0aGlzLmssIHRoaXMua2J1Y2tldHMpO1xuICAgIHRoaXMucmVzcG9uZGVyID0gbmV3IEtSZXNwb25kZXIodGhpcyk7XG4gIH1cblxuICBhc3luYyBzdG9yZShzZW5kZXI6IHN0cmluZywga2V5OiBzdHJpbmcsIHZhbHVlOiBhbnkpIHtcbiAgICAvL+iHquWIhuOBq+S4gOeVqui/keOBhOODlOOCouOCkuWPluW+l1xuICAgIGNvbnN0IHBlZXIgPSB0aGlzLmYuZ2V0Q2xvc2VFc3RQZWVyKGtleSk7XG4gICAgaWYgKCFwZWVyKSByZXR1cm47XG4gICAgY29uc29sZS5sb2coZGVmLlNUT1JFLCBcIm5leHRcIiwgcGVlci5ub2RlSWQsIFwidGFyZ2V0XCIsIGtleSk7XG4gICAgY29uc3Qgc2VuZERhdGE6IFN0b3JlRm9ybWF0ID0geyBzZW5kZXIsIGtleSwgdmFsdWUgfTtcbiAgICBjb25zdCBuZXR3b3JrID0gbmV0d29ya0Zvcm1hdCh0aGlzLm5vZGVJZCwgZGVmLlNUT1JFLCBzZW5kRGF0YSk7XG4gICAgcGVlci5zZW5kKG5ldHdvcmssIFwia2FkXCIpO1xuICAgIGNvbnNvbGUubG9nKFwic3RvcmUgZG9uZVwiLCB7IG5ldHdvcmsgfSk7XG4gICAgdGhpcy5rZXlWYWx1ZUxpc3Rba2V5XSA9IHZhbHVlO1xuICAgIHRoaXMuY2FsbGJhY2sub25TdG9yZSh0aGlzLmtleVZhbHVlTGlzdCk7XG4gIH1cblxuICBhc3luYyBmaW5kTm9kZSh0YXJnZXRJZDogc3RyaW5nLCBwZWVyOiBXZWJSVEMpIHtcbiAgICBjb25zb2xlLmxvZyhcImZpbmRub2RlXCIsIHRhcmdldElkKTtcbiAgICB0aGlzLnN0YXRlLmZpbmROb2RlID0gdGFyZ2V0SWQ7XG4gICAgY29uc3Qgc2VuZERhdGEgPSB7IHRhcmdldEtleTogdGFyZ2V0SWQgfTtcbiAgICAvL+mAgeOCi1xuICAgIHBlZXIuc2VuZChuZXR3b3JrRm9ybWF0KHRoaXMubm9kZUlkLCBkZWYuRklORE5PREUsIHNlbmREYXRhKSwgXCJrYWRcIik7XG4gIH1cblxuICBmaW5kVmFsdWUoa2V5OiBzdHJpbmcsIGNiID0gKHZhbHVlOiBhbnkpID0+IHt9KSB7XG4gICAgdGhpcy5jYWxsYmFjay5vbkZpbmRWYWx1ZSA9IGNiO1xuICAgIC8va2V544Gr6L+R44GE44OU44Ki44KS5Y+W5b6XXG4gICAgY29uc3QgcGVlcnMgPSB0aGlzLmYuZ2V0Q2xvc2VQZWVycyhrZXkpO1xuICAgIHBlZXJzLmZvckVhY2gocGVlciA9PiB7XG4gICAgICB0aGlzLmRvRmluZHZhbHVlKGtleSwgcGVlcik7XG4gICAgfSk7XG4gIH1cblxuICBhc3luYyBkb0ZpbmR2YWx1ZShrZXk6IHN0cmluZywgcGVlcjogV2ViUlRDKSB7XG4gICAgY29uc29sZS5sb2coXCJkb2ZpbmR2YWx1ZVwiLCBwZWVyLm5vZGVJZCk7XG4gICAgY29uc3Qgc2VuZERhdGE6IEZpbmRWYWx1ZSA9IHsgdGFyZ2V0S2V5OiBrZXkgfTtcbiAgICBwZWVyLnNlbmQobmV0d29ya0Zvcm1hdCh0aGlzLm5vZGVJZCwgZGVmLkZJTkRWQUxVRSwgc2VuZERhdGEpLCBcImthZFwiKTtcbiAgfVxuXG4gIGFkZGtub2RlKHBlZXI6IFdlYlJUQykge1xuICAgIHBlZXIuZXZlbnRzLmRhdGFbXCJrYWRlbWxpYS50c1wiXSA9IHJhdyA9PiB7XG4gICAgICB0aGlzLm9uQ29tbWFuZChyYXcpO1xuICAgIH07XG5cbiAgICBwZWVyLmRpc2Nvbm5lY3QgPSAoKSA9PiB7XG4gICAgICBjb25zb2xlLmxvZyhcImthZCBub2RlIGRpc2Nvbm5lY3RlZFwiKTtcbiAgICAgIHRoaXMuZi5jbGVhbkRpc2NvbigpO1xuICAgICAgdGhpcy5jYWxsYmFjay5vbkFkZFBlZXIodGhpcy5mLmdldEFsbFBlZXJJZHMoKSk7XG4gICAgfTtcblxuICAgIGlmICghdGhpcy5mLmlzTm9kZUV4aXN0KHBlZXIubm9kZUlkKSkge1xuICAgICAgLy/oh6rliIbjga7jg47jg7zjg4lJROOBqOi/veWKoOOBmeOCi+ODjuODvOODiUlE44Gu6Led6ZuiXG4gICAgICBjb25zdCBudW0gPSBkaXN0YW5jZSh0aGlzLm5vZGVJZCwgcGVlci5ub2RlSWQpO1xuICAgICAgLy9rYnVja2V0c+OBruipsuW9k+OBmeOCi+i3nembouOBrmtidWNrZXTjgpLlkbzjgbPlh7rjgZlcbiAgICAgIGNvbnN0IGtidWNrZXQgPSB0aGlzLmtidWNrZXRzW251bV07XG4gICAgICAvL+ipsuW9k+OBmeOCi2tidWNrZXTjgavmlrDjgZfjgYTjg5TjgqLjgpLliqDjgYjjgotcbiAgICAgIGtidWNrZXQucHVzaChwZWVyKTtcblxuICAgICAgY29uc29sZS5sb2coXCJhZGRrbm9kZSBrYnVja2V0c1wiLCBcInBlZXIubm9kZUlkOlwiLCBwZWVyLm5vZGVJZCk7XG4gICAgICBjb25zb2xlLmxvZyh0aGlzLmYuZ2V0QWxsUGVlcklkcygpKTtcblxuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHRoaXMuZmluZE5ld1BlZXIocGVlcik7XG4gICAgICB9LCAxMDAwKTtcblxuICAgICAgdGhpcy5jYWxsYmFjay5vbkFkZFBlZXIodGhpcy5mLmdldEFsbFBlZXJJZHMoKSk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBmaW5kTmV3UGVlcihwZWVyOiBXZWJSVEMpIHtcbiAgICBpZiAodGhpcy5mLmdldEtidWNrZXROdW0oKSA8IHRoaXMuaykge1xuICAgICAgLy/oh6rouqvjga7jg47jg7zjg4lJROOCkmtleeOBqOOBl+OBpkZJTkRfTk9ERVxuICAgICAgdGhpcy5maW5kTm9kZSh0aGlzLm5vZGVJZCwgcGVlcik7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUubG9nKFwia2J1Y2tldCByZWFkeVwiLCB0aGlzLmYuZ2V0S2J1Y2tldE51bSgpKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIG1haW50YWluKG5ldHdvcms6IGFueSkge1xuICAgIGNvbnN0IGlueCA9IGRpc3RhbmNlKHRoaXMubm9kZUlkLCBuZXR3b3JrLm5vZGVJZCk7XG4gICAgY29uc3Qga2J1Y2tldCA9IHRoaXMua2J1Y2tldHNbaW54XTtcblxuICAgIC8v6YCB5L+h5YWD44GM6Kmy5b2T44GZ44KLay1idWNrZXTjga7kuK3jgavjgYLjgaPjgZ/loLTlkIhcbiAgICAvL+OBneOBruODjuODvOODieOCkmstYnVja2V044Gu5pyr5bC+44Gr56e744GZXG4gICAga2J1Y2tldC5mb3JFYWNoKChwZWVyLCBpKSA9PiB7XG4gICAgICBpZiAocGVlci5ub2RlSWQgPT09IG5ldHdvcmsubm9kZUlkKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwibWFpbnRhaW5cIiwgXCJNb3Zlc8KgaXTCoHRvwqB0aGXCoHRhaWzCoG9mwqB0aGXCoGxpc3RcIik7XG4gICAgICAgIGtidWNrZXQuc3BsaWNlKGksIDEpO1xuICAgICAgICBrYnVja2V0LnB1c2gocGVlcik7XG4gICAgICAgIHJldHVybiAwO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy9rLWJ1Y2tldOOBjOOBmeOBp+OBq+a6gOadr+OBquWgtOWQiOOAgVxuICAgIC8v44Gd44Guay1idWNrZXTkuK3jga7lhYjpoK3jga7jg47jg7zjg4njgYzjgqrjg7Pjg6njgqTjg7PjgarjgonlhYjpoK3jga7jg47jg7zjg4njgpLmrovjgZlcbiAgICBpZiAoa2J1Y2tldC5sZW5ndGggPiB0aGlzLmspIHtcbiAgICAgIGtidWNrZXQuc2hpZnQoKTtcbiAgICB9XG4gIH1cblxuICBvZmZlcih0YXJnZXQ6IHN0cmluZywgcHJveHkgPSBudWxsKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGNvbnN0IHIgPSB0aGlzLnJlZjtcbiAgICAgIGNvbnN0IHBlZXIgPSAoclt0YXJnZXRdID0gbmV3IFdlYlJUQygpKTtcbiAgICAgIHBlZXIubWFrZU9mZmVyKCk7XG5cbiAgICAgIGNvbnN0IHRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgcmVqZWN0KFwia2FkIG9mZmVyIHRpbWVvdXRcIik7XG4gICAgICB9LCA1ICogMTAwMCk7XG5cbiAgICAgIHBlZXIuc2lnbmFsID0gc2RwID0+IHtcbiAgICAgICAgY29uc29sZS5sb2coXCJrYWQgb2ZmZXIgc3RvcmVcIiwgdGFyZ2V0KTtcbiAgICAgICAgY29uc3QgXyA9IHRoaXMuZi5nZXRDbG9zZUVzdFBlZXIodGFyZ2V0KTtcbiAgICAgICAgaWYgKCFfKSByZXR1cm47XG4gICAgICAgIGlmIChfLm5vZGVJZCAhPT0gdGFyZ2V0KVxuICAgICAgICAgIHRoaXMuc3RvcmUodGhpcy5ub2RlSWQsIHRhcmdldCwgeyBzZHAsIHByb3h5IH0pO1xuICAgICAgfTtcblxuICAgICAgcGVlci5jb25uZWN0ID0gKCkgPT4ge1xuICAgICAgICBwZWVyLm5vZGVJZCA9IHRhcmdldDtcbiAgICAgICAgY29uc29sZS5sb2coXCJrYWQgb2ZmZXIgY29ubmVjdGVkXCIsIHRhcmdldCk7XG4gICAgICAgIHRoaXMuYWRka25vZGUocGVlcik7XG4gICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KTtcbiAgICAgICAgcmVzb2x2ZSh0cnVlKTtcbiAgICAgIH07XG4gICAgfSk7XG4gIH1cblxuICBhbnN3ZXIodGFyZ2V0OiBzdHJpbmcsIHNkcDogc3RyaW5nLCBwcm94eTogc3RyaW5nKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGNvbnN0IHIgPSB0aGlzLnJlZjtcbiAgICAgIGNvbnN0IHBlZXIgPSAoclt0YXJnZXRdID0gbmV3IFdlYlJUQygpKTtcbiAgICAgIHBlZXIubWFrZUFuc3dlcihzZHApO1xuICAgICAgY29uc29sZS5sb2coXCJrYWQgYW5zd2VyXCIsIHRhcmdldCk7XG5cbiAgICAgIGNvbnN0IHRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgcmVqZWN0KFwia2FkIGFuc3dlciB0aW1lb3V0XCIpO1xuICAgICAgfSwgNSAqIDEwMDApO1xuXG4gICAgICBwZWVyLnNpZ25hbCA9IHNkcCA9PiB7XG4gICAgICAgIGNvbnN0IF8gPSB0aGlzLmYuZ2V0UGVlckZyb21ub2RlSWQocHJveHkpO1xuICAgICAgICAvL+adpeOBn+ODq+ODvOODiOOBq+mAgeOCiui/lOOBmVxuICAgICAgICBjb25zdCBzZW5kRGF0YTogU3RvcmVGb3JtYXQgPSB7XG4gICAgICAgICAgc2VuZGVyOiB0aGlzLm5vZGVJZCxcbiAgICAgICAgICBrZXk6IHRhcmdldCxcbiAgICAgICAgICB2YWx1ZTogeyBzZHAgfVxuICAgICAgICB9O1xuICAgICAgICBpZiAoXykgXy5zZW5kKG5ldHdvcmtGb3JtYXQodGhpcy5ub2RlSWQsIGRlZi5TVE9SRSwgc2VuZERhdGEpLCBcImthZFwiKTtcbiAgICAgIH07XG5cbiAgICAgIHBlZXIuY29ubmVjdCA9ICgpID0+IHtcbiAgICAgICAgcGVlci5ub2RlSWQgPSB0YXJnZXQ7XG4gICAgICAgIGNvbnNvbGUubG9nKFwia2FkIGFuc3dlciBjb25uZWN0ZWRcIiwgdGFyZ2V0KTtcbiAgICAgICAgdGhpcy5hZGRrbm9kZShwZWVyKTtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xuICAgICAgICByZXNvbHZlKHRydWUpO1xuICAgICAgfTtcbiAgICB9KTtcbiAgfVxuXG4gIHNlbmQodGFyZ2V0OiBzdHJpbmcsIGRhdGE6IGFueSkge1xuICAgIGNvbnN0IF8gPSB0aGlzLmYuZ2V0UGVlckZyb21ub2RlSWQodGFyZ2V0KTtcbiAgICBpZiAoXykgXy5zZW5kKG5ldHdvcmtGb3JtYXQodGhpcy5ub2RlSWQsIGRlZi5TRU5ELCBkYXRhKSwgXCJrYWRcIik7XG4gIH1cblxuICBwcml2YXRlIG9uQ29tbWFuZChtZXNzYWdlOiBtZXNzYWdlKSB7XG4gICAgc3dpdGNoIChtZXNzYWdlLmxhYmVsKSB7XG4gICAgICBjYXNlIFwia2FkXCI6XG4gICAgICAgIGNvbnN0IGRhdGFMaW5rOiBCdWZmZXIgPSBCdWZmZXIuZnJvbShtZXNzYWdlLmRhdGEpO1xuICAgICAgICBjb25zb2xlLmxvZyh7IGRhdGFMaW5rIH0pO1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKFwib25jb21tYW5kIGthZFwiLCB7IG1lc3NhZ2UgfSwgeyBkYXRhTGluayB9KTtcbiAgICAgICAgICBjb25zdCBuZXR3b3JrTGF5ZXI6IG5ldHdvcmsgPSBic29uLmRlc2VyaWFsaXplKGRhdGFMaW5rKTtcbiAgICAgICAgICBpZiAoIUpTT04uc3RyaW5naWZ5KHRoaXMuZGF0YUxpc3QpLmluY2x1ZGVzKG5ldHdvcmtMYXllci5oYXNoKSkge1xuICAgICAgICAgICAgdGhpcy5kYXRhTGlzdC5wdXNoKG5ldHdvcmtMYXllci5oYXNoKTtcbiAgICAgICAgICAgIHRoaXMub25SZXF1ZXN0KG5ldHdvcmtMYXllcik7XG4gICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yKTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIG9uUmVxdWVzdChuZXR3b3JrOiBhbnkpIHtcbiAgICB0aGlzLnJlc3BvbmRlci5yZXNwb25zZShuZXR3b3JrLnR5cGUsIG5ldHdvcmspO1xuICAgIHRoaXMubWFpbnRhaW4obmV0d29yayk7XG4gIH1cbn1cbiJdfQ==
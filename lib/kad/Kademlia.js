"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.networkFormat = networkFormat;

var _simpleDatachannel = require("simple-datachannel");

var _simpleDatachannel2 = _interopRequireDefault(_simpleDatachannel);

var _KUtil = require("./KUtil");

var _KUtil2 = _interopRequireDefault(_KUtil);

var _events = require("events");

var _events2 = _interopRequireDefault(_events);

var _sha = require("sha1");

var _sha2 = _interopRequireDefault(_sha);

var _KResponder = require("./KResponder");

var _KResponder2 = _interopRequireDefault(_KResponder);

var _KConst = require("./KConst");

var _KConst2 = _interopRequireDefault(_KConst);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var buffer = {};

function networkFormat(nodeId, type, data) {
  var packet = {
    layer: "networkLayer",
    type: type,
    nodeId: nodeId,
    data: data,
    date: Date.now(),
    hash: ""
  };
  packet.hash = (0, _sha2.default)(JSON.stringify(packet));
  return JSON.stringify(packet);
}

var Kademlia = function () {
  function Kademlia() {
    var _nodeId = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

    _classCallCheck(this, Kademlia);

    if (_nodeId !== null) {
      console.log("start kad", _nodeId);
      this.k = 20;
      this.nodeId = _nodeId;
      this.dataList = [];
      this.keyValueList = [];
      this.failPeerList = {};
      this.ref = {};
      this.ev = new _events2.default.EventEmitter();
      this.pingResult = {};
      this.state = {
        isOffer: false,
        findNode: "",
        buffer: {},
        hash: {}
      };

      this.kbuckets = new Array(160);
      for (var i = 0; i < 160; i++) {
        var kbucket = [];
        this.kbuckets[i] = kbucket;
      }

      this.f = new _KUtil2.default(this.k, this.kbuckets);
      this.kresponder = new _KResponder2.default(this);
    }
  }

  _createClass(Kademlia, [{
    key: "ping",
    value: function ping(peer) {
      var _this = this;

      var sendData;
      return regeneratorRuntime.async(function ping$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              console.log("ping");

              sendData = { target: peer.nodeId };

              peer.send(networkFormat(this.nodeId, _KConst2.default.PING, sendData), "kad");

              this.pingResult[peer.nodeId] = false;

              _context.next = 6;
              return regeneratorRuntime.awrap(setTimeout(function () {
                if (_this.pingResult[peer.nodeId]) {
                  console.log("ping success");
                  return true;
                } else {
                  console.log("ping fail", peer.nodeId);
                  peer.isDisconnected = true;
                  _this.cleanDiscon();
                  _this.ev.emit(_KConst2.default.DISCONNECT_KNODE);
                  return false;
                }
              }, 3 * 1000));

            case 6:
            case "end":
              return _context.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: "storeFormat",
    value: function storeFormat(sender, key, value) {
      var sendData = {
        sender: sender,
        key: key,
        value: value
      };
      return networkFormat(this.nodeId, _KConst2.default.STORE, sendData);
    }
  }, {
    key: "store",
    value: function store(sender, key, value) {
      var peer = this.f.getCloseEstPeer(key);

      console.log(_KConst2.default.STORE, "next", peer.nodeId, "target", key);

      var result = this.ping(peer);

      if (result) {
        peer.send(this.storeFormat(sender, key, value), "kad");
        console.log("store done", this.storeFormat(sender, key, value));
      } else {
        console.log("store faile");
      }
    }
  }, {
    key: "findNode",
    value: function findNode(targetId, peer) {
      var result = this.ping(peer);
      if (result) {
        console.log("findnode", targetId);
        this.state.findNode = targetId;
        var sendData = { targetKey: targetId };
        peer.send(networkFormat(this.nodeId, _KConst2.default.FINDNODE, sendData), "kad");
      }
    }
  }, {
    key: "findValue",
    value: function findValue(nodeId, key) {
      var _this2 = this;

      return new Promise(function (resolve, reject) {
        _this2.doFindvalue(nodeId, key);
        _this2.ev.on(_KConst2.default.FINDVALUE, function (data) {
          console.log("findValue success");
          resolve(data);
        });
        setTimeout(function () {
          console.log("findValue fail");
          reject();
        }, 10 * 1000);
      });
    }
  }, {
    key: "doFindvalue",
    value: function doFindvalue(nodeId, key) {
      var peer = this.f.getCloseEstPeer(nodeId);
      var result = this.ping(peer);
      if (result) {
        peer.send(networkFormat(this.nodeId, _KConst2.default.FINDVALUE, {
          targetNode: nodeId,
          targetKey: key
        }), "kad");
      }
    }
  }, {
    key: "addknode",
    value: function addknode(peer) {
      var _this3 = this;

      peer.ev.on("data", function (data) {
        console.log("on data", data);
        _this3.onCommand(data);
      });

      peer.ev.on("disconnect", function () {
        console.log("kad node disconnected");
        _this3.cleanDiscon();
      });

      if (!this.f.isNodeExist(peer.nodeId)) {
        var num = this.f.distance(this.nodeId, peer.nodeId);
        var kbucket = this.kbuckets[num];
        kbucket.push(peer);

        console.log("addknode kbuckets", "peer.nodeId:", peer.nodeId);
        this.ev.emit(_KConst2.default.ADD_KNODE);

        if (this.f.getKbucketNum() < this.k) {
          this.findNode(this.nodeId, peer);
        } else {
          console.log("kbucket ready", this.f.getKbucketNum());
        }
      }
    }
  }, {
    key: "onRequest",
    value: function onRequest(datalink) {
      var network = JSON.parse(datalink);
      this.kresponder.response(network.type, network);
      this.maintain(network);
    }
  }, {
    key: "cleanDiscon",
    value: function cleanDiscon() {
      var _this4 = this;

      this.kbuckets.forEach(function (kbucket, i) {
        _this4.kbuckets[i] = kbucket.filter(function (peer) {
          return !peer.isDisconnected;
        });
      });
    }
  }, {
    key: "maintain",
    value: function maintain(network) {
      var inx = this.f.distance(this.nodeId, network.nodeId);
      var kbucket = this.kbuckets[inx];

      kbucket.forEach(function (peer, i) {
        if (peer.nodeId === network.nodeId) {
          console.log("maintain", "Moves it to the tail of the list");
          kbucket.splice(i, 1);
          kbucket.push(peer);
          return 0;
        }
      });

      if (kbucket.length > this.k) {
        console.log("maintain", "bucket fulled", network.nodeId);
        //オンラインかどうかはwrtcの特性上常にわかっているのでキュー
        kbucket.splice(0, 1);
      }
    }
  }, {
    key: "addFailPeerList",
    value: function addFailPeerList(target) {
      if (this.failPeerList[target]) {
        this.failPeerList[target] = this.failPeerList[target] + 1;
      } else {
        this.failPeerList[target] = 0;
      }
    }
  }, {
    key: "offer",
    value: function offer(target) {
      var _this5 = this;

      var proxy = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

      return new Promise(function (resolve, reject) {
        var r = _this5.ref;
        var peer = r[target] = new _simpleDatachannel2.default();
        peer.makeOffer();
        peer.connecting(target);

        peer.ev.on("signal", function (sdp) {
          console.log("kad offer store", target);
          if (_this5.f.getCloseEstPeer(target) !== target) _this5.store(_this5.nodeId, target, { sdp: sdp, proxy: proxy });
        });

        peer.ev.on("connect", function () {
          console.log("kad offer connected", target);
          console.log(_this5.kbuckets);
          r[target].connected();
          resolve(peer);
        });

        setTimeout(function () {
          _this5.addFailPeerList(target);
          reject("timeout");
        }, 3 * 1000);
      });
    }
  }, {
    key: "answer",
    value: function answer(target, sdp) {
      var _this6 = this;

      var proxy = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

      return new Promise(function (resolve, reject) {
        var r = _this6.ref;
        var peer = r[target] = new _simpleDatachannel2.default();
        peer.makeAnswer(sdp);
        peer.connecting(target);
        console.log("kad answer", target);

        peer.ev.on("signal", function (sdp) {
          _this6.f.getPeerFromnodeId(proxy).send(_this6.storeFormat(_this6.nodeId, target, { sdp: sdp }), "kad");
        });

        peer.ev.on("connect", function () {
          console.log("kad answer connected", target);
          console.log(_this6.kbuckets);
          peer.connected();

          resolve(peer);
        });

        setTimeout(function () {
          _this6.addFailPeerList(target);
          reject("timeout");
        }, 3 * 1000);
      });
    }
  }, {
    key: "onCommand",
    value: function onCommand(datachannel) {
      var _this7 = this;

      var command = {};

      command.kad = function (dataLink) {
        var networkLayer = JSON.parse(dataLink);

        if (!JSON.stringify(_this7.dataList).includes(networkLayer.hash)) {
          _this7.dataList.push(networkLayer.hash);

          _this7.cleanDiscon();
          _this7.onRequest(dataLink);
          _this7.ev.emit(_KConst2.default.ONCOMMAND, networkLayer);
        }
      };

      command.data = function (ab) {
        console.log("received ab", ab);
        try {
          var json = JSON.parse(ab);
          if (json.type === "start") {
            _this7.state.hash[datachannel.nodeId] = json.data;
          } else if (json.type === "end") {
            var filehash = (0, _sha2.default)(buffer[datachannel.nodeId]);
            if (filehash === _this7.state.hash[datachannel.nodeId]) {
              _this7.keyValueList[filehash] = buffer[datachannel.nodeId];
              _this7.ev.emit("receiveFile", buffer[datachannel.nodeId]);
              _this7.ev.emit(_KConst2.default.FINDVALUE, buffer[datachannel.nodeId]);
              buffer[datachannel.nodeId] = [];
            } else {
              console.log("hash incorrect", filehash, _this7.state.hash[datachannel.nodeId]);
            }
          }
        } catch (_) {
          if (!buffer[datachannel.nodeId]) {
            buffer[datachannel.nodeId] = [];
          }
          buffer[datachannel.nodeId].push(ab);
        }
      };
      command[datachannel.label](datachannel.data);
    }
  }]);

  return Kademlia;
}();

exports.default = Kademlia;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9rYWQvS2FkZW1saWEuanMiXSwibmFtZXMiOlsibmV0d29ya0Zvcm1hdCIsImJ1ZmZlciIsIm5vZGVJZCIsInR5cGUiLCJkYXRhIiwicGFja2V0IiwibGF5ZXIiLCJkYXRlIiwiRGF0ZSIsIm5vdyIsImhhc2giLCJKU09OIiwic3RyaW5naWZ5IiwiS2FkZW1saWEiLCJfbm9kZUlkIiwiY29uc29sZSIsImxvZyIsImsiLCJkYXRhTGlzdCIsImtleVZhbHVlTGlzdCIsImZhaWxQZWVyTGlzdCIsInJlZiIsImV2IiwiRXZlbnRzIiwiRXZlbnRFbWl0dGVyIiwicGluZ1Jlc3VsdCIsInN0YXRlIiwiaXNPZmZlciIsImZpbmROb2RlIiwia2J1Y2tldHMiLCJBcnJheSIsImkiLCJrYnVja2V0IiwiZiIsIkhlbHBlciIsImtyZXNwb25kZXIiLCJLUmVzcG9uZGVyIiwicGVlciIsInNlbmREYXRhIiwidGFyZ2V0Iiwic2VuZCIsImRlZiIsIlBJTkciLCJzZXRUaW1lb3V0IiwiaXNEaXNjb25uZWN0ZWQiLCJjbGVhbkRpc2NvbiIsImVtaXQiLCJESVNDT05ORUNUX0tOT0RFIiwic2VuZGVyIiwia2V5IiwidmFsdWUiLCJTVE9SRSIsImdldENsb3NlRXN0UGVlciIsInJlc3VsdCIsInBpbmciLCJzdG9yZUZvcm1hdCIsInRhcmdldElkIiwidGFyZ2V0S2V5IiwiRklORE5PREUiLCJQcm9taXNlIiwicmVzb2x2ZSIsInJlamVjdCIsImRvRmluZHZhbHVlIiwib24iLCJGSU5EVkFMVUUiLCJ0YXJnZXROb2RlIiwib25Db21tYW5kIiwiaXNOb2RlRXhpc3QiLCJudW0iLCJkaXN0YW5jZSIsInB1c2giLCJBRERfS05PREUiLCJnZXRLYnVja2V0TnVtIiwiZGF0YWxpbmsiLCJuZXR3b3JrIiwicGFyc2UiLCJyZXNwb25zZSIsIm1haW50YWluIiwiZm9yRWFjaCIsImZpbHRlciIsImlueCIsInNwbGljZSIsImxlbmd0aCIsInByb3h5IiwiciIsIldlYlJUQyIsIm1ha2VPZmZlciIsImNvbm5lY3RpbmciLCJzdG9yZSIsInNkcCIsImNvbm5lY3RlZCIsImFkZEZhaWxQZWVyTGlzdCIsIm1ha2VBbnN3ZXIiLCJnZXRQZWVyRnJvbW5vZGVJZCIsImRhdGFjaGFubmVsIiwiY29tbWFuZCIsImthZCIsIm5ldHdvcmtMYXllciIsImRhdGFMaW5rIiwiaW5jbHVkZXMiLCJvblJlcXVlc3QiLCJPTkNPTU1BTkQiLCJhYiIsImpzb24iLCJmaWxlaGFzaCIsIl8iLCJsYWJlbCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7UUFTZ0JBLGEsR0FBQUEsYTs7QUFUaEI7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7Ozs7OztBQUVBLElBQUlDLFNBQVMsRUFBYjs7QUFFTyxTQUFTRCxhQUFULENBQXVCRSxNQUF2QixFQUErQkMsSUFBL0IsRUFBcUNDLElBQXJDLEVBQTJDO0FBQ2hELE1BQUlDLFNBQVM7QUFDWEMsV0FBTyxjQURJO0FBRVhILFVBQU1BLElBRks7QUFHWEQsWUFBUUEsTUFIRztBQUlYRSxVQUFNQSxJQUpLO0FBS1hHLFVBQU1DLEtBQUtDLEdBQUwsRUFMSztBQU1YQyxVQUFNO0FBTkssR0FBYjtBQVFBTCxTQUFPSyxJQUFQLEdBQWMsbUJBQUtDLEtBQUtDLFNBQUwsQ0FBZVAsTUFBZixDQUFMLENBQWQ7QUFDQSxTQUFPTSxLQUFLQyxTQUFMLENBQWVQLE1BQWYsQ0FBUDtBQUNEOztJQUVvQlEsUTtBQUNuQixzQkFBNEI7QUFBQSxRQUFoQkMsT0FBZ0IsdUVBQU4sSUFBTTs7QUFBQTs7QUFDMUIsUUFBSUEsWUFBWSxJQUFoQixFQUFzQjtBQUNwQkMsY0FBUUMsR0FBUixDQUFZLFdBQVosRUFBeUJGLE9BQXpCO0FBQ0EsV0FBS0csQ0FBTCxHQUFTLEVBQVQ7QUFDQSxXQUFLZixNQUFMLEdBQWNZLE9BQWQ7QUFDQSxXQUFLSSxRQUFMLEdBQWdCLEVBQWhCO0FBQ0EsV0FBS0MsWUFBTCxHQUFvQixFQUFwQjtBQUNBLFdBQUtDLFlBQUwsR0FBb0Is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YSxhQUFiLEVBQTRCN0MsT0FBTzZGLFlBQVk1RixNQUFuQixDQUE1QjtBQUNBLHFCQUFLb0IsRUFBTCxDQUFRd0IsSUFBUixDQUFhTCxpQkFBSXVCLFNBQWpCLEVBQTRCL0QsT0FBTzZGLFlBQVk1RixNQUFuQixDQUE1QjtBQUNBRCxxQkFBTzZGLFlBQVk1RixNQUFuQixJQUE2QixFQUE3QjtBQUNELGFBTEQsTUFLTztBQUNMYSxzQkFBUUMsR0FBUixDQUNFLGdCQURGLEVBRUV3RixRQUZGLEVBR0UsT0FBSzlFLEtBQUwsQ0FBV2hCLElBQVgsQ0FBZ0JvRixZQUFZNUYsTUFBNUIsQ0FIRjtBQUtEO0FBQ0Y7QUFDRixTQW5CRCxDQW1CRSxPQUFPdUcsQ0FBUCxFQUFVO0FBQ1YsY0FBSSxDQUFDeEcsT0FBTzZGLFlBQVk1RixNQUFuQixDQUFMLEVBQWlDO0FBQy9CRCxtQkFBTzZGLFlBQVk1RixNQUFuQixJQUE2QixFQUE3QjtBQUNEO0FBQ0RELGlCQUFPNkYsWUFBWTVGLE1BQW5CLEVBQTJCb0UsSUFBM0IsQ0FBZ0NnQyxFQUFoQztBQUNEO0FBQ0YsT0EzQkQ7QUE0QkFQLGNBQVFELFlBQVlZLEtBQXBCLEVBQTJCWixZQUFZMUYsSUFBdkM7QUFDRDs7Ozs7O2tCQXpSa0JTLFEiLCJmaWxlIjoiS2FkZW1saWEuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgV2ViUlRDIGZyb20gXCJzaW1wbGUtZGF0YWNoYW5uZWxcIjtcbmltcG9ydCBIZWxwZXIgZnJvbSBcIi4vS1V0aWxcIjtcbmltcG9ydCBFdmVudHMgZnJvbSBcImV2ZW50c1wiO1xuaW1wb3J0IHNoYTEgZnJvbSBcInNoYTFcIjtcbmltcG9ydCBLUmVzcG9uZGVyIGZyb20gXCIuL0tSZXNwb25kZXJcIjtcbmltcG9ydCBkZWYgZnJvbSBcIi4vS0NvbnN0XCI7XG5cbmxldCBidWZmZXIgPSB7fTtcblxuZXhwb3J0IGZ1bmN0aW9uIG5ldHdvcmtGb3JtYXQobm9kZUlkLCB0eXBlLCBkYXRhKSB7XG4gIGxldCBwYWNrZXQgPSB7XG4gICAgbGF5ZXI6IFwibmV0d29ya0xheWVyXCIsXG4gICAgdHlwZTogdHlwZSxcbiAgICBub2RlSWQ6IG5vZGVJZCxcbiAgICBkYXRhOiBkYXRhLFxuICAgIGRhdGU6IERhdGUubm93KCksXG4gICAgaGFzaDogXCJcIlxuICB9O1xuICBwYWNrZXQuaGFzaCA9IHNoYTEoSlNPTi5zdHJpbmdpZnkocGFja2V0KSk7XG4gIHJldHVybiBKU09OLnN0cmluZ2lmeShwYWNrZXQpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBLYWRlbWxpYSB7XG4gIGNvbnN0cnVjdG9yKF9ub2RlSWQgPSBudWxsKSB7XG4gICAgaWYgKF9ub2RlSWQgIT09IG51bGwpIHtcbiAgICAgIGNvbnNvbGUubG9nKFwic3RhcnQga2FkXCIsIF9ub2RlSWQpO1xuICAgICAgdGhpcy5rID0gMjA7XG4gICAgICB0aGlzLm5vZGVJZCA9IF9ub2RlSWQ7XG4gICAgICB0aGlzLmRhdGFMaXN0ID0gW107XG4gICAgICB0aGlzLmtleVZhbHVlTGlzdCA9IFtdO1xuICAgICAgdGhpcy5mYWlsUGVlckxpc3QgPSB7fTtcbiAgICAgIHRoaXMucmVmID0ge307XG4gICAgICB0aGlzLmV2ID0gbmV3IEV2ZW50cy5FdmVudEVtaXR0ZXIoKTtcbiAgICAgIHRoaXMucGluZ1Jlc3VsdCA9IHt9O1xuICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgaXNPZmZlcjogZmFsc2UsXG4gICAgICAgIGZpbmROb2RlOiBcIlwiLFxuICAgICAgICBidWZmZXI6IHt9LFxuICAgICAgICBoYXNoOiB7fVxuICAgICAgfTtcblxuICAgICAgdGhpcy5rYnVja2V0cyA9IG5ldyBBcnJheSgxNjApO1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCAxNjA7IGkrKykge1xuICAgICAgICBsZXQga2J1Y2tldCA9IFtdO1xuICAgICAgICB0aGlzLmtidWNrZXRzW2ldID0ga2J1Y2tldDtcbiAgICAgIH1cblxuICAgICAgdGhpcy5mID0gbmV3IEhlbHBlcih0aGlzLmssIHRoaXMua2J1Y2tldHMpO1xuICAgICAgdGhpcy5rcmVzcG9uZGVyID0gbmV3IEtSZXNwb25kZXIodGhpcyk7XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgcGluZyhwZWVyKSB7XG4gICAgY29uc29sZS5sb2coXCJwaW5nXCIpO1xuXG4gICAgY29uc3Qgc2VuZERhdGEgPSB7IHRhcmdldDogcGVlci5ub2RlSWQgfTtcbiAgICBwZWVyLnNlbmQobmV0d29ya0Zvcm1hdCh0aGlzLm5vZGVJZCwgZGVmLlBJTkcsIHNlbmREYXRhKSwgXCJrYWRcIik7XG5cbiAgICB0aGlzLnBpbmdSZXN1bHRbcGVlci5ub2RlSWRdID0gZmFsc2U7XG5cbiAgICBhd2FpdCBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIGlmICh0aGlzLnBpbmdSZXN1bHRbcGVlci5ub2RlSWRdKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwicGluZyBzdWNjZXNzXCIpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwicGluZyBmYWlsXCIsIHBlZXIubm9kZUlkKTtcbiAgICAgICAgcGVlci5pc0Rpc2Nvbm5lY3RlZCA9IHRydWU7XG4gICAgICAgIHRoaXMuY2xlYW5EaXNjb24oKTtcbiAgICAgICAgdGhpcy5ldi5lbWl0KGRlZi5ESVNDT05ORUNUX0tOT0RFKTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH0sIDMgKiAxMDAwKTtcbiAgfVxuXG4gIHN0b3JlRm9ybWF0KHNlbmRlciwga2V5LCB2YWx1ZSkge1xuICAgIGNvbnN0IHNlbmREYXRhID0ge1xuICAgICAgc2VuZGVyLFxuICAgICAga2V5LFxuICAgICAgdmFsdWVcbiAgICB9O1xuICAgIHJldHVybiBuZXR3b3JrRm9ybWF0KHRoaXMubm9kZUlkLCBkZWYuU1RPUkUsIHNlbmREYXRhKTtcbiAgfVxuXG4gIHN0b3JlKHNlbmRlciwga2V5LCB2YWx1ZSkge1xuICAgIGNvbnN0IHBlZXIgPSB0aGlzLmYuZ2V0Q2xvc2VFc3RQZWVyKGtleSk7XG5cbiAgICBjb25zb2xlLmxvZyhkZWYuU1RPUkUsIFwibmV4dFwiLCBwZWVyLm5vZGVJZCwgXCJ0YXJnZXRcIiwga2V5KTtcblxuICAgIGNvbnN0IHJlc3VsdCA9IHRoaXMucGluZyhwZWVyKTtcblxuICAgIGlmIChyZXN1bHQpIHtcbiAgICAgIHBlZXIuc2VuZCh0aGlzLnN0b3JlRm9ybWF0KHNlbmRlciwga2V5LCB2YWx1ZSksIFwia2FkXCIpO1xuICAgICAgY29uc29sZS5sb2coXCJzdG9yZSBkb25lXCIsIHRoaXMuc3RvcmVGb3JtYXQoc2VuZGVyLCBrZXksIHZhbHVlKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUubG9nKFwic3RvcmUgZmFpbGVcIik7XG4gICAgfVxuICB9XG5cbiAgZmluZE5vZGUodGFyZ2V0SWQsIHBlZXIpIHtcbiAgICBjb25zdCByZXN1bHQgPSB0aGlzLnBpbmcocGVlcik7XG4gICAgaWYgKHJlc3VsdCkge1xuICAgICAgY29uc29sZS5sb2coXCJmaW5kbm9kZVwiLCB0YXJnZXRJZCk7XG4gICAgICB0aGlzLnN0YXRlLmZpbmROb2RlID0gdGFyZ2V0SWQ7XG4gICAgICBjb25zdCBzZW5kRGF0YSA9IHsgdGFyZ2V0S2V5OiB0YXJnZXRJZCB9O1xuICAgICAgcGVlci5zZW5kKG5ldHdvcmtGb3JtYXQodGhpcy5ub2RlSWQsIGRlZi5GSU5ETk9ERSwgc2VuZERhdGEpLCBcImthZFwiKTtcbiAgICB9XG4gIH1cblxuICBmaW5kVmFsdWUobm9kZUlkLCBrZXkpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgdGhpcy5kb0ZpbmR2YWx1ZShub2RlSWQsIGtleSk7XG4gICAgICB0aGlzLmV2Lm9uKGRlZi5GSU5EVkFMVUUsIGRhdGEgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZyhcImZpbmRWYWx1ZSBzdWNjZXNzXCIpO1xuICAgICAgICByZXNvbHZlKGRhdGEpO1xuICAgICAgfSk7XG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgY29uc29sZS5sb2coXCJmaW5kVmFsdWUgZmFpbFwiKTtcbiAgICAgICAgcmVqZWN0KCk7XG4gICAgICB9LCAxMCAqIDEwMDApO1xuICAgIH0pO1xuICB9XG5cbiAgZG9GaW5kdmFsdWUobm9kZUlkLCBrZXkpIHtcbiAgICBjb25zdCBwZWVyID0gdGhpcy5mLmdldENsb3NlRXN0UGVlcihub2RlSWQpO1xuICAgIGNvbnN0IHJlc3VsdCA9IHRoaXMucGluZyhwZWVyKTtcbiAgICBpZiAocmVzdWx0KSB7XG4gICAgICBwZWVyLnNlbmQoXG4gICAgICAgIG5ldHdvcmtGb3JtYXQodGhpcy5ub2RlSWQsIGRlZi5GSU5EVkFMVUUsIHtcbiAgICAgICAgICB0YXJnZXROb2RlOiBub2RlSWQsXG4gICAgICAgICAgdGFyZ2V0S2V5OiBrZXlcbiAgICAgICAgfSksXG4gICAgICAgIFwia2FkXCJcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgYWRka25vZGUocGVlcikge1xuICAgIHBlZXIuZXYub24oXCJkYXRhXCIsIGRhdGEgPT4ge1xuICAgICAgY29uc29sZS5sb2coXCJvbiBkYXRhXCIsIGRhdGEpO1xuICAgICAgdGhpcy5vbkNvbW1hbmQoZGF0YSk7XG4gICAgfSk7XG5cbiAgICBwZWVyLmV2Lm9uKFwiZGlzY29ubmVjdFwiLCAoKSA9PiB7XG4gICAgICBjb25zb2xlLmxvZyhcImthZCBub2RlIGRpc2Nvbm5lY3RlZFwiKTtcbiAgICAgIHRoaXMuY2xlYW5EaXNjb24oKTtcbiAgICB9KTtcblxuICAgIGlmICghdGhpcy5mLmlzTm9kZUV4aXN0KHBlZXIubm9kZUlkKSkge1xuICAgICAgY29uc3QgbnVtID0gdGhpcy5mLmRpc3RhbmNlKHRoaXMubm9kZUlkLCBwZWVyLm5vZGVJZCk7XG4gICAgICBjb25zdCBrYnVja2V0ID0gdGhpcy5rYnVja2V0c1tudW1dO1xuICAgICAga2J1Y2tldC5wdXNoKHBlZXIpO1xuXG4gICAgICBjb25zb2xlLmxvZyhcImFkZGtub2RlIGtidWNrZXRzXCIsIFwicGVlci5ub2RlSWQ6XCIsIHBlZXIubm9kZUlkKTtcbiAgICAgIHRoaXMuZXYuZW1pdChkZWYuQUREX0tOT0RFKTtcblxuICAgICAgaWYgKHRoaXMuZi5nZXRLYnVja2V0TnVtKCkgPCB0aGlzLmspIHtcbiAgICAgICAgdGhpcy5maW5kTm9kZSh0aGlzLm5vZGVJZCwgcGVlcik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmxvZyhcImtidWNrZXQgcmVhZHlcIiwgdGhpcy5mLmdldEtidWNrZXROdW0oKSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgb25SZXF1ZXN0KGRhdGFsaW5rKSB7XG4gICAgY29uc3QgbmV0d29yayA9IEpTT04ucGFyc2UoZGF0YWxpbmspO1xuICAgIHRoaXMua3Jlc3BvbmRlci5yZXNwb25zZShuZXR3b3JrLnR5cGUsIG5ldHdvcmspO1xuICAgIHRoaXMubWFpbnRhaW4obmV0d29yayk7XG4gIH1cblxuICBjbGVhbkRpc2NvbigpIHtcbiAgICB0aGlzLmtidWNrZXRzLmZvckVhY2goKGtidWNrZXQsIGkpID0+IHtcbiAgICAgIHRoaXMua2J1Y2tldHNbaV0gPSBrYnVja2V0LmZpbHRlcihwZWVyID0+ICFwZWVyLmlzRGlzY29ubmVjdGVkKTtcbiAgICB9KTtcbiAgfVxuXG4gIG1haW50YWluKG5ldHdvcmspIHtcbiAgICBjb25zdCBpbnggPSB0aGlzLmYuZGlzdGFuY2UodGhpcy5ub2RlSWQsIG5ldHdvcmsubm9kZUlkKTtcbiAgICBjb25zdCBrYnVja2V0ID0gdGhpcy5rYnVja2V0c1tpbnhdO1xuXG4gICAga2J1Y2tldC5mb3JFYWNoKChwZWVyLCBpKSA9PiB7XG4gICAgICBpZiAocGVlci5ub2RlSWQgPT09IG5ldHdvcmsubm9kZUlkKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwibWFpbnRhaW5cIiwgXCJNb3Zlc8KgaXTCoHRvwqB0aGXCoHRhaWzCoG9mwqB0aGXCoGxpc3RcIik7XG4gICAgICAgIGtidWNrZXQuc3BsaWNlKGksIDEpO1xuICAgICAgICBrYnVja2V0LnB1c2gocGVlcik7XG4gICAgICAgIHJldHVybiAwO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgaWYgKGtidWNrZXQubGVuZ3RoID4gdGhpcy5rKSB7XG4gICAgICBjb25zb2xlLmxvZyhcIm1haW50YWluXCIsIFwiYnVja2V0IGZ1bGxlZFwiLCBuZXR3b3JrLm5vZGVJZCk7XG4gICAgICAvL+OCquODs+ODqeOCpOODs+OBi+OBqeOBhuOBi+OBr3dydGPjga7nibnmgKfkuIrluLjjgavjgo/jgYvjgaPjgabjgYTjgovjga7jgafjgq3jg6Xjg7xcbiAgICAgIGtidWNrZXQuc3BsaWNlKDAsIDEpO1xuICAgIH1cbiAgfVxuXG4gIGFkZEZhaWxQZWVyTGlzdCh0YXJnZXQpIHtcbiAgICBpZiAodGhpcy5mYWlsUGVlckxpc3RbdGFyZ2V0XSkge1xuICAgICAgdGhpcy5mYWlsUGVlckxpc3RbdGFyZ2V0XSA9IHRoaXMuZmFpbFBlZXJMaXN0W3RhcmdldF0gKyAxO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmZhaWxQZWVyTGlzdFt0YXJnZXRdID0gMDtcbiAgICB9XG4gIH1cblxuICBvZmZlcih0YXJnZXQsIHByb3h5ID0gbnVsbCkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjb25zdCByID0gdGhpcy5yZWY7XG4gICAgICBjb25zdCBwZWVyID0gKHJbdGFyZ2V0XSA9IG5ldyBXZWJSVEMoKSk7XG4gICAgICBwZWVyLm1ha2VPZmZlcigpO1xuICAgICAgcGVlci5jb25uZWN0aW5nKHRhcmdldCk7XG5cbiAgICAgIHBlZXIuZXYub24oXCJzaWduYWxcIiwgc2RwID0+IHtcbiAgICAgICAgY29uc29sZS5sb2coXCJrYWQgb2ZmZXIgc3RvcmVcIiwgdGFyZ2V0KTtcbiAgICAgICAgaWYgKHRoaXMuZi5nZXRDbG9zZUVzdFBlZXIodGFyZ2V0KSAhPT0gdGFyZ2V0KVxuICAgICAgICAgIHRoaXMuc3RvcmUodGhpcy5ub2RlSWQsIHRhcmdldCwgeyBzZHAsIHByb3h5IH0pO1xuICAgICAgfSk7XG5cbiAgICAgIHBlZXIuZXYub24oXCJjb25uZWN0XCIsICgpID0+IHtcbiAgICAgICAgY29uc29sZS5sb2coXCJrYWQgb2ZmZXIgY29ubmVjdGVkXCIsIHRhcmdldCk7XG4gICAgICAgIGNvbnNvbGUubG9nKHRoaXMua2J1Y2tldHMpO1xuICAgICAgICByW3RhcmdldF0uY29ubmVjdGVkKCk7XG4gICAgICAgIHJlc29sdmUocGVlcik7XG4gICAgICB9KTtcblxuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHRoaXMuYWRkRmFpbFBlZXJMaXN0KHRhcmdldCk7XG4gICAgICAgIHJlamVjdChcInRpbWVvdXRcIik7XG4gICAgICB9LCAzICogMTAwMCk7XG4gICAgfSk7XG4gIH1cblxuICBhbnN3ZXIodGFyZ2V0LCBzZHAsIHByb3h5ID0gbnVsbCkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjb25zdCByID0gdGhpcy5yZWY7XG4gICAgICBjb25zdCBwZWVyID0gKHJbdGFyZ2V0XSA9IG5ldyBXZWJSVEMoKSk7XG4gICAgICBwZWVyLm1ha2VBbnN3ZXIoc2RwKTtcbiAgICAgIHBlZXIuY29ubmVjdGluZyh0YXJnZXQpO1xuICAgICAgY29uc29sZS5sb2coXCJrYWQgYW5zd2VyXCIsIHRhcmdldCk7XG5cbiAgICAgIHBlZXIuZXYub24oXCJzaWduYWxcIiwgc2RwID0+IHtcbiAgICAgICAgdGhpcy5mXG4gICAgICAgICAgLmdldFBlZXJGcm9tbm9kZUlkKHByb3h5KVxuICAgICAgICAgIC5zZW5kKHRoaXMuc3RvcmVGb3JtYXQodGhpcy5ub2RlSWQsIHRhcmdldCwgeyBzZHAgfSksIFwia2FkXCIpO1xuICAgICAgfSk7XG5cbiAgICAgIHBlZXIuZXYub24oXCJjb25uZWN0XCIsICgpID0+IHtcbiAgICAgICAgY29uc29sZS5sb2coXCJrYWQgYW5zd2VyIGNvbm5lY3RlZFwiLCB0YXJnZXQpO1xuICAgICAgICBjb25zb2xlLmxvZyh0aGlzLmtidWNrZXRzKTtcbiAgICAgICAgcGVlci5jb25uZWN0ZWQoKTtcblxuICAgICAgICByZXNvbHZlKHBlZXIpO1xuICAgICAgfSk7XG5cbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICB0aGlzLmFkZEZhaWxQZWVyTGlzdCh0YXJnZXQpO1xuICAgICAgICByZWplY3QoXCJ0aW1lb3V0XCIpO1xuICAgICAgfSwgMyAqIDEwMDApO1xuICAgIH0pO1xuICB9XG5cbiAgb25Db21tYW5kKGRhdGFjaGFubmVsKSB7XG4gICAgY29uc3QgY29tbWFuZCA9IHt9O1xuXG4gICAgY29tbWFuZC5rYWQgPSBkYXRhTGluayA9PiB7XG4gICAgICBjb25zdCBuZXR3b3JrTGF5ZXIgPSBKU09OLnBhcnNlKGRhdGFMaW5rKTtcblxuICAgICAgaWYgKCFKU09OLnN0cmluZ2lmeSh0aGlzLmRhdGFMaXN0KS5pbmNsdWRlcyhuZXR3b3JrTGF5ZXIuaGFzaCkpIHtcbiAgICAgICAgdGhpcy5kYXRhTGlzdC5wdXNoKG5ldHdvcmtMYXllci5oYXNoKTtcblxuICAgICAgICB0aGlzLmNsZWFuRGlzY29uKCk7XG4gICAgICAgIHRoaXMub25SZXF1ZXN0KGRhdGFMaW5rKTtcbiAgICAgICAgdGhpcy5ldi5lbWl0KGRlZi5PTkNPTU1BTkQsIG5ldHdvcmtMYXllcik7XG4gICAgICB9XG4gICAgfTtcblxuICAgIGNvbW1hbmQuZGF0YSA9IGFiID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKFwicmVjZWl2ZWQgYWJcIiwgYWIpO1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QganNvbiA9IEpTT04ucGFyc2UoYWIpO1xuICAgICAgICBpZiAoanNvbi50eXBlID09PSBcInN0YXJ0XCIpIHtcbiAgICAgICAgICB0aGlzLnN0YXRlLmhhc2hbZGF0YWNoYW5uZWwubm9kZUlkXSA9IGpzb24uZGF0YTtcbiAgICAgICAgfSBlbHNlIGlmIChqc29uLnR5cGUgPT09IFwiZW5kXCIpIHtcbiAgICAgICAgICBjb25zdCBmaWxlaGFzaCA9IHNoYTEoYnVmZmVyW2RhdGFjaGFubmVsLm5vZGVJZF0pO1xuICAgICAgICAgIGlmIChmaWxlaGFzaCA9PT0gdGhpcy5zdGF0ZS5oYXNoW2RhdGFjaGFubmVsLm5vZGVJZF0pIHtcbiAgICAgICAgICAgIHRoaXMua2V5VmFsdWVMaXN0W2ZpbGVoYXNoXSA9IGJ1ZmZlcltkYXRhY2hhbm5lbC5ub2RlSWRdO1xuICAgICAgICAgICAgdGhpcy5ldi5lbWl0KFwicmVjZWl2ZUZpbGVcIiwgYnVmZmVyW2RhdGFjaGFubmVsLm5vZGVJZF0pO1xuICAgICAgICAgICAgdGhpcy5ldi5lbWl0KGRlZi5GSU5EVkFMVUUsIGJ1ZmZlcltkYXRhY2hhbm5lbC5ub2RlSWRdKTtcbiAgICAgICAgICAgIGJ1ZmZlcltkYXRhY2hhbm5lbC5ub2RlSWRdID0gW107XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICAgICAgICBcImhhc2ggaW5jb3JyZWN0XCIsXG4gICAgICAgICAgICAgIGZpbGVoYXNoLFxuICAgICAgICAgICAgICB0aGlzLnN0YXRlLmhhc2hbZGF0YWNoYW5uZWwubm9kZUlkXVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKF8pIHtcbiAgICAgICAgaWYgKCFidWZmZXJbZGF0YWNoYW5uZWwubm9kZUlkXSkge1xuICAgICAgICAgIGJ1ZmZlcltkYXRhY2hhbm5lbC5ub2RlSWRdID0gW107XG4gICAgICAgIH1cbiAgICAgICAgYnVmZmVyW2RhdGFjaGFubmVsLm5vZGVJZF0ucHVzaChhYik7XG4gICAgICB9XG4gICAgfTtcbiAgICBjb21tYW5kW2RhdGFjaGFubmVsLmxhYmVsXShkYXRhY2hhbm5lbC5kYXRhKTtcbiAgfVxufVxuIl19
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _util = require("../lib/util");

var util = _interopRequireWildcard(_util);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var KadFunc = function () {
  function KadFunc(kLength, _kbuckets) {
    _classCallCheck(this, KadFunc);

    this.kLength = kLength;
    this.kbuckets = _kbuckets;
  }

  _createClass(KadFunc, [{
    key: "distance",
    value: function distance(a16, b16) {
      var a = util.convertBase(a16, 16, 2).toString().split("");
      var b = util.convertBase(b16, 16, 2).toString().split("");

      var xor = void 0;
      if (a.length > b.length) xor = new Array(a.length);else xor = new Array(b.length);

      for (var _i = 0; _i < xor.length; _i++) {
        xor[_i] = parseInt(a[_i], 10) ^ parseInt(b[_i], 10);
      }
      var xored = xor.toString().replace(/,/g, "");
      var n10 = parseInt(util.convertBase(xored, 2, 10).toString(), 10);

      var n = void 0,
          i = void 0;
      for (i = 0;; i++) {
        n = 2 ** i;
        if (n > n10) break;
      }

      return i;
    }
  }, {
    key: "getCloseEstPeer",
    value: function getCloseEstPeer(_key) {
      var _this = this;

      var opt = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : { excludeId: null };

      var mini = 160;
      var closePeer = void 0;
      this.kbuckets.forEach(function (kbucket) {
        kbucket.forEach(function (peer) {
          console.log("distance", peer.nodeId, _this.distance(_key, peer.nodeId));
          if (opt.excludeId === null || opt.excludeId !== peer.nodeId) {
            if (_this.distance(_key, peer.nodeId) < mini) {
              mini = _this.distance(_key, peer.nodeId);
              closePeer = peer;
            }
          }
        });
      });
      return closePeer;
    }
  }, {
    key: "getCloseEstPeersList",
    value: function getCloseEstPeersList(key) {
      var _this2 = this;

      var opt = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : { excludeId: null };

      var dist = this.getCloseEstDist(key);
      var list = [];
      this.getAllPeers().forEach(function (peer) {
        if (opt.excludeId === null || opt.excludeId !== peer.nodeId) {
          if (_this2.distance(key, peer.nodeId) === dist) {
            list.push(peer);
          }
        }
      });
      return list;
    }
  }, {
    key: "getCloseEstIdsList",
    value: function getCloseEstIdsList(key) {
      var opt = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : { excludeId: null };

      var peers = this.getCloseEstPeersList(key, opt);
      var list = [];
      peers.forEach(function (peer) {
        return list.push(peer.nodeId);
      });
      return list;
    }
  }, {
    key: "getAllPeers",
    value: function getAllPeers() {
      var peers = [];
      this.kbuckets.forEach(function (kbucket) {
        kbucket.forEach(function (peer) {
          peers.push(peer);
        });
      });
      return peers;
    }
  }, {
    key: "getAllPeerIds",
    value: function getAllPeerIds() {
      var peerIds = [];
      this.getAllPeers().forEach(function (peer) {
        peerIds.push(peer.nodeId);
      });
      return peerIds;
    }
  }, {
    key: "getPeerNum",
    value: function getPeerNum() {
      return this.getAllPeers.length;
    }
  }, {
    key: "getKbucketNum",
    value: function getKbucketNum() {
      var num = 0;
      this.kbuckets.forEach(function (kbucket) {
        if (kbucket.length > 0) num++;
      });
      return num;
    }
  }, {
    key: "getCloseIDs",
    value: function getCloseIDs(targetID) {
      var _this3 = this;

      var list = [];
      this.getAllPeers().forEach(function (peer) {
        if (peer.nodeId !== targetID) {
          if (list.length < _this3.kLength) {
            list.push(peer.nodeId);
          } else {
            for (var i = 0; i < list.length; i++) {
              if (_this3.distance(list[i], targetID) > _this3.distance(peer.nodeId, targetID)) {
                list[i] = peer.nodeId;
              }
            }
          }
        }
      });
      return list;
    }
  }, {
    key: "getCloseEstDist",
    value: function getCloseEstDist(_key) {
      var _this4 = this;

      var mini = 160;
      this.kbuckets.forEach(function (kbucket) {
        kbucket.forEach(function (peer) {
          if (_this4.distance(_key, peer.nodeId) < mini) {
            mini = _this4.distance(_key, peer.nodeId);
          }
        });
      });
      return mini;
    }
  }, {
    key: "getPeerFromnodeId",
    value: function getPeerFromnodeId(nodeId) {
      return this.getAllPeers().find(function (peer) {
        return peer.nodeId === nodeId;
      });
    }
  }, {
    key: "isNodeExist",
    value: function isNodeExist(nodeId) {
      return this.getAllPeerIds().includes(nodeId);
    }
  }, {
    key: "isNodeIdCloseEst",
    value: function isNodeIdCloseEst(nodeId, target) {
      var peer = this.getCloseEstPeer(target);
      var peerDist = this.distance(peer.nodeId, target);
      var myDist = this.distance(nodeId, target);
      console.log("isNodeIdCloseEst peerDist", peerDist, "myDist", myDist);
      if (myDist <= peerDist) {
        return true;
      } else {
        return false;
      }
    }
  }, {
    key: "isSomeOfKbucketFull",
    value: function isSomeOfKbucketFull() {
      var _this5 = this;

      var full = false;
      this.kbuckets.forEach(function (kbucket) {
        if (kbucket.length === _this5.kLength) {
          full = true;
          return 0;
        }
      });
      if (full) {
        console.log("isSomeOfKbucketFull");
      }
      return full;
    }
  }]);

  return KadFunc;
}();

exports.default = KadFunc;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9rYWQvS1V0aWwuanMiXSwibmFtZXMiOlsidXRpbCIsIkthZEZ1bmMiLCJrTGVuZ3RoIiwiX2tidWNrZXRzIiwia2J1Y2tldHMiLCJhMTYiLCJiMTYiLCJhIiwiY29udmVydEJhc2UiLCJ0b1N0cmluZyIsInNwbGl0IiwiYiIsInhvciIsImxlbmd0aCIsIkFycmF5IiwiaSIsInBhcnNlSW50IiwieG9yZWQiLCJyZXBsYWNlIiwibjEwIiwibiIsIl9rZXkiLCJvcHQiLCJleGNsdWRlSWQiLCJtaW5pIiwiY2xvc2VQZWVyIiwiZm9yRWFjaCIsImtidWNrZXQiLCJjb25zb2xlIiwibG9nIiwicGVlciIsIm5vZGVJZCIsImRpc3RhbmNlIiwia2V5IiwiZGlzdCIsImdldENsb3NlRXN0RGlzdCIsImxpc3QiLCJnZXRBbGxQZWVycyIsInB1c2giLCJwZWVycyIsImdldENsb3NlRXN0UGVlcnNMaXN0IiwicGVlcklkcyIsIm51bSIsInRhcmdldElEIiwiZmluZCIsImdldEFsbFBlZXJJZHMiLCJpbmNsdWRlcyIsInRhcmdldCIsImdldENsb3NlRXN0UGVlciIsInBlZXJEaXN0IiwibXlEaXN0IiwiZnVsbCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFBQTs7SUFBWUEsSTs7Ozs7O0lBRVNDLE87QUFDbkIsbUJBQVlDLE9BQVosRUFBcUJDLFNBQXJCLEVBQWdDO0FBQUE7O0FBQzlCLFNBQUtELE9BQUwsR0FBZUEsT0FBZjtBQUNBLFNBQUtFLFFBQUwsR0FBZ0JELFNBQWhCO0FBQ0Q7Ozs7NkJBRVFFLEcsRUFBS0MsRyxFQUFLO0FBQ2pCLFVBQUlDLElBQUlQLEtBQ0xRLFdBREssQ0FDT0gsR0FEUCxFQUNZLEVBRFosRUFDZ0IsQ0FEaEIsRUFFTEksUUFGSyxHQUdMQyxLQUhLLENBR0MsRUFIRCxDQUFSO0FBSUEsVUFBSUMsSUFBSVgsS0FDTFEsV0FESyxDQUNPRixHQURQLEVBQ1ksRUFEWixFQUNnQixDQURoQixFQUVMRyxRQUZLLEdBR0xDLEtBSEss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b0IsUUFBekMsRUFBbUQsUUFBbkQsRUFBNkRDLE1BQTdEO0FBQ0EsVUFBSUEsVUFBVUQsUUFBZCxFQUF3QjtBQUN0QixlQUFPLElBQVA7QUFDRCxPQUZELE1BRU87QUFDTCxlQUFPLEtBQVA7QUFDRDtBQUNGOzs7MENBRXFCO0FBQUE7O0FBQ3BCLFVBQUlFLE9BQU8sS0FBWDtBQUNBLFdBQUsvQyxRQUFMLENBQWNzQixPQUFkLENBQXNCLG1CQUFXO0FBQy9CLFlBQUlDLFFBQVFkLE1BQVIsS0FBbUIsT0FBS1gsT0FBNUIsRUFBcUM7QUFDbkNpRCxpQkFBTyxJQUFQO0FBQ0EsaUJBQU8sQ0FBUDtBQUNEO0FBQ0YsT0FMRDtBQU1BLFVBQUlBLElBQUosRUFBVTtBQUNSdkIsZ0JBQVFDLEdBQVIsQ0FBWSxxQkFBWjtBQUNEO0FBQ0QsYUFBT3NCLElBQVA7QUFDRDs7Ozs7O2tCQXpLa0JsRCxPIiwiZmlsZSI6IktVdGlsLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgdXRpbCBmcm9tIFwiLi4vbGliL3V0aWxcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgS2FkRnVuYyB7XG4gIGNvbnN0cnVjdG9yKGtMZW5ndGgsIF9rYnVja2V0cykge1xuICAgIHRoaXMua0xlbmd0aCA9IGtMZW5ndGg7XG4gICAgdGhpcy5rYnVja2V0cyA9IF9rYnVja2V0cztcbiAgfVxuXG4gIGRpc3RhbmNlKGExNiwgYjE2KSB7XG4gICAgbGV0IGEgPSB1dGlsXG4gICAgICAuY29udmVydEJhc2UoYTE2LCAxNiwgMilcbiAgICAgIC50b1N0cmluZygpXG4gICAgICAuc3BsaXQoXCJcIik7XG4gICAgbGV0IGIgPSB1dGlsXG4gICAgICAuY29udmVydEJhc2UoYjE2LCAxNiwgMilcbiAgICAgIC50b1N0cmluZygpXG4gICAgICAuc3BsaXQoXCJcIik7XG5cbiAgICBsZXQgeG9yO1xuICAgIGlmIChhLmxlbmd0aCA+IGIubGVuZ3RoKSB4b3IgPSBuZXcgQXJyYXkoYS5sZW5ndGgpO1xuICAgIGVsc2UgeG9yID0gbmV3IEFycmF5KGIubGVuZ3RoKTtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgeG9yLmxlbmd0aDsgaSsrKSB7XG4gICAgICB4b3JbaV0gPSBwYXJzZUludChhW2ldLCAxMCkgXiBwYXJzZUludChiW2ldLCAxMCk7XG4gICAgfVxuICAgIGxldCB4b3JlZCA9IHhvci50b1N0cmluZygpLnJlcGxhY2UoLywvZywgXCJcIik7XG4gICAgbGV0IG4xMCA9IHBhcnNlSW50KHV0aWwuY29udmVydEJhc2UoeG9yZWQsIDIsIDEwKS50b1N0cmluZygpLCAxMCk7XG5cbiAgICBsZXQgbiwgaTtcbiAgICBmb3IgKGkgPSAwOyA7IGkrKykge1xuICAgICAgbiA9IDIgKiogaTtcbiAgICAgIGlmIChuID4gbjEwKSBicmVhaztcbiAgICB9XG5cbiAgICByZXR1cm4gaTtcbiAgfVxuXG4gIGdldENsb3NlRXN0UGVlcihfa2V5LCBvcHQgPSB7IGV4Y2x1ZGVJZDogbnVsbCB9KSB7XG4gICAgbGV0IG1pbmkgPSAxNjA7XG4gICAgbGV0IGNsb3NlUGVlcjtcbiAgICB0aGlzLmtidWNrZXRzLmZvckVhY2goa2J1Y2tldCA9PiB7XG4gICAgICBrYnVja2V0LmZvckVhY2gocGVlciA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiZGlzdGFuY2VcIiwgcGVlci5ub2RlSWQsIHRoaXMuZGlzdGFuY2UoX2tleSwgcGVlci5ub2RlSWQpKTtcbiAgICAgICAgaWYgKG9wdC5leGNsdWRlSWQgPT09IG51bGwgfHwgb3B0LmV4Y2x1ZGVJZCAhPT0gcGVlci5ub2RlSWQpIHtcbiAgICAgICAgICBpZiAodGhpcy5kaXN0YW5jZShfa2V5LCBwZWVyLm5vZGVJZCkgPCBtaW5pKSB7XG4gICAgICAgICAgICBtaW5pID0gdGhpcy5kaXN0YW5jZShfa2V5LCBwZWVyLm5vZGVJZCk7XG4gICAgICAgICAgICBjbG9zZVBlZXIgPSBwZWVyO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIGNsb3NlUGVlcjtcbiAgfVxuXG4gIGdldENsb3NlRXN0UGVlcnNMaXN0KGtleSwgb3B0ID0geyBleGNsdWRlSWQ6IG51bGwgfSkge1xuICAgIGNvbnN0IGRpc3QgPSB0aGlzLmdldENsb3NlRXN0RGlzdChrZXkpO1xuICAgIGNvbnN0IGxpc3QgPSBbXTtcbiAgICB0aGlzLmdldEFsbFBlZXJzKCkuZm9yRWFjaChwZWVyID0+IHtcbiAgICAgIGlmIChvcHQuZXhjbHVkZUlkID09PSBudWxsIHx8IG9wdC5leGNsdWRlSWQgIT09IHBlZXIubm9kZUlkKSB7XG4gICAgICAgIGlmICh0aGlzLmRpc3RhbmNlKGtleSwgcGVlci5ub2RlSWQpID09PSBkaXN0KSB7XG4gICAgICAgICAgbGlzdC5wdXNoKHBlZXIpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIGxpc3Q7XG4gIH1cblxuICBnZXRDbG9zZUVzdElkc0xpc3Qoa2V5LCBvcHQgPSB7IGV4Y2x1ZGVJZDogbnVsbCB9KSB7XG4gICAgY29uc3QgcGVlcnMgPSB0aGlzLmdldENsb3NlRXN0UGVlcnNMaXN0KGtleSwgb3B0KTtcbiAgICBjb25zdCBsaXN0ID0gW107XG4gICAgcGVlcnMuZm9yRWFjaChwZWVyID0+IGxpc3QucHVzaChwZWVyLm5vZGVJZCkpO1xuICAgIHJldHVybiBsaXN0O1xuICB9XG5cbiAgZ2V0QWxsUGVlcnMoKSB7XG4gICAgbGV0IHBlZXJzID0gW107XG4gICAgdGhpcy5rYnVja2V0cy5mb3JFYWNoKGtidWNrZXQgPT4ge1xuICAgICAga2J1Y2tldC5mb3JFYWNoKHBlZXIgPT4ge1xuICAgICAgICBwZWVycy5wdXNoKHBlZXIpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHBlZXJzO1xuICB9XG5cbiAgZ2V0QWxsUGVlcklkcygpIHtcbiAgICBsZXQgcGVlcklkcyA9IFtdO1xuICAgIHRoaXMuZ2V0QWxsUGVlcnMoKS5mb3JFYWNoKHBlZXIgPT4ge1xuICAgICAgcGVlcklkcy5wdXNoKHBlZXIubm9kZUlkKTtcbiAgICB9KTtcbiAgICByZXR1cm4gcGVlcklkcztcbiAgfVxuXG4gIGdldFBlZXJOdW0oKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0QWxsUGVlcnMubGVuZ3RoO1xuICB9XG5cbiAgZ2V0S2J1Y2tldE51bSgpIHtcbiAgICBsZXQgbnVtID0gMDtcbiAgICB0aGlzLmtidWNrZXRzLmZvckVhY2goa2J1Y2tldCA9PiB7XG4gICAgICBpZiAoa2J1Y2tldC5sZW5ndGggPiAwKSBudW0rKztcbiAgICB9KTtcbiAgICByZXR1cm4gbnVtO1xuICB9XG4gIFxuICBnZXRDbG9zZUlEcyh0YXJnZXRJRCkge1xuICAgIGxldCBsaXN0ID0gW107XG4gICAgdGhpcy5nZXRBbGxQZWVycygpLmZvckVhY2gocGVlciA9PiB7XG4gICAgICBpZiAocGVlci5ub2RlSWQgIT09IHRhcmdldElEKSB7XG4gICAgICAgIGlmIChsaXN0Lmxlbmd0aCA8IHRoaXMua0xlbmd0aCkge1xuICAgICAgICAgIGxpc3QucHVzaChwZWVyLm5vZGVJZCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgIHRoaXMuZGlzdGFuY2UobGlzdFtpXSwgdGFyZ2V0SUQpID5cbiAgICAgICAgICAgICAgdGhpcy5kaXN0YW5jZShwZWVyLm5vZGVJZCwgdGFyZ2V0SUQpXG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgbGlzdFtpXSA9IHBlZXIubm9kZUlkO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBsaXN0O1xuICB9XG5cbiAgZ2V0Q2xvc2VFc3REaXN0KF9rZXkpIHtcbiAgICBsZXQgbWluaSA9IDE2MDtcbiAgICB0aGlzLmtidWNrZXRzLmZvckVhY2goa2J1Y2tldCA9PiB7XG4gICAgICBrYnVja2V0LmZvckVhY2gocGVlciA9PiB7XG4gICAgICAgIGlmICh0aGlzLmRpc3RhbmNlKF9rZXksIHBlZXIubm9kZUlkKSA8IG1pbmkpIHtcbiAgICAgICAgICBtaW5pID0gdGhpcy5kaXN0YW5jZShfa2V5LCBwZWVyLm5vZGVJZCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIHJldHVybiBtaW5pO1xuICB9XG5cbiAgZ2V0UGVlckZyb21ub2RlSWQobm9kZUlkKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0QWxsUGVlcnMoKS5maW5kKHBlZXIgPT4ge1xuICAgICAgcmV0dXJuIHBlZXIubm9kZUlkID09PSBub2RlSWQ7XG4gICAgfSk7XG4gIH1cblxuICBpc05vZGVFeGlzdChub2RlSWQpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRBbGxQZWVySWRzKCkuaW5jbHVkZXMobm9kZUlkKTtcbiAgfVxuXG4gIGlzTm9kZUlkQ2xvc2VFc3Qobm9kZUlkLCB0YXJnZXQpIHtcbiAgICBjb25zdCBwZWVyID0gdGhpcy5nZXRDbG9zZUVzdFBlZXIodGFyZ2V0KTtcbiAgICBjb25zdCBwZWVyRGlzdCA9IHRoaXMuZGlzdGFuY2UocGVlci5ub2RlSWQsIHRhcmdldCk7XG4gICAgY29uc3QgbXlEaXN0ID0gdGhpcy5kaXN0YW5jZShub2RlSWQsIHRhcmdldCk7XG4gICAgY29uc29sZS5sb2coXCJpc05vZGVJZENsb3NlRXN0IHBlZXJEaXN0XCIsIHBlZXJEaXN0LCBcIm15RGlzdFwiLCBteURpc3QpO1xuICAgIGlmIChteURpc3QgPD0gcGVlckRpc3QpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgaXNTb21lT2ZLYnVja2V0RnVsbCgpIHtcbiAgICBsZXQgZnVsbCA9IGZhbHNlO1xuICAgIHRoaXMua2J1Y2tldHMuZm9yRWFjaChrYnVja2V0ID0+IHtcbiAgICAgIGlmIChrYnVja2V0Lmxlbmd0aCA9PT0gdGhpcy5rTGVuZ3RoKSB7XG4gICAgICAgIGZ1bGwgPSB0cnVlO1xuICAgICAgICByZXR1cm4gMDtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBpZiAoZnVsbCkge1xuICAgICAgY29uc29sZS5sb2coXCJpc1NvbWVPZktidWNrZXRGdWxsXCIpO1xuICAgIH1cbiAgICByZXR1cm4gZnVsbDtcbiAgfVxufVxuIl19
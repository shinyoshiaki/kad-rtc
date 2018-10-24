"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _kadDistance = require("kad-distance");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var KUtil =
/*#__PURE__*/
function () {
  function KUtil(k, kbuckets) {
    _classCallCheck(this, KUtil);

    _defineProperty(this, "kbuckets", void 0);

    _defineProperty(this, "k", void 0);

    this.k = k;
    this.kbuckets = kbuckets;
  }

  _createClass(KUtil, [{
    key: "getAllPeers",
    value: function getAllPeers() {
      return Array.prototype.concat.apply([], this.kbuckets);
    }
  }, {
    key: "getPeer",
    value: function getPeer(targetId) {
      var ans;
      this.getAllPeers().forEach(function (peer) {
        if (peer.nodeId === targetId) ans = peer;
      });
      return ans;
    }
  }, {
    key: "getCloseEstPeersList",
    value: function getCloseEstPeersList(key) {
      var opt = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {
        excludeId: null
      };
      var dist = this.getCloseEstDist(key);
      var list = [];
      this.getAllPeers().forEach(function (peer) {
        if (opt.excludeId === null || opt.excludeId !== peer.nodeId) {
          if ((0, _kadDistance.distance)(key, peer.nodeId) === dist) {
            list.push(peer);
          }
        }
      });
      return list;
    }
  }, {
    key: "getCloseIDs",
    value: function getCloseIDs(targetID) {
      var _this = this;

      var list = [];
      this.getAllPeers().forEach(function (peer) {
        if (peer.nodeId !== targetID) {
          if (list.length < _this.k) {
            console.log("getcloseids push", peer.nodeId);
            list.push(peer.nodeId);
          } else {
            console.log("getcloseids fulled", {
              list: list
            });

            for (var i = 0; i < list.length; i++) {
              if ((0, _kadDistance.distance)(list[i], targetID) > (0, _kadDistance.distance)(peer.nodeId, targetID)) {
                list[i] = peer.nodeId;
                break;
              }
            }
          }
        }
      });
      return list;
    }
  }, {
    key: "getCloseEstIdsList",
    value: function getCloseEstIdsList(key) {
      var opt = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {
        excludeId: null
      };
      var peers = this.getCloseEstPeersList(key, opt);
      var list = [];
      peers.forEach(function (peer) {
        return list.push(peer.nodeId);
      });
      return list;
    }
  }, {
    key: "getPeerFromnodeId",
    value: function getPeerFromnodeId(nodeId) {
      return this.getAllPeers().find(function (peer) {
        return peer.nodeId === nodeId;
      });
    }
  }, {
    key: "getCloseEstPeer",
    value: function getCloseEstPeer(_key) {
      var opt = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {
        excludeId: null
      };
      var mini = 160;
      var closePeer;
      this.kbuckets.forEach(function (kbucket) {
        kbucket.forEach(function (peer) {
          console.log("distance", peer.nodeId, (0, _kadDistance.distance)(_key, peer.nodeId));

          if (opt.excludeId === null || opt.excludeId !== peer.nodeId) {
            if ((0, _kadDistance.distance)(_key, peer.nodeId) < mini) {
              mini = (0, _kadDistance.distance)(_key, peer.nodeId);
              closePeer = peer;
            }
          }
        });
      });
      return closePeer;
    }
  }, {
    key: "getCloseEstDist",
    value: function getCloseEstDist(key) {
      var peers = this.getAllPeers();
      var mini = peers.reduce(function (a, b) {
        if ((0, _kadDistance.distance)(a.nodeId, key) < (0, _kadDistance.distance)(b.nodeId, key)) return a;else return b;
      });
      return (0, _kadDistance.distance)(mini.nodeId, key);
    }
  }, {
    key: "getCloseIds",
    value: function getCloseIds(targetId) {
      var _this2 = this;

      var list = [];
      this.getAllPeers().forEach(function (peer) {
        if (peer.nodeId !== targetId) {
          if (list.length < _this2.k) {
            list.push(peer.nodeId);
          } else {
            for (var i = 0; i < list.length; i++) {
              if ((0, _kadDistance.distance)(list[i], targetId) > (0, _kadDistance.distance)(peer.nodeId, targetId)) {
                list[i] = peer.nodeId;
              }
            }
          }
        }
      });
      return list;
    }
  }, {
    key: "getAllPeerIds",
    value: function getAllPeerIds() {
      return this.getAllPeers().map(function (peer) {
        if (peer) {
          return peer.nodeId;
        }
      });
    }
  }, {
    key: "isPeerExist",
    value: function isPeerExist(id) {
      var ids = this.getAllPeerIds();

      if (ids) {
        return ids.includes(id);
      } else {
        return false;
      }
    }
  }, {
    key: "getPeerNum",
    value: function getPeerNum() {
      var arr = this.getAllPeers();
      return arr.length;
    }
  }, {
    key: "cleanDiscon",
    value: function cleanDiscon() {
      var _this3 = this;

      this.kbuckets.forEach(function (kbucket, i) {
        _this3.kbuckets[i] = kbucket.filter(function (peer) {
          return !peer.isDisconnected;
        });
      });
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
    key: "isNodeExist",
    value: function isNodeExist(nodeId) {
      return this.getAllPeerIds().includes(nodeId);
    }
  }, {
    key: "getClosePeers",
    value: function getClosePeers(targetId) {
      var _this4 = this;

      var list = [];
      this.getAllPeers().forEach(function (peer) {
        if (peer.nodeId !== targetId) {
          if (list.length < _this4.k) {
            list.push(peer);
          } else {
            for (var i = 0; i < list.length; i++) {
              if ((0, _kadDistance.distance)(list[i].nodeId, targetId) > (0, _kadDistance.distance)(peer.nodeId, targetId)) {
                list[i] = peer;
              }
            }
          }
        }
      });
      return list;
    }
  }]);

  return KUtil;
}();

exports.default = KUtil;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9rYWQva1V0aWwudHMiXSwibmFtZXMiOlsiS1V0aWwiLCJrIiwia2J1Y2tldHMiLCJBcnJheSIsInByb3RvdHlwZSIsImNvbmNhdCIsImFwcGx5IiwidGFyZ2V0SWQiLCJhbnMiLCJnZXRBbGxQZWVycyIsImZvckVhY2giLCJwZWVyIiwibm9kZUlkIiwia2V5Iiwib3B0IiwiZXhjbHVkZUlkIiwiZGlzdCIsImdldENsb3NlRXN0RGlzdCIsImxpc3QiLCJwdXNoIiwidGFyZ2V0SUQiLCJsZW5ndGgiLCJjb25zb2xlIiwibG9nIiwiaSIsInBlZXJzIiwiZ2V0Q2xvc2VFc3RQZWVyc0xpc3QiLCJmaW5kIiwiX2tleSIsIm1pbmkiLCJjbG9zZVBlZXIiLCJrYnVja2V0IiwicmVkdWNlIiwiYSIsImIiLCJtYXAiLCJpZCIsImlkcyIsImdldEFsbFBlZXJJZHMiLCJpbmNsdWRlcyIsImFyciIsImZpbHRlciIsImlzRGlzY29ubmVjdGVkIiwibnVtIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQ0E7Ozs7Ozs7Ozs7SUFFcUJBLEs7OztBQUduQixpQkFBWUMsQ0FBWixFQUF1QkMsUUFBdkIsRUFBdUQ7QUFBQTs7QUFBQTs7QUFBQTs7QUFDckQsU0FBS0QsQ0FBTCxHQUFTQSxDQUFUO0FBQ0EsU0FBS0MsUUFBTCxHQUFnQkEsUUFBaEI7QUFDRDs7OztrQ0FFNEI7QUFDM0IsYUFBT0MsS0FBSyxDQUFDQyxTQUFOLENBQWdCQyxNQUFoQixDQUF1QkMsS0FBdkIsQ0FBNkIsRUFBN0IsRUFBaUMsS0FBS0osUUFBdEMsQ0FBUDtBQUNEOzs7NEJBRU9LLFEsRUFBc0M7QUFDNUMsVUFBSUMsR0FBSjtBQUNBLFdBQUtDLFdBQUwsR0FBbUJDLE9BQW5CLENBQTJCLFVBQUFDLElBQUksRUFBSTtBQUNqQyxZQUFJQSxJQUFJLENBQUNDLE1BQUwsS0FBZ0JMLFFBQXBCLEVBQThCQyxHQUFHLEdBQUdHLElBQU47QUFDL0IsT0FGRDtBQUdBLGFBQU9ILEdBQVA7QUFDRDs7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LGdCQUFBQSxJQUFJLENBQUNNLENBQUQsQ0FBSixHQUFVYixJQUFWO0FBQ0Q7QUFDRjtBQUNGO0FBQ0Y7QUFDRixPQWZEO0FBZ0JBLGFBQU9PLElBQVA7QUFDRCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBXZWJSVEMgZnJvbSBcIndlYnJ0YzRtZVwiO1xuaW1wb3J0IHsgZGlzdGFuY2UgfSBmcm9tIFwia2FkLWRpc3RhbmNlXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEtVdGlsIHtcbiAga2J1Y2tldHM6IEFycmF5PEFycmF5PFdlYlJUQz4+O1xuICBrOiBudW1iZXI7XG4gIGNvbnN0cnVjdG9yKGs6IG51bWJlciwga2J1Y2tldHM6IEFycmF5PEFycmF5PFdlYlJUQz4+KSB7XG4gICAgdGhpcy5rID0gaztcbiAgICB0aGlzLmtidWNrZXRzID0ga2J1Y2tldHM7XG4gIH1cblxuICBnZXRBbGxQZWVycygpOiBBcnJheTxXZWJSVEM+IHtcbiAgICByZXR1cm4gQXJyYXkucHJvdG90eXBlLmNvbmNhdC5hcHBseShbXSwgdGhpcy5rYnVja2V0cyk7XG4gIH1cblxuICBnZXRQZWVyKHRhcmdldElkOiBzdHJpbmcpOiBXZWJSVEMgfCB1bmRlZmluZWQge1xuICAgIGxldCBhbnM7XG4gICAgdGhpcy5nZXRBbGxQZWVycygpLmZvckVhY2gocGVlciA9PiB7XG4gICAgICBpZiAocGVlci5ub2RlSWQgPT09IHRhcmdldElkKSBhbnMgPSBwZWVyO1xuICAgIH0pO1xuICAgIHJldHVybiBhbnM7XG4gIH1cblxuICBnZXRDbG9zZUVzdFBlZXJzTGlzdChrZXk6IHN0cmluZywgb3B0ID0geyBleGNsdWRlSWQ6IG51bGwgfSkge1xuICAgIGNvbnN0IGRpc3QgPSB0aGlzLmdldENsb3NlRXN0RGlzdChrZXkpO1xuICAgIGNvbnN0IGxpc3Q6IEFycmF5PFdlYlJUQz4gPSBbXTtcbiAgICB0aGlzLmdldEFsbFBlZXJzKCkuZm9yRWFjaChwZWVyID0+IHtcbiAgICAgIGlmIChvcHQuZXhjbHVkZUlkID09PSBudWxsIHx8IG9wdC5leGNsdWRlSWQgIT09IHBlZXIubm9kZUlkKSB7XG4gICAgICAgIGlmIChkaXN0YW5jZShrZXksIHBlZXIubm9kZUlkKSA9PT0gZGlzdCkge1xuICAgICAgICAgIGxpc3QucHVzaChwZWVyKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBsaXN0O1xuICB9XG5cbiAgZ2V0Q2xvc2VJRHModGFyZ2V0SUQ6IHN0cmluZykge1xuICAgIGxldCBsaXN0OiBBcnJheTxzdHJpbmc+ID0gW107XG4gICAgdGhpcy5nZXRBbGxQZWVycygpLmZvckVhY2gocGVlciA9PiB7XG4gICAgICBpZiAocGVlci5ub2RlSWQgIT09IHRhcmdldElEKSB7XG4gICAgICAgIGlmIChsaXN0Lmxlbmd0aCA8IHRoaXMuaykge1xuICAgICAgICAgIGNvbnNvbGUubG9nKFwiZ2V0Y2xvc2VpZHMgcHVzaFwiLCBwZWVyLm5vZGVJZCk7XG4gICAgICAgICAgbGlzdC5wdXNoKHBlZXIubm9kZUlkKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhcImdldGNsb3NlaWRzIGZ1bGxlZFwiLCB7IGxpc3QgfSk7XG4gICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoZGlzdGFuY2UobGlzdFtpXSwgdGFyZ2V0SUQpID4gZGlzdGFuY2UocGVlci5ub2RlSWQsIHRhcmdldElEKSkge1xuICAgICAgICAgICAgICBsaXN0W2ldID0gcGVlci5ub2RlSWQ7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBsaXN0O1xuICB9XG5cbiAgZ2V0Q2xvc2VFc3RJZHNMaXN0KGtleTogc3RyaW5nLCBvcHQgPSB7IGV4Y2x1ZGVJZDogbnVsbCB9KSB7XG4gICAgY29uc3QgcGVlcnMgPSB0aGlzLmdldENsb3NlRXN0UGVlcnNMaXN0KGtleSwgb3B0KTtcbiAgICBjb25zdCBsaXN0OiBBcnJheTxzdHJpbmc+ID0gW107XG4gICAgcGVlcnMuZm9yRWFjaChwZWVyID0+IGxpc3QucHVzaChwZWVyLm5vZGVJZCkpO1xuICAgIHJldHVybiBsaXN0O1xuICB9XG5cbiAgZ2V0UGVlckZyb21ub2RlSWQobm9kZUlkOiBzdHJpbmcpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRBbGxQZWVycygpLmZpbmQocGVlciA9PiB7XG4gICAgICByZXR1cm4gcGVlci5ub2RlSWQgPT09IG5vZGVJZDtcbiAgICB9KTtcbiAgfVxuXG4gIGdldENsb3NlRXN0UGVlcihfa2V5OiBzdHJpbmcsIG9wdCA9IHsgZXhjbHVkZUlkOiBudWxsIH0pOiBXZWJSVEMgfCB1bmRlZmluZWQge1xuICAgIGxldCBtaW5pID0gMTYwO1xuICAgIGxldCBjbG9zZVBlZXI7XG4gICAgdGhpcy5rYnVja2V0cy5mb3JFYWNoKGtidWNrZXQgPT4ge1xuICAgICAga2J1Y2tldC5mb3JFYWNoKHBlZXIgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZyhcImRpc3RhbmNlXCIsIHBlZXIubm9kZUlkLCBkaXN0YW5jZShfa2V5LCBwZWVyLm5vZGVJZCkpO1xuICAgICAgICBpZiAob3B0LmV4Y2x1ZGVJZCA9PT0gbnVsbCB8fCBvcHQuZXhjbHVkZUlkICE9PSBwZWVyLm5vZGVJZCkge1xuICAgICAgICAgIGlmIChkaXN0YW5jZShfa2V5LCBwZWVyLm5vZGVJZCkgPCBtaW5pKSB7XG4gICAgICAgICAgICBtaW5pID0gZGlzdGFuY2UoX2tleSwgcGVlci5ub2RlSWQpO1xuICAgICAgICAgICAgY2xvc2VQZWVyID0gcGVlcjtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIHJldHVybiBjbG9zZVBlZXI7XG4gIH1cblxuICBnZXRDbG9zZUVzdERpc3Qoa2V5OiBzdHJpbmcpIHtcbiAgICBjb25zdCBwZWVycyA9IHRoaXMuZ2V0QWxsUGVlcnMoKTtcbiAgICBjb25zdCBtaW5pID0gcGVlcnMucmVkdWNlKChhLCBiKSA9PiB7XG4gICAgICBpZiAoZGlzdGFuY2UoYS5ub2RlSWQsIGtleSkgPCBkaXN0YW5jZShiLm5vZGVJZCwga2V5KSkgcmV0dXJuIGE7XG4gICAgICBlbHNlIHJldHVybiBiO1xuICAgIH0pO1xuICAgIHJldHVybiBkaXN0YW5jZShtaW5pLm5vZGVJZCwga2V5KTtcbiAgfVxuXG4gIGdldENsb3NlSWRzKHRhcmdldElkOiBzdHJpbmcpIHtcbiAgICBjb25zdCBsaXN0OiBBcnJheTxzdHJpbmc+ID0gW107XG4gICAgdGhpcy5nZXRBbGxQZWVycygpLmZvckVhY2gocGVlciA9PiB7XG4gICAgICBpZiAocGVlci5ub2RlSWQgIT09IHRhcmdldElkKSB7XG4gICAgICAgIGlmIChsaXN0Lmxlbmd0aCA8IHRoaXMuaykge1xuICAgICAgICAgIGxpc3QucHVzaChwZWVyLm5vZGVJZCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoZGlzdGFuY2UobGlzdFtpXSwgdGFyZ2V0SWQpID4gZGlzdGFuY2UocGVlci5ub2RlSWQsIHRhcmdldElkKSkge1xuICAgICAgICAgICAgICBsaXN0W2ldID0gcGVlci5ub2RlSWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIGxpc3Q7XG4gIH1cblxuICBnZXRBbGxQZWVySWRzKCkge1xuICAgIHJldHVybiB0aGlzLmdldEFsbFBlZXJzKCkubWFwKHBlZXIgPT4ge1xuICAgICAgaWYgKHBlZXIpIHtcbiAgICAgICAgcmV0dXJuIHBlZXIubm9kZUlkO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgaXNQZWVyRXhpc3QoaWQ6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IGlkcyA9IHRoaXMuZ2V0QWxsUGVlcklkcygpO1xuICAgIGlmIChpZHMpIHtcbiAgICAgIHJldHVybiBpZHMuaW5jbHVkZXMoaWQpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgZ2V0UGVlck51bSgpOiBudW1iZXIge1xuICAgIGNvbnN0IGFyciA9IHRoaXMuZ2V0QWxsUGVlcnMoKTtcbiAgICByZXR1cm4gYXJyLmxlbmd0aDtcbiAgfVxuXG4gIGNsZWFuRGlzY29uKCkge1xuICAgIHRoaXMua2J1Y2tldHMuZm9yRWFjaCgoa2J1Y2tldCwgaSkgPT4ge1xuICAgICAgdGhpcy5rYnVja2V0c1tpXSA9IGtidWNrZXQuZmlsdGVyKHBlZXIgPT4gIXBlZXIuaXNEaXNjb25uZWN0ZWQpO1xuICAgIH0pO1xuICB9XG5cbiAgZ2V0S2J1Y2tldE51bSgpIHtcbiAgICBsZXQgbnVtID0gMDtcbiAgICB0aGlzLmtidWNrZXRzLmZvckVhY2goa2J1Y2tldCA9PiB7XG4gICAgICBpZiAoa2J1Y2tldC5sZW5ndGggPiAwKSBudW0rKztcbiAgICB9KTtcbiAgICByZXR1cm4gbnVtO1xuICB9XG5cbiAgaXNOb2RlRXhpc3Qobm9kZUlkOiBzdHJpbmcpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRBbGxQZWVySWRzKCkuaW5jbHVkZXMobm9kZUlkKTtcbiAgfVxuXG4gIGdldENsb3NlUGVlcnModGFyZ2V0SWQ6IHN0cmluZykge1xuICAgIGNvbnN0IGxpc3Q6IEFycmF5PFdlYlJUQz4gPSBbXTtcbiAgICB0aGlzLmdldEFsbFBlZXJzKCkuZm9yRWFjaChwZWVyID0+IHtcbiAgICAgIGlmIChwZWVyLm5vZGVJZCAhPT0gdGFyZ2V0SWQpIHtcbiAgICAgICAgaWYgKGxpc3QubGVuZ3RoIDwgdGhpcy5rKSB7XG4gICAgICAgICAgbGlzdC5wdXNoKHBlZXIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICBkaXN0YW5jZShsaXN0W2ldLm5vZGVJZCwgdGFyZ2V0SWQpID5cbiAgICAgICAgICAgICAgZGlzdGFuY2UocGVlci5ub2RlSWQsIHRhcmdldElkKVxuICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgIGxpc3RbaV0gPSBwZWVyO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBsaXN0O1xuICB9XG59XG4iXX0=
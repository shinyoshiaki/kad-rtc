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
            list.push(peer.nodeId);
          } else {
            for (var i = 0; i < list.length; i++) {
              if ((0, _kadDistance.distance)(list[i], targetID) > (0, _kadDistance.distance)(peer.nodeId, targetID)) {
                list[i] = peer.nodeId;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9rYWQva1V0aWwudHMiXSwibmFtZXMiOlsiS1V0aWwiLCJrIiwia2J1Y2tldHMiLCJBcnJheSIsInByb3RvdHlwZSIsImNvbmNhdCIsImFwcGx5IiwidGFyZ2V0SWQiLCJhbnMiLCJnZXRBbGxQZWVycyIsImZvckVhY2giLCJwZWVyIiwibm9kZUlkIiwia2V5Iiwib3B0IiwiZXhjbHVkZUlkIiwiZGlzdCIsImdldENsb3NlRXN0RGlzdCIsImxpc3QiLCJwdXNoIiwidGFyZ2V0SUQiLCJsZW5ndGgiLCJpIiwicGVlcnMiLCJnZXRDbG9zZUVzdFBlZXJzTGlzdCIsImZpbmQiLCJfa2V5IiwibWluaSIsImNsb3NlUGVlciIsImtidWNrZXQiLCJjb25zb2xlIiwibG9nIiwicmVkdWNlIiwiYSIsImIiLCJtYXAiLCJpZCIsImlkcyIsImdldEFsbFBlZXJJZHMiLCJpbmNsdWRlcyIsImFyciIsImZpbHRlciIsImlzRGlzY29ubmVjdGVkIiwibnVtIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQ0E7Ozs7Ozs7Ozs7SUFFcUJBLEs7OztBQUduQixpQkFBWUMsQ0FBWixFQUF1QkMsUUFBdkIsRUFBdUQ7QUFBQTs7QUFBQTs7QUFBQTs7QUFDckQsU0FBS0QsQ0FBTCxHQUFTQSxDQUFUO0FBQ0EsU0FBS0MsUUFBTCxHQUFnQkEsUUFBaEI7QUFDRDs7OztrQ0FFNEI7QUFDM0IsYUFBT0MsS0FBSyxDQUFDQyxTQUFOLENBQWdCQyxNQUFoQixDQUF1QkMsS0FBdkIsQ0FBNkIsRUFBN0IsRUFBaUMsS0FBS0osUUFBdEMsQ0FBUDtBQUNEOzs7NEJBRU9LLFEsRUFBc0M7QUFDNUMsVUFBSUMsR0FBSjtBQUNBLFdBQUtDLFdBQUwsR0FBbUJDLE9BQW5CLENBQTJCLFVBQUFDLElBQUksRUFBSTtBQUNqQyxZQUFJQSxJQUFJLENBQUNDLE1BQUwsS0FBZ0JMLFFBQXBCLEVBQThCQyxHQUFHLEdBQUdHLElBQU47QUFDL0IsT0FGRDtBQUdBLGFBQU9ILEdBQVA7QUFDRDs7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b3J0IHsgZGlzdGFuY2UgfSBmcm9tIFwia2FkLWRpc3RhbmNlXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEtVdGlsIHtcbiAga2J1Y2tldHM6IEFycmF5PEFycmF5PFdlYlJUQz4+O1xuICBrOiBudW1iZXI7XG4gIGNvbnN0cnVjdG9yKGs6IG51bWJlciwga2J1Y2tldHM6IEFycmF5PEFycmF5PFdlYlJUQz4+KSB7XG4gICAgdGhpcy5rID0gaztcbiAgICB0aGlzLmtidWNrZXRzID0ga2J1Y2tldHM7XG4gIH1cblxuICBnZXRBbGxQZWVycygpOiBBcnJheTxXZWJSVEM+IHtcbiAgICByZXR1cm4gQXJyYXkucHJvdG90eXBlLmNvbmNhdC5hcHBseShbXSwgdGhpcy5rYnVja2V0cyk7XG4gIH1cblxuICBnZXRQZWVyKHRhcmdldElkOiBzdHJpbmcpOiBXZWJSVEMgfCB1bmRlZmluZWQge1xuICAgIGxldCBhbnM7XG4gICAgdGhpcy5nZXRBbGxQZWVycygpLmZvckVhY2gocGVlciA9PiB7XG4gICAgICBpZiAocGVlci5ub2RlSWQgPT09IHRhcmdldElkKSBhbnMgPSBwZWVyO1xuICAgIH0pO1xuICAgIHJldHVybiBhbnM7XG4gIH1cblxuICBnZXRDbG9zZUVzdFBlZXJzTGlzdChrZXk6IHN0cmluZywgb3B0ID0geyBleGNsdWRlSWQ6IG51bGwgfSkge1xuICAgIGNvbnN0IGRpc3QgPSB0aGlzLmdldENsb3NlRXN0RGlzdChrZXkpO1xuICAgIGNvbnN0IGxpc3Q6IEFycmF5PFdlYlJUQz4gPSBbXTtcbiAgICB0aGlzLmdldEFsbFBlZXJzKCkuZm9yRWFjaChwZWVyID0+IHtcbiAgICAgIGlmIChvcHQuZXhjbHVkZUlkID09PSBudWxsIHx8IG9wdC5leGNsdWRlSWQgIT09IHBlZXIubm9kZUlkKSB7XG4gICAgICAgIGlmIChkaXN0YW5jZShrZXksIHBlZXIubm9kZUlkKSA9PT0gZGlzdCkge1xuICAgICAgICAgIGxpc3QucHVzaChwZWVyKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBsaXN0O1xuICB9XG5cbiAgZ2V0Q2xvc2VJRHModGFyZ2V0SUQ6IHN0cmluZykge1xuICAgIGxldCBsaXN0OiBBcnJheTxzdHJpbmc+ID0gW107XG4gICAgdGhpcy5nZXRBbGxQZWVycygpLmZvckVhY2gocGVlciA9PiB7XG4gICAgICBpZiAocGVlci5ub2RlSWQgIT09IHRhcmdldElEKSB7XG4gICAgICAgIGlmIChsaXN0Lmxlbmd0aCA8IHRoaXMuaykge1xuICAgICAgICAgIGxpc3QucHVzaChwZWVyLm5vZGVJZCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoZGlzdGFuY2UobGlzdFtpXSwgdGFyZ2V0SUQpID4gZGlzdGFuY2UocGVlci5ub2RlSWQsIHRhcmdldElEKSkge1xuICAgICAgICAgICAgICBsaXN0W2ldID0gcGVlci5ub2RlSWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIGxpc3Q7XG4gIH1cblxuICBnZXRDbG9zZUVzdElkc0xpc3Qoa2V5OiBzdHJpbmcsIG9wdCA9IHsgZXhjbHVkZUlkOiBudWxsIH0pIHtcbiAgICBjb25zdCBwZWVycyA9IHRoaXMuZ2V0Q2xvc2VFc3RQZWVyc0xpc3Qoa2V5LCBvcHQpO1xuICAgIGNvbnN0IGxpc3Q6IEFycmF5PHN0cmluZz4gPSBbXTtcbiAgICBwZWVycy5mb3JFYWNoKHBlZXIgPT4gbGlzdC5wdXNoKHBlZXIubm9kZUlkKSk7XG4gICAgcmV0dXJuIGxpc3Q7XG4gIH1cblxuICBnZXRQZWVyRnJvbW5vZGVJZChub2RlSWQ6IHN0cmluZykge1xuICAgIHJldHVybiB0aGlzLmdldEFsbFBlZXJzKCkuZmluZChwZWVyID0+IHtcbiAgICAgIHJldHVybiBwZWVyLm5vZGVJZCA9PT0gbm9kZUlkO1xuICAgIH0pO1xuICB9XG5cbiAgZ2V0Q2xvc2VFc3RQZWVyKF9rZXk6IHN0cmluZywgb3B0ID0geyBleGNsdWRlSWQ6IG51bGwgfSk6IFdlYlJUQyB8IHVuZGVmaW5lZCB7XG4gICAgbGV0IG1pbmkgPSAxNjA7XG4gICAgbGV0IGNsb3NlUGVlcjtcbiAgICB0aGlzLmtidWNrZXRzLmZvckVhY2goa2J1Y2tldCA9PiB7XG4gICAgICBrYnVja2V0LmZvckVhY2gocGVlciA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiZGlzdGFuY2VcIiwgcGVlci5ub2RlSWQsIGRpc3RhbmNlKF9rZXksIHBlZXIubm9kZUlkKSk7XG4gICAgICAgIGlmIChvcHQuZXhjbHVkZUlkID09PSBudWxsIHx8IG9wdC5leGNsdWRlSWQgIT09IHBlZXIubm9kZUlkKSB7XG4gICAgICAgICAgaWYgKGRpc3RhbmNlKF9rZXksIHBlZXIubm9kZUlkKSA8IG1pbmkpIHtcbiAgICAgICAgICAgIG1pbmkgPSBkaXN0YW5jZShfa2V5LCBwZWVyLm5vZGVJZCk7XG4gICAgICAgICAgICBjbG9zZVBlZXIgPSBwZWVyO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIGNsb3NlUGVlcjtcbiAgfVxuXG4gIGdldENsb3NlRXN0RGlzdChrZXk6IHN0cmluZykge1xuICAgIGNvbnN0IHBlZXJzID0gdGhpcy5nZXRBbGxQZWVycygpO1xuICAgIGNvbnN0IG1pbmkgPSBwZWVycy5yZWR1Y2UoKGEsIGIpID0+IHtcbiAgICAgIGlmIChkaXN0YW5jZShhLm5vZGVJZCwga2V5KSA8IGRpc3RhbmNlKGIubm9kZUlkLCBrZXkpKSByZXR1cm4gYTtcbiAgICAgIGVsc2UgcmV0dXJuIGI7XG4gICAgfSk7XG4gICAgcmV0dXJuIGRpc3RhbmNlKG1pbmkubm9kZUlkLCBrZXkpO1xuICB9XG5cbiAgZ2V0Q2xvc2VJZHModGFyZ2V0SWQ6IHN0cmluZykge1xuICAgIGNvbnN0IGxpc3Q6IEFycmF5PHN0cmluZz4gPSBbXTtcbiAgICB0aGlzLmdldEFsbFBlZXJzKCkuZm9yRWFjaChwZWVyID0+IHtcbiAgICAgIGlmIChwZWVyLm5vZGVJZCAhPT0gdGFyZ2V0SWQpIHtcbiAgICAgICAgaWYgKGxpc3QubGVuZ3RoIDwgdGhpcy5rKSB7XG4gICAgICAgICAgbGlzdC5wdXNoKHBlZXIubm9kZUlkKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmIChkaXN0YW5jZShsaXN0W2ldLCB0YXJnZXRJZCkgPiBkaXN0YW5jZShwZWVyLm5vZGVJZCwgdGFyZ2V0SWQpKSB7XG4gICAgICAgICAgICAgIGxpc3RbaV0gPSBwZWVyLm5vZGVJZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gbGlzdDtcbiAgfVxuXG4gIGdldEFsbFBlZXJJZHMoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0QWxsUGVlcnMoKS5tYXAocGVlciA9PiB7XG4gICAgICBpZiAocGVlcikge1xuICAgICAgICByZXR1cm4gcGVlci5ub2RlSWQ7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBpc1BlZXJFeGlzdChpZDogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgY29uc3QgaWRzID0gdGhpcy5nZXRBbGxQZWVySWRzKCk7XG4gICAgaWYgKGlkcykge1xuICAgICAgcmV0dXJuIGlkcy5pbmNsdWRlcyhpZCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxuICBnZXRQZWVyTnVtKCk6IG51bWJlciB7XG4gICAgY29uc3QgYXJyID0gdGhpcy5nZXRBbGxQZWVycygpO1xuICAgIHJldHVybiBhcnIubGVuZ3RoO1xuICB9XG5cbiAgY2xlYW5EaXNjb24oKSB7XG4gICAgdGhpcy5rYnVja2V0cy5mb3JFYWNoKChrYnVja2V0LCBpKSA9PiB7XG4gICAgICB0aGlzLmtidWNrZXRzW2ldID0ga2J1Y2tldC5maWx0ZXIocGVlciA9PiAhcGVlci5pc0Rpc2Nvbm5lY3RlZCk7XG4gICAgfSk7XG4gIH1cblxuICBnZXRLYnVja2V0TnVtKCkge1xuICAgIGxldCBudW0gPSAwO1xuICAgIHRoaXMua2J1Y2tldHMuZm9yRWFjaChrYnVja2V0ID0+IHtcbiAgICAgIGlmIChrYnVja2V0Lmxlbmd0aCA+IDApIG51bSsrO1xuICAgIH0pO1xuICAgIHJldHVybiBudW07XG4gIH1cblxuICBpc05vZGVFeGlzdChub2RlSWQ6IHN0cmluZykge1xuICAgIHJldHVybiB0aGlzLmdldEFsbFBlZXJJZHMoKS5pbmNsdWRlcyhub2RlSWQpO1xuICB9XG5cbiAgZ2V0Q2xvc2VQZWVycyh0YXJnZXRJZDogc3RyaW5nKSB7XG4gICAgY29uc3QgbGlzdDogQXJyYXk8V2ViUlRDPiA9IFtdO1xuICAgIHRoaXMuZ2V0QWxsUGVlcnMoKS5mb3JFYWNoKHBlZXIgPT4ge1xuICAgICAgaWYgKHBlZXIubm9kZUlkICE9PSB0YXJnZXRJZCkge1xuICAgICAgICBpZiAobGlzdC5sZW5ndGggPCB0aGlzLmspIHtcbiAgICAgICAgICBsaXN0LnB1c2gocGVlcik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgIGRpc3RhbmNlKGxpc3RbaV0ubm9kZUlkLCB0YXJnZXRJZCkgPlxuICAgICAgICAgICAgICBkaXN0YW5jZShwZWVyLm5vZGVJZCwgdGFyZ2V0SWQpXG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgbGlzdFtpXSA9IHBlZXI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIGxpc3Q7XG4gIH1cbn1cbiJdfQ==
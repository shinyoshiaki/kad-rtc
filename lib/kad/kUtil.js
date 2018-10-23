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
            list.forEach(function (v, i) {
              if ((0, _kadDistance.distance)(v, targetID) > (0, _kadDistance.distance)(peer.nodeId, targetID)) {
                list[i] = peer.nodeId;
              }
            });
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9rYWQva1V0aWwudHMiXSwibmFtZXMiOlsiS1V0aWwiLCJrIiwia2J1Y2tldHMiLCJBcnJheSIsInByb3RvdHlwZSIsImNvbmNhdCIsImFwcGx5IiwidGFyZ2V0SWQiLCJhbnMiLCJnZXRBbGxQZWVycyIsImZvckVhY2giLCJwZWVyIiwibm9kZUlkIiwia2V5Iiwib3B0IiwiZXhjbHVkZUlkIiwiZGlzdCIsImdldENsb3NlRXN0RGlzdCIsImxpc3QiLCJwdXNoIiwidGFyZ2V0SUQiLCJsZW5ndGgiLCJ2IiwiaSIsInBlZXJzIiwiZ2V0Q2xvc2VFc3RQZWVyc0xpc3QiLCJmaW5kIiwiX2tleSIsIm1pbmkiLCJjbG9zZVBlZXIiLCJrYnVja2V0IiwiY29uc29sZSIsImxvZyIsInJlZHVjZSIsImEiLCJiIiwibWFwIiwiaWQiLCJpZHMiLCJnZXRBbGxQZWVySWRzIiwiaW5jbHVkZXMiLCJhcnIiLCJmaWx0ZXIiLCJpc0Rpc2Nvbm5lY3RlZCIsIm51bSJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUNBOzs7Ozs7Ozs7O0lBRXFCQSxLOzs7QUFHbkIsaUJBQVlDLENBQVosRUFBdUJDLFFBQXZCLEVBQXVEO0FBQUE7O0FBQUE7O0FBQUE7O0FBQ3JELFNBQUtELENBQUwsR0FBU0EsQ0FBVDtBQUNBLFNBQUtDLFFBQUwsR0FBZ0JBLFFBQWhCO0FBQ0Q7Ozs7a0NBRTRCO0FBQzNCLGFBQU9DLEtBQUssQ0FBQ0MsU0FBTixDQUFnQkMsTUFBaEIsQ0FBdUJDLEtBQXZCLENBQTZCLEVBQTdCLEVBQWlDLEtBQUtKLFFBQXRDLENBQVA7QUFDRDs7OzRCQUVPSyxRLEVBQXNDO0FBQzVDLFVBQUlDLEdBQUo7QUFDQSxXQUFLQyxXQUFMLEdBQW1CQyxPQUFuQixDQUEyQixVQUFBQyxJQUFJLEVBQUk7QUFDakMsWUFBSUEsSUFBSSxDQUFDQyxNQUFMLEtBQWdCTCxRQUFwQixFQUE4QkMsR0FBRyxHQUFHRyxJQUFOO0FBQy9CLE9BRkQ7QUFHQSxhQUFPSCxHQUFQO0FB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QUlDLEdBQUcsR0FBRyxDQUFWO0FBQ0EsV0FBSzFDLFFBQUwsQ0FBY1EsT0FBZCxDQUFzQixVQUFBb0IsT0FBTyxFQUFJO0FBQy9CLFlBQUlBLE9BQU8sQ0FBQ1QsTUFBUixHQUFpQixDQUFyQixFQUF3QnVCLEdBQUc7QUFDNUIsT0FGRDtBQUdBLGFBQU9BLEdBQVA7QUFDRDs7O2dDQUVXaEMsTSxFQUFnQjtBQUMxQixhQUFPLEtBQUsyQixhQUFMLEdBQXFCQyxRQUFyQixDQUE4QjVCLE1BQTlCLENBQVA7QUFDRDs7O2tDQUVhTCxRLEVBQWtCO0FBQUE7O0FBQzlCLFVBQU1XLElBQW1CLEdBQUcsRUFBNUI7QUFDQSxXQUFLVCxXQUFMLEdBQW1CQyxPQUFuQixDQUEyQixVQUFBQyxJQUFJLEVBQUk7QUFDakMsWUFBSUEsSUFBSSxDQUFDQyxNQUFMLEtBQWdCTCxRQUFwQixFQUE4QjtBQUM1QixjQUFJVyxJQUFJLENBQUNHLE1BQUwsR0FBYyxNQUFJLENBQUNwQixDQUF2QixFQUEwQjtBQUN4QmlCLFlBQUFBLElBQUksQ0FBQ0MsSUFBTCxDQUFVUixJQUFWO0FBQ0QsV0FGRCxNQUVPO0FBQ0wsaUJBQUssSUFBSVksQ0FBQyxHQUFHLENBQWIsRUFBZ0JBLENBQUMsR0FBR0wsSUFBSSxDQUFDRyxNQUF6QixFQUFpQ0UsQ0FBQyxFQUFsQyxFQUFzQztBQUNwQyxrQkFDRSwyQkFBU0wsSUFBSSxDQUFDSyxDQUFELENBQUosQ0FBUVgsTUFBakIsRUFBeUJMLFFBQXpCLElBQ0EsMkJBQVNJLElBQUksQ0FBQ0MsTUFBZCxFQUFzQkwsUUFBdEIsQ0FGRixFQUdFO0FBQ0FXLGdCQUFBQSxJQUFJLENBQUNLLENBQUQsQ0FBSixHQUFVWixJQUFWO0FBQ0Q7QUFDRjtBQUNGO0FBQ0Y7QUFDRixPQWZEO0FBZ0JBLGFBQU9PLElBQVA7QUFDRCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBXZWJSVEMgZnJvbSBcIndlYnJ0YzRtZVwiO1xuaW1wb3J0IHsgZGlzdGFuY2UgfSBmcm9tIFwia2FkLWRpc3RhbmNlXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEtVdGlsIHtcbiAga2J1Y2tldHM6IEFycmF5PEFycmF5PFdlYlJUQz4+O1xuICBrOiBudW1iZXI7XG4gIGNvbnN0cnVjdG9yKGs6IG51bWJlciwga2J1Y2tldHM6IEFycmF5PEFycmF5PFdlYlJUQz4+KSB7XG4gICAgdGhpcy5rID0gaztcbiAgICB0aGlzLmtidWNrZXRzID0ga2J1Y2tldHM7XG4gIH1cblxuICBnZXRBbGxQZWVycygpOiBBcnJheTxXZWJSVEM+IHtcbiAgICByZXR1cm4gQXJyYXkucHJvdG90eXBlLmNvbmNhdC5hcHBseShbXSwgdGhpcy5rYnVja2V0cyk7XG4gIH1cblxuICBnZXRQZWVyKHRhcmdldElkOiBzdHJpbmcpOiBXZWJSVEMgfCB1bmRlZmluZWQge1xuICAgIGxldCBhbnM7XG4gICAgdGhpcy5nZXRBbGxQZWVycygpLmZvckVhY2gocGVlciA9PiB7XG4gICAgICBpZiAocGVlci5ub2RlSWQgPT09IHRhcmdldElkKSBhbnMgPSBwZWVyO1xuICAgIH0pO1xuICAgIHJldHVybiBhbnM7XG4gIH1cblxuICBnZXRDbG9zZUVzdFBlZXJzTGlzdChrZXk6IHN0cmluZywgb3B0ID0geyBleGNsdWRlSWQ6IG51bGwgfSkge1xuICAgIGNvbnN0IGRpc3QgPSB0aGlzLmdldENsb3NlRXN0RGlzdChrZXkpO1xuICAgIGNvbnN0IGxpc3Q6IEFycmF5PFdlYlJUQz4gPSBbXTtcbiAgICB0aGlzLmdldEFsbFBlZXJzKCkuZm9yRWFjaChwZWVyID0+IHtcbiAgICAgIGlmIChvcHQuZXhjbHVkZUlkID09PSBudWxsIHx8IG9wdC5leGNsdWRlSWQgIT09IHBlZXIubm9kZUlkKSB7XG4gICAgICAgIGlmIChkaXN0YW5jZShrZXksIHBlZXIubm9kZUlkKSA9PT0gZGlzdCkge1xuICAgICAgICAgIGxpc3QucHVzaChwZWVyKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBsaXN0O1xuICB9XG5cbiAgZ2V0Q2xvc2VJRHModGFyZ2V0SUQ6IHN0cmluZykge1xuICAgIGxldCBsaXN0OiBBcnJheTxzdHJpbmc+ID0gW107XG4gICAgdGhpcy5nZXRBbGxQZWVycygpLmZvckVhY2gocGVlciA9PiB7XG4gICAgICBpZiAocGVlci5ub2RlSWQgIT09IHRhcmdldElEKSB7XG4gICAgICAgIGlmIChsaXN0Lmxlbmd0aCA8IHRoaXMuaykge1xuICAgICAgICAgIGxpc3QucHVzaChwZWVyLm5vZGVJZCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbGlzdC5mb3JFYWNoKCh2LCBpKSA9PiB7XG4gICAgICAgICAgICBpZiAoZGlzdGFuY2UodiwgdGFyZ2V0SUQpID4gZGlzdGFuY2UocGVlci5ub2RlSWQsIHRhcmdldElEKSkge1xuICAgICAgICAgICAgICBsaXN0W2ldID0gcGVlci5ub2RlSWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gbGlzdDtcbiAgfVxuXG4gIGdldENsb3NlRXN0SWRzTGlzdChrZXk6IHN0cmluZywgb3B0ID0geyBleGNsdWRlSWQ6IG51bGwgfSkge1xuICAgIGNvbnN0IHBlZXJzID0gdGhpcy5nZXRDbG9zZUVzdFBlZXJzTGlzdChrZXksIG9wdCk7XG4gICAgY29uc3QgbGlzdDogQXJyYXk8c3RyaW5nPiA9IFtdO1xuICAgIHBlZXJzLmZvckVhY2gocGVlciA9PiBsaXN0LnB1c2gocGVlci5ub2RlSWQpKTtcbiAgICByZXR1cm4gbGlzdDtcbiAgfVxuXG4gIGdldFBlZXJGcm9tbm9kZUlkKG5vZGVJZDogc3RyaW5nKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0QWxsUGVlcnMoKS5maW5kKHBlZXIgPT4ge1xuICAgICAgcmV0dXJuIHBlZXIubm9kZUlkID09PSBub2RlSWQ7XG4gICAgfSk7XG4gIH1cblxuICBnZXRDbG9zZUVzdFBlZXIoX2tleTogc3RyaW5nLCBvcHQgPSB7IGV4Y2x1ZGVJZDogbnVsbCB9KTogV2ViUlRDIHwgdW5kZWZpbmVkIHtcbiAgICBsZXQgbWluaSA9IDE2MDtcbiAgICBsZXQgY2xvc2VQZWVyO1xuICAgIHRoaXMua2J1Y2tldHMuZm9yRWFjaChrYnVja2V0ID0+IHtcbiAgICAgIGtidWNrZXQuZm9yRWFjaChwZWVyID0+IHtcbiAgICAgICAgY29uc29sZS5sb2coXCJkaXN0YW5jZVwiLCBwZWVyLm5vZGVJZCwgZGlzdGFuY2UoX2tleSwgcGVlci5ub2RlSWQpKTtcbiAgICAgICAgaWYgKG9wdC5leGNsdWRlSWQgPT09IG51bGwgfHwgb3B0LmV4Y2x1ZGVJZCAhPT0gcGVlci5ub2RlSWQpIHtcbiAgICAgICAgICBpZiAoZGlzdGFuY2UoX2tleSwgcGVlci5ub2RlSWQpIDwgbWluaSkge1xuICAgICAgICAgICAgbWluaSA9IGRpc3RhbmNlKF9rZXksIHBlZXIubm9kZUlkKTtcbiAgICAgICAgICAgIGNsb3NlUGVlciA9IHBlZXI7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcbiAgICByZXR1cm4gY2xvc2VQZWVyO1xuICB9XG5cbiAgZ2V0Q2xvc2VFc3REaXN0KGtleTogc3RyaW5nKSB7XG4gICAgY29uc3QgcGVlcnMgPSB0aGlzLmdldEFsbFBlZXJzKCk7XG4gICAgY29uc3QgbWluaSA9IHBlZXJzLnJlZHVjZSgoYSwgYikgPT4ge1xuICAgICAgaWYgKGRpc3RhbmNlKGEubm9kZUlkLCBrZXkpIDwgZGlzdGFuY2UoYi5ub2RlSWQsIGtleSkpIHJldHVybiBhO1xuICAgICAgZWxzZSByZXR1cm4gYjtcbiAgICB9KTtcbiAgICByZXR1cm4gZGlzdGFuY2UobWluaS5ub2RlSWQsIGtleSk7XG4gIH1cblxuICBnZXRDbG9zZUlkcyh0YXJnZXRJZDogc3RyaW5nKSB7XG4gICAgY29uc3QgbGlzdDogQXJyYXk8c3RyaW5nPiA9IFtdO1xuICAgIHRoaXMuZ2V0QWxsUGVlcnMoKS5mb3JFYWNoKHBlZXIgPT4ge1xuICAgICAgaWYgKHBlZXIubm9kZUlkICE9PSB0YXJnZXRJZCkge1xuICAgICAgICBpZiAobGlzdC5sZW5ndGggPCB0aGlzLmspIHtcbiAgICAgICAgICBsaXN0LnB1c2gocGVlci5ub2RlSWQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKGRpc3RhbmNlKGxpc3RbaV0sIHRhcmdldElkKSA+IGRpc3RhbmNlKHBlZXIubm9kZUlkLCB0YXJnZXRJZCkpIHtcbiAgICAgICAgICAgICAgbGlzdFtpXSA9IHBlZXIubm9kZUlkO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBsaXN0O1xuICB9XG5cbiAgZ2V0QWxsUGVlcklkcygpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRBbGxQZWVycygpLm1hcChwZWVyID0+IHtcbiAgICAgIGlmIChwZWVyKSB7XG4gICAgICAgIHJldHVybiBwZWVyLm5vZGVJZDtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGlzUGVlckV4aXN0KGlkOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICBjb25zdCBpZHMgPSB0aGlzLmdldEFsbFBlZXJJZHMoKTtcbiAgICBpZiAoaWRzKSB7XG4gICAgICByZXR1cm4gaWRzLmluY2x1ZGVzKGlkKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIGdldFBlZXJOdW0oKTogbnVtYmVyIHtcbiAgICBjb25zdCBhcnIgPSB0aGlzLmdldEFsbFBlZXJzKCk7XG4gICAgcmV0dXJuIGFyci5sZW5ndGg7XG4gIH1cblxuICBjbGVhbkRpc2NvbigpIHtcbiAgICB0aGlzLmtidWNrZXRzLmZvckVhY2goKGtidWNrZXQsIGkpID0+IHtcbiAgICAgIHRoaXMua2J1Y2tldHNbaV0gPSBrYnVja2V0LmZpbHRlcihwZWVyID0+ICFwZWVyLmlzRGlzY29ubmVjdGVkKTtcbiAgICB9KTtcbiAgfVxuXG4gIGdldEtidWNrZXROdW0oKSB7XG4gICAgbGV0IG51bSA9IDA7XG4gICAgdGhpcy5rYnVja2V0cy5mb3JFYWNoKGtidWNrZXQgPT4ge1xuICAgICAgaWYgKGtidWNrZXQubGVuZ3RoID4gMCkgbnVtKys7XG4gICAgfSk7XG4gICAgcmV0dXJuIG51bTtcbiAgfVxuXG4gIGlzTm9kZUV4aXN0KG5vZGVJZDogc3RyaW5nKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0QWxsUGVlcklkcygpLmluY2x1ZGVzKG5vZGVJZCk7XG4gIH1cblxuICBnZXRDbG9zZVBlZXJzKHRhcmdldElkOiBzdHJpbmcpIHtcbiAgICBjb25zdCBsaXN0OiBBcnJheTxXZWJSVEM+ID0gW107XG4gICAgdGhpcy5nZXRBbGxQZWVycygpLmZvckVhY2gocGVlciA9PiB7XG4gICAgICBpZiAocGVlci5ub2RlSWQgIT09IHRhcmdldElkKSB7XG4gICAgICAgIGlmIChsaXN0Lmxlbmd0aCA8IHRoaXMuaykge1xuICAgICAgICAgIGxpc3QucHVzaChwZWVyKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgZGlzdGFuY2UobGlzdFtpXS5ub2RlSWQsIHRhcmdldElkKSA+XG4gICAgICAgICAgICAgIGRpc3RhbmNlKHBlZXIubm9kZUlkLCB0YXJnZXRJZClcbiAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICBsaXN0W2ldID0gcGVlcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gbGlzdDtcbiAgfVxufVxuIl19
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
  function KUtil(k, kbuckets, nodeId) {
    _classCallCheck(this, KUtil);

    _defineProperty(this, "kbuckets", void 0);

    _defineProperty(this, "k", void 0);

    _defineProperty(this, "nodeId", void 0);

    this.k = k;
    this.kbuckets = kbuckets;
    this.nodeId = nodeId;
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
    value: function getCloseEstPeer(_key, opt) {
      var _this2 = this;

      var mini = 160;
      var closePeer;
      this.kbuckets.forEach(function (kbucket) {
        kbucket.forEach(function (peer) {
          console.log("distance", peer.nodeId, (0, _kadDistance.distance)(_key, peer.nodeId));

          if (peer.nodeId === _this2.nodeId) {
            console.log("getcloseestpeer only me", _this2.nodeId);
          }

          if (!(opt && peer.nodeId === opt.excludeId) && peer.nodeId !== _this2.nodeId) {
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
      var _this3 = this;

      var list = [];
      this.getAllPeers().forEach(function (peer) {
        if (peer.nodeId !== targetId) {
          if (list.length < _this3.k) {
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
      var arr = this.getAllPeers();

      if (arr.length > 0) {
        return arr.map(function (peer) {
          return peer.nodeId;
        });
      } else {
        return [];
      }
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
      var _this4 = this;

      this.kbuckets.forEach(function (kbucket, i) {
        if (kbucket.length > 0) {
          console.log({
            before: _this4.kbuckets[i]
          });
          _this4.kbuckets[i] = kbucket.filter(function (peer) {
            return !peer.isDisconnected;
          });
          console.log({
            after: _this4.kbuckets[i]
          });
        }
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
      var arr = this.getAllPeerIds();
      if (!arr) return false;
      return arr.includes(nodeId);
    }
  }, {
    key: "getClosePeers",
    value: function getClosePeers(targetId, opt) {
      var _this5 = this;

      var list = [];
      this.getAllPeers().forEach(function (peer) {
        if (!(opt && peer.nodeId === opt.excludeId)) {
          if (list.length < _this5.k) {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9rYWQva1V0aWwudHMiXSwibmFtZXMiOlsiS1V0aWwiLCJrIiwia2J1Y2tldHMiLCJub2RlSWQiLCJBcnJheSIsInByb3RvdHlwZSIsImNvbmNhdCIsImFwcGx5IiwidGFyZ2V0SWQiLCJhbnMiLCJnZXRBbGxQZWVycyIsImZvckVhY2giLCJwZWVyIiwia2V5Iiwib3B0IiwiZXhjbHVkZUlkIiwiZGlzdCIsImdldENsb3NlRXN0RGlzdCIsImxpc3QiLCJwdXNoIiwidGFyZ2V0SUQiLCJsZW5ndGgiLCJjb25zb2xlIiwibG9nIiwiaSIsInBlZXJzIiwiZ2V0Q2xvc2VFc3RQZWVyc0xpc3QiLCJmaW5kIiwiX2tleSIsIm1pbmkiLCJjbG9zZVBlZXIiLCJrYnVja2V0IiwicmVkdWNlIiwiYSIsImIiLCJhcnIiLCJtYXAiLCJpZCIsImlkcyIsImdldEFsbFBlZXJJZHMiLCJpbmNsdWRlcyIsImJlZm9yZSIsImZpbHRlciIsImlzRGlzY29ubmVjdGVkIiwiYWZ0ZXIiLCJudW0iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFDQTs7Ozs7Ozs7OztJQUVxQkEsSzs7O0FBSW5CLGlCQUFZQyxDQUFaLEVBQXVCQyxRQUF2QixFQUF1REMsTUFBdkQsRUFBdUU7QUFBQTs7QUFBQTs7QUFBQTs7QUFBQTs7QUFDckUsU0FBS0YsQ0FBTCxHQUFTQSxDQUFUO0FBQ0EsU0FBS0MsUUFBTCxHQUFnQkEsUUFBaEI7QUFDQSxTQUFLQyxNQUFMLEdBQWNBLE1BQWQ7QUFDRDs7OztrQ0FFNEI7QUFDM0IsYUFBT0MsS0FBSyxDQUFDQyxTQUFOLENBQWdCQyxNQUFoQixDQUF1QkMsS0FBdkIsQ0FBNkIsRUFBN0IsRUFBaUMsS0FBS0wsUUFBdEMsQ0FBUDtBQUNEOzs7NEJBRU9NLFEsRUFBc0M7QUFDNUMsVUFBSUMsR0FBSjtBQUNBLFdBQUtDLFdBQUwsR0FBbUJDLE9BQW5CLENBQTJCLFVBQUFDLElBQUksRUFBSTtBQUNqQyxZQUFJQSxJQUFJLENBQUNULE1BQUwsS0FBZ0JL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QUwsRUFBWjtBQUNBLFVBQUksQ0FBQ0osR0FBTCxFQUFVLE9BQU8sS0FBUDtBQUNWLGFBQU9BLEdBQUcsQ0FBQ0ssUUFBSixDQUFhckMsTUFBYixDQUFQO0FBQ0Q7OztrQ0FFYUssUSxFQUFrQk0sRyxFQUE4QjtBQUFBOztBQUM1RCxVQUFNSSxJQUFtQixHQUFHLEVBQTVCO0FBQ0EsV0FBS1IsV0FBTCxHQUFtQkMsT0FBbkIsQ0FBMkIsVUFBQUMsSUFBSSxFQUFJO0FBQ2pDLFlBQUksRUFBRUUsR0FBRyxJQUFJRixJQUFJLENBQUNULE1BQUwsS0FBZ0JXLEdBQUcsQ0FBQ0MsU0FBN0IsQ0FBSixFQUE2QztBQUMzQyxjQUFJRyxJQUFJLENBQUNHLE1BQUwsR0FBYyxNQUFJLENBQUNwQixDQUF2QixFQUEwQjtBQUN4QmlCLFlBQUFBLElBQUksQ0FBQ0MsSUFBTCxDQUFVUCxJQUFWO0FBQ0QsV0FGRCxNQUVPO0FBQ0wsaUJBQUssSUFBSVksQ0FBQyxHQUFHLENBQWIsRUFBZ0JBLENBQUMsR0FBR04sSUFBSSxDQUFDRyxNQUF6QixFQUFpQ0csQ0FBQyxFQUFsQyxFQUFzQztBQUNwQyxrQkFDRSwyQkFBU04sSUFBSSxDQUFDTSxDQUFELENBQUosQ0FBUXJCLE1BQWpCLEVBQXlCSyxRQUF6QixJQUNBLDJCQUFTSSxJQUFJLENBQUNULE1BQWQsRUFBc0JLLFFBQXRCLENBRkYsRUFHRTtBQUNBVSxnQkFBQUEsSUFBSSxDQUFDTSxDQUFELENBQUosR0FBVVosSUFBVjtBQUNEO0FBQ0Y7QUFDRjtBQUNGO0FBQ0YsT0FmRDtBQWdCQSxhQUFPTSxJQUFQO0FBQ0QiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgV2ViUlRDIGZyb20gXCJ3ZWJydGM0bWVcIjtcbmltcG9ydCB7IGRpc3RhbmNlIH0gZnJvbSBcImthZC1kaXN0YW5jZVwiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBLVXRpbCB7XG4gIGtidWNrZXRzOiBBcnJheTxBcnJheTxXZWJSVEM+PjtcbiAgazogbnVtYmVyO1xuICBub2RlSWQ6IHN0cmluZztcbiAgY29uc3RydWN0b3IoazogbnVtYmVyLCBrYnVja2V0czogQXJyYXk8QXJyYXk8V2ViUlRDPj4sIG5vZGVJZDogc3RyaW5nKSB7XG4gICAgdGhpcy5rID0gaztcbiAgICB0aGlzLmtidWNrZXRzID0ga2J1Y2tldHM7XG4gICAgdGhpcy5ub2RlSWQgPSBub2RlSWQ7XG4gIH1cblxuICBnZXRBbGxQZWVycygpOiBBcnJheTxXZWJSVEM+IHtcbiAgICByZXR1cm4gQXJyYXkucHJvdG90eXBlLmNvbmNhdC5hcHBseShbXSwgdGhpcy5rYnVja2V0cyk7XG4gIH1cblxuICBnZXRQZWVyKHRhcmdldElkOiBzdHJpbmcpOiBXZWJSVEMgfCB1bmRlZmluZWQge1xuICAgIGxldCBhbnM7XG4gICAgdGhpcy5nZXRBbGxQZWVycygpLmZvckVhY2gocGVlciA9PiB7XG4gICAgICBpZiAocGVlci5ub2RlSWQgPT09IHRhcmdldElkKSBhbnMgPSBwZWVyO1xuICAgIH0pO1xuICAgIHJldHVybiBhbnM7XG4gIH1cblxuICBnZXRDbG9zZUVzdFBlZXJzTGlzdChrZXk6IHN0cmluZywgb3B0ID0geyBleGNsdWRlSWQ6IG51bGwgfSkge1xuICAgIGNvbnN0IGRpc3QgPSB0aGlzLmdldENsb3NlRXN0RGlzdChrZXkpO1xuICAgIGNvbnN0IGxpc3Q6IEFycmF5PFdlYlJUQz4gPSBbXTtcbiAgICB0aGlzLmdldEFsbFBlZXJzKCkuZm9yRWFjaChwZWVyID0+IHtcbiAgICAgIGlmIChvcHQuZXhjbHVkZUlkID09PSBudWxsIHx8IG9wdC5leGNsdWRlSWQgIT09IHBlZXIubm9kZUlkKSB7XG4gICAgICAgIGlmIChkaXN0YW5jZShrZXksIHBlZXIubm9kZUlkKSA9PT0gZGlzdCkge1xuICAgICAgICAgIGxpc3QucHVzaChwZWVyKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBsaXN0O1xuICB9XG5cbiAgZ2V0Q2xvc2VJRHModGFyZ2V0SUQ6IHN0cmluZykge1xuICAgIGxldCBsaXN0OiBBcnJheTxzdHJpbmc+ID0gW107XG4gICAgdGhpcy5nZXRBbGxQZWVycygpLmZvckVhY2gocGVlciA9PiB7XG4gICAgICBpZiAocGVlci5ub2RlSWQgIT09IHRhcmdldElEKSB7XG4gICAgICAgIGlmIChsaXN0Lmxlbmd0aCA8IHRoaXMuaykge1xuICAgICAgICAgIGNvbnNvbGUubG9nKFwiZ2V0Y2xvc2VpZHMgcHVzaFwiLCBwZWVyLm5vZGVJZCk7XG4gICAgICAgICAgbGlzdC5wdXNoKHBlZXIubm9kZUlkKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhcImdldGNsb3NlaWRzIGZ1bGxlZFwiLCB7IGxpc3QgfSk7XG4gICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoZGlzdGFuY2UobGlzdFtpXSwgdGFyZ2V0SUQpID4gZGlzdGFuY2UocGVlci5ub2RlSWQsIHRhcmdldElEKSkge1xuICAgICAgICAgICAgICBsaXN0W2ldID0gcGVlci5ub2RlSWQ7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBsaXN0O1xuICB9XG5cbiAgZ2V0Q2xvc2VFc3RJZHNMaXN0KGtleTogc3RyaW5nLCBvcHQgPSB7IGV4Y2x1ZGVJZDogbnVsbCB9KSB7XG4gICAgY29uc3QgcGVlcnMgPSB0aGlzLmdldENsb3NlRXN0UGVlcnNMaXN0KGtleSwgb3B0KTtcbiAgICBjb25zdCBsaXN0OiBBcnJheTxzdHJpbmc+ID0gW107XG4gICAgcGVlcnMuZm9yRWFjaChwZWVyID0+IGxpc3QucHVzaChwZWVyLm5vZGVJZCkpO1xuICAgIHJldHVybiBsaXN0O1xuICB9XG5cbiAgZ2V0UGVlckZyb21ub2RlSWQobm9kZUlkOiBzdHJpbmcpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRBbGxQZWVycygpLmZpbmQocGVlciA9PiB7XG4gICAgICByZXR1cm4gcGVlci5ub2RlSWQgPT09IG5vZGVJZDtcbiAgICB9KTtcbiAgfVxuXG4gIGdldENsb3NlRXN0UGVlcihcbiAgICBfa2V5OiBzdHJpbmcsXG4gICAgb3B0PzogeyBleGNsdWRlSWQ/OiBzdHJpbmcgfVxuICApOiBXZWJSVEMgfCB1bmRlZmluZWQge1xuICAgIGxldCBtaW5pID0gMTYwO1xuICAgIGxldCBjbG9zZVBlZXI7XG4gICAgdGhpcy5rYnVja2V0cy5mb3JFYWNoKGtidWNrZXQgPT4ge1xuICAgICAga2J1Y2tldC5mb3JFYWNoKHBlZXIgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZyhcImRpc3RhbmNlXCIsIHBlZXIubm9kZUlkLCBkaXN0YW5jZShfa2V5LCBwZWVyLm5vZGVJZCkpO1xuICAgICAgICBpZiAocGVlci5ub2RlSWQgPT09IHRoaXMubm9kZUlkKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coXCJnZXRjbG9zZWVzdHBlZXIgb25seSBtZVwiLCB0aGlzLm5vZGVJZCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKFxuICAgICAgICAgICEob3B0ICYmIHBlZXIubm9kZUlkID09PSBvcHQuZXhjbHVkZUlkKSAmJlxuICAgICAgICAgIHBlZXIubm9kZUlkICE9PSB0aGlzLm5vZGVJZFxuICAgICAgICApIHtcbiAgICAgICAgICBpZiAoZGlzdGFuY2UoX2tleSwgcGVlci5ub2RlSWQpIDwgbWluaSkge1xuICAgICAgICAgICAgbWluaSA9IGRpc3RhbmNlKF9rZXksIHBlZXIubm9kZUlkKTtcbiAgICAgICAgICAgIGNsb3NlUGVlciA9IHBlZXI7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcbiAgICByZXR1cm4gY2xvc2VQZWVyO1xuICB9XG5cbiAgZ2V0Q2xvc2VFc3REaXN0KGtleTogc3RyaW5nKSB7XG4gICAgY29uc3QgcGVlcnMgPSB0aGlzLmdldEFsbFBlZXJzKCk7XG4gICAgY29uc3QgbWluaSA9IHBlZXJzLnJlZHVjZSgoYSwgYikgPT4ge1xuICAgICAgaWYgKGRpc3RhbmNlKGEubm9kZUlkLCBrZXkpIDwgZGlzdGFuY2UoYi5ub2RlSWQsIGtleSkpIHJldHVybiBhO1xuICAgICAgZWxzZSByZXR1cm4gYjtcbiAgICB9KTtcbiAgICByZXR1cm4gZGlzdGFuY2UobWluaS5ub2RlSWQsIGtleSk7XG4gIH1cblxuICBnZXRDbG9zZUlkcyh0YXJnZXRJZDogc3RyaW5nKSB7XG4gICAgY29uc3QgbGlzdDogQXJyYXk8c3RyaW5nPiA9IFtdO1xuICAgIHRoaXMuZ2V0QWxsUGVlcnMoKS5mb3JFYWNoKHBlZXIgPT4ge1xuICAgICAgaWYgKHBlZXIubm9kZUlkICE9PSB0YXJnZXRJZCkge1xuICAgICAgICBpZiAobGlzdC5sZW5ndGggPCB0aGlzLmspIHtcbiAgICAgICAgICBsaXN0LnB1c2gocGVlci5ub2RlSWQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKGRpc3RhbmNlKGxpc3RbaV0sIHRhcmdldElkKSA+IGRpc3RhbmNlKHBlZXIubm9kZUlkLCB0YXJnZXRJZCkpIHtcbiAgICAgICAgICAgICAgbGlzdFtpXSA9IHBlZXIubm9kZUlkO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBsaXN0O1xuICB9XG5cbiAgZ2V0QWxsUGVlcklkcygpOiBzdHJpbmdbXSB7XG4gICAgY29uc3QgYXJyID0gdGhpcy5nZXRBbGxQZWVycygpO1xuICAgIGlmIChhcnIubGVuZ3RoID4gMCkge1xuICAgICAgcmV0dXJuIGFyci5tYXAocGVlciA9PiB7XG4gICAgICAgIHJldHVybiBwZWVyLm5vZGVJZDtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuICB9XG5cbiAgaXNQZWVyRXhpc3QoaWQ6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IGlkcyA9IHRoaXMuZ2V0QWxsUGVlcklkcygpO1xuICAgIGlmIChpZHMpIHtcbiAgICAgIHJldHVybiBpZHMuaW5jbHVkZXMoaWQpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgZ2V0UGVlck51bSgpOiBudW1iZXIge1xuICAgIGNvbnN0IGFyciA9IHRoaXMuZ2V0QWxsUGVlcnMoKTtcbiAgICByZXR1cm4gYXJyLmxlbmd0aDtcbiAgfVxuXG4gIGNsZWFuRGlzY29uKCkge1xuICAgIHRoaXMua2J1Y2tldHMuZm9yRWFjaCgoa2J1Y2tldCwgaSkgPT4ge1xuICAgICAgaWYgKGtidWNrZXQubGVuZ3RoID4gMCkge1xuICAgICAgICBjb25zb2xlLmxvZyh7IGJlZm9yZTogdGhpcy5rYnVja2V0c1tpXSB9KTtcbiAgICAgICAgdGhpcy5rYnVja2V0c1tpXSA9IGtidWNrZXQuZmlsdGVyKHBlZXIgPT4gIXBlZXIuaXNEaXNjb25uZWN0ZWQpO1xuICAgICAgICBjb25zb2xlLmxvZyh7IGFmdGVyOiB0aGlzLmtidWNrZXRzW2ldIH0pO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgZ2V0S2J1Y2tldE51bSgpIHtcbiAgICBsZXQgbnVtID0gMDtcbiAgICB0aGlzLmtidWNrZXRzLmZvckVhY2goa2J1Y2tldCA9PiB7XG4gICAgICBpZiAoa2J1Y2tldC5sZW5ndGggPiAwKSBudW0rKztcbiAgICB9KTtcbiAgICByZXR1cm4gbnVtO1xuICB9XG5cbiAgaXNOb2RlRXhpc3Qobm9kZUlkOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICBjb25zdCBhcnIgPSB0aGlzLmdldEFsbFBlZXJJZHMoKTtcbiAgICBpZiAoIWFycikgcmV0dXJuIGZhbHNlO1xuICAgIHJldHVybiBhcnIuaW5jbHVkZXMobm9kZUlkKTtcbiAgfVxuXG4gIGdldENsb3NlUGVlcnModGFyZ2V0SWQ6IHN0cmluZywgb3B0PzogeyBleGNsdWRlSWQ/OiBzdHJpbmcgfSkge1xuICAgIGNvbnN0IGxpc3Q6IEFycmF5PFdlYlJUQz4gPSBbXTtcbiAgICB0aGlzLmdldEFsbFBlZXJzKCkuZm9yRWFjaChwZWVyID0+IHtcbiAgICAgIGlmICghKG9wdCAmJiBwZWVyLm5vZGVJZCA9PT0gb3B0LmV4Y2x1ZGVJZCkpIHtcbiAgICAgICAgaWYgKGxpc3QubGVuZ3RoIDwgdGhpcy5rKSB7XG4gICAgICAgICAgbGlzdC5wdXNoKHBlZXIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICBkaXN0YW5jZShsaXN0W2ldLm5vZGVJZCwgdGFyZ2V0SWQpID5cbiAgICAgICAgICAgICAgZGlzdGFuY2UocGVlci5ub2RlSWQsIHRhcmdldElkKVxuICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgIGxpc3RbaV0gPSBwZWVyO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBsaXN0O1xuICB9XG59XG4iXX0=
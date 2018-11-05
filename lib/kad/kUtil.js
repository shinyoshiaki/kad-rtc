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
      return this.getAllPeerIds().includes(nodeId);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9rYWQva1V0aWwudHMiXSwibmFtZXMiOlsiS1V0aWwiLCJrIiwia2J1Y2tldHMiLCJub2RlSWQiLCJBcnJheSIsInByb3RvdHlwZSIsImNvbmNhdCIsImFwcGx5IiwidGFyZ2V0SWQiLCJhbnMiLCJnZXRBbGxQZWVycyIsImZvckVhY2giLCJwZWVyIiwia2V5Iiwib3B0IiwiZXhjbHVkZUlkIiwiZGlzdCIsImdldENsb3NlRXN0RGlzdCIsImxpc3QiLCJwdXNoIiwidGFyZ2V0SUQiLCJsZW5ndGgiLCJjb25zb2xlIiwibG9nIiwiaSIsInBlZXJzIiwiZ2V0Q2xvc2VFc3RQZWVyc0xpc3QiLCJmaW5kIiwiX2tleSIsIm1pbmkiLCJjbG9zZVBlZXIiLCJrYnVja2V0IiwicmVkdWNlIiwiYSIsImIiLCJtYXAiLCJpZCIsImlkcyIsImdldEFsbFBlZXJJZHMiLCJpbmNsdWRlcyIsImFyciIsImJlZm9yZSIsImZpbHRlciIsImlzRGlzY29ubmVjdGVkIiwiYWZ0ZXIiLCJudW0iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFDQTs7Ozs7Ozs7OztJQUVxQkEsSzs7O0FBSW5CLGlCQUFZQyxDQUFaLEVBQXVCQyxRQUF2QixFQUF1REMsTUFBdkQsRUFBdUU7QUFBQTs7QUFBQTs7QUFBQTs7QUFBQTs7QUFDckUsU0FBS0YsQ0FBTCxHQUFTQSxDQUFUO0FBQ0EsU0FBS0MsUUFBTCxHQUFnQkEsUUFBaEI7QUFDQSxTQUFLQyxNQUFMLEdBQWNBLE1BQWQ7QUFDRDs7OztrQ0FFNEI7QUFDM0IsYUFBT0MsS0FBSyxDQUFDQyxTQUFOLENBQWdCQyxNQUFoQixDQUF1QkMsS0FBdkIsQ0FBNkIsRUFBN0IsRUFBaUMsS0FBS0wsUUFBdEMsQ0FBUDtBQUNEOzs7NEJBRU9NLFEsRUFBc0M7QUFDNUMsVUFBSUMsR0FBSjtBQUNBLFdBQUtDLFdBQUwsR0FBbUJDLE9BQW5CLENBQTJCLFVBQUFDLElBQUksRUFBSTtBQUNqQyxZQUFJQSxJQUFJLENBQUNULE1BQUwsS0FBZ0JL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NUI7QUFDQSxXQUFLUixXQUFMLEdBQW1CQyxPQUFuQixDQUEyQixVQUFBQyxJQUFJLEVBQUk7QUFDakMsWUFBSSxFQUFFRSxHQUFHLElBQUlGLElBQUksQ0FBQ1QsTUFBTCxLQUFnQlcsR0FBRyxDQUFDQyxTQUE3QixDQUFKLEVBQTZDO0FBQzNDLGNBQUlHLElBQUksQ0FBQ0csTUFBTCxHQUFjLE1BQUksQ0FBQ3BCLENBQXZCLEVBQTBCO0FBQ3hCaUIsWUFBQUEsSUFBSSxDQUFDQyxJQUFMLENBQVVQLElBQVY7QUFDRCxXQUZELE1BRU87QUFDTCxpQkFBSyxJQUFJWSxDQUFDLEdBQUcsQ0FBYixFQUFnQkEsQ0FBQyxHQUFHTixJQUFJLENBQUNHLE1BQXpCLEVBQWlDRyxDQUFDLEVBQWxDLEVBQXNDO0FBQ3BDLGtCQUNFLDJCQUFTTixJQUFJLENBQUNNLENBQUQsQ0FBSixDQUFRckIsTUFBakIsRUFBeUJLLFFBQXpCLElBQ0EsMkJBQVNJLElBQUksQ0FBQ1QsTUFBZCxFQUFzQkssUUFBdEIsQ0FGRixFQUdFO0FBQ0FVLGdCQUFBQSxJQUFJLENBQUNNLENBQUQsQ0FBSixHQUFVWixJQUFWO0FBQ0Q7QUFDRjtBQUNGO0FBQ0Y7QUFDRixPQWZEO0FBZ0JBLGFBQU9NLElBQVA7QUFDRCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBXZWJSVEMgZnJvbSBcIndlYnJ0YzRtZVwiO1xuaW1wb3J0IHsgZGlzdGFuY2UgfSBmcm9tIFwia2FkLWRpc3RhbmNlXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEtVdGlsIHtcbiAga2J1Y2tldHM6IEFycmF5PEFycmF5PFdlYlJUQz4+O1xuICBrOiBudW1iZXI7XG4gIG5vZGVJZDogc3RyaW5nO1xuICBjb25zdHJ1Y3RvcihrOiBudW1iZXIsIGtidWNrZXRzOiBBcnJheTxBcnJheTxXZWJSVEM+Piwgbm9kZUlkOiBzdHJpbmcpIHtcbiAgICB0aGlzLmsgPSBrO1xuICAgIHRoaXMua2J1Y2tldHMgPSBrYnVja2V0cztcbiAgICB0aGlzLm5vZGVJZCA9IG5vZGVJZDtcbiAgfVxuXG4gIGdldEFsbFBlZXJzKCk6IEFycmF5PFdlYlJUQz4ge1xuICAgIHJldHVybiBBcnJheS5wcm90b3R5cGUuY29uY2F0LmFwcGx5KFtdLCB0aGlzLmtidWNrZXRzKTtcbiAgfVxuXG4gIGdldFBlZXIodGFyZ2V0SWQ6IHN0cmluZyk6IFdlYlJUQyB8IHVuZGVmaW5lZCB7XG4gICAgbGV0IGFucztcbiAgICB0aGlzLmdldEFsbFBlZXJzKCkuZm9yRWFjaChwZWVyID0+IHtcbiAgICAgIGlmIChwZWVyLm5vZGVJZCA9PT0gdGFyZ2V0SWQpIGFucyA9IHBlZXI7XG4gICAgfSk7XG4gICAgcmV0dXJuIGFucztcbiAgfVxuXG4gIGdldENsb3NlRXN0UGVlcnNMaXN0KGtleTogc3RyaW5nLCBvcHQgPSB7IGV4Y2x1ZGVJZDogbnVsbCB9KSB7XG4gICAgY29uc3QgZGlzdCA9IHRoaXMuZ2V0Q2xvc2VFc3REaXN0KGtleSk7XG4gICAgY29uc3QgbGlzdDogQXJyYXk8V2ViUlRDPiA9IFtdO1xuICAgIHRoaXMuZ2V0QWxsUGVlcnMoKS5mb3JFYWNoKHBlZXIgPT4ge1xuICAgICAgaWYgKG9wdC5leGNsdWRlSWQgPT09IG51bGwgfHwgb3B0LmV4Y2x1ZGVJZCAhPT0gcGVlci5ub2RlSWQpIHtcbiAgICAgICAgaWYgKGRpc3RhbmNlKGtleSwgcGVlci5ub2RlSWQpID09PSBkaXN0KSB7XG4gICAgICAgICAgbGlzdC5wdXNoKHBlZXIpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIGxpc3Q7XG4gIH1cblxuICBnZXRDbG9zZUlEcyh0YXJnZXRJRDogc3RyaW5nKSB7XG4gICAgbGV0IGxpc3Q6IEFycmF5PHN0cmluZz4gPSBbXTtcbiAgICB0aGlzLmdldEFsbFBlZXJzKCkuZm9yRWFjaChwZWVyID0+IHtcbiAgICAgIGlmIChwZWVyLm5vZGVJZCAhPT0gdGFyZ2V0SUQpIHtcbiAgICAgICAgaWYgKGxpc3QubGVuZ3RoIDwgdGhpcy5rKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coXCJnZXRjbG9zZWlkcyBwdXNoXCIsIHBlZXIubm9kZUlkKTtcbiAgICAgICAgICBsaXN0LnB1c2gocGVlci5ub2RlSWQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnNvbGUubG9nKFwiZ2V0Y2xvc2VpZHMgZnVsbGVkXCIsIHsgbGlzdCB9KTtcbiAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmIChkaXN0YW5jZShsaXN0W2ldLCB0YXJnZXRJRCkgPiBkaXN0YW5jZShwZWVyLm5vZGVJZCwgdGFyZ2V0SUQpKSB7XG4gICAgICAgICAgICAgIGxpc3RbaV0gPSBwZWVyLm5vZGVJZDtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIGxpc3Q7XG4gIH1cblxuICBnZXRDbG9zZUVzdElkc0xpc3Qoa2V5OiBzdHJpbmcsIG9wdCA9IHsgZXhjbHVkZUlkOiBudWxsIH0pIHtcbiAgICBjb25zdCBwZWVycyA9IHRoaXMuZ2V0Q2xvc2VFc3RQZWVyc0xpc3Qoa2V5LCBvcHQpO1xuICAgIGNvbnN0IGxpc3Q6IEFycmF5PHN0cmluZz4gPSBbXTtcbiAgICBwZWVycy5mb3JFYWNoKHBlZXIgPT4gbGlzdC5wdXNoKHBlZXIubm9kZUlkKSk7XG4gICAgcmV0dXJuIGxpc3Q7XG4gIH1cblxuICBnZXRQZWVyRnJvbW5vZGVJZChub2RlSWQ6IHN0cmluZykge1xuICAgIHJldHVybiB0aGlzLmdldEFsbFBlZXJzKCkuZmluZChwZWVyID0+IHtcbiAgICAgIHJldHVybiBwZWVyLm5vZGVJZCA9PT0gbm9kZUlkO1xuICAgIH0pO1xuICB9XG5cbiAgZ2V0Q2xvc2VFc3RQZWVyKFxuICAgIF9rZXk6IHN0cmluZyxcbiAgICBvcHQ/OiB7IGV4Y2x1ZGVJZD86IHN0cmluZyB9XG4gICk6IFdlYlJUQyB8IHVuZGVmaW5lZCB7XG4gICAgbGV0IG1pbmkgPSAxNjA7XG4gICAgbGV0IGNsb3NlUGVlcjtcbiAgICB0aGlzLmtidWNrZXRzLmZvckVhY2goa2J1Y2tldCA9PiB7XG4gICAgICBrYnVja2V0LmZvckVhY2gocGVlciA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiZGlzdGFuY2VcIiwgcGVlci5ub2RlSWQsIGRpc3RhbmNlKF9rZXksIHBlZXIubm9kZUlkKSk7XG4gICAgICAgIGlmIChwZWVyLm5vZGVJZCA9PT0gdGhpcy5ub2RlSWQpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhcImdldGNsb3NlZXN0cGVlciBvbmx5IG1lXCIsIHRoaXMubm9kZUlkKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoXG4gICAgICAgICAgIShvcHQgJiYgcGVlci5ub2RlSWQgPT09IG9wdC5leGNsdWRlSWQpICYmXG4gICAgICAgICAgcGVlci5ub2RlSWQgIT09IHRoaXMubm9kZUlkXG4gICAgICAgICkge1xuICAgICAgICAgIGlmIChkaXN0YW5jZShfa2V5LCBwZWVyLm5vZGVJZCkgPCBtaW5pKSB7XG4gICAgICAgICAgICBtaW5pID0gZGlzdGFuY2UoX2tleSwgcGVlci5ub2RlSWQpO1xuICAgICAgICAgICAgY2xvc2VQZWVyID0gcGVlcjtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIHJldHVybiBjbG9zZVBlZXI7XG4gIH1cblxuICBnZXRDbG9zZUVzdERpc3Qoa2V5OiBzdHJpbmcpIHtcbiAgICBjb25zdCBwZWVycyA9IHRoaXMuZ2V0QWxsUGVlcnMoKTtcbiAgICBjb25zdCBtaW5pID0gcGVlcnMucmVkdWNlKChhLCBiKSA9PiB7XG4gICAgICBpZiAoZGlzdGFuY2UoYS5ub2RlSWQsIGtleSkgPCBkaXN0YW5jZShiLm5vZGVJZCwga2V5KSkgcmV0dXJuIGE7XG4gICAgICBlbHNlIHJldHVybiBiO1xuICAgIH0pO1xuICAgIHJldHVybiBkaXN0YW5jZShtaW5pLm5vZGVJZCwga2V5KTtcbiAgfVxuXG4gIGdldENsb3NlSWRzKHRhcmdldElkOiBzdHJpbmcpIHtcbiAgICBjb25zdCBsaXN0OiBBcnJheTxzdHJpbmc+ID0gW107XG4gICAgdGhpcy5nZXRBbGxQZWVycygpLmZvckVhY2gocGVlciA9PiB7XG4gICAgICBpZiAocGVlci5ub2RlSWQgIT09IHRhcmdldElkKSB7XG4gICAgICAgIGlmIChsaXN0Lmxlbmd0aCA8IHRoaXMuaykge1xuICAgICAgICAgIGxpc3QucHVzaChwZWVyLm5vZGVJZCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoZGlzdGFuY2UobGlzdFtpXSwgdGFyZ2V0SWQpID4gZGlzdGFuY2UocGVlci5ub2RlSWQsIHRhcmdldElkKSkge1xuICAgICAgICAgICAgICBsaXN0W2ldID0gcGVlci5ub2RlSWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIGxpc3Q7XG4gIH1cblxuICBnZXRBbGxQZWVySWRzKCkge1xuICAgIHJldHVybiB0aGlzLmdldEFsbFBlZXJzKCkubWFwKHBlZXIgPT4ge1xuICAgICAgaWYgKHBlZXIpIHtcbiAgICAgICAgcmV0dXJuIHBlZXIubm9kZUlkO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgaXNQZWVyRXhpc3QoaWQ6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IGlkcyA9IHRoaXMuZ2V0QWxsUGVlcklkcygpO1xuICAgIGlmIChpZHMpIHtcbiAgICAgIHJldHVybiBpZHMuaW5jbHVkZXMoaWQpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgZ2V0UGVlck51bSgpOiBudW1iZXIge1xuICAgIGNvbnN0IGFyciA9IHRoaXMuZ2V0QWxsUGVlcnMoKTtcbiAgICByZXR1cm4gYXJyLmxlbmd0aDtcbiAgfVxuXG4gIGNsZWFuRGlzY29uKCkge1xuICAgIHRoaXMua2J1Y2tldHMuZm9yRWFjaCgoa2J1Y2tldCwgaSkgPT4ge1xuICAgICAgaWYgKGtidWNrZXQubGVuZ3RoID4gMCkge1xuICAgICAgICBjb25zb2xlLmxvZyh7IGJlZm9yZTogdGhpcy5rYnVja2V0c1tpXSB9KTtcbiAgICAgICAgdGhpcy5rYnVja2V0c1tpXSA9IGtidWNrZXQuZmlsdGVyKHBlZXIgPT4gIXBlZXIuaXNEaXNjb25uZWN0ZWQpO1xuICAgICAgICBjb25zb2xlLmxvZyh7IGFmdGVyOiB0aGlzLmtidWNrZXRzW2ldIH0pO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgZ2V0S2J1Y2tldE51bSgpIHtcbiAgICBsZXQgbnVtID0gMDtcbiAgICB0aGlzLmtidWNrZXRzLmZvckVhY2goa2J1Y2tldCA9PiB7XG4gICAgICBpZiAoa2J1Y2tldC5sZW5ndGggPiAwKSBudW0rKztcbiAgICB9KTtcbiAgICByZXR1cm4gbnVtO1xuICB9XG5cbiAgaXNOb2RlRXhpc3Qobm9kZUlkOiBzdHJpbmcpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRBbGxQZWVySWRzKCkuaW5jbHVkZXMobm9kZUlkKTtcbiAgfVxuXG4gIGdldENsb3NlUGVlcnModGFyZ2V0SWQ6IHN0cmluZywgb3B0PzogeyBleGNsdWRlSWQ/OiBzdHJpbmcgfSkge1xuICAgIGNvbnN0IGxpc3Q6IEFycmF5PFdlYlJUQz4gPSBbXTtcbiAgICB0aGlzLmdldEFsbFBlZXJzKCkuZm9yRWFjaChwZWVyID0+IHtcbiAgICAgIGlmICghKG9wdCAmJiBwZWVyLm5vZGVJZCA9PT0gb3B0LmV4Y2x1ZGVJZCkpIHtcbiAgICAgICAgaWYgKGxpc3QubGVuZ3RoIDwgdGhpcy5rKSB7XG4gICAgICAgICAgbGlzdC5wdXNoKHBlZXIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICBkaXN0YW5jZShsaXN0W2ldLm5vZGVJZCwgdGFyZ2V0SWQpID5cbiAgICAgICAgICAgICAgZGlzdGFuY2UocGVlci5ub2RlSWQsIHRhcmdldElkKVxuICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgIGxpc3RbaV0gPSBwZWVyO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBsaXN0O1xuICB9XG59XG4iXX0=
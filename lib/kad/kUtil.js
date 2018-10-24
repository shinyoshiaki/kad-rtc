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
        if (kbucket.length > 0) {
          console.log({
            before: _this3.kbuckets[i]
          });
          _this3.kbuckets[i] = kbucket.filter(function (peer) {
            return !peer.isDisconnected;
          });
          console.log({
            after: _this3.kbuckets[i]
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9rYWQva1V0aWwudHMiXSwibmFtZXMiOlsiS1V0aWwiLCJrIiwia2J1Y2tldHMiLCJBcnJheSIsInByb3RvdHlwZSIsImNvbmNhdCIsImFwcGx5IiwidGFyZ2V0SWQiLCJhbnMiLCJnZXRBbGxQZWVycyIsImZvckVhY2giLCJwZWVyIiwibm9kZUlkIiwia2V5Iiwib3B0IiwiZXhjbHVkZUlkIiwiZGlzdCIsImdldENsb3NlRXN0RGlzdCIsImxpc3QiLCJwdXNoIiwidGFyZ2V0SUQiLCJsZW5ndGgiLCJjb25zb2xlIiwibG9nIiwiaSIsInBlZXJzIiwiZ2V0Q2xvc2VFc3RQZWVyc0xpc3QiLCJmaW5kIiwiX2tleSIsIm1pbmkiLCJjbG9zZVBlZXIiLCJrYnVja2V0IiwicmVkdWNlIiwiYSIsImIiLCJtYXAiLCJpZCIsImlkcyIsImdldEFsbFBlZXJJZHMiLCJpbmNsdWRlcyIsImFyciIsImJlZm9yZSIsImZpbHRlciIsImlzRGlzY29ubmVjdGVkIiwiYWZ0ZXIiLCJudW0iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFDQTs7Ozs7Ozs7OztJQUVxQkEsSzs7O0FBR25CLGlCQUFZQyxDQUFaLEVBQXVCQyxRQUF2QixFQUF1RDtBQUFBOztBQUFBOztBQUFBOztBQUNyRCxTQUFLRCxDQUFMLEdBQVNBLENBQVQ7QUFDQSxTQUFLQyxRQUFMLEdBQWdCQSxRQUFoQjtBQUNEOzs7O2tDQUU0QjtBQUMzQixhQUFPQyxLQUFLLENBQUNDLFNBQU4sQ0FBZ0JDLE1BQWhCLENBQXVCQyxLQUF2QixDQUE2QixFQUE3QixFQUFpQyxLQUFLSixRQUF0QyxDQUFQO0FBQ0Q7Ozs0QkFFT0ssUSxFQUFzQztBQUM1QyxVQUFJQyxHQUFKO0FBQ0EsV0FBS0MsV0FBTCxHQUFtQkMsT0FBbkIsQ0FBMkIsVUFBQUMsSUFBSSxFQUFJO0FBQ2pDLFlBQUlBLElBQUksQ0FBQ0MsTUFBTCxLQUFnQkwsUUFBcEIsRUFBOEJDLEdBQUcsR0FBR0csSUFBTjtBQUMvQixPQUZEO0FBR0Es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WUFBQUEsSUFBSSxDQUFDQyxJQUFMLENBQVVSLElBQVY7QUFDRCxXQUZELE1BRU87QUFDTCxpQkFBSyxJQUFJYSxDQUFDLEdBQUcsQ0FBYixFQUFnQkEsQ0FBQyxHQUFHTixJQUFJLENBQUNHLE1BQXpCLEVBQWlDRyxDQUFDLEVBQWxDLEVBQXNDO0FBQ3BDLGtCQUNFLDJCQUFTTixJQUFJLENBQUNNLENBQUQsQ0FBSixDQUFRWixNQUFqQixFQUF5QkwsUUFBekIsSUFDQSwyQkFBU0ksSUFBSSxDQUFDQyxNQUFkLEVBQXNCTCxRQUF0QixDQUZGLEVBR0U7QUFDQVcsZ0JBQUFBLElBQUksQ0FBQ00sQ0FBRCxDQUFKLEdBQVViLElBQVY7QUFDRDtBQUNGO0FBQ0Y7QUFDRjtBQUNGLE9BZkQ7QUFnQkEsYUFBT08sSUFBUDtBQUNEIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFdlYlJUQyBmcm9tIFwid2VicnRjNG1lXCI7XG5pbXBvcnQgeyBkaXN0YW5jZSB9IGZyb20gXCJrYWQtZGlzdGFuY2VcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgS1V0aWwge1xuICBrYnVja2V0czogQXJyYXk8QXJyYXk8V2ViUlRDPj47XG4gIGs6IG51bWJlcjtcbiAgY29uc3RydWN0b3IoazogbnVtYmVyLCBrYnVja2V0czogQXJyYXk8QXJyYXk8V2ViUlRDPj4pIHtcbiAgICB0aGlzLmsgPSBrO1xuICAgIHRoaXMua2J1Y2tldHMgPSBrYnVja2V0cztcbiAgfVxuXG4gIGdldEFsbFBlZXJzKCk6IEFycmF5PFdlYlJUQz4ge1xuICAgIHJldHVybiBBcnJheS5wcm90b3R5cGUuY29uY2F0LmFwcGx5KFtdLCB0aGlzLmtidWNrZXRzKTtcbiAgfVxuXG4gIGdldFBlZXIodGFyZ2V0SWQ6IHN0cmluZyk6IFdlYlJUQyB8IHVuZGVmaW5lZCB7XG4gICAgbGV0IGFucztcbiAgICB0aGlzLmdldEFsbFBlZXJzKCkuZm9yRWFjaChwZWVyID0+IHtcbiAgICAgIGlmIChwZWVyLm5vZGVJZCA9PT0gdGFyZ2V0SWQpIGFucyA9IHBlZXI7XG4gICAgfSk7XG4gICAgcmV0dXJuIGFucztcbiAgfVxuXG4gIGdldENsb3NlRXN0UGVlcnNMaXN0KGtleTogc3RyaW5nLCBvcHQgPSB7IGV4Y2x1ZGVJZDogbnVsbCB9KSB7XG4gICAgY29uc3QgZGlzdCA9IHRoaXMuZ2V0Q2xvc2VFc3REaXN0KGtleSk7XG4gICAgY29uc3QgbGlzdDogQXJyYXk8V2ViUlRDPiA9IFtdO1xuICAgIHRoaXMuZ2V0QWxsUGVlcnMoKS5mb3JFYWNoKHBlZXIgPT4ge1xuICAgICAgaWYgKG9wdC5leGNsdWRlSWQgPT09IG51bGwgfHwgb3B0LmV4Y2x1ZGVJZCAhPT0gcGVlci5ub2RlSWQpIHtcbiAgICAgICAgaWYgKGRpc3RhbmNlKGtleSwgcGVlci5ub2RlSWQpID09PSBkaXN0KSB7XG4gICAgICAgICAgbGlzdC5wdXNoKHBlZXIpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIGxpc3Q7XG4gIH1cblxuICBnZXRDbG9zZUlEcyh0YXJnZXRJRDogc3RyaW5nKSB7XG4gICAgbGV0IGxpc3Q6IEFycmF5PHN0cmluZz4gPSBbXTtcbiAgICB0aGlzLmdldEFsbFBlZXJzKCkuZm9yRWFjaChwZWVyID0+IHtcbiAgICAgIGlmIChwZWVyLm5vZGVJZCAhPT0gdGFyZ2V0SUQpIHtcbiAgICAgICAgaWYgKGxpc3QubGVuZ3RoIDwgdGhpcy5rKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coXCJnZXRjbG9zZWlkcyBwdXNoXCIsIHBlZXIubm9kZUlkKTtcbiAgICAgICAgICBsaXN0LnB1c2gocGVlci5ub2RlSWQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnNvbGUubG9nKFwiZ2V0Y2xvc2VpZHMgZnVsbGVkXCIsIHsgbGlzdCB9KTtcbiAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmIChkaXN0YW5jZShsaXN0W2ldLCB0YXJnZXRJRCkgPiBkaXN0YW5jZShwZWVyLm5vZGVJZCwgdGFyZ2V0SUQpKSB7XG4gICAgICAgICAgICAgIGxpc3RbaV0gPSBwZWVyLm5vZGVJZDtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIGxpc3Q7XG4gIH1cblxuICBnZXRDbG9zZUVzdElkc0xpc3Qoa2V5OiBzdHJpbmcsIG9wdCA9IHsgZXhjbHVkZUlkOiBudWxsIH0pIHtcbiAgICBjb25zdCBwZWVycyA9IHRoaXMuZ2V0Q2xvc2VFc3RQZWVyc0xpc3Qoa2V5LCBvcHQpO1xuICAgIGNvbnN0IGxpc3Q6IEFycmF5PHN0cmluZz4gPSBbXTtcbiAgICBwZWVycy5mb3JFYWNoKHBlZXIgPT4gbGlzdC5wdXNoKHBlZXIubm9kZUlkKSk7XG4gICAgcmV0dXJuIGxpc3Q7XG4gIH1cblxuICBnZXRQZWVyRnJvbW5vZGVJZChub2RlSWQ6IHN0cmluZykge1xuICAgIHJldHVybiB0aGlzLmdldEFsbFBlZXJzKCkuZmluZChwZWVyID0+IHtcbiAgICAgIHJldHVybiBwZWVyLm5vZGVJZCA9PT0gbm9kZUlkO1xuICAgIH0pO1xuICB9XG5cbiAgZ2V0Q2xvc2VFc3RQZWVyKF9rZXk6IHN0cmluZywgb3B0ID0geyBleGNsdWRlSWQ6IG51bGwgfSk6IFdlYlJUQyB8IHVuZGVmaW5lZCB7XG4gICAgbGV0IG1pbmkgPSAxNjA7XG4gICAgbGV0IGNsb3NlUGVlcjtcbiAgICB0aGlzLmtidWNrZXRzLmZvckVhY2goa2J1Y2tldCA9PiB7XG4gICAgICBrYnVja2V0LmZvckVhY2gocGVlciA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiZGlzdGFuY2VcIiwgcGVlci5ub2RlSWQsIGRpc3RhbmNlKF9rZXksIHBlZXIubm9kZUlkKSk7XG4gICAgICAgIGlmIChvcHQuZXhjbHVkZUlkID09PSBudWxsIHx8IG9wdC5leGNsdWRlSWQgIT09IHBlZXIubm9kZUlkKSB7XG4gICAgICAgICAgaWYgKGRpc3RhbmNlKF9rZXksIHBlZXIubm9kZUlkKSA8IG1pbmkpIHtcbiAgICAgICAgICAgIG1pbmkgPSBkaXN0YW5jZShfa2V5LCBwZWVyLm5vZGVJZCk7XG4gICAgICAgICAgICBjbG9zZVBlZXIgPSBwZWVyO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIGNsb3NlUGVlcjtcbiAgfVxuXG4gIGdldENsb3NlRXN0RGlzdChrZXk6IHN0cmluZykge1xuICAgIGNvbnN0IHBlZXJzID0gdGhpcy5nZXRBbGxQZWVycygpO1xuICAgIGNvbnN0IG1pbmkgPSBwZWVycy5yZWR1Y2UoKGEsIGIpID0+IHtcbiAgICAgIGlmIChkaXN0YW5jZShhLm5vZGVJZCwga2V5KSA8IGRpc3RhbmNlKGIubm9kZUlkLCBrZXkpKSByZXR1cm4gYTtcbiAgICAgIGVsc2UgcmV0dXJuIGI7XG4gICAgfSk7XG4gICAgcmV0dXJuIGRpc3RhbmNlKG1pbmkubm9kZUlkLCBrZXkpO1xuICB9XG5cbiAgZ2V0Q2xvc2VJZHModGFyZ2V0SWQ6IHN0cmluZykge1xuICAgIGNvbnN0IGxpc3Q6IEFycmF5PHN0cmluZz4gPSBbXTtcbiAgICB0aGlzLmdldEFsbFBlZXJzKCkuZm9yRWFjaChwZWVyID0+IHtcbiAgICAgIGlmIChwZWVyLm5vZGVJZCAhPT0gdGFyZ2V0SWQpIHtcbiAgICAgICAgaWYgKGxpc3QubGVuZ3RoIDwgdGhpcy5rKSB7XG4gICAgICAgICAgbGlzdC5wdXNoKHBlZXIubm9kZUlkKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmIChkaXN0YW5jZShsaXN0W2ldLCB0YXJnZXRJZCkgPiBkaXN0YW5jZShwZWVyLm5vZGVJZCwgdGFyZ2V0SWQpKSB7XG4gICAgICAgICAgICAgIGxpc3RbaV0gPSBwZWVyLm5vZGVJZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gbGlzdDtcbiAgfVxuXG4gIGdldEFsbFBlZXJJZHMoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0QWxsUGVlcnMoKS5tYXAocGVlciA9PiB7XG4gICAgICBpZiAocGVlcikge1xuICAgICAgICByZXR1cm4gcGVlci5ub2RlSWQ7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBpc1BlZXJFeGlzdChpZDogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgY29uc3QgaWRzID0gdGhpcy5nZXRBbGxQZWVySWRzKCk7XG4gICAgaWYgKGlkcykge1xuICAgICAgcmV0dXJuIGlkcy5pbmNsdWRlcyhpZCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxuICBnZXRQZWVyTnVtKCk6IG51bWJlciB7XG4gICAgY29uc3QgYXJyID0gdGhpcy5nZXRBbGxQZWVycygpO1xuICAgIHJldHVybiBhcnIubGVuZ3RoO1xuICB9XG5cbiAgY2xlYW5EaXNjb24oKSB7XG4gICAgdGhpcy5rYnVja2V0cy5mb3JFYWNoKChrYnVja2V0LCBpKSA9PiB7XG4gICAgICBpZiAoa2J1Y2tldC5sZW5ndGggPiAwKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKHsgYmVmb3JlOiB0aGlzLmtidWNrZXRzW2ldIH0pO1xuICAgICAgICB0aGlzLmtidWNrZXRzW2ldID0ga2J1Y2tldC5maWx0ZXIocGVlciA9PiAhcGVlci5pc0Rpc2Nvbm5lY3RlZCk7XG4gICAgICAgIGNvbnNvbGUubG9nKHsgYWZ0ZXI6IHRoaXMua2J1Y2tldHNbaV0gfSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBnZXRLYnVja2V0TnVtKCkge1xuICAgIGxldCBudW0gPSAwO1xuICAgIHRoaXMua2J1Y2tldHMuZm9yRWFjaChrYnVja2V0ID0+IHtcbiAgICAgIGlmIChrYnVja2V0Lmxlbmd0aCA+IDApIG51bSsrO1xuICAgIH0pO1xuICAgIHJldHVybiBudW07XG4gIH1cblxuICBpc05vZGVFeGlzdChub2RlSWQ6IHN0cmluZykge1xuICAgIHJldHVybiB0aGlzLmdldEFsbFBlZXJJZHMoKS5pbmNsdWRlcyhub2RlSWQpO1xuICB9XG5cbiAgZ2V0Q2xvc2VQZWVycyh0YXJnZXRJZDogc3RyaW5nKSB7XG4gICAgY29uc3QgbGlzdDogQXJyYXk8V2ViUlRDPiA9IFtdO1xuICAgIHRoaXMuZ2V0QWxsUGVlcnMoKS5mb3JFYWNoKHBlZXIgPT4ge1xuICAgICAgaWYgKHBlZXIubm9kZUlkICE9PSB0YXJnZXRJZCkge1xuICAgICAgICBpZiAobGlzdC5sZW5ndGggPCB0aGlzLmspIHtcbiAgICAgICAgICBsaXN0LnB1c2gocGVlcik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgIGRpc3RhbmNlKGxpc3RbaV0ubm9kZUlkLCB0YXJnZXRJZCkgPlxuICAgICAgICAgICAgICBkaXN0YW5jZShwZWVyLm5vZGVJZCwgdGFyZ2V0SWQpXG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgbGlzdFtpXSA9IHBlZXI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIGxpc3Q7XG4gIH1cbn1cbiJdfQ==
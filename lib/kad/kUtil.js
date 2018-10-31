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
    value: function getCloseEstPeer(_key, opt) {
      var mini = 160;
      var closePeer;
      this.kbuckets.forEach(function (kbucket) {
        kbucket.forEach(function (peer) {
          console.log("distance", peer.nodeId, (0, _kadDistance.distance)(_key, peer.nodeId));

          if (!(opt && peer.nodeId === opt.excludeId)) {
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
    value: function getClosePeers(targetId, opt) {
      var _this4 = this;

      var list = [];
      this.getAllPeers().forEach(function (peer) {
        if (!(opt && peer.nodeId === opt.excludeId)) {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9rYWQva1V0aWwudHMiXSwibmFtZXMiOlsiS1V0aWwiLCJrIiwia2J1Y2tldHMiLCJBcnJheSIsInByb3RvdHlwZSIsImNvbmNhdCIsImFwcGx5IiwidGFyZ2V0SWQiLCJhbnMiLCJnZXRBbGxQZWVycyIsImZvckVhY2giLCJwZWVyIiwibm9kZUlkIiwia2V5Iiwib3B0IiwiZXhjbHVkZUlkIiwiZGlzdCIsImdldENsb3NlRXN0RGlzdCIsImxpc3QiLCJwdXNoIiwidGFyZ2V0SUQiLCJsZW5ndGgiLCJjb25zb2xlIiwibG9nIiwiaSIsInBlZXJzIiwiZ2V0Q2xvc2VFc3RQZWVyc0xpc3QiLCJmaW5kIiwiX2tleSIsIm1pbmkiLCJjbG9zZVBlZXIiLCJrYnVja2V0IiwicmVkdWNlIiwiYSIsImIiLCJtYXAiLCJpZCIsImlkcyIsImdldEFsbFBlZXJJZHMiLCJpbmNsdWRlcyIsImFyciIsImJlZm9yZSIsImZpbHRlciIsImlzRGlzY29ubmVjdGVkIiwiYWZ0ZXIiLCJudW0iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFDQTs7Ozs7Ozs7OztJQUVxQkEsSzs7O0FBR25CLGlCQUFZQyxDQUFaLEVBQXVCQyxRQUF2QixFQUF1RDtBQUFBOztBQUFBOztBQUFBOztBQUNyRCxTQUFLRCxDQUFMLEdBQVNBLENBQVQ7QUFDQSxTQUFLQyxRQUFMLEdBQWdCQSxRQUFoQjtBQUNEOzs7O2tDQUU0QjtBQUMzQixhQUFPQyxLQUFLLENBQUNDLFNBQU4sQ0FBZ0JDLE1BQWhCLENBQXVCQyxLQUF2QixDQUE2QixFQUE3QixFQUFpQyxLQUFLSixRQUF0QyxDQUFQO0FBQ0Q7Ozs0QkFFT0ssUSxFQUFzQztBQUM1QyxVQUFJQyxHQUFKO0FBQ0EsV0FBS0MsV0FBTCxHQUFtQkMsT0FBbkIsQ0FBMkIsVUFBQUMsSUFBSSxFQUFJO0FBQ2pDLFlBQUlBLElBQUksQ0FBQ0MsTUFBTCxLQUFnQkwsUUFBcEIsRUFBOEJDLEdBQUcsR0FBR0csSUFBTjtBQUMvQixPQUZEO0FBR0Es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QVVSLElBQVY7QUFDRCxXQUZELE1BRU87QUFDTCxpQkFBSyxJQUFJYSxDQUFDLEdBQUcsQ0FBYixFQUFnQkEsQ0FBQyxHQUFHTixJQUFJLENBQUNHLE1BQXpCLEVBQWlDRyxDQUFDLEVBQWxDLEVBQXNDO0FBQ3BDLGtCQUNFLDJCQUFTTixJQUFJLENBQUNNLENBQUQsQ0FBSixDQUFRWixNQUFqQixFQUF5QkwsUUFBekIsSUFDQSwyQkFBU0ksSUFBSSxDQUFDQyxNQUFkLEVBQXNCTCxRQUF0QixDQUZGLEVBR0U7QUFDQVcsZ0JBQUFBLElBQUksQ0FBQ00sQ0FBRCxDQUFKLEdBQVViLElBQVY7QUFDRDtBQUNGO0FBQ0Y7QUFDRjtBQUNGLE9BZkQ7QUFnQkEsYUFBT08sSUFBUDtBQUNEIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFdlYlJUQyBmcm9tIFwid2VicnRjNG1lXCI7XG5pbXBvcnQgeyBkaXN0YW5jZSB9IGZyb20gXCJrYWQtZGlzdGFuY2VcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgS1V0aWwge1xuICBrYnVja2V0czogQXJyYXk8QXJyYXk8V2ViUlRDPj47XG4gIGs6IG51bWJlcjtcbiAgY29uc3RydWN0b3IoazogbnVtYmVyLCBrYnVja2V0czogQXJyYXk8QXJyYXk8V2ViUlRDPj4pIHtcbiAgICB0aGlzLmsgPSBrO1xuICAgIHRoaXMua2J1Y2tldHMgPSBrYnVja2V0cztcbiAgfVxuXG4gIGdldEFsbFBlZXJzKCk6IEFycmF5PFdlYlJUQz4ge1xuICAgIHJldHVybiBBcnJheS5wcm90b3R5cGUuY29uY2F0LmFwcGx5KFtdLCB0aGlzLmtidWNrZXRzKTtcbiAgfVxuXG4gIGdldFBlZXIodGFyZ2V0SWQ6IHN0cmluZyk6IFdlYlJUQyB8IHVuZGVmaW5lZCB7XG4gICAgbGV0IGFucztcbiAgICB0aGlzLmdldEFsbFBlZXJzKCkuZm9yRWFjaChwZWVyID0+IHtcbiAgICAgIGlmIChwZWVyLm5vZGVJZCA9PT0gdGFyZ2V0SWQpIGFucyA9IHBlZXI7XG4gICAgfSk7XG4gICAgcmV0dXJuIGFucztcbiAgfVxuXG4gIGdldENsb3NlRXN0UGVlcnNMaXN0KGtleTogc3RyaW5nLCBvcHQgPSB7IGV4Y2x1ZGVJZDogbnVsbCB9KSB7XG4gICAgY29uc3QgZGlzdCA9IHRoaXMuZ2V0Q2xvc2VFc3REaXN0KGtleSk7XG4gICAgY29uc3QgbGlzdDogQXJyYXk8V2ViUlRDPiA9IFtdO1xuICAgIHRoaXMuZ2V0QWxsUGVlcnMoKS5mb3JFYWNoKHBlZXIgPT4ge1xuICAgICAgaWYgKG9wdC5leGNsdWRlSWQgPT09IG51bGwgfHwgb3B0LmV4Y2x1ZGVJZCAhPT0gcGVlci5ub2RlSWQpIHtcbiAgICAgICAgaWYgKGRpc3RhbmNlKGtleSwgcGVlci5ub2RlSWQpID09PSBkaXN0KSB7XG4gICAgICAgICAgbGlzdC5wdXNoKHBlZXIpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIGxpc3Q7XG4gIH1cblxuICBnZXRDbG9zZUlEcyh0YXJnZXRJRDogc3RyaW5nKSB7XG4gICAgbGV0IGxpc3Q6IEFycmF5PHN0cmluZz4gPSBbXTtcbiAgICB0aGlzLmdldEFsbFBlZXJzKCkuZm9yRWFjaChwZWVyID0+IHtcbiAgICAgIGlmIChwZWVyLm5vZGVJZCAhPT0gdGFyZ2V0SUQpIHtcbiAgICAgICAgaWYgKGxpc3QubGVuZ3RoIDwgdGhpcy5rKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coXCJnZXRjbG9zZWlkcyBwdXNoXCIsIHBlZXIubm9kZUlkKTtcbiAgICAgICAgICBsaXN0LnB1c2gocGVlci5ub2RlSWQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnNvbGUubG9nKFwiZ2V0Y2xvc2VpZHMgZnVsbGVkXCIsIHsgbGlzdCB9KTtcbiAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmIChkaXN0YW5jZShsaXN0W2ldLCB0YXJnZXRJRCkgPiBkaXN0YW5jZShwZWVyLm5vZGVJZCwgdGFyZ2V0SUQpKSB7XG4gICAgICAgICAgICAgIGxpc3RbaV0gPSBwZWVyLm5vZGVJZDtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIGxpc3Q7XG4gIH1cblxuICBnZXRDbG9zZUVzdElkc0xpc3Qoa2V5OiBzdHJpbmcsIG9wdCA9IHsgZXhjbHVkZUlkOiBudWxsIH0pIHtcbiAgICBjb25zdCBwZWVycyA9IHRoaXMuZ2V0Q2xvc2VFc3RQZWVyc0xpc3Qoa2V5LCBvcHQpO1xuICAgIGNvbnN0IGxpc3Q6IEFycmF5PHN0cmluZz4gPSBbXTtcbiAgICBwZWVycy5mb3JFYWNoKHBlZXIgPT4gbGlzdC5wdXNoKHBlZXIubm9kZUlkKSk7XG4gICAgcmV0dXJuIGxpc3Q7XG4gIH1cblxuICBnZXRQZWVyRnJvbW5vZGVJZChub2RlSWQ6IHN0cmluZykge1xuICAgIHJldHVybiB0aGlzLmdldEFsbFBlZXJzKCkuZmluZChwZWVyID0+IHtcbiAgICAgIHJldHVybiBwZWVyLm5vZGVJZCA9PT0gbm9kZUlkO1xuICAgIH0pO1xuICB9XG5cbiAgZ2V0Q2xvc2VFc3RQZWVyKFxuICAgIF9rZXk6IHN0cmluZyxcbiAgICBvcHQ/OiB7IGV4Y2x1ZGVJZD86IHN0cmluZyB9XG4gICk6IFdlYlJUQyB8IHVuZGVmaW5lZCB7XG4gICAgbGV0IG1pbmkgPSAxNjA7XG4gICAgbGV0IGNsb3NlUGVlcjtcbiAgICB0aGlzLmtidWNrZXRzLmZvckVhY2goa2J1Y2tldCA9PiB7XG4gICAgICBrYnVja2V0LmZvckVhY2gocGVlciA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiZGlzdGFuY2VcIiwgcGVlci5ub2RlSWQsIGRpc3RhbmNlKF9rZXksIHBlZXIubm9kZUlkKSk7XG4gICAgICAgIGlmICghKG9wdCAmJiBwZWVyLm5vZGVJZCA9PT0gb3B0LmV4Y2x1ZGVJZCkpIHtcbiAgICAgICAgICBpZiAoZGlzdGFuY2UoX2tleSwgcGVlci5ub2RlSWQpIDwgbWluaSkge1xuICAgICAgICAgICAgbWluaSA9IGRpc3RhbmNlKF9rZXksIHBlZXIubm9kZUlkKTtcbiAgICAgICAgICAgIGNsb3NlUGVlciA9IHBlZXI7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcbiAgICByZXR1cm4gY2xvc2VQZWVyO1xuICB9XG5cbiAgZ2V0Q2xvc2VFc3REaXN0KGtleTogc3RyaW5nKSB7XG4gICAgY29uc3QgcGVlcnMgPSB0aGlzLmdldEFsbFBlZXJzKCk7XG4gICAgY29uc3QgbWluaSA9IHBlZXJzLnJlZHVjZSgoYSwgYikgPT4ge1xuICAgICAgaWYgKGRpc3RhbmNlKGEubm9kZUlkLCBrZXkpIDwgZGlzdGFuY2UoYi5ub2RlSWQsIGtleSkpIHJldHVybiBhO1xuICAgICAgZWxzZSByZXR1cm4gYjtcbiAgICB9KTtcbiAgICByZXR1cm4gZGlzdGFuY2UobWluaS5ub2RlSWQsIGtleSk7XG4gIH1cblxuICBnZXRDbG9zZUlkcyh0YXJnZXRJZDogc3RyaW5nKSB7XG4gICAgY29uc3QgbGlzdDogQXJyYXk8c3RyaW5nPiA9IFtdO1xuICAgIHRoaXMuZ2V0QWxsUGVlcnMoKS5mb3JFYWNoKHBlZXIgPT4ge1xuICAgICAgaWYgKHBlZXIubm9kZUlkICE9PSB0YXJnZXRJZCkge1xuICAgICAgICBpZiAobGlzdC5sZW5ndGggPCB0aGlzLmspIHtcbiAgICAgICAgICBsaXN0LnB1c2gocGVlci5ub2RlSWQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKGRpc3RhbmNlKGxpc3RbaV0sIHRhcmdldElkKSA+IGRpc3RhbmNlKHBlZXIubm9kZUlkLCB0YXJnZXRJZCkpIHtcbiAgICAgICAgICAgICAgbGlzdFtpXSA9IHBlZXIubm9kZUlkO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBsaXN0O1xuICB9XG5cbiAgZ2V0QWxsUGVlcklkcygpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRBbGxQZWVycygpLm1hcChwZWVyID0+IHtcbiAgICAgIGlmIChwZWVyKSB7XG4gICAgICAgIHJldHVybiBwZWVyLm5vZGVJZDtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGlzUGVlckV4aXN0KGlkOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICBjb25zdCBpZHMgPSB0aGlzLmdldEFsbFBlZXJJZHMoKTtcbiAgICBpZiAoaWRzKSB7XG4gICAgICByZXR1cm4gaWRzLmluY2x1ZGVzKGlkKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIGdldFBlZXJOdW0oKTogbnVtYmVyIHtcbiAgICBjb25zdCBhcnIgPSB0aGlzLmdldEFsbFBlZXJzKCk7XG4gICAgcmV0dXJuIGFyci5sZW5ndGg7XG4gIH1cblxuICBjbGVhbkRpc2NvbigpIHtcbiAgICB0aGlzLmtidWNrZXRzLmZvckVhY2goKGtidWNrZXQsIGkpID0+IHtcbiAgICAgIGlmIChrYnVja2V0Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgY29uc29sZS5sb2coeyBiZWZvcmU6IHRoaXMua2J1Y2tldHNbaV0gfSk7XG4gICAgICAgIHRoaXMua2J1Y2tldHNbaV0gPSBrYnVja2V0LmZpbHRlcihwZWVyID0+ICFwZWVyLmlzRGlzY29ubmVjdGVkKTtcbiAgICAgICAgY29uc29sZS5sb2coeyBhZnRlcjogdGhpcy5rYnVja2V0c1tpXSB9KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGdldEtidWNrZXROdW0oKSB7XG4gICAgbGV0IG51bSA9IDA7XG4gICAgdGhpcy5rYnVja2V0cy5mb3JFYWNoKGtidWNrZXQgPT4ge1xuICAgICAgaWYgKGtidWNrZXQubGVuZ3RoID4gMCkgbnVtKys7XG4gICAgfSk7XG4gICAgcmV0dXJuIG51bTtcbiAgfVxuXG4gIGlzTm9kZUV4aXN0KG5vZGVJZDogc3RyaW5nKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0QWxsUGVlcklkcygpLmluY2x1ZGVzKG5vZGVJZCk7XG4gIH1cblxuICBnZXRDbG9zZVBlZXJzKHRhcmdldElkOiBzdHJpbmcsIG9wdD86IHsgZXhjbHVkZUlkPzogc3RyaW5nIH0pIHtcbiAgICBjb25zdCBsaXN0OiBBcnJheTxXZWJSVEM+ID0gW107XG4gICAgdGhpcy5nZXRBbGxQZWVycygpLmZvckVhY2gocGVlciA9PiB7XG4gICAgICBpZiAoIShvcHQgJiYgcGVlci5ub2RlSWQgPT09IG9wdC5leGNsdWRlSWQpKSB7XG4gICAgICAgIGlmIChsaXN0Lmxlbmd0aCA8IHRoaXMuaykge1xuICAgICAgICAgIGxpc3QucHVzaChwZWVyKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgZGlzdGFuY2UobGlzdFtpXS5ub2RlSWQsIHRhcmdldElkKSA+XG4gICAgICAgICAgICAgIGRpc3RhbmNlKHBlZXIubm9kZUlkLCB0YXJnZXRJZClcbiAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICBsaXN0W2ldID0gcGVlcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gbGlzdDtcbiAgfVxufVxuIl19
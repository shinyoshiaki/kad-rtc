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
        return undefined;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9rYWQva1V0aWwudHMiXSwibmFtZXMiOlsiS1V0aWwiLCJrIiwia2J1Y2tldHMiLCJub2RlSWQiLCJBcnJheSIsInByb3RvdHlwZSIsImNvbmNhdCIsImFwcGx5IiwidGFyZ2V0SWQiLCJhbnMiLCJnZXRBbGxQZWVycyIsImZvckVhY2giLCJwZWVyIiwia2V5Iiwib3B0IiwiZXhjbHVkZUlkIiwiZGlzdCIsImdldENsb3NlRXN0RGlzdCIsImxpc3QiLCJwdXNoIiwidGFyZ2V0SUQiLCJsZW5ndGgiLCJjb25zb2xlIiwibG9nIiwiaSIsInBlZXJzIiwiZ2V0Q2xvc2VFc3RQZWVyc0xpc3QiLCJmaW5kIiwiX2tleSIsIm1pbmkiLCJjbG9zZVBlZXIiLCJrYnVja2V0IiwicmVkdWNlIiwiYSIsImIiLCJhcnIiLCJtYXAiLCJ1bmRlZmluZWQiLCJpZCIsImlkcyIsImdldEFsbFBlZXJJZHMiLCJpbmNsdWRlcyIsImJlZm9yZSIsImZpbHRlciIsImlzRGlzY29ubmVjdGVkIiwiYWZ0ZXIiLCJudW0iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFDQTs7Ozs7Ozs7OztJQUVxQkEsSzs7O0FBSW5CLGlCQUFZQyxDQUFaLEVBQXVCQyxRQUF2QixFQUF1REMsTUFBdkQsRUFBdUU7QUFBQTs7QUFBQTs7QUFBQTs7QUFBQTs7QUFDckUsU0FBS0YsQ0FBTCxHQUFTQSxDQUFUO0FBQ0EsU0FBS0MsUUFBTCxHQUFnQkEsUUFBaEI7QUFDQSxTQUFLQyxNQUFMLEdBQWNBLE1BQWQ7QUFDRDs7OztrQ0FFNEI7QUFDM0IsYUFBT0MsS0FBSyxDQUFDQyxTQUFOLENBQWdCQyxNQUFoQixDQUF1QkMsS0FBdkIsQ0FBNkIsRUFBN0IsRUFBaUMsS0FBS0wsUUFBdEMsQ0FBUDtBQUNEOzs7NEJBRU9NLFEsRUFBc0M7QUFDNUMsVUFBSUMsR0FBSjtBQUNBLFdBQUtDLFdBQUwsR0FBbUJDLE9BQW5CLENBQTJCLFVBQUFDLElBQUksRUFBSTtBQUNqQyxZQUFJQSxJQUFJLENBQUNU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R0FBRyxLQUFLSyxhQUFMLEVBQVo7QUFDQSxVQUFJLENBQUNMLEdBQUwsRUFBVSxPQUFPLEtBQVA7QUFDVixhQUFPQSxHQUFHLENBQUNNLFFBQUosQ0FBYXRDLE1BQWIsQ0FBUDtBQUNEOzs7a0NBRWFLLFEsRUFBa0JNLEcsRUFBOEI7QUFBQTs7QUFDNUQsVUFBTUksSUFBbUIsR0FBRyxFQUE1QjtBQUNBLFdBQUtSLFdBQUwsR0FBbUJDLE9BQW5CLENBQTJCLFVBQUFDLElBQUksRUFBSTtBQUNqQyxZQUFJLEVBQUVFLEdBQUcsSUFBSUYsSUFBSSxDQUFDVCxNQUFMLEtBQWdCVyxHQUFHLENBQUNDLFNBQTdCLENBQUosRUFBNkM7QUFDM0MsY0FBSUcsSUFBSSxDQUFDRyxNQUFMLEdBQWMsTUFBSSxDQUFDcEIsQ0FBdkIsRUFBMEI7QUFDeEJpQixZQUFBQSxJQUFJLENBQUNDLElBQUwsQ0FBVVAsSUFBVjtBQUNELFdBRkQsTUFFTztBQUNMLGlCQUFLLElBQUlZLENBQUMsR0FBRyxDQUFiLEVBQWdCQSxDQUFDLEdBQUdOLElBQUksQ0FBQ0csTUFBekIsRUFBaUNHLENBQUMsRUFBbEMsRUFBc0M7QUFDcEMsa0JBQ0UsMkJBQVNOLElBQUksQ0FBQ00sQ0FBRCxDQUFKLENBQVFyQixNQUFqQixFQUF5QkssUUFBekIsSUFDQSwyQkFBU0ksSUFBSSxDQUFDVCxNQUFkLEVBQXNCSyxRQUF0QixDQUZGLEVBR0U7QUFDQVUsZ0JBQUFBLElBQUksQ0FBQ00sQ0FBRCxDQUFKLEdBQVVaLElBQVY7QUFDRDtBQUNGO0FBQ0Y7QUFDRjtBQUNGLE9BZkQ7QUFnQkEsYUFBT00sSUFBUDtBQUNEIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFdlYlJUQyBmcm9tIFwid2VicnRjNG1lXCI7XG5pbXBvcnQgeyBkaXN0YW5jZSB9IGZyb20gXCJrYWQtZGlzdGFuY2VcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgS1V0aWwge1xuICBrYnVja2V0czogQXJyYXk8QXJyYXk8V2ViUlRDPj47XG4gIGs6IG51bWJlcjtcbiAgbm9kZUlkOiBzdHJpbmc7XG4gIGNvbnN0cnVjdG9yKGs6IG51bWJlciwga2J1Y2tldHM6IEFycmF5PEFycmF5PFdlYlJUQz4+LCBub2RlSWQ6IHN0cmluZykge1xuICAgIHRoaXMuayA9IGs7XG4gICAgdGhpcy5rYnVja2V0cyA9IGtidWNrZXRzO1xuICAgIHRoaXMubm9kZUlkID0gbm9kZUlkO1xuICB9XG5cbiAgZ2V0QWxsUGVlcnMoKTogQXJyYXk8V2ViUlRDPiB7XG4gICAgcmV0dXJuIEFycmF5LnByb3RvdHlwZS5jb25jYXQuYXBwbHkoW10sIHRoaXMua2J1Y2tldHMpO1xuICB9XG5cbiAgZ2V0UGVlcih0YXJnZXRJZDogc3RyaW5nKTogV2ViUlRDIHwgdW5kZWZpbmVkIHtcbiAgICBsZXQgYW5zO1xuICAgIHRoaXMuZ2V0QWxsUGVlcnMoKS5mb3JFYWNoKHBlZXIgPT4ge1xuICAgICAgaWYgKHBlZXIubm9kZUlkID09PSB0YXJnZXRJZCkgYW5zID0gcGVlcjtcbiAgICB9KTtcbiAgICByZXR1cm4gYW5zO1xuICB9XG5cbiAgZ2V0Q2xvc2VFc3RQZWVyc0xpc3Qoa2V5OiBzdHJpbmcsIG9wdCA9IHsgZXhjbHVkZUlkOiBudWxsIH0pIHtcbiAgICBjb25zdCBkaXN0ID0gdGhpcy5nZXRDbG9zZUVzdERpc3Qoa2V5KTtcbiAgICBjb25zdCBsaXN0OiBBcnJheTxXZWJSVEM+ID0gW107XG4gICAgdGhpcy5nZXRBbGxQZWVycygpLmZvckVhY2gocGVlciA9PiB7XG4gICAgICBpZiAob3B0LmV4Y2x1ZGVJZCA9PT0gbnVsbCB8fCBvcHQuZXhjbHVkZUlkICE9PSBwZWVyLm5vZGVJZCkge1xuICAgICAgICBpZiAoZGlzdGFuY2Uoa2V5LCBwZWVyLm5vZGVJZCkgPT09IGRpc3QpIHtcbiAgICAgICAgICBsaXN0LnB1c2gocGVlcik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gbGlzdDtcbiAgfVxuXG4gIGdldENsb3NlSURzKHRhcmdldElEOiBzdHJpbmcpIHtcbiAgICBsZXQgbGlzdDogQXJyYXk8c3RyaW5nPiA9IFtdO1xuICAgIHRoaXMuZ2V0QWxsUGVlcnMoKS5mb3JFYWNoKHBlZXIgPT4ge1xuICAgICAgaWYgKHBlZXIubm9kZUlkICE9PSB0YXJnZXRJRCkge1xuICAgICAgICBpZiAobGlzdC5sZW5ndGggPCB0aGlzLmspIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhcImdldGNsb3NlaWRzIHB1c2hcIiwgcGVlci5ub2RlSWQpO1xuICAgICAgICAgIGxpc3QucHVzaChwZWVyLm5vZGVJZCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc29sZS5sb2coXCJnZXRjbG9zZWlkcyBmdWxsZWRcIiwgeyBsaXN0IH0pO1xuICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKGRpc3RhbmNlKGxpc3RbaV0sIHRhcmdldElEKSA+IGRpc3RhbmNlKHBlZXIubm9kZUlkLCB0YXJnZXRJRCkpIHtcbiAgICAgICAgICAgICAgbGlzdFtpXSA9IHBlZXIubm9kZUlkO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gbGlzdDtcbiAgfVxuXG4gIGdldENsb3NlRXN0SWRzTGlzdChrZXk6IHN0cmluZywgb3B0ID0geyBleGNsdWRlSWQ6IG51bGwgfSkge1xuICAgIGNvbnN0IHBlZXJzID0gdGhpcy5nZXRDbG9zZUVzdFBlZXJzTGlzdChrZXksIG9wdCk7XG4gICAgY29uc3QgbGlzdDogQXJyYXk8c3RyaW5nPiA9IFtdO1xuICAgIHBlZXJzLmZvckVhY2gocGVlciA9PiBsaXN0LnB1c2gocGVlci5ub2RlSWQpKTtcbiAgICByZXR1cm4gbGlzdDtcbiAgfVxuXG4gIGdldFBlZXJGcm9tbm9kZUlkKG5vZGVJZDogc3RyaW5nKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0QWxsUGVlcnMoKS5maW5kKHBlZXIgPT4ge1xuICAgICAgcmV0dXJuIHBlZXIubm9kZUlkID09PSBub2RlSWQ7XG4gICAgfSk7XG4gIH1cblxuICBnZXRDbG9zZUVzdFBlZXIoXG4gICAgX2tleTogc3RyaW5nLFxuICAgIG9wdD86IHsgZXhjbHVkZUlkPzogc3RyaW5nIH1cbiAgKTogV2ViUlRDIHwgdW5kZWZpbmVkIHtcbiAgICBsZXQgbWluaSA9IDE2MDtcbiAgICBsZXQgY2xvc2VQZWVyO1xuICAgIHRoaXMua2J1Y2tldHMuZm9yRWFjaChrYnVja2V0ID0+IHtcbiAgICAgIGtidWNrZXQuZm9yRWFjaChwZWVyID0+IHtcbiAgICAgICAgY29uc29sZS5sb2coXCJkaXN0YW5jZVwiLCBwZWVyLm5vZGVJZCwgZGlzdGFuY2UoX2tleSwgcGVlci5ub2RlSWQpKTtcbiAgICAgICAgaWYgKHBlZXIubm9kZUlkID09PSB0aGlzLm5vZGVJZCkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKFwiZ2V0Y2xvc2Vlc3RwZWVyIG9ubHkgbWVcIiwgdGhpcy5ub2RlSWQpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChcbiAgICAgICAgICAhKG9wdCAmJiBwZWVyLm5vZGVJZCA9PT0gb3B0LmV4Y2x1ZGVJZCkgJiZcbiAgICAgICAgICBwZWVyLm5vZGVJZCAhPT0gdGhpcy5ub2RlSWRcbiAgICAgICAgKSB7XG4gICAgICAgICAgaWYgKGRpc3RhbmNlKF9rZXksIHBlZXIubm9kZUlkKSA8IG1pbmkpIHtcbiAgICAgICAgICAgIG1pbmkgPSBkaXN0YW5jZShfa2V5LCBwZWVyLm5vZGVJZCk7XG4gICAgICAgICAgICBjbG9zZVBlZXIgPSBwZWVyO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIGNsb3NlUGVlcjtcbiAgfVxuXG4gIGdldENsb3NlRXN0RGlzdChrZXk6IHN0cmluZykge1xuICAgIGNvbnN0IHBlZXJzID0gdGhpcy5nZXRBbGxQZWVycygpO1xuICAgIGNvbnN0IG1pbmkgPSBwZWVycy5yZWR1Y2UoKGEsIGIpID0+IHtcbiAgICAgIGlmIChkaXN0YW5jZShhLm5vZGVJZCwga2V5KSA8IGRpc3RhbmNlKGIubm9kZUlkLCBrZXkpKSByZXR1cm4gYTtcbiAgICAgIGVsc2UgcmV0dXJuIGI7XG4gICAgfSk7XG4gICAgcmV0dXJuIGRpc3RhbmNlKG1pbmkubm9kZUlkLCBrZXkpO1xuICB9XG5cbiAgZ2V0Q2xvc2VJZHModGFyZ2V0SWQ6IHN0cmluZykge1xuICAgIGNvbnN0IGxpc3Q6IEFycmF5PHN0cmluZz4gPSBbXTtcbiAgICB0aGlzLmdldEFsbFBlZXJzKCkuZm9yRWFjaChwZWVyID0+IHtcbiAgICAgIGlmIChwZWVyLm5vZGVJZCAhPT0gdGFyZ2V0SWQpIHtcbiAgICAgICAgaWYgKGxpc3QubGVuZ3RoIDwgdGhpcy5rKSB7XG4gICAgICAgICAgbGlzdC5wdXNoKHBlZXIubm9kZUlkKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmIChkaXN0YW5jZShsaXN0W2ldLCB0YXJnZXRJZCkgPiBkaXN0YW5jZShwZWVyLm5vZGVJZCwgdGFyZ2V0SWQpKSB7XG4gICAgICAgICAgICAgIGxpc3RbaV0gPSBwZWVyLm5vZGVJZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gbGlzdDtcbiAgfVxuXG4gIGdldEFsbFBlZXJJZHMoKTogc3RyaW5nW10gfCB1bmRlZmluZWQge1xuICAgIGNvbnN0IGFyciA9IHRoaXMuZ2V0QWxsUGVlcnMoKTtcbiAgICBpZiAoYXJyLmxlbmd0aCA+IDApIHtcbiAgICAgIHJldHVybiBhcnIubWFwKHBlZXIgPT4ge1xuICAgICAgICByZXR1cm4gcGVlci5ub2RlSWQ7XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG4gIH1cblxuICBpc1BlZXJFeGlzdChpZDogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgY29uc3QgaWRzID0gdGhpcy5nZXRBbGxQZWVySWRzKCk7XG4gICAgaWYgKGlkcykge1xuICAgICAgcmV0dXJuIGlkcy5pbmNsdWRlcyhpZCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxuICBnZXRQZWVyTnVtKCk6IG51bWJlciB7XG4gICAgY29uc3QgYXJyID0gdGhpcy5nZXRBbGxQZWVycygpO1xuICAgIHJldHVybiBhcnIubGVuZ3RoO1xuICB9XG5cbiAgY2xlYW5EaXNjb24oKSB7XG4gICAgdGhpcy5rYnVja2V0cy5mb3JFYWNoKChrYnVja2V0LCBpKSA9PiB7XG4gICAgICBpZiAoa2J1Y2tldC5sZW5ndGggPiAwKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKHsgYmVmb3JlOiB0aGlzLmtidWNrZXRzW2ldIH0pO1xuICAgICAgICB0aGlzLmtidWNrZXRzW2ldID0ga2J1Y2tldC5maWx0ZXIocGVlciA9PiAhcGVlci5pc0Rpc2Nvbm5lY3RlZCk7XG4gICAgICAgIGNvbnNvbGUubG9nKHsgYWZ0ZXI6IHRoaXMua2J1Y2tldHNbaV0gfSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBnZXRLYnVja2V0TnVtKCkge1xuICAgIGxldCBudW0gPSAwO1xuICAgIHRoaXMua2J1Y2tldHMuZm9yRWFjaChrYnVja2V0ID0+IHtcbiAgICAgIGlmIChrYnVja2V0Lmxlbmd0aCA+IDApIG51bSsrO1xuICAgIH0pO1xuICAgIHJldHVybiBudW07XG4gIH1cblxuICBpc05vZGVFeGlzdChub2RlSWQ6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IGFyciA9IHRoaXMuZ2V0QWxsUGVlcklkcygpO1xuICAgIGlmICghYXJyKSByZXR1cm4gZmFsc2U7XG4gICAgcmV0dXJuIGFyci5pbmNsdWRlcyhub2RlSWQpO1xuICB9XG5cbiAgZ2V0Q2xvc2VQZWVycyh0YXJnZXRJZDogc3RyaW5nLCBvcHQ/OiB7IGV4Y2x1ZGVJZD86IHN0cmluZyB9KSB7XG4gICAgY29uc3QgbGlzdDogQXJyYXk8V2ViUlRDPiA9IFtdO1xuICAgIHRoaXMuZ2V0QWxsUGVlcnMoKS5mb3JFYWNoKHBlZXIgPT4ge1xuICAgICAgaWYgKCEob3B0ICYmIHBlZXIubm9kZUlkID09PSBvcHQuZXhjbHVkZUlkKSkge1xuICAgICAgICBpZiAobGlzdC5sZW5ndGggPCB0aGlzLmspIHtcbiAgICAgICAgICBsaXN0LnB1c2gocGVlcik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgIGRpc3RhbmNlKGxpc3RbaV0ubm9kZUlkLCB0YXJnZXRJZCkgPlxuICAgICAgICAgICAgICBkaXN0YW5jZShwZWVyLm5vZGVJZCwgdGFyZ2V0SWQpXG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgbGlzdFtpXSA9IHBlZXI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIGxpc3Q7XG4gIH1cbn1cbiJdfQ==
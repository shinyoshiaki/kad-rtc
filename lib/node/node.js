"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _webrtc4me = _interopRequireDefault(require("webrtc4me"));

var _socket = _interopRequireDefault(require("socket.io-client"));

var _kademlia = _interopRequireDefault(require("../kad/kademlia"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var def;

(function (def) {
  def["OFFER"] = "OFFER";
  def["ANSWER"] = "ANSWER";
  def["ONCOMMAND"] = "ONCOMMAND";
})(def || (def = {}));

var Node =
/*#__PURE__*/
function () {
  function Node(target, opt) {
    var _this = this;

    _classCallCheck(this, Node);

    _defineProperty(this, "targetUrl", void 0);

    _defineProperty(this, "kad", void 0);

    _defineProperty(this, "peerOffer", void 0);

    if (target.address) {
      this.targetUrl = "http://" + target.address + ":" + target.port;

      var socket = _socket.default.connect(this.targetUrl);

      socket.on("connect", function () {
        _this.offerFirst(socket);
      });
      socket.on(def.ANSWER, function (data) {
        if (_this.peerOffer) _this.peerOffer.setAnswer(data.sdp, data.nodeId);
      });
    }

    if (opt) {
      this.kad = new _kademlia.default({
        pubkey: opt.pubkey,
        secKey: opt.seckey
      });
    } else {
      this.kad = new _kademlia.default();
    }
  }

  _createClass(Node, [{
    key: "offerFirst",
    value: function offerFirst(socket) {
      var _this2 = this;

      var peer = new _webrtc4me.default();
      peer.makeOffer();

      peer.signal = function (sdp) {
        socket.emit(def.OFFER, {
          type: def.OFFER,
          nodeId: _this2.kad.nodeId,
          sdp: sdp
        });
      };

      peer.connect = function () {
        _this2.kad.connect(peer);
      };

      this.peerOffer = peer;
    }
  }]);

  return Node;
}();

exports.default = Node;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ub2RlL25vZGUudHMiXSwibmFtZXMiOlsiZGVmIiwiTm9kZSIsInRhcmdldCIsIm9wdCIsImFkZHJlc3MiLCJ0YXJnZXRVcmwiLCJwb3J0Iiwic29ja2V0IiwiY2xpZW50IiwiY29ubmVjdCIsIm9uIiwib2ZmZXJGaXJzdCIsIkFOU1dFUiIsImRhdGEiLCJwZWVyT2ZmZXIiLCJzZXRBbnN3ZXIiLCJzZHAiLCJub2RlSWQiLCJrYWQiLCJLYWRlbWxpYSIsInB1YmtleSIsInNlY0tleSIsInNlY2tleSIsInBlZXIiLCJXZWJSVEMiLCJtYWtlT2ZmZXIiLCJzaWduYWwiLCJlbWl0IiwiT0ZGRVIiLCJ0eXBlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQUE7O0FBQ0E7O0FBQ0E7Ozs7Ozs7Ozs7OztJQUVLQSxHOztXQUFBQSxHO0FBQUFBLEVBQUFBLEc7QUFBQUEsRUFBQUEsRztBQUFBQSxFQUFBQSxHO0dBQUFBLEcsS0FBQUEsRzs7SUFNZ0JDLEk7OztBQUtuQixnQkFDRUMsTUFERixFQUVFQyxHQUZGLEVBR0U7QUFBQTs7QUFBQTs7QUFBQTs7QUFBQTs7QUFBQTs7QUFDQSxRQUFJRCxNQUFNLENBQUNFLE9BQVgsRUFBb0I7QUFDbEIsV0FBS0MsU0FBTCxHQUFpQixZQUFZSCxNQUFNLENBQUNFLE9BQW5CLEdBQTZCLEdBQTdCLEdBQW1DRixNQUFNLENBQUNJLElBQTNEOztBQUNBLFVBQU1DLE1BQU0sR0FBR0MsZ0JBQU9DLE9BQVAsQ0FBZSxLQUFLSixTQUFwQixDQUFmOztBQUNBRSxNQUFBQSxNQUFNLENBQUNHLEVBQVAsQ0FBVSxTQUFWLEVBQXFCLFlBQU07QUFDekIsUUFBQSxLQUFJLENBQUNDLFVBQUwsQ0FBZ0JKLE1BQWhCO0FBQ0QsT0FGRDtBQUdBQSxNQUFBQSxNQUFNLENBQUNHLEVBQVAsQ0FBVVYsR0FBRyxDQUFDWSxNQUFkLEVBQXNCLFVBQUNDLElBQUQsRUFBZTtBQUNuQyxZQUFJLEtBQUksQ0FBQ0MsU0FBVCxFQUFvQixLQUFJLENBQUNBLFNBQUwsQ0FBZUMsU0FBZixDQUF5QkYsSUFBSSxDQUFDRyxHQUE5QixFQUFtQ0gsSUFBSSxDQUFDSSxNQUF4QztBQUNyQixPQUZEO0FBR0Q7O0FBRUQsUUFBSWQsR0FBSixFQUFTO0FBQ1AsV0FBS2UsR0FBTCxHQUFXLElBQUlDLGlCQUFKLENBQWE7QUFBRUMsUUFBQUEsTUFBTSxFQUFFakIsR0FBRyxDQUFDaUIsTUFBZDtBQUFzQkMsUUFBQUEsTUFBTSxFQUFFbEIsR0FBRyxDQUFDbUI7QUFBbEMsT0FBYixDQUFYO0FBQ0QsS0FGRCxNQUVPO0FBQ0wsV0FBS0osR0FBTCxHQUFXLElBQUlDLGlCQUFKLEVBQVg7QUFDRDtBQUNGOzs7OytCQUVVWixNLEVBQWE7QUFBQTs7QUFDdEIsVUFBTWdCLElBQUksR0FBRyxJQUFJQyxrQkFBSixFQUFiO0FBQ0FELE1BQUFBLElBQUksQ0FBQ0UsU0FBTDs7QUFFQUYsTUFBQUEsSUFBSSxDQUFDRyxNQUFMLEdBQWMsVUFBQVYsR0FBRyxFQUFJO0FBQ25CVCxRQUFBQSxNQUFNLENBQUNvQixJQUFQLENBQVkzQixHQUFHLENBQUM0QixLQUFoQixFQUF1QjtBQUNyQkMsVUFBQUEsSUFBSSxFQUFFN0IsR0FBRyxDQUFDNEIsS0FEVztBQUVyQlgsVUFBQUEsTUFBTSxFQUFFLE1BQUksQ0FBQ0MsR0FBTCxDQUFTRCxNQUZJO0FBR3JCRCxVQUFBQSxHQUFHLEVBQUVBO0FBSGdCLFNBQXZCO0FBS0QsT0FORDs7QUFRQU8sTUFBQUEsSUFBSSxDQUFDZCxPQUFMLEdBQWUsWUFBTTtBQUNuQixRQUFBLE1BQUksQ0FBQ1MsR0FBTCxDQUFTVCxPQUFULENBQWlCYyxJQUFqQjtBQUNELE9BRkQ7O0FBR0EsV0FBS1QsU0FBTCxHQUFpQlMsSUFBakI7QUFDRCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBXZWJSVEMgZnJvbSBcIndlYnJ0YzRtZVwiO1xuaW1wb3J0IGNsaWVudCBmcm9tIFwic29ja2V0LmlvLWNsaWVudFwiO1xuaW1wb3J0IEthZGVtbGlhIGZyb20gXCIuLi9rYWQva2FkZW1saWFcIjtcblxuZW51bSBkZWYge1xuICBPRkZFUiA9IFwiT0ZGRVJcIixcbiAgQU5TV0VSID0gXCJBTlNXRVJcIixcbiAgT05DT01NQU5EID0gXCJPTkNPTU1BTkRcIlxufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBOb2RlIHtcbiAgdGFyZ2V0VXJsOiBzdHJpbmcgfCB1bmRlZmluZWQ7XG4gIGthZDogS2FkZW1saWE7XG4gIHBlZXJPZmZlcjogV2ViUlRDIHwgdW5kZWZpbmVkO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHRhcmdldDogeyBhZGRyZXNzOiBzdHJpbmc7IHBvcnQ6IHN0cmluZyB9LFxuICAgIG9wdD86IHsgcHVia2V5Pzogc3RyaW5nOyBzZWNrZXk/OiBzdHJpbmcgfVxuICApIHtcbiAgICBpZiAodGFyZ2V0LmFkZHJlc3MpIHtcbiAgICAgIHRoaXMudGFyZ2V0VXJsID0gXCJodHRwOi8vXCIgKyB0YXJnZXQuYWRkcmVzcyArIFwiOlwiICsgdGFyZ2V0LnBvcnQ7XG4gICAgICBjb25zdCBzb2NrZXQgPSBjbGllbnQuY29ubmVjdCh0aGlzLnRhcmdldFVybCk7XG4gICAgICBzb2NrZXQub24oXCJjb25uZWN0XCIsICgpID0+IHtcbiAgICAgICAgdGhpcy5vZmZlckZpcnN0KHNvY2tldCk7XG4gICAgICB9KTtcbiAgICAgIHNvY2tldC5vbihkZWYuQU5TV0VSLCAoZGF0YTogYW55KSA9PiB7XG4gICAgICAgIGlmICh0aGlzLnBlZXJPZmZlcikgdGhpcy5wZWVyT2ZmZXIuc2V0QW5zd2VyKGRhdGEuc2RwLCBkYXRhLm5vZGVJZCk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAob3B0KSB7XG4gICAgICB0aGlzLmthZCA9IG5ldyBLYWRlbWxpYSh7IHB1YmtleTogb3B0LnB1YmtleSwgc2VjS2V5OiBvcHQuc2Vja2V5IH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmthZCA9IG5ldyBLYWRlbWxpYSgpO1xuICAgIH1cbiAgfVxuXG4gIG9mZmVyRmlyc3Qoc29ja2V0OiBhbnkpIHtcbiAgICBjb25zdCBwZWVyID0gbmV3IFdlYlJUQygpO1xuICAgIHBlZXIubWFrZU9mZmVyKCk7XG5cbiAgICBwZWVyLnNpZ25hbCA9IHNkcCA9PiB7XG4gICAgICBzb2NrZXQuZW1pdChkZWYuT0ZGRVIsIHtcbiAgICAgICAgdHlwZTogZGVmLk9GRkVSLFxuICAgICAgICBub2RlSWQ6IHRoaXMua2FkLm5vZGVJZCxcbiAgICAgICAgc2RwOiBzZHBcbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICBwZWVyLmNvbm5lY3QgPSAoKSA9PiB7XG4gICAgICB0aGlzLmthZC5jb25uZWN0KHBlZXIpO1xuICAgIH07XG4gICAgdGhpcy5wZWVyT2ZmZXIgPSBwZWVyO1xuICB9XG59XG4iXX0=
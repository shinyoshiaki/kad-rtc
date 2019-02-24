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
        if (_this.peerOffer) {
          _this.peerOffer.connecting(data.nodeId);

          _this.peerOffer.setSdp(data.sdp);
        }
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ub2RlL25vZGUudHMiXSwibmFtZXMiOlsiZGVmIiwiTm9kZSIsInRhcmdldCIsIm9wdCIsImFkZHJlc3MiLCJ0YXJnZXRVcmwiLCJwb3J0Iiwic29ja2V0IiwiY2xpZW50IiwiY29ubmVjdCIsIm9uIiwib2ZmZXJGaXJzdCIsIkFOU1dFUiIsImRhdGEiLCJwZWVyT2ZmZXIiLCJjb25uZWN0aW5nIiwibm9kZUlkIiwic2V0U2RwIiwic2RwIiwia2FkIiwiS2FkZW1saWEiLCJwdWJrZXkiLCJzZWNLZXkiLCJzZWNrZXkiLCJwZWVyIiwiV2ViUlRDIiwibWFrZU9mZmVyIiwic2lnbmFsIiwiZW1pdCIsIk9GRkVSIiwidHlwZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFBOztBQUNBOztBQUNBOzs7Ozs7Ozs7Ozs7SUFFS0EsRzs7V0FBQUEsRztBQUFBQSxFQUFBQSxHO0FBQUFBLEVBQUFBLEc7QUFBQUEsRUFBQUEsRztHQUFBQSxHLEtBQUFBLEc7O0lBTWdCQyxJOzs7QUFLbkIsZ0JBQ0VDLE1BREYsRUFFRUMsR0FGRixFQUdFO0FBQUE7O0FBQUE7O0FBQUE7O0FBQUE7O0FBQUE7O0FBQ0EsUUFBSUQsTUFBTSxDQUFDRSxPQUFYLEVBQW9CO0FBQ2xCLFdBQUtDLFNBQUwsR0FBaUIsWUFBWUgsTUFBTSxDQUFDRSxPQUFuQixHQUE2QixHQUE3QixHQUFtQ0YsTUFBTSxDQUFDSSxJQUEzRDs7QUFDQSxVQUFNQyxNQUFNLEdBQUdDLGdCQUFPQyxPQUFQLENBQWUsS0FBS0osU0FBcEIsQ0FBZjs7QUFDQUUsTUFBQUEsTUFBTSxDQUFDRyxFQUFQLENBQVUsU0FBVixFQUFxQixZQUFNO0FBQ3pCLFFBQUEsS0FBSSxDQUFDQyxVQUFMLENBQWdCSixNQUFoQjtBQUNELE9BRkQ7QUFHQUEsTUFBQUEsTUFBTSxDQUFDRyxFQUFQLENBQVVWLEdBQUcsQ0FBQ1ksTUFBZCxFQUFzQixVQUFDQyxJQUFELEVBQWU7QUFDbkMsWUFBSSxLQUFJLENBQUNDLFNBQVQsRUFBb0I7QUFDbEIsVUFBQSxLQUFJLENBQUNBLFNBQUwsQ0FBZUMsVUFBZixDQUEwQkYsSUFBSSxDQUFDRyxNQUEvQjs7QUFDQSxVQUFBLEtBQUksQ0FBQ0YsU0FBTCxDQUFlRyxNQUFmLENBQXNCSixJQUFJLENBQUNLLEdBQTNCO0FBQ0Q7QUFDRixPQUxEO0FBTUQ7O0FBRUQsUUFBSWYsR0FBSixFQUFTO0FBQ1AsV0FBS2dCLEdBQUwsR0FBVyxJQUFJQyxpQkFBSixDQUFhO0FBQUVDLFFBQUFBLE1BQU0sRUFBRWxCLEdBQUcsQ0FBQ2tCLE1BQWQ7QUFBc0JDLFFBQUFBLE1BQU0sRUFBRW5CLEdBQUcsQ0FBQ29CO0FBQWxDLE9BQWIsQ0FBWDtBQUNELEtBRkQsTUFFTztBQUNMLFdBQUtKLEdBQUwsR0FBVyxJQUFJQyxpQkFBSixFQUFYO0FBQ0Q7QUFDRjs7OzsrQkFFVWIsTSxFQUFhO0FBQUE7O0FBQ3RCLFVBQU1pQixJQUFJLEdBQUcsSUFBSUMsa0JBQUosRUFBYjtBQUNBRCxNQUFBQSxJQUFJLENBQUNFLFNBQUw7O0FBRUFGLE1BQUFBLElBQUksQ0FBQ0csTUFBTCxHQUFjLFVBQUFULEdBQUcsRUFBSTtBQUNuQlgsUUFBQUEsTUFBTSxDQUFDcUIsSUFBUCxDQUFZNUIsR0FBRyxDQUFDNkIsS0FBaEIsRUFBdUI7QUFDckJDLFVBQUFBLElBQUksRUFBRTlCLEdBQUcsQ0FBQzZCLEtBRFc7QUFFckJiLFVBQUFBLE1BQU0sRUFBRSxNQUFJLENBQUNHLEdBQUwsQ0FBU0gsTUFGSTtBQUdyQkUsVUFBQUEsR0FBRyxFQUFFQTtBQUhnQixTQUF2QjtBQUtELE9BTkQ7O0FBUUFNLE1BQUFBLElBQUksQ0FBQ2YsT0FBTCxHQUFlLFlBQU07QUFDbkIsUUFBQSxNQUFJLENBQUNVLEdBQUwsQ0FBU1YsT0FBVCxDQUFpQmUsSUFBakI7QUFDRCxPQUZEOztBQUdBLFdBQUtWLFNBQUwsR0FBaUJVLElBQWpCO0FBQ0QiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgV2ViUlRDIGZyb20gXCJ3ZWJydGM0bWVcIjtcbmltcG9ydCBjbGllbnQgZnJvbSBcInNvY2tldC5pby1jbGllbnRcIjtcbmltcG9ydCBLYWRlbWxpYSBmcm9tIFwiLi4va2FkL2thZGVtbGlhXCI7XG5cbmVudW0gZGVmIHtcbiAgT0ZGRVIgPSBcIk9GRkVSXCIsXG4gIEFOU1dFUiA9IFwiQU5TV0VSXCIsXG4gIE9OQ09NTUFORCA9IFwiT05DT01NQU5EXCJcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTm9kZSB7XG4gIHRhcmdldFVybDogc3RyaW5nIHwgdW5kZWZpbmVkO1xuICBrYWQ6IEthZGVtbGlhO1xuICBwZWVyT2ZmZXI6IFdlYlJUQyB8IHVuZGVmaW5lZDtcblxuICBjb25zdHJ1Y3RvcihcbiAgICB0YXJnZXQ6IHsgYWRkcmVzczogc3RyaW5nOyBwb3J0OiBzdHJpbmcgfSxcbiAgICBvcHQ/OiB7IHB1YmtleT86IHN0cmluZzsgc2Vja2V5Pzogc3RyaW5nIH1cbiAgKSB7XG4gICAgaWYgKHRhcmdldC5hZGRyZXNzKSB7XG4gICAgICB0aGlzLnRhcmdldFVybCA9IFwiaHR0cDovL1wiICsgdGFyZ2V0LmFkZHJlc3MgKyBcIjpcIiArIHRhcmdldC5wb3J0O1xuICAgICAgY29uc3Qgc29ja2V0ID0gY2xpZW50LmNvbm5lY3QodGhpcy50YXJnZXRVcmwpO1xuICAgICAgc29ja2V0Lm9uKFwiY29ubmVjdFwiLCAoKSA9PiB7XG4gICAgICAgIHRoaXMub2ZmZXJGaXJzdChzb2NrZXQpO1xuICAgICAgfSk7XG4gICAgICBzb2NrZXQub24oZGVmLkFOU1dFUiwgKGRhdGE6IGFueSkgPT4ge1xuICAgICAgICBpZiAodGhpcy5wZWVyT2ZmZXIpIHtcbiAgICAgICAgICB0aGlzLnBlZXJPZmZlci5jb25uZWN0aW5nKGRhdGEubm9kZUlkKTtcbiAgICAgICAgICB0aGlzLnBlZXJPZmZlci5zZXRTZHAoZGF0YS5zZHApO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAob3B0KSB7XG4gICAgICB0aGlzLmthZCA9IG5ldyBLYWRlbWxpYSh7IHB1YmtleTogb3B0LnB1YmtleSwgc2VjS2V5OiBvcHQuc2Vja2V5IH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmthZCA9IG5ldyBLYWRlbWxpYSgpO1xuICAgIH1cbiAgfVxuXG4gIG9mZmVyRmlyc3Qoc29ja2V0OiBhbnkpIHtcbiAgICBjb25zdCBwZWVyID0gbmV3IFdlYlJUQygpO1xuICAgIHBlZXIubWFrZU9mZmVyKCk7XG5cbiAgICBwZWVyLnNpZ25hbCA9IHNkcCA9PiB7XG4gICAgICBzb2NrZXQuZW1pdChkZWYuT0ZGRVIsIHtcbiAgICAgICAgdHlwZTogZGVmLk9GRkVSLFxuICAgICAgICBub2RlSWQ6IHRoaXMua2FkLm5vZGVJZCxcbiAgICAgICAgc2RwOiBzZHBcbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICBwZWVyLmNvbm5lY3QgPSAoKSA9PiB7XG4gICAgICB0aGlzLmthZC5jb25uZWN0KHBlZXIpO1xuICAgIH07XG4gICAgdGhpcy5wZWVyT2ZmZXIgPSBwZWVyO1xuICB9XG59XG4iXX0=
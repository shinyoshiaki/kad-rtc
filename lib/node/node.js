"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _webrtc4me = _interopRequireDefault(require("webrtc4me"));

var _socket = _interopRequireDefault(require("socket.io-client"));

var _sha = _interopRequireDefault(require("sha1"));

var _kademlia = _interopRequireDefault(require("../kad/kademlia"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var def = {
  OFFER: "OFFER",
  ANSWER: "ANSWER",
  ONCOMMAND: "ONCOMMAND"
};
var peerOffer;

var Node =
/*#__PURE__*/
function () {
  function Node(targetAddress, targetPort) {
    var _this = this;

    _classCallCheck(this, Node);

    _defineProperty(this, "targetUrl", void 0);

    _defineProperty(this, "nodeId", void 0);

    _defineProperty(this, "kad", void 0);

    this.nodeId = (0, _sha.default)(Math.random().toString()).toString();

    if (targetAddress) {
      this.targetUrl = "http://" + targetAddress + ":" + targetPort;

      var socket = _socket.default.connect(this.targetUrl);

      socket.on("connect", function () {
        _this.offerFirst(socket);
      });
      socket.on(def.ANSWER, function (data) {
        peerOffer.setAnswer(data.sdp, data.nodeId);
      });
    } else {
      this.targetUrl = null;
    }

    this.kad = new _kademlia.default(this.nodeId);
  }

  _createClass(Node, [{
    key: "offerFirst",
    value: function offerFirst(socket) {
      var _this2 = this;

      console.log("@cli", "offer first");
      var peer = new _webrtc4me.default();
      peer.makeOffer();

      peer.signal = function (sdp) {
        socket.emit(def.OFFER, {
          type: def.OFFER,
          nodeId: _this2.nodeId,
          sdp: sdp
        });
      };

      peer.connect = function () {
        console.log("first connected");

        _this2.kad.addknode(peer);
      };

      peerOffer = peer;
    }
  }]);

  return Node;
}();

exports.default = Node;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ub2RlL25vZGUudHMiXSwibmFtZXMiOlsiZGVmIiwiT0ZGRVIiLCJBTlNXRVIiLCJPTkNPTU1BTkQiLCJwZWVyT2ZmZXIiLCJOb2RlIiwidGFyZ2V0QWRkcmVzcyIsInRhcmdldFBvcnQiLCJub2RlSWQiLCJNYXRoIiwicmFuZG9tIiwidG9TdHJpbmciLCJ0YXJnZXRVcmwiLCJzb2NrZXQiLCJjbGllbnQiLCJjb25uZWN0Iiwib24iLCJvZmZlckZpcnN0IiwiZGF0YSIsInNldEFuc3dlciIsInNkcCIsImthZCIsIkthZGVtbGlhIiwiY29uc29sZSIsImxvZyIsInBlZXIiLCJXZWJSVEMiLCJtYWtlT2ZmZXIiLCJzaWduYWwiLCJlbWl0IiwidHlwZSIsImFkZGtub2RlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7Ozs7Ozs7OztBQUVBLElBQU1BLEdBQUcsR0FBRztBQUNWQyxFQUFBQSxLQUFLLEVBQUUsT0FERztBQUVWQyxFQUFBQSxNQUFNLEVBQUUsUUFGRTtBQUdWQyxFQUFBQSxTQUFTLEVBQUU7QUFIRCxDQUFaO0FBTUEsSUFBSUMsU0FBSjs7SUFFcUJDLEk7OztBQUtuQixnQkFBWUMsYUFBWixFQUFtQ0MsVUFBbkMsRUFBdUQ7QUFBQTs7QUFBQTs7QUFBQTs7QUFBQTs7QUFBQTs7QUFDckQsU0FBS0MsTUFBTCxHQUFjLGtCQUFLQyxJQUFJLENBQUNDLE1BQUwsR0FBY0MsUUFBZCxFQUFMLEVBQStCQSxRQUEvQixFQUFkOztBQUNBLFFBQUlMLGFBQUosRUFBbUI7QUFDakIsV0FBS00sU0FBTCxHQUFpQixZQUFZTixhQUFaLEdBQTRCLEdBQTVCLEdBQWtDQyxVQUFuRDs7QUFDQSxVQUFNTSxNQUFNLEdBQUdDLGdCQUFPQyxPQUFQLENBQWUsS0FBS0gsU0FBcEIsQ0FBZjs7QUFDQUMsTUFBQUEsTUFBTSxDQUFDRyxFQUFQLENBQVUsU0FBVixFQUFxQixZQUFNO0FBQ3pCLFFBQUEsS0FBSSxDQUFDQyxVQUFMLENBQWdCSixNQUFoQjtBQUNELE9BRkQ7QUFHQUEsTUFBQUEsTUFBTSxDQUFDRyxFQUFQLENBQVVoQixHQUFHLENBQUNFLE1BQWQsRUFBc0IsVUFBQ2dCLElBQUQsRUFBZTtBQUNuQ2QsUUFBQUEsU0FBUyxDQUFDZSxTQUFWLENBQW9CRCxJQUFJLENBQUNFLEdBQXpCLEVBQThCRixJQUFJLENBQUNWLE1BQW5DO0FBQ0QsT0FGRDtBQUdELEtBVEQsTUFTTztBQUNMLFdBQUtJLFNBQUwsR0FBaUIsSUFBakI7QUFDRDs7QUFDRCxTQUFLUyxHQUFMLEdBQVcsSUFBSUMsaUJBQUosQ0FBYSxLQUFLZCxNQUFsQixDQUFYO0FBQ0Q7Ozs7K0JBRVVLLE0sRUFBYTtBQUFBOztBQUN0QlUsTUFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVksTUFBWixFQUFvQixhQUFwQjtBQUNBLFVBQU1DLElBQUksR0FBRyxJQUFJQyxrQkFBSixFQUFiO0FBQ0FELE1BQUFBLElBQUksQ0FBQ0UsU0FBTDs7QUFFQUYsTUFBQUEsSUFBSSxDQUFDRyxNQUFMLEdBQWMsVUFBQVIsR0FBRyxFQUFJO0FBQ25CUCxRQUFBQSxNQUFNLENBQUNnQixJQUFQLENBQVk3QixHQUFHLENBQUNDLEtBQWhCLEVBQXVCO0FBQ3JCNkIsVUFBQUEsSUFBSSxFQUFFOUIsR0FBRyxDQUFDQyxLQURXO0FBRXJCTyxVQUFBQSxNQUFNLEVBQUUsTUFBSSxDQUFDQSxNQUZRO0FBR3JCWSxVQUFBQSxHQUFHLEVBQUVBO0FBSGdCLFNBQXZCO0FBS0QsT0FORDs7QUFRQUssTUFBQUEsSUFBSSxDQUFDVixPQUFMLEdBQWUsWUFBTTtBQUNuQlEsUUFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVksaUJBQVo7O0FBQ0EsUUFBQSxNQUFJLENBQUNILEdBQUwsQ0FBU1UsUUFBVCxDQUFrQk4sSUFBbEI7QUFDRCxPQUhEOztBQUtBckIsTUFBQUEsU0FBUyxHQUFHcUIsSUFBWjtBQUNEIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFdlYlJUQyBmcm9tIFwid2VicnRjNG1lXCI7XG5pbXBvcnQgY2xpZW50IGZyb20gXCJzb2NrZXQuaW8tY2xpZW50XCI7XG5pbXBvcnQgc2hhMSBmcm9tIFwic2hhMVwiO1xuaW1wb3J0IEthZGVtbGlhIGZyb20gXCIuLi9rYWQva2FkZW1saWFcIjtcblxuY29uc3QgZGVmID0ge1xuICBPRkZFUjogXCJPRkZFUlwiLFxuICBBTlNXRVI6IFwiQU5TV0VSXCIsXG4gIE9OQ09NTUFORDogXCJPTkNPTU1BTkRcIlxufTtcblxubGV0IHBlZXJPZmZlcjogV2ViUlRDO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBOb2RlIHtcbiAgdGFyZ2V0VXJsOiBzdHJpbmcgfCBudWxsO1xuICBub2RlSWQ6IHN0cmluZztcbiAga2FkOiBLYWRlbWxpYTtcblxuICBjb25zdHJ1Y3Rvcih0YXJnZXRBZGRyZXNzOiBzdHJpbmcsIHRhcmdldFBvcnQ6IHN0cmluZykge1xuICAgIHRoaXMubm9kZUlkID0gc2hhMShNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKCkpLnRvU3RyaW5nKCk7XG4gICAgaWYgKHRhcmdldEFkZHJlc3MpIHtcbiAgICAgIHRoaXMudGFyZ2V0VXJsID0gXCJodHRwOi8vXCIgKyB0YXJnZXRBZGRyZXNzICsgXCI6XCIgKyB0YXJnZXRQb3J0O1xuICAgICAgY29uc3Qgc29ja2V0ID0gY2xpZW50LmNvbm5lY3QodGhpcy50YXJnZXRVcmwpO1xuICAgICAgc29ja2V0Lm9uKFwiY29ubmVjdFwiLCAoKSA9PiB7XG4gICAgICAgIHRoaXMub2ZmZXJGaXJzdChzb2NrZXQpO1xuICAgICAgfSk7XG4gICAgICBzb2NrZXQub24oZGVmLkFOU1dFUiwgKGRhdGE6IGFueSkgPT4ge1xuICAgICAgICBwZWVyT2ZmZXIuc2V0QW5zd2VyKGRhdGEuc2RwLCBkYXRhLm5vZGVJZCk7XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy50YXJnZXRVcmwgPSBudWxsO1xuICAgIH1cbiAgICB0aGlzLmthZCA9IG5ldyBLYWRlbWxpYSh0aGlzLm5vZGVJZCk7XG4gIH1cblxuICBvZmZlckZpcnN0KHNvY2tldDogYW55KSB7XG4gICAgY29uc29sZS5sb2coXCJAY2xpXCIsIFwib2ZmZXIgZmlyc3RcIik7XG4gICAgY29uc3QgcGVlciA9IG5ldyBXZWJSVEMoKTtcbiAgICBwZWVyLm1ha2VPZmZlcigpO1xuXG4gICAgcGVlci5zaWduYWwgPSBzZHAgPT4ge1xuICAgICAgc29ja2V0LmVtaXQoZGVmLk9GRkVSLCB7XG4gICAgICAgIHR5cGU6IGRlZi5PRkZFUixcbiAgICAgICAgbm9kZUlkOiB0aGlzLm5vZGVJZCxcbiAgICAgICAgc2RwOiBzZHBcbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICBwZWVyLmNvbm5lY3QgPSAoKSA9PiB7XG4gICAgICBjb25zb2xlLmxvZyhcImZpcnN0IGNvbm5lY3RlZFwiKTtcbiAgICAgIHRoaXMua2FkLmFkZGtub2RlKHBlZXIpO1xuICAgIH07XG5cbiAgICBwZWVyT2ZmZXIgPSBwZWVyO1xuICB9XG59XG4iXX0=
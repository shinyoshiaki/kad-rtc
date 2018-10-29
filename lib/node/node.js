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

        _this2.kad.connect(peer);
      };

      peerOffer = peer;
    }
  }]);

  return Node;
}();

exports.default = Node;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ub2RlL25vZGUudHMiXSwibmFtZXMiOlsiZGVmIiwiT0ZGRVIiLCJBTlNXRVIiLCJPTkNPTU1BTkQiLCJwZWVyT2ZmZXIiLCJOb2RlIiwidGFyZ2V0QWRkcmVzcyIsInRhcmdldFBvcnQiLCJub2RlSWQiLCJNYXRoIiwicmFuZG9tIiwidG9TdHJpbmciLCJ0YXJnZXRVcmwiLCJzb2NrZXQiLCJjbGllbnQiLCJjb25uZWN0Iiwib24iLCJvZmZlckZpcnN0IiwiZGF0YSIsInNldEFuc3dlciIsInNkcCIsImthZCIsIkthZGVtbGlhIiwiY29uc29sZSIsImxvZyIsInBlZXIiLCJXZWJSVEMiLCJtYWtlT2ZmZXIiLCJzaWduYWwiLCJlbWl0IiwidHlwZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFBOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7Ozs7Ozs7QUFFQSxJQUFNQSxHQUFHLEdBQUc7QUFDVkMsRUFBQUEsS0FBSyxFQUFFLE9BREc7QUFFVkMsRUFBQUEsTUFBTSxFQUFFLFFBRkU7QUFHVkMsRUFBQUEsU0FBUyxFQUFFO0FBSEQsQ0FBWjtBQU1BLElBQUlDLFNBQUo7O0lBRXFCQyxJOzs7QUFLbkIsZ0JBQVlDLGFBQVosRUFBbUNDLFVBQW5DLEVBQXVEO0FBQUE7O0FBQUE7O0FBQUE7O0FBQUE7O0FBQUE7O0FBQ3JELFNBQUtDLE1BQUwsR0FBYyxrQkFBS0MsSUFBSSxDQUFDQyxNQUFMLEdBQWNDLFFBQWQsRUFBTCxFQUErQkEsUUFBL0IsRUFBZDs7QUFDQSxRQUFJTCxhQUFKLEVBQW1CO0FBQ2pCLFdBQUtNLFNBQUwsR0FBaUIsWUFBWU4sYUFBWixHQUE0QixHQUE1QixHQUFrQ0MsVUFBbkQ7O0FBQ0EsVUFBTU0sTUFBTSxHQUFHQyxnQkFBT0MsT0FBUCxDQUFlLEtBQUtILFNBQXBCLENBQWY7O0FBQ0FDLE1BQUFBLE1BQU0sQ0FBQ0csRUFBUCxDQUFVLFNBQVYsRUFBcUIsWUFBTTtBQUN6QixRQUFBLEtBQUksQ0FBQ0MsVUFBTCxDQUFnQkosTUFBaEI7QUFDRCxPQUZEO0FBR0FBLE1BQUFBLE1BQU0sQ0FBQ0csRUFBUCxDQUFVaEIsR0FBRyxDQUFDRSxNQUFkLEVBQXNCLFVBQUNnQixJQUFELEVBQWU7QUFDbkNkLFFBQUFBLFNBQVMsQ0FBQ2UsU0FBVixDQUFvQkQsSUFBSSxDQUFDRSxHQUF6QixFQUE4QkYsSUFBSSxDQUFDVixNQUFuQztBQUNELE9BRkQ7QUFHRDs7QUFDRCxTQUFLYSxHQUFMLEdBQVcsSUFBSUMsaUJBQUosQ0FBYSxLQUFLZCxNQUFsQixDQUFYO0FBQ0Q7Ozs7K0JBRVVLLE0sRUFBYTtBQUFBOztBQUN0QlUsTUFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVksTUFBWixFQUFvQixhQUFwQjtBQUNBLFVBQU1DLElBQUksR0FBRyxJQUFJQyxrQkFBSixFQUFiO0FBQ0FELE1BQUFBLElBQUksQ0FBQ0UsU0FBTDs7QUFFQUYsTUFBQUEsSUFBSSxDQUFDRyxNQUFMLEdBQWMsVUFBQVIsR0FBRyxFQUFJO0FBQ25CUCxRQUFBQSxNQUFNLENBQUNnQixJQUFQLENBQVk3QixHQUFHLENBQUNDLEtBQWhCLEVBQXVCO0FBQ3JCNkIsVUFBQUEsSUFBSSxFQUFFOUIsR0FBRyxDQUFDQyxLQURXO0FBRXJCTyxVQUFBQSxNQUFNLEVBQUUsTUFBSSxDQUFDQSxNQUZRO0FBR3JCWSxVQUFBQSxHQUFHLEVBQUVBO0FBSGdCLFNBQXZCO0FBS0QsT0FORDs7QUFRQUssTUFBQUEsSUFBSSxDQUFDVixPQUFMLEdBQWUsWUFBTTtBQUNuQlEsUUFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVksaUJBQVo7O0FBQ0EsUUFBQSxNQUFJLENBQUNILEdBQUwsQ0FBU04sT0FBVCxDQUFpQlUsSUFBakI7QUFDRCxPQUhEOztBQUtBckIsTUFBQUEsU0FBUyxHQUFHcUIsSUFBWjtBQUNEIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFdlYlJUQyBmcm9tIFwid2VicnRjNG1lXCI7XG5pbXBvcnQgY2xpZW50IGZyb20gXCJzb2NrZXQuaW8tY2xpZW50XCI7XG5pbXBvcnQgc2hhMSBmcm9tIFwic2hhMVwiO1xuaW1wb3J0IEthZGVtbGlhIGZyb20gXCIuLi9rYWQva2FkZW1saWFcIjtcblxuY29uc3QgZGVmID0ge1xuICBPRkZFUjogXCJPRkZFUlwiLFxuICBBTlNXRVI6IFwiQU5TV0VSXCIsXG4gIE9OQ09NTUFORDogXCJPTkNPTU1BTkRcIlxufTtcblxubGV0IHBlZXJPZmZlcjogV2ViUlRDO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBOb2RlIHtcbiAgdGFyZ2V0VXJsOiBzdHJpbmcgfCB1bmRlZmluZWQ7XG4gIG5vZGVJZDogc3RyaW5nO1xuICBrYWQ6IEthZGVtbGlhO1xuXG4gIGNvbnN0cnVjdG9yKHRhcmdldEFkZHJlc3M6IHN0cmluZywgdGFyZ2V0UG9ydDogc3RyaW5nKSB7XG4gICAgdGhpcy5ub2RlSWQgPSBzaGExKE1hdGgucmFuZG9tKCkudG9TdHJpbmcoKSkudG9TdHJpbmcoKTtcbiAgICBpZiAodGFyZ2V0QWRkcmVzcykge1xuICAgICAgdGhpcy50YXJnZXRVcmwgPSBcImh0dHA6Ly9cIiArIHRhcmdldEFkZHJlc3MgKyBcIjpcIiArIHRhcmdldFBvcnQ7XG4gICAgICBjb25zdCBzb2NrZXQgPSBjbGllbnQuY29ubmVjdCh0aGlzLnRhcmdldFVybCk7XG4gICAgICBzb2NrZXQub24oXCJjb25uZWN0XCIsICgpID0+IHtcbiAgICAgICAgdGhpcy5vZmZlckZpcnN0KHNvY2tldCk7XG4gICAgICB9KTtcbiAgICAgIHNvY2tldC5vbihkZWYuQU5TV0VSLCAoZGF0YTogYW55KSA9PiB7XG4gICAgICAgIHBlZXJPZmZlci5zZXRBbnN3ZXIoZGF0YS5zZHAsIGRhdGEubm9kZUlkKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICB0aGlzLmthZCA9IG5ldyBLYWRlbWxpYSh0aGlzLm5vZGVJZCk7XG4gIH1cblxuICBvZmZlckZpcnN0KHNvY2tldDogYW55KSB7XG4gICAgY29uc29sZS5sb2coXCJAY2xpXCIsIFwib2ZmZXIgZmlyc3RcIik7XG4gICAgY29uc3QgcGVlciA9IG5ldyBXZWJSVEMoKTtcbiAgICBwZWVyLm1ha2VPZmZlcigpO1xuXG4gICAgcGVlci5zaWduYWwgPSBzZHAgPT4ge1xuICAgICAgc29ja2V0LmVtaXQoZGVmLk9GRkVSLCB7XG4gICAgICAgIHR5cGU6IGRlZi5PRkZFUixcbiAgICAgICAgbm9kZUlkOiB0aGlzLm5vZGVJZCxcbiAgICAgICAgc2RwOiBzZHBcbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICBwZWVyLmNvbm5lY3QgPSAoKSA9PiB7XG4gICAgICBjb25zb2xlLmxvZyhcImZpcnN0IGNvbm5lY3RlZFwiKTtcbiAgICAgIHRoaXMua2FkLmNvbm5lY3QocGVlcik7XG4gICAgfTtcblxuICAgIHBlZXJPZmZlciA9IHBlZXI7XG4gIH1cbn1cbiJdfQ==
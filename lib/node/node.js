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

    _defineProperty(this, "kad", void 0);

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

    this.kad = new _kademlia.default();
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
          nodeId: _this2.kad.nodeId,
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ub2RlL25vZGUudHMiXSwibmFtZXMiOlsiZGVmIiwiT0ZGRVIiLCJBTlNXRVIiLCJPTkNPTU1BTkQiLCJwZWVyT2ZmZXIiLCJOb2RlIiwidGFyZ2V0QWRkcmVzcyIsInRhcmdldFBvcnQiLCJ0YXJnZXRVcmwiLCJzb2NrZXQiLCJjbGllbnQiLCJjb25uZWN0Iiwib24iLCJvZmZlckZpcnN0IiwiZGF0YSIsInNldEFuc3dlciIsInNkcCIsIm5vZGVJZCIsImthZCIsIkthZGVtbGlhIiwiY29uc29sZSIsImxvZyIsInBlZXIiLCJXZWJSVEMiLCJtYWtlT2ZmZXIiLCJzaWduYWwiLCJlbWl0IiwidHlwZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFBOztBQUNBOztBQUVBOzs7Ozs7Ozs7Ozs7QUFFQSxJQUFNQSxHQUFHLEdBQUc7QUFDVkMsRUFBQUEsS0FBSyxFQUFFLE9BREc7QUFFVkMsRUFBQUEsTUFBTSxFQUFFLFFBRkU7QUFHVkMsRUFBQUEsU0FBUyxFQUFFO0FBSEQsQ0FBWjtBQU1BLElBQUlDLFNBQUo7O0lBRXFCQyxJOzs7QUFJbkIsZ0JBQVlDLGFBQVosRUFBbUNDLFVBQW5DLEVBQXVEO0FBQUE7O0FBQUE7O0FBQUE7O0FBQUE7O0FBQ3JELFFBQUlELGFBQUosRUFBbUI7QUFDakIsV0FBS0UsU0FBTCxHQUFpQixZQUFZRixhQUFaLEdBQTRCLEdBQTVCLEdBQWtDQyxVQUFuRDs7QUFDQSxVQUFNRSxNQUFNLEdBQUdDLGdCQUFPQyxPQUFQLENBQWUsS0FBS0gsU0FBcEIsQ0FBZjs7QUFDQUMsTUFBQUEsTUFBTSxDQUFDRyxFQUFQLENBQVUsU0FBVixFQUFxQixZQUFNO0FBQ3pCLFFBQUEsS0FBSSxDQUFDQyxVQUFMLENBQWdCSixNQUFoQjtBQUNELE9BRkQ7QUFHQUEsTUFBQUEsTUFBTSxDQUFDRyxFQUFQLENBQVVaLEdBQUcsQ0FBQ0UsTUFBZCxFQUFzQixVQUFDWSxJQUFELEVBQWU7QUFDbkNWLFFBQUFBLFNBQVMsQ0FBQ1csU0FBVixDQUFvQkQsSUFBSSxDQUFDRSxHQUF6QixFQUE4QkYsSUFBSSxDQUFDRyxNQUFuQztBQUNELE9BRkQ7QUFHRDs7QUFDRCxTQUFLQyxHQUFMLEdBQVcsSUFBSUMsaUJBQUosRUFBWDtBQUNEOzs7OytCQUVVVixNLEVBQWE7QUFBQTs7QUFDdEJXLE1BQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZLE1BQVosRUFBb0IsYUFBcEI7QUFDQSxVQUFNQyxJQUFJLEdBQUcsSUFBSUMsa0JBQUosRUFBYjtBQUNBRCxNQUFBQSxJQUFJLENBQUNFLFNBQUw7O0FBRUFGLE1BQUFBLElBQUksQ0FBQ0csTUFBTCxHQUFjLFVBQUFULEdBQUcsRUFBSTtBQUNuQlAsUUFBQUEsTUFBTSxDQUFDaUIsSUFBUCxDQUFZMUIsR0FBRyxDQUFDQyxLQUFoQixFQUF1QjtBQUNyQjBCLFVBQUFBLElBQUksRUFBRTNCLEdBQUcsQ0FBQ0MsS0FEVztBQUVyQmdCLFVBQUFBLE1BQU0sRUFBRSxNQUFJLENBQUNDLEdBQUwsQ0FBU0QsTUFGSTtBQUdyQkQsVUFBQUEsR0FBRyxFQUFFQTtBQUhnQixTQUF2QjtBQUtELE9BTkQ7O0FBUUFNLE1BQUFBLElBQUksQ0FBQ1gsT0FBTCxHQUFlLFlBQU07QUFDbkJTLFFBQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZLGlCQUFaOztBQUNBLFFBQUEsTUFBSSxDQUFDSCxHQUFMLENBQVNQLE9BQVQsQ0FBaUJXLElBQWpCO0FBQ0QsT0FIRDs7QUFLQWxCLE1BQUFBLFNBQVMsR0FBR2tCLElBQVo7QUFDRCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBXZWJSVEMgZnJvbSBcIndlYnJ0YzRtZVwiO1xuaW1wb3J0IGNsaWVudCBmcm9tIFwic29ja2V0LmlvLWNsaWVudFwiO1xuaW1wb3J0IHNoYTEgZnJvbSBcInNoYTFcIjtcbmltcG9ydCBLYWRlbWxpYSBmcm9tIFwiLi4va2FkL2thZGVtbGlhXCI7XG5cbmNvbnN0IGRlZiA9IHtcbiAgT0ZGRVI6IFwiT0ZGRVJcIixcbiAgQU5TV0VSOiBcIkFOU1dFUlwiLFxuICBPTkNPTU1BTkQ6IFwiT05DT01NQU5EXCJcbn07XG5cbmxldCBwZWVyT2ZmZXI6IFdlYlJUQztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTm9kZSB7XG4gIHRhcmdldFVybDogc3RyaW5nIHwgdW5kZWZpbmVkO1xuICBrYWQ6IEthZGVtbGlhO1xuXG4gIGNvbnN0cnVjdG9yKHRhcmdldEFkZHJlc3M6IHN0cmluZywgdGFyZ2V0UG9ydDogc3RyaW5nKSB7XG4gICAgaWYgKHRhcmdldEFkZHJlc3MpIHtcbiAgICAgIHRoaXMudGFyZ2V0VXJsID0gXCJodHRwOi8vXCIgKyB0YXJnZXRBZGRyZXNzICsgXCI6XCIgKyB0YXJnZXRQb3J0O1xuICAgICAgY29uc3Qgc29ja2V0ID0gY2xpZW50LmNvbm5lY3QodGhpcy50YXJnZXRVcmwpO1xuICAgICAgc29ja2V0Lm9uKFwiY29ubmVjdFwiLCAoKSA9PiB7XG4gICAgICAgIHRoaXMub2ZmZXJGaXJzdChzb2NrZXQpO1xuICAgICAgfSk7XG4gICAgICBzb2NrZXQub24oZGVmLkFOU1dFUiwgKGRhdGE6IGFueSkgPT4ge1xuICAgICAgICBwZWVyT2ZmZXIuc2V0QW5zd2VyKGRhdGEuc2RwLCBkYXRhLm5vZGVJZCk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgdGhpcy5rYWQgPSBuZXcgS2FkZW1saWEoKTtcbiAgfVxuXG4gIG9mZmVyRmlyc3Qoc29ja2V0OiBhbnkpIHtcbiAgICBjb25zb2xlLmxvZyhcIkBjbGlcIiwgXCJvZmZlciBmaXJzdFwiKTtcbiAgICBjb25zdCBwZWVyID0gbmV3IFdlYlJUQygpO1xuICAgIHBlZXIubWFrZU9mZmVyKCk7XG5cbiAgICBwZWVyLnNpZ25hbCA9IHNkcCA9PiB7XG4gICAgICBzb2NrZXQuZW1pdChkZWYuT0ZGRVIsIHtcbiAgICAgICAgdHlwZTogZGVmLk9GRkVSLFxuICAgICAgICBub2RlSWQ6IHRoaXMua2FkLm5vZGVJZCxcbiAgICAgICAgc2RwOiBzZHBcbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICBwZWVyLmNvbm5lY3QgPSAoKSA9PiB7XG4gICAgICBjb25zb2xlLmxvZyhcImZpcnN0IGNvbm5lY3RlZFwiKTtcbiAgICAgIHRoaXMua2FkLmNvbm5lY3QocGVlcik7XG4gICAgfTtcblxuICAgIHBlZXJPZmZlciA9IHBlZXI7XG4gIH1cbn1cbiJdfQ==
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
  function Node(targetAddress, targetPort, opt) {
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

    if (opt) this.kad = new _kademlia.default({
      pubkey: opt.pubkey,
      secKey: opt.seckey
    });else this.kad = new _kademlia.default();
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ub2RlL25vZGUudHMiXSwibmFtZXMiOlsiZGVmIiwiT0ZGRVIiLCJBTlNXRVIiLCJPTkNPTU1BTkQiLCJwZWVyT2ZmZXIiLCJOb2RlIiwidGFyZ2V0QWRkcmVzcyIsInRhcmdldFBvcnQiLCJvcHQiLCJ0YXJnZXRVcmwiLCJzb2NrZXQiLCJjbGllbnQiLCJjb25uZWN0Iiwib24iLCJvZmZlckZpcnN0IiwiZGF0YSIsInNldEFuc3dlciIsInNkcCIsIm5vZGVJZCIsImthZCIsIkthZGVtbGlhIiwicHVia2V5Iiwic2VjS2V5Iiwic2Vja2V5IiwiY29uc29sZSIsImxvZyIsInBlZXIiLCJXZWJSVEMiLCJtYWtlT2ZmZXIiLCJzaWduYWwiLCJlbWl0IiwidHlwZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFBOztBQUNBOztBQUNBOzs7Ozs7Ozs7Ozs7QUFFQSxJQUFNQSxHQUFHLEdBQUc7QUFDVkMsRUFBQUEsS0FBSyxFQUFFLE9BREc7QUFFVkMsRUFBQUEsTUFBTSxFQUFFLFFBRkU7QUFHVkMsRUFBQUEsU0FBUyxFQUFFO0FBSEQsQ0FBWjtBQU1BLElBQUlDLFNBQUo7O0lBRXFCQyxJOzs7QUFJbkIsZ0JBQ0VDLGFBREYsRUFFRUMsVUFGRixFQUdFQyxHQUhGLEVBSUU7QUFBQTs7QUFBQTs7QUFBQTs7QUFBQTs7QUFDQSxRQUFJRixhQUFKLEVBQW1CO0FBQ2pCLFdBQUtHLFNBQUwsR0FBaUIsWUFBWUgsYUFBWixHQUE0QixHQUE1QixHQUFrQ0MsVUFBbkQ7O0FBQ0EsVUFBTUcsTUFBTSxHQUFHQyxnQkFBT0MsT0FBUCxDQUFlLEtBQUtILFNBQXBCLENBQWY7O0FBQ0FDLE1BQUFBLE1BQU0sQ0FBQ0csRUFBUCxDQUFVLFNBQVYsRUFBcUIsWUFBTTtBQUN6QixRQUFBLEtBQUksQ0FBQ0MsVUFBTCxDQUFnQkosTUFBaEI7QUFDRCxPQUZEO0FBR0FBLE1BQUFBLE1BQU0sQ0FBQ0csRUFBUCxDQUFVYixHQUFHLENBQUNFLE1BQWQsRUFBc0IsVUFBQ2EsSUFBRCxFQUFlO0FBQ25DWCxRQUFBQSxTQUFTLENBQUNZLFNBQVYsQ0FBb0JELElBQUksQ0FBQ0UsR0FBekIsRUFBOEJGLElBQUksQ0FBQ0csTUFBbkM7QUFDRCxPQUZEO0FBR0Q7O0FBRUQsUUFBSVYsR0FBSixFQUNFLEtBQUtXLEdBQUwsR0FBVyxJQUFJQyxpQkFBSixDQUFhO0FBQUVDLE1BQUFBLE1BQU0sRUFBRWIsR0FBRyxDQUFDYSxNQUFkO0FBQXNCQyxNQUFBQSxNQUFNLEVBQUVkLEdBQUcsQ0FBQ2U7QUFBbEMsS0FBYixDQUFYLENBREYsS0FFSyxLQUFLSixHQUFMLEdBQVcsSUFBSUMsaUJBQUosRUFBWDtBQUNOOzs7OytCQUVVVixNLEVBQWE7QUFBQTs7QUFDdEJjLE1BQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZLE1BQVosRUFBb0IsYUFBcEI7QUFDQSxVQUFNQyxJQUFJLEdBQUcsSUFBSUMsa0JBQUosRUFBYjtBQUNBRCxNQUFBQSxJQUFJLENBQUNFLFNBQUw7O0FBRUFGLE1BQUFBLElBQUksQ0FBQ0csTUFBTCxHQUFjLFVBQUFaLEdBQUcsRUFBSTtBQUNuQlAsUUFBQUEsTUFBTSxDQUFDb0IsSUFBUCxDQUFZOUIsR0FBRyxDQUFDQyxLQUFoQixFQUF1QjtBQUNyQjhCLFVBQUFBLElBQUksRUFBRS9CLEdBQUcsQ0FBQ0MsS0FEVztBQUVyQmlCLFVBQUFBLE1BQU0sRUFBRSxNQUFJLENBQUNDLEdBQUwsQ0FBU0QsTUFGSTtBQUdyQkQsVUFBQUEsR0FBRyxFQUFFQTtBQUhnQixTQUF2QjtBQUtELE9BTkQ7O0FBUUFTLE1BQUFBLElBQUksQ0FBQ2QsT0FBTCxHQUFlLFlBQU07QUFDbkJZLFFBQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZLGlCQUFaOztBQUNBLFFBQUEsTUFBSSxDQUFDTixHQUFMLENBQVNQLE9BQVQsQ0FBaUJjLElBQWpCO0FBQ0QsT0FIRDs7QUFLQXRCLE1BQUFBLFNBQVMsR0FBR3NCLElBQVo7QUFDRCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBXZWJSVEMgZnJvbSBcIndlYnJ0YzRtZVwiO1xuaW1wb3J0IGNsaWVudCBmcm9tIFwic29ja2V0LmlvLWNsaWVudFwiO1xuaW1wb3J0IEthZGVtbGlhIGZyb20gXCIuLi9rYWQva2FkZW1saWFcIjtcblxuY29uc3QgZGVmID0ge1xuICBPRkZFUjogXCJPRkZFUlwiLFxuICBBTlNXRVI6IFwiQU5TV0VSXCIsXG4gIE9OQ09NTUFORDogXCJPTkNPTU1BTkRcIlxufTtcblxubGV0IHBlZXJPZmZlcjogV2ViUlRDO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBOb2RlIHtcbiAgdGFyZ2V0VXJsOiBzdHJpbmcgfCB1bmRlZmluZWQ7XG4gIGthZDogS2FkZW1saWE7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgdGFyZ2V0QWRkcmVzczogc3RyaW5nLFxuICAgIHRhcmdldFBvcnQ6IHN0cmluZyxcbiAgICBvcHQ/OiB7IHB1YmtleT86IHN0cmluZzsgc2Vja2V5Pzogc3RyaW5nIH1cbiAgKSB7XG4gICAgaWYgKHRhcmdldEFkZHJlc3MpIHtcbiAgICAgIHRoaXMudGFyZ2V0VXJsID0gXCJodHRwOi8vXCIgKyB0YXJnZXRBZGRyZXNzICsgXCI6XCIgKyB0YXJnZXRQb3J0O1xuICAgICAgY29uc3Qgc29ja2V0ID0gY2xpZW50LmNvbm5lY3QodGhpcy50YXJnZXRVcmwpO1xuICAgICAgc29ja2V0Lm9uKFwiY29ubmVjdFwiLCAoKSA9PiB7XG4gICAgICAgIHRoaXMub2ZmZXJGaXJzdChzb2NrZXQpO1xuICAgICAgfSk7XG4gICAgICBzb2NrZXQub24oZGVmLkFOU1dFUiwgKGRhdGE6IGFueSkgPT4ge1xuICAgICAgICBwZWVyT2ZmZXIuc2V0QW5zd2VyKGRhdGEuc2RwLCBkYXRhLm5vZGVJZCk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAob3B0KVxuICAgICAgdGhpcy5rYWQgPSBuZXcgS2FkZW1saWEoeyBwdWJrZXk6IG9wdC5wdWJrZXksIHNlY0tleTogb3B0LnNlY2tleSB9KTtcbiAgICBlbHNlIHRoaXMua2FkID0gbmV3IEthZGVtbGlhKCk7XG4gIH1cblxuICBvZmZlckZpcnN0KHNvY2tldDogYW55KSB7XG4gICAgY29uc29sZS5sb2coXCJAY2xpXCIsIFwib2ZmZXIgZmlyc3RcIik7XG4gICAgY29uc3QgcGVlciA9IG5ldyBXZWJSVEMoKTtcbiAgICBwZWVyLm1ha2VPZmZlcigpO1xuXG4gICAgcGVlci5zaWduYWwgPSBzZHAgPT4ge1xuICAgICAgc29ja2V0LmVtaXQoZGVmLk9GRkVSLCB7XG4gICAgICAgIHR5cGU6IGRlZi5PRkZFUixcbiAgICAgICAgbm9kZUlkOiB0aGlzLmthZC5ub2RlSWQsXG4gICAgICAgIHNkcDogc2RwXG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgcGVlci5jb25uZWN0ID0gKCkgPT4ge1xuICAgICAgY29uc29sZS5sb2coXCJmaXJzdCBjb25uZWN0ZWRcIik7XG4gICAgICB0aGlzLmthZC5jb25uZWN0KHBlZXIpO1xuICAgIH07XG5cbiAgICBwZWVyT2ZmZXIgPSBwZWVyO1xuICB9XG59XG4iXX0=
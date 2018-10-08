"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _NodeRTC = _interopRequireDefault(require("simple-datachannel/lib/NodeRTC"));

var _socket = _interopRequireDefault(require("socket.io-client"));

var _sha = _interopRequireDefault(require("sha1"));

var _events = _interopRequireDefault(require("events"));

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

    _defineProperty(this, "ev", void 0);

    _defineProperty(this, "kad", void 0);

    this.nodeId = (0, _sha.default)(Math.random().toString()).toString();
    this.ev = new _events.default.EventEmitter();

    if (targetAddress != null) {
      this.targetUrl = "http://" + targetAddress + ":" + targetPort;

      var socket = _socket.default.connect(this.targetUrl);

      socket.on("connect", function () {
        _this.offerFirst(socket);
      });
      socket.on(def.ANSWER, function (data) {
        peerOffer.connecting(data.nodeId);
        peerOffer.setAnswer(data.sdp);
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
      var peer = new _NodeRTC.default();
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ub2RlL25vZGUudHMiXSwibmFtZXMiOlsiZGVmIiwiT0ZGRVIiLCJBTlNXRVIiLCJPTkNPTU1BTkQiLCJwZWVyT2ZmZXIiLCJOb2RlIiwidGFyZ2V0QWRkcmVzcyIsInRhcmdldFBvcnQiLCJub2RlSWQiLCJNYXRoIiwicmFuZG9tIiwidG9TdHJpbmciLCJldiIsImV2ZW50cyIsIkV2ZW50RW1pdHRlciIsInRhcmdldFVybCIsInNvY2tldCIsImNsaWVudCIsImNvbm5lY3QiLCJvbiIsIm9mZmVyRmlyc3QiLCJkYXRhIiwiY29ubmVjdGluZyIsInNldEFuc3dlciIsInNkcCIsImthZCIsIkthZGVtbGlhIiwiY29uc29sZSIsImxvZyIsInBlZXIiLCJXZWJSVEMiLCJtYWtlT2ZmZXIiLCJzaWduYWwiLCJlbWl0IiwidHlwZSIsImFkZGtub2RlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7Ozs7Ozs7OztBQUVBLElBQU1BLEdBQUcsR0FBRztBQUNWQyxFQUFBQSxLQUFLLEVBQUUsT0FERztBQUVWQyxFQUFBQSxNQUFNLEVBQUUsUUFGRTtBQUdWQyxFQUFBQSxTQUFTLEVBQUU7QUFIRCxDQUFaO0FBTUEsSUFBSUMsU0FBSjs7SUFFcUJDLEk7OztBQU1uQixnQkFBWUMsYUFBWixFQUFtQ0MsVUFBbkMsRUFBdUQ7QUFBQTs7QUFBQTs7QUFBQTs7QUFBQTs7QUFBQTs7QUFBQTs7QUFDckQsU0FBS0MsTUFBTCxHQUFjLGtCQUFLQyxJQUFJLENBQUNDLE1BQUwsR0FBY0MsUUFBZCxFQUFMLEVBQStCQSxRQUEvQixFQUFkO0FBQ0EsU0FBS0MsRUFBTCxHQUFVLElBQUlDLGdCQUFPQyxZQUFYLEVBQVY7O0FBQ0EsUUFBSVIsYUFBYSxJQUFJLElBQXJCLEVBQTJCO0FBQ3pCLFdBQUtTLFNBQUwsR0FBaUIsWUFBWVQsYUFBWixHQUE0QixHQUE1QixHQUFrQ0MsVUFBbkQ7O0FBQ0EsVUFBTVMsTUFBTSxHQUFHQyxnQkFBT0MsT0FBUCxDQUFlLEtBQUtILFNBQXBCLENBQWY7O0FBQ0FDLE1BQUFBLE1BQU0sQ0FBQ0csRUFBUCxDQUFVLFNBQVYsRUFBcUIsWUFBTTtBQUN6QixRQUFBLEtBQUksQ0FBQ0MsVUFBTCxDQUFnQkosTUFBaEI7QUFDRCxPQUZEO0FBR0FBLE1BQUFBLE1BQU0sQ0FBQ0csRUFBUCxDQUFVbkIsR0FBRyxDQUFDRSxNQUFkLEVBQXNCLFVBQUNtQixJQUFELEVBQWU7QUFDbkNqQixRQUFBQSxTQUFTLENBQUNrQixVQUFWLENBQXFCRCxJQUFJLENBQUNiLE1BQTFCO0FBQ0FKLFFBQUFBLFNBQVMsQ0FBQ21CLFNBQVYsQ0FBb0JGLElBQUksQ0FBQ0csR0FBekI7QUFDRCxPQUhEO0FBSUQsS0FWRCxNQVVPO0FBQ0wsV0FBS1QsU0FBTCxHQUFpQixJQUFqQjtBQUNEOztBQUNELFNBQUtVLEdBQUwsR0FBVyxJQUFJQyxpQkFBSixDQUFhLEtBQUtsQixNQUFsQixDQUFYO0FBQ0Q7Ozs7K0JBRVVRLE0sRUFBYTtBQUFBOztBQUN0QlcsTUFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVksTUFBWixFQUFvQixhQUFwQjtBQUNBLFVBQU1DLElBQUksR0FBRyxJQUFJQyxnQkFBSixFQUFiO0FBQ0FELE1BQUFBLElBQUksQ0FBQ0UsU0FBTDs7QUFFQUYsTUFBQUEsSUFBSSxDQUFDRyxNQUFMLEdBQWMsVUFBQVIsR0FBRyxFQUFJO0FBQ25CUixRQUFBQSxNQUFNLENBQUNpQixJQUFQLENBQVlqQyxHQUFHLENBQUNDLEtBQWhCLEVBQXVCO0FBQ3JCaUMsVUFBQUEsSUFBSSxFQUFFbEMsR0FBRyxDQUFDQyxLQURXO0FBRXJCTyxVQUFBQSxNQUFNLEVBQUUsTUFBSSxDQUFDQSxNQUZRO0FBR3JCZ0IsVUFBQUEsR0FBRyxFQUFFQTtBQUhnQixTQUF2QjtBQUtELE9BTkQ7O0FBUUFLLE1BQUFBLElBQUksQ0FBQ1gsT0FBTCxHQUFlLFlBQU07QUFDbkJTLFFBQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZLGlCQUFaOztBQUNBLFFBQUEsTUFBSSxDQUFDSCxHQUFMLENBQVNVLFFBQVQsQ0FBa0JOLElBQWxCO0FBQ0QsT0FIRDs7QUFLQXpCLE1BQUFBLFNBQVMsR0FBR3lCLElBQVo7QUFDRCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBXZWJSVEMgZnJvbSBcInNpbXBsZS1kYXRhY2hhbm5lbC9saWIvTm9kZVJUQ1wiO1xuaW1wb3J0IGNsaWVudCBmcm9tIFwic29ja2V0LmlvLWNsaWVudFwiO1xuaW1wb3J0IHNoYTEgZnJvbSBcInNoYTFcIjtcbmltcG9ydCBldmVudHMgZnJvbSBcImV2ZW50c1wiO1xuaW1wb3J0IEthZGVtbGlhIGZyb20gXCIuLi9rYWQva2FkZW1saWFcIjtcblxuY29uc3QgZGVmID0ge1xuICBPRkZFUjogXCJPRkZFUlwiLFxuICBBTlNXRVI6IFwiQU5TV0VSXCIsXG4gIE9OQ09NTUFORDogXCJPTkNPTU1BTkRcIlxufTtcblxubGV0IHBlZXJPZmZlcjogV2ViUlRDO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBOb2RlIHtcbiAgdGFyZ2V0VXJsOiBzdHJpbmcgfCBudWxsO1xuICBub2RlSWQ6IHN0cmluZztcbiAgZXY6IGV2ZW50cy5FdmVudEVtaXR0ZXI7XG4gIGthZDogS2FkZW1saWE7XG5cbiAgY29uc3RydWN0b3IodGFyZ2V0QWRkcmVzczogc3RyaW5nLCB0YXJnZXRQb3J0OiBzdHJpbmcpIHtcbiAgICB0aGlzLm5vZGVJZCA9IHNoYTEoTWF0aC5yYW5kb20oKS50b1N0cmluZygpKS50b1N0cmluZygpO1xuICAgIHRoaXMuZXYgPSBuZXcgZXZlbnRzLkV2ZW50RW1pdHRlcigpO1xuICAgIGlmICh0YXJnZXRBZGRyZXNzICE9IG51bGwpIHtcbiAgICAgIHRoaXMudGFyZ2V0VXJsID0gXCJodHRwOi8vXCIgKyB0YXJnZXRBZGRyZXNzICsgXCI6XCIgKyB0YXJnZXRQb3J0O1xuICAgICAgY29uc3Qgc29ja2V0ID0gY2xpZW50LmNvbm5lY3QodGhpcy50YXJnZXRVcmwpO1xuICAgICAgc29ja2V0Lm9uKFwiY29ubmVjdFwiLCAoKSA9PiB7XG4gICAgICAgIHRoaXMub2ZmZXJGaXJzdChzb2NrZXQpO1xuICAgICAgfSk7XG4gICAgICBzb2NrZXQub24oZGVmLkFOU1dFUiwgKGRhdGE6IGFueSkgPT4ge1xuICAgICAgICBwZWVyT2ZmZXIuY29ubmVjdGluZyhkYXRhLm5vZGVJZCk7XG4gICAgICAgIHBlZXJPZmZlci5zZXRBbnN3ZXIoZGF0YS5zZHApO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMudGFyZ2V0VXJsID0gbnVsbDtcbiAgICB9XG4gICAgdGhpcy5rYWQgPSBuZXcgS2FkZW1saWEodGhpcy5ub2RlSWQpO1xuICB9XG5cbiAgb2ZmZXJGaXJzdChzb2NrZXQ6IGFueSkge1xuICAgIGNvbnNvbGUubG9nKFwiQGNsaVwiLCBcIm9mZmVyIGZpcnN0XCIpO1xuICAgIGNvbnN0IHBlZXIgPSBuZXcgV2ViUlRDKCk7XG4gICAgcGVlci5tYWtlT2ZmZXIoKTtcblxuICAgIHBlZXIuc2lnbmFsID0gc2RwID0+IHtcbiAgICAgIHNvY2tldC5lbWl0KGRlZi5PRkZFUiwge1xuICAgICAgICB0eXBlOiBkZWYuT0ZGRVIsXG4gICAgICAgIG5vZGVJZDogdGhpcy5ub2RlSWQsXG4gICAgICAgIHNkcDogc2RwXG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgcGVlci5jb25uZWN0ID0gKCkgPT4ge1xuICAgICAgY29uc29sZS5sb2coXCJmaXJzdCBjb25uZWN0ZWRcIik7XG4gICAgICB0aGlzLmthZC5hZGRrbm9kZShwZWVyKTtcbiAgICB9O1xuXG4gICAgcGVlck9mZmVyID0gcGVlcjtcbiAgfVxufVxuIl19
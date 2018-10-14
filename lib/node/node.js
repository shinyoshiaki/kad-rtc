"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _webrtc4me = _interopRequireDefault(require("webrtc4me"));

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ub2RlL25vZGUudHMiXSwibmFtZXMiOlsiZGVmIiwiT0ZGRVIiLCJBTlNXRVIiLCJPTkNPTU1BTkQiLCJwZWVyT2ZmZXIiLCJOb2RlIiwidGFyZ2V0QWRkcmVzcyIsInRhcmdldFBvcnQiLCJub2RlSWQiLCJNYXRoIiwicmFuZG9tIiwidG9TdHJpbmciLCJldiIsImV2ZW50cyIsIkV2ZW50RW1pdHRlciIsInRhcmdldFVybCIsInNvY2tldCIsImNsaWVudCIsImNvbm5lY3QiLCJvbiIsIm9mZmVyRmlyc3QiLCJkYXRhIiwic2V0QW5zd2VyIiwic2RwIiwia2FkIiwiS2FkZW1saWEiLCJjb25zb2xlIiwibG9nIiwicGVlciIsIldlYlJUQyIsIm1ha2VPZmZlciIsInNpZ25hbCIsImVtaXQiLCJ0eXBlIiwiYWRka25vZGUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7Ozs7Ozs7O0FBRUEsSUFBTUEsR0FBRyxHQUFHO0FBQ1ZDLEVBQUFBLEtBQUssRUFBRSxPQURHO0FBRVZDLEVBQUFBLE1BQU0sRUFBRSxRQUZFO0FBR1ZDLEVBQUFBLFNBQVMsRUFBRTtBQUhELENBQVo7QUFNQSxJQUFJQyxTQUFKOztJQUVxQkMsSTs7O0FBTW5CLGdCQUFZQyxhQUFaLEVBQW1DQyxVQUFuQyxFQUF1RDtBQUFBOztBQUFBOztBQUFBOztBQUFBOztBQUFBOztBQUFBOztBQUNyRCxTQUFLQyxNQUFMLEdBQWMsa0JBQUtDLElBQUksQ0FBQ0MsTUFBTCxHQUFjQyxRQUFkLEVBQUwsRUFBK0JBLFFBQS9CLEVBQWQ7QUFDQSxTQUFLQyxFQUFMLEdBQVUsSUFBSUMsZ0JBQU9DLFlBQVgsRUFBVjs7QUFDQSxRQUFJUixhQUFhLElBQUksSUFBckIsRUFBMkI7QUFDekIsV0FBS1MsU0FBTCxHQUFpQixZQUFZVCxhQUFaLEdBQTRCLEdBQTVCLEdBQWtDQyxVQUFuRDs7QUFDQSxVQUFNUyxNQUFNLEdBQUdDLGdCQUFPQyxPQUFQLENBQWUsS0FBS0gsU0FBcEIsQ0FBZjs7QUFDQUMsTUFBQUEsTUFBTSxDQUFDRyxFQUFQLENBQVUsU0FBVixFQUFxQixZQUFNO0FBQ3pCLFFBQUEsS0FBSSxDQUFDQyxVQUFMLENBQWdCSixNQUFoQjtBQUNELE9BRkQ7QUFHQUEsTUFBQUEsTUFBTSxDQUFDRyxFQUFQLENBQVVuQixHQUFHLENBQUNFLE1BQWQsRUFBc0IsVUFBQ21CLElBQUQsRUFBZTtBQUNuQ2pCLFFBQUFBLFNBQVMsQ0FBQ2tCLFNBQVYsQ0FBb0JELElBQUksQ0FBQ0UsR0FBekIsRUFBOEJGLElBQUksQ0FBQ2IsTUFBbkM7QUFDRCxPQUZEO0FBR0QsS0FURCxNQVNPO0FBQ0wsV0FBS08sU0FBTCxHQUFpQixJQUFqQjtBQUNEOztBQUNELFNBQUtTLEdBQUwsR0FBVyxJQUFJQyxpQkFBSixDQUFhLEtBQUtqQixNQUFsQixDQUFYO0FBQ0Q7Ozs7K0JBRVVRLE0sRUFBYTtBQUFBOztBQUN0QlUsTUFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVksTUFBWixFQUFvQixhQUFwQjtBQUNBLFVBQU1DLElBQUksR0FBRyxJQUFJQyxrQkFBSixFQUFiO0FBQ0FELE1BQUFBLElBQUksQ0FBQ0UsU0FBTDs7QUFFQUYsTUFBQUEsSUFBSSxDQUFDRyxNQUFMLEdBQWMsVUFBQVIsR0FBRyxFQUFJO0FBQ25CUCxRQUFBQSxNQUFNLENBQUNnQixJQUFQLENBQVloQyxHQUFHLENBQUNDLEtBQWhCLEVBQXVCO0FBQ3JCZ0MsVUFBQUEsSUFBSSxFQUFFakMsR0FBRyxDQUFDQyxLQURXO0FBRXJCTyxVQUFBQSxNQUFNLEVBQUUsTUFBSSxDQUFDQSxNQUZRO0FBR3JCZSxVQUFBQSxHQUFHLEVBQUVBO0FBSGdCLFNBQXZCO0FBS0QsT0FORDs7QUFRQUssTUFBQUEsSUFBSSxDQUFDVixPQUFMLEdBQWUsWUFBTTtBQUNuQlEsUUFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVksaUJBQVo7O0FBQ0EsUUFBQSxNQUFJLENBQUNILEdBQUwsQ0FBU1UsUUFBVCxDQUFrQk4sSUFBbEI7QUFDRCxPQUhEOztBQUtBeEIsTUFBQUEsU0FBUyxHQUFHd0IsSUFBWjtBQUNEIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFdlYlJUQyBmcm9tIFwid2VicnRjNG1lXCI7XG5pbXBvcnQgY2xpZW50IGZyb20gXCJzb2NrZXQuaW8tY2xpZW50XCI7XG5pbXBvcnQgc2hhMSBmcm9tIFwic2hhMVwiO1xuaW1wb3J0IGV2ZW50cyBmcm9tIFwiZXZlbnRzXCI7XG5pbXBvcnQgS2FkZW1saWEgZnJvbSBcIi4uL2thZC9rYWRlbWxpYVwiO1xuXG5jb25zdCBkZWYgPSB7XG4gIE9GRkVSOiBcIk9GRkVSXCIsXG4gIEFOU1dFUjogXCJBTlNXRVJcIixcbiAgT05DT01NQU5EOiBcIk9OQ09NTUFORFwiXG59O1xuXG5sZXQgcGVlck9mZmVyOiBXZWJSVEM7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE5vZGUge1xuICB0YXJnZXRVcmw6IHN0cmluZyB8IG51bGw7XG4gIG5vZGVJZDogc3RyaW5nO1xuICBldjogZXZlbnRzLkV2ZW50RW1pdHRlcjtcbiAga2FkOiBLYWRlbWxpYTtcblxuICBjb25zdHJ1Y3Rvcih0YXJnZXRBZGRyZXNzOiBzdHJpbmcsIHRhcmdldFBvcnQ6IHN0cmluZykge1xuICAgIHRoaXMubm9kZUlkID0gc2hhMShNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKCkpLnRvU3RyaW5nKCk7XG4gICAgdGhpcy5ldiA9IG5ldyBldmVudHMuRXZlbnRFbWl0dGVyKCk7XG4gICAgaWYgKHRhcmdldEFkZHJlc3MgIT0gbnVsbCkge1xuICAgICAgdGhpcy50YXJnZXRVcmwgPSBcImh0dHA6Ly9cIiArIHRhcmdldEFkZHJlc3MgKyBcIjpcIiArIHRhcmdldFBvcnQ7XG4gICAgICBjb25zdCBzb2NrZXQgPSBjbGllbnQuY29ubmVjdCh0aGlzLnRhcmdldFVybCk7XG4gICAgICBzb2NrZXQub24oXCJjb25uZWN0XCIsICgpID0+IHtcbiAgICAgICAgdGhpcy5vZmZlckZpcnN0KHNvY2tldCk7XG4gICAgICB9KTtcbiAgICAgIHNvY2tldC5vbihkZWYuQU5TV0VSLCAoZGF0YTogYW55KSA9PiB7XG4gICAgICAgIHBlZXJPZmZlci5zZXRBbnN3ZXIoZGF0YS5zZHAsIGRhdGEubm9kZUlkKTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnRhcmdldFVybCA9IG51bGw7XG4gICAgfVxuICAgIHRoaXMua2FkID0gbmV3IEthZGVtbGlhKHRoaXMubm9kZUlkKTtcbiAgfVxuXG4gIG9mZmVyRmlyc3Qoc29ja2V0OiBhbnkpIHtcbiAgICBjb25zb2xlLmxvZyhcIkBjbGlcIiwgXCJvZmZlciBmaXJzdFwiKTtcbiAgICBjb25zdCBwZWVyID0gbmV3IFdlYlJUQygpO1xuICAgIHBlZXIubWFrZU9mZmVyKCk7XG5cbiAgICBwZWVyLnNpZ25hbCA9IHNkcCA9PiB7XG4gICAgICBzb2NrZXQuZW1pdChkZWYuT0ZGRVIsIHtcbiAgICAgICAgdHlwZTogZGVmLk9GRkVSLFxuICAgICAgICBub2RlSWQ6IHRoaXMubm9kZUlkLFxuICAgICAgICBzZHA6IHNkcFxuICAgICAgfSk7XG4gICAgfTtcblxuICAgIHBlZXIuY29ubmVjdCA9ICgpID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKFwiZmlyc3QgY29ubmVjdGVkXCIpO1xuICAgICAgdGhpcy5rYWQuYWRka25vZGUocGVlcik7XG4gICAgfTtcblxuICAgIHBlZXJPZmZlciA9IHBlZXI7XG4gIH1cbn1cbiJdfQ==
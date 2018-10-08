"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _NodeRTC = _interopRequireDefault(require("simple-datachannel/lib/NodeRTC"));

var _http = _interopRequireDefault(require("http"));

var _socket = _interopRequireDefault(require("socket.io"));

var _socket2 = _interopRequireDefault(require("socket.io-client"));

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

var PortalNode =
/*#__PURE__*/
function () {
  function PortalNode(myPort, target) {
    var _this = this;

    _classCallCheck(this, PortalNode);

    _defineProperty(this, "nodeId", void 0);

    _defineProperty(this, "ev", void 0);

    _defineProperty(this, "io", void 0);

    _defineProperty(this, "kad", void 0);

    this.nodeId = (0, _sha.default)(Math.random().toString()).toString();
    console.log("nodeid", this.nodeId);

    if (target) {
      var targetUrl = "http://" + target.address + ":" + target.port;

      var socket = _socket2.default.connect(targetUrl);

      socket.on("connect", function () {
        _this.offerFirst(socket);
      });
      socket.on(def.ANSWER, function (data) {
        peerOffer.connecting(data.nodeId);
        peerOffer.setAnswer(data.sdp);
      });
    }

    var srv = new _http.default.Server();
    this.io = (0, _socket.default)(srv);
    srv.listen(myPort);
    this.io.on("connection", function (socket) {
      socket.on(def.OFFER, function (data) {
        _this.answerFirst(data, socket.id);
      });
    });
    this.ev = new _events.default.EventEmitter();
    this.kad = new _kademlia.default(this.nodeId);
  }

  _createClass(PortalNode, [{
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
        console.log("first offer connected");

        _this2.kad.addknode(peer);
      };

      peerOffer = peer;
    }
  }, {
    key: "answerFirst",
    value: function answerFirst(data, socketId) {
      var _this3 = this;

      return new Promise(function (resolve, reject) {
        var peer = new _NodeRTC.default();
        peer.makeAnswer(data.sdp);
        peer.connecting(data.nodeId);
        var timeout = setTimeout(function () {
          reject("timeout");
        }, 3 * 1000);

        peer.signal = function (sdp) {
          _this3.io.sockets.sockets[socketId].emit(def.ANSWER, {
            sdp: sdp,
            nodeId: _this3.nodeId
          });
        };

        peer.connect = function () {
          console.log("first answer connected");
          clearTimeout(timeout);
          resolve(true);

          _this3.kad.addknode(peer);
        };
      });
    }
  }]);

  return PortalNode;
}();

exports.default = PortalNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ub2RlL3BvcnRhbE5vZGUudHMiXSwibmFtZXMiOlsiZGVmIiwiT0ZGRVIiLCJBTlNXRVIiLCJPTkNPTU1BTkQiLCJwZWVyT2ZmZXIiLCJQb3J0YWxOb2RlIiwibXlQb3J0IiwidGFyZ2V0Iiwibm9kZUlkIiwiTWF0aCIsInJhbmRvbSIsInRvU3RyaW5nIiwiY29uc29sZSIsImxvZyIsInRhcmdldFVybCIsImFkZHJlc3MiLCJwb3J0Iiwic29ja2V0IiwiY2xpZW50IiwiY29ubmVjdCIsIm9uIiwib2ZmZXJGaXJzdCIsImRhdGEiLCJjb25uZWN0aW5nIiwic2V0QW5zd2VyIiwic2RwIiwic3J2IiwiaHR0cCIsIlNlcnZlciIsImlvIiwibGlzdGVuIiwiYW5zd2VyRmlyc3QiLCJpZCIsImV2IiwiZXZlbnRzIiwiRXZlbnRFbWl0dGVyIiwia2FkIiwiS2FkZW1saWEiLCJwZWVyIiwiV2ViUlRDIiwibWFrZU9mZmVyIiwic2lnbmFsIiwiZW1pdCIsInR5cGUiLCJhZGRrbm9kZSIsInNvY2tldElkIiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZWplY3QiLCJtYWtlQW5zd2VyIiwidGltZW91dCIsInNldFRpbWVvdXQiLCJzb2NrZXRzIiwiY2xlYXJUaW1lb3V0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7Ozs7Ozs7OztBQUVBLElBQU1BLEdBQUcsR0FBRztBQUNWQyxFQUFBQSxLQUFLLEVBQUUsT0FERztBQUVWQyxFQUFBQSxNQUFNLEVBQUUsUUFGRTtBQUdWQyxFQUFBQSxTQUFTLEVBQUU7QUFIRCxDQUFaO0FBTUEsSUFBSUMsU0FBSjs7SUFFcUJDLFU7OztBQU1uQixzQkFBWUMsTUFBWixFQUE0QkMsTUFBNUIsRUFBd0U7QUFBQTs7QUFBQTs7QUFBQTs7QUFBQTs7QUFBQTs7QUFBQTs7QUFDdEUsU0FBS0MsTUFBTCxHQUFjLGtCQUFLQyxJQUFJLENBQUNDLE1BQUwsR0FB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VSxDQUFDLFlBQU07QUFDL0JILFVBQUFBLE1BQU0sQ0FBQyxTQUFELENBQU47QUFDRCxTQUZ5QixFQUV2QixJQUFJLElBRm1CLENBQTFCOztBQUlBVixRQUFBQSxJQUFJLENBQUNHLE1BQUwsR0FBYyxVQUFBaEIsR0FBRyxFQUFJO0FBQ25CLFVBQUEsTUFBSSxDQUFDSSxFQUFMLENBQVF1QixPQUFSLENBQWdCQSxPQUFoQixDQUF3QlAsUUFBeEIsRUFBa0NILElBQWxDLENBQXVDMUMsR0FBRyxDQUFDRSxNQUEzQyxFQUFtRDtBQUNqRHVCLFlBQUFBLEdBQUcsRUFBRUEsR0FENEM7QUFFakRqQixZQUFBQSxNQUFNLEVBQUUsTUFBSSxDQUFDQTtBQUZvQyxXQUFuRDtBQUlELFNBTEQ7O0FBT0E4QixRQUFBQSxJQUFJLENBQUNuQixPQUFMLEdBQWUsWUFBTTtBQUNuQlAsVUFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVksd0JBQVo7QUFDQXdDLFVBQUFBLFlBQVksQ0FBQ0gsT0FBRCxDQUFaO0FBQ0FILFVBQUFBLE9BQU8sQ0FBQyxJQUFELENBQVA7O0FBQ0EsVUFBQSxNQUFJLENBQUNYLEdBQUwsQ0FBU1EsUUFBVCxDQUFrQk4sSUFBbEI7QUFDRCxTQUxEO0FBTUQsT0F0Qk0sQ0FBUDtBQXVCRCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBXZWJSVEMgZnJvbSBcInNpbXBsZS1kYXRhY2hhbm5lbC9saWIvTm9kZVJUQ1wiO1xuaW1wb3J0IGh0dHAgZnJvbSBcImh0dHBcIjtcbmltcG9ydCBzb2NrZXRpbyBmcm9tIFwic29ja2V0LmlvXCI7XG5pbXBvcnQgY2xpZW50IGZyb20gXCJzb2NrZXQuaW8tY2xpZW50XCI7XG5pbXBvcnQgc2hhMSBmcm9tIFwic2hhMVwiO1xuaW1wb3J0IGV2ZW50cyBmcm9tIFwiZXZlbnRzXCI7XG5pbXBvcnQgS2FkZW1saWEgZnJvbSBcIi4uL2thZC9rYWRlbWxpYVwiO1xuXG5jb25zdCBkZWYgPSB7XG4gIE9GRkVSOiBcIk9GRkVSXCIsXG4gIEFOU1dFUjogXCJBTlNXRVJcIixcbiAgT05DT01NQU5EOiBcIk9OQ09NTUFORFwiXG59O1xuXG5sZXQgcGVlck9mZmVyOiBXZWJSVEM7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBvcnRhbE5vZGUge1xuICBub2RlSWQ6IHN0cmluZztcbiAgZXY6IGV2ZW50cy5FdmVudEVtaXR0ZXI7XG4gIGlvOiBhbnk7XG4gIGthZDogS2FkZW1saWE7XG5cbiAgY29uc3RydWN0b3IobXlQb3J0OiBudW1iZXIsIHRhcmdldD86IHsgYWRkcmVzczogc3RyaW5nOyBwb3J0OiBzdHJpbmcgfSkge1xuICAgIHRoaXMubm9kZUlkID0gc2hhMShNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKCkpLnRvU3RyaW5nKCk7XG4gICAgY29uc29sZS5sb2coXCJub2RlaWRcIiwgdGhpcy5ub2RlSWQpO1xuICAgIGlmICh0YXJnZXQpIHtcbiAgICAgIGNvbnN0IHRhcmdldFVybCA9IFwiaHR0cDovL1wiICsgdGFyZ2V0LmFkZHJlc3MgKyBcIjpcIiArIHRhcmdldC5wb3J0O1xuICAgICAgY29uc3Qgc29ja2V0ID0gY2xpZW50LmNvbm5lY3QodGFyZ2V0VXJsKTtcbiAgICAgIHNvY2tldC5vbihcImNvbm5lY3RcIiwgKCkgPT4ge1xuICAgICAgICB0aGlzLm9mZmVyRmlyc3Qoc29ja2V0KTtcbiAgICAgIH0pO1xuICAgICAgc29ja2V0Lm9uKGRlZi5BTlNXRVIsIChkYXRhOiBhbnkpID0+IHtcbiAgICAgICAgcGVlck9mZmVyLmNvbm5lY3RpbmcoZGF0YS5ub2RlSWQpO1xuICAgICAgICBwZWVyT2ZmZXIuc2V0QW5zd2VyKGRhdGEuc2RwKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGNvbnN0IHNydiA9IG5ldyBodHRwLlNlcnZlcigpO1xuICAgIHRoaXMuaW8gPSBzb2NrZXRpbyhzcnYpO1xuICAgIHNydi5saXN0ZW4obXlQb3J0KTtcblxuICAgIHRoaXMuaW8ub24oXCJjb25uZWN0aW9uXCIsIChzb2NrZXQ6IGFueSkgPT4ge1xuICAgICAgc29ja2V0Lm9uKGRlZi5PRkZFUiwgKGRhdGE6IGFueSkgPT4ge1xuICAgICAgICB0aGlzLmFuc3dlckZpcnN0KGRhdGEsIHNvY2tldC5pZCk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgICB0aGlzLmV2ID0gbmV3IGV2ZW50cy5FdmVudEVtaXR0ZXIoKTtcbiAgICB0aGlzLmthZCA9IG5ldyBLYWRlbWxpYSh0aGlzLm5vZGVJZCk7XG4gIH1cblxuICBvZmZlckZpcnN0KHNvY2tldDogYW55KSB7XG4gICAgY29uc29sZS5sb2coXCJAY2xpXCIsIFwib2ZmZXIgZmlyc3RcIik7XG4gICAgY29uc3QgcGVlciA9IG5ldyBXZWJSVEMoKTtcbiAgICBwZWVyLm1ha2VPZmZlcigpO1xuXG4gICAgcGVlci5zaWduYWwgPSBzZHAgPT4ge1xuICAgICAgc29ja2V0LmVtaXQoZGVmLk9GRkVSLCB7XG4gICAgICAgIHR5cGU6IGRlZi5PRkZFUixcbiAgICAgICAgbm9kZUlkOiB0aGlzLm5vZGVJZCxcbiAgICAgICAgc2RwOiBzZHBcbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICBwZWVyLmNvbm5lY3QgPSAoKSA9PiB7XG4gICAgICBjb25zb2xlLmxvZyhcImZpcnN0IG9mZmVyIGNvbm5lY3RlZFwiKTtcbiAgICAgIHRoaXMua2FkLmFkZGtub2RlKHBlZXIpO1xuICAgIH07XG4gICAgcGVlck9mZmVyID0gcGVlcjtcbiAgfVxuXG4gIGFuc3dlckZpcnN0KGRhdGE6IGFueSwgc29ja2V0SWQ6IHN0cmluZykge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjb25zdCBwZWVyID0gbmV3IFdlYlJUQygpO1xuICAgICAgcGVlci5tYWtlQW5zd2VyKGRhdGEuc2RwKTtcbiAgICAgIHBlZXIuY29ubmVjdGluZyhkYXRhLm5vZGVJZCk7XG5cbiAgICAgIGNvbnN0IHRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgcmVqZWN0KFwidGltZW91dFwiKTtcbiAgICAgIH0sIDMgKiAxMDAwKTtcblxuICAgICAgcGVlci5zaWduYWwgPSBzZHAgPT4ge1xuICAgICAgICB0aGlzLmlvLnNvY2tldHMuc29ja2V0c1tzb2NrZXRJZF0uZW1pdChkZWYuQU5TV0VSLCB7XG4gICAgICAgICAgc2RwOiBzZHAsXG4gICAgICAgICAgbm9kZUlkOiB0aGlzLm5vZGVJZFxuICAgICAgICB9KTtcbiAgICAgIH07XG5cbiAgICAgIHBlZXIuY29ubmVjdCA9ICgpID0+IHtcbiAgICAgICAgY29uc29sZS5sb2coXCJmaXJzdCBhbnN3ZXIgY29ubmVjdGVkXCIpO1xuICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dCk7XG4gICAgICAgIHJlc29sdmUodHJ1ZSk7XG4gICAgICAgIHRoaXMua2FkLmFkZGtub2RlKHBlZXIpO1xuICAgICAgfTtcbiAgICB9KTtcbiAgfVxufVxuIl19
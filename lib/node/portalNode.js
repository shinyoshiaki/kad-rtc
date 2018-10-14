"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _webrtc4me = _interopRequireDefault(require("webrtc4me"));

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
        peerOffer.setAnswer(data.sdp, data.nodeId);
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
        console.log("first offer connected", peer.nodeId);

        _this2.kad.addknode(peer);
      };

      peerOffer = peer;
    }
  }, {
    key: "answerFirst",
    value: function answerFirst(data, socketId) {
      var _this3 = this;

      return new Promise(function (resolve, reject) {
        var peer = new _webrtc4me.default();
        console.log("answer first", data);
        peer.makeAnswer(data.sdp, data.nodeId);
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
          peer.nodeId = data.nodeId; //謎のバグ

          console.log("first answer connected", peer.nodeId);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ub2RlL3BvcnRhbE5vZGUudHMiXSwibmFtZXMiOlsiZGVmIiwiT0ZGRVIiLCJBTlNXRVIiLCJPTkNPTU1BTkQiLCJwZWVyT2ZmZXIiLCJQb3J0YWxOb2RlIiwibXlQb3J0IiwidGFyZ2V0Iiwibm9kZUlkIiwiTWF0aCIsInJhbmRvbSIsInRvU3RyaW5nIiwiY29uc29sZSIsImxvZyIsInRhcmdldFVybCIsImFkZHJlc3MiLCJwb3J0Iiwic29ja2V0IiwiY2xpZW50IiwiY29ubmVjdCIsIm9uIiwib2ZmZXJGaXJzdCIsImRhdGEiLCJzZXRBbnN3ZXIiLCJzZHAiLCJzcnYiLCJodHRwIiwiU2VydmVyIiwiaW8iLCJsaXN0ZW4iLCJhbnN3ZXJGaXJzdCIsImlkIiwiZXYiLCJldmVudHMiLCJFdmVudEVtaXR0ZXIiLCJrYWQiLCJLYWRlbWxpYSIsInBlZXIiLCJXZWJSVEMiLCJtYWtlT2ZmZXIiLCJzaWduYWwiLCJlbWl0IiwidHlwZSIsImFkZGtub2RlIiwic29ja2V0SWQiLCJQcm9taXNlIiwicmVzb2x2ZSIsInJlamVjdCIsIm1ha2VBbnN3ZXIiLCJ0aW1lb3V0Iiwic2V0VGltZW91dCIsInNvY2tldHMiLCJjbGVhclRpbWVvdXQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7Ozs7Ozs7O0FBRUEsSUFBTUEsR0FBRyxHQUFHO0FBQ1ZDLEVBQUFBLEtBQUssRUFBRSxPQURHO0FBRVZDLEVBQUFBLE1BQU0sRUFBRSxRQUZFO0FBR1ZDLEVBQUFBLFNBQVMsRUFBRTtBQUhELENBQVo7QUFNQSxJQUFJQyxTQUFKOztJQUVxQkMsVTs7O0FBTW5CLHNCQUFZQyxNQUFaLEVBQTRCQyxNQUE1QixFQUF3RTtBQUFBOztBQUFBOztBQUFBOztBQUFBOztBQUFBOztBQUFBOztBQUN0RSxTQUFLQyxNQUFMLEdBQWMsa0JBQUtDLElBQUksQ0FBQ0MsTUFBTCxHQUFjQyxRQUFkLEVBQUws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QUFHQyxVQUFVLENBQUMsWUFBTTtBQUMvQkgsVUFBQUEsTUFBTSxDQUFDLFNBQUQsQ0FBTjtBQUNELFNBRnlCLEVBRXZCLElBQUksSUFGbUIsQ0FBMUI7O0FBSUFWLFFBQUFBLElBQUksQ0FBQ0csTUFBTCxHQUFjLFVBQUFoQixHQUFHLEVBQUk7QUFDbkIsVUFBQSxNQUFJLENBQUNJLEVBQUwsQ0FBUXVCLE9BQVIsQ0FBZ0JBLE9BQWhCLENBQXdCUCxRQUF4QixFQUFrQ0gsSUFBbEMsQ0FBdUN6QyxHQUFHLENBQUNFLE1BQTNDLEVBQW1EO0FBQ2pEc0IsWUFBQUEsR0FBRyxFQUFFQSxHQUQ0QztBQUVqRGhCLFlBQUFBLE1BQU0sRUFBRSxNQUFJLENBQUNBO0FBRm9DLFdBQW5EO0FBSUQsU0FMRDs7QUFPQTZCLFFBQUFBLElBQUksQ0FBQ2xCLE9BQUwsR0FBZSxZQUFNO0FBQ25Ca0IsVUFBQUEsSUFBSSxDQUFDN0IsTUFBTCxHQUFjYyxJQUFJLENBQUNkLE1BQW5CLENBRG1CLENBQ087O0FBQzFCSSxVQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWSx3QkFBWixFQUFzQ3dCLElBQUksQ0FBQzdCLE1BQTNDO0FBQ0E0QyxVQUFBQSxZQUFZLENBQUNILE9BQUQsQ0FBWjtBQUNBSCxVQUFBQSxPQUFPLENBQUMsSUFBRCxDQUFQOztBQUNBLFVBQUEsTUFBSSxDQUFDWCxHQUFMLENBQVNRLFFBQVQsQ0FBa0JOLElBQWxCO0FBQ0QsU0FORDtBQU9ELE9BdkJNLENBQVA7QUF3QkQiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgV2ViUlRDIGZyb20gXCJ3ZWJydGM0bWVcIjtcbmltcG9ydCBodHRwIGZyb20gXCJodHRwXCI7XG5pbXBvcnQgc29ja2V0aW8gZnJvbSBcInNvY2tldC5pb1wiO1xuaW1wb3J0IGNsaWVudCBmcm9tIFwic29ja2V0LmlvLWNsaWVudFwiO1xuaW1wb3J0IHNoYTEgZnJvbSBcInNoYTFcIjtcbmltcG9ydCBldmVudHMgZnJvbSBcImV2ZW50c1wiO1xuaW1wb3J0IEthZGVtbGlhIGZyb20gXCIuLi9rYWQva2FkZW1saWFcIjtcblxuY29uc3QgZGVmID0ge1xuICBPRkZFUjogXCJPRkZFUlwiLFxuICBBTlNXRVI6IFwiQU5TV0VSXCIsXG4gIE9OQ09NTUFORDogXCJPTkNPTU1BTkRcIlxufTtcblxubGV0IHBlZXJPZmZlcjogV2ViUlRDO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQb3J0YWxOb2RlIHtcbiAgbm9kZUlkOiBzdHJpbmc7XG4gIGV2OiBldmVudHMuRXZlbnRFbWl0dGVyO1xuICBpbzogYW55O1xuICBrYWQ6IEthZGVtbGlhO1xuXG4gIGNvbnN0cnVjdG9yKG15UG9ydDogbnVtYmVyLCB0YXJnZXQ/OiB7IGFkZHJlc3M6IHN0cmluZzsgcG9ydDogc3RyaW5nIH0pIHtcbiAgICB0aGlzLm5vZGVJZCA9IHNoYTEoTWF0aC5yYW5kb20oKS50b1N0cmluZygpKS50b1N0cmluZygpO1xuICAgIGNvbnNvbGUubG9nKFwibm9kZWlkXCIsIHRoaXMubm9kZUlkKTtcbiAgICBpZiAodGFyZ2V0KSB7XG4gICAgICBjb25zdCB0YXJnZXRVcmwgPSBcImh0dHA6Ly9cIiArIHRhcmdldC5hZGRyZXNzICsgXCI6XCIgKyB0YXJnZXQucG9ydDtcbiAgICAgIGNvbnN0IHNvY2tldCA9IGNsaWVudC5jb25uZWN0KHRhcmdldFVybCk7XG4gICAgICBzb2NrZXQub24oXCJjb25uZWN0XCIsICgpID0+IHtcbiAgICAgICAgdGhpcy5vZmZlckZpcnN0KHNvY2tldCk7XG4gICAgICB9KTtcbiAgICAgIHNvY2tldC5vbihkZWYuQU5TV0VSLCAoZGF0YTogYW55KSA9PiB7XG4gICAgICAgIHBlZXJPZmZlci5zZXRBbnN3ZXIoZGF0YS5zZHAsIGRhdGEubm9kZUlkKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGNvbnN0IHNydiA9IG5ldyBodHRwLlNlcnZlcigpO1xuICAgIHRoaXMuaW8gPSBzb2NrZXRpbyhzcnYpO1xuICAgIHNydi5saXN0ZW4obXlQb3J0KTtcblxuICAgIHRoaXMuaW8ub24oXCJjb25uZWN0aW9uXCIsIChzb2NrZXQ6IGFueSkgPT4ge1xuICAgICAgc29ja2V0Lm9uKGRlZi5PRkZFUiwgKGRhdGE6IGFueSkgPT4ge1xuICAgICAgICB0aGlzLmFuc3dlckZpcnN0KGRhdGEsIHNvY2tldC5pZCk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgICB0aGlzLmV2ID0gbmV3IGV2ZW50cy5FdmVudEVtaXR0ZXIoKTtcbiAgICB0aGlzLmthZCA9IG5ldyBLYWRlbWxpYSh0aGlzLm5vZGVJZCk7XG4gIH1cblxuICBvZmZlckZpcnN0KHNvY2tldDogYW55KSB7XG4gICAgY29uc29sZS5sb2coXCJAY2xpXCIsIFwib2ZmZXIgZmlyc3RcIik7XG4gICAgY29uc3QgcGVlciA9IG5ldyBXZWJSVEMoKTtcbiAgICBwZWVyLm1ha2VPZmZlcigpO1xuXG4gICAgcGVlci5zaWduYWwgPSBzZHAgPT4ge1xuICAgICAgc29ja2V0LmVtaXQoZGVmLk9GRkVSLCB7XG4gICAgICAgIHR5cGU6IGRlZi5PRkZFUixcbiAgICAgICAgbm9kZUlkOiB0aGlzLm5vZGVJZCxcbiAgICAgICAgc2RwOiBzZHBcbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICBwZWVyLmNvbm5lY3QgPSAoKSA9PiB7XG4gICAgICBjb25zb2xlLmxvZyhcImZpcnN0IG9mZmVyIGNvbm5lY3RlZFwiLCBwZWVyLm5vZGVJZCk7XG4gICAgICB0aGlzLmthZC5hZGRrbm9kZShwZWVyKTtcbiAgICB9O1xuICAgIHBlZXJPZmZlciA9IHBlZXI7XG4gIH1cblxuICBhbnN3ZXJGaXJzdChkYXRhOiBhbnksIHNvY2tldElkOiBzdHJpbmcpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY29uc3QgcGVlciA9IG5ldyBXZWJSVEMoKTtcbiAgICAgIGNvbnNvbGUubG9nKFwiYW5zd2VyIGZpcnN0XCIsIGRhdGEpO1xuICAgICAgcGVlci5tYWtlQW5zd2VyKGRhdGEuc2RwLCBkYXRhLm5vZGVJZCk7XG5cbiAgICAgIGNvbnN0IHRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgcmVqZWN0KFwidGltZW91dFwiKTtcbiAgICAgIH0sIDMgKiAxMDAwKTtcblxuICAgICAgcGVlci5zaWduYWwgPSBzZHAgPT4ge1xuICAgICAgICB0aGlzLmlvLnNvY2tldHMuc29ja2V0c1tzb2NrZXRJZF0uZW1pdChkZWYuQU5TV0VSLCB7XG4gICAgICAgICAgc2RwOiBzZHAsXG4gICAgICAgICAgbm9kZUlkOiB0aGlzLm5vZGVJZFxuICAgICAgICB9KTtcbiAgICAgIH07XG5cbiAgICAgIHBlZXIuY29ubmVjdCA9ICgpID0+IHtcbiAgICAgICAgcGVlci5ub2RlSWQgPSBkYXRhLm5vZGVJZDsvL+isjuOBruODkOOCsFxuICAgICAgICBjb25zb2xlLmxvZyhcImZpcnN0IGFuc3dlciBjb25uZWN0ZWRcIiwgcGVlci5ub2RlSWQpO1xuICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dCk7XG4gICAgICAgIHJlc29sdmUodHJ1ZSk7XG4gICAgICAgIHRoaXMua2FkLmFkZGtub2RlKHBlZXIpO1xuICAgICAgfTtcbiAgICB9KTtcbiAgfVxufVxuIl19
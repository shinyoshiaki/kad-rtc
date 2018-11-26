"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _webrtc4me = _interopRequireDefault(require("webrtc4me"));

var _http = _interopRequireDefault(require("http"));

var _socket = _interopRequireDefault(require("socket.io"));

var _socket2 = _interopRequireDefault(require("socket.io-client"));

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

var PortalNode =
/*#__PURE__*/
function () {
  function PortalNode(myPort, target) {
    var _this = this;

    _classCallCheck(this, PortalNode);

    _defineProperty(this, "io", void 0);

    _defineProperty(this, "kad", void 0);

    _defineProperty(this, "peerOffer", void 0);

    if (target) {
      var targetUrl = "http://" + target.address + ":" + target.port;

      var socket = _socket2.default.connect(targetUrl);

      socket.on("connect", function () {
        _this.offerFirst(socket);
      });
      socket.on(def.ANSWER, function (data) {
        if (_this.peerOffer) _this.peerOffer.setAnswer(data.sdp, data.nodeId);
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
    this.kad = new _kademlia.default({
      kLength: 20
    });
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
          nodeId: _this2.kad.nodeId,
          sdp: sdp
        });
      };

      peer.connect = function () {
        console.log("first offer connected", peer.nodeId);

        _this2.kad.connect(peer);
      };

      this.peerOffer = peer;
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
            nodeId: _this3.kad.nodeId
          });
        };

        peer.connect = function () {
          peer.nodeId = data.nodeId; //謎のバグ

          console.log("first answer connected", peer.nodeId);
          clearTimeout(timeout);
          resolve(true);

          _this3.kad.connect(peer);
        };
      });
    }
  }]);

  return PortalNode;
}();

exports.default = PortalNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ub2RlL3BvcnRhbE5vZGUudHMiXSwibmFtZXMiOlsiZGVmIiwiUG9ydGFsTm9kZSIsIm15UG9ydCIsInRhcmdldCIsInRhcmdldFVybCIsImFkZHJlc3MiLCJwb3J0Iiwic29ja2V0IiwiY2xpZW50IiwiY29ubmVjdCIsIm9uIiwib2ZmZXJGaXJzdCIsIkFOU1dFUiIsImRhdGEiLCJwZWVyT2ZmZXIiLCJzZXRBbnN3ZXIiLCJzZHAiLCJub2RlSWQiLCJzcnYiLCJodHRwIiwiU2VydmVyIiwiaW8iLCJsaXN0ZW4iLCJPRkZFUiIsImFuc3dlckZpcnN0IiwiaWQiLCJrYWQiLCJLYWRlbWxpYSIsImtMZW5ndGgiLCJjb25zb2xlIiwibG9nIiwicGVlciIsIldlYlJUQyIsIm1ha2VPZmZlciIsInNpZ25hbCIsImVtaXQiLCJ0eXBlIiwic29ja2V0SWQiLCJQcm9taXNlIiwicmVzb2x2ZSIsInJlamVjdCIsIm1ha2VBbnN3ZXIiLCJ0aW1lb3V0Iiwic2V0VGltZW91dCIsInNvY2tldHMiLCJjbGVhclRpbWVvdXQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7Ozs7Ozs7O0lBRUtBLEc7O1dBQUFBLEc7QUFBQUEsRUFBQUEsRztBQUFBQSxFQUFBQSxHO0FBQUFBLEVBQUFBLEc7R0FBQUEsRyxLQUFBQSxHOztJQU1nQkMsVTs7O0FBS25CLHNCQUFZQyxNQUFaLEVBQTRCQyxNQUE1QixFQUF3RTtBQUFBOztBQUFBOztBQUFBOztBQUFBOztBQUFBOztBQUN0RSxRQUFJQSxNQUFKLEVBQVk7QUFDVixVQUFNQyxTQUFTLEdBQUcsWUFBWUQsTUFBTSxDQUFDRSxPQUFuQixHQUE2QixHQUE3QixHQUFtQ0YsTUFBTSxDQUFDRyxJQUE1RDs7QUFDQSxVQUFNQyxNQUFNLEdBQUdDLGlCQUFPQyxPQUFQLENBQWVMLFNBQWYsQ0FBZjs7QUFDQUcsTUFBQUEsTUFBTSxDQUFDRyxFQUFQLENBQVUsU0FBVixFQUFx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LFlBQUFBLEdBQUcsRUFBRUEsR0FENEM7QUFFakRDLFlBQUFBLE1BQU0sRUFBRSxNQUFJLENBQUNTLEdBQUwsQ0FBU1Q7QUFGZ0MsV0FBbkQ7QUFJRCxTQUxEOztBQU9BYyxRQUFBQSxJQUFJLENBQUN0QixPQUFMLEdBQWUsWUFBTTtBQUNuQnNCLFVBQUFBLElBQUksQ0FBQ2QsTUFBTCxHQUFjSixJQUFJLENBQUNJLE1BQW5CLENBRG1CLENBQ1E7O0FBQzNCWSxVQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWSx3QkFBWixFQUFzQ0MsSUFBSSxDQUFDZCxNQUEzQztBQUNBNEIsVUFBQUEsWUFBWSxDQUFDSCxPQUFELENBQVo7QUFDQUgsVUFBQUEsT0FBTyxDQUFDLElBQUQsQ0FBUDs7QUFDQSxVQUFBLE1BQUksQ0FBQ2IsR0FBTCxDQUFTakIsT0FBVCxDQUFpQnNCLElBQWpCO0FBQ0QsU0FORDtBQU9ELE9BdkJNLENBQVA7QUF3QkQiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgV2ViUlRDIGZyb20gXCJ3ZWJydGM0bWVcIjtcbmltcG9ydCBodHRwIGZyb20gXCJodHRwXCI7XG5pbXBvcnQgc29ja2V0aW8gZnJvbSBcInNvY2tldC5pb1wiO1xuaW1wb3J0IGNsaWVudCBmcm9tIFwic29ja2V0LmlvLWNsaWVudFwiO1xuaW1wb3J0IEthZGVtbGlhIGZyb20gXCIuLi9rYWQva2FkZW1saWFcIjtcblxuZW51bSBkZWYge1xuICBPRkZFUiA9IFwiT0ZGRVJcIixcbiAgQU5TV0VSID0gXCJBTlNXRVJcIixcbiAgT05DT01NQU5EID0gXCJPTkNPTU1BTkRcIlxufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQb3J0YWxOb2RlIHtcbiAgaW86IGFueTtcbiAga2FkOiBLYWRlbWxpYTtcbiAgcGVlck9mZmVyOiBXZWJSVEMgfCB1bmRlZmluZWQ7XG5cbiAgY29uc3RydWN0b3IobXlQb3J0OiBudW1iZXIsIHRhcmdldD86IHsgYWRkcmVzczogc3RyaW5nOyBwb3J0OiBzdHJpbmcgfSkge1xuICAgIGlmICh0YXJnZXQpIHtcbiAgICAgIGNvbnN0IHRhcmdldFVybCA9IFwiaHR0cDovL1wiICsgdGFyZ2V0LmFkZHJlc3MgKyBcIjpcIiArIHRhcmdldC5wb3J0O1xuICAgICAgY29uc3Qgc29ja2V0ID0gY2xpZW50LmNvbm5lY3QodGFyZ2V0VXJsKTtcbiAgICAgIHNvY2tldC5vbihcImNvbm5lY3RcIiwgKCkgPT4ge1xuICAgICAgICB0aGlzLm9mZmVyRmlyc3Qoc29ja2V0KTtcbiAgICAgIH0pO1xuICAgICAgc29ja2V0Lm9uKGRlZi5BTlNXRVIsIChkYXRhOiBhbnkpID0+IHtcbiAgICAgICAgaWYgKHRoaXMucGVlck9mZmVyKSB0aGlzLnBlZXJPZmZlci5zZXRBbnN3ZXIoZGF0YS5zZHAsIGRhdGEubm9kZUlkKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGNvbnN0IHNydiA9IG5ldyBodHRwLlNlcnZlcigpO1xuICAgIHRoaXMuaW8gPSBzb2NrZXRpbyhzcnYpO1xuICAgIHNydi5saXN0ZW4obXlQb3J0KTtcblxuICAgIHRoaXMuaW8ub24oXCJjb25uZWN0aW9uXCIsIChzb2NrZXQ6IGFueSkgPT4ge1xuICAgICAgc29ja2V0Lm9uKGRlZi5PRkZFUiwgKGRhdGE6IGFueSkgPT4ge1xuICAgICAgICB0aGlzLmFuc3dlckZpcnN0KGRhdGEsIHNvY2tldC5pZCk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgICB0aGlzLmthZCA9IG5ldyBLYWRlbWxpYSh7IGtMZW5ndGg6IDIwIH0pO1xuICB9XG5cbiAgb2ZmZXJGaXJzdChzb2NrZXQ6IGFueSkge1xuICAgIGNvbnNvbGUubG9nKFwiQGNsaVwiLCBcIm9mZmVyIGZpcnN0XCIpO1xuICAgIGNvbnN0IHBlZXIgPSBuZXcgV2ViUlRDKCk7XG4gICAgcGVlci5tYWtlT2ZmZXIoKTtcblxuICAgIHBlZXIuc2lnbmFsID0gc2RwID0+IHtcbiAgICAgIHNvY2tldC5lbWl0KGRlZi5PRkZFUiwge1xuICAgICAgICB0eXBlOiBkZWYuT0ZGRVIsXG4gICAgICAgIG5vZGVJZDogdGhpcy5rYWQubm9kZUlkLFxuICAgICAgICBzZHA6IHNkcFxuICAgICAgfSk7XG4gICAgfTtcblxuICAgIHBlZXIuY29ubmVjdCA9ICgpID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKFwiZmlyc3Qgb2ZmZXIgY29ubmVjdGVkXCIsIHBlZXIubm9kZUlkKTtcbiAgICAgIHRoaXMua2FkLmNvbm5lY3QocGVlcik7XG4gICAgfTtcbiAgICB0aGlzLnBlZXJPZmZlciA9IHBlZXI7XG4gIH1cblxuICBhbnN3ZXJGaXJzdChkYXRhOiBhbnksIHNvY2tldElkOiBzdHJpbmcpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY29uc3QgcGVlciA9IG5ldyBXZWJSVEMoKTtcbiAgICAgIGNvbnNvbGUubG9nKFwiYW5zd2VyIGZpcnN0XCIsIGRhdGEpO1xuICAgICAgcGVlci5tYWtlQW5zd2VyKGRhdGEuc2RwLCBkYXRhLm5vZGVJZCk7XG5cbiAgICAgIGNvbnN0IHRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgcmVqZWN0KFwidGltZW91dFwiKTtcbiAgICAgIH0sIDMgKiAxMDAwKTtcblxuICAgICAgcGVlci5zaWduYWwgPSBzZHAgPT4ge1xuICAgICAgICB0aGlzLmlvLnNvY2tldHMuc29ja2V0c1tzb2NrZXRJZF0uZW1pdChkZWYuQU5TV0VSLCB7XG4gICAgICAgICAgc2RwOiBzZHAsXG4gICAgICAgICAgbm9kZUlkOiB0aGlzLmthZC5ub2RlSWRcbiAgICAgICAgfSk7XG4gICAgICB9O1xuXG4gICAgICBwZWVyLmNvbm5lY3QgPSAoKSA9PiB7XG4gICAgICAgIHBlZXIubm9kZUlkID0gZGF0YS5ub2RlSWQ7IC8v6KyO44Gu44OQ44KwXG4gICAgICAgIGNvbnNvbGUubG9nKFwiZmlyc3QgYW5zd2VyIGNvbm5lY3RlZFwiLCBwZWVyLm5vZGVJZCk7XG4gICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KTtcbiAgICAgICAgcmVzb2x2ZSh0cnVlKTtcbiAgICAgICAgdGhpcy5rYWQuY29ubmVjdChwZWVyKTtcbiAgICAgIH07XG4gICAgfSk7XG4gIH1cbn1cbiJdfQ==
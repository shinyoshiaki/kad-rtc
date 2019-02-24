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
        if (_this.peerOffer) {
          _this.peerOffer.connecting(data.nodeId);

          _this.peerOffer.setSdp(data.sdp);
        }
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
        peer.connecting(data.nodeId);
        peer.setSdp(data.sdp);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ub2RlL3BvcnRhbE5vZGUudHMiXSwibmFtZXMiOlsiZGVmIiwiUG9ydGFsTm9kZSIsIm15UG9ydCIsInRhcmdldCIsInRhcmdldFVybCIsImFkZHJlc3MiLCJwb3J0Iiwic29ja2V0IiwiY2xpZW50IiwiY29ubmVjdCIsIm9uIiwib2ZmZXJGaXJzdCIsIkFOU1dFUiIsImRhdGEiLCJwZWVyT2ZmZXIiLCJjb25uZWN0aW5nIiwibm9kZUlkIiwic2V0U2RwIiwic2RwIiwic3J2IiwiaHR0cCIsIlNlcnZlciIsImlvIiwibGlzdGVuIiwiT0ZGRVIiLCJhbnN3ZXJGaXJzdCIsImlkIiwia2FkIiwiS2FkZW1saWEiLCJrTGVuZ3RoIiwiY29uc29sZSIsImxvZyIsInBlZXIiLCJXZWJSVEMiLCJtYWtlT2ZmZXIiLCJzaWduYWwiLCJlbWl0IiwidHlwZSIsInNvY2tldElkIiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZWplY3QiLCJ0aW1lb3V0Iiwic2V0VGltZW91dCIsInNvY2tldHMiLCJjbGVhclRpbWVvdXQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7Ozs7Ozs7O0lBRUtBLEc7O1dBQUFBLEc7QUFBQUEsRUFBQUEsRztBQUFBQSxFQUFBQSxHO0FBQUFBLEVBQUFBLEc7R0FBQUEsRyxLQUFBQSxHOztJQU1nQkMsVTs7O0FBS25CLHNCQUFZQyxNQUFaLEVBQTRCQyxNQUE1QixFQUF3RTtBQUFBOztBQUFBOztBQUFBOztBQUFBOztBQUFBOztBQUN0RSxRQUFJQSxNQUFKLEVBQVk7QUFDVixVQUFNQyxTQUFTLEdBQUcsWUFBWUQsTUFBTSxDQUFDRSxPQUFuQixHQUE2QixHQUE3QixHQUFtQ0YsTUFBTSxDQUFDRyxJQUE1RDs7QUFDQSxVQUFNQyxNQUFNLEdBQUdDLGlCQUFPQyxPQUFQLENBQWVMLFNBQWYsQ0FBZjs7QUFDQUcsTUFBQUEsTUFBTSxDQUFDRyxFQUFQLENBQVUsU0FBVixFQUFxQixZ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QVIsQ0FBZ0JBLE9BQWhCLENBQXdCTixRQUF4QixFQUFrQ0YsSUFBbEMsQ0FBdUNwQyxHQUFHLENBQUNZLE1BQTNDLEVBQW1EO0FBQ2pETSxZQUFBQSxHQUFHLEVBQUVBLEdBRDRDO0FBRWpERixZQUFBQSxNQUFNLEVBQUUsTUFBSSxDQUFDVyxHQUFMLENBQVNYO0FBRmdDLFdBQW5EO0FBSUQsU0FMRDs7QUFPQWdCLFFBQUFBLElBQUksQ0FBQ3ZCLE9BQUwsR0FBZSxZQUFNO0FBQ25CdUIsVUFBQUEsSUFBSSxDQUFDaEIsTUFBTCxHQUFjSCxJQUFJLENBQUNHLE1BQW5CLENBRG1CLENBQ1E7O0FBQzNCYyxVQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWSx3QkFBWixFQUFzQ0MsSUFBSSxDQUFDaEIsTUFBM0M7QUFDQTZCLFVBQUFBLFlBQVksQ0FBQ0gsT0FBRCxDQUFaO0FBQ0FGLFVBQUFBLE9BQU8sQ0FBQyxJQUFELENBQVA7O0FBQ0EsVUFBQSxNQUFJLENBQUNiLEdBQUwsQ0FBU2xCLE9BQVQsQ0FBaUJ1QixJQUFqQjtBQUNELFNBTkQ7QUFPRCxPQXhCTSxDQUFQO0FBeUJEIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFdlYlJUQyBmcm9tIFwid2VicnRjNG1lXCI7XG5pbXBvcnQgaHR0cCBmcm9tIFwiaHR0cFwiO1xuaW1wb3J0IHNvY2tldGlvIGZyb20gXCJzb2NrZXQuaW9cIjtcbmltcG9ydCBjbGllbnQgZnJvbSBcInNvY2tldC5pby1jbGllbnRcIjtcbmltcG9ydCBLYWRlbWxpYSBmcm9tIFwiLi4va2FkL2thZGVtbGlhXCI7XG5cbmVudW0gZGVmIHtcbiAgT0ZGRVIgPSBcIk9GRkVSXCIsXG4gIEFOU1dFUiA9IFwiQU5TV0VSXCIsXG4gIE9OQ09NTUFORCA9IFwiT05DT01NQU5EXCJcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUG9ydGFsTm9kZSB7XG4gIGlvOiBhbnk7XG4gIGthZDogS2FkZW1saWE7XG4gIHBlZXJPZmZlcjogV2ViUlRDIHwgdW5kZWZpbmVkO1xuXG4gIGNvbnN0cnVjdG9yKG15UG9ydDogbnVtYmVyLCB0YXJnZXQ/OiB7IGFkZHJlc3M6IHN0cmluZzsgcG9ydDogc3RyaW5nIH0pIHtcbiAgICBpZiAodGFyZ2V0KSB7XG4gICAgICBjb25zdCB0YXJnZXRVcmwgPSBcImh0dHA6Ly9cIiArIHRhcmdldC5hZGRyZXNzICsgXCI6XCIgKyB0YXJnZXQucG9ydDtcbiAgICAgIGNvbnN0IHNvY2tldCA9IGNsaWVudC5jb25uZWN0KHRhcmdldFVybCk7XG4gICAgICBzb2NrZXQub24oXCJjb25uZWN0XCIsICgpID0+IHtcbiAgICAgICAgdGhpcy5vZmZlckZpcnN0KHNvY2tldCk7XG4gICAgICB9KTtcbiAgICAgIHNvY2tldC5vbihkZWYuQU5TV0VSLCAoZGF0YTogYW55KSA9PiB7XG4gICAgICAgIGlmICh0aGlzLnBlZXJPZmZlcikge1xuICAgICAgICAgIHRoaXMucGVlck9mZmVyLmNvbm5lY3RpbmcoZGF0YS5ub2RlSWQpO1xuICAgICAgICAgIHRoaXMucGVlck9mZmVyLnNldFNkcChkYXRhLnNkcCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGNvbnN0IHNydiA9IG5ldyBodHRwLlNlcnZlcigpO1xuICAgIHRoaXMuaW8gPSBzb2NrZXRpbyhzcnYpO1xuICAgIHNydi5saXN0ZW4obXlQb3J0KTtcblxuICAgIHRoaXMuaW8ub24oXCJjb25uZWN0aW9uXCIsIChzb2NrZXQ6IGFueSkgPT4ge1xuICAgICAgc29ja2V0Lm9uKGRlZi5PRkZFUiwgKGRhdGE6IGFueSkgPT4ge1xuICAgICAgICB0aGlzLmFuc3dlckZpcnN0KGRhdGEsIHNvY2tldC5pZCk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgICB0aGlzLmthZCA9IG5ldyBLYWRlbWxpYSh7IGtMZW5ndGg6IDIwIH0pO1xuICB9XG5cbiAgb2ZmZXJGaXJzdChzb2NrZXQ6IGFueSkge1xuICAgIGNvbnNvbGUubG9nKFwiQGNsaVwiLCBcIm9mZmVyIGZpcnN0XCIpO1xuICAgIGNvbnN0IHBlZXIgPSBuZXcgV2ViUlRDKCk7XG4gICAgcGVlci5tYWtlT2ZmZXIoKTtcblxuICAgIHBlZXIuc2lnbmFsID0gc2RwID0+IHtcbiAgICAgIHNvY2tldC5lbWl0KGRlZi5PRkZFUiwge1xuICAgICAgICB0eXBlOiBkZWYuT0ZGRVIsXG4gICAgICAgIG5vZGVJZDogdGhpcy5rYWQubm9kZUlkLFxuICAgICAgICBzZHA6IHNkcFxuICAgICAgfSk7XG4gICAgfTtcblxuICAgIHBlZXIuY29ubmVjdCA9ICgpID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKFwiZmlyc3Qgb2ZmZXIgY29ubmVjdGVkXCIsIHBlZXIubm9kZUlkKTtcbiAgICAgIHRoaXMua2FkLmNvbm5lY3QocGVlcik7XG4gICAgfTtcbiAgICB0aGlzLnBlZXJPZmZlciA9IHBlZXI7XG4gIH1cblxuICBhbnN3ZXJGaXJzdChkYXRhOiBhbnksIHNvY2tldElkOiBzdHJpbmcpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY29uc3QgcGVlciA9IG5ldyBXZWJSVEMoKTtcbiAgICAgIGNvbnNvbGUubG9nKFwiYW5zd2VyIGZpcnN0XCIsIGRhdGEpO1xuICAgICAgcGVlci5jb25uZWN0aW5nKGRhdGEubm9kZUlkKTtcbiAgICAgIHBlZXIuc2V0U2RwKGRhdGEuc2RwKTtcblxuICAgICAgY29uc3QgdGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICByZWplY3QoXCJ0aW1lb3V0XCIpO1xuICAgICAgfSwgMyAqIDEwMDApO1xuXG4gICAgICBwZWVyLnNpZ25hbCA9IHNkcCA9PiB7XG4gICAgICAgIHRoaXMuaW8uc29ja2V0cy5zb2NrZXRzW3NvY2tldElkXS5lbWl0KGRlZi5BTlNXRVIsIHtcbiAgICAgICAgICBzZHA6IHNkcCxcbiAgICAgICAgICBub2RlSWQ6IHRoaXMua2FkLm5vZGVJZFxuICAgICAgICB9KTtcbiAgICAgIH07XG5cbiAgICAgIHBlZXIuY29ubmVjdCA9ICgpID0+IHtcbiAgICAgICAgcGVlci5ub2RlSWQgPSBkYXRhLm5vZGVJZDsgLy/orI7jga7jg5DjgrBcbiAgICAgICAgY29uc29sZS5sb2coXCJmaXJzdCBhbnN3ZXIgY29ubmVjdGVkXCIsIHBlZXIubm9kZUlkKTtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xuICAgICAgICByZXNvbHZlKHRydWUpO1xuICAgICAgICB0aGlzLmthZC5jb25uZWN0KHBlZXIpO1xuICAgICAgfTtcbiAgICB9KTtcbiAgfVxufVxuIl19
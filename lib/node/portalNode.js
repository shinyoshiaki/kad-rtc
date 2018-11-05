"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _webrtc4me = _interopRequireDefault(require("webrtc4me"));

var _http = _interopRequireDefault(require("http"));

var _socket = _interopRequireDefault(require("socket.io"));

var _socket2 = _interopRequireDefault(require("socket.io-client"));

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

    _defineProperty(this, "ev", void 0);

    _defineProperty(this, "io", void 0);

    _defineProperty(this, "kad", void 0);

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ub2RlL3BvcnRhbE5vZGUudHMiXSwibmFtZXMiOlsiZGVmIiwiT0ZGRVIiLCJBTlNXRVIiLCJPTkNPTU1BTkQiLCJwZWVyT2ZmZXIiLCJQb3J0YWxOb2RlIiwibXlQb3J0IiwidGFyZ2V0IiwidGFyZ2V0VXJsIiwiYWRkcmVzcyIsInBvcnQiLCJzb2NrZXQiLCJjbGllbnQiLCJjb25uZWN0Iiwib24iLCJvZmZlckZpcnN0IiwiZGF0YSIsInNldEFuc3dlciIsInNkcCIsIm5vZGVJZCIsInNydiIsImh0dHAiLCJTZXJ2ZXIiLCJpbyIsImxpc3RlbiIsImFuc3dlckZpcnN0IiwiaWQiLCJldiIsImV2ZW50cyIsIkV2ZW50RW1pdHRlciIsImthZCIsIkthZGVtbGlhIiwia0xlbmd0aCIsImNvbnNvbGUiLCJsb2ciLCJwZWVyIiwiV2ViUlRDIiwibWFrZU9mZmVyIiwic2lnbmFsIiwiZW1pdCIsInR5cGUiLCJzb2NrZXRJZCIsIlByb21pc2UiLCJyZXNvbHZlIiwicmVqZWN0IiwibWFrZUFuc3dlciIsInRpbWVvdXQiLCJzZXRUaW1lb3V0Iiwic29ja2V0cyIsImNsZWFyVGltZW91dCJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7Ozs7Ozs7QUFFQSxJQUFNQSxHQUFHLEdBQUc7QUFDVkMsRUFBQUEsS0FBSyxFQUFFLE9BREc7QUFFVkMsRUFBQUEsTUFBTSxFQUFFLFFBRkU7QUFHVkMsRUFBQUEsU0FBUyxFQUFFO0FBSEQsQ0FBWjtBQU1BLElBQUlDLFNBQUo7O0lBRXFCQyxVOzs7QUFLbkIsc0JBQVlDLE1BQVosRUFBNEJDLE1BQTVCLEVBQXdFO0FBQUE7O0FBQUE7O0FBQUE7O0FBQUE7O0FBQUE7O0FBQ3RFLFFBQUlBLE1BQUosRUFBWTtBQUNWLFVBQU1DLFNBQVMsR0FBRyxZQUFZRCxNQUFNLENBQUNFLE9BQW5CLEdBQTZCLEdBQTdCLEdBQW1DRixNQUFNLENBQUNHLElBQTVE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QSxNQUFJLENBQUNLLEVBQUwsQ0FBUXlCLE9BQVIsQ0FBZ0JBLE9BQWhCLENBQXdCUCxRQUF4QixFQUFrQ0YsSUFBbEMsQ0FBdUN2QyxHQUFHLENBQUNFLE1BQTNDLEVBQW1EO0FBQ2pEZ0IsWUFBQUEsR0FBRyxFQUFFQSxHQUQ0QztBQUVqREMsWUFBQUEsTUFBTSxFQUFFLE1BQUksQ0FBQ1csR0FBTCxDQUFTWDtBQUZnQyxXQUFuRDtBQUlELFNBTEQ7O0FBT0FnQixRQUFBQSxJQUFJLENBQUN0QixPQUFMLEdBQWUsWUFBTTtBQUNuQnNCLFVBQUFBLElBQUksQ0FBQ2hCLE1BQUwsR0FBY0gsSUFBSSxDQUFDRyxNQUFuQixDQURtQixDQUNROztBQUMzQmMsVUFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVksd0JBQVosRUFBc0NDLElBQUksQ0FBQ2hCLE1BQTNDO0FBQ0E4QixVQUFBQSxZQUFZLENBQUNILE9BQUQsQ0FBWjtBQUNBSCxVQUFBQSxPQUFPLENBQUMsSUFBRCxDQUFQOztBQUNBLFVBQUEsTUFBSSxDQUFDYixHQUFMLENBQVNqQixPQUFULENBQWlCc0IsSUFBakI7QUFDRCxTQU5EO0FBT0QsT0F2Qk0sQ0FBUDtBQXdCRCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBXZWJSVEMgZnJvbSBcIndlYnJ0YzRtZVwiO1xuaW1wb3J0IGh0dHAgZnJvbSBcImh0dHBcIjtcbmltcG9ydCBzb2NrZXRpbyBmcm9tIFwic29ja2V0LmlvXCI7XG5pbXBvcnQgY2xpZW50IGZyb20gXCJzb2NrZXQuaW8tY2xpZW50XCI7XG5pbXBvcnQgZXZlbnRzIGZyb20gXCJldmVudHNcIjtcbmltcG9ydCBLYWRlbWxpYSBmcm9tIFwiLi4va2FkL2thZGVtbGlhXCI7XG5cbmNvbnN0IGRlZiA9IHtcbiAgT0ZGRVI6IFwiT0ZGRVJcIixcbiAgQU5TV0VSOiBcIkFOU1dFUlwiLFxuICBPTkNPTU1BTkQ6IFwiT05DT01NQU5EXCJcbn07XG5cbmxldCBwZWVyT2ZmZXI6IFdlYlJUQztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUG9ydGFsTm9kZSB7XG4gIGV2OiBldmVudHMuRXZlbnRFbWl0dGVyO1xuICBpbzogYW55O1xuICBrYWQ6IEthZGVtbGlhO1xuXG4gIGNvbnN0cnVjdG9yKG15UG9ydDogbnVtYmVyLCB0YXJnZXQ/OiB7IGFkZHJlc3M6IHN0cmluZzsgcG9ydDogc3RyaW5nIH0pIHtcbiAgICBpZiAodGFyZ2V0KSB7XG4gICAgICBjb25zdCB0YXJnZXRVcmwgPSBcImh0dHA6Ly9cIiArIHRhcmdldC5hZGRyZXNzICsgXCI6XCIgKyB0YXJnZXQucG9ydDtcbiAgICAgIGNvbnN0IHNvY2tldCA9IGNsaWVudC5jb25uZWN0KHRhcmdldFVybCk7XG4gICAgICBzb2NrZXQub24oXCJjb25uZWN0XCIsICgpID0+IHtcbiAgICAgICAgdGhpcy5vZmZlckZpcnN0KHNvY2tldCk7XG4gICAgICB9KTtcbiAgICAgIHNvY2tldC5vbihkZWYuQU5TV0VSLCAoZGF0YTogYW55KSA9PiB7XG4gICAgICAgIHBlZXJPZmZlci5zZXRBbnN3ZXIoZGF0YS5zZHAsIGRhdGEubm9kZUlkKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGNvbnN0IHNydiA9IG5ldyBodHRwLlNlcnZlcigpO1xuICAgIHRoaXMuaW8gPSBzb2NrZXRpbyhzcnYpO1xuICAgIHNydi5saXN0ZW4obXlQb3J0KTtcblxuICAgIHRoaXMuaW8ub24oXCJjb25uZWN0aW9uXCIsIChzb2NrZXQ6IGFueSkgPT4ge1xuICAgICAgc29ja2V0Lm9uKGRlZi5PRkZFUiwgKGRhdGE6IGFueSkgPT4ge1xuICAgICAgICB0aGlzLmFuc3dlckZpcnN0KGRhdGEsIHNvY2tldC5pZCk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgICB0aGlzLmV2ID0gbmV3IGV2ZW50cy5FdmVudEVtaXR0ZXIoKTtcbiAgICB0aGlzLmthZCA9IG5ldyBLYWRlbWxpYSh7IGtMZW5ndGg6IDIwIH0pO1xuICB9XG5cbiAgb2ZmZXJGaXJzdChzb2NrZXQ6IGFueSkge1xuICAgIGNvbnNvbGUubG9nKFwiQGNsaVwiLCBcIm9mZmVyIGZpcnN0XCIpO1xuICAgIGNvbnN0IHBlZXIgPSBuZXcgV2ViUlRDKCk7XG4gICAgcGVlci5tYWtlT2ZmZXIoKTtcblxuICAgIHBlZXIuc2lnbmFsID0gc2RwID0+IHtcbiAgICAgIHNvY2tldC5lbWl0KGRlZi5PRkZFUiwge1xuICAgICAgICB0eXBlOiBkZWYuT0ZGRVIsXG4gICAgICAgIG5vZGVJZDogdGhpcy5rYWQubm9kZUlkLFxuICAgICAgICBzZHA6IHNkcFxuICAgICAgfSk7XG4gICAgfTtcblxuICAgIHBlZXIuY29ubmVjdCA9ICgpID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKFwiZmlyc3Qgb2ZmZXIgY29ubmVjdGVkXCIsIHBlZXIubm9kZUlkKTtcbiAgICAgIHRoaXMua2FkLmNvbm5lY3QocGVlcik7XG4gICAgfTtcbiAgICBwZWVyT2ZmZXIgPSBwZWVyO1xuICB9XG5cbiAgYW5zd2VyRmlyc3QoZGF0YTogYW55LCBzb2NrZXRJZDogc3RyaW5nKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGNvbnN0IHBlZXIgPSBuZXcgV2ViUlRDKCk7XG4gICAgICBjb25zb2xlLmxvZyhcImFuc3dlciBmaXJzdFwiLCBkYXRhKTtcbiAgICAgIHBlZXIubWFrZUFuc3dlcihkYXRhLnNkcCwgZGF0YS5ub2RlSWQpO1xuXG4gICAgICBjb25zdCB0aW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHJlamVjdChcInRpbWVvdXRcIik7XG4gICAgICB9LCAzICogMTAwMCk7XG5cbiAgICAgIHBlZXIuc2lnbmFsID0gc2RwID0+IHtcbiAgICAgICAgdGhpcy5pby5zb2NrZXRzLnNvY2tldHNbc29ja2V0SWRdLmVtaXQoZGVmLkFOU1dFUiwge1xuICAgICAgICAgIHNkcDogc2RwLFxuICAgICAgICAgIG5vZGVJZDogdGhpcy5rYWQubm9kZUlkXG4gICAgICAgIH0pO1xuICAgICAgfTtcblxuICAgICAgcGVlci5jb25uZWN0ID0gKCkgPT4ge1xuICAgICAgICBwZWVyLm5vZGVJZCA9IGRhdGEubm9kZUlkOyAvL+isjuOBruODkOOCsFxuICAgICAgICBjb25zb2xlLmxvZyhcImZpcnN0IGFuc3dlciBjb25uZWN0ZWRcIiwgcGVlci5ub2RlSWQpO1xuICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dCk7XG4gICAgICAgIHJlc29sdmUodHJ1ZSk7XG4gICAgICAgIHRoaXMua2FkLmNvbm5lY3QocGVlcik7XG4gICAgICB9O1xuICAgIH0pO1xuICB9XG59XG4iXX0=
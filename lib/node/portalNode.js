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
    this.kad = new _kademlia.default(this.nodeId, {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ub2RlL3BvcnRhbE5vZGUudHMiXSwibmFtZXMiOlsiZGVmIiwiT0ZGRVIiLCJBTlNXRVIiLCJPTkNPTU1BTkQiLCJwZWVyT2ZmZXIiLCJQb3J0YWxOb2RlIiwibXlQb3J0IiwidGFyZ2V0Iiwibm9kZUlkIiwiTWF0aCIsInJhbmRvbSIsInRvU3RyaW5nIiwiY29uc29sZSIsImxvZyIsInRhcmdldFVybCIsImFkZHJlc3MiLCJwb3J0Iiwic29ja2V0IiwiY2xpZW50IiwiY29ubmVjdCIsIm9uIiwib2ZmZXJGaXJzdCIsImRhdGEiLCJzZXRBbnN3ZXIiLCJzZHAiLCJzcnYiLCJodHRwIiwiU2VydmVyIiwiaW8iLCJsaXN0ZW4iLCJhbnN3ZXJGaXJzdCIsImlkIiwiZXYiLCJldmVudHMiLCJFdmVudEVtaXR0ZXIiLCJrYWQiLCJLYWRlbWxpYSIsImtMZW5ndGgiLCJwZWVyIiwiV2ViUlRDIiwibWFrZU9mZmVyIiwic2lnbmFsIiwiZW1pdCIsInR5cGUiLCJhZGRrbm9kZSIsInNvY2tldElkIiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZWplY3QiLCJtYWtlQW5zd2VyIiwidGltZW91dCIsInNldFRpbWVvdXQiLCJzb2NrZXRzIiwiY2xlYXJUaW1lb3V0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7Ozs7Ozs7OztBQUVBLElBQU1BLEdBQUcsR0FBRztBQUNWQyxFQUFBQSxLQUFLLEVBQUUsT0FERztBQUVWQyxFQUFBQSxNQUFNLEVBQUUsUUFGRTtBQUdWQyxFQUFBQSxTQUFTLEVBQUU7QUFIRCxDQUFaO0FBTUEsSUFBSUMsU0FBSjs7SUFFcUJDLFU7OztBQU1uQixzQkFBWUMsTUFBWixFQUE0QkMsTUFBNUIsRUFBd0U7QUFBQTs7QUFBQTs7QUFBQTs7QUFBQTs7QUFBQTs7QUFBQTs7QUFDdEUsU0FBS0MsTUFBTCxHQUFjLGtCQUFLQyxJQUFJLENBQUNDLE1BQUwsR0FBY0Ms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QUFDRSxHQUFyQixFQUEwQkYsSUFBSSxDQUFDZCxNQUEvQjtBQUVBLFlBQU0wQyxPQUFPLEdBQUdDLFVBQVUsQ0FBQyxZQUFNO0FBQy9CSCxVQUFBQSxNQUFNLENBQUMsU0FBRCxDQUFOO0FBQ0QsU0FGeUIsRUFFdkIsSUFBSSxJQUZtQixDQUExQjs7QUFJQVYsUUFBQUEsSUFBSSxDQUFDRyxNQUFMLEdBQWMsVUFBQWpCLEdBQUcsRUFBSTtBQUNuQixVQUFBLE1BQUksQ0FBQ0ksRUFBTCxDQUFRd0IsT0FBUixDQUFnQkEsT0FBaEIsQ0FBd0JQLFFBQXhCLEVBQWtDSCxJQUFsQyxDQUF1QzFDLEdBQUcsQ0FBQ0UsTUFBM0MsRUFBbUQ7QUFDakRzQixZQUFBQSxHQUFHLEVBQUVBLEdBRDRDO0FBRWpEaEIsWUFBQUEsTUFBTSxFQUFFLE1BQUksQ0FBQ0E7QUFGb0MsV0FBbkQ7QUFJRCxTQUxEOztBQU9BOEIsUUFBQUEsSUFBSSxDQUFDbkIsT0FBTCxHQUFlLFlBQU07QUFDbkJtQixVQUFBQSxJQUFJLENBQUM5QixNQUFMLEdBQWNjLElBQUksQ0FBQ2QsTUFBbkIsQ0FEbUIsQ0FDUTs7QUFDM0JJLFVBQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZLHdCQUFaLEVBQXNDeUIsSUFBSSxDQUFDOUIsTUFBM0M7QUFDQTZDLFVBQUFBLFlBQVksQ0FBQ0gsT0FBRCxDQUFaO0FBQ0FILFVBQUFBLE9BQU8sQ0FBQyxJQUFELENBQVA7O0FBQ0EsVUFBQSxNQUFJLENBQUNaLEdBQUwsQ0FBU1MsUUFBVCxDQUFrQk4sSUFBbEI7QUFDRCxTQU5EO0FBT0QsT0F2Qk0sQ0FBUDtBQXdCRCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBXZWJSVEMgZnJvbSBcIndlYnJ0YzRtZVwiO1xuaW1wb3J0IGh0dHAgZnJvbSBcImh0dHBcIjtcbmltcG9ydCBzb2NrZXRpbyBmcm9tIFwic29ja2V0LmlvXCI7XG5pbXBvcnQgY2xpZW50IGZyb20gXCJzb2NrZXQuaW8tY2xpZW50XCI7XG5pbXBvcnQgc2hhMSBmcm9tIFwic2hhMVwiO1xuaW1wb3J0IGV2ZW50cyBmcm9tIFwiZXZlbnRzXCI7XG5pbXBvcnQgS2FkZW1saWEgZnJvbSBcIi4uL2thZC9rYWRlbWxpYVwiO1xuXG5jb25zdCBkZWYgPSB7XG4gIE9GRkVSOiBcIk9GRkVSXCIsXG4gIEFOU1dFUjogXCJBTlNXRVJcIixcbiAgT05DT01NQU5EOiBcIk9OQ09NTUFORFwiXG59O1xuXG5sZXQgcGVlck9mZmVyOiBXZWJSVEM7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBvcnRhbE5vZGUge1xuICBub2RlSWQ6IHN0cmluZztcbiAgZXY6IGV2ZW50cy5FdmVudEVtaXR0ZXI7XG4gIGlvOiBhbnk7XG4gIGthZDogS2FkZW1saWE7XG5cbiAgY29uc3RydWN0b3IobXlQb3J0OiBudW1iZXIsIHRhcmdldD86IHsgYWRkcmVzczogc3RyaW5nOyBwb3J0OiBzdHJpbmcgfSkge1xuICAgIHRoaXMubm9kZUlkID0gc2hhMShNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKCkpLnRvU3RyaW5nKCk7XG4gICAgY29uc29sZS5sb2coXCJub2RlaWRcIiwgdGhpcy5ub2RlSWQpO1xuICAgIGlmICh0YXJnZXQpIHtcbiAgICAgIGNvbnN0IHRhcmdldFVybCA9IFwiaHR0cDovL1wiICsgdGFyZ2V0LmFkZHJlc3MgKyBcIjpcIiArIHRhcmdldC5wb3J0O1xuICAgICAgY29uc3Qgc29ja2V0ID0gY2xpZW50LmNvbm5lY3QodGFyZ2V0VXJsKTtcbiAgICAgIHNvY2tldC5vbihcImNvbm5lY3RcIiwgKCkgPT4ge1xuICAgICAgICB0aGlzLm9mZmVyRmlyc3Qoc29ja2V0KTtcbiAgICAgIH0pO1xuICAgICAgc29ja2V0Lm9uKGRlZi5BTlNXRVIsIChkYXRhOiBhbnkpID0+IHtcbiAgICAgICAgcGVlck9mZmVyLnNldEFuc3dlcihkYXRhLnNkcCwgZGF0YS5ub2RlSWQpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgY29uc3Qgc3J2ID0gbmV3IGh0dHAuU2VydmVyKCk7XG4gICAgdGhpcy5pbyA9IHNvY2tldGlvKHNydik7XG4gICAgc3J2Lmxpc3RlbihteVBvcnQpO1xuXG4gICAgdGhpcy5pby5vbihcImNvbm5lY3Rpb25cIiwgKHNvY2tldDogYW55KSA9PiB7XG4gICAgICBzb2NrZXQub24oZGVmLk9GRkVSLCAoZGF0YTogYW55KSA9PiB7XG4gICAgICAgIHRoaXMuYW5zd2VyRmlyc3QoZGF0YSwgc29ja2V0LmlkKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIHRoaXMuZXYgPSBuZXcgZXZlbnRzLkV2ZW50RW1pdHRlcigpO1xuICAgIHRoaXMua2FkID0gbmV3IEthZGVtbGlhKHRoaXMubm9kZUlkLCB7IGtMZW5ndGg6IDIwIH0pO1xuICB9XG5cbiAgb2ZmZXJGaXJzdChzb2NrZXQ6IGFueSkge1xuICAgIGNvbnNvbGUubG9nKFwiQGNsaVwiLCBcIm9mZmVyIGZpcnN0XCIpO1xuICAgIGNvbnN0IHBlZXIgPSBuZXcgV2ViUlRDKCk7XG4gICAgcGVlci5tYWtlT2ZmZXIoKTtcblxuICAgIHBlZXIuc2lnbmFsID0gc2RwID0+IHtcbiAgICAgIHNvY2tldC5lbWl0KGRlZi5PRkZFUiwge1xuICAgICAgICB0eXBlOiBkZWYuT0ZGRVIsXG4gICAgICAgIG5vZGVJZDogdGhpcy5ub2RlSWQsXG4gICAgICAgIHNkcDogc2RwXG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgcGVlci5jb25uZWN0ID0gKCkgPT4ge1xuICAgICAgY29uc29sZS5sb2coXCJmaXJzdCBvZmZlciBjb25uZWN0ZWRcIiwgcGVlci5ub2RlSWQpO1xuICAgICAgdGhpcy5rYWQuYWRka25vZGUocGVlcik7XG4gICAgfTtcbiAgICBwZWVyT2ZmZXIgPSBwZWVyO1xuICB9XG5cbiAgYW5zd2VyRmlyc3QoZGF0YTogYW55LCBzb2NrZXRJZDogc3RyaW5nKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGNvbnN0IHBlZXIgPSBuZXcgV2ViUlRDKCk7XG4gICAgICBjb25zb2xlLmxvZyhcImFuc3dlciBmaXJzdFwiLCBkYXRhKTtcbiAgICAgIHBlZXIubWFrZUFuc3dlcihkYXRhLnNkcCwgZGF0YS5ub2RlSWQpO1xuXG4gICAgICBjb25zdCB0aW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHJlamVjdChcInRpbWVvdXRcIik7XG4gICAgICB9LCAzICogMTAwMCk7XG5cbiAgICAgIHBlZXIuc2lnbmFsID0gc2RwID0+IHtcbiAgICAgICAgdGhpcy5pby5zb2NrZXRzLnNvY2tldHNbc29ja2V0SWRdLmVtaXQoZGVmLkFOU1dFUiwge1xuICAgICAgICAgIHNkcDogc2RwLFxuICAgICAgICAgIG5vZGVJZDogdGhpcy5ub2RlSWRcbiAgICAgICAgfSk7XG4gICAgICB9O1xuXG4gICAgICBwZWVyLmNvbm5lY3QgPSAoKSA9PiB7XG4gICAgICAgIHBlZXIubm9kZUlkID0gZGF0YS5ub2RlSWQ7IC8v6KyO44Gu44OQ44KwXG4gICAgICAgIGNvbnNvbGUubG9nKFwiZmlyc3QgYW5zd2VyIGNvbm5lY3RlZFwiLCBwZWVyLm5vZGVJZCk7XG4gICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KTtcbiAgICAgICAgcmVzb2x2ZSh0cnVlKTtcbiAgICAgICAgdGhpcy5rYWQuYWRka25vZGUocGVlcik7XG4gICAgICB9O1xuICAgIH0pO1xuICB9XG59XG4iXX0=
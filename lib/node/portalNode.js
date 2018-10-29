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
            nodeId: _this3.nodeId
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ub2RlL3BvcnRhbE5vZGUudHMiXSwibmFtZXMiOlsiZGVmIiwiT0ZGRVIiLCJBTlNXRVIiLCJPTkNPTU1BTkQiLCJwZWVyT2ZmZXIiLCJQb3J0YWxOb2RlIiwibXlQb3J0IiwidGFyZ2V0Iiwibm9kZUlkIiwiTWF0aCIsInJhbmRvbSIsInRvU3RyaW5nIiwiY29uc29sZSIsImxvZyIsInRhcmdldFVybCIsImFkZHJlc3MiLCJwb3J0Iiwic29ja2V0IiwiY2xpZW50IiwiY29ubmVjdCIsIm9uIiwib2ZmZXJGaXJzdCIsImRhdGEiLCJzZXRBbnN3ZXIiLCJzZHAiLCJzcnYiLCJodHRwIiwiU2VydmVyIiwiaW8iLCJsaXN0ZW4iLCJhbnN3ZXJGaXJzdCIsImlkIiwiZXYiLCJldmVudHMiLCJFdmVudEVtaXR0ZXIiLCJrYWQiLCJLYWRlbWxpYSIsImtMZW5ndGgiLCJwZWVyIiwiV2ViUlRDIiwibWFrZU9mZmVyIiwic2lnbmFsIiwiZW1pdCIsInR5cGUiLCJzb2NrZXRJZCIsIlByb21pc2UiLCJyZXNvbHZlIiwicmVqZWN0IiwibWFrZUFuc3dlciIsInRpbWVvdXQiLCJzZXRUaW1lb3V0Iiwic29ja2V0cyIsImNsZWFyVGltZW91dCJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7Ozs7Ozs7QUFFQSxJQUFNQSxHQUFHLEdBQUc7QUFDVkMsRUFBQUEsS0FBSyxFQUFFLE9BREc7QUFFVkMsRUFBQUEsTUFBTSxFQUFFLFFBRkU7QUFHVkMsRUFBQUEsU0FBUyxFQUFFO0FBSEQsQ0FBWjtBQU1BLElBQUlDLFNBQUo7O0lBRXFCQyxVOzs7QUFNbkIsc0JBQVlDLE1BQVosRUFBNEJDLE1BQTVCLEVBQXdFO0FBQUE7O0FBQUE7O0FBQUE7O0FBQUE7O0FBQUE7O0FBQUE7O0FBQ3RFLFNBQUtDLE1BQUwsR0FBYyxrQkFBS0MsSUFBSSxDQUFDQyxNQUFMLEdBQWNDLFFBQWQsRUFBTCxFQUErQkEsUUFBL0IsRUFBZDtBQUNBQyxJQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWSxRQUFaLEVBQXNCLEtBQUtMLE1BQTNCOztBQUNBLFFBQUlELE1BQUosRUFBWTtBQUNWLFVBQU1PLFNBQVMsR0FBRyxZQUFZUCxNQUFNLENBQUNRLE9BQW5CLEdBQTZCLEdBQTdCLEdBQW1DUixNQUFNLENBQUNTLElBQTVEOztBQUNBLFVBQU1DLE1BQU0sR0FBR0MsaUJBQU9DLE9BQVAsQ0FBZUwsU0FBZixDQUFmOztBQUNBRyxNQUFBQSxNQUFNLENBQUNHLEVBQVAsQ0FBVSxTQUFWLEVBQXFCLFlBQU07QUFDekIsUUFBQSxLQUFJLENBQUNDLFVBQUwsQ0FBZ0JKLE1BQWhCO0FBQ0QsT0FGRDtBQUdBQSxNQUFBQSxNQUFNLENBQUNHLEVBQVAsQ0FBVXBCLEdBQUcsQ0FBQ0UsTUFBZCxFQUFzQixVQUFDb0IsSUFBRCxFQUFlO0FBQ25DbEIsUUFBQUEsU0FBUyxDQUFDbUIsU0FBVixDQUFvQkQsSUFBSSxDQUFDRSxHQUF6QixFQUE4QkYsSUFBSSxDQUFDZCxNQUFuQztBQUNELE9BRkQ7QUFHRDs7QUFFRCxRQUFNaUIsR0FBRyxHQUFHLElBQUlDLGNBQUtDLE1BQVQsRUFBWjtBQUNBLFNBQUtDLEVBQUwsR0FBVSxxQkFBU0gsR0FBVCxDQUFWO0FBQ0FBLElBQUFBLEdBQUcsQ0FBQ0ksTUFBSixDQUFXdkIsTUFBWDtBQUVBLFNBQUtzQixFQUFMLENBQVFSLEVBQVIsQ0FBVyxZQUFYLEVBQXlCLFVBQUNILE1BQUQsRUFBaUI7QUFDeENBLE1BQUFBLE1BQU0sQ0FBQ0csRUFBUCxDQUFVcEIsR0FBRyxDQUFDQyxLQUFkLEVBQXFCLFVBQUNxQixJQUFELEVBQWU7QUFDbEMsUUFBQSxLQUFJLENBQUNRLFdBQUwsQ0FBaUJSLElBQWpCLEVBQXVCTCxNQUFNLENBQUNjLEVBQTlCO0FBQ0QsT0FGRDtBQUdELEtBSkQ7QUFLQSxTQUFLQyxFQUFMLEdBQVUsSUFBSUMsZ0JBQU9DLFlBQVgsRUFBVjtBQUNBLFNBQUtDLEdBQUwsR0FBVyxJQUFJQyxpQkFBSixDQUFhLEtBQUs1QixNQUFsQixFQUEwQjtBQUFFNkIsTUFBQUEsT0FBTyxFQUFFO0FBQVgsS0FBMUIsQ0FBWDtBQUNEOzs7OytCQUVVcEIsTSxFQUFhO0FBQUE7O0FBQ3RCTCxNQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWSxNQUFaLEVBQW9CLGFBQXBCO0FBQ0EsVUFBTXlCLElBQUksR0FBRyxJQUFJQyxrQkFBSixFQUFiO0FBQ0FELE1BQUFBLElBQUksQ0FBQ0UsU0FBTDs7QUFFQUYsTUFBQUEsSUFBSSxDQUFDRyxNQUFMLEdBQWMsVUFBQWpCLEdBQUcsRUFBSTtBQUNuQlAsUUFBQUEsTUFBTSxDQUFDeUIsSUFBUCxDQUFZMUMsR0FBRyxDQUFDQyxLQUFoQixFQUF1QjtBQUNyQjBDLFVBQUFBLElBQUksRUFBRTNDLEdBQUcsQ0FBQ0MsS0FEVztBQUVyQk8sVUFBQUEsTUFBTSxFQUFFLE1BQUksQ0FBQ0EsTUFGUTtBQUdyQmdCLFVBQUFBLEdBQUcsRUFBRUE7QUFIZ0IsU0FBdkI7QUFLRCxPQU5EOztBQVFBYyxNQUFBQSxJQUFJLENBQUNuQixPQUFMLEdBQWUsWUFBTTtBQUNuQlAsUUFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVksdUJBQVosRUFBcUN5QixJQUFJLENBQUM5QixNQUExQzs7QUFDQSxRQUFBLE1BQUksQ0FBQzJCLEdBQUwsQ0FBU2hCLE9BQVQsQ0FBaUJtQixJQUFqQjtBQUNELE9BSEQ7O0FBSUFsQyxNQUFBQSxTQUFTLEdBQUdrQyxJQUFaO0FBQ0Q7OztnQ0FFV2hCLEksRUFBV3NCLFEsRUFBa0I7QUFBQTs7QUFDdkMsYUFBTyxJQUFJQyxPQUFKLENBQVksVUFBQ0MsT0FBRCxFQUFVQyxNQUFWLEVBQXFCO0FBQ3RDLFlBQU1ULElBQUksR0FBRyxJQUFJQyxrQkFBSixFQUFiO0FBQ0EzQixRQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWSxjQUFaLEVBQTRCUyxJQUE1QjtBQUNBZ0IsUUFBQUEsSUFBSSxDQUFDVSxVQUFMLENBQWdCMUIsSUFBSSxDQUFDRSxHQUFyQixFQUEwQkYsSUFBSSxDQUFDZCxNQUEvQjtBQUVBLFlBQU15QyxPQUFPLEdBQUdDLFVBQVUsQ0FBQyxZQUFNO0FBQy9CSCxVQUFBQSxNQUFNLENBQUMsU0FBRCxDQUFOO0FBQ0QsU0FGeUIsRUFFdkIsSUFBSSxJQUZtQixDQUExQjs7QUFJQVQsUUFBQUEsSUFBSSxDQUFDRyxNQUFMLEdBQWMsVUFBQWpCLEdBQUcsRUFBSTtBQUNuQixVQUFBLE1BQUksQ0FBQ0ksRUFBTCxDQUFRdUIsT0FBUixDQUFnQkEsT0FBaEIsQ0FBd0JQLFFBQXhCLEVBQWtDRixJQUFsQyxDQUF1QzFDLEdBQUcsQ0FBQ0UsTUFBM0MsRUFBbUQ7QUFDakRzQixZQUFBQSxHQUFHLEVBQUVBLEdBRDRDO0FBRWpEaEIsWUFBQUEsTUFBTSxFQUFFLE1BQUksQ0FBQ0E7QUFGb0MsV0FBbkQ7QUFJRCxTQUxEOztBQU9BOEIsUUFBQUEsSUFBSSxDQUFDbkIsT0FBTCxHQUFlLFlBQU07QUFDbkJtQixVQUFBQSxJQUFJLENBQUM5QixNQUFMLEdBQWNjLElBQUksQ0FBQ2QsTUFBbkIsQ0FEbUIsQ0FDUTs7QUFDM0JJLFVBQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZLHdCQUFaLEVBQXNDeUIsSUFBSSxDQUFDOUIsTUFBM0M7QUFDQTRDLFVBQUFBLFlBQVksQ0FBQ0gsT0FBRCxDQUFaO0FBQ0FILFVBQUFBLE9BQU8sQ0FBQyxJQUFELENBQVA7O0FBQ0EsVUFBQSxNQUFJLENBQUNYLEdBQUwsQ0FBU2hCLE9BQVQsQ0FBaUJtQixJQUFqQjtBQUNELFNBTkQ7QUFPRCxPQXZCTSxDQUFQO0FBd0JEIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFdlYlJUQyBmcm9tIFwid2VicnRjNG1lXCI7XG5pbXBvcnQgaHR0cCBmcm9tIFwiaHR0cFwiO1xuaW1wb3J0IHNvY2tldGlvIGZyb20gXCJzb2NrZXQuaW9cIjtcbmltcG9ydCBjbGllbnQgZnJvbSBcInNvY2tldC5pby1jbGllbnRcIjtcbmltcG9ydCBzaGExIGZyb20gXCJzaGExXCI7XG5pbXBvcnQgZXZlbnRzIGZyb20gXCJldmVudHNcIjtcbmltcG9ydCBLYWRlbWxpYSBmcm9tIFwiLi4va2FkL2thZGVtbGlhXCI7XG5cbmNvbnN0IGRlZiA9IHtcbiAgT0ZGRVI6IFwiT0ZGRVJcIixcbiAgQU5TV0VSOiBcIkFOU1dFUlwiLFxuICBPTkNPTU1BTkQ6IFwiT05DT01NQU5EXCJcbn07XG5cbmxldCBwZWVyT2ZmZXI6IFdlYlJUQztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUG9ydGFsTm9kZSB7XG4gIG5vZGVJZDogc3RyaW5nO1xuICBldjogZXZlbnRzLkV2ZW50RW1pdHRlcjtcbiAgaW86IGFueTtcbiAga2FkOiBLYWRlbWxpYTtcblxuICBjb25zdHJ1Y3RvcihteVBvcnQ6IG51bWJlciwgdGFyZ2V0PzogeyBhZGRyZXNzOiBzdHJpbmc7IHBvcnQ6IHN0cmluZyB9KSB7XG4gICAgdGhpcy5ub2RlSWQgPSBzaGExKE1hdGgucmFuZG9tKCkudG9TdHJpbmcoKSkudG9TdHJpbmcoKTtcbiAgICBjb25zb2xlLmxvZyhcIm5vZGVpZFwiLCB0aGlzLm5vZGVJZCk7XG4gICAgaWYgKHRhcmdldCkge1xuICAgICAgY29uc3QgdGFyZ2V0VXJsID0gXCJodHRwOi8vXCIgKyB0YXJnZXQuYWRkcmVzcyArIFwiOlwiICsgdGFyZ2V0LnBvcnQ7XG4gICAgICBjb25zdCBzb2NrZXQgPSBjbGllbnQuY29ubmVjdCh0YXJnZXRVcmwpO1xuICAgICAgc29ja2V0Lm9uKFwiY29ubmVjdFwiLCAoKSA9PiB7XG4gICAgICAgIHRoaXMub2ZmZXJGaXJzdChzb2NrZXQpO1xuICAgICAgfSk7XG4gICAgICBzb2NrZXQub24oZGVmLkFOU1dFUiwgKGRhdGE6IGFueSkgPT4ge1xuICAgICAgICBwZWVyT2ZmZXIuc2V0QW5zd2VyKGRhdGEuc2RwLCBkYXRhLm5vZGVJZCk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBjb25zdCBzcnYgPSBuZXcgaHR0cC5TZXJ2ZXIoKTtcbiAgICB0aGlzLmlvID0gc29ja2V0aW8oc3J2KTtcbiAgICBzcnYubGlzdGVuKG15UG9ydCk7XG5cbiAgICB0aGlzLmlvLm9uKFwiY29ubmVjdGlvblwiLCAoc29ja2V0OiBhbnkpID0+IHtcbiAgICAgIHNvY2tldC5vbihkZWYuT0ZGRVIsIChkYXRhOiBhbnkpID0+IHtcbiAgICAgICAgdGhpcy5hbnN3ZXJGaXJzdChkYXRhLCBzb2NrZXQuaWQpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gICAgdGhpcy5ldiA9IG5ldyBldmVudHMuRXZlbnRFbWl0dGVyKCk7XG4gICAgdGhpcy5rYWQgPSBuZXcgS2FkZW1saWEodGhpcy5ub2RlSWQsIHsga0xlbmd0aDogMjAgfSk7XG4gIH1cblxuICBvZmZlckZpcnN0KHNvY2tldDogYW55KSB7XG4gICAgY29uc29sZS5sb2coXCJAY2xpXCIsIFwib2ZmZXIgZmlyc3RcIik7XG4gICAgY29uc3QgcGVlciA9IG5ldyBXZWJSVEMoKTtcbiAgICBwZWVyLm1ha2VPZmZlcigpO1xuXG4gICAgcGVlci5zaWduYWwgPSBzZHAgPT4ge1xuICAgICAgc29ja2V0LmVtaXQoZGVmLk9GRkVSLCB7XG4gICAgICAgIHR5cGU6IGRlZi5PRkZFUixcbiAgICAgICAgbm9kZUlkOiB0aGlzLm5vZGVJZCxcbiAgICAgICAgc2RwOiBzZHBcbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICBwZWVyLmNvbm5lY3QgPSAoKSA9PiB7XG4gICAgICBjb25zb2xlLmxvZyhcImZpcnN0IG9mZmVyIGNvbm5lY3RlZFwiLCBwZWVyLm5vZGVJZCk7XG4gICAgICB0aGlzLmthZC5jb25uZWN0KHBlZXIpO1xuICAgIH07XG4gICAgcGVlck9mZmVyID0gcGVlcjtcbiAgfVxuXG4gIGFuc3dlckZpcnN0KGRhdGE6IGFueSwgc29ja2V0SWQ6IHN0cmluZykge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjb25zdCBwZWVyID0gbmV3IFdlYlJUQygpO1xuICAgICAgY29uc29sZS5sb2coXCJhbnN3ZXIgZmlyc3RcIiwgZGF0YSk7XG4gICAgICBwZWVyLm1ha2VBbnN3ZXIoZGF0YS5zZHAsIGRhdGEubm9kZUlkKTtcblxuICAgICAgY29uc3QgdGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICByZWplY3QoXCJ0aW1lb3V0XCIpO1xuICAgICAgfSwgMyAqIDEwMDApO1xuXG4gICAgICBwZWVyLnNpZ25hbCA9IHNkcCA9PiB7XG4gICAgICAgIHRoaXMuaW8uc29ja2V0cy5zb2NrZXRzW3NvY2tldElkXS5lbWl0KGRlZi5BTlNXRVIsIHtcbiAgICAgICAgICBzZHA6IHNkcCxcbiAgICAgICAgICBub2RlSWQ6IHRoaXMubm9kZUlkXG4gICAgICAgIH0pO1xuICAgICAgfTtcblxuICAgICAgcGVlci5jb25uZWN0ID0gKCkgPT4ge1xuICAgICAgICBwZWVyLm5vZGVJZCA9IGRhdGEubm9kZUlkOyAvL+isjuOBruODkOOCsFxuICAgICAgICBjb25zb2xlLmxvZyhcImZpcnN0IGFuc3dlciBjb25uZWN0ZWRcIiwgcGVlci5ub2RlSWQpO1xuICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dCk7XG4gICAgICAgIHJlc29sdmUodHJ1ZSk7XG4gICAgICAgIHRoaXMua2FkLmNvbm5lY3QocGVlcik7XG4gICAgICB9O1xuICAgIH0pO1xuICB9XG59XG4iXX0=
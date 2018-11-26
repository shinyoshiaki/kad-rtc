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

    _defineProperty(this, "ev", void 0);

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ub2RlL3BvcnRhbE5vZGUudHMiXSwibmFtZXMiOlsiZGVmIiwiUG9ydGFsTm9kZSIsIm15UG9ydCIsInRhcmdldCIsInRhcmdldFVybCIsImFkZHJlc3MiLCJwb3J0Iiwic29ja2V0IiwiY2xpZW50IiwiY29ubmVjdCIsIm9uIiwib2ZmZXJGaXJzdCIsIkFOU1dFUiIsImRhdGEiLCJwZWVyT2ZmZXIiLCJzZXRBbnN3ZXIiLCJzZHAiLCJub2RlSWQiLCJzcnYiLCJodHRwIiwiU2VydmVyIiwiaW8iLCJsaXN0ZW4iLCJPRkZFUiIsImFuc3dlckZpcnN0IiwiaWQiLCJldiIsImV2ZW50cyIsIkV2ZW50RW1pdHRlciIsImthZCIsIkthZGVtbGlhIiwia0xlbmd0aCIsImNvbnNvbGUiLCJsb2ciLCJwZWVyIiwiV2ViUlRDIiwibWFrZU9mZmVyIiwic2lnbmFsIiwiZW1pdCIsInR5cGUiLCJzb2NrZXRJZCIsIlByb21pc2UiLCJyZXNvbHZlIiwicmVqZWN0IiwibWFrZUFuc3dlciIsInRpbWVvdXQiLCJzZXRUaW1lb3V0Iiwic29ja2V0cyIsImNsZWFyVGltZW91dCJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7Ozs7Ozs7SUFFS0EsRzs7V0FBQUEsRztBQUFBQSxFQUFBQSxHO0FBQUFBLEVBQUFBLEc7QUFBQUEsRUFBQUEsRztHQUFBQSxHLEtBQUFBLEc7O0lBTWdCQyxVOzs7QUFNbkIsc0JBQVlDLE1BQVosRUFBNEJDLE1BQTVCLEVBQXdFO0FBQUE7O0FBQUE7O0FBQUE7O0FBQUE7O0FBQUE7O0FBQUE7O0FBQ3RFLFFBQUlBLE1BQUosRUFBWTtBQUNWLFVBQU1DLFNBQVMsR0FBRyxZQUFZRCxNQUFNLENBQUNFLE9BQW5CLEdBQTZCLEdBQTdCLEdBQW1DRixNQUFNLENBQUNHLElBQTVEOztBQUNBLFVBQU1DLE1BQU0sR0FBR0MsaUJBQU9DLE9BQVAsQ0FBZUwsU0FBZixDQUFmOztBQUNBRyxNQUFBQSxNQUFNLENBQUNHLEVBQVAsQ0FBVSxTQUFWLEVBQXFCLFlBQU07QUFDekIsUUFBQSxLQUFJLENBQUNDLFVBQUwsQ0FBZ0JKLE1BQWhCO0FBQ0QsT0FGRDtBQUdBQSxNQUFBQSxNQUFNLENBQUNHLEVBQVAsQ0FBVVYsR0FBRyxDQUFDWSxNQUFkLEVBQXNCLFVBQUNDLElBQUQsRUFBZTtBQUNuQyxZQUFJLEtBQUksQ0FBQ0MsU0FBVCxFQUFvQixLQUFJLENBQUNBLFNBQUwsQ0FBZUMsU0FBZixDQUF5QkYsSUFBSSxDQUFDRyxHQUE5QixFQUFtQ0gsSUFBSSxDQUFDSSxNQUF4QztBQUNyQixPQUZEO0FBR0Q7O0FBRUQsUUFBTUMsR0FBRyxHQUFHLElBQUlDLGNBQUtDLE1BQVQsRUFBWjtBQUNBLFNBQUtDLEVBQUwsR0FBVSxxQkFBU0gsR0FBVCxDQUFWO0FBQ0FBLElBQUFBLEdBQUcsQ0FBQ0ksTUFBSixDQUFXcEIsTUFBWDtBQUVBLFNBQUttQixFQUFMLENBQVFYLEVBQVIsQ0FBVyxZQUFYLEVBQXlCLFVBQUNILE1BQUQsRUFBaUI7QUFDeENBLE1BQUFBLE1BQU0sQ0FBQ0csRUFBUCxDQUFVVixHQUFHLENBQUN1QixLQUFkLEVBQXFCLFVBQUNWLElBQUQsRUFBZTtBQUNsQyxRQUFBLEtBQUksQ0FBQ1csV0FBTCxDQUFpQlgsSUFBakIsRUFBdUJOLE1BQU0sQ0FBQ2tCLEVBQTlCO0FBQ0QsT0FGRDtBQUdELEtBSkQ7QUFLQSxTQUFLQyxFQUFMLEdBQVUsSUFBSUMsZ0JBQU9DLFlBQVgsRUFBVjtBQUNBLFNBQUtDLEdBQUwsR0FBVyxJQUFJQyxpQkFBSixDQUFhO0FBQUVDLE1BQUFBLE9BQU8sRUFBRTtBQUFYLEtBQWIsQ0FBWDtBQUNEOzs7OytCQUVVeEIsTSxFQUFhO0FBQUE7O0FBQ3RCeUIsTUFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVksTUFBWixFQUFvQixhQUFwQjtBQUNBLFVBQU1DLElBQUksR0FBRyxJQUFJQyxrQkFBSixFQUFiO0FBQ0FELE1BQUFBLElBQUksQ0FBQ0UsU0FBTDs7QUFFQUYsTUFBQUEsSUFBSSxDQUFDRyxNQUFMLEdBQWMsVUFBQXJCLEdBQUcsRUFBSTtBQUNuQlQsUUFBQUEsTUFBTSxDQUFDK0IsSUFBUCxDQUFZdEMsR0FBRyxDQUFDdUIsS0FBaEIsRUFBdUI7QUFDckJnQixVQUFBQSxJQUFJLEVBQUV2QyxHQUFHLENBQUN1QixLQURXO0FBRXJCTixVQUFBQSxNQUFNLEVBQUUsTUFBSSxDQUFDWSxHQUFMLENBQVNaLE1BRkk7QUFHckJELFVBQUFBLEdBQUcsRUFBRUE7QUFIZ0IsU0FBdkI7QUFLRCxPQU5EOztBQVFBa0IsTUFBQUEsSUFBSSxDQUFDekIsT0FBTCxHQUFlLFlBQU07QUFDbkJ1QixRQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWSx1QkFBWixFQUFxQ0MsSUFBSSxDQUFDakIsTUFBMUM7O0FBQ0EsUUFBQSxNQUFJLENBQUNZLEdBQUwsQ0FBU3BCLE9BQVQsQ0FBaUJ5QixJQUFqQjtBQUNELE9BSEQ7O0FBSUEsV0FBS3BCLFNBQUwsR0FBaUJvQixJQUFqQjtBQUNEOzs7Z0NBRVdyQixJLEVBQVcyQixRLEVBQWtCO0FBQUE7O0FBQ3ZDLGFBQU8sSUFBSUMsT0FBSixDQUFZLFVBQUNDLE9BQUQsRUFBVUMsTUFBVixFQUFxQjtBQUN0QyxZQUFNVCxJQUFJLEdBQUcsSUFBSUMsa0JBQUosRUFBYjtBQUNBSCxRQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWSxjQUFaLEVBQTRCcEIsSUFBNUI7QUFDQXFCLFFBQUFBLElBQUksQ0FBQ1UsVUFBTCxDQUFnQi9CLElBQUksQ0FBQ0csR0FBckIsRUFBMEJILElBQUksQ0FBQ0ksTUFBL0I7QUFFQSxZQUFNNEIsT0FBTyxHQUFHQyxVQUFVLENBQUMsWUFBTTtBQUMvQkgsVUFBQUEsTUFBTSxDQUFDLFNBQUQsQ0FBTjtBQUNELFNBRnlCLEVBRXZCLElBQUksSUFGbUIsQ0FBMUI7O0FBSUFULFFBQUFBLElBQUksQ0FBQ0csTUFBTCxHQUFjLFVBQUFyQixHQUFHLEVBQUk7QUFDbkIsVUFBQSxNQUFJLENBQUNLLEVBQUwsQ0FBUTBCLE9BQVIsQ0FBZ0JBLE9BQWhCLENBQXdCUCxRQUF4QixFQUFrQ0YsSUFBbEMsQ0FBdUN0QyxHQUFHLENBQUNZLE1BQTNDLEVBQW1EO0FBQ2pESSxZQUFBQSxHQUFHLEVBQUVBLEdBRDRDO0FBRWpEQyxZQUFBQSxNQUFNLEVBQUUsTUFBSSxDQUFDWSxHQUFMLENBQVNaO0FBRmdDLFdBQW5EO0FBSUQsU0FMRDs7QUFPQWlCLFFBQUFBLElBQUksQ0FBQ3pCLE9BQUwsR0FBZSxZQUFNO0FBQ25CeUIsVUFBQUEsSUFBSSxDQUFDakIsTUFBTCxHQUFjSixJQUFJLENBQUNJLE1BQW5CLENBRG1CLENBQ1E7O0FBQzNCZSxVQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWSx3QkFBWixFQUFzQ0MsSUFBSSxDQUFDakIsTUFBM0M7QUFDQStCLFVBQUFBLFlBQVksQ0FBQ0gsT0FBRCxDQUFaO0FBQ0FILFVBQUFBLE9BQU8sQ0FBQyxJQUFELENBQVA7O0FBQ0EsVUFBQSxNQUFJLENBQUNiLEdBQUwsQ0FBU3BCLE9BQVQsQ0FBaUJ5QixJQUFqQjtBQUNELFNBTkQ7QUFPRCxPQXZCTSxDQUFQO0FBd0JEIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFdlYlJUQyBmcm9tIFwid2VicnRjNG1lXCI7XG5pbXBvcnQgaHR0cCBmcm9tIFwiaHR0cFwiO1xuaW1wb3J0IHNvY2tldGlvIGZyb20gXCJzb2NrZXQuaW9cIjtcbmltcG9ydCBjbGllbnQgZnJvbSBcInNvY2tldC5pby1jbGllbnRcIjtcbmltcG9ydCBldmVudHMgZnJvbSBcImV2ZW50c1wiO1xuaW1wb3J0IEthZGVtbGlhIGZyb20gXCIuLi9rYWQva2FkZW1saWFcIjtcblxuZW51bSBkZWYge1xuICBPRkZFUiA9IFwiT0ZGRVJcIixcbiAgQU5TV0VSID0gXCJBTlNXRVJcIixcbiAgT05DT01NQU5EID0gXCJPTkNPTU1BTkRcIlxufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQb3J0YWxOb2RlIHtcbiAgZXY6IGV2ZW50cy5FdmVudEVtaXR0ZXI7XG4gIGlvOiBhbnk7XG4gIGthZDogS2FkZW1saWE7XG4gIHBlZXJPZmZlcjogV2ViUlRDIHwgdW5kZWZpbmVkO1xuXG4gIGNvbnN0cnVjdG9yKG15UG9ydDogbnVtYmVyLCB0YXJnZXQ/OiB7IGFkZHJlc3M6IHN0cmluZzsgcG9ydDogc3RyaW5nIH0pIHtcbiAgICBpZiAodGFyZ2V0KSB7XG4gICAgICBjb25zdCB0YXJnZXRVcmwgPSBcImh0dHA6Ly9cIiArIHRhcmdldC5hZGRyZXNzICsgXCI6XCIgKyB0YXJnZXQucG9ydDtcbiAgICAgIGNvbnN0IHNvY2tldCA9IGNsaWVudC5jb25uZWN0KHRhcmdldFVybCk7XG4gICAgICBzb2NrZXQub24oXCJjb25uZWN0XCIsICgpID0+IHtcbiAgICAgICAgdGhpcy5vZmZlckZpcnN0KHNvY2tldCk7XG4gICAgICB9KTtcbiAgICAgIHNvY2tldC5vbihkZWYuQU5TV0VSLCAoZGF0YTogYW55KSA9PiB7XG4gICAgICAgIGlmICh0aGlzLnBlZXJPZmZlcikgdGhpcy5wZWVyT2ZmZXIuc2V0QW5zd2VyKGRhdGEuc2RwLCBkYXRhLm5vZGVJZCk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBjb25zdCBzcnYgPSBuZXcgaHR0cC5TZXJ2ZXIoKTtcbiAgICB0aGlzLmlvID0gc29ja2V0aW8oc3J2KTtcbiAgICBzcnYubGlzdGVuKG15UG9ydCk7XG5cbiAgICB0aGlzLmlvLm9uKFwiY29ubmVjdGlvblwiLCAoc29ja2V0OiBhbnkpID0+IHtcbiAgICAgIHNvY2tldC5vbihkZWYuT0ZGRVIsIChkYXRhOiBhbnkpID0+IHtcbiAgICAgICAgdGhpcy5hbnN3ZXJGaXJzdChkYXRhLCBzb2NrZXQuaWQpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gICAgdGhpcy5ldiA9IG5ldyBldmVudHMuRXZlbnRFbWl0dGVyKCk7XG4gICAgdGhpcy5rYWQgPSBuZXcgS2FkZW1saWEoeyBrTGVuZ3RoOiAyMCB9KTtcbiAgfVxuXG4gIG9mZmVyRmlyc3Qoc29ja2V0OiBhbnkpIHtcbiAgICBjb25zb2xlLmxvZyhcIkBjbGlcIiwgXCJvZmZlciBmaXJzdFwiKTtcbiAgICBjb25zdCBwZWVyID0gbmV3IFdlYlJUQygpO1xuICAgIHBlZXIubWFrZU9mZmVyKCk7XG5cbiAgICBwZWVyLnNpZ25hbCA9IHNkcCA9PiB7XG4gICAgICBzb2NrZXQuZW1pdChkZWYuT0ZGRVIsIHtcbiAgICAgICAgdHlwZTogZGVmLk9GRkVSLFxuICAgICAgICBub2RlSWQ6IHRoaXMua2FkLm5vZGVJZCxcbiAgICAgICAgc2RwOiBzZHBcbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICBwZWVyLmNvbm5lY3QgPSAoKSA9PiB7XG4gICAgICBjb25zb2xlLmxvZyhcImZpcnN0IG9mZmVyIGNvbm5lY3RlZFwiLCBwZWVyLm5vZGVJZCk7XG4gICAgICB0aGlzLmthZC5jb25uZWN0KHBlZXIpO1xuICAgIH07XG4gICAgdGhpcy5wZWVyT2ZmZXIgPSBwZWVyO1xuICB9XG5cbiAgYW5zd2VyRmlyc3QoZGF0YTogYW55LCBzb2NrZXRJZDogc3RyaW5nKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGNvbnN0IHBlZXIgPSBuZXcgV2ViUlRDKCk7XG4gICAgICBjb25zb2xlLmxvZyhcImFuc3dlciBmaXJzdFwiLCBkYXRhKTtcbiAgICAgIHBlZXIubWFrZUFuc3dlcihkYXRhLnNkcCwgZGF0YS5ub2RlSWQpO1xuXG4gICAgICBjb25zdCB0aW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHJlamVjdChcInRpbWVvdXRcIik7XG4gICAgICB9LCAzICogMTAwMCk7XG5cbiAgICAgIHBlZXIuc2lnbmFsID0gc2RwID0+IHtcbiAgICAgICAgdGhpcy5pby5zb2NrZXRzLnNvY2tldHNbc29ja2V0SWRdLmVtaXQoZGVmLkFOU1dFUiwge1xuICAgICAgICAgIHNkcDogc2RwLFxuICAgICAgICAgIG5vZGVJZDogdGhpcy5rYWQubm9kZUlkXG4gICAgICAgIH0pO1xuICAgICAgfTtcblxuICAgICAgcGVlci5jb25uZWN0ID0gKCkgPT4ge1xuICAgICAgICBwZWVyLm5vZGVJZCA9IGRhdGEubm9kZUlkOyAvL+isjuOBruODkOOCsFxuICAgICAgICBjb25zb2xlLmxvZyhcImZpcnN0IGFuc3dlciBjb25uZWN0ZWRcIiwgcGVlci5ub2RlSWQpO1xuICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dCk7XG4gICAgICAgIHJlc29sdmUodHJ1ZSk7XG4gICAgICAgIHRoaXMua2FkLmNvbm5lY3QocGVlcik7XG4gICAgICB9O1xuICAgIH0pO1xuICB9XG59XG4iXX0=
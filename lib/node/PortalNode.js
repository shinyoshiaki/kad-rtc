"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _simpleDatachannel = require("simple-datachannel");

var _simpleDatachannel2 = _interopRequireDefault(_simpleDatachannel);

var _http = require("http");

var _http2 = _interopRequireDefault(_http);

var _socket = require("socket.io");

var _socket2 = _interopRequireDefault(_socket);

var _socket3 = require("socket.io-client");

var _socket4 = _interopRequireDefault(_socket3);

var _Kademlia = require("../kad/Kademlia");

var _Kademlia2 = _interopRequireDefault(_Kademlia);

var _sha = require("sha1");

var _sha2 = _interopRequireDefault(_sha);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var def = {
  OFFER: "OFFER",
  ANSWER: "ANSWER"
};

var peerOffer = void 0,
    peerAnswer = void 0;

var PortalNode = function () {
  function PortalNode(myPort) {
    var _this = this;

    var target = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : { address: undefined, port: undefined };

    _classCallCheck(this, PortalNode);

    this.myPort = myPort;
    this.targetUrl = undefined;
    if (target.address != undefined && target.address.length > 1) {
      this.targetUrl = "http://" + target.address + ":" + target.port;
      console.log("target url", this.targetUrl);
    }
    this.nodeId = (0, _sha2.default)(Math.random().toString());
    console.log("nodeId", this.nodeId);
    this.kad = new _Kademlia2.default(this.nodeId);

    this.srv = _http2.default.Server();
    this.io = (0, _socket2.default)(this.srv, { origins: "*:*" });
    this.srv.listen(this.myPort);

    this.io.on("connection", function (socket) {
      socket.on(def.OFFER, function (data) {
        _this.answerFirst(data, socket.id);
      });
    });

    if (this.targetUrl != undefined) {
      var socket = _socket4.default.connect(this.targetUrl);
      socket.on("connect", function () {
        _this.offerFirst(socket);
      });

      socket.on(def.ANSWER, function (data) {
        peerOffer.connecting(data.nodeId);
        peerOffer.setAnswer(data.sdp);
      });
    }
  }

  _createClass(PortalNode, [{
    key: "offerFirst",
    value: function offerFirst(socket) {
      var _this2 = this;

      console.log("@cli", "offer first");
      peerOffer = new _simpleDatachannel2.default();
      peerOffer.makeOffer();

      peerOffer.ev.once("signal", function (sdp) {
        socket.emit(def.OFFER, {
          type: def.OFFER,
          nodeId: _this2.nodeId,
          sdp: sdp
        });
      });

      peerOffer.ev.once("connect", function () {
        peerOffer.connected();
        setTimeout(function () {
          _this2.kad.addknode(peerOffer);
        }, 1 * 1000);
      });
    }
  }, {
    key: "answerFirst",
    value: function answerFirst(data, socketId) {
      var _this3 = this;

      return new Promise(function (resolve) {
        peerAnswer = new _simpleDatachannel2.default();
        peerAnswer.makeAnswer(data.sdp);

        peerAnswer.connecting(data.nodeId);

        setTimeout(function () {
          resolve(false);
        }, 3 * 1000);

        peerAnswer.ev.once("signal", function (sdp) {
          _this3.io.sockets.sockets[socketId].emit(def.ANSWER, {
            sdp: sdp,
            nodeId: _this3.nodeId
          });
        });

        peerAnswer.ev.once("connect", function () {
          peerAnswer.connected();
          _this3.kad.addknode(peerAnswer);
          resolve(true);
        });
      });
    }
  }]);

  return PortalNode;
}();

exports.default = PortalNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ub2RlL1BvcnRhbE5vZGUuanMiXSwibmFtZXMiOlsiZGVmIiwiT0ZGRVIiLCJBTlNXRVIiLCJwZWVyT2ZmZXIiLCJwZWVyQW5zd2VyIiwiUG9ydGFsTm9kZSIsIm15UG9ydCIsInRhcmdldCIsImFkZHJlc3MiLCJ1bmRlZmluZWQiLCJwb3J0IiwidGFyZ2V0VXJsIiwibGVuZ3RoIiwiY29uc29sZSIsImxvZyIsIm5vZGVJZCIsIk1hdGgiLCJyYW5kb20iLCJ0b1N0cmluZyIsImthZCIsIkthZGVtbGlhIiwic3J2IiwiaHR0cCIsIlNlcnZlciIsImlvIiwib3JpZ2lucyIsImxpc3RlbiIsIm9uIiwic29ja2V0IiwiYW5zd2VyRmlyc3QiLCJkYXRhIiwiaWQiLCJjbGllbnQiLCJjb25uZWN0Iiwib2ZmZXJGaXJzdCIsImNvbm5lY3RpbmciLCJzZXRBbnN3ZXIiLCJzZHAiLCJXZWJSVEMiLCJtYWtlT2ZmZXIiLCJldiIsIm9uY2UiLCJlbWl0IiwidHlwZSIsImNvbm5lY3RlZCIsInNldFRpbWVvdXQiLCJhZGRrbm9kZSIsInNvY2tldElkIiwiUHJvbWlzZSIsIm1ha2VBbnN3ZXIiLCJyZXNvbHZlIiwic29ja2V0cyJdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7Ozs7OztBQUVBLElBQU1BLE1BQU07QUFDVkMsU0FBTyxPQURHO0FBRVZDLFVBQVE7QUFGRSxDQUFaOztBQUtBLElBQUlDLGtCQUFKO0FBQUEsSUFBZUMsbUJBQWY7O0lBQ3FCQyxVO0FBQ25CLHNCQUFZQyxNQUFaLEVBQXNFO0FBQUE7O0FBQUEsUUFBbERDLE1BQWtELHVFQUF6QyxFQUFFQyxTQUFTQyxTQUFYLEVBQXNCQyxNQUFNRCxTQUE1QixFQUF5Qzs7QUFBQTs7QUFDcEUsU0FBS0gsTUFBTCxHQUFjQSxNQUFkO0FBQ0EsU0FBS0ssU0FBTCxHQUFpQkYsU0FBakI7QUFDQSxRQUFJRixPQUFP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T0FBaEIsQ0FBd0JKLFFBQXhCLEVBQWtDTCxJQUFsQyxDQUF1QzFDLElBQUlFLE1BQTNDLEVBQW1EO0FBQ2pEbUMsaUJBQUtBLEdBRDRDO0FBRWpEdEIsb0JBQVEsT0FBS0E7QUFGb0MsV0FBbkQ7QUFJRCxTQUxEOztBQU9BWCxtQkFBV29DLEVBQVgsQ0FBY0MsSUFBZCxDQUFtQixTQUFuQixFQUE4QixZQUFNO0FBQ2xDckMscUJBQVd3QyxTQUFYO0FBQ0EsaUJBQUt6QixHQUFMLENBQVMyQixRQUFULENBQWtCMUMsVUFBbEI7QUFDQThDLGtCQUFRLElBQVI7QUFDRCxTQUpEO0FBS0QsT0F0Qk0sQ0FBUDtBQXVCRDs7Ozs7O2tCQWhGa0I3QyxVIiwiZmlsZSI6IlBvcnRhbE5vZGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIjtcbmltcG9ydCBXZWJSVEMgZnJvbSBcInNpbXBsZS1kYXRhY2hhbm5lbFwiO1xuaW1wb3J0IGh0dHAgZnJvbSBcImh0dHBcIjtcbmltcG9ydCBzb2NrZXRpbyBmcm9tIFwic29ja2V0LmlvXCI7XG5pbXBvcnQgY2xpZW50IGZyb20gXCJzb2NrZXQuaW8tY2xpZW50XCI7XG5pbXBvcnQgS2FkZW1saWEgZnJvbSBcIi4uL2thZC9LYWRlbWxpYVwiO1xuaW1wb3J0IHNoYTEgZnJvbSBcInNoYTFcIjtcblxuY29uc3QgZGVmID0ge1xuICBPRkZFUjogXCJPRkZFUlwiLFxuICBBTlNXRVI6IFwiQU5TV0VSXCJcbn07XG5cbmxldCBwZWVyT2ZmZXIsIHBlZXJBbnN3ZXI7XG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQb3J0YWxOb2RlIHtcbiAgY29uc3RydWN0b3IobXlQb3J0LCB0YXJnZXQgPSB7IGFkZHJlc3M6IHVuZGVmaW5lZCwgcG9ydDogdW5kZWZpbmVkIH0pIHtcbiAgICB0aGlzLm15UG9ydCA9IG15UG9ydDtcbiAgICB0aGlzLnRhcmdldFVybCA9IHVuZGVmaW5lZDtcbiAgICBpZiAodGFyZ2V0LmFkZHJlc3MgIT0gdW5kZWZpbmVkICYmIHRhcmdldC5hZGRyZXNzLmxlbmd0aCA+IDEpIHtcbiAgICAgIHRoaXMudGFyZ2V0VXJsID0gXCJodHRwOi8vXCIgKyB0YXJnZXQuYWRkcmVzcyArIFwiOlwiICsgdGFyZ2V0LnBvcnQ7XG4gICAgICBjb25zb2xlLmxvZyhcInRhcmdldCB1cmxcIiwgdGhpcy50YXJnZXRVcmwpO1xuICAgIH1cbiAgICB0aGlzLm5vZGVJZCA9IHNoYTEoTWF0aC5yYW5kb20oKS50b1N0cmluZygpKTtcbiAgICBjb25zb2xlLmxvZyhcIm5vZGVJZFwiLCB0aGlzLm5vZGVJZCk7XG4gICAgdGhpcy5rYWQgPSBuZXcgS2FkZW1saWEodGhpcy5ub2RlSWQpO1xuXG4gICAgdGhpcy5zcnYgPSBodHRwLlNlcnZlcigpO1xuICAgIHRoaXMuaW8gPSBzb2NrZXRpbyh0aGlzLnNydiwgeyBvcmlnaW5zOiBcIio6KlwiIH0pO1xuICAgIHRoaXMuc3J2Lmxpc3Rlbih0aGlzLm15UG9ydCk7XG5cbiAgICB0aGlzLmlvLm9uKFwiY29ubmVjdGlvblwiLCBzb2NrZXQgPT4ge1xuICAgICAgc29ja2V0Lm9uKGRlZi5PRkZFUiwgZGF0YSA9PiB7XG4gICAgICAgIHRoaXMuYW5zd2VyRmlyc3QoZGF0YSwgc29ja2V0LmlkKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgaWYgKHRoaXMudGFyZ2V0VXJsICE9IHVuZGVmaW5lZCkge1xuICAgICAgY29uc3Qgc29ja2V0ID0gY2xpZW50LmNvbm5lY3QodGhpcy50YXJnZXRVcmwpO1xuICAgICAgc29ja2V0Lm9uKFwiY29ubmVjdFwiLCAoKSA9PiB7XG4gICAgICAgIHRoaXMub2ZmZXJGaXJzdChzb2NrZXQpO1xuICAgICAgfSk7XG5cbiAgICAgIHNvY2tldC5vbihkZWYuQU5TV0VSLCBkYXRhID0+IHtcbiAgICAgICAgcGVlck9mZmVyLmNvbm5lY3RpbmcoZGF0YS5ub2RlSWQpO1xuICAgICAgICBwZWVyT2ZmZXIuc2V0QW5zd2VyKGRhdGEuc2RwKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIG9mZmVyRmlyc3Qoc29ja2V0KSB7XG4gICAgY29uc29sZS5sb2coXCJAY2xpXCIsIFwib2ZmZXIgZmlyc3RcIik7XG4gICAgcGVlck9mZmVyID0gbmV3IFdlYlJUQygpO1xuICAgIHBlZXJPZmZlci5tYWtlT2ZmZXIoKTtcblxuICAgIHBlZXJPZmZlci5ldi5vbmNlKFwic2lnbmFsXCIsIHNkcCA9PiB7XG4gICAgICBzb2NrZXQuZW1pdChkZWYuT0ZGRVIsIHtcbiAgICAgICAgdHlwZTogZGVmLk9GRkVSLFxuICAgICAgICBub2RlSWQ6IHRoaXMubm9kZUlkLFxuICAgICAgICBzZHA6IHNkcFxuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBwZWVyT2ZmZXIuZXYub25jZShcImNvbm5lY3RcIiwgKCkgPT4ge1xuICAgICAgcGVlck9mZmVyLmNvbm5lY3RlZCgpO1xuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHRoaXMua2FkLmFkZGtub2RlKHBlZXJPZmZlcik7XG4gICAgICB9LCAxICogMTAwMCk7XG4gICAgfSk7XG4gIH1cblxuICBhbnN3ZXJGaXJzdChkYXRhLCBzb2NrZXRJZCkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcbiAgICAgIHBlZXJBbnN3ZXIgPSBuZXcgV2ViUlRDKCk7XG4gICAgICBwZWVyQW5zd2VyLm1ha2VBbnN3ZXIoZGF0YS5zZHApO1xuXG4gICAgICBwZWVyQW5zd2VyLmNvbm5lY3RpbmcoZGF0YS5ub2RlSWQpO1xuXG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgcmVzb2x2ZShmYWxzZSk7XG4gICAgICB9LCAzICogMTAwMCk7XG5cbiAgICAgIHBlZXJBbnN3ZXIuZXYub25jZShcInNpZ25hbFwiLCBzZHAgPT4ge1xuICAgICAgICB0aGlzLmlvLnNvY2tldHMuc29ja2V0c1tzb2NrZXRJZF0uZW1pdChkZWYuQU5TV0VSLCB7XG4gICAgICAgICAgc2RwOiBzZHAsXG4gICAgICAgICAgbm9kZUlkOiB0aGlzLm5vZGVJZFxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuXG4gICAgICBwZWVyQW5zd2VyLmV2Lm9uY2UoXCJjb25uZWN0XCIsICgpID0+IHtcbiAgICAgICAgcGVlckFuc3dlci5jb25uZWN0ZWQoKTtcbiAgICAgICAgdGhpcy5rYWQuYWRka25vZGUocGVlckFuc3dlcik7XG4gICAgICAgIHJlc29sdmUodHJ1ZSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxufVxuIl19
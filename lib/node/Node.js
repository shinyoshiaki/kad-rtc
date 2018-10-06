"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _simpleDatachannel = require("simple-datachannel");

var _simpleDatachannel2 = _interopRequireDefault(_simpleDatachannel);

var _socket = require("socket.io-client");

var _socket2 = _interopRequireDefault(_socket);

var _Kademlia = require("../kad/Kademlia");

var _Kademlia2 = _interopRequireDefault(_Kademlia);

var _KApp = require("../kad/KApp");

var _KApp2 = _interopRequireDefault(_KApp);

var _sha = require("sha1");

var _sha2 = _interopRequireDefault(_sha);

var _events = require("events");

var _events2 = _interopRequireDefault(_events);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var def = {
  OFFER: "OFFER",
  ANSWER: "ANSWER",
  ONCOMMAND: "ONCOMMAND"
};

var peerOffer = void 0;

var Node = function () {
  function Node(targetAddress, targetPort) {
    var _this = this;

    _classCallCheck(this, Node);

    this.targetUrl = undefined;
    if (targetAddress !== undefined && targetAddress.length > 0) {
      this.targetUrl = "http://" + targetAddress + ":" + targetPort;
      console.log(this.targetUrl);
    }
    this.nodeId = (0, _sha2.default)(Math.random().toString());
    console.log("nodeId", this.nodeId);
    this.kad = new _Kademlia2.default(this.nodeId);
    this.kApp = new _KApp2.default(this.kad);
    this.ev = new _events2.default.EventEmitter();

    this.kad.ev.on(def.ONCOMMAND, function (networkLayer) {
      if (JSON.stringify(networkLayer).includes("p2ch")) {
        console.log("node oncommand", networkLayer);
        _this.ev.emit("p2ch", networkLayer);
      }
    });

    if (this.targetUrl !== undefined) {
      var socket = _socket2.default.connect(this.targetUrl);

      socket.on("connect", function () {
        console.log("socket connected");
        _this.offerFirst(socket);
      });

      socket.on(def.ANSWER, function (data) {
        console.log("answer id", data.nodeId);
        peerOffer.connecting(data.nodeId);
        peerOffer.setAnswer(data.sdp);
      });
    }
  }

  _createClass(Node, [{
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
        console.log("first connected");
        _this2.kad.addknode(peerOffer);
      });
    }
  }, {
    key: "broadCast",
    value: function broadCast(data) {
      this.kApp.broadcast(data);
    }
  }, {
    key: "send",
    value: function send(target, data) {
      this.kad.send(target, data);
    }
  }]);

  return Node;
}();

exports.default = Node;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ub2RlL05vZGUuanMiXSwibmFtZXMiOlsiZGVmIiwiT0ZGRVIiLCJBTlNXRVIiLCJPTkNPTU1BTkQiLCJwZWVyT2ZmZXIiLCJOb2RlIiwidGFyZ2V0QWRkcmVzcyIsInRhcmdldFBvcnQiLCJ0YXJnZXRVcmwiLCJ1bmRlZmluZWQiLCJsZW5ndGgiLCJjb25zb2xlIiwibG9nIiwibm9kZUlkIiwiTWF0aCIsInJhbmRvbSIsInRvU3RyaW5nIiwia2FkIiwiS2FkZW1saWEiLCJrQXBwIiwiS0FwcCIsImV2IiwiZXZlbnRzIiwiRXZlbnRFbWl0dGVyIiwib24iLCJKU09OIiwic3RyaW5naWZ5IiwibmV0d29ya0xheWVyIiwiaW5jbHVkZXMiLCJlbWl0Iiwic29ja2V0IiwiY2xpZW50IiwiY29ubmVjdCIsIm9mZmVyRmlyc3QiLCJkYXRhIiwiY29ubmVjdGluZyIsInNldEFuc3dlciIsInNkcCIsIldlYlJUQyIsIm1ha2VPZmZlciIsIm9uY2UiLCJ0eXBlIiwiY29ubmVjdGVkIiwiYWRka25vZGUiLCJicm9hZGNhc3QiLCJ0YXJnZXQiLCJzZW5kIl0sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUFBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7Ozs7Ozs7QUFFQSxJQUFNQSxNQUFNO0FBQ1ZDLFNBQU8sT0FERztBQUVWQyxVQUFRLFFBRkU7QUFHVkMsYUFBVztBQUhELENBQVo7O0FBTUEsSUFBSUMsa0JBQUo7O0lBQ3FCQyxJO0FBQ25CLGdCQUFZQyxhQUFaLEVBQTJCQyxVQUEzQixFQUF1QztBQUFBOztBQUFBOztBQUNyQyxTQUFLQyxTQUFMLEdBQWlCQyxTQUFqQjtBQUNBLFFBQUlILGtCQUFrQkcsU0FBbEIsSUFBK0JILGNBQWNJLE1BQWQsR0FBdUIsQ0FBMUQsRUFBNkQ7QUFDM0QsV0FBS0YsU0FBTCxHQUFpQixZQUFZRixhQUFaLEdBQTRCLEdBQTVCLEdBQWtDQyxVQUFuRDtBQUNBSSxjQUFRQyxHQUFSLENBQVksS0FBS0osU0FBakI7QUFDRDtBQUNELFNBQUtLLE1BQUwsR0FBYyxtQkFBS0MsS0FBS0MsTUFBTCxHQUFjQyxRQUFkLEVBQUwsQ0FBZDtBQUNBTCxZQUFRQyxHQUFSLENBQVksUUFBWixFQUFzQixLQUFLQyxNQUEzQjtBQUNBLFNBQUtJLEdBQUwsR0FBVyxJQUFJQyxrQkFBSixDQUFhLEtBQUtMLE1BQWxCLENBQVg7QUFDQSxTQUFLTSxJQUFMLEdBQVksSUFBSUMsY0FBSixDQUFTLEtBQUtILEdBQWQsQ0FBWjtBQUNBLFNBQUtJLEVBQUwsR0FBVSxJQUFJQyxpQkFBT0MsWUFBWCxFQUFWOztBQUVBLFNBQUtOLEdBQUwsQ0FBU0ksRUFBVCxDQUFZRyxFQUFaLENBQWV4QixJQUFJRyxTQUFuQixFQUE4Qix3QkFBZ0I7QUFDNUMsVUFBSXNCLEtBQUtDLFNBQUwsQ0FBZUMsWUFBZixFQUE2QkMsUUFBN0IsQ0FBc0MsTUFBdEMsQ0FBSixFQUFtRDtBQUNqRGpCLGdCQUFRQyxHQUFSLENBQVksZ0JBQVosRUFBOEJlLFlBQTlCO0FBQ0EsY0FBS04sRUFBTCxDQUFRUSxJQUFSLENBQWEsTUFBYixFQUFxQkYsWUFBckI7QUFDRDtBQUNGLEtBTEQ7O0FBT0EsUUFBSSxLQUFLbkIsU0FBTCxLQUFtQkMsU0FBdkIsRUFBa0M7QUFDaEMsVUFBTXFCLFNBQVNDLGlCQUFPQyxPQUFQLENBQWUsS0FBS3hCLFNBQXBCLENBQWY7O0FBRUFzQixhQUFPTixFQUFQLENBQVUsU0FBVixFQUFxQixZQUFNO0FBQ3pCYixnQkFBUUMsR0FBUixDQUFZLGtCQUFaO0FBQ0EsY0FBS3FCLFVBQUwsQ0FBZ0JILE1BQWhCO0FBQ0QsT0FIRDs7QUFLQUEsYUFBT04sRUFBUCxDQUFVeEIsSUFBSUUsTUFBZCxFQUFzQixnQkFBUTtBQUM1QlMsZ0JBQVFDLEdBQVIsQ0FBWSxXQUFaLEVBQXlCc0IsS0FBS3JCLE1BQTlCO0FBQ0FULGtCQUFVK0IsVUFBVixDQUFxQkQsS0FBS3JCLE1BQTFCO0FBQ0FULGtCQUFVZ0MsU0FBVixDQUFvQkYsS0FBS0csR0FBekI7QUFDRCxPQUpEO0FBS0Q7QUFDRjs7OzsrQkFFVVAsTSxFQUFRO0FBQUE7O0FBQ2pCbkIsY0FBUUMsR0FBUixDQUFZLE1BQVosRUFBb0IsYUFBcEI7QUFDQVIsa0JBQVksSUFBSWtDLDJCQUFKLEVBQVo7QUFDQWxDLGdCQUFVbUMsU0FBVjs7QUFFQW5DLGdCQUFVaUIsRUFBVixDQUFhbUIsSUFBYixDQUFrQixRQUFsQixFQUE0QixlQUFPO0FBQ2pDVixlQUFPRCxJQUFQLENBQVk3QixJQUFJQyxLQUFoQixFQUF1QjtBQUNyQndDLGdCQUFNekMsSUFBSUMsS0FEVztBQUVyQlksa0JBQVEsT0FBS0EsTUFGUTtBQUdyQndCLGVBQUtBO0FBSGdCLFNBQXZCO0FBS0QsT0FORDs7QUFRQWpDLGdCQUFVaUIsRUFBVixDQUFhbUIsSUFBYixDQUFrQixTQUFsQixFQUE2QixZQUFNO0FBQ2pDcEMsa0JBQVVzQyxTQUFWO0FBQ0EvQixnQkFBUUMsR0FBUixDQUFZLGlCQUFaO0FBQ0EsZUFBS0ssR0FBTCxDQUFTMEIsUUFBVCxDQUFrQnZDLFNBQWxCO0FBQ0QsT0FKRDtBQUtEOzs7OEJBRVM4QixJLEVBQU07QUFDZCxXQUFLZixJQUFMLENBQVV5QixTQUFWLENBQW9CVixJQUFwQjtBQUNEOzs7eUJBRUlXLE0sRUFBUVgsSSxFQUFNO0FBQ2pCLFdBQUtqQixHQUFMLENBQVM2QixJQUFULENBQWNELE1BQWQsRUFBc0JYLElBQXRCO0FBQ0Q7Ozs7OztrQkE5RGtCN0IsSSIsImZpbGUiOiJOb2RlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFdlYlJUQyBmcm9tIFwic2ltcGxlLWRhdGFjaGFubmVsXCI7XG5pbXBvcnQgY2xpZW50IGZyb20gXCJzb2NrZXQuaW8tY2xpZW50XCI7XG5pbXBvcnQgS2FkZW1saWEgZnJvbSBcIi4uL2thZC9LYWRlbWxpYVwiO1xuaW1wb3J0IEtBcHAgZnJvbSBcIi4uL2thZC9LQXBwXCI7XG5pbXBvcnQgc2hhMSBmcm9tIFwic2hhMVwiO1xuaW1wb3J0IGV2ZW50cyBmcm9tIFwiZXZlbnRzXCI7XG5cbmNvbnN0IGRlZiA9IHtcbiAgT0ZGRVI6IFwiT0ZGRVJcIixcbiAgQU5TV0VSOiBcIkFOU1dFUlwiLFxuICBPTkNPTU1BTkQ6IFwiT05DT01NQU5EXCJcbn07XG5cbmxldCBwZWVyT2ZmZXI7XG5leHBvcnQgZGVmYXVsdCBjbGFzcyBOb2RlIHtcbiAgY29uc3RydWN0b3IodGFyZ2V0QWRkcmVzcywgdGFyZ2V0UG9ydCkge1xuICAgIHRoaXMudGFyZ2V0VXJsID0gdW5kZWZpbmVkO1xuICAgIGlmICh0YXJnZXRBZGRyZXNzICE9PSB1bmRlZmluZWQgJiYgdGFyZ2V0QWRkcmVzcy5sZW5ndGggPiAwKSB7XG4gICAgICB0aGlzLnRhcmdldFVybCA9IFwiaHR0cDovL1wiICsgdGFyZ2V0QWRkcmVzcyArIFwiOlwiICsgdGFyZ2V0UG9ydDtcbiAgICAgIGNvbnNvbGUubG9nKHRoaXMudGFyZ2V0VXJsKTtcbiAgICB9XG4gICAgdGhpcy5ub2RlSWQgPSBzaGExKE1hdGgucmFuZG9tKCkudG9TdHJpbmcoKSk7XG4gICAgY29uc29sZS5sb2coXCJub2RlSWRcIiwgdGhpcy5ub2RlSWQpO1xuICAgIHRoaXMua2FkID0gbmV3IEthZGVtbGlhKHRoaXMubm9kZUlkKTtcbiAgICB0aGlzLmtBcHAgPSBuZXcgS0FwcCh0aGlzLmthZCk7XG4gICAgdGhpcy5ldiA9IG5ldyBldmVudHMuRXZlbnRFbWl0dGVyKCk7XG5cbiAgICB0aGlzLmthZC5ldi5vbihkZWYuT05DT01NQU5ELCBuZXR3b3JrTGF5ZXIgPT4ge1xuICAgICAgaWYgKEpTT04uc3RyaW5naWZ5KG5ldHdvcmtMYXllcikuaW5jbHVkZXMoXCJwMmNoXCIpKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwibm9kZSBvbmNvbW1hbmRcIiwgbmV0d29ya0xheWVyKTtcbiAgICAgICAgdGhpcy5ldi5lbWl0KFwicDJjaFwiLCBuZXR3b3JrTGF5ZXIpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgaWYgKHRoaXMudGFyZ2V0VXJsICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGNvbnN0IHNvY2tldCA9IGNsaWVudC5jb25uZWN0KHRoaXMudGFyZ2V0VXJsKTtcblxuICAgICAgc29ja2V0Lm9uKFwiY29ubmVjdFwiLCAoKSA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwic29ja2V0IGNvbm5lY3RlZFwiKTtcbiAgICAgICAgdGhpcy5vZmZlckZpcnN0KHNvY2tldCk7XG4gICAgICB9KTtcblxuICAgICAgc29ja2V0Lm9uKGRlZi5BTlNXRVIsIGRhdGEgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZyhcImFuc3dlciBpZFwiLCBkYXRhLm5vZGVJZCk7XG4gICAgICAgIHBlZXJPZmZlci5jb25uZWN0aW5nKGRhdGEubm9kZUlkKTtcbiAgICAgICAgcGVlck9mZmVyLnNldEFuc3dlcihkYXRhLnNkcCk7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBvZmZlckZpcnN0KHNvY2tldCkge1xuICAgIGNvbnNvbGUubG9nKFwiQGNsaVwiLCBcIm9mZmVyIGZpcnN0XCIpO1xuICAgIHBlZXJPZmZlciA9IG5ldyBXZWJSVEMoKTtcbiAgICBwZWVyT2ZmZXIubWFrZU9mZmVyKCk7XG5cbiAgICBwZWVyT2ZmZXIuZXYub25jZShcInNpZ25hbFwiLCBzZHAgPT4ge1xuICAgICAgc29ja2V0LmVtaXQoZGVmLk9GRkVSLCB7XG4gICAgICAgIHR5cGU6IGRlZi5PRkZFUixcbiAgICAgICAgbm9kZUlkOiB0aGlzLm5vZGVJZCxcbiAgICAgICAgc2RwOiBzZHBcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgcGVlck9mZmVyLmV2Lm9uY2UoXCJjb25uZWN0XCIsICgpID0+IHtcbiAgICAgIHBlZXJPZmZlci5jb25uZWN0ZWQoKTtcbiAgICAgIGNvbnNvbGUubG9nKFwiZmlyc3QgY29ubmVjdGVkXCIpO1xuICAgICAgdGhpcy5rYWQuYWRka25vZGUocGVlck9mZmVyKTtcbiAgICB9KTtcbiAgfVxuXG4gIGJyb2FkQ2FzdChkYXRhKSB7XG4gICAgdGhpcy5rQXBwLmJyb2FkY2FzdChkYXRhKTtcbiAgfVxuXG4gIHNlbmQodGFyZ2V0LCBkYXRhKSB7XG4gICAgdGhpcy5rYWQuc2VuZCh0YXJnZXQsIGRhdGEpO1xuICB9XG59XG4iXX0=
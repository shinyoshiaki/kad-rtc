"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _sha = _interopRequireDefault(require("sha1"));

var _util = require("../util");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var BroadCast =
/*#__PURE__*/
function () {
  function BroadCast(kad) {
    _classCallCheck(this, BroadCast);

    _defineProperty(this, "kad", void 0);

    _defineProperty(this, "hashs", []);

    _defineProperty(this, "onBroadcast", {});

    _defineProperty(this, "events", {
      broadcast: this.onBroadcast
    });

    this.kad = kad;
  }

  _createClass(BroadCast, [{
    key: "broadcast",
    value: function broadcast(msg) {
      this.hashs.push((0, _sha.default)(msg).toString());
      this.kad.f.getAllPeers().forEach(function (peer) {
        peer.send(msg, "broadcast");
      });
    }
  }, {
    key: "responder",
    value: function responder(message) {
      if (!(message.label === "broadcast")) return;
      var hash = (0, _sha.default)(message.data).toString();

      if (!this.hashs.includes(hash)) {
        this.hashs.push(hash);
        this.broadcast(message.data);
        (0, _util.excuteEvent)(this.events.broadcast, message.data);
      }
    }
  }]);

  return BroadCast;
}();

exports.default = BroadCast;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ub2RlL2Jyb2FkY2FzdC50cyJdLCJuYW1lcyI6WyJCcm9hZENhc3QiLCJrYWQiLCJicm9hZGNhc3QiLCJvbkJyb2FkY2FzdCIsIm1zZyIsImhhc2hzIiwicHVzaCIsInRvU3RyaW5nIiwiZiIsImdldEFsbFBlZXJzIiwiZm9yRWFjaCIsInBlZXIiLCJzZW5kIiwibWVzc2FnZSIsImxhYmVsIiwiaGFzaCIsImRhdGEiLCJpbmNsdWRlcyIsImV2ZW50cyJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUVBOztBQUNBOzs7Ozs7Ozs7Ozs7SUFFcUJBLFM7OztBQUtuQixxQkFBWUMsR0FBWixFQUEyQjtBQUFBOztBQUFBOztBQUFBLG1DQUhULEVBR1M7O0FBQUEseUNBRkosRUFFSTs7QUFBQSxvQ0FEbEI7QUFBRUMsTUFBQUEsU0FBUyxFQUFFLEtBQUtDO0FBQWxCLEtBQ2tCOztBQUN6QixTQUFLRixHQUFMLEdBQVdBLEdBQVg7QUFDRDs7Ozs4QkFFU0csRyxFQUFhO0FBQ3JCLFdBQUtDLEtBQUwsQ0FBV0MsSUFBWCxDQUFnQixrQkFBS0YsR0FBTCxFQUFVRyxRQUFWLEVBQWhCO0FBQ0EsV0FBS04sR0FBTCxDQUFTTyxDQUFULENBQVdDLFdBQVgsR0FBeUJDLE9BQXpCLENBQWlDLFVBQUFDLElBQUksRUFBSTtBQUN2Q0EsUUFBQUEsSUFBSSxDQUFDQyxJQUFMLENBQVVSLEdBQVYsRUFBZSxXQUFmO0FBQ0QsT0FGRDtBQUdEOzs7OEJBRVNTLE8sRUFBa0I7QUFDMUIsVUFBSSxFQUFFQSxPQUFPLENBQUNDLEtBQVIsS0FBa0IsV0FBcEIsQ0FBSixFQUFzQztBQUV0QyxVQUFNQyxJQUFJLEdBQUcsa0JBQUtGLE9BQU8sQ0FBQ0csSUFBYixFQUFtQlQsUUFBbkIsRUFBYjs7QUFDQSxVQUFJLENBQUMsS0FBS0YsS0FBTCxDQUFXWSxRQUFYLENBQW9CRixJQUFwQixDQUFMLEVBQWdDO0FBQzlCLGFBQUtWLEtBQUwsQ0FBV0MsSUFBWCxDQUFnQlMsSUFBaEI7QUFDQSxhQUFLYixTQUFMLENBQWVXLE9BQU8sQ0FBQ0csSUFBdkI7QUFDQSwrQkFBWSxLQUFLRSxNQUFMLENBQVloQixTQUF4QixFQUFtQ1csT0FBTyxDQUFDRyxJQUEzQztBQUNEO0FBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgS2FkZW1saWEgZnJvbSBcIi4uL2thZC9rYWRlbWxpYVwiO1xuaW1wb3J0IHsgbWVzc2FnZSB9IGZyb20gXCJ3ZWJydGM0bWUvbGliL2ludGVyZmFjZVwiO1xuaW1wb3J0IHNoYTEgZnJvbSBcInNoYTFcIjtcbmltcG9ydCB7IElFdmVudHMsIGV4Y3V0ZUV2ZW50IH0gZnJvbSBcIi4uL3V0aWxcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQnJvYWRDYXN0IHtcbiAga2FkOiBLYWRlbWxpYTtcbiAgaGFzaHM6IHN0cmluZ1tdID0gW107XG4gIG9uQnJvYWRjYXN0OiBJRXZlbnRzID0ge307XG4gIGV2ZW50cyA9IHsgYnJvYWRjYXN0OiB0aGlzLm9uQnJvYWRjYXN0IH07XG4gIGNvbnN0cnVjdG9yKGthZDogS2FkZW1saWEpIHtcbiAgICB0aGlzLmthZCA9IGthZDtcbiAgfVxuXG4gIGJyb2FkY2FzdChtc2c6IHN0cmluZykge1xuICAgIHRoaXMuaGFzaHMucHVzaChzaGExKG1zZykudG9TdHJpbmcoKSk7XG4gICAgdGhpcy5rYWQuZi5nZXRBbGxQZWVycygpLmZvckVhY2gocGVlciA9PiB7XG4gICAgICBwZWVyLnNlbmQobXNnLCBcImJyb2FkY2FzdFwiKTtcbiAgICB9KTtcbiAgfVxuXG4gIHJlc3BvbmRlcihtZXNzYWdlOiBtZXNzYWdlKSB7XG4gICAgaWYgKCEobWVzc2FnZS5sYWJlbCA9PT0gXCJicm9hZGNhc3RcIikpIHJldHVybjtcblxuICAgIGNvbnN0IGhhc2ggPSBzaGExKG1lc3NhZ2UuZGF0YSkudG9TdHJpbmcoKTtcbiAgICBpZiAoIXRoaXMuaGFzaHMuaW5jbHVkZXMoaGFzaCkpIHtcbiAgICAgIHRoaXMuaGFzaHMucHVzaChoYXNoKTtcbiAgICAgIHRoaXMuYnJvYWRjYXN0KG1lc3NhZ2UuZGF0YSk7XG4gICAgICBleGN1dGVFdmVudCh0aGlzLmV2ZW50cy5icm9hZGNhc3QsIG1lc3NhZ2UuZGF0YSk7XG4gICAgfVxuICB9XG59XG4iXX0=
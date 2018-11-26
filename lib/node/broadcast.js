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
    var _this = this;

    _classCallCheck(this, BroadCast);

    _defineProperty(this, "kad", void 0);

    _defineProperty(this, "hashs", []);

    _defineProperty(this, "onBroadcast", {});

    _defineProperty(this, "events", {
      broadcast: this.onBroadcast
    });

    this.kad = kad;

    this.kad.events.responder["broadcast.ts"] = function (message) {
      _this.responder(message);
    };
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ub2RlL2Jyb2FkY2FzdC50cyJdLCJuYW1lcyI6WyJCcm9hZENhc3QiLCJrYWQiLCJicm9hZGNhc3QiLCJvbkJyb2FkY2FzdCIsImV2ZW50cyIsInJlc3BvbmRlciIsIm1lc3NhZ2UiLCJtc2ciLCJoYXNocyIsInB1c2giLCJ0b1N0cmluZyIsImYiLCJnZXRBbGxQZWVycyIsImZvckVhY2giLCJwZWVyIiwic2VuZCIsImxhYmVsIiwiaGFzaCIsImRhdGEiLCJpbmNsdWRlcyJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUVBOztBQUNBOzs7Ozs7Ozs7Ozs7SUFFcUJBLFM7OztBQUtuQixxQkFBWUMsR0FBWixFQUEyQjtBQUFBOztBQUFBOztBQUFBOztBQUFBLG1DQUhELEVBR0M7O0FBQUEseUNBRkksRUFFSjs7QUFBQSxvQ0FEbEI7QUFBRUMsTUFBQUEsU0FBUyxFQUFFLEtBQUtDO0FBQWxCLEtBQ2tCOztBQUN6QixTQUFLRixHQUFMLEdBQVdBLEdBQVg7O0FBQ0EsU0FBS0EsR0FBTCxDQUFTRyxNQUFULENBQWdCQyxTQUFoQixDQUEwQixjQUExQixJQUE0QyxVQUFDQyxPQUFELEVBQXNCO0FBQ2hFLE1BQUEsS0FBSSxDQUFDRCxTQUFMLENBQWVDLE9BQWY7QUFDRCxLQUZEO0FBR0Q7Ozs7OEJBRVNDLEcsRUFBYTtBQUNyQixXQUFLQyxLQUFMLENBQVdDLElBQVgsQ0FBZ0Isa0JBQUtGLEdBQUwsRUFBVUcsUUFBVixFQUFoQjtBQUNBLFdBQUtULEdBQUwsQ0FBU1UsQ0FBVCxDQUFXQyxXQUFYLEdBQXlCQyxPQUF6QixDQUFpQyxVQUFBQyxJQUFJLEVBQUk7QUFDdkNBLFFBQUFBLElBQUksQ0FBQ0MsSUFBTCxDQUFVUixHQUFWLEVBQWUsV0FBZjtBQUNELE9BRkQ7QUFHRDs7OzhCQUVpQkQsTyxFQUFrQjtBQUNsQyxVQUFJLEVBQUVBLE9BQU8sQ0FBQ1UsS0FBUixLQUFrQixXQUFwQixDQUFKLEVBQXNDO0FBRXRDLFVBQU1DLElBQUksR0FBRyxrQkFBS1gsT0FBTyxDQUFDWSxJQUFiLEVBQW1CUixRQUFuQixFQUFiOztBQUNBLFVBQUksQ0FBQyxLQUFLRixLQUFMLENBQVdXLFFBQVgsQ0FBb0JGLElBQXBCLENBQUwsRUFBZ0M7QUFDOUIsYUFBS1QsS0FBTCxDQUFXQyxJQUFYLENBQWdCUSxJQUFoQjtBQUNBLGFBQUtmLFNBQUwsQ0FBZUksT0FBTyxDQUFDWSxJQUF2QjtBQUNBLCtCQUFZLEtBQUtkLE1BQUwsQ0FBWUYsU0FBeEIsRUFBbUNJLE9BQU8sQ0FBQ1ksSUFBM0M7QUFDRDtBQUNGIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IEthZGVtbGlhIGZyb20gXCIuLi9rYWQva2FkZW1saWFcIjtcbmltcG9ydCB7IG1lc3NhZ2UgfSBmcm9tIFwid2VicnRjNG1lL2xpYi9pbnRlcmZhY2VcIjtcbmltcG9ydCBzaGExIGZyb20gXCJzaGExXCI7XG5pbXBvcnQgeyBJRXZlbnRzLCBleGN1dGVFdmVudCB9IGZyb20gXCIuLi91dGlsXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEJyb2FkQ2FzdCB7XG4gIGthZDogS2FkZW1saWE7XG4gIHByaXZhdGUgaGFzaHM6IHN0cmluZ1tdID0gW107XG4gIHByaXZhdGUgb25Ccm9hZGNhc3Q6IElFdmVudHMgPSB7fTtcbiAgZXZlbnRzID0geyBicm9hZGNhc3Q6IHRoaXMub25Ccm9hZGNhc3QgfTtcbiAgY29uc3RydWN0b3Ioa2FkOiBLYWRlbWxpYSkge1xuICAgIHRoaXMua2FkID0ga2FkO1xuICAgIHRoaXMua2FkLmV2ZW50cy5yZXNwb25kZXJbXCJicm9hZGNhc3QudHNcIl0gPSAobWVzc2FnZTogbWVzc2FnZSkgPT4ge1xuICAgICAgdGhpcy5yZXNwb25kZXIobWVzc2FnZSk7XG4gICAgfTtcbiAgfVxuXG4gIGJyb2FkY2FzdChtc2c6IHN0cmluZykge1xuICAgIHRoaXMuaGFzaHMucHVzaChzaGExKG1zZykudG9TdHJpbmcoKSk7XG4gICAgdGhpcy5rYWQuZi5nZXRBbGxQZWVycygpLmZvckVhY2gocGVlciA9PiB7XG4gICAgICBwZWVyLnNlbmQobXNnLCBcImJyb2FkY2FzdFwiKTtcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgcmVzcG9uZGVyKG1lc3NhZ2U6IG1lc3NhZ2UpIHtcbiAgICBpZiAoIShtZXNzYWdlLmxhYmVsID09PSBcImJyb2FkY2FzdFwiKSkgcmV0dXJuO1xuXG4gICAgY29uc3QgaGFzaCA9IHNoYTEobWVzc2FnZS5kYXRhKS50b1N0cmluZygpO1xuICAgIGlmICghdGhpcy5oYXNocy5pbmNsdWRlcyhoYXNoKSkge1xuICAgICAgdGhpcy5oYXNocy5wdXNoKGhhc2gpO1xuICAgICAgdGhpcy5icm9hZGNhc3QobWVzc2FnZS5kYXRhKTtcbiAgICAgIGV4Y3V0ZUV2ZW50KHRoaXMuZXZlbnRzLmJyb2FkY2FzdCwgbWVzc2FnZS5kYXRhKTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==
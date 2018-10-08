"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var KStorage =
/*#__PURE__*/
function () {
  function KStorage() {
    _classCallCheck(this, KStorage);

    _defineProperty(this, "kvs", {});
  }

  _createClass(KStorage, [{
    key: "set",
    value: function set(key, value) {
      this.kvs[key] = value;
    }
  }, {
    key: "get",
    value: function get(key) {
      if (Object.keys(this.kvs).includes(key)) {
        return this.kvs[key];
      } else {
        return false;
      }
    }
  }]);

  return KStorage;
}();

exports.default = KStorage;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9rYWQvS3N0b3JhZ2UudHMiXSwibmFtZXMiOlsiS1N0b3JhZ2UiLCJrZXkiLCJ2YWx1ZSIsImt2cyIsIk9iamVjdCIsImtleXMiLCJpbmNsdWRlcyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0lBQXFCQSxROzs7Ozs7aUNBQ1csRTs7Ozs7d0JBRTFCQyxHLEVBQWFDLEssRUFBWTtBQUMzQixXQUFLQyxHQUFMLENBQVNGLEdBQVQsSUFBZ0JDLEtBQWhCO0FBQ0Q7Ozt3QkFFR0QsRyxFQUFhO0FBQ2YsVUFBSUcsTUFBTSxDQUFDQyxJQUFQLENBQVksS0FBS0YsR0FBakIsRUFBc0JHLFFBQXRCLENBQStCTCxHQUEvQixDQUFKLEVBQXlDO0FBQ3ZDLGVBQU8sS0FBS0UsR0FBTCxDQUFTRixHQUFULENBQVA7QUFDRCxPQUZELE1BRU87QUFDTCxlQUFPLEtBQVA7QUFDRDtBQUNGIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGRlZmF1bHQgY2xhc3MgS1N0b3JhZ2Uge1xuICBrdnM6IHsgW2tleTogc3RyaW5nXTogYW55IH0gPSB7fTtcblxuICBzZXQoa2V5OiBzdHJpbmcsIHZhbHVlOiBhbnkpIHtcbiAgICB0aGlzLmt2c1trZXldID0gdmFsdWU7XG4gIH1cblxuICBnZXQoa2V5OiBzdHJpbmcpIHtcbiAgICBpZiAoT2JqZWN0LmtleXModGhpcy5rdnMpLmluY2x1ZGVzKGtleSkpIHtcbiAgICAgIHJldHVybiB0aGlzLmt2c1trZXldO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG59XG4iXX0=
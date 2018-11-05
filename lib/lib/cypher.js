"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _keypair = _interopRequireDefault(require("keypair"));

var _crypto = _interopRequireDefault(require("crypto"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var Buffer = require("buffer/").Buffer;

var Cypher =
/*#__PURE__*/
function () {
  function Cypher(secKey, pubKey) {
    _classCallCheck(this, Cypher);

    _defineProperty(this, "secKey", void 0);

    _defineProperty(this, "pubKey", void 0);

    if (secKey && pubKey) {
      this.secKey = secKey;
      this.pubKey = pubKey;
    } else {
      var pair = (0, _keypair.default)();
      this.secKey = pair.private;
      this.pubKey = pair.public;
    }
  }

  _createClass(Cypher, [{
    key: "encrypt",
    value: function encrypt(raw) {
      var encrypted = _crypto.default.privateEncrypt(this.secKey, new Buffer.from(raw));

      return encrypted.toString("base64");
    }
  }, {
    key: "decrypt",
    value: function decrypt(encrypted, publicKey) {
      var decrypted = _crypto.default.publicDecrypt(publicKey, new Buffer.from(encrypted, "base64"));

      return decrypted.toString("utf8");
    }
  }]);

  return Cypher;
}();

exports.default = Cypher;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9saWIvY3lwaGVyLnRzIl0sIm5hbWVzIjpbIkJ1ZmZlciIsInJlcXVpcmUiLCJDeXBoZXIiLCJzZWNLZXkiLCJwdWJLZXkiLCJwYWlyIiwicHJpdmF0ZSIsInB1YmxpYyIsInJhdyIsImVuY3J5cHRlZCIsImNyeXB0byIsInByaXZhdGVFbmNyeXB0IiwiZnJvbSIsInRvU3RyaW5nIiwicHVibGljS2V5IiwiZGVjcnlwdGVkIiwicHVibGljRGVjcnlwdCJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFBOztBQUNBOzs7Ozs7Ozs7Ozs7QUFDQSxJQUFNQSxNQUFNLEdBQUdDLE9BQU8sQ0FBQyxTQUFELENBQVAsQ0FBbUJELE1BQWxDOztJQUVxQkUsTTs7O0FBR25CLGtCQUFZQyxNQUFaLEVBQTZCQyxNQUE3QixFQUE4QztBQUFBOztBQUFBOztBQUFBOztBQUM1QyxRQUFJRCxNQUFNLElBQUlDLE1BQWQsRUFBc0I7QUFDcEIsV0FBS0QsTUFBTCxHQUFjQSxNQUFkO0FBQ0EsV0FBS0MsTUFBTCxHQUFjQSxNQUFkO0FBQ0QsS0FIRCxNQUdPO0FBQ0wsVUFBTUMsSUFBSSxHQUFHLHVCQUFiO0FBQ0EsV0FBS0YsTUFBTCxHQUFjRSxJQUFJLENBQUNDLE9BQW5CO0FBQ0EsV0FBS0YsTUFBTCxHQUFjQyxJQUFJLENBQUNFLE1BQW5CO0FBQ0Q7QUFDRjs7Ozs0QkFFT0MsRyxFQUFhO0FBQ25CLFVBQU1DLFNBQVMsR0FBR0MsZ0JBQU9DLGNBQVAsQ0FBc0IsS0FBS1IsTUFBM0IsRUFBbUMsSUFBSUgsTUFBTSxDQUFDWSxJQUFYLENBQWdCSixHQUFoQixDQUFuQyxDQUFsQjs7QUFDQSxhQUFPQyxTQUFTLENBQUNJLFFBQVYsQ0FBbUIsUUFBbkIsQ0FBUDtBQUNEOzs7NEJBRU9KLFMsRUFBbUJLLFMsRUFBbUI7QUFDNUMsVUFBTUMsU0FBUyxHQUFHTCxnQkFBT00sYUFBUCxDQUNoQkYsU0FEZ0IsRUFFaEIsSUFBSWQsTUFBTSxDQUFDWSxJQUFYLENBQWdCSCxTQUFoQixFQUEyQixRQUEzQixDQUZnQixDQUFsQjs7QUFJQSxhQUFPTSxTQUFTLENBQUNGLFFBQVYsQ0FBbUIsTUFBbkIsQ0FBUDtBQUNEIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGtleXBhaXIgZnJvbSBcImtleXBhaXJcIjtcbmltcG9ydCBjcnlwdG8gZnJvbSBcImNyeXB0b1wiO1xuY29uc3QgQnVmZmVyID0gcmVxdWlyZShcImJ1ZmZlci9cIikuQnVmZmVyO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDeXBoZXIge1xuICBzZWNLZXk6IHN0cmluZztcbiAgcHViS2V5OiBzdHJpbmc7XG4gIGNvbnN0cnVjdG9yKHNlY0tleT86IHN0cmluZywgcHViS2V5Pzogc3RyaW5nKSB7XG4gICAgaWYgKHNlY0tleSAmJiBwdWJLZXkpIHtcbiAgICAgIHRoaXMuc2VjS2V5ID0gc2VjS2V5O1xuICAgICAgdGhpcy5wdWJLZXkgPSBwdWJLZXk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHBhaXIgPSBrZXlwYWlyKCk7XG4gICAgICB0aGlzLnNlY0tleSA9IHBhaXIucHJpdmF0ZTtcbiAgICAgIHRoaXMucHViS2V5ID0gcGFpci5wdWJsaWM7XG4gICAgfVxuICB9XG5cbiAgZW5jcnlwdChyYXc6IHN0cmluZykge1xuICAgIGNvbnN0IGVuY3J5cHRlZCA9IGNyeXB0by5wcml2YXRlRW5jcnlwdCh0aGlzLnNlY0tleSwgbmV3IEJ1ZmZlci5mcm9tKHJhdykpO1xuICAgIHJldHVybiBlbmNyeXB0ZWQudG9TdHJpbmcoXCJiYXNlNjRcIik7XG4gIH1cblxuICBkZWNyeXB0KGVuY3J5cHRlZDogc3RyaW5nLCBwdWJsaWNLZXk6IHN0cmluZykge1xuICAgIGNvbnN0IGRlY3J5cHRlZCA9IGNyeXB0by5wdWJsaWNEZWNyeXB0KFxuICAgICAgcHVibGljS2V5LFxuICAgICAgbmV3IEJ1ZmZlci5mcm9tKGVuY3J5cHRlZCwgXCJiYXNlNjRcIilcbiAgICApO1xuICAgIHJldHVybiBkZWNyeXB0ZWQudG9TdHJpbmcoXCJ1dGY4XCIpO1xuICB9XG59XG4iXX0=
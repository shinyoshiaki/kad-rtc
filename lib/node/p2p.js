"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _bson = require("bson");

var _util = require("../util");

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var bson = new _bson.BSON();

var P2P =
/*#__PURE__*/
function () {
  function P2P(kad) {
    _classCallCheck(this, P2P);

    _defineProperty(this, "kad", void 0);

    _defineProperty(this, "p2pMsgBuffer", {});

    _defineProperty(this, "onP2P", {});

    _defineProperty(this, "events", {
      p2p: this.onP2P
    });

    this.kad = kad;
  }

  _createClass(P2P, [{
    key: "send",
    value: function () {
      var _send = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee3(target, data) {
        var _this = this;

        var send;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                send =
                /*#__PURE__*/
                function () {
                  var _ref = _asyncToGenerator(
                  /*#__PURE__*/
                  regeneratorRuntime.mark(function _callee(peer) {
                    var packet, bin, _file, i, chunk, _bin;

                    return regeneratorRuntime.wrap(function _callee$(_context) {
                      while (1) {
                        switch (_context.prev = _context.next) {
                          case 0:
                            packet = {
                              sender: _this.kad.nodeId,
                              target: target
                            };

                            if (!data.text) {
                              _context.next = 7;
                              break;
                            }

                            packet.text = data.text;
                            bin = bson.serialize(packet);
                            peer.send(bin, "p2p");
                            _context.next = 20;
                            break;

                          case 7:
                            if (!data.file) {
                              _context.next = 20;
                              break;
                            }

                            _file = data.file;
                            i = 0;

                          case 10:
                            if (!(i < _file.value.length)) {
                              _context.next = 20;
                              break;
                            }

                            chunk = _file.value[i];
                            packet.file = {
                              index: i,
                              length: _file.value.length,
                              chunk: Buffer.from(chunk),
                              filename: _file.name
                            };
                            _bin = bson.serialize(packet);
                            peer.send(_bin, "p2p");
                            _context.next = 17;
                            return new Promise(function (r) {
                              return setTimeout(r, 10);
                            });

                          case 17:
                            i++;
                            _context.next = 10;
                            break;

                          case 20:
                          case "end":
                            return _context.stop();
                        }
                      }
                    }, _callee, this);
                  }));

                  return function send(_x3) {
                    return _ref.apply(this, arguments);
                  };
                }();

                return _context3.abrupt("return", new Promise(
                /*#__PURE__*/
                function () {
                  var _ref2 = _asyncToGenerator(
                  /*#__PURE__*/
                  regeneratorRuntime.mark(function _callee2(resolve, reject) {
                    var peer, close, result;
                    return regeneratorRuntime.wrap(function _callee2$(_context2) {
                      while (1) {
                        switch (_context2.prev = _context2.next) {
                          case 0:
                            peer = _this.kad.f.getPeerFromnodeId(target);

                            if (!peer) {
                              _context2.next = 7;
                              break;
                            }

                            _context2.next = 4;
                            return send(peer);

                          case 4:
                            resolve(true);
                            _context2.next = 18;
                            break;

                          case 7:
                            close = _this.kad.f.getCloseEstPeer(target);

                            if (close) {
                              _context2.next = 10;
                              break;
                            }

                            return _context2.abrupt("return");

                          case 10:
                            _context2.next = 12;
                            return _this.kad.findNode(target, close).catch(console.log);

                          case 12:
                            result = _context2.sent;

                            if (result) {
                              _context2.next = 15;
                              break;
                            }

                            return _context2.abrupt("return");

                          case 15:
                            _context2.next = 17;
                            return send(result);

                          case 17:
                            resolve(true);

                          case 18:
                            _context2.next = 20;
                            return new Promise(function (r) {
                              return setTimeout(r, 10 * 1000);
                            });

                          case 20:
                            reject("send timeout");

                          case 21:
                          case "end":
                            return _context2.stop();
                        }
                      }
                    }, _callee2, this);
                  }));

                  return function (_x4, _x5) {
                    return _ref2.apply(this, arguments);
                  };
                }()));

              case 2:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      return function send(_x, _x2) {
        return _send.apply(this, arguments);
      };
    }()
  }, {
    key: "responder",
    value: function responder(message) {
      if (message.label === "p2p") {
        var buffer = Buffer.from(message.data);
        var packet = bson.deserialize(buffer);

        if (packet.text) {
          var payload = {
            nodeId: packet.sender,
            text: packet.text
          };
          (0, _util.excuteEvent)(this.events.p2p, payload);
        } else if (packet.file) {
          if (packet.file.index === 0) this.p2pMsgBuffer[packet.sender] = [];
          this.p2pMsgBuffer[packet.sender].push(packet.file.chunk.buffer);

          if (packet.file.index === packet.file.length - 1) {
            var _payload = {
              nodeId: packet.sender,
              file: this.p2pMsgBuffer[packet.sender],
              filename: packet.file.filename
            };
            (0, _util.excuteEvent)(this.events.p2p, _payload);
          }
        }
      }
    }
  }]);

  return P2P;
}();

exports.default = P2P;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ub2RlL3AycC50cyJdLCJuYW1lcyI6WyJic29uIiwiQlNPTiIsIlAyUCIsImthZCIsInAycCIsIm9uUDJQIiwidGFyZ2V0IiwiZGF0YSIsInNlbmQiLCJwZWVyIiwicGFja2V0Iiwic2VuZGVyIiwibm9kZUlkIiwidGV4dCIsImJpbiIsInNlcmlhbGl6ZSIsImZpbGUiLCJpIiwidmFsdWUiLCJsZW5ndGgiLCJjaHVuayIsImluZGV4IiwiQnVmZmVyIiwiZnJvbSIsImZpbGVuYW1lIiwibmFtZSIsIlByb21pc2UiLCJyIiwic2V0VGltZW91dCIsInJlc29sdmUiLCJyZWplY3QiLCJmIiwiZ2V0UGVlckZyb21ub2RlSWQiLCJjbG9zZSIsImdldENsb3NlRXN0UGVlciIsImZpbmROb2RlIiwiY2F0Y2giLCJjb25zb2xlIiwibG9nIiwicmVzdWx0IiwibWVzc2FnZSIsImxhYmVsIiwiYnVmZmVyIiwiZGVzZXJpYWxpemUiLCJwYXlsb2FkIiwiZXZlbnRzIiwicDJwTXNnQnVmZmVyIiwicHVzaCJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUVBOztBQUVBOzs7Ozs7Ozs7Ozs7OztBQUVBLElBQU1BLElBQUksR0FBRyxJQUFJQyxVQUFKLEVBQWI7O0lBRXFCQyxHOzs7QUFPbkIsZUFBWUMsR0FBWixFQUEyQjtBQUFBOztBQUFBOztBQUFBLDBDQUxjLEVBS2Q7O0FBQUEsbUNBSm9DLEVBSXBDOztBQUFBLG9DQUhsQjtBQUNQQyxNQUFBQSxHQUFHLEVBQUUsS0FBS0M7QUFESCxLQUdrQjs7QUFDekIsU0FBS0YsR0FBTCxHQUFXQSxHQUFYO0FBQ0Q7Ozs7Ozs7Z0RBR0NHLE0sRUFDQUMsSTs7Ozs7Ozs7QUFFTUMsZ0JBQUFBLEk7Ozs7OzBDQUFPLGlCQUFPQyxJQUFQO0FBQUE7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFDTEMsNEJBQUFBLE1BREssR0FDZ0I7QUFDekJDLDhCQUFBQSxNQUFNLEVBQUUsS0FBSSxDQUFDUixHQUFMLENBQVNTLE1BRFE7QUFF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QWtEO0FBQ2hELGdCQUFNeUIsUUFBd0IsR0FBRztBQUMvQmhDLGNBQUFBLE1BQU0sRUFBRUYsTUFBTSxDQUFDQyxNQURnQjtBQUUvQkssY0FBQUEsSUFBSSxFQUFFLEtBQUs4QixZQUFMLENBQWtCcEMsTUFBTSxDQUFDQyxNQUF6QixDQUZ5QjtBQUcvQmEsY0FBQUEsUUFBUSxFQUFFZCxNQUFNLENBQUNNLElBQVAsQ0FBWVE7QUFIUyxhQUFqQztBQUtBLG1DQUFZLEtBQUtxQixNQUFMLENBQVl6QyxHQUF4QixFQUE2QndDLFFBQTdCO0FBQ0Q7QUFDRjtBQUNGO0FBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgS2FkZW1saWEgZnJvbSBcIi4uL2thZC9rYWRlbWxpYVwiO1xuaW1wb3J0IFdlYlJUQyBmcm9tIFwid2VicnRjNG1lXCI7XG5pbXBvcnQgeyBCU09OIH0gZnJvbSBcImJzb25cIjtcbmltcG9ydCB7IG1lc3NhZ2UgfSBmcm9tIFwid2VicnRjNG1lL2xpYi9pbnRlcmZhY2VcIjtcbmltcG9ydCB7IGV4Y3V0ZUV2ZW50IH0gZnJvbSBcIi4uL3V0aWxcIjtcblxuY29uc3QgYnNvbiA9IG5ldyBCU09OKCk7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFAyUCB7XG4gIGthZDogS2FkZW1saWE7XG4gIHAycE1zZ0J1ZmZlcjogeyBba2V5OiBzdHJpbmddOiBhbnlbXSB9ID0ge307XG4gIG9uUDJQOiB7IFtrZXk6IHN0cmluZ106IChwYXlsb2FkOiBwMnBNZXNzYWdlRXZlbnQpID0+IHZvaWQgfSA9IHt9O1xuICBldmVudHMgPSB7XG4gICAgcDJwOiB0aGlzLm9uUDJQXG4gIH07XG4gIGNvbnN0cnVjdG9yKGthZDogS2FkZW1saWEpIHtcbiAgICB0aGlzLmthZCA9IGthZDtcbiAgfVxuXG4gIGFzeW5jIHNlbmQoXG4gICAgdGFyZ2V0OiBzdHJpbmcsXG4gICAgZGF0YTogeyB0ZXh0Pzogc3RyaW5nOyBmaWxlPzogeyBuYW1lOiBzdHJpbmc7IHZhbHVlOiBBcnJheUJ1ZmZlcltdIH0gfVxuICApIHtcbiAgICBjb25zdCBzZW5kID0gYXN5bmMgKHBlZXI6IFdlYlJUQykgPT4ge1xuICAgICAgY29uc3QgcGFja2V0OiBwMnBNZXNzYWdlID0ge1xuICAgICAgICBzZW5kZXI6IHRoaXMua2FkLm5vZGVJZCxcbiAgICAgICAgdGFyZ2V0XG4gICAgICB9O1xuICAgICAgaWYgKGRhdGEudGV4dCkge1xuICAgICAgICBwYWNrZXQudGV4dCA9IGRhdGEudGV4dDtcbiAgICAgICAgY29uc3QgYmluID0gYnNvbi5zZXJpYWxpemUocGFja2V0KTtcbiAgICAgICAgcGVlci5zZW5kKGJpbiwgXCJwMnBcIik7XG4gICAgICB9IGVsc2UgaWYgKGRhdGEuZmlsZSkge1xuICAgICAgICBjb25zdCBmaWxlID0gZGF0YS5maWxlO1xuXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZmlsZS52YWx1ZS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGNvbnN0IGNodW5rID0gZmlsZS52YWx1ZVtpXTtcbiAgICAgICAgICBwYWNrZXQuZmlsZSA9IHtcbiAgICAgICAgICAgIGluZGV4OiBpLFxuICAgICAgICAgICAgbGVuZ3RoOiBmaWxlLnZhbHVlLmxlbmd0aCxcbiAgICAgICAgICAgIGNodW5rOiBCdWZmZXIuZnJvbShjaHVuayksXG4gICAgICAgICAgICBmaWxlbmFtZTogZmlsZS5uYW1lXG4gICAgICAgICAgfTtcbiAgICAgICAgICBjb25zdCBiaW4gPSBic29uLnNlcmlhbGl6ZShwYWNrZXQpO1xuICAgICAgICAgIHBlZXIuc2VuZChiaW4sIFwicDJwXCIpO1xuICAgICAgICAgIGF3YWl0IG5ldyBQcm9taXNlKHIgPT4gc2V0VGltZW91dChyLCAxMCkpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiBuZXcgUHJvbWlzZTxhbnk+KGFzeW5jIChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGNvbnN0IHBlZXIgPSB0aGlzLmthZC5mLmdldFBlZXJGcm9tbm9kZUlkKHRhcmdldCk7XG4gICAgICBpZiAocGVlcikge1xuICAgICAgICBhd2FpdCBzZW5kKHBlZXIpO1xuICAgICAgICByZXNvbHZlKHRydWUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgY2xvc2UgPSB0aGlzLmthZC5mLmdldENsb3NlRXN0UGVlcih0YXJnZXQpO1xuICAgICAgICBpZiAoIWNsb3NlKSByZXR1cm47XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMua2FkXG4gICAgICAgICAgLmZpbmROb2RlKHRhcmdldCwgY2xvc2UpXG4gICAgICAgICAgLmNhdGNoKGNvbnNvbGUubG9nKTtcbiAgICAgICAgaWYgKCFyZXN1bHQpIHJldHVybjtcbiAgICAgICAgYXdhaXQgc2VuZChyZXN1bHQpO1xuICAgICAgICByZXNvbHZlKHRydWUpO1xuICAgICAgfVxuICAgICAgYXdhaXQgbmV3IFByb21pc2UociA9PiBzZXRUaW1lb3V0KHIsIDEwICogMTAwMCkpO1xuICAgICAgcmVqZWN0KFwic2VuZCB0aW1lb3V0XCIpO1xuICAgIH0pO1xuICB9XG5cbiAgcmVzcG9uZGVyKG1lc3NhZ2U6IG1lc3NhZ2UpIHtcbiAgICBpZiAobWVzc2FnZS5sYWJlbCA9PT0gXCJwMnBcIikge1xuICAgICAgY29uc3QgYnVmZmVyOiBCdWZmZXIgPSBCdWZmZXIuZnJvbShtZXNzYWdlLmRhdGEpO1xuICAgICAgY29uc3QgcGFja2V0OiBwMnBNZXNzYWdlID0gYnNvbi5kZXNlcmlhbGl6ZShidWZmZXIpO1xuICAgICAgaWYgKHBhY2tldC50ZXh0KSB7XG4gICAgICAgIGNvbnN0IHBheWxvYWQ6IHAycE1lc3NhZ2VFdmVudCA9IHtcbiAgICAgICAgICBub2RlSWQ6IHBhY2tldC5zZW5kZXIsXG4gICAgICAgICAgdGV4dDogcGFja2V0LnRleHRcbiAgICAgICAgfTtcbiAgICAgICAgZXhjdXRlRXZlbnQodGhpcy5ldmVudHMucDJwLCBwYXlsb2FkKTtcbiAgICAgIH0gZWxzZSBpZiAocGFja2V0LmZpbGUpIHtcbiAgICAgICAgaWYgKHBhY2tldC5maWxlLmluZGV4ID09PSAwKSB0aGlzLnAycE1zZ0J1ZmZlcltwYWNrZXQuc2VuZGVyXSA9IFtdO1xuICAgICAgICB0aGlzLnAycE1zZ0J1ZmZlcltwYWNrZXQuc2VuZGVyXS5wdXNoKHBhY2tldC5maWxlLmNodW5rLmJ1ZmZlcik7XG4gICAgICAgIGlmIChwYWNrZXQuZmlsZS5pbmRleCA9PT0gcGFja2V0LmZpbGUubGVuZ3RoIC0gMSkge1xuICAgICAgICAgIGNvbnN0IHBheWxvYWQ6IHAycE1lc3NhZ2VFdmVudCA9IHtcbiAgICAgICAgICAgIG5vZGVJZDogcGFja2V0LnNlbmRlcixcbiAgICAgICAgICAgIGZpbGU6IHRoaXMucDJwTXNnQnVmZmVyW3BhY2tldC5zZW5kZXJdLFxuICAgICAgICAgICAgZmlsZW5hbWU6IHBhY2tldC5maWxlLmZpbGVuYW1lXG4gICAgICAgICAgfTtcbiAgICAgICAgICBleGN1dGVFdmVudCh0aGlzLmV2ZW50cy5wMnAsIHBheWxvYWQpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG59XG4iXX0=
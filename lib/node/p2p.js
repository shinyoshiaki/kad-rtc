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
    var _this = this;

    _classCallCheck(this, P2P);

    _defineProperty(this, "kad", void 0);

    _defineProperty(this, "p2pMsgBuffer", {});

    _defineProperty(this, "onP2P", {});

    _defineProperty(this, "events", {
      p2p: this.onP2P
    });

    this.kad = kad;

    this.kad.events.responder["p2p.ts"] = function (message) {
      _this.responder(message);
    };
  }

  _createClass(P2P, [{
    key: "send",
    value: function () {
      var _send = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee3(target, data) {
        var _this2 = this;

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
                              sender: _this2.kad.nodeId,
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
                    }, _callee);
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
                            peer = _this2.kad.f.getPeerFromnodeId(target);

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
                            close = _this2.kad.f.getCloseEstPeer(target);

                            if (close) {
                              _context2.next = 10;
                              break;
                            }

                            return _context2.abrupt("return");

                          case 10:
                            _context2.next = 12;
                            return _this2.kad.findNode(target, close).catch(console.log);

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
                    }, _callee2);
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
        }, _callee3);
      }));

      function send(_x, _x2) {
        return _send.apply(this, arguments);
      }

      return send;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ub2RlL3AycC50cyJdLCJuYW1lcyI6WyJic29uIiwiQlNPTiIsIlAyUCIsImthZCIsInAycCIsIm9uUDJQIiwiZXZlbnRzIiwicmVzcG9uZGVyIiwibWVzc2FnZSIsInRhcmdldCIsImRhdGEiLCJzZW5kIiwicGVlciIsInBhY2tldCIsInNlbmRlciIsIm5vZGVJZCIsInRleHQiLCJiaW4iLCJzZXJpYWxpemUiLCJmaWxlIiwiaSIsInZhbHVlIiwibGVuZ3RoIiwiY2h1bmsiLCJpbmRleCIsIkJ1ZmZlciIsImZyb20iLCJmaWxlbmFtZSIsIm5hbWUiLCJQcm9taXNlIiwiciIsInNldFRpbWVvdXQiLCJyZXNvbHZlIiwicmVqZWN0IiwiZiIsImdldFBlZXJGcm9tbm9kZUlkIiwiY2xvc2UiLCJnZXRDbG9zZUVzdFBlZXIiLCJmaW5kTm9kZSIsImNhdGNoIiwiY29uc29sZSIsImxvZyIsInJlc3VsdCIsImxhYmVsIiwiYnVmZmVyIiwiZGVzZXJpYWxpemUiLCJwYXlsb2FkIiwicDJwTXNnQnVmZmVyIiwicHVzaCJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUVBOztBQUVBOzs7Ozs7Ozs7Ozs7OztBQUdBLElBQU1BLElBQUksR0FBRyxJQUFJQyxVQUFKLEVBQWI7O0lBRXFCQyxHOzs7QUFPbkIsZUFBWUMsR0FBWixFQUEyQjtBQUFBOztBQUFBOztBQUFBOztBQUFBLDBDQUxzQixFQUt0Qjs7QUFBQSxtQ0FKRixFQUlFOztBQUFBLG9DQUhsQjtBQUNQQyxNQUFBQSxHQUFHLEVBQUUsS0FBS0M7QUFESCxLQUdrQjs7QUFDekIsU0FBS0YsR0FBTCxHQUFXQSxHQUFYOztBQUNBLFNBQUtBLEdBQUwsQ0FBU0csTUFBVCxDQUFnQkMsU0FBaEIsQ0FBMEIsUUFBMUIsSUFBc0MsVUFBQ0MsT0FBRCxFQUFzQjtBQUMxRCxNQUFBLEtBQUksQ0FBQ0QsU0FBTCxDQUFlQyxPQUFmO0FBQ0QsS0FGRDtBQUdEOzs7Ozs7O2dEQUdDQyxNLEVBQ0FDLEk7Ozs7Ozs7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Q2tDLElBQWpDLENBQXNDbkMsTUFBTSxDQUFDTSxJQUFQLENBQVlJLEtBQVosQ0FBa0JxQixNQUF4RDs7QUFDQSxjQUFJL0IsTUFBTSxDQUFDTSxJQUFQLENBQVlLLEtBQVosS0FBc0JYLE1BQU0sQ0FBQ00sSUFBUCxDQUFZRyxNQUFaLEdBQXFCLENBQS9DLEVBQWtEO0FBQ2hELGdCQUFNd0IsUUFBd0IsR0FBRztBQUMvQi9CLGNBQUFBLE1BQU0sRUFBRUYsTUFBTSxDQUFDQyxNQURnQjtBQUUvQkssY0FBQUEsSUFBSSxFQUFFLEtBQUs0QixZQUFMLENBQWtCbEMsTUFBTSxDQUFDQyxNQUF6QixDQUZ5QjtBQUcvQmEsY0FBQUEsUUFBUSxFQUFFZCxNQUFNLENBQUNNLElBQVAsQ0FBWVE7QUFIUyxhQUFqQztBQUtBLG1DQUFZLEtBQUtyQixNQUFMLENBQVlGLEdBQXhCLEVBQTZCMEMsUUFBN0I7QUFDRDtBQUNGO0FBQ0Y7QUFDRiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBLYWRlbWxpYSBmcm9tIFwiLi4va2FkL2thZGVtbGlhXCI7XG5pbXBvcnQgV2ViUlRDIGZyb20gXCJ3ZWJydGM0bWVcIjtcbmltcG9ydCB7IEJTT04gfSBmcm9tIFwiYnNvblwiO1xuaW1wb3J0IHsgbWVzc2FnZSB9IGZyb20gXCJ3ZWJydGM0bWUvbGliL2ludGVyZmFjZVwiO1xuaW1wb3J0IHsgZXhjdXRlRXZlbnQsIElFdmVudHMgfSBmcm9tIFwiLi4vdXRpbFwiO1xuaW1wb3J0IHsgcDJwTWVzc2FnZSwgcDJwTWVzc2FnZUV2ZW50IH0gZnJvbSBcIi4uL2thZC9pbnRlcmZhY2VcIjtcblxuY29uc3QgYnNvbiA9IG5ldyBCU09OKCk7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFAyUCB7XG4gIGthZDogS2FkZW1saWE7XG4gIHByaXZhdGUgcDJwTXNnQnVmZmVyOiB7IFtrZXk6IHN0cmluZ106IGFueVtdIH0gPSB7fTtcbiAgcHJpdmF0ZSBvblAyUDogSUV2ZW50cyA9IHt9O1xuICBldmVudHMgPSB7XG4gICAgcDJwOiB0aGlzLm9uUDJQXG4gIH07XG4gIGNvbnN0cnVjdG9yKGthZDogS2FkZW1saWEpIHtcbiAgICB0aGlzLmthZCA9IGthZDtcbiAgICB0aGlzLmthZC5ldmVudHMucmVzcG9uZGVyW1wicDJwLnRzXCJdID0gKG1lc3NhZ2U6IG1lc3NhZ2UpID0+IHtcbiAgICAgIHRoaXMucmVzcG9uZGVyKG1lc3NhZ2UpO1xuICAgIH07XG4gIH1cblxuICBhc3luYyBzZW5kKFxuICAgIHRhcmdldDogc3RyaW5nLFxuICAgIGRhdGE6IHsgdGV4dD86IHN0cmluZzsgZmlsZT86IHsgbmFtZTogc3RyaW5nOyB2YWx1ZTogQXJyYXlCdWZmZXJbXSB9IH1cbiAgKSB7XG4gICAgY29uc3Qgc2VuZCA9IGFzeW5jIChwZWVyOiBXZWJSVEMpID0+IHtcbiAgICAgIGNvbnN0IHBhY2tldDogcDJwTWVzc2FnZSA9IHtcbiAgICAgICAgc2VuZGVyOiB0aGlzLmthZC5ub2RlSWQsXG4gICAgICAgIHRhcmdldFxuICAgICAgfTtcbiAgICAgIGlmIChkYXRhLnRleHQpIHtcbiAgICAgICAgcGFja2V0LnRleHQgPSBkYXRhLnRleHQ7XG4gICAgICAgIGNvbnN0IGJpbiA9IGJzb24uc2VyaWFsaXplKHBhY2tldCk7XG4gICAgICAgIHBlZXIuc2VuZChiaW4sIFwicDJwXCIpO1xuICAgICAgfSBlbHNlIGlmIChkYXRhLmZpbGUpIHtcbiAgICAgICAgY29uc3QgZmlsZSA9IGRhdGEuZmlsZTtcblxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGZpbGUudmFsdWUubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBjb25zdCBjaHVuayA9IGZpbGUudmFsdWVbaV07XG4gICAgICAgICAgcGFja2V0LmZpbGUgPSB7XG4gICAgICAgICAgICBpbmRleDogaSxcbiAgICAgICAgICAgIGxlbmd0aDogZmlsZS52YWx1ZS5sZW5ndGgsXG4gICAgICAgICAgICBjaHVuazogQnVmZmVyLmZyb20oY2h1bmspLFxuICAgICAgICAgICAgZmlsZW5hbWU6IGZpbGUubmFtZVxuICAgICAgICAgIH07XG4gICAgICAgICAgY29uc3QgYmluID0gYnNvbi5zZXJpYWxpemUocGFja2V0KTtcbiAgICAgICAgICBwZWVyLnNlbmQoYmluLCBcInAycFwiKTtcbiAgICAgICAgICBhd2FpdCBuZXcgUHJvbWlzZShyID0+IHNldFRpbWVvdXQociwgMTApKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG5cbiAgICByZXR1cm4gbmV3IFByb21pc2U8YW55Pihhc3luYyAocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjb25zdCBwZWVyID0gdGhpcy5rYWQuZi5nZXRQZWVyRnJvbW5vZGVJZCh0YXJnZXQpO1xuICAgICAgaWYgKHBlZXIpIHtcbiAgICAgICAgYXdhaXQgc2VuZChwZWVyKTtcbiAgICAgICAgcmVzb2x2ZSh0cnVlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IGNsb3NlID0gdGhpcy5rYWQuZi5nZXRDbG9zZUVzdFBlZXIodGFyZ2V0KTtcbiAgICAgICAgaWYgKCFjbG9zZSkgcmV0dXJuO1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0aGlzLmthZFxuICAgICAgICAgIC5maW5kTm9kZSh0YXJnZXQsIGNsb3NlKVxuICAgICAgICAgIC5jYXRjaChjb25zb2xlLmxvZyk7XG4gICAgICAgIGlmICghcmVzdWx0KSByZXR1cm47XG4gICAgICAgIGF3YWl0IHNlbmQocmVzdWx0KTtcbiAgICAgICAgcmVzb2x2ZSh0cnVlKTtcbiAgICAgIH1cbiAgICAgIGF3YWl0IG5ldyBQcm9taXNlKHIgPT4gc2V0VGltZW91dChyLCAxMCAqIDEwMDApKTtcbiAgICAgIHJlamVjdChcInNlbmQgdGltZW91dFwiKTtcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgcmVzcG9uZGVyKG1lc3NhZ2U6IG1lc3NhZ2UpIHtcbiAgICBpZiAobWVzc2FnZS5sYWJlbCA9PT0gXCJwMnBcIikge1xuICAgICAgY29uc3QgYnVmZmVyOiBCdWZmZXIgPSBCdWZmZXIuZnJvbShtZXNzYWdlLmRhdGEpO1xuICAgICAgY29uc3QgcGFja2V0OiBwMnBNZXNzYWdlID0gYnNvbi5kZXNlcmlhbGl6ZShidWZmZXIpO1xuICAgICAgaWYgKHBhY2tldC50ZXh0KSB7XG4gICAgICAgIGNvbnN0IHBheWxvYWQ6IHAycE1lc3NhZ2VFdmVudCA9IHtcbiAgICAgICAgICBub2RlSWQ6IHBhY2tldC5zZW5kZXIsXG4gICAgICAgICAgdGV4dDogcGFja2V0LnRleHRcbiAgICAgICAgfTtcbiAgICAgICAgZXhjdXRlRXZlbnQodGhpcy5ldmVudHMucDJwLCBwYXlsb2FkKTtcbiAgICAgIH0gZWxzZSBpZiAocGFja2V0LmZpbGUpIHtcbiAgICAgICAgaWYgKHBhY2tldC5maWxlLmluZGV4ID09PSAwKSB0aGlzLnAycE1zZ0J1ZmZlcltwYWNrZXQuc2VuZGVyXSA9IFtdO1xuICAgICAgICB0aGlzLnAycE1zZ0J1ZmZlcltwYWNrZXQuc2VuZGVyXS5wdXNoKHBhY2tldC5maWxlLmNodW5rLmJ1ZmZlcik7XG4gICAgICAgIGlmIChwYWNrZXQuZmlsZS5pbmRleCA9PT0gcGFja2V0LmZpbGUubGVuZ3RoIC0gMSkge1xuICAgICAgICAgIGNvbnN0IHBheWxvYWQ6IHAycE1lc3NhZ2VFdmVudCA9IHtcbiAgICAgICAgICAgIG5vZGVJZDogcGFja2V0LnNlbmRlcixcbiAgICAgICAgICAgIGZpbGU6IHRoaXMucDJwTXNnQnVmZmVyW3BhY2tldC5zZW5kZXJdLFxuICAgICAgICAgICAgZmlsZW5hbWU6IHBhY2tldC5maWxlLmZpbGVuYW1lXG4gICAgICAgICAgfTtcbiAgICAgICAgICBleGN1dGVFdmVudCh0aGlzLmV2ZW50cy5wMnAsIHBheWxvYWQpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG59XG4iXX0=
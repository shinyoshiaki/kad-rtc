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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ub2RlL3AycC50cyJdLCJuYW1lcyI6WyJic29uIiwiQlNPTiIsIlAyUCIsImthZCIsInAycCIsIm9uUDJQIiwiZXZlbnRzIiwicmVzcG9uZGVyIiwibWVzc2FnZSIsInRhcmdldCIsImRhdGEiLCJzZW5kIiwicGVlciIsInBhY2tldCIsInNlbmRlciIsIm5vZGVJZCIsInRleHQiLCJiaW4iLCJzZXJpYWxpemUiLCJmaWxlIiwiaSIsInZhbHVlIiwibGVuZ3RoIiwiY2h1bmsiLCJpbmRleCIsIkJ1ZmZlciIsImZyb20iLCJmaWxlbmFtZSIsIm5hbWUiLCJQcm9taXNlIiwiciIsInNldFRpbWVvdXQiLCJyZXNvbHZlIiwicmVqZWN0IiwiZiIsImdldFBlZXJGcm9tbm9kZUlkIiwiY2xvc2UiLCJnZXRDbG9zZUVzdFBlZXIiLCJmaW5kTm9kZSIsImNhdGNoIiwiY29uc29sZSIsImxvZyIsInJlc3VsdCIsImxhYmVsIiwiYnVmZmVyIiwiZGVzZXJpYWxpemUiLCJwYXlsb2FkIiwicDJwTXNnQnVmZmVyIiwicHVzaCJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUVBOztBQUVBOzs7Ozs7Ozs7Ozs7OztBQUdBLElBQU1BLElBQUksR0FBRyxJQUFJQyxVQUFKLEVBQWI7O0lBRXFCQyxHOzs7QUFPbkIsZUFBWUMsR0FBWixFQUEyQjtBQUFBOztBQUFBOztBQUFBOztBQUFBLDBDQUxzQixFQUt0Qjs7QUFBQSxtQ0FKRixFQUlFOztBQUFBLG9DQUhsQjtBQUNQQyxNQUFBQSxHQUFHLEVBQUUsS0FBS0M7QUFESCxLQUdrQjs7QUFDekIsU0FBS0YsR0FBTCxHQUFXQSxHQUFYOztBQUNBLFNBQUtBLEdBQUwsQ0FBU0csTUFBVCxDQUFnQkMsU0FBaEIsQ0FBMEIsUUFBMUIsSUFBc0MsVUFBQ0MsT0FBRCxFQUFzQjtBQUMxRCxNQUFBLEtBQUksQ0FBQ0QsU0FBTCxDQUFlQyxPQUFmO0FBQ0QsS0FGRDtBQUdEOzs7Ozs7O2dEQUdDQyxNLEVBQ0FDLEk7Ozs7Ozs7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QyxJQUFqQyxDQUFzQ25DLE1BQU0sQ0FBQ00sSUFBUCxDQUFZSSxLQUFaLENBQWtCcUIsTUFBeEQ7O0FBQ0EsY0FBSS9CLE1BQU0sQ0FBQ00sSUFBUCxDQUFZSyxLQUFaLEtBQXNCWCxNQUFNLENBQUNNLElBQVAsQ0FBWUcsTUFBWixHQUFxQixDQUEvQyxFQUFrRDtBQUNoRCxnQkFBTXdCLFFBQXdCLEdBQUc7QUFDL0IvQixjQUFBQSxNQUFNLEVBQUVGLE1BQU0sQ0FBQ0MsTUFEZ0I7QUFFL0JLLGNBQUFBLElBQUksRUFBRSxLQUFLNEIsWUFBTCxDQUFrQmxDLE1BQU0sQ0FBQ0MsTUFBekIsQ0FGeUI7QUFHL0JhLGNBQUFBLFFBQVEsRUFBRWQsTUFBTSxDQUFDTSxJQUFQLENBQVlRO0FBSFMsYUFBakM7QUFLQSxtQ0FBWSxLQUFLckIsTUFBTCxDQUFZRixHQUF4QixFQUE2QjBDLFFBQTdCO0FBQ0Q7QUFDRjtBQUNGO0FBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgS2FkZW1saWEgZnJvbSBcIi4uL2thZC9rYWRlbWxpYVwiO1xuaW1wb3J0IFdlYlJUQyBmcm9tIFwid2VicnRjNG1lXCI7XG5pbXBvcnQgeyBCU09OIH0gZnJvbSBcImJzb25cIjtcbmltcG9ydCB7IG1lc3NhZ2UgfSBmcm9tIFwid2VicnRjNG1lL2xpYi9pbnRlcmZhY2VcIjtcbmltcG9ydCB7IGV4Y3V0ZUV2ZW50LCBJRXZlbnRzIH0gZnJvbSBcIi4uL3V0aWxcIjtcbmltcG9ydCB7IHAycE1lc3NhZ2UsIHAycE1lc3NhZ2VFdmVudCB9IGZyb20gXCIuLi9rYWQvaW50ZXJmYWNlXCI7XG5cbmNvbnN0IGJzb24gPSBuZXcgQlNPTigpO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQMlAge1xuICBrYWQ6IEthZGVtbGlhO1xuICBwcml2YXRlIHAycE1zZ0J1ZmZlcjogeyBba2V5OiBzdHJpbmddOiBhbnlbXSB9ID0ge307XG4gIHByaXZhdGUgb25QMlA6IElFdmVudHMgPSB7fTtcbiAgZXZlbnRzID0ge1xuICAgIHAycDogdGhpcy5vblAyUFxuICB9O1xuICBjb25zdHJ1Y3RvcihrYWQ6IEthZGVtbGlhKSB7XG4gICAgdGhpcy5rYWQgPSBrYWQ7XG4gICAgdGhpcy5rYWQuZXZlbnRzLnJlc3BvbmRlcltcInAycC50c1wiXSA9IChtZXNzYWdlOiBtZXNzYWdlKSA9PiB7XG4gICAgICB0aGlzLnJlc3BvbmRlcihtZXNzYWdlKTtcbiAgICB9O1xuICB9XG5cbiAgYXN5bmMgc2VuZChcbiAgICB0YXJnZXQ6IHN0cmluZyxcbiAgICBkYXRhOiB7IHRleHQ/OiBzdHJpbmc7IGZpbGU/OiB7IG5hbWU6IHN0cmluZzsgdmFsdWU6IEFycmF5QnVmZmVyW10gfSB9XG4gICkge1xuICAgIGNvbnN0IHNlbmQgPSBhc3luYyAocGVlcjogV2ViUlRDKSA9PiB7XG4gICAgICBjb25zdCBwYWNrZXQ6IHAycE1lc3NhZ2UgPSB7XG4gICAgICAgIHNlbmRlcjogdGhpcy5rYWQubm9kZUlkLFxuICAgICAgICB0YXJnZXRcbiAgICAgIH07XG4gICAgICBpZiAoZGF0YS50ZXh0KSB7XG4gICAgICAgIHBhY2tldC50ZXh0ID0gZGF0YS50ZXh0O1xuICAgICAgICBjb25zdCBiaW4gPSBic29uLnNlcmlhbGl6ZShwYWNrZXQpO1xuICAgICAgICBwZWVyLnNlbmQoYmluLCBcInAycFwiKTtcbiAgICAgIH0gZWxzZSBpZiAoZGF0YS5maWxlKSB7XG4gICAgICAgIGNvbnN0IGZpbGUgPSBkYXRhLmZpbGU7XG5cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBmaWxlLnZhbHVlLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgY29uc3QgY2h1bmsgPSBmaWxlLnZhbHVlW2ldO1xuICAgICAgICAgIHBhY2tldC5maWxlID0ge1xuICAgICAgICAgICAgaW5kZXg6IGksXG4gICAgICAgICAgICBsZW5ndGg6IGZpbGUudmFsdWUubGVuZ3RoLFxuICAgICAgICAgICAgY2h1bms6IEJ1ZmZlci5mcm9tKGNodW5rKSxcbiAgICAgICAgICAgIGZpbGVuYW1lOiBmaWxlLm5hbWVcbiAgICAgICAgICB9O1xuICAgICAgICAgIGNvbnN0IGJpbiA9IGJzb24uc2VyaWFsaXplKHBhY2tldCk7XG4gICAgICAgICAgcGVlci5zZW5kKGJpbiwgXCJwMnBcIik7XG4gICAgICAgICAgYXdhaXQgbmV3IFByb21pc2UociA9PiBzZXRUaW1lb3V0KHIsIDEwKSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlPGFueT4oYXN5bmMgKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY29uc3QgcGVlciA9IHRoaXMua2FkLmYuZ2V0UGVlckZyb21ub2RlSWQodGFyZ2V0KTtcbiAgICAgIGlmIChwZWVyKSB7XG4gICAgICAgIGF3YWl0IHNlbmQocGVlcik7XG4gICAgICAgIHJlc29sdmUodHJ1ZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBjbG9zZSA9IHRoaXMua2FkLmYuZ2V0Q2xvc2VFc3RQZWVyKHRhcmdldCk7XG4gICAgICAgIGlmICghY2xvc2UpIHJldHVybjtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5rYWRcbiAgICAgICAgICAuZmluZE5vZGUodGFyZ2V0LCBjbG9zZSlcbiAgICAgICAgICAuY2F0Y2goY29uc29sZS5sb2cpO1xuICAgICAgICBpZiAoIXJlc3VsdCkgcmV0dXJuO1xuICAgICAgICBhd2FpdCBzZW5kKHJlc3VsdCk7XG4gICAgICAgIHJlc29sdmUodHJ1ZSk7XG4gICAgICB9XG4gICAgICBhd2FpdCBuZXcgUHJvbWlzZShyID0+IHNldFRpbWVvdXQociwgMTAgKiAxMDAwKSk7XG4gICAgICByZWplY3QoXCJzZW5kIHRpbWVvdXRcIik7XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIHJlc3BvbmRlcihtZXNzYWdlOiBtZXNzYWdlKSB7XG4gICAgaWYgKG1lc3NhZ2UubGFiZWwgPT09IFwicDJwXCIpIHtcbiAgICAgIGNvbnN0IGJ1ZmZlcjogQnVmZmVyID0gQnVmZmVyLmZyb20obWVzc2FnZS5kYXRhKTtcbiAgICAgIGNvbnN0IHBhY2tldDogcDJwTWVzc2FnZSA9IGJzb24uZGVzZXJpYWxpemUoYnVmZmVyKTtcbiAgICAgIGlmIChwYWNrZXQudGV4dCkge1xuICAgICAgICBjb25zdCBwYXlsb2FkOiBwMnBNZXNzYWdlRXZlbnQgPSB7XG4gICAgICAgICAgbm9kZUlkOiBwYWNrZXQuc2VuZGVyLFxuICAgICAgICAgIHRleHQ6IHBhY2tldC50ZXh0XG4gICAgICAgIH07XG4gICAgICAgIGV4Y3V0ZUV2ZW50KHRoaXMuZXZlbnRzLnAycCwgcGF5bG9hZCk7XG4gICAgICB9IGVsc2UgaWYgKHBhY2tldC5maWxlKSB7XG4gICAgICAgIGlmIChwYWNrZXQuZmlsZS5pbmRleCA9PT0gMCkgdGhpcy5wMnBNc2dCdWZmZXJbcGFja2V0LnNlbmRlcl0gPSBbXTtcbiAgICAgICAgdGhpcy5wMnBNc2dCdWZmZXJbcGFja2V0LnNlbmRlcl0ucHVzaChwYWNrZXQuZmlsZS5jaHVuay5idWZmZXIpO1xuICAgICAgICBpZiAocGFja2V0LmZpbGUuaW5kZXggPT09IHBhY2tldC5maWxlLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgICBjb25zdCBwYXlsb2FkOiBwMnBNZXNzYWdlRXZlbnQgPSB7XG4gICAgICAgICAgICBub2RlSWQ6IHBhY2tldC5zZW5kZXIsXG4gICAgICAgICAgICBmaWxlOiB0aGlzLnAycE1zZ0J1ZmZlcltwYWNrZXQuc2VuZGVyXSxcbiAgICAgICAgICAgIGZpbGVuYW1lOiBwYWNrZXQuZmlsZS5maWxlbmFtZVxuICAgICAgICAgIH07XG4gICAgICAgICAgZXhjdXRlRXZlbnQodGhpcy5ldmVudHMucDJwLCBwYXlsb2FkKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxufVxuIl19
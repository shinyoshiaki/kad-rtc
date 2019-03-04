"use strict";

var _webrtc4me = _interopRequireDefault(require("webrtc4me"));

var _kademlia = _interopRequireDefault(require("../../kad/kademlia"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var portalNodeKad = new _kademlia.default();
var Kads = [];

function portalNodeAnswer(sdp, nodeId, callback) {
  var PortalNode = new _webrtc4me.default({
    disable_stun: true,
    nodeId: nodeId
  });
  PortalNode.setSdp(sdp);

  PortalNode.connect = function () {
    return portalNodeKad.addknode(PortalNode);
  };

  PortalNode.signal = function (local) {
    return callback(local);
  };
}

function connectNode(nodeId) {
  return new Promise(function (resolve) {
    var Node = new _webrtc4me.default({
      disable_stun: true,
      nodeId: portalNodeKad.nodeId
    });
    Node.makeOffer();

    Node.signal = function (local) {
      portalNodeAnswer(local, nodeId, function (sdp) {
        Node.setSdp(sdp);
      });
    };

    Node.connect = function () {
      resolve(Node);
    };
  });
}

test("store-findvalue",
/*#__PURE__*/
_asyncToGenerator(
/*#__PURE__*/
regeneratorRuntime.mark(function _callee() {
  var i, kad, node;
  return regeneratorRuntime.wrap(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          i = 0;

        case 1:
          if (!(i < 4)) {
            _context.next = 10;
            break;
          }

          kad = new _kademlia.default();
          _context.next = 5;
          return connectNode(kad.nodeId).catch(console.log);

        case 5:
          node = _context.sent;

          if (node) {
            Kads.push(kad);
            kad.addknode(node);
          }

        case 7:
          i++;
          _context.next = 1;
          break;

        case 10:
          expect("").toBe("");

        case 11:
        case "end":
          return _context.stop();
      }
    }
  }, _callee);
})));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy90ZXN0cy9lMmUvc3RvcmUtZmluZHZhbHVlLnRlc3QudHMiXSwibmFtZXMiOlsicG9ydGFsTm9kZUthZCIsIkthZGVtbGlhIiwiS2FkcyIsInBvcnRhbE5vZGVBbnN3ZXIiLCJzZHAiLCJub2RlSWQiLCJjYWxsYmFjayIsIlBvcnRhbE5vZGUiLCJXZWJSVEMiLCJkaXNhYmxlX3N0dW4iLCJzZXRTZHAiLCJjb25uZWN0IiwiYWRka25vZGUiLCJzaWduYWwiLCJsb2NhbCIsImNvbm5lY3ROb2RlIiwiUHJvbWlzZSIsInJlc29sdmUiLCJOb2RlIiwibWFrZU9mZmVyIiwidGVzdCIsImkiLCJrYWQiLCJjYXRjaCIsImNvbnNvbGUiLCJsb2ciLCJub2RlIiwicHVzaCIsImV4cGVjdCIsInRvQmUiXSwibWFwcGluZ3MiOiI7O0FBQUE7O0FBQ0E7Ozs7Ozs7O0FBRUEsSUFBTUEsYUFBYSxHQUFHLElBQUlDLGlCQUFKLEVBQXRCO0FBRUEsSUFBTUMsSUFBcUIsR0FBRyxFQUE5Qjs7QUFFQSxTQUFTQyxnQkFBVCxDQUNFQyxHQURGLEVBRUVDLE1BRkYsRUFHRUMsUUFIRixFQUlFO0FBQ0EsTUFBTUMsVUFBVSxHQUFHLElBQUlDLGtCQUFKLENBQVc7QUFBRUMsSUFBQUEsWUFBWSxFQUFFLElBQWhCO0FBQXNCSixJQUFBQSxNQUFNLEVBQUVBO0FBQTlCLEdBQVgsQ0FBbkI7QUFDQUUsRUFBQUEsVUFBVSxDQUFDRyxNQUFYLENBQWtCTixHQUFsQjs7QUFDQUcsRUFBQUEsVUFBVSxDQUFDSSxPQUFYLEdBQXFCO0FBQUEsV0FBTVgsYUFBYSxDQUFDWSxRQUFkLENBQXVCTCxVQUF2QixDQUFOO0FBQUEsR0FBckI7O0FBQ0FBLEVBQUFBLFVBQVUsQ0FBQ00sTUFBWCxHQUFvQixVQUFDQyxLQUFEO0FBQUEsV0FBZ0JSLFFBQVEsQ0FBQ1EsS0FBRCxDQUF4QjtBQUFBLEdBQXBCO0FBQ0Q7O0FBRUQsU0FBU0MsV0FBVCxDQUFxQlYsTUFBckIsRUFBcUM7QUFDbkMsU0FBTyxJQUFJVyxPQUFKLENBQW9CLFVBQUFDLE9BQU8sRUFBSTtBQUNwQyxRQUFNQyxJQUFJLEdBQUcsSUFBSVYsa0JBQUosQ0FBVztBQUN0QkMsTUFBQUEsWUFBWSxFQUFFLElBRFE7QUFFdEJKLE1BQUFBLE1BQU0sRUFBRUwsYUFBYSxDQUFDSztBQUZBLEtBQVgsQ0FBYjtBQUlBYSxJQUFBQSxJQUFJLENBQUNDLFNBQUw7O0FBQ0FELElBQUFBLElBQUksQ0FBQ0wsTUFBTCxHQUFjLFVBQUNDLEtBQUQsRUFBZ0I7QUFDNUJYLE1BQUFBLGdCQUFnQixDQUFDVyxLQUFELEVBQVFULE1BQVIsRUFBZ0IsVUFBQUQsR0FBRyxFQUFJO0FBQ3JDYyxRQUFBQSxJQUFJLENBQUNSLE1BQUwsQ0FBWU4sR0FBWjtBQUNELE9BRmUsQ0FBaEI7QUFHRCxLQUpEOztBQUtBYyxJQUFBQSxJQUFJLENBQUNQLE9BQUwsR0FBZSxZQUFNO0FBQ25CTSxNQUFBQSxPQUFPLENBQUNDLElBQUQsQ0FBUDtBQUNELEtBRkQ7QUFHRCxHQWRNLENBQVA7QUFlRDs7QUFFREUsSUFBSSxDQUFDLGlCQUFEO0FBQUE7QUFBQTtBQUFBO0FBQUEsd0JBQW9CO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUNiQyxVQUFBQSxDQURhLEdBQ1QsQ0FEUzs7QUFBQTtBQUFBLGdCQUNOQSxDQUFDLEdBQUcsQ0FERTtBQUFBO0FBQUE7QUFBQTs7QUFFZEMsVUFBQUEsR0FGYyxHQUVSLElBQUlyQixpQkFBSixFQUZRO0FBQUE7QUFBQSxpQkFHRGMsV0FBVyxDQUFDTyxHQUFHLENBQUNqQixNQUFMLENBQVgsQ0FBd0JrQixLQUF4QixDQUE4QkMsT0FBTyxDQUFDQyxHQUF0QyxDQUhDOztBQUFBO0FBR2RDLFVBQUFBLElBSGM7O0FBSXBCLGNBQUlBLElBQUosRUFBVTtBQUNSeEIsWUFBQUEsSUFBSSxDQUFDeUIsSUFBTCxDQUFVTCxHQUFWO0FBQ0FBLFlBQUFBLEdBQUcsQ0FBQ1YsUUFBSixDQUFhYyxJQUFiO0FBQ0Q7O0FBUG1CO0FBQ0NMLFVBQUFBLENBQUMsRUFERjtBQUFBO0FBQUE7O0FBQUE7QUFVdEJPLFVBQUFBLE1BQU0sQ0FBQyxFQUFELENBQU4sQ0FBV0MsSUFBWCxDQUFnQixFQUFoQjs7QUFWc0I7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsQ0FBcEIsR0FBSiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBXZWJSVEMgZnJvbSBcIndlYnJ0YzRtZVwiO1xuaW1wb3J0IEthZGVtbGlhIGZyb20gXCIuLi8uLi9rYWQva2FkZW1saWFcIjtcblxuY29uc3QgcG9ydGFsTm9kZUthZCA9IG5ldyBLYWRlbWxpYSgpO1xuXG5jb25zdCBLYWRzOiBBcnJheTxLYWRlbWxpYT4gPSBbXTtcblxuZnVuY3Rpb24gcG9ydGFsTm9kZUFuc3dlcihcbiAgc2RwOiBhbnksXG4gIG5vZGVJZDogc3RyaW5nLFxuICBjYWxsYmFjazogKGxvY2FsOiBhbnkpID0+IHZvaWRcbikge1xuICBjb25zdCBQb3J0YWxOb2RlID0gbmV3IFdlYlJUQyh7IGRpc2FibGVfc3R1bjogdHJ1ZSwgbm9kZUlkOiBub2RlSWQgfSk7XG4gIFBvcnRhbE5vZGUuc2V0U2RwKHNkcCk7XG4gIFBvcnRhbE5vZGUuY29ubmVjdCA9ICgpID0+IHBvcnRhbE5vZGVLYWQuYWRka25vZGUoUG9ydGFsTm9kZSk7XG4gIFBvcnRhbE5vZGUuc2lnbmFsID0gKGxvY2FsOiBhbnkpID0+IGNhbGxiYWNrKGxvY2FsKTtcbn1cblxuZnVuY3Rpb24gY29ubmVjdE5vZGUobm9kZUlkOiBzdHJpbmcpIHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlPFdlYlJUQz4ocmVzb2x2ZSA9PiB7XG4gICAgY29uc3QgTm9kZSA9IG5ldyBXZWJSVEMoe1xuICAgICAgZGlzYWJsZV9zdHVuOiB0cnVlLFxuICAgICAgbm9kZUlkOiBwb3J0YWxOb2RlS2FkLm5vZGVJZFxuICAgIH0pO1xuICAgIE5vZGUubWFrZU9mZmVyKCk7XG4gICAgTm9kZS5zaWduYWwgPSAobG9jYWw6IGFueSkgPT4ge1xuICAgICAgcG9ydGFsTm9kZUFuc3dlcihsb2NhbCwgbm9kZUlkLCBzZHAgPT4ge1xuICAgICAgICBOb2RlLnNldFNkcChzZHApO1xuICAgICAgfSk7XG4gICAgfTtcbiAgICBOb2RlLmNvbm5lY3QgPSAoKSA9PiB7XG4gICAgICByZXNvbHZlKE5vZGUpO1xuICAgIH07XG4gIH0pO1xufVxuXG50ZXN0KFwic3RvcmUtZmluZHZhbHVlXCIsIGFzeW5jICgpID0+IHtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCA0OyBpKyspIHtcbiAgICBjb25zdCBrYWQgPSBuZXcgS2FkZW1saWEoKTtcbiAgICBjb25zdCBub2RlID0gYXdhaXQgY29ubmVjdE5vZGUoa2FkLm5vZGVJZCkuY2F0Y2goY29uc29sZS5sb2cpO1xuICAgIGlmIChub2RlKSB7XG4gICAgICBLYWRzLnB1c2goa2FkKTtcbiAgICAgIGthZC5hZGRrbm9kZShub2RlKTtcbiAgICB9XG4gIH1cblxuICBleHBlY3QoXCJcIikudG9CZShcIlwiKTtcbn0pO1xuIl19
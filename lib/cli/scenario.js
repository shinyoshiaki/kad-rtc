"use strict";

var _NodeRTC = _interopRequireDefault(require("simple-datachannel/lib/NodeRTC"));

var _kademlia = _interopRequireDefault(require("../kad/kademlia"));

var _sha = _interopRequireDefault(require("sha1"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var sleep = function sleep(waitSeconds) {
  return new Promise(function (resolve) {
    setTimeout(function () {
      resolve();
    }, waitSeconds * 1000);
  });
};

var portalNodeId = (0, _sha.default)("portalnode").toString();
var portalNodeKad = new _kademlia.default(portalNodeId);

function portalNodeAnswer(sdp, nodeId, callback) {
  var PortalNode = new _NodeRTC.default();
  PortalNode.connecting(nodeId);

  PortalNode.connect = function () {
    console.log("portalnode connected", portalNodeId, nodeId);
    portalNodeKad.addknode(PortalNode);
  };

  PortalNode.makeAnswer(sdp, {
    disable_stun: true
  });

  PortalNode.signal = function (local) {
    callback(local);
  };
}

function connectNode(nodeId) {
  return new Promise(function (resolve) {
    var Node = new _NodeRTC.default();
    Node.connecting(portalNodeId);
    Node.makeOffer({
      disable_stun: true
    });

    Node.signal = function (local) {
      portalNodeAnswer(local, nodeId, function (sdp) {
        Node.setAnswer(sdp);
      });
    };

    Node.connect = function () {
      resolve(Node);
    };
  });
}

var Kads = [];

_asyncToGenerator(
/*#__PURE__*/
regeneratorRuntime.mark(function _callee() {
  var i, nodeId, node, kad;
  return regeneratorRuntime.wrap(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          i = 0;

        case 1:
          if (!(i < 10)) {
            _context.next = 14;
            break;
          }

          nodeId = (0, _sha.default)(Math.random().toString()).toString();
          _context.next = 5;
          return connectNode(nodeId);

        case 5:
          node = _context.sent;
          kad = new _kademlia.default(nodeId);
          Kads.push(kad);
          kad.addknode(node);
          _context.next = 11;
          return sleep(1);

        case 11:
          i++;
          _context.next = 1;
          break;

        case 14:
        case "end":
          return _context.stop();
      }
    }
  }, _callee, this);
}))();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jbGkvc2NlbmFyaW8udHMiXSwibmFtZXMiOlsic2xlZXAiLCJ3YWl0U2Vjb25kcyIsIlByb21pc2UiLCJyZXNvbHZlIiwic2V0VGltZW91dCIsInBvcnRhbE5vZGVJZCIsInRvU3RyaW5nIiwicG9ydGFsTm9kZUthZCIsIkthZGVtbGlhIiwicG9ydGFsTm9kZUFuc3dlciIsInNkcCIsIm5vZGVJZCIsImNhbGxiYWNrIiwiUG9ydGFsTm9kZSIsIldlYlJUQyIsImNvbm5lY3RpbmciLCJjb25uZWN0IiwiY29uc29sZSIsImxvZyIsImFkZGtub2RlIiwibWFrZUFuc3dlciIsImRpc2FibGVfc3R1biIsInNpZ25hbCIsImxvY2FsIiwiY29ubmVjdE5vZGUiLCJOb2RlIiwibWFrZU9mZmVyIiwic2V0QW5zd2VyIiwiS2FkcyIsImkiLCJNYXRoIiwicmFuZG9tIiwibm9kZSIsImthZCIsInB1c2giXSwibWFwcGluZ3MiOiI7O0FBQUE7O0FBQ0E7O0FBQ0E7Ozs7Ozs7O0FBRUEsSUFBTUEsS0FBSyxHQUFHLFNBQVJBLEtBQVEsQ0FBQ0MsV0FBRCxFQUF5QjtBQUNyQyxTQUFPLElBQUlDLE9BQUosQ0FBWSxVQUFBQyxPQUFPLEVBQUk7QUFDNUJDLElBQUFBLFVBQVUsQ0FBQyxZQUFNO0FBQ2ZELE1BQUFBLE9BQU87QUFDUixLQUZTLEVBRVBGLFdBQVcsR0FBRyxJQUZQLENBQVY7QUFHRCxHQUpNLENBQVA7QUFLRCxDQU5EOztBQVFBLElBQU1JLFlBQVksR0FBRyxrQkFBSyxZQUFMLEVBQW1CQyxRQUFuQixFQUFyQjtBQUNBLElBQU1DLGFBQWEsR0FBRyxJQUFJQyxpQkFBSixDQUFhSCxZQUFiLENBQXRCOztBQUVBLFNBQVNJLGdCQUFULENBQ0VDLEdBREYsRUFFRUMsTUFGRixFQUdFQyxRQUhGLEVBSUU7QUFDQSxNQUFNQyxVQUFVLEdBQUcsSUFBSUMsZ0JBQUosRUFBbkI7QUFDQUQsRUFBQUEsVUFBVSxDQUFDRSxVQUFYLENBQXNCSixNQUF0Qjs7QUFDQUUsRUFBQUEsVUFBVSxDQUFDRyxPQUFYLEdBQXFCLFlBQU07QUFDekJDLElBQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZLHNCQUFaLEVBQW9DYixZQUFwQyxFQUFrRE0sTUFBbEQ7QUFDQUosSUFBQUEsYUFBYSxDQUFDWSxRQUFkLENBQXVCTixVQUF2QjtBQUNELEdBSEQ7O0FBSUFBLEVBQUFBLFVBQVUsQ0FBQ08sVUFBWCxDQUFzQlYsR0FBdEIsRUFBMkI7QUFBRVcsSUFBQUEsWUFBWSxFQUFFO0FBQWhCLEdBQTNCOztBQUNBUixFQUFBQSxVQUFVLENBQUNTLE1BQVgsR0FBb0IsVUFBQUMsS0FBSyxFQUFJO0FBQzNCWCxJQUFBQSxRQUFRLENBQUNXLEtBQUQsQ0FBUjtBQUNELEdBRkQ7QUFHRDs7QUFFRCxTQUFTQyxXQUFULENBQXFCYixNQUFyQixFQUFxQztBQUNuQyxTQUFPLElBQUlULE9BQUosQ0FBb0IsVUFBQUMsT0FBTyxFQUFJO0FBQ3BDLFFBQU1zQixJQUFJLEdBQUcsSUFBSVgsZ0JBQUosRUFBYjtBQUNBVyxJQUFBQSxJQUFJLENBQUNWLFVBQUwsQ0FBZ0JWLFlBQWhCO0FBQ0FvQixJQUFBQSxJQUFJLENBQUNDLFNBQUwsQ0FBZTtBQUFFTCxNQUFBQSxZQUFZLEVBQUU7QUFBaEIsS0FBZjs7QUFDQUksSUFBQUEsSUFBSSxDQUFDSCxNQUFMLEdBQWMsVUFBQUMsS0FBSyxFQUFJO0FBQ3JCZCxNQUFBQSxnQkFBZ0IsQ0FBQ2MsS0FBRCxFQUFRWixNQUFSLEVBQWdCLFVBQUFELEdBQUcsRUFBSTtBQUNyQ2UsUUFBQUEsSUFBSSxDQUFDRSxTQUFMLENBQWVqQixHQUFmO0FBQ0QsT0FGZSxDQUFoQjtBQUdELEtBSkQ7O0FBS0FlLElBQUFBLElBQUksQ0FBQ1QsT0FBTCxHQUFlLFlBQU07QUFDbkJiLE1BQUFBLE9BQU8sQ0FBQ3NCLElBQUQsQ0FBUDtBQUNELEtBRkQ7QUFHRCxHQVpNLENBQVA7QUFhRDs7QUFFRCxJQUFNRyxJQUFxQixHQUFHLEVBQTlCOztBQUVBO0FBQUE7QUFBQSx3QkFBQztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFDVUMsVUFBQUEsQ0FEVixHQUNjLENBRGQ7O0FBQUE7QUFBQSxnQkFDaUJBLENBQUMsR0FBRyxFQURyQjtBQUFBO0FBQUE7QUFBQTs7QUFFU2xCLFVBQUFBLE1BRlQsR0FFa0Isa0JBQUttQixJQUFJLENBQUNDLE1BQUwsR0FBY3pCLFFBQWQsRUFBTCxFQUErQkEsUUFBL0IsRUFGbEI7QUFBQTtBQUFBLGlCQUdzQmtCLFdBQVcsQ0FBQ2IsTUFBRCxDQUhqQzs7QUFBQTtBQUdTcUIsVUFBQUEsSUFIVDtBQUlTQyxVQUFBQSxHQUpULEdBSWUsSUFBSXpCLGlCQUFKLENBQWFHLE1BQWIsQ0FKZjtBQUtHaUIsVUFBQUEsSUFBSSxDQUFDTSxJQUFMLENBQVVELEdBQVY7QUFDQUEsVUFBQUEsR0FBRyxDQUFDZCxRQUFKLENBQWFhLElBQWI7QUFOSDtBQUFBLGlCQU9TaEMsS0FBSyxDQUFDLENBQUQsQ0FQZDs7QUFBQTtBQUN5QjZCLFVBQUFBLENBQUMsRUFEMUI7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLENBQUQiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgV2ViUlRDIGZyb20gXCJzaW1wbGUtZGF0YWNoYW5uZWwvbGliL05vZGVSVENcIjtcbmltcG9ydCBLYWRlbWxpYSBmcm9tIFwiLi4va2FkL2thZGVtbGlhXCI7XG5pbXBvcnQgc2hhMSBmcm9tIFwic2hhMVwiO1xuXG5jb25zdCBzbGVlcCA9ICh3YWl0U2Vjb25kczogbnVtYmVyKSA9PiB7XG4gIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIHJlc29sdmUoKTtcbiAgICB9LCB3YWl0U2Vjb25kcyAqIDEwMDApO1xuICB9KTtcbn07XG5cbmNvbnN0IHBvcnRhbE5vZGVJZCA9IHNoYTEoXCJwb3J0YWxub2RlXCIpLnRvU3RyaW5nKCk7XG5jb25zdCBwb3J0YWxOb2RlS2FkID0gbmV3IEthZGVtbGlhKHBvcnRhbE5vZGVJZCk7XG5cbmZ1bmN0aW9uIHBvcnRhbE5vZGVBbnN3ZXIoXG4gIHNkcDogYW55LFxuICBub2RlSWQ6IHN0cmluZyxcbiAgY2FsbGJhY2s6IChsb2NhbDogYW55KSA9PiB2b2lkXG4pIHtcbiAgY29uc3QgUG9ydGFsTm9kZSA9IG5ldyBXZWJSVEMoKTtcbiAgUG9ydGFsTm9kZS5jb25uZWN0aW5nKG5vZGVJZCk7XG4gIFBvcnRhbE5vZGUuY29ubmVjdCA9ICgpID0+IHtcbiAgICBjb25zb2xlLmxvZyhcInBvcnRhbG5vZGUgY29ubmVjdGVkXCIsIHBvcnRhbE5vZGVJZCwgbm9kZUlkKTtcbiAgICBwb3J0YWxOb2RlS2FkLmFkZGtub2RlKFBvcnRhbE5vZGUpO1xuICB9O1xuICBQb3J0YWxOb2RlLm1ha2VBbnN3ZXIoc2RwLCB7IGRpc2FibGVfc3R1bjogdHJ1ZSB9KTtcbiAgUG9ydGFsTm9kZS5zaWduYWwgPSBsb2NhbCA9PiB7XG4gICAgY2FsbGJhY2sobG9jYWwpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBjb25uZWN0Tm9kZShub2RlSWQ6IHN0cmluZykge1xuICByZXR1cm4gbmV3IFByb21pc2U8V2ViUlRDPihyZXNvbHZlID0+IHtcbiAgICBjb25zdCBOb2RlID0gbmV3IFdlYlJUQygpO1xuICAgIE5vZGUuY29ubmVjdGluZyhwb3J0YWxOb2RlSWQpO1xuICAgIE5vZGUubWFrZU9mZmVyKHsgZGlzYWJsZV9zdHVuOiB0cnVlIH0pO1xuICAgIE5vZGUuc2lnbmFsID0gbG9jYWwgPT4ge1xuICAgICAgcG9ydGFsTm9kZUFuc3dlcihsb2NhbCwgbm9kZUlkLCBzZHAgPT4ge1xuICAgICAgICBOb2RlLnNldEFuc3dlcihzZHApO1xuICAgICAgfSk7XG4gICAgfTtcbiAgICBOb2RlLmNvbm5lY3QgPSAoKSA9PiB7XG4gICAgICByZXNvbHZlKE5vZGUpO1xuICAgIH07XG4gIH0pO1xufVxuXG5jb25zdCBLYWRzOiBBcnJheTxLYWRlbWxpYT4gPSBbXTtcblxuKGFzeW5jICgpID0+IHtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCAxMDsgaSsrKSB7XG4gICAgY29uc3Qgbm9kZUlkID0gc2hhMShNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKCkpLnRvU3RyaW5nKCk7XG4gICAgY29uc3Qgbm9kZSA9IGF3YWl0IGNvbm5lY3ROb2RlKG5vZGVJZCk7XG4gICAgY29uc3Qga2FkID0gbmV3IEthZGVtbGlhKG5vZGVJZCk7XG4gICAgS2Fkcy5wdXNoKGthZCk7XG4gICAga2FkLmFkZGtub2RlKG5vZGUpO1xuICAgIGF3YWl0IHNsZWVwKDEpO1xuICB9XG59KSgpO1xuIl19
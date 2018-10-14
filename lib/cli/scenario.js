"use strict";

var _webrtc4me = _interopRequireDefault(require("webrtc4me"));

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
  var PortalNode = new _webrtc4me.default();

  PortalNode.connect = function () {
    console.log("portalnode connected", portalNodeId, nodeId);
    portalNodeKad.addknode(PortalNode);
  };

  PortalNode.makeAnswer(sdp, {
    disable_stun: true,
    nodeId: nodeId
  });

  PortalNode.signal = function (local) {
    callback(local);
  };
}

function connectNode(nodeId) {
  return new Promise(function (resolve) {
    var Node = new _webrtc4me.default();
    Node.makeOffer({
      disable_stun: true,
      nodeId: portalNodeId
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jbGkvc2NlbmFyaW8udHMiXSwibmFtZXMiOlsic2xlZXAiLCJ3YWl0U2Vjb25kcyIsIlByb21pc2UiLCJyZXNvbHZlIiwic2V0VGltZW91dCIsInBvcnRhbE5vZGVJZCIsInRvU3RyaW5nIiwicG9ydGFsTm9kZUthZCIsIkthZGVtbGlhIiwicG9ydGFsTm9kZUFuc3dlciIsInNkcCIsIm5vZGVJZCIsImNhbGxiYWNrIiwiUG9ydGFsTm9kZSIsIldlYlJUQyIsImNvbm5lY3QiLCJjb25zb2xlIiwibG9nIiwiYWRka25vZGUiLCJtYWtlQW5zd2VyIiwiZGlzYWJsZV9zdHVuIiwic2lnbmFsIiwibG9jYWwiLCJjb25uZWN0Tm9kZSIsIk5vZGUiLCJtYWtlT2ZmZXIiLCJzZXRBbnN3ZXIiLCJLYWRzIiwiaSIsIk1hdGgiLCJyYW5kb20iLCJub2RlIiwia2FkIiwicHVzaCJdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7QUFDQTs7QUFDQTs7Ozs7Ozs7QUFFQSxJQUFNQSxLQUFLLEdBQUcsU0FBUkEsS0FBUSxDQUFDQyxXQUFELEVBQXlCO0FBQ3JDLFNBQU8sSUFBSUMsT0FBSixDQUFZLFVBQUFDLE9BQU8sRUFBSTtBQUM1QkMsSUFBQUEsVUFBVSxDQUFDLFlBQU07QUFDZkQsTUFBQUEsT0FBTztBQUNSLEtBRlMsRUFFUEYsV0FBVyxHQUFHLElBRlAsQ0FBVjtBQUdELEdBSk0sQ0FBUDtBQUtELENBTkQ7O0FBUUEsSUFBTUksWUFBWSxHQUFHLGtCQUFLLFlBQUwsRUFBbUJDLFFBQW5CLEVBQXJCO0FBQ0EsSUFBTUMsYUFBYSxHQUFHLElBQUlDLGlCQUFKLENBQWFILFlBQWIsQ0FBdEI7O0FBRUEsU0FBU0ksZ0JBQVQsQ0FDRUMsR0FERixFQUVFQyxNQUZGLEVBR0VDLFFBSEYsRUFJRTtBQUNBLE1BQU1DLFVBQVUsR0FBRyxJQUFJQyxrQkFBSixFQUFuQjs7QUFDQUQsRUFBQUEsVUFBVSxDQUFDRSxPQUFYLEdBQXFCLFlBQU07QUFDekJDLElBQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZLHNCQUFaLEVBQW9DWixZQUFwQyxFQUFrRE0sTUFBbEQ7QUFDQUosSUFBQUEsYUFBYSxDQUFDVyxRQUFkLENBQXVCTCxVQUF2QjtBQUNELEdBSEQ7O0FBSUFBLEVBQUFBLFVBQVUsQ0FBQ00sVUFBWCxDQUFzQlQsR0FBdEIsRUFBMkI7QUFBRVUsSUFBQUEsWUFBWSxFQUFFLElBQWhCO0FBQXNCVCxJQUFBQSxNQUFNLEVBQUVBO0FBQTlCLEdBQTNCOztBQUNBRSxFQUFBQSxVQUFVLENBQUNRLE1BQVgsR0FBb0IsVUFBQUMsS0FBSyxFQUFJO0FBQzNCVixJQUFBQSxRQUFRLENBQUNVLEtBQUQsQ0FBUjtBQUNELEdBRkQ7QUFHRDs7QUFFRCxTQUFTQyxXQUFULENBQXFCWixNQUFyQixFQUFxQztBQUNuQyxTQUFPLElBQUlULE9BQUosQ0FBb0IsVUFBQUMsT0FBTyxFQUFJO0FBQ3BDLFFBQU1xQixJQUFJLEdBQUcsSUFBSVYsa0JBQUosRUFBYjtBQUNBVSxJQUFBQSxJQUFJLENBQUNDLFNBQUwsQ0FBZTtBQUFFTCxNQUFBQSxZQUFZLEVBQUUsSUFBaEI7QUFBc0JULE1BQUFBLE1BQU0sRUFBRU47QUFBOUIsS0FBZjs7QUFDQW1CLElBQUFBLElBQUksQ0FBQ0gsTUFBTCxHQUFjLFVBQUFDLEtBQUssRUFBSTtBQUNyQmIsTUFBQUEsZ0JBQWdCLENBQUNhLEtBQUQsRUFBUVgsTUFBUixFQUFnQixVQUFBRCxHQUFHLEVBQUk7QUFDckNjLFFBQUFBLElBQUksQ0FBQ0UsU0FBTCxDQUFlaEIsR0FBZjtBQUNELE9BRmUsQ0FBaEI7QUFHRCxLQUpEOztBQUtBYyxJQUFBQSxJQUFJLENBQUNULE9BQUwsR0FBZSxZQUFNO0FBQ25CWixNQUFBQSxPQUFPLENBQUNxQixJQUFELENBQVA7QUFDRCxLQUZEO0FBR0QsR0FYTSxDQUFQO0FBWUQ7O0FBRUQsSUFBTUcsSUFBcUIsR0FBRyxFQUE5Qjs7QUFFQTtBQUFBO0FBQUEsd0JBQUM7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQ1VDLFVBQUFBLENBRFYsR0FDYyxDQURkOztBQUFBO0FBQUEsZ0JBQ2lCQSxDQUFDLEdBQUcsRUFEckI7QUFBQTtBQUFBO0FBQUE7O0FBRVNqQixVQUFBQSxNQUZULEdBRWtCLGtCQUFLa0IsSUFBSSxDQUFDQyxNQUFMLEdBQWN4QixRQUFkLEVBQUwsRUFBK0JBLFFBQS9CLEVBRmxCO0FBQUE7QUFBQSxpQkFHc0JpQixXQUFXLENBQUNaLE1BQUQsQ0FIakM7O0FBQUE7QUFHU29CLFVBQUFBLElBSFQ7QUFJU0MsVUFBQUEsR0FKVCxHQUllLElBQUl4QixpQkFBSixDQUFhRyxNQUFiLENBSmY7QUFLR2dCLFVBQUFBLElBQUksQ0FBQ00sSUFBTCxDQUFVRCxHQUFWO0FBQ0FBLFVBQUFBLEdBQUcsQ0FBQ2QsUUFBSixDQUFhYSxJQUFiO0FBTkg7QUFBQSxpQkFPUy9CLEtBQUssQ0FBQyxDQUFELENBUGQ7O0FBQUE7QUFDeUI0QixVQUFBQSxDQUFDLEVBRDFCO0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxDQUFEIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFdlYlJUQyBmcm9tIFwid2VicnRjNG1lXCI7XG5pbXBvcnQgS2FkZW1saWEgZnJvbSBcIi4uL2thZC9rYWRlbWxpYVwiO1xuaW1wb3J0IHNoYTEgZnJvbSBcInNoYTFcIjtcblxuY29uc3Qgc2xlZXAgPSAod2FpdFNlY29uZHM6IG51bWJlcikgPT4ge1xuICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICByZXNvbHZlKCk7XG4gICAgfSwgd2FpdFNlY29uZHMgKiAxMDAwKTtcbiAgfSk7XG59O1xuXG5jb25zdCBwb3J0YWxOb2RlSWQgPSBzaGExKFwicG9ydGFsbm9kZVwiKS50b1N0cmluZygpO1xuY29uc3QgcG9ydGFsTm9kZUthZCA9IG5ldyBLYWRlbWxpYShwb3J0YWxOb2RlSWQpO1xuXG5mdW5jdGlvbiBwb3J0YWxOb2RlQW5zd2VyKFxuICBzZHA6IGFueSxcbiAgbm9kZUlkOiBzdHJpbmcsXG4gIGNhbGxiYWNrOiAobG9jYWw6IGFueSkgPT4gdm9pZFxuKSB7XG4gIGNvbnN0IFBvcnRhbE5vZGUgPSBuZXcgV2ViUlRDKCk7XG4gIFBvcnRhbE5vZGUuY29ubmVjdCA9ICgpID0+IHtcbiAgICBjb25zb2xlLmxvZyhcInBvcnRhbG5vZGUgY29ubmVjdGVkXCIsIHBvcnRhbE5vZGVJZCwgbm9kZUlkKTtcbiAgICBwb3J0YWxOb2RlS2FkLmFkZGtub2RlKFBvcnRhbE5vZGUpO1xuICB9O1xuICBQb3J0YWxOb2RlLm1ha2VBbnN3ZXIoc2RwLCB7IGRpc2FibGVfc3R1bjogdHJ1ZSwgbm9kZUlkOiBub2RlSWQgfSk7XG4gIFBvcnRhbE5vZGUuc2lnbmFsID0gbG9jYWwgPT4ge1xuICAgIGNhbGxiYWNrKGxvY2FsKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gY29ubmVjdE5vZGUobm9kZUlkOiBzdHJpbmcpIHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlPFdlYlJUQz4ocmVzb2x2ZSA9PiB7XG4gICAgY29uc3QgTm9kZSA9IG5ldyBXZWJSVEMoKTtcbiAgICBOb2RlLm1ha2VPZmZlcih7IGRpc2FibGVfc3R1bjogdHJ1ZSwgbm9kZUlkOiBwb3J0YWxOb2RlSWQgfSk7XG4gICAgTm9kZS5zaWduYWwgPSBsb2NhbCA9PiB7XG4gICAgICBwb3J0YWxOb2RlQW5zd2VyKGxvY2FsLCBub2RlSWQsIHNkcCA9PiB7XG4gICAgICAgIE5vZGUuc2V0QW5zd2VyKHNkcCk7XG4gICAgICB9KTtcbiAgICB9O1xuICAgIE5vZGUuY29ubmVjdCA9ICgpID0+IHtcbiAgICAgIHJlc29sdmUoTm9kZSk7XG4gICAgfTtcbiAgfSk7XG59XG5cbmNvbnN0IEthZHM6IEFycmF5PEthZGVtbGlhPiA9IFtdO1xuXG4oYXN5bmMgKCkgPT4ge1xuICBmb3IgKGxldCBpID0gMDsgaSA8IDEwOyBpKyspIHtcbiAgICBjb25zdCBub2RlSWQgPSBzaGExKE1hdGgucmFuZG9tKCkudG9TdHJpbmcoKSkudG9TdHJpbmcoKTtcbiAgICBjb25zdCBub2RlID0gYXdhaXQgY29ubmVjdE5vZGUobm9kZUlkKTtcbiAgICBjb25zdCBrYWQgPSBuZXcgS2FkZW1saWEobm9kZUlkKTtcbiAgICBLYWRzLnB1c2goa2FkKTtcbiAgICBrYWQuYWRka25vZGUobm9kZSk7XG4gICAgYXdhaXQgc2xlZXAoMSk7XG4gIH1cbn0pKCk7XG4iXX0=
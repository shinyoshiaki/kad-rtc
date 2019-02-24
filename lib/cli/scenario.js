"use strict";

var _webrtc4me = _interopRequireDefault(require("webrtc4me"));

var _kademlia = _interopRequireDefault(require("../kad/kademlia"));

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

var portalNodeKad = new _kademlia.default();

function portalNodeAnswer(sdp, nodeId, callback) {
  var PortalNode = new _webrtc4me.default({
    disable_stun: true,
    nodeId: nodeId
  });

  PortalNode.connect = function () {
    console.log("portalnode connected", portalNodeKad.nodeId, nodeId);
    portalNodeKad.addknode(PortalNode);
  };

  PortalNode.setSdp(sdp);

  PortalNode.signal = function (local) {
    callback(local);
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

var Kads = [];

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
          if (!(i < 10)) {
            _context.next = 13;
            break;
          }

          kad = new _kademlia.default();
          _context.next = 5;
          return connectNode(kad.nodeId);

        case 5:
          node = _context.sent;
          Kads.push(kad);
          kad.addknode(node);
          _context.next = 10;
          return sleep(1);

        case 10:
          i++;
          _context.next = 1;
          break;

        case 13:
        case "end":
          return _context.stop();
      }
    }
  }, _callee, this);
}))();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jbGkvc2NlbmFyaW8udHMiXSwibmFtZXMiOlsic2xlZXAiLCJ3YWl0U2Vjb25kcyIsIlByb21pc2UiLCJyZXNvbHZlIiwic2V0VGltZW91dCIsInBvcnRhbE5vZGVLYWQiLCJLYWRlbWxpYSIsInBvcnRhbE5vZGVBbnN3ZXIiLCJzZHAiLCJub2RlSWQiLCJjYWxsYmFjayIsIlBvcnRhbE5vZGUiLCJXZWJSVEMiLCJkaXNhYmxlX3N0dW4iLCJjb25uZWN0IiwiY29uc29sZSIsImxvZyIsImFkZGtub2RlIiwic2V0U2RwIiwic2lnbmFsIiwibG9jYWwiLCJjb25uZWN0Tm9kZSIsIk5vZGUiLCJtYWtlT2ZmZXIiLCJLYWRzIiwiaSIsImthZCIsIm5vZGUiLCJwdXNoIl0sIm1hcHBpbmdzIjoiOztBQUFBOztBQUNBOzs7Ozs7OztBQUVBLElBQU1BLEtBQUssR0FBRyxTQUFSQSxLQUFRLENBQUNDLFdBQUQsRUFBeUI7QUFDckMsU0FBTyxJQUFJQyxPQUFKLENBQVksVUFBQUMsT0FBTyxFQUFJO0FBQzVCQyxJQUFBQSxVQUFVLENBQUMsWUFBTTtBQUNmRCxNQUFBQSxPQUFPO0FBQ1IsS0FGUyxFQUVQRixXQUFXLEdBQUcsSUFGUCxDQUFWO0FBR0QsR0FKTSxDQUFQO0FBS0QsQ0FORDs7QUFRQSxJQUFNSSxhQUFhLEdBQUcsSUFBSUMsaUJBQUosRUFBdEI7O0FBRUEsU0FBU0MsZ0JBQVQsQ0FDRUMsR0FERixFQUVFQyxNQUZGLEVBR0VDLFFBSEYsRUFJRTtBQUNBLE1BQU1DLFVBQVUsR0FBRyxJQUFJQyxrQkFBSixDQUFXO0FBQUVDLElBQUFBLFlBQVksRUFBRSxJQUFoQjtBQUFzQkosSUFBQUEsTUFBTSxFQUFFQTtBQUE5QixHQUFYLENBQW5COztBQUNBRSxFQUFBQSxVQUFVLENBQUNHLE9BQVgsR0FBcUIsWUFBTTtBQUN6QkMsSUFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVksc0JBQVosRUFBb0NYLGFBQWEsQ0FBQ0ksTUFBbEQsRUFBMERBLE1BQTFEO0FBQ0FKLElBQUFBLGFBQWEsQ0FBQ1ksUUFBZCxDQUF1Qk4sVUFBdkI7QUFDRCxHQUhEOztBQUlBQSxFQUFBQSxVQUFVLENBQUNPLE1BQVgsQ0FBa0JWLEdBQWxCOztBQUNBRyxFQUFBQSxVQUFVLENBQUNRLE1BQVgsR0FBb0IsVUFBQUMsS0FBSyxFQUFJO0FBQzNCVixJQUFBQSxRQUFRLENBQUNVLEtBQUQsQ0FBUjtBQUNELEdBRkQ7QUFHRDs7QUFFRCxTQUFTQyxXQUFULENBQXFCWixNQUFyQixFQUFxQztBQUNuQyxTQUFPLElBQUlQLE9BQUosQ0FBb0IsVUFBQUMsT0FBTyxFQUFJO0FBQ3BDLFFBQU1tQixJQUFJLEdBQUcsSUFBSVYsa0JBQUosQ0FBVztBQUN0QkMsTUFBQUEsWUFBWSxFQUFFLElBRFE7QUFFdEJKLE1BQUFBLE1BQU0sRUFBRUosYUFBYSxDQUFDSTtBQUZBLEtBQVgsQ0FBYjtBQUlBYSxJQUFBQSxJQUFJLENBQUNDLFNBQUw7O0FBQ0FELElBQUFBLElBQUksQ0FBQ0gsTUFBTCxHQUFjLFVBQUFDLEtBQUssRUFBSTtBQUNyQmIsTUFBQUEsZ0JBQWdCLENBQUNhLEtBQUQsRUFBUVgsTUFBUixFQUFnQixVQUFBRCxHQUFHLEVBQUk7QUFDckNjLFFBQUFBLElBQUksQ0FBQ0osTUFBTCxDQUFZVixHQUFaO0FBQ0QsT0FGZSxDQUFoQjtBQUdELEtBSkQ7O0FBS0FjLElBQUFBLElBQUksQ0FBQ1IsT0FBTCxHQUFlLFlBQU07QUFDbkJYLE1BQUFBLE9BQU8sQ0FBQ21CLElBQUQsQ0FBUDtBQUNELEtBRkQ7QUFHRCxHQWRNLENBQVA7QUFlRDs7QUFFRCxJQUFNRSxJQUFxQixHQUFHLEVBQTlCOztBQUVBO0FBQUE7QUFBQSx3QkFBQztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFDVUMsVUFBQUEsQ0FEVixHQUNjLENBRGQ7O0FBQUE7QUFBQSxnQkFDaUJBLENBQUMsR0FBRyxFQURyQjtBQUFBO0FBQUE7QUFBQTs7QUFFU0MsVUFBQUEsR0FGVCxHQUVlLElBQUlwQixpQkFBSixFQUZmO0FBQUE7QUFBQSxpQkFHc0JlLFdBQVcsQ0FBQ0ssR0FBRyxDQUFDakIsTUFBTCxDQUhqQzs7QUFBQTtBQUdTa0IsVUFBQUEsSUFIVDtBQUlHSCxVQUFBQSxJQUFJLENBQUNJLElBQUwsQ0FBVUYsR0FBVjtBQUNBQSxVQUFBQSxHQUFHLENBQUNULFFBQUosQ0FBYVUsSUFBYjtBQUxIO0FBQUEsaUJBTVMzQixLQUFLLENBQUMsQ0FBRCxDQU5kOztBQUFBO0FBQ3lCeUIsVUFBQUEsQ0FBQyxFQUQxQjtBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsQ0FBRCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBXZWJSVEMgZnJvbSBcIndlYnJ0YzRtZVwiO1xuaW1wb3J0IEthZGVtbGlhIGZyb20gXCIuLi9rYWQva2FkZW1saWFcIjtcblxuY29uc3Qgc2xlZXAgPSAod2FpdFNlY29uZHM6IG51bWJlcikgPT4ge1xuICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICByZXNvbHZlKCk7XG4gICAgfSwgd2FpdFNlY29uZHMgKiAxMDAwKTtcbiAgfSk7XG59O1xuXG5jb25zdCBwb3J0YWxOb2RlS2FkID0gbmV3IEthZGVtbGlhKCk7XG5cbmZ1bmN0aW9uIHBvcnRhbE5vZGVBbnN3ZXIoXG4gIHNkcDogYW55LFxuICBub2RlSWQ6IHN0cmluZyxcbiAgY2FsbGJhY2s6IChsb2NhbDogYW55KSA9PiB2b2lkXG4pIHtcbiAgY29uc3QgUG9ydGFsTm9kZSA9IG5ldyBXZWJSVEMoeyBkaXNhYmxlX3N0dW46IHRydWUsIG5vZGVJZDogbm9kZUlkIH0pO1xuICBQb3J0YWxOb2RlLmNvbm5lY3QgPSAoKSA9PiB7XG4gICAgY29uc29sZS5sb2coXCJwb3J0YWxub2RlIGNvbm5lY3RlZFwiLCBwb3J0YWxOb2RlS2FkLm5vZGVJZCwgbm9kZUlkKTtcbiAgICBwb3J0YWxOb2RlS2FkLmFkZGtub2RlKFBvcnRhbE5vZGUpO1xuICB9O1xuICBQb3J0YWxOb2RlLnNldFNkcChzZHApO1xuICBQb3J0YWxOb2RlLnNpZ25hbCA9IGxvY2FsID0+IHtcbiAgICBjYWxsYmFjayhsb2NhbCk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGNvbm5lY3ROb2RlKG5vZGVJZDogc3RyaW5nKSB7XG4gIHJldHVybiBuZXcgUHJvbWlzZTxXZWJSVEM+KHJlc29sdmUgPT4ge1xuICAgIGNvbnN0IE5vZGUgPSBuZXcgV2ViUlRDKHtcbiAgICAgIGRpc2FibGVfc3R1bjogdHJ1ZSxcbiAgICAgIG5vZGVJZDogcG9ydGFsTm9kZUthZC5ub2RlSWRcbiAgICB9KTtcbiAgICBOb2RlLm1ha2VPZmZlcigpO1xuICAgIE5vZGUuc2lnbmFsID0gbG9jYWwgPT4ge1xuICAgICAgcG9ydGFsTm9kZUFuc3dlcihsb2NhbCwgbm9kZUlkLCBzZHAgPT4ge1xuICAgICAgICBOb2RlLnNldFNkcChzZHApO1xuICAgICAgfSk7XG4gICAgfTtcbiAgICBOb2RlLmNvbm5lY3QgPSAoKSA9PiB7XG4gICAgICByZXNvbHZlKE5vZGUpO1xuICAgIH07XG4gIH0pO1xufVxuXG5jb25zdCBLYWRzOiBBcnJheTxLYWRlbWxpYT4gPSBbXTtcblxuKGFzeW5jICgpID0+IHtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCAxMDsgaSsrKSB7XG4gICAgY29uc3Qga2FkID0gbmV3IEthZGVtbGlhKCk7XG4gICAgY29uc3Qgbm9kZSA9IGF3YWl0IGNvbm5lY3ROb2RlKGthZC5ub2RlSWQpO1xuICAgIEthZHMucHVzaChrYWQpO1xuICAgIGthZC5hZGRrbm9kZShub2RlKTtcbiAgICBhd2FpdCBzbGVlcCgxKTtcbiAgfVxufSkoKTtcbiJdfQ==
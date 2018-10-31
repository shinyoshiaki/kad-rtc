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
  var PortalNode = new _webrtc4me.default();

  PortalNode.connect = function () {
    console.log("portalnode connected", portalNodeKad.nodeId, nodeId);
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
      nodeId: portalNodeKad.nodeId
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jbGkvc2NlbmFyaW8udHMiXSwibmFtZXMiOlsic2xlZXAiLCJ3YWl0U2Vjb25kcyIsIlByb21pc2UiLCJyZXNvbHZlIiwic2V0VGltZW91dCIsInBvcnRhbE5vZGVLYWQiLCJLYWRlbWxpYSIsInBvcnRhbE5vZGVBbnN3ZXIiLCJzZHAiLCJub2RlSWQiLCJjYWxsYmFjayIsIlBvcnRhbE5vZGUiLCJXZWJSVEMiLCJjb25uZWN0IiwiY29uc29sZSIsImxvZyIsImFkZGtub2RlIiwibWFrZUFuc3dlciIsImRpc2FibGVfc3R1biIsInNpZ25hbCIsImxvY2FsIiwiY29ubmVjdE5vZGUiLCJOb2RlIiwibWFrZU9mZmVyIiwic2V0QW5zd2VyIiwiS2FkcyIsImkiLCJrYWQiLCJub2RlIiwicHVzaCJdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7QUFDQTs7Ozs7Ozs7QUFFQSxJQUFNQSxLQUFLLEdBQUcsU0FBUkEsS0FBUSxDQUFDQyxXQUFELEVBQXlCO0FBQ3JDLFNBQU8sSUFBSUMsT0FBSixDQUFZLFVBQUFDLE9BQU8sRUFBSTtBQUM1QkMsSUFBQUEsVUFBVSxDQUFDLFlBQU07QUFDZkQsTUFBQUEsT0FBTztBQUNSLEtBRlMsRUFFUEYsV0FBVyxHQUFHLElBRlAsQ0FBVjtBQUdELEdBSk0sQ0FBUDtBQUtELENBTkQ7O0FBUUEsSUFBTUksYUFBYSxHQUFHLElBQUlDLGlCQUFKLEVBQXRCOztBQUVBLFNBQVNDLGdCQUFULENBQ0VDLEdBREYsRUFFRUMsTUFGRixFQUdFQyxRQUhGLEVBSUU7QUFDQSxNQUFNQyxVQUFVLEdBQUcsSUFBSUMsa0JBQUosRUFBbkI7O0FBQ0FELEVBQUFBLFVBQVUsQ0FBQ0UsT0FBWCxHQUFxQixZQUFNO0FBQ3pCQyxJQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWSxzQkFBWixFQUFvQ1YsYUFBYSxDQUFDSSxNQUFsRCxFQUEwREEsTUFBMUQ7QUFDQUosSUFBQUEsYUFBYSxDQUFDVyxRQUFkLENBQXVCTCxVQUF2QjtBQUNELEdBSEQ7O0FBSUFBLEVBQUFBLFVBQVUsQ0FBQ00sVUFBWCxDQUFzQlQsR0FBdEIsRUFBMkI7QUFBRVUsSUFBQUEsWUFBWSxFQUFFLElBQWhCO0FBQXNCVCxJQUFBQSxNQUFNLEVBQUVBO0FBQTlCLEdBQTNCOztBQUNBRSxFQUFBQSxVQUFVLENBQUNRLE1BQVgsR0FBb0IsVUFBQUMsS0FBSyxFQUFJO0FBQzNCVixJQUFBQSxRQUFRLENBQUNVLEtBQUQsQ0FBUjtBQUNELEdBRkQ7QUFHRDs7QUFFRCxTQUFTQyxXQUFULENBQXFCWixNQUFyQixFQUFxQztBQUNuQyxTQUFPLElBQUlQLE9BQUosQ0FBb0IsVUFBQUMsT0FBTyxFQUFJO0FBQ3BDLFFBQU1tQixJQUFJLEdBQUcsSUFBSVYsa0JBQUosRUFBYjtBQUNBVSxJQUFBQSxJQUFJLENBQUNDLFNBQUwsQ0FBZTtBQUFFTCxNQUFBQSxZQUFZLEVBQUUsSUFBaEI7QUFBc0JULE1BQUFBLE1BQU0sRUFBRUosYUFBYSxDQUFDSTtBQUE1QyxLQUFmOztBQUNBYSxJQUFBQSxJQUFJLENBQUNILE1BQUwsR0FBYyxVQUFBQyxLQUFLLEVBQUk7QUFDckJiLE1BQUFBLGdCQUFnQixDQUFDYSxLQUFELEVBQVFYLE1BQVIsRUFBZ0IsVUFBQUQsR0FBRyxFQUFJO0FBQ3JDYyxRQUFBQSxJQUFJLENBQUNFLFNBQUwsQ0FBZWhCLEdBQWY7QUFDRCxPQUZlLENBQWhCO0FBR0QsS0FKRDs7QUFLQWMsSUFBQUEsSUFBSSxDQUFDVCxPQUFMLEdBQWUsWUFBTTtBQUNuQlYsTUFBQUEsT0FBTyxDQUFDbUIsSUFBRCxDQUFQO0FBQ0QsS0FGRDtBQUdELEdBWE0sQ0FBUDtBQVlEOztBQUVELElBQU1HLElBQXFCLEdBQUcsRUFBOUI7O0FBRUE7QUFBQTtBQUFBLHdCQUFDO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUNVQyxVQUFBQSxDQURWLEdBQ2MsQ0FEZDs7QUFBQTtBQUFBLGdCQUNpQkEsQ0FBQyxHQUFHLEVBRHJCO0FBQUE7QUFBQTtBQUFBOztBQUVTQyxVQUFBQSxHQUZULEdBRWUsSUFBSXJCLGlCQUFKLEVBRmY7QUFBQTtBQUFBLGlCQUdzQmUsV0FBVyxDQUFDTSxHQUFHLENBQUNsQixNQUFMLENBSGpDOztBQUFBO0FBR1NtQixVQUFBQSxJQUhUO0FBSUdILFVBQUFBLElBQUksQ0FBQ0ksSUFBTCxDQUFVRixHQUFWO0FBQ0FBLFVBQUFBLEdBQUcsQ0FBQ1gsUUFBSixDQUFhWSxJQUFiO0FBTEg7QUFBQSxpQkFNUzVCLEtBQUssQ0FBQyxDQUFELENBTmQ7O0FBQUE7QUFDeUIwQixVQUFBQSxDQUFDLEVBRDFCO0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxDQUFEIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFdlYlJUQyBmcm9tIFwid2VicnRjNG1lXCI7XG5pbXBvcnQgS2FkZW1saWEgZnJvbSBcIi4uL2thZC9rYWRlbWxpYVwiO1xuXG5jb25zdCBzbGVlcCA9ICh3YWl0U2Vjb25kczogbnVtYmVyKSA9PiB7XG4gIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIHJlc29sdmUoKTtcbiAgICB9LCB3YWl0U2Vjb25kcyAqIDEwMDApO1xuICB9KTtcbn07XG5cbmNvbnN0IHBvcnRhbE5vZGVLYWQgPSBuZXcgS2FkZW1saWEoKTtcblxuZnVuY3Rpb24gcG9ydGFsTm9kZUFuc3dlcihcbiAgc2RwOiBhbnksXG4gIG5vZGVJZDogc3RyaW5nLFxuICBjYWxsYmFjazogKGxvY2FsOiBhbnkpID0+IHZvaWRcbikge1xuICBjb25zdCBQb3J0YWxOb2RlID0gbmV3IFdlYlJUQygpO1xuICBQb3J0YWxOb2RlLmNvbm5lY3QgPSAoKSA9PiB7XG4gICAgY29uc29sZS5sb2coXCJwb3J0YWxub2RlIGNvbm5lY3RlZFwiLCBwb3J0YWxOb2RlS2FkLm5vZGVJZCwgbm9kZUlkKTtcbiAgICBwb3J0YWxOb2RlS2FkLmFkZGtub2RlKFBvcnRhbE5vZGUpO1xuICB9O1xuICBQb3J0YWxOb2RlLm1ha2VBbnN3ZXIoc2RwLCB7IGRpc2FibGVfc3R1bjogdHJ1ZSwgbm9kZUlkOiBub2RlSWQgfSk7XG4gIFBvcnRhbE5vZGUuc2lnbmFsID0gbG9jYWwgPT4ge1xuICAgIGNhbGxiYWNrKGxvY2FsKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gY29ubmVjdE5vZGUobm9kZUlkOiBzdHJpbmcpIHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlPFdlYlJUQz4ocmVzb2x2ZSA9PiB7XG4gICAgY29uc3QgTm9kZSA9IG5ldyBXZWJSVEMoKTtcbiAgICBOb2RlLm1ha2VPZmZlcih7IGRpc2FibGVfc3R1bjogdHJ1ZSwgbm9kZUlkOiBwb3J0YWxOb2RlS2FkLm5vZGVJZCB9KTtcbiAgICBOb2RlLnNpZ25hbCA9IGxvY2FsID0+IHtcbiAgICAgIHBvcnRhbE5vZGVBbnN3ZXIobG9jYWwsIG5vZGVJZCwgc2RwID0+IHtcbiAgICAgICAgTm9kZS5zZXRBbnN3ZXIoc2RwKTtcbiAgICAgIH0pO1xuICAgIH07XG4gICAgTm9kZS5jb25uZWN0ID0gKCkgPT4ge1xuICAgICAgcmVzb2x2ZShOb2RlKTtcbiAgICB9O1xuICB9KTtcbn1cblxuY29uc3QgS2FkczogQXJyYXk8S2FkZW1saWE+ID0gW107XG5cbihhc3luYyAoKSA9PiB7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgMTA7IGkrKykge1xuICAgIGNvbnN0IGthZCA9IG5ldyBLYWRlbWxpYSgpO1xuICAgIGNvbnN0IG5vZGUgPSBhd2FpdCBjb25uZWN0Tm9kZShrYWQubm9kZUlkKTtcbiAgICBLYWRzLnB1c2goa2FkKTtcbiAgICBrYWQuYWRka25vZGUobm9kZSk7XG4gICAgYXdhaXQgc2xlZXAoMSk7XG4gIH1cbn0pKCk7XG4iXX0=
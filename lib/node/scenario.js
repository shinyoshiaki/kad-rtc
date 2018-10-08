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
          if (!(i < 1)) {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ub2RlL3NjZW5hcmlvLnRzIl0sIm5hbWVzIjpbInNsZWVwIiwid2FpdFNlY29uZHMiLCJQcm9taXNlIiwicmVzb2x2ZSIsInNldFRpbWVvdXQiLCJwb3J0YWxOb2RlSWQiLCJ0b1N0cmluZyIsInBvcnRhbE5vZGVLYWQiLCJLYWRlbWxpYSIsInBvcnRhbE5vZGVBbnN3ZXIiLCJzZHAiLCJub2RlSWQiLCJjYWxsYmFjayIsIlBvcnRhbE5vZGUiLCJXZWJSVEMiLCJjb25uZWN0aW5nIiwiY29ubmVjdCIsImNvbnNvbGUiLCJsb2ciLCJhZGRrbm9kZSIsIm1ha2VBbnN3ZXIiLCJkaXNhYmxlX3N0dW4iLCJzaWduYWwiLCJsb2NhbCIsImNvbm5lY3ROb2RlIiwiTm9kZSIsIm1ha2VPZmZlciIsInNldEFuc3dlciIsIkthZHMiLCJpIiwiTWF0aCIsInJhbmRvbSIsIm5vZGUiLCJrYWQiLCJwdXNoIl0sIm1hcHBpbmdzIjoiOztBQUFBOztBQUNBOztBQUNBOzs7Ozs7OztBQUVBLElBQU1BLEtBQUssR0FBRyxTQUFSQSxLQUFRLENBQUNDLFdBQUQsRUFBeUI7QUFDckMsU0FBTyxJQUFJQyxPQUFKLENBQVksVUFBQUMsT0FBTyxFQUFJO0FBQzVCQyxJQUFBQSxVQUFVLENBQUMsWUFBTTtBQUNmRCxNQUFBQSxPQUFPO0FBQ1IsS0FGUyxFQUVQRixXQUFXLEdBQUcsSUFGUCxDQUFWO0FBR0QsR0FKTSxDQUFQO0FBS0QsQ0FORDs7QUFRQSxJQUFNSSxZQUFZLEdBQUcsa0JBQUssWUFBTCxFQUFtQkMsUUFBbkIsRUFBckI7QUFDQSxJQUFNQyxhQUFhLEdBQUcsSUFBSUMsaUJBQUosQ0FBYUgsWUFBYixDQUF0Qjs7QUFFQSxTQUFTSSxnQkFBVCxDQUNFQyxHQURGLEVBRUVDLE1BRkYsRUFHRUMsUUFIRixFQUlFO0FBQ0EsTUFBTUMsVUFBVSxHQUFHLElBQUlDLGdCQUFKLEVBQW5CO0FBQ0FELEVBQUFBLFVBQVUsQ0FBQ0UsVUFBWCxDQUFzQkosTUFBdEI7O0FBQ0FFLEVBQUFBLFVBQVUsQ0FBQ0csT0FBWCxHQUFxQixZQUFNO0FBQ3pCQyxJQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWSxzQkFBWixFQUFvQ2IsWUFBcEMsRUFBa0RNLE1BQWxEO0FBQ0FKLElBQUFBLGFBQWEsQ0FBQ1ksUUFBZCxDQUF1Qk4sVUFBdkI7QUFDRCxHQUhEOztBQUlBQSxFQUFBQSxVQUFVLENBQUNPLFVBQVgsQ0FBc0JWLEdBQXRCLEVBQTJCO0FBQUVXLElBQUFBLFlBQVksRUFBRTtBQUFoQixHQUEzQjs7QUFDQVIsRUFBQUEsVUFBVSxDQUFDUyxNQUFYLEdBQW9CLFVBQUFDLEtBQUssRUFBSTtBQUMzQlgsSUFBQUEsUUFBUSxDQUFDVyxLQUFELENBQVI7QUFDRCxHQUZEO0FBR0Q7O0FBRUQsU0FBU0MsV0FBVCxDQUFxQmIsTUFBckIsRUFBcUM7QUFDbkMsU0FBTyxJQUFJVCxPQUFKLENBQW9CLFVBQUFDLE9BQU8sRUFBSTtBQUNwQyxRQUFNc0IsSUFBSSxHQUFHLElBQUlYLGdCQUFKLEVBQWI7QUFDQVcsSUFBQUEsSUFBSSxDQUFDVixVQUFMLENBQWdCVixZQUFoQjtBQUNBb0IsSUFBQUEsSUFBSSxDQUFDQyxTQUFMLENBQWU7QUFBRUwsTUFBQUEsWUFBWSxFQUFFO0FBQWhCLEtBQWY7O0FBQ0FJLElBQUFBLElBQUksQ0FBQ0gsTUFBTCxHQUFjLFVBQUFDLEtBQUssRUFBSTtBQUNyQmQsTUFBQUEsZ0JBQWdCLENBQUNjLEtBQUQsRUFBUVosTUFBUixFQUFnQixVQUFBRCxHQUFHLEVBQUk7QUFDckNlLFFBQUFBLElBQUksQ0FBQ0UsU0FBTCxDQUFlakIsR0FBZjtBQUNELE9BRmUsQ0FBaEI7QUFHRCxLQUpEOztBQUtBZSxJQUFBQSxJQUFJLENBQUNULE9BQUwsR0FBZSxZQUFNO0FBQ25CYixNQUFBQSxPQUFPLENBQUNzQixJQUFELENBQVA7QUFDRCxLQUZEO0FBR0QsR0FaTSxDQUFQO0FBYUQ7O0FBRUQsSUFBTUcsSUFBcUIsR0FBRyxFQUE5Qjs7QUFFQTtBQUFBO0FBQUEsd0JBQUM7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQ1VDLFVBQUFBLENBRFYsR0FDYyxDQURkOztBQUFBO0FBQUEsZ0JBQ2lCQSxDQUFDLEdBQUcsQ0FEckI7QUFBQTtBQUFBO0FBQUE7O0FBRVNsQixVQUFBQSxNQUZULEdBRWtCLGtCQUFLbUIsSUFBSSxDQUFDQyxNQUFMLEdBQWN6QixRQUFkLEVBQUwsRUFBK0JBLFFBQS9CLEVBRmxCO0FBQUE7QUFBQSxpQkFHc0JrQixXQUFXLENBQUNiLE1BQUQsQ0FIakM7O0FBQUE7QUFHU3FCLFVBQUFBLElBSFQ7QUFJU0MsVUFBQUEsR0FKVCxHQUllLElBQUl6QixpQkFBSixDQUFhRyxNQUFiLENBSmY7QUFLR2lCLFVBQUFBLElBQUksQ0FBQ00sSUFBTCxDQUFVRCxHQUFWO0FBQ0FBLFVBQUFBLEdBQUcsQ0FBQ2QsUUFBSixDQUFhYSxJQUFiO0FBTkg7QUFBQSxpQkFPU2hDLEtBQUssQ0FBQyxDQUFELENBUGQ7O0FBQUE7QUFDd0I2QixVQUFBQSxDQUFDLEVBRHpCO0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxDQUFEIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFdlYlJUQyBmcm9tIFwic2ltcGxlLWRhdGFjaGFubmVsL2xpYi9Ob2RlUlRDXCI7XG5pbXBvcnQgS2FkZW1saWEgZnJvbSBcIi4uL2thZC9rYWRlbWxpYVwiO1xuaW1wb3J0IHNoYTEgZnJvbSBcInNoYTFcIjtcblxuY29uc3Qgc2xlZXAgPSAod2FpdFNlY29uZHM6IG51bWJlcikgPT4ge1xuICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICByZXNvbHZlKCk7XG4gICAgfSwgd2FpdFNlY29uZHMgKiAxMDAwKTtcbiAgfSk7XG59O1xuXG5jb25zdCBwb3J0YWxOb2RlSWQgPSBzaGExKFwicG9ydGFsbm9kZVwiKS50b1N0cmluZygpO1xuY29uc3QgcG9ydGFsTm9kZUthZCA9IG5ldyBLYWRlbWxpYShwb3J0YWxOb2RlSWQpO1xuXG5mdW5jdGlvbiBwb3J0YWxOb2RlQW5zd2VyKFxuICBzZHA6IGFueSxcbiAgbm9kZUlkOiBzdHJpbmcsXG4gIGNhbGxiYWNrOiAobG9jYWw6IGFueSkgPT4gdm9pZFxuKSB7XG4gIGNvbnN0IFBvcnRhbE5vZGUgPSBuZXcgV2ViUlRDKCk7XG4gIFBvcnRhbE5vZGUuY29ubmVjdGluZyhub2RlSWQpO1xuICBQb3J0YWxOb2RlLmNvbm5lY3QgPSAoKSA9PiB7XG4gICAgY29uc29sZS5sb2coXCJwb3J0YWxub2RlIGNvbm5lY3RlZFwiLCBwb3J0YWxOb2RlSWQsIG5vZGVJZCk7XG4gICAgcG9ydGFsTm9kZUthZC5hZGRrbm9kZShQb3J0YWxOb2RlKTtcbiAgfTtcbiAgUG9ydGFsTm9kZS5tYWtlQW5zd2VyKHNkcCwgeyBkaXNhYmxlX3N0dW46IHRydWUgfSk7XG4gIFBvcnRhbE5vZGUuc2lnbmFsID0gbG9jYWwgPT4ge1xuICAgIGNhbGxiYWNrKGxvY2FsKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gY29ubmVjdE5vZGUobm9kZUlkOiBzdHJpbmcpIHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlPFdlYlJUQz4ocmVzb2x2ZSA9PiB7XG4gICAgY29uc3QgTm9kZSA9IG5ldyBXZWJSVEMoKTtcbiAgICBOb2RlLmNvbm5lY3RpbmcocG9ydGFsTm9kZUlkKTtcbiAgICBOb2RlLm1ha2VPZmZlcih7IGRpc2FibGVfc3R1bjogdHJ1ZSB9KTtcbiAgICBOb2RlLnNpZ25hbCA9IGxvY2FsID0+IHtcbiAgICAgIHBvcnRhbE5vZGVBbnN3ZXIobG9jYWwsIG5vZGVJZCwgc2RwID0+IHtcbiAgICAgICAgTm9kZS5zZXRBbnN3ZXIoc2RwKTtcbiAgICAgIH0pO1xuICAgIH07XG4gICAgTm9kZS5jb25uZWN0ID0gKCkgPT4ge1xuICAgICAgcmVzb2x2ZShOb2RlKTtcbiAgICB9O1xuICB9KTtcbn1cblxuY29uc3QgS2FkczogQXJyYXk8S2FkZW1saWE+ID0gW107XG5cbihhc3luYyAoKSA9PiB7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgMTsgaSsrKSB7XG4gICAgY29uc3Qgbm9kZUlkID0gc2hhMShNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKCkpLnRvU3RyaW5nKCk7XG4gICAgY29uc3Qgbm9kZSA9IGF3YWl0IGNvbm5lY3ROb2RlKG5vZGVJZCk7XG4gICAgY29uc3Qga2FkID0gbmV3IEthZGVtbGlhKG5vZGVJZCk7XG4gICAgS2Fkcy5wdXNoKGthZCk7XG4gICAga2FkLmFkZGtub2RlKG5vZGUpO1xuICAgIGF3YWl0IHNsZWVwKDEpO1xuICB9XG59KSgpO1xuIl19
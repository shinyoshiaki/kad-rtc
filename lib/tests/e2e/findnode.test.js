"use strict";

var _webrtc4me = _interopRequireDefault(require("webrtc4me"));

var _kademlia = _interopRequireDefault(require("../../kad/kademlia"));

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
  PortalNode.connect =
  /*#__PURE__*/
  _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee() {
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            portalNodeKad.addknode(PortalNode);

          case 1:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
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
test("findnode",
/*#__PURE__*/
function () {
  var _ref2 = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee2(done) {
    var i, kad, node, num;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            i = 0;

          case 1:
            if (!(i < 4)) {
              _context2.next = 11;
              break;
            }

            kad = new _kademlia.default();
            _context2.next = 5;
            return connectNode(kad.nodeId);

          case 5:
            node = _context2.sent;
            Kads.push(kad);
            kad.addknode(node);

          case 8:
            i++;
            _context2.next = 1;
            break;

          case 11:
            num = Kads[Kads.length - 1].f.getAllPeerIds().length;
            expect(num).toBe(3);
            done();

          case 14:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));

  return function (_x) {
    return _ref2.apply(this, arguments);
  };
}(), 30 * 1000);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy90ZXN0cy9lMmUvZmluZG5vZGUudGVzdC50cyJdLCJuYW1lcyI6WyJzbGVlcCIsIndhaXRTZWNvbmRzIiwiUHJvbWlzZSIsInJlc29sdmUiLCJzZXRUaW1lb3V0IiwicG9ydGFsTm9kZUthZCIsIkthZGVtbGlhIiwicG9ydGFsTm9kZUFuc3dlciIsInNkcCIsIm5vZGVJZCIsImNhbGxiYWNrIiwiUG9ydGFsTm9kZSIsIldlYlJUQyIsImRpc2FibGVfc3R1biIsImNvbm5lY3QiLCJhZGRrbm9kZSIsInNldFNkcCIsInNpZ25hbCIsImxvY2FsIiwiY29ubmVjdE5vZGUiLCJOb2RlIiwibWFrZU9mZmVyIiwiS2FkcyIsInRlc3QiLCJkb25lIiwiaSIsImthZCIsIm5vZGUiLCJwdXNoIiwibnVtIiwibGVuZ3RoIiwiZiIsImdldEFsbFBlZXJJZHMiLCJleHBlY3QiLCJ0b0JlIl0sIm1hcHBpbmdzIjoiOztBQUFBOztBQUNBOzs7Ozs7OztBQUVBLElBQU1BLEtBQUssR0FBRyxTQUFSQSxLQUFRLENBQUNDLFdBQUQsRUFBeUI7QUFDckMsU0FBTyxJQUFJQyxPQUFKLENBQVksVUFBQUMsT0FBTyxFQUFJO0FBQzVCQyxJQUFBQSxVQUFVLENBQUMsWUFBTTtBQUNmRCxNQUFBQSxPQUFPO0FBQ1IsS0FGUyxFQUVQRixXQUFXLEdBQUcsSUFGUCxDQUFWO0FBR0QsR0FKTSxDQUFQO0FBS0QsQ0FORDs7QUFRQSxJQUFNSSxhQUFhLEdBQUcsSUFBSUMsaUJBQUosRUFBdEI7O0FBRUEsU0FBU0MsZ0JBQVQsQ0FDRUMsR0FERixFQUVFQyxNQUZGLEVBR0VDLFFBSEYsRUFJRTtBQUNBLE1BQU1DLFVBQVUsR0FBRyxJQUFJQyxrQkFBSixDQUFXO0FBQUVDLElBQUFBLFlBQVksRUFBRSxJQUFoQjtBQUFzQkosSUFBQUEsTUFBTSxFQUFOQTtBQUF0QixHQUFYLENBQW5CO0FBQ0FFLEVBQUFBLFVBQVUsQ0FBQ0csT0FBWDtBQUFBO0FBQUE7QUFBQTtBQUFBLDBCQUFxQjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQ25CVCxZQUFBQSxhQUFhLENBQUNVLFFBQWQsQ0FBdUJKLFVBQXZCOztBQURtQjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxHQUFyQjtBQUdBQSxFQUFBQSxVQUFVLENBQUNLLE1BQVgsQ0FBa0JSLEdBQWxCOztBQUNBRyxFQUFBQSxVQUFVLENBQUNNLE1BQVgsR0FBb0IsVUFBQUMsS0FBSyxFQUFJO0FBQzNCUixJQUFBQSxRQUFRLENBQUNRLEtBQUQsQ0FBUjtBQUNELEdBRkQ7QUFHRDs7QUFFRCxTQUFTQyxXQUFULENBQXFCVixNQUFyQixFQUFxQztBQUNuQyxTQUFPLElBQUlQLE9BQUosQ0FBb0IsVUFBQUMsT0FBTyxFQUFJO0FBQ3BDLFFBQU1pQixJQUFJLEdBQUcsSUFBSVIsa0JBQUosQ0FBVztBQUN0QkMsTUFBQUEsWUFBWSxFQUFFLElBRFE7QUFFdEJKLE1BQUFBLE1BQU0sRUFBRUosYUFBYSxDQUFDSTtBQUZBLEtBQVgsQ0FBYjtBQUlBVyxJQUFBQSxJQUFJLENBQUNDLFNBQUw7O0FBQ0FELElBQUFBLElBQUksQ0FBQ0gsTUFBTCxHQUFjLFVBQUFDLEtBQUssRUFBSTtBQUNyQlgsTUFBQUEsZ0JBQWdCLENBQUNXLEtBQUQsRUFBUVQsTUFBUixFQUFnQixVQUFBRCxHQUFHLEVBQUk7QUFDckNZLFFBQUFBLElBQUksQ0FBQ0osTUFBTCxDQUFZUixHQUFaO0FBQ0QsT0FGZSxDQUFoQjtBQUdELEtBSkQ7O0FBS0FZLElBQUFBLElBQUksQ0FBQ04sT0FBTCxHQUFlLFlBQU07QUFDbkJYLE1BQUFBLE9BQU8sQ0FBQ2lCLElBQUQsQ0FBUDtBQUNELEtBRkQ7QUFHRCxHQWRNLENBQVA7QUFlRDs7QUFFRCxJQUFNRSxJQUFxQixHQUFHLEVBQTlCO0FBRUFDLElBQUksQ0FDRixVQURFO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSwwQkFFRixrQkFBTUMsSUFBTjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFDV0MsWUFBQUEsQ0FEWCxHQUNlLENBRGY7O0FBQUE7QUFBQSxrQkFDa0JBLENBQUMsR0FBRyxDQUR0QjtBQUFBO0FBQUE7QUFBQTs7QUFFVUMsWUFBQUEsR0FGVixHQUVnQixJQUFJcEIsaUJBQUosRUFGaEI7QUFBQTtBQUFBLG1CQUd1QmEsV0FBVyxDQUFDTyxHQUFHLENBQUNqQixNQUFMLENBSGxDOztBQUFBO0FBR1VrQixZQUFBQSxJQUhWO0FBSUlMLFlBQUFBLElBQUksQ0FBQ00sSUFBTCxDQUFVRixHQUFWO0FBQ0FBLFlBQUFBLEdBQUcsQ0FBQ1gsUUFBSixDQUFhWSxJQUFiOztBQUxKO0FBQ3lCRixZQUFBQSxDQUFDLEVBRDFCO0FBQUE7QUFBQTs7QUFBQTtBQU9RSSxZQUFBQSxHQVBSLEdBT2NQLElBQUksQ0FBQ0EsSUFBSSxDQUFDUSxNQUFMLEdBQWMsQ0FBZixDQUFKLENBQXNCQyxDQUF0QixDQUF3QkMsYUFBeEIsR0FBd0NGLE1BUHREO0FBU0VHLFlBQUFBLE1BQU0sQ0FBQ0osR0FBRCxDQUFOLENBQVlLLElBQVosQ0FBaUIsQ0FBakI7QUFDQVYsWUFBQUEsSUFBSTs7QUFWTjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxHQUZFOztBQUFBO0FBQUE7QUFBQTtBQUFBLEtBY0YsS0FBSyxJQWRILENBQUoiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgV2ViUlRDIGZyb20gXCJ3ZWJydGM0bWVcIjtcbmltcG9ydCBLYWRlbWxpYSBmcm9tIFwiLi4vLi4va2FkL2thZGVtbGlhXCI7XG5cbmNvbnN0IHNsZWVwID0gKHdhaXRTZWNvbmRzOiBudW1iZXIpID0+IHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgcmVzb2x2ZSgpO1xuICAgIH0sIHdhaXRTZWNvbmRzICogMTAwMCk7XG4gIH0pO1xufTtcblxuY29uc3QgcG9ydGFsTm9kZUthZCA9IG5ldyBLYWRlbWxpYSgpO1xuXG5mdW5jdGlvbiBwb3J0YWxOb2RlQW5zd2VyKFxuICBzZHA6IGFueSxcbiAgbm9kZUlkOiBzdHJpbmcsXG4gIGNhbGxiYWNrOiAobG9jYWw6IGFueSkgPT4gdm9pZFxuKSB7XG4gIGNvbnN0IFBvcnRhbE5vZGUgPSBuZXcgV2ViUlRDKHsgZGlzYWJsZV9zdHVuOiB0cnVlLCBub2RlSWQgfSk7XG4gIFBvcnRhbE5vZGUuY29ubmVjdCA9IGFzeW5jICgpID0+IHtcbiAgICBwb3J0YWxOb2RlS2FkLmFkZGtub2RlKFBvcnRhbE5vZGUpO1xuICB9O1xuICBQb3J0YWxOb2RlLnNldFNkcChzZHApO1xuICBQb3J0YWxOb2RlLnNpZ25hbCA9IGxvY2FsID0+IHtcbiAgICBjYWxsYmFjayhsb2NhbCk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGNvbm5lY3ROb2RlKG5vZGVJZDogc3RyaW5nKSB7XG4gIHJldHVybiBuZXcgUHJvbWlzZTxXZWJSVEM+KHJlc29sdmUgPT4ge1xuICAgIGNvbnN0IE5vZGUgPSBuZXcgV2ViUlRDKHtcbiAgICAgIGRpc2FibGVfc3R1bjogdHJ1ZSxcbiAgICAgIG5vZGVJZDogcG9ydGFsTm9kZUthZC5ub2RlSWRcbiAgICB9KTtcbiAgICBOb2RlLm1ha2VPZmZlcigpO1xuICAgIE5vZGUuc2lnbmFsID0gbG9jYWwgPT4ge1xuICAgICAgcG9ydGFsTm9kZUFuc3dlcihsb2NhbCwgbm9kZUlkLCBzZHAgPT4ge1xuICAgICAgICBOb2RlLnNldFNkcChzZHApO1xuICAgICAgfSk7XG4gICAgfTtcbiAgICBOb2RlLmNvbm5lY3QgPSAoKSA9PiB7XG4gICAgICByZXNvbHZlKE5vZGUpO1xuICAgIH07XG4gIH0pO1xufVxuXG5jb25zdCBLYWRzOiBBcnJheTxLYWRlbWxpYT4gPSBbXTtcblxudGVzdChcbiAgXCJmaW5kbm9kZVwiLFxuICBhc3luYyBkb25lID0+IHtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IDQ7IGkrKykge1xuICAgICAgY29uc3Qga2FkID0gbmV3IEthZGVtbGlhKCk7XG4gICAgICBjb25zdCBub2RlID0gYXdhaXQgY29ubmVjdE5vZGUoa2FkLm5vZGVJZCk7XG4gICAgICBLYWRzLnB1c2goa2FkKTtcbiAgICAgIGthZC5hZGRrbm9kZShub2RlKTtcbiAgICB9XG4gICAgY29uc3QgbnVtID0gS2Fkc1tLYWRzLmxlbmd0aCAtIDFdLmYuZ2V0QWxsUGVlcklkcygpLmxlbmd0aDtcblxuICAgIGV4cGVjdChudW0pLnRvQmUoMyk7XG4gICAgZG9uZSgpO1xuICB9LFxuICAzMCAqIDEwMDBcbik7XG4iXX0=
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _sha = require("sha1");

var _sha2 = _interopRequireDefault(_sha);

var _Kademlia = require("./Kademlia");

var _Kademlia2 = _interopRequireDefault(_Kademlia);

var _KConst = require("./KConst");

var _KConst2 = _interopRequireDefault(_KConst);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var k = void 0;
// let k = new Kademlia(null);

var responder = {};

var KResponder = function () {
  function KResponder(kad) {
    _classCallCheck(this, KResponder);

    k = kad;
    this.responder = responder;
  }

  _createClass(KResponder, [{
    key: "response",
    value: function response(rpc, req) {
      console.log("kad rpc", rpc, req);
      if (Object.keys(responder).includes(rpc)) {
        this.responder[rpc](req);
      }
    }
  }]);

  return KResponder;
}();

exports.default = KResponder;


responder[_KConst2.default.STORE] = function (network) {
  console.log("on store", network.nodeId);

  var data = network.data;

  var mine = k.f.distance(k.nodeId, data.key);
  var close = k.f.getCloseEstDist(data.key);
  if (mine > close) {
    console.log("store transfer", "\ndata", data);
    k.store(data.sender, data.key, data.value);
  } else {
    console.log("store arrived", mine, close, "\ndata", data);
    k.ev.emit("onStore", data.value);
  }

  var target = data.sender;

  if (data.key === k.nodeId && !k.f.isNodeExist(target)) {
    if (data.value.sdp) {
      console.log("is signaling");
      if (data.value.sdp.type === "offer") {
        console.log("kad received offer", data.sender);

        k.answer(target, data.value.sdp, data.value.proxy).then(function (peer) {
          return k.addknode(peer);
        }, function (err) {
          return console.log("findnode answer fail", target, err);
        });
      } else if (data.value.sdp.type === "answer") {
        console.log("kad received answer", data.sender);
        try {
          k.ref[target].setAnswer(data.value.sdp);
        } catch (error) {
          console.log(error);
        }
      }
    }
  }
};

responder[_KConst2.default.FINDNODE] = function (network) {
  console.log("on findnode", network.nodeId);
  var data = network.data;
  var sendData = { closeIDs: k.f.getCloseIDs(data.targetKey) };
  if (k.f.getPeerFromnodeId(network.nodeId) != null) {
    k.f.getPeerFromnodeId(network.nodeId).send((0, _Kademlia.networkFormat)(k.nodeId, _KConst2.default.FINDNODE_R, sendData), "kad");
  }
};

responder[_KConst2.default.FINDNODE_R] = function _callee2(network) {
  var data, ids;
  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          data = network.data;
          ids = data.closeIDs;

          console.log("on findnode-r", ids);

          Promise.all(ids.map(function _callee(target) {
            var close;
            return regeneratorRuntime.async(function _callee$(_context) {
              while (1) {
                switch (_context.prev = _context.next) {
                  case 0:
                    if (!(target !== k.nodeId && !k.f.isNodeExist(target))) {
                      _context.next = 7;
                      break;
                    }

                    if (!(!k.failPeerList[target] || k.failPeerList[target] < 3)) {
                      _context.next = 6;
                      break;
                    }

                    _context.next = 4;
                    return regeneratorRuntime.awrap(k.offer(target, network.nodeId).then(function (peer) {
                      return k.addknode(peer);
                    }, function (err) {
                      return console.log("kad offer fail", err);
                    }));

                  case 4:
                    _context.next = 7;
                    break;

                  case 6:
                    console.log("fail too much kad offer", target);

                  case 7:
                    if (k.state.findNode !== k.nodeId) {
                      if (!ids.includes(k.state.findNode)) {
                        close = k.f.getCloseEstPeer(k.state.findNode, {
                          excludeId: network.nodeId
                        });

                        console.log("findnode-r keep find node", k.state.findNode);
                        k.findNode(k.state.findNode, close);
                      }
                    }

                  case 8:
                  case "end":
                    return _context.stop();
                }
              }
            }, null, undefined);
          }));

        case 4:
        case "end":
          return _context2.stop();
      }
    }
  }, null, undefined);
};

responder[_KConst2.default.FINDVALUE] = function (network) {
  console.log("on findvalue", network.nodeId);
  var data = network.data;

  if (k.nodeId === data.targetNode && Object.keys(k.keyValueList).includes(data.targetKey)) {
    var arr = k.keyValueList[data.targetKey];
    var peer = k.f.getPeerFromnodeId(network.nodeId);
    peer.send(JSON.stringify({ type: "start", data: (0, _sha2.default)(arr) }), "data");
    arr.forEach(function (ab) {
      peer.send(ab, "data");
    });
    peer.send(JSON.stringify({ type: "end" }), "data");
  } else {
    var ids = k.f.getCloseEstIdsList;
    k.f.getPeerFromnodeId(network.nodeId).send((0, _Kademlia.networkFormat)(k.nodeId, _KConst2.default.FINDVALUE_R, {
      ids: ids,
      targetNode: data.targetNode,
      targetKey: data.targetKey,
      to: network.nodeId
    }), "kad");
  }
};

responder[_KConst2.default.FINDVALUE_R] = function (network) {
  var data = network.data;
  if (data.to === k.nodeId) {
    console.log(_KConst2.default.FINDVALUE_R, "re find");

    (function _callee3() {
      var id;
      return regeneratorRuntime.async(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              _context3.t0 = regeneratorRuntime.keys(data.ids);

            case 1:
              if ((_context3.t1 = _context3.t0()).done) {
                _context3.next = 7;
                break;
              }

              id = _context3.t1.value;
              _context3.next = 5;
              return regeneratorRuntime.awrap(k.offer(id, network.nodeId).then(function (peer) {
                k.addknode(peer);
                k.doFindvalue(data.key);
              }, function (err) {
                return console.log("kad offer fail", err);
              }));

            case 5:
              _context3.next = 1;
              break;

            case 7:
            case "end":
              return _context3.stop();
          }
        }
      }, null, undefined);
    })();
  }
};

responder[_KConst2.default.PING] = function (network) {
  var data = network.data;

  if (data.target === k.nodeId) {
    console.log("ping received");
    k.f.getAllPeers().forEach(function (v) {
      if (v.nodeId === network.nodeId) {
        var sendData = { target: network.nodeId };
        v.send((0, _Kademlia.networkFormat)(k.nodeId, _KConst2.default.PONG, sendData), "kad");
      }
    });
  }
};

responder[_KConst2.default.PONG] = function (network) {
  var data = network.data;

  if (data.target === k.nodeId) {
    console.log("pong received", network.nodeId);
    k.pingResult[network.nodeId] = true;
  }
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9rYWQvS1Jlc3BvbmRlci5qcyJdLCJuYW1lcyI6WyJrIiwicmVzcG9uZGVyIiwiS1Jlc3BvbmRlciIsImthZCIsInJwYyIsInJlcSIsImNvbnNvbGUiLCJsb2ciLCJPYmplY3QiLCJrZXlzIiwiaW5jbHVkZXMiLCJkZWYiLCJTVE9SRSIsIm5ldHdvcmsiLCJub2RlSWQiLCJkYXRhIiwibWluZSIsImYiLCJkaXN0YW5jZSIsImtleSIsImNsb3NlIiwiZ2V0Q2xvc2VFc3REaXN0Iiwic3RvcmUiLCJzZW5kZXIiLCJ2YWx1ZSIsImV2IiwiZW1pdCIsInRhcmdldCIsImlzTm9kZUV4aXN0Iiwic2RwIiwidHlwZSIsImFuc3dlciIsInByb3h5IiwidGhlbiIsImFkZGtub2RlIiwicGVlciIsImVyciIsInJlZiIsInNldEFuc3dlciIsImVycm9yIiwiRklORE5PREUiLCJzZW5kRGF0YSIsImNsb3NlSURzIiwiZ2V0Q2xvc2VJRHMiLCJ0YXJnZXRLZXkiLCJnZXRQZWVyRnJvbW5vZGVJZCIsInNlbmQiLCJGSU5ETk9ERV9SIiwiaWRzIiwiUHJvbWlzZSIsImFsbCIsIm1hcCIsImZhaWxQZWVyTGlzdCIsIm9mZmVyIiwic3RhdGUiLCJmaW5kTm9kZSIsImdldENsb3NlRXN0UGVlciIsImV4Y2x1ZGVJZCIsIkZJTkRWQUxVRSIsInRhcmdldE5vZGUiLCJrZXlWYWx1ZUxpc3QiLCJhcnIiLCJKU09OIiwic3RyaW5naWZ5IiwiZm9yRWFjaCIsImFiIiwiZ2V0Q2xvc2VFc3RJZHNMaXN0IiwiRklORFZBTFVFX1IiLCJ0byIsImlkIiwiZG9GaW5kdmFsdWUiLCJQSU5HIiwiZ2V0QWxsUGVlcnMiLCJ2IiwiUE9ORyIsInBpbmdSZXN1bHQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBQUE7Ozs7QUFDQTs7OztBQUVBOzs7Ozs7OztBQUVBLElBQUlBLFVBQUo7QUFDQTs7QUFFQSxJQUFNQyxZQUFZLEVBQWxCOztJQUVxQkMsVTtBQUNuQixzQkFBWUMsR0FBWixF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QUFJQSxLQUFLWSxNQUFMLEtBQWdCM0IsRUFBRWMsTUFBdEIsRUFBOEI7QUFDNUJSLFlBQVFDLEdBQVIsQ0FBWSxlQUFaLEVBQTZCTSxRQUFRQyxNQUFyQztBQUNBZCxNQUFFMkUsVUFBRixDQUFhOUQsUUFBUUMsTUFBckIsSUFBK0IsSUFBL0I7QUFDRDtBQUNGLENBUEQiLCJmaWxlIjoiS1Jlc3BvbmRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBzaGExIGZyb20gXCJzaGExXCI7XG5pbXBvcnQgeyBuZXR3b3JrRm9ybWF0IH0gZnJvbSBcIi4vS2FkZW1saWFcIjtcbmltcG9ydCBLYWRlbWxpYSBmcm9tIFwiLi9LYWRlbWxpYVwiO1xuaW1wb3J0IGRlZiBmcm9tIFwiLi9LQ29uc3RcIjtcblxubGV0IGs7XG4vLyBsZXQgayA9IG5ldyBLYWRlbWxpYShudWxsKTtcblxuY29uc3QgcmVzcG9uZGVyID0ge307XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEtSZXNwb25kZXIge1xuICBjb25zdHJ1Y3RvcihrYWQpIHtcbiAgICBrID0ga2FkO1xuICAgIHRoaXMucmVzcG9uZGVyID0gcmVzcG9uZGVyO1xuICB9XG5cbiAgcmVzcG9uc2UocnBjLCByZXEpIHtcbiAgICBjb25zb2xlLmxvZyhcImthZCBycGNcIiwgcnBjLCByZXEpO1xuICAgIGlmIChPYmplY3Qua2V5cyhyZXNwb25kZXIpLmluY2x1ZGVzKHJwYykpIHtcbiAgICAgIHRoaXMucmVzcG9uZGVyW3JwY10ocmVxKTtcbiAgICB9XG4gIH1cbn1cblxucmVzcG9uZGVyW2RlZi5TVE9SRV0gPSBuZXR3b3JrID0+IHtcbiAgY29uc29sZS5sb2coXCJvbiBzdG9yZVwiLCBuZXR3b3JrLm5vZGVJZCk7XG5cbiAgY29uc3QgZGF0YSA9IG5ldHdvcmsuZGF0YTtcblxuICBjb25zdCBtaW5lID0gay5mLmRpc3RhbmNlKGsubm9kZUlkLCBkYXRhLmtleSk7XG4gIGNvbnN0IGNsb3NlID0gay5mLmdldENsb3NlRXN0RGlzdChkYXRhLmtleSk7XG4gIGlmIChtaW5lID4gY2xvc2UpIHtcbiAgICBjb25zb2xlLmxvZyhcInN0b3JlIHRyYW5zZmVyXCIsIFwiXFxuZGF0YVwiLCBkYXRhKTtcbiAgICBrLnN0b3JlKGRhdGEuc2VuZGVyLCBkYXRhLmtleSwgZGF0YS52YWx1ZSk7XG4gIH0gZWxzZSB7XG4gICAgY29uc29sZS5sb2coXCJzdG9yZSBhcnJpdmVkXCIsIG1pbmUsIGNsb3NlLCBcIlxcbmRhdGFcIiwgZGF0YSk7XG4gICAgay5ldi5lbWl0KFwib25TdG9yZVwiLCBkYXRhLnZhbHVlKTtcbiAgfVxuXG4gIGNvbnN0IHRhcmdldCA9IGRhdGEuc2VuZGVyO1xuXG4gIGlmIChkYXRhLmtleSA9PT0gay5ub2RlSWQgJiYgIWsuZi5pc05vZGVFeGlzdCh0YXJnZXQpKSB7XG4gICAgaWYgKGRhdGEudmFsdWUuc2RwKSB7XG4gICAgICBjb25zb2xlLmxvZyhcImlzIHNpZ25hbGluZ1wiKTtcbiAgICAgIGlmIChkYXRhLnZhbHVlLnNkcC50eXBlID09PSBcIm9mZmVyXCIpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJrYWQgcmVjZWl2ZWQgb2ZmZXJcIiwgZGF0YS5zZW5kZXIpO1xuXG4gICAgICAgIGsuYW5zd2VyKHRhcmdldCwgZGF0YS52YWx1ZS5zZHAsIGRhdGEudmFsdWUucHJveHkpLnRoZW4oXG4gICAgICAgICAgcGVlciA9PiBrLmFkZGtub2RlKHBlZXIpLFxuICAgICAgICAgIGVyciA9PiBjb25zb2xlLmxvZyhcImZpbmRub2RlIGFuc3dlciBmYWlsXCIsIHRhcmdldCwgZXJyKVxuICAgICAgICApO1xuICAgICAgfSBlbHNlIGlmIChkYXRhLnZhbHVlLnNkcC50eXBlID09PSBcImFuc3dlclwiKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwia2FkIHJlY2VpdmVkIGFuc3dlclwiLCBkYXRhLnNlbmRlcik7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgay5yZWZbdGFyZ2V0XS5zZXRBbnN3ZXIoZGF0YS52YWx1ZS5zZHApO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxufTtcblxucmVzcG9uZGVyW2RlZi5GSU5ETk9ERV0gPSBuZXR3b3JrID0+IHtcbiAgY29uc29sZS5sb2coXCJvbiBmaW5kbm9kZVwiLCBuZXR3b3JrLm5vZGVJZCk7XG4gIGNvbnN0IGRhdGEgPSBuZXR3b3JrLmRhdGE7XG4gIGNvbnN0IHNlbmREYXRhID0geyBjbG9zZUlEczogay5mLmdldENsb3NlSURzKGRhdGEudGFyZ2V0S2V5KSB9O1xuICBpZiAoay5mLmdldFBlZXJGcm9tbm9kZUlkKG5ldHdvcmsubm9kZUlkKSAhPSBudWxsKSB7XG4gICAgay5mXG4gICAgICAuZ2V0UGVlckZyb21ub2RlSWQobmV0d29yay5ub2RlSWQpXG4gICAgICAuc2VuZChuZXR3b3JrRm9ybWF0KGsubm9kZUlkLCBkZWYuRklORE5PREVfUiwgc2VuZERhdGEpLCBcImthZFwiKTtcbiAgfVxufTtcblxucmVzcG9uZGVyW2RlZi5GSU5ETk9ERV9SXSA9IGFzeW5jIG5ldHdvcmsgPT4ge1xuICBjb25zdCBkYXRhID0gbmV0d29yay5kYXRhO1xuICBjb25zdCBpZHMgPSBkYXRhLmNsb3NlSURzO1xuICBjb25zb2xlLmxvZyhcIm9uIGZpbmRub2RlLXJcIiwgaWRzKTtcblxuICBQcm9taXNlLmFsbChcbiAgICBpZHMubWFwKGFzeW5jIHRhcmdldCA9PiB7XG4gICAgICBpZiAodGFyZ2V0ICE9PSBrLm5vZGVJZCAmJiAhay5mLmlzTm9kZUV4aXN0KHRhcmdldCkpIHtcbiAgICAgICAgaWYgKCFrLmZhaWxQZWVyTGlzdFt0YXJnZXRdIHx8IGsuZmFpbFBlZXJMaXN0W3RhcmdldF0gPCAzKSB7XG4gICAgICAgICAgYXdhaXQga1xuICAgICAgICAgICAgLm9mZmVyKHRhcmdldCwgbmV0d29yay5ub2RlSWQpXG4gICAgICAgICAgICAudGhlbihcbiAgICAgICAgICAgICAgcGVlciA9PiBrLmFkZGtub2RlKHBlZXIpLFxuICAgICAgICAgICAgICBlcnIgPT4gY29uc29sZS5sb2coXCJrYWQgb2ZmZXIgZmFpbFwiLCBlcnIpXG4gICAgICAgICAgICApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnNvbGUubG9nKFwiZmFpbCB0b28gbXVjaCBrYWQgb2ZmZXJcIiwgdGFyZ2V0KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKGsuc3RhdGUuZmluZE5vZGUgIT09IGsubm9kZUlkKSB7XG4gICAgICAgIGlmICghaWRzLmluY2x1ZGVzKGsuc3RhdGUuZmluZE5vZGUpKSB7XG4gICAgICAgICAgY29uc3QgY2xvc2UgPSBrLmYuZ2V0Q2xvc2VFc3RQZWVyKGsuc3RhdGUuZmluZE5vZGUsIHtcbiAgICAgICAgICAgIGV4Y2x1ZGVJZDogbmV0d29yay5ub2RlSWRcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBjb25zb2xlLmxvZyhcImZpbmRub2RlLXIga2VlcCBmaW5kIG5vZGVcIiwgay5zdGF0ZS5maW5kTm9kZSk7XG4gICAgICAgICAgay5maW5kTm9kZShrLnN0YXRlLmZpbmROb2RlLCBjbG9zZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxuICApO1xufTtcblxucmVzcG9uZGVyW2RlZi5GSU5EVkFMVUVdID0gbmV0d29yayA9PiB7XG4gIGNvbnNvbGUubG9nKFwib24gZmluZHZhbHVlXCIsIG5ldHdvcmsubm9kZUlkKTtcbiAgY29uc3QgZGF0YSA9IG5ldHdvcmsuZGF0YTtcblxuICBpZiAoXG4gICAgay5ub2RlSWQgPT09IGRhdGEudGFyZ2V0Tm9kZSAmJlxuICAgIE9iamVjdC5rZXlzKGsua2V5VmFsdWVMaXN0KS5pbmNsdWRlcyhkYXRhLnRhcmdldEtleSlcbiAgKSB7XG4gICAgY29uc3QgYXJyID0gay5rZXlWYWx1ZUxpc3RbZGF0YS50YXJnZXRLZXldO1xuICAgIGNvbnN0IHBlZXIgPSBrLmYuZ2V0UGVlckZyb21ub2RlSWQobmV0d29yay5ub2RlSWQpO1xuICAgIHBlZXIuc2VuZChKU09OLnN0cmluZ2lmeSh7IHR5cGU6IFwic3RhcnRcIiwgZGF0YTogc2hhMShhcnIpIH0pLCBcImRhdGFcIik7XG4gICAgYXJyLmZvckVhY2goYWIgPT4ge1xuICAgICAgcGVlci5zZW5kKGFiLCBcImRhdGFcIik7XG4gICAgfSk7XG4gICAgcGVlci5zZW5kKEpTT04uc3RyaW5naWZ5KHsgdHlwZTogXCJlbmRcIiB9KSwgXCJkYXRhXCIpO1xuICB9IGVsc2Uge1xuICAgIGNvbnN0IGlkcyA9IGsuZi5nZXRDbG9zZUVzdElkc0xpc3Q7XG4gICAgay5mLmdldFBlZXJGcm9tbm9kZUlkKG5ldHdvcmsubm9kZUlkKS5zZW5kKFxuICAgICAgbmV0d29ya0Zvcm1hdChrLm5vZGVJZCwgZGVmLkZJTkRWQUxVRV9SLCB7XG4gICAgICAgIGlkczogaWRzLFxuICAgICAgICB0YXJnZXROb2RlOiBkYXRhLnRhcmdldE5vZGUsXG4gICAgICAgIHRhcmdldEtleTogZGF0YS50YXJnZXRLZXksXG4gICAgICAgIHRvOiBuZXR3b3JrLm5vZGVJZFxuICAgICAgfSksXG4gICAgICBcImthZFwiXG4gICAgKTtcbiAgfVxufTtcblxucmVzcG9uZGVyW2RlZi5GSU5EVkFMVUVfUl0gPSBuZXR3b3JrID0+IHtcbiAgY29uc3QgZGF0YSA9IG5ldHdvcmsuZGF0YTtcbiAgaWYgKGRhdGEudG8gPT09IGsubm9kZUlkKSB7XG4gICAgY29uc29sZS5sb2coZGVmLkZJTkRWQUxVRV9SLCBcInJlIGZpbmRcIik7XG5cbiAgICAoYXN5bmMgKCkgPT4ge1xuICAgICAgZm9yIChsZXQgaWQgaW4gZGF0YS5pZHMpIHtcbiAgICAgICAgYXdhaXQgay5vZmZlcihpZCwgbmV0d29yay5ub2RlSWQpLnRoZW4oXG4gICAgICAgICAgcGVlciA9PiB7XG4gICAgICAgICAgICBrLmFkZGtub2RlKHBlZXIpO1xuICAgICAgICAgICAgay5kb0ZpbmR2YWx1ZShkYXRhLmtleSk7XG4gICAgICAgICAgfSxcbiAgICAgICAgICBlcnIgPT4gY29uc29sZS5sb2coXCJrYWQgb2ZmZXIgZmFpbFwiLCBlcnIpXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfSkoKTtcbiAgfVxufTtcblxucmVzcG9uZGVyW2RlZi5QSU5HXSA9IG5ldHdvcmsgPT4ge1xuICBjb25zdCBkYXRhID0gbmV0d29yay5kYXRhO1xuXG4gIGlmIChkYXRhLnRhcmdldCA9PT0gay5ub2RlSWQpIHtcbiAgICBjb25zb2xlLmxvZyhcInBpbmcgcmVjZWl2ZWRcIik7XG4gICAgay5mLmdldEFsbFBlZXJzKCkuZm9yRWFjaCh2ID0+IHtcbiAgICAgIGlmICh2Lm5vZGVJZCA9PT0gbmV0d29yay5ub2RlSWQpIHtcbiAgICAgICAgY29uc3Qgc2VuZERhdGEgPSB7IHRhcmdldDogbmV0d29yay5ub2RlSWQgfTtcbiAgICAgICAgdi5zZW5kKG5ldHdvcmtGb3JtYXQoay5ub2RlSWQsIGRlZi5QT05HLCBzZW5kRGF0YSksIFwia2FkXCIpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG59O1xuXG5yZXNwb25kZXJbZGVmLlBPTkddID0gbmV0d29yayA9PiB7XG4gIGNvbnN0IGRhdGEgPSBuZXR3b3JrLmRhdGE7XG5cbiAgaWYgKGRhdGEudGFyZ2V0ID09PSBrLm5vZGVJZCkge1xuICAgIGNvbnNvbGUubG9nKFwicG9uZyByZWNlaXZlZFwiLCBuZXR3b3JrLm5vZGVJZCk7XG4gICAgay5waW5nUmVzdWx0W25ldHdvcmsubm9kZUlkXSA9IHRydWU7XG4gIH1cbn07XG4iXX0=
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Kademlia = require("./Kademlia");

var _Kademlia2 = _interopRequireDefault(_Kademlia);

var _sha = require("sha1");

var _sha2 = _interopRequireDefault(_sha);

var _KConst = require("./KConst");

var _KConst2 = _interopRequireDefault(_KConst);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var k = void 0;
// let k = new Kademlia();

var KApp = function () {
  function KApp(kademlia) {
    _classCallCheck(this, KApp);

    k = kademlia;
    this.kad = k;

    k.kresponder.responder[_KConst2.default.BROADCAST] = function (network) {
      var str = JSON.stringify(network);
      k.f.getAllPeers().forEach(function (v) {
        var result = k.ping(v);
        if (result) {
          k.findNode(k.nodeId, v);
          v.send(str, "kad");
          console.log("broadcast done");
        } else {
          console.log("broadcast faile");
        }
      });
    };

    k.ev.on("onStore", function (value) {
      if (value.type === "storeFile") {
        console.log("on file store");
        k.findValue(value.nodeId, value.dataHash);
      }
    });
  }

  _createClass(KApp, [{
    key: "storeFileInfo",
    value: function storeFileInfo(arr, target) {
      console.log("store file", arr, target);
      var hash = (0, _sha2.default)(arr);
      k.keyValueList[hash] = arr;
      k.store(k.nodeId, target, {
        type: "storeFile",
        nodeId: k.nodeId,
        dataHash: hash
      });
    }
  }, {
    key: "broadcast",
    value: function broadcast(data) {
      k.f.getAllPeers().forEach(function (v) {
        var result = k.ping(v);
        if (result) {
          k.findNode(k.nodeId, v);
          v.send((0, _Kademlia.networkFormat)(k.nodeId, _KConst2.default.BROADCAST, data), "kad");
          console.log("broadcast done");
        } else {
          console.log("broadcast faile");
        }
      });
    }
  }]);

  return KApp;
}();

exports.default = KApp;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9rYWQvS0FwcC5qcyJdLCJuYW1lcyI6WyJrIiwiS0FwcCIsImthZGVtbGlhIiwia2FkIiwia3Jlc3BvbmRlciIsInJlc3BvbmRlciIsImRlZiIsIkJST0FEQ0FTVCIsInN0ciIsIkpTT04iLCJzdHJpbmdpZnkiLCJuZXR3b3JrIiwiZiIsImdldEFsbFBlZXJzIiwiZm9yRWFjaCIsInJlc3VsdCIsInBpbmciLCJ2IiwiZmluZE5vZGUiLCJub2RlSWQiLCJzZW5kIiwiY29uc29sZSIsImxvZyIsImV2Iiwib24iLCJ2YWx1ZSIsInR5cGUiLCJmaW5kVmFsdWUiLCJkYXRhSGFzaCIsImFyciIsInRhcmdldCIsImhhc2giLCJrZXlWYWx1ZUxpc3QiLCJzdG9yZSIsImRhdGEiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBQUE7Ozs7QUFFQTs7OztBQUNBOzs7Ozs7OztBQUVBLElBQUlBLFVBQUo7QUFDQTs7SUFFcUJDLEk7QUFDbkIsZ0JBQVlDLFFBQVosRUFBc0I7QUFBQTs7QUFDcEJGLFFBQUlFLFFBQUo7QUFDQSxTQUFLQyxHQUFMLEdBQVdILENBQVg7O0FBRUFBLE1BQUVJLFVBQUYsQ0FBYUMsU0FBYixDQUF1QkMsaUJBQUlDLFNBQTNCLElBQXdDLG1CQUFXO0FBQ2pELFVBQU1DLE1BQU1DLEtBQUtDLFNBQUwsQ0FBZUMsT0FBZixDQUFaO0FBQ0FYLFFBQUVZLENBQUYsQ0FBSUMsV0FBSixHQUFrQkMsT0FBbEIsQ0FBMEIsYUFBSztBQUM3QixZQUFNQyxTQUFTZixFQUFFZ0IsSUFBRixDQUFPQyxDQUFQLENBQWY7QUFDQSxZQUFJRixNQUFKLEVBQVk7QUFDVmYsWUFBRWtCLFFBQUYsQ0FBV2xCLEVBQUVtQixNQUFiLEVBQXFCRixDQUFyQjtBQUNBQSxZQUFFRyxJQUFGLENBQU9aLEdBQVAsRUFBWSxLQUFaO0FBQ0FhLGtCQUFRQyxHQUFSLENBQVksZ0JBQVo7QUFDRCxTQUpELE1BSU87QUFDTEQsa0JBQVFDLEdBQVIsQ0FBWSxpQkFBWjtBQUNEO0FBQ0YsT0FURDtBQVVELEtBWkQ7O0FBY0F0QixNQUFFdUIsRUFBRixDQUFLQyxFQUFMLENBQVEsU0FBUixFQUFtQixpQkFBUztBQUMxQixVQUFJQyxNQUFNQyxJQUFOLEtBQWUsV0FBbkIsRUFBZ0M7QUFDOUJMLGdCQUFRQyxHQUFSLENBQVksZUFBWjtBQUNBdEIsVUFBRTJCLFNBQUYsQ0FBWUYsTUFBTU4sTUFBbEIsRUFBMEJNLE1BQU1HLFFBQWhDO0FBQ0Q7QUFDRixLQUxEO0FBTUQ7Ozs7a0NBRWFDLEcsRUFBS0MsTSxFQUFRO0FBQ3pCVCxjQUFRQyxHQUFSLENBQVksWUFBWixFQUEwQk8sR0FBMUIsRUFBK0JDLE1BQS9CO0FBQ0EsVUFBTUMsT0FBTyxtQkFBS0YsR0FBTCxDQUFiO0FBQ0E3QixRQUFFZ0MsWUFBRixDQUFlRCxJQUFmLElBQXVCRixHQUF2QjtBQUNBN0IsUUFBRWlDLEtBQUYsQ0FBUWpDLEVBQUVtQixNQUFWLEVBQWtCVyxNQUFsQixFQUEwQjtBQUN4QkosY0FBTSxXQURrQjtBQUV4QlAsZ0JBQVFuQixFQUFFbUIsTUFGYztBQUd4QlMsa0JBQVVHO0FBSGMsT0FBMUI7QUFLRDs7OzhCQUVTRyxJLEVBQU07QUFDZGxDLFFBQUVZLENBQUYsQ0FBSUMsV0FBSixHQUFrQkMsT0FBbEIsQ0FBMEIsYUFBSztBQUM3QixZQUFNQyxTQUFTZixFQUFFZ0IsSUFBRixDQUFPQyxDQUFQLENBQWY7QUFDQSxZQUFJRixNQUFKLEVBQVk7QUFDVmYsWUFBRWtCLFFBQUYsQ0FBV2xCLEVBQUVtQixNQUFiLEVBQXFCRixDQUFyQjtBQUNBQSxZQUFFRyxJQUFGLENBQU8sNkJBQWNwQixFQUFFbUIsTUFBaEIsRUFBd0JiLGlCQUFJQyxTQUE1QixFQUF1QzJCLElBQXZDLENBQVAsRUFBcUQsS0FBckQ7QUFDQWIsa0JBQVFDLEdBQVIsQ0FBWSxnQkFBWjtBQUNELFNBSkQsTUFJTztBQUNMRCxrQkFBUUMsR0FBUixDQUFZLGlCQUFaO0FBQ0Q7QUFDRixPQVREO0FBVUQ7Ozs7OztrQkFqRGtCckIsSSIsImZpbGUiOiJLQXBwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgbmV0d29ya0Zvcm1hdCB9IGZyb20gXCIuL0thZGVtbGlhXCI7XG5pbXBvcnQgS2FkZW1saWEgZnJvbSBcIi4vS2FkZW1saWFcIjtcbmltcG9ydCBzaGExIGZyb20gXCJzaGExXCI7XG5pbXBvcnQgZGVmIGZyb20gXCIuL0tDb25zdFwiO1xuXG5sZXQgaztcbi8vIGxldCBrID0gbmV3IEthZGVtbGlhKCk7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEtBcHAge1xuICBjb25zdHJ1Y3RvcihrYWRlbWxpYSkge1xuICAgIGsgPSBrYWRlbWxpYTtcbiAgICB0aGlzLmthZCA9IGs7XG5cbiAgICBrLmtyZXNwb25kZXIucmVzcG9uZGVyW2RlZi5CUk9BRENBU1RdID0gbmV0d29yayA9PiB7XG4gICAgICBjb25zdCBzdHIgPSBKU09OLnN0cmluZ2lmeShuZXR3b3JrKTtcbiAgICAgIGsuZi5nZXRBbGxQZWVycygpLmZvckVhY2godiA9PiB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGsucGluZyh2KTtcbiAgICAgICAgaWYgKHJlc3VsdCkge1xuICAgICAgICAgIGsuZmluZE5vZGUoay5ub2RlSWQsIHYpO1xuICAgICAgICAgIHYuc2VuZChzdHIsIFwia2FkXCIpO1xuICAgICAgICAgIGNvbnNvbGUubG9nKFwiYnJvYWRjYXN0IGRvbmVcIik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc29sZS5sb2coXCJicm9hZGNhc3QgZmFpbGVcIik7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICBrLmV2Lm9uKFwib25TdG9yZVwiLCB2YWx1ZSA9PiB7XG4gICAgICBpZiAodmFsdWUudHlwZSA9PT0gXCJzdG9yZUZpbGVcIikge1xuICAgICAgICBjb25zb2xlLmxvZyhcIm9uIGZpbGUgc3RvcmVcIik7XG4gICAgICAgIGsuZmluZFZhbHVlKHZhbHVlLm5vZGVJZCwgdmFsdWUuZGF0YUhhc2gpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgc3RvcmVGaWxlSW5mbyhhcnIsIHRhcmdldCkge1xuICAgIGNvbnNvbGUubG9nKFwic3RvcmUgZmlsZVwiLCBhcnIsIHRhcmdldCk7XG4gICAgY29uc3QgaGFzaCA9IHNoYTEoYXJyKTtcbiAgICBrLmtleVZhbHVlTGlzdFtoYXNoXSA9IGFycjtcbiAgICBrLnN0b3JlKGsubm9kZUlkLCB0YXJnZXQsIHtcbiAgICAgIHR5cGU6IFwic3RvcmVGaWxlXCIsXG4gICAgICBub2RlSWQ6IGsubm9kZUlkLFxuICAgICAgZGF0YUhhc2g6IGhhc2hcbiAgICB9KTtcbiAgfVxuXG4gIGJyb2FkY2FzdChkYXRhKSB7XG4gICAgay5mLmdldEFsbFBlZXJzKCkuZm9yRWFjaCh2ID0+IHtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGsucGluZyh2KTtcbiAgICAgIGlmIChyZXN1bHQpIHtcbiAgICAgICAgay5maW5kTm9kZShrLm5vZGVJZCwgdik7XG4gICAgICAgIHYuc2VuZChuZXR3b3JrRm9ybWF0KGsubm9kZUlkLCBkZWYuQlJPQURDQVNULCBkYXRhKSwgXCJrYWRcIik7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiYnJvYWRjYXN0IGRvbmVcIik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmxvZyhcImJyb2FkY2FzdCBmYWlsZVwiKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxufVxuIl19
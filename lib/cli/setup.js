"use strict";

var _portalNode = _interopRequireDefault(require("../node/portalNode"));

var _inquirer = _interopRequireDefault(require("inquirer"));

var _sha = _interopRequireDefault(require("sha1"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var quesMyPort = {
  type: "input",
  name: "myPort",
  message: "my port"
};
var quesAddress = {
  type: "input",
  name: "address",
  message: "ip address"
};
var quesPort = {
  type: "input",
  name: "port",
  message: "port"
};

_inquirer.default.prompt([quesMyPort, quesAddress, quesPort]).then(function (answer) {
  console.log("test:".concat(answer.myPort, ":").concat(answer.address, ":").concat(answer.port));
  var node = new _portalNode.default(answer.myPort, {
    address: answer.address,
    port: answer.port
  });
  var responce = {};

  var reader = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout
  });

  reader.on("line", function (data) {
    return line(data);
  });

  function line(data) {
    var rpc = data.toString().split(" ")[0];
    var req = data.toString().split(" ")[1];

    if (Object.keys(responce).includes(rpc)) {
      responce[rpc](req);
    }
  }

  responce.peerlist = function () {
    console.log(node.kad.nodeId, "\n", node.kad.f.getAllPeerIds());
  };

  responce.store = function (data) {
    node.kad.store(node.kad.nodeId, (0, _sha.default)(data).toString(), data);
  };

  responce.findvalue =
  /*#__PURE__*/
  function () {
    var _ref = _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee(key) {
      var value;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return node.kad.findValue(key);

            case 2:
              value = _context.sent;
              console.log("on findvalue", {
                value: value
              });

            case 4:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, this);
    }));

    return function (_x) {
      return _ref.apply(this, arguments);
    };
  }();

  responce.keyValueList = function () {
    console.log(node.kad.keyValueList);
  };

  responce.id = function () {
    console.log(node.kad.nodeId);
  };

  responce.help = function () {
    console.log({
      responce: responce
    });
  };

  console.log({
    responce: responce
  });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jbGkvc2V0dXAudHMiXSwibmFtZXMiOlsicXVlc015UG9ydCIsInR5cGUiLCJuYW1lIiwibWVzc2FnZSIsInF1ZXNBZGRyZXNzIiwicXVlc1BvcnQiLCJpbnF1aXJlIiwicHJvbXB0IiwidGhlbiIsImFuc3dlciIsImNvbnNvbGUiLCJsb2ciLCJteVBvcnQiLCJhZGRyZXNzIiwicG9ydCIsIm5vZGUiLCJQb3J0YWxOb2RlIiwicmVzcG9uY2UiLCJyZWFkZXIiLCJyZXF1aXJlIiwiY3JlYXRlSW50ZXJmYWNlIiwiaW5wdXQiLCJwcm9jZXNzIiwic3RkaW4iLCJvdXRwdXQiLCJzdGRvdXQiLCJvbiIsImRhdGEiLCJsaW5lIiwicnBjIiwidG9TdHJpbmciLCJzcGxpdCIsInJlcSIsIk9iamVjdCIsImtleXMiLCJpbmNsdWRlcyIsInBlZXJsaXN0Iiwia2FkIiwibm9kZUlkIiwiZiIsImdldEFsbFBlZXJJZHMiLCJzdG9yZSIsImZpbmR2YWx1ZSIsImtleSIsImZpbmRWYWx1ZSIsInZhbHVlIiwia2V5VmFsdWVMaXN0IiwiaWQiLCJoZWxwIl0sIm1hcHBpbmdzIjoiOztBQUFBOztBQUNBOztBQUNBOzs7Ozs7OztBQUVBLElBQU1BLFVBQVUsR0FBRztBQUNqQkMsRUFBQUEsSUFBSSxFQUFFLE9BRFc7QUFFakJDLEVBQUFBLElBQUksRUFBRSxRQUZXO0FBR2pCQyxFQUFBQSxPQUFPLEVBQUU7QUFIUSxDQUFuQjtBQUtBLElBQU1DLFdBQVcsR0FBRztBQUNsQkgsRUFBQUEsSUFBSSxFQUFFLE9BRFk7QUFFbEJDLEVBQUFBLElBQUksRUFBRSxTQUZZO0FBR2xCQyxFQUFBQSxPQUFPLEVBQUU7QUFIUyxDQUFwQjtBQUtBLElBQU1FLFFBQVEsR0FBRztBQUNmSixFQUFBQSxJQUFJLEVBQUUsT0FEUztBQUVmQyxFQUFBQSxJQUFJLEVBQUUsTUFGUztBQUdmQyxFQUFBQSxPQUFPLEVBQUU7QUFITSxDQUFqQjs7QUFLQUcsa0JBQVFDLE1BQVIsQ0FBZSxD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O0FBQ2xCckMsSUFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVlJLElBQUksQ0FBQ3NCLEdBQUwsQ0FBU0MsTUFBckI7QUFDRCxHQUZEOztBQUlBckIsRUFBQUEsUUFBUSxDQUFDK0IsSUFBVCxHQUFnQixZQUFNO0FBQ3BCdEMsSUFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVk7QUFBRU0sTUFBQUEsUUFBUSxFQUFSQTtBQUFGLEtBQVo7QUFDRCxHQUZEOztBQUlBUCxFQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWTtBQUFFTSxJQUFBQSxRQUFRLEVBQVJBO0FBQUYsR0FBWjtBQUNELENBbEREIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFBvcnRhbE5vZGUgZnJvbSBcIi4uL25vZGUvcG9ydGFsTm9kZVwiO1xuaW1wb3J0IGlucXVpcmUgZnJvbSBcImlucXVpcmVyXCI7XG5pbXBvcnQgc2hhMSBmcm9tIFwic2hhMVwiO1xuXG5jb25zdCBxdWVzTXlQb3J0ID0ge1xuICB0eXBlOiBcImlucHV0XCIsXG4gIG5hbWU6IFwibXlQb3J0XCIsXG4gIG1lc3NhZ2U6IFwibXkgcG9ydFwiXG59O1xuY29uc3QgcXVlc0FkZHJlc3MgPSB7XG4gIHR5cGU6IFwiaW5wdXRcIixcbiAgbmFtZTogXCJhZGRyZXNzXCIsXG4gIG1lc3NhZ2U6IFwiaXAgYWRkcmVzc1wiXG59O1xuY29uc3QgcXVlc1BvcnQgPSB7XG4gIHR5cGU6IFwiaW5wdXRcIixcbiAgbmFtZTogXCJwb3J0XCIsXG4gIG1lc3NhZ2U6IFwicG9ydFwiXG59O1xuaW5xdWlyZS5wcm9tcHQoW3F1ZXNNeVBvcnQsIHF1ZXNBZGRyZXNzLCBxdWVzUG9ydF0pLnRoZW4oKGFuc3dlcjogYW55KSA9PiB7XG4gIGNvbnNvbGUubG9nKGB0ZXN0OiR7YW5zd2VyLm15UG9ydH06JHthbnN3ZXIuYWRkcmVzc306JHthbnN3ZXIucG9ydH1gKTtcbiAgY29uc3Qgbm9kZSA9IG5ldyBQb3J0YWxOb2RlKGFuc3dlci5teVBvcnQsIHtcbiAgICBhZGRyZXNzOiBhbnN3ZXIuYWRkcmVzcyxcbiAgICBwb3J0OiBhbnN3ZXIucG9ydFxuICB9KTtcblxuICBjb25zdCByZXNwb25jZTogYW55ID0ge307XG4gIGNvbnN0IHJlYWRlciA9IHJlcXVpcmUoXCJyZWFkbGluZVwiKS5jcmVhdGVJbnRlcmZhY2Uoe1xuICAgIGlucHV0OiBwcm9jZXNzLnN0ZGluLFxuICAgIG91dHB1dDogcHJvY2Vzcy5zdGRvdXRcbiAgfSk7XG5cbiAgcmVhZGVyLm9uKFwibGluZVwiLCAoZGF0YTogYW55KSA9PiBsaW5lKGRhdGEpKTtcblxuICBmdW5jdGlvbiBsaW5lKGRhdGE6IGFueSkge1xuICAgIGNvbnN0IHJwYyA9IGRhdGEudG9TdHJpbmcoKS5zcGxpdChcIiBcIilbMF07XG4gICAgY29uc3QgcmVxID0gZGF0YS50b1N0cmluZygpLnNwbGl0KFwiIFwiKVsxXTtcblxuICAgIGlmIChPYmplY3Qua2V5cyhyZXNwb25jZSkuaW5jbHVkZXMocnBjKSkge1xuICAgICAgcmVzcG9uY2VbcnBjXShyZXEpO1xuICAgIH1cbiAgfVxuXG4gIHJlc3BvbmNlLnBlZXJsaXN0ID0gKCkgPT4ge1xuICAgIGNvbnNvbGUubG9nKG5vZGUua2FkLm5vZGVJZCwgXCJcXG5cIiwgbm9kZS5rYWQuZi5nZXRBbGxQZWVySWRzKCkpO1xuICB9O1xuXG4gIHJlc3BvbmNlLnN0b3JlID0gKGRhdGE6IGFueSkgPT4ge1xuICAgIG5vZGUua2FkLnN0b3JlKG5vZGUua2FkLm5vZGVJZCwgc2hhMShkYXRhKS50b1N0cmluZygpLCBkYXRhKTtcbiAgfTtcblxuICByZXNwb25jZS5maW5kdmFsdWUgPSBhc3luYyAoa2V5OiBzdHJpbmcpID0+IHtcbiAgICBjb25zdCB2YWx1ZSA9IGF3YWl0IG5vZGUua2FkLmZpbmRWYWx1ZShrZXkpO1xuICAgIGNvbnNvbGUubG9nKFwib24gZmluZHZhbHVlXCIsIHsgdmFsdWUgfSk7XG4gIH07XG5cbiAgcmVzcG9uY2Uua2V5VmFsdWVMaXN0ID0gKCkgPT4ge1xuICAgIGNvbnNvbGUubG9nKG5vZGUua2FkLmtleVZhbHVlTGlzdCk7XG4gIH07XG5cbiAgcmVzcG9uY2UuaWQgPSAoKSA9PiB7XG4gICAgY29uc29sZS5sb2cobm9kZS5rYWQubm9kZUlkKTtcbiAgfTtcblxuICByZXNwb25jZS5oZWxwID0gKCkgPT4ge1xuICAgIGNvbnNvbGUubG9nKHsgcmVzcG9uY2UgfSk7XG4gIH07XG5cbiAgY29uc29sZS5sb2coeyByZXNwb25jZSB9KTtcbn0pO1xuIl19
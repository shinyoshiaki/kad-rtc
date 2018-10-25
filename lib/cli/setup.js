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
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return node.kad.findValue(key);

            case 2:
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jbGkvc2V0dXAudHMiXSwibmFtZXMiOlsicXVlc015UG9ydCIsInR5cGUiLCJuYW1lIiwibWVzc2FnZSIsInF1ZXNBZGRyZXNzIiwicXVlc1BvcnQiLCJpbnF1aXJlIiwicHJvbXB0IiwidGhlbiIsImFuc3dlciIsImNvbnNvbGUiLCJsb2ciLCJteVBvcnQiLCJhZGRyZXNzIiwicG9ydCIsIm5vZGUiLCJQb3J0YWxOb2RlIiwicmVzcG9uY2UiLCJyZWFkZXIiLCJyZXF1aXJlIiwiY3JlYXRlSW50ZXJmYWNlIiwiaW5wdXQiLCJwcm9jZXNzIiwic3RkaW4iLCJvdXRwdXQiLCJzdGRvdXQiLCJvbiIsImRhdGEiLCJsaW5lIiwicnBjIiwidG9TdHJpbmciLCJzcGxpdCIsInJlcSIsIk9iamVjdCIsImtleXMiLCJpbmNsdWRlcyIsInBlZXJsaXN0Iiwia2FkIiwibm9kZUlkIiwiZiIsImdldEFsbFBlZXJJZHMiLCJzdG9yZSIsImZpbmR2YWx1ZSIsImtleSIsImZpbmRWYWx1ZSIsImtleVZhbHVlTGlzdCIsImlkIiwiaGVscCJdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7QUFDQTs7QUFDQTs7Ozs7Ozs7QUFFQSxJQUFNQSxVQUFVLEdBQUc7QUFDakJDLEVBQUFBLElBQUksRUFBRSxPQURXO0FBRWpCQyxFQUFBQSxJQUFJLEVBQUUsUUFGVztBQUdqQkMsRUFBQUEsT0FBTyxFQUFFO0FBSFEsQ0FBbkI7QUFLQSxJQUFNQyxXQUFXLEdBQUc7QUFDbEJILEVBQUFBLElBQUksRUFBRSxPQURZO0FBRWxCQyxFQUFBQSxJQUFJLEVBQUUsU0FGWTtBQUdsQkMsRUFBQUEsT0FBTyxFQUFFO0FBSFMsQ0FBcEI7QUFLQSxJQUFNRSxRQUFRLEdBQUc7QUFDZkosRUFBQUEsSUFBSSxFQUFFLE9BRFM7QUFFZkMsRUFBQUEsSUFBSSxFQUFFLE1BRlM7QUFHZkMsRUFBQUEsT0FBTyxFQUFFO0FBSE0sQ0FBakI7O0FBS0FHLGtCQUFRQyxNQUFSLENBQWUsQ0FBQ1AsVUFB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QUNwQnJDLElBQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFZO0FBQUVNLE1BQUFBLFFBQVEsRUFBUkE7QUFBRixLQUFaO0FBQ0QsR0FGRDs7QUFJQVAsRUFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVk7QUFBRU0sSUFBQUEsUUFBUSxFQUFSQTtBQUFGLEdBQVo7QUFDRCxDQWpERCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBQb3J0YWxOb2RlIGZyb20gXCIuLi9ub2RlL3BvcnRhbE5vZGVcIjtcbmltcG9ydCBpbnF1aXJlIGZyb20gXCJpbnF1aXJlclwiO1xuaW1wb3J0IHNoYTEgZnJvbSBcInNoYTFcIjtcblxuY29uc3QgcXVlc015UG9ydCA9IHtcbiAgdHlwZTogXCJpbnB1dFwiLFxuICBuYW1lOiBcIm15UG9ydFwiLFxuICBtZXNzYWdlOiBcIm15IHBvcnRcIlxufTtcbmNvbnN0IHF1ZXNBZGRyZXNzID0ge1xuICB0eXBlOiBcImlucHV0XCIsXG4gIG5hbWU6IFwiYWRkcmVzc1wiLFxuICBtZXNzYWdlOiBcImlwIGFkZHJlc3NcIlxufTtcbmNvbnN0IHF1ZXNQb3J0ID0ge1xuICB0eXBlOiBcImlucHV0XCIsXG4gIG5hbWU6IFwicG9ydFwiLFxuICBtZXNzYWdlOiBcInBvcnRcIlxufTtcbmlucXVpcmUucHJvbXB0KFtxdWVzTXlQb3J0LCBxdWVzQWRkcmVzcywgcXVlc1BvcnRdKS50aGVuKChhbnN3ZXI6IGFueSkgPT4ge1xuICBjb25zb2xlLmxvZyhgdGVzdDoke2Fuc3dlci5teVBvcnR9OiR7YW5zd2VyLmFkZHJlc3N9OiR7YW5zd2VyLnBvcnR9YCk7XG4gIGNvbnN0IG5vZGUgPSBuZXcgUG9ydGFsTm9kZShhbnN3ZXIubXlQb3J0LCB7XG4gICAgYWRkcmVzczogYW5zd2VyLmFkZHJlc3MsXG4gICAgcG9ydDogYW5zd2VyLnBvcnRcbiAgfSk7XG5cbiAgY29uc3QgcmVzcG9uY2U6IGFueSA9IHt9O1xuICBjb25zdCByZWFkZXIgPSByZXF1aXJlKFwicmVhZGxpbmVcIikuY3JlYXRlSW50ZXJmYWNlKHtcbiAgICBpbnB1dDogcHJvY2Vzcy5zdGRpbixcbiAgICBvdXRwdXQ6IHByb2Nlc3Muc3Rkb3V0XG4gIH0pO1xuXG4gIHJlYWRlci5vbihcImxpbmVcIiwgKGRhdGE6IGFueSkgPT4gbGluZShkYXRhKSk7XG5cbiAgZnVuY3Rpb24gbGluZShkYXRhOiBhbnkpIHtcbiAgICBjb25zdCBycGMgPSBkYXRhLnRvU3RyaW5nKCkuc3BsaXQoXCIgXCIpWzBdO1xuICAgIGNvbnN0IHJlcSA9IGRhdGEudG9TdHJpbmcoKS5zcGxpdChcIiBcIilbMV07XG5cbiAgICBpZiAoT2JqZWN0LmtleXMocmVzcG9uY2UpLmluY2x1ZGVzKHJwYykpIHtcbiAgICAgIHJlc3BvbmNlW3JwY10ocmVxKTtcbiAgICB9XG4gIH1cblxuICByZXNwb25jZS5wZWVybGlzdCA9ICgpID0+IHtcbiAgICBjb25zb2xlLmxvZyhub2RlLmthZC5ub2RlSWQsIFwiXFxuXCIsIG5vZGUua2FkLmYuZ2V0QWxsUGVlcklkcygpKTtcbiAgfTtcblxuICByZXNwb25jZS5zdG9yZSA9IChkYXRhOiBhbnkpID0+IHtcbiAgICBub2RlLmthZC5zdG9yZShub2RlLmthZC5ub2RlSWQsIHNoYTEoZGF0YSkudG9TdHJpbmcoKSwgZGF0YSk7XG4gIH07XG5cbiAgcmVzcG9uY2UuZmluZHZhbHVlID0gYXN5bmMgKGtleTogc3RyaW5nKSA9PiB7XG4gICAgYXdhaXQgbm9kZS5rYWQuZmluZFZhbHVlKGtleSk7XG4gIH07XG5cbiAgcmVzcG9uY2Uua2V5VmFsdWVMaXN0ID0gKCkgPT4ge1xuICAgIGNvbnNvbGUubG9nKG5vZGUua2FkLmtleVZhbHVlTGlzdCk7XG4gIH07XG5cbiAgcmVzcG9uY2UuaWQgPSAoKSA9PiB7XG4gICAgY29uc29sZS5sb2cobm9kZS5rYWQubm9kZUlkKTtcbiAgfTtcblxuICByZXNwb25jZS5oZWxwID0gKCkgPT4ge1xuICAgIGNvbnNvbGUubG9nKHsgcmVzcG9uY2UgfSk7XG4gIH07XG5cbiAgY29uc29sZS5sb2coeyByZXNwb25jZSB9KTtcbn0pO1xuIl19
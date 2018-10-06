"use strict";

var _PortalNode = require("../node/PortalNode");

var _PortalNode2 = _interopRequireDefault(_PortalNode);

var _inquirer = require("inquirer");

var _inquirer2 = _interopRequireDefault(_inquirer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
_inquirer2.default.prompt([quesMyPort, quesAddress, quesPort]).then(function (answer) {
  console.log("test:" + answer.myPort + ":" + answer.address + ":" + answer.port);
  new _PortalNode2.default(answer.myPort, { address: answer.address, port: answer.port });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jbGkvc2V0dXAuanMiXSwibmFtZXMiOlsicXVlc015UG9ydCIsInR5cGUiLCJuYW1lIiwibWVzc2FnZSIsInF1ZXNBZGRyZXNzIiwicXVlc1BvcnQiLCJpbnF1aXJlIiwicHJvbXB0IiwidGhlbiIsImNvbnNvbGUiLCJsb2ciLCJhbnN3ZXIiLCJteVBvcnQiLCJhZGRyZXNzIiwicG9ydCIsIlBvcnRhbE5vZGUiXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7QUFDQTs7Ozs7O0FBRUEsSUFBTUEsYUFBYTtBQUNqQkMsUUFBTSxPQURXO0FBRWpCQyxRQUFNLFFBRlc7QUFHakJDLFdBQVM7QUFIUSxDQUFuQjtBQUtBLElBQU1DLGNBQWM7QUFDbEJILFFBQU0sT0FEWTtBQUVsQkMsUUFBTSxTQUZZO0FBR2xCQyxXQUFTO0FBSFMsQ0FBcEI7QUFLQSxJQUFNRSxXQUFXO0FBQ2ZKLFFBQU0sT0FEUztBQUVmQyxRQUFNLE1BRlM7QUFHZkMsV0FBUztBQUhNLENBQWpCO0FBS0FHLG1CQUFRQyxNQUFSLENBQWUsQ0FBQ1AsVUFBRCxFQUFhSSxXQUFiLEVBQTBCQyxRQUExQixDQUFmLEVBQW9ERyxJQUFwRCxDQUF5RCxrQkFBVTtBQUNqRUMsVUFBUUMsR0FBUixXQUFvQkMsT0FBT0MsTUFBM0IsU0FBcUNELE9BQU9FLE9BQTVDLFNBQXVERixPQUFPRyxJQUE5RDtBQUNBLE1BQUlDLG9CQUFKLENBQWVKLE9BQU9DLE1BQXRCLEVBQThCLEVBQUVDLFNBQVNGLE9BQU9FLE9BQWxCLEVBQTJCQyxNQUFNSCxPQUFPRyxJQUF4QyxFQUE5QjtBQUNELENBSEQiLCJmaWxlIjoic2V0dXAuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUG9ydGFsTm9kZSBmcm9tIFwiLi4vbm9kZS9Qb3J0YWxOb2RlXCI7XG5pbXBvcnQgaW5xdWlyZSBmcm9tIFwiaW5xdWlyZXJcIjtcblxuY29uc3QgcXVlc015UG9ydCA9IHtcbiAgdHlwZTogXCJpbnB1dFwiLFxuICBuYW1lOiBcIm15UG9ydFwiLFxuICBtZXNzYWdlOiBcIm15IHBvcnRcIlxufTtcbmNvbnN0IHF1ZXNBZGRyZXNzID0ge1xuICB0eXBlOiBcImlucHV0XCIsXG4gIG5hbWU6IFwiYWRkcmVzc1wiLFxuICBtZXNzYWdlOiBcImlwIGFkZHJlc3NcIlxufTtcbmNvbnN0IHF1ZXNQb3J0ID0ge1xuICB0eXBlOiBcImlucHV0XCIsXG4gIG5hbWU6IFwicG9ydFwiLFxuICBtZXNzYWdlOiBcInBvcnRcIlxufTtcbmlucXVpcmUucHJvbXB0KFtxdWVzTXlQb3J0LCBxdWVzQWRkcmVzcywgcXVlc1BvcnRdKS50aGVuKGFuc3dlciA9PiB7XG4gIGNvbnNvbGUubG9nKGB0ZXN0OiR7YW5zd2VyLm15UG9ydH06JHthbnN3ZXIuYWRkcmVzc306JHthbnN3ZXIucG9ydH1gKTtcbiAgbmV3IFBvcnRhbE5vZGUoYW5zd2VyLm15UG9ydCwgeyBhZGRyZXNzOiBhbnN3ZXIuYWRkcmVzcywgcG9ydDogYW5zd2VyLnBvcnQgfSk7XG59KTtcbiJdfQ==
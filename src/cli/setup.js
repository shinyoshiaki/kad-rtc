import PortalNode from "../node/PortalNode";
import inquire from "inquirer";

const quesMyPort = {
  type: "input",
  name: "myPort",
  message: "my port"
};
const quesAddress = {
  type: "input",
  name: "address",
  message: "ip address"
};
const quesPort = {
  type: "input",
  name: "port",
  message: "port"
};
inquire.prompt([quesMyPort, quesAddress, quesPort]).then(answer => {
  console.log(`test:${answer.myPort}:${answer.address}:${answer.port}`);
  new PortalNode(answer.myPort, { address: answer.address, port: answer.port });
});

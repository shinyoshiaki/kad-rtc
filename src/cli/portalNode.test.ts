import "source-map-support/register";
import PortalNode from "../node/portalNode";
import inquire from "inquirer";

const quesMyPort = {
  type: "input",
  name: "myPort",
  message: "my port"
};
const quesAddress = {
  type: "input",
  name: "address",
  message: "target address"
};
const quesPort = {
  type: "input",
  name: "port",
  message: "target port"
};
inquire.prompt([quesMyPort, quesAddress, quesPort]).then((answer: any) => {
  console.log(`test:${answer.myPort}:${answer.address}:${answer.port}`);
  new PortalNode(answer.myPort, { address: answer.address, port: answer.port });
});

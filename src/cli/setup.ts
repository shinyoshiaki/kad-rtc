import PortalNode from "../node/portalNode";
import inquire from "inquirer";
import sha1 from "sha1";

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
inquire.prompt([quesMyPort, quesAddress, quesPort]).then((answer: any) => {
  console.log(`test:${answer.myPort}:${answer.address}:${answer.port}`);
  const node = new PortalNode(answer.myPort, {
    address: answer.address,
    port: answer.port
  });

  const responce: any = {};
  const reader = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout
  });

  reader.on("line", (data: any) => line(data));

  function line(data: any) {
    const rpc = data.toString().split(" ")[0];
    const req = data.toString().split(" ")[1];

    if (Object.keys(responce).includes(rpc)) {
      responce[rpc](req);
    }
  }

  responce.peerlist = () => {
    console.log(node.kad.nodeId, "\n", node.kad.f.getAllPeerIds());
  };

  responce.store = (data: any) => {
    node.kad.store(node.kad.nodeId, sha1(data).toString(), data);
  };

  responce.findvalue = async (key: string) => {
    const value = await node.kad.findValue(key);
    console.log("on findvalue", { value });
  };

  responce.keyValueList = () => {
    console.log(node.kad.keyValueList);
  };

  responce.id = () => {
    console.log(node.kad.nodeId);
  };

  responce.help = () => {
    console.log({ responce });
  };

  console.log({ responce });
});

const fs = require("fs");
const path = require("path");

const codinomes = ["roberta", "nome1", "nome2", "nome3", "nome4", "nome5"];

task("faucet", "Sends ETH and tokens to a registered user")
  .addPositionalParam("receiver", "The address that will receive them")
  .setAction(async ({ receiver }, { ethers }) => {
    if (network.name === "hardhat") {
      console.warn(
        "You are running the faucet task with Hardhat network, which" +
          "gets automatically created and destroyed every time. Use the Hardhat" +
          " option '--network localhost'"
      );
    }

    const addressesFile = path.join(
      __dirname,
      "../frontend/src/contracts/contract-address.json"
    );

    if (!fs.existsSync(addressesFile)) {
      throw new Error("You need to deploy your contract first.");
    }

    const { Token: contractAddress } = JSON.parse(
      fs.readFileSync(addressesFile, "utf8")
    );

    if (!contractAddress || (await ethers.provider.getCode(contractAddress)) === "0x") {
      throw new Error("You need to deploy your contract first.");
    }

    const normalizedReceiver = ethers.utils.getAddress(receiver);
    const token = await ethers.getContractAt("Turing", contractAddress);
    let codinome;
    for (const name of codinomes) {
      const userAddress = await token.users(name);
      if (userAddress.toLowerCase() === normalizedReceiver.toLowerCase()) {
        codinome = name;
        break;
      }
    }

    if (!codinome) {
      throw new Error(
        "Tokens can only be issued to an address registered to a codinome."
      );
    }

    const [sender] = await ethers.getSigners();

    const tx = await token.issueToken(codinome, 100);
    await tx.wait();

    const tx2 = await sender.sendTransaction({
      to: normalizedReceiver,
      value: ethers.constants.WeiPerEther,
    });
    await tx2.wait();

    console.log(`Transferred 1 ETH and 100 tokens to ${normalizedReceiver}`);
  });

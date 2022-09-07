import { ethers, run } from "hardhat";
import { Req__factory } from "../typechain-types";

async function main() {
  const [signer] = await ethers.getSigners();

  const req = await new Req__factory(signer).deploy();
  await req.deployed();

  await run("verify:verify", {
    address: req.address,
    contract: "contracts/Req.sol:Req",
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

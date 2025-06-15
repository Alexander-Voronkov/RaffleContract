import { ethers, network } from "hardhat";
import { binanceWhale, usdcAddress, usdtAddress } from "../constants/contractAddresses";

const receivers = [
  "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
  "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
  "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
  "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
  "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
  "0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc"
];

async function main() {
  const amount = ethers.parseUnits("10000", 6);

  await network.provider.send("hardhat_impersonateAccount", [binanceWhale]);

  const signer = await ethers.provider.getSigner(binanceWhale);
  const usdt = await ethers.getContractAt("IERC20", usdtAddress);
  const usdc = await ethers.getContractAt("IERC20", usdcAddress);

  for (const receiver of receivers) {
    console.log(`Sending to ${receiver}...`);
    await usdt.connect(signer).transfer(receiver, amount);
    await usdc.connect(signer).transfer(receiver, amount);
  }

  await network.provider.send("hardhat_stopImpersonatingAccount", [binanceWhale]);

  console.log("✅ Done.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
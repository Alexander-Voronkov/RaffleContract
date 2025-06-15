import { ethers } from "ethers";
import * as dotenv from "dotenv";
import RaffleAbi from "../../raffleContract/artifacts/contracts/Raffle.sol/Raffle.json";

dotenv.config();

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL!);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
const contract = new ethers.Contract(
  process.env.RAFFLE_ADDRESS!,
  RaffleAbi.abi,
  wallet
);

async function checkAndPlay() {
  try {
    await increaseTime(1);
    const [upkeepNeeded]: [boolean, string] = await contract.checkUpkeep("0x");
    const data = await contract.lastDepositTimestamp();

    console.log("upkeepNeeded:", upkeepNeeded);
    console.log("data", data);

    if (upkeepNeeded) {
      const tx = await contract.performUpkeep("0x");
      console.log("performUpkeep sent:", tx.hash);
      await tx.wait();
      console.log("performUpkeep confirmed");
    }
  } catch (err) {
    console.error("Error during upkeep:", err);
  }
}

async function increaseTime(seconds: number) {
  await provider.send("evm_increaseTime", [seconds]);
  await provider.send("evm_mine", []);
}

setInterval(checkAndPlay, 1000);

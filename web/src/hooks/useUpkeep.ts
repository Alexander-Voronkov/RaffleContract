import RaffleAbi from "../../../raffleContract/artifacts/contracts/Raffle.sol/Raffle.json";
import { useReadContract } from "wagmi";

const RAFFLE_ADDRESS = import.meta.env.VITE_RAFFLE_ADDRESS;

export function useCheckUpkeep() {

  const { data, isLoading, error } = useReadContract({
    address: RAFFLE_ADDRESS,
    abi: RaffleAbi.abi,
    functionName: 'checkUpkeep',
    args: ["0x"]
  });

  const result = ((data ?? []) as any[])[0];
  
  const upkeepNeeded = result as boolean;

  console.log('check upkeed: ', upkeepNeeded);

  return {
    needed: upkeepNeeded,
    isLoading,
    error,
  };

}
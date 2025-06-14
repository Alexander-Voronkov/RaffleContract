import RaffleAbi from "../../../raffleContract/artifacts/contracts/Raffle.sol/Raffle.json";
import { useReadContract } from "wagmi";

const RAFFLE_ADDRESS = import.meta.env.VITE_RAFFLE_ADDRESS;

export function useRafflePlayers() {

  const { data, isLoading, error } = useReadContract({
    address: RAFFLE_ADDRESS,
    abi: RaffleAbi.abi,
    functionName: 'players',
  });

  console.log('players: ', data);

  return {
    players: [data] as string[] | undefined,
    isLoading,
    error,
  };
}
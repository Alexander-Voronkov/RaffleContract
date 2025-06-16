import RaffleAbi from "../../../raffleContract/artifacts/contracts/Raffle.sol/Raffle.json";
import { useReadContract } from "wagmi";

const RAFFLE_ADDRESS = import.meta.env.VITE_RAFFLE_ADDRESS;

interface Player {
  playerAddress: string;
  depositedTokenAddress: string;
  depositedTokenAmount: bigint;
  amountDepositedInUsd: bigint;
  decimals: number;
  stake: number;
}

export function useRafflePlayers() {

  const { data, isLoading, error, refetch } = useReadContract({
    address: RAFFLE_ADDRESS,
    abi: RaffleAbi.abi,
    functionName: 'getPlayers',
  });
  
  const resultPlayers = (data ?? []) as Player[];

  resultPlayers.forEach(p => {
    p.stake = Number(p.stake);
  });

  console.log('players: ', resultPlayers);

  return {
    players: resultPlayers,
    isLoading,
    error,
    refetch,
  };
}
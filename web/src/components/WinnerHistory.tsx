import { useEffect, useState } from 'react';
import { usePublicClient } from 'wagmi';
import RaffleAbi from '../../../raffleContract/artifacts/contracts/Raffle.sol/Raffle.json';
import { parseAbiItem } from 'viem';
import { getContractEvents } from 'viem/actions';

const RAFFLE_ADDRESS = import.meta.env.VITE_RAFFLE_ADDRESS as `0x${string}`;

export default function WinnerHistory() {
  const publicClient = usePublicClient();
  const [winners, setWinners] = useState<{ address: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!publicClient) return;

    async function fetchWinnerEvents() {
      try {
        setLoading(true);

        const logs = await getContractEvents(publicClient, {
            address: RAFFLE_ADDRESS,
            abi: RaffleAbi.abi,
            eventName: 'WinnerSelected',
            fromBlock: 22715994n,
            toBlock: 'latest'
        });

        console.log('past winners', logs);

        const parsed = logs.map(log => ({
          address: log.args.winner as string,
        }));

        setWinners(parsed);
      } catch (error) {
        console.error('Ошибка при получении событий WinnerSelected:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchWinnerEvents();
  }, [publicClient]);

  return (
    <div>
      <h2>История победителей</h2>
      {loading && <p>Загрузка...</p>}
      {!loading && winners.length === 0 && <p>Пока нет победителей</p>}
      <ul>
        {winners.map((winner, index) => (
          <li key={index}>
            {winner.address}
          </li>
        ))}
      </ul>
    </div>
  );
}
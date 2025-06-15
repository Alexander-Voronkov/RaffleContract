import { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { useRafflePlayers } from '../hooks/useRaffle';
import {
  Box,
  Button,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  Alert,
} from '@mui/material';
import { useAllTokenBalances } from '../hooks/useBalance';
import { allowedTokens, usdtAddress } from '../constants/tokensAddresses';
import { useWriteContract, usePublicClient } from 'wagmi';
import RaffleAbi from '../../../raffleContract/artifacts/contracts/Raffle.sol/Raffle.json';
import { erc20Abi, formatUnits } from 'viem';

const RAFFLE_ADDRESS = import.meta.env.VITE_RAFFLE_ADDRESS;
const randomColor = () => `hsl(${Math.floor(Math.random() * 360)}, 70%, 60%)`;

export default function WheelOfFortune() {
  const { players } = useRafflePlayers();
  const wheelRef = useRef<HTMLDivElement | null>(null);
  const arrowRef = useRef<HTMLDivElement | null>(null);
  const [depositAmount, setDepositAmount] = useState(0);
  const { balances } = useAllTokenBalances();
  const [selectedToken, setSelectedToken] = useState(usdtAddress);
  const [winner, setWinner] = useState<string | null>(null);
  const [prizeAmount, setPrizeAmount] = useState<string | null>(null);
  const [showWinner, setShowWinner] = useState<boolean>(false);
  const publicClient = usePublicClient();
  const { writeContract: write } = useWriteContract();
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const timerRef = useRef<number | null>(null);

  const totalAmountInUsd = useMemo(() => {
    if (!players) return 0;
    return players.reduce((prev, curr) => prev + curr.amountDepositedInUsd, BigInt(0));
  }, [players]);

  const maxDeposit = useMemo(() => {
    const val = balances.get(selectedToken);
    if (!val) return 0;
    return Number(val.value) / (10 ** (val?.decimals ?? 0));
  }, [balances, selectedToken]);

  const deposit = useCallback(() => {
    const decimals = balances.get(selectedToken)?.decimals ?? 18;
    const depositAmountConverted = BigInt(Math.floor(depositAmount * 10 ** decimals));

    write({
      abi: erc20Abi,
      address: selectedToken as `0x${string}`,
      functionName: 'approve',
      args: [RAFFLE_ADDRESS, depositAmountConverted],
    });

    write({
      abi: RaffleAbi.abi,
      address: RAFFLE_ADDRESS,
      functionName: 'deposit',
      args: [selectedToken, depositAmountConverted],
    });
  }, [selectedToken, depositAmount, balances, write]);

  const canDeposit = useMemo(() => depositAmount > 0 && depositAmount <= maxDeposit, [depositAmount, maxDeposit]);

  const playerColors = useMemo(() => players.map(() => randomColor()), [players]);

  useEffect(() => {
    if (players.length >= 2) {
      setTimeLeft(60);
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            timerRef.current = null;
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setTimeLeft(0);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [players]);

  useEffect(() => {
    if (!publicClient) return;

    const unwatch = publicClient.watchContractEvent({
      address: RAFFLE_ADDRESS,
      abi: RaffleAbi.abi,
      eventName: 'WinnerSelected',
      onLogs: (logs) => {
        const winnerAddress = logs[0].args.winner as string;
        const amountWonUsd = logs[0].args.winAmountInUsd as bigint;
        const amountWonEth = logs[0].args.winAmountInEth as bigint;

        setShowWinner(false);
        setWinner(winnerAddress);

        const winnerPlayer = players.find(
          (p) => p.playerAddress.toLowerCase() === winnerAddress.toLowerCase()
        );

        if (winnerPlayer) {
          const usdFormatted = Number(formatUnits(amountWonUsd, 18)).toFixed(2);
          const ethFormatted = Number(formatUnits(amountWonEth, 18)).toFixed(4);
          setPrizeAmount(`${usdFormatted} USD / ${ethFormatted} ETH`);
        } else {
          setPrizeAmount(null);
        }
      },
    });

    return () => unwatch?.();
  }, [publicClient, players]);

  useEffect(() => {
    if (!winner || players.length === 0 || !wheelRef.current) return;

    const totalStake = players.reduce((sum, p) => sum + p.stake, 0);
    let currentAngle = 0;

    const winnerIndex = players.findIndex(
      (p) => p.playerAddress.toLowerCase() === winner.toLowerCase()
    );
    if (winnerIndex === -1) return;

    for (let i = 0; i <= winnerIndex; i++) {
      currentAngle += (players[i].stake / totalStake) * 360;
    }

    const segment = (players[winnerIndex].stake / totalStake) * 360;
    const winnerAngle = currentAngle - segment / 2;
    const finalRotation = 360 * 3 - winnerAngle;

    wheelRef.current.style.transition = 'transform 5s ease-out';
    wheelRef.current.style.transform = `rotate(${finalRotation}deg)`;

    const timeoutId = setTimeout(() => {
      setShowWinner(true);
      if (wheelRef.current) {
        wheelRef.current.style.transition = 'none';
        wheelRef.current.style.transform = 'rotate(0deg)';
      }

      setTimeout(() => {
        setWinner(null);
        setPrizeAmount(null);
        setShowWinner(false);
      }, 10000);
    }, 5500);

    return () => clearTimeout(timeoutId);
  }, [winner, players]);

  return (
    <Box display="flex" gap={6} p={4} flexWrap="wrap" justifyContent="center" flexDirection="column" alignItems="center">
      <Box mb={2} textAlign="center">
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Total amount (USD)
        </Typography>
        {totalAmountInUsd === null ? (
          <Typography color="textSecondary">Загрузка...</Typography>
        ) : Number(totalAmountInUsd) === 0 ? (
          <Typography color="textSecondary">Пока нет ставок</Typography>
        ) : (
          <Typography>{formatUnits(totalAmountInUsd, 14)} USD</Typography>
        )}
      </Box>

      {timeLeft > 0 && (
        <Typography fontSize={20} fontWeight="bold" color="secondary" mb={2}>
          Игра начнется через: {timeLeft} сек
        </Typography>
      )}

      {showWinner && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Победитель: {winner ? winner.slice(0, 6) : '—'}... выиграл {prizeAmount ?? '—'}!
        </Alert>
      )}

      <Box display="flex" gap={6} flexWrap="wrap" justifyContent="center">
        <Box display="flex" flexDirection="column" alignItems="center" gap={4}>
          <Box position="relative" width={300} height={300}>
            <Box
              ref={arrowRef}
              position="absolute"
              top={-16}
              left="50%"
              sx={{
                width: 0,
                height: 0,
                borderLeft: '8px solid transparent',
                borderRight: '8px solid transparent',
                borderBottom: '16px solid red',
                zIndex: 10,
                transform: 'translateX(-50%)',
              }}
            />
            <Box
              ref={wheelRef}
              width={300}
              height={300}
              borderRadius="50%"
              overflow="hidden"
              bgcolor="#e0e0e0"
              boxShadow={3}
            >
              <svg viewBox="0 0 300 300" width="100%" height="100%">
                {players.length > 0 ? (() => {
                  let currentAngle = 0;
                  const radius = 150;
                  const totalStake = players.reduce((sum, p) => sum + p.stake, 0);

                  return players.map((player, i) => {
                    const fraction = player.stake / totalStake;
                    const segmentAngle = fraction * 360;
                    const startAngle = currentAngle;
                    const endAngle = currentAngle + segmentAngle;
                    const largeArc = segmentAngle > 180 ? 1 : 0;

                    const x1 = 150 + radius * Math.cos((Math.PI / 180) * startAngle);
                    const y1 = 150 + radius * Math.sin((Math.PI / 180) * startAngle);
                    const x2 = 150 + radius * Math.cos((Math.PI / 180) * endAngle);
                    const y2 = 150 + radius * Math.sin((Math.PI / 180) * endAngle);

                    const midAngle = startAngle + segmentAngle / 2;
                    const labelX = 150 + (radius - 40) * Math.cos((Math.PI / 180) * midAngle);
                    const labelY = 150 + (radius - 40) * Math.sin((Math.PI / 180) * midAngle);

                    currentAngle += segmentAngle;
                    const color = playerColors[i];

                    return (
                      <g key={i}>
                        <path
                          d={`M150,150 L${x1},${y1} A${radius},${radius} 0 ${largeArc} 1 ${x2},${y2} Z`}
                          fill={color}
                          stroke="#fff"
                          strokeWidth="2"
                        />
                        <text
                          x={labelX}
                          y={labelY}
                          fill="#fff"
                          fontSize="12"
                          textAnchor="middle"
                          dominantBaseline="middle"
                          transform={`rotate(${midAngle}, ${labelX}, ${labelY})`}
                        >
                          Игрок {i + 1}
                        </text>
                      </g>
                    );
                  });
                })() : (
                  <text
                    x="150"
                    y="150"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#555"
                    fontSize="16"
                  >
                    Нет игроков
                  </text>
                )}
              </svg>
            </Box>
          </Box>

          <Box display="flex" flexDirection="column" gap={2} width="100%" maxWidth={320}>
            <TextField
              label="Сумма"
              type="number"
              inputProps={{ min: 0.1, max: maxDeposit }}
              value={depositAmount}
              onChange={(e) => setDepositAmount(+e.target.value)}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Токен</InputLabel>
              <Select
                value={selectedToken}
                label="Токен"
                onChange={(e) => setSelectedToken(e.target.value)}
              >
                {allowedTokens.map((at) => (
                  <MenuItem key={at} value={at}>
                    {balances.get(at)?.symbol ?? at.slice(0, 6)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Typography>
              Баланс: {maxDeposit.toFixed(4)} {balances.get(selectedToken)?.symbol}
            </Typography>

            <Button variant="contained" color="success" disabled={!canDeposit} onClick={deposit}>
              Депозит
            </Button>
          </Box>
        </Box>

        <Box display="flex" flexDirection="column" gap={1}>
          <Typography variant="h6" textAlign="center">
            Игроки
          </Typography>
          {players.map((player, index) => (
            <Paper
              key={player.playerAddress}
              sx={{ p: 1, display: 'flex', alignItems: 'center', gap: 2 }}
            >
              <Box width={16} height={16} borderRadius="50%" bgcolor={playerColors[index]} />
              <Typography fontSize={14}>
                Игрок {index + 1}: {player.playerAddress.slice(0, 6)}... —{' '}
                {Number(formatUnits(player.depositedTokenAmount, balances.get(player.depositedTokenAddress)?.decimals ?? 18)).toFixed(4)}{' '}
                {balances.get(player.depositedTokenAddress)?.symbol}
              </Typography>
            </Paper>
          ))}
        </Box>
      </Box>
    </Box>
  );
}

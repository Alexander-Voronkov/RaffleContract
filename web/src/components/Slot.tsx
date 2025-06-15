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
} from '@mui/material';
import { useAllTokenBalances } from '../hooks/useBalance';
import { allowedTokens, usdtAddress } from '../constants/tokensAddresses';
import { useWriteContract } from 'wagmi';
import RaffleAbi from "../../../raffleContract/artifacts/contracts/Raffle.sol/Raffle.json";
import { erc20Abi, formatUnits } from 'viem';
import { useCheckUpkeep } from '../hooks/useUpkeep';

const RAFFLE_ADDRESS = import.meta.env.VITE_RAFFLE_ADDRESS;

const randomColor = () =>
  `hsl(${Math.floor(Math.random() * 360)}, 70%, 60%)`;

export default function WheelOfFortune() {
  const { players } = useRafflePlayers();
  const wheelRef = useRef(null);
  const [depositAmount, setDepositAmount] = useState(0);
  const { balances } = useAllTokenBalances();
  const [selectedToken, setSelectedToken] = useState(usdtAddress);

  const maxDeposit = useMemo(() => {
    const val = balances.get(selectedToken);
    return (val?.value ?? BigInt(0)) / BigInt(10 ** (val?.decimals ?? 1));
  }, [balances, selectedToken]);

  const { writeContract: write } = useWriteContract();

  const { needed } = useCheckUpkeep();

  const play = useCallback(() => {
    write({
      abi: RaffleAbi.abi,
      address: RAFFLE_ADDRESS,
      functionName: 'performUpkeep',
      args: ["0x"],
    });

    console.log('performedUpkeep');
  }, [needed]);

  const deposit = useCallback(() => {

    const depositAmountConvertedToUnits = BigInt(
      Math.floor(depositAmount * 10 ** 8)
    );

    write({
      abi: erc20Abi,
      address: selectedToken as `0x${string}`,
      functionName: 'approve',
      args: [RAFFLE_ADDRESS, depositAmountConvertedToUnits],
    });

    write({
      abi: RaffleAbi.abi,
      address: RAFFLE_ADDRESS,
      functionName: 'deposit',
      args: [selectedToken, depositAmountConvertedToUnits],
    });
  }, [selectedToken, depositAmount, balances]);

  const canDeposit = useMemo(() => {
    return depositAmount > 0 && depositAmount <= maxDeposit;
  }, [depositAmount, maxDeposit]);

  const playerColors = useMemo(() => {
    const map = new Map<string, string>();
    for (const player of players) {
      map.set(player.playerAddress, randomColor());
    }
    return map;
  }, [players]);

  return (
    <Box display="flex" gap={6} p={4} flexWrap="wrap" justifyContent="center">
      <Box display="flex" flexDirection="column" alignItems="center" gap={4}>
        <Box position="relative">
          <Box
            position="absolute"
            left="50%"
            top={-16}
            sx={{
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '8px solid transparent',
              borderRight: '8px solid transparent',
              borderBottom: '16px solid red',
              zIndex: 10,
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
            sx={{
              transition: 'transform 4s ease-out',
              transform: `rotate(360deg)`,
            }}
          >
            <svg viewBox="0 0 300 300" width="100%" height="100%">
              {players.length > 0 ? (() => {
                let currentAngle = 0;
                const radius = 150;

                return players.map((player, i) => {
                  const segmentAngle = player.stake * 360;
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

                  const color = playerColors.get(player.playerAddress)!;

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
            Баланс: {maxDeposit.toString()} {balances.get(selectedToken)?.symbol}
          </Typography>

          <Button
            variant="contained"
            color="success"
            disabled={!canDeposit}
            onClick={deposit}
          >
            Депозит
          </Button>

          <Button
            variant="contained"
            color="info"
            disabled={!needed}
            onClick={play}
          >
            Начать игру
          </Button>
        </Box>
      </Box>

      <Box display="flex" flexDirection="column" gap={1}>
        <Typography variant="h6" textAlign="center">Игроки</Typography>
        {players.map((player, index) => (
          <Paper key={player.playerAddress} sx={{ p: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              width={16}
              height={16}
              borderRadius="50%"
              bgcolor={playerColors.get(player.playerAddress)}
            />
            <Typography fontSize={14}>
              {player.playerAddress.slice(0, 6)}... — {formatUnits(player.depositedTokenAmount, balances.get(player.depositedTokenAddress)?.decimals ?? 18)} {balances.get(player.depositedTokenAddress)?.symbol}
            </Typography>
          </Paper>
        ))}
      </Box>
    </Box>
  );
}

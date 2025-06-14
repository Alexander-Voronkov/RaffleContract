import { useState, useRef, useMemo } from 'react';
import { useRafflePlayers } from '../hooks/useRaffle';
import {
  Box,
  Button,
  Typography,
  TextField,
  Select,
  MenuItem,
  Paper,
  FormControl,
  InputLabel,
} from '@mui/material';

export default function WheelOfFortune() {
  const { players = [], isLoading, error } = useRafflePlayers();

  const colors = ['#F87171', '#FBBF24', '#34D399', '#60A5FA', '#A78BFA', '#F472B6'];
  const segmentAngle = useMemo(() => 360 / (players.length || 1), [players]);

  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const wheelRef = useRef(null);

  const [depositAmount, setDepositAmount] = useState('');
  const [selectedToken, setSelectedToken] = useState('USDT');

  const spin = () => {
    if (spinning || players.length === 0) return;

    const randomIndex = Math.floor(Math.random() * players.length);
    const angleToStop = 360 - (randomIndex * segmentAngle + segmentAngle / 2); // align center with top
    const extraSpins = 5 * 360;
    const finalRotation = extraSpins + angleToStop;

    setSpinning(true);
    setRotation(prev => prev + finalRotation);

    setTimeout(() => {
      setSpinning(false);
      setWinner(players[randomIndex]);
    }, 4000);
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center" p={4} gap={4}>
      <Box position="relative">
        {/* Pointer */}
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

        {/* Wheel */}
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
            transform: `rotate(${rotation}deg)`,
          }}
        >
          <svg viewBox="0 0 300 300" width="100%" height="100%">
            {players.length > 0 ? (
              players.map((player, i) => {
                const startAngle = segmentAngle * i;
                const endAngle = startAngle + segmentAngle;
                const largeArc = segmentAngle > 180 ? 1 : 0;
                const radius = 150;
                const x1 = 150 + radius * Math.cos((Math.PI / 180) * startAngle);
                const y1 = 150 + radius * Math.sin((Math.PI / 180) * startAngle);
                const x2 = 150 + radius * Math.cos((Math.PI / 180) * endAngle);
                const y2 = 150 + radius * Math.sin((Math.PI / 180) * endAngle);
                const midAngle = startAngle + segmentAngle / 2;
                const labelX = 150 + (radius - 40) * Math.cos((Math.PI / 180) * midAngle);
                const labelY = 150 + (radius - 40) * Math.sin((Math.PI / 180) * midAngle);

                return (
                  <g key={i}>
                    <path
                      d={`M150,150 L${x1},${y1} A${radius},${radius} 0 ${largeArc} 1 ${x2},${y2} Z`}
                      fill={colors[i % colors.length]}
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
                      {player}
                    </text>
                  </g>
                );
              })
            ) : (
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

      <Button
        variant="contained"
        color="primary"
        onClick={spin}
        disabled={spinning || players.length === 0}
      >
        {spinning ? 'Крутится...' : 'Крутить'}
      </Button>

      {winner && (
        <Paper elevation={2} sx={{ padding: 2, bgcolor: '#e6ffe6' }}>
          <Typography color="green" variant="subtitle1">
            🎉 Победитель: <strong>{winner}</strong>
          </Typography>
        </Paper>
      )}

      {/* Deposit Form */}
      <Box display="flex" flexDirection="column" gap={2} width="100%" maxWidth={320}>
        <TextField
          label="Сумма"
          type="number"
          value={depositAmount}
          onChange={(e) => setDepositAmount(e.target.value)}
          fullWidth
        />

        <FormControl fullWidth>
          <InputLabel>Токен</InputLabel>
          <Select
            value={selectedToken}
            label="Токен"
            onChange={(e) => setSelectedToken(e.target.value)}
          >
            <MenuItem value="USDT">USDT</MenuItem>
            <MenuItem value="USDC">USDC</MenuItem>
            <MenuItem value="BNB">BNB</MenuItem>
          </Select>
        </FormControl>

        <Button
          variant="contained"
          color="success"
          onClick={() => {
            alert(`Депозит: ${depositAmount} ${selectedToken} (логика ещё не реализована)`);
          }}
        >
          Депозит
        </Button>
      </Box>
    </Box>
  );
}

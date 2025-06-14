import { useState, useRef } from 'react';

export default function WheelOfFortune() {
  const prizes = [
    'Prize 1',
    'Prize 2',
    'Prize 3',
    'Prize 4',
    'Prize 5',
    'Prize 6',
  ];
  const colors = ['#F87171', '#FBBF24', '#34D399', '#60A5FA', '#A78BFA', '#F472B6'];
  const segmentAngle = 360 / prizes.length;

  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState(null);
  const wheelRef = useRef(null);

  const spin = () => {
    if (spinning) return;
    setSpinning(true);

    const randomIndex = Math.floor(Math.random() * prizes.length);
    const extraSpins = 8; // full rotations
    const finalRotation = extraSpins * 360 + randomIndex * segmentAngle + segmentAngle / 2;

    setRotation(prev => prev + finalRotation);

    // Wait for animation to finish (4s)
    setTimeout(() => {
      setSpinning(false);
      setWinner(prizes[randomIndex]);
    }, 4000);
  };

  return (
    <div className="flex flex-col items-center p-6">
      <div className="relative">
        {/* Pointer */}
        <div className="absolute left-1/2 -translate-x-1/2 -top-4 w-0 h-0 border-l-8 border-r-8 border-b-16 border-transparent border-b-red-500 z-10"></div>

        {/* Wheel */}
        <div
          ref={wheelRef}
          className="w-72 h-72 rounded-full overflow-hidden"
          style={{
            transition: 'transform 4s ease-out',
            transform: `rotate(${rotation}deg)`,
          }}
        >
          <svg viewBox="0 0 300 300" className="w-full h-full">
            {prizes.map((prize, i) => {
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
                    fontSize="14"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    transform={`rotate(${midAngle}, ${labelX}, ${labelY})`}
                  >
                    {prize}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      <button
        onClick={spin}
        disabled={spinning}
        className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {spinning ? 'Spinning...' : 'Spin'}
      </button>

      {winner && (
        <div className="mt-4 p-4 bg-green-100 text-green-800 rounded-lg">
          🎉 Winner: <strong>{winner}</strong>
        </div>
      )}
    </div>
  );
}
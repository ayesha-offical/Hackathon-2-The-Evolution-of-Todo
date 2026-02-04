'use client';

interface ProgressRingProps {
  percentage: number;
  label: string;
  color?: 'blue' | 'orange' | 'red' | 'green' | 'purple';
  size?: 'sm' | 'md' | 'lg';
}

export default function ProgressRing({
  percentage,
  label,
  color = 'blue',
  size = 'md',
}: ProgressRingProps) {
  const colorMap = {
    blue: '#4A90E2',
    orange: '#FF6B35',
    red: '#EE7063',
    green: '#52C41A',
    purple: '#9B59B6',
  };

  const sizeMap = {
    sm: { radius: 40, strokeWidth: 4, textSize: 'text-lg' },
    md: { radius: 60, strokeWidth: 6, textSize: 'text-2xl' },
    lg: { radius: 80, strokeWidth: 8, textSize: 'text-3xl' },
  };

  const config = sizeMap[size];
  const circumference = 2 * Math.PI * config.radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center hover:border-white/20 transition-all duration-300">
      <div className="relative inline-flex items-center justify-center mb-4">
        <svg width={config.radius * 2 + 20} height={config.radius * 2 + 20} className="transform -rotate-90 drop-shadow-lg">
          {/* Background Circle */}
          <circle
            cx={config.radius + 10}
            cy={config.radius + 10}
            r={config.radius}
            fill="none"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth={config.strokeWidth}
          />

          {/* Progress Circle */}
          <circle
            cx={config.radius + 10}
            cy={config.radius + 10}
            r={config.radius}
            fill="none"
            stroke={colorMap[color]}
            strokeWidth={config.strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.5s ease', filter: 'drop-shadow(0 0 8px ' + colorMap[color] + '40)' }}
          />
        </svg>

        {/* Center Text */}
        <div className="absolute flex flex-col items-center justify-center">
          <span className={`font-bold text-white ${config.textSize}`}>{percentage}%</span>
        </div>
      </div>

      {/* Label */}
      <p className="text-sm font-medium text-white/70 text-center">{label}</p>
    </div>
  );
}

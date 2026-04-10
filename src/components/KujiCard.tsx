// Reusable Kuji Card Component
export function KujiCard({ className = '', size = 'normal' }: { className?: string; size?: 'small' | 'normal' | 'large' }) {
  const dimensions = {
    small: { width: 120, height: 70 },
    normal: { width: 384, height: 224 },
    large: { width: 480, height: 280 },
  };

  const dim = dimensions[size];
  const scale = size === 'small' ? 0.5 : size === 'large' ? 1.25 : 1;

  const createSerratedPath = (width: number, height: number) => {
    const toothWidth = 12;
    const toothHeight = 8;
    const numTeeth = Math.floor(width / toothWidth);
    
    let path = `M 0,${toothHeight} `;
    
    for (let i = 0; i < numTeeth; i++) {
      const x = i * toothWidth;
      path += `L ${x + toothWidth / 2},0 L ${x + toothWidth},${toothHeight} `;
    }
    
    path += `L ${width},${toothHeight} L ${width},${height} L 0,${height} Z`;
    
    return path;
  };

  return (
    <div className={`relative ${className}`} style={{ width: dim.width, height: dim.height }}>
      <svg width={dim.width} height={dim.height} className="absolute inset-0 drop-shadow-lg">
        <defs>
          <clipPath id={`kuji-clip-${size}`}>
            <path d={createSerratedPath(dim.width, dim.height)} />
          </clipPath>
          <linearGradient id={`kuji-gradient-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ec4899" />
            <stop offset="25%" stopColor="#f472b6" />
            <stop offset="50%" stopColor="#a855f7" />
            <stop offset="75%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
          <pattern id={`dots-${size}`} x="0" y="0" width={20 * scale} height={20 * scale} patternUnits="userSpaceOnUse">
            <circle cx={10 * scale} cy={10 * scale} r={2 * scale} fill="white" opacity="0.2" />
          </pattern>
        </defs>
        <g clipPath={`url(#kuji-clip-${size})`}>
          <rect width={dim.width} height={dim.height} fill={`url(#kuji-gradient-${size})`} />
          <rect width={dim.width} height={dim.height} fill={`url(#dots-${size})`} />
          
          <rect x={8 * scale} y={8 * scale} width={dim.width - 16 * scale} height={dim.height - 16 * scale} fill="none" stroke="white" strokeWidth={2 * scale} opacity="0.4" rx={8 * scale} />
          <rect x={12 * scale} y={12 * scale} width={dim.width - 24 * scale} height={dim.height - 24 * scale} fill="none" stroke="white" strokeWidth={1 * scale} opacity="0.3" rx={6 * scale} />
          
          <rect width={dim.width} height={40 * scale} fill="rgba(255, 255, 255, 0.15)" />
          <text x={dim.width / 2} y={26 * scale} textAnchor="middle" fill="white" fontSize={16 * scale} fontWeight="bold">
            ★ 一番くじ ★
          </text>
          
          <text x={dim.width / 2} y={dim.height / 2 + 20 * scale} textAnchor="middle" fill="white" fontSize={80 * scale} fontWeight="bold" opacity="0.9">
            くじ
          </text>
          
          <text x={dim.width / 2} y={dim.height - 34 * scale} textAnchor="middle" fill="white" fontSize={14 * scale} opacity="0.8">
            何が当たるかな？
          </text>
          
          <g>
            {[...Array(Math.floor(dim.height / (8 * scale)))].map((_, i) => (
              <circle key={i} cx={20 * scale} cy={8 * scale + i * 8 * scale} r={2 * scale} fill="white" opacity="0.5" />
            ))}
          </g>
          
          <text x={40 * scale} y={80 * scale} fill="white" fontSize={20 * scale} opacity="0.6">★</text>
          <text x={dim.width - 44 * scale} y={80 * scale} fill="white" fontSize={20 * scale} opacity="0.6">★</text>
          <text x={40 * scale} y={dim.height - 44 * scale} fill="white" fontSize={16 * scale} opacity="0.5">✦</text>
          <text x={dim.width - 44 * scale} y={dim.height - 44 * scale} fill="white" fontSize={16 * scale} opacity="0.5">✦</text>
        </g>
      </svg>
    </div>
  );
}

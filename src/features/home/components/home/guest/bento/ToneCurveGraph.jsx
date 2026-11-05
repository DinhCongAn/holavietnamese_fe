import { useState } from 'react';
import { BilingualText, useTextLanguage } from '@/shared/components/common/BilingualText';
import { motion } from 'motion/react';
import { Volume2, Play } from 'lucide-react';
import { TONE_COLOR_MAP } from '@/features/home/components/home/data/vietnameseTones';
import { audioFeedback } from '@/utils/audioFeedback';

export const ToneCurveGraph = ({
  tone,
  compact = false,
  interactive = true,
  onPlay,
  className = '',
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const isVi = useTextLanguage() === 'vi';
  const colorToken = TONE_COLOR_MAP[tone.id] || TONE_COLOR_MAP.NGANG;

  // SVG dimensions
  const width = compact ? 160 : 280;
  const height = compact ? 80 : 130;
  const paddingX = compact ? 20 : 35;
  const paddingY = compact ? 12 : 20;

  // Convert pitch points (1 to 5 scale) to SVG (x, y) coordinates
  // Note: In SVG, y=0 is top (pitch 5), y=height is bottom (pitch 1)
  const points = tone.pitchContour.map((val, idx) => {
    const x = paddingX + (idx / (tone.pitchContour.length - 1)) * (width - 2 * paddingX);
    const normalizedY = (val - 1) / (5 - 1); // 0 (low) to 1 (high)
    const y = height - paddingY - normalizedY * (height - 2 * paddingY);
    return { x, y, val };
  });

  // Build smooth bezier SVG path
  const pathD = points.reduce((acc, point, i, arr) => {
    if (i === 0) return `M ${point.x} ${point.y}`;
    const prev = arr[i - 1];
    const cpX = (prev.x + point.x) / 2;
    return `${acc} C ${cpX} ${prev.y}, ${cpX} ${point.y}, ${point.x} ${point.y}`;
  }, '');

  // Fill area under curve
  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

  const handlePlayTone = () => {
    setIsPlaying(true);
    audioFeedback.playVietnameseTone(tone.id);
    onPlay?.();
    setTimeout(() => {
      setIsPlaying(false);
    }, 600);
  };

  return (
    <div
      className={`rounded-2xl border border-slate-200/80 bg-white/95 backdrop-blur-sm p-3 shadow-card-soft transition-all ${
        interactive ? 'hover:border-slate-300' : ''
      } ${className}`}
    >
      {/* Header with Tone Name and Audio Button */}
      <div className="flex items-center justify-between mb-2 px-1">
        <div className="flex items-center gap-2">
          <span
            className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-base shadow-sm ${colorToken.bg} ${colorToken.text} border ${colorToken.border}`}
          >
            {tone.symbol}
          </span>
          <div>
            <h4 className="text-xs font-bold text-slate-800 leading-tight">
              {isVi ? tone.nameVi : tone.nameEn}
            </h4>
            <span className="text-[11px] text-slate-500 font-medium">
              {isVi ? tone.nameEn : tone.nameVi}
            </span>
          </div>
        </div>

        {interactive && (
          <button
            type="button"
            onClick={handlePlayTone}
            aria-label={isVi ? `Nghe cao độ thanh ${tone.nameVi}` : `Listen to ${tone.nameEn} pitch`}
            className={`!min-h-0 !min-w-0 !p-0 !border-0 w-8 h-8 rounded-full flex items-center justify-center transition-transform active:scale-90 cursor-pointer audio-btn ${
              isPlaying
                ? 'bg-emerald-500 text-white shadow-md'
                : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
            }`}
          >
            {isPlaying ? (
              <motion.div
                animate={{ scale: [1, 1.25, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                <Volume2 className="w-4 h-4 shrink-0" strokeWidth={2.2} />
              </motion.div>
            ) : (
              <Play className="w-3.5 h-3.5 fill-current ml-0.5 shrink-0" />
            )}
          </button>
        )}
      </div>

      {/* Pitch Graph Canvas */}
      <div className="relative rounded-xl bg-slate-50/80 p-1 border border-slate-100 overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible select-none"
        >
          {/* Pitch Guidelines */}
          {[5, 3, 1].map((level) => {
            const normalizedY = (level - 1) / 4;
            const y = height - paddingY - normalizedY * (height - 2 * paddingY);
            return (
              <g key={level}>
                <line
                  x1={paddingX - 10}
                  y1={y}
                  x2={width - paddingX + 10}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeDasharray="2 3"
                  strokeWidth="1"
                />
                {!compact && (
                  <text
                    x={paddingX - 15}
                    y={y + 3}
                    fill="#94a3b8"
                    fontSize="9"
                    fontWeight="600"
                    textAnchor="end"
                  >
                    {level === 5 ? 'High' : level === 3 ? 'Mid' : 'Low'}
                  </text>
                )}
              </g>
            );
          })}

          {/* Area gradient under pitch curve */}
          <defs>
            <linearGradient id={`grad-${tone.id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={colorToken.hex} stopOpacity="0.25" />
              <stop offset="100%" stopColor={colorToken.hex} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          <path d={areaD} fill={`url(#grad-${tone.id})`} />

          {/* Tone Pitch Stroke */}
          <motion.path
            d={pathD}
            fill="none"
            stroke={colorToken.hex}
            strokeWidth={compact ? '3' : '4'}
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />

          {/* Curve Points */}
          {points.map((pt, i) => (
            <circle
              key={i}
              cx={pt.x}
              cy={pt.y}
              r={i === 0 || i === points.length - 1 ? 4 : 2.5}
              fill="#ffffff"
              stroke={colorToken.hex}
              strokeWidth="2"
            />
          ))}

          {/* Pulsing indicator traveling during audio play */}
          {isPlaying && (
            <motion.circle
              cx={points[0].x}
              cy={points[0].y}
              r="6"
              fill={colorToken.hex}
              animate={{
                cx: points.map((p) => p.x),
                cy: points.map((p) => p.y),
              }}
              transition={{ duration: 0.55, ease: 'easeInOut' }}
            />
          )}
        </svg>
      </div>

      {/* Mnemonic tip for foreign learners */}
      {!compact && tone.mnemonicTip && (
        <p className="mt-2 text-[11px] text-slate-500 italic bg-amber-50/60 text-amber-900/90 rounded-lg p-2 border border-amber-200/50">
          <strong><BilingualText vi="Gợi ý:" en="Tip:" /></strong> {tone.mnemonicTip}
        </p>
      )}
    </div>
  );
};

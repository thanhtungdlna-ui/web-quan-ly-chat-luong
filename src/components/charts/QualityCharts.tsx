/**
 * @license
 * LOL Quality Control Center - Industrial Quality SVG Charts
 * Thiết kế sắc nét, tương phản chuẩn công nghiệp, hỗ trợ drilldown khi click.
 */

import React, { useState } from 'react';
import { ParetoItem } from '../../utils/qualityMath';

interface ParetoChartProps {
  data: ParetoItem[];
  onBarClick?: (item: ParetoItem) => void;
  height?: number;
}

export const ParetoChart: React.FC<ParetoChartProps> = ({ data, onBarClick, height = 280 }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-56 text-slate-400 text-sm border border-dashed border-slate-200 rounded-lg">
        <p>Chưa có dữ liệu lỗi để vẽ biểu đồ Pareto</p>
        <span className="text-xs text-slate-400 mt-1">Vui lòng kiểm tra lại bộ lọc hoặc nhập thêm dữ liệu kiểm tra</span>
      </div>
    );
  }

  const maxCount = Math.max(...data.map(d => d.count), 5);
  const chartHeight = height - 60;
  const chartWidth = 580;
  const barWidth = Math.min(48, Math.max(22, (chartWidth - 80) / data.length - 12));
  const startX = 50;

  // Compute points for cumulative line
  const linePoints = data.map((d, i) => {
    const x = startX + i * ((chartWidth - 80) / data.length) + barWidth / 2;
    const y = chartHeight - (d.cumulativePercentage / 100) * (chartHeight - 40) + 15;
    return { x, y, percent: d.cumulativePercentage };
  });

  const pathD = linePoints.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  return (
    <div className="relative w-full overflow-x-auto">
      <svg viewBox={`0 0 ${chartWidth} ${height}`} className="w-full h-auto min-w-[500px]">
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map(pct => {
          const y = chartHeight - (pct / 100) * (chartHeight - 40) + 15;
          return (
            <g key={pct}>
              <line x1={startX} y1={y} x2={chartWidth - 35} y2={y} stroke="#e2e8f0" strokeDasharray="3 3" />
              <text x={chartWidth - 30} y={y + 3} fill="#64748b" fontSize="10" className="tabular-nums font-mono">
                {pct}%
              </text>
            </g>
          );
        })}

        {/* 80% Pareto Reference line */}
        {(() => {
          const y80 = chartHeight - (80 / 100) * (chartHeight - 40) + 15;
          return (
            <g>
              <line x1={startX} y1={y80} x2={chartWidth - 35} y2={y80} stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="5 3" />
              <text x={startX + 5} y={y80 - 4} fill="#b45309" fontSize="9" fontWeight="600">
                Ngưỡng 80% Pareto
              </text>
            </g>
          );
        })()}

        {/* Bars */}
        {data.map((item, idx) => {
          const x = startX + idx * ((chartWidth - 80) / data.length);
          const barHeight = (item.count / maxCount) * (chartHeight - 40);
          const y = chartHeight - barHeight + 15;
          const isHovered = hoveredIndex === idx;

          return (
            <g
              key={item.name}
              className="cursor-pointer transition-all"
              onClick={() => onBarClick && onBarClick(item)}
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={Math.max(barHeight, 2)}
                fill={isHovered ? '#0ea5e9' : '#0284c7'}
                rx="3"
                className="transition-colors duration-150"
              />
              <text
                x={x + barWidth / 2}
                y={y - 5}
                textAnchor="middle"
                fill="#0f172a"
                fontSize="11"
                fontWeight="600"
                className="tabular-nums font-mono"
              >
                {item.count}
              </text>
              {/* Truncated label */}
              <text
                x={x + barWidth / 2}
                y={chartHeight + 35}
                textAnchor="middle"
                fill="#475569"
                fontSize="10"
                className="select-none"
              >
                {item.name.length > 12 ? item.name.slice(0, 10) + '…' : item.name}
              </text>
            </g>
          );
        })}

        {/* Cumulative Line */}
        <path d={pathD} fill="none" stroke="#dc2626" strokeWidth="2.5" />

        {/* Cumulative Points */}
        {linePoints.map((pt, idx) => (
          <circle
            key={idx}
            cx={pt.x}
            cy={pt.y}
            r={hoveredIndex === idx ? 5 : 3.5}
            fill="#ffffff"
            stroke="#dc2626"
            strokeWidth="2"
            className="cursor-pointer transition-all"
          />
        ))}

        {/* Y Axis Left Label (Defect count) */}
        <text x="12" y="16" fill="#475569" fontSize="10" fontWeight="600">
          Số lỗi
        </text>
        {/* Y Axis Right Label (Cumulative %) */}
        <text x={chartWidth - 50} y="16" fill="#dc2626" fontSize="10" fontWeight="600">
          Tích lũy %
        </text>
      </svg>

      {/* Legend & Hint */}
      <div className="flex items-center justify-between text-xs text-slate-500 mt-2 px-2">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-sky-600 rounded-sm inline-block"></span>
            <span>Số lượng lỗi phát hiện</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-red-600 inline-block"></span>
            <span>Đường cong tích lũy (%)</span>
          </span>
        </div>
        <span className="text-slate-400 italic">Nhấn vào cột để lọc chi tiết lỗi</span>
      </div>
    </div>
  );
};

interface TrendDataPoint {
  label: string; // e.g. "08/10", "09/10", "10/10"
  iqcDefectRate: number | null;
  ipqcDefectRate: number | null;
  oqcPassRate: number | null;
}

interface TrendLineChartProps {
  data: TrendDataPoint[];
  metricType: 'defect' | 'pass';
  targetValue?: number;
  height?: number;
}

export const TrendLineChart: React.FC<TrendLineChartProps> = ({
  data,
  metricType,
  targetValue,
  height = 240
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-slate-400 text-sm border border-dashed border-slate-200 rounded-lg">
        Chưa có dữ liệu xu hướng theo thời gian
      </div>
    );
  }

  const chartWidth = 560;
  const chartHeight = height - 50;
  const paddingLeft = 45;
  const paddingRight = 25;
  const usableWidth = chartWidth - paddingLeft - paddingRight;

  const yMax = metricType === 'defect' ? 3.0 : 100;
  const yMin = metricType === 'defect' ? 0.0 : 95.0;

  const getY = (val: number | null) => {
    if (val === null) return chartHeight;
    const clamped = Math.min(Math.max(val, yMin), yMax);
    const ratio = (clamped - yMin) / (yMax - yMin);
    return chartHeight - ratio * (chartHeight - 30) + 10;
  };

  const getX = (idx: number) => {
    if (data.length <= 1) return paddingLeft + usableWidth / 2;
    return paddingLeft + (idx / (data.length - 1)) * usableWidth;
  };

  // Build path for IQC / IPQC / OQC
  const iqcPoints = data.map((d, i) => ({ x: getX(i), y: getY(d.iqcDefectRate), val: d.iqcDefectRate }));
  const ipqcPoints = data.map((d, i) => ({ x: getX(i), y: getY(d.ipqcDefectRate), val: d.ipqcDefectRate }));
  const oqcPoints = data.map((d, i) => ({ x: getX(i), y: getY(d.oqcPassRate), val: d.oqcPassRate }));

  const makePath = (pts: { x: number; y: number; val: number | null }[]) => {
    const validPts = pts.filter(p => p.val !== null);
    return validPts.reduce((acc, pt, i) => (i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`), '');
  };

  return (
    <div className="relative w-full">
      <svg viewBox={`0 0 ${chartWidth} ${height}`} className="w-full h-auto min-w-[480px]">
        {/* Horizontal grid lines */}
        {[0, 0.25, 0.5, 0.75, 1.0].map(pct => {
          const y = chartHeight - pct * (chartHeight - 30) + 10;
          const val = yMin + pct * (yMax - yMin);
          return (
            <g key={pct}>
              <line x1={paddingLeft} y1={y} x2={chartWidth - paddingRight} y2={y} stroke="#f1f5f9" strokeWidth="1" />
              <text x={paddingLeft - 8} y={y + 3} textAnchor="end" fill="#64748b" fontSize="9" className="tabular-nums font-mono">
                {metricType === 'defect' ? `${val.toFixed(1)}%` : `${val.toFixed(0)}%`}
              </text>
            </g>
          );
        })}

        {/* Target Line */}
        {targetValue !== undefined && (
          <g>
            <line
              x1={paddingLeft}
              y1={getY(targetValue)}
              x2={chartWidth - paddingRight}
              y2={getY(targetValue)}
              stroke="#059669"
              strokeWidth="1.5"
              strokeDasharray="4 3"
            />
            <text x={chartWidth - paddingRight} y={getY(targetValue) - 4} textAnchor="end" fill="#059669" fontSize="9" fontWeight="600">
              Mục tiêu: {targetValue}%
            </text>
          </g>
        )}

        {/* Lines based on metric type */}
        {metricType === 'defect' ? (
          <>
            {/* IQC Line */}
            <path d={makePath(iqcPoints)} fill="none" stroke="#2563eb" strokeWidth="2" />
            {iqcPoints.map((pt, i) => pt.val !== null && (
              <circle key={`iqc-${i}`} cx={pt.x} cy={pt.y} r={hoveredIdx === i ? 4.5 : 3} fill="#ffffff" stroke="#2563eb" strokeWidth="2" />
            ))}

            {/* IPQC Line */}
            <path d={makePath(ipqcPoints)} fill="none" stroke="#f97316" strokeWidth="2" />
            {ipqcPoints.map((pt, i) => pt.val !== null && (
              <circle key={`ipqc-${i}`} cx={pt.x} cy={pt.y} r={hoveredIdx === i ? 4.5 : 3} fill="#ffffff" stroke="#f97316" strokeWidth="2" />
            ))}
          </>
        ) : (
          <>
            {/* OQC Line */}
            <path d={makePath(oqcPoints)} fill="none" stroke="#10b981" strokeWidth="2.5" />
            {oqcPoints.map((pt, i) => pt.val !== null && (
              <circle key={`oqc-${i}`} cx={pt.x} cy={pt.y} r={hoveredIdx === i ? 5 : 3.5} fill="#ffffff" stroke="#10b981" strokeWidth="2" />
            ))}
          </>
        )}

        {/* X Axis Labels */}
        {data.map((d, i) => (
          <g key={i} onMouseEnter={() => setHoveredIdx(i)} onMouseLeave={() => setHoveredIdx(null)} className="cursor-pointer">
            <line x1={getX(i)} y1={chartHeight + 10} x2={getX(i)} y2={chartHeight + 15} stroke="#cbd5e1" />
            <text x={getX(i)} y={chartHeight + 28} textAnchor="middle" fill="#475569" fontSize="10" className="tabular-nums font-mono">
              {d.label}
            </text>
          </g>
        ))}
      </svg>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 text-xs text-slate-600 mt-1">
        {metricType === 'defect' ? (
          <>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-blue-600 inline-block"></span>
              <span>Lỗi đầu vào IQC (%)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-orange-500 inline-block"></span>
              <span>Lỗi công đoạn IPQC (%)</span>
            </span>
            {targetValue && (
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 border-b border-dashed border-emerald-600 inline-block"></span>
                <span>Mục tiêu ({targetValue}%)</span>
              </span>
            )}
          </>
        ) : (
          <>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-emerald-500 inline-block"></span>
              <span>Tỷ lệ đạt OQC xuất hàng (%)</span>
            </span>
            {targetValue && (
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 border-b border-dashed border-emerald-600 inline-block"></span>
                <span>Mục tiêu ({targetValue}%)</span>
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
};

interface StatusDonutChartProps {
  data: { label: string; count: number; color: string }[];
  totalLabel?: string;
}

export const StatusDonutChart: React.FC<StatusDonutChartProps> = ({ data, totalLabel = 'Tổng cộng' }) => {
  const total = data.reduce((acc, d) => acc + d.count, 0);

  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-slate-400 text-sm border border-dashed border-slate-200 rounded-lg">
        Chưa có dữ liệu trạng thái
      </div>
    );
  }

  let accumulatedPercent = 0;
  const slices = data.map(item => {
    const percent = (item.count / total) * 100;
    const startAngle = (accumulatedPercent / 100) * 360;
    accumulatedPercent += percent;
    const endAngle = (accumulatedPercent / 100) * 360;
    return { ...item, percent, startAngle, endAngle };
  });

  const getCoordinatesForPercent = (percentAngle: number, radius: number = 40) => {
    const x = Math.cos((2 * Math.PI * percentAngle) / 360);
    const y = Math.sin((2 * Math.PI * percentAngle) / 360);
    return [50 + radius * x, 50 + radius * y];
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-around gap-4 p-2">
      <div className="relative w-36 h-36 shrink-0">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          {slices.map((slice, i) => {
            if (slice.percent === 0) return null;
            if (slice.percent === 100) {
              return <circle key={i} cx="50" cy="50" r="35" fill="none" stroke={slice.color} strokeWidth="18" />;
            }
            const [startX, startY] = getCoordinatesForPercent(slice.startAngle, 35);
            const [endX, endY] = getCoordinatesForPercent(slice.endAngle, 35);
            const largeArcFlag = slice.endAngle - slice.startAngle > 180 ? 1 : 0;
            const pathData = `M ${startX} ${startY} A 35 35 0 ${largeArcFlag} 1 ${endX} ${endY}`;
            return (
              <path
                key={i}
                d={pathData}
                fill="none"
                stroke={slice.color}
                strokeWidth="18"
                className="transition-all duration-300 hover:opacity-85"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
          <span className="text-xl font-bold text-slate-800 tabular-nums font-mono">{total}</span>
          <span className="text-[10px] text-slate-400">{totalLabel}</span>
        </div>
      </div>

      <div className="flex flex-col gap-2 min-w-[140px]">
        {slices.map((slice, i) => (
          <div key={i} className="flex items-center justify-between text-xs gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: slice.color }}></span>
              <span className="text-slate-600 font-medium">{slice.label}</span>
            </div>
            <div className="flex items-center gap-1.5 tabular-nums font-mono text-slate-800">
              <span className="font-semibold">{slice.count}</span>
              <span className="text-slate-400 text-[10px]">({slice.percent.toFixed(0)}%)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

interface SPCChartProps {
  samples: number[];
  ucl: number;
  cl: number;
  lcl: number;
  paramName?: string;
  unit?: string;
}

export const SPCControlChart: React.FC<SPCChartProps> = ({
  samples,
  ucl,
  cl,
  lcl,
  paramName = 'Đặc tính đo kiểm',
  unit = 'μm'
}) => {
  if (samples.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-slate-400 text-sm border border-dashed border-slate-200 rounded-lg">
        Chưa có mẫu đo để hiển thị biểu đồ kiểm soát quá trình (SPC)
      </div>
    );
  }

  const height = 240;
  const width = 560;
  const padLeft = 48;
  const padRight = 30;
  const usableWidth = width - padLeft - padRight;
  const usableHeight = height - 50;

  const maxVal = Math.max(ucl * 1.05, ...samples);
  const minVal = Math.min(lcl * 0.95, ...samples);

  const getY = (v: number) => {
    const ratio = (v - minVal) / (maxVal - minVal);
    return usableHeight - ratio * (usableHeight - 30) + 15;
  };

  const getX = (i: number) => {
    if (samples.length <= 1) return padLeft + usableWidth / 2;
    return padLeft + (i / (samples.length - 1)) * usableWidth;
  };

  const points = samples.map((v, i) => ({ x: getX(i), y: getY(v), val: v, isOut: v > ucl || v < lcl }));
  const pathD = points.reduce((acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`), '');

  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-xs text-slate-600 mb-1 px-1">
        <span className="font-medium text-slate-800">{paramName} ({unit})</span>
        <div className="flex items-center gap-3 font-mono tabular-nums text-[11px]">
          <span className="text-red-600">UCL: {ucl}</span>
          <span className="text-emerald-700 font-semibold">CL: {cl}</span>
          <span className="text-red-600">LCL: {lcl}</span>
        </div>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto min-w-[480px]">
        {/* UCL Line */}
        <line x1={padLeft} y1={getY(ucl)} x2={width - padRight} y2={getY(ucl)} stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4 2" />
        <text x={padLeft - 6} y={getY(ucl) + 3} textAnchor="end" fill="#ef4444" fontSize="9" className="font-mono tabular-nums font-bold">
          {ucl}
        </text>

        {/* Center Line (CL) */}
        <line x1={padLeft} y1={getY(cl)} x2={width - padRight} y2={getY(cl)} stroke="#10b981" strokeWidth="1.8" />
        <text x={padLeft - 6} y={getY(cl) + 3} textAnchor="end" fill="#10b981" fontSize="9" className="font-mono tabular-nums font-bold">
          {cl}
        </text>

        {/* LCL Line */}
        <line x1={padLeft} y1={getY(lcl)} x2={width - padRight} y2={getY(lcl)} stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4 2" />
        <text x={padLeft - 6} y={getY(lcl) + 3} textAnchor="end" fill="#ef4444" fontSize="9" className="font-mono tabular-nums font-bold">
          {lcl}
        </text>

        {/* Run Chart Path */}
        <path d={pathD} fill="none" stroke="#0284c7" strokeWidth="2" />

        {/* Data Sample Dots */}
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={p.isOut ? 5.5 : 3.5}
            fill={p.isOut ? '#ef4444' : '#ffffff'}
            stroke={p.isOut ? '#991b1b' : '#0284c7'}
            strokeWidth="2"
          >
            <title>{`Mẫu #${i + 1}: ${p.val} ${unit} ${p.isOut ? '(VƯỢT NGƯỠNG KIỂM SOÁT)' : ''}`}</title>
          </circle>
        ))}

        {/* X axis sample index */}
        {samples.map((_, i) => (
          <text key={i} x={getX(i)} y={usableHeight + 30} textAnchor="middle" fill="#64748b" fontSize="8" className="font-mono">
            {i + 1}
          </text>
        ))}
      </svg>
      <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
        <span>Trục hoành: Thứ tự mẫu kiểm tra (Sample #)</span>
        <span className="text-amber-700 italic">Quy tắc Nelson / Western Electric: Điểm đỏ biểu thị giá trị ngoài giới hạn kiểm soát</span>
      </div>
    </div>
  );
};

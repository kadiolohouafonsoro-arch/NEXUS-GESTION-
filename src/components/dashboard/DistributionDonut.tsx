import React, { useState } from 'react';
import { PieChart, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const DistributionDonut: React.FC = () => {
  const { invoices, formatMoney } = useApp();
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  // Categories distribution
  const categories = [
    { name: 'Portails & Digital', value: 9265000, color: '#6366f1', bgClass: 'bg-indigo-500' },
    { name: 'BTP & Infrastructure', value: 4366000, color: '#10b981', bgClass: 'bg-emerald-500' },
    { name: 'Mutuelle & Tontines', value: 2100000, color: '#a855f7', bgClass: 'bg-purple-500' },
    { name: 'Conseil & Médical', value: 2496000, color: '#f59e0b', bgClass: 'bg-amber-500' },
  ];

  const totalValue = categories.reduce((sum, c) => sum + c.value, 0);

  // SVG Donut calculations
  const size = 200;
  const strokeWidth = 24;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let cumulativePercent = 0;

  const currentCategory = hoveredCategory
    ? categories.find((c) => c.name === hoveredCategory)
    : null;

  return (
    <div className="bg-slate-850 border border-slate-750 rounded-2xl p-5 shadow-lg shadow-black/10 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <PieChart className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-slate-100">Répartition par Activité</h3>
          </div>
          <span className="text-[11px] font-semibold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700/60">
            Exercice 2025
          </span>
        </div>

        {/* Donut graphic */}
        <div className="relative flex items-center justify-center py-2">
          <svg width={size} height={size} className="transform -rotate-90">
            {categories.map((cat) => {
              const percent = cat.value / totalValue;
              const strokeDasharray = `${circumference * percent} ${circumference * (1 - percent)}`;
              const strokeDashoffset = -circumference * cumulativePercent;
              cumulativePercent += percent;
              const isHovered = hoveredCategory === cat.name;

              return (
                <circle
                  key={cat.name}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="transparent"
                  stroke={cat.color}
                  strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-300 cursor-pointer"
                  onMouseEnter={() => setHoveredCategory(cat.name)}
                  onMouseLeave={() => setHoveredCategory(null)}
                />
              );
            })}
          </svg>

          {/* Donut Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            {currentCategory ? (
              <>
                <span className="text-xs font-semibold text-slate-400 max-w-[110px] truncate">
                  {currentCategory.name}
                </span>
                <span className="text-sm font-extrabold text-slate-100 mt-0.5">
                  {formatMoney(currentCategory.value)}
                </span>
                <span className="text-[11px] font-bold text-indigo-400">
                  {Math.round((currentCategory.value / totalValue) * 100)}%
                </span>
              </>
            ) : (
              <>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Total Activité
                </span>
                <span className="text-sm font-extrabold text-slate-100 mt-0.5">
                  {formatMoney(totalValue)}
                </span>
                <span className="text-[11px] text-emerald-400 flex items-center gap-0.5 font-medium">
                  <Sparkles className="w-3 h-3" />
                  100% valorisé
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="space-y-2 mt-4 pt-3 border-t border-slate-800">
        {categories.map((cat) => {
          const percent = Math.round((cat.value / totalValue) * 100);
          const isHovered = hoveredCategory === cat.name;

          return (
            <div
              key={cat.name}
              onMouseEnter={() => setHoveredCategory(cat.name)}
              onMouseLeave={() => setHoveredCategory(null)}
              className={`flex items-center justify-between text-xs p-1.5 rounded-lg transition-colors cursor-pointer ${
                isHovered ? 'bg-slate-800' : 'hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
                <span className={`truncate max-w-[130px] ${isHovered ? 'text-white font-semibold' : 'text-slate-300'}`}>
                  {cat.name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-400">{formatMoney(cat.value)}</span>
                <span className="font-bold text-slate-200 w-8 text-right">{percent}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

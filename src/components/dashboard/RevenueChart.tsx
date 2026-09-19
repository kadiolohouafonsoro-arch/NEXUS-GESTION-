import React, { useState } from 'react';
import { BarChart3, TrendingUp, Calendar, Info } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const RevenueChart: React.FC = () => {
  const { formatMoney } = useApp();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [period, setPeriod] = useState<'6m' | '3m'>('6m');

  // Realistic historical & current monthly cashflow data
  const data6m = [
    { month: 'Oct 24', invoiced: 3800000, collected: 3500000, expenses: 1400000 },
    { month: 'Nov 24', invoiced: 4600000, collected: 4200000, expenses: 1900000 },
    { month: 'Déc 24', invoiced: 5800000, collected: 5500000, expenses: 2200000 },
    { month: 'Jan 25', invoiced: 6200000, collected: 5800000, expenses: 2100000 },
    { month: 'Fév 25', invoiced: 7400000, collected: 6900000, expenses: 2450000 },
    { month: 'Mar 25', invoiced: 8100000, collected: 6200000, expenses: 1800000 },
  ];

  const data = period === '3m' ? data6m.slice(3) : data6m;

  const maxVal = Math.max(...data.map((d) => Math.max(d.invoiced, d.collected, d.expenses))) * 1.15;

  return (
    <div className="bg-slate-850 border border-slate-750 rounded-2xl p-5 shadow-lg shadow-black/10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-slate-100">Évolution Financière & Trésorerie</h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Comparatif facturations émises, encaissements effectifs et charges
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Legend */}
          <div className="hidden md:flex items-center gap-4 text-xs mr-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-indigo-500"></span>
              <span className="text-slate-300">Facturé</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500"></span>
              <span className="text-slate-300">Encaissé</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-rose-500"></span>
              <span className="text-slate-300">Dépenses</span>
            </div>
          </div>

          {/* Period Toggle */}
          <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700/60 text-xs">
            <button
              onClick={() => setPeriod('6m')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                period === '6m' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              6 mois
            </button>
            <button
              onClick={() => setPeriod('3m')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                period === '3m' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              3 mois
            </button>
          </div>
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div className="relative h-64 w-full flex items-end justify-between gap-3 sm:gap-6 pt-8 pb-4 border-b border-slate-800">
        {/* Horizontal grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
          <div className="border-b border-dashed border-slate-500 w-full" />
          <div className="border-b border-dashed border-slate-500 w-full" />
          <div className="border-b border-dashed border-slate-500 w-full" />
          <div className="border-b border-dashed border-slate-500 w-full" />
        </div>

        {data.map((item, index) => {
          const invoicedHeight = (item.invoiced / maxVal) * 100;
          const collectedHeight = (item.collected / maxVal) * 100;
          const expensesHeight = (item.expenses / maxVal) * 100;
          const isHovered = hoveredIndex === index;

          return (
            <div
              key={item.month}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="relative flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
            >
              {/* Tooltip on hover */}
              {isHovered && (
                <div className="absolute -top-24 z-20 bg-slate-900 border border-slate-700 rounded-xl p-2.5 shadow-2xl text-xs w-48 pointer-events-none transform -translate-x-1/2 left-1/2">
                  <div className="font-bold text-slate-100 border-b border-slate-800 pb-1 mb-1.5 flex justify-between">
                    <span>{item.month}</span>
                    <span className="text-emerald-400">
                      +{formatMoney(item.collected - item.expenses)} net
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-slate-300">
                      <span className="text-indigo-400 font-medium">Facturé :</span>
                      <span>{formatMoney(item.invoiced)}</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span className="text-emerald-400 font-medium">Encaissé :</span>
                      <span>{formatMoney(item.collected)}</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span className="text-rose-400 font-medium">Dépenses :</span>
                      <span>{formatMoney(item.expenses)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Grouped Bars */}
              <div className="w-full flex items-end justify-center gap-1 sm:gap-2 h-full">
                {/* Invoiced bar */}
                <div
                  style={{ height: `${invoicedHeight}%` }}
                  className={`w-2.5 sm:w-4 bg-indigo-500/80 hover:bg-indigo-400 rounded-t-md transition-all duration-300 ${
                    isHovered ? 'brightness-125 scale-y-[1.02]' : ''
                  }`}
                />
                {/* Collected bar */}
                <div
                  style={{ height: `${collectedHeight}%` }}
                  className={`w-2.5 sm:w-4 bg-emerald-500/80 hover:bg-emerald-400 rounded-t-md transition-all duration-300 ${
                    isHovered ? 'brightness-125 scale-y-[1.02]' : ''
                  }`}
                />
                {/* Expenses bar */}
                <div
                  style={{ height: `${expensesHeight}%` }}
                  className={`w-2.5 sm:w-4 bg-rose-500/80 hover:bg-rose-400 rounded-t-md transition-all duration-300 ${
                    isHovered ? 'brightness-125 scale-y-[1.02]' : ''
                  }`}
                />
              </div>

              {/* Month label */}
              <span
                className={`mt-2 text-[11px] font-semibold transition-colors ${
                  isHovered ? 'text-indigo-300 font-bold' : 'text-slate-400'
                }`}
              >
                {item.month}
              </span>
            </div>
          );
        })}
      </div>

      {/* Footer Metrics */}
      <div className="mt-4 pt-2 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <span>
            Taux de recouvrement moyen :{' '}
            <strong className="text-slate-200">89.2%</strong>
          </span>
        </div>
        <div className="text-[11px] text-slate-500 flex items-center gap-1">
          <Info className="w-3.5 h-3.5" />
          Survolez une période pour le détail des flux
        </div>
      </div>
    </div>
  );
};

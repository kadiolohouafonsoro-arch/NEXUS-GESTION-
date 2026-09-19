import React from 'react';
import { Smartphone, Building, Banknote, ArrowUpRight, Plus, ExternalLink } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface CashBoxesWidgetProps {
  onOpenTransactionModal: () => void;
}

export const CashBoxesWidget: React.FC<CashBoxesWidgetProps> = ({ onOpenTransactionModal }) => {
  const { accounts, formatMoney, setActiveTab } = useApp();

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'wave':
        return <Smartphone className="w-4 h-4 text-sky-400" />;
      case 'orange_money':
        return <Smartphone className="w-4 h-4 text-amber-400" />;
      case 'bank':
        return <Building className="w-4 h-4 text-emerald-400" />;
      default:
        return <Banknote className="w-4 h-4 text-purple-400" />;
    }
  };

  return (
    <div className="bg-slate-850 border border-slate-750 rounded-2xl p-5 shadow-lg shadow-black/10">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <span>Comptes de Trésorerie & Passerelles</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Soldes disponibles sur Wave, Orange Money, Banque et Caisses
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenTransactionModal}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 hover:text-indigo-300 border border-indigo-500/30 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Mouvement</span>
          </button>
          <button
            onClick={() => setActiveTab('treasury')}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Ouvrir le module trésorerie"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {accounts.map((acc) => (
          <div
            key={acc.id}
            onClick={() => setActiveTab('treasury')}
            className="group relative bg-slate-900/90 hover:bg-slate-800/80 border border-slate-750/70 hover:border-slate-650 rounded-xl p-3.5 transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-slate-800 border border-slate-700">
                  {getAccountIcon(acc.type)}
                </div>
                <span className="text-xs font-bold text-slate-200 truncate max-w-[110px]">
                  {acc.name}
                </span>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 transition-colors" />
            </div>

            <div className="text-base font-extrabold text-white tracking-tight">
              {formatMoney(acc.balance)}
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-800">
              <span className="truncate max-w-[120px]">{acc.accountNumber}</span>
              <span className="font-semibold text-emerald-400">Actif</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

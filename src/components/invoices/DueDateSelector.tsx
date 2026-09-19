import React from 'react';
import { Calendar, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';

interface DueDateSelectorProps {
  issueDate: string;
  dueDate: string;
  onIssueDateChange: (date: string) => void;
  onDueDateChange: (date: string) => void;
}

export const DueDateSelector: React.FC<DueDateSelectorProps> = ({
  issueDate,
  dueDate,
  onIssueDateChange,
  onDueDateChange,
}) => {
  // Calcul du nombre de jours de délai
  const getDaysDifference = () => {
    if (!issueDate || !dueDate) return 0;
    const start = new Date(issueDate);
    const end = new Date(dueDate);
    const diffTime = end.getTime() - start.getTime();
    return Math.round(diffTime / (1000 * 3600 * 24));
  };

  const daysDiff = getDaysDifference();

  // Appliquer un preset de date d'échéance
  const applyPreset = (presetDays: number | 'end_of_month') => {
    const base = issueDate ? new Date(issueDate) : new Date();

    if (presetDays === 'end_of_month') {
      // Fin du mois suivant
      const nextMonth = new Date(base.getFullYear(), base.getMonth() + 2, 0);
      onDueDateChange(nextMonth.toISOString().split('T')[0]);
    } else {
      const target = new Date(base.getTime() + presetDays * 24 * 60 * 60 * 1000);
      onDueDateChange(target.toISOString().split('T')[0]);
    }
  };

  // Formater la date en français pour l'affichage
  const formatFrenchDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr + 'T00:00:00');
      return d.toLocaleDateString('fr-FR', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 sm:p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-700/60 pb-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-indigo-400" />
          <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
            Dates & Conditions d'échéance
          </h3>
        </div>
        {/* Badge indicateur de délai */}
        <div>
          {daysDiff < 0 ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30">
              <AlertCircle className="w-3.5 h-3.5" />
              Échéance antérieure à l'émission ({daysDiff}j)
            </span>
          ) : daysDiff === 0 ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <Clock className="w-3.5 h-3.5" />
              Paiement comptant / À réception
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Délai accordé : {daysDiff} jours ({formatFrenchDate(dueDate)})
            </span>
          )}
        </div>
      </div>

      {/* Date Pickers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            Date d'émission de la facture
          </label>
          <div className="relative">
            <input
              type="date"
              value={issueDate}
              onChange={(e) => onIssueDateChange(e.target.value)}
              required
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono"
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {formatFrenchDate(issueDate)}
          </p>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            Date d'échéance de règlement
          </label>
          <div className="relative">
            <input
              type="date"
              value={dueDate}
              onChange={(e) => onDueDateChange(e.target.value)}
              required
              className={`w-full px-3 py-2 bg-slate-900 border rounded-xl text-xs text-slate-100 focus:outline-none focus:ring-2 transition-all font-mono ${
                daysDiff < 0
                  ? 'border-rose-500 focus:ring-rose-500 text-rose-200'
                  : 'border-slate-700 focus:ring-indigo-500'
              }`}
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {formatFrenchDate(dueDate)}
          </p>
        </div>
      </div>

      {/* Raccourcis rapides d'échéance */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Clock className="w-3 h-3 text-slate-400" />
          <span className="text-[11px] font-semibold text-slate-300">
            Raccourcis de calcul d'échéance :
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => applyPreset(0)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              daysDiff === 0
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-750 hover:bg-slate-700 text-slate-300 border border-slate-700'
            }`}
          >
            Comptant (J+0)
          </button>
          <button
            type="button"
            onClick={() => applyPreset(15)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              daysDiff === 15
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-750 hover:bg-slate-700 text-slate-300 border border-slate-700'
            }`}
          >
            15 jours
          </button>
          <button
            type="button"
            onClick={() => applyPreset(30)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              daysDiff === 30
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-750 hover:bg-slate-700 text-slate-300 border border-slate-700'
            }`}
          >
            30 jours net
          </button>
          <button
            type="button"
            onClick={() => applyPreset('end_of_month')}
            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-750 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all cursor-pointer"
          >
            30j Fin de mois
          </button>
          <button
            type="button"
            onClick={() => applyPreset(45)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              daysDiff === 45
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-750 hover:bg-slate-700 text-slate-300 border border-slate-700'
            }`}
          >
            45 jours
          </button>
          <button
            type="button"
            onClick={() => applyPreset(60)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              daysDiff === 60
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-750 hover:bg-slate-700 text-slate-300 border border-slate-700'
            }`}
          >
            60 jours
          </button>
        </div>
      </div>
    </div>
  );
};

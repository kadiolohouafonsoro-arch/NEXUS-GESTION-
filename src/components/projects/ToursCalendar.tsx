import React, { useState } from 'react';
import {
  CalendarDays,
  Plus,
  CheckCircle2,
  Clock,
  AlertTriangle,
  UserCheck,
  TrendingUp,
  Banknote,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { TontineTour } from '../../types';
import { useApp } from '../../context/AppContext';

export const ToursCalendar: React.FC = () => {
  const { tours, addTour, updateTour, formatMoney, clients, settings } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state
  const [beneficiaryName, setBeneficiaryName] = useState(clients[0]?.name || '');
  const [beneficiaryId, setBeneficiaryId] = useState(clients[0]?.id || '');
  const [targetDate, setTargetDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [amount, setAmount] = useState(1500000);
  const [notes, setNotes] = useState('Tour de rotation mensuelle');

  // Metrics
  const totalPaidOut = tours
    .filter((t) => t.status === 'paid_out')
    .reduce((sum, t) => sum + t.amount, 0);

  const nextUpcomingTour = tours.find((t) => t.status === 'scheduled' || t.status === 'collected');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addTour({
      beneficiaryName,
      beneficiaryId,
      targetDate,
      amount: Number(amount),
      status: 'scheduled',
      notes,
    });
    setShowAddModal(false);
  };

  const handleStatusChange = (tour: TontineTour, newStatus: any) => {
    updateTour({
      ...tour,
      status: newStatus,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight flex items-center gap-2.5">
            <CalendarDays className="w-7 h-7 text-purple-400" />
            <span>Calendrier des Tours & Permanences</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Suivi chronologique et équitable des tours de tontine, permanences et décaissements
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-purple-600/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Planifier un Tour</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-850 border border-slate-750">
          <span className="text-xs font-semibold text-slate-400">Total Fonds Décaissés / Versés</span>
          <div className="text-xl font-black text-emerald-400 mt-1 font-mono">
            {formatMoney(totalPaidOut)}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {tours.filter((t) => t.status === 'paid_out').length} tours acquittés avec succès
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-850 border border-slate-750">
          <span className="text-xs font-semibold text-slate-400">Prochain Bénéficiaire Prévu</span>
          <div className="text-base font-bold text-slate-100 mt-1 truncate">
            {nextUpcomingTour ? nextUpcomingTour.beneficiaryName : 'Tous les tours sont échus'}
          </div>
          <div className="text-xs text-purple-400 font-semibold mt-0.5">
            {nextUpcomingTour ? `Échéance : ${nextUpcomingTour.targetDate}` : ''}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-850 border border-slate-750">
          <span className="text-xs font-semibold text-slate-400">Montant Cible par Rotation</span>
          <div className="text-xl font-black text-slate-100 mt-1 font-mono">
            {formatMoney(tours[0]?.amount || 1500000)}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Cadence : Mensuelle UEMOA (Wave & OM)
          </span>
        </div>
      </div>

      {/* Chronological Tours Timeline */}
      <div className="bg-slate-850 border border-slate-750 rounded-2xl p-6 shadow-lg shadow-black/10">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-6 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span>Ordre de Rotation & Attribution des Pots</span>
        </h3>

        <div className="relative border-l-2 border-slate-800 ml-4 pl-6 space-y-6">
          {tours.map((tour) => {
            const isCompleted = tour.status === 'paid_out';
            const isCollected = tour.status === 'collected';
            const isScheduled = tour.status === 'scheduled';

            return (
              <div key={tour.id} className="relative group">
                {/* Timeline node icon */}
                <div
                  className={`absolute -left-[35px] top-1 w-6 h-6 rounded-full flex items-center justify-center border-2 ${
                    isCompleted
                      ? 'bg-emerald-500 border-emerald-400 text-white'
                      : isCollected
                      ? 'bg-purple-600 border-purple-400 text-white animate-pulse'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                >
                  <span className="text-[11px] font-bold">{tour.tourNumber}</span>
                </div>

                {/* Tour Card */}
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-750 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono">
                        Tour N°{tour.tourNumber}
                      </span>
                      <h4 className="text-sm font-extrabold text-slate-100 truncate">
                        {tour.beneficiaryName}
                      </h4>
                    </div>

                    <div className="text-xs text-slate-400 flex items-center gap-3">
                      <span>Date cible : <strong>{tour.targetDate}</strong></span>
                      {tour.notes && <span className="text-slate-500">• {tour.notes}</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 justify-between sm:justify-end">
                    <div className="text-right">
                      <div className="text-sm sm:text-base font-black text-slate-100 font-mono">
                        {formatMoney(tour.amount)}
                      </div>
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                          isCompleted
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : isCollected
                            ? 'bg-purple-500/20 text-purple-300'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}
                      >
                        {isCompleted
                          ? 'Décaissé / Versé'
                          : isCollected
                          ? 'Collecte Complète (À verser)'
                          : 'Planifié / En collecte'}
                      </span>
                    </div>

                    {/* Quick status change */}
                    <div className="flex items-center gap-1.5 border-l border-slate-800 pl-3">
                      {isScheduled && (
                        <button
                          onClick={() => handleStatusChange(tour, 'collected')}
                          className="px-2.5 py-1.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 rounded-lg text-xs font-semibold cursor-pointer"
                        >
                          Fonds Réunis
                        </button>
                      )}

                      {isCollected && (
                        <button
                          onClick={() => handleStatusChange(tour, 'paid_out')}
                          className="px-2.5 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-semibold cursor-pointer flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Confirmer Versement</span>
                        </button>
                      )}

                      {isCompleted && (
                        <span className="text-xs text-emerald-400 flex items-center gap-1 font-bold">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Acquitté</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Plan Tour Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-750 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-base font-bold text-slate-100 mb-4 flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-purple-400" />
              <span>Planifier un Nouveau Tour de Rotation</span>
            </h3>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Bénéficiaire désigné
                </label>
                <select
                  value={beneficiaryId}
                  onChange={(e) => {
                    setBeneficiaryId(e.target.value);
                    const sel = clients.find((c) => c.id === e.target.value);
                    if (sel) setBeneficiaryName(sel.name);
                  }}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Date de décaissement
                </label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Montant de la cagnotte
                </label>
                <input
                  type="number"
                  step="50000"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  required
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Notes</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-600/20"
                >
                  Ajouter au calendrier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

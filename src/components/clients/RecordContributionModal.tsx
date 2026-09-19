import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  Wallet,
  Smartphone,
  Building,
  Banknote,
  Calendar,
  AlertCircle,
  Receipt,
  User,
} from 'lucide-react';
import { Client, PaymentMethod } from '../../types';
import { useApp } from '../../context/AppContext';

interface RecordContributionModalProps {
  member: Client;
  onClose: () => void;
  onSuccess?: () => void;
}

export const RecordContributionModal: React.FC<RecordContributionModalProps> = ({
  member,
  onClose,
  onSuccess,
}) => {
  const { formatMoney, accounts, recordMemberContributionPayment, settings } = useApp();

  const baseMonthlyAmount = member.monthlyContribution || settings.baseContribution || 50000;
  const [monthsCount, setMonthsCount] = useState<number>(1);
  const [customAmount, setCustomAmount] = useState<number>(baseMonthlyAmount);
  const [isCustom, setIsCustom] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('wave');
  const [selectedAccountId, setSelectedAccountId] = useState<string>(
    accounts[0]?.id || 'acc-1'
  );
  const [notes, setNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const amountToPay = isCustom ? customAmount : baseMonthlyAmount * monthsCount;

  const handleMonthsChange = (months: number) => {
    setMonthsCount(months);
    setIsCustom(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amountToPay <= 0) return;

    setIsProcessing(true);
    setTimeout(() => {
      recordMemberContributionPayment(
        member.id,
        amountToPay,
        paymentMethod,
        selectedAccountId,
        isCustom ? 1 : monthsCount,
        notes
      );
      setIsProcessing(false);
      onSuccess?.();
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-emerald-500/30 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative my-8">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white">Encaisser une Cotisation</h2>
            <p className="text-xs text-slate-400">
              Règlement de cotisation pour l'adhérent
            </p>
          </div>
        </div>

        {/* Member Preview Card */}
        <div className="mt-4 p-4 rounded-2xl bg-slate-850 border border-slate-750 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-black text-sm flex items-center justify-center">
              {member.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="text-sm font-bold text-white">{member.name}</div>
              <div className="text-xs text-slate-400 font-mono">{member.phone}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-slate-400 font-semibold uppercase">Situation</div>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                member.outstandingBalance > 0
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}
            >
              {member.outstandingBalance > 0
                ? `Retard: ${formatMoney(member.outstandingBalance)}`
                : 'À jour'}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Quick Select Months */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-2">
              Période / Nombre de mois de cotisation
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 6].map((m) => (
                <button
                  type="button"
                  key={m}
                  onClick={() => handleMonthsChange(m)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    !isCustom && monthsCount === m
                      ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-600/30'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                  }`}
                >
                  {m} {m > 1 ? 'mois' : 'mois'}
                </button>
              ))}
            </div>

            <div className="mt-2.5 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsCustom(!isCustom)}
                className="text-xs text-emerald-400 hover:underline font-semibold"
              >
                {isCustom ? '← Revenir au forfait mensuel' : 'Saisir un montant libre / exceptionnel'}
              </button>
              <span className="text-xs text-slate-400">
                Tarif de base: <strong className="text-slate-200">{formatMoney(baseMonthlyAmount)}/mois</strong>
              </span>
            </div>

            {isCustom && (
              <div className="mt-2">
                <input
                  type="number"
                  min="500"
                  step="500"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-800 border border-emerald-500/40 rounded-xl text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Montant personnalisé en FCFA"
                />
              </div>
            )}
          </div>

          {/* Amount Display */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-slate-850 to-slate-900 border border-emerald-500/30 flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-300">Montant total à encaisser</span>
            <span className="text-xl font-black text-emerald-400 font-mono">
              {formatMoney(amountToPay)}
            </span>
          </div>

          {/* Payment Method */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-2">
              Mode de paiement utilisé
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'wave', label: 'Wave', color: 'text-sky-400' },
                { id: 'orange_money', label: 'Orange Money', color: 'text-orange-400' },
                { id: 'mtn_momo', label: 'MTN MoMo', color: 'text-yellow-400' },
                { id: 'cash', label: 'Espèces', color: 'text-emerald-400' },
                { id: 'bank_transfer', label: 'Virement', color: 'text-blue-400' },
                { id: 'check', label: 'Chèque', color: 'text-purple-400' },
              ].map((pm) => (
                <button
                  type="button"
                  key={pm.id}
                  onClick={() => setPaymentMethod(pm.id as PaymentMethod)}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                    paymentMethod === pm.id
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500 shadow-sm'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-750'
                  }`}
                >
                  <span className={pm.color}>●</span> {pm.label}
                </button>
              ))}
            </div>
          </div>

          {/* Target Cash Account */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5">
              Caisse / Compte de destination
            </label>
            <select
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} — Solde: {formatMoney(acc.balance)} ({acc.type})
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5">
              Observations / N° de transaction Mobile Money
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Réf Wave 0789028207 ou séance du 07 Septembre"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-300 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isProcessing || amountToPay <= 0}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition-all cursor-pointer disabled:opacity-50"
            >
              {isProcessing ? (
                <span>Validation en cours...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Valider l'encaissement ({formatMoney(amountToPay)})</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  Shield,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  Calendar,
  Phone,
  MessageCircle,
  Clock,
  ArrowRight,
  Download,
  Users,
  Wallet,
  Sparkles,
  ChevronRight,
  Check,
  UserCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PaymentMethod, Client } from '../../types';

export const MemberPortal: React.FC = () => {
  const {
    clients,
    activeMemberId,
    setActiveMemberId,
    settings,
    formatMoney,
    recordMemberContributionPayment,
    transactions,
    accounts,
    showToast,
  } = useApp();

  // Selected member or fallback to first active member
  const currentMember: Client | undefined =
    clients.find((c) => c.id === activeMemberId) || clients[0];

  const [paymentAmount, setPaymentAmount] = useState<number>(
    currentMember?.monthlyContribution || settings.baseContribution || 50000
  );
  const [period, setPeriod] = useState<string>(
    new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('wave');
  const [memberPhone, setMemberPhone] = useState<string>(currentMember?.phone || '');
  const [reference, setReference] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastReceipt, setLastReceipt] = useState<{
    id: string;
    amount: number;
    date: string;
    period: string;
    method: PaymentMethod;
  } | null>(null);

  if (!currentMember) {
    return (
      <div className="p-8 text-center bg-slate-850 border border-slate-750 rounded-2xl">
        <Users className="w-12 h-12 text-slate-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-200">Aucun membre sélectionné</h3>
        <p className="text-xs text-slate-400 mt-1">
          Veuillez sélectionner un compte membre pour accéder à votre espace personnalisé.
        </p>
      </div>
    );
  }

  const isUpToDate = (currentMember.outstandingBalance || 0) <= 0;
  const monthlyContribution =
    currentMember.monthlyContribution || settings.baseContribution || 50000;
  const rawStatus = (currentMember as any).memberStatus || currentMember.status || 'active';
  const isRadié = rawStatus === 'radiated' || rawStatus === 'inactive';

  // Member's contribution transactions
  const memberTransactions = transactions
    .filter(
      (t) =>
        t.category === 'Cotisation' ||
        t.description.toLowerCase().includes(currentMember.name.toLowerCase())
    )
    .slice(0, 10);

  const handlePayContribution = (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentAmount <= 0) {
      showToast?.('Veuillez saisir un montant supérieur à 0.', 'warning');
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      // Find cash account to deposit
      const targetAccountId =
        accounts.find((a) => a.type === 'mobile_money' || a.name.toLowerCase().includes('wave'))
          ?.id || accounts[0]?.id || 'acc-1';

      const generatedRef =
        reference.trim() || `COT-${Date.now().toString().slice(-6)}`;

      recordMemberContributionPayment({
        memberId: currentMember.id,
        amount: paymentAmount,
        paymentMethod,
        period,
        reference: generatedRef,
        accountId: targetAccountId,
        notes: `Cotisation en ligne versée par le membre ${currentMember.name}`,
      });

      setLastReceipt({
        id: generatedRef,
        amount: paymentAmount,
        date: new Date().toLocaleDateString('fr-FR'),
        period,
        method: paymentMethod,
      });

      setIsProcessing(false);
      showToast?.(
        `Paiement de ${formatMoney(paymentAmount)} enregistré avec succès ! Votre situation est mise à jour.`,
        'success'
      );
    }, 800);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Banner with Member Identity & Role */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-emerald-500/30 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div
              className={`w-14 h-14 rounded-2xl ${
                currentMember.avatarColor || 'bg-emerald-600'
              } text-white font-black text-xl flex items-center justify-center shadow-lg shrink-0`}
            >
              {currentMember.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {currentMember.name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Espace Membre
                </span>
                {isRadié && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    Compte Inactif / Radié
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 mt-1 flex items-center gap-2">
                <span>Association : <strong>{settings.name}</strong></span>
                <span>•</span>
                <span>Tél : {currentMember.phone}</span>
              </p>
            </div>
          </div>

          {/* Member Selector (for previewing other members) */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Changer de membre :</span>
            <select
              value={currentMember.id}
              onChange={(e) => setActiveMemberId(e.target.value)}
              className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({(c.outstandingBalance || 0) <= 0 ? 'À jour' : 'Arriéré'})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Contribution Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Status indicator card */}
        <div
          className={`p-5 rounded-2xl border flex flex-col justify-between ${
            isUpToDate
              ? 'bg-emerald-950/20 border-emerald-500/40'
              : 'bg-rose-950/20 border-rose-500/40'
          }`}
        >
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Statut de Cotisation
            </span>
            {isUpToDate ? (
              <span className="inline-flex items-center gap-1 text-xs font-black px-2.5 py-1 rounded-lg uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                À Jour
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-black px-2.5 py-1 rounded-lg uppercase bg-rose-500/20 text-rose-300 border border-rose-500/40">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                En Retard
              </span>
            )}
          </div>

          <div className="my-3">
            <div className="text-2xl font-black font-mono text-slate-100">
              {isUpToDate ? '0 FCFA' : formatMoney(currentMember.outstandingBalance)}
            </div>
            <p className="text-xs mt-1 text-slate-300">
              {isUpToDate
                ? 'Félicitations, vous êtes parfaitement en règle avec la trésorerie de l’association.'
                : 'Montant total restant dû à régulariser pour vos cotisations mensuelles.'}
            </p>
          </div>

          <div className="text-[11px] text-slate-400 font-medium">
            Cotisation mensuelle : <strong className="text-slate-200">{formatMoney(monthlyContribution)} / mois</strong>
          </div>
        </div>

        {/* Total Cotisé card */}
        <div className="p-5 rounded-2xl bg-slate-850 border border-slate-750 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
            <span>Cumul Versé à ce jour</span>
            <Receipt className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="my-3">
            <div className="text-2xl font-black font-mono text-emerald-300">
              {formatMoney(currentMember.contributionTotal ?? currentMember.totalBilled)}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Ensemble de vos participations financières enregistrées dans le registre de l'association.
            </p>
          </div>
          <div className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
            <Check className="w-3.5 h-3.5" /> Reçus officiels délivrés
          </div>
        </div>

        {/* Tontine & Association info */}
        <div className="p-5 rounded-2xl bg-slate-850 border border-slate-750 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
            <span>Prochaine Échéance</span>
            <Calendar className="w-4 h-4 text-amber-400" />
          </div>
          <div className="my-3">
            <div className="text-xl font-black text-slate-100">
              5 de chaque mois
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Date limite de versement avant application des rappels statutaires.
            </p>
          </div>
          <div className="text-[11px] text-amber-400 font-medium flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Période active : {period}
          </div>
        </div>
      </div>

      {/* Main Grid: Direct Online Payment & History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Payment Form (8 cols) */}
        <div className="lg:col-span-7 bg-slate-850 border border-slate-750 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-750">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100">
                  Payer ma Cotisation en Ligne
                </h3>
                <p className="text-xs text-slate-400">
                  Règlement sécurisé instantané avec quittance automatique
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Sans frais
            </span>
          </div>

          <form onSubmit={handlePayContribution} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Montant à verser (FCFA) *
              </label>
              <div className="grid grid-cols-3 gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => setPaymentAmount(monthlyContribution)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                    paymentAmount === monthlyContribution
                      ? 'bg-emerald-600 text-white border-emerald-500 shadow'
                      : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-600'
                  }`}
                >
                  1 Mois ({formatMoney(monthlyContribution)})
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentAmount(monthlyContribution * 2)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                    paymentAmount === monthlyContribution * 2
                      ? 'bg-emerald-600 text-white border-emerald-500 shadow'
                      : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-600'
                  }`}
                >
                  2 Mois ({formatMoney(monthlyContribution * 2)})
                </button>
                {currentMember.outstandingBalance > 0 && (
                  <button
                    type="button"
                    onClick={() => setPaymentAmount(currentMember.outstandingBalance)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                      paymentAmount === currentMember.outstandingBalance
                        ? 'bg-rose-600 text-white border-rose-500 shadow'
                        : 'bg-rose-950/30 text-rose-300 border-rose-800 hover:border-rose-700'
                    }`}
                  >
                    Tout Solde ({formatMoney(currentMember.outstandingBalance)})
                  </button>
                )}
              </div>
              <input
                type="number"
                min="1000"
                step="500"
                value={paymentAmount || ''}
                onChange={(e) => setPaymentAmount(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm font-mono font-bold text-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Mois / Période de cotisation
              </label>
              <input
                type="text"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                placeholder="Ex: Mars 2026"
                className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Moyen de Paiement *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'wave', label: 'Wave', color: 'border-sky-500/40 bg-sky-500/10 text-sky-300' },
                  { id: 'orange_money', label: 'Orange Money', color: 'border-orange-500/40 bg-orange-500/10 text-orange-300' },
                  { id: 'mtn_momo', label: 'MTN MoMo', color: 'border-yellow-500/40 bg-yellow-500/10 text-yellow-300' },
                  { id: 'cash', label: 'Espèces (Bureau)', color: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300' },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id as PaymentMethod)}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer ${
                      paymentMethod === m.id
                        ? `${m.color} ring-2 ring-emerald-400 font-extrabold shadow-md`
                        : 'bg-slate-900 border-slate-750 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Numéro Mobile Money expéditeur
                </label>
                <input
                  type="tel"
                  value={memberPhone}
                  onChange={(e) => setMemberPhone(e.target.value)}
                  placeholder="07 89 02 82 07"
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Référence de transaction (facultatif)
                </label>
                <input
                  type="text"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="Ex: TXN-WAVE-8921"
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center justify-between">
              <div>
                <span className="font-semibold block">Total à débiter :</span>
                <span className="font-mono text-sm font-black">{formatMoney(paymentAmount)}</span>
              </div>
              <div className="text-right text-[11px] text-slate-400">
                Compte destinataire : <strong className="text-slate-200">Trésorerie {settings.name}</strong>
              </div>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isProcessing ? (
                <span>Validation en cours...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirmer le paiement de {formatMoney(paymentAmount)}</span>
                </>
              )}
            </button>
          </form>

          {/* Last receipt banner */}
          {lastReceipt && (
            <div className="mt-4 p-4 rounded-xl bg-emerald-900/20 border border-emerald-500/40 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-emerald-300 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Quittance N° {lastReceipt.id} émise avec succès !</span>
                </div>
                <button
                  onClick={() => window.print()}
                  className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-emerald-500"
                >
                  <Download className="w-3 h-3" />
                  <span>Imprimer le reçu</span>
                </button>
              </div>
              <div className="mt-1 text-[11px] text-slate-300">
                Montant : {formatMoney(lastReceipt.amount)} • Période : {lastReceipt.period} • Date : {lastReceipt.date}
              </div>
            </div>
          )}
        </div>

        {/* Association Bureau Contact & Guidelines (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Bureau Contacts */}
          <div className="bg-slate-850 border border-slate-750 rounded-2xl p-5 shadow-lg">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Contacts du Bureau Exécutif</span>
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-750 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-200">Trésorerie Générale</div>
                  <div className="text-[11px] text-slate-400">{settings.phone}</div>
                </div>
                <a
                  href={`https://wa.me/${settings.waveNumber?.replace(/[^0-9]/g, '') || settings.phone?.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 bg-emerald-500/20 text-emerald-300 rounded-lg hover:bg-emerald-500/30 transition-colors"
                  title="Contacter le trésorier par WhatsApp"
                >
                  <MessageCircle className="w-4 h-4" />
                </a>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-750 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-200">Numéro Wave Officiel</div>
                  <div className="text-[11px] font-mono font-bold text-sky-400">
                    {settings.waveNumber || settings.phone}
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30 font-bold">
                  Wave Direct
                </span>
              </div>
            </div>
          </div>

          {/* Recent Payments History */}
          <div className="bg-slate-850 border border-slate-750 rounded-2xl p-5 shadow-lg">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
              <span>Mes Derniers Règlements</span>
              <Receipt className="w-4 h-4 text-slate-500" />
            </h3>

            {memberTransactions.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">
                Aucun versement enregistré pour l'instant.
              </p>
            ) : (
              <div className="space-y-2">
                {memberTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-slate-200">{tx.description}</div>
                      <div className="text-[10px] text-slate-400">{tx.date} • {tx.paymentMethod}</div>
                    </div>
                    <div className="text-right font-mono font-bold text-emerald-400">
                      +{formatMoney(tx.amount)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

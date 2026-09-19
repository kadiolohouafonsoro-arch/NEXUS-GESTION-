import React, { useState } from 'react';
import {
  ShieldCheck,
  Calendar,
  CreditCard,
  Smartphone,
  CheckCircle2,
  Clock,
  Sparkles,
  Download,
  Printer,
  ChevronRight,
  X,
  AlertCircle,
  Building2,
  Receipt,
  FileCheck,
  Check,
  Zap,
  Code2,
  Phone,
  Mail,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PaymentMethod, SubscriptionPaymentRecord } from '../../types';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose }) => {
  const { currentTenant, renewTenantSubscription, formatMoney } = useApp();

  const subscription = currentTenant?.subscription;
  const [selectedMonths, setSelectedMonths] = useState<number>(1);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('wave');
  const [phoneNumber, setPhoneNumber] = useState('07 00 12 34 56');
  const [customRef, setCustomRef] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [viewingReceipt, setViewingReceipt] = useState<SubscriptionPaymentRecord | null>(null);

  if (!isOpen || !currentTenant) return null;

  const calculateTotal = (months: number) => {
    if (months === 12) return 50000; // 2 months free!
    return 5000 * months;
  };

  const totalAmount = calculateTotal(selectedMonths);

  const handleRenew = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      const generatedRef =
        customRef.trim() ||
        `${paymentMethod.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;

      renewTenantSubscription(currentTenant.id, selectedMonths, paymentMethod, generatedRef);
      setIsProcessing(false);
      setCustomRef('');
    }, 900);
  };

  const isExpired = subscription
    ? new Date(subscription.currentPeriodEnd) < new Date()
    : false;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-emerald-500/40 rounded-3xl shadow-2xl shadow-emerald-950/40 overflow-hidden my-8">
        
        {/* Modal Top Banner with Green Identity */}
        <div className="relative bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 p-6 border-b border-emerald-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/20">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-emerald-400">
                  <ShieldCheck className="w-6 h-6" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Abonnement SaaS Plateforme
                  </span>
                  <span className="text-xs font-semibold text-slate-300">
                    5 000 FCFA / mois
                  </span>
                </div>
                <h2 className="text-xl font-black text-white tracking-tight mt-0.5">
                  Gestion de l'Accès SaaS • {currentTenant.name}
                </h2>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Current Status Pill */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 bg-slate-950/60 p-3.5 rounded-2xl border border-emerald-500/20">
            <div className="flex items-center gap-2.5">
              <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse ring-4 ring-emerald-500/20" />
              <div>
                <div className="text-[11px] font-bold text-slate-400">Statut de l'association</div>
                <div className="text-xs font-extrabold text-emerald-300">
                  {isExpired ? 'Renouvellement Requis' : 'Abonnement Actif & Conforme'}
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-[11px] font-bold text-slate-400">Validité jusqu'au</div>
              <div className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                <span>
                  {subscription?.currentPeriodEnd
                    ? new Date(subscription.currentPeriodEnd).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })
                    : 'Non configuré'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Plan inclusions callout */}
          <div className="p-4 bg-emerald-950/30 rounded-2xl border border-emerald-500/20 space-y-2">
            <div className="text-xs font-extrabold text-emerald-300 flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400" />
              <span>Tout inclus dans votre forfait SaaS (5 000 FCFA / mois) :</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Gestion illimitée des membres & adhérents</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Multi-caisses : Wave, OM, MoMo & Banque</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Émission de quittances & factures certifiées</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Calendrier tontines, pénalités & Synthèse IA</span>
              </div>
            </div>
          </div>

          {/* Form to renew */}
          <form onSubmit={handleRenew} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-2">
                1. Choisissez la durée de réabonnement :
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { months: 1, label: '1 Mois', price: 5000, tag: 'Standard' },
                  { months: 3, label: '3 Mois', price: 15000, tag: 'Populaire' },
                  { months: 6, label: '6 Mois', price: 30000, tag: 'Sérénité' },
                  { months: 12, label: '1 An (12m)', price: 50000, tag: '2 mois offerts' },
                ].map((plan) => {
                  const isSelected = selectedMonths === plan.months;
                  return (
                    <button
                      key={plan.months}
                      type="button"
                      onClick={() => setSelectedMonths(plan.months)}
                      className={`relative p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-950/60 border-emerald-500 shadow-md shadow-emerald-500/20'
                          : 'bg-slate-850 border-slate-750 hover:border-slate-650'
                      }`}
                    >
                      {plan.tag && (
                        <span
                          className={`absolute top-2 right-2 text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider ${
                            plan.months === 12
                              ? 'bg-emerald-500 text-slate-950'
                              : isSelected
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-slate-700 text-slate-300'
                          }`}
                        >
                          {plan.tag}
                        </span>
                      )}
                      <div className="text-xs font-black text-white">{plan.label}</div>
                      <div className="text-sm font-black text-emerald-400 mt-1 font-mono">
                        {new Intl.NumberFormat('fr-FR').format(plan.price)} F
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {plan.months === 12 ? '4 166 F/mois' : '5 000 F/mois'}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Payment method selection */}
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-2">
                2. Mode de règlement pour cette association :
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  {
                    id: 'wave' as PaymentMethod,
                    name: 'Wave Mobile',
                    desc: 'Instantané (0% frais)',
                    color: 'border-sky-500 bg-sky-950/30 text-sky-300',
                  },
                  {
                    id: 'orange_money' as PaymentMethod,
                    name: 'Orange Money',
                    desc: '*144# ou Marchand',
                    color: 'border-amber-500 bg-amber-950/30 text-amber-300',
                  },
                  {
                    id: 'mtn_momo' as PaymentMethod,
                    name: 'MTN MoMo',
                    desc: '*133# Mobile Money',
                    color: 'border-yellow-500 bg-yellow-950/30 text-yellow-300',
                  },
                  {
                    id: 'card' as PaymentMethod,
                    name: 'Carte Bancaire',
                    desc: 'Visa / Mastercard',
                    color: 'border-indigo-500 bg-indigo-950/30 text-indigo-300',
                  },
                ].map((m) => {
                  const isSelected = paymentMethod === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-950/50 shadow-sm shadow-emerald-500/20 ring-1 ring-emerald-500'
                          : 'bg-slate-850 border-slate-750 hover:border-slate-700'
                      }`}
                    >
                      <div className="text-xs font-bold text-white flex items-center justify-between">
                        <span>{m.name}</span>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1">{m.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Input Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Numéro de débit / Mobile du trésorier
                </label>
                <div className="relative">
                  <Smartphone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+225 07..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Référence du paiement (optionnel)
                </label>
                <input
                  type="text"
                  value={customRef}
                  onChange={(e) => setCustomRef(e.target.value)}
                  placeholder="Ex: WAVE-CI-9941"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>
            </div>

            {/* Total summary & Action */}
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-[11px] text-slate-400">Total à régler pour {selectedMonths} mois :</div>
                <div className="text-xl font-black text-emerald-400 font-mono">
                  {new Intl.NumberFormat('fr-FR').format(totalAmount)} FCFA
                </div>
                <div className="text-[10px] text-slate-500">
                  Tarif garanti de 5 000 FCFA / mois sans engagement
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-black transition-all shadow-lg shadow-emerald-600/30 disabled:opacity-50 cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Traitement en cours...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Activer / Renouveler l'accès</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Developer Assistance & Direct Support */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-900 to-emerald-950/40 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Code2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] font-extrabold text-white flex items-center gap-2">
                  <span>Assistance Développeur & Validation</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                    Direct
                  </span>
                </div>
                <div className="text-[11px] text-slate-300">
                  Développé par <strong className="text-white">Soro Kadiolohouafon Brice De Mont-Fort</strong>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <a
                href="tel:0789028207"
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white border border-slate-700 text-xs font-semibold transition-colors"
                title="Appeler le 07 89 02 82 07"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-mono text-xs">07 89 02 82 07</span>
              </a>
              <a
                href="mailto:kadiolohouafonsoro@gmail.com?subject=Nexus%20Gestion%20-%20Abonnement%20SaaS"
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 hover:text-white border border-emerald-500/40 text-xs font-semibold transition-colors"
                title="Email : kadiolohouafonsoro@gmail.com"
              >
                <Mail className="w-3.5 h-3.5 text-emerald-400" />
                <span>kadiolohouafonsoro@gmail.com</span>
              </a>
            </div>
          </div>

          {/* Payment History & Invoices */}
          <div className="pt-4 border-t border-slate-800">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-emerald-400" />
              <span>Historique des Quittances SaaS de la structure</span>
            </h3>

            {subscription?.paymentHistory && subscription.paymentHistory.length > 0 ? (
              <div className="space-y-2">
                {subscription.paymentHistory.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-3 bg-slate-850 rounded-xl border border-slate-750 flex items-center justify-between text-xs hover:border-slate-650 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                        <FileCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-white font-mono">{rec.invoiceNumber}</div>
                        <div className="text-[11px] text-slate-400">
                          {rec.date} • {rec.paymentMethod.toUpperCase()} • Réf: {rec.reference}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-black text-emerald-400 font-mono">
                          {new Intl.NumberFormat('fr-FR').format(rec.amount)} FCFA
                        </div>
                        <div className="text-[10px] text-slate-400">{rec.months} mois réglé(s)</div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setViewingReceipt(rec)}
                        className="p-1.5 text-slate-400 hover:text-emerald-300 hover:bg-emerald-950/40 rounded-lg transition-colors cursor-pointer"
                        title="Voir la quittance"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-slate-500 text-xs bg-slate-850/50 rounded-xl border border-slate-800">
                Aucun historique de paiement pour l'instant.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Receipt Preview Submodal */}
      {viewingReceipt && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-white text-slate-900 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-black">
                  N
                </div>
                <div>
                  <div className="text-sm font-black text-slate-900 tracking-tight">NEXUS GESTION SAAS</div>
                  <div className="text-[10px] text-slate-500">Quittance d'Abonnement Plateforme</div>
                </div>
              </div>
              <button
                onClick={() => setViewingReceipt(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Association cliente :</span>
                <span className="font-bold text-slate-900">{currentTenant.name} ({currentTenant.acronym})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">N° Quittance :</span>
                <span className="font-mono font-bold text-slate-900">{viewingReceipt.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date du règlement :</span>
                <span className="font-mono">{viewingReceipt.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Mode & Référence :</span>
                <span className="font-mono font-bold text-emerald-700">{viewingReceipt.paymentMethod.toUpperCase()} • {viewingReceipt.reference}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Période couverte :</span>
                <span>{viewingReceipt.months} mois ({viewingReceipt.months * 5000} FCFA tarif de base)</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                <span className="text-sm font-bold text-slate-800">Montant Net Réglé :</span>
                <span className="text-base font-black text-emerald-600 font-mono">
                  {new Intl.NumberFormat('fr-FR').format(viewingReceipt.amount)} FCFA
                </span>
              </div>
            </div>

            <div className="text-center text-[11px] text-slate-400 italic">
              Cette quittance certifie l'activation du droit d'usage de la plateforme SaaS Nexus Gestion pour l'association {currentTenant.name}.
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimer la quittance</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

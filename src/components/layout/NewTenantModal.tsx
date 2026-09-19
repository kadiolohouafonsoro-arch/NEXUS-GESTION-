import React, { useState } from 'react';
import {
  X,
  Building2,
  Plus,
  ShieldCheck,
  Check,
  Sparkles,
  Zap,
  CreditCard,
  Smartphone,
  Info,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PaymentMethod } from '../../types';

interface NewTenantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewTenantModal: React.FC<NewTenantModalProps> = ({ isOpen, onClose }) => {
  const { addTenant, showToast } = useApp();

  const [name, setName] = useState('');
  const [acronym, setAcronym] = useState('');
  const [type, setType] = useState<'association' | 'tontine' | 'mutuelle'>('mutuelle');
  const [currency, setCurrency] = useState<'XOF' | 'EUR' | 'USD'>('XOF');
  const [baseContribution, setBaseContribution] = useState(50000);
  const [meetingFrequency, setMeetingFrequency] = useState<'weekly' | 'biweekly' | 'monthly' | 'quarterly'>('monthly');
  const [meetingDay, setMeetingDay] = useState('Chaque 1er dimanche du mois');
  const [latePenaltyAmount, setLatePenaltyAmount] = useState(2500);
  const [latePenaltyGraceDays, setLatePenaltyGraceDays] = useState(3);
  const [absencePenaltyAmount, setAbsencePenaltyAmount] = useState(5000);
  const [description, setDescription] = useState('');

  // SaaS Subscription Choice
  const [signupPlan, setSignupPlan] = useState<'pay_now' | 'trial'>('pay_now');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('wave');
  const [paymentPhone, setPaymentPhone] = useState('07 00 12 34 56');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const colors = [
      'from-emerald-500 to-teal-700',
      'from-teal-500 to-emerald-700',
      'from-green-500 to-emerald-800',
      'from-emerald-600 to-cyan-750',
    ];
    const chosenColor = colors[Math.floor(Math.random() * colors.length)];

    const created = addTenant({
      name: name.trim(),
      acronym: acronym.trim() || name.substring(0, 3).toUpperCase(),
      type,
      currency,
      color: chosenColor,
      description: description.trim() || `Espace ${type} de ${name.trim()}`,
      baseContribution: Number(baseContribution),
      meetingFrequency,
      meetingDay,
      latePenaltyAmount: Number(latePenaltyAmount),
      latePenaltyGraceDays: Number(latePenaltyGraceDays),
      absencePenaltyAmount: Number(absencePenaltyAmount),
    });

    showToast(
      `Espace "${created.name}" créé avec succès ! Abonnement SaaS activé (5 000 FCFA/mois).`,
      'success'
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-xl bg-slate-900 border border-emerald-500/40 rounded-3xl shadow-2xl p-5 sm:p-6 text-slate-100 my-6">
        
        {/* Modal Header with Emerald identity */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white tracking-tight">
                Nouvel Espace Association / Tontine
              </h3>
              <p className="text-xs text-slate-400">
                Inscription sur la plateforme SaaS • Espace multi-tenant étanche
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Highlight Banner: 5 000 FRS PAR MOIS */}
        <div className="mb-5 p-3.5 bg-gradient-to-r from-emerald-950/70 via-teal-950/60 to-slate-900 border border-emerald-500/35 rounded-2xl">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-white">
                    Tarif SaaS Nexus : <span className="text-emerald-400 font-mono">5 000 FCFA / mois</span>
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Actif
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                  L'adhésion de votre association donne accès à la gestion illimitée des membres, le suivi des cotisations, les multi-caisses (Wave, OM, MoMo, Banque) et l'IA d'analyse.
                </p>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nom & Sigle */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nom de l'organisation <span className="text-emerald-400">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Mutuelle Fraternité Abidjan"
                required
                className="w-full px-3 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Sigle / Acronyme</label>
              <input
                type="text"
                value={acronym}
                onChange={(e) => setAcronym(e.target.value)}
                placeholder="Ex: MFA"
                className="w-full px-3 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-xs text-slate-100 uppercase placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>
          </div>

          {/* Type d'organisation */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Type de structure</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'mutuelle', label: 'Mutuelle', desc: 'Entraide & Secours' },
                { id: 'tontine', label: 'Tontine', desc: 'Épargne rotative' },
                { id: 'association', label: 'Association', desc: 'Communauté & Projets' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setType(item.id as any)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    type === item.id
                      ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-600/20'
                      : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white'
                  }`}
                >
                  <div className="font-bold text-xs">{item.label}</div>
                  <div className={`text-[10px] mt-0.5 ${type === item.id ? 'text-emerald-100' : 'text-slate-400'}`}>
                    {item.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Cotisation de base & Devise */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Cotisation de base par membre
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={baseContribution}
                  onChange={(e) => setBaseContribution(Number(e.target.value))}
                  min={1000}
                  step={1000}
                  required
                  className="w-full px-3 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-xs text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">
                  {currency === 'XOF' ? 'FCFA' : currency}
                </span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Devise</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="XOF">XOF (FCFA)</option>
                <option value="EUR">EUR (€)</option>
                <option value="USD">USD ($)</option>
              </select>
            </div>
          </div>

          {/* Périodicité des réunions */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Périodicité des réunions</label>
              <select
                value={meetingFrequency}
                onChange={(e) => setMeetingFrequency(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="weekly">Hebdomadaire (Chaque semaine)</option>
                <option value="biweekly">Bimensuelle (Toutes les 2 sem.)</option>
                <option value="monthly">Mensuelle (Chaque mois)</option>
                <option value="quarterly">Trimestrielle</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Jour habituel de réunion</label>
              <input
                type="text"
                value={meetingDay}
                onChange={(e) => setMeetingDay(e.target.value)}
                placeholder="Ex: 1er dimanche du mois"
                className="w-full px-3 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Formule d'activation SaaS */}
          <div className="bg-slate-850 p-3.5 rounded-2xl border border-emerald-500/30 space-y-3">
            <div className="text-xs font-bold text-emerald-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Modalité d'Activation SaaS (5 000 FCFA / mois)</span>
              </span>
              <span className="text-[10px] text-slate-400">Sans engagement</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSignupPlan('pay_now')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  signupPlan === 'pay_now'
                    ? 'border-emerald-500 bg-emerald-950/60 ring-1 ring-emerald-500'
                    : 'border-slate-750 bg-slate-900/60'
                }`}
              >
                <div className="text-xs font-bold text-white flex items-center justify-between">
                  <span>Régler le 1er mois</span>
                  {signupPlan === 'pay_now' && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
                <div className="text-sm font-black text-emerald-400 font-mono mt-0.5">5 000 FCFA</div>
                <div className="text-[10px] text-slate-400 mt-1">Activation immédiate 30 jours</div>
              </button>

              <button
                type="button"
                onClick={() => setSignupPlan('trial')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  signupPlan === 'trial'
                    ? 'border-emerald-500 bg-emerald-950/60 ring-1 ring-emerald-500'
                    : 'border-slate-750 bg-slate-900/60'
                }`}
              >
                <div className="text-xs font-bold text-white flex items-center justify-between">
                  <span>Essai gratuit 14 jours</span>
                  {signupPlan === 'trial' && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
                <div className="text-sm font-black text-slate-300 font-mono mt-0.5">0 FCFA</div>
                <div className="text-[10px] text-slate-400 mt-1">Puis 5 000 FCFA / mois</div>
              </button>
            </div>

            {signupPlan === 'pay_now' && (
              <div className="pt-2 border-t border-slate-750 space-y-2">
                <div className="text-[11px] font-semibold text-slate-300">
                  Mode de règlement privilégié :
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {[
                    { id: 'wave' as PaymentMethod, label: 'Wave Mobile' },
                    { id: 'orange_money' as PaymentMethod, label: 'Orange Money' },
                    { id: 'mtn_momo' as PaymentMethod, label: 'MTN MoMo' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setSelectedMethod(m.id)}
                      className={`px-2 py-1.5 rounded-lg border text-center font-bold text-[11px] transition-colors cursor-pointer ${
                        selectedMethod === m.id
                          ? 'border-emerald-500 bg-emerald-900/40 text-emerald-300'
                          : 'border-slate-700 bg-slate-800 text-slate-400'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Description / But de la mutuelle
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Fonds d'entraide, investissements, cotisations solidaires..."
              className="w-full px-3 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-black transition-all shadow-lg shadow-emerald-600/25 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Inscrire & Activer l'Espace (5 000 F/mois)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

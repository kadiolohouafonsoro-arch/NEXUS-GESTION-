import React, { useState, useEffect } from 'react';
import {
  Settings,
  Building2,
  Coins,
  ShieldAlert,
  Save,
  CheckCircle2,
  Smartphone,
  CreditCard,
  Download,
  RotateCcw,
  Calendar,
  AlertTriangle,
  Users,
  ShieldCheck,
  Receipt,
  ExternalLink,
  Check,
  Zap,
  Code2,
  Phone,
  Mail,
  MessageCircle,
  Lock,
  RefreshCw,
  KeyRound,
  History,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const SettingsView: React.FC = () => {
  const {
    settings,
    updateSettings,
    invoices,
    clients,
    projects,
    accounts,
    transactions,
    tenants,
    currentTenantId,
    updateTenant,
    formatMoney,
    openSubscriptionModal,
    openSecurityModal,
    openUpdateModal,
    lockApp,
    securityConfig,
    softwareUpdateState,
  } = useApp();

  const currentTenant = tenants.find((t) => t.id === currentTenantId);

  const [formData, setFormData] = useState({
    ...settings,
    baseContribution: currentTenant?.baseContribution ?? settings.baseContribution ?? 25000,
    meetingFrequency: currentTenant?.meetingFrequency ?? settings.meetingFrequency ?? 'monthly',
    meetingDay: settings.meetingDay ?? '1er Dimanche du mois',
    latePenaltyAmount: currentTenant?.latePenaltyAmount ?? settings.latePenaltyAmount ?? 2000,
    latePenaltyGraceDays: settings.latePenaltyGraceDays ?? 5,
    absencePenaltyAmount: settings.absencePenaltyAmount ?? 1000,
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      ...settings,
      baseContribution: currentTenant?.baseContribution ?? prev.baseContribution,
      meetingFrequency: currentTenant?.meetingFrequency ?? prev.meetingFrequency,
      latePenaltyAmount: currentTenant?.latePenaltyAmount ?? prev.latePenaltyAmount,
    }));
  }, [currentTenantId, currentTenant]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
    if (currentTenant) {
      updateTenant({
        ...currentTenant,
        name: formData.name,
        baseContribution: Number(formData.baseContribution),
        meetingFrequency: formData.meetingFrequency,
        latePenaltyAmount: Number(formData.latePenaltyAmount),
      });
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleExportData = () => {
    const backup = {
      settings,
      invoices,
      clients,
      projects,
      accounts,
      transactions,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexus_gestion_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleResetData = () => {
    if (confirm('Attention : Voulez-vous restaurer les données de démonstration initiales ?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const subscription = currentTenant?.subscription;
  const isSubscriptionActive = subscription?.status === 'active';

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header with Emerald accent */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight flex items-center gap-2.5">
          <Settings className="w-7 h-7 text-emerald-400" />
          <span>Paramètres & Configuration</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Gérez l'identité de votre association, l'abonnement SaaS (5 000 FCFA/mois) et les règles statutaires
        </p>
      </div>

      {/* SaaS Subscription Card (5 000 FCFA / mois) */}
      <div className="bg-gradient-to-br from-emerald-950/70 via-slate-900 to-slate-900 border border-emerald-500/40 rounded-3xl p-5 sm:p-6 shadow-xl shadow-emerald-950/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-emerald-500/20">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/10 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-black text-white">
                  Abonnement SaaS de la Plateforme
                </h2>
                <span
                  className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                    isSubscriptionActive
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  }`}
                >
                  {isSubscriptionActive ? '● Actif' : '● Expiré'}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Espace dédié : <span className="font-bold text-white">{currentTenant?.name}</span>
              </p>
            </div>
          </div>

          <div className="flex sm:flex-col items-baseline sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800">
            <div className="text-2xl font-black text-emerald-400 font-mono tracking-tight">
              5 000 <span className="text-xs text-slate-400 font-normal">FCFA / mois</span>
            </div>
            <div className="text-[11px] text-slate-400">
              {subscription?.currentPeriodEnd
                ? `Valide jusqu'au ${new Date(subscription.currentPeriodEnd).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}`
                : 'Période active'}
            </div>
          </div>
        </div>

        {/* Benefits list */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 py-4 text-xs">
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-850/80 border border-emerald-500/20 text-slate-200">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Membres & Cotisations illimités</span>
          </div>
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-850/80 border border-emerald-500/20 text-slate-200">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Trésorerie multi-comptes (Wave, OM, MoMo)</span>
          </div>
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-850/80 border border-emerald-500/20 text-slate-200">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Rappels SMS/WhatsApp & Reçus automatiques</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-emerald-500/20">
          <div className="text-xs text-slate-400 text-center sm:text-left">
            Dernier règlement : <strong className="text-slate-200 font-mono">5 000 FCFA</strong> (Réf:{' '}
            <span className="font-mono text-emerald-400">
              {subscription?.paymentHistory?.[0]?.transactionRef || 'SUB-INIT-2025'}
            </span>
            )
          </div>

          <button
            type="button"
            onClick={openSubscriptionModal}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-black transition-all shadow-lg shadow-emerald-600/25 cursor-pointer"
          >
            <Receipt className="w-4 h-4" />
            <span>Gérer & Renouveler l'abonnement (5 000 F)</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Organization Identity Card */}
        <div className="bg-slate-850 border border-slate-750 rounded-2xl p-6 shadow-lg shadow-black/10 space-y-4">
          <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
            <Building2 className="w-4 h-4 text-emerald-400" />
            <span>Identité de l'Association / Tontine</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nom officiel de l'association / tontine
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Type de structure
              </label>
              <select
                value={formData.organizationType}
                onChange={(e) =>
                  setFormData({ ...formData, organizationType: e.target.value as any })
                }
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="association">Association / Mutuelle / Tontine</option>
                <option value="freelance">Freelance / Consultant Indépendant</option>
                <option value="agency">Agence / PME de Services</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Numéro d'agrément / RCCM / Récépissé
              </label>
              <input
                type="text"
                value={formData.registrationNumber}
                onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                placeholder="Ex: N° 1245/PA/SG/D1"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Email officiel du secrétariat
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Téléphone & Contact Mobile Money
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+225 07 00 00 00 00"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Siège / Lieu habituel des réunions
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Ex: Cocody Angré 8ème Tranche, Abidjan"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Association & Tontine Rules Card */}
        <div className="bg-slate-850 border border-slate-750 rounded-2xl p-6 shadow-lg shadow-black/10 space-y-4">
          <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
            <Coins className="w-4 h-4 text-emerald-400" />
            <span>Règles Financières & Cotisations</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Cotisation de base par membre
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={formData.baseContribution}
                  onChange={(e) =>
                    setFormData({ ...formData, baseContribution: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">
                  {formData.currency === 'XOF' ? 'FCFA' : formData.currency}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Périodicité des cotisations
              </label>
              <select
                value={formData.meetingFrequency}
                onChange={(e) =>
                  setFormData({ ...formData, meetingFrequency: e.target.value as any })
                }
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="weekly">Hebdomadaire (Par semaine)</option>
                <option value="biweekly">Bimensuelle (Toutes les 2 sem.)</option>
                <option value="monthly">Mensuelle (Chaque mois)</option>
                <option value="quarterly">Trimestrielle</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Jour habituel de réunion
              </label>
              <input
                type="text"
                value={formData.meetingDay}
                onChange={(e) => setFormData({ ...formData, meetingDay: e.target.value })}
                placeholder="Ex: 1er Dimanche du mois"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-800">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Pénalité de retard de cotisation
              </label>
              <input
                type="number"
                value={formData.latePenaltyAmount}
                onChange={(e) =>
                  setFormData({ ...formData, latePenaltyAmount: Number(e.target.value) })
                }
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Délai de grâce (Jours après échéance)
              </label>
              <input
                type="number"
                value={formData.latePenaltyGraceDays}
                onChange={(e) =>
                  setFormData({ ...formData, latePenaltyGraceDays: Number(e.target.value) })
                }
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Amende absence non justifiée
              </label>
              <input
                type="number"
                value={formData.absencePenaltyAmount}
                onChange={(e) =>
                  setFormData({ ...formData, absencePenaltyAmount: Number(e.target.value) })
                }
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Mobile Money & Bank Settings */}
        <div className="bg-slate-850 border border-slate-750 rounded-2xl p-6 shadow-lg shadow-black/10 space-y-4">
          <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <span>Coordonnées de Réception des Cotisations</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Compte Mobile Money principal (Wave / OM / MoMo)
              </label>
              <input
                type="text"
                value={formData.mobileMoneyNumber}
                onChange={(e) => setFormData({ ...formData, mobileMoneyNumber: e.target.value })}
                placeholder="+225 07 00 12 34 56"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Titulaire du compte Mobile Money
              </label>
              <input
                type="text"
                value={formData.mobileMoneyName}
                onChange={(e) => setFormData({ ...formData, mobileMoneyName: e.target.value })}
                placeholder="Ex: Trésorière Générale - Awa Coulibaly"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                RIB / IBAN Bancaire de l'Association
              </label>
              <input
                type="text"
                value={formData.bankAccount}
                onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
                placeholder="CI092 01001 012345678901 23 (SGCI / NSIA / Ecobank)"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Save Bar with Emerald Styling */}
        <div className="flex items-center justify-between pt-2">
          <div>
            {savedSuccess && (
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 animate-bounce">
                <CheckCircle2 className="w-4 h-4" />
                Paramètres enregistrés avec succès !
              </span>
            )}
          </div>

          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black transition-all shadow-lg shadow-emerald-600/25 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Enregistrer les modifications</span>
          </button>
        </div>
      </form>

      {/* Developer & Technical Support Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-emerald-950/40 border border-emerald-500/40 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0 shadow-md">
              <Code2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Développeur & Support Éditeur
                </span>
                <span className="text-[11px] text-slate-400">Plateforme Nexus Gestion</span>
              </div>
              <h3 className="text-base font-black text-white tracking-tight mt-0.5">
                Soro Kadiolohouafon Brice De Mont-Fort
              </h3>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-semibold bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Support Actif & Disponible
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Pour toute demande d'assistance technique, personnalisation de votre espace association, intégration de passerelle de paiement spécifique ou activation de licence SaaS (5 000 FCFA/mois), contactez directement le développeur :
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <a
            href="tel:0789028207"
            className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-emerald-500/50 text-slate-200 hover:text-white transition-all group cursor-pointer"
          >
            <div className="p-2 rounded-lg bg-emerald-500/15 text-emerald-400 group-hover:bg-emerald-500/25">
              <Phone className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Téléphone direct</div>
              <div className="text-xs font-mono font-bold text-emerald-300 truncate">07 89 02 82 07</div>
            </div>
          </a>

          <a
            href="https://wa.me/2250789028207?text=Bonjour%20M.%20Soro%2C%20je%20vous%20contacte%20concernant%20l%27application%20Nexus%20Gestion"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-emerald-500/50 text-slate-200 hover:text-white transition-all group cursor-pointer"
          >
            <div className="p-2 rounded-lg bg-emerald-500/15 text-emerald-400 group-hover:bg-emerald-500/25">
              <MessageCircle className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">WhatsApp Direct</div>
              <div className="text-xs font-bold text-emerald-300 truncate">+225 07 89 02 82 07</div>
            </div>
          </a>

          <a
            href="mailto:kadiolohouafonsoro@gmail.com?subject=Nexus%20Gestion%20-%20Assistance%20%2F%20Contact"
            className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-emerald-500/50 text-slate-200 hover:text-white transition-all group cursor-pointer"
          >
            <div className="p-2 rounded-lg bg-emerald-500/15 text-emerald-400 group-hover:bg-emerald-500/25">
              <Mail className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">E-mail Officiel</div>
              <div className="text-xs font-mono font-bold text-emerald-300 truncate">kadiolohouafonsoro@gmail.com</div>
            </div>
          </a>
        </div>
      </div>

      {/* Centre de Sécurité & Mises à Jour */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">
                Sécurité du Logiciel & Gestion des Mises à Jour
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Protégez l'accès avec code PIN administrateur, session d'inactivité et appliquez les correctifs ou nouvelles versions de Nexus Gestion.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700 px-2.5 py-1 rounded-xl">
              Version : {softwareUpdateState.currentVersion}
            </span>
            {softwareUpdateState.availableUpdate && (
              <span className="text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full">
                MàJ disponible
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={openSecurityModal}
            className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-amber-500/50 text-left transition-all cursor-pointer group"
          >
            <div className="p-2 rounded-lg bg-amber-500/15 text-amber-400 group-hover:bg-amber-500/25">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Code PIN & Sécurité</div>
              <div className="text-[11px] text-slate-400">Modifier le PIN et délai d'inactivité</div>
            </div>
          </button>

          <button
            type="button"
            onClick={openUpdateModal}
            className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-emerald-500/50 text-left transition-all cursor-pointer group"
          >
            <div className="p-2 rounded-lg bg-emerald-500/15 text-emerald-400 group-hover:bg-emerald-500/25">
              <RefreshCw className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Centre de Mises à Jour</div>
              <div className="text-[11px] text-slate-400">Vérifier et installer les correctifs</div>
            </div>
          </button>

          <button
            type="button"
            onClick={lockApp}
            className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-rose-500/50 text-left transition-all cursor-pointer group"
          >
            <div className="p-2 rounded-lg bg-rose-500/15 text-rose-400 group-hover:bg-rose-500/25">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Verrouiller Maintenant</div>
              <div className="text-[11px] text-slate-400">Exiger le code PIN administrateur</div>
            </div>
          </button>
        </div>
      </div>

      {/* Backup & Reset utilities */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Sécurité & Données de l'Application
        </h3>
        <p className="text-xs text-slate-400">
          Toutes les données (factures, cotisations, membres, projets, caisses) sont automatiquement persistées dans
          votre navigateur. Vous pouvez exporter une sauvegarde JSON à tout moment.
        </p>
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleExportData}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Télécharger une sauvegarde JSON</span>
          </button>
          <button
            type="button"
            onClick={handleResetData}
            className="flex items-center gap-1.5 px-4 py-2 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40 rounded-xl text-xs font-semibold cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Réinitialiser les données de démo</span>
          </button>
        </div>
      </div>
    </div>
  );
};

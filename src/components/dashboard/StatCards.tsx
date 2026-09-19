import React from 'react';
import {
  TrendingUp,
  Clock,
  Users2,
  Wallet,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Coins,
  Building2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const StatCards: React.FC = () => {
  const { clients, accounts, transactions, tours, settings, formatMoney, setActiveTab } = useApp();

  // 1. Synthèse financière globale
  const totalCash = accounts.reduce((sum, a) => sum + a.balance, 0);
  const totalContributions = transactions
    .filter((t) => t.type === 'income' && t.category === 'contribution')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalPayouts = transactions
    .filter((t) => t.type === 'expense' && t.category === 'tontine_payout')
    .reduce((sum, t) => sum + t.amount, 0);

  // 2. Nombre de membres actifs
  const totalMembers = clients.length;
  const activeMembers = clients.filter(
    (c) => c.status === 'active' || (c as any).memberStatus === 'active'
  ).length;
  const radiatedMembers = clients.filter(
    (c) => c.status === 'radiated' || (c as any).memberStatus === 'radiated'
  ).length;

  // 3. Alertes sur les cotisations & pénalités
  const overdueMembers = clients.filter(
    (c) => (c.status === 'active' || (c as any).memberStatus === 'active') && (c.outstandingBalance || 0) > 0
  );
  const totalOverdueAmount = overdueMembers.reduce((sum, c) => sum + (c.outstandingBalance || 0), 0);

  // 4. Prochain Tour / Permanence
  const nextTour = tours.find((t) => t.status === 'scheduled' || t.status === 'collected');

  const stats = [
    {
      id: 'finance',
      title: 'Synthèse Financière Globale',
      value: formatMoney(totalCash),
      subtitle: `${formatMoney(totalContributions)} cotisés • ${formatMoney(totalPayouts)} décaissements`,
      icon: TrendingUp,
      iconColor: 'text-emerald-400',
      iconBg: 'bg-emerald-500/10 border-emerald-500/20',
      trend: `${accounts.length} caisses actives`,
      trendPositive: true,
      onClick: () => setActiveTab('treasury'),
    },
    {
      id: 'members',
      title: 'Membres Actifs',
      value: `${activeMembers} Actifs`,
      subtitle: `${totalMembers} adhérents inscrits${radiatedMembers > 0 ? ` (${radiatedMembers} radié)` : ''}`,
      icon: Users2,
      iconColor: 'text-indigo-400',
      iconBg: 'bg-indigo-500/10 border-indigo-500/20',
      trend: `${Math.round((activeMembers / (totalMembers || 1)) * 100)}% d'assiduité`,
      trendPositive: true,
      onClick: () => setActiveTab('clients'),
    },
    {
      id: 'cash_boxes',
      title: 'État Global des Caisses',
      value: formatMoney(totalCash),
      subtitle: `Wave, Orange Money, Banque & Espèces`,
      icon: Wallet,
      iconColor: 'text-sky-400',
      iconBg: 'bg-sky-500/10 border-sky-500/20',
      trend: 'Trésorerie saine',
      trendPositive: true,
      onClick: () => setActiveTab('treasury'),
    },
    {
      id: 'alerts',
      title: 'Alertes Cotisations & Retards',
      value: overdueMembers.length > 0 ? `${overdueMembers.length} en retard` : 'Aucun retard',
      subtitle: overdueMembers.length > 0
        ? `Arriérés : ${formatMoney(totalOverdueAmount)}`
        : nextTour
        ? `Prochain tour : ${nextTour.beneficiaryName}`
        : 'Toutes cotisations à jour',
      icon: overdueMembers.length > 0 ? AlertTriangle : CheckCircle2,
      iconColor: overdueMembers.length > 0 ? 'text-rose-400' : 'text-teal-400',
      iconBg: overdueMembers.length > 0 ? 'bg-rose-500/10 border-rose-500/20' : 'bg-teal-500/10 border-teal-500/20',
      alert: overdueMembers.length > 0,
      trend: overdueMembers.length > 0 ? 'Pénalités applicables' : 'À jour',
      trendPositive: overdueMembers.length === 0,
      onClick: () => setActiveTab(overdueMembers.length > 0 ? 'clients' : 'tours'),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Alert Banner if overdue members exist */}
      {overdueMembers.length > 0 && (
        <div className="bg-gradient-to-r from-rose-950/40 via-slate-850 to-amber-950/30 border border-rose-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 shrink-0 animate-pulse">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-rose-300 uppercase tracking-wide">
                Alerte Cotisations en Souffrance ({overdueMembers.length} membre{overdueMembers.length > 1 ? 's' : ''})
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {overdueMembers.map((m) => m.name).join(', ')} — Total dû :{' '}
                <span className="font-bold text-white">{formatMoney(totalOverdueAmount)}</span> (incluant pénalités de{' '}
                {formatMoney(settings.latePenaltyAmount)} par adhérent).
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('clients')}
            className="px-3 py-1.5 bg-rose-600/30 hover:bg-rose-600 text-rose-200 hover:text-white rounded-xl text-xs font-bold border border-rose-500/40 transition-all shrink-0 cursor-pointer"
          >
            Voir les adhérents en retard
          </button>
        </div>
      )}

      {/* Grid of Key Indicator Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.id}
              onClick={stat.onClick}
              className="group relative bg-slate-850 hover:bg-slate-800/90 border border-slate-750 hover:border-slate-700 rounded-2xl p-5 shadow-lg shadow-black/10 transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-slate-400 tracking-wide">
                    {stat.title}
                  </span>
                  <div className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight">
                    {stat.value}
                  </div>
                </div>
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center border ${stat.iconBg} shrink-0 transition-transform group-hover:scale-105`}
                >
                  <Icon className={`w-5 h-5 ${stat.iconColor}`} />
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400 truncate max-w-[170px]">{stat.subtitle}</span>
                <span
                  className={`font-semibold flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[11px] ${
                    stat.alert
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold'
                      : stat.trendPositive
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/20'
                      : 'bg-slate-750 text-slate-400'
                  }`}
                >
                  {stat.alert ? (
                    <AlertTriangle className="w-3 h-3" />
                  ) : (
                    <ArrowUpRight className="w-3 h-3" />
                  )}
                  {stat.trend}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

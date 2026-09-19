import React, { useState } from 'react';
import {
  Users,
  Plus,
  UserPlus,
  Search,
  Building,
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  Edit2,
  Trash2,
  LayoutGrid,
  List,
  ArrowUpRight,
  TrendingUp,
  Download,
  Check,
  ShieldCheck,
  BadgeCheck,
  UserX,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  CreditCard,
  Clock,
  Send,
} from 'lucide-react';
import { Client, BureauRole, MemberStatus } from '../../types';
import { useApp } from '../../context/AppContext';
import { exportClientsToCSV } from '../../utils/csvExport';
import { RecordContributionModal } from './RecordContributionModal';

interface ClientListProps {
  onOpenCreateModal: () => void;
  onSelectClient: (client: Client) => void;
  onEditClient: (client: Client) => void;
}

export const ClientList: React.FC<ClientListProps> = ({
  onOpenCreateModal,
  onSelectClient,
  onEditClient,
}) => {
  const { clients, deleteClient, formatMoney, settings, showToast } = useApp();
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'up_to_date' | 'late' | 'bureau' | 'active' | 'radiated'>('all');
  const [isExported, setIsExported] = useState(false);
  const [payingMember, setPayingMember] = useState<Client | null>(null);

  const getRoleBadge = (role?: BureauRole) => {
    switch (role) {
      case 'president':
        return { label: 'Président(e)', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
      case 'vice_president':
        return { label: 'Vice-Président(e)', bg: 'bg-amber-500/15 text-amber-300 border-amber-500/25' };
      case 'secretary_general':
        return { label: 'Secrétaire Général(e)', bg: 'bg-blue-500/20 text-blue-300 border-blue-500/30' };
      case 'deputy_secretary':
        return { label: 'Secrétaire Adjoint(e)', bg: 'bg-blue-500/15 text-blue-300 border-blue-500/25' };
      case 'treasurer':
        return { label: 'Trésorier(e) Général(e)', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
      case 'auditor':
        return { label: 'Commissaire aux Comptes', bg: 'bg-purple-500/20 text-purple-300 border-purple-500/30' };
      case 'organizer':
        return { label: 'Responsable Organisation', bg: 'bg-pink-500/20 text-pink-300 border-pink-500/30' };
      default:
        return { label: 'Adhérent', bg: 'bg-slate-700/50 text-slate-300 border-slate-600/40' };
    }
  };

  const isMemberUpToDate = (client: Client) => {
    return (client.outstandingBalance || 0) <= 0;
  };

  const filtered = clients.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c as any).firstName?.toLowerCase().includes(search.toLowerCase()) ||
      (c as any).lastName?.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      c.email.toLowerCase().includes(search.toLowerCase());

    const rawStatus = (c as any).memberStatus || c.status || 'active';
    const isActif = rawStatus === 'active';
    const isRadié = rawStatus === 'radiated' || rawStatus === 'inactive';
    const isBureau = (c as any).bureauRole && (c as any).bureauRole !== 'member';
    const upToDate = isMemberUpToDate(c);

    if (statusFilter === 'up_to_date') return matchSearch && upToDate && !isRadié;
    if (statusFilter === 'late') return matchSearch && !upToDate && !isRadié;
    if (statusFilter === 'active') return matchSearch && isActif;
    if (statusFilter === 'radiated') return matchSearch && isRadié;
    if (statusFilter === 'bureau') return matchSearch && isBureau;
    return matchSearch;
  });

  const handleExportCSV = () => {
    const listToExport = filtered.length > 0 ? filtered : clients;
    if (listToExport.length === 0) {
      showToast?.('Aucun adhérent à exporter.', 'info');
      return;
    }
    exportClientsToCSV(listToExport);
    setIsExported(true);
    showToast?.(`${listToExport.length} adhérent(s) exporté(s) en CSV !`, 'success');
    setTimeout(() => setIsExported(false), 2500);
  };

  const activeMembers = clients.filter((c) => (c as any).memberStatus === 'active' || c.status === 'active');
  const upToDateCount = activeMembers.filter(isMemberUpToDate).length;
  const lateCount = activeMembers.filter((c) => !isMemberUpToDate(c)).length;
  const radiatedCount = clients.filter((c) => (c as any).memberStatus === 'radiated' || c.status === 'inactive').length;
  const bureauCount = clients.filter((c) => (c as any).bureauRole && (c as any).bureauRole !== 'member').length;
  const totalContributions = clients.reduce((sum, c) => sum + (c.contributionTotal || c.totalBilled || 0), 0);
  const totalArrears = clients.reduce((sum, c) => sum + (c.outstandingBalance || 0), 0);
  const upToDateRate = activeMembers.length > 0 ? Math.round((upToDateCount / activeMembers.length) * 100) : 100;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-[11px] font-extrabold uppercase rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Module Membres & Cotisations
            </span>
            <span className="text-xs text-slate-400">
              Cotisation statutaire : <strong className="text-emerald-400">{formatMoney(settings.baseContribution || 50000)} / mois</strong>
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight flex items-center gap-2.5 mt-1">
            <Users className="w-7 h-7 text-emerald-400" />
            <span>Registre des Membres & Statut des Cotisations</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Suivez en temps réel chaque adhérent, ses versements cumulés et s'il est rigoureusement à jour ou en retard.
          </p>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap sm:flex-nowrap">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-850 p-1 rounded-xl border border-slate-750">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'grid' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Vue Fiches Cotisations"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'table' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Vue Tableau / Grand Livre"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Export CSV Button */}
          <button
            onClick={handleExportCSV}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border shadow-sm cursor-pointer ${
              isExported
                ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/40'
                : 'bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white border-slate-700/80 hover:border-slate-600'
            }`}
            title="Exporter l'état des cotisations au format CSV"
          >
            {isExported ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Exporté !</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline">Export CSV</span>
                <span className="sm:hidden">CSV</span>
              </>
            )}
          </button>

          <button
            onClick={onOpenCreateModal}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-600/25 cursor-pointer shrink-0 active:scale-95"
            title="Inscrire un nouvel adhérent"
          >
            <UserPlus className="w-4 h-4" />
            <span>Ajouter un Membre</span>
          </button>
        </div>
      </div>

      {/* Mini Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-slate-850 border border-slate-750">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span>Total Cotisé</span>
            <Receipt className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-lg sm:text-xl font-black text-emerald-300 font-mono mt-1">
            {formatMoney(totalContributions)}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">{clients.length} adhérents inscrits</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-850 border border-emerald-500/30">
          <div className="flex items-center justify-between text-xs font-semibold text-emerald-400">
            <span>Membres À Jour</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-lg sm:text-xl font-black text-emerald-300 mt-1 flex items-baseline gap-2">
            <span>{upToDateCount} membres</span>
            <span className="text-xs font-bold text-emerald-400">({upToDateRate}%)</span>
          </div>
          <div className="text-[11px] text-emerald-400/80 mt-0.5">En règle pour ce mois</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-850 border border-rose-500/30">
          <div className="flex items-center justify-between text-xs font-semibold text-rose-400">
            <span>En Retard / Impayés</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-lg sm:text-xl font-black text-rose-300 mt-1 flex items-baseline gap-2">
            <span>{lateCount} adhérents</span>
          </div>
          <div className="text-[11px] text-rose-400/80 font-mono mt-0.5">
            Arriérés : {formatMoney(totalArrears)}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-850 border border-slate-750">
          <div className="flex items-center justify-between text-xs font-semibold text-amber-400">
            <span>Bureau & Gouvernance</span>
            <ShieldCheck className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-lg sm:text-xl font-black text-amber-300 mt-1">
            {bureauCount} responsables
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">{radiatedCount} radié(s) / suspendu(s)</div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-slate-850 border border-slate-750 rounded-2xl p-4 shadow-lg shadow-black/10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Status Filter tabs */}
        <div className="flex items-center gap-1.5 text-xs overflow-x-auto pb-1 md:pb-0">
          {[
            { id: 'all', label: `Tous (${clients.length})` },
            { id: 'up_to_date', label: `🟢 À Jour (${upToDateCount})` },
            { id: 'late', label: `🔴 En Retard (${lateCount})` },
            { id: 'bureau', label: `Bureau (${bureauCount})` },
            { id: 'active', label: `Actifs (${activeMembers.length})` },
            { id: 'radiated', label: `Radiés (${radiatedCount})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative min-w-[260px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher membre, contact, téléphone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Empty State */}
      {filtered.length === 0 && (
        <div className="bg-slate-850/80 border border-slate-750 rounded-2xl p-10 text-center flex flex-col items-center justify-center space-y-4 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
            <UserPlus className="w-8 h-8" />
          </div>
          <div className="max-w-md">
            <h3 className="text-base font-bold text-slate-100">
              {search ? 'Aucun membre ne correspond à votre recherche' : 'Aucun membre enregistré'}
            </h3>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              {search
                ? `Aucun adhérent ne correspond aux termes "${search}". Essayez de modifier vos filtres ou d'ajouter un nouveau membre.`
                : 'Commencez par inscrire les membres adhérents de votre association pour piloter les cotisations statutaires, la tontine et les responsabilités.'}
            </p>
          </div>
          <button
            onClick={onOpenCreateModal}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-600/25 cursor-pointer active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            <span>Ajouter un Membre maintenant</span>
          </button>
        </div>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c) => {
            const cleanPhone = c.phone.replace(/[^0-9]/g, '');
            const rawStatus = (c as any).memberStatus || c.status || 'active';
            const isRadié = rawStatus === 'radiated' || rawStatus === 'inactive';
            const roleInfo = getRoleBadge((c as any).bureauRole);
            const isUpToDate = isMemberUpToDate(c);
            const monthlyContribution = c.monthlyContribution || settings.baseContribution || 50000;
            const estimatedMonthsLate =
              c.outstandingBalance > 0 ? Math.ceil(c.outstandingBalance / monthlyContribution) : 0;

            const whatsappMessage = encodeURIComponent(
              `Bonjour ${c.name}, nous vous contactons depuis l'association "${settings.name}". Votre cotisation s'élève à ${formatMoney(monthlyContribution)}/mois. ${
                isUpToDate
                  ? 'Merci, votre situation de cotisation est parfaitement à jour !'
                  : `Votre solde d'arriéré s'élève actuellement à ${formatMoney(c.outstandingBalance)} (environ ${estimatedMonthsLate} mois). Merci de bien vouloir régulariser via Wave au ${settings.waveNumber || settings.phone}.`
              }`
            );

            return (
              <div
                key={c.id}
                onClick={() => onSelectClient(c)}
                className={`group relative bg-slate-850 hover:bg-slate-800/90 border rounded-2xl p-5 shadow-lg shadow-black/10 transition-all cursor-pointer flex flex-col justify-between ${
                  isRadié
                    ? 'border-slate-800 opacity-60'
                    : isUpToDate
                    ? 'border-emerald-500/30 hover:border-emerald-500/50'
                    : 'border-rose-500/40 hover:border-rose-500/60 bg-rose-950/10'
                }`}
              >
                <div>
                  {/* Top card bar with avatar & clear status badges */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-11 h-11 rounded-2xl ${c.avatarColor || 'bg-emerald-600'} text-white font-black text-sm flex items-center justify-center shadow-md shrink-0`}
                      >
                        {c.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-sm font-bold text-slate-100 group-hover:text-emerald-300 transition-colors truncate">
                            {c.name}
                          </h3>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${roleInfo.bg}`}>
                            {roleInfo.label}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Prominent Contribution Status Badge */}
                    <div className="shrink-0 text-right">
                      {isRadié ? (
                        <span className="text-[10px] font-extrabold px-2 py-1 rounded-lg uppercase bg-slate-800 text-slate-400 border border-slate-700">
                          Radié
                        </span>
                      ) : isUpToDate ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-1 rounded-lg uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-500/20">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>À Jour</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-1 rounded-lg uppercase bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm shadow-rose-500/20">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                          <span>En Retard ({estimatedMonthsLate} m)</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Financial & Contribution Overview Container */}
                  <div className="my-3 p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        Cotisation mensuelle
                      </span>
                      <span className="font-bold text-slate-200 font-mono">
                        {formatMoney(monthlyContribution)} / mois
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Receipt className="w-3 h-3 text-emerald-400" />
                        Cumul cotisé
                      </span>
                      <span className="font-extrabold text-emerald-400 font-mono">
                        {formatMoney(c.contributionTotal ?? c.totalBilled)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1.5 border-t border-slate-800/80">
                      <span className="text-slate-400">Arriérés / Solde dû</span>
                      <span
                        className={`font-black font-mono text-sm ${
                          isUpToDate ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {isUpToDate ? '0 FCFA (Réglo)' : formatMoney(c.outstandingBalance)}
                      </span>
                    </div>

                    {c.lastContributionDate && (
                      <div className="text-[10px] text-slate-500 pt-0.5">
                        Dernier versement : {c.lastContributionDate} {c.lastContributionPeriod ? `(${c.lastContributionPeriod})` : ''}
                      </div>
                    )}
                  </div>

                  {/* Contact info snippet */}
                  <div className="space-y-1 text-xs text-slate-300 mb-3 px-1">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="font-mono text-xs">{c.phone}</span>
                    </div>
                    {c.address && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="truncate text-[11px] text-slate-400">{c.address}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Direct Action Bar */}
                <div
                  className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Quick Collect Contribution Button */}
                  <button
                    onClick={() => setPayingMember(c)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-extrabold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                    title="Encaisser la cotisation de ce membre"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Encaisser Cotisation</span>
                  </button>

                  <div className="flex items-center gap-1">
                    {cleanPhone && (
                      <a
                        href={`https://wa.me/${cleanPhone}?text=${whatsappMessage}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 text-emerald-400 hover:text-white rounded-xl bg-emerald-950/40 hover:bg-emerald-600 border border-emerald-500/30 transition-all"
                        title="Relancer sur WhatsApp avec solde"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                      </a>
                    )}

                    <button
                      onClick={() => onEditClient(c)}
                      className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-750 transition-colors cursor-pointer"
                      title="Modifier la fiche adhérent"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`Supprimer définitivement l'adhérent ${c.name} ?`)) {
                          deleteClient(c.id);
                        }
                      }}
                      className="p-2 text-slate-500 hover:text-rose-400 rounded-xl hover:bg-slate-750 transition-colors cursor-pointer"
                      title="Supprimer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && filtered.length > 0 && (
        <div className="bg-slate-850 border border-slate-750 rounded-2xl shadow-lg shadow-black/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-750 bg-slate-900/80 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Adhérent</th>
                  <th className="py-3.5 px-4">Rôle Bureau</th>
                  <th className="py-3.5 px-4">Statut Cotisation</th>
                  <th className="py-3.5 px-4">Cotisation Mensuelle</th>
                  <th className="py-3.5 px-4 text-right">Total Versé</th>
                  <th className="py-3.5 px-4 text-right">Arriéré Dû</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4 text-right">Action Rapide</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filtered.map((c) => {
                  const rawStatus = (c as any).memberStatus || c.status || 'active';
                  const isRadié = rawStatus === 'radiated' || rawStatus === 'inactive';
                  const roleInfo = getRoleBadge((c as any).bureauRole);
                  const isUpToDate = isMemberUpToDate(c);
                  const monthlyContribution = c.monthlyContribution || settings.baseContribution || 50000;

                  return (
                    <tr
                      key={c.id}
                      onClick={() => onSelectClient(c)}
                      className="hover:bg-slate-800/60 transition-colors cursor-pointer"
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-100">{c.name}</div>
                        <div className="text-[11px] text-slate-400">{c.city || 'Abidjan'}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${roleInfo.bg}`}>
                          {roleInfo.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {isRadié ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700">
                            Radié
                          </span>
                        ) : isUpToDate ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            À Jour
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/40">
                            <AlertTriangle className="w-3 h-3 text-rose-400" />
                            En Retard
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-300">
                        {formatMoney(monthlyContribution)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-400">
                        {formatMoney(c.contributionTotal ?? c.totalBilled)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold">
                        <span className={isUpToDate ? 'text-emerald-400' : 'text-rose-400'}>
                          {isUpToDate ? '0 FCFA' : formatMoney(c.outstandingBalance)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-300">{c.phone}</td>
                      <td
                        className="py-3.5 px-4 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setPayingMember(c)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
                            title="Encaisser cotisation"
                          >
                            Encaisser
                          </button>
                          <button
                            onClick={() => onEditClient(c)}
                            className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800"
                            title="Modifier"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Record Contribution Modal */}
      {payingMember && (
        <RecordContributionModal
          member={payingMember}
          onClose={() => setPayingMember(null)}
        />
      )}
    </div>
  );
};


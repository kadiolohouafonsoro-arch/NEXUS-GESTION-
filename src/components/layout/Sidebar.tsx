import React from 'react';
import {
  LayoutDashboard,
  FileText,
  FolderKanban,
  Users,
  UserPlus,
  Plus,
  Wallet,
  CalendarDays,
  Settings,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  Keyboard,
  Sparkles,
  Receipt,
  Code2,
  Phone,
  Mail,
  Coins,
  CreditCard,
  UserCheck,
  Lock,
  Eye,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TenantSwitcher } from './TenantSwitcher';

interface SidebarProps {
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
  onOpenNewInvoice?: () => void;
  onOpenNewClient?: () => void;
  onOpenShortcutsHelp?: () => void;
  onOpenNewTenantModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  mobileOpen = false,
  setMobileOpen,
  onOpenNewInvoice,
  onOpenNewClient,
  onOpenShortcutsHelp,
  onOpenNewTenantModal,
}) => {
  const {
    activeTab,
    setActiveTab,
    invoices,
    projects,
    clients,
    accounts,
    formatMoney,
    settings,
    currentTenant,
    openSubscriptionModal,
    userRole,
    setUserRole,
    activeMemberId,
    setActiveMemberId,
  } = useApp();

  const pendingInvoicesCount = invoices.filter((i) => i.status === 'pending' || i.status === 'overdue').length;
  const activeProjectsCount = projects.filter((p) => p.status === 'in_progress' || p.status === 'review').length;
  const totalBalance = accounts.reduce((acc, a) => acc + a.balance, 0);

  // Admin items (Global oversight)
  const adminNavItems = [
    {
      id: 'dashboard',
      label: 'Tableau de bord',
      icon: LayoutDashboard,
      badge: null,
      shortcut: 'Alt+1',
      color: 'text-emerald-400',
    },
    {
      id: 'invoices',
      label: 'Factures & Cotisations',
      icon: FileText,
      badge: pendingInvoicesCount > 0 ? pendingInvoicesCount : null,
      badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
      shortcut: 'Alt+2',
      color: 'text-emerald-400',
    },
    {
      id: 'projects',
      label: 'Projets & Activités',
      icon: FolderKanban,
      badge: activeProjectsCount > 0 ? activeProjectsCount : null,
      badgeColor: 'bg-teal-500/20 text-teal-300 border border-teal-500/30',
      shortcut: 'Alt+3',
      color: 'text-teal-400',
    },
    {
      id: 'tours',
      label: 'Calendrier des Tours',
      icon: CalendarDays,
      badge: settings.organizationType === 'association' ? 'Tontine' : 'Jalons',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
      shortcut: 'Alt+4',
      color: 'text-emerald-400',
    },
    {
      id: 'clients',
      label: settings.organizationType === 'association' ? 'Membres & Cotisations' : 'Clients & CRM',
      icon: Users,
      badge: clients.length,
      badgeColor: 'bg-slate-800 text-slate-400 border border-slate-700',
      shortcut: 'Alt+5',
      color: 'text-emerald-400',
    },
    {
      id: 'distribution',
      label: 'Répartition des Recettes',
      icon: Coins,
      badge: 'Actionnaires & Paie',
      badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
      shortcut: 'Alt+6',
      color: 'text-amber-400',
    },
    {
      id: 'treasury',
      label: 'Trésorerie & Caisses',
      icon: Wallet,
      badge: null,
      shortcut: 'Alt+7',
      color: 'text-amber-400',
    },
    {
      id: 'settings',
      label: 'Paramètres & SaaS',
      icon: Settings,
      badge: null,
      shortcut: 'Alt+8',
      color: 'text-slate-400',
    },
  ];

  // Member items (Partial view restricted to personal member portal)
  const memberNavItems = [
    {
      id: 'member_portal',
      label: 'Mon Espace & Cotisations',
      icon: CreditCard,
      badge: 'Paiement Direct',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
      shortcut: 'Alt+1',
      color: 'text-emerald-400',
    },
    {
      id: 'tours',
      label: 'Calendrier des Tours',
      icon: CalendarDays,
      badge: null,
      shortcut: 'Alt+2',
      color: 'text-teal-400',
    },
    {
      id: 'projects',
      label: 'Activités & Projets',
      icon: FolderKanban,
      badge: null,
      shortcut: 'Alt+3',
      color: 'text-slate-400',
    },
    {
      id: 'clients',
      label: 'Annuaire des Membres',
      icon: Users,
      badge: null,
      shortcut: 'Alt+4',
      color: 'text-slate-400',
    },
  ];

  const currentNavItems = userRole === 'member' ? memberNavItems : adminNavItems;


  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header with Emerald Identity */}
        <div className="h-16 flex items-center gap-3 px-5 border-b border-slate-800 bg-slate-950/40">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-500/25">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-white">NEXUS</span>
              <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                SAAS
              </span>
            </div>
            <p className="text-[11px] text-emerald-400/80 font-medium truncate max-w-[150px]">
              Associations & Tontines
            </p>
          </div>
        </div>

        {/* Multi-Tenant Association Selector */}
        <div className="px-3 pt-3 pb-2 border-b border-slate-800/80">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 px-1 flex items-center justify-between">
            <span>Espace Actif</span>
            <span className="text-[9px] text-emerald-400 font-bold">5 000 F/m</span>
          </div>
          <TenantSwitcher variant="sidebar" onOpenNewTenantModal={onOpenNewTenantModal || (() => {})} />
        </div>

        {/* Security & Role Access Toggle: Admin (Full) vs Member (Partial) */}
        <div className="px-3 py-2 border-b border-slate-800/80 bg-slate-950/40">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 px-1 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              Niveau d'accès
            </span>
            <span
              className={`text-[9px] font-black px-1.5 py-0.2 rounded uppercase ${
                userRole === 'admin'
                  ? 'bg-amber-500/20 text-amber-300'
                  : 'bg-emerald-500/20 text-emerald-300'
              }`}
            >
              {userRole === 'admin' ? 'Super Admin' : 'Adhérent'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1 p-0.5 bg-slate-900 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => {
                setUserRole('admin');
                if (activeTab === 'member_portal') setActiveTab('dashboard');
              }}
              className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                userRole === 'admin'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Vue globale Bureau : Gestion complète de l'association, trésorerie, membres, recettes"
            >
              <ShieldCheck className="w-3 h-3" />
              <span>Admin (Bureau)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setUserRole('member');
                setActiveTab('member_portal');
              }}
              className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                userRole === 'member'
                  ? 'bg-emerald-600 text-white font-black shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Vue restreinte Adhérent : Paiement direct des cotisations, calendrier, statut"
            >
              <UserCheck className="w-3 h-3" />
              <span>Adhérent</span>
            </button>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>{userRole === 'member' ? 'Espace Adhérent' : 'Gestion Globale'}</span>
            {userRole === 'member' && (
              <span className="text-[10px] text-emerald-400 font-bold">Vue Restreinte</span>
            )}
          </div>

          {currentNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (setMobileOpen) setMobileOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group cursor-pointer ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25 font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
                title={`${item.label} (${item.shortcut})`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-white' : item.color
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  {item.id === 'clients' && onOpenNewClient && (
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenNewClient();
                        if (setMobileOpen) setMobileOpen(false);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.stopPropagation();
                          onOpenNewClient();
                          if (setMobileOpen) setMobileOpen(false);
                        }
                      }}
                      className={`p-1 rounded-md transition-all cursor-pointer ${
                        isActive
                          ? 'hover:bg-white/20 text-white'
                          : 'hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300'
                      }`}
                      title="Ajouter un nouveau membre"
                      aria-label="Ajouter un nouveau membre"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    </span>
                  )}
                  {item.badge !== null && (
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full font-semibold shrink-0 ${
                        isActive ? 'bg-white/20 text-white' : item.badgeColor
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  <kbd
                    className={`text-[9px] font-mono px-1 py-0.5 rounded transition-opacity ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-800 text-slate-400 border border-slate-700 opacity-60 group-hover:opacity-100'
                    }`}
                  >
                    {item.shortcut}
                  </kbd>
                </div>
              </button>
            );
          })}
        </div>

        {/* SaaS Subscription Card in Sidebar */}
        <div className="p-3 mx-3 mb-2 rounded-2xl bg-gradient-to-b from-emerald-950/40 to-slate-900 border border-emerald-500/30 shadow-inner space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-300 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Abonnement SaaS</span>
            </span>
            <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-extrabold px-1.5 py-0.5 rounded border border-emerald-500/30">
              5 000 F/mois
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-300">
              Statut : <span className="text-emerald-400 font-bold">Actif</span>
            </div>
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>

          <button
            type="button"
            onClick={openSubscriptionModal}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold text-emerald-300 hover:text-white bg-emerald-950/60 hover:bg-emerald-900/60 rounded-xl transition-colors border border-emerald-500/40 cursor-pointer shadow-sm"
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Gérer l'abonnement</span>
          </button>
        </div>

        {/* Bottom Financial Snapshot Widget */}
        <div className="p-3 m-3 mt-0 rounded-2xl bg-gradient-to-b from-slate-850 to-slate-900 border border-slate-750 shadow-inner space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              Trésorerie Disponible
            </span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-1.5 py-0.5 rounded">
              En direct
            </span>
          </div>
          <div className="text-base font-extrabold text-slate-100 tracking-tight">
            {formatMoney(totalBalance)}
          </div>
          <p className="text-[11px] text-slate-400">
            {accounts.length} caisses actives
          </p>

          <button
            onClick={() => {
              setActiveTab('treasury');
              if (setMobileOpen) setMobileOpen(false);
            }}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/40 rounded-lg transition-colors border border-emerald-500/20 cursor-pointer"
          >
            <span>Voir les caisses</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Developer Info Card */}
        <div className="mx-3 mb-3 p-3 rounded-2xl bg-slate-950/80 border border-emerald-500/30 shadow-md">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Code2 className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                Développeur
              </div>
              <div className="text-xs font-black text-slate-100 truncate" title="Soro Kadiolohouafon Brice De Mont-Fort">
                Soro K. Brice De Mont-Fort
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1.5 pt-1.5 border-t border-slate-850 text-[11px]">
            <a
              href="tel:0789028207"
              className="flex items-center justify-center gap-1 py-1 px-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-emerald-300 border border-slate-800 transition-colors"
              title="Appeler : 07 89 02 82 07"
            >
              <Phone className="w-3 h-3 text-emerald-400 shrink-0" />
              <span className="font-mono text-[10px] font-semibold truncate">07 89 02 82 07</span>
            </a>
            <a
              href="mailto:kadiolohouafonsoro@gmail.com"
              className="flex items-center justify-center gap-1 py-1 px-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-emerald-300 border border-slate-800 transition-colors"
              title="Email : kadiolohouafonsoro@gmail.com"
            >
              <Mail className="w-3 h-3 text-emerald-400 shrink-0" />
              <span className="text-[10px] font-semibold">Email</span>
            </a>
          </div>
        </div>

        {/* Footer info */}
        <div className="px-5 py-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between bg-slate-950/30">
          <span>Nexus SaaS • 5 000 F/m</span>
          <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            En ligne
          </span>
        </div>
      </aside>
    </>
  );
};

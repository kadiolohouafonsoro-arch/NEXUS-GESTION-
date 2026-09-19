import React, { useState } from 'react';
import {
  Bell,
  Search,
  Plus,
  FileText,
  FolderPlus,
  UserPlus,
  ArrowDownLeft,
  Building2,
  Users2,
  CheckCircle2,
  AlertTriangle,
  Info,
  X,
  Keyboard,
  Code2,
  Phone,
  Mail,
  MessageCircle,
  ShieldCheck,
  UserCheck,
  Lock,
  RefreshCw,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TenantSwitcher } from './TenantSwitcher';

interface NavbarProps {
  onOpenInvoiceModal?: () => void;
  onOpenClientModal?: () => void;
  onOpenProjectModal?: () => void;
  onOpenTransactionModal?: () => void;
  onOpenNewInvoice?: () => void;
  onOpenNewClient?: () => void;
  onOpenNewProject?: () => void;
  onSelectClient?: (clientId: string) => void;
  onSelectProject?: (projectId: string) => void;
  onSelectInvoice?: (invoiceId: string) => void;
  onOpenShortcutsHelp?: () => void;
  onOpenNewTenantModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenInvoiceModal,
  onOpenClientModal,
  onOpenProjectModal,
  onOpenTransactionModal,
  onOpenNewInvoice,
  onOpenNewClient,
  onOpenNewProject,
  onSelectClient,
  onSelectProject,
  onSelectInvoice,
  onOpenShortcutsHelp,
  onOpenNewTenantModal,
}) => {
  const triggerInvoiceModal = onOpenInvoiceModal || onOpenNewInvoice || (() => {});
  const triggerClientModal = onOpenClientModal || onOpenNewClient || (() => {});
  const triggerProjectModal = onOpenProjectModal || onOpenNewProject || (() => {});
  const triggerTransactionModal = onOpenTransactionModal || (() => {});
  const {
    settings,
    updateSettings,
    notifications,
    clients,
    projects,
    invoices,
    setActiveTab,
    currentTenant,
    openSubscriptionModal,
    userRole,
    setUserRole,
    activeMemberId,
    setActiveMemberId,
    lockApp,
    openSecurityModal,
    openUpdateModal,
    softwareUpdateState,
  } = useApp();
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showDevContact, setShowDevContact] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Search matches
  const filteredClients = searchQuery.trim()
    ? clients.filter((c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phone.includes(searchQuery)
      )
    : [];

  const filteredProjects = searchQuery.trim()
    ? projects.filter((p) =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.clientName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const filteredInvoices = searchQuery.trim()
    ? invoices.filter((i) =>
        i.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.clientName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const totalResults = filteredClients.length + filteredProjects.length + filteredInvoices.length;

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-6 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      {/* Search Input */}
      <div className="relative flex-1 max-w-md hidden sm:block">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            id="global-search-input"
            type="text"
            placeholder="Rechercher client, projet, facture... (Ctrl + K)"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearchResults(true);
            }}
            onFocus={() => setShowSearchResults(true)}
            className="w-full pl-10 pr-16 py-2 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/70 rounded-xl text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none hidden md:flex items-center gap-1">
              <kbd className="text-[10px] font-mono font-semibold bg-slate-900/90 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700/80 shadow-sm">
                Ctrl K
              </kbd>
            </div>
          )}
        </div>

        {/* Search Results Dropdown */}
        {showSearchResults && searchQuery.trim() && (
          <div className="absolute top-full mt-2 w-full bg-slate-900 border border-slate-750 rounded-xl shadow-2xl p-2 z-50 max-h-96 overflow-y-auto">
            {totalResults === 0 ? (
              <div className="p-4 text-center text-sm text-slate-400">Aucun résultat trouvé</div>
            ) : (
              <div className="space-y-3">
                {filteredClients.length > 0 && (
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-2 py-1">
                      Clients & Membres ({filteredClients.length})
                    </div>
                    {filteredClients.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => {
                          setActiveTab('clients');
                          if (onSelectClient) onSelectClient(c.id);
                          setShowSearchResults(false);
                          setSearchQuery('');
                        }}
                        className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-800 text-left transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${c.avatarColor}`} />
                          <span className="text-sm font-medium text-slate-200">{c.name}</span>
                        </div>
                        <span className="text-xs text-slate-400">{c.phone}</span>
                      </button>
                    ))}
                  </div>
                )}

                {filteredProjects.length > 0 && (
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-2 py-1">
                      Projets ({filteredProjects.length})
                    </div>
                    {filteredProjects.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          setActiveTab('projects');
                          if (onSelectProject) onSelectProject(p.id);
                          setShowSearchResults(false);
                          setSearchQuery('');
                        }}
                        className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-800 text-left transition-colors"
                      >
                        <div>
                          <div className="text-sm font-medium text-slate-200">{p.title}</div>
                          <div className="text-xs text-slate-400">{p.code} • {p.clientName}</div>
                        </div>
                        <span className="text-xs font-semibold text-indigo-400">{p.progress}%</span>
                      </button>
                    ))}
                  </div>
                )}

                {filteredInvoices.length > 0 && (
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-2 py-1">
                      Factures & Devis ({filteredInvoices.length})
                    </div>
                    {filteredInvoices.map((inv) => (
                      <button
                        key={inv.id}
                        onClick={() => {
                          setActiveTab('invoices');
                          if (onSelectInvoice) onSelectInvoice(inv.id);
                          setShowSearchResults(false);
                          setSearchQuery('');
                        }}
                        className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-800 text-left transition-colors"
                      >
                        <div>
                          <span className="text-sm font-medium text-slate-200">{inv.number}</span>
                          <span className="text-xs text-slate-400 ml-2">{inv.clientName}</span>
                        </div>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            inv.status === 'paid'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : inv.status === 'overdue'
                              ? 'bg-rose-500/20 text-rose-300'
                              : 'bg-amber-500/20 text-amber-300'
                          }`}
                        >
                          {inv.status}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3 ml-auto">
        {/* Multi-Tenant Association / Tontine Switcher */}
        <TenantSwitcher variant="navbar" onOpenNewTenantModal={onOpenNewTenantModal || (() => {})} />

        {/* Access Level / Security Role Pill (Admin vs Member) */}
        <button
          type="button"
          onClick={() => {
            const nextRole = userRole === 'admin' ? 'member' : 'admin';
            setUserRole(nextRole);
            if (nextRole === 'member') {
              setActiveTab('member_portal');
            } else {
              setActiveTab('dashboard');
            }
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer shadow-sm ${
            userRole === 'admin'
              ? 'bg-amber-500/15 hover:bg-amber-500/25 border-amber-500/40 text-amber-300'
              : 'bg-emerald-500/15 hover:bg-emerald-500/25 border-emerald-500/40 text-emerald-300'
          }`}
          title="Cliquez pour basculer entre la vue Administrateur (Globale) et la vue Espace Adhérent (Partielle)"
        >
          {userRole === 'admin' ? (
            <>
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Admin (Bureau)</span>
              <span className="text-[10px] uppercase font-black px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-200">
                Global
              </span>
            </>
          ) : (
            <>
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Espace Adhérent</span>
              <span className="text-[10px] uppercase font-black px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-200">
                Restreint
              </span>
            </>
          )}
        </button>

        {/* SaaS Subscription Status Pill (5 000 FCFA / mois) - Hidden in Member mode */}
        {userRole === 'admin' && (
          <button
            type="button"
            onClick={openSubscriptionModal}
            className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-emerald-950/70 hover:bg-emerald-900/80 border border-emerald-500/40 hover:border-emerald-400 text-emerald-300 rounded-xl transition-all cursor-pointer shadow-sm shadow-emerald-950/40 group"
            title="Gérer l'abonnement SaaS de l'association (5 000 FCFA / mois)"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ring-2 ring-emerald-500/20" />
            <span className="text-xs font-semibold text-slate-200">
              SaaS : <strong className="text-emerald-300 font-mono font-black">5 000 F/m</strong>
            </span>
          </button>
        )}

        {/* Quick Add Dropdown - Restricted to Admin only */}
        {userRole === 'admin' && (
          <div className="relative">
            <button
              onClick={() => setShowQuickAdd(!showQuickAdd)}
              className="flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-emerald-600/20 transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">Nouveau</span>
            </button>


          {showQuickAdd && (
            <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-750 rounded-xl shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
              <button
                onClick={() => {
                  setShowQuickAdd(false);
                  triggerClientModal();
                }}
                className="w-full flex items-center justify-between px-3 py-2 text-sm text-slate-200 hover:bg-emerald-950/40 rounded-lg transition-colors cursor-pointer group border border-transparent hover:border-emerald-500/30"
              >
                <div className="flex items-center gap-2.5">
                  <UserPlus className="w-4 h-4 text-emerald-400" />
                  <span className="font-semibold text-emerald-300">Ajouter un Membre</span>
                </div>
                <kbd className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-950/80 text-emerald-400 border border-slate-750 group-hover:border-emerald-500/40">
                  Alt+C
                </kbd>
              </button>
              <div className="border-t border-slate-800 my-1" />
              <button
                onClick={() => {
                  setShowQuickAdd(false);
                  triggerInvoiceModal();
                }}
                className="w-full flex items-center justify-between px-3 py-2 text-sm text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-indigo-400" />
                  <span>Nouvelle Facture / Devis</span>
                </div>
                <kbd className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-950/80 text-slate-400 border border-slate-750 group-hover:text-indigo-300">
                  Ctrl+N
                </kbd>
              </button>
              <button
                onClick={() => {
                  setShowQuickAdd(false);
                  triggerProjectModal();
                }}
                className="w-full flex items-center justify-between px-3 py-2 text-sm text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <FolderPlus className="w-4 h-4 text-teal-400" />
                  <span>Nouveau Projet / Jalon</span>
                </div>
                <kbd className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-950/80 text-slate-400 border border-slate-750 group-hover:text-teal-300">
                  Ctrl+P
                </kbd>
              </button>
              <div className="border-t border-slate-800 my-1" />
              <button
                onClick={() => {
                  setShowQuickAdd(false);
                  triggerTransactionModal();
                }}
                className="w-full flex items-center justify-between px-3 py-2 text-sm text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <ArrowDownLeft className="w-4 h-4 text-amber-400" />
                  <span>Enregistrer un Paiement</span>
                </div>
              </button>
            </div>
          )}
        </div>
        )}

        {/* Software Update Button */}
        <button
          onClick={openUpdateModal}
          className={`relative p-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            softwareUpdateState.availableUpdate
              ? 'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/40 hover:bg-emerald-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
          }`}
          title={
            softwareUpdateState.availableUpdate
              ? `Mise à jour disponible (${softwareUpdateState.availableUpdate.version})`
              : `Système à jour (${softwareUpdateState.currentVersion})`
          }
          aria-label="Mises à jour du logiciel"
        >
          <RefreshCw className={`w-4 h-4 ${softwareUpdateState.availableUpdate ? 'animate-spin text-emerald-400' : ''}`} />
          <span className="hidden xl:inline text-xs font-mono font-bold">
            {softwareUpdateState.currentVersion}
          </span>
          {softwareUpdateState.availableUpdate && (
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          )}
        </button>

        {/* Security Lock Quick Action */}
        <button
          onClick={lockApp}
          className="p-2 text-slate-400 hover:text-amber-300 hover:bg-slate-800/80 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
          title="Verrouiller Nexus Gestion (Code PIN requis pour déverrouiller)"
          aria-label="Verrouiller l'application"
        >
          <Lock className="w-4 h-4 text-amber-400/80 hover:text-amber-400" />
          <span className="hidden xl:inline text-xs font-semibold text-slate-300">
            Verrou
          </span>
        </button>

        {/* Keyboard Shortcuts Help Button */}
        <button
          onClick={onOpenShortcutsHelp}
          className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
          title="Raccourcis clavier (Ctrl + / ou ?)"
          aria-label="Raccourcis clavier"
        >
          <Keyboard className="w-5 h-5" />
          <kbd className="hidden xl:inline text-[10px] font-mono font-bold bg-slate-800 border border-slate-700 text-slate-300 px-1.5 py-0.5 rounded">
            ?
          </kbd>
        </button>

        {/* Developer Contact Popover Button */}
        <div className="relative">
          <button
            onClick={() => {
              setShowDevContact(!showDevContact);
              setShowNotifs(false);
            }}
            className={`p-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 ${
              showDevContact
                ? 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/40'
                : 'text-slate-400 hover:text-emerald-300 hover:bg-slate-800/80'
            }`}
            title="Informations Développeur & Assistance"
            aria-label="Contact Développeur"
          >
            <Code2 className="w-5 h-5 text-emerald-400" />
            <span className="hidden lg:inline text-xs font-bold text-slate-300">
              Développeur
            </span>
          </button>

          {showDevContact && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-emerald-500/30 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Code2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">Concepteur Développeur</span>
                    <span className="text-[10px] text-emerald-400 font-semibold">Nexus Gestion SaaS</span>
                  </div>
                </div>
                <button
                  onClick={() => setShowDevContact(false)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="py-3 space-y-3">
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Nom & Prénoms</div>
                  <div className="text-sm font-black text-white mt-0.5">
                    Soro Kadiolohouafon Brice De Mont-Fort
                  </div>
                </div>

                <div className="space-y-2">
                  <a
                    href="tel:0789028207"
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-750 hover:border-emerald-500/40 text-slate-200 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Phone className="w-4 h-4 text-emerald-400" />
                      <div>
                        <div className="text-[10px] text-slate-400">Téléphone direct</div>
                        <div className="text-xs font-mono font-bold text-emerald-300">07 89 02 82 07</div>
                      </div>
                    </div>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded">
                      Appeler
                    </span>
                  </a>

                  <a
                    href="https://wa.me/2250789028207?text=Bonjour%20M.%20Soro%2C%20je%20vous%20contacte%20concernant%20l%27application%20Nexus%20Gestion"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-750 hover:border-emerald-500/40 text-slate-200 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <MessageCircle className="w-4 h-4 text-emerald-400" />
                      <div>
                        <div className="text-[10px] text-slate-400">WhatsApp Direct</div>
                        <div className="text-xs font-mono font-bold text-emerald-300">+225 07 89 02 82 07</div>
                      </div>
                    </div>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded">
                      Écrire
                    </span>
                  </a>

                  <a
                    href="mailto:kadiolohouafonsoro@gmail.com?subject=Nexus%20Gestion%20-%20Assistance"
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-750 hover:border-emerald-500/40 text-slate-200 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Mail className="w-4 h-4 text-emerald-400" />
                      <div>
                        <div className="text-[10px] text-slate-400">Adresse e-mail</div>
                        <div className="text-xs font-mono font-bold text-emerald-300 truncate max-w-[170px]">
                          kadiolohouafonsoro@gmail.com
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] bg-slate-800 text-slate-300 font-bold px-2 py-0.5 rounded">
                      Email
                    </span>
                  </a>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 text-center">
                <span className="text-[11px] text-slate-400">
                  Assistance technique & personnalisations SaaS
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className="relative p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 rounded-xl transition-colors cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {notifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
              </span>
            )}
          </button>

          {showNotifs && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-750 rounded-xl shadow-2xl p-3 z-50">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                <span className="text-sm font-semibold text-slate-100">Alertes & Rappels</span>
                <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-medium">
                  {notifications.length} en attente
                </span>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="py-6 text-center text-sm text-slate-400">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-60" />
                    Toutes les factures et projets sont à jour !
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        if (n.invoiceId) {
                          setActiveTab('invoices');
                          if (onSelectInvoice) onSelectInvoice(n.invoiceId);
                          setShowNotifs(false);
                        }
                      }}
                      className={`flex items-start gap-3 p-2.5 rounded-lg border transition-colors ${
                        n.invoiceId
                          ? 'bg-rose-950/20 border-rose-500/30 hover:bg-rose-950/40 cursor-pointer'
                          : 'bg-slate-800/60 border-slate-700/50 hover:bg-slate-800'
                      }`}
                    >
                      {n.type === 'warning' ? (
                        <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      ) : (
                        <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-slate-200 truncate">{n.title}</div>
                        <div className="text-xs text-slate-400 mt-0.5 line-clamp-2">{n.desc}</div>
                        {n.invoiceId && (
                          <div className="mt-1 flex items-center gap-1 text-[10px] text-amber-400 font-bold">
                            <span>Voir le détail & Relancer →</span>
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap">{n.date}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User / Org Avatar */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-800">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-xs shadow-md">
            NX
          </div>
          <div className="hidden xl:block text-left">
            <div className="text-xs font-bold text-slate-200 truncate max-w-[130px]">{settings.name}</div>
            <div className="text-[11px] text-emerald-400 font-medium">
              {settings.currency === 'XOF' ? 'UEMOA (FCFA)' : settings.currency}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

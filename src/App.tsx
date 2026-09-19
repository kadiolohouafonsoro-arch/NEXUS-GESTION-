import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { StatCards } from './components/dashboard/StatCards';
import { RevenueChart } from './components/dashboard/RevenueChart';
import { DistributionDonut } from './components/dashboard/DistributionDonut';
import { CashBoxesWidget } from './components/dashboard/CashBoxesWidget';
import { RecentActivities } from './components/dashboard/RecentActivities';
import { InvoiceList } from './components/invoices/InvoiceList';
import { InvoiceModal } from './components/invoices/InvoiceModal';
import { InvoicePreviewModal } from './components/invoices/InvoicePreviewModal';
import { RecordPaymentModal } from './components/invoices/RecordPaymentModal';
import { ProjectList } from './components/projects/ProjectList';
import { ProjectModal } from './components/projects/ProjectModal';
import { ProjectDetailModal } from './components/projects/ProjectDetailModal';
import { ProjetComparison } from './components/projects/ProjetComparison';
import { ToursCalendar } from './components/projects/ToursCalendar';
import { ClientList } from './components/clients/ClientList';
import { ClientModal } from './components/clients/ClientModal';
import { ClientDetailModal } from './components/clients/ClientDetailModal';
import { TreasuryView } from './components/treasury/TreasuryView';
import { SettingsView } from './components/settings/SettingsView';
import { DistributionManager } from './components/distribution/DistributionManager';
import { MemberPortal } from './components/member/MemberPortal';
import { SecurityLockModal } from './components/security/SecurityLockModal';
import { SecuritySettingsModal } from './components/security/SecuritySettingsModal';
import { SoftwareUpdateModal } from './components/updates/SoftwareUpdateModal';
import { KeyboardShortcutsModal } from './components/layout/KeyboardShortcutsModal';
import { NewTenantModal } from './components/layout/NewTenantModal';
import { SubscriptionModal } from './components/subscription/SubscriptionModal';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { Invoice, Project, Client, InvoiceType } from './types';
import {
  FileText,
  FolderKanban,
  Users,
  UserPlus,
  CalendarDays,
  Wallet,
  Settings,
  Plus,
  Sparkles,
  Calendar,
  CheckCircle2,
  BellRing,
  X,
  ShieldCheck,
  AlertCircle,
  Receipt,
} from 'lucide-react';

const NexusApp: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    isSidebarCollapsed,
    invoices,
    projects,
    clients,
    settings,
    toastNotification,
    clearToast,
    currentTenant,
    isSubscriptionModalOpen,
    openSubscriptionModal,
    closeSubscriptionModal,
    userRole,
    setUserRole,
    securityConfig,
    lockApp,
    isSecurityModalOpen,
    setIsSecurityModalOpen,
    openSecurityModal,
    isUpdateModalOpen,
    setIsUpdateModalOpen,
    openUpdateModal,
  } = useApp();

  // Modals state
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [invoiceModalType, setInvoiceModalType] = useState<InvoiceType>('invoice');

  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);
  const [paymentInvoice, setPaymentInvoice] = useState<Invoice | null>(null);

  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [selectedProjectDetail, setSelectedProjectDetail] = useState<Project | null>(null);
  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const [compareModalInitialAId, setCompareModalInitialAId] = useState<string | undefined>(undefined);

  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [selectedClientDetail, setSelectedClientDetail] = useState<Client | null>(null);

  // Keyboard Shortcuts Guide Modal state
  const [shortcutsModalOpen, setShortcutsModalOpen] = useState(false);
  const [newTenantModalOpen, setNewTenantModalOpen] = useState(false);

  // Handlers
  const handleOpenCreateInvoice = (type: InvoiceType = 'invoice') => {
    setEditingInvoice(null);
    setInvoiceModalType(type);
    setInvoiceModalOpen(true);
  };

  const handleEditInvoice = (inv: Invoice) => {
    setEditingInvoice(inv);
    setInvoiceModalType(inv.type);
    setInvoiceModalOpen(true);
  };

  const handleOpenCreateProject = () => {
    setEditingProject(null);
    setProjectModalOpen(true);
  };

  const handleEditProject = (p: Project) => {
    setEditingProject(p);
    setProjectModalOpen(true);
  };

  const handleOpenCreateClient = () => {
    setEditingClient(null);
    setClientModalOpen(true);
  };

  const handleEditClient = (c: Client) => {
    setEditingClient(c);
    setClientModalOpen(true);
  };

  const handleCreateInvoiceForClient = (c: Client) => {
    setEditingInvoice(null);
    setInvoiceModalType('invoice');
    setInvoiceModalOpen(true);
  };

  const handleCreateInvoiceForProject = (p: Project) => {
    setEditingInvoice(null);
    setInvoiceModalType('invoice');
    setInvoiceModalOpen(true);
  };

  // Preview invoice by ID
  const handlePreviewInvoiceById = (invoiceId: string) => {
    const found = invoices.find((i) => i.id === invoiceId);
    if (found) setPreviewInvoice(found);
  };

  // Open project detail by ID
  const handleOpenProjectDetailById = (projectId: string) => {
    const found = projects.find((p) => p.id === projectId);
    if (found) setSelectedProjectDetail(found);
  };

  // Close modals on Escape
  const handleCloseModals = () => {
    if (shortcutsModalOpen) {
      setShortcutsModalOpen(false);
      return;
    }
    if (previewInvoice) {
      setPreviewInvoice(null);
      return;
    }
    if (paymentInvoice) {
      setPaymentInvoice(null);
      return;
    }
    if (invoiceModalOpen) {
      setInvoiceModalOpen(false);
      return;
    }
    if (selectedProjectDetail) {
      setSelectedProjectDetail(null);
      return;
    }
    if (projectModalOpen) {
      setProjectModalOpen(false);
      return;
    }
    if (compareModalOpen) {
      setCompareModalOpen(false);
      return;
    }
    if (selectedClientDetail) {
      setSelectedClientDetail(null);
      return;
    }
    if (clientModalOpen) {
      setClientModalOpen(false);
      return;
    }
  };

  // Focus global search bar
  const handleFocusSearch = () => {
    const input = document.getElementById('global-search-input') as HTMLInputElement | null;
    if (input) {
      input.focus();
      input.select();
    }
  };

  const isAnyModalOpen = Boolean(
    invoiceModalOpen ||
    projectModalOpen ||
    clientModalOpen ||
    previewInvoice ||
    paymentInvoice ||
    selectedProjectDetail ||
    selectedClientDetail ||
    compareModalOpen ||
    shortcutsModalOpen
  );

  // Global Keyboard Shortcuts Hook
  useKeyboardShortcuts({
    onCreateInvoice: () => handleOpenCreateInvoice('invoice'),
    onCreateProject: handleOpenCreateProject,
    onCreateClient: handleOpenCreateClient,
    onCreateQuote: () => handleOpenCreateInvoice('quote'),
    onFocusSearch: handleFocusSearch,
    onNavigateTab: (tab) => setActiveTab(tab as any),
    onToggleShortcutsModal: () => setShortcutsModalOpen((prev) => !prev),
    onCloseModal: handleCloseModals,
    isModalOpen: isAnyModalOpen,
  });

  // Action dispatcher from the Shortcuts Help Modal
  const handleExecuteShortcutAction = (actionKey: string) => {
    setShortcutsModalOpen(false);
    switch (actionKey) {
      case 'create_invoice':
        handleOpenCreateInvoice('invoice');
        break;
      case 'create_project':
        handleOpenCreateProject();
        break;
      case 'create_client':
        handleOpenCreateClient();
        break;
      case 'create_quote':
        handleOpenCreateInvoice('quote');
        break;
      case 'tab_dashboard':
        setActiveTab('dashboard');
        break;
      case 'tab_invoices':
        setActiveTab('invoices');
        break;
      case 'tab_projects':
        setActiveTab('projects');
        break;
      case 'tab_tours':
        setActiveTab('tours');
        break;
      case 'tab_clients':
        setActiveTab('clients');
        break;
      case 'tab_treasury':
        setActiveTab('treasury');
        break;
      case 'tab_settings':
        setActiveTab('settings');
        break;
      case 'focus_search':
        handleFocusSearch();
        break;
      case 'open_shortcuts':
        setShortcutsModalOpen(true);
        break;
      case 'close_modal':
        handleCloseModals();
        break;
    }
  };

  const todayFormatted = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const isSubscriptionExpired =
    currentTenant?.subscription?.status === 'expired' ||
    (Boolean(currentTenant?.subscription?.currentPeriodEnd) &&
      new Date(currentTenant!.subscription!.currentPeriodEnd).getTime() < Date.now());

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        onOpenNewInvoice={() => handleOpenCreateInvoice('invoice')}
        onOpenNewClient={handleOpenCreateClient}
        onOpenNewProject={handleOpenCreateProject}
        onSelectInvoice={handlePreviewInvoiceById}
        onOpenShortcutsHelp={() => setShortcutsModalOpen(true)}
        onOpenNewTenantModal={() => setNewTenantModalOpen(true)}
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar
          onOpenNewInvoice={() => handleOpenCreateInvoice('invoice')}
          onOpenNewClient={handleOpenCreateClient}
          onOpenShortcutsHelp={() => setShortcutsModalOpen(true)}
          onOpenNewTenantModal={() => setNewTenantModalOpen(true)}
        />

        {/* Scrollable Content Container */}
        <main
          className={`flex-1 overflow-y-auto transition-all duration-300 ${
            isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
          } pt-16 pb-12 px-4 sm:px-6 lg:px-8`}
        >
          <div className="max-w-7xl mx-auto space-y-6">
            {/* SaaS Expired Alert Banner */}
            {isSubscriptionExpired && (
              <div className="bg-gradient-to-r from-rose-950/80 via-slate-900 to-amber-950/60 border border-rose-500/40 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>Abonnement SaaS Expiré</span>
                      <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full border border-rose-500/30">
                        Accès à renouveler
                      </span>
                    </h3>
                    <p className="text-xs text-slate-300 mt-0.5">
                      L'abonnement de la plateforme (5 000 FCFA / mois) pour cet espace est échu. Renouvelez-le maintenant pour continuer la gestion de vos membres et caisses.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={openSubscriptionModal}
                  className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-black shrink-0 shadow-lg shadow-emerald-600/30 cursor-pointer flex items-center gap-1.5 transition-all"
                >
                  <Receipt className="w-4 h-4" />
                  <span>Renouveler (5 000 FCFA)</span>
                </button>
              </div>
            )}

            {/* SECURITY GATE: If userRole is member and trying to view restricted admin views */}
            {userRole === 'member' && ['dashboard', 'invoices', 'treasury', 'settings', 'distribution'].includes(activeTab) ? (
              <div className="space-y-6">
                <div className="p-4 bg-amber-950/40 border border-amber-500/40 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-amber-200 block">
                        Mode Espace Adhérent Actif (Vue Restreinte Sécurisée)
                      </span>
                      <span className="text-slate-300 text-[11px]">
                        Les données globales de trésorerie, facturation et répartition sont réservées au Bureau. Vous pouvez régler vos cotisations en ligne ci-dessous.
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setUserRole('admin');
                      setActiveTab('dashboard');
                    }}
                    className="px-3 py-1.5 bg-amber-500 text-slate-950 rounded-xl font-bold hover:bg-amber-400 whitespace-nowrap cursor-pointer"
                  >
                    Basculer en Mode Bureau (Admin)
                  </button>
                </div>
                <MemberPortal />
              </div>
            ) : (
              <>
                {/* TAB: DASHBOARD (Admin Only) */}
                {activeTab === 'dashboard' && (
                  <div className="space-y-6">
                    {/* Greeting Banner with Emerald Identity */}
                    <div className="bg-gradient-to-r from-slate-850 via-slate-850 to-emerald-950/40 border border-emerald-500/20 rounded-2xl p-5 sm:p-6 shadow-xl shadow-black/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>{settings.name} • Espace Pilotage Bureau</span>
                          </div>
                          <button
                            type="button"
                            onClick={openSubscriptionModal}
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold hover:bg-emerald-500/30 transition-all cursor-pointer"
                            title="Gérer l'abonnement SaaS (5 000 F/mois)"
                          >
                            <ShieldCheck className="w-3 h-3 text-emerald-400" />
                            <span>SaaS Actif • 5 000 F/mois</span>
                          </button>
                        </div>
                        <h1 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight">
                          Bienvenue sur votre espace de pilotage
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-400 mt-1 capitalize flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-emerald-400/80" />
                          {todayFormatted}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2.5">
                        <button
                          onClick={handleOpenCreateClient}
                          className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-600/25 cursor-pointer active:scale-95"
                          title="Inscrire un nouvel adhérent dans le registre"
                        >
                          <UserPlus className="w-4 h-4" />
                          <span>Ajouter un Membre</span>
                        </button>
                        <button
                          onClick={() => handleOpenCreateInvoice('invoice')}
                          className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Émettre Facture / Cotisation</span>
                        </button>
                        <button
                          onClick={handleOpenCreateProject}
                          className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                        >
                          <FolderKanban className="w-4 h-4 text-emerald-400" />
                          <span>Lancer Projet / Activité</span>
                        </button>
                      </div>
                    </div>

                    {/* Primary Stats Grid */}
                    <StatCards />

                    {/* Interactive Visual Charts Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="lg:col-span-2">
                        <RevenueChart />
                      </div>
                      <div>
                        <DistributionDonut />
                      </div>
                    </div>

                    {/* Cash Accounts & Live Activity Feed */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div>
                        <CashBoxesWidget />
                      </div>
                      <div className="lg:col-span-2">
                        <RecentActivities
                          onViewInvoice={handlePreviewInvoiceById}
                          onPreviewInvoice={handlePreviewInvoiceById}
                          onViewProject={handleOpenProjectDetailById}
                          onRecordPayment={(invoiceId) => {
                            const inv = invoices.find((i) => i.id === invoiceId);
                            if (inv) setPaymentInvoice(inv);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB: INVOICES & QUOTES */}
                {activeTab === 'invoices' && (
                  <InvoiceList
                    onOpenCreateModal={handleOpenCreateInvoice}
                    onPreviewInvoice={(inv) => setPreviewInvoice(inv)}
                    onRecordPayment={(inv) => setPaymentInvoice(inv)}
                    onEditInvoice={handleEditInvoice}
                  />
                )}

                {/* TAB: PROJECTS */}
                {activeTab === 'projects' && (
                  <ProjectList
                    onOpenCreateModal={handleOpenCreateProject}
                    onOpenProjectDetail={(p) => setSelectedProjectDetail(p)}
                    onEditProject={handleEditProject}
                  />
                )}

                {/* TAB: TOURS & TONTINE ROTATION */}
                {activeTab === 'tours' && <ToursCalendar />}

                {/* TAB: CLIENTS & MEMBERS */}
                {activeTab === 'clients' && (
                  <ClientList
                    onOpenCreateModal={handleOpenCreateClient}
                    onSelectClient={(c) => setSelectedClientDetail(c)}
                    onEditClient={handleEditClient}
                  />
                )}

                {/* TAB: DISTRIBUTION DES RECETTES (Actionnaires & Employés) */}
                {activeTab === 'distribution' && <DistributionManager />}

                {/* TAB: MEMBER PORTAL */}
                {activeTab === 'member_portal' && <MemberPortal />}

                {/* TAB: TREASURY & CASH ACCOUNTS */}
                {activeTab === 'treasury' && <TreasuryView />}

                {/* TAB: SETTINGS */}
                {activeTab === 'settings' && <SettingsView />}
              </>
            )}
          </div>
        </main>
      </div>

      {/* GLOBAL MODALS */}

      {/* Invoice Create / Edit Modal */}
      <InvoiceModal
        isOpen={invoiceModalOpen}
        onClose={() => setInvoiceModalOpen(false)}
        editingInvoice={editingInvoice}
        initialType={invoiceModalType}
      />

      {/* Printable Invoice Preview Modal */}
      <InvoicePreviewModal
        invoice={
          previewInvoice
            ? invoices.find((i) => i.id === previewInvoice.id) || previewInvoice
            : null
        }
        onClose={() => setPreviewInvoice(null)}
        onRecordPayment={(inv) => {
          setPreviewInvoice(null);
          setPaymentInvoice(inv);
        }}
      />

      {/* Record Payment Modal */}
      <RecordPaymentModal
        invoice={paymentInvoice}
        onClose={() => setPaymentInvoice(null)}
      />

      {/* Project Modal */}
      <ProjectModal
        isOpen={projectModalOpen}
        onClose={() => setProjectModalOpen(false)}
        editingProject={editingProject}
      />

      {/* Project Detail Modal */}
      <ProjectDetailModal
        project={selectedProjectDetail}
        onClose={() => setSelectedProjectDetail(null)}
        onOpenCreateInvoiceForProject={handleCreateInvoiceForProject}
        onCompareWithProject={(p) => {
          setSelectedProjectDetail(null);
          setCompareModalInitialAId(p.id);
          setCompareModalOpen(true);
        }}
      />

      {/* Standalone Project Comparison Modal */}
      {compareModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
          <div className="relative w-full max-w-6xl max-h-[94vh] overflow-y-auto rounded-2xl">
            <ProjetComparison
              initialProjectAId={compareModalInitialAId}
              onClose={() => setCompareModalOpen(false)}
              onOpenProjectDetail={(p) => {
                setCompareModalOpen(false);
                setSelectedProjectDetail(p);
              }}
            />
          </div>
        </div>
      )}

      {/* Client Modal */}
      <ClientModal
        isOpen={clientModalOpen}
        onClose={() => setClientModalOpen(false)}
        editingClient={editingClient}
      />

      {/* Client Detail Modal */}
      <ClientDetailModal
        client={selectedClientDetail}
        onClose={() => setSelectedClientDetail(null)}
        onOpenCreateInvoiceForClient={handleCreateInvoiceForClient}
        onPreviewInvoice={handlePreviewInvoiceById}
      />

      {/* Keyboard Shortcuts Guide Modal */}
      <KeyboardShortcutsModal
        isOpen={shortcutsModalOpen}
        onClose={() => setShortcutsModalOpen(false)}
        onTriggerAction={handleExecuteShortcutAction}
      />

      {/* New Tenant Creation Modal */}
      <NewTenantModal
        isOpen={newTenantModalOpen}
        onClose={() => setNewTenantModalOpen(false)}
      />

      {/* SaaS Subscription Modal (5 000 FCFA / mois) */}
      <SubscriptionModal
        isOpen={isSubscriptionModalOpen}
        onClose={closeSubscriptionModal}
      />

      {/* SECURITY PIN LOCK SCREEN */}
      <SecurityLockModal
        isOpen={securityConfig.isLocked}
        onUnlockSuccess={() => {}}
      />

      {/* SECURITY SETTINGS & AUDIT LOG MODAL */}
      <SecuritySettingsModal
        isOpen={isSecurityModalOpen}
        onClose={() => setIsSecurityModalOpen(false)}
        onLockNow={lockApp}
      />

      {/* SOFTWARE UPDATE & MAINTENANCE MODAL */}
      <SoftwareUpdateModal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
      />

      {/* Global Toast Notification for Actions (Reminders, Status Updates) */}
      {toastNotification && (
        <div className="fixed bottom-14 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-slate-800 border border-emerald-500/50 text-white rounded-2xl shadow-2xl animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-xs font-semibold pr-2">
            {toastNotification.message}
          </div>
          <button
            onClick={clearToast}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <NexusApp />
    </AppProvider>
  );
}

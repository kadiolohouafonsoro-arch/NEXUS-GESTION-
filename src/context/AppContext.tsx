import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Client,
  Invoice,
  Project,
  TontineTour,
  CashAccount,
  Transaction,
  OrganizationSettings,
  AssociationTenant,
  PaymentMethod,
  InvoiceStatus,
  ProjectTask,
  ReminderChannel,
  ReminderLevel,
  InvoiceReminderRecord,
  UserAppRole,
  Shareholder,
  Employee,
  DistributionRuleConfig,
  DistributionSession,
  SecurityConfig,
  SecurityAuditLog,
  SoftwareUpdateState,
  SoftwareUpdateRelease,
} from '../types';
import { isInvoiceOverdue, getDaysOverdue } from '../utils/invoiceOverdueUtils';
import {
  initialSettings,
  initialClients,
  initialInvoices,
  initialProjects,
  initialTours,
  initialAccounts,
  initialTransactions,
  initialTenants,
} from '../data/initialData';
import { tenantPresets } from '../data/tenantPresets';
import {
  initialDistributionRule,
  initialShareholders,
  initialEmployees,
  initialDistributionSessions,
} from '../data/distributionData';

interface AppContextType {
  userRole: UserAppRole;
  setUserRole: (role: UserAppRole) => void;
  activeMemberId: string;
  setActiveMemberId: (id: string) => void;
  activeMember: Client | undefined;
  recordMemberContributionPayment: (
    memberId: string,
    amount: number,
    method: PaymentMethod,
    accountId: string,
    monthsCount?: number,
    notes?: string
  ) => void;
  shareholders: Shareholder[];
  addShareholder: (sh: Omit<Shareholder, 'id' | 'totalDividendsReceived'>) => void;
  updateShareholder: (sh: Shareholder) => void;
  deleteShareholder: (id: string) => void;
  employees: Employee[];
  addEmployee: (emp: Omit<Employee, 'id' | 'totalPaid'>) => void;
  updateEmployee: (emp: Employee) => void;
  deleteEmployee: (id: string) => void;
  distributionRule: DistributionRuleConfig;
  updateDistributionRule: (rule: Partial<DistributionRuleConfig>) => void;
  distributionSessions: DistributionSession[];
  executeDistributionSession: (
    sessionData: Omit<DistributionSession, 'id' | 'status' | 'executedAt'>
  ) => void;
  tenants: AssociationTenant[];
  currentTenantId: string;
  currentTenant: AssociationTenant;
  switchTenant: (tenantId: string) => void;
  addTenant: (tenant: Omit<AssociationTenant, 'id' | 'createdAt'>) => AssociationTenant;
  updateTenant: (tenant: AssociationTenant) => void;
  renewTenantSubscription: (tenantId: string, months: number, method: PaymentMethod, reference?: string) => void;
  isSubscriptionModalOpen: boolean;
  setIsSubscriptionModalOpen: (open: boolean) => void;
  openSubscriptionModal: () => void;
  settings: OrganizationSettings;
  clients: Client[];
  invoices: Invoice[];
  projects: Project[];
  tours: TontineTour[];
  accounts: CashAccount[];
  transactions: Transaction[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  formatMoney: (amount: number) => string;
  addInvoice: (invoice: Omit<Invoice, 'id' | 'number'> & { customNumber?: string }) => Invoice;
  updateInvoice: (invoice: Invoice) => void;
  deleteInvoice: (id: string) => void;
  recordPayment: (invoiceId: string, amount: number, method: PaymentMethod, accountId: string) => void;
  convertQuoteToInvoice: (quoteId: string) => void;
  sendInvoiceReminder: (
    invoiceId: string,
    reminderData: {
      channel: ReminderChannel;
      level: ReminderLevel;
      recipient: string;
      notes?: string;
    }
  ) => void;
  toastNotification: { message: string; type: 'success' | 'info' | 'warning' } | null;
  clearToast: () => void;
  showToast: (message: string, type?: 'success' | 'info' | 'warning') => void;
  addClient: (client: Omit<Client, 'id' | 'totalBilled' | 'outstandingBalance' | 'createdAt'>) => Client;
  updateClient: (client: Client) => void;
  deleteClient: (id: string) => void;
  addProject: (project: Omit<Project, 'id' | 'code' | 'spent' | 'progress'>) => Project;
  updateProject: (project: Project) => void;
  deleteProject: (id: string) => void;
  toggleTask: (projectId: string, taskId: string) => void;
  addTask: (projectId: string, task: Omit<ProjectTask, 'id'>) => void;
  deleteTask: (projectId: string, taskId: string) => void;
  addTour: (tour: Omit<TontineTour, 'id' | 'tourNumber'>) => void;
  updateTour: (tour: TontineTour) => void;
  payoutTour: (tourId: string, accountId: string, paymentMethod?: PaymentMethod, reference?: string) => void;
  addAccount: (account: Omit<CashAccount, 'id'>) => CashAccount;
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  updateSettings: (newSettings: Partial<OrganizationSettings>) => void;
  resetToDefaults: () => void;
  exportDataJSON: () => void;
  notifications: Array<{
    id: string;
    invoiceId?: string;
    title: string;
    desc: string;
    type: 'warning' | 'info' | 'success';
    date: string;
    daysOverdue?: number;
  }>;
  securityConfig: SecurityConfig;
  updateSecurityConfig: (newConfig: Partial<SecurityConfig>) => void;
  securityAuditLogs: SecurityAuditLog[];
  addSecurityLog: (action: string, severity?: 'info' | 'warning' | 'security', details?: string) => void;
  lockApp: () => void;
  unlockAppWithPin: (pin: string) => boolean;
  changeSecurityPin: (oldPin: string, newPin: string) => boolean;
  isSecurityModalOpen: boolean;
  setIsSecurityModalOpen: (open: boolean) => void;
  openSecurityModal: () => void;
  softwareUpdateState: SoftwareUpdateState;
  isUpdateModalOpen: boolean;
  setIsUpdateModalOpen: (open: boolean) => void;
  openUpdateModal: () => void;
  checkForUpdates: () => Promise<void>;
  applySoftwareUpdate: (customPackage?: any) => Promise<boolean>;
  rollbackSoftwareUpdate: () => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const GLOBAL_STORAGE_KEYS = {
  TENANTS: 'nexus_gestion_tenants_v2',
  CURRENT_TENANT_ID: 'nexus_gestion_current_tenant_id_v2',
};

const getTenantKey = (tenantId: string, key: string) => `nexus_t_${tenantId}_${key}_v2`;

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Tenants state
  const [tenants, setTenants] = useState<AssociationTenant[]>(() => {
    const saved = localStorage.getItem(GLOBAL_STORAGE_KEYS.TENANTS);
    if (!saved) return initialTenants;
    try {
      const parsed: AssociationTenant[] = JSON.parse(saved);
      return parsed.map((t) => {
        if (!t.subscription) {
          const matchInitial = initialTenants.find((it) => it.id === t.id);
          return {
            ...t,
            subscription: matchInitial?.subscription || {
              planName: 'Forfait Association SaaS',
              monthlyPrice: 5000,
              currency: 'FCFA',
              status: 'active',
              currentPeriodStart: '2026-09-01',
              currentPeriodEnd: '2026-10-01',
              autoRenew: true,
              lastPaymentDate: '2026-09-01',
              lastPaymentMethod: 'wave',
              lastPaymentReference: 'WAVE-SUB-INIT',
              paymentHistory: [
                {
                  id: `sub-init-${t.id}`,
                  date: '2026-09-01',
                  amount: 5000,
                  months: 1,
                  paymentMethod: 'wave',
                  reference: 'WAVE-SUB-INIT',
                  invoiceNumber: `FACT-SAAS-20260901-${t.acronym || 'ASSO'}`,
                  status: 'paid',
                },
              ],
            },
          };
        }
        return t;
      });
    } catch {
      return initialTenants;
    }
  });

  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const openSubscriptionModal = () => setIsSubscriptionModalOpen(true);

  const [currentTenantId, setCurrentTenantId] = useState<string>(() => {
    const saved = localStorage.getItem(GLOBAL_STORAGE_KEYS.CURRENT_TENANT_ID);
    return saved || (initialTenants[0]?.id || 'tenant-mse');
  });

  const currentTenant =
    tenants.find((t) => t.id === currentTenantId) || tenants[0] || initialTenants[0];

  // Helper to load tenant dataset
  const getInitialTenantDataset = (tenantId: string) => {
    const preset = tenantPresets[tenantId];
    if (preset) {
      return {
        settings: preset.settings,
        clients: preset.clients,
        accounts: preset.accounts,
        transactions: preset.transactions,
        tours: preset.tours,
        invoices: initialInvoices,
        projects: initialProjects,
      };
    }
    return {
      settings: initialSettings,
      clients: initialClients,
      accounts: initialAccounts,
      transactions: initialTransactions,
      tours: initialTours,
      invoices: initialInvoices,
      projects: initialProjects,
    };
  };

  const initialDataForCurrent = getInitialTenantDataset(currentTenantId);

  const [settings, setSettings] = useState<OrganizationSettings>(() => {
    const saved = localStorage.getItem(getTenantKey(currentTenantId, 'settings'));
    return saved ? JSON.parse(saved) : initialDataForCurrent.settings;
  });

  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem(getTenantKey(currentTenantId, 'clients'));
    return saved ? JSON.parse(saved) : initialDataForCurrent.clients;
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem(getTenantKey(currentTenantId, 'invoices'));
    return saved ? JSON.parse(saved) : initialDataForCurrent.invoices;
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem(getTenantKey(currentTenantId, 'projects'));
    return saved ? JSON.parse(saved) : initialDataForCurrent.projects;
  });

  const [tours, setTours] = useState<TontineTour[]>(() => {
    const saved = localStorage.getItem(getTenantKey(currentTenantId, 'tours'));
    return saved ? JSON.parse(saved) : initialDataForCurrent.tours;
  });

  const [accounts, setAccounts] = useState<CashAccount[]>(() => {
    const saved = localStorage.getItem(getTenantKey(currentTenantId, 'accounts'));
    return saved ? JSON.parse(saved) : initialDataForCurrent.accounts;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(getTenantKey(currentTenantId, 'transactions'));
    return saved ? JSON.parse(saved) : initialDataForCurrent.transactions;
  });

  // User App Role (Admin vs Member Portal)
  const [userRole, setUserRole] = useState<UserAppRole>(() => {
    const saved = localStorage.getItem('nexus_user_role');
    return (saved as UserAppRole) || 'admin';
  });

  // Active Member ID (when in Member Portal)
  const [activeMemberId, setActiveMemberId] = useState<string>(() => {
    const saved = localStorage.getItem('nexus_active_member_id');
    return saved || 'mem-mse-10';
  });

  // Shareholders & Employees & Distribution states
  const [shareholders, setShareholders] = useState<Shareholder[]>(() => {
    const saved = localStorage.getItem(getTenantKey(currentTenantId, 'shareholders'));
    return saved ? JSON.parse(saved) : initialShareholders;
  });

  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem(getTenantKey(currentTenantId, 'employees'));
    return saved ? JSON.parse(saved) : initialEmployees;
  });

  const [distributionRule, setDistributionRule] = useState<DistributionRuleConfig>(() => {
    const saved = localStorage.getItem(getTenantKey(currentTenantId, 'distributionRule'));
    return saved ? JSON.parse(saved) : initialDistributionRule;
  });

  const [distributionSessions, setDistributionSessions] = useState<DistributionSession[]>(() => {
    const saved = localStorage.getItem(getTenantKey(currentTenantId, 'distributionSessions'));
    return saved ? JSON.parse(saved) : initialDistributionSessions;
  });

  // Save global tenants
  useEffect(() => {
    localStorage.setItem(GLOBAL_STORAGE_KEYS.TENANTS, JSON.stringify(tenants));
  }, [tenants]);

  useEffect(() => {
    localStorage.setItem(GLOBAL_STORAGE_KEYS.CURRENT_TENANT_ID, currentTenantId);
  }, [currentTenantId]);

  useEffect(() => {
    localStorage.setItem('nexus_user_role', userRole);
  }, [userRole]);

  useEffect(() => {
    localStorage.setItem('nexus_active_member_id', activeMemberId);
  }, [activeMemberId]);

  // Save tenant-specific data
  useEffect(() => {
    localStorage.setItem(getTenantKey(currentTenantId, 'settings'), JSON.stringify(settings));
  }, [settings, currentTenantId]);

  useEffect(() => {
    localStorage.setItem(getTenantKey(currentTenantId, 'clients'), JSON.stringify(clients));
  }, [clients, currentTenantId]);

  useEffect(() => {
    localStorage.setItem(getTenantKey(currentTenantId, 'invoices'), JSON.stringify(invoices));
  }, [invoices, currentTenantId]);

  useEffect(() => {
    localStorage.setItem(getTenantKey(currentTenantId, 'projects'), JSON.stringify(projects));
  }, [projects, currentTenantId]);

  useEffect(() => {
    localStorage.setItem(getTenantKey(currentTenantId, 'tours'), JSON.stringify(tours));
  }, [tours, currentTenantId]);

  useEffect(() => {
    localStorage.setItem(getTenantKey(currentTenantId, 'accounts'), JSON.stringify(accounts));
  }, [accounts, currentTenantId]);

  useEffect(() => {
    localStorage.setItem(getTenantKey(currentTenantId, 'transactions'), JSON.stringify(transactions));
  }, [transactions, currentTenantId]);

  useEffect(() => {
    localStorage.setItem(getTenantKey(currentTenantId, 'shareholders'), JSON.stringify(shareholders));
  }, [shareholders, currentTenantId]);

  useEffect(() => {
    localStorage.setItem(getTenantKey(currentTenantId, 'employees'), JSON.stringify(employees));
  }, [employees, currentTenantId]);

  useEffect(() => {
    localStorage.setItem(getTenantKey(currentTenantId, 'distributionRule'), JSON.stringify(distributionRule));
  }, [distributionRule, currentTenantId]);

  useEffect(() => {
    localStorage.setItem(getTenantKey(currentTenantId, 'distributionSessions'), JSON.stringify(distributionSessions));
  }, [distributionSessions, currentTenantId]);

  // Security Configuration & State
  const [securityConfig, setSecurityConfig] = useState<SecurityConfig>(() => {
    const saved = localStorage.getItem('nexus_security_config_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return {
      isLocked: false,
      pin: '1234',
      autoLockMinutes: 15,
      lastActivityTime: Date.now(),
      encryptionActive: true,
      failedAttempts: 0,
    };
  });

  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const openSecurityModal = () => setIsSecurityModalOpen(true);

  const [securityAuditLogs, setSecurityAuditLogs] = useState<SecurityAuditLog[]>(() => {
    const saved = localStorage.getItem('nexus_security_audit_logs_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return [
      {
        id: 'log-1',
        timestamp: '08/09/2026, 08:30:15',
        action: 'Démarrage sécurisé Nexus Gestion',
        role: 'admin',
        details: 'Initialisation du moteur de chiffrement et contrôle d\'intégrité',
        severity: 'info',
      },
      {
        id: 'log-2',
        timestamp: '08/09/2026, 09:12:00',
        action: 'Contrôle d\'intégrité des caisses',
        role: 'admin',
        details: 'Vérification de balance Trésorerie Wave / OM / Banque',
        severity: 'info',
      },
    ];
  });

  const addSecurityLog = (
    action: string,
    severity: 'info' | 'warning' | 'security' = 'info',
    details?: string
  ) => {
    const newLog: SecurityAuditLog = {
      id: `sec-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toLocaleString('fr-FR'),
      action,
      role: userRole,
      details,
      severity,
    };
    setSecurityAuditLogs((prev) => [newLog, ...prev.slice(0, 99)]);
  };

  useEffect(() => {
    localStorage.setItem('nexus_security_config_v2', JSON.stringify(securityConfig));
  }, [securityConfig]);

  useEffect(() => {
    localStorage.setItem('nexus_security_audit_logs_v2', JSON.stringify(securityAuditLogs));
  }, [securityAuditLogs]);

  const updateSecurityConfig = (newConfig: Partial<SecurityConfig>) => {
    setSecurityConfig((prev) => ({ ...prev, ...newConfig }));
    addSecurityLog('Modification des paramètres de sécurité', 'info', Object.keys(newConfig).join(', '));
  };

  const lockApp = () => {
    setSecurityConfig((prev) => ({ ...prev, isLocked: true }));
    addSecurityLog('Verrouillage de Nexus Gestion', 'info');
  };

  const unlockAppWithPin = (enteredPin: string) => {
    if (enteredPin === securityConfig.pin) {
      setSecurityConfig((prev) => ({
        ...prev,
        isLocked: false,
        failedAttempts: 0,
        lastActivityTime: Date.now(),
      }));
      addSecurityLog('Déverrouillage administrateur réussi', 'info');
      return true;
    } else {
      setSecurityConfig((prev) => ({
        ...prev,
        failedAttempts: (prev.failedAttempts || 0) + 1,
      }));
      addSecurityLog('Tentative de déverrouillage infructueuse', 'security', 'Code PIN incorrect');
      return false;
    }
  };

  const changeSecurityPin = (oldPin: string, newPin: string) => {
    if (oldPin === securityConfig.pin) {
      setSecurityConfig((prev) => ({ ...prev, pin: newPin }));
      addSecurityLog('Code PIN administrateur modifié avec succès', 'security');
      return true;
    }
    addSecurityLog('Échec modification code PIN (ancien PIN invalide)', 'security');
    return false;
  };

  // Activity listener for Auto-lock
  useEffect(() => {
    const handleActivity = () => {
      setSecurityConfig((prev) => {
        if (prev.isLocked) return prev;
        return { ...prev, lastActivityTime: Date.now() };
      });
    };

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('touchstart', handleActivity);
    window.addEventListener('click', handleActivity);

    const interval = setInterval(() => {
      setSecurityConfig((prev) => {
        if (prev.isLocked || prev.autoLockMinutes <= 0) return prev;
        const elapsedMinutes = (Date.now() - prev.lastActivityTime) / (1000 * 60);
        if (elapsedMinutes >= prev.autoLockMinutes) {
          addSecurityLog('Verrouillage automatique après inactivité', 'warning', `${prev.autoLockMinutes} minutes`);
          return { ...prev, isLocked: true };
        }
        return prev;
      });
    }, 30000);

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
      window.removeEventListener('click', handleActivity);
      clearInterval(interval);
    };
  }, []);

  // Software Update State & Management
  const [softwareUpdateState, setSoftwareUpdateState] = useState<SoftwareUpdateState>(() => {
    const saved = localStorage.getItem('nexus_software_update_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return {
      currentVersion: 'v2.4.2',
      latestVersion: 'v2.5.0',
      lastCheckedDate: 'Aujourd\'hui',
      isChecking: false,
      isUpdating: false,
      updateProgress: 0,
      availableUpdate: {
        version: 'v2.5.0',
        releaseDate: '08 Septembre 2026',
        title: 'Mise à jour majeure : Plan Excel & Sécurité Renforcée',
        summary: 'Version stable intégrant les onglets bas de page style classeur Excel (Tableaux de bord, Membres, Calendrier Tours, Paramètres) et le verrou de sécurité PIN.',
        changelog: [
          'Affichage des modules en bas de page comme le plan Excel (Tableaux de bord, Membres, Calendrier tours, Paramètres)',
          'Verrouillage de sécurité avec code PIN administrateur et session d\'inactivité',
          'Centre de maintenance et de mises à jour intégrées (en ligne et fichier patch)',
          'Optimisation du statut des cotisations membres (À jour vs En retard)',
          'Sécurisation des clés de répartition des recettes (Actionnaires, Salariés, Réserves)',
        ],
        isSecurityPatch: true,
        downloadSize: '3.8 Mo',
        mandatory: false,
      },
      history: [
        {
          version: 'v2.4.2',
          installedAt: '01/09/2026',
          notes: 'Version de production initiale Nexus Gestion',
        },
      ],
    };
  });

  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const openUpdateModal = () => setIsUpdateModalOpen(true);

  useEffect(() => {
    localStorage.setItem('nexus_software_update_v2', JSON.stringify(softwareUpdateState));
  }, [softwareUpdateState]);

  const checkForUpdates = async () => {
    setSoftwareUpdateState((prev) => ({ ...prev, isChecking: true }));
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setSoftwareUpdateState((prev) => ({
      ...prev,
      isChecking: false,
      lastCheckedDate: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    }));
    addSecurityLog('Vérification des mises à jour Nexus Gestion effectuée', 'info');
  };

  const applySoftwareUpdate = async (customPackage?: any) => {
    setSoftwareUpdateState((prev) => ({
      ...prev,
      isUpdating: true,
      updateProgress: 20,
    }));

    await new Promise((res) => setTimeout(res, 500));
    setSoftwareUpdateState((prev) => ({ ...prev, updateProgress: 50 }));

    await new Promise((res) => setTimeout(res, 600));
    setSoftwareUpdateState((prev) => ({ ...prev, updateProgress: 85 }));

    await new Promise((res) => setTimeout(res, 500));
    const targetVersion = customPackage?.version || 'v2.5.0';
    setSoftwareUpdateState((prev) => ({
      ...prev,
      isUpdating: false,
      updateProgress: 100,
      currentVersion: targetVersion,
      latestVersion: targetVersion,
      availableUpdate: null,
      history: [
        {
          version: targetVersion,
          installedAt: new Date().toLocaleDateString('fr-FR'),
          notes: customPackage?.title || 'Mise à jour majeure : Plan Excel & Sécurité Renforcée',
        },
        ...prev.history,
      ],
    }));

    addSecurityLog(`Mise à jour vers la version ${targetVersion} installée avec succès`, 'info');
    return true;
  };

  const rollbackSoftwareUpdate = () => {
    setSoftwareUpdateState((prev) => ({
      ...prev,
      currentVersion: 'v2.4.2',
      latestVersion: 'v2.5.0',
      availableUpdate: {
        version: 'v2.5.0',
        releaseDate: '08 Septembre 2026',
        title: 'Mise à jour majeure : Plan Excel & Sécurité Renforcée',
        summary: 'Version stable intégrant les onglets bas de page style classeur Excel et le verrou de sécurité PIN.',
        changelog: [
          'Affichage des modules en bas de page comme le plan Excel',
          'Verrouillage de sécurité avec code PIN',
          'Centre de maintenance et de mises à jour',
        ],
        isSecurityPatch: true,
        downloadSize: '3.8 Mo',
        mandatory: false,
      },
    }));
    addSecurityLog('Restauration vers la version précédente effectuée', 'warning');
    return true;
  };

  // Switch Tenant
  const switchTenant = (newTenantId: string) => {
    if (newTenantId === currentTenantId) return;

    // Load data for new tenant
    const dataset = getInitialTenantDataset(newTenantId);

    const savedSettings = localStorage.getItem(getTenantKey(newTenantId, 'settings'));
    const savedClients = localStorage.getItem(getTenantKey(newTenantId, 'clients'));
    const savedInvoices = localStorage.getItem(getTenantKey(newTenantId, 'invoices'));
    const savedProjects = localStorage.getItem(getTenantKey(newTenantId, 'projects'));
    const savedTours = localStorage.getItem(getTenantKey(newTenantId, 'tours'));
    const savedAccounts = localStorage.getItem(getTenantKey(newTenantId, 'accounts'));
    const savedTransactions = localStorage.getItem(getTenantKey(newTenantId, 'transactions'));
    const savedShareholders = localStorage.getItem(getTenantKey(newTenantId, 'shareholders'));
    const savedEmployees = localStorage.getItem(getTenantKey(newTenantId, 'employees'));
    const savedDistRule = localStorage.getItem(getTenantKey(newTenantId, 'distributionRule'));
    const savedDistSessions = localStorage.getItem(getTenantKey(newTenantId, 'distributionSessions'));

    setSettings(savedSettings ? JSON.parse(savedSettings) : dataset.settings);
    setClients(savedClients ? JSON.parse(savedClients) : dataset.clients);
    setInvoices(savedInvoices ? JSON.parse(savedInvoices) : dataset.invoices);
    setProjects(savedProjects ? JSON.parse(savedProjects) : dataset.projects);
    setTours(savedTours ? JSON.parse(savedTours) : dataset.tours);
    setAccounts(savedAccounts ? JSON.parse(savedAccounts) : dataset.accounts);
    setTransactions(savedTransactions ? JSON.parse(savedTransactions) : dataset.transactions);
    setShareholders(savedShareholders ? JSON.parse(savedShareholders) : initialShareholders);
    setEmployees(savedEmployees ? JSON.parse(savedEmployees) : initialEmployees);
    setDistributionRule(savedDistRule ? JSON.parse(savedDistRule) : initialDistributionRule);
    setDistributionSessions(savedDistSessions ? JSON.parse(savedDistSessions) : initialDistributionSessions);

    setCurrentTenantId(newTenantId);
    showToast(`Basculé sur l'espace "${tenants.find((t) => t.id === newTenantId)?.name || newTenantId}"`, 'info');
  };

  // Add new Tenant
  const addTenant = (tenantData: Omit<AssociationTenant, 'id' | 'createdAt'>): AssociationTenant => {
    const newId = `tenant-${Date.now()}`;
    const today = new Date().toISOString().split('T')[0];
    const initialExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const newTenant: AssociationTenant = {
      ...tenantData,
      id: newId,
      createdAt: today,
      subscription: {
        planName: 'Forfait Association SaaS',
        monthlyPrice: 5000,
        currency: 'FCFA',
        status: 'active',
        currentPeriodStart: today,
        currentPeriodEnd: initialExpiry,
        autoRenew: true,
        lastPaymentDate: today,
        lastPaymentMethod: 'wave',
        lastPaymentReference: `WAVE-INIT-${Date.now().toString().slice(-6)}`,
        paymentHistory: [
          {
            id: `sub-init-${Date.now()}`,
            date: today,
            amount: 5000,
            months: 1,
            paymentMethod: 'wave',
            reference: `WAVE-INIT-${Date.now().toString().slice(-6)}`,
            invoiceNumber: `FACT-SAAS-${today.replace(/-/g, '')}-${tenantData.acronym || 'ASSO'}`,
            status: 'paid',
          },
        ],
      },
    };

    const newTenantSettings: OrganizationSettings = {
      name: newTenant.name,
      subtitle: newTenant.description || `Gestion Administrative & Financière ${newTenant.name}`,
      acronym: newTenant.acronym,
      organizationType: newTenant.type,
      currency: newTenant.currency,
      defaultTaxRate: 0,
      baseContribution: newTenant.baseContribution,
      meetingFrequency: newTenant.meetingFrequency,
      meetingDay: newTenant.meetingDay,
      latePenaltyAmount: newTenant.latePenaltyAmount,
      latePenaltyGraceDays: newTenant.latePenaltyGraceDays,
      absencePenaltyAmount: newTenant.absencePenaltyAmount,
      address: 'Maison des Associations',
      city: 'Abidjan',
      country: "Côte d'Ivoire",
      phone: '+225 ',
      email: `bureau@${newTenant.acronym.toLowerCase()}.ci`,
      website: `www.${newTenant.acronym.toLowerCase()}.ci`,
      rccm: 'En cours d\'enregistrement',
      waveNumber: '',
      orangeMoneyNumber: '',
      mtnMomoNumber: '',
      bankName: 'Banque Partenaire',
      bankIban: '',
      bankRib: '',
    };

    const newTenantAccounts: CashAccount[] = [
      {
        id: `acc-${newId}-1`,
        name: `Caisse Wave ${newTenant.acronym}`,
        type: 'wave',
        accountNumber: 'Non configuré',
        balance: 0,
        currency: newTenant.currency,
        color: 'from-sky-500 to-blue-600',
      },
      {
        id: `acc-${newId}-2`,
        name: `Caisse Orange Money`,
        type: 'orange_money',
        accountNumber: 'Non configuré',
        balance: 0,
        currency: newTenant.currency,
        color: 'from-amber-500 to-orange-600',
      },
      {
        id: `acc-${newId}-3`,
        name: `Caisse Espèces Bureau`,
        type: 'cash',
        accountNumber: 'CAISSE-ESP-01',
        balance: 0,
        currency: newTenant.currency,
        color: 'from-purple-600 to-indigo-700',
      },
      {
        id: `acc-${newId}-4`,
        name: `Compte Bancaire ${newTenant.acronym}`,
        type: 'bank',
        accountNumber: 'En attente RIB',
        balance: 0,
        currency: newTenant.currency,
        color: 'from-emerald-600 to-teal-700',
      },
    ];

    // Seed initial tenant storage
    localStorage.setItem(getTenantKey(newId, 'settings'), JSON.stringify(newTenantSettings));
    localStorage.setItem(getTenantKey(newId, 'clients'), JSON.stringify([]));
    localStorage.setItem(getTenantKey(newId, 'accounts'), JSON.stringify(newTenantAccounts));
    localStorage.setItem(getTenantKey(newId, 'transactions'), JSON.stringify([]));
    localStorage.setItem(getTenantKey(newId, 'tours'), JSON.stringify([]));
    localStorage.setItem(getTenantKey(newId, 'invoices'), JSON.stringify([]));
    localStorage.setItem(getTenantKey(newId, 'projects'), JSON.stringify([]));

    setTenants((prev) => [...prev, newTenant]);

    // Switch to new tenant immediately
    setSettings(newTenantSettings);
    setClients([]);
    setAccounts(newTenantAccounts);
    setTransactions([]);
    setTours([]);
    setInvoices([]);
    setProjects([]);
    setCurrentTenantId(newId);

    return newTenant;
  };

  const updateTenant = (updated: AssociationTenant) => {
    setTenants((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    if (updated.id === currentTenantId) {
      setSettings((prev) => ({
        ...prev,
        name: updated.name,
        acronym: updated.acronym,
        organizationType: updated.type,
        baseContribution: updated.baseContribution,
        meetingFrequency: updated.meetingFrequency,
        meetingDay: updated.meetingDay,
        latePenaltyAmount: updated.latePenaltyAmount,
        latePenaltyGraceDays: updated.latePenaltyGraceDays,
        absencePenaltyAmount: updated.absencePenaltyAmount,
      }));
    }
  };

  const renewTenantSubscription = (
    tenantId: string,
    months: number,
    paymentMethod: PaymentMethod,
    reference?: string
  ) => {
    const target = tenants.find((t) => t.id === tenantId);
    if (!target) return;

    // 5 000 FCFA / month. If 12 months, 50 000 FCFA (2 months free)
    const amountPaid = months === 12 ? 50000 : 5000 * months;
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0];

    let baseDate = now;
    if (target.subscription?.currentPeriodEnd) {
      const currentEnd = new Date(target.subscription.currentPeriodEnd);
      if (currentEnd > now) {
        baseDate = currentEnd;
      }
    }

    const newEnd = new Date(baseDate);
    newEnd.setMonth(newEnd.getMonth() + months);
    const newEndStr = newEnd.toISOString().split('T')[0];

    const ref = reference || `${paymentMethod.toUpperCase()}-SUB-${Date.now().toString().slice(-6)}`;
    const newRecord = {
      id: `sub-pay-${Date.now()}`,
      date: currentDate,
      amount: amountPaid,
      months,
      paymentMethod,
      reference: ref,
      invoiceNumber: `FACT-SAAS-${currentDate.replace(/-/g, '')}-${target.acronym}`,
      status: 'paid' as const,
    };

    const updatedSubscription = {
      planName: target.subscription?.planName || 'Forfait Association SaaS',
      monthlyPrice: 5000,
      currency: 'FCFA',
      status: 'active' as const,
      currentPeriodStart: currentDate,
      currentPeriodEnd: newEndStr,
      autoRenew: true,
      lastPaymentDate: currentDate,
      lastPaymentMethod: paymentMethod,
      lastPaymentReference: ref,
      paymentHistory: [newRecord, ...(target.subscription?.paymentHistory || [])],
    };

    const updatedTenant: AssociationTenant = {
      ...target,
      subscription: updatedSubscription,
    };

    setTenants((prev) => prev.map((t) => (t.id === tenantId ? updatedTenant : t)));

    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 },
    });

    showToast(
      `Abonnement SaaS de "${target.name}" renouvelé avec succès pour ${months} mois (${new Intl.NumberFormat('fr-FR').format(amountPaid)} FCFA) !`,
      'success'
    );
  };

  // Currency Formatter
  const formatMoney = (amount: number): string => {
    const rounded = Math.round(amount);
    const formatted = new Intl.NumberFormat('fr-FR').format(rounded);
    if (settings.currency === 'XOF') {
      return `${formatted} FCFA`;
    } else if (settings.currency === 'EUR') {
      return `${formatted} €`;
    } else {
      return `$${formatted}`;
    }
  };

  // Add Invoice
  const addInvoice = (invoiceData: Omit<Invoice, 'id' | 'number'> & { customNumber?: string }): Invoice => {
    const nextNum = invoices.length + 1;
    const prefix = invoiceData.type === 'quote' ? 'DEV-2025-' : 'FAC-2025-';
    const number = invoiceData.customNumber || `${prefix}${String(nextNum).padStart(3, '0')}`;
    const newInvoice: Invoice = {
      ...invoiceData,
      id: `inv-${Date.now()}`,
      number,
    };

    setInvoices((prev) => [newInvoice, ...prev]);

    // Update client total billed & outstanding
    setClients((prev) =>
      prev.map((c) => {
        if (c.id === newInvoice.clientId) {
          const isQuote = newInvoice.type === 'quote';
          const billedDiff = isQuote ? 0 : newInvoice.total;
          const outstandingDiff = isQuote
            ? 0
            : newInvoice.status === 'paid'
            ? 0
            : newInvoice.total - newInvoice.amountPaid;
          return {
            ...c,
            totalBilled: c.totalBilled + billedDiff,
            outstandingBalance: c.outstandingBalance + outstandingDiff,
          };
        }
        return c;
      })
    );

    return newInvoice;
  };

  const updateInvoice = (updated: Invoice) => {
    setInvoices((prev) => prev.map((inv) => (inv.id === updated.id ? updated : inv)));
  };

  const deleteInvoice = (id: string) => {
    setInvoices((prev) => prev.filter((inv) => inv.id !== id));
  };

  // Record Payment for an invoice
  const recordPayment = (invoiceId: string, amount: number, method: PaymentMethod, accountId: string) => {
    const targetInvoice = invoices.find((inv) => inv.id === invoiceId);
    if (!targetInvoice) return;

    const newAmountPaid = targetInvoice.amountPaid + amount;
    const newStatus: InvoiceStatus = newAmountPaid >= targetInvoice.total ? 'paid' : 'pending';

    const updatedInvoice: Invoice = {
      ...targetInvoice,
      amountPaid: newAmountPaid,
      status: newStatus,
      paymentMethod: method,
      paidAt: newStatus === 'paid' ? new Date().toISOString().split('T')[0] : targetInvoice.paidAt,
    };

    setInvoices((prev) => prev.map((inv) => (inv.id === invoiceId ? updatedInvoice : inv)));

    // Update cash account balance
    const targetAccount = accounts.find((a) => a.id === accountId) || accounts[0];
    if (targetAccount) {
      setAccounts((prev) =>
        prev.map((acc) => (acc.id === targetAccount.id ? { ...acc, balance: acc.balance + amount } : acc))
      );
    }

    // Record Transaction
    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      description: `Règlement ${targetInvoice.number} - ${targetInvoice.clientName}`,
      type: 'income',
      category: 'invoice_payment',
      amount,
      accountId: targetAccount.id,
      accountName: targetAccount.name,
      reference: `PAY-${Date.now().toString().slice(-6)}`,
      clientId: targetInvoice.clientId,
      projectId: targetInvoice.projectId,
    };
    setTransactions((prev) => [newTx, ...prev]);

    // Update client outstanding balance
    setClients((prev) =>
      prev.map((c) => {
        if (c.id === targetInvoice.clientId) {
          return {
            ...c,
            outstandingBalance: Math.max(0, c.outstandingBalance - amount),
          };
        }
        return c;
      })
    );

    // Celebratory effect if paid fully
    if (newStatus === 'paid') {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // Safe fallback
      }
    }
  };

  // Convert Quote to Invoice
  const convertQuoteToInvoice = (quoteId: string) => {
    const targetQuote = invoices.find((inv) => inv.id === quoteId);
    if (!targetQuote || targetQuote.type !== 'quote') return;

    const nextInvoiceCount = invoices.filter((i) => i.type === 'invoice').length + 1;
    const invoiceNumber = `FAC-2025-${String(nextInvoiceCount).padStart(3, '0')}`;

    const newInvoice: Invoice = {
      ...targetQuote,
      id: `inv-${Date.now()}`,
      number: invoiceNumber,
      type: 'invoice',
      status: 'pending',
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: `Généré à partir du devis ${targetQuote.number}. ${targetQuote.notes || ''}`,
    };

    setInvoices((prev) => [newInvoice, ...prev]);

    // Mark quote as paid or accepted
    updateInvoice({ ...targetQuote, status: 'paid' });

    // Update client balance
    setClients((prev) =>
      prev.map((c) =>
        c.id === newInvoice.clientId
          ? {
              ...c,
              totalBilled: c.totalBilled + newInvoice.total,
              outstandingBalance: c.outstandingBalance + newInvoice.total,
            }
          : c
      )
    );
  };

  // Toast Notification state
  const [toastNotification, setToastNotification] = useState<{
    message: string;
    type: 'success' | 'info' | 'warning';
  } | null>(null);

  const clearToast = () => setToastNotification(null);

  const showToast = (message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setToastNotification({ message, type });
    setTimeout(() => {
      setToastNotification(null);
    }, 4500);
  };

  // Send Invoice Reminder System
  const sendInvoiceReminder = (
    invoiceId: string,
    reminderData: {
      channel: ReminderChannel;
      level: ReminderLevel;
      recipient: string;
      notes?: string;
    }
  ) => {
    const targetInvoice = invoices.find((inv) => inv.id === invoiceId);
    if (!targetInvoice) return;

    const newRecord: InvoiceReminderRecord = {
      id: `rem-${Date.now()}`,
      sentAt: new Date().toISOString(),
      channel: reminderData.channel,
      level: reminderData.level,
      recipient: reminderData.recipient,
      notes: reminderData.notes,
    };

    const newRemindersSent = (targetInvoice.remindersSent || 0) + 1;

    const updatedInvoice: Invoice = {
      ...targetInvoice,
      remindersSent: newRemindersSent,
      lastReminderAt: new Date().toISOString(),
      lastReminderChannel: reminderData.channel,
      remindersHistory: [...(targetInvoice.remindersHistory || []), newRecord],
    };

    setInvoices((prev) => prev.map((inv) => (inv.id === invoiceId ? updatedInvoice : inv)));

    const channelNames: Record<ReminderChannel, string> = {
      email: 'Email',
      whatsapp: 'WhatsApp',
      sms: 'SMS',
      letter: 'Courrier officiel',
    };

    const channelLabel = channelNames[reminderData.channel] || 'Rappel';
    setToastNotification({
      message: `Rappel N°${newRemindersSent} envoyé avec succès (${channelLabel}) à ${targetInvoice.clientName} !`,
      type: 'success',
    });

    setTimeout(() => {
      setToastNotification(null);
    }, 4500);
  };

  // Client Management
  const addClient = (clientData: Omit<Client, 'id' | 'totalBilled' | 'outstandingBalance' | 'createdAt'>): Client => {
    const colors = ['bg-indigo-500', 'bg-emerald-500', 'bg-sky-500', 'bg-rose-500', 'bg-amber-500', 'bg-purple-500'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const newClient: Client = {
      ...clientData,
      id: `cli-${Date.now()}`,
      avatarColor: randomColor,
      totalBilled: 0,
      outstandingBalance: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setClients((prev) => [newClient, ...prev]);
    return newClient;
  };

  const updateClient = (updated: Client) => {
    setClients((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  };

  const deleteClient = (id: string) => {
    setClients((prev) => prev.filter((c) => c.id !== id));
  };

  // Project Management
  const addProject = (projectData: Omit<Project, 'id' | 'code' | 'spent' | 'progress'>): Project => {
    const nextCode = `PRJ-${String(projects.length + 1).padStart(2, '0')}`;
    const newProject: Project = {
      ...projectData,
      id: `prj-${Date.now()}`,
      code: nextCode,
      spent: 0,
      progress: 0,
    };
    setProjects((prev) => [newProject, ...prev]);
    return newProject;
  };

  const updateProject = (updated: Project) => {
    setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const deleteProject = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  const toggleTask = (projectId: string, taskId: string) => {
    setProjects((prev) =>
      prev.map((proj) => {
        if (proj.id !== projectId) return proj;
        const updatedTasks = proj.tasks.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t));
        const completedCount = updatedTasks.filter((t) => t.completed).length;
        const newProgress = updatedTasks.length > 0 ? Math.round((completedCount / updatedTasks.length) * 100) : 0;
        return {
          ...proj,
          tasks: updatedTasks,
          progress: newProgress,
          status: newProgress === 100 ? 'completed' : proj.status === 'planned' ? 'in_progress' : proj.status,
        };
      })
    );
  };

  const addTask = (projectId: string, taskData: Omit<ProjectTask, 'id'>) => {
    setProjects((prev) =>
      prev.map((proj) => {
        if (proj.id !== projectId) return proj;
        const newTask: ProjectTask = {
          ...taskData,
          id: `tsk-${Date.now()}`,
        };
        const updatedTasks = [...proj.tasks, newTask];
        const completedCount = updatedTasks.filter((t) => t.completed).length;
        const newProgress = Math.round((completedCount / updatedTasks.length) * 100);
        return {
          ...proj,
          tasks: updatedTasks,
          progress: newProgress,
        };
      })
    );
  };

  const deleteTask = (projectId: string, taskId: string) => {
    setProjects((prev) =>
      prev.map((proj) => {
        if (proj.id !== projectId) return proj;
        const updatedTasks = proj.tasks.filter((t) => t.id !== taskId);
        const completedCount = updatedTasks.filter((t) => t.completed).length;
        const newProgress = updatedTasks.length > 0 ? Math.round((completedCount / updatedTasks.length) * 100) : 0;
        return {
          ...proj,
          tasks: updatedTasks,
          progress: newProgress,
        };
      })
    );
  };

  // Tours Management (Tontine / Permanences)
  const addTour = (tourData: Omit<TontineTour, 'id' | 'tourNumber'>) => {
    const nextTourNum = tours.length + 1;
    const newTour: TontineTour = {
      ...tourData,
      id: `tur-${Date.now()}`,
      tourNumber: nextTourNum,
    };
    setTours((prev) => [...prev, newTour]);
  };

  const updateTour = (updated: TontineTour) => {
    setTours((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  };

  const payoutTour = (tourId: string, accountId: string, paymentMethod: PaymentMethod = 'wave', reference?: string) => {
    const tour = tours.find((t) => t.id === tourId);
    if (!tour) return;
    const targetAccount = accounts.find((a) => a.id === accountId) || accounts[0];

    updateTour({
      ...tour,
      status: 'paid_out',
    });

    addTransaction({
      date: new Date().toISOString().split('T')[0],
      description: `Décaissement cagnotte Tour N°${tour.tourNumber} versé à ${tour.beneficiaryName}`,
      type: 'expense',
      category: 'tontine_payout',
      amount: tour.amount,
      accountId: targetAccount.id,
      accountName: targetAccount.name,
      paymentMethod,
      memberId: tour.beneficiaryId,
      memberName: tour.beneficiaryName,
      reference: reference || `DEC-TOUR-${tour.tourNumber}`,
      notes: `Versement de la cagnotte tontine ordonné par le bureau exécutif`,
    });

    showToast(`Cagnotte de ${formatMoney(tour.amount)} décaissée et versée à ${tour.beneficiaryName} !`, 'success');
  };

  // Transactions Management
  const addTransaction = (txData: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = {
      ...txData,
      id: `tx-${Date.now()}`,
    };
    setTransactions((prev) => [newTx, ...prev]);

    // Update account balance
    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === txData.accountId) {
          const delta = txData.type === 'income' ? txData.amount : -txData.amount;
          return { ...acc, balance: acc.balance + delta };
        }
        return acc;
      })
    );

    // Update member counters if linked to a member
    if (txData.memberId) {
      setClients((prev) =>
        prev.map((c) => {
          if (c.id === txData.memberId) {
            const contribDelta = txData.category === 'contribution' && txData.type === 'income' ? txData.amount : 0;
            const penaltyDelta = txData.category === 'penalty' && txData.type === 'income' ? txData.amount : 0;
            return {
              ...c,
              contributionTotal: (c.contributionTotal || 0) + contribDelta,
              penaltiesTotal: (c.penaltiesTotal || 0) + penaltyDelta,
              outstandingBalance: Math.max(0, (c.outstandingBalance || 0) - (txData.type === 'income' ? txData.amount : 0)),
            };
          }
          return c;
        })
      );
    }
  };

  const addAccount = (accData: Omit<CashAccount, 'id'>): CashAccount => {
    const newAcc: CashAccount = {
      ...accData,
      id: `acc-${Date.now()}`,
    };
    setAccounts((prev) => [...prev, newAcc]);
    showToast(`Compte / Caisse "${newAcc.name}" créé avec succès !`, 'success');
    return newAcc;
  };

  const updateSettings = (newSettings: Partial<OrganizationSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const resetToDefaults = () => {
    setSettings(initialSettings);
    setClients(initialClients);
    setInvoices(initialInvoices);
    setProjects(initialProjects);
    setTours(initialTours);
    setAccounts(initialAccounts);
    setTransactions(initialTransactions);
    localStorage.clear();
  };

  const exportDataJSON = () => {
    const data = {
      settings,
      clients,
      invoices,
      projects,
      tours,
      accounts,
      transactions,
      shareholders,
      employees,
      distributionRule,
      distributionSessions,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nexus_gestion_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Active Member computation
  const activeMember = clients.find((c) => c.id === activeMemberId) || clients[0];

  // Member Contribution Online Payment (by Member themselves or Admin)
  const recordMemberContributionPayment = (
    memberId: string,
    amount: number,
    method: PaymentMethod,
    accountId: string,
    monthsCount: number = 1,
    notes?: string
  ) => {
    const member = clients.find((c) => c.id === memberId);
    if (!member) return;

    const today = new Date().toISOString().split('T')[0];
    const monthName = new Date().toLocaleString('fr-FR', { month: 'long', year: 'numeric' });
    const capitalizedPeriod = monthName.charAt(0).toUpperCase() + monthName.slice(1);

    const newContributionTotal = (member.contributionTotal || 0) + amount;
    const newOutstanding = Math.max(0, (member.outstandingBalance || 0) - amount);

    // Update member record
    setClients((prev) =>
      prev.map((c) => {
        if (c.id === memberId) {
          return {
            ...c,
            contributionTotal: newContributionTotal,
            outstandingBalance: newOutstanding,
            lastContributionDate: today,
            lastContributionPeriod: capitalizedPeriod,
            notes: notes ? `${c.notes || ''} | [${today}] Cotisation réglée: ${amount} FCFA` : c.notes,
          };
        }
        return c;
      })
    );

    // Credit Cash Account
    const targetAccount = accounts.find((a) => a.id === accountId) || accounts[0];
    if (targetAccount) {
      setAccounts((prev) =>
        prev.map((acc) => (acc.id === targetAccount.id ? { ...acc, balance: acc.balance + amount } : acc))
      );
    }

    // Record Transaction
    const ref = `COT-${Date.now().toString().slice(-6)}`;
    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      date: today,
      description: `Cotisation mensuelle (${monthsCount} mois) - ${member.name}`,
      type: 'income',
      category: 'contribution',
      amount,
      accountId: targetAccount ? targetAccount.id : 'acc-1',
      accountName: targetAccount ? targetAccount.name : 'Caisse Principale',
      paymentMethod: method,
      memberId: member.id,
      memberName: member.name,
      reference: ref,
      notes: notes || `Règlement cotisation en ligne via ${method.toUpperCase()}`,
    };
    setTransactions((prev) => [newTx, ...prev]);

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });

    showToast(
      `Cotisation de ${member.name} enregistrée avec succès (${new Intl.NumberFormat('fr-FR').format(amount)} FCFA via ${method.toUpperCase()}) !`,
      'success'
    );
  };

  // Shareholders Management
  const addShareholder = (shData: Omit<Shareholder, 'id' | 'totalDividendsReceived'>) => {
    const newSh: Shareholder = {
      ...shData,
      id: `sh-${Date.now()}`,
      totalDividendsReceived: 0,
    };
    setShareholders((prev) => [...prev, newSh]);
    showToast(`Actionnaire / Partenaire "${newSh.name}" ajouté avec succès !`, 'success');
  };

  const updateShareholder = (sh: Shareholder) => {
    setShareholders((prev) => prev.map((item) => (item.id === sh.id ? sh : item)));
    showToast(`Fiche actionnaire "${sh.name}" mise à jour !`, 'info');
  };

  const deleteShareholder = (id: string) => {
    setShareholders((prev) => prev.filter((item) => item.id !== id));
    showToast(`Actionnaire retiré avec succès.`, 'info');
  };

  // Employees Management
  const addEmployee = (empData: Omit<Employee, 'id' | 'totalPaid'>) => {
    const newEmp: Employee = {
      ...empData,
      id: `emp-${Date.now()}`,
      totalPaid: 0,
    };
    setEmployees((prev) => [...prev, newEmp]);
    showToast(`Employé / Prestataire "${newEmp.name}" ajouté avec succès !`, 'success');
  };

  const updateEmployee = (emp: Employee) => {
    setEmployees((prev) => prev.map((item) => (item.id === emp.id ? emp : item)));
    showToast(`Fiche employé "${emp.name}" mise à jour !`, 'info');
  };

  const deleteEmployee = (id: string) => {
    setEmployees((prev) => prev.filter((item) => item.id !== id));
    showToast(`Employé retiré avec succès.`, 'info');
  };

  // Distribution Rule
  const updateDistributionRule = (newRule: Partial<DistributionRuleConfig>) => {
    setDistributionRule((prev) => ({ ...prev, ...newRule }));
    showToast(`Clé de répartition des recettes mise à jour !`, 'success');
  };

  // Execute Distribution Session
  const executeDistributionSession = (
    sessionData: Omit<DistributionSession, 'id' | 'status' | 'executedAt'>
  ) => {
    const today = new Date().toISOString().split('T')[0];
    const newSessionId = `dist-${Date.now()}`;
    const executedSession: DistributionSession = {
      ...sessionData,
      id: newSessionId,
      status: 'executed',
      executedAt: `${today} ${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`,
      payments: sessionData.payments.map((p, idx) => ({
        ...p,
        status: 'paid',
        paidAt: today,
        reference: p.reference || `REF-DIST-${Date.now().toString().slice(-4)}-${idx + 1}`,
      })),
    };

    setDistributionSessions((prev) => [executedSession, ...prev]);

    // Deduct total distributed from source account
    const sourceAcc = accounts.find((a) => a.id === sessionData.sourceAccountId) || accounts[0];
    if (sourceAcc) {
      setAccounts((prev) =>
        prev.map((acc) =>
          acc.id === sourceAcc.id
            ? { ...acc, balance: Math.max(0, acc.balance - sessionData.totalRevenueAmount) }
            : acc
        )
      );
    }

    // Create journal expense transactions
    const newTransactions: Transaction[] = sessionData.payments.map((p, idx) => ({
      id: `tx-dist-${Date.now()}-${idx}`,
      date: today,
      description: `[Répartition Recettes] ${p.recipientType === 'shareholder' ? 'Dividende' : p.recipientType === 'employee' ? 'Rémunération' : 'Fonds Réserve'} - ${p.recipientName}`,
      type: 'expense',
      category: p.recipientType === 'employee' ? 'salary' : p.recipientType === 'shareholder' ? 'dividend' : 'other_expense',
      amount: p.amount,
      accountId: sourceAcc?.id || 'acc-1',
      accountName: sourceAcc?.name || 'Caisse Principale',
      paymentMethod: p.paymentMethod,
      reference: p.reference || `PAY-DIST-${idx + 1}`,
      notes: `Période: ${sessionData.period} | Rôle/Parts: ${p.roleOrShares}`,
    }));

    setTransactions((prev) => [...newTransactions, ...prev]);

    // Update total dividends on shareholders and total paid on employees
    setShareholders((prev) =>
      prev.map((sh) => {
        const match = sessionData.payments.find(
          (p) => p.recipientType === 'shareholder' && p.recipientId === sh.id
        );
        return match ? { ...sh, totalDividendsReceived: sh.totalDividendsReceived + match.amount } : sh;
      })
    );

    setEmployees((prev) =>
      prev.map((emp) => {
        const match = sessionData.payments.find(
          (p) => p.recipientType === 'employee' && p.recipientId === emp.id
        );
        return match ? { ...emp, totalPaid: emp.totalPaid + match.amount } : emp;
      })
    );

    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.5 },
    });

    showToast(
      `Répartition des recettes exécutée avec succès ! ${sessionData.payments.length} règlements effectués (${new Intl.NumberFormat('fr-FR').format(sessionData.totalRevenueAmount)} FCFA).`,
      'success'
    );
  };

  // Upcoming tours
  const nextScheduledTour = tours.find((t) => t.status === 'scheduled' || t.status === 'collected');

  // Members with late cotisations
  const overdueMembers = clients.filter(
    (c) => (c.status === 'active' || (c as any).memberStatus === 'active') && (c.outstandingBalance || 0) > 0
  );

  // Notifications calculation
  const notifications = [
    // Alertes cotisations en retard
    ...overdueMembers.map((m) => ({
      id: `notif-cotis-${m.id}`,
      title: `Cotisation en retard : ${m.name}`,
      desc: `Arriéré de ${formatMoney(m.outstandingBalance)} dont pénalité de retard (+${formatMoney(settings.latePenaltyAmount)}).`,
      type: 'warning' as const,
      date: new Date().toISOString().split('T')[0],
    })),
    // Prochain tour de tontine / permanence
    ...(nextScheduledTour
      ? [
          {
            id: `notif-tour-${nextScheduledTour.id}`,
            title: `Prochaine séance Tontine : Tour N°${nextScheduledTour.tourNumber}`,
            desc: `Bénéficiaire : ${nextScheduledTour.beneficiaryName} • Cagnotte : ${formatMoney(nextScheduledTour.amount)} • Date : ${nextScheduledTour.targetDate}`,
            type: 'info' as const,
            date: nextScheduledTour.targetDate,
          },
        ]
      : []),
    ...invoices
      .filter((inv) => isInvoiceOverdue(inv))
      .map((inv) => {
        const days = getDaysOverdue(inv.dueDate);
        const remaining = inv.total - inv.amountPaid;
        return {
          id: `notif-overdue-${inv.id}`,
          invoiceId: inv.id,
          title: `Facture en retard (${days > 0 ? `+${days}j` : 'Échue'}) : ${inv.number}`,
          desc: `${inv.clientName} doit encore ${formatMoney(remaining)}${
            inv.remindersSent ? ` • ${inv.remindersSent} relance(s) effectuée(s)` : ' • Aucune relance envoyée'
          }`,
          type: 'warning' as const,
          date: inv.dueDate,
          daysOverdue: days,
        };
      }),
    ...projects
      .filter((p) => p.status === 'review')
      .map((p) => ({
        id: `notif-proj-${p.id}`,
        title: `Projet en revue : ${p.title}`,
        desc: `Validation finale en attente (${p.progress}%)`,
        type: 'info' as const,
        date: p.dueDate,
      })),
  ];

  return (
    <AppContext.Provider
      value={{
        userRole,
        setUserRole,
        activeMemberId,
        setActiveMemberId,
        activeMember,
        recordMemberContributionPayment,
        shareholders,
        addShareholder,
        updateShareholder,
        deleteShareholder,
        employees,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        distributionRule,
        updateDistributionRule,
        distributionSessions,
        executeDistributionSession,
        tenants,
        currentTenantId,
        currentTenant,
        switchTenant,
        addTenant,
        updateTenant,
        renewTenantSubscription,
        isSubscriptionModalOpen,
        setIsSubscriptionModalOpen,
        openSubscriptionModal,
        settings,
        clients,
        invoices,
        projects,
        tours,
        accounts,
        transactions,
        activeTab,
        setActiveTab,
        formatMoney,
        addInvoice,
        updateInvoice,
        deleteInvoice,
        recordPayment,
        convertQuoteToInvoice,
        sendInvoiceReminder,
        toastNotification,
        clearToast,
        showToast,
        addClient,
        updateClient,
        deleteClient,
        addProject,
        updateProject,
        deleteProject,
        toggleTask,
        addTask,
        deleteTask,
        addTour,
        updateTour,
        payoutTour,
        addAccount,
        addTransaction,
        updateSettings,
        resetToDefaults,
        exportDataJSON,
        notifications,
        securityConfig,
        updateSecurityConfig,
        securityAuditLogs,
        addSecurityLog,
        lockApp,
        unlockAppWithPin,
        changeSecurityPin,
        isSecurityModalOpen,
        setIsSecurityModalOpen,
        openSecurityModal,
        softwareUpdateState,
        isUpdateModalOpen,
        setIsUpdateModalOpen,
        openUpdateModal,
        checkForUpdates,
        applySoftwareUpdate,
        rollbackSoftwareUpdate,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export type PaymentMethod =
  | 'wave'
  | 'orange_money'
  | 'mtn_momo'
  | 'moov_money'
  | 'djamo'
  | 'bank_transfer'
  | 'cash'
  | 'check';

export type InvoiceStatus = 'draft' | 'pending' | 'paid' | 'overdue' | 'cancelled';
export type InvoiceType = 'invoice' | 'quote';

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export type ReminderChannel = 'email' | 'whatsapp' | 'sms' | 'letter';
export type ReminderLevel = 'friendly' | 'firm' | 'urgent' | 'formal_notice';

export interface InvoiceReminderRecord {
  id: string;
  sentAt: string;
  channel: ReminderChannel;
  level: ReminderLevel;
  recipient: string;
  notes?: string;
}

export interface Invoice {
  id: string;
  number: string;
  type: InvoiceType;
  clientId: string;
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  clientAddress?: string;
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number; // e.g. 18 for 18%
  taxAmount: number;
  discount: number;
  total: number;
  amountPaid: number;
  status: InvoiceStatus;
  paymentMethod?: PaymentMethod;
  notes?: string;
  projectId?: string;
  projectName?: string;
  paidAt?: string;
  remindersSent?: number;
  lastReminderAt?: string;
  lastReminderChannel?: ReminderChannel;
  remindersHistory?: InvoiceReminderRecord[];
  dgiStickerNumber?: string;
  clientNcc?: string;
  taxRegime?: string;
  isDgiNormalisee?: boolean;
  airsiRate?: number;
  airsiAmount?: number;
}

export type ClientType = 'enterprise' | 'individual' | 'member';
export type ClientStatus = 'active' | 'inactive' | 'lead' | 'radiated' | 'suspended';
export type MemberStatus = 'active' | 'radiated' | 'suspended';

export type BureauRole =
  | 'president'
  | 'vice_president'
  | 'secretary_general'
  | 'deputy_secretary'
  | 'treasurer'
  | 'auditor'
  | 'organizer'
  | 'member';

export interface MemberMonthlyContribution {
  month: string; // e.g. "Jan", "Fév", "Mar", etc.
  monthIndex: number; // 0 to 11
  year: number;
  expectedAmount: number;
  paidAmount: number;
  isPaid: boolean;
  paymentDate?: string;
  paymentMethod?: PaymentMethod;
  reference?: string;
}

export interface Client {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  matricule?: string;
  type: ClientType;
  companyName?: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  commune?: string;
  ncc?: string; // Numéro Compte Contribuable (entreprises CI)
  status: ClientStatus;
  memberStatus?: MemberStatus;
  bureauRole?: BureauRole;
  notes?: string;
  avatarColor: string;
  totalBilled: number;
  outstandingBalance: number;
  contributionTotal?: number;
  monthlyContribution?: number;
  lastContributionDate?: string;
  lastContributionPeriod?: string;
  penaltiesTotal?: number;
  contributionsHistory?: MemberMonthlyContribution[];
  joinDate?: string;
  createdAt: string;
}

export type ProjectStatus = 'planned' | 'in_progress' | 'review' | 'completed' | 'on_hold';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface ProjectTask {
  id: string;
  title: string;
  completed: boolean;
  assignee?: string;
  dueDate?: string;
  priority: TaskPriority;
}

export interface Project {
  id: string;
  code: string;
  title: string;
  description: string;
  clientId: string;
  clientName: string;
  status: ProjectStatus;
  priority: TaskPriority;
  budget: number;
  spent: number;
  startDate: string;
  dueDate: string;
  progress: number;
  category: 'digital' | 'consulting' | 'construction' | 'event' | 'mutual';
  tasks: ProjectTask[];
}

export interface TontineTour {
  id: string;
  tourNumber: number;
  beneficiaryName: string;
  beneficiaryId: string;
  targetDate: string;
  amount: number;
  status: 'scheduled' | 'collected' | 'paid_out' | 'overdue';
  collectedAmount?: number;
  notes?: string;
}

export interface CashAccount {
  id: string;
  name: string;
  type: 'wave' | 'orange_money' | 'mtn_momo' | 'moov_money' | 'djamo' | 'bank' | 'cash';
  accountNumber: string;
  balance: number;
  currency: string;
  color: string;
  operatorNumber?: string;
  lastReconciledBalance?: number;
  lastReconciledDate?: string;
}

export type TransactionCategory =
  | 'contribution'
  | 'tontine_payout'
  | 'penalty'
  | 'donation'
  | 'grant'
  | 'admission_fee'
  | 'event_expense'
  | 'social_aid'
  | 'operating_expense'
  | 'project_cost'
  | 'other_income'
  | 'other_expense'
  | 'refreshment'
  | 'aid_assistance'
  | 'salary'
  | 'dividend'
  | 'revenue_distribution'
  | 'share_capital'
  | 'service'
  | 'equipment'
  | 'invoice_payment'
  | 'other';

export interface Transaction {
  id: string;
  date: string;
  description: string;
  type: 'income' | 'expense' | 'transfer';
  category: TransactionCategory;
  amount: number;
  accountId: string;
  accountName: string;
  paymentMethod?: PaymentMethod;
  memberId?: string;
  memberName?: string;
  reference?: string;
  clientId?: string;
  projectId?: string;
  notes?: string;
}

export type SubscriptionStatus = 'active' | 'trial' | 'past_due' | 'expired';

export interface SubscriptionPaymentRecord {
  id: string;
  date: string;
  amount: number;
  months: number;
  paymentMethod: PaymentMethod;
  reference: string;
  invoiceNumber: string;
  status: 'paid' | 'pending';
}

export interface TenantSubscription {
  planName: string;
  monthlyPrice: number; // 5000 FCFA
  currency: string; // 'FCFA' / 'XOF'
  status: SubscriptionStatus;
  trialEndsAt?: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  autoRenew: boolean;
  lastPaymentDate?: string;
  lastPaymentMethod?: PaymentMethod;
  lastPaymentReference?: string;
  paymentHistory: SubscriptionPaymentRecord[];
}

export interface AssociationTenant {
  id: string;
  name: string;
  acronym: string;
  type: 'association' | 'tontine' | 'mutuelle';
  currency: 'XOF' | 'EUR' | 'USD';
  color: string;
  description: string;
  baseContribution: number;
  meetingFrequency: 'weekly' | 'biweekly' | 'monthly' | 'quarterly';
  meetingDay?: string;
  latePenaltyAmount: number;
  latePenaltyGraceDays: number;
  absencePenaltyAmount: number;
  createdAt: string;
  subscription?: TenantSubscription;
}

export interface OrganizationSettings {
  name: string;
  subtitle: string;
  acronym?: string;
  organizationType: 'agency' | 'association' | 'tontine' | 'mutuelle';
  currency: 'XOF' | 'EUR' | 'USD';
  defaultTaxRate: number;
  baseContribution: number;
  meetingFrequency: 'weekly' | 'biweekly' | 'monthly' | 'quarterly';
  meetingDay?: string;
  latePenaltyAmount: number;
  latePenaltyGraceDays: number;
  absencePenaltyAmount: number;
  address: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  website: string;
  rccm: string; // Numéro de récépissé ou Registre RCCM
  ncc?: string; // Numéro Compte Contribuable DGI Côte d'Ivoire
  taxCenter?: string; // Centre des Impôts de rattachement (CDI Cocody, Plateau, etc.)
  taxRegime?: string; // Régime Réel Normal, RSI, Entreprenant, Exonéré Art. 355 CGI
  invoiceStandardType?: 'dgi_normalisee' | 'standard' | 'association_exempt';
  waveNumber: string;
  orangeMoneyNumber: string;
  mtnMomoNumber: string;
  moovMoneyNumber?: string;
  djamoTag?: string;
  bankName: string;
  bankIban: string;
  bankRib: string;
}

export interface MobileMoneyReconciliation {
  id: string;
  accountId: string;
  accountName: string;
  operator: 'wave' | 'orange_money' | 'mtn_momo' | 'moov_money' | 'djamo' | 'bank' | 'cash';
  systemBalance: number;
  actualAppBalance: number;
  difference: number;
  operatorFeeAdjustment?: number;
  reconciledAt: string;
  reconciledBy: string;
  notes?: string;
}

export type UserAppRole = 'admin' | 'member';

export interface Shareholder {
  id: string;
  name: string;
  sharesCount: number; // Nombre de parts détenues
  sharePercentage?: number; // % du capital
  phone: string;
  email?: string;
  paymentMethod: PaymentMethod;
  paymentAccountInfo: string; // Ex: Wave 07 89 02 82 07
  totalDividendsReceived: number;
  notes?: string;
  joinedDate: string;
}

export interface Employee {
  id: string;
  name: string;
  role: string; // Secrétaire, Comptable, Gardien, Régisseur
  contractType: 'salaried' | 'indemnity' | 'contractor';
  monthlySalary: number; // Salaire ou indemnité de base mensuelle
  phone: string;
  email?: string;
  paymentMethod: PaymentMethod;
  paymentAccountInfo: string;
  status: 'active' | 'inactive';
  totalPaid: number;
  hiredDate: string;
}

export interface DistributionRuleConfig {
  reservePercentage: number; // e.g. 20%
  shareholdersPercentage: number; // e.g. 40%
  employeesPercentage: number; // e.g. 30%
  operationsPercentage: number; // e.g. 10%
  notes?: string;
}

export interface DistributionPaymentItem {
  id: string;
  recipientType: 'shareholder' | 'employee' | 'reserve';
  recipientId: string;
  recipientName: string;
  roleOrShares: string;
  amount: number;
  paymentMethod: PaymentMethod;
  accountInfo: string;
  status: 'paid' | 'pending';
  paidAt?: string;
  reference?: string;
}

export interface DistributionSession {
  id: string;
  title: string;
  date: string;
  period: string; // e.g. "Septembre 2026"
  totalRevenueAmount: number; // Montant total des recettes perçues
  sourceAccountId: string;
  sourceAccountName: string;
  reserveAmount: number;
  shareholdersTotalAmount: number;
  employeesTotalAmount: number;
  operationsAmount: number;
  status: 'executed' | 'draft';
  executedAt?: string;
  notes?: string;
  payments: DistributionPaymentItem[];
}

export type SecuritySeverity = 'info' | 'warning' | 'security';

export interface SecurityAuditLog {
  id: string;
  timestamp: string;
  action: string;
  role: UserAppRole;
  details?: string;
  severity: SecuritySeverity;
}

export interface SecurityConfig {
  isLocked: boolean;
  pin: string; // 4-digit PIN, default '1234'
  autoLockMinutes: number; // 0 = disabled, 5, 15, 30
  lastActivityTime: number;
  encryptionActive: boolean;
  failedAttempts: number;
  isBlockedUntil?: number;
}

export interface SoftwareUpdateRelease {
  version: string;
  releaseDate: string;
  title: string;
  summary: string;
  changelog: string[];
  isSecurityPatch: boolean;
  downloadSize: string;
  mandatory: boolean;
}

export interface SoftwareUpdateState {
  currentVersion: string;
  latestVersion: string;
  lastCheckedDate: string;
  isChecking: boolean;
  isUpdating: boolean;
  updateProgress: number; // 0-100
  availableUpdate: SoftwareUpdateRelease | null;
  history: Array<{
    version: string;
    installedAt: string;
    notes: string;
  }>;
}


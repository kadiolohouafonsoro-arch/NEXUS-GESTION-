import React, { useState, useMemo } from 'react';
import {
  GitCompare,
  ArrowLeftRight,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Calendar,
  DollarSign,
  FileText,
  Clock,
  User,
  Layers,
  ChevronDown,
  PieChart as PieChartIcon,
  BarChart3,
  Percent,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Check,
  Building2,
  Briefcase,
  Printer,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import { Project, ProjectStatus } from '../../types';
import { useApp } from '../../context/AppContext';

export interface ProjetComparisonProps {
  initialProjectAId?: string;
  initialProjectBId?: string;
  onClose?: () => void;
  onOpenProjectDetail?: (project: Project) => void;
}

export const ProjetComparison: React.FC<ProjetComparisonProps> = ({
  initialProjectAId,
  initialProjectBId,
  onClose,
  onOpenProjectDetail,
}) => {
  const { projects, invoices, formatMoney } = useApp();

  // Pick initial project IDs
  const defaultAId = initialProjectAId || projects[0]?.id || '';
  const defaultBId =
    initialProjectBId || (projects.length > 1 ? projects[1]?.id : projects[0]?.id) || '';

  const [projectAId, setProjectAId] = useState<string>(defaultAId);
  const [projectBId, setProjectBId] = useState<string>(defaultBId);
  const [activeChartTab, setActiveChartTab] = useState<'financial' | 'progress' | 'breakdown'>('financial');

  // Selected projects
  const projectA = useMemo(
    () => projects.find((p) => p.id === projectAId) || projects[0] || null,
    [projects, projectAId]
  );
  const projectB = useMemo(
    () => projects.find((p) => p.id === projectBId) || (projects.length > 1 ? projects[1] : projects[0]) || null,
    [projects, projectBId]
  );

  // Swap projects function
  const handleSwap = () => {
    setProjectAId(projectBId);
    setProjectBId(projectAId);
  };

  // Helper to compute project metrics
  const getProjectStats = (proj: Project | null) => {
    if (!proj) {
      return {
        budget: 0,
        spent: 0,
        remainingBudget: 0,
        budgetBurnRate: 0,
        progress: 0,
        tasksTotal: 0,
        tasksCompleted: 0,
        taskCompletionRate: 0,
        invoicesCount: 0,
        totalBilled: 0,
        totalPaid: 0,
        totalUnpaid: 0,
        collectionRate: 0,
        billingVsBudgetRate: 0,
        netMargin: 0,
        marginRate: 0,
      };
    }

    const linkedInvoices = invoices.filter(
      (inv) => inv.projectId === proj.id && inv.type === 'invoice'
    );

    const budget = proj.budget || 0;
    const spent = proj.spent || 0;
    const remainingBudget = Math.max(0, budget - spent);
    const budgetBurnRate = budget > 0 ? Math.round((spent / budget) * 100) : 0;

    const progress = proj.progress || 0;
    const tasksTotal = proj.tasks?.length || 0;
    const tasksCompleted = proj.tasks?.filter((t) => t.completed).length || 0;
    const taskCompletionRate = tasksTotal > 0 ? Math.round((tasksCompleted / tasksTotal) * 100) : 0;

    const invoicesCount = linkedInvoices.length;
    const totalBilled = linkedInvoices.reduce((sum, inv) => sum + inv.total, 0);
    const totalPaid = linkedInvoices.reduce((sum, inv) => sum + inv.amountPaid, 0);
    const totalUnpaid = Math.max(0, totalBilled - totalPaid);
    const collectionRate = totalBilled > 0 ? Math.round((totalPaid / totalBilled) * 100) : 0;
    const billingVsBudgetRate = budget > 0 ? Math.round((totalBilled / budget) * 100) : 0;
    const netMargin = totalBilled - spent;
    const marginRate = totalBilled > 0 ? Math.round((netMargin / totalBilled) * 100) : 0;

    return {
      budget,
      spent,
      remainingBudget,
      budgetBurnRate,
      progress,
      tasksTotal,
      tasksCompleted,
      taskCompletionRate,
      invoicesCount,
      totalBilled,
      totalPaid,
      totalUnpaid,
      collectionRate,
      billingVsBudgetRate,
      netMargin,
      marginRate,
    };
  };

  const statsA = useMemo(() => getProjectStats(projectA), [projectA, invoices]);
  const statsB = useMemo(() => getProjectStats(projectB), [projectB, invoices]);

  // Status mapping
  const getStatusInfo = (status?: ProjectStatus) => {
    switch (status) {
      case 'planned':
        return { label: 'Planifié', bg: 'bg-slate-700/60', text: 'text-slate-300', border: 'border-slate-600' };
      case 'in_progress':
        return { label: 'En cours', bg: 'bg-indigo-500/20', text: 'text-indigo-400', border: 'border-indigo-500/30' };
      case 'review':
        return { label: 'En revue', bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30' };
      case 'completed':
        return { label: 'Terminé & Livré', bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30' };
      case 'on_hold':
        return { label: 'En pause', bg: 'bg-rose-500/20', text: 'text-rose-400', border: 'border-rose-500/30' };
      default:
        return { label: 'Inconnu', bg: 'bg-slate-700', text: 'text-slate-300', border: 'border-slate-600' };
    }
  };

  const statusA = getStatusInfo(projectA?.status);
  const statusB = getStatusInfo(projectB?.status);

  // Recharts: Side-by-side financial comparison data
  const financialChartData = useMemo(() => {
    return [
      {
        metric: 'Budget alloué',
        projectA: statsA.budget,
        projectB: statsB.budget,
      },
      {
        metric: 'Dépenses réelles',
        projectA: statsA.spent,
        projectB: statsB.spent,
      },
      {
        metric: 'Montant Facturé',
        projectA: statsA.totalBilled,
        projectB: statsB.totalBilled,
      },
      {
        metric: 'Montant Encaissé',
        projectA: statsA.totalPaid,
        projectB: statsB.totalPaid,
      },
      {
        metric: 'Marge brute',
        projectA: statsA.netMargin,
        projectB: statsB.netMargin,
      },
    ];
  }, [statsA, statsB]);

  // Recharts: Side-by-side operational & completion percentages
  const percentageChartData = useMemo(() => {
    return [
      {
        category: 'Avancement global',
        projectA: statsA.progress,
        projectB: statsB.progress,
      },
      {
        category: 'Tâches réalisées',
        projectA: statsA.taskCompletionRate,
        projectB: statsB.taskCompletionRate,
      },
      {
        category: 'Budget consommé',
        projectA: statsA.budgetBurnRate,
        projectB: statsB.budgetBurnRate,
      },
      {
        category: 'Taux encaissement',
        projectA: statsA.collectionRate,
        projectB: statsB.collectionRate,
      },
    ];
  }, [statsA, statsB]);

  // Pie chart datasets
  const pieBudgetA = [
    { name: 'Dépensé', value: statsA.spent, color: '#f59e0b' },
    { name: 'Solde restant', value: statsA.remainingBudget, color: '#6366f1' },
  ];
  const pieBudgetB = [
    { name: 'Dépensé', value: statsB.spent, color: '#f59e0b' },
    { name: 'Solde restant', value: statsB.remainingBudget, color: '#10b981' },
  ];

  const pieBillingA = [
    { name: 'Encaissé', value: statsA.totalPaid, color: '#10b981' },
    { name: 'Reste impayé', value: statsA.totalUnpaid, color: '#ef4444' },
  ];
  const pieBillingB = [
    { name: 'Encaissé', value: statsB.totalPaid, color: '#10b981' },
    { name: 'Reste impayé', value: statsB.totalUnpaid, color: '#ef4444' },
  ];

  // Custom tooltips
  const CustomMoneyTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-2xl text-xs space-y-1.5 z-50">
          <p className="font-bold text-slate-200 border-b border-slate-750 pb-1">{label}</p>
          {payload.map((entry: any, index: number) => {
            const isA = entry.dataKey === 'projectA';
            const projName = isA ? projectA?.title : projectB?.title;
            const projCode = isA ? projectA?.code : projectB?.code;
            return (
              <div key={`tooltip-${index}`} className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-1.5 font-medium" style={{ color: entry.color }}>
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                  {projCode} ({isA ? 'Projet A' : 'Projet B'}):
                </span>
                <span className="font-mono font-bold text-slate-100">
                  {formatMoney(entry.value)}
                </span>
              </div>
            );
          })}
        </div>
      );
    }
    return null;
  };

  const CustomPercentTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-2xl text-xs space-y-1.5 z-50">
          <p className="font-bold text-slate-200 border-b border-slate-750 pb-1">{label}</p>
          {payload.map((entry: any, index: number) => {
            const isA = entry.dataKey === 'projectA';
            const projCode = isA ? projectA?.code : projectB?.code;
            return (
              <div key={`tooltip-${index}`} className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-1.5 font-medium" style={{ color: entry.color }}>
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                  {projCode}:
                </span>
                <span className="font-mono font-bold text-slate-100">
                  {entry.value}%
                </span>
              </div>
            );
          })}
        </div>
      );
    }
    return null;
  };

  // Automated comparative diagnostic text
  const insights = useMemo(() => {
    if (!projectA || !projectB) return null;

    const budgetDiff = statsA.budget - statsB.budget;
    const progressDiff = statsA.progress - statsB.progress;
    const collectionDiff = statsA.collectionRate - statsB.collectionRate;
    const billedDiff = statsA.totalBilled - statsB.totalBilled;

    return {
      budgetLeader: budgetDiff >= 0 ? projectA.title : projectB.title,
      budgetDiffAbs: Math.abs(budgetDiff),
      progressLeader: progressDiff >= 0 ? projectA.title : projectB.title,
      progressDiffAbs: Math.abs(progressDiff),
      collectionLeader: collectionDiff >= 0 ? projectA.title : projectB.title,
      collectionDiffAbs: Math.abs(collectionDiff),
      billedLeader: billedDiff >= 0 ? projectA.title : projectB.title,
      billedDiffAbs: Math.abs(billedDiff),
    };
  }, [projectA, projectB, statsA, statsB]);

  if (!projectA || !projectB) {
    return (
      <div className="p-8 bg-slate-850 border border-slate-750 rounded-2xl text-center">
        <AlertCircle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-100">Deux projets requis</h3>
        <p className="text-xs text-slate-400 mt-1">
          Veuillez créer au moins deux projets pour activer le module de comparaison côte à côte.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header Card */}
      <div className="bg-slate-850 border border-slate-750 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center shrink-0">
                <GitCompare className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight">
                    ProjetComparison
                  </h2>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-600/30 text-indigo-300 border border-indigo-500/40">
                    Côte à côte
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                  Analyse comparative en temps réel des budgets, statuts d'avancement et montants facturés
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-end sm:self-auto">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 rounded-xl text-xs font-semibold transition-all cursor-pointer"
              title="Imprimer ou exporter la comparaison"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Imprimer</span>
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Fermer
              </button>
            )}
          </div>
        </div>

        {/* Dual Selectors with Swap */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
          {/* Project A Selector Card */}
          <div className="lg:col-span-5 p-4 rounded-xl bg-slate-900/90 border-2 border-indigo-500/40 relative shadow-md">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-indigo-500 inline-block shadow-sm shadow-indigo-500/50" />
                <span className="text-xs font-black uppercase tracking-wider text-indigo-300">
                  Projet A (Référence)
                </span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusA.bg} ${statusA.text} ${statusA.border}`}>
                {statusA.label}
              </span>
            </div>

            <div className="relative">
              <select
                value={projectAId}
                onChange={(e) => setProjectAId(e.target.value)}
                className="w-full pl-3 pr-8 py-2 bg-slate-850 border border-slate-700 rounded-xl text-sm font-bold text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer appearance-none"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id} disabled={p.id === projectBId}>
                    {p.code} — {p.title} ({p.clientName})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
              <div className="flex items-center gap-1.5 truncate mr-2">
                <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{projectA.clientName}</span>
              </div>
              {onOpenProjectDetail && (
                <button
                  onClick={() => onOpenProjectDetail(projectA)}
                  className="text-indigo-400 hover:text-indigo-300 text-[11px] font-bold underline cursor-pointer shrink-0"
                >
                  Fiche complète →
                </button>
              )}
            </div>
          </div>

          {/* Central Swap Button */}
          <div className="lg:col-span-2 flex flex-col items-center justify-center gap-2">
            <button
              onClick={handleSwap}
              className="p-3 bg-slate-800 hover:bg-indigo-600/30 text-slate-300 hover:text-indigo-300 border border-slate-700 hover:border-indigo-500/50 rounded-2xl transition-all shadow-lg cursor-pointer group"
              title="Intervertir Projet A et Projet B"
            >
              <ArrowLeftRight className="w-5 h-5 group-hover:rotate-180 transition-transform duration-300" />
            </button>
            <span className="text-[11px] font-mono font-black text-slate-300 tracking-wider">
              VS
            </span>
          </div>

          {/* Project B Selector Card */}
          <div className="lg:col-span-5 p-4 rounded-xl bg-slate-900/90 border-2 border-emerald-500/40 relative shadow-md">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block shadow-sm shadow-emerald-400/50" />
                <span className="text-xs font-black uppercase tracking-wider text-emerald-300">
                  Projet B (Comparé)
                </span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusB.bg} ${statusB.text} ${statusB.border}`}>
                {statusB.label}
              </span>
            </div>

            <div className="relative">
              <select
                value={projectBId}
                onChange={(e) => setProjectBId(e.target.value)}
                className="w-full pl-3 pr-8 py-2 bg-slate-850 border border-slate-700 rounded-xl text-sm font-bold text-slate-100 focus:outline-none focus:border-emerald-500 transition-colors cursor-pointer appearance-none"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id} disabled={p.id === projectAId}>
                    {p.code} — {p.title} ({p.clientName})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
              <div className="flex items-center gap-1.5 truncate mr-2">
                <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{projectB.clientName}</span>
              </div>
              {onOpenProjectDetail && (
                <button
                  onClick={() => onOpenProjectDetail(projectB)}
                  className="text-emerald-400 hover:text-emerald-300 text-[11px] font-bold underline cursor-pointer shrink-0"
                >
                  Fiche complète →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tri-Pillar KPI Summary Cards: Budget, Avancement, Facturation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Pillar 1: Budgets */}
        <div className="bg-slate-850 border border-slate-750 rounded-2xl p-4 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs mb-3">
              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-amber-400" />
                Budgets alloués
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                Financier
              </span>
            </div>

            <div className="space-y-2.5">
              {/* Projet A */}
              <div className="p-2.5 rounded-xl bg-slate-900/80 border-l-4 border-l-indigo-500">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold text-indigo-300">{projectA.code}</span>
                  <span className="font-mono text-slate-300">Conso: {statsA.budgetBurnRate}%</span>
                </div>
                <div className="text-base font-mono font-bold text-slate-100 mt-0.5">
                  {formatMoney(statsA.budget)}
                </div>
                <div className="text-[11px] text-slate-400 flex items-center justify-between mt-1">
                  <span>Dépensé: <strong className="text-amber-400 font-mono">{formatMoney(statsA.spent)}</strong></span>
                  <span>Solde: <strong className="text-slate-300 font-mono">{formatMoney(statsA.remainingBudget)}</strong></span>
                </div>
              </div>

              {/* Projet B */}
              <div className="p-2.5 rounded-xl bg-slate-900/80 border-l-4 border-l-emerald-400">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold text-emerald-300">{projectB.code}</span>
                  <span className="font-mono text-slate-300">Conso: {statsB.budgetBurnRate}%</span>
                </div>
                <div className="text-base font-mono font-bold text-slate-100 mt-0.5">
                  {formatMoney(statsB.budget)}
                </div>
                <div className="text-[11px] text-slate-400 flex items-center justify-between mt-1">
                  <span>Dépensé: <strong className="text-amber-400 font-mono">{formatMoney(statsB.spent)}</strong></span>
                  <span>Solde: <strong className="text-slate-300 font-mono">{formatMoney(statsB.remainingBudget)}</strong></span>
                </div>
              </div>
            </div>
          </div>

          {/* Delta Insight */}
          <div className="mt-3 pt-2.5 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Écart budgétaire :</span>
            <span className="font-mono font-bold text-slate-200">
              {statsA.budget > statsB.budget ? `+${formatMoney(statsA.budget - statsB.budget)} (A)` : `+${formatMoney(statsB.budget - statsA.budget)} (B)`}
            </span>
          </div>
        </div>

        {/* Pillar 2: Statuts d'avancement */}
        <div className="bg-slate-850 border border-slate-750 rounded-2xl p-4 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs mb-3">
              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-indigo-400" />
                Statuts d'avancement
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                Opérationnel
              </span>
            </div>

            <div className="space-y-2.5">
              {/* Projet A */}
              <div className="p-2.5 rounded-xl bg-slate-900/80 border-l-4 border-l-indigo-500">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-indigo-300">{projectA.code}</span>
                  <span className="font-mono font-bold text-indigo-400 text-sm">{statsA.progress}%</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                    style={{ width: `${statsA.progress}%` }}
                  />
                </div>
                <div className="text-[11px] text-slate-400 flex items-center justify-between mt-1.5">
                  <span>Tâches: <strong className="text-slate-200">{statsA.tasksCompleted}/{statsA.tasksTotal}</strong> ({statsA.taskCompletionRate}%)</span>
                  <span>Statut: <strong className={statusA.text}>{statusA.label}</strong></span>
                </div>
              </div>

              {/* Projet B */}
              <div className="p-2.5 rounded-xl bg-slate-900/80 border-l-4 border-l-emerald-400">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-emerald-300">{projectB.code}</span>
                  <span className="font-mono font-bold text-emerald-400 text-sm">{statsB.progress}%</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                    style={{ width: `${statsB.progress}%` }}
                  />
                </div>
                <div className="text-[11px] text-slate-400 flex items-center justify-between mt-1.5">
                  <span>Tâches: <strong className="text-slate-200">{statsB.tasksCompleted}/{statsB.tasksTotal}</strong> ({statsB.taskCompletionRate}%)</span>
                  <span>Statut: <strong className={statusB.text}>{statusB.label}</strong></span>
                </div>
              </div>
            </div>
          </div>

          {/* Delta Insight */}
          <div className="mt-3 pt-2.5 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Écart d'avancement :</span>
            <span className="font-mono font-bold text-slate-200">
              {statsA.progress > statsB.progress
                ? `+${statsA.progress - statsB.progress}% en faveur de A`
                : statsB.progress > statsA.progress
                ? `+${statsB.progress - statsA.progress}% en faveur de B`
                : 'Égalité (0%)'}
            </span>
          </div>
        </div>

        {/* Pillar 3: Montants facturés & Encaissés */}
        <div className="bg-slate-850 border border-slate-750 rounded-2xl p-4 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs mb-3">
              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-emerald-400" />
                Montants facturés
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                Trésorerie
              </span>
            </div>

            <div className="space-y-2.5">
              {/* Projet A */}
              <div className="p-2.5 rounded-xl bg-slate-900/80 border-l-4 border-l-indigo-500">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold text-indigo-300">{projectA.code}</span>
                  <span className="text-emerald-400 font-mono font-semibold">
                    Recouvrement: {statsA.collectionRate}%
                  </span>
                </div>
                <div className="text-base font-mono font-bold text-slate-100 mt-0.5">
                  {formatMoney(statsA.totalBilled)}
                </div>
                <div className="text-[11px] text-slate-400 flex items-center justify-between mt-1">
                  <span>Encaissé: <strong className="text-emerald-400 font-mono">{formatMoney(statsA.totalPaid)}</strong></span>
                  <span>Reste dû: <strong className="text-rose-400 font-mono">{formatMoney(statsA.totalUnpaid)}</strong></span>
                </div>
              </div>

              {/* Projet B */}
              <div className="p-2.5 rounded-xl bg-slate-900/80 border-l-4 border-l-emerald-400">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold text-emerald-300">{projectB.code}</span>
                  <span className="text-emerald-400 font-mono font-semibold">
                    Recouvrement: {statsB.collectionRate}%
                  </span>
                </div>
                <div className="text-base font-mono font-bold text-slate-100 mt-0.5">
                  {formatMoney(statsB.totalBilled)}
                </div>
                <div className="text-[11px] text-slate-400 flex items-center justify-between mt-1">
                  <span>Encaissé: <strong className="text-emerald-400 font-mono">{formatMoney(statsB.totalPaid)}</strong></span>
                  <span>Reste dû: <strong className="text-rose-400 font-mono">{formatMoney(statsB.totalUnpaid)}</strong></span>
                </div>
              </div>
            </div>
          </div>

          {/* Delta Insight */}
          <div className="mt-3 pt-2.5 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Écart de facturation :</span>
            <span className="font-mono font-bold text-slate-200">
              {statsA.totalBilled > statsB.totalBilled
                ? `+${formatMoney(statsA.totalBilled - statsB.totalBilled)} (A)`
                : `+${formatMoney(statsB.totalBilled - statsA.totalBilled)} (B)`}
            </span>
          </div>
        </div>
      </div>

      {/* Main Charts Card with Tab Navigation */}
      <div className="bg-slate-850 border border-slate-750 rounded-2xl p-5 sm:p-6 shadow-xl space-y-6">
        {/* Navigation tabs for charts */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-750">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-slate-100">
              Visualisation Graphique Côte à Côte
            </h3>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-750 self-start sm:self-auto">
            <button
              onClick={() => setActiveChartTab('financial')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeChartTab === 'financial'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              Volumes Financiers
            </button>
            <button
              onClick={() => setActiveChartTab('progress')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeChartTab === 'progress'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              Avancements & Taux (%)
            </button>
            <button
              onClick={() => setActiveChartTab('breakdown')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeChartTab === 'breakdown'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              Ventilations Circulaires
            </button>
          </div>
        </div>

        {/* Legend Indicator */}
        <div className="flex items-center justify-center sm:justify-end gap-6 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded bg-indigo-500 shadow-sm" />
            <span className="font-semibold text-slate-200 truncate max-w-[200px]">
              {projectA.code} ({projectA.title})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded bg-emerald-400 shadow-sm" />
            <span className="font-semibold text-slate-200 truncate max-w-[200px]">
              {projectB.code} ({projectB.title})
            </span>
          </div>
        </div>

        {/* TAB 1: Financial Volumes Bar Chart */}
        {activeChartTab === 'financial' && (
          <div className="space-y-3">
            <div className="h-80 sm:h-96 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={financialChartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 25 }}
                  barGap={8}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} vertical={false} />
                  <XAxis
                    dataKey="metric"
                    stroke="#94a3b8"
                    tick={{ fill: '#cbd5e1', fontSize: 12, fontWeight: 600 }}
                    tickLine={{ stroke: '#475569' }}
                    interval={0}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    tickFormatter={(val) => {
                      if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
                      if (val >= 1000) return `${(val / 1000).toFixed(0)}k`;
                      return val;
                    }}
                    tickLine={{ stroke: '#475569' }}
                  />
                  <Tooltip content={<CustomMoneyTooltip />} />
                  <Bar
                    dataKey="projectA"
                    name={projectA.title}
                    fill="#6366f1"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={45}
                  />
                  <Bar
                    dataKey="projectB"
                    name={projectB.title}
                    fill="#10b981"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={45}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-center text-xs text-slate-400 italic">
              Comparaison directe des flux : Budgets initiaux, Dépenses courantes, Total facturé aux clients et Recouvrements effectifs.
            </p>
          </div>
        )}

        {/* TAB 2: Progress & Performance Percentages */}
        {activeChartTab === 'progress' && (
          <div className="space-y-3">
            <div className="h-80 sm:h-96 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={percentageChartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 25 }}
                  barGap={8}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} vertical={false} />
                  <XAxis
                    dataKey="category"
                    stroke="#94a3b8"
                    tick={{ fill: '#cbd5e1', fontSize: 12, fontWeight: 600 }}
                    tickLine={{ stroke: '#475569' }}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    domain={[0, 100]}
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    tickFormatter={(val) => `${val}%`}
                    tickLine={{ stroke: '#475569' }}
                  />
                  <Tooltip content={<CustomPercentTooltip />} />
                  <ReferenceLine y={100} stroke="#e2e8f0" strokeDasharray="3 3" opacity={0.3} label={{ value: '100% Cible', fill: '#94a3b8', fontSize: 10, position: 'right' }} />
                  <Bar
                    dataKey="projectA"
                    name={projectA.title}
                    fill="#6366f1"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={45}
                  />
                  <Bar
                    dataKey="projectB"
                    name={projectB.title}
                    fill="#10b981"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={45}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-center text-xs text-slate-400 italic">
              Indicateurs opérationnels relatifs (0 à 100%) : Avancement du projet, réalisation des tâches, consommation du budget et taux de recouvrement des créances.
            </p>
          </div>
        )}

        {/* TAB 3: Visual Donut Breakdown Side by Side */}
        {activeChartTab === 'breakdown' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* Panel Project A */}
            <div className="p-4 rounded-xl bg-slate-900 border border-indigo-500/30 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-indigo-400 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                  {projectA.code} : {projectA.title}
                </span>
                <span className="text-xs font-bold text-slate-300">
                  Progression : {statsA.progress}%
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                {/* Donut Budget A */}
                <div className="flex flex-col items-center">
                  <div className="w-36 h-36">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieBudgetA}
                          cx="50%"
                          cy="50%"
                          innerRadius={36}
                          outerRadius={56}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {pieBudgetA.map((entry, index) => (
                            <Cell key={`cell-a-b-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <span className="text-xs font-bold text-slate-300 mt-1">Consommation Budget</span>
                  <span className="text-[11px] text-amber-400 font-mono font-bold">
                    {statsA.budgetBurnRate}% consommé
                  </span>
                </div>

                {/* Donut Invoices A */}
                <div className="flex flex-col items-center">
                  <div className="w-36 h-36">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieBillingA}
                          cx="50%"
                          cy="50%"
                          innerRadius={36}
                          outerRadius={56}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {pieBillingA.map((entry, index) => (
                            <Cell key={`cell-a-inv-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <span className="text-xs font-bold text-slate-300 mt-1">Recouvrement Factures</span>
                  <span className="text-[11px] text-emerald-400 font-mono font-bold">
                    {statsA.collectionRate}% encaissé
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex justify-between text-xs text-slate-400">
                <span>Budget : <strong className="text-slate-200">{formatMoney(statsA.budget)}</strong></span>
                <span>Facturé : <strong className="text-slate-200">{formatMoney(statsA.totalBilled)}</strong></span>
              </div>
            </div>

            {/* Panel Project B */}
            <div className="p-4 rounded-xl bg-slate-900 border border-emerald-500/30 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  {projectB.code} : {projectB.title}
                </span>
                <span className="text-xs font-bold text-slate-300">
                  Progression : {statsB.progress}%
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                {/* Donut Budget B */}
                <div className="flex flex-col items-center">
                  <div className="w-36 h-36">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieBudgetB}
                          cx="50%"
                          cy="50%"
                          innerRadius={36}
                          outerRadius={56}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {pieBudgetB.map((entry, index) => (
                            <Cell key={`cell-b-b-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <span className="text-xs font-bold text-slate-300 mt-1">Consommation Budget</span>
                  <span className="text-[11px] text-amber-400 font-mono font-bold">
                    {statsB.budgetBurnRate}% consommé
                  </span>
                </div>

                {/* Donut Invoices B */}
                <div className="flex flex-col items-center">
                  <div className="w-36 h-36">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieBillingB}
                          cx="50%"
                          cy="50%"
                          innerRadius={36}
                          outerRadius={56}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {pieBillingB.map((entry, index) => (
                            <Cell key={`cell-b-inv-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <span className="text-xs font-bold text-slate-300 mt-1">Recouvrement Factures</span>
                  <span className="text-[11px] text-emerald-400 font-mono font-bold">
                    {statsB.collectionRate}% encaissé
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex justify-between text-xs text-slate-400">
                <span>Budget : <strong className="text-slate-200">{formatMoney(statsB.budget)}</strong></span>
                <span>Facturé : <strong className="text-slate-200">{formatMoney(statsB.totalBilled)}</strong></span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Comprehensive Metric Delta Matrix */}
      <div className="bg-slate-850 border border-slate-750 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-750 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              Matrice Comparative & Analyse des Écarts
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Évaluation ligne à ligne des écarts de budget, d'avancement et de facturation
            </p>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            Différentiel = Projet A - Projet B
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 border-b border-slate-750 text-slate-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4 w-1/4">Indicateur Clé</th>
                <th className="py-3 px-4 text-indigo-300 font-bold w-1/4">
                  {projectA.code} (Projet A)
                </th>
                <th className="py-3 px-4 text-emerald-300 font-bold w-1/4">
                  {projectB.code} (Projet B)
                </th>
                <th className="py-3 px-4 text-right w-1/4">Écart & Diagnostic</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {/* Category 1: Généralités */}
              <tr className="bg-slate-900/40">
                <td colSpan={4} className="py-2 px-4 text-[11px] font-black uppercase tracking-wider text-slate-400">
                  1. Identification & Statuts
                </td>
              </tr>
              <tr className="hover:bg-slate-800/40 transition-colors">
                <td className="py-3 px-4 text-slate-300">Client assigné</td>
                <td className="py-3 px-4 text-slate-200 font-semibold">{projectA.clientName}</td>
                <td className="py-3 px-4 text-slate-200 font-semibold">{projectB.clientName}</td>
                <td className="py-3 px-4 text-right text-slate-400">—</td>
              </tr>
              <tr className="hover:bg-slate-800/40 transition-colors">
                <td className="py-3 px-4 text-slate-300">Statut du projet</td>
                <td className="py-3 px-4">
                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${statusA.bg} ${statusA.text} ${statusA.border}`}>
                    {statusA.label}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${statusB.bg} ${statusB.text} ${statusB.border}`}>
                    {statusB.label}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  {projectA.status === projectB.status ? (
                    <span className="text-slate-400 text-xs">Identique</span>
                  ) : (
                    <span className="text-amber-400 text-xs font-semibold">Statuts distincts</span>
                  )}
                </td>
              </tr>
              <tr className="hover:bg-slate-800/40 transition-colors">
                <td className="py-3 px-4 text-slate-300">Date d'échéance livraison</td>
                <td className="py-3 px-4 text-slate-300 font-mono">{projectA.dueDate}</td>
                <td className="py-3 px-4 text-slate-300 font-mono">{projectB.dueDate}</td>
                <td className="py-3 px-4 text-right text-slate-400">
                  {projectA.dueDate < projectB.dueDate ? 'A plus proche' : 'B plus proche'}
                </td>
              </tr>

              {/* Category 2: Statuts d'avancement & Tâches */}
              <tr className="bg-slate-900/40">
                <td colSpan={4} className="py-2 px-4 text-[11px] font-black uppercase tracking-wider text-slate-400">
                  2. Statuts d'avancement & Performance Opérationnelle
                </td>
              </tr>
              <tr className="hover:bg-slate-800/40 transition-colors">
                <td className="py-3 px-4 text-slate-300">Taux d'avancement global</td>
                <td className="py-3 px-4 font-mono font-bold text-indigo-300">{statsA.progress}%</td>
                <td className="py-3 px-4 font-mono font-bold text-emerald-300">{statsB.progress}%</td>
                <td className="py-3 px-4 text-right font-mono font-bold">
                  {statsA.progress === statsB.progress ? (
                    <span className="text-slate-400">Égalité</span>
                  ) : statsA.progress > statsB.progress ? (
                    <span className="text-indigo-400 flex items-center justify-end gap-1">
                      <ArrowUpRight className="w-3.5 h-3.5" /> +{statsA.progress - statsB.progress}% pour A
                    </span>
                  ) : (
                    <span className="text-emerald-400 flex items-center justify-end gap-1">
                      <ArrowDownRight className="w-3.5 h-3.5" /> +{statsB.progress - statsA.progress}% pour B
                    </span>
                  )}
                </td>
              </tr>
              <tr className="hover:bg-slate-800/40 transition-colors">
                <td className="py-3 px-4 text-slate-300">Tâches finalisées</td>
                <td className="py-3 px-4 text-slate-300">
                  {statsA.tasksCompleted} / {statsA.tasksTotal} ({statsA.taskCompletionRate}%)
                </td>
                <td className="py-3 px-4 text-slate-300">
                  {statsB.tasksCompleted} / {statsB.tasksTotal} ({statsB.taskCompletionRate}%)
                </td>
                <td className="py-3 px-4 text-right font-mono">
                  {statsA.taskCompletionRate >= statsB.taskCompletionRate ? (
                    <span className="text-indigo-400">+{statsA.taskCompletionRate - statsB.taskCompletionRate}%</span>
                  ) : (
                    <span className="text-emerald-400">+{statsB.taskCompletionRate - statsA.taskCompletionRate}%</span>
                  )}
                </td>
              </tr>

              {/* Category 3: Budgets & Dépenses */}
              <tr className="bg-slate-900/40">
                <td colSpan={4} className="py-2 px-4 text-[11px] font-black uppercase tracking-wider text-slate-400">
                  3. Budgets & Dépenses Engagées
                </td>
              </tr>
              <tr className="hover:bg-slate-800/40 transition-colors">
                <td className="py-3 px-4 text-slate-300">Budget initial alloué</td>
                <td className="py-3 px-4 font-mono font-bold text-slate-100">{formatMoney(statsA.budget)}</td>
                <td className="py-3 px-4 font-mono font-bold text-slate-100">{formatMoney(statsB.budget)}</td>
                <td className="py-3 px-4 text-right font-mono font-bold">
                  {statsA.budget >= statsB.budget ? (
                    <span className="text-indigo-400">+{formatMoney(statsA.budget - statsB.budget)}</span>
                  ) : (
                    <span className="text-emerald-400">+{formatMoney(statsB.budget - statsA.budget)}</span>
                  )}
                </td>
              </tr>
              <tr className="hover:bg-slate-800/40 transition-colors">
                <td className="py-3 px-4 text-slate-300">Dépenses engagées</td>
                <td className="py-3 px-4 font-mono text-amber-400">{formatMoney(statsA.spent)}</td>
                <td className="py-3 px-4 font-mono text-amber-400">{formatMoney(statsB.spent)}</td>
                <td className="py-3 px-4 text-right font-mono text-slate-400">
                  Diff: {formatMoney(Math.abs(statsA.spent - statsB.spent))}
                </td>
              </tr>
              <tr className="hover:bg-slate-800/40 transition-colors">
                <td className="py-3 px-4 text-slate-300">Solde budgétaire disponible</td>
                <td className="py-3 px-4 font-mono text-slate-200">{formatMoney(statsA.remainingBudget)}</td>
                <td className="py-3 px-4 font-mono text-slate-200">{formatMoney(statsB.remainingBudget)}</td>
                <td className="py-3 px-4 text-right font-mono">
                  {statsA.remainingBudget >= statsB.remainingBudget ? (
                    <span className="text-indigo-400">A + disponible</span>
                  ) : (
                    <span className="text-emerald-400">B + disponible</span>
                  )}
                </td>
              </tr>
              <tr className="hover:bg-slate-800/40 transition-colors">
                <td className="py-3 px-4 text-slate-300">Taux de consommation budget</td>
                <td className="py-3 px-4 font-mono font-semibold text-slate-200">{statsA.budgetBurnRate}%</td>
                <td className="py-3 px-4 font-mono font-semibold text-slate-200">{statsB.budgetBurnRate}%</td>
                <td className="py-3 px-4 text-right font-mono text-slate-400">
                  {statsA.budgetBurnRate - statsB.budgetBurnRate}%
                </td>
              </tr>

              {/* Category 4: Facturation & Encaissements */}
              <tr className="bg-slate-900/40">
                <td colSpan={4} className="py-2 px-4 text-[11px] font-black uppercase tracking-wider text-slate-400">
                  4. Facturation Client & Trésorerie
                </td>
              </tr>
              <tr className="hover:bg-slate-800/40 transition-colors">
                <td className="py-3 px-4 text-slate-300">Total facturé au client</td>
                <td className="py-3 px-4 font-mono font-bold text-slate-100">{formatMoney(statsA.totalBilled)}</td>
                <td className="py-3 px-4 font-mono font-bold text-slate-100">{formatMoney(statsB.totalBilled)}</td>
                <td className="py-3 px-4 text-right font-mono font-bold">
                  {statsA.totalBilled >= statsB.totalBilled ? (
                    <span className="text-indigo-400">+{formatMoney(statsA.totalBilled - statsB.totalBilled)} (A)</span>
                  ) : (
                    <span className="text-emerald-400">+{formatMoney(statsB.totalBilled - statsA.totalBilled)} (B)</span>
                  )}
                </td>
              </tr>
              <tr className="hover:bg-slate-800/40 transition-colors">
                <td className="py-3 px-4 text-slate-300">Total encaissé</td>
                <td className="py-3 px-4 font-mono font-bold text-emerald-400">{formatMoney(statsA.totalPaid)}</td>
                <td className="py-3 px-4 font-mono font-bold text-emerald-400">{formatMoney(statsB.totalPaid)}</td>
                <td className="py-3 px-4 text-right font-mono font-bold">
                  {statsA.totalPaid >= statsB.totalPaid ? (
                    <span className="text-indigo-400">+{formatMoney(statsA.totalPaid - statsB.totalPaid)}</span>
                  ) : (
                    <span className="text-emerald-400">+{formatMoney(statsB.totalPaid - statsA.totalPaid)}</span>
                  )}
                </td>
              </tr>
              <tr className="hover:bg-slate-800/40 transition-colors">
                <td className="py-3 px-4 text-slate-300">Créances restantes (Impayés)</td>
                <td className="py-3 px-4 font-mono text-rose-400 font-semibold">{formatMoney(statsA.totalUnpaid)}</td>
                <td className="py-3 px-4 font-mono text-rose-400 font-semibold">{formatMoney(statsB.totalUnpaid)}</td>
                <td className="py-3 px-4 text-right font-mono">
                  {statsA.totalUnpaid < statsB.totalUnpaid ? (
                    <span className="text-emerald-400">A moins exposé</span>
                  ) : statsB.totalUnpaid < statsA.totalUnpaid ? (
                    <span className="text-emerald-400">B moins exposé</span>
                  ) : (
                    <span className="text-slate-400">Identique</span>
                  )}
                </td>
              </tr>
              <tr className="hover:bg-slate-800/40 transition-colors">
                <td className="py-3 px-4 text-slate-300">Taux de recouvrement</td>
                <td className="py-3 px-4 font-mono font-bold text-emerald-400">{statsA.collectionRate}%</td>
                <td className="py-3 px-4 font-mono font-bold text-emerald-400">{statsB.collectionRate}%</td>
                <td className="py-3 px-4 text-right font-mono font-bold">
                  {statsA.collectionRate >= statsB.collectionRate ? (
                    <span className="text-indigo-400">+{statsA.collectionRate - statsB.collectionRate}%</span>
                  ) : (
                    <span className="text-emerald-400">+{statsB.collectionRate - statsA.collectionRate}%</span>
                  )}
                </td>
              </tr>

              {/* Category 5: Rentabilité & Marge */}
              <tr className="bg-slate-900/40">
                <td colSpan={4} className="py-2 px-4 text-[11px] font-black uppercase tracking-wider text-slate-400">
                  5. Profitabilité Estimée (Facturé - Dépenses)
                </td>
              </tr>
              <tr className="hover:bg-slate-800/40 transition-colors bg-slate-850/60 font-semibold">
                <td className="py-3 px-4 text-slate-200">Marge brute opérationnelle</td>
                <td className={`py-3 px-4 font-mono font-bold ${statsA.netMargin >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {formatMoney(statsA.netMargin)}
                </td>
                <td className={`py-3 px-4 font-mono font-bold ${statsB.netMargin >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {formatMoney(statsB.netMargin)}
                </td>
                <td className="py-3 px-4 text-right font-mono font-bold">
                  {statsA.netMargin >= statsB.netMargin ? (
                    <span className="text-indigo-400">A génère +{formatMoney(statsA.netMargin - statsB.netMargin)}</span>
                  ) : (
                    <span className="text-emerald-400">B génère +{formatMoney(statsB.netMargin - statsA.netMargin)}</span>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Synthesis / AI-styled Insights Card */}
      {insights && (
        <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-850 to-indigo-950/30 border border-indigo-500/30 rounded-2xl shadow-lg flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div className="flex-1 space-y-1.5 text-xs text-slate-300">
            <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <span>Synthèse Comparative Opérationnelle</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
              <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-750">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Volume budgétaire</span>
                <span className="font-bold text-indigo-300">{insights.budgetLeader}</span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Budget supérieur de <strong className="text-slate-200">{formatMoney(insights.budgetDiffAbs)}</strong>.
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-750">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Cadence d'exécution</span>
                <span className="font-bold text-emerald-300">{insights.progressLeader}</span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Avance opérationnelle de <strong className="text-slate-200">+{insights.progressDiffAbs}%</strong> sur ses jalons.
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-750">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Recouvrement client</span>
                <span className="font-bold text-amber-300">{insights.collectionLeader}</span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Taux d'encaissement plus performant de <strong className="text-slate-200">+{insights.collectionDiffAbs}%</strong>.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Export alternate naming for convenience
export const ProjectComparison = ProjetComparison;
export default ProjetComparison;

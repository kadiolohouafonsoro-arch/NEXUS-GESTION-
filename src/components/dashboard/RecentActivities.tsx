import React from 'react';
import {
  FileText,
  CheckCircle,
  Clock,
  AlertTriangle,
  FolderKanban,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface RecentActivitiesProps {
  onViewInvoice?: (invoiceId: string) => void;
  onPreviewInvoice?: (invoiceId: string) => void;
  onViewProject?: (projectId: string) => void;
  onRecordPayment?: (invoiceId: string) => void;
}

export const RecentActivities: React.FC<RecentActivitiesProps> = ({
  onViewInvoice,
  onPreviewInvoice,
  onViewProject,
  onRecordPayment,
}) => {
  const { invoices, projects, formatMoney, setActiveTab } = useApp();

  const handleInvoiceClick = (invoiceId: string) => {
    if (typeof onViewInvoice === 'function') {
      onViewInvoice(invoiceId);
    } else if (typeof onPreviewInvoice === 'function') {
      onPreviewInvoice(invoiceId);
    } else {
      setActiveTab('invoices');
    }
  };

  const handleProjectClick = (projectId: string) => {
    if (typeof onViewProject === 'function') {
      onViewProject(projectId);
    } else {
      setActiveTab('projects');
    }
  };

  const recentInvoices = invoices.slice(0, 5);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            <CheckCircle className="w-3 h-3" />
            Payée
          </span>
        );
      case 'overdue':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30">
            <AlertTriangle className="w-3 h-3" />
            En retard
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
            <Clock className="w-3 h-3" />
            En attente
          </span>
        );
      default:
        return (
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
            Brouillon
          </span>
        );
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Recent Invoices & Billing */}
      <div className="bg-slate-850 border border-slate-750 rounded-2xl p-5 shadow-lg shadow-black/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-slate-100">Dernières Factures & Règlements</h3>
          </div>
          <button
            onClick={() => setActiveTab('invoices')}
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
          >
            <span>Voir tout ({invoices.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-800">
          {recentInvoices.map((inv) => (
            <div
              key={inv.id}
              className="py-3 flex items-center justify-between gap-3 group hover:bg-slate-800/40 px-2 rounded-xl transition-colors cursor-pointer"
              onClick={() => handleInvoiceClick(inv.id)}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-200">{inv.number}</span>
                  <span className="text-xs text-slate-400 truncate max-w-[140px] sm:max-w-[200px]">
                    {inv.clientName}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Émise le {inv.issueDate} • Échéance : {inv.dueDate}
                </div>
              </div>

              <div className="text-right shrink-0 flex items-center gap-3">
                <div>
                  <div className="text-xs font-bold text-slate-100">{formatMoney(inv.total)}</div>
                  <div className="mt-0.5">{getStatusBadge(inv.status)}</div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 transition-colors" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Projects Progress Snapshot */}
      <div className="bg-slate-850 border border-slate-750 rounded-2xl p-5 shadow-lg shadow-black/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-slate-100">Avancement des Projets Clés</h3>
          </div>
          <button
            onClick={() => setActiveTab('projects')}
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
          >
            <span>Kanban ({projects.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-3.5">
          {projects.slice(0, 4).map((proj) => {
            const completedTasks = proj.tasks.filter((t) => t.completed).length;
            return (
              <div
                key={proj.id}
                onClick={() => handleProjectClick(proj.id)}
                className="p-3 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-xl transition-colors cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700">
                      {proj.code}
                    </span>
                    <span className="text-xs font-bold text-slate-200 truncate max-w-[180px] sm:max-w-[240px]">
                      {proj.title}
                    </span>
                  </div>
                  <span className="text-xs font-extrabold text-indigo-400">{proj.progress}%</span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-2">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      proj.progress === 100
                        ? 'bg-emerald-500'
                        : proj.progress > 60
                        ? 'bg-indigo-500'
                        : 'bg-amber-500'
                    }`}
                    style={{ width: `${proj.progress}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Client : {proj.clientName}</span>
                  <span>
                    {completedTasks}/{proj.tasks.length} tâches terminées
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

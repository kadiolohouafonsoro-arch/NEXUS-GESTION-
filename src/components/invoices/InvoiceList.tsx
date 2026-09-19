import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Search,
  CheckCircle,
  Clock,
  AlertTriangle,
  Printer,
  CreditCard,
  ArrowRight,
  MoreVertical,
  Trash2,
  Edit2,
  FileCheck2,
  Check,
  TrendingUp,
  Sparkles,
  Calculator,
  Calendar,
  BellRing,
  Send,
} from 'lucide-react';
import { Invoice, InvoiceStatus, InvoiceType } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  isInvoiceOverdue,
  getDaysOverdue,
  getOverdueSeverity,
} from '../../utils/invoiceOverdueUtils';
import { SendReminderModal } from './SendReminderModal';

interface InvoiceListProps {
  onOpenCreateModal: (type?: InvoiceType) => void;
  onPreviewInvoice: (invoice: Invoice) => void;
  onRecordPayment: (invoice: Invoice) => void;
  onEditInvoice: (invoice: Invoice) => void;
  onSendReminder?: (invoice: Invoice) => void;
}

export const InvoiceList: React.FC<InvoiceListProps> = ({
  onOpenCreateModal,
  onPreviewInvoice,
  onRecordPayment,
  onEditInvoice,
  onSendReminder,
}) => {
  const { invoices, deleteInvoice, convertQuoteToInvoice, formatMoney } = useApp();
  const [filterTab, setFilterTab] = useState<'all' | 'invoices' | 'quotes' | 'pending' | 'paid' | 'overdue'>('all');
  const [search, setSearch] = useState('');
  const [reminderInvoice, setReminderInvoice] = useState<Invoice | null>(null);

  const handleOpenReminder = (inv: Invoice) => {
    if (onSendReminder) {
      onSendReminder(inv);
    } else {
      setReminderInvoice(inv);
    }
  };

  // Calculations
  const totalBilled = invoices.filter((i) => i.type === 'invoice').reduce((s, i) => s + i.total, 0);
  const totalPaid = invoices.filter((i) => i.type === 'invoice').reduce((s, i) => s + i.amountPaid, 0);
  const totalDue = invoices
    .filter((i) => i.type === 'invoice' && (i.status === 'pending' || i.status === 'overdue'))
    .reduce((s, i) => s + (i.total - i.amountPaid), 0);
  const quotesCount = invoices.filter((i) => i.type === 'quote').length;

  // Overdue calculation
  const overdueInvoices = invoices.filter((i) => i.type === 'invoice' && isInvoiceOverdue(i));
  const overdueCount = overdueInvoices.length;
  const overdueTotal = overdueInvoices.reduce((s, i) => s + (i.total - i.amountPaid), 0);

  // Filtered items
  const filtered = invoices.filter((inv) => {
    // Search match
    const matchSearch =
      inv.number.toLowerCase().includes(search.toLowerCase()) ||
      inv.clientName.toLowerCase().includes(search.toLowerCase()) ||
      inv.projectName?.toLowerCase().includes(search.toLowerCase());

    if (!matchSearch) return false;

    if (filterTab === 'invoices') return inv.type === 'invoice';
    if (filterTab === 'quotes') return inv.type === 'quote';
    if (filterTab === 'pending') return inv.status === 'pending' && inv.type === 'invoice' && !isInvoiceOverdue(inv);
    if (filterTab === 'paid') return inv.status === 'paid' && inv.type === 'invoice';
    if (filterTab === 'overdue') return inv.type === 'invoice' && isInvoiceOverdue(inv);
    return true;
  });

  const getStatusBadge = (inv: Invoice) => {
    if (inv.type === 'quote') {
      return (
        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
          Devis
        </span>
      );
    }

    if (inv.status === 'paid') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
          <CheckCircle className="w-3 h-3" />
          Payée
        </span>
      );
    }

    // Check if overdue
    if (isInvoiceOverdue(inv)) {
      const days = getDaysOverdue(inv.dueDate);
      const severity = getOverdueSeverity(days);
      return (
        <div className="flex flex-col items-center gap-0.5">
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-0.5 rounded-full border shadow-sm ${severity.badgeBg} ${severity.badgeColor} ${severity.badgeBorder} animate-pulse`}
          >
            <AlertTriangle className="w-3 h-3 text-rose-400" />
            <span>En retard (+{days}j)</span>
          </span>
          {inv.remindersSent && inv.remindersSent > 0 ? (
            <span className="text-[10px] text-amber-300 font-semibold flex items-center gap-0.5">
              <BellRing className="w-2.5 h-2.5 text-amber-400" />
              <span>{inv.remindersSent} relance(s)</span>
            </span>
          ) : (
            <span className="text-[10px] text-rose-400/80 font-medium">Non relancée</span>
          )}
        </div>
      );
    }

    if (inv.status === 'pending') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
          <Clock className="w-3 h-3" />
          En attente
        </span>
      );
    }

    return (
      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
        Brouillon
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight flex items-center gap-2.5">
            <FileText className="w-7 h-7 text-indigo-400" />
            <span>Facturation & Devis</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Gérez vos pièces comptables, suivez les encaissements et éditez vos devis
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onOpenCreateModal('quote')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nouveau Devis</span>
          </button>
          <button
            onClick={() => onOpenCreateModal('invoice')}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-600/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nouvelle Facture</span>
          </button>
        </div>
      </div>

      {/* Module Spotlight Banner */}
      <div className="bg-gradient-to-r from-indigo-950/60 via-slate-850 to-slate-850 border border-indigo-500/30 rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-500/40 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                Module de Facturation Avancé
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Actif
              </span>
            </div>
            <h2 className="text-sm sm:text-base font-bold text-slate-100">
              Générateur d'articles, calculs automatiques HT/TTC & gestion des échéances
            </h2>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 pt-0.5">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                Listes d'articles en 1 clic (Packs & Catalogue)
              </span>
              <span className="flex items-center gap-1.5">
                <Calculator className="w-3.5 h-3.5 text-emerald-400" />
                Sous-totaux HT, remises & TVA dynamique
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                Échéances rapides (Comptant, 15j, 30j, 45j, 60j)
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => onOpenCreateModal('invoice')}
          className="shrink-0 flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/25 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Créer une Facture</span>
        </button>
      </div>

      {/* Mini Financial KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-850 border border-slate-750">
          <div className="text-slate-400 text-xs font-semibold">Total Émis (Factures)</div>
          <div className="text-base sm:text-lg font-black text-slate-100 mt-0.5 font-mono">
            {formatMoney(totalBilled)}
          </div>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-850 border border-slate-750">
          <div className="text-emerald-400 text-xs font-semibold">Total Encaissé</div>
          <div className="text-base sm:text-lg font-black text-emerald-300 mt-0.5 font-mono">
            {formatMoney(totalPaid)}
          </div>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-850 border border-slate-750">
          <div className="text-amber-400 text-xs font-semibold">Reste à Recouvrer</div>
          <div className="text-base sm:text-lg font-black text-amber-300 mt-0.5 font-mono">
            {formatMoney(totalDue)}
          </div>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-850 border border-slate-750">
          <div className="text-purple-400 text-xs font-semibold">Devis Actifs</div>
          <div className="text-base sm:text-lg font-black text-purple-300 mt-0.5 font-mono">
            {quotesCount} proposition(s)
          </div>
        </div>
      </div>

      {/* Overdue Notification Alert Banner */}
      {overdueCount > 0 && (
        <div className="p-4 bg-gradient-to-r from-rose-950/60 via-slate-850 to-slate-850 border border-rose-500/40 rounded-2xl shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-rose-200">
                  Notification : {overdueCount} facture{overdueCount > 1 ? 's' : ''} en retard ou impayée{overdueCount > 1 ? 's' : ''}
                </h3>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-500 text-white shadow-sm">
                  Retard détecté
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Arriéré total de <strong className="font-mono text-amber-300 font-bold">{formatMoney(overdueTotal)}</strong> nécessitant un suivi de relance client.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {filterTab !== 'overdue' && (
              <button
                onClick={() => setFilterTab('overdue')}
                className="px-3.5 py-1.5 bg-rose-600/30 hover:bg-rose-600/50 text-rose-200 border border-rose-500/40 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Voir les retards ({overdueCount})
              </button>
            )}

            {overdueInvoices[0] && (
              <button
                onClick={() => handleOpenReminder(overdueInvoices[0])}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                <BellRing className="w-4 h-4" />
                <span>Envoyer rappel</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-slate-850 border border-slate-750 rounded-2xl p-4 shadow-lg shadow-black/10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 text-xs">
          {[
            { id: 'all', label: 'Toutes' },
            { id: 'invoices', label: 'Factures' },
            { id: 'quotes', label: 'Devis' },
            { id: 'pending', label: 'En attente' },
            { id: 'paid', label: 'Payées' },
            { id: 'overdue', label: 'En retard' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                filterTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <span>{tab.label}</span>
              {tab.id === 'overdue' && overdueCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-rose-500 text-white shadow">
                  {overdueCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="N° facture, client ou projet..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-slate-850 border border-slate-750 rounded-2xl shadow-lg shadow-black/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-750 bg-slate-900/60 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">Numéro & Type</th>
                <th className="py-3.5 px-4">Client / Destinataire</th>
                <th className="py-3.5 px-4">Émission / Échéance</th>
                <th className="py-3.5 px-4 text-right">Montant Total</th>
                <th className="py-3.5 px-4 text-center">Statut</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <FileText className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    Aucun document trouvé pour ce critère
                  </td>
                </tr>
              ) : (
                filtered.map((inv) => {
                  const remaining = inv.total - inv.amountPaid;
                  const isOverdue = isInvoiceOverdue(inv);
                  const days = getDaysOverdue(inv.dueDate);

                  return (
                    <tr
                      key={inv.id}
                      className={`transition-colors group cursor-pointer ${
                        isOverdue
                          ? 'bg-rose-950/20 hover:bg-rose-950/35 border-l-4 border-l-rose-500'
                          : 'hover:bg-slate-800/50'
                      }`}
                      onClick={() => onPreviewInvoice(inv)}
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-100 font-mono flex items-center gap-1.5">
                          <span>{inv.number}</span>
                        </div>
                        {inv.projectName && (
                          <div className="text-[11px] text-indigo-400 mt-0.5 truncate max-w-[150px]">
                            {inv.projectName}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-200">{inv.clientName}</div>
                        {inv.clientPhone && (
                          <div className="text-[11px] text-slate-400">{inv.clientPhone}</div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="text-slate-300">{inv.issueDate}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Échéance :{' '}
                          <span
                            className={
                              isOverdue ? 'text-rose-400 font-bold' : 'text-slate-400'
                            }
                          >
                            {inv.dueDate}
                            {isOverdue && ` (+${days}j)`}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="font-bold text-slate-100 font-mono text-sm">
                          {formatMoney(inv.total)}
                        </div>
                        {inv.type === 'invoice' && remaining > 0 && inv.status !== 'paid' && (
                          <div className="text-[11px] text-amber-400 font-mono font-semibold">
                            Reste : {formatMoney(remaining)}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        {getStatusBadge(inv)}
                      </td>

                      <td
                        className="py-3.5 px-4 text-right"
                        onClick={(e) => e.stopPropagation()} // Prevent row click
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Send Reminder button (for unpaid invoices) */}
                          {inv.type === 'invoice' && inv.status !== 'paid' && (
                            <button
                              onClick={() => handleOpenReminder(inv)}
                              className={`px-2 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                                isOverdue
                                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-sm'
                                  : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30'
                              }`}
                              title="Envoyer rappel (Email, WhatsApp, SMS)"
                            >
                              <BellRing className="w-3.5 h-3.5" />
                              <span>Rappel</span>
                            </button>
                          )}

                          {/* Print/View */}
                          <button
                            onClick={() => onPreviewInvoice(inv)}
                            className="p-1.5 text-slate-400 hover:text-indigo-300 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                            title="Imprimer / Visualiser"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          {/* If quote: convert to invoice */}
                          {inv.type === 'quote' && (
                            <button
                              onClick={() => convertQuoteToInvoice(inv.id)}
                              className="px-2 py-1 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1"
                              title="Transformer en facture officielle"
                            >
                              <FileCheck2 className="w-3.5 h-3.5" />
                              <span>Facturer</span>
                            </button>
                          )}

                          {/* If invoice pending/overdue: record payment */}
                          {inv.type === 'invoice' && inv.status !== 'paid' && (
                            <button
                              onClick={() => onRecordPayment(inv)}
                              className="px-2 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1"
                              title="Encaisser un paiement (Wave, OM, Banque, Espèces)"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                              <span>Encaisser</span>
                            </button>
                          )}

                          {/* Edit */}
                          <button
                            onClick={() => onEditInvoice(inv)}
                            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                            title="Modifier"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => {
                              if (confirm(`Confirmer la suppression de ${inv.number} ?`)) {
                                deleteInvoice(inv.id);
                              }
                            }}
                            className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Direct Reminder Modal if opened from list */}
      <SendReminderModal
        invoice={reminderInvoice}
        isOpen={!!reminderInvoice}
        onClose={() => setReminderInvoice(null)}
      />
    </div>
  );
};

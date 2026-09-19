import React, { useState } from 'react';
import {
  X,
  Phone,
  Mail,
  MapPin,
  Building,
  FileText,
  FolderKanban,
  CreditCard,
  MessageCircle,
  Plus,
  ArrowUpRight,
  Clock,
  CheckCircle,
  AlertTriangle,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  BrainCircuit,
  Wallet,
  UserCheck,
} from 'lucide-react';
import { Client } from '../../types';
import { useApp } from '../../context/AppContext';

interface ClientDetailModalProps {
  client: Client | null;
  onClose: () => void;
  onOpenCreateInvoiceForClient: (client: Client) => void;
  onPreviewInvoice: (invoiceId: string) => void;
}

export const ClientDetailModal: React.FC<ClientDetailModalProps> = ({
  client,
  onClose,
  onOpenCreateInvoiceForClient,
  onPreviewInvoice,
}) => {
  const { invoices, projects, transactions, formatMoney, showToast } = useApp();

  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!client) return null;

  const clientInvoices = invoices.filter((i) => i.clientId === client.id);
  const clientProjects = projects.filter((p) => p.clientId === client.id);
  const clientTransactions = transactions.filter((t) => t.memberId === client.id);

  const totalInvoiced = clientInvoices.reduce((sum, i) => sum + i.total, 0);
  const totalPaid = clientInvoices.reduce((sum, i) => sum + i.amountPaid, 0);
  const totalDue = clientInvoices
    .filter((i) => i.status === 'pending' || i.status === 'overdue')
    .reduce((sum, i) => sum + (i.total - i.amountPaid), 0);

  // Clean phone for whatsapp
  const cleanPhone = client.phone ? client.phone.replace(/[^0-9]/g, '') : '';

  const handleGenerateAiSummary = async () => {
    setLoadingAi(true);
    setAiError(null);

    try {
      const response = await fetch('/api/ai/client-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client,
          projects: clientProjects,
          invoices: clientInvoices,
          transactions: clientTransactions,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Échec de la génération du résumé');
      }

      const data = await response.json();
      setAiSummary(data.summary);
      showToast('Note de synthèse IA générée avec succès !', 'success');
    } catch (err: any) {
      console.error('Erreur IA:', err);
      setAiError(err.message || 'Impossible de joindre le service de synthèse IA.');
    } finally {
      setLoadingAi(false);
    }
  };

  const handleCopySummary = () => {
    if (!aiSummary) return;
    navigator.clipboard.writeText(aiSummary);
    setCopied(true);
    showToast('Synthèse copiée dans le presse-papier', 'info');
    setTimeout(() => setCopied(false), 2500);
  };

  const renderFormattedSummary = (text: string) => {
    const lines = text.split('\n');
    return (
      <div className="space-y-2 text-xs leading-relaxed text-slate-200">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) return <div key={idx} className="h-1" />;

          // Headings ###
          if (trimmed.startsWith('### ')) {
            return (
              <h4 key={idx} className="text-sm font-bold text-amber-300 pt-1 pb-0.5 border-b border-slate-750">
                {trimmed.replace('### ', '')}
              </h4>
            );
          }
          if (trimmed.startsWith('#### ')) {
            return (
              <h5 key={idx} className="text-xs font-bold text-indigo-300 pt-1">
                {trimmed.replace('#### ', '')}
              </h5>
            );
          }

          // Bullet items
          if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.startsWith('• ')) {
            const content = trimmed.substring(2);
            return (
              <div key={idx} className="flex items-start gap-2 pl-2">
                <span className="text-indigo-400 mt-1 shrink-0">•</span>
                <span>{renderInlineStyles(content)}</span>
              </div>
            );
          }

          // Numbered items
          if (/^\d+\.\s/.test(trimmed)) {
            return (
              <div key={idx} className="flex items-start gap-2 pl-2 font-medium">
                <span className="text-amber-400 shrink-0">{trimmed.match(/^\d+\./)?.[0]}</span>
                <span>{renderInlineStyles(trimmed.replace(/^\d+\.\s*/, ''))}</span>
              </div>
            );
          }

          return <p key={idx}>{renderInlineStyles(trimmed)}</p>;
        })}
      </div>
    );
  };

  // Helper to format inline bold **text**
  const renderInlineStyles = (str: string) => {
    const parts = str.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-bold text-slate-100">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-750 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-850">
          <div className="flex items-center gap-3">
            <span className={`w-10 h-10 rounded-xl ${client.avatarColor || 'bg-indigo-600'} text-white font-bold flex items-center justify-center text-sm shadow`}>
              {client.name.substring(0, 2).toUpperCase()}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-100">{client.name}</h2>
                {client.memberStatus && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase border ${
                      client.memberStatus === 'active'
                        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                        : client.memberStatus === 'radiated'
                        ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                        : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                    }`}
                  >
                    {client.memberStatus === 'active' ? 'Adhérent Actif' : client.memberStatus === 'radiated' ? 'Radié' : 'Suspendu'}
                  </span>
                )}
              </div>
              <span className="text-xs text-slate-400">
                {client.bureauRole ? `Rôle au bureau : ${client.bureauRole}` : client.companyName || 'Membre Adhérent'}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Quick Contact & Action Ribbon */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-850 border border-slate-750">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {client.phone && (
                <a
                  href={`tel:${client.phone}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 rounded-lg border border-slate-700 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{client.phone}</span>
                </a>
              )}

              {cleanPhone && (
                <a
                  href={`https://wa.me/${cleanPhone}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 rounded-lg border border-emerald-500/30 transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>WhatsApp</span>
                </a>
              )}

              {client.email && (
                <a
                  href={`mailto:${client.email}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 rounded-lg border border-slate-700 transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{client.email}</span>
                </a>
              )}
            </div>

            <button
              onClick={() => {
                onClose();
                onOpenCreateInvoiceForClient(client);
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Créer une Facture / Appel</span>
            </button>
          </div>

          {/* AI SUMMARY SECTION */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-slate-850 to-purple-950/30 border border-indigo-500/30 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-indigo-500/20">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/20">
                  <Sparkles className="w-4 h-4 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100 flex items-center gap-1.5">
                    <span>Synthèse IA Administrative & Financière</span>
                    <span className="text-[10px] font-normal px-2 py-0.2 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
                      Nexus IA
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Analyse automatique consolidée des projets, factures, cotisations et historique de l'adhérent
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {aiSummary && (
                  <button
                    onClick={handleCopySummary}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-lg text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
                    title="Copier la note de synthèse"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copié !' : 'Copier'}</span>
                  </button>
                )}

                <button
                  onClick={handleGenerateAiSummary}
                  disabled={loadingAi}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow cursor-pointer ${
                    loadingAi
                      ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-indigo-600/20'
                  }`}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingAi ? 'animate-spin text-indigo-400' : ''}`} />
                  <span>{loadingAi ? 'Génération en cours...' : aiSummary ? 'Régénérer la note' : 'Générer la note IA'}</span>
                </button>
              </div>
            </div>

            {/* AI Summary Body */}
            <div className="pt-3">
              {loadingAi && (
                <div className="py-8 text-center space-y-3">
                  <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mx-auto" />
                  <p className="text-xs text-slate-300 font-semibold animate-pulse">
                    Analyse de l'historique comptable et des projets de {client.name}...
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Calcul des ratios de régularité, arriérés et participation aux chantiers
                  </p>
                </div>
              )}

              {aiError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                  <div>
                    <div className="font-bold">Erreur de génération</div>
                    <div>{aiError}</div>
                  </div>
                </div>
              )}

              {!loadingAi && !aiError && aiSummary && (
                <div className="p-4 bg-slate-900/80 rounded-xl border border-indigo-500/20 shadow-inner">
                  {renderFormattedSummary(aiSummary)}
                </div>
              )}

              {!loadingAi && !aiError && !aiSummary && (
                <div className="py-4 px-3 bg-slate-900/40 rounded-xl border border-dashed border-slate-750 text-center">
                  <p className="text-xs text-slate-400">
                    Cliquez sur <strong>"Générer la note IA"</strong> pour obtenir un bilan récapitulatif complet de la situation de cet adhérent basé sur son historique de cotisations, factures et projets associés.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Financial summary for this client */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-850 border border-slate-750">
              <span className="text-[11px] font-semibold text-slate-400">Total Facturé / Émis</span>
              <div className="text-base font-black text-slate-100 font-mono mt-0.5">
                {formatMoney(totalInvoiced || client.totalBilled || 0)}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-850 border border-slate-750">
              <span className="text-[11px] font-semibold text-emerald-400">Total Encaissé / Réglé</span>
              <div className="text-base font-black text-emerald-300 font-mono mt-0.5">
                {formatMoney(totalPaid || ((client.totalBilled || 0) - (client.outstandingBalance || 0)))}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-850 border border-slate-750">
              <span className="text-[11px] font-semibold text-amber-400">Arriéré / Reste Dû</span>
              <div className="text-base font-black text-amber-300 font-mono mt-0.5">
                {formatMoney(client.outstandingBalance !== undefined ? client.outstandingBalance : totalDue)}
              </div>
            </div>
          </div>

          {/* Notes if any */}
          {client.notes && (
            <div className="p-3.5 rounded-xl bg-slate-850/60 border border-slate-800 text-xs text-slate-300">
              <span className="font-bold text-slate-400 block mb-1">Historique & Observations du Bureau :</span>
              {client.notes}
            </div>
          )}

          {/* Invoices / Cotisations List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-400" />
                <span>Historique des Factures & Appels de Cotisation ({clientInvoices.length})</span>
              </h3>
            </div>

            {clientInvoices.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 bg-slate-850/50 rounded-xl border border-slate-800">
                Aucune facture ou appel de fond émis pour ce client pour le moment.
              </div>
            ) : (
              <div className="space-y-2">
                {clientInvoices.map((inv) => (
                  <div
                    key={inv.id}
                    onClick={() => {
                      onClose();
                      onPreviewInvoice(inv.id);
                    }}
                    className="p-3 bg-slate-850 hover:bg-slate-800 border border-slate-750 rounded-xl flex items-center justify-between text-xs transition-colors cursor-pointer"
                  >
                    <div>
                      <div className="font-bold text-slate-200 font-mono flex items-center gap-2">
                        <span>{inv.number}</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded font-sans uppercase font-bold ${
                            inv.status === 'paid'
                              ? 'text-emerald-400 bg-emerald-500/10'
                              : inv.status === 'overdue'
                              ? 'text-rose-400 bg-rose-500/10'
                              : 'text-amber-400 bg-amber-500/10'
                          }`}
                        >
                          {inv.status === 'paid' ? 'Payée' : inv.status === 'overdue' ? 'En retard' : 'En attente'}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400">Émise le {inv.issueDate}</span>
                    </div>

                    <div className="text-right">
                      <div className="font-bold text-slate-100 font-mono">{formatMoney(inv.total)}</div>
                      {inv.total > inv.amountPaid && inv.status !== 'paid' && (
                        <div className="text-[10px] text-amber-400">
                          Reste: {formatMoney(inv.total - inv.amountPaid)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Associated Projects */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2 mb-3">
              <FolderKanban className="w-4 h-4 text-emerald-400" />
              <span>Projets & Commissions Assignés ({clientProjects.length})</span>
            </h3>

            {clientProjects.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 bg-slate-850/50 rounded-xl border border-slate-800">
                Aucun projet ou commission attribué à ce membre.
              </div>
            ) : (
              <div className="space-y-2">
                {clientProjects.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 bg-slate-850 border border-slate-750 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-200 flex items-center gap-2">
                        <span className="font-mono text-indigo-400 text-[11px]">{p.code}</span>
                        <span>{p.title}</span>
                      </div>
                      <span className="text-[11px] text-slate-400">Échéance : {p.dueDate}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-bold text-indigo-400">{p.progress}%</span>
                      <span className="font-mono text-slate-300 font-bold">{formatMoney(p.budget)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  X,
  Send,
  Mail,
  MessageSquare,
  Smartphone,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Clock,
  ExternalLink,
  ShieldAlert,
  BellRing,
  Check,
} from 'lucide-react';
import { Invoice, ReminderChannel, ReminderLevel } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  getDaysOverdue,
  getOverdueSeverity,
  generateReminderTemplate,
} from '../../utils/invoiceOverdueUtils';

interface SendReminderModalProps {
  invoice: Invoice | null;
  isOpen: boolean;
  onClose: () => void;
}

export const SendReminderModal: React.FC<SendReminderModalProps> = ({
  invoice,
  isOpen,
  onClose,
}) => {
  const { settings, formatMoney, sendInvoiceReminder } = useApp();

  const [channel, setChannel] = useState<ReminderChannel>('email');
  const [level, setLevel] = useState<ReminderLevel>('friendly');
  const [recipient, setRecipient] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize or re-calculate template whenever invoice, channel, or level changes
  useEffect(() => {
    if (!invoice) return;

    // Default channel based on available client info
    const initialChannel: ReminderChannel = invoice.clientEmail
      ? 'email'
      : invoice.clientPhone
      ? 'whatsapp'
      : 'email';
    setChannel(initialChannel);

    // Default level: if already had reminders, escalate
    const previousCount = invoice.remindersSent || 0;
    const initialLevel: ReminderLevel =
      previousCount === 0 ? 'friendly' : previousCount === 1 ? 'firm' : 'urgent';
    setLevel(initialLevel);

    setRecipient(
      initialChannel === 'email'
        ? invoice.clientEmail || ''
        : invoice.clientPhone || ''
    );
  }, [invoice]);

  // Update recipient when channel changes
  useEffect(() => {
    if (!invoice) return;
    if (channel === 'email') {
      setRecipient(invoice.clientEmail || '');
    } else {
      setRecipient(invoice.clientPhone || '');
    }
  }, [channel, invoice]);

  // Update template message when level or channel changes
  useEffect(() => {
    if (!invoice) return;
    const template = generateReminderTemplate({
      invoice,
      settings,
      level,
      channel,
      formatMoney,
    });
    setSubject(template.subject);
    setMessage(template.message);
  }, [invoice, settings, level, channel, formatMoney]);

  if (!isOpen || !invoice) return null;

  const remaining = invoice.total - invoice.amountPaid;
  const days = getDaysOverdue(invoice.dueDate);
  const severity = getOverdueSeverity(days);
  const previousReminders = invoice.remindersSent || 0;

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(
        channel === 'email' ? `Objet : ${subject}\n\n${message}` : message
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleSendReminder = () => {
    setIsSubmitting(true);

    sendInvoiceReminder(invoice.id, {
      channel,
      level,
      recipient: recipient || invoice.clientEmail || invoice.clientPhone || invoice.clientName,
      notes: `Relance ${level} (${subject})`,
    });

    setIsSubmitting(false);
    onClose();
  };

  const handleOpenWhatsAppDirect = () => {
    const cleanPhone = (recipient || invoice.clientPhone || '').replace(/[^0-9]/g, '');
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');

    // Also record reminder
    sendInvoiceReminder(invoice.id, {
      channel: 'whatsapp',
      level,
      recipient: cleanPhone,
      notes: `Lien WhatsApp ouvert directement`,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-750 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-850">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
              <BellRing className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-100">
                  Envoyer un rappel de paiement
                </h3>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${severity.badgeBg} ${severity.badgeColor} ${severity.badgeBorder}`}
                >
                  {severity.severityText}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Facture <span className="font-mono text-slate-200">{invoice.number}</span> •{' '}
                {invoice.clientName}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs text-slate-300">
          {/* Summary Box */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-slate-850/80 border border-slate-750 rounded-xl">
            <div>
              <span className="text-[11px] text-slate-400 block font-medium">Solde impayé</span>
              <span className="text-base font-black text-amber-400 font-mono">
                {formatMoney(remaining)}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block font-medium">Date d'échéance</span>
              <span className="text-xs font-bold text-rose-300">
                {invoice.dueDate} ({days} jours de retard)
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block font-medium">Historique des relances</span>
              <span className="text-xs font-semibold text-slate-200">
                {previousReminders === 0 ? (
                  <span className="text-slate-400">Aucun rappel envoyé</span>
                ) : (
                  <span className="text-indigo-300 font-bold">
                    {previousReminders} rappel(s) déjà émis
                  </span>
                )}
              </span>
            </div>
          </div>

          {/* Previous reminder date tag if any */}
          {invoice.lastReminderAt && (
            <div className="flex items-center gap-2 px-3 py-2 bg-indigo-950/30 border border-indigo-500/20 rounded-lg text-slate-300 text-[11px]">
              <Clock className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span>
                Dernière relance transmise le{' '}
                <strong className="text-indigo-200">
                  {new Date(invoice.lastReminderAt).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </strong>{' '}
                via{' '}
                <span className="capitalize font-bold text-indigo-300">
                  {invoice.lastReminderChannel || 'message'}
                </span>
                .
              </span>
            </div>
          )}

          {/* Channel Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-200 uppercase tracking-wider block">
              1. Canal de transmission
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setChannel('email')}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  channel === 'email'
                    ? 'bg-indigo-600/30 border-indigo-500 text-white shadow-md'
                    : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Mail className="w-4 h-4 text-indigo-400" />
                <span>Email</span>
              </button>

              <button
                type="button"
                onClick={() => setChannel('whatsapp')}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  channel === 'whatsapp'
                    ? 'bg-emerald-600/30 border-emerald-500 text-white shadow-md'
                    : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span>WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={() => setChannel('sms')}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  channel === 'sms'
                    ? 'bg-amber-600/30 border-amber-500 text-white shadow-md'
                    : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Smartphone className="w-4 h-4 text-amber-400" />
                <span>SMS Pro</span>
              </button>

              <button
                type="button"
                onClick={() => setChannel('letter')}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  channel === 'letter'
                    ? 'bg-purple-600/30 border-purple-500 text-white shadow-md'
                    : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <FileText className="w-4 h-4 text-purple-400" />
                <span>Avis Officiel</span>
              </button>
            </div>
          </div>

          {/* Level Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-200 uppercase tracking-wider block">
              2. Niveau d'urgence & Modèle
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setLevel('friendly')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  level === 'friendly'
                    ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-200 shadow-md'
                    : 'bg-slate-800/60 border-slate-750 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>1ère Relance Amiable</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Ton courtois, simple rappel d'échéance et remerciements.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setLevel('firm')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  level === 'firm'
                    ? 'bg-amber-950/40 border-amber-500/60 text-amber-200 shadow-md'
                    : 'bg-slate-800/60 border-slate-750 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs text-amber-400">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>2ème Relance Formelle</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Constat de non-réponse, délai ferme de 48h demandé.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setLevel('urgent')}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  level === 'urgent'
                    ? 'bg-rose-950/40 border-rose-500/60 text-rose-200 shadow-md'
                    : 'bg-slate-800/60 border-slate-750 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs text-rose-400">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Dernier Avis / Mise en demeure</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Délai ultime 24h avant suspension ou pénalités légales.
                </p>
              </button>
            </div>
          </div>

          {/* Recipient Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-200 uppercase tracking-wider block">
              {channel === 'email' ? 'Adresse Email du Destinataire' : 'Numéro de Téléphone (WhatsApp / SMS)'}
            </label>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder={channel === 'email' ? 'client@exemple.ci' : '+225 07 ...'}
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Subject (for Email) */}
          {channel === 'email' && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-200 uppercase tracking-wider block">
                Objet du message
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}

          {/* Message Textarea */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200 uppercase tracking-wider block">
                Message personnalisé
              </label>
              <button
                type="button"
                onClick={handleCopyMessage}
                className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold transition-colors cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copié dans le presse-papier !</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copier le texte</span>
                  </>
                )}
              </button>
            </div>
            <textarea
              rows={8}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-3 bg-slate-950 border border-slate-750 rounded-xl text-xs text-slate-200 leading-relaxed font-sans focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-t border-slate-800 bg-slate-850">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            Annuler
          </button>

          <div className="flex items-center gap-2">
            {channel === 'whatsapp' && (
              <button
                type="button"
                onClick={handleOpenWhatsAppDirect}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/25 cursor-pointer"
                title="Ouvrir la discussion WhatsApp avec le message pré-rempli"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Ouvrir WhatsApp & Notifier</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleSendReminder}
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/25 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>Enregistrer & Confirmer l'envoi</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

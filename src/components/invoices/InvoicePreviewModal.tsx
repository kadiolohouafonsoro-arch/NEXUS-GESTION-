import React, { useState } from 'react';
import {
  X,
  Printer,
  Download,
  CheckCircle,
  Clock,
  AlertTriangle,
  QrCode,
  Smartphone,
  Building,
  ShieldCheck,
  BellRing,
  Send,
  MessageCircle,
  FileCheck2,
  Receipt,
  FileText,
} from 'lucide-react';
import { Invoice } from '../../types';
import { useApp } from '../../context/AppContext';
import { numberToWordsFrench } from '../../utils/numberToWordsFrench';
import { isInvoiceOverdue, getDaysOverdue, getOverdueSeverity } from '../../utils/invoiceOverdueUtils';
import { SendReminderModal } from './SendReminderModal';

interface InvoicePreviewModalProps {
  invoice: Invoice | null;
  onClose: () => void;
  onRecordPayment?: (invoice: Invoice) => void;
  onSendReminder?: (invoice: Invoice) => void;
}

export const InvoicePreviewModal: React.FC<InvoicePreviewModalProps> = ({
  invoice,
  onClose,
  onRecordPayment,
  onSendReminder,
}) => {
  const { settings, formatMoney } = useApp();
  const [reminderModalOpen, setReminderModalOpen] = useState(false);
  const [docFormat, setDocFormat] = useState<'dgi' | 'standard' | 'receipt'>('dgi');

  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const remaining = invoice.total - invoice.amountPaid;
  const overdue = isInvoiceOverdue(invoice);
  const days = getDaysOverdue(invoice.dueDate);
  const severity = getOverdueSeverity(days);

  const handleOpenReminder = () => {
    if (onSendReminder) {
      onSendReminder(invoice);
    } else {
      setReminderModalOpen(true);
    }
  };

  const getWhatsAppInvoiceLink = () => {
    if (!invoice.clientPhone) return null;
    let cleanPhone = invoice.clientPhone.replace(/[^0-9]/g, '');
    if (cleanPhone.length === 10 && !cleanPhone.startsWith('225')) {
      cleanPhone = `225${cleanPhone}`;
    }
    const text = `Bonjour ${invoice.clientName},\n\nVeuillez trouver ci-joint votre ${
      invoice.type === 'quote' ? 'Devis' : 'Facture'
    } N° ${invoice.number} émise par ${settings.name}.\n\n• Montant total : ${formatMoney(
      invoice.total
    )}${
      invoice.amountPaid > 0 ? `\n• Reste à régler : ${formatMoney(remaining)}` : ''
    }\n• Date d'échéance : ${invoice.dueDate}\n\nMODALITÉS DE RÈGLEMENT RAPIDE (CÔTE D'IVOIRE / UEMOA) :\n- Wave : ${
      settings.waveNumber || settings.phone
    }\n- Orange Money (#144#) : ${
      settings.orangeMoneyNumber || settings.phone
    }\n- MTN MoMo (*133#) : ${settings.mtnMomoNumber || settings.phone}${
      settings.moovMoneyNumber ? `\n- Moov Money (*155#) : ${settings.moovMoneyNumber}` : ''
    }${settings.djamoTag ? `\n- Djamo Tag : ${settings.djamoTag}` : ''}\n- Virement bancaire : ${
      settings.bankName
    } (IBAN/RIB : ${settings.bankIban || settings.bankRib || 'RIB fourni sur facture'})\n\nMerci pour votre diligence.\n${
      settings.name
    }`;
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
  };

  const waLink = getWhatsAppInvoiceLink();

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 no-print-backdrop">
        <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-750 rounded-2xl shadow-2xl flex flex-col max-h-[94vh] overflow-hidden">
          {/* Modal Controls Header */}
          <div className="no-print flex flex-col sm:flex-row items-stretch sm:items-center justify-between px-6 py-3.5 border-b border-slate-800 bg-slate-850 gap-3">
            <div className="flex items-center gap-3">
              <span className="text-base font-bold text-slate-100">
                {docFormat === 'receipt'
                  ? 'Quittance / Reçu'
                  : invoice.type === 'quote'
                  ? 'Devis'
                  : 'Facture'}{' '}
                {invoice.number}
              </span>
              <span
                className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                  invoice.status === 'paid'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : overdue
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}
              >
                {overdue ? 'EN RETARD' : invoice.status.toUpperCase()}
              </span>
            </div>

            {/* Doc Type Selector */}
            <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs">
              <button
                type="button"
                onClick={() => setDocFormat('dgi')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  docFormat === 'dgi'
                    ? 'bg-orange-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileCheck2 className="w-3.5 h-3.5" />
                <span>Facture DGI (CI)</span>
              </button>
              <button
                type="button"
                onClick={() => setDocFormat('standard')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  docFormat === 'standard'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Standard / Mutuelle</span>
              </button>
              <button
                type="button"
                onClick={() => setDocFormat('receipt')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  docFormat === 'receipt'
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>Quittance & Reçu</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              {/* WhatsApp direct share */}
              {waLink && (
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
                  title="Envoyer la facture et les liens Wave/OM directement sur WhatsApp"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span className="hidden sm:inline">WhatsApp</span>
                </a>
              )}

              {/* Button: Envoyer rappel (highlighted for unpaid/overdue invoices) */}
              {invoice.type === 'invoice' && invoice.status !== 'paid' && (
                <button
                  onClick={handleOpenReminder}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
                  title="Envoyer une notification de rappel par Email, WhatsApp ou SMS"
                >
                  <BellRing className="w-4 h-4" />
                  <span className="hidden sm:inline">Relancer</span>
                </button>
              )}

              {invoice.status !== 'paid' && onRecordPayment && (
                <button
                  onClick={() => onRecordPayment(invoice)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Encaisser</span>
                </button>
              )}

              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimer</span>
              </button>

              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Overdue Notification Alert Banner inside Detail View */}
          {overdue && (
            <div className="no-print bg-rose-950/70 border-b border-rose-500/30 px-6 py-2 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5 text-rose-200">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>
                  <strong>Alerte Échéance Dépassée :</strong> En retard de{' '}
                  <strong className="text-white underline">{days} jours</strong> (échéance au {invoice.dueDate}). Solde restant :{' '}
                  <strong className="font-mono text-amber-300 font-bold">{formatMoney(remaining)}</strong>
                </span>
              </div>
              <button
                onClick={handleOpenReminder}
                className="flex items-center gap-1 px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg transition-colors text-xs cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Relancer le client</span>
              </button>
            </div>
          )}

          {/* Printable Document Paper */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-950 print-container">
            {docFormat === 'receipt' ? (
              /* QUITTANCE & REÇU OFFICIEL DE RÈGLEMENT */
              <div className="max-w-3xl mx-auto bg-white text-slate-900 rounded-xl p-8 sm:p-12 shadow-2xl print:shadow-none print:p-0 print:m-0 border border-slate-200">
                {/* Header Reçu */}
                <div className="flex justify-between items-start border-b-2 border-emerald-600 pb-6">
                  <div>
                    <h1 className="text-xl font-black text-slate-900 uppercase">
                      {settings.name}
                    </h1>
                    <p className="text-xs text-slate-500 font-medium">{settings.subtitle}</p>
                    <p className="text-xs text-slate-600 mt-1">
                      {settings.address} - {settings.city}, {settings.country}
                    </p>
                    <p className="text-xs text-slate-600">
                      Tél : {settings.phone} • Email : {settings.email}
                    </p>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                      NCC : {settings.ncc || 'Non renseigné'} • RCCM : {settings.rccm}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-3 py-1 rounded bg-emerald-100 text-emerald-800 font-black text-xs uppercase tracking-wider mb-2">
                      QUITTANCE DE PAIEMENT
                    </span>
                    <div className="text-xl font-black text-slate-900 font-mono">
                      REÇU-FAC-{invoice.number}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Date : {invoice.paidAt || new Date().toISOString().split('T')[0]}
                    </div>
                  </div>
                </div>

                {/* Corps de la Quittance */}
                <div className="my-8 p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 text-xs leading-relaxed">
                  <p className="text-sm">
                    La direction soussignée de <strong>{settings.name}</strong> certifie et atteste par la présente avoir reçu de :
                  </p>

                  <div className="p-4 bg-white rounded-xl border border-slate-200">
                    <div className="text-base font-bold text-slate-900">{invoice.clientName}</div>
                    {invoice.clientNcc && (
                      <div className="text-xs text-slate-600 font-mono mt-0.5">
                        Compte Contribuable (NCC) : <strong>{invoice.clientNcc}</strong>
                      </div>
                    )}
                    {invoice.clientAddress && (
                      <div className="text-xs text-slate-600 mt-0.5">{invoice.clientAddress}</div>
                    )}
                    {invoice.clientPhone && (
                      <div className="text-xs text-slate-600">Tél : {invoice.clientPhone}</div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                      <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                        Montant Total Encaissé
                      </span>
                      <span className="text-2xl font-black text-emerald-700 font-mono">
                        {formatMoney(invoice.amountPaid > 0 ? invoice.amountPaid : invoice.total)}
                      </span>
                    </div>

                    <div className="p-4 bg-white rounded-xl border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        Canal & Moyen de Paiement
                      </span>
                      <span className="text-sm font-bold text-slate-800 capitalize">
                        {invoice.paymentMethod
                          ? invoice.paymentMethod.replace('_', ' ').toUpperCase()
                          : 'Mobile Money / Virement'}
                      </span>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        Réf. Facture d'origine : {invoice.number}
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200 text-slate-700 italic">
                    « Somme reçue arrêtée à :{' '}
                    <strong>
                      {numberToWordsFrench(
                        invoice.amountPaid > 0 ? invoice.amountPaid : invoice.total,
                        settings.currency
                      )}
                    </strong>{' '}
                    »
                  </div>

                  <p className="text-slate-600 pt-2 text-[11px]">
                    En conséquence de quoi, quittance et décharge valables sont accordées au souscripteur pour ladite somme.
                  </p>
                </div>

                {/* Signatures et Tampon officiel */}
                <div className="flex justify-between items-center pt-8 border-t border-slate-200">
                  <div className="text-center">
                    <div className="w-24 h-24 rounded-full border-2 border-dashed border-emerald-600 text-emerald-700 flex flex-col items-center justify-center p-2 text-[9px] font-black uppercase text-center rotate-[-8deg] bg-emerald-50/50">
                      <span>★ CERTIFIÉ ACQUITTÉ ★</span>
                      <span className="text-[8px] font-bold mt-1">
                        {settings.city?.toUpperCase()}
                      </span>
                      <span className="text-[7px] text-emerald-800 mt-0.5 font-mono">
                        {invoice.paidAt || 'VALIDE'}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-700">Pour la Trésorerie / Direction</p>
                    <p className="text-[10px] text-slate-400 italic mt-0.5">Cachet & Signature autorisée</p>
                    <div className="w-40 h-14 border-b border-slate-300 mt-2"></div>
                  </div>
                </div>
              </div>
            ) : (
              /* FACTURE OFFICIELLE (DGI OU STANDARD) */
              <div className="max-w-3xl mx-auto bg-white text-slate-900 rounded-xl p-8 sm:p-12 shadow-2xl print:shadow-none print:p-0 print:m-0 border border-slate-200">
                {/* En-tête officiel République de Côte d'Ivoire si DGI */}
                {docFormat === 'dgi' && (
                  <div className="mb-6 pb-4 border-b-2 border-orange-500 flex flex-col sm:flex-row justify-between items-start text-[11px] text-slate-700">
                    <div>
                      <div className="font-black text-slate-900 tracking-wider text-xs uppercase">
                        RÉPUBLIQUE DE CÔTE D'IVOIRE
                      </div>
                      <div className="italic text-[10px] text-slate-500">
                        Union - Discipline - Travail
                      </div>
                      <div className="font-semibold text-orange-700 mt-1">
                        Direction Générale des Impôts (DGI)
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Centre des Impôts : <strong>{settings.taxCenter || 'Centre CDI Abidjan'}</strong>
                      </div>
                    </div>

                    <div className="mt-2 sm:mt-0 p-2.5 rounded-lg bg-orange-50 border border-orange-200 text-right">
                      <div className="text-[10px] font-bold text-orange-800 uppercase">
                        FACTURE NORMALISÉE DGI
                      </div>
                      <div className="font-mono font-bold text-slate-900 text-xs mt-0.5">
                        Sticker : {invoice.dgiStickerNumber || settings.ncc || 'DGI-CI-2025-082914'}
                      </div>
                      <div className="text-[9px] text-slate-600 mt-0.5">
                        Régime : {invoice.taxRegime || settings.taxRegime || 'Régime Réel Normal'}
                      </div>
                    </div>
                  </div>
                )}

                {/* Invoice Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-slate-200 pb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-lg">
                        {settings.acronym?.slice(0, 2) || 'NX'}
                      </div>
                      <div>
                        <h1 className="text-xl font-black tracking-tight text-slate-900 uppercase">
                          {settings.name}
                        </h1>
                        <p className="text-xs text-slate-500 font-medium">{settings.subtitle}</p>
                      </div>
                    </div>
                    <div className="text-xs text-slate-600 space-y-0.5 mt-3">
                      <p>{settings.address}</p>
                      <p>
                        {settings.city}, {settings.country}
                      </p>
                      <p>Tél : {settings.phone} • Email : {settings.email}</p>
                      <div className="pt-1 text-[11px] font-mono space-y-0.5">
                        <p className="text-slate-800">
                          <strong>NCC (Compte Contribuable) :</strong> {settings.ncc || 'Non renseigné'}
                        </p>
                        <p className="text-slate-500">RCCM : {settings.rccm}</p>
                      </div>
                    </div>
                  </div>

                  {/* Invoice Meta */}
                  <div className="sm:text-right">
                    <span
                      className={`inline-block px-3 py-1 rounded-md font-black text-xs uppercase tracking-wider mb-2 ${
                        docFormat === 'dgi'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-indigo-50 text-indigo-700'
                      }`}
                    >
                      {invoice.type === 'quote'
                        ? 'DEVIS ESTIMATIF'
                        : docFormat === 'dgi'
                        ? 'FACTURE NORMALISÉE'
                        : 'FACTURE OFFICIELLE'}
                    </span>
                    <div className="text-2xl font-black text-slate-900 font-mono">{invoice.number}</div>
                    <div className="text-xs text-slate-600 mt-2 space-y-1">
                      <p>
                        <strong>Date d'émission :</strong> {invoice.issueDate}
                      </p>
                      <p>
                        <strong>Date d'échéance :</strong> {invoice.dueDate}
                      </p>
                      {invoice.projectName && (
                        <p>
                          <strong>Projet / Activité :</strong> {invoice.projectName}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Client Info Card */}
                <div className="my-6 p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row justify-between gap-4">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Destinataire / Facturé à :
                    </span>
                    <div className="text-sm font-bold text-slate-900 mt-1">{invoice.clientName}</div>
                    {invoice.clientNcc && (
                      <p className="text-xs font-mono font-bold text-indigo-700 mt-0.5">
                        NCC Client : {invoice.clientNcc}
                      </p>
                    )}
                    {invoice.clientAddress && (
                      <p className="text-xs text-slate-600 mt-0.5">{invoice.clientAddress}</p>
                    )}
                    {invoice.clientEmail && (
                      <p className="text-xs text-slate-600">{invoice.clientEmail}</p>
                    )}
                    {invoice.clientPhone && (
                      <p className="text-xs text-slate-600">{invoice.clientPhone}</p>
                    )}
                  </div>

                  <div className="sm:text-right flex flex-col justify-end">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Statut de règlement :
                    </span>
                    <div className="mt-1">
                      {invoice.status === 'paid' ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-md">
                          <CheckCircle className="w-3.5 h-3.5" />
                          ACQUITTÉE (Soldée)
                        </span>
                      ) : invoice.status === 'overdue' ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-100 px-2.5 py-1 rounded-md">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          EN RETARD DE PAIEMENT
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-md">
                          <Clock className="w-3.5 h-3.5" />
                          EN ATTENTE DE RÈGLEMENT
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Table of Items */}
                <table className="w-full text-left border-collapse text-xs my-6">
                  <thead>
                    <tr className="border-b-2 border-slate-200 bg-slate-100/70 text-slate-700 font-bold">
                      <th className="py-2.5 px-3">Désignation des prestations / articles</th>
                      <th className="py-2.5 px-3 text-center">Qté</th>
                      <th className="py-2.5 px-3 text-right">Prix Unitaire HT</th>
                      <th className="py-2.5 px-3 text-right">Montant Total HT</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {invoice.items.map((item, idx) => (
                      <tr key={item.id || idx} className="hover:bg-slate-50/50">
                        <td className="py-3 px-3 font-medium text-slate-800">{item.description}</td>
                        <td className="py-3 px-3 text-center text-slate-600 font-mono">{item.quantity}</td>
                        <td className="py-3 px-3 text-right text-slate-600 font-mono">
                          {formatMoney(item.unitPrice)}
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-slate-900 font-mono">
                          {formatMoney(item.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Totals Summary */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-t border-slate-200 pt-4">
                  <div className="w-full sm:max-w-xs space-y-2 text-xs">
                    {invoice.notes && (
                      <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-600">
                        <span className="font-bold text-slate-700 block mb-0.5">Notes & Mentions :</span>
                        {invoice.notes}
                      </div>
                    )}
                    {docFormat === 'dgi' && (
                      <div className="p-2.5 bg-orange-50/50 rounded-lg border border-orange-200 text-[10px] text-orange-800">
                        Facture établie conformément aux articles 438 et suivants du Code Général des Impôts (CGI) de Côte d'Ivoire.
                      </div>
                    )}
                  </div>

                  <div className="w-full sm:max-w-xs space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Sous-total HT :</span>
                      <span className="font-mono font-medium">{formatMoney(invoice.subtotal)}</span>
                    </div>

                    {invoice.discount > 0 && (
                      <div className="flex justify-between text-emerald-600 font-medium">
                        <span>Remise accordée :</span>
                        <span className="font-mono">-{formatMoney(invoice.discount)}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-slate-600">
                      <span>TVA ({invoice.taxRate}%) :</span>
                      <span className="font-mono font-medium">{formatMoney(invoice.taxAmount)}</span>
                    </div>

                    <div className="flex justify-between text-sm font-black text-slate-900 border-t-2 border-slate-900 pt-2 pb-1">
                      <span>TOTAL TTC :</span>
                      <span className="font-mono text-indigo-700">{formatMoney(invoice.total)}</span>
                    </div>

                    {invoice.amountPaid > 0 && (
                      <div className="flex justify-between text-xs text-emerald-700 font-bold pt-1">
                        <span>Déjà réglé :</span>
                        <span className="font-mono">-{formatMoney(invoice.amountPaid)}</span>
                      </div>
                    )}

                    {remaining > 0 && (
                      <div className="flex justify-between text-xs font-bold text-rose-700 bg-rose-50 p-2 rounded-md">
                        <span>Reste à régler :</span>
                        <span className="font-mono">{formatMoney(remaining)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Montant légal en toutes lettres */}
                <div className="mt-4 p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
                    Montant arrêté en toutes lettres :
                  </span>
                  <p className="italic font-medium text-slate-800">
                    « Arrêté la présente facture à la somme de {numberToWordsFrench(invoice.total, settings.currency)} TTC »
                  </p>
                </div>

                {/* Payment Coordinates Box (Wave, Orange Money, MTN MoMo, Moov, Djamo, SGCI) */}
                <div className="mt-8 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <div className="font-bold text-slate-800 mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Smartphone className="w-4 h-4 text-indigo-600" />
                      <span>Coordonnées de Règlement UEMOA & Mobile Money (Côte d'Ivoire)</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">Devise : FCFA (XOF)</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-[11px]">
                    <div className="p-2 rounded-lg bg-white border border-slate-200">
                      <div className="font-bold text-sky-600 flex items-center gap-1">
                        <span>Wave CI</span>
                      </div>
                      <div className="font-mono font-bold text-slate-800 text-[11px] mt-0.5">
                        {settings.waveNumber || settings.phone}
                      </div>
                      <div className="text-slate-400 text-[9px]">Instantané 0% frais</div>
                    </div>

                    <div className="p-2 rounded-lg bg-white border border-slate-200">
                      <div className="font-bold text-amber-600 flex items-center gap-1">
                        <span>Orange Money</span>
                      </div>
                      <div className="font-mono font-bold text-slate-800 text-[11px] mt-0.5">
                        {settings.orangeMoneyNumber || settings.phone}
                      </div>
                      <div className="text-slate-400 text-[9px]">Syntaxe : #144#</div>
                    </div>

                    <div className="p-2 rounded-lg bg-white border border-slate-200">
                      <div className="font-bold text-yellow-600 flex items-center gap-1">
                        <span>MTN MoMo</span>
                      </div>
                      <div className="font-mono font-bold text-slate-800 text-[11px] mt-0.5">
                        {settings.mtnMomoNumber || settings.phone}
                      </div>
                      <div className="text-slate-400 text-[9px]">Syntaxe : *133#</div>
                    </div>

                    <div className="p-2 rounded-lg bg-white border border-slate-200">
                      <div className="font-bold text-emerald-600 flex items-center gap-1">
                        <Building className="w-3 h-3" />
                        <span>SGCI / Virement</span>
                      </div>
                      <div className="font-mono text-[10px] text-slate-800 truncate mt-0.5">
                        RIB : {settings.bankRib || 'Sur demande'}
                      </div>
                      <div className="text-slate-400 text-[9px] truncate">IBAN : {settings.bankIban}</div>
                    </div>
                  </div>
                </div>

                {/* Legal and Signatures footer */}
                <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center text-[10px] text-slate-500 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-indigo-600" />
                      <span>Document certifié généré électroniquement par Nexus Gestion SaaS</span>
                    </div>
                    {invoice.remindersSent && invoice.remindersSent > 0 && (
                      <p className="text-[10px] text-amber-700 font-medium">
                        Suivi comptable : {invoice.remindersSent} avis de rappel transmis (Dernier :{' '}
                        {invoice.lastReminderAt
                          ? new Date(invoice.lastReminderAt).toLocaleDateString('fr-FR')
                          : 'récent'}
                        )
                      </p>
                    )}
                  </div>
                  <div className="text-center sm:text-right">
                    <p className="font-bold text-slate-700">Cachet & Signature de l'Émetteur</p>
                    <div className="w-32 h-10 border-b border-dashed border-slate-300 mt-2"></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Send Reminder Modal */}
      <SendReminderModal
        invoice={invoice}
        isOpen={reminderModalOpen}
        onClose={() => setReminderModalOpen(false)}
      />
    </>
  );
};

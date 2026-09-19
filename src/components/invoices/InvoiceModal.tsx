import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  FileText,
  Sparkles,
  ArrowUp,
  ArrowDown,
  Copy,
  BookOpen,
  Eye,
  PenTool,
  Printer,
  ShieldAlert,
  Building,
  Smartphone,
  CreditCard,
  QrCode,
  CheckCircle2,
} from 'lucide-react';
import { Invoice, InvoiceItem, InvoiceType } from '../../types';
import { useApp } from '../../context/AppContext';
import { DueDateSelector } from './DueDateSelector';
import { InvoiceSummaryBox } from './InvoiceSummaryBox';
import { ItemCatalogDrawer } from './ItemCatalogDrawer';
import { CatalogItem } from '../../utils/itemGenerator';
import { numberToWordsFrench } from '../../utils/numberToWordsFrench';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingInvoice?: Invoice | null;
  initialType?: InvoiceType;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  isOpen,
  onClose,
  editingInvoice,
  initialType = 'invoice',
}) => {
  const { clients, projects, settings, addInvoice, updateInvoice, formatMoney } = useApp();

  if (!isOpen) return null;

  // View Mode: 'edit' or 'preview'
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');

  // State
  const [type, setType] = useState<InvoiceType>(editingInvoice?.type || initialType);
  const [clientId, setClientId] = useState<string>(
    editingInvoice?.clientId || clients[0]?.id || ''
  );
  const [clientName, setClientName] = useState<string>(
    editingInvoice?.clientName || clients[0]?.name || ''
  );
  const [clientEmail, setClientEmail] = useState<string>(
    editingInvoice?.clientEmail || clients[0]?.email || ''
  );
  const [clientPhone, setClientPhone] = useState<string>(
    editingInvoice?.clientPhone || clients[0]?.phone || ''
  );
  const [clientAddress, setClientAddress] = useState<string>(
    editingInvoice?.clientAddress || clients[0]?.address || ''
  );
  const [clientNcc, setClientNcc] = useState<string>(
    editingInvoice?.clientNcc || clients[0]?.ncc || ''
  );
  const [isDgiNormalisee, setIsDgiNormalisee] = useState<boolean>(
    editingInvoice?.isDgiNormalisee ?? (settings.invoiceStandardType === 'dgi_normalisee')
  );
  const [dgiStickerNumber, setDgiStickerNumber] = useState<string>(
    editingInvoice?.dgiStickerNumber || `DGI-CI-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`
  );
  const [taxRegime, setTaxRegime] = useState<string>(
    editingInvoice?.taxRegime || settings.taxRegime || 'Régime Réel Normal (TVA 18%)'
  );

  const todayIso = new Date().toISOString().split('T')[0];
  const defaultDueIso = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  const [issueDate, setIssueDate] = useState<string>(editingInvoice?.issueDate || todayIso);
  const [dueDate, setDueDate] = useState<string>(editingInvoice?.dueDate || defaultDueIso);
  const [projectId, setProjectId] = useState<string>(editingInvoice?.projectId || '');
  const [taxRate, setTaxRate] = useState<number>(
    editingInvoice?.taxRate !== undefined ? editingInvoice.taxRate : settings.defaultTaxRate
  );
  const [discount, setDiscount] = useState<number>(editingInvoice?.discount || 0);
  const [notes, setNotes] = useState<string>(
    editingInvoice?.notes ||
      'Règlement exigible à la date d\'échéance convenue par Wave Business, Orange Money Pro ou Virement bancaire. En cas de retard de paiement, une pénalité légale sera appliquée.'
  );

  const [items, setItems] = useState<InvoiceItem[]>(
    editingInvoice?.items && editingInvoice.items.length > 0
      ? editingInvoice.items
      : [
          {
            id: 'item-1',
            description: 'Prestation de développement & intégration de plateforme de gestion',
            quantity: 1,
            unitPrice: 1200000,
            total: 1200000,
          },
          {
            id: 'item-2',
            description: 'Configuration du serveur Cloud et mise en place des sauvegardes automatisées',
            quantity: 1,
            unitPrice: 350000,
            total: 350000,
          },
        ]
  );

  // Catalog Drawer State
  const [catalogDrawerOpen, setCatalogDrawerOpen] = useState(false);

  // Client change handler
  const handleClientChange = (cId: string) => {
    setClientId(cId);
    const sel = clients.find((c) => c.id === cId);
    if (sel) {
      setClientName(sel.name);
      setClientEmail(sel.email);
      setClientPhone(sel.phone);
      setClientAddress(sel.address);
      if (sel.ncc) {
        setClientNcc(sel.ncc);
      }
    }
  };

  // Line items actions
  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const updated = [...items];
    const current = { ...updated[index], [field]: value };
    if (field === 'quantity' || field === 'unitPrice') {
      const q = Math.max(0, Number(current.quantity || 0));
      const p = Math.max(0, Number(current.unitPrice || 0));
      current.total = q * p;
    }
    updated[index] = current;
    setItems(updated);
  };

  const handleQuantityStep = (index: number, delta: number) => {
    const updated = [...items];
    const current = { ...updated[index] };
    const newQty = Math.max(1, (Number(current.quantity) || 1) + delta);
    current.quantity = newQty;
    current.total = newQty * Number(current.unitPrice || 0);
    updated[index] = current;
    setItems(updated);
  };

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: `item-${Date.now()}`,
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0,
    };
    setItems([...items, newItem]);
  };

  const duplicateItem = (index: number) => {
    const target = items[index];
    const duplicated: InvoiceItem = {
      ...target,
      id: `item-${Date.now()}-${Math.random()}`,
      description: `${target.description} (Copie)`,
    };
    const updated = [...items];
    updated.splice(index + 1, 0, duplicated);
    setItems(updated);
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === items.length - 1)
    ) {
      return;
    }
    const updated = [...items];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setItems(updated);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  // Insertion from Catalog / Packages
  const handleAddSingleItemFromCatalog = (catalogItem: CatalogItem) => {
    setItems((prev) => [
      ...prev,
      {
        id: `cat-item-${Date.now()}`,
        description: catalogItem.description,
        quantity: 1,
        unitPrice: catalogItem.suggestedPrice,
        total: catalogItem.suggestedPrice,
      },
    ]);
  };

  const handleApplyPackage = (newItems: InvoiceItem[], mode: 'append' | 'replace') => {
    if (mode === 'replace') {
      setItems(newItems);
    } else {
      setItems((prev) => [...prev, ...newItems]);
    }
  };

  // Calculations
  const subtotal = items.reduce((sum, item) => sum + Number(item.total || 0), 0);
  const taxableAmount = Math.max(0, subtotal - discount);
  const taxAmount = Math.round((taxableAmount * taxRate) / 100);
  const total = taxableAmount + taxAmount;

  // Amount in words
  const amountInWords = numberToWordsFrench(total, settings.currency);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selProject = projects.find((p) => p.id === projectId);

    if (editingInvoice) {
      updateInvoice({
        ...editingInvoice,
        type,
        clientId,
        clientName,
        clientEmail,
        clientPhone,
        clientAddress,
        clientNcc: clientNcc.trim() || undefined,
        isDgiNormalisee,
        dgiStickerNumber: isDgiNormalisee ? dgiStickerNumber : undefined,
        taxRegime,
        issueDate,
        dueDate,
        items,
        subtotal,
        taxRate,
        taxAmount,
        discount,
        total,
        projectId: projectId || undefined,
        projectName: selProject?.title,
        notes,
      });
    } else {
      addInvoice({
        type,
        clientId,
        clientName,
        clientEmail,
        clientPhone,
        clientAddress,
        clientNcc: clientNcc.trim() || undefined,
        isDgiNormalisee,
        dgiStickerNumber: isDgiNormalisee ? dgiStickerNumber : undefined,
        taxRegime,
        issueDate,
        dueDate,
        items,
        subtotal,
        taxRate,
        taxAmount,
        discount,
        total,
        amountPaid: 0,
        status: 'pending',
        projectId: projectId || undefined,
        projectName: selProject?.title,
        notes,
      });
    }
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-5">
        <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-750 rounded-2xl shadow-2xl flex flex-col max-h-[94vh] overflow-hidden">
          {/* Top Modal Header with Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between px-5 sm:px-6 py-3.5 border-b border-slate-800 bg-slate-850 gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/40 text-indigo-400 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <span>{editingInvoice ? 'Modifier le document' : 'Module de Création de Factures'}</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {type === 'quote' ? 'Devis' : 'Facture Officielle'}
                  </span>
                </h2>
                <p className="text-[11px] text-slate-400">
                  Générateur d'articles • Calculs HT & TTC • Définition d'échéance
                </p>
              </div>
            </div>

            {/* Mode Toggle (Édition vs Aperçu direct) & Close */}
            <div className="flex items-center gap-2">
              <div className="flex items-center p-1 bg-slate-800 rounded-xl border border-slate-700">
                <button
                  type="button"
                  onClick={() => setViewMode('edit')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    viewMode === 'edit'
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <PenTool className="w-3.5 h-3.5" />
                  <span>Édition</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('preview')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    viewMode === 'preview'
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Aperçu Document</span>
                </button>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* MAIN BODY */}
          {viewMode === 'edit' ? (
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
              {/* Type selector & Quick details */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-850 rounded-2xl border border-slate-750">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-300">Type de document :</span>
                  <div className="inline-flex p-1 bg-slate-800 rounded-xl border border-slate-700">
                    <button
                      type="button"
                      onClick={() => setType('invoice')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        type === 'invoice'
                          ? 'bg-indigo-600 text-white shadow'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Facture
                    </button>
                    <button
                      type="button"
                      onClick={() => setType('quote')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        type === 'quote'
                          ? 'bg-indigo-600 text-white shadow'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Devis
                    </button>
                  </div>
                </div>

                <div className="text-xs text-slate-400 flex items-center gap-2">
                  <span>Organisation émettrice :</span>
                  <span className="font-semibold text-slate-200">{settings.name}</span>
                </div>
              </div>

              {/* Client and Project selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-850 rounded-2xl border border-slate-750 space-y-3">
                  <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Destinataire / Client
                  </label>
                  <select
                    value={clientId}
                    onChange={(e) => handleClientChange(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.companyName ? `(${c.companyName})` : ''}
                      </option>
                    ))}
                  </select>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400">
                    <div>
                      <span className="text-slate-500 block">Téléphone :</span>
                      <span className="text-slate-300 font-mono">{clientPhone || 'Non renseigné'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Email :</span>
                      <span className="text-slate-300 truncate block">{clientEmail || 'Non renseigné'}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-850 rounded-2xl border border-slate-750 space-y-3">
                  <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Projet ou mission associée (optionnel)
                  </label>
                  <select
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="">Aucun projet spécifique (Facturation directe)</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.code} - {p.title}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Lier la facture à un projet permet de mettre à jour automatiquement le budget consommé et l'avancement.
                  </p>
                </div>
              </div>

              {/* CONFORMITÉ FISCALE CÔTE D'IVOIRE (DGI & OHADA) */}
              <div className="p-4 bg-gradient-to-r from-orange-950/20 via-slate-850 to-emerald-950/20 rounded-2xl border border-orange-500/20 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-400"></span>
                    <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                      Mentions Légales & Fiscales Côte d'Ivoire (DGI)
                    </span>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={isDgiNormalisee}
                      onChange={(e) => setIsDgiNormalisee(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-700 text-orange-500 focus:ring-orange-500 bg-slate-800"
                    />
                    <span className="font-semibold text-orange-300">
                      Facture Normalisée DGI (Sticker fiscal)
                    </span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">
                      NCC Client (Compte Contribuable)
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: 0812493 M"
                      value={clientNcc}
                      onChange={(e) => setClientNcc(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">
                      Numéro Sticker DGI
                    </label>
                    <input
                      type="text"
                      disabled={!isDgiNormalisee}
                      placeholder="DGI-CI-2025-XXXXXX"
                      value={dgiStickerNumber}
                      onChange={(e) => setDgiStickerNumber(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">
                      Régime d'Imposition (Émetteur)
                    </label>
                    <input
                      type="text"
                      value={taxRegime}
                      onChange={(e) => setTaxRegime(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
              </div>

              {/* MODULE D'ÉCHÉANCE ET DE DATES */}
              <DueDateSelector
                issueDate={issueDate}
                dueDate={dueDate}
                onIssueDateChange={setIssueDate}
                onDueDateChange={setDueDate}
              />

              {/* SECTION: GÉNÉRATEUR ET LISTE D'ARTICLES */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-850 p-3.5 rounded-2xl border border-slate-750">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-slate-100 uppercase tracking-wider">
                        Articles & Lignes de facturation ({items.length})
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Saisissez vos prestations ou générez des listes types en un clic
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Bouton vers le catalogue & packs */}
                    <button
                      type="button"
                      onClick={() => setCatalogDrawerOpen(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600/25 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Générateur & Catalogue</span>
                    </button>

                    {/* Bouton d'ajout simple */}
                    <button
                      type="button"
                      onClick={addItem}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Ajouter une ligne</span>
                    </button>
                  </div>
                </div>

                {/* Table Header (hidden on mobile) */}
                <div className="hidden md:grid grid-cols-12 gap-2 px-4 py-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <div className="col-span-6">Description de l'article / prestation</div>
                  <div className="col-span-2 text-center">Quantité</div>
                  <div className="col-span-2 text-right">Prix Unitaire HT</div>
                  <div className="col-span-2 text-right">Total HT & Actions</div>
                </div>

                {/* Items List */}
                <div className="space-y-2.5">
                  {items.map((item, index) => (
                    <div
                      key={item.id || index}
                      className="p-3 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/70 rounded-2xl transition-all space-y-2 md:space-y-0 md:grid md:grid-cols-12 md:gap-3 md:items-center"
                    >
                      {/* Description */}
                      <div className="md:col-span-6 flex items-start gap-2">
                        <span className="text-[11px] font-mono font-bold text-indigo-400/80 mt-2 shrink-0">
                          #{index + 1}
                        </span>
                        <div className="flex-1">
                          <textarea
                            rows={1}
                            placeholder="Description détaillée de la prestation, du produit ou service..."
                            value={item.description}
                            onChange={(e) => updateItem(index, 'description', e.target.value)}
                            required
                            className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-500 resize-none"
                          />
                        </div>
                      </div>

                      {/* Quantité avec steppers */}
                      <div className="md:col-span-2 flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleQuantityStep(index, -1)}
                          className="w-7 h-7 rounded-lg bg-slate-700/80 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-xs font-bold cursor-pointer"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                          required
                          className="w-14 px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono font-bold text-center text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleQuantityStep(index, 1)}
                          className="w-7 h-7 rounded-lg bg-slate-700/80 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-xs font-bold cursor-pointer"
                        >
                          +
                        </button>
                      </div>

                      {/* Prix Unitaire */}
                      <div className="md:col-span-2 flex items-center justify-end">
                        <div className="relative w-full">
                          <input
                            type="number"
                            min="0"
                            step="500"
                            placeholder="0"
                            value={item.unitPrice}
                            onChange={(e) => updateItem(index, 'unitPrice', Number(e.target.value))}
                            required
                            className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono font-bold text-right text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                          <span className="absolute right-8 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 pointer-events-none">
                            HT
                          </span>
                        </div>
                      </div>

                      {/* Total Ligne & Action Buttons */}
                      <div className="md:col-span-2 flex items-center justify-between md:justify-end gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-750">
                        <span className="md:hidden text-xs text-slate-400">Total HT :</span>
                        <span className="text-xs font-black font-mono text-slate-100 text-right min-w-[90px]">
                          {formatMoney(item.total)}
                        </span>

                        <div className="flex items-center gap-1 shrink-0">
                          {/* Reorder Up */}
                          <button
                            type="button"
                            onClick={() => moveItem(index, 'up')}
                            disabled={index === 0}
                            title="Monter la ligne"
                            className="p-1 text-slate-400 hover:text-indigo-300 disabled:opacity-30 disabled:pointer-events-none rounded cursor-pointer"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          {/* Reorder Down */}
                          <button
                            type="button"
                            onClick={() => moveItem(index, 'down')}
                            disabled={index === items.length - 1}
                            title="Descendre la ligne"
                            className="p-1 text-slate-400 hover:text-indigo-300 disabled:opacity-30 disabled:pointer-events-none rounded cursor-pointer"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          {/* Duplicate */}
                          <button
                            type="button"
                            onClick={() => duplicateItem(index)}
                            title="Dupliquer la ligne"
                            className="p-1 text-slate-400 hover:text-indigo-300 rounded cursor-pointer"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            disabled={items.length <= 1}
                            title="Supprimer la ligne"
                            className="p-1 text-slate-500 hover:text-rose-400 disabled:opacity-30 disabled:pointer-events-none rounded cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* MODULE DE CALCUL DES TOTAUX HT ET TTC */}
              <InvoiceSummaryBox
                subtotal={subtotal}
                discount={discount}
                taxRate={taxRate}
                onDiscountChange={setDiscount}
                onTaxRateChange={setTaxRate}
              />

              {/* Notes & Coordonnées de paiement */}
              <div className="bg-slate-850 p-4 rounded-2xl border border-slate-750 space-y-2">
                <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Conditions de règlement & Coordonnées de paiement
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex : Règlement par virement bancaire ou Mobile Money (Wave / Orange Money). Délais et pénalités de retard..."
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setViewMode('preview')}
                  className="flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  <Eye className="w-4 h-4 text-indigo-400" />
                  <span>Aperçu du document final</span>
                </button>

                <div className="flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {editingInvoice ? 'Enregistrer les modifications' : 'Émettre le document'}
                    </span>
                  </button>
                </div>
              </div>
            </form>
          ) : (
            /* LIVE PREVIEW MODE */
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-950 flex flex-col items-center">
              <div className="w-full max-w-3xl bg-white text-slate-900 rounded-xl p-8 sm:p-12 shadow-2xl border border-slate-200 print:shadow-none space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-slate-200 pb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-lg">
                        NX
                      </div>
                      <div>
                        <h1 className="text-xl font-black tracking-tight text-slate-900 uppercase">
                          {settings.name}
                        </h1>
                        <p className="text-xs text-slate-500 font-medium">{settings.subtitle}</p>
                      </div>
                    </div>
                    <div className="text-xs text-slate-600 space-y-0.5 mt-2">
                      <p>{settings.address}</p>
                      <p>
                        {settings.city}, {settings.country}
                      </p>
                      <p>Tél : {settings.phone} • Email : {settings.email}</p>
                      <p className="text-slate-400 font-mono text-[11px]">RCCM : {settings.rccm}</p>
                    </div>
                  </div>

                  <div className="text-right sm:text-right w-full sm:w-auto">
                    <span className="text-2xl font-black tracking-tight text-slate-900 uppercase">
                      {type === 'quote' ? 'DEVIS' : 'FACTURE'}
                    </span>
                    <p className="font-mono text-sm font-bold text-indigo-600 mt-1">
                      {editingInvoice?.number || 'FAC-NOUVEAU'}
                    </p>
                    <div className="text-xs text-slate-600 mt-3 space-y-1">
                      <p>
                        <span className="text-slate-400">Date d'émission : </span>
                        <span className="font-semibold text-slate-800">{issueDate}</span>
                      </p>
                      <div className="inline-block px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 font-bold text-xs">
                        Échéance : {dueDate}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Client Box */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Facturé à :
                    </span>
                    <p className="text-sm font-bold text-slate-900">{clientName}</p>
                    {clientAddress && <p className="text-xs text-slate-600">{clientAddress}</p>}
                    {clientPhone && <p className="text-xs text-slate-600">Tél : {clientPhone}</p>}
                    {clientEmail && <p className="text-xs text-slate-600">Email : {clientEmail}</p>}
                  </div>
                  {projectId && (
                    <div className="sm:text-right">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Projet de rattachement :
                      </span>
                      <p className="text-xs font-bold text-indigo-600">
                        {projects.find((p) => p.id === projectId)?.title || 'Projet lié'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Line items table */}
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b-2 border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-2.5">Désignation</th>
                      <th className="py-2.5 text-center w-16">Qté</th>
                      <th className="py-2.5 text-right w-28">Prix Unit. HT</th>
                      <th className="py-2.5 text-right w-32">Total HT</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="py-3 font-medium text-slate-800 pr-4">
                          {item.description || 'Prestation'}
                        </td>
                        <td className="py-3 text-center font-mono text-slate-600">
                          {item.quantity}
                        </td>
                        <td className="py-3 text-right font-mono text-slate-600">
                          {formatMoney(item.unitPrice)}
                        </td>
                        <td className="py-3 text-right font-mono font-bold text-slate-900">
                          {formatMoney(item.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Financial Summary */}
                <div className="flex justify-end pt-4 border-t border-slate-200">
                  <div className="w-full sm:w-72 space-y-2 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Total brut HT :</span>
                      <span className="font-mono font-semibold">{formatMoney(subtotal)}</span>
                    </div>

                    {discount > 0 && (
                      <div className="flex justify-between text-emerald-600 font-medium">
                        <span>Remise commerciale :</span>
                        <span className="font-mono">- {formatMoney(discount)}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-slate-600">
                      <span>Total Net HT :</span>
                      <span className="font-mono font-semibold">{formatMoney(taxableAmount)}</span>
                    </div>

                    <div className="flex justify-between text-slate-600">
                      <span>TVA ({taxRate}%) :</span>
                      <span className="font-mono font-semibold">{formatMoney(taxAmount)}</span>
                    </div>

                    <div className="flex justify-between text-base font-black text-slate-900 border-t-2 border-slate-900 pt-2">
                      <span>TOTAL TTC :</span>
                      <span className="font-mono text-indigo-700">{formatMoney(total)}</span>
                    </div>
                  </div>
                </div>

                {/* Legal amount in words */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                  <p className="text-slate-500 font-semibold mb-0.5">Montant arrêté en toutes lettres :</p>
                  <p className="italic text-slate-800 font-medium">
                    « Arrêté la présente facture à la somme de {amountInWords} TTC »
                  </p>
                </div>

                {/* Notes & Bank Details */}
                {notes && (
                  <div className="text-[11px] text-slate-600 border-t border-slate-200 pt-3">
                    <p className="font-semibold text-slate-700 mb-1">Conditions de règlement :</p>
                    <p>{notes}</p>
                  </div>
                )}
              </div>

              {/* Bottom controls */}
              <div className="mt-4 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setViewMode('edit')}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                >
                  Revenir à l'édition
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimer le document</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Catalog & Packages Drawer */}
      <ItemCatalogDrawer
        isOpen={catalogDrawerOpen}
        onClose={() => setCatalogDrawerOpen(false)}
        onAddSingleItem={handleAddSingleItemFromCatalog}
        onApplyPackage={handleApplyPackage}
      />
    </>
  );
};

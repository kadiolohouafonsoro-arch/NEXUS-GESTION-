import React, { useState } from 'react';
import {
  Wallet,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  Smartphone,
  Building,
  Banknote,
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  X,
  CreditCard,
  TrendingDown,
  TrendingUp,
  Download,
  Users,
  ShieldCheck,
  HeartHandshake,
  Gift,
  Award,
  AlertCircle,
  PiggyBank,
  Receipt,
  FileText,
} from 'lucide-react';
import { CashAccount, Transaction, TransactionCategory } from '../../types';
import { useApp } from '../../context/AppContext';
import { exportTransactionsToCSV } from '../../utils/csvExport';

export const TreasuryView: React.FC = () => {
  const { accounts, transactions, addTransaction, addAccount, formatMoney, clients, settings, currentTenant } = useApp();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [accountFilter, setAccountFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Transaction Modal State
  const [showTxModal, setShowTxModal] = useState(false);
  const [txType, setTxType] = useState<'income' | 'expense'>('income');
  const [amount, setAmount] = useState<number>(settings.baseContribution || 50000);
  const [description, setDescription] = useState('');
  const [accountId, setAccountId] = useState(accounts[0]?.id || '');
  const [category, setCategory] = useState<TransactionCategory>('contribution');
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');

  // Account Modal State
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [newAccName, setNewAccName] = useState('');
  const [newAccType, setNewAccType] = useState<CashAccount['type']>('cash');
  const [newAccNumber, setNewAccNumber] = useState('');
  const [newAccBalance, setNewAccBalance] = useState<number>(0);

  // Reconciliation Mobile Money Modal State
  const [showReconcileModal, setShowReconcileModal] = useState(false);
  const [reconcileRawSms, setReconcileRawSms] = useState('');
  const [reconcileOperator, setReconcileOperator] = useState<string>('wave');
  const [reconcileAmount, setReconcileAmount] = useState<number>(50000);
  const [reconcileRef, setReconcileRef] = useState('');
  const [reconcileSender, setReconcileSender] = useState('');
  const [reconcileMemberId, setReconcileMemberId] = useState('');
  const [reconcileAccountId, setReconcileAccountId] = useState(accounts[0]?.id || '');
  const [reconcileSuccess, setReconcileSuccess] = useState(false);

  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  // Filtered transactions
  const filteredTransactions = transactions.filter((t) => {
    const matchSearch =
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      t.reference?.toLowerCase().includes(search.toLowerCase()) ||
      t.accountName.toLowerCase().includes(search.toLowerCase()) ||
      t.memberName?.toLowerCase().includes(search.toLowerCase());

    const matchType = typeFilter === 'all' || t.type === typeFilter;
    const matchAccount = accountFilter === 'all' || t.accountId === accountFilter;
    const matchCategory = categoryFilter === 'all' || t.category === categoryFilter;

    return matchSearch && matchType && matchAccount && matchCategory;
  });

  const handleOpenTxModal = (type: 'income' | 'expense' = 'income') => {
    setTxType(type);
    setCategory(type === 'income' ? 'contribution' : 'event_expense');
    setAmount(type === 'income' ? settings.baseContribution || 50000 : 25000);
    setDescription('');
    setSelectedMemberId('');
    setReference('');
    setNotes('');
    setShowTxModal(true);
  };

  const handleTxSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0 || !description.trim()) return;

    const targetAccount = accounts.find((a) => a.id === accountId) || accounts[0];
    const targetMember = clients.find((c) => c.id === selectedMemberId);

    addTransaction({
      date: new Date().toISOString().split('T')[0],
      description: description.trim(),
      type: txType,
      category,
      amount: Number(amount),
      accountId: targetAccount.id,
      accountName: targetAccount.name,
      memberId: targetMember?.id,
      memberName: targetMember ? `${targetMember.firstName || ''} ${targetMember.lastName || targetMember.name}`.trim() : undefined,
      reference: reference.trim() || undefined,
      notes: notes.trim() || undefined,
    });

    setDescription('');
    setReference('');
    setNotes('');
    setSelectedMemberId('');
    setShowTxModal(false);
  };

  const handleAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccName.trim()) return;

    const colors: Record<CashAccount['type'], string> = {
      wave: 'from-sky-500 to-blue-600',
      orange_money: 'from-amber-500 to-orange-600',
      mtn_momo: 'from-yellow-500 to-amber-600',
      moov_money: 'from-blue-600 to-indigo-700',
      djamo: 'from-violet-600 to-purple-800',
      bank: 'from-emerald-600 to-teal-700',
      cash: 'from-purple-600 to-indigo-700',
    };

    addAccount({
      name: newAccName.trim(),
      type: newAccType,
      accountNumber: newAccNumber.trim() || 'REF-' + Date.now().toString().slice(-4),
      balance: Number(newAccBalance) || 0,
      currency: settings.currency || 'XOF',
      color: colors[newAccType] || 'from-indigo-600 to-purple-700',
    });

    setNewAccName('');
    setNewAccNumber('');
    setNewAccBalance(0);
    setShowAccountModal(false);
  };

  const handleParseSms = (text: string) => {
    setReconcileRawSms(text);
    if (!text.trim()) return;

    // Detect operator
    let detectedOp = 'wave';
    if (/wave|ci\d{6}\.\d{4}/i.test(text)) {
      detectedOp = 'wave';
    } else if (/orange|om\b|#144#|pp\d{6}/i.test(text)) {
      detectedOp = 'orange_money';
    } else if (/mtn|momo|\*133#/i.test(text)) {
      detectedOp = 'mtn_momo';
    } else if (/moov|flooz|\*155#/i.test(text)) {
      detectedOp = 'moov_money';
    } else if (/djamo/i.test(text)) {
      detectedOp = 'djamo';
    }
    setReconcileOperator(detectedOp);

    // Auto-select corresponding account
    const matchingAcc = accounts.find((a) => a.type === detectedOp) || accounts[0];
    if (matchingAcc) {
      setReconcileAccountId(matchingAcc.id);
    }

    // Extract amount: e.g. "50000 FCFA" or "reçu 25 000 F" or "50,000"
    const amountMatch = text.match(/(?:reçu|recu|montant de|de|somme de|transfert de)?\s*([0-9\s.,]{3,})\s*(?:FCFA|F CFA|F|XOF)/i);
    if (amountMatch && amountMatch[1]) {
      const cleanNum = parseInt(amountMatch[1].replace(/[\s.,]/g, ''), 10);
      if (!isNaN(cleanNum) && cleanNum > 0) {
        setReconcileAmount(cleanNum);
      }
    }

    // Extract reference: e.g. CI250812.1450.A19284 or TX12345 or PP250812...
    const refMatch =
      text.match(/(?:id transaction|transaction id|réf|ref|transaction n[°o]|id|code)\s*[:#]?\s*([A-Za-z0-9._-]+)/i) ||
      text.match(/(CI\d{6}\.\d{4}\.[A-Za-z0-9]+)/i) ||
      text.match(/(PP\d{8,}\.[A-Za-z0-9]+)/i);
    if (refMatch && refMatch[1]) {
      setReconcileRef(refMatch[1]);
    }

    // Try to match sender / member
    for (const cl of clients) {
      const cleanPhone = cl.phone.replace(/[^0-9]/g, '');
      const last8 = cleanPhone.slice(-8);
      if ((last8 && text.includes(last8)) || text.toLowerCase().includes(cl.name.toLowerCase())) {
        setReconcileMemberId(cl.id);
        setReconcileSender(cl.name);
        break;
      }
    }
  };

  const handleReconcileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (reconcileAmount <= 0) return;

    const targetAccount = accounts.find((a) => a.id === reconcileAccountId) || accounts[0];
    const targetMember = clients.find((c) => c.id === reconcileMemberId);

    const opLabel =
      reconcileOperator === 'wave'
        ? 'Wave'
        : reconcileOperator === 'orange_money'
        ? 'Orange Money'
        : reconcileOperator === 'mtn_momo'
        ? 'MTN MoMo'
        : reconcileOperator === 'moov_money'
        ? 'Moov Money'
        : reconcileOperator === 'djamo'
        ? 'Djamo'
        : 'Mobile Money';

    addTransaction({
      accountId: targetAccount.id,
      accountName: targetAccount.name,
      type: 'income',
      category: 'contribution',
      amount: reconcileAmount,
      currency: settings.currency || 'XOF',
      description: `Pointage ${opLabel} - ${targetMember ? targetMember.name : reconcileSender || 'Encaissement Mobile'}`,
      date: new Date().toISOString().split('T')[0],
      reference: reconcileRef || `MM-${Date.now().toString().slice(-6)}`,
      notes: `Rapprochement SMS : ${reconcileRawSms.slice(0, 100)}`,
      memberId: targetMember?.id,
      memberName: targetMember?.name,
    });

    setReconcileSuccess(true);
    setTimeout(() => {
      setReconcileSuccess(false);
      setShowReconcileModal(false);
      setReconcileRawSms('');
      setReconcileRef('');
      setReconcileSender('');
      setReconcileMemberId('');
    }, 1200);
  };

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'wave':
        return <Smartphone className="w-5 h-5 text-sky-400" />;
      case 'orange_money':
        return <Smartphone className="w-5 h-5 text-amber-400" />;
      case 'mtn_momo':
        return <Smartphone className="w-5 h-5 text-yellow-400" />;
      case 'moov_money':
        return <Smartphone className="w-5 h-5 text-blue-400" />;
      case 'djamo':
        return <Smartphone className="w-5 h-5 text-violet-400" />;
      case 'bank':
        return <Building className="w-5 h-5 text-emerald-400" />;
      default:
        return <Banknote className="w-5 h-5 text-purple-400" />;
    }
  };

  const getCategoryBadge = (cat: TransactionCategory) => {
    switch (cat) {
      case 'contribution':
        return { label: 'Cotisation adhérent', bg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30', icon: PiggyBank };
      case 'penalty':
        return { label: 'Pénalité retard/absence', bg: 'bg-rose-500/15 text-rose-300 border-rose-500/30', icon: AlertCircle };
      case 'donation':
        return { label: 'Don & Libéralité', bg: 'bg-violet-500/15 text-violet-300 border-violet-500/30', icon: Gift };
      case 'grant':
        return { label: 'Subvention', bg: 'bg-sky-500/15 text-sky-300 border-sky-500/30', icon: Award };
      case 'admission_fee':
        return { label: 'Droit d\'adhésion', bg: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30', icon: Users };
      case 'event_expense':
        return { label: 'Événement & Réunion', bg: 'bg-amber-500/15 text-amber-300 border-amber-500/30', icon: Calendar };
      case 'social_aid':
        return { label: 'Aide sociale & Secours', bg: 'bg-teal-500/15 text-teal-300 border-teal-500/30', icon: HeartHandshake };
      case 'operating_expense':
        return { label: 'Frais de fonctionnement', bg: 'bg-slate-500/15 text-slate-300 border-slate-500/30', icon: Receipt };
      case 'tontine_payout':
        return { label: 'Décaissement Tontine', bg: 'bg-purple-500/15 text-purple-300 border-purple-500/30', icon: Wallet };
      case 'invoice_payment':
        return { label: 'Prestation & Facture', bg: 'bg-blue-500/15 text-blue-300 border-blue-500/30', icon: FileText };
      default:
        return { label: 'Mouvement divers', bg: 'bg-slate-500/15 text-slate-400 border-slate-500/20', icon: Wallet };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Module Comptabilité & Caisses
            </span>
            {currentTenant && (
              <span className="text-[10px] text-slate-400">
                • Espace {currentTenant.name}
              </span>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight flex items-center gap-2.5">
            <Wallet className="w-7 h-7 text-amber-400" />
            <span>Suivi Comptable & Gestion des Caisses</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Enregistrez les entrées (cotisations, dons, subventions, pénalités) et les sorties (aides sociales, réunions, gestion)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => exportTransactionsToCSV(filteredTransactions, settings.currency)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-slate-600 text-slate-200 rounded-xl text-xs font-bold transition-all shadow cursor-pointer"
            title="Télécharger le relevé comptable des opérations"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            <span>Exporter CSV</span>
          </button>

          <button
            onClick={() => setShowAccountModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-slate-600 text-slate-200 rounded-xl text-xs font-bold transition-all shadow cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span>Nouvelle Caisse</span>
          </button>

          <button
            onClick={() => setShowReconcileModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-750 border border-sky-500/30 hover:border-sky-500 text-sky-300 rounded-xl text-xs font-bold transition-all shadow cursor-pointer"
            title="Coller un SMS Wave, Orange Money ou MoMo pour rapprocher et créditer automatiquement"
          >
            <Smartphone className="w-3.5 h-3.5 text-sky-400" />
            <span>Pointage Mobile Money</span>
          </button>

          <button
            onClick={() => handleOpenTxModal('income')}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-600/20 cursor-pointer"
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>+ Entrée (Cotisation / Don)</span>
          </button>

          <button
            onClick={() => handleOpenTxModal('expense')}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-rose-600/20 cursor-pointer"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>- Sortie (Dépense / Aide)</span>
          </button>
        </div>
      </div>

      {/* Cash Accounts Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Caisses & Comptes Dédiés
            </h2>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
              {accounts.length} caisses
            </span>
          </div>
          <button
            onClick={() => setShowAccountModal(true)}
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Ajouter une caisse</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {accounts.map((acc) => (
            <div
              key={acc.id}
              className="relative bg-slate-850 border border-slate-750 hover:border-slate-700 rounded-2xl p-4 shadow-lg shadow-black/10 flex flex-col justify-between transition-all group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-slate-800 border border-slate-700 rounded-xl group-hover:scale-105 transition-transform">
                    {getAccountIcon(acc.type)}
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 capitalize">
                    {acc.type === 'bank' ? 'Banque' : acc.type === 'cash' ? 'Espèces' : 'Mobile'}
                  </span>
                </div>

                <h3 className="text-xs font-bold text-slate-200 line-clamp-1">{acc.name}</h3>
                <div className="text-xl font-black text-slate-100 mt-1 font-mono tracking-tight">
                  {formatMoney(acc.balance)}
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-800 text-[11px] text-slate-400 font-mono truncate flex items-center justify-between">
                <span>{acc.accountNumber}</span>
                <span className="text-[9px] text-slate-500 uppercase">{acc.currency}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Financial Overview strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-slate-850 border border-slate-750 flex items-center justify-between shadow">
          <div>
            <span className="text-xs font-semibold text-slate-400">Total Liquidités Disponibles</span>
            <div className="text-xl font-black text-slate-100 font-mono mt-0.5">
              {formatMoney(totalBalance)}
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Wallet className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-850 border border-slate-750 flex items-center justify-between shadow">
          <div>
            <span className="text-xs font-semibold text-emerald-400">Total Entrées Réalisées</span>
            <div className="text-xl font-black text-emerald-300 font-mono mt-0.5">
              +{formatMoney(totalIncome)}
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-850 border border-slate-750 flex items-center justify-between shadow">
          <div>
            <span className="text-xs font-semibold text-rose-400">Total Sorties & Dépenses</span>
            <div className="text-xl font-black text-rose-300 font-mono mt-0.5">
              -{formatMoney(totalExpense)}
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
            <TrendingDown className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Transactions History Header & Filters */}
      <div className="bg-slate-850 border border-slate-750 rounded-2xl p-4 shadow-lg shadow-black/10 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {[
            { id: 'all', label: 'Tous les flux' },
            { id: 'income', label: 'Entrées (+)' },
            { id: 'expense', label: 'Sorties (-)' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTypeFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                typeFilter === tab.id
                  ? 'bg-amber-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Account Filter */}
          <select
            value={accountFilter}
            onChange={(e) => setAccountFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none"
          >
            <option value="all">Toutes les caisses</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none"
          >
            <option value="all">Toutes les catégories</option>
            <option value="contribution">Cotisations</option>
            <option value="penalty">Pénalités</option>
            <option value="donation">Dons & Libéralités</option>
            <option value="grant">Subventions</option>
            <option value="admission_fee">Droits d'adhésion</option>
            <option value="event_expense">Événements & Réunions</option>
            <option value="social_aid">Aides sociales & Secours</option>
            <option value="operating_expense">Fonctionnement</option>
            <option value="tontine_payout">Décaissements Tontine</option>
          </select>

          {/* Search bar */}
          <div className="relative min-w-[200px] flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher motif, membre, ref..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-slate-850 border border-slate-750 rounded-2xl shadow-lg shadow-black/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-750 bg-slate-900/60 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Catégorie</th>
                <th className="py-3.5 px-4">Description / Motif</th>
                <th className="py-3.5 px-4">Adhérent lié</th>
                <th className="py-3.5 px-4">Caisse / Compte</th>
                <th className="py-3.5 px-4">Référence</th>
                <th className="py-3.5 px-4 text-right">Montant</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <Wallet className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-50" />
                    <p className="text-sm font-semibold">Aucun mouvement enregistré</p>
                    <p className="text-xs text-slate-500 mt-1">Utilisez les boutons ci-dessus pour enregistrer une entrée ou une sortie</p>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => {
                  const badge = getCategoryBadge(tx.category);
                  const Icon = badge.icon;

                  return (
                    <tr key={tx.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 text-slate-400 font-mono whitespace-nowrap">{tx.date}</td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[10px] font-bold border ${badge.bg}`}>
                          <Icon className="w-3 h-3" />
                          <span>{badge.label}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-200 min-w-[180px]">
                        <div>{tx.description}</div>
                        {tx.notes && (
                          <div className="text-[10px] text-slate-500 italic mt-0.5 line-clamp-1">{tx.notes}</div>
                        )}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {tx.memberName ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-semibold text-[11px]">
                            <Users className="w-3 h-3 text-indigo-400" />
                            <span>{tx.memberName}</span>
                          </span>
                        ) : (
                          <span className="text-slate-600">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-300 whitespace-nowrap">{tx.accountName}</td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                        {tx.reference || '—'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 ${
                            tx.type === 'income' ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {tx.type === 'income' ? (
                            <ArrowDownLeft className="w-3.5 h-3.5" />
                          ) : (
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          )}
                          {tx.type === 'income' ? '+' : '-'}{formatMoney(tx.amount)}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Transaction Modal */}
      {showTxModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-750 rounded-2xl p-6 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-amber-400" />
                <span>Enregistrer un Mouvement Financier</span>
              </h3>
              <button
                onClick={() => setShowTxModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleTxSubmit} className="space-y-4">
              {/* Type Toggle */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Nature de l'opération <span className="text-rose-400">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setTxType('income');
                      setCategory('contribution');
                    }}
                    className={`py-2 px-3 rounded-xl border font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      txType === 'income'
                        ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500 shadow'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
                    <span>+ Entrée de fonds (Recette)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTxType('expense');
                      setCategory('event_expense');
                    }}
                    className={`py-2 px-3 rounded-xl border font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      txType === 'expense'
                        ? 'bg-rose-600/20 text-rose-300 border-rose-500 shadow'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    <ArrowUpRight className="w-4 h-4 text-rose-400" />
                    <span>- Sortie de fonds (Dépense)</span>
                  </button>
                </div>
              </div>

              {/* Catégorie */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Catégorie comptable <span className="text-rose-400">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as TransactionCategory)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  {txType === 'income' ? (
                    <>
                      <option value="contribution">Cotisation régulière d'adhérent</option>
                      <option value="penalty">Pénalité de retard ou absence</option>
                      <option value="donation">Don ou Libéralité externe</option>
                      <option value="grant">Subvention d'organisme / bailleur</option>
                      <option value="admission_fee">Droit d'adhésion nouveau membre</option>
                      <option value="invoice_payment">Règlement de facture / prestation</option>
                      <option value="other_income">Autre entrée financière</option>
                    </>
                  ) : (
                    <>
                      <option value="event_expense">Dépenses d'événements & réunions</option>
                      <option value="social_aid">Aide sociale & Fonds de secours</option>
                      <option value="operating_expense">Frais de fonctionnement & gestion</option>
                      <option value="tontine_payout">Décaissement Tour de Tontine</option>
                      <option value="project_cost">Achat de matériel & Projet</option>
                      <option value="other_expense">Autre dépense diverse</option>
                    </>
                  )}
                </select>
              </div>

              {/* Membre Lié (Adhérent) */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Adhérent / Membre concerné {['contribution', 'penalty'].includes(category) && <span className="text-rose-400">*</span>}
                </label>
                <select
                  value={selectedMemberId}
                  onChange={(e) => {
                    setSelectedMemberId(e.target.value);
                    const mem = clients.find((c) => c.id === e.target.value);
                    if (mem && !description) {
                      if (category === 'contribution') {
                        setDescription(`Cotisation mensuelle - ${mem.name}`);
                      } else if (category === 'penalty') {
                        setDescription(`Pénalité de retard réglée - ${mem.name}`);
                      } else if (category === 'social_aid') {
                        setDescription(`Secours mutuelle accordé à ${mem.name}`);
                      }
                    }
                  }}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">-- Aucun membre spécifique (Général / Association) --</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.bureauRole ? `(${c.bureauRole})` : ''} - {c.phone}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-500 mt-1">
                  En liant un adhérent à une cotisation ou pénalité, son historique et solde sont automatiquement mis à jour.
                </p>
              </div>

              {/* Caisse / Compte */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Caisse ou Compte de destination <span className="text-rose-400">*</span>
                </label>
                <select
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({formatMoney(a.balance)})
                    </option>
                  ))}
                </select>
              </div>

              {/* Montant */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-300">
                    Montant ({settings.currency || 'FCFA'}) <span className="text-rose-400">*</span>
                  </label>
                  <div className="flex gap-1">
                    {[settings.baseContribution || 50000, 25000, 10000, 5000].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setAmount(preset)}
                        className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400 hover:text-white border border-slate-700 cursor-pointer"
                      >
                        {formatMoney(preset)}
                      </button>
                    ))}
                  </div>
                </div>
                <input
                  type="number"
                  required
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Libellé / Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Motif / Description de l'opération <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Cotisation réunion de mars, Subvention Mairie, Achat collation..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Référence de pièce */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Référence pièce (reçu, virement)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: REC-2025-084 ou WAVE-491"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Notes internes
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Validé en séance de bureau"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowTxModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  Valider et Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Cash Account Modal */}
      {showAccountModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-750 rounded-2xl p-6 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Building className="w-5 h-5 text-emerald-400" />
                <span>Créer une Caisse ou Compte</span>
              </h3>
              <button
                onClick={() => setShowAccountModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAccountSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nom de la caisse / compte <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Caisse Principale, Compte Secours & Social, Banque SGCI..."
                  value={newAccName}
                  onChange={(e) => setNewAccName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Type de support financier
                </label>
                <select
                  value={newAccType}
                  onChange={(e) => setNewAccType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="cash">Caisse physique / Espèces (Coffre)</option>
                  <option value="bank">Compte bancaire (SGCI, Ecobank, BOA...)</option>
                  <option value="wave">Mobile Money : Wave Côte d'Ivoire</option>
                  <option value="orange_money">Mobile Money : Orange Money CI</option>
                  <option value="mtn_momo">Mobile Money : MTN MoMo CI</option>
                  <option value="moov_money">Mobile Money : Moov Money Flooz CI</option>
                  <option value="djamo">Fintech / Carte : Djamo CI</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Numéro de compte / Téléphone associé
                </label>
                <input
                  type="text"
                  placeholder="Ex: CI00801123... ou +225 07 00 00 00 00"
                  value={newAccNumber}
                  onChange={(e) => setNewAccNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Solde initial ({settings.currency || 'FCFA'})
                </label>
                <input
                  type="number"
                  min="0"
                  value={newAccBalance}
                  onChange={(e) => setNewAccBalance(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAccountModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  Créer la Caisse
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Reconciliation Mobile Money Modal */}
      {showReconcileModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-750 rounded-2xl p-6 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100">
                    Rapprochement & Pointage Mobile Money
                  </h3>
                  <p className="text-xs text-slate-400">
                    Collez le SMS de transaction (Wave, Orange, MTN, Moov) pour lettrage direct
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowReconcileModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {reconcileSuccess ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
                <h4 className="text-base font-bold text-emerald-300">
                  Transaction Mobile Money Rapprochée avec Succès !
                </h4>
                <p className="text-xs text-slate-400">
                  La caisse sélectionnée a été créditée de {formatMoney(reconcileAmount)}.
                </p>
              </div>
            ) : (
              <form onSubmit={handleReconcileSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Texte du SMS de confirmation reçu de l'opérateur
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Exemple : Vous avez reçu 50.000 FCFA de KOUADIO YVES (0701020304). Transaction ID: CI250812.1450.A19284..."
                    value={reconcileRawSms}
                    onChange={(e) => handleParseSms(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-800 border border-slate-750 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
                  />
                  <span className="text-[10px] text-slate-400 block mt-1">
                    💡 Le système détecte automatiquement l'opérateur, le montant et la référence de transaction.
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Opérateur Mobile
                    </label>
                    <select
                      value={reconcileOperator}
                      onChange={(e) => setReconcileOperator(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none"
                    >
                      <option value="wave">Wave Côte d'Ivoire</option>
                      <option value="orange_money">Orange Money CI</option>
                      <option value="mtn_momo">MTN MoMo CI</option>
                      <option value="moov_money">Moov Money Flooz</option>
                      <option value="djamo">Djamo CI</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Montant reçu ({settings.currency || 'FCFA'}) <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={reconcileAmount}
                      onChange={(e) => setReconcileAmount(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Référence / ID Transaction
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: CI250812.1450.A19284"
                      value={reconcileRef}
                      onChange={(e) => setReconcileRef(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 font-mono focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Caisse cible à créditer
                    </label>
                    <select
                      value={reconcileAccountId}
                      onChange={(e) => setReconcileAccountId(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none"
                    >
                      {accounts.map((acc) => (
                        <option key={acc.id} value={acc.id}>
                          {acc.name} ({acc.type.toUpperCase()})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Associer à un adhérent / souscripteur (optionnel)
                  </label>
                  <select
                    value={reconcileMemberId}
                    onChange={(e) => {
                      setReconcileMemberId(e.target.value);
                      const m = clients.find((c) => c.id === e.target.value);
                      if (m) setReconcileSender(m.name);
                    }}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="">-- Lettrage automatique ou manuel --</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.phone || c.matricule || 'Sans tél'})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pt-3 flex justify-end gap-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowReconcileModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Valider le Rapprochement</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

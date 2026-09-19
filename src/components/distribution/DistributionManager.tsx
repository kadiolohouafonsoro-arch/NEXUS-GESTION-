import React, { useState } from 'react';
import {
  PieChart,
  Users,
  Briefcase,
  Coins,
  CheckCircle2,
  TrendingUp,
  Plus,
  Trash2,
  Edit2,
  ArrowRight,
  ShieldCheck,
  Building,
  CreditCard,
  Wallet,
  Sparkles,
  Receipt,
  FileCheck,
  Percent,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  Shareholder,
  Employee,
  DistributionRuleConfig,
  DistributionPaymentItem,
  PaymentMethod,
} from '../../types';

export const DistributionManager: React.FC = () => {
  const {
    shareholders,
    employees,
    distributionRule,
    distributionSessions,
    updateDistributionRule,
    addShareholder,
    updateShareholder,
    deleteShareholder,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    executeDistributionSession,
    formatMoney,
    accounts,
    showToast,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<
    'execute' | 'rule' | 'shareholders' | 'employees' | 'history'
  >('execute');

  // Distribution Execution Form State
  const [revenueAmount, setRevenueAmount] = useState<number>(1000000);
  const [sessionTitle, setSessionTitle] = useState<string>('Distribution Recettes & Surplus Mensuels');
  const [sessionPeriod, setSessionPeriod] = useState<string>(
    new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
  );
  const [sourceAccountId, setSourceAccountId] = useState<string>(accounts[0]?.id || 'acc-1');
  const [isExecuting, setIsExecuting] = useState(false);

  // Edit Rule State
  const [ruleForm, setRuleForm] = useState<DistributionRuleConfig>({ ...distributionRule });

  // Shareholder Modal / Form State
  const [isShareholderModalOpen, setIsShareholderModalOpen] = useState(false);
  const [editingShareholder, setEditingShareholder] = useState<Shareholder | null>(null);
  const [shName, setShName] = useState('');
  const [shPhone, setShPhone] = useState('');
  const [shSharesCount, setShSharesCount] = useState(10);
  const [shSharePercentage, setShSharePercentage] = useState(25);
  const [shMethod, setShMethod] = useState<PaymentMethod>('wave');
  const [shAccountInfo, setShAccountInfo] = useState('');

  // Employee Modal / Form State
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [empName, setEmpName] = useState('');
  const [empPhone, setEmpPhone] = useState('');
  const [empRole, setEmpRole] = useState('Secrétaire Général');
  const [empSalary, setEmpSalary] = useState(100000);
  const [empContractType, setEmpContractType] = useState<'salaried' | 'indemnity' | 'contractor'>('salaried');
  const [empMethod, setEmpMethod] = useState<PaymentMethod>('wave');
  const [empAccountInfo, setEmpAccountInfo] = useState('');

  // Calculation Breakdown
  const reservePart = Math.round((revenueAmount * distributionRule.reservePercentage) / 100);
  const shareholdersTotalPart = Math.round(
    (revenueAmount * distributionRule.shareholdersPercentage) / 100
  );
  const employeesTotalPart = Math.round(
    (revenueAmount * distributionRule.employeesPercentage) / 100
  );
  const operationsPart = Math.round(
    (revenueAmount * (distributionRule.operationsPercentage || 0)) / 100
  );

  const totalRulePercentage =
    ruleForm.reservePercentage +
    ruleForm.shareholdersPercentage +
    ruleForm.employeesPercentage +
    (ruleForm.operationsPercentage || 0);

  const handleSaveRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (totalRulePercentage !== 100) {
      showToast(`La somme des pourcentages doit être égale à 100% (actuellement ${totalRulePercentage}%).`, 'warning');
      return;
    }
    updateDistributionRule(ruleForm);
    showToast('Clé de répartition des recettes enregistrée avec succès !', 'success');
  };

  const handleExecuteSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (revenueAmount <= 0) {
      showToast('Veuillez saisir un montant de recette valide.', 'warning');
      return;
    }

    const sourceAccount = accounts.find((a) => a.id === sourceAccountId) || accounts[0];

    // Compute individual payments
    const payments: DistributionPaymentItem[] = [];

    // 1. Reserve payment
    payments.push({
      id: `pay-res-${Date.now()}`,
      recipientType: 'reserve',
      recipientId: 'reserve-fund',
      recipientName: "Caisse de Réserve de l'Association",
      roleOrShares: `${distributionRule.reservePercentage}% statutaire`,
      amount: reservePart,
      paymentMethod: 'cash',
      accountInfo: sourceAccount?.name || 'Trésorerie',
      status: 'paid',
    });

    // 2. Shareholder payments (proportional to their shares or equal split)
    const totalShares = shareholders.reduce((acc, s) => acc + (s.sharesCount || 1), 0) || 1;
    shareholders.forEach((sh) => {
      const shareWeight = (sh.sharesCount || 1) / totalShares;
      const shAmount = Math.round(shareholdersTotalPart * shareWeight);
      payments.push({
        id: `pay-sh-${sh.id}-${Date.now()}`,
        recipientType: 'shareholder',
        recipientId: sh.id,
        recipientName: sh.name,
        roleOrShares: `${sh.sharesCount} parts (${sh.sharePercentage || Math.round(shareWeight * 100)}%)`,
        amount: shAmount,
        paymentMethod: sh.paymentMethod,
        accountInfo: sh.paymentAccountInfo || sh.phone,
        status: 'paid',
      });
    });

    // 3. Employee payments
    const activeEmployees = employees.filter((e) => e.status === 'active');
    const totalEmpSalaries = activeEmployees.reduce((acc, e) => acc + e.monthlySalary, 0) || 1;
    activeEmployees.forEach((emp) => {
      const empWeight = emp.monthlySalary / totalEmpSalaries;
      const empAmount = Math.round(employeesTotalPart * empWeight);
      payments.push({
        id: `pay-emp-${emp.id}-${Date.now()}`,
        recipientType: 'employee',
        recipientId: emp.id,
        recipientName: emp.name,
        roleOrShares: emp.role,
        amount: empAmount,
        paymentMethod: emp.paymentMethod,
        accountInfo: emp.paymentAccountInfo || emp.phone,
        status: 'paid',
      });
    });

    setIsExecuting(true);
    setTimeout(() => {
      executeDistributionSession({
        title: sessionTitle,
        date: new Date().toISOString().split('T')[0],
        period: sessionPeriod,
        totalRevenueAmount: revenueAmount,
        sourceAccountId: sourceAccount?.id || 'acc-1',
        sourceAccountName: sourceAccount?.name || 'Caisse Principale',
        reserveAmount: reservePart,
        shareholdersTotalAmount: shareholdersTotalPart,
        employeesTotalAmount: employeesTotalPart,
        operationsAmount: operationsPart,
        notes: `Paiement automatisé : ${shareholders.length} actionnaires et ${activeEmployees.length} employés crédités`,
        payments,
      });

      setIsExecuting(false);
      setActiveSubTab('history');
    }, 700);
  };

  // Open Shareholder Modal
  const handleOpenShareholderModal = (sh?: Shareholder) => {
    if (sh) {
      setEditingShareholder(sh);
      setShName(sh.name);
      setShPhone(sh.phone);
      setShSharesCount(sh.sharesCount);
      setShSharePercentage(sh.sharePercentage || 25);
      setShMethod(sh.paymentMethod);
      setShAccountInfo(sh.paymentAccountInfo || '');
    } else {
      setEditingShareholder(null);
      setShName('');
      setShPhone('');
      setShSharesCount(10);
      setShSharePercentage(25);
      setShMethod('wave');
      setShAccountInfo('');
    }
    setIsShareholderModalOpen(true);
  };

  const handleSaveShareholder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shName.trim()) return;

    if (editingShareholder) {
      updateShareholder({
        ...editingShareholder,
        name: shName.trim(),
        phone: shPhone.trim(),
        sharesCount: shSharesCount,
        sharePercentage: shSharePercentage,
        paymentMethod: shMethod,
        paymentAccountInfo: shAccountInfo.trim() || shPhone.trim(),
      });
    } else {
      addShareholder({
        name: shName.trim(),
        phone: shPhone.trim(),
        sharesCount: shSharesCount,
        sharePercentage: shSharePercentage,
        paymentMethod: shMethod,
        paymentAccountInfo: shAccountInfo.trim() || shPhone.trim(),
        joinedDate: new Date().toISOString().split('T')[0],
      });
    }
    setIsShareholderModalOpen(false);
  };

  // Open Employee Modal
  const handleOpenEmployeeModal = (emp?: Employee) => {
    if (emp) {
      setEditingEmployee(emp);
      setEmpName(emp.name);
      setEmpPhone(emp.phone);
      setEmpRole(emp.role);
      setEmpSalary(emp.monthlySalary);
      setEmpContractType(emp.contractType);
      setEmpMethod(emp.paymentMethod);
      setEmpAccountInfo(emp.paymentAccountInfo || '');
    } else {
      setEditingEmployee(null);
      setEmpName('');
      setEmpPhone('');
      setEmpRole('Secrétaire Exécutif');
      setEmpSalary(100000);
      setEmpContractType('salaried');
      setEmpMethod('wave');
      setEmpAccountInfo('');
    }
    setIsEmployeeModalOpen(true);
  };

  const handleSaveEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empName.trim()) return;

    if (editingEmployee) {
      updateEmployee({
        ...editingEmployee,
        name: empName.trim(),
        phone: empPhone.trim(),
        role: empRole.trim(),
        monthlySalary: empSalary,
        contractType: empContractType,
        paymentMethod: empMethod,
        paymentAccountInfo: empAccountInfo.trim() || empPhone.trim(),
      });
    } else {
      addEmployee({
        name: empName.trim(),
        phone: empPhone.trim(),
        role: empRole.trim(),
        monthlySalary: empSalary,
        contractType: empContractType,
        paymentMethod: empMethod,
        paymentAccountInfo: empAccountInfo.trim() || empPhone.trim(),
        status: 'active',
        hiredDate: new Date().toISOString().split('T')[0],
      });
    }
    setIsEmployeeModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-[11px] font-extrabold uppercase rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Gouvernance & Recettes
            </span>
            <span className="text-xs text-slate-400">
              Clé active : <strong>{distributionRule.shareholdersPercentage}% Actionnaires / {distributionRule.employeesPercentage}% Salariés</strong>
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight flex items-center gap-2.5 mt-1">
            <Coins className="w-7 h-7 text-amber-400" />
            <span>Répartition des Recettes, Actionnaires & Personnel</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Définissez comment distribuer les surplus et recettes de l'association entre réserve, actionnaires et employés.
          </p>
        </div>

        {/* Sub-tab Navigation Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-850 p-1.5 rounded-2xl border border-slate-750 flex-wrap">
          {[
            { id: 'execute', label: 'Distribuer une Recette', icon: Coins },
            { id: 'rule', label: 'Clé de Répartition', icon: Percent },
            { id: 'shareholders', label: `Actionnaires (${shareholders.length})`, icon: Users },
            { id: 'employees', label: `Personnel (${employees.length})`, icon: Briefcase },
            { id: 'history', label: `Historique (${distributionSessions.length})`, icon: Receipt },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  active
                    ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SUB-TAB 1: EXECUTE DISTRIBUTION */}
      {activeSubTab === 'execute' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Input form (7 cols) */}
          <div className="lg:col-span-7 bg-slate-850 border border-slate-750 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-750">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Coins className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">
                    Lancer une Session de Paiement des Recettes
                  </h3>
                  <p className="text-xs text-slate-400">
                    Calcul et virement automatique selon votre clé statutaire
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                100% Automatisé
              </span>
            </div>

            <form onSubmit={handleExecuteSession} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Montant total de la recette à distribuer (FCFA) *
                </label>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {[500000, 1000000, 2500000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setRevenueAmount(amt)}
                      className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                        revenueAmount === amt
                          ? 'bg-amber-500 text-slate-950 border-amber-400 font-extrabold shadow'
                          : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      {formatMoney(amt)}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min="10000"
                  step="5000"
                  value={revenueAmount || ''}
                  onChange={(e) => setRevenueAmount(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-base font-mono font-black text-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Libellé / Objet de la session
                  </label>
                  <input
                    type="text"
                    value={sessionTitle}
                    onChange={(e) => setSessionTitle(e.target.value)}
                    placeholder="Ex: Distribution des bénéfices kermesse"
                    className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Période / Mois
                  </label>
                  <input
                    type="text"
                    value={sessionPeriod}
                    onChange={(e) => setSessionPeriod(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Compte financier émetteur (Caisse débitée)
                </label>
                <select
                  value={sourceAccountId}
                  onChange={(e) => setSourceAccountId(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} — Solde disponible : {formatMoney(a.balance)}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={isExecuting}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl text-sm font-black transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
              >
                {isExecuting ? (
                  <span>Génération et paiement en cours...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Valider et Exécuter la Distribution ({formatMoney(revenueAmount)})</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Simulation & Breakdown preview (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-slate-850 border border-slate-750 rounded-2xl p-5 shadow-xl">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center justify-between">
                <span>Simulation de Répartition</span>
                <PieChart className="w-4 h-4 text-amber-400" />
              </h3>

              <div className="space-y-3 text-xs">
                {/* Réserve Association */}
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-750 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-200 flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Réserve de l'Association</span>
                    </div>
                    <span className="text-[10px] text-slate-400">{distributionRule.reservePercentage}% de la recette</span>
                  </div>
                  <div className="font-mono font-bold text-indigo-300">
                    {formatMoney(reservePart)}
                  </div>
                </div>

                {/* Part Actionnaires */}
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-750 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-200 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-amber-400" />
                      <span>Actionnaires & Associés</span>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {distributionRule.shareholdersPercentage}% pour {shareholders.length} actionnaires
                    </span>
                  </div>
                  <div className="font-mono font-bold text-amber-300">
                    {formatMoney(shareholdersTotalPart)}
                  </div>
                </div>

                {/* Part Employés */}
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-750 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-200 flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-teal-400" />
                      <span>Salaires & Primes Personnel</span>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {distributionRule.employeesPercentage}% pour {employees.length} collaborateurs
                    </span>
                  </div>
                  <div className="font-mono font-bold text-teal-300">
                    {formatMoney(employeesTotalPart)}
                  </div>
                </div>

                {/* Opérations / Urgence */}
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-750 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-200 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Frais de Fonctionnement & Urgences</span>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {distributionRule.operationsPercentage || 0}% de fonds opérationnel
                    </span>
                  </div>
                  <div className="font-mono font-bold text-emerald-300">
                    {formatMoney(operationsPart)}
                  </div>
                </div>
              </div>

              {/* Beneficiary snippet */}
              <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Total bénéficiaires :</span>
                <strong className="text-slate-200">
                  {shareholders.length} actionnaires + {employees.length} collaborateurs
                </strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: DISTRIBUTION RULE CONFIG */}
      {activeSubTab === 'rule' && (
        <div className="max-w-2xl mx-auto bg-slate-850 border border-slate-750 rounded-2xl p-6 shadow-xl">
          <div className="mb-4 pb-3 border-b border-slate-750">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Percent className="w-4 h-4 text-amber-400" />
              <span>Configuration de la Clé de Répartition des Recettes</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Déterminez précisément les quotes-parts statutaires de l'association. La somme des pourcentages doit atteindre exactement 100%.
            </p>
          </div>

          <form onSubmit={handleSaveRule} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                % Réserve de l'Association (Pérennité & Trésorerie)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={ruleForm.reservePercentage}
                onChange={(e) =>
                  setRuleForm({ ...ruleForm, reservePercentage: Number(e.target.value) })
                }
                className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                % Actionnaires & Investisseurs / Fondateurs
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={ruleForm.shareholdersPercentage}
                onChange={(e) =>
                  setRuleForm({ ...ruleForm, shareholdersPercentage: Number(e.target.value) })
                }
                className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                % Salaires & Primes des Employés / Équipe opérationnelle
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={ruleForm.employeesPercentage}
                onChange={(e) =>
                  setRuleForm({ ...ruleForm, employeesPercentage: Number(e.target.value) })
                }
                className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                % Fonctionnement, Matériel & Logistique
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={ruleForm.operationsPercentage || 0}
                onChange={(e) =>
                  setRuleForm({ ...ruleForm, operationsPercentage: Number(e.target.value) })
                }
                className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div
              className={`p-3 rounded-xl border flex items-center justify-between text-xs font-bold ${
                totalRulePercentage === 100
                  ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-950/20 border-rose-500/40 text-rose-300'
              }`}
            >
              <span>Total des quotes-parts :</span>
              <span>{totalRulePercentage} % {totalRulePercentage === 100 ? '(Conforme 100%)' : '(Doit faire 100%)'}</span>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs transition-all shadow-md cursor-pointer"
            >
              Enregistrer la Clé de Répartition
            </button>
          </form>
        </div>
      )}

      {/* SUB-TAB 3: SHAREHOLDERS LIST */}
      {activeSubTab === 'shareholders' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-200">
                Actionnaires, Investisseurs & Fondateurs
              </h3>
              <p className="text-xs text-slate-400">
                Liste des ayants droit aux dividendes selon leur quote-part d'actions
              </p>
            </div>
            <button
              onClick={() => handleOpenShareholderModal()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black transition-all shadow-md cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nouvel Actionnaire</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {shareholders.map((sh) => (
              <div
                key={sh.id}
                className="bg-slate-850 border border-slate-750 rounded-2xl p-4 shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-slate-100 text-sm">{sh.name}</h4>
                      <p className="text-[11px] text-slate-400">{sh.phone}</p>
                    </div>
                    <span className="text-xs font-black px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {sh.sharesCount} actions
                    </span>
                  </div>

                  <div className="my-3 p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Quote-part estimée :</span>
                      <strong className="text-slate-200">{sh.sharePercentage || 25}%</strong>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Mode de versement :</span>
                      <strong className="text-slate-200 uppercase">{sh.paymentMethod}</strong>
                    </div>
                    <div className="flex justify-between text-slate-400 pt-1 border-t border-slate-800">
                      <span>Total dividendes perçus :</span>
                      <strong className="text-emerald-400 font-mono font-bold">
                        {formatMoney(sh.totalDividendsReceived || 0)}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-1 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => handleOpenShareholderModal(sh)}
                    className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Supprimer l'actionnaire ${sh.name} ?`)) {
                        deleteShareholder(sh.id);
                      }
                    }}
                    className="p-1.5 text-slate-500 hover:text-rose-400 rounded hover:bg-slate-800 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 4: EMPLOYEES LIST */}
      {activeSubTab === 'employees' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-200">
                Personnel & Collaborateurs de l'Association
              </h3>
              <p className="text-xs text-slate-400">
                Grille des salaires et indemnités versées à chaque session de recettes
              </p>
            </div>
            <button
              onClick={() => handleOpenEmployeeModal()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-xl text-xs font-black transition-all shadow-md cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nouveau Collaborateur</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {employees.map((emp) => (
              <div
                key={emp.id}
                className="bg-slate-850 border border-slate-750 rounded-2xl p-4 shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-slate-100 text-sm">{emp.name}</h4>
                      <p className="text-[11px] text-teal-400 font-semibold">{emp.role}</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {emp.status === 'active' ? 'Actif' : 'Inactif'}
                    </span>
                  </div>

                  <div className="my-3 p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Rémunération de base :</span>
                      <strong className="text-slate-200 font-mono font-bold">
                        {formatMoney(emp.monthlySalary)}
                      </strong>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Contrat :</span>
                      <strong className="text-slate-300 uppercase">{emp.contractType}</strong>
                    </div>
                    <div className="flex justify-between text-slate-400 pt-1 border-t border-slate-800">
                      <span>Cumul perçu à ce jour :</span>
                      <strong className="text-teal-400 font-mono font-bold">
                        {formatMoney(emp.totalPaid || 0)}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-1 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => handleOpenEmployeeModal(emp)}
                    className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Supprimer le collaborateur ${emp.name} ?`)) {
                        deleteEmployee(emp.id);
                      }
                    }}
                    className="p-1.5 text-slate-500 hover:text-rose-400 rounded hover:bg-slate-800 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 5: SESSIONS HISTORY */}
      {activeSubTab === 'history' && (
        <div className="bg-slate-850 border border-slate-750 rounded-2xl p-5 shadow-xl">
          <h3 className="text-sm font-bold text-slate-100 mb-3 flex items-center justify-between">
            <span>Historique des Sessions de Distribution Passées</span>
            <Receipt className="w-4 h-4 text-amber-400" />
          </h3>

          {distributionSessions.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">
              Aucune session de distribution exécutée pour l'instant. Utilisez l'onglet "Distribuer une Recette".
            </p>
          ) : (
            <div className="space-y-4">
              {distributionSessions.map((s) => (
                <div
                  key={s.id}
                  className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-xs font-bold text-amber-400 block">{s.title}</span>
                      <span className="text-[11px] text-slate-400">Date : {s.date} • Période : {s.period}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">Total Distribué</span>
                      <span className="text-base font-black font-mono text-emerald-400">
                        {formatMoney(s.totalRevenueAmount)}
                      </span>
                    </div>
                  </div>

                  {/* Allocations breakdown chips */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="p-2 rounded-lg bg-slate-850 border border-slate-750">
                      <span className="text-[10px] text-slate-400 block">Réserve</span>
                      <span className="font-bold text-indigo-300 font-mono">
                        {formatMoney(s.reserveAmount)}
                      </span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-850 border border-slate-750">
                      <span className="text-[10px] text-slate-400 block">Actionnaires</span>
                      <span className="font-bold text-amber-300 font-mono">
                        {formatMoney(s.shareholdersTotalAmount)}
                      </span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-850 border border-slate-750">
                      <span className="text-[10px] text-slate-400 block">Personnel</span>
                      <span className="font-bold text-teal-300 font-mono">
                        {formatMoney(s.employeesTotalAmount)}
                      </span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-850 border border-slate-750">
                      <span className="text-[10px] text-slate-400 block">Fonctionnement</span>
                      <span className="font-bold text-emerald-300 font-mono">
                        {formatMoney(s.operationsAmount || 0)}
                      </span>
                    </div>
                  </div>

                  {/* Payments preview list */}
                  {s.payments && s.payments.length > 0 && (
                    <div className="pt-2 border-t border-slate-800 text-[11px] space-y-1">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Bénéficiaires réglés :</div>
                      <div className="flex flex-wrap gap-1.5">
                        {s.payments.map((p) => (
                          <span
                            key={p.id}
                            className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 font-mono"
                          >
                            {p.recipientName} ({formatMoney(p.amount)})
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SHAREHOLDER MODAL */}
      {isShareholderModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-750 rounded-2xl w-full max-w-md p-5 shadow-2xl">
            <h3 className="text-sm font-bold text-slate-100 mb-3">
              {editingShareholder ? "Modifier l'actionnaire" : 'Ajouter un actionnaire'}
            </h3>
            <form onSubmit={handleSaveShareholder} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Nom & Prénoms *</label>
                <input
                  type="text"
                  value={shName}
                  onChange={(e) => setShName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Téléphone / Wave *</label>
                <input
                  type="tel"
                  value={shPhone}
                  onChange={(e) => setShPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Nombre d'actions</label>
                  <input
                    type="number"
                    min="1"
                    value={shSharesCount}
                    onChange={(e) => setShSharesCount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Quote-part (%)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={shSharePercentage}
                    onChange={(e) => setShSharePercentage(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Mode de versement favori</label>
                <select
                  value={shMethod}
                  onChange={(e) => setShMethod(e.target.value as PaymentMethod)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200"
                >
                  <option value="wave">Wave</option>
                  <option value="orange_money">Orange Money</option>
                  <option value="mtn_momo">MTN MoMo</option>
                  <option value="bank">Virement Bancaire</option>
                  <option value="cash">Espèces</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Infos compte / Numéro de réception</label>
                <input
                  type="text"
                  value={shAccountInfo}
                  onChange={(e) => setShAccountInfo(e.target.value)}
                  placeholder="Ex: Wave 07 89 02 82 07"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsShareholderModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs cursor-pointer"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EMPLOYEE MODAL */}
      {isEmployeeModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-750 rounded-2xl w-full max-w-md p-5 shadow-2xl">
            <h3 className="text-sm font-bold text-slate-100 mb-3">
              {editingEmployee ? "Modifier le collaborateur" : 'Ajouter un collaborateur'}
            </h3>
            <form onSubmit={handleSaveEmployee} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Nom & Prénoms *</label>
                <input
                  type="text"
                  value={empName}
                  onChange={(e) => setEmpName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Fonction / Poste *</label>
                <input
                  type="text"
                  value={empRole}
                  onChange={(e) => setEmpRole(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200"
                  required
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Téléphone *</label>
                  <input
                    type="tel"
                    value={empPhone}
                    onChange={(e) => setEmpPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Rémunération de base (FCFA)</label>
                  <input
                    type="number"
                    min="0"
                    step="5000"
                    value={empSalary}
                    onChange={(e) => setEmpSalary(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Type de contrat</label>
                  <select
                    value={empContractType}
                    onChange={(e) => setEmpContractType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200"
                  >
                    <option value="salaried">Salarié</option>
                    <option value="indemnity">Indemnité de mandat</option>
                    <option value="contractor">Prestataire / Honoraire</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Mode de règlement</label>
                  <select
                    value={empMethod}
                    onChange={(e) => setEmpMethod(e.target.value as PaymentMethod)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200"
                  >
                    <option value="wave">Wave</option>
                    <option value="orange_money">Orange Money</option>
                    <option value="mtn_momo">MTN MoMo</option>
                    <option value="bank">Virement Bancaire</option>
                    <option value="cash">Espèces</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEmployeeModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-black rounded-xl text-xs cursor-pointer"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

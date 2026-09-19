import React, { useState } from 'react';
import { X, CheckCircle, Smartphone, Building, Banknote } from 'lucide-react';
import { Invoice, PaymentMethod } from '../../types';
import { useApp } from '../../context/AppContext';

interface RecordPaymentModalProps {
  invoice: Invoice | null;
  onClose: () => void;
}

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({ invoice, onClose }) => {
  const { accounts, recordPayment, formatMoney } = useApp();

  if (!invoice) return null;

  const remaining = invoice.total - invoice.amountPaid;

  const [amount, setAmount] = useState<number>(remaining > 0 ? remaining : invoice.total);
  const [method, setMethod] = useState<PaymentMethod>('wave');
  const [accountId, setAccountId] = useState<string>(accounts[0]?.id || '');
  const [reference, setReference] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;
    recordPayment(invoice.id, Number(amount), method, accountId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-750 rounded-2xl shadow-2xl p-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-slate-100">Enregistrer un Règlement</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/60 mb-4">
          <div className="flex justify-between text-xs text-slate-300">
            <span>Facture : <strong>{invoice.number}</strong></span>
            <span>Total : {formatMoney(invoice.total)}</span>
          </div>
          <div className="flex justify-between text-xs text-slate-300 mt-1">
            <span>Client : {invoice.clientName}</span>
            <span className="text-emerald-400 font-bold">
              Reste : {formatMoney(remaining)}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Montant perçu ({invoice.total > 0 ? 'Solde ou acompte' : ''})
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                max={remaining > 0 ? remaining : invoice.total}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                required
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Moyen de règlement (Afrique de l'Ouest / Côte d'Ivoire)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  setMethod('wave');
                  const waveAcc = accounts.find((a) => a.type === 'wave');
                  if (waveAcc) setAccountId(waveAcc.id);
                }}
                className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border transition-all cursor-pointer ${
                  method === 'wave'
                    ? 'bg-sky-500/25 border-sky-500 text-sky-300 font-bold shadow-md shadow-sky-500/20'
                    : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Smartphone className="w-5 h-5 text-sky-400" />
                <span className="text-[11px] font-bold">Wave CI</span>
                <span className="text-[9px] text-sky-400/80">0% - 1% frais</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMethod('orange_money');
                  const omAcc = accounts.find((a) => a.type === 'orange_money');
                  if (omAcc) setAccountId(omAcc.id);
                }}
                className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border transition-all cursor-pointer ${
                  method === 'orange_money'
                    ? 'bg-amber-500/25 border-amber-500 text-amber-300 font-bold shadow-md shadow-amber-500/20'
                    : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Smartphone className="w-5 h-5 text-amber-400" />
                <span className="text-[11px] font-bold">Orange Money</span>
                <span className="text-[9px] text-amber-400/80">#144#</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMethod('mtn_momo');
                  const mtnAcc = accounts.find((a) => a.type === 'mtn_momo');
                  if (mtnAcc) setAccountId(mtnAcc.id);
                }}
                className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border transition-all cursor-pointer ${
                  method === 'mtn_momo'
                    ? 'bg-yellow-500/25 border-yellow-500 text-yellow-300 font-bold shadow-md shadow-yellow-500/20'
                    : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Smartphone className="w-5 h-5 text-yellow-400" />
                <span className="text-[11px] font-bold">MTN MoMo</span>
                <span className="text-[9px] text-yellow-400/80">*133#</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMethod('moov_money');
                  const moovAcc = accounts.find((a) => a.type === 'moov_money');
                  if (moovAcc) setAccountId(moovAcc.id);
                }}
                className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border transition-all cursor-pointer ${
                  method === 'moov_money'
                    ? 'bg-blue-500/25 border-blue-500 text-blue-300 font-bold shadow-md shadow-blue-500/20'
                    : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Smartphone className="w-5 h-5 text-blue-400" />
                <span className="text-[11px] font-bold">Moov Flooz</span>
                <span className="text-[9px] text-blue-400/80">*155#</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMethod('djamo');
                  const djamoAcc = accounts.find((a) => a.type === 'djamo');
                  if (djamoAcc) setAccountId(djamoAcc.id);
                }}
                className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border transition-all cursor-pointer ${
                  method === 'djamo'
                    ? 'bg-violet-500/25 border-violet-500 text-violet-300 font-bold shadow-md shadow-violet-500/20'
                    : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Smartphone className="w-5 h-5 text-violet-400" />
                <span className="text-[11px] font-bold">Djamo CI</span>
                <span className="text-[9px] text-violet-400/80">Carte Visa</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMethod('bank_transfer');
                  const bnkAcc = accounts.find((a) => a.type === 'bank');
                  if (bnkAcc) setAccountId(bnkAcc.id);
                }}
                className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border transition-all cursor-pointer ${
                  method === 'bank_transfer'
                    ? 'bg-emerald-500/25 border-emerald-500 text-emerald-300 font-bold shadow-md shadow-emerald-500/20'
                    : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Building className="w-5 h-5 text-emerald-400" />
                <span className="text-[11px] font-bold">Virement</span>
                <span className="text-[9px] text-emerald-400/80">SGCI / BACI</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMethod('cash');
                  const cashAcc = accounts.find((a) => a.type === 'cash');
                  if (cashAcc) setAccountId(cashAcc.id);
                }}
                className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border transition-all cursor-pointer ${
                  method === 'cash'
                    ? 'bg-purple-500/25 border-purple-500 text-purple-300 font-bold shadow-md shadow-purple-500/20'
                    : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Banknote className="w-5 h-5 text-purple-400" />
                <span className="text-[11px] font-bold">Espèces</span>
                <span className="text-[9px] text-purple-400/80">Caisse siège</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMethod('check');
                  const bnkAcc = accounts.find((a) => a.type === 'bank');
                  if (bnkAcc) setAccountId(bnkAcc.id);
                }}
                className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border transition-all cursor-pointer ${
                  method === 'check'
                    ? 'bg-teal-500/25 border-teal-500 text-teal-300 font-bold shadow-md shadow-teal-500/20'
                    : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Building className="w-5 h-5 text-teal-400" />
                <span className="text-[11px] font-bold">Chèque</span>
                <span className="text-[9px] text-teal-400/80">Banque UEMOA</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Compte / Caisse de destination
            </label>
            <select
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({formatMoney(acc.balance)})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Référence / N° de transaction (optionnel)
            </label>
            <input
              type="text"
              placeholder="Ex: WAVE-TX-99812 ou VIR-SGCI"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-600/20 cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Confirmer l'encaissement</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

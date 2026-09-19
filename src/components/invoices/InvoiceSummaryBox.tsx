import React, { useState } from 'react';
import { Calculator, Percent, Sparkles, Receipt, ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { numberToWordsFrench } from '../../utils/numberToWordsFrench';

interface InvoiceSummaryBoxProps {
  subtotal: number;
  discount: number;
  taxRate: number;
  onDiscountChange: (discount: number) => void;
  onTaxRateChange: (rate: number) => void;
}

export const InvoiceSummaryBox: React.FC<InvoiceSummaryBoxProps> = ({
  subtotal,
  discount,
  taxRate,
  onDiscountChange,
  onTaxRateChange,
}) => {
  const { formatMoney, settings } = useApp();
  const [discountType, setDiscountType] = useState<'amount' | 'percentage'>('amount');
  const [discountPercent, setDiscountPercent] = useState<number>(
    subtotal > 0 ? Math.round((discount / subtotal) * 100) : 0
  );
  const [customTaxRateInput, setCustomTaxRateInput] = useState<string>(taxRate.toString());
  const [isCustomTax, setIsCustomTax] = useState<boolean>(![0, 18, 20].includes(taxRate));

  // Calculs financiers
  const calculatedDiscount =
    discountType === 'percentage'
      ? Math.round((subtotal * discountPercent) / 100)
      : discount;

  const taxableAmount = Math.max(0, subtotal - calculatedDiscount);
  const taxAmount = Math.round((taxableAmount * taxRate) / 100);
  const totalTTC = taxableAmount + taxAmount;

  // Montant en toutes lettres
  const amountInWords = numberToWordsFrench(totalTTC, settings.currency);

  const handlePercentageChange = (pct: number) => {
    const validPct = Math.min(100, Math.max(0, pct));
    setDiscountPercent(validPct);
    const calculated = Math.round((subtotal * validPct) / 100);
    onDiscountChange(calculated);
  };

  const handleFixedAmountChange = (amt: number) => {
    const validAmt = Math.max(0, amt);
    onDiscountChange(validAmt);
    if (subtotal > 0) {
      setDiscountPercent(Math.round((validAmt / subtotal) * 100));
    }
  };

  const handleTaxPreset = (rate: number) => {
    setIsCustomTax(false);
    onTaxRateChange(rate);
  };

  const handleCustomTaxChange = (val: string) => {
    setCustomTaxRateInput(val);
    const parsed = parseFloat(val);
    if (!isNaN(parsed) && parsed >= 0) {
      onTaxRateChange(parsed);
    }
  };

  return (
    <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xl shadow-black/20">
      <div className="flex items-center justify-between border-b border-slate-700/80 pb-3">
        <div className="flex items-center gap-2">
          <Calculator className="w-4 h-4 text-indigo-400" />
          <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
            Calculs financiers des Totaux HT & TTC
          </h3>
        </div>
        <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
          Devise : {settings.currency}
        </span>
      </div>

      <div className="space-y-3 text-xs">
        {/* Ligne Sous-total Hors Taxes */}
        <div className="flex items-center justify-between py-1 text-slate-300">
          <span className="font-medium flex items-center gap-1.5">
            <Receipt className="w-3.5 h-3.5 text-slate-400" />
            Total brut Hors Taxes (HT) :
          </span>
          <span className="font-mono font-bold text-sm text-slate-100">
            {formatMoney(subtotal)}
          </span>
        </div>

        {/* Ligne Remise commerciale */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 bg-slate-900/60 rounded-xl border border-slate-750">
          <div className="flex items-center gap-2">
            <span className="text-slate-300 font-medium">Remise commerciale :</span>
            <div className="inline-flex rounded-lg bg-slate-800 p-0.5 border border-slate-700">
              <button
                type="button"
                onClick={() => setDiscountType('amount')}
                className={`px-2 py-0.5 text-[11px] font-semibold rounded-md transition-all cursor-pointer ${
                  discountType === 'amount'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Fixe ({settings.currency})
              </button>
              <button
                type="button"
                onClick={() => setDiscountType('percentage')}
                className={`px-2 py-0.5 text-[11px] font-semibold rounded-md transition-all cursor-pointer ${
                  discountType === 'percentage'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Pourcentage (%)
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {discountType === 'amount' ? (
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={discount}
                  onChange={(e) => handleFixedAmountChange(Number(e.target.value))}
                  placeholder="Montant remise"
                  className="w-32 px-2.5 py-1 bg-slate-850 border border-slate-700 rounded-lg text-xs font-mono text-right text-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={discountPercent}
                  onChange={(e) => handlePercentageChange(Number(e.target.value))}
                  className="w-16 px-2 py-1 bg-slate-850 border border-slate-700 rounded-lg text-xs font-mono text-right text-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <span className="text-slate-400 font-bold">%</span>
                <span className="text-[11px] font-mono text-emerald-400">
                  (-{formatMoney(calculatedDiscount)})
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Ligne Sous-total Net HT */}
        <div className="flex items-center justify-between py-1 text-slate-300 border-t border-slate-700/50 pt-2">
          <span className="font-medium">Total Net Hors Taxes (Assiette TVA) :</span>
          <span className="font-mono font-bold text-slate-200">
            {formatMoney(taxableAmount)}
          </span>
        </div>

        {/* Ligne TVA et choix du taux */}
        <div className="space-y-2 p-2.5 bg-slate-900/60 rounded-xl border border-slate-750">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-slate-300 font-medium">Taux de TVA applicable :</span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleTaxPreset(0)}
                className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  !isCustomTax && taxRate === 0
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-750 border border-slate-700'
                }`}
              >
                0% (Exonéré)
              </button>
              <button
                type="button"
                onClick={() => handleTaxPreset(18)}
                className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  !isCustomTax && taxRate === 18
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-750 border border-slate-700'
                }`}
              >
                18% (UEMOA/CI)
              </button>
              <button
                type="button"
                onClick={() => handleTaxPreset(20)}
                className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  !isCustomTax && taxRate === 20
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-750 border border-slate-700'
                }`}
              >
                20% (Intl)
              </button>
              <button
                type="button"
                onClick={() => setIsCustomTax(true)}
                className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  isCustomTax
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-750 border border-slate-700'
                }`}
              >
                Autre
              </button>
            </div>
          </div>

          {isCustomTax && (
            <div className="flex items-center justify-end gap-2 pt-1">
              <span className="text-[11px] text-slate-400">Saisir le taux (%) :</span>
              <input
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={customTaxRateInput}
                onChange={(e) => handleCustomTaxChange(e.target.value)}
                className="w-20 px-2 py-1 bg-slate-850 border border-slate-700 rounded-lg text-xs font-mono text-right text-indigo-300"
              />
              <span className="text-slate-400">%</span>
            </div>
          )}

          <div className="flex items-center justify-between text-slate-400 pt-1 border-t border-slate-800/80">
            <span>Montant de la TVA ({taxRate}%) :</span>
            <span className="font-mono font-bold text-slate-200">
              {formatMoney(taxAmount)}
            </span>
          </div>
        </div>

        {/* Grand Total TTC */}
        <div className="p-3.5 bg-gradient-to-r from-indigo-950/70 to-slate-900 border border-indigo-500/40 rounded-xl flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-300">
                TOTAL TTC (Toutes Taxes Comprises)
              </span>
              <span className="text-[10px] bg-indigo-500/30 text-indigo-200 px-1.5 py-0.5 rounded font-bold">
                Net à payer
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Montant exigible à la date d'échéance convenue
            </p>
          </div>
          <div className="text-right">
            <span className="text-lg sm:text-xl font-black font-mono text-indigo-200 tracking-tight">
              {formatMoney(totalTTC)}
            </span>
          </div>
        </div>

        {/* Montant en toutes lettres */}
        <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-750 flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="text-[11px] font-semibold text-slate-300">
              Mention légale du montant en toutes lettres :
            </span>
            <p className="text-xs italic text-amber-200/90 font-medium">
              « Arrêté la présente facture à la somme de {amountInWords} TTC »
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

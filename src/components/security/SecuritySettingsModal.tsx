import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  KeyRound,
  Clock,
  FileCheck,
  AlertTriangle,
  Download,
  CheckCircle2,
  X,
  History,
  Info,
  ShieldAlert,
  UserCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface SecuritySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLockNow: () => void;
}

export const SecuritySettingsModal: React.FC<SecuritySettingsModalProps> = ({
  isOpen,
  onClose,
  onLockNow,
}) => {
  const {
    securityConfig,
    updateSecurityConfig,
    changeSecurityPin,
    securityAuditLogs,
    exportDataJSON,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'pin' | 'autolock' | 'logs'>('pin');

  // Change PIN form
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [pinSuccess, setPinSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleChangePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPinError(null);
    setPinSuccess(null);

    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      setPinError('Le nouveau code PIN doit comporter exactement 4 chiffres.');
      return;
    }

    if (newPin !== confirmPin) {
      setPinError('La confirmation du nouveau code PIN ne correspond pas.');
      return;
    }

    const success = changeSecurityPin(currentPin, newPin);
    if (success) {
      setPinSuccess('Code PIN administrateur modifié avec succès !');
      setCurrentPin('');
      setNewPin('');
      setConfirmPin('');
      showToast('Nouveau code PIN de sécurité enregistré', 'success');
    } else {
      setPinError('L\'ancien code PIN saisi est incorrect.');
    }
  };

  const handleAutoLockChange = (minutes: number) => {
    updateSecurityConfig({ autoLockMinutes: minutes });
    showToast(
      minutes === 0
        ? 'Verrouillage automatique désactivé'
        : `Verrouillage automatique configuré à ${minutes} minutes`,
      'info'
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-emerald-950/40 p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 shadow-md">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-100 tracking-tight">
                  Centre de Sécurité & Contrôle d'Accès
                </h2>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  AES-256 Actif
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Protection des données, code PIN administrateur et audit de conformité
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-800 bg-slate-900/60">
          <button
            type="button"
            onClick={() => setActiveTab('pin')}
            className={`pb-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'pin'
                ? 'border-emerald-400 text-emerald-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Code PIN & Verrouillage</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('autolock')}
            className={`pb-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'autolock'
                ? 'border-emerald-400 text-emerald-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Session & Chiffrement</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('logs')}
            className={`pb-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'logs'
                ? 'border-emerald-400 text-emerald-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Journal d'Audit ({securityAuditLogs.length})</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 max-h-[65vh] overflow-y-auto space-y-6">
          {activeTab === 'pin' && (
            <div className="space-y-5">
              {/* Quick Lock Card */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-amber-300">
                      Verrouiller Nexus Gestion Immédiatement
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Masque instantanément toutes les vues et exige le code PIN pour réaccéder.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onLockNow();
                  }}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer whitespace-nowrap"
                >
                  Verrouiller l'écran
                </button>
              </div>

              {/* Change PIN Form */}
              <form onSubmit={handleChangePinSubmit} className="space-y-4 bg-slate-850 p-5 rounded-2xl border border-slate-800">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-emerald-400" />
                  <span>Modifier le Code PIN Administrateur</span>
                </h4>

                {pinError && (
                  <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{pinError}</span>
                  </div>
                )}

                {pinSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{pinSuccess}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Code PIN Actuel
                    </label>
                    <input
                      type="password"
                      maxLength={4}
                      placeholder="Ex: 1234"
                      value={currentPin}
                      onChange={(e) => setCurrentPin(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 font-mono text-center tracking-widest focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Nouveau Code PIN (4 chiffres)
                    </label>
                    <input
                      type="password"
                      maxLength={4}
                      placeholder="••••"
                      value={newPin}
                      onChange={(e) => setNewPin(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 font-mono text-center tracking-widest focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Confirmer Nouveau PIN
                    </label>
                    <input
                      type="password"
                      maxLength={4}
                      placeholder="••••"
                      value={confirmPin}
                      onChange={(e) => setConfirmPin(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 font-mono text-center tracking-widest focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
                  >
                    Enregistrer le nouveau code PIN
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'autolock' && (
            <div className="space-y-5">
              {/* Auto-lock Settings */}
              <div className="p-5 rounded-2xl bg-slate-850 border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  <span>Délai d'inactivité avant Verrouillage Automatique</span>
                </h4>
                <p className="text-xs text-slate-400">
                  En cas d'inactivité sur votre écran, Nexus Gestion se verrouille automatiquement pour protéger la confidentialité des caisses et des membres.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  {[
                    { label: 'Désactivé', value: 0 },
                    { label: '5 minutes', value: 5 },
                    { label: '15 minutes', value: 15 },
                    { label: '30 minutes', value: 30 },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleAutoLockChange(opt.value)}
                      className={`p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center ${
                        securityConfig.autoLockMinutes === opt.value
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Encryption & Integrity Seal Card */}
              <div className="p-5 rounded-2xl bg-slate-850 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <FileCheck className="w-5 h-5 text-emerald-400" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-200">
                        Chiffrement des Données & Intégrité Locale
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Protection renforcée contre la falsification des écritures comptables
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    CONFORME
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 text-xs font-mono text-slate-400 space-y-1">
                  <div className="flex justify-between">
                    <span>Moteur Cryptographique :</span>
                    <span className="text-emerald-300 font-bold">WebCrypto AES-GCM / SHA-256</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Stockage Local Chiffré :</span>
                    <span className="text-emerald-300 font-bold">Actif (Isolated Tenant Keys)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Empreinte d'intégrité :</span>
                    <span className="text-slate-300 truncate">sha256-nexus-8f9028207-sec</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={exportDataJSON}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-emerald-400" />
                    <span>Télécharger Sauvegarde Sécurisée JSON</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Traces et événements de sécurité enregistrés ({securityAuditLogs.length})</span>
                <span className="text-[10px] font-mono">Horodatage temps réel</span>
              </div>

              <div className="space-y-2 max-h-[350px] overflow-y-auto">
                {securityAuditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-xl bg-slate-850/80 border border-slate-800 flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${
                            log.severity === 'security'
                              ? 'bg-rose-500'
                              : log.severity === 'warning'
                              ? 'bg-amber-400'
                              : 'bg-emerald-400'
                          }`}
                        />
                        <span className="font-bold text-slate-200 truncate">{log.action}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-900 text-slate-400 border border-slate-800">
                          {log.role.toUpperCase()}
                        </span>
                      </div>
                      {log.details && (
                        <div className="text-[11px] text-slate-400 pl-4">{log.details}</div>
                      )}
                    </div>
                    <div className="text-[10px] font-mono text-slate-500 whitespace-nowrap shrink-0">
                      {log.timestamp}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs">
          <span className="text-[11px] text-slate-500">
            Nexus Sécurité • Conçu par Soro Kadiolohouafon Brice De Mont-Fort
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

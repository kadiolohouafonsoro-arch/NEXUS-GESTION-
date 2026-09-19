import React, { useState, useEffect } from 'react';
import {
  Lock,
  Unlock,
  ShieldCheck,
  AlertTriangle,
  KeyRound,
  Eye,
  EyeOff,
  Phone,
  Mail,
  RotateCcw,
  CheckCircle2,
  X,
  Clock,
  ShieldAlert,
  FileKey,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface SecurityLockModalProps {
  isOpen: boolean;
  onUnlockSuccess: () => void;
}

export const SecurityLockModal: React.FC<SecurityLockModalProps> = ({
  isOpen,
  onUnlockSuccess,
}) => {
  const {
    securityConfig,
    unlockAppWithPin,
    settings,
    currentTenant,
  } = useApp();

  const [pinInput, setPinInput] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showPin, setShowPin] = useState(false);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPinInput('');
      setErrorMsg(null);
    }
  }, [isOpen]);

  // Handle keyboard inputs
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        if (pinInput.length < 4) {
          setPinInput((prev) => prev + e.key);
        }
      } else if (e.key === 'Backspace') {
        setPinInput((prev) => prev.slice(0, -1));
      } else if (e.key === 'Enter') {
        if (pinInput.length === 4) {
          handleAttemptUnlock(pinInput);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, pinInput]);

  // Auto-submit when 4 digits are entered
  useEffect(() => {
    if (pinInput.length === 4) {
      handleAttemptUnlock(pinInput);
    }
  }, [pinInput]);

  const handleAttemptUnlock = (pin: string) => {
    const success = unlockAppWithPin(pin);
    if (success) {
      setErrorMsg(null);
      setPinInput('');
      onUnlockSuccess();
    } else {
      setErrorMsg('Code PIN incorrect. Veuillez réessayer.');
      setShake(true);
      setTimeout(() => {
        setShake(false);
        setPinInput('');
      }, 500);
    }
  };

  const handleNumpadPress = (digit: string) => {
    if (pinInput.length < 4) {
      setPinInput((prev) => prev + digit);
    }
  };

  const handleBackspace = () => {
    setPinInput((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setPinInput('');
    setErrorMsg(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-4 select-none">
      <div
        className={`w-full max-w-sm bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/80 flex flex-col items-center text-center transition-all ${
          shake ? 'animate-shake' : ''
        }`}
      >
        {/* Lock icon with glowing shield */}
        <div className="relative mb-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-950/50">
            <Lock className="w-8 h-8 text-emerald-400" />
          </div>
          <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-slate-900 border border-slate-700">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
        </div>

        {/* Title & App Info */}
        <h2 className="text-xl font-black text-slate-100 tracking-tight">
          Nexus Gestion Verrouillé
        </h2>
        <p className="text-xs text-slate-400 mt-1 max-w-xs">
          Entrez le code PIN administrateur pour accéder aux modules et données de{' '}
          <span className="text-slate-200 font-semibold">
            {currentTenant?.name || settings.name}
          </span>
          .
        </p>

        {/* 4-digit PIN visualization dots */}
        <div className="flex items-center justify-center gap-3 my-6">
          {[0, 1, 2, 3].map((index) => {
            const hasDigit = pinInput.length > index;
            return (
              <div
                key={index}
                className={`w-4 h-4 rounded-full transition-all duration-200 ${
                  hasDigit
                    ? 'bg-emerald-400 scale-110 shadow-sm shadow-emerald-400/50'
                    : 'bg-slate-800 border-2 border-slate-700'
                }`}
              />
            );
          })}
        </div>

        {/* Optional text pin preview with toggle */}
        <div className="flex items-center gap-2 mb-4 text-xs text-slate-500 font-mono">
          <span>{showPin ? pinInput || '----' : '••••'}</span>
          <button
            type="button"
            onClick={() => setShowPin(!showPin)}
            className="text-slate-400 hover:text-slate-200 cursor-pointer"
            title={showPin ? 'Masquer' : 'Afficher'}
          >
            {showPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="w-full mb-4 p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center justify-center gap-2 animate-in fade-in">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Interactive Numpad */}
        <div className="grid grid-cols-3 gap-2.5 w-full max-w-[240px] mb-4">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleNumpadPress(digit)}
              className="h-12 rounded-xl bg-slate-800/80 hover:bg-slate-750 active:bg-emerald-600 active:text-white border border-slate-700/80 text-slate-100 text-lg font-bold transition-all shadow-sm cursor-pointer flex items-center justify-center"
            >
              {digit}
            </button>
          ))}
          <button
            type="button"
            onClick={handleClear}
            className="h-12 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-400 text-xs font-bold transition-colors cursor-pointer flex items-center justify-center"
          >
            Effacer
          </button>
          <button
            type="button"
            onClick={() => handleNumpadPress('0')}
            className="h-12 rounded-xl bg-slate-800/80 hover:bg-slate-750 active:bg-emerald-600 active:text-white border border-slate-700/80 text-slate-100 text-lg font-bold transition-all shadow-sm cursor-pointer flex items-center justify-center"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleBackspace}
            className="h-12 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer flex items-center justify-center"
            title="Supprimer dernier chiffre"
          >
            ←
          </button>
        </div>

        {/* Quick hint & Default PIN notice */}
        <div className="w-full bg-slate-800/60 rounded-xl p-2.5 border border-slate-700/50 text-[11px] text-slate-400 space-y-1">
          <div className="flex items-center justify-center gap-1.5 text-emerald-400 font-semibold">
            <KeyRound className="w-3.5 h-3.5" />
            <span>Code PIN initial par défaut : <strong className="font-mono text-emerald-300">1234</strong></span>
          </div>
          <p className="text-[10px] text-slate-500">
            Vous pouvez modifier ce code à tout moment dans l'onglet Paramètres &gt; Sécurité.
          </p>
        </div>

        {/* Developer Contact Footer for Emergency Recovery */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 w-full text-center">
          <span className="text-[10px] text-slate-500 block">
            Développeur agréé : Soro Kadiolohouafon Brice De Mont-Fort
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            Assistance : 07 89 02 82 07
          </span>
        </div>
      </div>
    </div>
  );
};

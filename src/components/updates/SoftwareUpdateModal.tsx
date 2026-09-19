import React, { useState } from 'react';
import {
  DownloadCloud,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  FileCode,
  Upload,
  Clock,
  ArrowRight,
  RefreshCw,
  X,
  Layers,
  Database,
  Check,
  Cpu,
  History,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';
import { SoftwareUpdateRelease } from '../../types';

interface SoftwareUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SoftwareUpdateModal: React.FC<SoftwareUpdateModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    softwareUpdateState,
    checkForUpdates,
    applySoftwareUpdate,
    rollbackSoftwareUpdate,
    exportDataJSON,
    showToast,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'available' | 'manual' | 'history'>('available');
  const [manualFileContent, setManualFileContent] = useState<string | null>(null);
  const [manualFileName, setManualFileName] = useState<string | null>(null);
  const [manualFileError, setManualFileError] = useState<string | null>(null);

  if (!isOpen) return null;

  const {
    currentVersion,
    latestVersion,
    lastCheckedDate,
    isChecking,
    isUpdating,
    updateProgress,
    availableUpdate,
    history,
  } = softwareUpdateState;

  const isUpToDate = currentVersion === latestVersion;

  const handleStartUpdate = async () => {
    // 1. Trigger export backup notification
    showToast('Sauvegarde automatique de pré-mise à jour en cours...', 'info');
    
    // 2. Apply update
    const success = await applySoftwareUpdate();
    if (success) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#10b981', '#38bdf8', '#fbbf24'],
      });
      showToast('Mise à jour v2.5.0 appliquée avec succès !', 'success');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setManualFileName(file.name);
    setManualFileError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        if (!parsed.version && !parsed.name) {
          setManualFileError('Format de fichier invalide : manifest de version requis');
          return;
        }
        setManualFileContent(text);
      } catch (err) {
        setManualFileError('Erreur de lecture du fichier JSON/Patch.');
      }
    };
    reader.readAsText(file);
  };

  const handleApplyManualPatch = async () => {
    if (!manualFileContent) return;
    try {
      const parsed = JSON.parse(manualFileContent);
      await applySoftwareUpdate(parsed);
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      showToast(`Correctif ${parsed.version || 'manuel'} installé avec succès !`, 'success');
      setManualFileContent(null);
      setManualFileName(null);
    } catch (e) {
      setManualFileError('Impossible d\'appliquer ce correctif.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-emerald-950/40 p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 shadow-md">
              <DownloadCloud className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-100 tracking-tight">
                  Centre de Mises à Jour & Maintenance
                </h2>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-800 text-emerald-400 border border-slate-700">
                  Nexus Gestion
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Version actuelle : <strong className="font-mono text-slate-200">{currentVersion}</strong> • Canal Stable
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

        {/* Sub-tabs header */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-800 bg-slate-900/60">
          <button
            type="button"
            onClick={() => setActiveSubTab('available')}
            className={`pb-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'available'
                ? 'border-emerald-400 text-emerald-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <DownloadCloud className="w-3.5 h-3.5" />
            <span>Mises à Jour en Ligne</span>
            {!isUpToDate && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('manual')}
            className={`pb-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'manual'
                ? 'border-emerald-400 text-emerald-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Téléverser un Patch (.json)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('history')}
            className={`pb-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'history'
                ? 'border-emerald-400 text-emerald-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Historique & Sauvegardes</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
          {activeSubTab === 'available' && (
            <div className="space-y-5">
              {/* Check Status Card */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-850/80 border border-slate-700/80">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      État du Système
                    </span>
                    {isUpToDate ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        À jour
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        Nouvelle version disponible !
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Dernière vérification automatique : {lastCheckedDate}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={checkForUpdates}
                  disabled={isChecking || isUpdating}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-750 active:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shrink-0"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isChecking ? 'animate-spin' : ''}`} />
                  <span>{isChecking ? 'Recherche en cours...' : 'Vérifier maintenant'}</span>
                </button>
              </div>

              {/* In Progress Update Bar */}
              {isUpdating && (
                <div className="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-300 flex items-center gap-2">
                      <Cpu className="w-4 h-4 animate-spin text-emerald-400" />
                      Application de la mise à jour {availableUpdate?.version}...
                    </span>
                    <span className="font-mono font-bold text-emerald-400">
                      {updateProgress}%
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
                      style={{ width: `${updateProgress}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Vérification d'intégrité, migration des structures de données et intégration des nouveaux modules.
                  </p>
                </div>
              )}

              {/* Available Update Details */}
              {!isUpToDate && availableUpdate && !isUpdating && (
                <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-850 to-slate-900 border border-emerald-500/40 shadow-xl space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-black px-2 py-0.5 rounded-md bg-emerald-500 text-slate-950">
                          {availableUpdate.version}
                        </span>
                        <span className="text-sm font-bold text-slate-100">
                          {availableUpdate.title}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        Publiée le {availableUpdate.releaseDate} • Poids : {availableUpdate.downloadSize}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleStartUpdate}
                      className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-xl text-xs font-black transition-all shadow-lg shadow-emerald-600/30 cursor-pointer shrink-0"
                    >
                      <DownloadCloud className="w-4 h-4" />
                      <span>Installer la mise à jour</span>
                    </button>
                  </div>

                  <p className="text-xs text-slate-300 font-medium bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                    {availableUpdate.summary}
                  </p>

                  {/* Changelog list */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      Nouveautés & Améliorations de cette version :
                    </h4>
                    <ul className="space-y-2">
                      {availableUpdate.changelog.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Une sauvegarde automatique de sécurité est réalisée avant l'installation.</span>
                  </div>
                </div>
              )}

              {/* System Already Up To Date Message */}
              {isUpToDate && !isUpdating && (
                <div className="p-8 rounded-2xl bg-slate-850/60 border border-slate-800 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-400 mx-auto flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-200">
                    Votre logiciel Nexus Gestion est parfaitement à jour
                  </h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Vous profitez de la version la plus stable et sécurisée (<strong className="text-slate-200">{currentVersion}</strong>) avec le module Excel en bas de page et le chiffrement des données.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeSubTab === 'manual' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-850 border border-slate-800">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Installation Manuelle d'un Patch ou Script de Mise à Jour
                </h3>
                <p className="text-xs text-slate-400">
                  Cette option permet d'installer directement un fichier de mise à jour (<code className="text-emerald-300">.json</code> ou <code className="text-emerald-300">.nexus-patch</code>) fourni par le développeur.
                </p>
              </div>

              {/* Upload Dropzone */}
              <div className="border-2 border-dashed border-slate-700 hover:border-emerald-500/60 rounded-2xl p-6 text-center transition-all bg-slate-900/60">
                <input
                  type="file"
                  id="patch-file-input"
                  accept=".json,.nexus-patch"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <label
                  htmlFor="patch-file-input"
                  className="cursor-pointer flex flex-col items-center justify-center gap-2"
                >
                  <div className="w-12 h-12 rounded-xl bg-slate-800 text-emerald-400 flex items-center justify-center">
                    <Upload className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-slate-200">
                    {manualFileName ? `Fichier sélectionné : ${manualFileName}` : 'Cliquez pour sélectionner un fichier de mise à jour'}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Formats acceptés : .json, .nexus-patch
                  </span>
                </label>
              </div>

              {manualFileError && (
                <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{manualFileError}</span>
                </div>
              )}

              {manualFileContent && (
                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={handleApplyManualPatch}
                    className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-lg shadow-emerald-600/30"
                  >
                    <DownloadCloud className="w-4 h-4" />
                    <span>Appliquer ce correctif maintenant</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {activeSubTab === 'history' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Historique des Versions Installées
                  </h3>
                  <p className="text-xs text-slate-400">
                    Vous pouvez restaurer une version précédente en cas de besoin.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={exportDataJSON}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Télécharger Sauvegarde Complète
                </button>
              </div>

              <div className="space-y-2.5">
                {history.map((h, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-xl bg-slate-850/80 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-emerald-400">{h.version}</span>
                        <span className="text-slate-300 font-semibold">{h.notes}</span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Installée le : {h.installedAt}
                      </div>
                    </div>

                    {h.version !== currentVersion && (
                      <button
                        type="button"
                        onClick={rollbackSoftwareUpdate}
                        className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-rose-950/40 text-slate-300 hover:text-rose-300 border border-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Restaurer</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-slate-400 text-[11px]">
            Support & Maintenance Développeur : <strong className="text-slate-200">Soro Kadiolohouafon Brice De Mont-Fort</strong> • 07 89 02 82 07
          </div>
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

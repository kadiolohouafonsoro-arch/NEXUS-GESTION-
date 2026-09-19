import React from 'react';
import {
  Keyboard,
  X,
  FileText,
  FolderPlus,
  UserPlus,
  FileSpreadsheet,
  Search,
  LayoutDashboard,
  CalendarDays,
  Users,
  Wallet,
  Settings,
  CornerDownLeft,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerAction?: (actionName: string) => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
  onTriggerAction,
}) => {
  if (!isOpen) return null;

  const creationShortcuts = [
    {
      label: 'Nouvelle facture',
      description: 'Ouvrir le formulaire d’émission de facture',
      keys: ['Ctrl', 'N'],
      altKeys: ['Alt', 'N'],
      icon: FileText,
      color: 'text-indigo-400',
      actionKey: 'create_invoice',
    },
    {
      label: 'Nouveau projet',
      description: 'Lancer un nouveau projet ou chantier',
      keys: ['Ctrl', 'P'],
      altKeys: ['Alt', 'P'],
      icon: FolderPlus,
      color: 'text-emerald-400',
      actionKey: 'create_project',
    },
    {
      label: 'Nouveau client / membre',
      description: 'Créer une nouvelle fiche partenaire',
      keys: ['Alt', 'C'],
      altKeys: ['Ctrl', 'Shift', 'C'],
      icon: UserPlus,
      color: 'text-sky-400',
      actionKey: 'create_client',
    },
    {
      label: 'Nouveau devis',
      description: 'Établir une proposition tarifaire',
      keys: ['Alt', 'D'],
      altKeys: ['Ctrl', 'Shift', 'D'],
      icon: FileSpreadsheet,
      color: 'text-amber-400',
      actionKey: 'create_quote',
    },
  ];

  const navigationShortcuts = [
    {
      label: 'Tableau de bord',
      keys: ['Alt', '1'],
      icon: LayoutDashboard,
      actionKey: 'tab_dashboard',
    },
    {
      label: 'Factures & Devis',
      keys: ['Alt', '2'],
      icon: FileText,
      actionKey: 'tab_invoices',
    },
    {
      label: 'Projets & Tâches',
      keys: ['Alt', '3'],
      icon: FolderPlus,
      actionKey: 'tab_projects',
    },
    {
      label: 'Calendrier & Tours',
      keys: ['Alt', '4'],
      icon: CalendarDays,
      actionKey: 'tab_tours',
    },
    {
      label: 'Clients & Membres',
      keys: ['Alt', '5'],
      icon: Users,
      actionKey: 'tab_clients',
    },
    {
      label: 'Trésorerie & Caisses',
      keys: ['Alt', '6'],
      icon: Wallet,
      actionKey: 'tab_treasury',
    },
    {
      label: 'Paramètres généraux',
      keys: ['Alt', '7'],
      icon: Settings,
      actionKey: 'tab_settings',
    },
  ];

  const toolsShortcuts = [
    {
      label: 'Recherche globale',
      description: 'Placer le curseur sur la barre de recherche',
      keys: ['Ctrl', 'K'],
      altKeys: ['/'],
      icon: Search,
      actionKey: 'focus_search',
    },
    {
      label: 'Guide des raccourcis',
      description: 'Ouvrir ou fermer cette fenêtre d’aide',
      keys: ['?'],
      altKeys: ['Ctrl', '/'],
      icon: Keyboard,
      actionKey: 'open_shortcuts',
    },
    {
      label: 'Fermer / Annuler',
      description: 'Fermer la modale active ou désélectionner',
      keys: ['Échap'],
      icon: CornerDownLeft,
      actionKey: 'close_modal',
    },
  ];

  const handleItemClick = (actionKey: string) => {
    if (onTriggerAction) {
      onTriggerAction(actionKey);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-750 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-850">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-100">Raccourcis Clavier Globaux</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Nexus Flow
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Accélérez vos opérations courantes sans toucher à la souris
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            title="Fermer (Échap)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Section 1: Creation */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Création Rapide d'Éléments
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {creationShortcuts.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    onClick={() => handleItemClick(item.actionKey)}
                    className="p-3 bg-slate-850 hover:bg-slate-800/90 border border-slate-750/70 hover:border-indigo-500/40 rounded-xl transition-all flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-slate-900 border border-slate-750 ${item.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-slate-200 group-hover:text-indigo-300 transition-colors">
                          {item.label}
                        </div>
                        <div className="text-[11px] text-slate-400 hidden sm:block">
                          {item.description}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      <kbd className="px-2 py-1 bg-slate-900 border border-slate-700 rounded-md text-[11px] font-mono font-bold text-slate-300 shadow-sm">
                        {item.keys.join(' + ')}
                      </kbd>
                      {item.altKeys && (
                        <span className="text-[10px] text-slate-500 hidden xl:inline">
                          / {item.altKeys.join('+')}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Tab Navigation */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <ArrowRight className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Navigation entre les Espaces
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {navigationShortcuts.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    onClick={() => handleItemClick(item.actionKey)}
                    className="p-2.5 bg-slate-850 hover:bg-slate-800 border border-slate-750/70 hover:border-emerald-500/40 rounded-xl transition-all flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-400 transition-colors" />
                      <span className="text-xs text-slate-300 group-hover:text-slate-100 font-medium">
                        {item.label}
                      </span>
                    </div>
                    <kbd className="px-1.5 py-0.5 bg-slate-900 border border-slate-700 rounded text-[10px] font-mono font-bold text-slate-300">
                      {item.keys.join('+')}
                    </kbd>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 3: Tools & Search */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Search className="w-4 h-4 text-sky-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Recherche & Outils Globaux
              </h3>
            </div>
            <div className="space-y-2">
              {toolsShortcuts.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    onClick={() => handleItemClick(item.actionKey)}
                    className="p-3 bg-slate-850 hover:bg-slate-800 border border-slate-750/70 hover:border-sky-500/40 rounded-xl transition-all flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 text-sky-400" />
                      <div>
                        <div className="text-xs font-semibold text-slate-200 group-hover:text-sky-300 transition-colors">
                          {item.label}
                        </div>
                        <div className="text-[11px] text-slate-400">{item.description}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <kbd className="px-2 py-1 bg-slate-900 border border-slate-700 rounded-md text-[11px] font-mono font-bold text-slate-300">
                        {item.keys.join(' + ')}
                      </kbd>
                      {item.altKeys && (
                        <>
                          <span className="text-xs text-slate-500">ou</span>
                          <kbd className="px-2 py-1 bg-slate-900 border border-slate-700 rounded-md text-[11px] font-mono font-bold text-slate-300">
                            {item.altKeys.join(' + ')}
                          </kbd>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer tip */}
        <div className="px-6 py-3 bg-slate-850 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>
            💡 Astuce : Sur Mac, remplacez <kbd className="px-1 bg-slate-800 rounded font-mono text-slate-300">Ctrl</kbd> par <kbd className="px-1 bg-slate-800 rounded font-mono text-slate-300">⌘ Cmd</kbd>.
          </span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 rounded-lg text-xs font-medium transition-colors cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

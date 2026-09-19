import { useEffect } from 'react';

export interface ShortcutActions {
  onCreateInvoice?: () => void;
  onCreateProject?: () => void;
  onCreateClient?: () => void;
  onCreateQuote?: () => void;
  onFocusSearch?: () => void;
  onNavigateTab?: (tab: string) => void;
  onOpenShortcutsHelp?: () => void;
  onToggleShortcutsModal?: () => void;
  onCloseModals?: () => void;
  onCloseModal?: () => void;
  isAnyModalOpen?: boolean;
  isModalOpen?: boolean;
}

export const useKeyboardShortcuts = ({
  onCreateInvoice,
  onCreateProject,
  onCreateClient,
  onCreateQuote,
  onFocusSearch,
  onNavigateTab,
  onOpenShortcutsHelp,
  onToggleShortcutsModal,
  onCloseModals,
  onCloseModal,
  isAnyModalOpen,
  isModalOpen,
}: ShortcutActions) => {
  const triggerHelp = onOpenShortcutsHelp || onToggleShortcutsModal;
  const triggerClose = onCloseModals || onCloseModal;
  const hasModalOpen = Boolean(isAnyModalOpen || isModalOpen);
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;
      const isAlt = e.altKey;
      const key = e.key.toLowerCase();

      // Check if user is typing in a text field
      const activeEl = document.activeElement;
      const isTyping =
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          activeEl.tagName === 'SELECT' ||
          (activeEl as HTMLElement).isContentEditable);

      // Escape key: close active modal or blur input
      if (e.key === 'Escape') {
        if (isTyping) {
          (activeEl as HTMLElement).blur();
        }
        if (triggerClose) {
          triggerClose();
        }
        return;
      }

      // Single-character shortcuts when NOT typing in an input
      if (!isTyping && !isCtrlOrCmd && !isAlt) {
        // '?' -> Open keyboard shortcuts guide
        if (e.key === '?' || (e.shiftKey && e.key === '/')) {
          e.preventDefault();
          triggerHelp?.();
          return;
        }

        // '/' -> Focus global search
        if (e.key === '/') {
          e.preventDefault();
          onFocusSearch?.();
          return;
        }
      }

      // Help modal with Ctrl+/ or Cmd+/
      if (isCtrlOrCmd && (e.key === '/' || key === '/')) {
        e.preventDefault();
        triggerHelp?.();
        return;
      }

      // Quick Search: Ctrl+K or Cmd+K
      if (isCtrlOrCmd && (key === 'k' || e.code === 'KeyK')) {
        e.preventDefault();
        onFocusSearch?.();
        return;
      }

      // Quick Create Invoice: Ctrl+N or Cmd+N or Alt+N
      if ((isCtrlOrCmd || isAlt) && (key === 'n' || e.code === 'KeyN') && !e.shiftKey) {
        e.preventDefault();
        onCreateInvoice?.();
        return;
      }

      // Quick Create Project: Ctrl+P or Cmd+P or Alt+P
      if ((isCtrlOrCmd || isAlt) && (key === 'p' || e.code === 'KeyP')) {
        e.preventDefault();
        onCreateProject?.();
        return;
      }

      // Quick Create Client: Alt+C or (Ctrl+Shift+C / Cmd+Shift+C)
      if (
        (isAlt && (key === 'c' || e.code === 'KeyC')) ||
        (isCtrlOrCmd && e.shiftKey && (key === 'c' || e.code === 'KeyC'))
      ) {
        e.preventDefault();
        onCreateClient?.();
        return;
      }

      // Quick Create Quote: Alt+D or (Ctrl+Shift+D / Cmd+Shift+D)
      if (
        (isAlt && (key === 'd' || e.code === 'KeyD')) ||
        (isCtrlOrCmd && e.shiftKey && (key === 'd' || e.code === 'KeyD'))
      ) {
        e.preventDefault();
        onCreateQuote?.();
        return;
      }

      // Tab Navigation with Alt + [1-7] or (Ctrl + Shift + [1-7])
      if (isAlt || (isCtrlOrCmd && e.shiftKey)) {
        const keyDigit = e.key.match(/^[1-7]$/) ? e.key : e.code.replace('Digit', '');
        const tabMap: Record<string, string> = {
          '1': 'dashboard',
          '2': 'invoices',
          '3': 'projects',
          '4': 'tours',
          '5': 'clients',
          '6': 'treasury',
          '7': 'settings',
        };

        if (tabMap[keyDigit]) {
          e.preventDefault();
          onNavigateTab?.(tabMap[keyDigit]);
          return;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    onCreateInvoice,
    onCreateProject,
    onCreateClient,
    onCreateQuote,
    onFocusSearch,
    onNavigateTab,
    onOpenShortcutsHelp,
    onCloseModals,
    isAnyModalOpen,
  ]);
};

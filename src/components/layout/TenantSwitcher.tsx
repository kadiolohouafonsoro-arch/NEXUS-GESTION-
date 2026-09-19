import React, { useState, useRef, useEffect } from 'react';
import {
  Building2,
  ChevronDown,
  Plus,
  Check,
  ShieldCheck,
  Coins,
  Users2,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AssociationTenant } from '../../types';

interface TenantSwitcherProps {
  onOpenNewTenantModal: () => void;
  variant?: 'navbar' | 'sidebar';
}

export const TenantSwitcher: React.FC<TenantSwitcherProps> = ({
  onOpenNewTenantModal,
  variant = 'navbar',
}) => {
  const { tenants, currentTenantId, currentTenant, switchTenant, clients } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getTypeBadge = (type: AssociationTenant['type']) => {
    switch (type) {
      case 'mutuelle':
        return { label: 'Mutuelle', bg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' };
      case 'tontine':
        return { label: 'Tontine', bg: 'bg-teal-500/15 text-teal-300 border-teal-500/30' };
      case 'association':
      default:
        return { label: 'Association', bg: 'bg-green-500/15 text-green-300 border-green-500/30' };
    }
  };

  const currentBadge = getTypeBadge(currentTenant?.type || 'mutuelle');
  const activeMembers = clients.filter((c) => c.status === 'active' || (c as any).memberStatus === 'active').length;

  if (variant === 'sidebar') {
    return (
      <div className="relative w-full" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-emerald-500/30 hover:border-emerald-500/50 transition-all text-left group cursor-pointer shadow-sm"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${currentTenant?.color || 'from-emerald-600 to-teal-700'} flex items-center justify-center text-white font-black text-xs shadow-md shrink-0`}>
              {currentTenant?.acronym || 'NX'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-slate-200 truncate group-hover:text-white">
                {currentTenant?.name || 'Association'}
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold border ${currentBadge.bg}`}>
                  {currentBadge.label}
                </span>
                <span className="text-emerald-400 font-bold">5 000 F/m</span>
              </div>
            </div>
          </div>
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''} shrink-0`} />
        </button>

        {isOpen && (
          <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-slate-850 border border-emerald-500/30 rounded-xl shadow-2xl overflow-hidden py-1">
            <div className="px-3 py-1.5 text-[10px] font-bold text-emerald-400 uppercase tracking-wider border-b border-slate-800 flex items-center justify-between">
              <span>Espaces Associations (5 000 F/m)</span>
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
            </div>

            <div className="max-h-60 overflow-y-auto divide-y divide-slate-800/50">
              {tenants.map((tenant) => {
                const badge = getTypeBadge(tenant.type);
                const isCurrent = tenant.id === currentTenantId;

                return (
                  <button
                    key={tenant.id}
                    onClick={() => {
                      switchTenant(tenant.id);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-left transition-colors cursor-pointer ${
                      isCurrent ? 'bg-emerald-600/15 text-emerald-200' : 'hover:bg-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`w-6 h-6 rounded-md bg-gradient-to-br ${tenant.color} flex items-center justify-center text-white font-bold text-[10px] shrink-0`}>
                        {tenant.acronym}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold truncate">{tenant.name}</div>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                          <span className={`px-1 rounded text-[8px] font-semibold border ${badge.bg}`}>
                            {badge.label}
                          </span>
                          <span className="text-emerald-400 text-[9px] font-bold">5 000 F/m • Actif</span>
                        </div>
                      </div>
                    </div>
                    {isCurrent && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 ml-1" />}
                  </button>
                );
              })}
            </div>

            <div className="p-1 border-t border-slate-800">
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenNewTenantModal();
                }}
                className="w-full flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-emerald-400 hover:text-emerald-300 hover:bg-emerald-600/10 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Nouvel Espace Association (5 000 F/m)</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Navbar variant
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-800 border border-emerald-500/30 hover:border-emerald-500/50 transition-all text-left cursor-pointer shadow-sm"
        title="Changer d'association / tontine"
      >
        <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-gradient-to-br ${currentTenant?.color || 'from-emerald-600 to-teal-700'} flex items-center justify-center text-white font-black text-[10px] sm:text-xs shadow shrink-0`}>
          {currentTenant?.acronym || 'NX'}
        </div>
        <div className="hidden sm:block text-left">
          <div className="text-xs font-bold text-slate-100 max-w-[150px] md:max-w-[200px] truncate leading-tight">
            {currentTenant?.name || 'Nexus Association'}
          </div>
          <div className="flex items-center gap-1.5 text-[9px] text-slate-400">
            <span className={`px-1 py-0.2 rounded font-bold border ${currentBadge.bg}`}>
              {currentBadge.label}
            </span>
            <span className="text-emerald-400 font-bold">• 5 000 F/m</span>
          </div>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 sm:left-0 top-full mt-2 w-72 sm:w-84 z-50 bg-slate-850 border border-emerald-500/30 rounded-2xl shadow-2xl overflow-hidden py-1.5 backdrop-blur-md">
          <div className="px-3.5 py-2 border-b border-slate-800 flex items-center justify-between">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Espaces Associations (5 000 FCFA / mois)</span>
            </span>
            <span className="text-[10px] bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded font-mono">
              SaaS Actif
            </span>
          </div>

          <div className="max-h-64 overflow-y-auto divide-y divide-slate-800/40">
            {tenants.map((tenant) => {
              const badge = getTypeBadge(tenant.type);
              const isCurrent = tenant.id === currentTenantId;

              return (
                <button
                  key={tenant.id}
                  onClick={() => {
                    switchTenant(tenant.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 text-left transition-colors cursor-pointer ${
                    isCurrent
                      ? 'bg-emerald-600/15 text-emerald-200'
                      : 'hover:bg-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${tenant.color} flex items-center justify-center text-white font-bold text-xs shrink-0 shadow`}>
                      {tenant.acronym}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold truncate text-slate-100">{tenant.name}</div>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                        <span className={`px-1.5 py-0.2 rounded text-[8px] font-semibold border ${badge.bg}`}>
                          {badge.label}
                        </span>
                        <span className="text-emerald-400 font-bold text-[10px]">
                          5 000 F/mois
                        </span>
                      </div>
                    </div>
                  </div>
                  {isCurrent && (
                    <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-bold shrink-0 ml-2">
                      <Check className="w-4 h-4" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="p-2 border-t border-slate-800 bg-slate-900/50">
            <button
              onClick={() => {
                setIsOpen(false);
                onOpenNewTenantModal();
              }}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Inscrire une nouvelle association (5 000 F/mois)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

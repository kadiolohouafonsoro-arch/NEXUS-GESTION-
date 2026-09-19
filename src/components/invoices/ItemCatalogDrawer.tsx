import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Package,
  Layers,
  Plus,
  Check,
  Search,
  BookOpen,
  ArrowRight,
  Info,
} from 'lucide-react';
import {
  CATALOG_CATEGORIES,
  PREDEFINED_CATALOG,
  ITEM_PACKAGES,
  CatalogItem,
  ItemPackage,
  generateItemsFromPackage,
} from '../../utils/itemGenerator';
import { InvoiceItem } from '../../types';
import { useApp } from '../../context/AppContext';

interface ItemCatalogDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSingleItem: (item: CatalogItem) => void;
  onApplyPackage: (items: InvoiceItem[], mode: 'append' | 'replace') => void;
}

export const ItemCatalogDrawer: React.FC<ItemCatalogDrawerProps> = ({
  isOpen,
  onClose,
  onAddSingleItem,
  onApplyPackage,
}) => {
  const { formatMoney } = useApp();
  const [activeTab, setActiveTab] = useState<'packages' | 'catalog'>('packages');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tous les articles');
  const [searchQuery, setSearchQuery] = useState('');
  const [recentlyAddedId, setRecentlyAddedId] = useState<string | null>(null);
  const [packageMode, setPackageMode] = useState<'append' | 'replace'>('append');

  if (!isOpen) return null;

  // Filtrage du catalogue
  const filteredCatalog = PREDEFINED_CATALOG.filter((item) => {
    const matchCategory =
      selectedCategory === 'Tous les articles' || item.category === selectedCategory;
    const matchSearch =
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const handleAddSingle = (item: CatalogItem) => {
    onAddSingleItem(item);
    setRecentlyAddedId(item.id);
    setTimeout(() => {
      setRecentlyAddedId(null);
    }, 1500);
  };

  const handleSelectPackage = (pkg: ItemPackage) => {
    const generated = generateItemsFromPackage(pkg);
    onApplyPackage(generated, packageMode);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-60 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-750 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-850">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/40 text-indigo-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">
                Générateur & Catalogue d'articles
              </h2>
              <p className="text-xs text-slate-400">
                Insérez des listes types ou piochez parmi les prestations standard
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-2 px-6 pt-4 border-b border-slate-800 bg-slate-850/50">
          <button
            onClick={() => setActiveTab('packages')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'packages'
                ? 'border-indigo-500 text-indigo-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Packs complets en 1 clic ({ITEM_PACKAGES.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('catalog')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'catalog'
                ? 'border-indigo-500 text-indigo-400 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Catalogue unitaire ({PREDEFINED_CATALOG.length} prestations)</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* TAB 1: PACKAGES */}
          {activeTab === 'packages' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-slate-800/80 rounded-xl border border-slate-700/80">
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <Info className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>Mode d'insertion des articles du pack :</span>
                </div>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="radio"
                      name="pkgMode"
                      value="append"
                      checked={packageMode === 'append'}
                      onChange={() => setPackageMode('append')}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Ajouter aux lignes existantes</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer ml-3">
                    <input
                      type="radio"
                      name="pkgMode"
                      value="replace"
                      checked={packageMode === 'replace'}
                      onChange={() => setPackageMode('replace')}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Remplacer toute la liste</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ITEM_PACKAGES.map((pkg) => {
                  const packTotal = pkg.items.reduce(
                    (s, it) => s + it.quantity * it.unitPrice,
                    0
                  );
                  return (
                    <div
                      key={pkg.id}
                      className="p-4 bg-slate-800/60 hover:bg-slate-800 border border-slate-750 hover:border-indigo-500/50 rounded-2xl flex flex-col justify-between transition-all group"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            {pkg.badge}
                          </span>
                          <span className="text-xs font-mono font-bold text-slate-200">
                            {formatMoney(packTotal)} HT
                          </span>
                        </div>

                        <h3 className="text-sm font-bold text-slate-100 group-hover:text-indigo-300 transition-colors">
                          {pkg.title}
                        </h3>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          {pkg.description}
                        </p>

                        {/* List preview */}
                        <div className="pt-2 border-t border-slate-750/70 space-y-1">
                          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                            Contient {pkg.items.length} lignes d'articles :
                          </span>
                          <ul className="space-y-1">
                            {pkg.items.slice(0, 3).map((it, idx) => (
                              <li
                                key={idx}
                                className="text-[11px] text-slate-300 truncate flex items-center gap-1.5"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                                <span className="truncate">{it.description}</span>
                                <span className="text-slate-500 text-[10px] font-mono shrink-0 ml-auto">
                                  x{it.quantity}
                                </span>
                              </li>
                            ))}
                            {pkg.items.length > 3 && (
                              <li className="text-[10px] text-slate-500 italic pl-3">
                                + {pkg.items.length - 3} autres prestations...
                              </li>
                            )}
                          </ul>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleSelectPackage(pkg)}
                        className="mt-4 w-full flex items-center justify-center gap-2 py-2 px-3 bg-indigo-600/80 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Générer cette liste d'articles</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: SINGLE CATALOG */}
          {activeTab === 'catalog' && (
            <div className="space-y-4">
              {/* Search & Filter bar */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Rechercher une prestation, du matériel, du conseil..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-500"
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  {CATALOG_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                {filteredCatalog.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 text-xs">
                    Aucun article trouvé dans cette sélection.
                  </div>
                ) : (
                  filteredCatalog.map((item) => {
                    const isAdded = recentlyAddedId === item.id;
                    return (
                      <div
                        key={item.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-slate-800/70 hover:bg-slate-800 border border-slate-750 hover:border-slate-700 rounded-xl transition-all"
                      >
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-750 text-slate-400 border border-slate-700">
                              {item.category}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              Unité : {item.unit}
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-slate-200">
                            {item.description}
                          </p>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                          <span className="text-xs font-bold font-mono text-slate-100">
                            {formatMoney(item.suggestedPrice)} HT
                          </span>
                          <button
                            type="button"
                            onClick={() => handleAddSingle(item)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              isAdded
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-700 hover:bg-indigo-600 text-slate-200 hover:text-white'
                            }`}
                          >
                            {isAdded ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>Ajouté !</span>
                              </>
                            ) : (
                              <>
                                <Plus className="w-3.5 h-3.5" />
                                <span>Ajouter</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-850 flex justify-between items-center text-xs text-slate-400">
          <span>
            {activeTab === 'packages'
              ? 'Sélectionnez un pack pour remplir instantanément la facture'
              : 'Cliquez sur « Ajouter » pour injecter la prestation'}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-750 hover:bg-slate-700 text-slate-200 rounded-lg font-semibold transition-colors cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  FolderKanban,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  LayoutGrid,
  List,
  AlertCircle,
  Calendar,
  ChevronRight,
  ChevronLeft,
  DollarSign,
  User,
  MoreVertical,
  Trash2,
  Edit2,
  GitCompare,
  ListChecks,
  Download,
  Check,
} from 'lucide-react';
import { Project, ProjectStatus } from '../../types';
import { useApp } from '../../context/AppContext';
import { ProjetComparison } from './ProjetComparison';
import { exportProjectsToCSV } from '../../utils/csvExport';

interface ProjectListProps {
  onOpenCreateModal: () => void;
  onOpenProjectDetail: (project: Project) => void;
  onEditProject: (project: Project) => void;
}

export const ProjectList: React.FC<ProjectListProps> = ({
  onOpenCreateModal,
  onOpenProjectDetail,
  onEditProject,
}) => {
  const { projects, updateProject, deleteProject, formatMoney, showToast } = useApp();
  const [viewMode, setViewMode] = useState<'kanban' | 'table' | 'compare'>('kanban');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [compareProjectAId, setCompareProjectAId] = useState<string | undefined>(undefined);
  const [compareProjectBId, setCompareProjectBId] = useState<string | undefined>(undefined);
  const [isExported, setIsExported] = useState(false);

  const handleExportCSV = () => {
    const listToExport = filtered.length > 0 ? filtered : projects;
    if (listToExport.length === 0) {
      showToast?.('Aucun projet ou chantier à exporter.', 'info');
      return;
    }
    exportProjectsToCSV(listToExport);
    setIsExported(true);
    showToast?.(`${listToExport.length} projet(s) exporté(s) avec succès en CSV !`, 'success');
    setTimeout(() => setIsExported(false), 2500);
  };

  const handleStartCompare = (proj?: Project) => {
    if (proj) {
      setCompareProjectAId(proj.id);
      // pick a second project different from proj if available
      const other = projects.find((p) => p.id !== proj.id);
      if (other) setCompareProjectBId(other.id);
    }
    setViewMode('compare');
  };

  const filtered = projects.filter((p) => {
    const matchSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase()) ||
      p.clientName.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === 'all' || p.category === categoryFilter;
    return matchSearch && matchCat;
  });

  // Calculate global task completion metrics across filtered projects
  const totalTasksCount = filtered.reduce((sum, p) => sum + (p.tasks?.length || 0), 0);
  const totalCompletedTasksCount = filtered.reduce(
    (sum, p) => sum + (p.tasks ? p.tasks.filter((t) => t.completed).length : 0),
    0
  );
  const globalTaskCompletionRate =
    totalTasksCount > 0 ? Math.round((totalCompletedTasksCount / totalTasksCount) * 100) : 0;

  const columns: { id: ProjectStatus; title: string; color: string; border: string }[] = [
    { id: 'planned', title: 'Planifié', color: 'text-slate-400', border: 'border-slate-700' },
    { id: 'in_progress', title: 'En cours', color: 'text-indigo-400', border: 'border-indigo-500/50' },
    { id: 'review', title: 'En revue / Recette', color: 'text-amber-400', border: 'border-amber-500/50' },
    { id: 'completed', title: 'Terminé & Livré', color: 'text-emerald-400', border: 'border-emerald-500/50' },
  ];

  const moveProject = (project: Project, direction: 'next' | 'prev') => {
    const order: ProjectStatus[] = ['planned', 'in_progress', 'review', 'completed'];
    const currentIndex = order.indexOf(project.status);
    const nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    if (nextIndex >= 0 && nextIndex < order.length) {
      const newStatus = order[nextIndex];
      updateProject({
        ...project,
        status: newStatus,
        progress: newStatus === 'completed' ? 100 : project.progress,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight flex items-center gap-2.5">
            <FolderKanban className="w-7 h-7 text-indigo-400" />
            <span>Suivi des Projets & Chantiers</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Pilotez vos missions, assignations d'équipes, budgets et jalons de livraison
          </p>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap sm:flex-nowrap">
          {/* View Toggle */}
          <div className="flex items-center bg-slate-850 p-1 rounded-xl border border-slate-750">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'kanban' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Vue Kanban"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'table' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Vue Liste"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('compare')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                viewMode === 'compare' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Comparer deux projets côte à côte"
            >
              <GitCompare className="w-4 h-4" />
              <span className="hidden sm:inline">Comparer</span>
            </button>
          </div>

          {/* Export CSV Button */}
          <button
            onClick={handleExportCSV}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border shadow-sm cursor-pointer ${
              isExported
                ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/40'
                : 'bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white border-slate-700/80 hover:border-slate-600'
            }`}
            title="Exporter la liste des projets en fichier CSV (Excel, tableurs)"
          >
            {isExported ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Exporté !</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline">Export CSV</span>
                <span className="sm:hidden">CSV</span>
                <span className="text-[10px] text-slate-400 font-mono">({filtered.length})</span>
              </>
            )}
          </button>

          <button
            onClick={onOpenCreateModal}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-600/20 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Nouveau Projet</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar (only for Kanban & Table) */}
      {viewMode !== 'compare' && (
        <div className="bg-slate-850 border border-slate-750 rounded-2xl p-4 shadow-lg shadow-black/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher par titre, code ou client..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-slate-400">Catégorie :</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none"
            >
              <option value="all">Toutes les catégories</option>
              <option value="digital">Digital & Informatique</option>
              <option value="consulting">Audit & Conseil</option>
              <option value="construction">BTP & Chantiers</option>
              <option value="mutual">Mutuelle & Tontines</option>
            </select>
          </div>
        </div>
      )}

      {/* Visual Progress Bar: Global Project Completion Based on Completed Tasks */}
      {viewMode !== 'compare' && (
        <div className="bg-slate-850 border border-slate-750 rounded-2xl p-4 sm:p-5 shadow-lg shadow-black/10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                <ListChecks className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-slate-100">
                    Taux d'avancement des projets
                  </h2>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Basé sur les tâches complétées
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Progression globale calculée à partir des tâches exécutées ({totalCompletedTasksCount} sur {totalTasksCount} tâches réalisées)
                </p>
              </div>
            </div>

            <div className="flex items-baseline gap-2 self-start sm:self-auto bg-slate-900 px-3.5 py-2 rounded-xl border border-slate-750">
              <span className="text-xl sm:text-2xl font-black font-mono tracking-tight text-slate-100">
                {globalTaskCompletionRate}%
              </span>
              <span className="text-xs text-slate-400 font-medium">d'avancement</span>
            </div>
          </div>

          {/* Visual Progress Bar Track */}
          <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden p-0.5 border border-slate-700/60 shadow-inner">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                globalTaskCompletionRate === 100
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                  : globalTaskCompletionRate >= 50
                  ? 'bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-400'
                  : globalTaskCompletionRate > 0
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                  : 'bg-slate-700'
              }`}
              style={{ width: `${globalTaskCompletionRate}%` }}
            />
          </div>

          {/* Sub metrics info */}
          <div className="flex flex-wrap items-center justify-between gap-2 mt-3 text-xs text-slate-400 pt-2.5 border-t border-slate-750/50">
            <div className="flex items-center gap-4 flex-wrap text-[11px]">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>{filtered.filter((p) => p.status === 'completed').length} terminés</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                <span>{filtered.filter((p) => p.status === 'review').length} en revue</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                <span>{filtered.filter((p) => p.status === 'in_progress').length} en cours</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-500"></span>
                <span>{filtered.filter((p) => p.status === 'planned').length} planifiés</span>
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              {Math.max(0, totalTasksCount - totalCompletedTasksCount)} tâche{totalTasksCount - totalCompletedTasksCount > 1 ? 's' : ''} restante{totalTasksCount - totalCompletedTasksCount > 1 ? 's' : ''}
            </span>
          </div>
        </div>
      )}

      {/* Kanban Board View */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {columns.map((col) => {
            const colProjects = filtered.filter((p) => p.status === col.id);
            const colTotalTasks = colProjects.reduce((sum, p) => sum + (p.tasks?.length || 0), 0);
            const colCompletedTasks = colProjects.reduce(
              (sum, p) => sum + (p.tasks ? p.tasks.filter((t) => t.completed).length : 0),
              0
            );
            const colTaskRate = colTotalTasks > 0 ? Math.round((colCompletedTasks / colTotalTasks) * 100) : 0;

            return (
              <div
                key={col.id}
                className="bg-slate-900/60 border border-slate-800 rounded-2xl p-3.5 flex flex-col min-h-[500px]"
              >
                {/* Column header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${col.id === 'completed' ? 'bg-emerald-500' : col.id === 'review' ? 'bg-amber-500' : col.id === 'in_progress' ? 'bg-indigo-500' : 'bg-slate-500'}`} />
                    <span className="text-xs font-bold text-slate-200 uppercase tracking-wide">
                      {col.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {colTotalTasks > 0 && (
                      <span
                        className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-750"
                        title={`${colCompletedTasks}/${colTotalTasks} tâches complétées dans cette colonne`}
                      >
                        {colTaskRate}%
                      </span>
                    )}
                    <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                      {colProjects.length}
                    </span>
                  </div>
                </div>

                {/* Cards in this column */}
                <div className="space-y-3 flex-1 overflow-y-auto">
                  {colProjects.length === 0 ? (
                    <div className="h-36 flex items-center justify-center border-2 border-dashed border-slate-800/80 rounded-xl text-xs text-slate-500">
                      Aucun projet ici
                    </div>
                  ) : (
                    colProjects.map((p) => {
                      const totalTasks = p.tasks?.length || 0;
                      const completedTasks = p.tasks ? p.tasks.filter((t) => t.completed).length : 0;
                      const taskRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : p.progress;
                      return (
                        <div
                          key={p.id}
                          onClick={() => onOpenProjectDetail(p)}
                          className="group relative bg-slate-850 hover:bg-slate-800 border border-slate-750 hover:border-slate-650 rounded-xl p-3.5 shadow-md transition-all cursor-pointer space-y-2.5"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700 font-mono">
                              {p.code}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                                p.priority === 'high'
                                  ? 'bg-rose-500/20 text-rose-300'
                                  : p.priority === 'medium'
                                  ? 'bg-amber-500/20 text-amber-300'
                                  : 'bg-slate-700 text-slate-400'
                              }`}
                            >
                              {p.priority}
                            </span>
                          </div>

                          <h3 className="text-xs font-bold text-slate-100 group-hover:text-indigo-300 transition-colors line-clamp-2">
                            {p.title}
                          </h3>

                          <div className="text-[11px] text-slate-400 truncate">
                            Client : <strong className="text-slate-300">{p.clientName}</strong>
                          </div>

                          {/* Visual progress bar based on completed tasks */}
                          <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-750/70 space-y-1.5">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-slate-400 font-medium flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                                <span>Taux d'avancement</span>
                              </span>
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {completedTasks}/{totalTasks} tâche{totalTasks > 1 ? 's' : ''}
                                </span>
                                <span
                                  className={`font-mono font-bold text-xs ${
                                    taskRate === 100
                                      ? 'text-emerald-400'
                                      : taskRate >= 50
                                      ? 'text-indigo-400'
                                      : taskRate > 0
                                      ? 'text-amber-400'
                                      : 'text-slate-400'
                                  }`}
                                >
                                  {taskRate}%
                                </span>
                              </div>
                            </div>
                            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden p-0.5 border border-slate-700/60 shadow-inner">
                              <div
                                className={`h-full rounded-full transition-all duration-300 ${
                                  taskRate === 100
                                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                                    : taskRate >= 50
                                    ? 'bg-gradient-to-r from-indigo-500 to-blue-400'
                                    : taskRate > 0
                                    ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                                    : 'bg-slate-700'
                                }`}
                                style={{ width: `${taskRate}%` }}
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                            <span className="flex items-center gap-1 text-[10px]">
                              <Calendar className="w-3 h-3 text-slate-500" />
                              {p.dueDate}
                            </span>
                            <span className="font-mono text-slate-300 font-semibold">
                              {formatMoney(p.budget)}
                            </span>
                          </div>

                          {/* Fast move buttons */}
                          <div
                            className="flex items-center justify-between pt-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() => moveProject(p, 'prev')}
                              disabled={col.id === 'planned'}
                              className={`p-1 rounded hover:bg-slate-700 ${
                                col.id === 'planned' ? 'opacity-20 cursor-not-allowed' : 'text-slate-400 cursor-pointer'
                              }`}
                              title="Déplacer vers la gauche"
                            >
                              <ChevronLeft className="w-3.5 h-3.5" />
                            </button>

                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleStartCompare(p)}
                                className="p-1 text-slate-500 hover:text-indigo-400 rounded hover:bg-slate-750 transition-colors cursor-pointer"
                                title="Comparer ce projet"
                              >
                                <GitCompare className="w-3 h-3" />
                              </button>
                              <span className="text-[10px] text-slate-500">
                                {completedTasks}/{p.tasks.length} tâches
                              </span>
                            </div>

                            <button
                              onClick={() => moveProject(p, 'next')}
                              disabled={col.id === 'completed'}
                              className={`p-1 rounded hover:bg-slate-700 ${
                                col.id === 'completed' ? 'opacity-20 cursor-not-allowed' : 'text-slate-400 cursor-pointer'
                              }`}
                              title="Déplacer vers l'étape suivante"
                            >
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="bg-slate-850 border border-slate-750 rounded-2xl shadow-lg shadow-black/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-750 bg-slate-900/60 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Code & Projet</th>
                  <th className="py-3 px-4">Commanditaire</th>
                  <th className="py-3 px-4">Échéance</th>
                  <th className="py-3 px-4">Taux d'avancement (Tâches)</th>
                  <th className="py-3 px-4">Budget</th>
                  <th className="py-3 px-4 text-center">Statut</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filtered.map((p) => {
                  const totalTasks = p.tasks?.length || 0;
                  const completedTasks = p.tasks ? p.tasks.filter((t) => t.completed).length : 0;
                  const taskRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : p.progress;

                  return (
                    <tr
                      key={p.id}
                      onClick={() => onOpenProjectDetail(p)}
                      className="hover:bg-slate-800/50 transition-colors cursor-pointer"
                    >
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-100 flex items-center gap-2">
                          <span className="font-mono text-indigo-400 text-[11px]">{p.code}</span>
                          <span>{p.title}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-300">{p.clientName}</td>
                      <td className="py-3 px-4 text-slate-400">{p.dueDate}</td>
                      <td className="py-3 px-4">
                        <div className="space-y-1 min-w-[140px]">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-[10px] text-slate-400 font-mono">
                              {completedTasks}/{totalTasks} tâche{totalTasks > 1 ? 's' : ''}
                            </span>
                            <span
                              className={`font-mono font-bold text-xs ${
                                taskRate === 100
                                  ? 'text-emerald-400'
                                  : taskRate >= 50
                                  ? 'text-indigo-400'
                                  : taskRate > 0
                                  ? 'text-amber-400'
                                  : 'text-slate-400'
                              }`}
                            >
                              {taskRate}%
                            </span>
                          </div>
                          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden p-0.5 border border-slate-700/60 shadow-inner">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                taskRate === 100
                                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                                  : taskRate >= 50
                                  ? 'bg-gradient-to-r from-indigo-500 to-blue-400'
                                  : taskRate > 0
                                  ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                                  : 'bg-slate-700'
                              }`}
                              style={{ width: `${taskRate}%` }}
                            />
                          </div>
                        </div>
                      </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-200">
                      {formatMoney(p.budget)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          p.status === 'completed'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : p.status === 'review'
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-indigo-500/20 text-indigo-300'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td
                      className="py-3 px-4 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleStartCompare(p)}
                          className="p-1.5 text-slate-400 hover:text-indigo-400 rounded hover:bg-slate-800 cursor-pointer"
                          title="Comparer ce projet"
                        >
                          <GitCompare className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onEditProject(p)}
                          className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Supprimer le projet ${p.title} ?`)) {
                              deleteProject(p.id);
                            }
                          }}
                          className="p-1.5 text-slate-500 hover:text-rose-400 rounded hover:bg-slate-800 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Compare View Mode: Side-by-side graphs and metrics */}
      {viewMode === 'compare' && (
        <ProjetComparison
          initialProjectAId={compareProjectAId}
          initialProjectBId={compareProjectBId}
          onClose={() => setViewMode('kanban')}
          onOpenProjectDetail={onOpenProjectDetail}
        />
      )}
    </div>
  );
};

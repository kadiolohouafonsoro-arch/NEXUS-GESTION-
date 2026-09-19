import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Calendar,
  DollarSign,
  User,
  Clock,
  FilePlus,
  AlertCircle,
  ArrowRight,
  GitCompare,
} from 'lucide-react';
import { Project, ProjectTask, TaskPriority } from '../../types';
import { useApp } from '../../context/AppContext';

interface ProjectDetailModalProps {
  project: Project | null;
  onClose: () => void;
  onOpenCreateInvoiceForProject?: (project: Project) => void;
  onCompareWithProject?: (project: Project) => void;
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({
  project,
  onClose,
  onOpenCreateInvoiceForProject,
  onCompareWithProject,
}) => {
  const { toggleTask, addTask, deleteTask, updateProject, invoices, formatMoney } = useApp();

  if (!project) return null;

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>('medium');
  const [newTaskAssignee, setNewTaskAssignee] = useState('');

  // Associated invoices
  const linkedInvoices = invoices.filter((i) => i.projectId === project.id);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    addTask(project.id, {
      title: newTaskTitle.trim(),
      completed: false,
      priority: newTaskPriority,
      assignee: newTaskAssignee || undefined,
    });
    setNewTaskTitle('');
    setNewTaskAssignee('');
  };

  const handleStatusChange = (newStatus: any) => {
    updateProject({
      ...project,
      status: newStatus,
      progress: newStatus === 'completed' ? 100 : project.progress,
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-750 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-850">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
              {project.code}
            </span>
            <h2 className="text-base font-bold text-slate-100 truncate max-w-md">
              {project.title}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {onCompareWithProject && (
              <button
                onClick={() => {
                  onClose();
                  onCompareWithProject(project);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-xl text-xs font-bold transition-all cursor-pointer"
                title="Comparer ce projet avec un autre"
              >
                <GitCompare className="w-3.5 h-3.5" />
                <span>Comparer</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Top Info & Status Changer */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-850 border border-slate-750">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 block">Commanditaire</span>
              <span className="text-sm font-bold text-slate-100 mt-0.5 block">{project.clientName}</span>
            </div>

            <div>
              <span className="text-[11px] font-semibold text-slate-400 block">Statut Actuel</span>
              <select
                value={project.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="mt-1 px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs font-semibold text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="planned">Planifié</option>
                <option value="in_progress">En cours d'exécution</option>
                <option value="review">En revue / Recette</option>
                <option value="completed">Terminé & Livré</option>
                <option value="on_hold">En pause</option>
              </select>
            </div>

            <div>
              <span className="text-[11px] font-semibold text-slate-400 block">Échéance de Livraison</span>
              <span className="text-xs font-bold text-slate-200 mt-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                {project.dueDate}
              </span>
            </div>
          </div>

          {/* Progress & Budget Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-850 border border-slate-750">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold text-slate-400">Taux d'Avancement Réel</span>
                <span className="text-base font-black text-indigo-400">{project.progress}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
              <span className="text-[11px] text-slate-500 mt-2 block">
                Calculé dynamiquement selon la validation des tâches
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-850 border border-slate-750">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-semibold text-slate-400">Budget Consommé</span>
                <span className="text-sm font-bold text-slate-100 font-mono">
                  {formatMoney(project.budget)}
                </span>
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Facturé lié :{' '}
                <strong className="text-emerald-400">
                  {formatMoney(linkedInvoices.reduce((s, i) => s + i.total, 0))}
                </strong>
              </div>
              {onOpenCreateInvoiceForProject && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenCreateInvoiceForProject(project);
                  }}
                  className="mt-2 text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                >
                  <FilePlus className="w-3.5 h-3.5" />
                  <span>Émettre une facture pour ce projet</span>
                </button>
              )}
            </div>
          </div>

          {/* Description */}
          {project.description && (
            <div className="p-4 rounded-xl bg-slate-850/70 border border-slate-800 text-xs text-slate-300">
              <span className="font-bold text-slate-400 block mb-1">Cahier des charges :</span>
              {project.description}
            </div>
          )}

          {/* Interactive Tasks Checklist */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <span>Jalons & Tâches Opérationnelles</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                  {project.tasks.filter((t) => t.completed).length}/{project.tasks.length}
                </span>
              </h3>
            </div>

            {/* Task list */}
            <div className="space-y-2">
              {project.tasks.map((task) => (
                <div
                  key={task.id}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                    task.completed
                      ? 'bg-slate-900/40 border-slate-800/80 text-slate-500'
                      : 'bg-slate-850 border-slate-750 text-slate-200 hover:border-slate-650'
                  }`}
                >
                  <div
                    onClick={() => toggleTask(project.id, task.id)}
                    className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                  >
                    {task.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-500 hover:text-indigo-400 shrink-0" />
                    )}
                    <span
                      className={`text-xs font-medium truncate ${
                        task.completed ? 'line-through text-slate-500' : 'text-slate-200'
                      }`}
                    >
                      {task.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 ml-3">
                    {task.assignee && (
                      <span className="text-[11px] text-slate-400 flex items-center gap-1 hidden sm:flex">
                        <User className="w-3 h-3 text-slate-500" />
                        {task.assignee}
                      </span>
                    )}

                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                        task.priority === 'high'
                          ? 'bg-rose-500/20 text-rose-300'
                          : task.priority === 'medium'
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-slate-700 text-slate-400'
                      }`}
                    >
                      {task.priority}
                    </span>

                    <button
                      onClick={() => deleteTask(project.id, task.id)}
                      className="p-1 text-slate-500 hover:text-rose-400 rounded transition-colors cursor-pointer"
                      title="Supprimer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add task inline form */}
            <form onSubmit={handleAddTask} className="mt-3 flex items-center gap-2">
              <input
                type="text"
                placeholder="Ajouter une nouvelle tâche ou jalon..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="text"
                placeholder="Responsable (ex: Armand)"
                value={newTaskAssignee}
                onChange={(e) => setNewTaskAssignee(e.target.value)}
                className="w-36 hidden sm:block px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-400 focus:outline-none"
              />
              <select
                value={newTaskPriority}
                onChange={(e) => setNewTaskPriority(e.target.value as any)}
                className="px-2.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none"
              >
                <option value="low">Basse</option>
                <option value="medium">Moyenne</option>
                <option value="high">Haute</option>
              </select>
              <button
                type="submit"
                className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

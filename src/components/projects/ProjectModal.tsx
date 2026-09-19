import React, { useState } from 'react';
import { X, FolderPlus, DollarSign, Calendar, AlertCircle } from 'lucide-react';
import { Project, ProjectStatus, TaskPriority } from '../../types';
import { useApp } from '../../context/AppContext';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingProject?: Project | null;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  onClose,
  editingProject,
}) => {
  const { clients, addProject, updateProject, formatMoney } = useApp();

  if (!isOpen) return null;

  const [title, setTitle] = useState(editingProject?.title || '');
  const [description, setDescription] = useState(editingProject?.description || '');
  const [clientId, setClientId] = useState(editingProject?.clientId || clients[0]?.id || '');
  const [category, setCategory] = useState<Project['category']>(
    editingProject?.category || 'digital'
  );
  const [priority, setPriority] = useState<TaskPriority>(editingProject?.priority || 'medium');
  const [status, setStatus] = useState<ProjectStatus>(editingProject?.status || 'in_progress');
  const [budget, setBudget] = useState<number>(editingProject?.budget || 2500000);
  const [startDate, setStartDate] = useState(
    editingProject?.startDate || new Date().toISOString().split('T')[0]
  );
  const [dueDate, setDueDate] = useState(
    editingProject?.dueDate ||
      new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selClient = clients.find((c) => c.id === clientId);

    if (editingProject) {
      updateProject({
        ...editingProject,
        title,
        description,
        clientId,
        clientName: selClient?.name || 'Client',
        category,
        priority,
        status,
        budget: Number(budget),
        startDate,
        dueDate,
      });
    } else {
      addProject({
        title,
        description,
        clientId,
        clientName: selClient?.name || 'Client',
        status,
        priority,
        budget: Number(budget),
        startDate,
        dueDate,
        category,
        tasks: [
          {
            id: `tsk-${Date.now()}-1`,
            title: 'Cadrage initial et validation des objectifs',
            completed: true,
            priority: 'high',
          },
          {
            id: `tsk-${Date.now()}-2`,
            title: 'Exécution des livrables principaux',
            completed: false,
            priority: 'high',
          },
        ],
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-750 rounded-2xl shadow-2xl p-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <FolderPlus className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-slate-100">
              {editingProject ? 'Modifier le Projet' : 'Nouveau Projet / Chantier'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Titre du projet / Mission
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Déploiement Portail ERP & Facturation"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Client / Commanditaire
              </label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Catégorie</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="digital">Digital & Informatique</option>
                <option value="consulting">Audit & Conseil</option>
                <option value="construction">BTP & Chantiers</option>
                <option value="mutual">Mutuelle & Tontine</option>
                <option value="event">Événement & Formation</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Budget prévisionnel ({formatMoney(budget)})
              </label>
              <input
                type="number"
                min="0"
                step="50000"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Priorité</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="low">Basse</option>
                <option value="medium">Moyenne</option>
                <option value="high">Haute / Urgente</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Date de début</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Date d'échéance / Livraison
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
            <textarea
              rows={3}
              placeholder="Objectifs, cahier des charges et livrables attendus..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="pt-2 flex justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-600/20 cursor-pointer"
            >
              {editingProject ? 'Enregistrer' : 'Créer le projet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

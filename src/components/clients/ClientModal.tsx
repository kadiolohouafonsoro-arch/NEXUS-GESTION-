import React, { useState, useEffect } from 'react';
import {
  X,
  UserPlus,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  BadgeCheck,
  UserCheck,
  CreditCard,
  Building,
  Sparkles,
} from 'lucide-react';
import { Client, ClientType, ClientStatus, BureauRole, MemberStatus } from '../../types';
import { useApp } from '../../context/AppContext';

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingClient?: Client | null;
}

export const ClientModal: React.FC<ClientModalProps> = ({ isOpen, onClose, editingClient }) => {
  const { addClient, updateClient, settings, formatMoney, showToast } = useApp();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [type, setType] = useState<ClientType>('member');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+225 ');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Abidjan');
  const [memberStatus, setMemberStatus] = useState<MemberStatus>('active');
  const [bureauRole, setBureauRole] = useState<BureauRole>('member');
  const [notes, setNotes] = useState('');
  const [recordInitialContribution, setRecordInitialContribution] = useState(false);
  const [initialContributionAmount, setInitialContributionAmount] = useState<number>(settings.baseContribution || 50000);

  // Sync state whenever modal opens or editingClient changes
  useEffect(() => {
    if (isOpen) {
      if (editingClient) {
        const existingName = editingClient.name || '';
        const fName = editingClient.firstName || (existingName.includes(' ') ? existingName.split(' ')[0] : existingName);
        const lName = editingClient.lastName || (existingName.includes(' ') ? existingName.split(' ').slice(1).join(' ') : '');
        setFirstName(fName);
        setLastName(lName);
        setType(editingClient.type || 'member');
        setCompanyName(editingClient.companyName || '');
        setEmail(editingClient.email || '');
        setPhone(editingClient.phone || '+225 ');
        setAddress(editingClient.address || '');
        setCity(editingClient.city || 'Abidjan');
        setMemberStatus((editingClient.memberStatus || (editingClient.status as any) || 'active') as MemberStatus);
        setBureauRole(editingClient.bureauRole || 'member');
        setNotes(editingClient.notes || '');
        setRecordInitialContribution(false);
      } else {
        setFirstName('');
        setLastName('');
        setType('member');
        setCompanyName('');
        setEmail('');
        setPhone('+225 ');
        setAddress('');
        setCity('Abidjan');
        setMemberStatus('active');
        setBureauRole('member');
        setNotes('');
        setRecordInitialContribution(false);
        setInitialContributionAmount(settings.baseContribution || 50000);
      }
    }
  }, [isOpen, editingClient, settings.baseContribution]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim() || 'Adhérent sans nom';

    // Generate safe default email if not provided
    const cleanEmail = email.trim() || `${firstName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'adherent'}.${Date.now().toString().slice(-4)}@nexus-asso.ci`;

    const clientData = {
      name: fullName,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      type,
      companyName: companyName.trim() || undefined,
      email: cleanEmail,
      phone: phone.trim(),
      address: address.trim(),
      city: city.trim(),
      status: (memberStatus === 'radiated' ? 'inactive' : 'active') as ClientStatus,
      memberStatus,
      bureauRole,
      notes: notes.trim(),
    };

    if (editingClient) {
      updateClient({
        ...editingClient,
        ...clientData,
      });
      showToast?.(`Fiche de ${fullName} mise à jour avec succès.`, 'success');
    } else {
      const created = addClient({
        ...clientData,
        joinDate: new Date().toISOString().split('T')[0],
        contributionTotal: recordInitialContribution ? Number(initialContributionAmount) || 0 : 0,
        penaltiesTotal: 0,
      });
      showToast?.(`Nouveau membre ${fullName} ajouté avec succès au registre !`, 'success');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-750 rounded-2xl shadow-2xl p-5 sm:p-6 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span>{editingClient ? 'Modifier l\'Adhérent' : 'Ajouter un Nouveau Membre'}</span>
                {!editingClient && (
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Registre SaaS
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400">
                {editingClient
                  ? 'Mettez à jour les coordonnées et responsabilités du membre.'
                  : 'Inscrivez un membre dans l\'association, avec son rôle et ses coordonnées.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nom & Prénoms */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Prénom(s) <span className="text-emerald-400">*</span>
              </label>
              <input
                type="text"
                required
                autoFocus
                placeholder="Ex: Kouamé Jean"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nom de famille <span className="text-emerald-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Konan"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Rôle au sein du bureau & Statut d'adhésion */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Fonction / Rôle statutaire
              </label>
              <select
                value={bureauRole}
                onChange={(e) => setBureauRole(e.target.value as BureauRole)}
                className="w-full px-3.5 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="member">👤 Membre Adhérent</option>
                <option value="president">⭐ Président(e)</option>
                <option value="vice_president">⭐ Vice-Président(e)</option>
                <option value="secretary_general">📝 Secrétaire Général(e)</option>
                <option value="deputy_secretary">📝 Secrétaire Adjoint(e)</option>
                <option value="treasurer">💰 Trésorier(e) Général(e)</option>
                <option value="auditor">🔍 Commissaire aux Comptes</option>
                <option value="organizer">🎯 Responsable Organisation</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Statut d'adhésion
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMemberStatus('active')}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    memberStatus === 'active'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/60 shadow-sm'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <BadgeCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Actif</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMemberStatus('radiated')}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    memberStatus === 'radiated'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/60 shadow-sm'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <X className="w-3.5 h-3.5 text-rose-400" />
                  <span>Radié</span>
                </button>
              </div>
            </div>
          </div>

          {/* Contact: Téléphone (Mobile Money) & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Téléphone (Wave / Mobile Money) <span className="text-emerald-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  placeholder="+225 07 00 00 00 00"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Numéro pour les rappels WhatsApp & notifications SMS.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Email <span className="text-slate-500 font-normal">(Optionnel)</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="adherent@nexus-asso.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-800/90 border border-slate-750 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Laissez vide si le membre n'a pas d'adresse courriel.
              </p>
            </div>
          </div>

          {/* Localisation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Ville / Commune</label>
              <div className="relative">
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Abidjan, Bouaké, Cocody..."
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Quartier ou Adresse</label>
              <input
                type="text"
                placeholder="Deux-Plateaux Vallon, Angré..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Optionnel: Enregistrer cotisation initiale à l'inscription */}
          {!editingClient && (
            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-750 space-y-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={recordInitialContribution}
                  onChange={(e) => setRecordInitialContribution(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 bg-slate-900 border-slate-700 focus:ring-emerald-500 cursor-pointer"
                />
                <span>Enregistrer un versement initial à l'adhésion</span>
              </label>

              {recordInitialContribution && (
                <div className="pt-2 pl-6 flex items-center gap-3">
                  <div className="flex-1">
                    <label className="block text-[11px] text-slate-400 mb-1">Montant versé (FCFA)</label>
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      value={initialContributionAmount}
                      onChange={(e) => setInitialContributionAmount(Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono font-bold text-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div className="text-[11px] text-emerald-400 pt-4">
                    Cotisation statutaire : {formatMoney(settings.baseContribution || 50000)}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Notes & Observations (Parrain, profession, antécédents)
            </label>
            <textarea
              rows={2}
              placeholder="Ex: Parrainé par M. Koné, cotise par Wave chaque début de mois..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-600/25 cursor-pointer active:scale-95"
            >
              <UserPlus className="w-4 h-4" />
              <span>{editingClient ? 'Enregistrer les Modifications' : 'Ajouter le Membre'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import { Client, Project, Transaction } from '../types';

/**
 * Escape a field for CSV according to RFC 4180.
 * Wrapped in quotes if it contains delimiter, quote, or newline.
 */
function escapeCSVField(value: unknown, delimiter = ';'): string {
  if (value === null || value === undefined) {
    return '""';
  }
  const str = String(value);
  if (str.includes(delimiter) || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

/**
 * Triggers a browser download of a CSV file with UTF-8 BOM
 * ensuring accents (é, è, à, etc.) render properly in Excel and LibreOffice.
 */
export function downloadCSV(filename: string, headers: string[], rows: (string | number)[][], delimiter = ';') {
  const headerLine = headers.map((h) => escapeCSVField(h, delimiter)).join(delimiter);
  const dataLines = rows.map((row) => row.map((cell) => escapeCSVField(cell, delimiter)).join(delimiter));
  
  // UTF-8 BOM (\uFEFF) ensures Excel French and Windows properly detect UTF-8
  const csvContent = '\uFEFF' + [headerLine, ...dataLines].join('\r\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Format date for French display in CSV
 */
function formatDate(dateStr?: string): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('fr-FR');
  } catch {
    return dateStr;
  }
}

/**
 * Export a list of Clients to CSV
 */
export function exportClientsToCSV(clients: Client[], customFilename?: string) {
  const headers = [
    'Identifiant',
    'Nom complet',
    'Nom',
    'Prénoms',
    'Rôle Bureau',
    'Statut Adhésion',
    'Téléphone / Contact',
    'Email',
    'Ville',
    'Adresse',
    'Cotisations Cumulées (FCFA)',
    'Arriérés / Dettes (FCFA)',
    'Pénalités (FCFA)',
    'Date d\'Adhésion',
    'Notes',
  ];

  const roleLabels: Record<string, string> = {
    president: 'Président(e)',
    vice_president: 'Vice-Président(e)',
    secretary_general: 'Secrétaire Général(e)',
    deputy_secretary: 'Secrétaire Adjoint(e)',
    treasurer: 'Trésorier(e) Général(e)',
    auditor: 'Commissaire aux Comptes',
    organizer: 'Responsable Organisation',
    member: 'Membre Adhérent',
  };

  const statusLabels: Record<string, string> = {
    active: 'Actif',
    radiated: 'Radié',
    suspended: 'Suspendu',
    inactive: 'Inactif',
    lead: 'Prospect',
  };

  const rows = clients.map((c) => {
    const rawRole = (c as any).bureauRole || 'member';
    const rawStatus = (c as any).memberStatus || c.status || 'active';
    return [
      c.id,
      c.name,
      (c as any).lastName || c.name.split(' ').slice(1).join(' ') || c.name,
      (c as any).firstName || c.name.split(' ')[0] || '',
      roleLabels[rawRole] || rawRole,
      statusLabels[rawStatus] || rawStatus,
      c.phone,
      c.email,
      c.city,
      c.address,
      c.contributionTotal ?? c.totalBilled,
      c.outstandingBalance,
      c.penaltiesTotal || 0,
      formatDate(c.joinDate || c.createdAt),
      c.notes || '',
    ];
  });

  const timestamp = new Date().toISOString().slice(0, 10);
  const filename = customFilename || `export-adherents-${timestamp}.csv`;
  downloadCSV(filename, headers, rows);
}

/**
 * Export a list of Projects to CSV
 */
export function exportProjectsToCSV(projects: Project[], customFilename?: string) {
  const headers = [
    'Code',
    'Titre du Projet',
    'Client / Commanditaire',
    'Catégorie',
    'Statut',
    'Priorité',
    'Progression (%)',
    'Budget Alloué (FCFA)',
    'Montant Dépensé (FCFA)',
    'Solde Restant (FCFA)',
    'Date de Début',
    'Date d\'Échéance',
    'Total Tâches',
    'Tâches Terminées',
    'Description',
  ];

  const categoryLabels: Record<string, string> = {
    digital: 'Digital & IT',
    consulting: 'Audit & Conseil',
    construction: 'BTP & Chantiers',
    event: 'Événementiel',
    mutual: 'Mutuelle & Tontine',
  };

  const statusLabels: Record<string, string> = {
    planned: 'Planifié',
    in_progress: 'En cours',
    review: 'En révision',
    completed: 'Terminé',
    on_hold: 'En pause',
  };

  const priorityLabels: Record<string, string> = {
    low: 'Basse',
    medium: 'Moyenne',
    high: 'Haute',
  };

  const rows = projects.map((p) => {
    const totalTasks = p.tasks ? p.tasks.length : 0;
    const completedTasks = p.tasks ? p.tasks.filter((t) => t.completed).length : 0;
    const remainingBudget = p.budget - p.spent;

    return [
      p.code,
      p.title,
      p.clientName,
      categoryLabels[p.category] || p.category,
      statusLabels[p.status] || p.status,
      priorityLabels[p.priority] || p.priority,
      p.progress,
      p.budget,
      p.spent,
      remainingBudget,
      formatDate(p.startDate),
      formatDate(p.dueDate),
      totalTasks,
      completedTasks,
      p.description || '',
    ];
  });

  const timestamp = new Date().toISOString().slice(0, 10);
  const filename = customFilename || `export-projets-${timestamp}.csv`;
  downloadCSV(filename, headers, rows);
}

/**
 * Export a list of Transactions to CSV
 */
export function exportTransactionsToCSV(transactions: Transaction[], currency = 'XOF', customFilename?: string) {
  const headers = [
    'ID Transaction',
    'Date',
    'Sens / Type',
    'Catégorie',
    'Description / Motif',
    'Caisse / Compte',
    'Adhérent / Membre lié',
    'Référence de pièce',
    'Montant',
    'Devise',
    'Notes',
  ];

  const categoryLabels: Record<string, string> = {
    contribution: 'Cotisation adhérent',
    penalty: 'Pénalité de retard / absence',
    donation: 'Don & Libéralité',
    grant: 'Subvention',
    admission_fee: 'Droit d\'adhésion',
    event_expense: 'Événement & Réunion',
    social_aid: 'Aide sociale & Secours',
    operating_expense: 'Frais de fonctionnement',
    tontine_payout: 'Décaissement Tontine',
    project_cost: 'Dépense projet',
    invoice_payment: 'Paiement prestation / facture',
    other_income: 'Autre entrée',
    other_expense: 'Autre dépense',
    other: 'Autre mouvement',
  };

  const rows = transactions.map((t) => [
    t.id,
    formatDate(t.date),
    t.type === 'income' ? 'Entrée (+)' : 'Sortie (-)',
    categoryLabels[t.category] || t.category,
    t.description,
    t.accountName,
    t.memberName || '',
    t.reference || '',
    t.amount,
    currency,
    t.notes || '',
  ]);

  const timestamp = new Date().toISOString().slice(0, 10);
  const filename = customFilename || `export-transactions-tresorerie-${timestamp}.csv`;
  downloadCSV(filename, headers, rows);
}


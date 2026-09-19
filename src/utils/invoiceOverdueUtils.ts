import { Invoice, OrganizationSettings, ReminderChannel, ReminderLevel } from '../types';

/**
 * Calcule si une facture est en retard par rapport à son échéance ou son statut
 */
export function isInvoiceOverdue(invoice: Invoice): boolean {
  if (invoice.type !== 'invoice' || invoice.status === 'paid' || invoice.status === 'cancelled') {
    return false;
  }
  if (invoice.status === 'overdue') {
    return true;
  }
  if (!invoice.dueDate) return false;

  const dueTime = new Date(invoice.dueDate).setHours(23, 59, 59, 999);
  const now = new Date().getTime();
  return now > dueTime && invoice.amountPaid < invoice.total;
}

/**
 * Retourne le nombre de jours de dépassement d'échéance (positif si en retard)
 */
export function getDaysOverdue(dueDateStr: string): number {
  if (!dueDateStr) return 0;
  const due = new Date(dueDateStr);
  const now = new Date();
  
  // Différence en jours
  const diffTime = now.getTime() - due.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

/**
 * Fournit les détails de sévérité du retard pour le badge visuel
 */
export function getOverdueSeverity(days: number): {
  badgeColor: string;
  badgeBg: string;
  badgeBorder: string;
  severityText: string;
  severity: 'mild' | 'moderate' | 'critical';
} {
  if (days <= 7) {
    return {
      badgeColor: 'text-amber-300',
      badgeBg: 'bg-amber-500/20',
      badgeBorder: 'border-amber-500/30',
      severityText: `Retard léger (${days}j)`,
      severity: 'mild',
    };
  } else if (days <= 30) {
    return {
      badgeColor: 'text-orange-300',
      badgeBg: 'bg-orange-500/20',
      badgeBorder: 'border-orange-500/30',
      severityText: `Retard (${days}j)`,
      severity: 'moderate',
    };
  } else {
    return {
      badgeColor: 'text-rose-300',
      badgeBg: 'bg-rose-500/20',
      badgeBorder: 'border-rose-500/30',
      severityText: `Retard critique (${days}j)`,
      severity: 'critical',
    };
  }
}

/**
 * Génère le contenu complet des relances selon le niveau choisi et le canal
 */
export function generateReminderTemplate({
  invoice,
  settings,
  level,
  channel,
  formatMoney,
}: {
  invoice: Invoice;
  settings: OrganizationSettings;
  level: ReminderLevel;
  channel: ReminderChannel;
  formatMoney: (val: number) => string;
}): {
  subject: string;
  message: string;
  whatsappUrl?: string;
} {
  const remaining = invoice.total - invoice.amountPaid;
  const remainingFormatted = formatMoney(remaining);
  const days = getDaysOverdue(invoice.dueDate);
  const daysText = days > 0 ? ` (dépassée de ${days} jours)` : '';

  let subject = '';
  let message = '';

  const paymentMethodsBlock = `
MODALITÉS DE RÈGLEMENT CI & UEMOA :
- Wave (Côte d'Ivoire) : ${settings.waveNumber || settings.phone}
- Orange Money (#144#) : ${settings.orangeMoneyNumber || settings.phone}
- MTN MoMo (*133#) : ${settings.mtnMomoNumber || settings.phone}${settings.moovMoneyNumber ? `\n- Moov Money (*155#) : ${settings.moovMoneyNumber}` : ''}${settings.djamoTag ? `\n- Djamo Tag : ${settings.djamoTag}` : ''}
- Virement bancaire : ${settings.bankName} (IBAN/RIB : ${settings.bankIban || settings.bankRib || 'RIB fourni sur facture'})`;

  switch (level) {
    case 'friendly':
      subject = `Rappel amical : Facture ${invoice.number} - ${settings.name}`;
      message = `Bonjour ${invoice.clientName},

Sauf erreur ou omission de notre part, le règlement de la facture N° ${invoice.number} émise le ${invoice.issueDate} pour un solde de ${remainingFormatted} n'a pas encore été constaté.

Pour rappel, la date d'échéance était fixée au ${invoice.dueDate}${daysText}.

Nous vous remercions de bien vouloir procéder à son règlement par l'un des moyens suivants :
${paymentMethodsBlock}

Si votre paiement a déjà été initié entre-temps, nous vous prions de ne pas tenir compte de ce message.

Restant à votre entière disposition pour tout renseignement complémentaire.

Bien cordialement,
L'équipe comptable
${settings.name}
Tél : ${settings.phone}`;
      break;

    case 'firm':
      subject = `Deuxième relance : Facture impayée ${invoice.number} - ${settings.name}`;
      message = `Bonjour ${invoice.clientName},

Malgré notre précédente communication, nous constatons à ce jour que la facture N° ${invoice.number} d'un montant restant de ${remainingFormatted} demeure impayée.

L'échéance du ${invoice.dueDate} est désormais dépassée de ${days} jours.

Nous vous demandons de bien vouloir régulariser cette situation dans un délai de 48 heures ouvrées via :
${paymentMethodsBlock}

Merci de nous transmettre votre preuve de règlement par retour de message.

Comptant sur votre prompte diligence.

Service Recouvrement
${settings.name}
Tél : ${settings.phone}`;
      break;

    case 'urgent':
    case 'formal_notice':
      subject = `URGENT - Dernier avis avant suspension : Facture ${invoice.number}`;
      message = `Madame, Monsieur (${invoice.clientName}),

À ce jour, et malgré nos relances précédentes, votre compte présente un arriéré de ${remainingFormatted} correspondant à la facture ${invoice.number} échue depuis ${days} jours (échéance : ${invoice.dueDate}).

Sans régularisation sous 24 heures de votre part :
1. Les prestations ou accès associés pourront être suspendus sans préavis.
2. Des pénalités de retard légales seront appliquées au solde dû.

Moyens de paiement immédiats acceptés :
${paymentMethodsBlock}

Veuillez considérer la présente comme dernier avertissement amiable.

Direction Administrative & Financière
${settings.name}
Tél : ${settings.phone} • Email : ${settings.email}`;
      break;
  }

  // Nettoyage téléphone pour WhatsApp (Support indicatif Côte d'Ivoire 10 chiffres)
  let whatsappUrl: string | undefined = undefined;
  if (invoice.clientPhone) {
    let cleanPhone = invoice.clientPhone.replace(/[^0-9]/g, '');
    if (cleanPhone.length === 10 && !cleanPhone.startsWith('225')) {
      cleanPhone = `225${cleanPhone}`;
    }
    if (cleanPhone) {
      const waText = encodeURIComponent(message);
      whatsappUrl = `https://wa.me/${cleanPhone}?text=${waText}`;
    }
  }

  return { subject, message, whatsappUrl };
}

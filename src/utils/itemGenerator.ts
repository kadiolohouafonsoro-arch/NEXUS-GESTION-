import { InvoiceItem } from '../types';

export interface CatalogItem {
  id: string;
  category: string;
  description: string;
  unit: string;
  suggestedPrice: number;
}

export interface ItemPackage {
  id: string;
  title: string;
  badge: string;
  description: string;
  items: Array<{
    description: string;
    unit: string;
    quantity: number;
    unitPrice: number;
  }>;
}

export const CATALOG_CATEGORIES = [
  'Tous les articles',
  'Développement & Digital',
  'Conseil & Stratégie',
  'Design & UX/UI',
  'Infrastructure & Réseau',
  'Formation & Support',
  'Équipements & Matériel',
];

export const PREDEFINED_CATALOG: CatalogItem[] = [
  // Développement & Digital
  {
    id: 'cat-1',
    category: 'Développement & Digital',
    description: 'Développement et intégration d\'application web sur-mesure (Frontend React & API)',
    unit: 'Forfait',
    suggestedPrice: 1500000,
  },
  {
    id: 'cat-2',
    category: 'Développement & Digital',
    description: 'Intégration passerelle de paiement Mobile Money (Wave Business, Orange Money, MTN)',
    unit: 'Forfait',
    suggestedPrice: 450000,
  },
  {
    id: 'cat-3',
    category: 'Développement & Digital',
    description: 'Développement d\'application mobile Android / iOS (PWA & Hybride)',
    unit: 'Forfait',
    suggestedPrice: 1800000,
  },
  {
    id: 'cat-4',
    category: 'Développement & Digital',
    description: 'Conception de site institutionnel vitrine responsive & optimisé SEO',
    unit: 'Forfait',
    suggestedPrice: 750000,
  },

  // Conseil & Stratégie
  {
    id: 'cat-5',
    category: 'Conseil & Stratégie',
    description: 'Audit technique et diagnostic de l\'architecture des systèmes d\'information',
    unit: 'Jours',
    suggestedPrice: 350000,
  },
  {
    id: 'cat-6',
    category: 'Conseil & Stratégie',
    description: 'Accompagnement à la transformation digitale et schéma directeur SI',
    unit: 'Jours',
    suggestedPrice: 400000,
  },
  {
    id: 'cat-7',
    category: 'Conseil & Stratégie',
    description: 'Rédaction du cahier des charges fonctionnel et spécifications techniques',
    unit: 'Forfait',
    suggestedPrice: 600000,
  },

  // Design & UX/UI
  {
    id: 'cat-8',
    category: 'Design & UX/UI',
    description: 'Création d\'identité visuelle complète (Logo vectoriel, charte graphique & typographies)',
    unit: 'Forfait',
    suggestedPrice: 500000,
  },
  {
    id: 'cat-9',
    category: 'Design & UX/UI',
    description: 'Conception de maquettes interactives UI/UX et Design System sur Figma',
    unit: 'Écrans',
    suggestedPrice: 85000,
  },

  // Infrastructure & Réseau
  {
    id: 'cat-10',
    category: 'Infrastructure & Réseau',
    description: 'Configuration de serveur Cloud sécurisé, environnement Docker & sauvegardes automatiques',
    unit: 'Serveur',
    suggestedPrice: 350000,
  },
  {
    id: 'cat-11',
    category: 'Infrastructure & Réseau',
    description: 'Audit de sécurité des accès réseaux, pare-feu et politique de mots de passe',
    unit: 'Forfait',
    suggestedPrice: 650000,
  },

  // Formation & Support
  {
    id: 'cat-12',
    category: 'Formation & Support',
    description: 'Session de formation des utilisateurs finaux et administrateurs du système',
    unit: 'Jours',
    suggestedPrice: 250000,
  },
  {
    id: 'cat-13',
    category: 'Formation & Support',
    description: 'Contrat de maintenance corrective et évolutive trimestrielle (SLA garanti)',
    unit: 'Trimestre',
    suggestedPrice: 750000,
  },
  {
    id: 'cat-14',
    category: 'Formation & Support',
    description: 'Assistance technique et helpdesk informatique de niveau 2/3 en régie',
    unit: 'Heures',
    suggestedPrice: 35000,
  },
];

export const ITEM_PACKAGES: ItemPackage[] = [
  {
    id: 'pack-digital',
    title: 'Pack Solution Web & Digitale Clé en Main',
    badge: 'Populaire',
    description: 'Ensemble complet pour la refonte et le lancement d\'une plateforme digitale moderne.',
    items: [
      {
        description: 'Cahier des charges, cadrage fonctionnel et architecture technique',
        unit: 'Forfait',
        quantity: 1,
        unitPrice: 450000,
      },
      {
        description: 'Conception UI/UX Design : prototypage interactif et charte web',
        unit: 'Forfait',
        quantity: 1,
        unitPrice: 600000,
      },
      {
        description: 'Développement frontend réactif & intégration backend haute disponibilité',
        unit: 'Forfait',
        quantity: 1,
        unitPrice: 1650000,
      },
      {
        description: 'Intégration des passerelles de paiement Wave Business & Orange Money',
        unit: 'Forfait',
        quantity: 1,
        unitPrice: 400000,
      },
      {
        description: 'Déploiement en production, recette finale et formation administrateur',
        unit: 'Forfait',
        quantity: 1,
        unitPrice: 300000,
      },
    ],
  },
  {
    id: 'pack-audit',
    title: 'Pack Audit & Optimisation Opérationnelle',
    badge: 'Consulting',
    description: 'Audit approfondi de la structure, analyse des processus et plan d\'action.',
    items: [
      {
        description: 'Audit sur site des procédures de gestion et entretiens avec les équipes',
        unit: 'Jours',
        quantity: 3,
        unitPrice: 350000,
      },
      {
        description: 'Analyse des flux financiers, contrôles internes et évaluation des risques',
        unit: 'Forfait',
        quantity: 1,
        unitPrice: 750000,
      },
      {
        description: 'Restitution plénière de l\'audit et remise du rapport de recommandations stratégiques',
        unit: 'Forfait',
        quantity: 1,
        unitPrice: 500000,
      },
    ],
  },
  {
    id: 'pack-maintenance',
    title: 'Pack Maintenance IT & Infogérance Trimestrielle',
    badge: 'Abonnement',
    description: 'Surveillance préventive, sauvegardes quotidiennes et support technique dédié.',
    items: [
      {
        description: 'Supervision proactive des serveurs et monitoring de disponibilité 24/7',
        unit: 'Mois',
        quantity: 3,
        unitPrice: 150000,
      },
      {
        description: 'Mises à jour de sécurité et gestion des sauvegardes déportées chiffrées',
        unit: 'Mois',
        quantity: 3,
        unitPrice: 100000,
      },
      {
        description: 'Crédit d\'intervention rapide pour assistance technique (jusqu\'à 15h)',
        unit: 'Forfait',
        quantity: 1,
        unitPrice: 350000,
      },
    ],
  },
  {
    id: 'pack-training',
    title: 'Pack Formation & Montée en Compétences',
    badge: 'Formation',
    description: 'Programme intensif pour professionnaliser les équipes sur les outils de gestion.',
    items: [
      {
        description: 'Animation d\'ateliers pratiques de formation (groupe de 5 à 12 personnes)',
        unit: 'Jours',
        quantity: 2,
        unitPrice: 400000,
      },
      {
        description: 'Conception et fourniture des livrets pédagogiques & guides utilisateurs',
        unit: 'Lots',
        quantity: 1,
        unitPrice: 200000,
      },
      {
        description: 'Évaluation des acquis, attestation de fin de stage et suivi post-formation (30 jours)',
        unit: 'Forfait',
        quantity: 1,
        unitPrice: 250000,
      },
    ],
  },
];

/**
 * Génère une liste d'articles à partir d'un package prédéfini
 */
export function generateItemsFromPackage(pkg: ItemPackage): InvoiceItem[] {
  return pkg.items.map((item, index) => ({
    id: `item-gen-${Date.now()}-${index}`,
    description: item.description,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    total: item.quantity * item.unitPrice,
  }));
}

/**
 * Convertit un montant numérique en toutes lettres en langue française.
 * Exemple: 1500000 -> "Un million cinq cent mille"
 */

const UNITES = [
  '',
  'un',
  'deux',
  'trois',
  'quatre',
  'cinq',
  'six',
  'sept',
  'huit',
  'neuf',
  'dix',
  'onze',
  'douze',
  'treize',
  'quatorze',
  'quinze',
  'seize',
  'dix-sept',
  'dix-huit',
  'dix-neuf',
];

const DIZAINES = [
  '',
  '',
  'vingt',
  'trente',
  'quarante',
  'cinquante',
  'soixante',
  'soixante',
  'quatre-vingt',
  'quatre-vingt',
];

function convertLessThanThousand(n: number): string {
  if (n === 0) return '';

  let result = '';

  // Centaines
  const hundreds = Math.floor(n / 100);
  const remainder = n % 100;

  if (hundreds > 0) {
    if (hundreds === 1) {
      result += 'cent';
    } else {
      result += UNITES[hundreds] + ' cent';
      if (remainder === 0 && hundreds > 1) {
        result += 's';
      }
    }
    if (remainder > 0) {
      result += ' ';
    }
  }

  if (remainder === 0) return result;

  // Reste < 100
  if (remainder < 20) {
    result += UNITES[remainder];
  } else {
    const tens = Math.floor(remainder / 10);
    const units = remainder % 10;

    if (tens === 7 || tens === 9) {
      // 70-79 ou 90-99
      const baseTen = tens === 7 ? 'soixante' : 'quatre-vingt';
      if (units === 1 && tens === 7) {
        result += `${baseTen} et onze`;
      } else {
        result += `${baseTen}-${UNITES[10 + units]}`;
      }
    } else {
      // 20-69 ou 80-89
      if (units === 0) {
        result += DIZAINES[tens];
        if (tens === 8) result += 's';
      } else if (units === 1 && tens !== 8) {
        result += `${DIZAINES[tens]} et un`;
      } else {
        result += `${DIZAINES[tens]}-${UNITES[units]}`;
      }
    }
  }

  return result;
}

export function numberToWordsFrench(amount: number, currencyCode: string = 'XOF'): string {
  const rounded = Math.floor(Math.abs(amount));
  if (rounded === 0) {
    return 'Zéro';
  }

  const billions = Math.floor(rounded / 1_000_000_000);
  const millions = Math.floor((rounded % 1_000_000_000) / 1_000_000);
  const thousands = Math.floor((rounded % 1_000_000) / 1_000);
  const units = rounded % 1_000;

  const parts: string[] = [];

  if (billions > 0) {
    if (billions === 1) {
      parts.push('un milliard');
    } else {
      parts.push(`${convertLessThanThousand(billions)} milliards`);
    }
  }

  if (millions > 0) {
    if (millions === 1) {
      parts.push('un million');
    } else {
      parts.push(`${convertLessThanThousand(millions)} millions`);
    }
  }

  if (thousands > 0) {
    if (thousands === 1) {
      parts.push('mille');
    } else {
      parts.push(`${convertLessThanThousand(thousands)} mille`);
    }
  }

  if (units > 0) {
    parts.push(convertLessThanThousand(units));
  }

  const words = parts.join(' ').trim();
  // Capitaliser la première lettre
  const capitalized = words.charAt(0).toUpperCase() + words.slice(1);

  // Devise libellé
  let currencyLabel = 'Francs CFA';
  if (currencyCode === 'EUR') currencyLabel = 'Euros';
  if (currencyCode === 'USD') currencyLabel = 'Dollars américains';
  if (currencyCode === 'GNF') currencyLabel = 'Francs Guinéens';

  return `${capitalized} ${currencyLabel}`;
}

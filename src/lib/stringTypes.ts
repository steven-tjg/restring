import type { Limits, StringType } from './types';

export interface StringTypeInfo {
  value: StringType;
  label: string;
  short: string;
  tip: string;
}

export const STRING_TYPES: StringTypeInfo[] = [
  {
    value: 'poly',
    label: 'Polyester (Poly)',
    short: 'Poly',
    tip: 'Poly loses tension fast, even when unused. Restring by hours played, not by breakage.',
  },
  {
    value: 'syngut',
    label: 'Synthetic Gut (Syngut)',
    short: 'Syngut',
    tip: 'Syngut holds tension reasonably. Restring when it feels dead or starts to fray.',
  },
  {
    value: 'multi',
    label: 'Multifilament',
    short: 'Multi',
    tip: 'Multifilament is soft and frays early. Restring when fibres fray or power drops.',
  },
  {
    value: 'natural',
    label: 'Natural Gut',
    short: 'Gut',
    tip: 'Natural gut holds tension best. Keep it dry; restring when it frays or notches.',
  },
];

export const DEFAULT_LIMITS: Limits = {
  poly: { hours: 15, days: 45 },
  syngut: { hours: 25, days: 90 },
  multi: { hours: 25, days: 90 },
  natural: { hours: 35, days: 120 },
};

export function typeInfo(t: StringType): StringTypeInfo {
  return STRING_TYPES.find((s) => s.value === t)!;
}

export function typeShort(t: StringType): string {
  return typeInfo(t).short;
}

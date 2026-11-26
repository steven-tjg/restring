import type { StringJob, StringType } from './types';

/** Popular racquets by brand. Edit freely: values are stored as plain text. */
const RACQUET_BASE: Record<string, string[]> = {
  Wilson: [
    'Defyer 98 Pro',
    'Defyer 100',
    'Defyer 100L',
    'Defyer 100UL',
    'Pro Staff 97',
    'Pro Staff 97L',
    'Pro Staff RF97 Autograph',
    'Pro Staff Team Classic',
    'Blade 98 16x19',
    'Blade 98 18x20',
    'Blade Pro 98 16x19',
    'Blade 100',
    'Blade 100L',
    'Blade 101L',
    'Blade 104',
    'Clash 98',
    'Clash 100',
    'Clash 100 Pro',
    'Clash 100L',
    'Clash 100UL',
    'Clash 108',
    'Ultra 95',
    'Ultra 100',
    'Ultra 100L',
    'Ultra 108',
    'Ultra Pro 16x19',
    'Shift 99',
    'Shift 99 Pro',
    'Shift 99L',
    'Burn 100',
    'Burn 100S',
    'Burn 100LS',
  ],
  Babolat: [
    'Pure Aero',
    'Pure Aero 98',
    'Pure Aero Team',
    'Pure Aero Lite',
    'Pure Aero +',
    'Pure Aero Rafa',
    'Pure Drive',
    'Pure Drive 98',
    'Pure Drive Team',
    'Pure Drive Lite',
    'Pure Drive +',
    'Pure Strike 98 16x19',
    'Pure Strike 16x19',
    'Pure Strike 18x20',
    'Pure Strike 100',
    'Evo Aero',
    'Evo Aero Lite',
    'Evo Strike',
    'Evo Drive',
    'Evo Drive Lite',
    'Boost Aero',
    'Boost Drive',
    'Boost Strike',
    'Drive Max 110',
  ],
  Head: [
    'Speed MP',
    'Speed MP L',
    'Speed MP UL',
    'Speed Pro',
    'Speed Tour',
    'Speed Team',
    'Radical MP',
    'Radical Pro',
    'Radical Elite',
    'Radical Team',
    'Prestige MP',
    'Prestige MP L',
    'Prestige Pro',
    'Gravity MP',
    'Gravity MP L',
    'Gravity Pro',
    'Gravity Tour',
    'Gravity Team',
    'Extreme MP',
    'Extreme MP L',
    'Extreme MP XL',
    'Extreme MP UL',
    'Extreme Pro',
    'Extreme Elite',
    'Extreme Team',
    'Boom MP',
    'Boom MP L',
    'Boom MP UL',
    'Boom Pro',
    'Boom Elite',
    'Boom Team',
    'Instinct MP',
    'Instinct Team',
    'Instinct Team L',
    'Instinct PWR 115',
  ],
  Yonex: [
    'EZONE 98',
    'EZONE 98 Tour',
    'EZONE 98+',
    'EZONE 100',
    'EZONE 100L',
    'EZONE 100+',
    'EZONE 105',
    'VCORE 95',
    'VCORE 98',
    'VCORE 98 Tour',
    'VCORE 100',
    'VCORE 100+',
    'Percept 97',
    'Percept 97D',
    'Percept 97H',
    'Percept 97L',
    'Percept 100',
    'Percept 100D',
    'Percept 100L',
    'Astrel 100',
    'Astrel 105',
    'Astrel 115',
    'Astrel 120',
    'Muse 98',
  ],
  Prince: [
    'Tour 98',
    'Tour 100',
    'Textreme Tour 100',
    'Ripstick 98',
    'Ripstick 100',
    'Ripstick 100 280g',
    'Phantom 100X',
    'Phantom 100P',
    'Phantom 107G',
    'Ripcord 98 XS',
    'Twistpower X100',
    'Premier 105',
    'Legacy 105',
  ],
  Tecnifibre: [
    'T-Fight 300',
    'T-Fight 305',
    'T-Fight 305S',
    'T-Fight 315',
    'T-Fight ISO 315',
    'TF40 290',
    'TF40 305',
    'TF40 315',
    'TF-X1 275',
    'TF-X1 285',
    'TF-X1 300',
    'TF-X1 305',
    'Tempo 298 Iga',
  ],
  Dunlop: [
    'CX 200',
    'CX 200 OS',
    'CX 200 Tour',
    'CX 400',
    'CX 400 Tour',
    'SX 300',
    'SX 300 Tour',
    'SX 300 LS',
    'SX 300 Lite',
    'SX 600',
    'FX 500',
    'FX 500 Tour',
    'FX 500 LS',
    'FX 500 Lite',
    'FX 700',
    'LX 1000',
  ],
  Volkl: [
    'Vostra V1 Pro',
    'Vostra V1 MP',
    'Vostra V1 OS',
    'Vostra V1 Power Arm',
    'Vostra V2',
    'Vostra V3',
    'Vostra V8',
    'Vostra V9',
    'Vostra V10',
    'V-Cell V1 Pro',
    'V-Cell V1 MP',
    'V-Cell V1 OS',
    'V-Cell 8',
    'V-Cell 10',
    'V1 Classic',
    'V1 EVO',
  ],
};

/** Older (1990s to 2010s) and newer models, merged into the base lists without duplicates. */
const RACQUET_EXTRA: Record<string, string[]> = {
  Wilson: ['Profile 2.7', 'Pro Staff 85', 'Pro Staff 6.0 85', 'Pro Staff 6.0 95', 'Pro Staff Six.One 95', 'Pro Staff Six.One Tour 90', 'nCode nSix-One 95', 'K Factor KSix-One 95', 'K Factor KBlade 98', 'K Factor KPro Staff 97', 'BLX Blade 98', 'BLX Six.One 95', 'BLX Pro Staff 97', 'Pro Staff 97 v14', 'Blade 98 v9', 'Hammer 5.0', 'Hammer 6.2', 'Triad 3', 'Triad 5', 'Juice 100', 'Juice 100S', 'Juice Pro 96', 'Steam 99S', 'Steam 105S', 'Burn 95', 'Burn FST 99', 'Clash 100 v2', 'Clash 98 v2', 'Clash 100 Pro v2', 'Clash 100L v2', 'Clash 100UL v2'],
  Babolat: ['Pure Drive 107', 'Pure Drive 110', 'Pure Drive Tour', 'Pure Drive VS', 'Pure Drive Roddick', 'Pure Drive GT', 'Aero Pro Drive', 'Aero Pro Drive GT', 'Aero Storm', 'Pure Storm', 'Pure Control', 'Pure Aero VS', 'Pure Aero Tour', 'Pure Strike VS', 'Pure Strike Tour', 'Pure Strike Team', 'Pure Strike 97', 'Pure Strike 98 18x20', 'Pure Strike Evo', 'Contact Team'],
  Head: ['Pro Tour 630', 'Prestige Classic 600', 'Prestige Tour', 'Prestige Mid', 'Prestige Rev Pro', 'Radical OS', 'Radical Tour', 'Ti.S6', 'Ti.S5', 'Ti.Radical', 'Liquidmetal Radical', 'Liquidmetal Prestige', 'Microgel Radical', 'Microgel Prestige', 'Microgel Extreme', 'Flexpoint Radical', 'Flexpoint Prestige', 'i.Radical', 'i.Prestige', 'i.S12', 'Youtek IG Speed MP', 'Youtek IG Radical MP', 'Youtek IG Prestige MP', 'Youtek Graphene Speed MP', 'Graphene 360 Speed MP', 'Graphene 360+ Speed MP', 'Graphene 360+ Radical MP', 'Graphene 360+ Prestige MP', 'Graphene 360+ Gravity MP', 'Graphene 360+ Extreme MP', 'Graphene 360+ Instinct MP', 'Graphene 360+ Boom MP', 'Extreme Tour'],
  Yonex: ['RDS 001 MP', 'RDiS 100', 'VCORE Pro 97', 'VCORE Pro 100', 'VCORE Duel G 97', 'VCORE Tour G 97', 'VCORE SV 98', 'VCORE Si 98', 'VCORE Xi 98', 'VCORE Xi 100', 'EZONE DR 98', 'EZONE Ai 98', 'EZONE Ai 100', 'EZONE Xi 98', 'EZONE 100SL'],
  Prince: ['Graphite 90', 'Thunderstick', 'Triple Threat Bandit', 'Triple Threat Rebel', 'Triple Threat Hornet', 'Triple Threat Warrior', 'O3 Tour', 'O3 Speedport Black', 'O3 Hybrid Hornet', 'EXO3 Rebel 98', 'EXO3 Tour 100', 'EXO3 Warrior 100', 'Tour 95', 'Tour Pro 100', 'Beast 100', 'Beast 104', 'Phantom Pro 100', 'Phantom 93P', 'Textreme Tour 98'],
  Tecnifibre: ['T-Fight 280', 'T-Fight 295', 'T-Fight 300 Isoflex', 'T-Fight 315 Isoflex', 'T-Fight 320', 'T-Fight 325', 'T-Fight RS 300', 'T-Flash 300', 'Tempo 285', 'Fire 285', 'Fire 300', 'Fire 305S'],
  Dunlop: ['Max 200G', 'Muscleweave Max 200G', 'Aerogel 4D 200', 'Biomimetic 200', 'Biomimetic 300', 'Biomimetic 500', 'Force 98', 'Force 100', 'CX 200 LS', 'FX Team 100'],
  Volkl: ['Organix 5', 'Organix 6', 'Organix 8', 'Organix 9', 'Organix 10', 'Catapult 10', 'Tour 10 V-Engine', 'Tour 8', 'Power Bridge 10 Mid', 'DNX 8', 'DNX 10', 'V-Feel 8', 'V-Feel 10', 'Super G 8', 'Super G 10'],
  Pacific: ['BXT X Force Pro', 'BXT X Fast Pro'],
};

export const RACQUET_CATALOG: Record<string, string[]> = Object.fromEntries(
  [...new Set([...Object.keys(RACQUET_BASE), ...Object.keys(RACQUET_EXTRA)])].map((brand) => [
    brand,
    [...new Set([...(RACQUET_BASE[brand] ?? []), ...(RACQUET_EXTRA[brand] ?? [])])],
  ]),
);

export interface StringModel {
  model: string;
  type: StringType;
}

const of = (type: StringType, ...models: string[]): StringModel[] => models.map((model) => ({ model, type }));

/**
 * Strings by brand, compiled from retailer catalogs (Tennis Warehouse, Tennis Express and
 * brand sites). Each model carries its type so the type never needs picking. Add new
 * models here; values are stored as plain text, so adding never breaks saved data.
 */
const STRING_BASE: Record<string, StringModel[]> = {
  Restring: of('poly', 'Zero', 'Sync', 'Slap', 'Vivo'),
  Luxilon: [
    ...of(
      'poly',
      'ALU Power',
      'ALU Power Rough',
      'ALU Power Soft',
      'ALU Power Spin',
      'ALU Power Vibe',
      '4G',
      '4G Soft',
      '4G Rough',
      'Element',
      'Element Rough',
      'Savage',
      'Adrenaline',
      'Big Banger Original',
      'Eco Power',
      'Eco Rough',
      'Eco Spin',
    ),
    ...of('natural', 'Natural Gut'),
  ],
  Babolat: [
    ...of(
      'poly',
      'RPM Blast',
      'RPM Blast Rough',
      'RPM Soft',
      'RPM Rough',
      'RPM Hurricane',
      'RPM Power',
      'RPM Team',
    ),
    ...of('multi', 'Xcel', 'Xcel Power', 'Origin', 'Addixion', 'Xalt'),
    ...of('syngut', 'Syn Gut'),
    ...of('natural', 'VS Touch', 'Touch Tonic'),
  ],
  Wilson: [
    ...of('poly', 'Revolve', 'Revolve Spin'),
    ...of('multi', 'NXT', 'NXT Control', 'NXT Power', 'NXT Soft', 'Sensation'),
    ...of('syngut', 'Synthetic Gut', 'Synthetic Gut Power'),
    ...of('natural', 'Natural Gut'),
  ],
  Head: [
    ...of(
      'poly',
      'Hawk',
      'Hawk Touch',
      'Hawk Touch Rough',
      'Hawk Power',
      'Hawk Tour rPET',
      'Lynx',
      'Lynx Tour',
      'Lynx Power',
      'Lynx Touch',
      'Sonic Pro',
      'Sonic Pro Edge',
      'Sonic Pro Tour rPET',
    ),
    ...of('multi', 'RIP Control', 'Velocity MLT', 'Reflex MLT'),
    ...of('syngut', 'FiberGel Power'),
  ],
  Tecnifibre: [
    ...of(
      'poly',
      'Razor Code',
      'Razor Code Carbon',
      'Razor Soft',
      'Black Code',
      'Black Code 4S',
      'Pro Red Code',
      'Ice Code',
      'Ruff Code',
      '4S',
      'Tecni Spin',
      'Tecni Power',
      'Tecni Fuse',
    ),
    ...of('multi', 'X-One Biphase', 'NRG2', 'Triax', 'TGV', 'XR3', 'Multifeel'),
    ...of('syngut', 'Synthetic Gut', 'Duramix'),
  ],
  Solinco: [
    ...of(
      'poly',
      'Hyper-G',
      'Hyper-G Soft',
      'Hyper-G Round',
      'Tour Bite',
      'Tour Bite Soft',
      'Tour Bite Diamond Rough',
      'Confidential',
      'Revolution',
      'Barb Wire',
      'Mach-10',
      'Outlast',
    ),
    ...of('multi', 'Vanquish', 'X-Natural'),
    ...of('syngut', 'Pro Stacked'),
  ],
  Yonex: [
    ...of(
      'poly',
      'Poly Tour Pro',
      'Poly Tour Strike',
      'Poly Tour Spin',
      'Poly Tour Rev',
      'Poly Tour Fire',
      'Poly Tour Drive',
      'Poly Tour Tough',
      'Poly Tour Air',
      'Poly Tour Force',
    ),
    ...of('multi', 'Rexis Comfort', 'Rexis Activate'),
    ...of('syngut', 'Dynawire'),
  ],
  Toroline: of(
    'poly',
    'O-Toro',
    'O-Toro Tour',
    'O-Toro Spin',
    'Wasabi X',
    'K-Pop',
    'K-Pop Spin',
    'Caviar',
    'Enso Pro',
    'Truffle X',
    'Absolute',
    'A5',
  ),
  Grapplesnake: of('poly', 'Alpha', 'Tour M8', 'Tour Sniper', 'Tour Mako', 'Irukandji 2.0', 'GameChanger'),
  Kirschbaum: of(
    'poly',
    'Max Power',
    'Max Power Rough',
    'Pro Line II',
    'Pro Line Rough',
    'Pro Line Evolution',
    'Xplosive Speed',
    'Super Smash',
    'Black Shark',
    'Competition',
  ),
};

const STRING_EXTRA: Record<string, StringModel[]> = {
  Luxilon: of('poly', 'Timo', 'M2 Pro'),
  Babolat: [...of('poly', 'Pro Hurricane Tour', 'Pro Hurricane'), ...of('multi', 'Tonic + Ball Feel', 'Syntec Pro', 'Syntec Team')],
  Wilson: [...of('poly', 'Revolve Twist', 'Duraspin'), ...of('multi', 'Sensation Plus', 'NXT Tour', 'Stamina Power', 'Stamina Spin')],
  Head: [...of('poly', 'Hawk Rough', 'Hawk Tour'), ...of('multi', 'Intellitour'), ...of('syngut', 'Synthetic Gut PPS')],
  Tecnifibre: [...of('multi', 'NRG2 SPL'), ...of('syngut', 'Duramix HD'), ...of('natural', 'Natural Gut')],
  Yonex: of('multi', 'Rexis Speed', 'Rexis Feel', 'Multi Sensa'),
  Kirschbaum: of('poly', 'Spiky Shape'),
  Prince: [...of('multi', 'Premier Touch', 'Premier Control', 'Premier Power'), ...of('syngut', 'Synthetic Gut Duraflex', 'Synthetic Gut Original', 'Lightning XX'), ...of('poly', 'Beast XP')],
  Gamma: [...of('poly', 'Moto', 'Zo Verve', 'Zo Power', 'Ocho'), ...of('multi', 'Live Wire Professional'), ...of('syngut', 'Live Wire XP')],
  Diadem: of('poly', 'Solstice Power', 'Solstice Black', 'Solstice Black Rough', 'Elevate', 'Rise'),
  'Weiss CANNON': of('poly', 'Ultra Cable', 'Silverstring'),
  'Signum Pro': of('poly', 'Poly Plasma', 'Poly Plasma Pure', 'Hexonic'),
  Isospeed: of('poly', 'Baseline', 'Baseline Rough', 'Cream', 'Professional'),
  Ashaway: [...of('poly', 'MonoGut ZX'), ...of('multi', 'Crossfire ZX')],
  Volkl: of('poly', 'Cyclone', 'Cyclone Tour'),
  Dunlop: of('multi', 'Explosive', 'Silk'),
  "Pro's Pro": of('poly', 'Hexaspin Twist', 'Hexaspin'),
};

export const STRING_CATALOG: Record<string, StringModel[]> = Object.fromEntries(
  [...new Set([...Object.keys(STRING_BASE), ...Object.keys(STRING_EXTRA)])].map((brand) => {
    const seen = new Set<string>();
    const models = [...(STRING_BASE[brand] ?? []), ...(STRING_EXTRA[brand] ?? [])].filter(
      (m) => !seen.has(m.model) && seen.add(m.model),
    );
    return [brand, models];
  }),
);

export const racquetBrands = (): string[] => Object.keys(RACQUET_CATALOG);
export const racquetModels = (brand: string): string[] => RACQUET_CATALOG[brand] ?? [];
export const stringBrands = (): string[] => Object.keys(STRING_CATALOG);
export const stringModels = (brand: string): StringModel[] => STRING_CATALOG[brand] ?? [];

export function stringTypeOf(brand: string, model: string): StringType | null {
  return stringModels(brand).find((m) => m.model === model)?.type ?? null;
}

/** Catalog list plus the saved value, so older free-text records still show in the select. */
export function withCurrent(options: string[], current: string): string[] {
  return current && !options.includes(current) ? [current, ...options] : options;
}

export function racquetTitle(r: { name: string; brand: string; model: string }): string {
  return r.brand && r.model ? `${r.brand} ${r.model}` : r.name || r.brand || r.model || 'Racquet';
}

/** Nickname to show under the title, if it differs from brand + model. */
export function racquetNickname(r: { name: string; brand: string; model: string }): string {
  const title = racquetTitle(r);
  return r.name && r.name !== title ? r.name : '';
}

export function stringNames(job: StringJob): { mains: string; crosses: string } {
  const side = (brand?: string, model?: string, name?: string) =>
    brand && model ? `${brand} ${model}` : (name ?? '');
  return {
    mains: side(job.mainsBrand, job.mainsModel, job.mainsName),
    crosses: side(job.crossesBrand, job.crossesModel, job.crossesName),
  };
}

import { describe, expect, it } from 'vitest';
import {
  RACQUET_CATALOG,
  STRING_CATALOG,
  racquetModels,
  racquetNickname,
  racquetTitle,
  stringTypeOf,
  withCurrent,
} from './catalog';

const TYPES = ['poly', 'syngut', 'multi', 'natural'];

describe('catalog', () => {
  it('every racquet brand has models, no duplicates', () => {
    for (const [brand, models] of Object.entries(RACQUET_CATALOG)) {
      expect(models.length, brand).toBeGreaterThan(0);
      expect(new Set(models).size, brand).toBe(models.length);
    }
  });

  it('every string model has a valid type, no duplicates', () => {
    for (const [brand, models] of Object.entries(STRING_CATALOG)) {
      expect(models.length, brand).toBeGreaterThan(0);
      expect(new Set(models.map((m) => m.model)).size, brand).toBe(models.length);
      for (const m of models) expect(TYPES, `${brand} ${m.model}`).toContain(m.type);
    }
  });

  it('stringTypeOf resolves the type, or null when unknown', () => {
    expect(stringTypeOf('Luxilon', 'ALU Power')).toBe('poly');
    expect(stringTypeOf('Wilson', 'Natural Gut')).toBe('natural');
    expect(stringTypeOf('Luxilon', 'Nope')).toBeNull();
    expect(stringTypeOf('Nope', 'ALU Power')).toBeNull();
  });

  it('racquetModels is empty for unknown brand', () => {
    expect(racquetModels('Nope')).toEqual([]);
    expect(racquetModels('Wilson')).toContain('Clash 100');
  });

  it('withCurrent keeps a saved value that is not in the catalog', () => {
    expect(withCurrent(['A', 'B'], 'C')).toEqual(['C', 'A', 'B']);
    expect(withCurrent(['A', 'B'], 'A')).toEqual(['A', 'B']);
    expect(withCurrent(['A'], '')).toEqual(['A']);
  });

  it('racquet title and nickname', () => {
    const r = { name: 'Match stick', brand: 'Wilson', model: 'Clash 100' };
    expect(racquetTitle(r)).toBe('Wilson Clash 100');
    expect(racquetNickname(r)).toBe('Match stick');
    expect(racquetNickname({ ...r, name: 'Wilson Clash 100' })).toBe('');
    expect(racquetTitle({ name: 'Old racquet', brand: '', model: '' })).toBe('Old racquet');
  });
});

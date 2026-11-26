import { describe, expect, it } from 'vitest';
import { DEFAULT_LIMITS } from './stringTypes';
import { evaluate, jobLimit, statusFor, toDateStr } from './restring';
import type { Session, StringJob } from './types';

const NOW = new Date(2026, 5, 15); // 15 Jun 2026

function job(over: Partial<StringJob> = {}): StringJob {
  return {
    id: 'j1',
    racquetId: 'r1',
    setup: 'full',
    mainsType: 'poly',
    crossesType: 'poly',
    mainsName: '',
    crossesName: '',
    gauge: '',
    tensionMain: null,
    tensionCross: null,
    unit: 'kg',
    strungAt: toDateStr(NOW),
    cost: null,
    playedMinutes: 0,
    status: 'active',
    endedAt: null,
    createdAt: 0,
    ...over,
  };
}

function ago(days: number): string {
  return toDateStr(new Date(NOW.getFullYear(), NOW.getMonth(), NOW.getDate() - days));
}

function session(daysAgo: number, minutes: number): Session {
  return {
    id: `s${daysAgo}`,
    stringJobId: 'j1',
    racquetId: 'r1',
    playedAt: ago(daysAgo),
    minutes,
    kind: 'match',
    createdAt: 0,
  };
}

describe('statusFor', () => {
  it('thresholds', () => {
    expect(statusFor(0.79)).toBe('good');
    expect(statusFor(0.8)).toBe('soon');
    expect(statusFor(1)).toBe('now');
  });
});

describe('jobLimit', () => {
  it('full bed uses its own limit', () => {
    expect(jobLimit(job({ mainsType: 'natural' }), DEFAULT_LIMITS).limit.hours).toBe(35);
  });
  it('hybrid poly/gut uses poly', () => {
    const r = jobLimit(job({ setup: 'hybrid', mainsType: 'poly', crossesType: 'natural' }), DEFAULT_LIMITS);
    expect(r.limit).toEqual({ hours: 15, days: 45 });
    expect(r.governing).toBe('poly');
  });
  it('hybrid gut/poly also uses poly', () => {
    const r = jobLimit(job({ setup: 'hybrid', mainsType: 'natural', crossesType: 'poly' }), DEFAULT_LIMITS);
    expect(r.governing).toBe('poly');
  });
});

describe('evaluate', () => {
  it('fresh string is good', () => {
    expect(evaluate(job(), [], DEFAULT_LIMITS, NOW).status).toBe('good');
  });
  it('12h poly is soon (80%)', () => {
    const e = evaluate(job({ playedMinutes: 720 }), [], DEFAULT_LIMITS, NOW);
    expect(e.status).toBe('soon');
    expect(e.reason).toBe('hours');
  });
  it('15h poly is now', () => {
    expect(evaluate(job({ playedMinutes: 900 }), [], DEFAULT_LIMITS, NOW).status).toBe('now');
  });
  it('50 days old with no play is now by days', () => {
    const e = evaluate(job({ strungAt: ago(50) }), [], DEFAULT_LIMITS, NOW);
    expect(e.status).toBe('now');
    expect(e.reason).toBe('days');
  });
  it('projects restring date from weekly pace', () => {
    // 4h over 14 day window = 2h/week
    const sessions = [session(10, 120), session(3, 120)];
    const e = evaluate(job({ strungAt: ago(14), playedMinutes: 240 }), sessions, DEFAULT_LIMITS, NOW);
    expect(e.weeklyHours).toBeCloseTo(2, 5);
    // by hours: (15-4)/2*7 = 38.5d; by days: 45-14 = 31d -> 31
    expect(e.daysLeft).toBe(31);
  });
});

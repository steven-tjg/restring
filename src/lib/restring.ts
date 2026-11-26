import { DEFAULT_LIMITS, typeInfo, typeShort } from './stringTypes';
import type { Limit, Limits, Session, StringJob, StringType } from './types';

export type Status = 'good' | 'soon' | 'now';

export interface Evaluation {
  playedHours: number;
  daysSince: number;
  limit: Limit;
  governing: StringType;
  hoursPct: number;
  daysPct: number;
  pct: number;
  status: Status;
  reason: 'hours' | 'days';
  weeklyHours: number;
  daysLeft: number;
  restringOn: Date;
  tips: string[];
}

export function toDateStr(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

function parseDate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function daysBetween(dateStr: string, now: Date): number {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((today.getTime() - parseDate(dateStr).getTime()) / 86_400_000);
}

export function mergeLimits(custom?: Partial<Limits>): Limits {
  const out = { ...DEFAULT_LIMITS };
  if (custom) {
    for (const k of Object.keys(custom) as StringType[]) {
      if (custom[k]) out[k] = custom[k]!;
    }
  }
  return out;
}

/** Hybrid uses the stricter (lower) limit of mains and crosses. */
export function jobLimit(job: StringJob, limits: Limits): { limit: Limit; governing: StringType } {
  const mains = limits[job.mainsType];
  if (job.setup === 'full') return { limit: mains, governing: job.mainsType };
  const crosses = limits[job.crossesType];
  const governing = crosses.hours < mains.hours ? job.crossesType : job.mainsType;
  return {
    limit: { hours: Math.min(mains.hours, crosses.hours), days: Math.min(mains.days, crosses.days) },
    governing,
  };
}

export function statusFor(pct: number): Status {
  if (pct >= 1) return 'now';
  if (pct >= 0.8) return 'soon';
  return 'good';
}

export function jobLabel(job: StringJob): string {
  return job.setup === 'full'
    ? typeShort(job.mainsType)
    : `${typeShort(job.mainsType)} / ${typeShort(job.crossesType)}`;
}

export function evaluate(
  job: StringJob,
  sessions: Session[],
  limits: Limits = DEFAULT_LIMITS,
  now: Date = new Date(),
): Evaluation {
  const { limit, governing } = jobLimit(job, limits);
  const playedHours = job.playedMinutes / 60;
  const daysSince = Math.max(0, daysBetween(job.strungAt, now));
  const hoursPct = playedHours / limit.hours;
  const daysPct = daysSince / limit.days;
  const pct = Math.max(hoursPct, daysPct);
  const status = statusFor(pct);

  const window = Math.min(28, Math.max(7, daysSince));
  const recentMinutes = sessions
    .filter((s) => s.stringJobId === job.id)
    .filter((s) => {
      const age = daysBetween(s.playedAt, now);
      return age >= 0 && age < window;
    })
    .reduce((sum, s) => sum + s.minutes, 0);
  const weeklyHours = recentMinutes / 60 / (window / 7);

  const byDays = limit.days - daysSince;
  const byHours = weeklyHours > 0 ? ((limit.hours - playedHours) / weeklyHours) * 7 : Infinity;
  const daysLeft = status === 'now' ? 0 : Math.max(0, Math.ceil(Math.min(byDays, byHours)));
  const restringOn = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysLeft);

  const tips: string[] = [typeInfo(governing).tip];
  if (job.setup === 'hybrid') {
    tips.unshift(
      `Hybrid ${jobLabel(job)}: restring timing follows ${typeShort(governing)} (the shorter-lived string).`,
    );
  }
  if (status === 'now') {
    tips.push(`Limit reached: ${limit.hours} h played or ${limit.days} days since stringing. Restring now.`);
  } else if (status === 'soon') {
    tips.push('Getting close. Book your stringer now.');
  }

  return {
    playedHours,
    daysSince,
    limit,
    governing,
    hoursPct,
    daysPct,
    pct,
    status,
    reason: hoursPct >= daysPct ? 'hours' : 'days',
    weeklyHours,
    daysLeft,
    restringOn,
    tips,
  };
}

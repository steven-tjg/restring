import {
  collection,
  doc,
  increment,
  onSnapshot,
  setDoc,
  updateDoc,
  writeBatch,
  type DocumentData,
} from 'firebase/firestore';
import { derived, get, writable } from 'svelte/store';
import { user } from './auth';
import { db } from './firebase';
import { mergeLimits, toDateStr } from './restring';
import type { CutReason, Profile, Racquet, Session, StringJob, Unit } from './types';

export const racquets = writable<Racquet[]>([]);
export const stringJobs = writable<StringJob[]>([]);
export const sessions = writable<Session[]>([]);
export const profile = writable<Profile | null>(null);
/** True once the first snapshot of each collection arrived (cache or server). */
export const dataReady = writable(false);
export const limits = derived(profile, ($p) => mergeLimits($p?.customLimits));

/** Persistent message when Firestore listeners fail (not created, rules missing). */
export const syncError = writable('');

export const toast = writable<string>('');
let toastTimer: ReturnType<typeof setTimeout> | undefined;
export function say(msg: string): void {
  toast.set(msg);
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.set(''), 3000);
}

function fail(e: unknown): void {
  console.error(e);
  const code = (e as { code?: string })?.code;
  say(
    code === 'permission-denied'
      ? 'Save blocked: publish firestore.rules in the Firebase console.'
      : `Could not save${code ? ` (${code})` : ''}. Check your connection.`,
  );
}

function uid(): string {
  const u = get(user);
  if (!u) throw new Error('not signed in');
  return u.uid;
}

const col = (name: string) => collection(db, 'users', uid(), name);

let unsubs: Array<() => void> = [];

export function stopSync(): void {
  unsubs.forEach((u) => u());
  unsubs = [];
  racquets.set([]);
  stringJobs.set([]);
  sessions.set([]);
  profile.set(null);
  dataReady.set(false);
}

export function startSync(userId: string, fallbackName: string, email: string): void {
  stopSync();
  const pending = new Set(['profile', 'racquets', 'stringJobs', 'sessions']);
  const mark = (k: string) => {
    pending.delete(k);
    if (pending.size === 0) dataReady.set(true);
  };

  syncError.set('');
  // A failed listener must not leave the app stuck on "Loading": show the error instead.
  const onError = (k: string) => (e: unknown) => {
    const code = (e as { code?: string })?.code ?? 'unknown';
    console.error(`Firestore ${k}:`, e);
    syncError.set(
      code === 'permission-denied'
        ? 'Database access denied. Publish firestore.rules in the Firebase console.'
        : `Cannot load data (${code}). Check that Firestore is created in the Firebase console.`,
    );
    mark(k);
  };

  unsubs.push(
    onSnapshot(
      doc(db, 'users', userId),
      (snap) => {
        const d = snap.data() as Partial<Profile> | undefined;
        profile.set({
          name: d?.name ?? fallbackName,
          email: d?.email ?? email,
          unit: d?.unit ?? 'lb',
          customLimits: d?.customLimits,
          createdAt: d?.createdAt ?? 0,
        });
        mark('profile');
      },
      onError('profile'),
    ),
  );

  const watch = <T extends { id: string }>(
    name: string,
    store: { set: (v: T[]) => void },
    sort: (a: T, b: T) => number,
  ) =>
    unsubs.push(
      onSnapshot(
        collection(db, 'users', userId, name),
        (snap) => {
          store.set(snap.docs.map((d) => ({ ...(d.data() as object), id: d.id }) as T).sort(sort));
          mark(name);
        },
        onError(name),
      ),
    );

  watch<Racquet>('racquets', racquets, (a, b) => a.createdAt - b.createdAt);
  watch<StringJob>('stringJobs', stringJobs, (a, b) => b.strungAt.localeCompare(a.strungAt) || b.createdAt - a.createdAt);
  watch<Session>('sessions', sessions, (a, b) => b.playedAt.localeCompare(a.playedAt) || b.createdAt - a.createdAt);
}

// Writes are fire-and-forget: Firestore applies them to the local cache at once and
// syncs when online, so awaiting would hang the UI offline.

export function saveProfile(patch: Partial<Profile>): void {
  const data: DocumentData = { ...patch };
  // Show the change at once; the listener restores the stored value if the write is rejected.
  profile.update((p) => (p ? { ...p, ...patch } : p));
  setDoc(doc(db, 'users', uid()), data, { merge: true }).catch(fail);
}

export function setUnit(unit: Unit): void {
  saveProfile({ unit });
}

export function addRacquet(data: Pick<Racquet, 'name' | 'brand' | 'model'>): string {
  const ref = doc(col('racquets'));
  setDoc(ref, { ...data, activeStringJobId: null, createdAt: Date.now() }).catch(fail);
  return ref.id;
}

export function updateRacquet(id: string, data: Pick<Racquet, 'name' | 'brand' | 'model'>): void {
  updateDoc(doc(col('racquets'), id), data).catch(fail);
}

export function deleteRacquet(id: string): void {
  const batch = writeBatch(db);
  batch.delete(doc(col('racquets'), id));
  for (const j of get(stringJobs)) if (j.racquetId === id) batch.delete(doc(col('stringJobs'), j.id));
  for (const s of get(sessions)) if (s.racquetId === id) batch.delete(doc(col('sessions'), s.id));
  batch.commit().catch(fail);
}

export type NewStringJob = Omit<StringJob, 'id' | 'playedMinutes' | 'status' | 'endedAt' | 'createdAt'>;

/** Creates a new active string job and retires the previous one on that racquet. */
export function addStringJob(data: NewStringJob): string {
  const batch = writeBatch(db);
  const ref = doc(col('stringJobs'));
  const today = toDateStr(new Date());
  for (const j of get(stringJobs)) {
    if (j.racquetId === data.racquetId && j.status === 'active') {
      batch.update(doc(col('stringJobs'), j.id), { status: 'cut', endedAt: today, endReason: 'change' });
    }
  }
  batch.set(ref, { ...data, playedMinutes: 0, status: 'active', endedAt: null, createdAt: Date.now() });
  batch.update(doc(col('racquets'), data.racquetId), { activeStringJobId: ref.id });
  batch.commit().catch(fail);
  return ref.id;
}

export type StringJobEdit = Pick<
  StringJob,
  | 'setup' | 'mainsType' | 'crossesType' | 'mainsBrand' | 'mainsModel' | 'crossesBrand' | 'crossesModel'
  | 'mainsName' | 'crossesName' | 'gauge' | 'tensionMain' | 'tensionCross' | 'strungAt' | 'cost'
>;

/** Edits the details of a string (active or past). Playtime, status and cut info are untouched. */
export function updateStringJob(id: string, data: StringJobEdit): void {
  updateDoc(doc(col('stringJobs'), id), { ...data }).catch(fail);
}

/** Ends the active string. The racquet is then unstrung until a new string is added. */
export function cutStringJob(job: StringJob, endedAt: string, reason: CutReason): void {
  const batch = writeBatch(db);
  batch.update(doc(col('stringJobs'), job.id), { status: 'cut', endedAt, endReason: reason });
  batch.update(doc(col('racquets'), job.racquetId), { activeStringJobId: null });
  batch.commit().catch(fail);
}

export function logSession(
  data: Pick<Session, 'stringJobId' | 'racquetId' | 'playedAt' | 'minutes'> & { remark: string },
): void {
  const batch = writeBatch(db);
  batch.set(doc(col('sessions')), { ...data, createdAt: Date.now() });
  batch.update(doc(col('stringJobs'), data.stringJobId), { playedMinutes: increment(data.minutes) });
  batch.commit().catch(fail);
}

export function updateSession(old: Session, data: Pick<Session, 'playedAt' | 'minutes'> & { remark: string }): void {
  const batch = writeBatch(db);
  batch.update(doc(col('sessions'), old.id), data);
  batch.update(doc(col('stringJobs'), old.stringJobId), { playedMinutes: increment(data.minutes - old.minutes) });
  batch.commit().catch(fail);
}

export function deleteSession(s: Session): void {
  const batch = writeBatch(db);
  batch.delete(doc(col('sessions'), s.id));
  batch.update(doc(col('stringJobs'), s.stringJobId), { playedMinutes: increment(-s.minutes) });
  batch.commit().catch(fail);
}

export function deleteStringJob(job: StringJob): void {
  const batch = writeBatch(db);
  batch.delete(doc(col('stringJobs'), job.id));
  for (const s of get(sessions)) if (s.stringJobId === job.id) batch.delete(doc(col('sessions'), s.id));
  if (job.status === 'active') batch.update(doc(col('racquets'), job.racquetId), { activeStringJobId: null });
  batch.commit().catch(fail);
}

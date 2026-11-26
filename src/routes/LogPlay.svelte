<script lang="ts">
  import { logSession, racquets, say, stringJobs } from '../lib/db';
  import { toDateStr } from '../lib/restring';
  import { back, go } from '../lib/router';
  import type { SessionKind } from '../lib/types';

  let { racquetId }: { racquetId: string } = $props();

  const racquet = $derived($racquets.find((r) => r.id === racquetId));
  const job = $derived($stringJobs.find((j) => j.id === racquet?.activeStringJobId && j.status === 'active'));

  const today = toDateStr(new Date());
  let playedAt = $state(today);
  let minutes = $state<number | null>(60);
  let kind = $state<SessionKind>('practice');
  const quick = [30, 60, 90, 120];

  // Live timer survives closing the app: only the start time is stored.
  const timerKey = $derived(`restring.timer.${racquetId}`);
  let startedAt = $state<number | null>(null);
  let now = $state(Date.now());

  $effect(() => {
    try {
      const v = localStorage.getItem(timerKey);
      startedAt = v ? Number(v) : null;
    } catch {
      startedAt = null;
    }
  });

  $effect(() => {
    if (startedAt === null) return;
    const t = setInterval(() => (now = Date.now()), 1000);
    return () => clearInterval(t);
  });

  const elapsedMin = $derived(startedAt ? Math.floor((now - startedAt) / 60000) : 0);
  const elapsedLabel = $derived.by(() => {
    if (!startedAt) return '';
    const s = Math.max(0, Math.floor((now - startedAt) / 1000));
    const h = Math.floor(s / 3600);
    const m = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
    const sec = String(s % 60).padStart(2, '0');
    return `${h}:${m}:${sec}`;
  });

  function startTimer() {
    startedAt = Date.now();
    now = startedAt;
    try {
      localStorage.setItem(timerKey, String(startedAt));
    } catch {}
  }

  function stopTimer() {
    if (startedAt === null) return;
    minutes = Math.max(1, Math.round((Date.now() - startedAt) / 60000));
    playedAt = toDateStr(new Date(startedAt));
    startedAt = null;
    try {
      localStorage.removeItem(timerKey);
    } catch {}
  }

  function save(e: Event) {
    e.preventDefault();
    if (!job || !minutes || minutes <= 0) return;
    logSession({
      stringJobId: job.id,
      racquetId,
      playedAt,
      minutes: Math.round(minutes),
      kind,
    });
    say('Play time logged');
    go(`/racquet/${racquetId}`, true);
  }
</script>

<main class="page">
  <div class="topbar">
    <button class="link" onclick={() => back(`/racquet/${racquetId}`)}>‹ Back</button>
    <h1>Log play</h1>
  </div>

  {#if !racquet}
    <p class="muted">Racquet not found.</p>
  {:else if !job}
    <div class="card">
      <p>{racquet.name} has no string yet. Add one before logging play time.</p>
      <a class="btn primary block" style="margin-top:1rem" href="#/racquet/{racquetId}/string">Add string</a>
    </div>
  {:else}
    <p class="muted" style="margin-bottom:0.8rem">{racquet.name}</p>

    <div class="card">
      <div class="muted" style="font-weight:600">Timer (optional)</div>
      {#if startedAt === null}
        <button type="button" class="block" style="margin-top:0.5rem" onclick={startTimer}>▶ Start playing</button>
      {:else}
        <div class="big" style="margin:0.4rem 0">{elapsedLabel}</div>
        <button type="button" class="primary block" onclick={stopTimer}>
          ■ Stop ({Math.max(1, elapsedMin)} min)
        </button>
      {/if}
    </div>

    <form class="card" onsubmit={save}>
      <label>Date<input type="date" bind:value={playedAt} max={today} required /></label>

      <div class="muted" style="font-weight:600;margin-top:0.8rem">Duration (minutes)</div>
      <div class="chips" style="margin:0.4rem 0">
        {#each quick as q}
          <button type="button" class="chip" class:on={minutes === q} onclick={() => (minutes = q)}>{q}</button>
        {/each}
      </div>
      <input type="number" inputmode="numeric" min="1" max="1440" step="1" bind:value={minutes} required />

      <div class="muted" style="font-weight:600;margin-top:0.8rem">Type</div>
      <div class="chips" style="margin-top:0.4rem">
        <button type="button" class="chip" class:on={kind === 'practice'} onclick={() => (kind = 'practice')}>Practice</button>
        <button type="button" class="chip" class:on={kind === 'match'} onclick={() => (kind = 'match')}>Match</button>
      </div>

      <button class="primary block" style="margin-top:1rem">Save</button>
    </form>
  {/if}
</main>

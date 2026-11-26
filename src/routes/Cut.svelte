<script lang="ts">
  import { racquetTitle, stringNames } from '../lib/catalog';
  import { cutStringJob, racquets, say, stringJobs } from '../lib/db';
  import { CUT_REASONS, daysBetweenDates, fmtHours, jobLabel, toDateStr } from '../lib/restring';
  import { back, go } from '../lib/router';
  import type { CutReason } from '../lib/types';

  let { racquetId }: { racquetId: string } = $props();

  const racquet = $derived($racquets.find((r) => r.id === racquetId));
  const job = $derived($stringJobs.find((j) => j.id === racquet?.activeStringJobId && j.status === 'active'));
  const names = $derived(job ? stringNames(job) : null);

  const today = toDateStr(new Date());
  let endedAt = $state(today);
  let reason = $state<CutReason | null>(null);

  const days = $derived(job ? Math.max(0, daysBetweenDates(job.strungAt, endedAt)) : 0);

  function save(e: Event) {
    e.preventDefault();
    if (!job || !reason) return;
    cutStringJob(job, endedAt, reason);
    say('String cut. Add the new string when ready.');
    go(`/racquet/${racquetId}`, true);
  }
</script>

<main class="page">
  <div class="topbar">
    <button class="link" onclick={() => back(`/racquet/${racquetId}`)}>‹ Back</button>
    <h1>Cut string</h1>
  </div>

  {#if !racquet}
    <p class="muted">Racquet not found.</p>
  {:else if !job || !names}
    <div class="card">
      <p>{racquetTitle(racquet)} has no string to cut.</p>
      <a class="btn primary block" style="margin-top:1rem" href="#/racquet/{racquetId}/string">Add string</a>
    </div>
  {:else}
    <section class="card">
      <h3>{racquetTitle(racquet)}</h3>
      <p class="muted">{jobLabel(job)} · {names.mains}{job.setup === 'hybrid' ? ` / ${names.crosses}` : ''}</p>
      <div class="tiles" style="margin:0.9rem 0 0">
        <div class="tile"><div class="k">Strung</div><div class="v">{job.strungAt}</div></div>
        <div class="tile"><div class="k">Days in use</div><div class="v">{days}</div></div>
        <div class="tile" style="grid-column:1 / -1"><div class="k">Total played</div><div class="v">{fmtHours(job.playedMinutes)}</div></div>
      </div>
    </section>

    <form class="card" onsubmit={save}>
      <label>Cut date<input type="date" bind:value={endedAt} min={job.strungAt} max={today} required /></label>

      <div class="muted" style="font-weight:600;margin-top:0.85rem">Why are you cutting it?</div>
      <div class="chips" style="margin-top:0.4rem">
        {#each CUT_REASONS as r (r.value)}
          <button type="button" class="chip" class:on={reason === r.value} onclick={() => (reason = r.value)}>
            {r.label}
          </button>
        {/each}
      </div>

      <p class="muted" style="margin-top:0.9rem">
        The string moves to history with its dates and playtime. The racquet becomes unstrung until you add a new string.
      </p>
      <button class="primary block" style="margin-top:1rem" disabled={!reason}>Cut string</button>
    </form>
  {/if}
</main>

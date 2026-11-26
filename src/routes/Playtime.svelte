<script lang="ts">
  import { racquetTitle } from '../lib/catalog';
  import { logSession, racquets, say, stringJobs } from '../lib/db';
  import { fmtHours, toDateStr } from '../lib/restring';
  import { back, go } from '../lib/router';

  let { racquetId }: { racquetId: string } = $props();

  const racquet = $derived($racquets.find((r) => r.id === racquetId));
  const job = $derived($stringJobs.find((j) => j.id === racquet?.activeStringJobId && j.status === 'active'));

  const today = toDateStr(new Date());
  let playedAt = $state(today);
  let hours = $state<number | null>(1);
  let remark = $state('');
  const quick = [0.5, 1, 1.5, 2, 3];

  function save(e: Event) {
    e.preventDefault();
    if (!job || !hours || hours <= 0) return;
    logSession({
      stringJobId: job.id,
      racquetId,
      playedAt,
      minutes: Math.round(hours * 60),
      remark: remark.trim(),
    });
    say('Playtime added');
    go(`/racquet/${racquetId}`, true);
  }
</script>

<main class="page">
  <div class="topbar">
    <button class="link" onclick={() => back(`/racquet/${racquetId}`)}>‹ Back</button>
    <h1>Add playtime</h1>
  </div>

  {#if !racquet}
    <p class="muted">Racquet not found.</p>
  {:else if !job}
    <div class="card">
      <p>{racquetTitle(racquet)} has no string yet. Add one before adding playtime.</p>
      <a class="btn primary block" style="margin-top:1rem" href="#/racquet/{racquetId}/string">Add string</a>
    </div>
  {:else}
    <p class="muted" style="margin-bottom:0.8rem">
      {racquetTitle(racquet)} · total so far {fmtHours(job.playedMinutes)}
    </p>

    <form class="card" onsubmit={save}>
      <label>Date<input type="date" bind:value={playedAt} max={today} required /></label>

      <div class="muted" style="font-weight:600;margin-top:0.85rem">Duration (hours)</div>
      <div class="chips" style="margin:0.4rem 0">
        {#each quick as q}
          <button type="button" class="chip" class:on={hours === q} onclick={() => (hours = q)}>{q}</button>
        {/each}
      </div>
      <input type="number" inputmode="decimal" min="0.25" step="0.25" bind:value={hours} required />

      <label>
        Remark (optional)
        <input bind:value={remark} placeholder="e.g. Sunday match, hard court" maxlength="80" />
      </label>

      <button class="primary block" style="margin-top:1.2rem">Add</button>
    </form>
  {/if}
</main>

<script lang="ts">
  import Ring from '../lib/Ring.svelte';
  import { racquetNickname, racquetTitle } from '../lib/catalog';
  import { limits, profile, racquets, sessions, stringJobs } from '../lib/db';
  import { evaluate, jobLabel } from '../lib/restring';

  const cards = $derived(
    $racquets.map((r) => {
      const job = $stringJobs.find((j) => j.id === r.activeStringJobId && j.status === 'active') ?? null;
      return { r, job, ev: job ? evaluate(job, $sessions, $limits) : null };
    }),
  );
  const attention = $derived(cards.filter((c) => c.ev && c.ev.status !== 'good').length);
  const first = $derived($profile?.name?.split(' ')[0] ?? '');

  const left = (days: number, status: string) =>
    status === 'now' ? 'Restring now' : days === 0 ? 'Restring today' : `~${days} day${days === 1 ? '' : 's'} left`;
</script>

<main class="page with-nav">
  <header class="hero">
    <div class="row between">
      <div>
        <p class="muted">Welcome back</p>
        <h1>{first ? `Hi, ${first}` : 'Your racquets'}</h1>
      </div>
      <a class="btn" href="#/racquet/new">+ Racquet</a>
    </div>
    <p style="margin-top:0.8rem">
      {#if cards.length === 0}
        Add a racquet to start tracking string life.
      {:else if attention > 0}
        <strong>{attention}</strong> of {cards.length} racquet{cards.length === 1 ? '' : 's'} need a restring soon.
      {:else}
        All {cards.length} racquet{cards.length === 1 ? ' is' : 's are'} in good shape.
      {/if}
    </p>
  </header>

  {#if cards.length === 0}
    <div class="card">
      <h3>Add your first racquet</h3>
      <p class="muted">Pick your brand and model, then the string you use, and log each time you play.</p>
      <a class="btn primary block" style="margin-top:1rem" href="#/racquet/new">Add racquet</a>
    </div>
  {/if}

  {#each cards as { r, job, ev } (r.id)}
    <section class="card racq">
      <a class="racq-main" href="#/racquet/{r.id}">
        {#if job && ev}
          <Ring pct={ev.pct} status={ev.status} />
        {:else}
          <div class="ring" style="width:72px;height:72px"><span class="pct muted">–</span></div>
        {/if}
        <div class="grow">
          <h3>{racquetTitle(r)}</h3>
          {#if racquetNickname(r)}<p class="muted">{racquetNickname(r)}</p>{/if}
          {#if job && ev}
            <p class="muted">{jobLabel(job)}</p>
            <p><span class="badge {ev.status}">{left(ev.daysLeft, ev.status)}</span></p>
          {:else}
            <p class="muted">Unstrung</p>
          {/if}
        </div>
        <span class="muted" aria-hidden="true">›</span>
      </a>
      <div class="racq-actions">
        {#if job}
          <a class="btn primary grow" href="#/racquet/{r.id}/playtime">+ Add playtime</a>
          <a class="btn grow" href="#/racquet/{r.id}/cut">Cut string</a>
        {:else}
          <a class="btn primary grow" href="#/racquet/{r.id}/string">Add string</a>
        {/if}
      </div>
    </section>
  {/each}
</main>

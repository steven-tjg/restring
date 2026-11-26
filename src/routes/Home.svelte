<script lang="ts">
  import JobStatus from '../lib/JobStatus.svelte';
  import { limits, profile, racquets, sessions, stringJobs } from '../lib/db';
  import { evaluate } from '../lib/restring';

  const cards = $derived(
    $racquets.map((r) => {
      const job = $stringJobs.find((j) => j.id === r.activeStringJobId && j.status === 'active') ?? null;
      return { r, job, ev: job ? evaluate(job, $sessions, $limits) : null };
    }),
  );
</script>

<main class="page">
  <div class="topbar">
    <h1>Hi{$profile?.name ? `, ${$profile.name.split(' ')[0]}` : ''} 👋</h1>
    <a class="btn" href="#/settings" aria-label="Settings">⚙️</a>
  </div>

  {#if cards.length === 0}
    <div class="card">
      <h2 style="margin-top:0">Add your first racquet</h2>
      <p class="muted">Then tell us what string is in it and log each time you play.</p>
      <a class="btn primary block" style="margin-top:1rem" href="#/racquet/new">Add racquet</a>
    </div>
  {/if}

  {#each cards as { r, job, ev } (r.id)}
    <section class="card">
      <a href="#/racquet/{r.id}" style="color:inherit;text-decoration:none">
        <div class="row between">
          <div class="grow">
            <h2 style="margin:0">{r.name}</h2>
            {#if r.brand || r.model}<p class="muted">{[r.brand, r.model].filter(Boolean).join(' ')}</p>{/if}
          </div>
          <span class="muted">›</span>
        </div>
        <div style="margin-top:0.6rem">
          {#if job && ev}
            <JobStatus {job} {ev} />
          {:else}
            <p class="muted">No string recorded yet.</p>
          {/if}
        </div>
      </a>
      <div class="row" style="margin-top:0.8rem">
        {#if job}
          <a class="btn primary grow" href="#/racquet/{r.id}/log">+ Log play</a>
          <a class="btn grow" href="#/racquet/{r.id}/string">Restrung</a>
        {:else}
          <a class="btn primary block" href="#/racquet/{r.id}/string">Add string</a>
        {/if}
      </div>
    </section>
  {/each}

  {#if cards.length > 0}
    <a class="btn primary fab" href="#/racquet/new">+ Racquet</a>
  {/if}
</main>

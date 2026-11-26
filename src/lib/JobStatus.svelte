<script lang="ts">
  import Ring from './Ring.svelte';
  import { jobLabel, type Evaluation } from './restring';
  import type { StringJob } from './types';

  let { job, ev, showTips = false }: { job: StringJob; ev: Evaluation; showTips?: boolean } = $props();

  const label = $derived(
    ev.status === 'now' ? 'Restring now' : ev.status === 'soon' ? 'Restring soon' : 'Good',
  );
  const fmt = (d: Date) => d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
  const when = $derived(
    ev.status === 'now'
      ? 'Limit reached'
      : ev.daysLeft === 0
        ? 'Restring today'
        : `Restring in ~${ev.daysLeft} day${ev.daysLeft === 1 ? '' : 's'} (around ${fmt(ev.restringOn)})`,
  );
</script>

<div class="row" style="gap:1rem">
  <Ring pct={ev.pct} status={ev.status} />
  <div class="grow">
    <div class="row between">
      <strong>{jobLabel(job)}</strong>
      <span class="badge {ev.status}">{label}</span>
    </div>
    <p class="muted">{ev.playedHours.toFixed(1)} / {ev.limit.hours} h · {ev.daysSince} / {ev.limit.days} days</p>
    <p><strong>{when}</strong></p>
  </div>
</div>

{#if ev.status !== 'now' && ev.weeklyHours === 0}
  <p class="muted" style="margin-top:0.5rem">Add playtime to improve this estimate.</p>
{/if}

{#if showTips}
  <ul class="tips">
    {#each ev.tips as t}
      <li>{t}</li>
    {/each}
  </ul>
{/if}

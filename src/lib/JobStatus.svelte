<script lang="ts">
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

<div class="row between">
  <strong>{jobLabel(job)}</strong>
  <span class="badge {ev.status}">{label}</span>
</div>

<div class="bar {ev.status}" role="progressbar" aria-valuenow={Math.round(ev.pct * 100)} aria-valuemin="0" aria-valuemax="100">
  <span style="width:{Math.min(100, ev.pct * 100)}%"></span>
</div>

<div class="row between muted">
  <span>{ev.playedHours.toFixed(1)} / {ev.limit.hours} h played</span>
  <span>{ev.daysSince} / {ev.limit.days} days</span>
</div>

<p style="margin-top:0.5rem"><strong>{when}</strong></p>
{#if ev.status !== 'now' && ev.weeklyHours === 0}
  <p class="muted">Log your play time to improve this estimate.</p>
{/if}

{#if showTips}
  <ul class="tips">
    {#each ev.tips as t}
      <li>{t}</li>
    {/each}
  </ul>
{/if}

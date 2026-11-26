<script lang="ts">
  import JobStatus from '../lib/JobStatus.svelte';
  import { racquetNickname, racquetTitle, stringNames } from '../lib/catalog';
  import { deleteSession, deleteStringJob, limits, racquets, sessions, stringJobs, updateSession } from '../lib/db';
  import { costPerHour, daysBetweenDates, endLabel, evaluate, fmtHours, jobLabel, toDateStr } from '../lib/restring';
  import { back } from '../lib/router';
  import type { Session, StringJob } from '../lib/types';

  let { id }: { id: string } = $props();

  const racquet = $derived($racquets.find((r) => r.id === id));
  const jobs = $derived($stringJobs.filter((j) => j.racquetId === id));
  const active = $derived(jobs.find((j) => j.id === racquet?.activeStringJobId && j.status === 'active'));
  const history = $derived(jobs.filter((j) => j.id !== active?.id));
  const ev = $derived(active ? evaluate(active, $sessions, $limits) : null);
  const activeSessions = $derived($sessions.filter((s) => s.stringJobId === active?.id));
  const names = $derived(active ? stringNames(active) : null);
  const lifetimeMinutes = $derived(jobs.reduce((sum, j) => sum + j.playedMinutes, 0));

  const sessionsOf = (j: StringJob) => $sessions.filter((s) => s.stringJobId === j.id);
  const remarkOf = (s: Session) => s.remark || (s.kind === 'match' ? 'Match' : s.kind === 'practice' ? 'Practice' : '');

  const today = toDateStr(new Date());
  let editing = $state<Session | null>(null);
  let eDate = $state('');
  let eHours = $state<number | null>(null);
  let eRemark = $state('');

  function startEdit(s: Session) {
    editing = s;
    eDate = s.playedAt;
    eHours = +(s.minutes / 60).toFixed(2);
    eRemark = s.remark ?? '';
  }

  function saveEdit(e: Event) {
    e.preventDefault();
    if (!editing || !eHours || eHours <= 0) return;
    updateSession(editing, { playedAt: eDate, minutes: Math.round(eHours * 60), remark: eRemark.trim() });
    editing = null;
  }

  function remove(s: Session) {
    if (confirm(`Delete this ${fmtHours(s.minutes)} entry?`)) deleteSession(s);
  }

  const usedDays = (j: StringJob) => (j.endedAt ? Math.max(0, daysBetweenDates(j.strungAt, j.endedAt)) : 0);
  const pace = (j: StringJob) => {
    const d = usedDays(j);
    return d > 0 ? j.playedMinutes / 60 / (d / 7) : 0;
  };

  function removeJob(j: StringJob) {
    if (confirm('Delete this string and its playtime entries? This cannot be undone.')) deleteStringJob(j);
  }

  const tension = (j: StringJob) => {
    if (!j.tensionMain && !j.tensionCross) return '–';
    if (j.tensionMain === j.tensionCross) return `${j.tensionMain} ${j.unit}`;
    return `${j.tensionMain ?? '–'} / ${j.tensionCross ?? '–'} ${j.unit}`;
  };
</script>

<main class="page with-nav">
  <header class="hero">
    <div class="row">
      <button class="link" onclick={() => back('/')} aria-label="Back">‹ Back</button>
      <span class="grow"></span>
      {#if racquet}<a class="btn" href="#/racquet/{id}/edit">Edit</a>{/if}
    </div>
    {#if racquet}
      <h1 style="margin-top:0.6rem">{racquetTitle(racquet)}</h1>
      {#if racquetNickname(racquet)}<p class="muted">{racquetNickname(racquet)}</p>{/if}
    {/if}
  </header>

  {#if !racquet}
    <p class="muted">Racquet not found.</p>
  {:else}
    {#if active && ev && names}
      <section class="card">
        <JobStatus job={active} {ev} showTips />
        <div class="row" style="margin-top:1rem">
          <a class="btn primary grow" href="#/racquet/{id}/playtime">+ Add playtime</a>
          <a class="btn grow" href="#/racquet/{id}/cut">Cut string</a>
        </div>
      </section>

      <div class="tiles">
        {#if active.setup === 'hybrid'}
          <div class="tile"><div class="k">Mains</div><div class="v">{names.mains}</div></div>
          <div class="tile"><div class="k">Crosses</div><div class="v">{names.crosses}</div></div>
        {:else}
          <div class="tile" style="grid-column:1 / -1"><div class="k">String</div><div class="v">{names.mains}</div></div>
        {/if}
        <div class="tile"><div class="k">Total played</div><div class="v">{fmtHours(active.playedMinutes)}</div></div>
        <div class="tile"><div class="k">Pace</div><div class="v">{ev.weeklyHours.toFixed(1)} h / week</div></div>
        <div class="tile"><div class="k">Tension (M / X)</div><div class="v">{tension(active)}</div></div>
        <div class="tile"><div class="k">Gauge</div><div class="v">{active.gauge || '–'}</div></div>
        <div class="tile" style="grid-column:1 / -1"><div class="k">Strung</div><div class="v">{active.strungAt}</div></div>
      </div>

      <h2>Playtime · {fmtHours(active.playedMinutes)} total</h2>
      <section class="card list">
        {#each activeSessions as s (s.id)}
          <div class="item">
            {#if editing?.id === s.id}
              <form onsubmit={saveEdit}>
                <label>Date<input type="date" bind:value={eDate} max={today} required /></label>
                <label>Hours<input type="number" inputmode="decimal" min="0.25" step="0.25" bind:value={eHours} required /></label>
                <label>Remark<input bind:value={eRemark} maxlength="80" /></label>
                <div class="row" style="margin-top:0.8rem">
                  <button class="primary grow">Save</button>
                  <button type="button" class="grow" onclick={() => (editing = null)}>Cancel</button>
                </div>
              </form>
            {:else}
              <div class="row between">
                <div class="grow">
                  <strong>{fmtHours(s.minutes)}</strong>
                  <span class="muted"> · {s.playedAt}</span>
                  {#if remarkOf(s)}<div class="muted">{remarkOf(s)}</div>{/if}
                </div>
                <div class="row">
                  <button class="link" onclick={() => startEdit(s)}>Edit</button>
                  <button class="link" style="color:var(--danger)" onclick={() => remove(s)}>Delete</button>
                </div>
              </div>
            {/if}
          </div>
        {:else}
          <p class="muted">No playtime added on this string yet.</p>
        {/each}
      </section>
    {:else}
      <section class="card">
        <h3>Unstrung</h3>
        <p class="muted">Add the string you put on this racquet to start tracking it.</p>
        <a class="btn primary block" style="margin-top:1rem" href="#/racquet/{id}/string">Add string</a>
      </section>
    {/if}

    {#if history.length}
      <h2>String history · {history.length} previous · {fmtHours(lifetimeMinutes)} lifetime</h2>
      {#each history as j (j.id)}
        {@const n = stringNames(j)}
        {@const entries = sessionsOf(j)}
        <details class="card hist">
          <summary>
            <div class="grow">
              <strong>{jobLabel(j)}</strong>
              <span class="badge {endLabel(j) === 'Broke' ? 'now' : 'soon'}">{endLabel(j)}</span>
              <div class="muted">{j.strungAt} → {j.endedAt ?? '…'} · {fmtHours(j.playedMinutes)}</div>
            </div>
          </summary>

          <div class="tiles" style="margin-top:0.8rem">
            {#if j.setup === 'hybrid'}
              <div class="tile"><div class="k">Mains</div><div class="v">{n.mains}</div></div>
              <div class="tile"><div class="k">Crosses</div><div class="v">{n.crosses}</div></div>
            {:else}
              <div class="tile" style="grid-column:1 / -1"><div class="k">String</div><div class="v">{n.mains}</div></div>
            {/if}
            <div class="tile"><div class="k">Tension (M / X)</div><div class="v">{tension(j)}</div></div>
            <div class="tile"><div class="k">Gauge</div><div class="v">{j.gauge || '–'}</div></div>
            <div class="tile"><div class="k">Days in use</div><div class="v">{usedDays(j)}</div></div>
            <div class="tile"><div class="k">Avg pace</div><div class="v">{pace(j).toFixed(1)} h / week</div></div>
            {#if j.cost}
              <div class="tile"><div class="k">Cost</div><div class="v">{j.cost}</div></div>
              {#if costPerHour(j.cost, j.playedMinutes) !== null}
                <div class="tile"><div class="k">Cost / hour</div><div class="v">{costPerHour(j.cost, j.playedMinutes)?.toFixed(2)}</div></div>
              {/if}
            {/if}
          </div>

          <div class="list">
            {#each entries as s (s.id)}
              <div class="item">
                <strong>{fmtHours(s.minutes)}</strong>
                <span class="muted"> · {s.playedAt}</span>
                {#if remarkOf(s)}<div class="muted">{remarkOf(s)}</div>{/if}
              </div>
            {:else}
              <p class="muted">No playtime was recorded on this string.</p>
            {/each}
          </div>

          <button class="link" style="color:var(--danger);margin-top:0.6rem" onclick={() => removeJob(j)}>
            Delete this string
          </button>
        </details>
      {/each}
    {/if}
  {/if}
</main>

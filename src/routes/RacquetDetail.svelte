<script lang="ts">
  import JobStatus from '../lib/JobStatus.svelte';
  import { deleteSession, deleteStringJob, limits, markBroken, racquets, sessions, stringJobs, updateSession } from '../lib/db';
  import { evaluate, jobLabel, toDateStr } from '../lib/restring';
  import { back } from '../lib/router';
  import { typeShort } from '../lib/stringTypes';
  import type { Session, SessionKind, StringJob } from '../lib/types';

  let { id }: { id: string } = $props();

  const racquet = $derived($racquets.find((r) => r.id === id));
  const jobs = $derived($stringJobs.filter((j) => j.racquetId === id));
  const active = $derived(jobs.find((j) => j.id === racquet?.activeStringJobId && j.status === 'active'));
  const history = $derived(jobs.filter((j) => j.id !== active?.id));
  const ev = $derived(active ? evaluate(active, $sessions, $limits) : null);
  const activeSessions = $derived($sessions.filter((s) => s.stringJobId === active?.id));

  const today = toDateStr(new Date());
  let editing = $state<Session | null>(null);
  let eDate = $state('');
  let eMin = $state<number | null>(null);
  let eKind = $state<SessionKind>('practice');

  function startEdit(s: Session) {
    editing = s;
    eDate = s.playedAt;
    eMin = s.minutes;
    eKind = s.kind;
  }

  function saveEdit(e: Event) {
    e.preventDefault();
    if (!editing || !eMin || eMin <= 0) return;
    updateSession(editing, { playedAt: eDate, minutes: Math.round(eMin), kind: eKind });
    editing = null;
  }

  function remove(s: Session) {
    if (confirm(`Delete this ${s.minutes} min entry?`)) deleteSession(s);
  }

  function broken(j: StringJob) {
    if (confirm('Mark this string as broken? You can then add a new string.')) markBroken(j);
  }

  function removeJob(j: StringJob) {
    if (confirm('Delete this string and its play log? This cannot be undone.')) deleteStringJob(j);
  }

  const hours = (m: number) => (m / 60).toFixed(1);
  const tension = (j: StringJob) =>
    j.tensionMain
      ? j.setup === 'full' || j.tensionMain === j.tensionCross
        ? `${j.tensionMain} ${j.unit}`
        : `${j.tensionMain} / ${j.tensionCross ?? '–'} ${j.unit}`
      : '';
</script>

<main class="page">
  <div class="topbar">
    <button class="link" onclick={() => back('/')}>‹ Back</button>
    <h1>{racquet?.name ?? 'Racquet'}</h1>
    {#if racquet}<a class="btn" href="#/racquet/{id}/edit" aria-label="Edit racquet">✏️</a>{/if}
  </div>

  {#if !racquet}
    <p class="muted">Racquet not found.</p>
  {:else}
    {#if racquet.brand || racquet.model}<p class="muted" style="margin-bottom:0.8rem">{[racquet.brand, racquet.model].filter(Boolean).join(' ')}</p>{/if}

    {#if active && ev}
      <section class="card">
        <JobStatus job={active} {ev} showTips />
        <p class="muted" style="margin-top:0.6rem">
          Strung {active.strungAt}{active.mainsName ? ` · ${active.mainsName}` : ''}{active.setup === 'hybrid' && active.crossesName ? ` / ${active.crossesName}` : ''}
          {#if tension(active)} · {tension(active)}{/if}
        </p>
        <div class="row" style="margin-top:0.8rem">
          <a class="btn primary grow" href="#/racquet/{id}/log">+ Log play</a>
          <a class="btn grow" href="#/racquet/{id}/string">Restrung</a>
        </div>
        <button class="link" style="margin-top:0.4rem" onclick={() => broken(active)}>String broke</button>
      </section>

      <h2>Play log</h2>
      <section class="card list">
        {#each activeSessions as s (s.id)}
          <div class="item">
            {#if editing?.id === s.id}
              <form onsubmit={saveEdit}>
                <label>Date<input type="date" bind:value={eDate} max={today} required /></label>
                <label>Minutes<input type="number" inputmode="numeric" min="1" max="1440" bind:value={eMin} required /></label>
                <div class="chips" style="margin:0.6rem 0">
                  <button type="button" class="chip" class:on={eKind === 'practice'} onclick={() => (eKind = 'practice')}>Practice</button>
                  <button type="button" class="chip" class:on={eKind === 'match'} onclick={() => (eKind = 'match')}>Match</button>
                </div>
                <div class="row">
                  <button class="primary grow">Save</button>
                  <button type="button" class="grow" onclick={() => (editing = null)}>Cancel</button>
                </div>
              </form>
            {:else}
              <div class="row between">
                <div>
                  <strong>{s.minutes} min</strong>
                  <span class="muted"> · {s.kind === 'match' ? 'Match' : 'Practice'}</span>
                  <div class="muted">{s.playedAt}</div>
                </div>
                <div class="row">
                  <button class="link" onclick={() => startEdit(s)}>Edit</button>
                  <button class="link" style="color:var(--danger)" onclick={() => remove(s)}>Delete</button>
                </div>
              </div>
            {/if}
          </div>
        {:else}
          <p class="muted">No play logged on this string yet.</p>
        {/each}
      </section>
    {:else}
      <section class="card">
        <p>No active string on this racquet.</p>
        <a class="btn primary block" style="margin-top:1rem" href="#/racquet/{id}/string">Add string</a>
      </section>
    {/if}

    {#if history.length}
      <h2>String history</h2>
      <section class="card list">
        {#each history as j (j.id)}
          <div class="item">
            <div class="row between">
              <div>
                <strong>{jobLabel(j)}</strong>
                <span class="muted"> · {hours(j.playedMinutes)} h</span>
                <div class="muted">
                  {j.strungAt} → {j.endedAt ?? '…'} · {j.status === 'broken' ? 'broke' : 'replaced'}
                  {#if j.mainsName} · {j.mainsName}{/if}
                </div>
              </div>
              <button class="link" style="color:var(--danger)" onclick={() => removeJob(j)}>Delete</button>
            </div>
          </div>
        {/each}
      </section>
    {/if}
  {/if}
</main>

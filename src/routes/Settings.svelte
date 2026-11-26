<script lang="ts">
  import { logOut } from '../lib/auth';
  import { limits, profile, saveProfile, say, setUnit } from '../lib/db';
  import { go } from '../lib/router';
  import { DEFAULT_LIMITS, STRING_TYPES } from '../lib/stringTypes';
  import type { Limits, StringType, Unit } from '../lib/types';

  let name = $state($profile?.name ?? '');
  let draft = $state<Limits>(structuredClone($limits));

  function saveName(e: Event) {
    e.preventDefault();
    if (!name.trim()) return;
    saveProfile({ name: name.trim() });
    say('Name saved');
  }

  function saveLimits(e: Event) {
    e.preventDefault();
    const custom: Partial<Limits> = {};
    for (const t of STRING_TYPES) {
      const l = draft[t.value];
      const d = DEFAULT_LIMITS[t.value];
      const hours = Number(l.hours);
      const days = Number(l.days);
      if (!(hours > 0 && days > 0)) return say('Hours and days must be above 0');
      if (hours !== d.hours || days !== d.days) custom[t.value] = { hours, days };
    }
    saveProfile({ customLimits: custom });
    say('Limits saved');
  }

  function resetLimits() {
    draft = structuredClone(DEFAULT_LIMITS);
    saveProfile({ customLimits: {} });
    say('Limits reset');
  }

  async function logout() {
    if (!confirm('Log out? You will need to sign in again on this device.')) return;
    await logOut();
    go('/login', true);
  }
</script>

<main class="page with-nav">
  <div class="topbar">
    <h1>Settings</h1>
  </div>

  <form class="card" onsubmit={saveName}>
    <h2 style="margin-top:0">Profile</h2>
    <p class="muted">{$profile?.email}</p>
    <label>Name<input bind:value={name} required /></label>
    <button class="primary block" style="margin-top:0.8rem">Save name</button>
  </form>

  <section class="card">
    <h2 style="margin-top:0">Tension unit</h2>
    <div class="chips">
      {#each ['kg', 'lb'] as const as u (u)}
        <button class="chip" class:on={$profile?.unit === u} onclick={() => setUnit(u as Unit)}>{u}</button>
      {/each}
    </div>
  </section>

  <form class="card" onsubmit={saveLimits}>
    <h2 style="margin-top:0">Restring limits</h2>
    <p class="muted">Restring is advised when either limit is reached. Hybrids use the lower limit of mains and crosses.</p>
    {#each STRING_TYPES as t (t.value)}
      <div style="margin-top:0.9rem">
        <strong>{t.label}</strong>
        <div class="row">
          <label class="grow">Hours<input type="number" inputmode="decimal" min="1" step="any" bind:value={draft[t.value as StringType].hours} /></label>
          <label class="grow">Days<input type="number" inputmode="numeric" min="1" step="1" bind:value={draft[t.value as StringType].days} /></label>
        </div>
      </div>
    {/each}
    <div class="row" style="margin-top:1rem">
      <button class="primary grow">Save limits</button>
      <button type="button" class="grow" onclick={resetLimits}>Reset</button>
    </div>
  </form>

  <button class="danger block" onclick={logout}>Log out</button>
</main>

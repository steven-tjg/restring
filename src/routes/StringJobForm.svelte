<script lang="ts">
  import { racquetTitle, stringTypeOf } from '../lib/catalog';
  import { addStringJob, limits, profile, racquets, stringJobs } from '../lib/db';
  import { toDateStr } from '../lib/restring';
  import { back, go } from '../lib/router';
  import StringPicker from '../lib/StringPicker.svelte';
  import type { Setup } from '../lib/types';

  let { racquetId }: { racquetId: string } = $props();

  const racquet = $derived($racquets.find((r) => r.id === racquetId));
  const unit = $derived($profile?.unit ?? 'lb');
  const jobs = $derived($stringJobs.filter((j) => j.racquetId === racquetId));
  const active = $derived(jobs.find((j) => j.id === racquet?.activeStringJobId && j.status === 'active'));
  // Most recent finished string: offered as a one-tap starting point for the next one.
  const last = $derived(
    jobs.filter((j) => j.id !== active?.id).sort((a, b) => b.createdAt - a.createdAt)[0],
  );

  let setup = $state<Setup>('full');
  let mainsBrand = $state('');
  let mainsModel = $state('');
  let crossesBrand = $state('');
  let crossesModel = $state('');
  let gauge = $state('');
  let tensionMain = $state<number | null>(null);
  let tensionCross = $state<number | null>(null);
  let strungAt = $state(toDateStr(new Date()));
  let cost = $state<number | null>(null);

  const today = toDateStr(new Date());

  function useLast() {
    if (!last) return;
    setup = last.setup;
    mainsBrand = last.mainsBrand ?? '';
    mainsModel = last.mainsModel ?? '';
    crossesBrand = last.crossesBrand ?? '';
    crossesModel = last.crossesModel ?? '';
    gauge = last.gauge;
    tensionMain = last.tensionMain;
    tensionCross = last.tensionCross;
  }

  function save(e: Event) {
    e.preventDefault();
    const full = setup === 'full';
    const cBrand = full ? mainsBrand : crossesBrand;
    const cModel = full ? mainsModel : crossesModel;
    const mainsType = stringTypeOf(mainsBrand, mainsModel);
    const crossesType = stringTypeOf(cBrand, cModel);
    if (!mainsType || !crossesType) return;

    addStringJob({
      racquetId,
      setup,
      mainsType,
      crossesType,
      mainsBrand,
      mainsModel,
      crossesBrand: cBrand,
      crossesModel: cModel,
      mainsName: `${mainsBrand} ${mainsModel}`,
      crossesName: `${cBrand} ${cModel}`,
      gauge: gauge.trim(),
      tensionMain: tensionMain || null,
      tensionCross: tensionCross || null,
      unit,
      strungAt,
      cost: cost || null,
    });
    go(`/racquet/${racquetId}`, true);
  }
</script>

<main class="page">
  <div class="topbar">
    <button class="link" onclick={() => back(`/racquet/${racquetId}`)}>‹ Back</button>
    <h1>New string</h1>
  </div>
  {#if racquet}
    <p class="muted" style="margin-bottom:0.8rem">For {racquetTitle(racquet)}.</p>
  {/if}

  {#if active}
    <div class="card">
      <p>This racquet already has a string. Cut it first, then add the new one.</p>
      <a class="btn primary block" style="margin-top:1rem" href="#/racquet/{racquetId}/cut">Cut current string</a>
    </div>
  {:else}
  <form onsubmit={save}>
    {#if last}
      <button type="button" class="block" style="margin-bottom:0.9rem" onclick={useLast}>
        Same as last string
      </button>
    {/if}
    <div class="segment" role="group" aria-label="String setup">
      <button type="button" class:on={setup === 'full'} onclick={() => (setup = 'full')}>Full bed</button>
      <button type="button" class:on={setup === 'hybrid'} onclick={() => (setup = 'hybrid')}>Hybrid</button>
    </div>

    <div class="card" style="margin-top:0.9rem">
      <StringPicker
        title={setup === 'hybrid' ? 'Mains' : 'String'}
        bind:brand={mainsBrand}
        bind:model={mainsModel}
        limits={$limits}
      />
    </div>

    {#if setup === 'hybrid'}
      <div class="card">
        <StringPicker title="Crosses" bind:brand={crossesBrand} bind:model={crossesModel} limits={$limits} />
      </div>
    {/if}

    <div class="card">
      <h2>Tension ({unit})</h2>
      <div class="row">
        <label class="grow">Mains<input type="number" inputmode="decimal" step="0.5" min="0" bind:value={tensionMain} /></label>
        <label class="grow">Crosses<input type="number" inputmode="decimal" step="0.5" min="0" bind:value={tensionCross} /></label>
      </div>
      <label>Gauge<input bind:value={gauge} placeholder="e.g. 1.25 mm or 16L" /></label>
    </div>

    <div class="card">
      <h2>Details</h2>
      <label>Date strung<input type="date" bind:value={strungAt} max={today} required /></label>
      <label>Cost (optional)<input type="number" inputmode="decimal" min="0" step="any" bind:value={cost} /></label>
    </div>

    <button class="primary block">Save string</button>
  </form>
  {/if}
</main>

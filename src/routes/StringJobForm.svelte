<script lang="ts">
  import { addStringJob, limits, profile, racquets } from '../lib/db';
  import { toDateStr } from '../lib/restring';
  import { back, go } from '../lib/router';
  import { STRING_TYPES, typeInfo } from '../lib/stringTypes';
  import type { Setup, StringType } from '../lib/types';

  let { racquetId }: { racquetId: string } = $props();

  const racquet = $derived($racquets.find((r) => r.id === racquetId));
  const unit = $derived($profile?.unit ?? 'kg');

  let setup = $state<Setup>('full');
  let mainsType = $state<StringType>('poly');
  let crossesType = $state<StringType>('natural');
  let mainsName = $state('');
  let crossesName = $state('');
  let gauge = $state('');
  let tensionMain = $state<number | null>(null);
  let tensionCross = $state<number | null>(null);
  let strungAt = $state(toDateStr(new Date()));
  let cost = $state<number | null>(null);

  const today = toDateStr(new Date());

  function save(e: Event) {
    e.preventDefault();
    const full = setup === 'full';
    addStringJob({
      racquetId,
      setup,
      mainsType,
      crossesType: full ? mainsType : crossesType,
      mainsName: mainsName.trim(),
      crossesName: full ? mainsName.trim() : crossesName.trim(),
      gauge: gauge.trim(),
      tensionMain: tensionMain || null,
      tensionCross: full ? tensionMain || null : tensionCross || null,
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
  {#if racquet}<p class="muted" style="margin-bottom:0.8rem">For {racquet.name}. Saving replaces the current string (kept in history).</p>{/if}

  <form class="card" onsubmit={save}>
    <div class="muted" style="font-weight:600">String setup</div>
    <div class="chips" style="margin-top:0.4rem">
      <button type="button" class="chip" class:on={setup === 'full'} onclick={() => (setup = 'full')}>Full bed</button>
      <button type="button" class="chip" class:on={setup === 'hybrid'} onclick={() => (setup = 'hybrid')}>Hybrid</button>
    </div>

    <h2>{setup === 'hybrid' ? 'Mains' : 'String'}</h2>
    <label>
      Type
      <select bind:value={mainsType}>
        {#each STRING_TYPES as t}<option value={t.value}>{t.label}</option>{/each}
      </select>
    </label>
    <p class="muted">Restring around {$limits[mainsType].hours} h or {$limits[mainsType].days} days.</p>
    <label>Brand / name<input bind:value={mainsName} placeholder="e.g. Luxilon ALU Power" /></label>
    <label>Tension ({unit})<input type="number" inputmode="decimal" step="0.5" min="0" bind:value={tensionMain} /></label>

    {#if setup === 'hybrid'}
      <h2>Crosses</h2>
      <label>
        Type
        <select bind:value={crossesType}>
          {#each STRING_TYPES as t}<option value={t.value}>{t.label}</option>{/each}
        </select>
      </label>
      <p class="muted">Restring around {$limits[crossesType].hours} h or {$limits[crossesType].days} days.</p>
      <label>Brand / name<input bind:value={crossesName} placeholder="e.g. Wilson Natural Gut" /></label>
      <label>Tension ({unit})<input type="number" inputmode="decimal" step="0.5" min="0" bind:value={tensionCross} /></label>
    {/if}

    <h2>Details</h2>
    <label>Gauge (optional)<input bind:value={gauge} placeholder="e.g. 1.25 mm / 16L" /></label>
    <label>Date strung<input type="date" bind:value={strungAt} max={today} required /></label>
    <label>Cost (optional)<input type="number" inputmode="decimal" min="0" step="any" bind:value={cost} /></label>

    {#if setup === 'hybrid'}
      <p class="muted" style="margin-top:0.8rem">
        Hybrid {typeInfo(mainsType).short} / {typeInfo(crossesType).short}: timing follows the shorter-lived string.
      </p>
    {/if}

    <button class="primary block" style="margin-top:1rem">Save string</button>
  </form>
</main>

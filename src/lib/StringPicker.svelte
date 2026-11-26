<script lang="ts">
  import { stringBrands, stringModels, stringTypeOf } from './catalog';
  import { typeInfo } from './stringTypes';
  import type { Limits } from './types';

  let {
    title,
    brand = $bindable(''),
    model = $bindable(''),
    limits,
  }: { title: string; brand: string; model: string; limits: Limits } = $props();

  const type = $derived(stringTypeOf(brand, model));
</script>

<h2>{title}</h2>
<label>
  Brand
  <select bind:value={brand} onchange={() => (model = '')} required>
    <option value="" disabled>Select brand</option>
    {#each stringBrands() as b (b)}<option value={b}>{b}</option>{/each}
  </select>
</label>
<label>
  Model
  <select bind:value={model} disabled={!brand} required>
    <option value="" disabled>{brand ? 'Select model' : 'Select brand first'}</option>
    {#each stringModels(brand) as m (m.model)}
      <option value={m.model}>{m.model} ({typeInfo(m.type).short})</option>
    {/each}
  </select>
</label>
{#if type}
  <span class="typechip">{typeInfo(type).label} · restring ~{limits[type].hours} h / {limits[type].days} d</span>
{/if}

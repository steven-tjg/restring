<script lang="ts">
  import { racquetBrands, racquetModels, racquetNickname, withCurrent } from '../lib/catalog';
  import { addRacquet, deleteRacquet, racquets, updateRacquet } from '../lib/db';
  import { back, go } from '../lib/router';

  let { id }: { id?: string } = $props();

  const existing = $derived(id ? $racquets.find((r) => r.id === id) : undefined);

  let brand = $state('');
  let model = $state('');
  let nickname = $state('');
  let loaded = false;

  $effect(() => {
    if (existing && !loaded) {
      loaded = true;
      brand = existing.brand;
      model = existing.model;
      nickname = racquetNickname(existing);
    }
  });

  // Saved values from before the catalog existed stay selectable.
  const brandOptions = $derived(withCurrent(racquetBrands(), brand));
  const modelOptions = $derived(withCurrent(racquetModels(brand), model));

  function save(e: Event) {
    e.preventDefault();
    if (!brand || !model) return;
    const data = { name: nickname.trim() || `${brand} ${model}`, brand, model };
    if (id) {
      updateRacquet(id, data);
      back(`/racquet/${id}`);
    } else {
      const newId = addRacquet(data);
      go(`/racquet/${newId}/string`, true);
    }
  }

  function remove() {
    if (!id) return;
    if (confirm('Delete this racquet and all its string and play history? This cannot be undone.')) {
      deleteRacquet(id);
      go('/', true);
    }
  }
</script>

<main class="page">
  <div class="topbar">
    <button class="link" onclick={() => back('/')}>‹ Back</button>
    <h1>{id ? 'Edit racquet' : 'Add racquet'}</h1>
  </div>

  <form class="card" onsubmit={save}>
    <label>
      Brand
      <select bind:value={brand} onchange={() => (model = '')} required>
        <option value="" disabled>Select brand</option>
        {#each brandOptions as b (b)}<option value={b}>{b}</option>{/each}
      </select>
    </label>
    <label>
      Model
      <select bind:value={model} disabled={!brand} required>
        <option value="" disabled>{brand ? 'Select model' : 'Select brand first'}</option>
        {#each modelOptions as m (m)}<option value={m}>{m}</option>{/each}
      </select>
    </label>
    <label>
      Nickname (optional)
      <input bind:value={nickname} placeholder="e.g. Match racquet" maxlength="40" />
    </label>
    <button class="primary block" style="margin-top:1.2rem">{id ? 'Save' : 'Next: add string'}</button>
  </form>

  {#if id}
    <button class="danger block" onclick={remove}>Delete racquet</button>
  {/if}
</main>

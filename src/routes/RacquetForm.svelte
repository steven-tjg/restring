<script lang="ts">
  import { addRacquet, deleteRacquet, racquets, updateRacquet } from '../lib/db';
  import { back, go } from '../lib/router';

  let { id }: { id?: string } = $props();

  const existing = $derived(id ? $racquets.find((r) => r.id === id) : undefined);

  let name = $state('');
  let brand = $state('');
  let model = $state('');
  let loaded = false;

  $effect(() => {
    if (existing && !loaded) {
      loaded = true;
      name = existing.name;
      brand = existing.brand;
      model = existing.model;
    }
  });

  function save(e: Event) {
    e.preventDefault();
    const data = { name: name.trim(), brand: brand.trim(), model: model.trim() };
    if (!data.name) return;
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
    <label>Name / nickname<input bind:value={name} placeholder="e.g. Match racquet" required /></label>
    <label>Brand<input bind:value={brand} placeholder="e.g. Babolat" /></label>
    <label>Model<input bind:value={model} placeholder="e.g. Pure Aero" /></label>
    <button class="primary block" style="margin-top:1rem">{id ? 'Save' : 'Next: add string'}</button>
  </form>

  {#if id}
    <button class="danger block" onclick={remove}>Delete racquet</button>
  {/if}
</main>

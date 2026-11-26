<script lang="ts">
  import { authReady, user } from './lib/auth';
  import BottomNav from './lib/BottomNav.svelte';
  import { dataReady, startSync, stopSync, syncError, toast } from './lib/db';
  import { go, match, path } from './lib/router';
  import Auth from './routes/Auth.svelte';
  import Cut from './routes/Cut.svelte';
  import Home from './routes/Home.svelte';
  import Playtime from './routes/Playtime.svelte';
  import RacquetDetail from './routes/RacquetDetail.svelte';
  import RacquetForm from './routes/RacquetForm.svelte';
  import Settings from './routes/Settings.svelte';
  import StringJobForm from './routes/StringJobForm.svelte';

  const m = $derived(match($path));
  const isAuthRoute = $derived(m.name === 'login' || m.name === 'signup');
  // Forms hide the nav so the save button is never covered.
  const showNav = $derived(['home', 'settings', 'racquet'].includes(m.name));

  let syncedUid: string | null = null;
  $effect(() => {
    const u = $user;
    if (u && u.uid !== syncedUid) {
      syncedUid = u.uid;
      startSync(u.uid, u.displayName ?? '', u.email ?? '');
    } else if (!u && syncedUid) {
      syncedUid = null;
      stopSync();
    }
  });

  // Signed-in users never see login again; signed-out users only see login/signup.
  $effect(() => {
    if (!$authReady) return;
    if ($user && isAuthRoute) go('/', true);
    else if (!$user && !isAuthRoute) go('/login', true);
  });
</script>

{#if !$authReady}
  <div class="splash">Restring…</div>
{:else if !$user}
  {#if isAuthRoute}
    <Auth mode={m.name === 'signup' ? 'signup' : 'login'} />
  {/if}
{:else if !$dataReady}
  <div class="splash">Loading…</div>
{:else}
  {#if $syncError}
    <div class="page" style="padding-bottom:0"><p class="error card">{$syncError}</p></div>
  {/if}
  {#if m.name === 'home'}
    <Home />
  {:else if m.name === 'settings'}
    <Settings />
  {:else if m.name === 'racquetNew'}
    <RacquetForm />
  {:else if m.name === 'racquet'}
    <RacquetDetail id={m.params.id} />
  {:else if m.name === 'racquetEdit'}
    <RacquetForm id={m.params.id} />
  {:else if m.name === 'stringNew'}
    <StringJobForm racquetId={m.params.id} />
  {:else if m.name === 'stringEdit'}
    <StringJobForm racquetId={m.params.id} jobId={m.params.jobId} />
  {:else if m.name === 'cut'}
    <Cut racquetId={m.params.id} />
  {:else if m.name === 'playtime'}
    <Playtime racquetId={m.params.id} />
  {/if}
  {#if showNav}<BottomNav />{/if}
{/if}

{#if $toast}
  <div class="toast" role="status">{$toast}</div>
{/if}

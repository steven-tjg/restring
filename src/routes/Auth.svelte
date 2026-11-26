<script lang="ts">
  import { friendlyError, logIn, resetPassword, signUp } from '../lib/auth';
  import { go } from '../lib/router';

  let { mode }: { mode: 'login' | 'signup' } = $props();

  let name = $state('');
  let email = $state('');
  let password = $state('');
  let confirm = $state('');
  let error = $state('');
  let info = $state('');
  let busy = $state(false);

  async function submit(e: Event) {
    e.preventDefault();
    error = '';
    info = '';
    if (mode === 'signup') {
      if (!name.trim()) return (error = 'Enter your name.');
      if (password.length < 6) return (error = 'Password must be at least 6 characters.');
      if (password !== confirm) return (error = 'Passwords do not match.');
    }
    busy = true;
    try {
      if (mode === 'signup') await signUp(name.trim(), email.trim(), password);
      else await logIn(email.trim(), password);
      go('/', true);
    } catch (err) {
      error = friendlyError(err);
    } finally {
      busy = false;
    }
  }

  async function forgot() {
    error = '';
    info = '';
    if (!email.trim()) return (error = 'Enter your email first, then tap "Forgot password".');
    try {
      await resetPassword(email.trim());
      info = 'Password reset email sent. Check your inbox.';
    } catch (err) {
      error = friendlyError(err);
    }
  }
</script>

<main class="page">
  <h1>🎾 Restring</h1>
  <p class="muted">Know when your strings are done.</p>

  <form class="card" style="margin-top:1rem" onsubmit={submit}>
    <h2 style="margin-top:0">{mode === 'signup' ? 'Create account' : 'Log in'}</h2>

    {#if mode === 'signup'}
      <label>Name<input bind:value={name} autocomplete="name" required /></label>
    {/if}
    <label>Email<input type="email" bind:value={email} autocomplete="email" required /></label>
    <label
      >Password<input
        type="password"
        bind:value={password}
        autocomplete={mode === 'signup' ? 'new-password' : 'current-password'}
        required
      /></label
    >
    {#if mode === 'signup'}
      <label
        >Confirm password<input type="password" bind:value={confirm} autocomplete="new-password" required /></label
      >
    {/if}

    {#if error}<p class="error">{error}</p>{/if}
    {#if info}<p class="muted">{info}</p>{/if}

    <button class="primary block" style="margin-top:1rem" disabled={busy}>
      {busy ? 'Please wait…' : mode === 'signup' ? 'Sign up' : 'Log in'}
    </button>

    {#if mode === 'login'}
      <p style="margin-top:0.8rem">
        <button type="button" class="link" onclick={forgot}>Forgot password?</button>
      </p>
    {/if}
  </form>

  <p class="muted" style="text-align:center">
    {#if mode === 'signup'}
      Already have an account? <a href="#/login">Log in</a>
    {:else}
      New here? <a href="#/signup">Create an account</a>
    {/if}
  </p>
</main>

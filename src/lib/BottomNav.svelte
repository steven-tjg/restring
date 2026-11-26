<script lang="ts">
  import { match, path as hashPath } from './router';

  const name = $derived(match($hashPath).name);
  const racquetsOn = $derived(name === 'home' || name === 'racquet');
  const settingsOn = $derived(name === 'settings');
</script>

<nav class="nav" aria-label="Main">
  <a href="#/" class:on={racquetsOn} aria-current={racquetsOn ? 'page' : undefined}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
      <ellipse cx="10" cy="9" rx="6" ry="7" /><path d="M14.5 14l6 6M7 4v10M4 9h12" />
    </svg>
    <span>Racquets</span>
  </a>
  <a href="#/settings" class:on={settingsOn} aria-current={settingsOn ? 'page' : undefined}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
      <path d="M4 7h10M18 7h2M4 17h2M10 17h10" /><circle cx="16" cy="7" r="2" /><circle cx="8" cy="17" r="2" />
    </svg>
    <span>Settings</span>
  </a>
</nav>

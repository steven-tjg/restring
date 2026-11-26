<script lang="ts">
  import type { Status } from './restring';

  let { pct, status, size = 72 }: { pct: number; status: Status; size?: number } = $props();

  const stroke = 8;
  const r = $derived((size - stroke) / 2);
  const c = $derived(2 * Math.PI * r);
  const shown = $derived(Math.min(1, Math.max(0, pct)));
  const label = $derived(Math.round(pct * 100));
</script>

<div class="ring {status}" style="width:{size}px;height:{size}px" role="img" aria-label="{label} percent of string life used">
  <svg width={size} height={size} viewBox="0 0 {size} {size}">
    <circle class="track" cx={size / 2} cy={size / 2} {r} fill="none" stroke-width={stroke} />
    <circle
      class="arc"
      cx={size / 2}
      cy={size / 2}
      {r}
      fill="none"
      stroke-width={stroke}
      stroke-linecap="round"
      stroke-dasharray={c}
      stroke-dashoffset={c * (1 - shown)}
    />
  </svg>
  <span class="pct">{label}<small>%</small></span>
</div>

import { readable } from 'svelte/store';

function current(): string {
  const h = location.hash.replace(/^#/, '');
  return h === '' ? '/' : h;
}

export const path = readable(current(), (set) => {
  const onChange = () => set(current());
  window.addEventListener('hashchange', onChange);
  onChange();
  return () => window.removeEventListener('hashchange', onChange);
});

export function go(to: string, replace = false): void {
  if (replace) location.replace(`#${to}`);
  else location.hash = to;
}

export function back(fallback = '/'): void {
  if (history.length > 1) history.back();
  else go(fallback, true);
}

export interface Match {
  name: string;
  params: Record<string, string>;
}

const ROUTES: Array<[string, string]> = [
  ['home', '/'],
  ['login', '/login'],
  ['signup', '/signup'],
  ['settings', '/settings'],
  ['racquetNew', '/racquet/new'],
  ['racquet', '/racquet/:id'],
  ['racquetEdit', '/racquet/:id/edit'],
  ['stringNew', '/racquet/:id/string'],
  ['logPlay', '/racquet/:id/log'],
];

export function match(p: string): Match {
  const parts = p.split('/').filter(Boolean);
  for (const [name, pattern] of ROUTES) {
    const pp = pattern.split('/').filter(Boolean);
    if (pp.length !== parts.length) continue;
    const params: Record<string, string> = {};
    let ok = true;
    for (let i = 0; i < pp.length; i++) {
      if (pp[i].startsWith(':')) params[pp[i].slice(1)] = decodeURIComponent(parts[i]);
      else if (pp[i] !== parts[i]) {
        ok = false;
        break;
      }
    }
    if (ok) return { name, params };
  }
  return { name: 'home', params: {} };
}

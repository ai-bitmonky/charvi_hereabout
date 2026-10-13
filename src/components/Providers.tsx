'use client';

import {
  createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode,
} from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  DEFAULT_DRAFT, DEFAULT_REQUESTS, DEFAULT_TICKETS, type Draft, type JoinRequest, type Ticket,
} from '@/data/events';
import { DEFAULT_FILTERS, type Filters } from '@/lib/format';
import { MOBILE_MAX, reducedMotion } from '@/lib/fx';

/* ================= app state (persisted) ================= */
interface AppState {
  filters: Filters;
  setFilters: (p: Partial<Filters>) => void;
  tickets: Ticket[];
  addTicket: (t: Ticket) => void;
  saved: Record<string, boolean>;
  toggleSave: (id: string) => boolean;
  requests: JoinRequest[];
  setRequest: (i: number, st: JoinRequest['st']) => void;
  draft: Draft;
  setDraft: (p: Partial<Draft>) => void;
  resetDraft: () => void;
  toggleTheme: () => void;
}
const StateCtx = createContext<AppState | null>(null);
const STORE = 'hb-state-v1';

interface Persisted { tickets: Ticket[]; saved: Record<string, boolean>; requests: JoinRequest[]; draft: Draft }

export function setTheme(t: 'dark' | 'light') {
  document.documentElement.setAttribute('data-theme', t);
  try { localStorage.setItem('hb-theme', t); } catch { /* storage blocked */ }
  document.querySelectorAll('meta[name="theme-color"]').forEach((m) => m.setAttribute('content', t === 'light' ? '#F7F4EE' : '#0B0B10'));
}

function StateProvider({ children }: { children: ReactNode }) {
  const [filters, setF] = useState<Filters>(DEFAULT_FILTERS);
  const [data, setData] = useState<Persisted>({ tickets: DEFAULT_TICKETS, saved: {}, requests: DEFAULT_REQUESTS, draft: DEFAULT_DRAFT });
  const loaded = useRef(false);

  // hydrate from localStorage after mount (SSR renders the defaults)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORE);
      if (raw) {
        const p = JSON.parse(raw) as Partial<Persisted>;
        setData((d) => ({
          tickets: Array.isArray(p.tickets) ? p.tickets : d.tickets,
          saved: p.saved && typeof p.saved === 'object' ? p.saved : d.saved,
          requests: Array.isArray(p.requests) && p.requests.length === d.requests.length ? p.requests : d.requests,
          draft: p.draft ? { ...d.draft, ...p.draft } : d.draft,
        }));
      }
    } catch { /* ignore corrupt storage */ }
    loaded.current = true;
  }, []);
  useEffect(() => {
    if (!loaded.current) return;
    try { localStorage.setItem(STORE, JSON.stringify(data)); } catch { /* storage blocked */ }
  }, [data]);

  const savedRef = useRef(data.saved);
  savedRef.current = data.saved;

  const value = useMemo<AppState>(() => ({
    filters,
    setFilters: (p) => setF((f) => ({ ...f, ...p })),
    tickets: data.tickets,
    addTicket: (t) => setData((d) => ({ ...d, tickets: [t, ...d.tickets] })),
    saved: data.saved,
    toggleSave: (id) => {
      const on = !savedRef.current[id];
      setData((d) => ({ ...d, saved: { ...d.saved, [id]: on } }));
      return on;
    },
    requests: data.requests,
    setRequest: (i, st) => setData((d) => ({ ...d, requests: d.requests.map((r, j) => (j === i ? { ...r, st } : r)) })),
    draft: data.draft,
    setDraft: (p) => setData((d) => ({ ...d, draft: { ...d.draft, ...p } })),
    resetDraft: () => setData((d) => ({ ...d, draft: DEFAULT_DRAFT })),
    toggleTheme: () => setTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'),
  }), [filters, data]);

  return <StateCtx.Provider value={value}>{children}</StateCtx.Provider>;
}
export function useApp() {
  const c = useContext(StateCtx);
  if (!c) throw new Error('useApp outside provider');
  return c;
}

/* ================= toast ================= */
const ToastCtx = createContext<(m: string) => void>(() => {});
export const useToast = () => useContext(ToastCtx);

function ToastProvider({ children }: { children: ReactNode }) {
  const [t, setT] = useState<{ id: number; m: string; out: boolean } | null>(null);
  const timers = useRef<number[]>([]);
  const toast = useCallback((m: string) => {
    timers.current.forEach(clearTimeout);
    const id = Date.now();
    setT({ id, m, out: false });
    timers.current = [
      window.setTimeout(() => setT((x) => (x && x.id === id ? { ...x, out: true } : x)), 2400),
      window.setTimeout(() => setT((x) => (x && x.id === id ? null : x)), 2720),
    ];
  }, []);
  return (
    <ToastCtx.Provider value={toast}>
      {children}
      {t && (
        <div key={t.id} className={'toast' + (t.out ? ' out' : '')} role="status">
          <i><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.2 4.2L19 7" /></svg></i>
          <span>{t.m}</span>
        </div>
      )}
    </ToastCtx.Provider>
  );
}

/* ================= native-style navigation (push / pop / tab) ================= */
export type RouteKey = 'discover' | 'map' | 'tickets' | 'host' | 'event' | 'create';
export function routeOf(path: string): RouteKey {
  const p = path.split('#')[0].split('?')[0].split('/').filter(Boolean);
  if (p[0] === 'event') return 'event';
  if (p[0] === 'map') return 'map';
  if (p[0] === 'tickets') return 'tickets';
  if (p[0] === 'host') return p[1] === 'new' ? 'create' : 'host';
  return 'discover';
}
const DEPTH: Record<RouteKey, number> = { discover: 0, map: 0, tickets: 0, host: 0, event: 1, create: 1 };

interface Nav { go: (href: string, o?: { replace?: boolean }) => void; back: () => void }
const NavCtx = createContext<Nav>({ go: () => {}, back: () => {} });
export const useNav = () => useContext(NavCtx);

type VTDoc = Document & { startViewTransition?: (cb: () => Promise<void>) => { finished: Promise<void> } };

function NavProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const resolve = useRef<null | (() => void)>(null);
  const depth = useRef(0); // in-app history entries
  const scrollMem = useRef<Record<string, number>>({});
  const popping = useRef(false);
  const cur = useRef(pathname);

  // remember scroll per path so "back" lands where you were
  useEffect(() => {
    const on = () => { scrollMem.current[cur.current] = window.scrollY; };
    window.addEventListener('scroll', on, { passive: true });
    const pop = () => { popping.current = true; };
    window.addEventListener('popstate', pop);
    return () => { window.removeEventListener('scroll', on); window.removeEventListener('popstate', pop); };
  }, []);

  useLayoutEffect(() => {
    if (cur.current !== pathname) {
      cur.current = pathname;
      if (popping.current) {
        popping.current = false;
        depth.current = Math.max(0, depth.current - 1);
        const y = scrollMem.current[pathname] || 0;
        window.scrollTo(0, y);
        requestAnimationFrame(() => window.scrollTo(0, y));
      } else depth.current += 1;
    }
    resolve.current?.();
    resolve.current = null;
  }, [pathname]);

  const run = useCallback((dir: 'push' | 'pop' | 'tab', fn: () => void) => {
    const d = document as VTDoc;
    if (!d.startViewTransition || window.innerWidth > MOBILE_MAX || reducedMotion()) { fn(); return; }
    document.documentElement.dataset.nav = dir;
    const vt = d.startViewTransition(() => new Promise<void>((res) => {
      resolve.current = res;
      fn();
      window.setTimeout(res, 700); // safety net if the route does not change
    }));
    vt.finished.finally(() => { delete document.documentElement.dataset.nav; });
  }, []);

  const nav = useMemo<Nav>(() => ({
    go: (href, o) => {
      const target = href.split('#')[0] || '/';
      if (target === cur.current) { window.scrollTo({ top: 0, behavior: reducedMotion() ? 'auto' : 'smooth' }); return; }
      const from = routeOf(cur.current), to = routeOf(target);
      const dir = DEPTH[to] > DEPTH[from] || (from === 'event' && to === 'event') ? 'push' : DEPTH[to] < DEPTH[from] ? 'pop' : 'tab';
      run(dir, () => (o?.replace ? router.replace(target) : router.push(target)));
    },
    back: () => {
      const r = routeOf(cur.current);
      if (depth.current > 0) { popping.current = true; run('pop', () => router.back()); }
      else run('pop', () => router.replace(r === 'create' ? '/host' : '/'));
    },
  }), [router, run]);

  return <NavCtx.Provider value={nav}>{children}</NavCtx.Provider>;
}

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <StateProvider>
      <NavProvider>
        <ToastProvider>{children}</ToastProvider>
      </NavProvider>
    </StateProvider>
  );
}

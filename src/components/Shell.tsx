'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef, type ReactNode } from 'react';
import { Icon, ThemeIcons } from './Icon';
import { NavLink } from './Bits';
import { routeOf, useApp, useNav, useToast } from './Providers';
import { isMobileNow, requestExplore, toExplore } from '@/lib/fx';

export function Logo() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <g className="lr"><circle cx="16" cy="16" r="14" fill="none" stroke="var(--teal)" strokeWidth="1.6" strokeDasharray="3 3.2" opacity=".75" /></g>
      <circle cx="16" cy="16" r="8.6" fill="none" stroke="var(--teal)" strokeWidth="1.8" />
      <circle cx="16" cy="16" r="3.6" fill="var(--accent)" />
    </svg>
  );
}

export default function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const route = routeOf(pathname);
  const nav = route === 'event' ? '' : route === 'create' ? 'host' : route;
  const { filters, setFilters, tickets, toggleTheme } = useApp();
  const toast = useToast();
  const { go } = useNav();
  const qRef = useRef<HTMLInputElement>(null);
  const n = tickets.filter((t) => t.status === 'upcoming').length;

  // "/" focuses search
  useEffect(() => {
    const key = (ev: KeyboardEvent) => {
      const tag = (document.activeElement?.tagName || '').toLowerCase();
      if (ev.key === '/' && !/input|textarea|select/.test(tag) && !document.querySelector('.scrim')) {
        ev.preventDefault();
        if (!isMobileNow()) qRef.current?.focus();
        else (document.getElementById('mq') as HTMLInputElement | null)?.focus();
      }
    };
    document.addEventListener('keydown', key);
    return () => document.removeEventListener('keydown', key);
  }, []);

  const on = (k: string) => (nav === k ? { className: 'on', 'aria-current': 'page' as const } : {});
  const tab = (k: string, extra = '') => ({ className: (extra + (nav === k ? ' on' : '')).trim() || undefined, 'aria-current': nav === k ? ('page' as const) : undefined });

  return (
    <div className="shell" data-route={route}>
      <a className="sr" href="#app">Skip to content</a>
      <header className="hdr">
        <div className="wrap hdr-in">
          <NavLink href="/" className="logo" aria-label="Hereabout home"><Logo /><span>hereabout</span></NavLink>
          <button className="locp" type="button" aria-label="Location: Indiranagar, within 3 km" onClick={() => toast('Using your location · Indiranagar, within 3 km')}>
            <i className="dot teal pulse" />Indiranagar <span>· 3 km</span>
          </button>
          <label className="hsearch">
            <Icon n="search" />
            <input
              ref={qRef} id="q" type="search" placeholder="Search events, hosts or places" aria-label="Search events" autoComplete="off"
              value={filters.q}
              onChange={(ev) => {
                setFilters({ q: ev.target.value });
                if (route !== 'discover') { requestExplore(); go('/'); }
              }}
              onKeyDown={(ev) => { if (ev.key === 'Enter') toExplore(); if (ev.key === 'Escape') ev.currentTarget.blur(); }}
            />
            <kbd>/</kbd>
          </label>
          <nav className="hnav" aria-label="Main">
            <NavLink href="/" {...on('discover')}>Discover</NavLink>
            <NavLink href="/tickets" {...on('tickets')}>Tickets {n > 0 && <span className="badge">{n}</span>}</NavLink>
            <NavLink href="/host" {...on('host')}>Host</NavLink>
          </nav>
          <div className="hdr-r">
            <button className="icon-btn" type="button" id="themeBtn" aria-label="Switch dark or light theme" onClick={toggleTheme}><ThemeIcons /></button>
            <button className="avatar me" type="button" aria-label="Your profile, Riya Sharma" onClick={() => toast('Signed in as Riya Sharma')}>RS</button>
          </div>
        </div>
      </header>

      <main id="app" tabIndex={-1}>{children}</main>

      <footer className="ftr">
        <div className="wrap">
          <div className="ftr-top">
            <span className="mono">Bengaluru · 12.97° N, 77.64° E · Tuesday 6:50 pm</span>
            <nav aria-label="Footer">
              <NavLink href="/">Discover</NavLink>
              <NavLink href="/host/new">Host an event</NavLink>
              <button type="button" onClick={() => toast('Safety: verified hosts, private guest lists, in-app payments')}>Safety</button>
              <button type="button" onClick={() => toast('Help centre opens here')}>Help</button>
              <button type="button" onClick={() => toast('Privacy settings open here')}>Privacy</button>
            </nav>
          </div>
          <div className="ftr-word" aria-hidden="true">hereabout<span>.</span></div>
          <div className="ftr-b mono"><span>© 2026 Hereabout</span><span>Made for evenings · v1.0</span></div>
        </div>
      </footer>

      <NavLink className="fmap" href="/map" aria-label="Open map view"><Icon n="map" />Map</NavLink>

      <nav className="tabbar" aria-label="Tabs">
        <NavLink href="/" {...tab('discover', 'tb-main')}>
          <span className="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true"><circle cx="12" cy="12" r="3.2" fill="currentColor" /><circle cx="12" cy="12" r="7.5" /></svg></span>Tonight
        </NavLink>
        <NavLink href="/map" {...tab('map')}><Icon n="map" />Map</NavLink>
        <NavLink href="/tickets" {...tab('tickets')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M3 8a2 2 0 0 0 2-2h14a2 2 0 0 0 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 0-2 2H5a2 2 0 0 0-2-2v-2a2 2 0 0 0 0-4z" /><path d="M14 6v12" strokeDasharray="2 2.4" /></svg>
          {n > 0 && <span className="badge">{n}</span>}Tickets
        </NavLink>
        <NavLink href="/host" {...tab('host')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M3 11 12 4l9 7" /><path d="M5 9.5V20h14V9.5" /><path d="M10 20v-5h4v5" /></svg>Host
        </NavLink>
      </nav>
    </div>
  );
}

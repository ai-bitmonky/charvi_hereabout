'use client';

import { useEffect, useRef, useState } from 'react';
import { events, G, byId } from '@/data/events';
import { rupee, startsIn, walk } from '@/lib/format';
import { Icon } from './Icon';
import { NavLink, vars } from './Bits';

const T0 = 18 * 60, T1 = 24 * 60, NOWM = 18 * 60 + 50, RH = 50, TTOP = 36;
const tpct = (m: number) => Math.max(0, Math.min(100, ((m - T0) / (T1 - T0)) * 100));
const LIST = events.filter((e) => e.time !== 'weekend').sort((a, b) => a.mins - b.mins);

/** Signature element 1: tonight from 6 pm to midnight with a glowing NOW line. */
export default function Timeline() {
  const trRef = useRef<HTMLDivElement>(null);
  const scRef = useRef<HTMLDivElement>(null);
  const [cur, setCur] = useState<{ id: string; left: number; top: number } | null>(null);
  const hideT = useRef<number>(0);
  const H = TTOP + LIST.length * RH + 30;

  useEffect(() => {
    const sc = scRef.current, tr = trRef.current;
    if (sc && tr && sc.scrollWidth > sc.clientWidth) sc.scrollLeft = Math.max(0, (tr.offsetWidth * tpct(NOWM)) / 100 - sc.clientWidth * 0.3 + 20);
    const out = (ev: MouseEvent) => { if (!(ev.target as HTMLElement).closest('#tltr')) setCur(null); };
    document.addEventListener('click', out);
    return () => { document.removeEventListener('click', out); clearTimeout(hideT.current); };
  }, []);

  const show = (el: HTMLElement, id: string) => {
    clearTimeout(hideT.current);
    const tr = trRef.current!;
    const pw = Math.min(300, tr.offsetWidth - 16);
    const lx = Math.max(8, Math.min(el.offsetLeft, tr.offsetWidth - pw - 8));
    const row = (el.offsetTop - TTOP) / RH;
    setCur({ id, left: lx, top: row >= LIST.length - 2 ? el.offsetTop - 84 : el.offsetTop + 48 });
  };
  const hide = () => { hideT.current = window.setTimeout(() => setCur(null), 180); };
  const touch = () => typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches;
  const e = cur ? byId[cur.id] : null;

  return (
    <div className="tl" id="tl">
      <div className="tl-h">
        <div>
          <span className="mono muted">Tue 13 Oct · 6 pm to midnight</span>
          <h2 style={{ marginTop: 10 }}>Tonight, <em>hour by hour</em></h2>
          <p>Hover or tap a plan to see how far it is. The red line is now.</p>
        </div>
        <div className="tl-leg mono">
          <span><i style={{ background: '#FF5A3C' }} />Live</span>
          <span><i style={{ background: 'var(--amber)' }} />Starts soon</span>
          <span><i style={{ background: 'var(--surface-3)' }} />Already passed</span>
        </div>
      </div>
      <div className="tl-sc" ref={scRef}>
        <div className="tl-tr" id="tltr" ref={trRef} style={{ height: H }} onMouseLeave={hide}>
          <div className="tl-past" style={{ width: tpct(NOWM).toFixed(2) + '%' }} />
          {Array.from({ length: 7 }, (_, i) => 18 + i).map((h) => (
            <div key={h} className={'tl-hr' + (h === 18 ? ' st' : h === 24 ? ' en' : '')} style={{ left: tpct(h * 60) + '%' }}>
              <span className="mono">{h === 24 ? '12 am' : h - 12 + ' pm'}</span>
            </div>
          ))}
          <div className="tl-now" style={{ left: tpct(NOWM).toFixed(2) + '%' }}><span className="mono">Now 6:50</span></div>
          {LIST.map((ev, i) => {
            const s = NOWM + ev.mins, l = tpct(s), w = tpct(s + ev.dur) - l;
            return (
              <NavLink
                key={ev.id} href={'/event/' + ev.id}
                className={'tl-bar' + (ev.time === 'now' ? ' live' : '') + (cur?.id === ev.id ? ' act' : '')}
                style={vars({ left: l.toFixed(2) + '%', width: w.toFixed(2) + '%', top: TTOP + i * RH + 'px', '--tint': ev.tint, '--g': G(ev.photo), '--i': i })}
                aria-label={`${ev.t}, ${startsIn(ev)}`}
                onMouseEnter={(x) => show(x.currentTarget, ev.id)}
                onFocus={(x) => show(x.currentTarget, ev.id)}
                onClick={(x) => { if (touch() && cur?.id !== ev.id) { x.preventDefault(); show(x.currentTarget, ev.id); } }}
              >
                <span className="tl-th" /><b>{ev.t}</b><span className="mono">{ev.start}</span>
              </NavLink>
            );
          })}
          {e && cur && (
            <NavLink
              key={e.id} className="tl-pop" href={'/event/' + e.id}
              style={vars({ '--g': G(e.photo), left: cur.left + 'px', top: cur.top + 'px' })}
              onMouseEnter={() => clearTimeout(hideT.current)}
            >
              <span className="th" />
              <span><b>{e.t}</b><span className="mono">{startsIn(e)} · {walk(e.d)} · {rupee(e.price)}</span></span>
              <span className="go"><Icon n="arrow" /></span>
            </NavLink>
          )}
        </div>
      </div>
    </div>
  );
}

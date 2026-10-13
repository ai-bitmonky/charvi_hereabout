'use client';

import { useMemo, useState } from 'react';
import { events, G, byId, type EventItem } from '@/data/events';
import { artInner } from '@/lib/mapArt';
import { dist, rupee, urgText, walk, whenLine } from '@/lib/format';
import { Icon } from './Icon';
import { NavLink, vars } from './Bits';
import { useToast } from './Providers';

const ZOOMS = [1, 1.35, 1.75];

/** Dark radar map: 1/2/3 km rings, rotating sweep, pulsing "you", photo pins. */
export default function Radar({ id, list, hl, distKm, pop, onPick, onPinHover }: {
  id: string; list: EventItem[]; hl: string | null; distKm: number; pop?: boolean;
  onPick: (id: string) => void; onPinHover?: (id: string | null) => void;
}) {
  const [zi, setZi] = useState(0);
  const toast = useToast();
  const ids = useMemo(() => new Set(list.map((e) => e.id)), [list]);
  const art = useMemo(() => ({ __html: artInner() }), []);
  const e = pop && hl ? byId[hl] : null;
  const pc = ((distKm * 170) / 560 * 100).toFixed(2) + '%';

  return (
    <div className="radar" id={id} role="region" aria-label="Map of events near you" style={vars({ '--z': ZOOMS[zi] })}>
      <div className="rstage">
        <svg viewBox="0 0 560 560" aria-hidden="true" focusable="false" dangerouslySetInnerHTML={art} />
        <div className="sweep" />
        <div className="rad" style={{ width: pc, height: pc }} />
        <span className="you" title="You are here" />
        {events.map((p) => {
          const off = !ids.has(p.id);
          const cls = 'pin' + (p.time === 'now' ? ' live' : '') + (p.taken / p.cap > 0.7 ? ' pop' : '') + (off ? ' off' : '') + (hl === p.id ? ' on' : '');
          return (
            <button
              key={p.id} type="button" className={cls} data-pin={p.id}
              style={vars({ left: (p.x / 5.6).toFixed(2) + '%', top: (p.y / 5.6).toFixed(2) + '%', '--g': G(p.photo) })}
              aria-label={`${p.t}, ${dist(p.d)}`}
              onClick={() => { if (off) toast('Outside your filters. Widen them to see it.'); else onPick(p.id); }}
              onMouseEnter={() => onPinHover?.(p.id)}
              onMouseLeave={() => onPinHover?.(null)}
            >
              <span className="lbl">{p.t}</span>
            </button>
          );
        })}
      </div>
      <div className="rleg">
        <span className="pill"><i className="dot" />You</span>
        <span className="pill lv"><i className="dot" />Live</span>
        <span className="pill rdist">Within {distKm} km</span>
      </div>
      <div className="rctl">
        <button type="button" aria-label="Zoom in" onClick={() => setZi((z) => Math.min(ZOOMS.length - 1, z + 1))}>+</button>
        <button type="button" aria-label="Zoom out" onClick={() => setZi((z) => Math.max(0, z - 1))}>−</button>
        <button type="button" aria-label="Back to my location" onClick={() => { setZi(0); toast('Centred on you · Indiranagar'); }}><Icon n="locate" /></button>
      </div>
      <div className="rpw">
        {e && (
          <NavLink key={e.id} className="rpop" href={'/event/' + e.id} style={vars({ '--g': G(e.photo) })}>
            <span className="th" />
            <span className="tx"><span className="mono">{urgText(e) || whenLine(e)}</span><b>{e.t}</b><span>{e.area} · {walk(e.d)}</span></span>
            <span className="pr">{rupee(e.price)}</span>
            <span className="go"><Icon n="arrow" /></span>
          </NavLink>
        )}
      </div>
    </div>
  );
}

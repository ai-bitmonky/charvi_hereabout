'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { CATS, TIMES } from '@/data/events';
import { filterEvents, plural, type Filters } from '@/lib/format';
import { MOBILE_MAX, reducedMotion, requestExplore } from '@/lib/fx';
import { Icon } from '@/components/Icon';
import { CompactCard, NavLink } from '@/components/Bits';
import { AppBar, ThemeBtn } from '@/components/Chrome';
import Radar from '@/components/Radar';
import { useApp, useNav } from '@/components/Providers';

/** Full-screen radar with a draggable bottom sheet (peek carousel ↔ half list). Phones only. */
export default function MapView() {
  const { filters: f, setFilters } = useApp();
  const nav = useNav();
  const list = useMemo(() => filterEvents(f), [f]);
  const [hl, setHl] = useState<string | null>(list[0]?.id ?? null);
  const [half, setHalf] = useState(false);
  const carRef = useRef<HTMLDivElement>(null);
  const shlRef = useRef<HTMLDivElement>(null);
  const hlRef = useRef(hl);
  hlRef.current = hl;

  // desktop has the sticky map inside Explore
  useEffect(() => {
    const chk = () => { if (window.innerWidth > MOBILE_MAX) { requestExplore(); nav.go('/', { replace: true }); } };
    chk();
    window.addEventListener('resize', chk);
    return () => window.removeEventListener('resize', chk);
  }, [nav]);

  // keep the highlight valid when filters change
  const listKey = list.map((e) => e.id).join(',');
  useEffect(() => {
    setHl(list[0]?.id ?? null);
    if (carRef.current) carRef.current.scrollLeft = 0;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listKey]);

  const toggle = (p: Partial<Filters>) => setFilters(p);
  const onScroll = () => {
    const car = carRef.current;
    if (!car) return;
    requestAnimationFrame(() => {
      const cs = car.querySelectorAll<HTMLElement>('.cc');
      if (!cs.length) return;
      const w = cs[0].offsetWidth + 12, i = Math.max(0, Math.min(cs.length - 1, Math.round(car.scrollLeft / w)));
      const id = cs[i].dataset.cc!;
      if (id !== hlRef.current) setHl(id);
    });
  };
  const pinPick = (id: string) => {
    setHl(id);
    const b = reducedMotion() ? 'auto' : 'smooth';
    if (half) shlRef.current?.querySelector(`[data-cc="${id}"]`)?.scrollIntoView({ block: 'nearest', behavior: b });
    else {
      const c = carRef.current?.querySelector<HTMLElement>(`[data-cc="${id}"]`);
      if (c) carRef.current!.scrollTo({ left: c.offsetLeft - 16, behavior: b });
    }
  };

  // drag the handle up / down
  const drag = useRef<{ y0: number; moved: boolean } | null>(null);
  const empty = (
    <div className="empty" style={{ padding: 22, width: '100%' }}>
      <h3 style={{ fontSize: 20 }}>Nothing matches</h3>
      <p style={{ margin: '6px 0 0' }}>Tap a chip again to clear it.</p>
    </div>
  );
  const cards = list.length ? list.map((e) => <CompactCard key={e.id} e={e} hl={hl === e.id} />) : empty;
  const sheetH = half ? '64%' : '236px';

  return (
    <div className="view mapv-w">
      <AppBar title="Map" right={<><NavLink className="cbtn" href="/" aria-label="Show list"><Icon n="list" /></NavLink><ThemeBtn /></>} />
      <div className="mapv" id="mapv" style={{ ['--sheet' as string]: sheetH }}>
        <Radar id="mmap" list={list} hl={hl} distKm={f.dist} onPick={pinPick} />
        <div className="mv-top" role="group" aria-label="Filters">
          {TIMES.slice(1).map(([k, l]) => <button key={k} className="chip" type="button" aria-pressed={f.time === k} onClick={() => toggle({ time: f.time === k ? 'all' : k })}>{l}</button>)}
          {CATS.slice(1).map(([k, l]) => <button key={k} className="chip" type="button" aria-pressed={f.cat === k} onClick={() => toggle({ cat: f.cat === k ? 'all' : k })}>{l}</button>)}
          <button className="chip" type="button" aria-pressed={f.budget} onClick={() => toggle({ budget: !f.budget })}>Under ₹500</button>
          <button className="chip" type="button" aria-pressed={f.solo} onClick={() => toggle({ solo: !f.solo })}>Come solo</button>
        </div>
        <NavLink className="mv-list" href="/"><Icon n="list" />List</NavLink>
        <div className="sheet" data-s={half ? 'half' : 'peek'}>
          <button
            className="handle" type="button" aria-label={half ? 'Show map' : 'Show full list'} aria-expanded={half}
            onPointerDown={(ev) => { drag.current = { y0: ev.clientY, moved: false }; try { ev.currentTarget.setPointerCapture(ev.pointerId); } catch { /* noop */ } }}
            onPointerMove={(ev) => { const d = drag.current; if (d && Math.abs(ev.clientY - d.y0) > 8) d.moved = true; }}
            onPointerUp={(ev) => { const d = drag.current; if (d?.moved) setHalf(ev.clientY - d.y0 < 0); }}
            onClick={() => { const d = drag.current; drag.current = null; if (d?.moved) return; setHalf((h) => !h); }}
          />
          <div className="sh-h"><b>{plural(list.length)} near you</b><span className="mono">{half ? 'Tap handle to close' : 'Swipe for more'}</span></div>
          <div className="car" ref={carRef} onScroll={onScroll}>{cards}</div>
          <div className="sh-list" ref={shlRef}>{cards}</div>
        </div>
      </div>
    </div>
  );
}

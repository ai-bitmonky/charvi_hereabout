'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  byId, CATS, CURATED, DISTS, events, G, INTENTS, TIMES, type EventItem,
} from '@/data/events';
import {
  catName, dist, filterEvents, plural, rupee, spotsLeft, walk, walkM, whenLine, type Filters,
} from '@/lib/format';
import { consumeExplore, isMobileNow, reducedMotion, toExplore } from '@/lib/fx';
import { Icon } from '@/components/Icon';
import {
  CountUp, EventCard, Faces, NavLink, Photo, RailCard, SaveBtn, vars,
} from '@/components/Bits';
import { AppBar, LargeTitle, Sheet, SheetHead, ThemeBtn } from '@/components/Chrome';
import Radar from '@/components/Radar';
import Timeline from '@/components/Timeline';
import { useApp, useNav, useToast } from '@/components/Providers';

const TIME_LABEL: Record<Filters['time'], string> = { all: 'Anytime', now: 'Right now', tonight: 'Tonight', weekend: 'This weekend' };
const RESET: Partial<Filters> = { time: 'all', cat: 'all', dist: 3, budget: false, solo: false };

/* ---------- hero search pill (Where · When · Vibe) ---------- */
function SearchPill() {
  const { filters: f, setFilters } = useApp();
  const toast = useToast();
  const [open, setOpen] = useState<null | { k: 'where' | 'when' | 'vibe'; left: number }>(null);
  const wRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const out = (ev: MouseEvent) => { if (!wRef.current?.contains(ev.target as Node)) setOpen(null); };
    const esc = (ev: KeyboardEvent) => { if (ev.key === 'Escape') setOpen(null); };
    document.addEventListener('click', out);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('click', out); document.removeEventListener('keydown', esc); };
  }, []);
  useEffect(() => { if (open) wRef.current?.querySelector<HTMLElement>('.spop .chip')?.focus({ preventScroll: true }); }, [open]);

  const seg = (k: 'where' | 'when' | 'vibe', label: string, value: string) => (
    <button
      className="sg" type="button" aria-expanded={open?.k === k}
      onClick={(ev) => { const b = ev.currentTarget; setOpen((o) => (o?.k === k ? null : { k, left: Math.max(0, b.offsetLeft - 6) })); }}
    >
      <small>{label}</small><b>{value}</b>
    </button>
  );
  const opts: [string, string | number][] = !open ? [] : open.k === 'where'
    ? [['Within 1 km', 1], ['Within 2 km', 2], ['Within 3 km', 3]]
    : open.k === 'when' ? TIMES.map((t) => [t[1], t[0]]) : CATS.map((c) => [c[0] === 'all' ? 'Anything' : c[1], c[0]]);
  const cur = open?.k === 'where' ? f.dist : open?.k === 'when' ? f.time : f.cat;
  const pick = (v: string | number) => {
    if (open?.k === 'where') setFilters({ dist: +v });
    else if (open?.k === 'when') setFilters({ time: v as Filters['time'] });
    else setFilters({ cat: String(v) });
    setOpen(null);
    setTimeout(toExplore, 120);
  };

  return (
    <div className="spill-w" ref={wRef}>
      <div className="spill" role="group" aria-label="Quick search">
        {seg('where', 'WHERE', `Indiranagar · ${f.dist} km`)}<i className="vr" />
        {seg('when', 'WHEN', TIME_LABEL[f.time])}<i className="vr" />
        {seg('vibe', 'VIBE', f.cat === 'all' ? 'Anything' : catName(f.cat))}
        <button className="go" type="button" aria-label="Use my location" onClick={() => { toast('Using your location · Indiranagar'); setTimeout(toExplore, 300); }}><Icon n="locate" /></button>
      </div>
      {open && (
        <div className="spop" style={{ left: open.left }}>
          <h4>{open.k === 'where' ? 'How far will you walk?' : open.k === 'when' ? 'When are you free?' : 'What are you into?'}</h4>
          <div className="chips">
            {opts.map(([l, v]) => <button key={String(v)} className="chip" type="button" aria-pressed={String(cur) === String(v)} onClick={() => pick(v)}>{l}</button>)}
          </div>
        </div>
      )}
    </div>
  );
}

function Featured({ e }: { e: EventItem }) {
  return (
    <NavLink className="feat" href={'/event/' + e.id} aria-label={`${e.t}, live now, join for ${rupee(e.price)}`}>
      <Photo k={e.photo} sizes="(max-width: 899px) 100vw, 45vw" priority />
      <div className="top">
        <span className="pill live"><i className="dot live" />Live now<span className="eqb" aria-hidden="true"><i /><i /><i /><i /></span></span>
        <SaveBtn e={e} />
      </div>
      <div className="body">
        <span className="mono meta">{dist(e.d)} · Started 20 min ago · {spotsLeft(e)} spots left</span>
        <h2>{e.t}</h2>
        <div className="fr"><Faces n={3} /><span><b>Aditi, Kabir + Neha</b> are there</span></div>
        <div className="act">
          <span className="btn btn-p btn-lg">Join for {rupee(e.price)}</span>
          <span className="btn btn-glass btn-lg" aria-hidden="true" style={{ padding: '0 18px' }}><Icon n="arrowUR" /></span>
        </div>
      </div>
    </NavLink>
  );
}

function HeroRings() {
  const dots: [number, number, string][] = [[560, 330, '#FF5A3C'], [350, 540, '#FFC247'], [640, 520, '#B59CFF'], [300, 300, '#FFC247'], [700, 380, '#3DF0C8']];
  return (
    <svg viewBox="0 0 900 900" aria-hidden="true">
      <g fill="none" stroke="var(--teal)">
        {[110, 200, 290, 380].map((r, i) => <circle key={r} cx="450" cy="450" r={r} strokeOpacity={0.2 - i * 0.04} strokeDasharray="2 7" />)}
      </g>
      {dots.map(([x, y, c]) => (
        <g key={x + '-' + y}><circle cx={x} cy={y} r="4" fill={c} opacity=".7" /><circle cx={x} cy={y} r="11" fill="none" stroke={c} opacity=".25" /></g>
      ))}
    </svg>
  );
}

/** time phrase rolls: tonight → right now → this weekend */
function Roll() {
  const words = ['tonight.', 'right now.', 'this weekend.'];
  const [i, setI] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  useEffect(() => {
    if (reducedMotion()) return;
    const t = setInterval(() => {
      setI((x) => { setPrev(x); return (x + 1) % words.length; });
    }, 2800);
    return () => clearInterval(t);
  }, [words.length]);
  useEffect(() => { if (prev === null) return; const t = setTimeout(() => setPrev(null), 650); return () => clearTimeout(t); }, [prev]);
  return (
    <span className="roll">
      {words.map((w, k) => <span key={w} className={k === i ? 'on' : k === prev ? 'out' : undefined}>{w}</span>)}
    </span>
  );
}

function Curated() {
  return (
    <div className="cur">
      <div className="cur-h">
        <span className="mono k"><b>03</b> · Hereabout picks · No. 07</span>
        <h2>Three for a <em>first week</em> in the city</h2>
        <p>New in Bengaluru? Start here. All easy to join on your own.</p>
        <div className="by"><Faces n={1} /><span>Picked by Ishaan, local editor</span></div>
      </div>
      <ol className="cur-l">
        {CURATED.map(([id, why], i) => {
          const e = byId[id];
          return (
            <li key={id}>
              <NavLink href={'/event/' + e.id} style={vars({ '--g': G(e.photo) })}>
                <span className="no">0{i + 1}</span><span className="th" />
                <span><span className="mono">{whenLine(e)} · {e.area}</span><h3>{e.t}</h3><p>{why}</p></span>
                <span className="pr">{rupee(e.price)}<small>{walk(e.d)}</small></span>
                <i className="chv"><Icon n="right" /></i>
              </NavLink>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export function HostBand() {
  const ck = <i><Icon n="check" /></i>;
  return (
    <div className="hband" id="hband">
      <Photo k="wood" sizes="(max-width: 899px) 100vw, 1320px" />
      <div className="hb-stat">
        <div><CountUp as="b" to={62400} fmt="inr" onView /><span>Paid to hosts nearby</span></div>
        <div><CountUp as="b" to={4.9} dec={1} onView /><span>Average host rating</span></div>
      </div>
      <div className="hb-c">
        <span className="mono">For hosts</span>
        <h2>Turn what you love into an <em>evening</em> for others</h2>
        <ul>
          <li>{ck}Approve every guest before they join</li>
          <li>{ck}Get paid upfront. No chasing money.</li>
          <li>{ck}Your address stays private until you say yes</li>
        </ul>
        <div className="row">
          <NavLink className="btn btn-p btn-lg" href="/host/new">Host an event</NavLink>
          <NavLink className="btn btn-glass btn-lg" href="/host">See the dashboard</NavLink>
        </div>
      </div>
    </div>
  );
}

/* ---------- mobile "Filters" bottom sheet ---------- */
function FiltersSheet({ onClosed }: { onClosed: () => void }) {
  const { filters: f, setFilters } = useApp();
  const n = filterEvents(f).length;
  const stepD = (d: number) => { const i = DISTS.indexOf(f.dist) + d; if (i >= 0 && i < DISTS.length) setFilters({ dist: DISTS[i] }); };
  return (
    <Sheet label="Filters" onClosed={onClosed}>
      {(close) => (
        <>
          <SheetHead title="Filters" onClose={close} />
          <div className="mb">
            <div className="lbl">When</div>
            <div className="seg seg-full" role="group" aria-label="When">
              {TIMES.map(([k, l]) => <button key={k} type="button" aria-pressed={f.time === k} onClick={() => setFilters({ time: k })}>{l}</button>)}
            </div>
            <div className="nlist">
              <div className="nrow">
                <span className="g"><b>How far</b><span>within {f.dist} km · ~{walkM(f.dist)} min walk</span></span>
                <div className="stepper">
                  <button type="button" aria-label="Shorter" disabled={f.dist <= DISTS[0]} onClick={() => stepD(-1)}>−</button>
                  <button type="button" aria-label="Longer" disabled={f.dist >= 3} onClick={() => stepD(1)}>+</button>
                </div>
              </div>
              <div className="nrow">
                <span className="g"><b>Under ₹500</b><span>Good plans that cost less</span></span>
                <button className="sw" type="button" role="switch" aria-checked={f.budget} aria-label="Under ₹500" onClick={() => setFilters({ budget: !f.budget })} />
              </div>
              <div className="nrow">
                <span className="g"><b>Good to go solo</b><span>Most people come alone</span></span>
                <button className="sw" type="button" role="switch" aria-checked={f.solo} aria-label="Good to go solo" onClick={() => setFilters({ solo: !f.solo })} />
              </div>
            </div>
            <div className="mact">
              <button className="btn btn-s btn-lg" type="button" onClick={() => setFilters({ time: 'all', dist: 3, budget: false, solo: false })}>Reset</button>
              <button className="btn btn-p btn-lg" type="button" onClick={() => { close(); setTimeout(toExplore, 260); }}>Show {plural(n)}</button>
            </div>
          </div>
        </>
      )}
    </Sheet>
  );
}

function FilterBar({ count, onOpen }: { count: number; onOpen: () => void }) {
  const { filters: f, setFilters } = useApp();
  const nAct = +(f.time !== 'all') + +(f.dist !== 3) + +f.budget + +f.solo;
  const stepD = (d: number) => { const i = DISTS.indexOf(f.dist) + d; if (i >= 0 && i < DISTS.length) setFilters({ dist: DISTS[i] }); };
  return (
    <div className="fbar" id="fbar">
      <div className="fb-row fb-d">
        <div className="seg" role="group" aria-label="When">
          {TIMES.map(([k, l]) => <button key={k} type="button" aria-pressed={f.time === k} onClick={() => setFilters({ time: k })}>{l}</button>)}
        </div>
        <div className="stepper" role="group" aria-label="Distance">
          <button type="button" aria-label="Shorter distance" disabled={f.dist <= DISTS[0]} onClick={() => stepD(-1)}>−</button>
          <span aria-live="polite"><b>within {f.dist} km</b><span className="wk"> · ~{walkM(f.dist)} min walk</span></span>
          <button type="button" aria-label="Longer distance" disabled={f.dist >= DISTS[DISTS.length - 1]} onClick={() => stepD(1)}>+</button>
        </div>
        <span className="cnt mono"><b>{plural(count)}</b> · by start time</span>
      </div>
      <div className="fb-row">
        <button className="chip fbtn" type="button" aria-label="All filters" onClick={onOpen}><Icon n="filter" />Filters{nAct ? <span className="badge">{nAct}</span> : null}</button>
        {CATS.map(([k, l]) => <button key={k} className="chip" type="button" aria-pressed={f.cat === k} onClick={() => setFilters({ cat: k })}>{l}</button>)}
        <i className="vdiv fb-d" />
        <button className="chip fb-d" type="button" aria-pressed={f.budget} onClick={() => setFilters({ budget: !f.budget })}>Under ₹500</button>
        <button className="chip fb-d" type="button" aria-pressed={f.solo} onClick={() => setFilters({ solo: !f.solo })}><Icon n="user" />Come solo</button>
      </div>
    </div>
  );
}

export default function Discover() {
  const { filters: f, setFilters } = useApp();
  const toast = useToast();
  const nav = useNav();
  const [hl, setHl] = useState<string | null>(null);
  const [pinHover, setPinHover] = useState<string | null>(null);
  const [sheet, setSheet] = useState(false);
  const railRef = useRef<HTMLDivElement>(null);
  const list = useMemo(() => filterEvents(f), [f]);
  const live = byId.rooftop;
  const friends = events.filter((e) => e.friends > 0);
  const nTonight = events.filter((e) => e.time !== 'weekend').length;
  const hlOk = hl && list.some((e) => e.id === hl) ? hl : null;

  useEffect(() => { if (consumeExplore()) setTimeout(toExplore, 80); }, []);

  const applyIntent = (k: string) => {
    const p: Partial<Filters> = { ...RESET };
    if (k === 'tonight') p.time = 'tonight'; else if (k === 'budget') p.budget = true; else p.cat = k;
    setFilters(p);
    setTimeout(toExplore, 30);
  };
  const pick = (id: string) => {
    setHl(id);
    document.querySelector(`#cards .ev[data-id="${id}"]`)?.scrollIntoView({ block: 'nearest', behavior: reducedMotion() ? 'auto' : 'smooth' });
  };

  return (
    <div className="view disc">
      <AppBar
        title="Tonight" large
        right={<><button className="cbtn" type="button" aria-label="Search" onClick={() => {
          window.scrollTo({ top: 0, behavior: reducedMotion() ? 'auto' : 'smooth' });
          setTimeout(() => document.getElementById('mq')?.focus(), reducedMotion() ? 0 : 250);
        }}><Icon n="search" /></button><ThemeBtn /></>}
      />
      <div className="wrap only-m">
        <LargeTitle title="Tonight" sub="Tue 13 Oct · 6:50 pm" extra={
          <button className="locp" type="button" onClick={() => toast('Using your location · Indiranagar, within 3 km')}><i className="dot teal pulse" />Indiranagar</button>
        } />
        <label className="msearch">
          <Icon n="search" />
          <input
            id="mq" type="search" placeholder="Search events, hosts or places" aria-label="Search events" autoComplete="off"
            value={f.q} onChange={(ev) => setFilters({ q: ev.target.value })}
            onKeyDown={(ev) => { if (ev.key === 'Enter') { ev.currentTarget.blur(); toExplore(); } }}
          />
        </label>
      </div>

      <section className="wrap hero" aria-label="Tonight near you">
        <div className="hero-l">
          <div className="hero-bg" aria-hidden="true"><HeroRings /></div>
          <span className="mono kick"><i className="dot live" style={{ background: 'var(--accent)' }} />Tuesday <span className="sep">·</span> 6:50 pm <span className="sep">·</span> Indiranagar</span>
          <h1 className="h-hero">What&apos;s on<br /><em>near you</em>,<br /><Roll /></h1>
          <p className="lead"><b><CountUp to={nTonight} onView /> plans</b> start within a 15-minute walk tonight. You always see the full price before you pay.</p>
          <div className="cta">
            <button className="btn btn-p btn-lg" type="button" onClick={() => applyIntent('tonight')}>See tonight<Icon n="down" /></button>
            <button className="btn btn-s btn-lg" type="button" onClick={() => { if (isMobileNow()) nav.go('/map'); else toExplore(); }}><Icon n="map" />Open map</button>
          </div>
          <SearchPill />
        </div>
        <Featured e={live} />
      </section>

      <section className="wrap sec" aria-label="Tonight timeline"><Timeline /></section>

      <section className="wrap sec" aria-label="Quick picks">
        <div className="sh"><div><div className="k mono"><b>01</b><i className="ln" />Quick picks</div><h2>What are you <em>in the mood</em> for?</h2></div></div>
        <div className="intents">
          {INTENTS.map(([k, t, s, ph], i) => (
            <button key={k} className="it" type="button" style={vars({ '--tint': byId[ph].tint })} onClick={() => applyIntent(k)}>
              <Photo k={ph} sizes="(max-width: 899px) 160px, 260px" />
              <span className="mono n">0{i + 1}</span>
              <span className="ar"><Icon n="arrow" /></span>
              <span><h3>{t}</h3><small>{s}</small></span>
            </button>
          ))}
        </div>
      </section>

      <section className="sec" aria-label="Friends are going">
        <div className="wrap">
          <div className="sh">
            <div><div className="k mono"><b>02</b><i className="ln" />Friends</div><h2>Your friends are <em>going</em></h2><p>Plans feel easier when you know someone there.</p></div>
            <div className="r">
              <button className="icon-btn" type="button" aria-label="Scroll friends rail left" onClick={() => railRef.current?.scrollBy({ left: -316, behavior: reducedMotion() ? 'auto' : 'smooth' })}><Icon n="left" /></button>
              <button className="icon-btn" type="button" aria-label="Scroll friends rail right" onClick={() => railRef.current?.scrollBy({ left: 316, behavior: reducedMotion() ? 'auto' : 'smooth' })}><Icon n="right" /></button>
            </div>
          </div>
        </div>
        <div className="rail" id="frail" ref={railRef}>{friends.map((e, i) => <RailCard key={e.id} e={e} i={i} />)}</div>
      </section>

      <section className="wrap sec" aria-label="Curated"><Curated /></section>

      <section className="wrap sec" id="explore" aria-label="Explore nearby">
        <div className="sh"><div><div className="k mono"><b>04</b><i className="ln" />Explore</div><h2>Everything <em>nearby</em></h2><p>Sorted by start time, then by distance.</p></div></div>
        <FilterBar count={list.length} onOpen={() => setSheet(true)} />
        <p className="mcount mono only-m">{plural(list.length)} near you · by start time</p>
        <div className="xgrid">
          <div className="cards" id="cards" aria-live="polite">
            {list.length ? list.map((e, i) => (
              <EventCard key={e.id} e={e} i={i} hl={hlOk === e.id || pinHover === e.id} onEnter={() => setHl(e.id)} />
            )) : (
              <div className="empty">
                <svg viewBox="0 0 96 96" aria-hidden="true"><g fill="none" stroke="var(--teal)" strokeDasharray="2 4"><circle cx="48" cy="48" r="44" opacity=".4" /><circle cx="48" cy="48" r="30" opacity=".6" /></g><circle cx="48" cy="48" r="16" fill="none" stroke="var(--teal)" /><circle cx="48" cy="48" r="5" fill="var(--accent)" /></svg>
                <h3>Nothing here {f.time === 'now' ? 'right now' : 'yet'}</h3>
                <p>No plans match these filters within {f.dist} km. Try a wider walk or a different time.</p>
                <button className="btn btn-p" type="button" onClick={() => setFilters({ ...RESET, q: '' })}>Clear filters</button>
              </div>
            )}
          </div>
          <div className="mapcol">
            <Radar id="xmap" list={list} hl={hlOk} distKm={f.dist} pop onPick={pick} onPinHover={setPinHover} />
          </div>
        </div>
      </section>

      <section className="wrap sec" aria-label="Host with Hereabout"><HostBand /></section>
      {sheet && <FiltersSheet onClosed={() => setSheet(false)} />}
    </div>
  );
}

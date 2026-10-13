'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  useEffect, useRef, useState, type CSSProperties, type MouseEvent, type ReactNode,
} from 'react';
import { DAY, FR, G, PHOTO_POS, photoSrc, type EventItem, type PhotoKey } from '@/data/events';
import { dist, rupee, spotsLeft, urgText, walk, whenLine } from '@/lib/format';
import { reducedMotion } from '@/lib/fx';
import { Icon } from './Icon';
import { useApp, useNav, useToast } from './Providers';

type Vars = CSSProperties & Record<`--${string}`, string | number>;
export const vars = (v: Record<string, string | number>) => v as Vars;

/** Client-side link that runs the native push/pop transition on phones. */
export function NavLink({ href, children, className, style, onClick, ...rest }: {
  href: string; children?: ReactNode; className?: string; style?: CSSProperties;
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'onClick'>) {
  const nav = useNav();
  return (
    <Link
      href={href}
      className={className}
      style={style}
      {...rest}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        nav.go(href);
      }}
    >
      {children}
    </Link>
  );
}

/** Full-bleed photo layer (.img) rendered with next/image. */
export function Photo({ k, sizes, priority }: { k: PhotoKey; sizes: string; priority?: boolean }) {
  return (
    <span className="img nx">
      <Image src={photoSrc(k)} alt="" fill sizes={sizes} priority={priority} style={{ objectPosition: PHOTO_POS[k] }} />
    </span>
  );
}

export function Faces({ n, big }: { n: number; big?: boolean }) {
  return (
    <span className={'faces' + (big ? ' lg' : '')} aria-hidden="true">
      {Array.from({ length: n }, (_, i) => <i key={i} style={{ background: FR[i % 5][1] }}>{FR[i % 5][0][0]}</i>)}
    </span>
  );
}

export function DateTile({ e }: { e: EventItem }) {
  const D = DAY[e.date];
  return (
    <span className={'dt' + (e.time === 'now' ? ' now' : '')} aria-hidden="true">
      <small>{e.time === 'now' ? 'Now' : D.dow.toUpperCase()}</small><b>{D.d}</b>
    </span>
  );
}

/** exactly one urgency chip: LIVE > starts-in (<90 min) > N left > Request */
export function Urg({ e }: { e: EventItem }) {
  const l = spotsLeft(e);
  if (e.time === 'now') return <span className="pill live"><i className="dot live" />Live</span>;
  if (e.mins > 0 && e.mins < 90) return <span className="pill soon"><Icon n="clock" />In {e.mins} min</span>;
  if (l <= 5) return <span className="pill left"><i className="dot" />{l} left</span>;
  if (e.access === 'request') return <span className="pill"><Icon n="lock" />Request</span>;
  return null;
}

export function SaveBtn({ e }: { e: EventItem }) {
  const { saved, toggleSave } = useApp();
  const toast = useToast();
  return (
    <button
      className="save" type="button" aria-pressed={!!saved[e.id]} aria-label={'Save ' + e.t}
      onClick={(ev) => { ev.preventDefault(); ev.stopPropagation(); const on = toggleSave(e.id); toast(on ? 'Saved. Find it later in your list.' : 'Removed from saved'); }}
    >
      <Icon n="heart" />
    </button>
  );
}

const Trait = ({ e }: { e: EventItem }) =>
  e.solo ? <span className="tag sm t-teal">Come solo</span> : e.level ? <span className="tag sm t-amber">Beginners</span> : null;
const Social = ({ e }: { e: EventItem }) =>
  e.friends ? <span className="who"><Faces n={Math.min(e.friends, 3)} />{e.friends > 1 ? '+' + e.friends : ''}</span> : <span className="gc">{e.taken} going</span>;

/** Grid card (16:10 photo). `isStatic` renders a non-link preview. */
export function EventCard({ e, i = 0, hl, isStatic, whenOverride, socialOverride, onEnter }: {
  e: EventItem; i?: number; hl?: boolean; isStatic?: boolean; whenOverride?: string; socialOverride?: ReactNode; onEnter?: () => void;
}) {
  const inner = (
    <>
      <div className="ph">
        {isStatic ? <span className="img" /> : <Photo k={e.photo} sizes="(max-width: 899px) 100vw, 420px" />}
        <DateTile e={e} />
        <div className="tr"><Urg e={e} />{!isStatic && <SaveBtn e={e} />}</div>
        <div className="ov"><span className="mono">{whenOverride ?? whenLine(e)}</span><h3>{e.t}</h3></div>
      </div>
      <div className="bd">
        <span className="mono meta">{e.area}{e.d ? ' · ' + dist(e.d) + ' · ' + walk(e.d) : ''}</span>
        <div className="ft">
          <b className="pr">{rupee(e.price)}{e.price ? <> <small>/ person</small></> : null}</b>
          <Trait e={e} />
          {socialOverride !== undefined ? socialOverride : <Social e={e} />}
        </div>
      </div>
    </>
  );
  const st = vars({ '--g': G(e.photo), '--tint': e.tint, '--i': i });
  if (isStatic) return <div className="ev" data-id={e.id} style={st}>{inner}</div>;
  return (
    <NavLink href={'/event/' + e.id} className={'ev' + (hl ? ' hl' : '')} data-id={e.id} style={st} onMouseEnter={onEnter}>
      {inner}
    </NavLink>
  );
}

export function RailCard({ e, i }: { e: EventItem; i: number }) {
  return (
    <NavLink href={'/event/' + e.id} className="rc" data-id={e.id} style={vars({ '--tint': e.tint, '--i': i })}>
      <Photo k={e.photo} sizes="300px" />
      <DateTile e={e} />
      <div className="tr"><Urg e={e} /><SaveBtn e={e} /></div>
      <span className="mono meta">{whenLine(e)} · {dist(e.d)}</span>
      <h3>{e.t}</h3>
      <div className="ft">
        <span className="who"><Faces n={Math.min(e.friends, 3)} /><span>{e.friends > 1 ? 'Aditi +' + (e.friends - 1) : 'Aditi'} · {e.taken} going</span></span>
        <b>{rupee(e.price)}</b>
      </div>
    </NavLink>
  );
}

/** Compact card used in the map bottom sheet */
export function CompactCard({ e, hl }: { e: EventItem; hl: boolean }) {
  return (
    <NavLink href={'/event/' + e.id} className={'cc' + (hl ? ' hl' : '')} data-cc={e.id} style={vars({ '--g': G(e.photo) })}>
      <span className="th"><DateTile e={e} /></span>
      <span className="g">
        <span className="mono">{urgText(e) || whenLine(e)}</span>
        <b>{e.t}</b>
        <span><strong>{rupee(e.price)}</strong> · {dist(e.d)} · {walk(e.d)}</span>
      </span>
    </NavLink>
  );
}

/** Animated number (ease-out cubic, 1.1 s). Starts on mount or when scrolled into view. */
export function CountUp({ to, fmt, dec = 0, onView, start, as = 'span' }: { to: number; fmt?: 'inr'; dec?: number; onView?: boolean; start?: boolean; as?: 'span' | 'b' }) {
  const ref = useRef<HTMLElement>(null);
  const [v, setV] = useState(onView ? to : 0);
  useEffect(() => {
    if (start === false) return;
    let raf = 0, io: IntersectionObserver | null = null;
    const run = () => {
      if (reducedMotion()) { setV(to); return; }
      const t0 = performance.now();
      const step = (t: number) => {
        const k = Math.min(1, (t - t0) / 1100);
        setV(to * (1 - Math.pow(1 - k, 3)));
        if (k < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    };
    if (onView && ref.current && 'IntersectionObserver' in window) {
      io = new IntersectionObserver((en) => { if (en[0].isIntersecting) { setV(0); run(); io?.disconnect(); } }, { threshold: 0.3 });
      io.observe(ref.current);
    } else run();
    return () => { cancelAnimationFrame(raf); io?.disconnect(); };
  }, [to, onView, start]);
  const txt = fmt === 'inr' ? '₹' + Math.round(v).toLocaleString('en-IN') : dec ? v.toFixed(dec) : Math.round(v).toLocaleString('en-IN');
  const Tag = as;
  return <Tag ref={ref as React.RefObject<HTMLElement & HTMLSpanElement>}>{txt}</Tag>;
}

/** QR block: 21×21 modules */
export function QR({ cells, style, label }: { cells: boolean[]; style?: CSSProperties; label?: string }) {
  return (
    <div className="qr" style={style} role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      {cells.map((on, i) => <i key={i} className={on ? undefined : 'o'} />)}
    </div>
  );
}

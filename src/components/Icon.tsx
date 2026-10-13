/* Inline SVG icon set (ported from the prototype). */
import type { CSSProperties } from 'react';

type Def = { d: string; fill?: string; stroke?: string; sw?: string; lc?: 'round'; lj?: 'round' };
const ICONS = {
  clock: { d: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>' },
  pin: { d: '<path d="M12 21s-7-6.5-7-12a7 7 0 0 1 14 0c0 5.5-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/>' },
  people: { d: '<circle cx="9" cy="8" r="3.5"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20c1-3.5 3.5-5 6-5s5 1.5 6 5M15.5 14.5c2.5 0 4.5 1.5 5.5 4.5"/>' },
  user: { d: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>' },
  shield: { d: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="m9 12 2 2 4-4"/>' },
  heart: { d: '<path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/>' },
  share: { d: '<path d="M12 15V3M7 8l5-5 5 5"/><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/>' },
  lock: { d: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>' },
  close: { d: '<path d="M6 6l12 12M18 6 6 18"/>' },
  check: { d: '<path d="M5 12.5l4.2 4.2L19 7"/>', sw: '2.6', lc: 'round', lj: 'round' },
  arrow: { d: '<path d="M5 12h14M13 6l6 6-6 6"/>', sw: '2.2', lc: 'round', lj: 'round' },
  arrowUR: { d: '<path d="M7 17 17 7M8 7h9v9"/>', sw: '2.2', lc: 'round', lj: 'round' },
  down: { d: '<path d="M12 5v14M6 13l6 6 6-6"/>', sw: '2.2', lc: 'round', lj: 'round' },
  left: { d: '<path d="M15 6l-6 6 6 6"/>', sw: '2.2', lc: 'round', lj: 'round' },
  right: { d: '<path d="M9 6l6 6-6 6"/>', sw: '2.2', lc: 'round', lj: 'round' },
  chev: { d: '<path d="m6 9 6 6 6-6"/>', sw: '2.2', lc: 'round', lj: 'round' },
  map: { d: '<path d="M9 4 3 6.5v13.5L9 17.5l6 2.5 6-2.5V4l-6 2.5z"/><path d="M9 4v13.5M15 6.5V20"/>' },
  list: { d: '<path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01"/>', sw: '2.2', lc: 'round' },
  locate: { d: '<circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2.5" fill="currentColor"/><path d="M12 1.5v3M12 19.5v3M1.5 12h3M19.5 12h3"/>' },
  star: { d: '<path d="m12 2.8 2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.2l-5.6 3 1.1-6.3L2.9 9.5l6.3-.9z"/>', fill: 'currentColor', stroke: 'none' },
  verified: { d: '<path d="M12 2.5l2.4 1.8 3 .1.9 2.9 2.4 1.8-.9 2.9.9 2.9-2.4 1.8-.9 2.9-3 .1L12 21.5l-2.4-1.8-3-.1-.9-2.9-2.4-1.8.9-2.9-.9-2.9 2.4-1.8.9-2.9 3-.1z"/><path d="m8.5 12 2.4 2.4 4.6-4.8"/>' },
  calendar: { d: '<rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/>' },
  bolt: { d: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>', lj: 'round' },
  eye: { d: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>' },
  mail: { d: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="m4 7 8 6 8-6"/>' },
  search: { d: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>' },
  bulb: { d: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.8.8 1 1.5 1 2.5h6c0-1 .2-1.7 1-2.5A6 6 0 0 0 12 3z"/>' },
  desk: { d: '<rect x="2.5" y="4" width="19" height="12.5" rx="2"/><path d="M8 20h8M12 16.5V20"/>' },
  phone: { d: '<rect x="6" y="2.5" width="12" height="19" rx="3"/><path d="M10.5 18.5h3"/>' },
  back: { d: '<path d="M19 12H5M11 6l-6 6 6 6"/>', sw: '2.2', lc: 'round', lj: 'round' },
  wallet: { d: '<rect x="3" y="6" width="18" height="14" rx="3"/><path d="M3 10h18M16 15h2"/><path d="M6 6l9-3 1.5 3"/>' },
  filter: { d: '<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>', lc: 'round' },
  plus: { d: '<path d="M12 5v14M5 12h14"/>', sw: '2.2', lc: 'round' },
  bookmark: { d: '<path d="M6 3h12v18l-6-4-6 4z"/>' },
} satisfies Record<string, Def>;

export type IconName = keyof typeof ICONS;

export function Icon({ n, className, style, size }: { n: IconName; className?: string; style?: CSSProperties; size?: number }) {
  const i: Def = ICONS[n];
  return (
    <svg
      viewBox="0 0 24 24"
      fill={i.fill ?? 'none'}
      stroke={i.stroke ?? 'currentColor'}
      strokeWidth={i.sw ?? 2}
      strokeLinecap={i.lc}
      strokeLinejoin={i.lj}
      aria-hidden="true"
      className={className}
      style={style}
      width={size}
      height={size}
      dangerouslySetInnerHTML={{ __html: i.d }}
    />
  );
}

/** Moon + sun pair; CSS shows the right one for the current theme. */
export function ThemeIcons() {
  return (
    <>
      <svg className="moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>
      <svg className="sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true"><circle cx="12" cy="12" r="4.2" /><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8" /></svg>
    </>
  );
}

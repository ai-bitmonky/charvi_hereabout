import type { EventItem } from '@/data/events';

const esc = (s: string) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string);

let ART = '';
/** Stylised dark city map (560×560 SVG inner markup), deterministic. */
export function artInner(): string {
  if (ART) return ART;
  let s = '<rect width="560" height="560" fill="var(--map-bg)"/>', seed = 11;
  const R = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
  const rc = (x: number, y: number, w: number, h: number, f: string) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="${f}"/>`;
  for (let gy = 0; gy < 14; gy++) for (let gx = 0; gx < 14; gx++) {
    const x = gx * 40 + 5, y = gy * 40 + 5, r = R(), f = 'var(--map-block)';
    if (r < 0.1) continue;
    if (r > 0.94) { s += rc(x, y, 30, 30, 'var(--map-park)'); continue; }
    if (r < 0.38) s += rc(x, y, 30, 13, f) + rc(x, y + 17, 30, 13, f);
    else if (r < 0.58) s += rc(x, y, 13, 30, f) + rc(x + 17, y, 13, 30, f);
    else s += rc(x, y, 30, 30, f);
  }
  s += '<rect x="42" y="292" width="76" height="58" rx="16" fill="var(--map-park)"/><rect x="330" y="470" width="64" height="44" rx="14" fill="var(--map-park)"/>';
  s += '<path d="M468 168c22-20 66-16 80 12 14 30-6 62-36 66-30 5-58-14-60-40-1-14 6-28 16-38z" fill="var(--map-water)"/>';
  s += '<g fill="none" stroke-linecap="round"><g stroke="var(--map-road)" stroke-width="9"><path d="M-10 140 L570 190"/><path d="M-10 410 L570 370"/><path d="M150 -10 L195 570"/><path d="M420 -10 L385 570"/></g>' +
    '<g stroke="var(--map-road-2)" stroke-width="5"><path d="M-10 282 L570 270"/><path d="M280 -10 L288 570"/><path d="M40 -10 L540 570"/><path d="M-10 520 L570 500"/><path d="M-10 64 Q280 96 570 44"/></g></g>';
  s += '<path d="M-10 226 L190 244 L370 236 L570 212" fill="none" stroke="var(--lilac)" stroke-width="2.5" stroke-opacity=".65" stroke-dasharray="9 5"/>';
  [[190, 244], [300, 239], [450, 226]].forEach((p) => { s += `<circle cx="${p[0]}" cy="${p[1]}" r="4.5" fill="var(--map-bg)" stroke="var(--lilac)" stroke-width="2"/>`; });
  [1, 2, 3].forEach((k) => {
    const r = k * 85;
    s += `<circle cx="280" cy="280" r="${r}" fill="none" stroke="var(--teal)" stroke-opacity="${0.5 - k * 0.1}" stroke-width="1" stroke-dasharray="2 5"/><text class="rt" x="${280 + r * 0.71 + 5}" y="${280 - r * 0.71 - 3}">${k} KM</text>`;
  });
  ([['INDIRANAGAR', 300, 212], ['DOMLUR', 128, 418], ['KORAMANGALA', 60, 104], ['HAL 2ND STAGE', 410, 456], ['ULSOOR', 474, 186], ['DEFENCE COLONY', 22, 272], ['JB NAGAR', 30, 536], ['CMH ROAD', 302, 226]] as [string, number, number][])
    .forEach((l) => { s += `<text class="al" x="${l[1]}" y="${l[2]}">${l[0]}</text>`; });
  return (ART = s);
}

/** Location map for the event page: route from "you" to the venue, or a blurred area for private homes. */
export function locMap(e: EventItem, approx: boolean): string {
  const x0 = Math.min(280, e.x), x1 = Math.max(280, e.x), y0 = Math.min(280, e.y), y1 = Math.max(280, e.y);
  let W = Math.max(x1 - x0 + 170, 440); const H = Math.max(y1 - y0 + 120, (W * 7) / 16);
  if (H > (W * 7) / 16) W = (H * 16) / 7;
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, u = W / 46;
  const n = (v: number) => v.toFixed(1);
  let s = `<svg viewBox="${n(cx - W / 2)} ${n(cy - H / 2)} ${n(W)} ${n(H)}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Map: ${esc(approx ? e.area + ', approximate area' : e.place)}">` + artInner();
  s += `<path d="M280 280 L${e.x} ${e.y}" stroke="var(--teal)" stroke-width="${n(u * 0.22)}" stroke-dasharray="${n(u * 0.5)} ${n(u * 0.4)}" fill="none" stroke-linecap="round"/>`;
  s += `<circle cx="280" cy="280" r="${n(u * 0.7)}" fill="var(--teal)" stroke="var(--map-bg)" stroke-width="${n(u * 0.25)}"/><text x="280" y="${n(280 + u * 2)}" text-anchor="middle" style="font-size:${n(u * 0.85)}px;fill:var(--teal)">YOU</text>`;
  if (approx) {
    s += `<circle cx="${e.x}" cy="${e.y}" r="${n(u * 5)}" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="${n(u * 0.12)}" stroke-dasharray="${n(u * 0.3)} ${n(u * 0.3)}"/><text x="${e.x}" y="${n(e.y + u * 0.35)}" text-anchor="middle" style="font-size:${n(u * 0.9)}px;fill:var(--ink)">${esc(e.area.toUpperCase())}</text>`;
  } else {
    const lbl = e.place, fz = u * 1.05, tw = lbl.length * fz * 0.56 + fz * 1.8, th = fz * 2.1, ly = e.y - th / 2;
    let lx = e.x + u * 1.4;
    if (lx + tw > cx + W / 2 - u) lx = e.x - u * 1.4 - tw;
    s += `<circle cx="${e.x}" cy="${e.y}" r="${n(u * 1.6)}" fill="none" stroke="var(--accent)" stroke-opacity=".4" stroke-width="${n(u * 0.12)}"/><circle cx="${e.x}" cy="${e.y}" r="${n(u * 0.8)}" fill="var(--accent)" stroke="var(--map-bg)" stroke-width="${n(u * 0.25)}"/>` +
      `<rect x="${n(lx)}" y="${n(ly)}" width="${n(tw)}" height="${n(th)}" rx="${n(th / 2)}" fill="var(--surface)" stroke="var(--line-2)" stroke-width="${n(u * 0.06)}"/>` +
      `<text x="${n(lx + fz * 0.9)}" y="${n(ly + th * 0.66)}" style="font:700 ${n(fz)}px var(--f-ui);letter-spacing:0;fill:var(--ink)">${esc(lbl)}</text>`;
  }
  return s + '</svg>';
}

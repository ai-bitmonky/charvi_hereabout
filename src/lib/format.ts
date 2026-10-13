import { CATS, DAY, events, type EventItem } from '@/data/events';

export const rupee = (n: number) => (n === 0 ? 'Free' : '₹' + n.toLocaleString('en-IN'));
export const dist = (d: number) => (d < 1 ? Math.round(d * 1000) + ' m' : d.toFixed(1) + ' km');
export const walkM = (d: number) => Math.max(1, Math.round(d * 12));
export const walk = (d: number) => walkM(d) + ' min walk';
export const fee = (sub: number) => (sub === 0 ? 0 : Math.round(sub * 0.05 + 25));
export const spotsLeft = (e: EventItem) => e.cap - e.taken;
export const names = (n: number) => (n >= 3 ? 'Aditi, Kabir and Neha' : n === 2 ? 'Aditi and Kabir' : 'Aditi');

export function startsIn(e: EventItem) {
  const m = e.mins;
  if (m <= 0) return 'Started ' + -m + ' min ago';
  if (m < 60) return 'In ' + m + ' min';
  if (m < 360) {
    const h = Math.floor(m / 60), r = m % 60;
    return 'In ' + h + ' h' + (r ? ' ' + r + ' min' : '');
  }
  return DAY[e.date].rel;
}
export const whenLine = (e: EventItem) =>
  e.time === 'now' ? 'Live · until 10 pm' : e.time === 'tonight' ? 'Today · ' + e.start : DAY[e.date].full + ' · ' + e.start;
export const catName = (c: string) => CATS.find((x) => x[0] === c)?.[1] ?? c;
export const groupSize = (e: EventItem) =>
  e.id === 'pizza' ? 'Tables of six' : e.cap <= 12 ? 'Small group' : e.cap <= 25 ? 'Medium group' : 'Big crowd';

/** exactly one urgency label: LIVE > starts-in (<90 min) > N left > Request */
export function urgText(e: EventItem) {
  const l = spotsLeft(e);
  if (e.time === 'now') return 'Live now';
  if (e.mins > 0 && e.mins < 90) return 'In ' + e.mins + ' min';
  if (l <= 5) return l + ' left';
  if (e.access === 'request') return 'Request to join';
  return '';
}

export interface Filters {
  time: 'all' | 'now' | 'tonight' | 'weekend';
  cat: string;
  dist: number;
  q: string;
  budget: boolean;
  solo: boolean;
}
export const DEFAULT_FILTERS: Filters = { time: 'all', cat: 'all', dist: 3, q: '', budget: false, solo: false };

export function filterEvents(f: Filters): EventItem[] {
  const q = f.q.trim().toLowerCase();
  const order = { now: 0, tonight: 1, weekend: 2 };
  return events
    .filter((e) => {
      if (f.time !== 'all') {
        if (f.time === 'tonight') { if (!(e.time === 'now' || e.time === 'tonight')) return false; }
        else if (e.time !== f.time) return false;
      }
      if (f.cat !== 'all' && e.cat !== f.cat) return false;
      if (e.d > f.dist) return false;
      if (f.budget && e.price > 500) return false;
      if (f.solo && !e.solo) return false;
      if (q && (e.t + ' ' + e.host + ' ' + e.area + ' ' + e.cat + ' ' + e.vibe).toLowerCase().indexOf(q) < 0) return false;
      return true;
    })
    .sort((a, b) => order[a.time] - order[b.time] || a.mins - b.mins || a.d - b.d);
}

export const plural = (n: number) => n + (n === 1 ? ' plan' : ' plans');

/** Deterministic QR-like 21×21 grid (true = dark module) */
export function qrCells(seed: string): boolean[] {
  let s = 0;
  for (let i = 0; i < seed.length; i++) s += seed.charCodeAt(i) * (i + 7);
  const r = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  const finder = (x: number, y: number) => {
    const p = [[0, 0], [14, 0], [0, 14]];
    for (let i = 0; i < 3; i++) {
      const dx = x - p[i][0], dy = y - p[i][1];
      if (dx >= 0 && dx < 7 && dy >= 0 && dy < 7)
        return dx === 0 || dx === 6 || dy === 0 || dy === 6 || (dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4) ? 1 : 0;
    }
    return -1;
  };
  const out: boolean[] = [];
  for (let y = 0; y < 21; y++) for (let x = 0; x < 21; x++) { const v = finder(x, y); out.push(v === -1 ? r() > 0.5 : v === 1); }
  return out;
}

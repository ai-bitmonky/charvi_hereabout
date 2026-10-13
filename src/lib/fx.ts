/* Small imperative effects shared across views (client only). */

export const reducedMotion = () =>
  typeof window !== 'undefined' && !!window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const MOBILE_MAX = 899;
export const isMobileNow = () => typeof window !== 'undefined' && window.innerWidth <= MOBILE_MAX;

/** ~64 particle burst from a point; removed after ~1.9 s */
export function confetti(x: number, y: number) {
  if (reducedMotion()) return;
  const cols = ['#FF5A3C', '#FFC247', '#3DF0C8', '#B59CFF', '#F4F1EA', '#FF8A6B'];
  const box = document.createElement('div');
  box.className = 'confetti';
  box.setAttribute('aria-hidden', 'true');
  document.body.appendChild(box);
  for (let i = 0; i < 64; i++) {
    const p = document.createElement('i'), w = 5 + Math.random() * 6, h = 8 + Math.random() * 9;
    p.style.cssText = `left:${x}px;top:${y}px;width:${w}px;height:${h}px;background:${cols[i % cols.length]}` + (i % 5 === 0 ? `;border-radius:50%;height:${w}px` : '');
    box.appendChild(p);
    const a = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.25, v = 180 + Math.random() * 320;
    const dx = Math.cos(a) * v, dy = Math.sin(a) * v, rot = (Math.random() - 0.5) * 900;
    p.animate(
      [
        { transform: 'translate(-50%,-50%) rotate(0deg)', opacity: 1 },
        { transform: `translate(${dx * 0.75}px,${dy * 0.9}px) rotate(${rot * 0.5}deg)`, opacity: 1, offset: 0.35 },
        { transform: `translate(${dx}px,${dy + 460}px) rotate(${rot}deg)`, opacity: 0 },
      ],
      { duration: 1150 + Math.random() * 450, easing: 'cubic-bezier(.2,.8,.4,1)', fill: 'forwards' },
    );
  }
  setTimeout(() => box.remove(), 1900);
}

/* ---- "scroll to Explore" handoff between routes ---- */
let pendingExplore = false;
export const requestExplore = () => { pendingExplore = true; };
export const consumeExplore = () => { const p = pendingExplore; pendingExplore = false; return p; };

/** Scroll so the Explore filter bar sits just under the sticky header / app bar. */
export function toExplore() {
  const el = document.getElementById('explore');
  if (!el) return;
  const bar = (isMobileNow() ? document.getElementById('abar') : document.querySelector('.hdr')) as HTMLElement | null;
  const h = bar ? bar.offsetHeight : 64;
  window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - h + 1, behavior: reducedMotion() ? 'auto' : 'smooth' });
}

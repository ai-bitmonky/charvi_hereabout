'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Icon, ThemeIcons } from './Icon';
import { useApp, useNav } from './Providers';
import { MOBILE_MAX, reducedMotion } from '@/lib/fx';

/** Mobile app bar with the iOS large-title pattern.
 *  large: title collapses into the bar after the large title scrolls away.
 *  fixed: floats over a cover photo and turns solid once the cover is gone. */
export function AppBar({ title, back, right, large, fixed }: { title: string; back?: boolean; right?: ReactNode; large?: boolean; fixed?: boolean }) {
  const ref = useRef<HTMLElement>(null);
  const nav = useNav();
  const [sc, setSc] = useState(!large);
  const [tt, setTt] = useState(!large);
  useEffect(() => {
    if (!large) return;
    const on = () => {
      const a = ref.current;
      if (!a) return;
      if (fixed) {
        const c = document.querySelector('.cover');
        const solid = !!c && c.getBoundingClientRect().bottom < a.offsetHeight + 8;
        setSc(solid); setTt(solid);
        return;
      }
      setSc(window.scrollY > 4);
      const h = document.querySelector('.lt h1');
      setTt(h ? h.getBoundingClientRect().bottom < a.offsetHeight - 6 : window.scrollY > 40);
    };
    on();
    window.addEventListener('scroll', on, { passive: true });
    window.addEventListener('resize', on);
    return () => { window.removeEventListener('scroll', on); window.removeEventListener('resize', on); };
  }, [large, fixed]);
  const cls = 'abar' + (large ? '' : ' st') + (sc ? ' sc' : '') + (tt ? ' tt' : '') + (fixed ? ' fx' : '');
  return (
    <header className={cls} id="abar" ref={ref}>
      <div className="abar-in">
        <div className="abar-l">{back && <button className="cbtn" type="button" aria-label="Back" onClick={() => nav.back()}><Icon n="left" /></button>}</div>
        <b className="abar-t">{title}</b>
        <div className="abar-r">{right}</div>
      </div>
    </header>
  );
}

export function ThemeBtn() {
  const { toggleTheme } = useApp();
  return <button className="cbtn thb" type="button" aria-label="Switch dark or light theme" onClick={toggleTheme}><ThemeIcons /></button>;
}

export function LargeTitle({ title, sub, extra }: { title: string; sub: string; extra?: ReactNode }) {
  return (
    <div className="lt">
      <span className="mono lt-k">{sub}</span>
      <div className="lt-r"><h1>{title}</h1>{extra}</div>
    </div>
  );
}

/** Modal on desktop, bottom sheet with drag handle on phones (swipe down to close). */
export function Sheet({ label, onClosed, children }: { label: string; onClosed: () => void; children: (close: () => void) => ReactNode }) {
  const scrimRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const closing = useRef(false);
  const onClosedRef = useRef(onClosed);
  onClosedRef.current = onClosed;
  const [mounted, setMounted] = useState(false);

  const close = useRef(() => {
    const scrim = scrimRef.current, m = modalRef.current;
    if (closing.current) return;
    closing.current = true;
    const done = () => onClosedRef.current();
    if (!scrim || !m || reducedMotion() || !m.animate) { done(); return; }
    const mob = window.innerWidth <= MOBILE_MAX;
    const cur = getComputedStyle(m).transform;
    m.animate(
      [{ transform: cur === 'none' ? 'none' : cur }, { transform: mob ? 'translateY(100%)' : 'translateY(16px) scale(.98)', opacity: mob ? 1 : 0 }],
      { duration: mob ? 240 : 180, easing: 'cubic-bezier(.4,0,1,1)', fill: 'forwards' },
    );
    scrim.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 240, fill: 'forwards' }).onfinish = done;
  }).current;

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    const prev = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const scrim = scrimRef.current!;
    const key = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') { close(); return; }
      if (ev.key === 'Tab') {
        const fs = scrim.querySelectorAll<HTMLElement>('button:not([disabled]),a[href],input,textarea');
        if (!fs.length) return;
        const a = fs[0], z = fs[fs.length - 1];
        if (ev.shiftKey && document.activeElement === a) { ev.preventDefault(); z.focus(); }
        else if (!ev.shiftKey && document.activeElement === z) { ev.preventDefault(); a.focus(); }
      }
    };
    document.addEventListener('keydown', key);
    // swipe down on the handle / header to close (phones)
    let y0: number | null = null, dy = 0;
    const down = (ev: PointerEvent) => {
      if (window.innerWidth > MOBILE_MAX) return;
      const t = ev.target as HTMLElement;
      if (!t.closest('.handle,.mh') || t.closest('button')) return;
      y0 = ev.clientY; dy = 0;
      modalRef.current!.style.transition = 'none';
      try { scrim.setPointerCapture(ev.pointerId); } catch { /* noop */ }
    };
    const move = (ev: PointerEvent) => { if (y0 === null) return; dy = Math.max(0, ev.clientY - y0); modalRef.current!.style.transform = `translateY(${dy}px)`; };
    const up = () => {
      if (y0 === null) return;
      y0 = null;
      const m = modalRef.current!;
      if (dy > 90) close();
      else { m.style.transition = 'transform .25s cubic-bezier(.2,.8,.2,1)'; m.style.transform = ''; }
    };
    scrim.addEventListener('pointerdown', down);
    scrim.addEventListener('pointermove', move);
    scrim.addEventListener('pointerup', up);
    scrim.addEventListener('pointercancel', up);
    const f = scrim.querySelector<HTMLElement>('.mb button,.mb input,.mb textarea');
    f?.focus({ preventScroll: true });
    return () => {
      document.removeEventListener('keydown', key);
      document.body.style.overflow = prevOverflow;
      if (prev && document.body.contains(prev)) prev.focus({ preventScroll: true });
    };
  }, [mounted, close]);

  if (!mounted) return null;
  return createPortal(
    <div className="scrim" ref={scrimRef} onClick={(ev) => { if (ev.target === ev.currentTarget) close(); }}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={label} ref={modalRef}>
        <div className="handle" aria-hidden="true" />
        {children(close)}
      </div>
    </div>,
    document.body,
  );
}

export function SheetHead({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div className="mh">
      <h2>{title}</h2>
      <button className="icon-btn" type="button" aria-label="Close" onClick={onClose}><Icon n="close" /></button>
    </div>
  );
}

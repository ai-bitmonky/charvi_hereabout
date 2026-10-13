'use client';

import { useEffect, useRef, useState } from 'react';
import { DAY, G, type EventItem, type Tier } from '@/data/events';
import { fee, qrCells, rupee, startsIn } from '@/lib/format';
import { confetti } from '@/lib/fx';
import { Icon } from './Icon';
import { NavLink, QR, vars } from './Bits';
import { Sheet } from './Chrome';
import { useApp, useToast } from './Providers';

/** Pay → Details → Done (or Message → Sent for request-to-join). Modal on desktop, sheet on phones. */
export default function Checkout({ e, tier, qty, onClosed }: { e: EventItem; tier: Tier; qty: number; onClosed: () => void }) {
  const { addTicket } = useApp();
  const toast = useToast();
  const isReq = e.access === 'request';
  const sub = tier.p * qty, f = fee(sub), tot = sub + f;
  const [step, setStep] = useState(tot ? 1 : 2);
  const [pay, setPay] = useState('upi');
  const [msg, setMsg] = useState('');
  const [name, setName] = useState('Riya Sharma');
  const [phone, setPhone] = useState('+91 98450 12345');
  const [tid, setTid] = useState('');
  const ckRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const labels = isReq ? (tot ? ['Payment hold', 'Message', 'Sent'] : ['Message', 'Sent']) : tot ? ['Pay', 'Details', 'Done'] : ['Details', 'Done'];
  const si = tot ? step - 1 : step - 2;
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    document.querySelector<HTMLElement>('.modal .mb button,.modal .mb input,.modal .mb textarea')?.focus({ preventScroll: true });
  }, [step]);

  const next = () => {
    if (step === 2 && !isReq) {
      if (!name.trim()) { nameRef.current?.focus(); toast('Add the name for the ticket'); return; }
      const id = 'T-' + (5000 + Math.floor(Math.random() * 4000));
      setTid(id);
      addTicket({ id, ev: e.id, qty, tier: tier.n, total: tot, status: 'upcoming' });
    }
    setStep((s) => s + 1);
    if (step === 2) {
      requestAnimationFrame(() => requestAnimationFrame(() => {
        const r = ckRef.current?.getBoundingClientRect();
        confetti(r ? r.left + r.width / 2 : innerWidth / 2, r ? r.top + r.height / 2 : innerHeight / 2);
      }));
    }
  };

  const sumEv = (
    <div className="sev" style={vars({ '--g': G(e.photo) })}>
      <span className="th" />
      <div style={{ minWidth: 0 }}><b>{e.t}</b><span className="mono">{DAY[e.date].full} · {e.start} · {qty} × {tier.n}</span></div>
    </div>
  );
  const lines = (
    <>
      <div className="line" style={{ marginTop: 10 }}><span>{qty} × {tier.n}</span><span>{rupee(sub)}</span></div>
      <div className="line"><span>Booking fee</span><span>{rupee(f)}</span></div>
      <div className="line tot"><span>Total</span><span>{rupee(tot)}</span></div>
    </>
  );

  return (
    <Sheet label={isReq ? 'Request to join' : 'Checkout'} onClosed={onClosed}>
      {(close) => (
        <>
          {step !== 3 && (
            <>
              <div className="mh">
                <h2>{isReq ? 'Request to join' : step === 1 ? 'Pay' : 'Your details'}</h2>
                <button className="icon-btn" type="button" aria-label="Close" onClick={close}><Icon n="close" /></button>
              </div>
              <div className="steps mono" aria-hidden="true">
                {labels.map((l, i) => <span key={l} className={i <= si ? 'on' : undefined}>0{i + 1} {l}</span>)}
              </div>
            </>
          )}
          <div className="mb" key={step}>
            {step === 1 && (
              <>
                {sumEv}
                <div className="lbl">Pay with<span>Saved methods first</span></div>
                {[['upi', 'UPI', 'riya@okbank · saved', 'UPI', 'upi'], ['card', 'Card', 'Visa ending 4421', 'VISA', 'card'], ['new', 'Add a new method', 'UPI, card or net banking', '+', '']].map((p) => (
                  <button key={p[0]} className="payo" type="button" aria-pressed={pay === p[0]} onClick={() => { setPay(p[0]); if (p[0] === 'new') toast('Add UPI, card or net banking here'); }}>
                    <span className={'lg ' + p[4]}>{p[3]}</span>
                    <span className="g"><b>{p[1]}</b><span>{p[2]}</span></span>
                    <span className="rd" />
                  </button>
                ))}
                {lines}
                <button className="btn btn-p btn-lg btn-block" type="button" style={{ marginTop: 18 }} onClick={next}>{isReq ? `Hold ${rupee(tot)} and continue` : `Pay ${rupee(tot)}`}</button>
                <p className="fine"><Icon n="shield" /><span>{isReq ? 'We only hold the money. You pay nothing if the host says no.' : 'Free cancellation up to 1 hour before start. Full refund to your UPI.'}</span></p>
              </>
            )}
            {step === 2 && (
              <>
                {sumEv}
                {isReq ? (
                  <div className="field">
                    <label htmlFor="hostMsg">Say hello to {e.host}</label>
                    <textarea id="hostMsg" placeholder="Hi! I'm new in the area and love board games." value={msg} onChange={(ev) => setMsg(ev.target.value)} />
                    <span className="hint">A short note makes a yes more likely.</span>
                  </div>
                ) : (
                  <>
                    <div className="field"><label htmlFor="nm">Name on ticket</label><input id="nm" ref={nameRef} value={name} onChange={(ev) => setName(ev.target.value)} autoComplete="name" /></div>
                    <div className="field"><label htmlFor="ph">Phone for updates</label><input id="ph" value={phone} onChange={(ev) => setPhone(ev.target.value)} inputMode="tel" autoComplete="tel" /><span className="hint">We text you if anything changes.</span></div>
                  </>
                )}
                <button className="btn btn-p btn-lg btn-block" type="button" onClick={next}>{isReq ? 'Send request' : 'Confirm ' + (qty > 1 ? qty + ' spots' : 'my spot')}</button>
              </>
            )}
            {step === 3 && (
              <>
                <div className="succ">
                  <div className="ck" ref={ckRef}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="#160906" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.2 4.2L19 7" /></svg>
                  </div>
                  <h3>{isReq ? 'Request sent.' : "You're going."}</h3>
                  <p>{isReq ? `${e.host} usually replies within 2 hours. We'll send the address once you're in.` : `Your ticket is saved and works offline. ${startsIn(e)}.`}</p>
                </div>
                <div className="wtk" style={vars({ '--g': G(e.photo), '--tint': e.tint })}>
                  <div className="tp" />
                  <div className="tx">
                    <b>{e.t}</b>
                    <span className="mono">{DAY[e.date].full} · {e.start}</span>
                    <span className="mono">{qty} × {tier.n} · {isReq ? 'Pending' : tid}</span>
                  </div>
                  <div className="qrw"><QR cells={qrCells(tid || e.id)} style={isReq ? { filter: 'blur(3px)', opacity: 0.5 } : undefined} /></div>
                </div>
                <div className="mact">
                  <button className="btn btn-s btn-lg" type="button" onClick={close}>Keep browsing</button>
                  {!isReq && <NavLink className="btn btn-p btn-lg" href="/tickets">View ticket</NavLink>}
                </div>
              </>
            )}
          </div>
        </>
      )}
    </Sheet>
  );
}

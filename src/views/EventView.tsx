'use client';

import { useEffect, useMemo, useState } from 'react';
import { DAY, events, type EventItem } from '@/data/events';
import {
  catName, dist, fee, groupSize, names, rupee, spotsLeft, startsIn, walk,
} from '@/lib/format';
import { locMap } from '@/lib/mapArt';
import { reducedMotion } from '@/lib/fx';
import { Icon } from '@/components/Icon';
import { DateTile, EventCard, Faces, NavLink, Photo, SaveBtn, vars } from '@/components/Bits';
import { AppBar } from '@/components/Chrome';
import Checkout from '@/components/Checkout';
import { useNav, useToast } from '@/components/Providers';

function BookCard({ e, tierIdx, setTier, qty, setQty, onBook }: {
  e: EventItem; tierIdx: number; setTier: (i: number) => void; qty: number; setQty: (n: number) => void; onBook: () => void;
}) {
  const isReq = e.access === 'request';
  const t = e.tiers[tierIdx], sub = t.p * qty, f = fee(sub), tot = sub + f, l = spotsLeft(e), maxQ = Math.min(6, l);
  const [w, setW] = useState(0);
  useEffect(() => { const r = requestAnimationFrame(() => setW(Math.round((e.taken / e.cap) * 100))); return () => cancelAnimationFrame(r); }, [e]);
  return (
    <aside className="book" aria-label="Book">
      <div className="bp"><b>{rupee(t.p)}</b>{t.p ? <span>per person</span> : <span>no charge</span>}</div>
      <div className="mono allin"><Icon n="check" size={14} />Full price shown · no surprises</div>
      <div className="capbar" role="img" aria-label={`${e.taken} of ${e.cap} spots taken`}><i style={{ width: w + '%' }} /></div>
      <div className="caprow"><span>{e.taken} going</span><b>{l} spots left</b></div>
      {e.tiers.length > 1 && (
        <div className="tiers" role="radiogroup" aria-label="Ticket type">
          {e.tiers.map((x, i) => (
            <button key={x.n} className="tier" type="button" role="radio" aria-checked={i === tierIdx} onClick={() => setTier(i)}>
              <span className="rd" />
              <span className="g"><b>{x.n}</b><span>{x.s}{x.left ? <> · <em>{x.left} left</em></> : null}</span></span>
              <b>{rupee(x.p)}</b>
            </button>
          ))}
        </div>
      )}
      <div className="qty">
        <span>{isReq ? 'Seats' : 'Tickets'}<small>Up to {maxQ} per booking</small></span>
        <div className="stepper">
          <button type="button" aria-label="Fewer" disabled={qty <= 1} onClick={() => setQty(qty - 1)}>−</button>
          <span><b>{qty}</b></span>
          <button type="button" aria-label="More" disabled={qty >= maxQ} onClick={() => setQty(qty + 1)}>+</button>
        </div>
      </div>
      {sub > 0 && (
        <>
          <div className="line"><span>{qty} × {t.n}</span><span>{rupee(sub)}</span></div>
          <div className="line"><span>Booking fee</span><span>{rupee(f)}</span></div>
          <div className="line tot"><span>Total</span><span>{rupee(tot)}</span></div>
        </>
      )}
      <button className="btn btn-p btn-lg btn-block" type="button" style={{ marginTop: 16 }} onClick={onBook}>
        {isReq ? 'Request to join' : tot ? 'Book for ' + rupee(tot) : 'Reserve ' + (qty > 1 ? qty + ' spots' : 'a spot')}
      </button>
      <p className="fine"><Icon n="shield" /><span>{isReq ? "You won't be charged until the host says yes. If they decline, the hold is released at once." : 'Free cancellation up to 1 hour before start. Refunds go back to your UPI in 2 days.'}</span></p>
      <div className="trust mono"><span><Icon n="lock" />Secure UPI</span><span><Icon n="verified" />Verified host</span></div>
    </aside>
  );
}

export default function EventView({ e }: { e: EventItem }) {
  const toast = useToast();
  const nav = useNav();
  const [tierIdx, setTier] = useState(0);
  const [qty, setQty] = useState(1);
  const [follow, setFollow] = useState(false);
  const [checkout, setCheckout] = useState(false);
  const l = spotsLeft(e), isReq = e.access === 'request', live = e.time === 'now';
  const similar = useMemo(() => events.filter((x) => x.id !== e.id && x.cat === e.cat)
    .concat(events.filter((x) => x.id !== e.id && x.cat !== e.cat && x.time !== 'weekend')).slice(0, 3), [e]);
  const R = 56, C = 2 * Math.PI * R, off = C * (1 - e.taken / e.cap);
  const t = e.tiers[tierIdx], sub = t.p * qty, tot = sub + fee(sub);
  const jump = (id: string) => {
    const el = document.getElementById(id);
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 70, behavior: reducedMotion() ? 'auto' : 'smooth' });
  };
  const share = () => toast('Link copied. Send it to a friend.');
  const map = useMemo(() => ({ __html: locMap(e, isReq) }), [e, isReq]);

  return (
    <div className="view evp" style={vars({ '--tint': e.tint })}>
      <AppBar title={e.t} back fixed large right={<button className="cbtn" type="button" aria-label="Share" onClick={share}><Icon n="share" /></button>} />
      <div className="wrap">
        <nav className="crumbs mono" aria-label="Breadcrumb">
          <NavLink href="/">Discover</NavLink><span>/</span><span>{catName(e.cat)}</span><span>/</span><span style={{ color: 'var(--ink)' }}>{e.area}</span>
        </nav>
        <div className="cover">
          <Photo k={e.photo} sizes="(max-width: 1320px) 100vw, 1256px" priority />
          <DateTile e={e} />
          <button className="save bk" type="button" aria-label="Back" onClick={() => nav.back()}><Icon n="left" /></button>
          <div className="acts"><SaveBtn e={e} /><button className="save" type="button" aria-label="Share" onClick={share}><Icon n="share" /></button></div>
          <div className="in">
            <div className="tags">
              {live ? <span className="pill live"><i className="dot live" />Live now</span>
                : e.mins > 0 && e.mins < 90 ? <span className="pill soon"><Icon n="clock" />Starts in {e.mins} min</span> : null}
              {isReq && <span className="pill"><Icon n="lock" />Request to join</span>}
              {l <= 5 && <span className="pill left"><i className="dot" />{l} spots left</span>}
              {e.solo && <span className="pill"><Icon n="user" />Come solo</span>}
              {e.level && <span className="pill">{e.level}</span>}
            </div>
            <h1>{e.t}</h1>
            <div className="by">
              <span className="avatar" style={{ background: e.hostC }}>{e.hostI}</span>
              <span>Hosted by <b>{e.host}</b></span>
              <span className="vf"><Icon n="verified" />Verified</span>
            </div>
          </div>
        </div>

        <div className="dgrid">
          <div>
            <div className="facts">
              <div className="fact">
                <span className="ic"><Icon n="clock" /></span>
                <div><span className="mono">When</span><b>{live ? 'Live now · till 10 pm' : DAY[e.date].full + ', ' + e.start}</b><span className="s">{live ? 'Started at ' + e.start : startsIn(e)}</span></div>
              </div>
              <button type="button" className="fact" onClick={() => jump('locSec')}>
                <span className="ic"><Icon n="pin" /></span>
                <div><span className="mono">Where</span><b>{isReq ? e.area + ' (address on approval)' : e.place}</b><span className="s">{dist(e.d)} · {walk(e.d)}</span></div>
                <i className="chv"><Icon n="right" /></i>
              </button>
              <div className="fact">
                <span className="ic"><Icon n="people" /></span>
                <div><span className="mono">The room</span><b>{e.taken} of {e.cap} going</b><span className="s">{groupSize(e)} · {e.vibe.toLowerCase()}</span></div>
              </div>
              <button type="button" className="fact" onClick={() => jump('hostSec')}>
                <span className="ic" style={{ background: 'var(--teal-soft)', color: 'var(--teal-ink)' }}><Icon n="shield" /></span>
                <div><span className="mono">Host</span><b>Verified · ★ {e.rating.toFixed(1)}</b><span className="s">{e.reviews} guest reviews</span></div>
                <i className="chv"><Icon n="right" /></i>
              </button>
            </div>

            <section className="ds">
              <h2>About</h2>
              {e.about.map((p) => <p key={p}>{p}</p>)}
              <div className="incl">{e.incl.map((i) => <span key={i} className="tag"><Icon n="check" />{i}</span>)}</div>
            </section>

            <section className="ds">
              <h2>Who&apos;s in the room</h2>
              <div className="room">
                <div className="cring" style={vars({ '--len': C.toFixed(1), '--off': off.toFixed(1) })}>
                  <svg viewBox="0 0 132 132" aria-hidden="true">
                    <defs><linearGradient id="cg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#FF5A3C" /><stop offset="1" stopColor="#FFC247" /></linearGradient></defs>
                    <circle cx="66" cy="66" r="56" fill="none" stroke="var(--surface-3)" strokeWidth="12" />
                    <circle className="arc" cx="66" cy="66" r="56" fill="none" stroke="url(#cg)" strokeWidth="12" strokeLinecap="round" />
                  </svg>
                  <div className="c"><div><b>{e.taken}</b><small>of {e.cap} going</small></div></div>
                </div>
                <div className="room-t">
                  <div className="fl">
                    {e.friends ? <><Faces n={e.friends} big /><span><b>{names(e.friends)}</b> {e.friends > 1 ? 'are' : 'is'} going</span></>
                      : <span>No friends going yet. <b>Be the first.</b></span>}
                  </div>
                  <p className="cnt">+{e.taken - e.friends} others · {groupSize(e)} · {l} spots left</p>
                  <div className="rtags">
                    {e.solo && <span className="tag t-teal"><Icon n="user" />Come solo · most people do</span>}
                    {e.level && <span className="tag t-amber">{e.level}</span>}
                    <span className="tag t-lilac">{e.vibe}</span>
                    {isReq && <span className="tag"><Icon n="lock" />Host approves each guest</span>}
                  </div>
                  <p className="room-note"><Icon n="eye" /><span>The guest list stays private. You only see friends and a count.</span></p>
                </div>
              </div>
            </section>

            <section className="ds" id="locSec">
              <h2>Location</h2>
              <div className="lmap" dangerouslySetInnerHTML={map} />
              {isReq
                ? <p className="lnote lock"><Icon n="lock" /><span>This is a private home in {e.area}. The host shares the exact address once your request is approved.</span></p>
                : <p className="lnote"><Icon n="pin" /><span><b>{e.place}</b> · {walk(e.d)} from you</span></p>}
            </section>

            <section className="ds" id="hostSec">
              <h2>Your host</h2>
              <div className="hostc">
                <span className="avatar" style={{ background: e.hostC }}>{e.hostI}</span>
                <div className="g"><b>{e.host}</b><div className="s"><span className="st">★ {e.rating.toFixed(1)}</span> · {e.reviews} reviews · Hosting since 2023</div></div>
                <div className="bt">
                  <button className="btn btn-s btn-sm" type="button" onClick={() => toast('Chat with ' + e.host + ' opens here')}><Icon n="mail" />Message</button>
                  <button className="btn btn-s btn-sm" type="button" aria-pressed={follow} onClick={() => { const on = !follow; setFollow(on); if (on) toast(`You'll hear when ${e.host} posts a new event`); }}>{follow ? 'Following' : 'Follow'}</button>
                </div>
              </div>
            </section>

            <section className="ds bare">
              <h2>More nearby</h2>
              <div className="similar">{similar.map((x, i) => <EventCard key={x.id} e={x} i={i} />)}</div>
            </section>
          </div>
          <BookCard e={e} tierIdx={tierIdx} setTier={setTier} qty={qty} setQty={setQty} onBook={() => setCheckout(true)} />
        </div>
      </div>

      <div className="bbar">
        <div className="g">
          <b>{tot ? rupee(tot) : rupee(t.p)}{tot && qty > 1 ? <> <small>for {qty}</small></> : tot ? <> <small>all-in</small></> : null}</b>
          <span className="mono">{l} spots left{live ? ' · live now' : ''}</span>
        </div>
        <button className="btn btn-p" type="button" onClick={() => setCheckout(true)}>{isReq ? 'Request to join' : 'Book now'}</button>
      </div>
      {checkout && <Checkout e={e} tier={t} qty={qty} onClosed={() => setCheckout(false)} />}
    </div>
  );
}

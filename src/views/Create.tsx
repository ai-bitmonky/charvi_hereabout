'use client';

import { useRef, useState, type FormEvent } from 'react';
import { byId, CATS, type Cat, type Draft, type EventItem, type PhotoKey } from '@/data/events';
import { confetti, reducedMotion } from '@/lib/fx';
import { Icon, type IconName } from '@/components/Icon';
import { EventCard, NavLink } from '@/components/Bits';
import { AppBar, LargeTitle } from '@/components/Chrome';
import { useApp, useNav, useToast } from '@/components/Providers';

const CAT_IMG: Record<Cat, PhotoKey> = { music: 'mic', food: 'street', workshop: 'pottery', social: 'games', fitness: 'yoga' };
const ACCESS: [Draft['access'], string, string, IconName][] = [
  ['open', 'Open booking', 'Anyone can book at once', 'bolt'],
  ['request', 'Request to join', 'You approve each guest', 'user'],
  ['invite', 'Invite only', 'Hidden from search', 'mail'],
];
const TOGGLES: [keyof Pick<Draft, 'hide' | 'upfront' | 'showCount'>, string, string][] = [
  ['hide', 'Hide exact address', 'Guests see only the area until you approve'],
  ['upfront', 'Collect payment upfront', 'Fewer no-shows. Paid out next Monday.'],
  ['showCount', 'Show guest count', 'Shows "8 of 12 going" on your listing'],
];

function Preview({ d }: { d: Draft }) {
  let when = 'Upcoming';
  if (d.date) {
    const dt = new Date(d.date + 'T' + (d.time || '20:00'));
    if (!isNaN(dt.getTime())) when = dt.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }) + ' · ' + dt.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });
  }
  const img = CAT_IMG[d.cat];
  const e: EventItem = {
    ...byId[img], id: 'preview', t: d.title || 'Your event name', cat: d.cat, time: 'weekend', mins: 9999, date: 'Saturday', start: '',
    price: +d.price || 0, d: 0, area: d.area || 'Your area', access: d.access === 'request' ? 'request' : 'open',
    cap: +d.seats || 1, taken: 0, friends: 0, solo: true, level: null, vibe: '', photo: img,
  };
  return <EventCard e={e} isStatic whenOverride={when} socialOverride={d.showCount ? <span className="gc">0 of {+d.seats || 1} going</span> : null} />;
}

export default function Create() {
  const { draft: d, setDraft, resetDraft } = useApp();
  const toast = useToast();
  const nav = useNav();
  const [err, setErr] = useState('');
  const titleRef = useRef<HTMLInputElement>(null);
  const pubRef = useRef<HTMLButtonElement>(null);
  const price = +d.price || 0;

  const submit = (ev: FormEvent) => {
    ev.preventDefault();
    if (!d.title.trim()) {
      setErr('Add a name so guests know what this is.');
      titleRef.current?.focus();
      titleRef.current?.scrollIntoView({ block: 'center', behavior: reducedMotion() ? 'auto' : 'smooth' });
      toast('Add an event name to publish');
      return;
    }
    const r = pubRef.current!.getBoundingClientRect();
    confetti(r.left + r.width / 2, r.top);
    toast('Published. People nearby can see it now.');
    setTimeout(() => { resetDraft(); nav.go('/host'); }, 1300);
  };

  return (
    <div className="view">
      <AppBar title="New event" back large right={<button className="cbtn" type="button" aria-label="Save draft" onClick={() => toast('Draft saved')}><Icon n="bookmark" /></button>} />
      <div className="wrap">
        <LargeTitle title="New event" sub="Takes about 3 minutes" />
        <nav className="crumbs mono" aria-label="Breadcrumb"><NavLink href="/host">Host</NavLink><span>/</span><span style={{ color: 'var(--ink)' }}>New event</span></nav>
        <div className="ph-h ttl" style={{ paddingTop: 0 }}>
          <div><span className="mono"><i className="dot teal" />About 3 minutes</span><h1>Create an <em>evening</em></h1><p>Fill in the basics. You can save a draft any time.</p></div>
        </div>
        <details className="pvm"><summary>See how guests will see it<Icon n="chev" /></summary><div className="in"><Preview d={d} /></div></details>

        <div className="cgrid">
          <form className="cform" noValidate onSubmit={submit}>
            <div className="fsec">
              <h2><span className="mono">01</span>The basics</h2><p>What guests see first.</p>
              <div className={'field' + (err ? ' bad' : '')}>
                <label htmlFor="f-title">Event name</label>
                <input
                  id="f-title" ref={titleRef} placeholder="For example, Game night at my place" value={d.title} maxLength={60} aria-describedby="f-title-e"
                  onChange={(ev) => { setDraft({ title: ev.target.value }); if (ev.target.value.trim()) setErr(''); }}
                />
                <span className="err" id="f-title-e" role="alert">{err}</span>
              </div>
              <label className="lbl" style={{ fontSize: 13.5 }}>Category</label>
              <div className="catpick" role="group" aria-label="Category">
                {CATS.slice(1).map(([k, l]) => <button key={k} className="chip" type="button" aria-pressed={d.cat === k} onClick={() => setDraft({ cat: k as Cat })}>{l}</button>)}
              </div>
              <div className="field">
                <label htmlFor="f-about">Description</label>
                <textarea id="f-about" placeholder="What will happen, who it's for, what to bring" value={d.about} onChange={(ev) => setDraft({ about: ev.target.value })} />
              </div>
            </div>

            <div className="fsec">
              <h2><span className="mono">02</span>When and where</h2><p>We show your event to people nearby at the right moment.</p>
              <div className="row2">
                <div className="field"><label htmlFor="f-date">Date</label><input id="f-date" type="date" value={d.date} onChange={(ev) => setDraft({ date: ev.target.value })} /></div>
                <div className="field"><label htmlFor="f-time">Start time</label><input id="f-time" type="time" value={d.time} onChange={(ev) => setDraft({ time: ev.target.value })} /></div>
              </div>
              <div className="field">
                <label htmlFor="f-addr">Address</label>
                <input id="f-addr" placeholder="Flat, building, street" autoComplete="street-address" value={d.addr} onChange={(ev) => setDraft({ addr: ev.target.value })} />
                <span className="hint">Shown only as your privacy settings allow.</span>
              </div>
              <div className="field"><label htmlFor="f-area">Area shown to everyone</label><input id="f-area" value={d.area} onChange={(ev) => setDraft({ area: ev.target.value })} /></div>
            </div>

            <div className="fsec">
              <h2><span className="mono">03</span>Tickets</h2><p>Guests see the full price, fee included.</p>
              <div className="row2">
                <div className="field"><label htmlFor="f-seats">Seats</label><input id="f-seats" type="number" min={1} max={200} inputMode="numeric" value={d.seats} onChange={(ev) => setDraft({ seats: ev.target.value })} /></div>
                <div className="field"><label htmlFor="f-price">Price per guest (₹)</label><input id="f-price" type="number" min={0} step={50} inputMode="numeric" value={d.price} onChange={(ev) => setDraft({ price: ev.target.value })} /></div>
              </div>
              <div className="earn"><span>You receive</span>{price ? '₹' + Math.round(price * 0.95).toLocaleString('en-IN') + ' per guest' : 'Free event'}</div>
            </div>

            <div className="fsec">
              <h2><span className="mono">04</span>Who can join</h2><p>Choose how guests get in.</p>
              <div className="acc" role="radiogroup" aria-label="Who can join">
                {ACCESS.map(([k, b, s, ic]) => (
                  <button key={k} type="button" role="radio" aria-checked={d.access === k} onClick={() => setDraft({ access: k })}>
                    <Icon n={ic} /><b>{b}</b><span>{s}</span>
                  </button>
                ))}
              </div>
              {TOGGLES.map(([k, b, s]) => (
                <div key={k} className="tgl">
                  <div className="g"><b>{b}</b><span>{s}</span></div>
                  <button className="sw" type="button" role="switch" aria-checked={d[k]} aria-label={b} onClick={() => setDraft({ [k]: !d[k] })} />
                </div>
              ))}
            </div>

            <div className="ffoot">
              <button className="btn btn-s btn-lg" type="button" onClick={() => toast('Draft saved')}>Save draft</button>
              <button className="btn btn-p btn-lg" type="submit" ref={pubRef}>Publish event</button>
            </div>
          </form>

          <aside className="prev" aria-label="Preview">
            <span className="mono"><i className="dot live" style={{ background: 'var(--accent)' }} />Live preview · how guests see it</span>
            <div><Preview d={d} /></div>
            <div className="tip"><Icon n="bulb" /><span>Add a real photo of people doing the thing. Request-to-join events with a short, friendly description get more requests.</span></div>
          </aside>
        </div>
      </div>
    </div>
  );
}

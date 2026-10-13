'use client';

import { useState } from 'react';
import { byId, DAY, type Ticket } from '@/data/events';
import { qrCells, rupee, startsIn, walk } from '@/lib/format';
import { Icon } from '@/components/Icon';
import { DateTile, NavLink, Photo, QR, vars } from '@/components/Bits';
import { AppBar, LargeTitle, ThemeBtn } from '@/components/Chrome';
import { useApp, useToast } from '@/components/Providers';

function Stub({ t, i }: { t: Ticket; i: number }) {
  const toast = useToast();
  const [done, setDone] = useState<Record<string, boolean>>({});
  const e = byId[t.ev];
  if (!e) return null;
  const ps = t.status === 'past', D = DAY[e.date];
  const mark = (k: string, m: string) => { setDone((d) => ({ ...d, [k]: true })); toast(m); };
  return (
    <article className={'tk' + (ps ? ' past' : '')} style={vars({ '--tint': e.tint, '--i': i })}>
      <div className="tk-ph">
        <Photo k={e.photo} sizes="(max-width: 899px) 100vw, 260px" />
        <span className="tk-brand"><b>hereabout</b><span className="mono">Event pass</span></span>
        <DateTile e={e} />
        <span className={'pill' + (ps ? '' : ' soon')}>{ps ? 'Attended' : e.time === 'now' ? 'Live now' : e.time === 'tonight' ? startsIn(e) : D.rel}</span>
      </div>
      <div className="tk-in">
        <span className="mono">Ticket · {t.id}</span>
        <h3>{e.t}</h3>
        <dl className="tk-dl">
          <dt>Date</dt><dd>{t.date || D.full}</dd>
          <dt>Starts</dt><dd>{e.start}</dd>
          <dt>Guests</dt><dd>{t.qty} × {t.tier}</dd>
          <dt>Paid</dt><dd>{rupee(t.total)}</dd>
        </dl>
        <p className="pl"><Icon n="pin" /><span>{e.access === 'request' ? e.area : e.place} · {walk(e.d)}</span></p>
        <div className="acts">
          {ps ? (
            <>
              <button className="btn btn-s btn-sm" type="button" disabled={done.rate} onClick={() => mark('rate', 'Thanks. Your rating helps other guests.')}><Icon n="star" />{done.rate ? 'Rated' : 'Rate this event'}</button>
              <NavLink className="btn btn-g btn-sm" href={'/event/' + e.id}>Book again</NavLink>
            </>
          ) : (
            <>
              <button className="btn btn-p btn-sm" type="button" onClick={() => toast('Opening directions in Maps')}><Icon n="map" />Directions</button>
              <button className="btn btn-s btn-sm" type="button" disabled={done.cal} onClick={() => mark('cal', 'Added to your calendar')}><Icon n="calendar" />Add to calendar</button>
              <NavLink className="btn btn-g btn-sm" href={'/event/' + e.id}>Details</NavLink>
            </>
          )}
        </div>
      </div>
      <div className="tk-st">
        <QR cells={qrCells(t.id)} label={'Ticket code ' + t.id} />
        <div className="tx"><b>{t.id}</b><span>{ps ? 'Used 6 Oct, 8:58 pm' : 'Show at the door'}</span></div>
        {!ps && (
          <button className="btn wbtn" type="button" disabled={done.wallet} onClick={() => mark('wallet', 'Pass added to your phone wallet')}>
            <Icon n={done.wallet ? 'check' : 'wallet'} />{done.wallet ? 'In your wallet' : 'Add to Wallet'}
          </button>
        )}
      </div>
    </article>
  );
}

export default function Tickets() {
  const { tickets } = useApp();
  const [tab, setTab] = useState<'up' | 'past'>('up');
  const up = tickets.filter((t) => t.status === 'upcoming'), past = tickets.filter((t) => t.status === 'past');
  const list = tab === 'past' ? past : up;
  return (
    <div className="view">
      <AppBar title="Tickets" large right={<ThemeBtn />} />
      <div className="wrap">
        <LargeTitle title="Tickets" sub="Wallet · works offline" />
        <div className="ph-h">
          <div className="ttl">
            <span className="mono"><i className="dot teal" />Wallet · works offline</span>
            <h1>Your <em>tickets</em></h1>
            <p>Show the code at the door. No printing, no signal needed.</p>
          </div>
          <div className="seg" role="group" aria-label="Which tickets">
            <button type="button" aria-pressed={tab === 'up'} onClick={() => setTab('up')}>Upcoming ({up.length})</button>
            <button type="button" aria-pressed={tab === 'past'} onClick={() => setTab('past')}>Past ({past.length})</button>
          </div>
        </div>
        <div className="tks">
          {list.length ? list.map((t, i) => <Stub key={t.id} t={t} i={i} />) : (
            <div className="empty">
              <svg viewBox="0 0 96 96" aria-hidden="true"><rect x="14" y="26" width="68" height="44" rx="10" fill="none" stroke="var(--teal)" strokeDasharray="3 4" /><path d="M58 26v44" stroke="var(--teal)" strokeDasharray="2 4" /><circle cx="36" cy="48" r="6" fill="var(--accent)" /></svg>
              <h3>{tab === 'past' ? 'No past tickets yet' : 'No upcoming plans'}</h3>
              <p>{tab === 'past' ? 'Events you attend will show up here.' : 'Something good is starting near you right now.'}</p>
              <NavLink className="btn btn-p" href="/">Find something tonight</NavLink>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

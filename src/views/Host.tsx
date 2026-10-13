'use client';

import { G, HOST_EVENTS } from '@/data/events';
import { Icon } from '@/components/Icon';
import { CountUp, NavLink, vars } from '@/components/Bits';
import { AppBar, LargeTitle, ThemeBtn } from '@/components/Chrome';
import { useApp, useToast } from '@/components/Providers';
import { isMobileNow } from '@/lib/fx';

export default function Host() {
  const { requests, setRequest } = useApp();
  const toast = useToast();
  const p = requests.filter((r) => !r.st).length;
  const manage = () => toast('Guest list and check-in open here');
  return (
    <div className="view">
      <AppBar title="Host" large right={<><NavLink className="cbtn" href="/host/new" aria-label="Create an event"><Icon n="plus" /></NavLink><ThemeBtn /></>} />
      <div className="wrap">
        <LargeTitle title="Host" sub="Meera K. · Koramangala" />
        <div className="ph-h">
          <div>
            <div className="ttl"><span className="mono"><i className="dot teal" />Host · Meera K. · Koramangala</span><h1>Evening, <em>Meera</em>.</h1></div>
            <p className="pend">{p ? `${p}${p === 1 ? ' person wants' : ' people want'} to join Game night. Say yes or no below.` : "You're all caught up. Game night is filling nicely."}</p>
          </div>
          <NavLink className="btn btn-p btn-lg ttl" href="/host/new"><Icon n="bolt" />Create an event</NavLink>
        </div>

        <div className="stats">
          <div className="stat" style={vars({ '--i': 0 })}><span className="mono">Upcoming events</span><b><CountUp to={3} /></b><small>1 sold out</small></div>
          <div className="stat" style={vars({ '--i': 1 })}><span className="mono">Guests this month</span><b><CountUp to={46} /></b><small className="up">↑ 12 on last month</small></div>
          <div className="stat hot" style={vars({ '--i': 2 })}>
            <svg className="sp" viewBox="0 0 90 34" aria-hidden="true"><path d="M2 28 L14 24 L26 26 L38 18 L50 20 L62 12 L74 14 L88 4" fill="none" stroke="#160906" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity=".7" /></svg>
            <span className="mono">Earned this month</span><b><CountUp to={62400} fmt="inr" /></b><small>Paid out every Monday</small>
          </div>
          <div className="stat" style={vars({ '--i': 3 })}><span className="mono">Host rating</span><b><CountUp to={5} dec={1} /></b><small>From 41 reviews</small></div>
        </div>

        <div className="hgrid">
          <div className="panel">
            <div className="pnl-h"><div><h2>Your events</h2><span className="mono">3 listed · 22 of 32 seats sold</span></div><NavLink className="btn btn-s btn-sm" href="/host/new">Add event</NavLink></div>
            <table className="htable">
              <thead><tr><th>Event</th><th>Seats</th><th>Status</th><th><span className="sr">Actions</span></th></tr></thead>
              <tbody>
                {HOST_EVENTS.map((m) => {
                  const full = m.sold >= m.cap;
                  return (
                    <tr key={m.t} onClick={() => { if (isMobileNow()) manage(); }}>
                      <td><div className="evc"><i style={vars({ '--g': G(m.photo) })} /><div><b>{m.t}</b><span>{m.d}</span></div></div></td>
                      <td><span className={'mbar' + (full ? ' full' : '')}><span><i style={{ width: Math.round((m.sold / m.cap) * 100) + '%' }} /></span>{m.sold}/{m.cap}</span></td>
                      <td>{full ? <span className="tag sm t-teal">Sold out</span> : <span className="tag sm t-amber">On sale</span>}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button className="btn btn-g btn-sm" type="button" data-manage onClick={(ev) => { ev.stopPropagation(); manage(); }}>Manage</button>
                        <i className="chv"><Icon n="right" /></i>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="panel">
            <div className="pnl-h"><div><h2>Requests</h2><span className="mono">Game night at Meera&apos;s · Sat 8 pm</span></div></div>
            <div>
              {requests.map((r, i) => (
                <div key={r.n} className={'req' + (r.st ? ' done' : '')}>
                  <span className="avatar" style={{ background: r.c }}>{r.i}</span>
                  <div className="g"><b>{r.n}</b><span>{r.meta}</span></div>
                  {r.st && <span className={'res ' + (r.st === 'Approved' ? 'ok' : 'no')}>{r.st}</span>}
                  <div className="acts">
                    <button className="btn btn-s btn-sm" type="button" onClick={() => { setRequest(i, 'Declined'); toast('Declined. Their payment hold is released.'); }}>Decline</button>
                    <button className="btn btn-p btn-sm" type="button" onClick={() => { setRequest(i, 'Approved'); toast('Approved. Address sent to guest'); }}>Approve</button>
                  </div>
                </div>
              ))}
            </div>
            <p className="req-note"><Icon n="lock" /><span>Your address goes only to guests you approve.</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}
